import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, ArrowRight, Save, CheckCircle2, Info, X } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';
import { productApi } from '../../utils/api';
import api from '../../utils/api';
import {
  SUBCATEGORY_ENDPOINTS,
  PRODUCT_TYPE_BY_CATEGORY,
  getGeneralInfoConfig,
  getProductInfoConfig,
  getTechInfoConfig,
  getSubcategoryEndpoint,
  getFeatureEndpoint,
  getPrevNextStepPaths,
} from '../../config/categoryFormConfig';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../components/ui/tooltip';

const getSubcategoryOptions = (responseData) => {
  // Most BXI endpoints return data[0].SubcategoryValue
  const root = responseData?.data ?? responseData;
  const nestedList =
    root?.[0]?.SubcategoryValue ??
    root?.SubcategoryValue ??
    root?.subcategories;

  // FMCG / Mobility return flat rows, not nested SubcategoryValue arrays.
  const list = Array.isArray(nestedList)
    ? nestedList
    : Array.isArray(root)
      ? root
      : [];

  if (!Array.isArray(list)) {
    return [];
  }

  return list
    .map((item) => {
      if (typeof item === 'string') {
        return { label: item, value: item };
      }
      if (item?.SubcategoryType) {
        return { label: item.SubcategoryType, value: item.SubcategoryType };
      }
      if (item?.name) {
        return { label: item.name, value: item.name };
      }
      if (item?.value) {
        return { label: item.value, value: item.value };
      }
      if (item?.SampleFmcgCategoryType) {
        return {
          label: item.SampleFmcgCategoryType,
          value: item.SampleFmcgCategoryType,
        };
      }
      if (item?.SampleMobilityCategoryType) {
        return {
          label: item.SampleMobilityCategoryType,
          value: item.SampleMobilityCategoryType,
        };
      }
      if (item?.RestuarantQsrCategoryType) {
        return { label: item.RestuarantQsrCategoryType, value: item.RestuarantQsrCategoryType };
      }
      if (item?.EntertainmentFeature || item?.entertainmentSubcategory) {
        const v = item.EntertainmentFeature || item.entertainmentSubcategory;
        return { label: v, value: v };
      }
      if (item?.OtherSub) {
        return { label: item.OtherSub, value: item.OtherSub };
      }
      if (item?.SampleAirlineFeature) {
        return { label: item.SampleAirlineFeature, value: item.SampleAirlineFeature };
      }
      if (item?.Mediaonlinecategorysingle) {
        return { label: item.Mediaonlinecategorysingle, value: item._id };
      }
      if (item?.Mediaofflinecategory) {
        return { label: item.Mediaofflinecategory, value: item._id };
      }
      if (item?.SubcategoryName) {
        return { label: item.SubcategoryName, value: item.SubcategoryName };
      }
      // Final fallback: first non-id string field in object
      if (item && typeof item === 'object') {
        const candidate = Object.entries(item).find(
          ([key, val]) =>
            typeof val === 'string' &&
            val.trim() &&
            key !== '_id' &&
            key !== 'id'
        );
        if (candidate) {
          return { label: candidate[1], value: candidate[1] };
        }
      }
      return null;
    })
    .filter(Boolean);
};

const STEPS = [
  { id: 1, name: 'General Information', path: 'general-info' },
  { id: 2, name: 'Product Information', path: 'product-info' },
  { id: 3, name: 'Technical Information', path: 'tech-info' },
  { id: 4, name: 'Go Live', path: 'go-live' },
];

// Stepper Component
const Stepper = ({ currentStep, completedSteps = [] }) => {
  return (
    <div className="stepper" data-testid="add-product-stepper">
      {STEPS.map((step, index) => {
        const isActive = currentStep === step.id;
        const isCompleted = completedSteps.includes(step.id) || currentStep > step.id;
        
        return (
          <div key={step.id} className="stepper-step">
            <div className={cn(
              'stepper-circle',
              isActive && 'active',
              isCompleted && 'completed'
            )}>
              {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : step.id}
            </div>
            <span className={cn('stepper-label', isActive && 'active')}>
              {step.name}
            </span>
            {index < STEPS.length - 1 && (
              <div className={cn('stepper-line', isCompleted && 'completed')} />
            )}
          </div>
        );
      })}
    </div>
  );
};

// General Information Step
export const GeneralInformation = ({ category }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subcategoryOptions, setSubcategoryOptions] = useState([]);
  const [subcategoriesLoading, setSubcategoriesLoading] = useState(false);
  const [genderCategoryData, setGenderCategoryData] = useState([]);
  const [selectedGenderId, setSelectedGenderId] = useState(null);
  const [selectedGender, setSelectedGender] = useState('Unisex');

  const giConfig = getGeneralInfoConfig(category);
  const isVoucherCategory = category?.endsWith?.('Voucher');
  const nextStepPath = isVoucherCategory
    ? (category === 'hotelsVoucher' ? 'hotelsproductinfo' : 'techinfo')
    : 'product-info';

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    defaultValues: {
      productName: '',
      productSubtitle: '',
      subcategory: '',
      description: '',
      listingType: 'Product',
      hasRegistrationProcess: 'Yes',
      HotelStars: '5',
    }
  });

  const categoryLabel = category?.charAt(0).toUpperCase() + category?.slice(1).replace('voucher', '') || 'Product';
  const selectedSubcategory = watch('subcategory');

  useEffect(() => {
    const endpoint = getSubcategoryEndpoint(category);
    if (!endpoint) {
      setSubcategoryOptions([]);
      setGenderCategoryData([]);
      setSelectedGenderId(null);
      setSelectedGender('Unisex');
      setValue('subcategory', '');
      return;
    }

    const fetchSubcategories = async () => {
      setSubcategoriesLoading(true);
      try {
        const res = await api.get(endpoint);
        const root = res?.data?.data ?? res?.data;

        // Textile-specific shape: [{ SubcategoryName, SubcategoryValue: [...] }, ...]
        if (
          category === 'textile' &&
          Array.isArray(root) &&
          root.length > 0 &&
          Array.isArray(root[0]?.SubcategoryValue)
        ) {
          setGenderCategoryData(root);
          const defaultGenderGroup =
            root.find(
              (item) =>
                String(item?.SubcategoryName || '').toLowerCase() === 'unisex'
            ) || root[0];
          setSelectedGenderId(defaultGenderGroup?._id || null);
          setSelectedGender(defaultGenderGroup?.SubcategoryName || 'Unisex');
          const options = getSubcategoryOptions({
            data: [{ SubcategoryValue: defaultGenderGroup?.SubcategoryValue || [] }],
          });
          setSubcategoryOptions(options);
          setValue('subcategory', '');
        } else {
          setGenderCategoryData([]);
          setSelectedGenderId(null);
          setSelectedGender('Unisex');
          const root = res?.data?.body ?? res?.data?.data ?? res?.data;
          const options = getSubcategoryOptions({ data: root });
          setSubcategoryOptions(options);
        }
      } catch (error) {
        setSubcategoryOptions([]);
        toast.error('Unable to load subcategories for this category.');
      } finally {
        setSubcategoriesLoading(false);
      }
    };

    fetchSubcategories();
  }, [category, setValue]);

  const handleTextileGenderSelect = (genderGroup) => {
    setSelectedGenderId(genderGroup?._id || null);
    setSelectedGender(genderGroup?.SubcategoryName || 'Unisex');
    const options = getSubcategoryOptions({
      data: [{ SubcategoryValue: genderGroup?.SubcategoryValue || [] }],
    });
    setSubcategoryOptions(options);
    setValue('subcategory', '', { shouldValidate: true });
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      let productId = id;
      const normalizedSubcategory = data.subcategory || '';
      const subcategoryName = subcategoryOptions.find((o) => o.value === normalizedSubcategory)?.label || normalizedSubcategory;

      const isMediaOnline = category === 'mediaonline';
      const isMediaOffline = category === 'mediaoffline';
      const isMedia = isMediaOnline || isMediaOffline;

      let payload;
      if (isMedia) {
        payload = {
          ProductName: data.productName,
          ProductDescription: data.description,
          ProductSubtitle: data.productSubtitle,
          ProductSubCategory: normalizedSubcategory,
          ProductSubCategoryName: subcategoryName,
          ProductUploadStatus: 'productinformation',
          ListingType: 'Media',
          ProductType: isMediaOnline ? 'MediaOnline' : 'MediaOffline',
          ProductCategoryName:
            isMediaOnline
              ? subcategoryName === 'Multiplex ADs' ? 'Multiplex ADs' : 'MediaOnline'
              : subcategoryName === 'Hoardings' ? 'MediaOffline' : subcategoryName,
          ...(id && { id }),
        };
      } else {
        payload = {
          ProductName: data.productName,
          ProductDescription: data.description,
          ProductUploadStatus: 'productinformation',
          ListingType: isVoucherCategory ? 'Voucher' : (data.listingType || 'Product'),
          ProductType:
            PRODUCT_TYPE_BY_CATEGORY[category] || categoryLabel || 'Others',
          ProductSubCategory: normalizedSubcategory,
          ProductSubCategoryName: normalizedSubcategory,
          Gender: giConfig.hasGenderSelection ? selectedGender : undefined,
          gender: giConfig.hasGenderSelection ? selectedGender : undefined,
          ProductSubtitle: giConfig.hasSubtitle ? data.productSubtitle : undefined,
          HasRegistrationProcess: giConfig.hasRadioButtons ? data.hasRegistrationProcess : undefined,
          HotelStars: giConfig.hasStarRating ? data.HotelStars : undefined,
        };
      }

      if (id && !isMedia) {
        await productApi.updateProduct({ _id: id, ...payload });
        toast.success('General information updated!');
      } else if (isMedia) {
        const res = await productApi.productMutation(payload);
        const created = res?.data?.body ?? res?.data?.data ?? res?.data?.product ?? res?.data;
        if (created?.name === 'ValidationError' || created?.errors) {
          const firstError = created?.errors ? Object.values(created.errors)?.[0]?.message : null;
          throw new Error(firstError || created?.message || 'Validation failed');
        }
        productId = created?._id ?? created?.id ?? created?.product?._id ?? created?.ProductData?._id;
        if (id) {
          toast.success('General information updated!');
        } else {
          if (!productId) {
            const draftRes = await productApi.getDraftProducts(1);
            const draftData = draftRes?.data?.products ?? draftRes?.data?.body?.products ?? draftRes?.data?.data?.products ?? [];
            if (Array.isArray(draftData) && draftData.length > 0) {
              productId = draftData[0]?._id;
            }
          }
          if (!productId) {
            throw new Error('Product was not created. Please check required fields and try again.');
          }
          toast.success('General information saved!');
        }
      } else {
        const res = await productApi.createProduct(payload);
        const created =
          res?.data?.body ||
          res?.data?.data ||
          res?.data?.product ||
          res?.data;
        if (created?.name === 'ValidationError' || created?.errors) {
          const firstError = created?.errors ? Object.values(created.errors)?.[0]?.message : null;
          throw new Error(firstError || created?.message || 'Validation failed');
        }
        productId =
          created?._id ||
          created?.id ||
          created?.product?._id ||
          created?.ProductData?._id;
        if (!productId) {
          const draftRes = await productApi.getDraftProducts(1);
          const draftData =
            draftRes?.data?.products ||
            draftRes?.data?.body?.products ||
            draftRes?.data?.data?.products ||
            [];
          if (Array.isArray(draftData) && draftData.length > 0) {
            productId = draftData[0]?._id;
          }
        }
        if (!productId) {
          throw new Error('Product was not created. Please check required fields and try again.');
        }
        toast.success('General information saved!');
      }

      let targetPath;
      if (isMediaOnline) {
        if (subcategoryName === 'Digital ADs') {
          targetPath = `/mediaonline/mediaonlinedigitalscreensinfo/${productId}`;
        } else if (subcategoryName === 'Multiplex ADs') {
          targetPath = `/mediaonline/mediaonlinemultiplexproductinfo/${productId}`;
        } else {
          targetPath = `/mediaonline/product-info/${productId}`;
        }
      } else if (isMediaOffline) {
        if (subcategoryName === 'Hoardings') {
          targetPath = `/mediaoffline/mediaofflinehoardinginfo/${productId}`;
        } else {
          targetPath = `/mediaoffline/mediaofflineproductinfo/${productId}`;
        }
      } else {
        targetPath = `/${category}/${nextStepPath}/${productId}`;
      }
      navigate(targetPath);
    } catch (error) {
      const errorText =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to save. Please try again.';
      if (String(errorText).includes('SellerCompanyId') || String(errorText).includes('PostedBy')) {
        toast.error('Your session is missing. Please login from dashboard again and retry.');
      } else {
        toast.error(errorText);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] py-8" data-testid="general-info-page">
      <div className="form-container">
        <Stepper currentStep={1} />

        <div className="form-section">
          <h2 className="form-section-title">General Information - {categoryLabel}</h2>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Product Name */}
            <div className="space-y-2">
              <Label htmlFor="productName">
                Product Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="productName"
                placeholder="Enter product name"
                {...register('productName', { required: 'Product name is required' })}
                className={errors.productName ? 'border-red-500' : ''}
                data-testid="input-product-name"
              />
              {errors.productName && (
                <p className="text-sm text-red-500">{errors.productName.message}</p>
              )}
            </div>

            {/* Subtitle – shown when config.hasSubtitle */}
            {giConfig.hasSubtitle && (
              <div className="space-y-2">
                <Label htmlFor="productSubtitle">Product Subtitle</Label>
                <Input
                  id="productSubtitle"
                  placeholder="Short tagline (10–75 chars)"
                  {...register('productSubtitle', { required: giConfig.hasSubtitle, minLength: 10, maxLength: 75 })}
                  className={errors.productSubtitle ? 'border-red-500' : ''}
                />
                {errors.productSubtitle && (
                  <p className="text-sm text-red-500">{errors.productSubtitle.message}</p>
                )}
              </div>
            )}

            {/* Listing Type – only for product categories */}
            {!isVoucherCategory && (
              <div className="space-y-2">
                <Label>Listing Type</Label>
                <Select
                  defaultValue="Product"
                  onValueChange={(value) => setValue('listingType', value)}
                >
                  <SelectTrigger data-testid="select-listing-type">
                    <SelectValue placeholder="Select listing type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Product">Product</SelectItem>
                    <SelectItem value="Voucher">Voucher</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Subcategory */}
            <div className="space-y-2">
              {giConfig.hasGenderSelection && genderCategoryData.length > 0 && (
                <div className="space-y-3">
                  <Label>Gender (Textile)</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {genderCategoryData.map((item) => {
                      const label = item?.SubcategoryName || 'Unisex';
                      const isActive = selectedGenderId === item?._id;
                      return (
                        <Button
                          key={item?._id || label}
                          type="button"
                          variant="outline"
                          className={cn(
                            'justify-center',
                            isActive
                              ? 'border-[#C64091] bg-[#FCE7F3] text-[#C64091]'
                              : ''
                          )}
                          onClick={() => handleTextileGenderSelect(item)}
                          data-testid={`textile-gender-${String(label).toLowerCase()}`}
                        >
                          {label}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              )}

              <Label htmlFor="subcategory">Subcategory</Label>
              <input
                type="hidden"
                {...register('subcategory', { required: 'Subcategory is required' })}
              />
              <Select
                value={selectedSubcategory || ''}
                onValueChange={(value) => setValue('subcategory', value, { shouldValidate: true })}
              >
                <SelectTrigger id="subcategory" data-testid="select-subcategory">
                  <SelectValue
                    placeholder={
                      subcategoriesLoading
                        ? 'Loading subcategories...'
                        : 'Select subcategory'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {subcategoryOptions.length > 0 ? (
                    subcategoryOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="__no_subcategory__" disabled>
                      No subcategories found
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {errors.subcategory && (
                <p className="text-sm text-red-500">{errors.subcategory.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">
                Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Describe your product..."
                rows={5}
                {...register('description', { required: 'Description is required' })}
                className={errors.description ? 'border-red-500' : ''}
                data-testid="input-description"
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description.message}</p>
              )}
            </div>

            {/* Mobility: Registration process radio */}
            {giConfig.hasRadioButtons && (
              <div className="space-y-2">
                <Label>{giConfig.radioButtonLabel}</Label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" value="Yes" {...register(giConfig.radioButtonField)} className="text-[#C64091]" />
                    <span>Yes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" value="No" {...register(giConfig.radioButtonField)} className="text-[#C64091]" />
                    <span>No</span>
                  </label>
                </div>
              </div>
            )}

            {/* Hotels: Star rating */}
            {giConfig.hasStarRating && (
              <div className="space-y-2">
                <Label>{giConfig.starRatingLabel}</Label>
                <Select
                  defaultValue="5"
                  onValueChange={(value) => setValue(giConfig.starRatingField, value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select rating" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <SelectItem key={n} value={String(n)}>{n} Star{n > 1 ? 's' : ''}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-between pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/sellerhub')}
                data-testid="btn-back"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Seller Hub
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#C64091] hover:bg-[#A03375]"
                data-testid="btn-save-next"
              >
                {isSubmitting ? 'Saving...' : 'Save & Next'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Product Information Step – category-specific fields via config
export const ProductInfo = ({ category }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const piConfig = getProductInfoConfig(category);
  const { prev: prevStepPath, next: nextStepPath } = getPrevNextStepPaths(category, 'productInfo', location?.pathname);
  const prevPath = prevStepPath || 'general-info';
  const nextPath = nextStepPath || 'tech-info';
  const hasSizeOptions = piConfig.sizeOptions && piConfig.sizeOptions.length > 0;

  const hasHsn = piConfig.commonFields?.includes?.('hsn') ?? true;
  const hasSampleCheckbox = !category?.endsWith?.('Voucher');
  const hasGenderInProductInfo = category === 'textile';

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    defaultValues: {
      price: '',
      discountedPrice: '',
      minOrderQty: '1',
      maxOrderQty: '100',
      gst: '18',
      hsn: '',
      selectedSize: piConfig.defaultSize || '',
      sizeValue: '',
      sizeUnit: 'cm',
      productForm: 'Dry',
      productColor: '#ffffff',
      productIdType: '',
      length: '',
      width: '',
      height: '',
      weight: '',
      isSample: false,
      gender: 'Unisex',
    }
  });

  const selectedSize = watch('selectedSize');

  const onSubmit = async (data) => {
    if (!id) {
      toast.error('Product ID missing. Please start from General Information.');
      return;
    }
    setIsSubmitting(true);
    try {
      const price = parseFloat(String(data.price || 0).replace(/,/g, '')) || 0;
      const discountedPrice = parseFloat(String(data.discountedPrice || 0).replace(/,/g, '')) || price;
      const payload = {
        _id: id,
        ProductUploadStatus: 'technicalinformation',
        ProductsVariantions: [{
          PricePerUnit: price,
          DiscountedPrice: discountedPrice,
          MinOrderQuantity: parseInt(data.minOrderQty, 10) || 1,
          MaxOrderQuantity: parseInt(data.maxOrderQty, 10) || 100,
          GST: String(data.gst || '18'),
          HSN: data.hsn || '',
          ProductSize: data.selectedSize || '',
          ProductColor: data.productColor || '#ffffff',
          ProductIdType: data.productIdType || `SKU-${Date.now()}`,
          Length: data.length || '',
          Width: data.width || '',
          Height: data.height || '',
          Weight: data.weight || '',
        }],
        IsSample: !!data.isSample,
        ...(hasGenderInProductInfo && { Gender: data.gender, gender: data.gender }),
      };
      await productApi.updateProduct(payload);
      toast.success('Product information saved!');
      navigate(`/${category}/${nextPath}/${id}`);
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to save. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] py-8" data-testid="product-info-page">
      <div className="form-container">
        <Stepper currentStep={2} completedSteps={[1]} />

        <div className="form-section">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="form-section-title">Product Information</h2>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button type="button" className="text-[#6B7A99] hover:text-[#C64091]">
                    <Info className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Complete your product details to make it discoverable</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <p className="text-sm text-[#6B7A99] mb-6">Complete your product details to make it discoverable</p>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Gender selection – for textile */}
            {hasGenderInProductInfo && (
              <div className="space-y-2">
                <Label>Gender (Which gender is your product designed for?)</Label>
                <div className="flex flex-wrap gap-2">
                  {['Male', 'Female', 'Kids', 'Unisex', 'Other'].map((g) => (
                    <Button
                      key={g}
                      type="button"
                      variant="outline"
                      className={cn(
                        watch('gender') === g && 'border-[#C64091] bg-[#FCE7F3] text-[#C64091]'
                      )}
                      onClick={() => setValue('gender', g)}
                    >
                      {g}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Dimensions/Description – as clickable cards */}
            {hasSizeOptions && (
              <div className="space-y-2">
                <Label>Select what best suits your product Dimensions/Description?</Label>
                <div className="flex flex-wrap gap-2">
                  {piConfig.sizeOptions.map((opt) => (
                    <Button
                      key={opt}
                      type="button"
                      variant="outline"
                      className={cn(
                        selectedSize === opt && 'border-[#C64091] bg-[#FCE7F3] text-[#C64091]'
                      )}
                      onClick={() => setValue('selectedSize', opt)}
                    >
                      {opt === 'Length x Height' ? 'L x H' : opt === 'Length x Height x Width' ? 'L x H x W' : opt}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Size value + unit – when dimension type selected */}
            {hasSizeOptions && selectedSize && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Size <span className="text-red-500">*</span></Label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="e.g. 10"
                      {...register('sizeValue')}
                      className="flex-1"
                    />
                    <Select
                      value={watch('sizeUnit')}
                      onValueChange={(v) => setValue('sizeUnit', v)}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cm">cm</SelectItem>
                        <SelectItem value="in">in</SelectItem>
                        <SelectItem value="m">m</SelectItem>
                        <SelectItem value="kg">kg</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Product ID / SKU – when config hasProductId */}
            {piConfig.hasProductId && (
              <div className="space-y-2">
                <Label htmlFor="productIdType">Product Id Type <span className="text-red-500">*</span></Label>
                <Input
                  id="productIdType"
                  placeholder="e.g. 1910WH23"
                  {...register('productIdType')}
                />
              </div>
            )}

            {/* Color picker – when config hasColorPicker */}
            {piConfig.hasColorPicker && (
              <div className="space-y-2">
                <Label>Color <span className="text-red-500">*</span></Label>
                <div className="flex gap-3 items-center">
                  <input
                    type="color"
                    {...register('productColor')}
                    className="w-12 h-12 rounded cursor-pointer border border-gray-300"
                  />
                  <span className="text-sm text-gray-600 font-mono">{watch('productColor') || '#ffffff'}</span>
                </div>
              </div>
            )}

            {/* HSN – when config has HSN */}
            {hasHsn && (
              <div className="space-y-2">
                <Label htmlFor="hsn">HSN <span className="text-red-500">*</span></Label>
                <Input
                  id="hsn"
                  placeholder="e.g. 998346"
                  {...register('hsn')}
                />
              </div>
            )}

            {/* FMCG: Dry/Wet form selection */}
            {piConfig.hasFormSelection && (
              <div className="space-y-2">
                <Label>Product Form</Label>
                <Select
                  defaultValue="Dry"
                  onValueChange={(value) => setValue('productForm', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dry">Dry</SelectItem>
                    <SelectItem value="Wet">Wet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Dimension fields – shown for Length-based sizes */}
            {hasSizeOptions && selectedSize && ['Length', 'Length x Height', 'Length x Height x Width', 'Weight', 'Custom Size'].includes(selectedSize) && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(selectedSize === 'Length' || selectedSize === 'Length x Height' || selectedSize === 'Length x Height x Width' || selectedSize === 'Custom Size') && (
                  <div className="space-y-2">
                    <Label>Length (cm)</Label>
                    <Input type="number" step="0.01" placeholder="0" {...register('length')} />
                  </div>
                )}
                {(selectedSize === 'Length x Height x Width' || selectedSize === 'Custom Size') && (
                  <>
                    <div className="space-y-2">
                      <Label>Width (cm)</Label>
                      <Input type="number" step="0.01" placeholder="0" {...register('width')} />
                    </div>
                    <div className="space-y-2">
                      <Label>Height (cm)</Label>
                      <Input type="number" step="0.01" placeholder="0" {...register('height')} />
                    </div>
                  </>
                )}
                {selectedSize === 'Weight' && (
                  <div className="space-y-2">
                    <Label>Weight (kg)</Label>
                    <Input type="number" step="0.01" placeholder="0" {...register('weight')} />
                  </div>
                )}
              </div>
            )}

            {/* GST */}
            <div className="space-y-2">
              <Label>GST <span className="text-red-500">*</span></Label>
              <Select
                defaultValue="18"
                onValueChange={(value) => setValue('gst', value)}
              >
                <SelectTrigger data-testid="select-gst">
                  <SelectValue placeholder="Select GST rate" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0%</SelectItem>
                  <SelectItem value="5">5%</SelectItem>
                  <SelectItem value="12">12%</SelectItem>
                  <SelectItem value="18">18%</SelectItem>
                  <SelectItem value="28">28%</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* MRP & Discounted MRP */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-1">
                  <Label htmlFor="price">
                    MRP <span className="text-red-500">*</span> (Incl of GST)
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button type="button" className="text-[#6B7A99] hover:text-[#C64091]">
                          <Info className="w-3.5 h-3.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Maximum Retail Price including GST</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Input
                  id="price"
                  type="number"
                  placeholder="1000"
                  {...register('price', { required: 'MRP is required', min: 0 })}
                  className={errors.price ? 'border-red-500' : ''}
                  data-testid="input-price"
                />
                {errors.price && (
                  <p className="text-sm text-red-500">{errors.price.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-1">
                  <Label htmlFor="discountedPrice">Discounted MRP <span className="text-red-500">*</span></Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button type="button" className="text-[#6B7A99] hover:text-[#C64091]">
                          <Info className="w-3.5 h-3.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Discounted price after any offers</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Input
                  id="discountedPrice"
                  type="number"
                  placeholder="900"
                  {...register('discountedPrice', { min: 0 })}
                  data-testid="input-discounted-price"
                />
              </div>
            </div>

            {/* Quantity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="minOrderQty">Minimum Order Quantity</Label>
                <Input
                  id="minOrderQty"
                  type="number"
                  placeholder="1"
                  {...register('minOrderQty', { min: 1 })}
                  data-testid="input-min-qty"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxOrderQty">Maximum Order Quantity</Label>
                <Input
                  id="maxOrderQty"
                  type="number"
                  placeholder="100"
                  {...register('maxOrderQty', { min: 1 })}
                  data-testid="input-max-qty"
                />
              </div>
            </div>

            {/* Sample provision */}
            {hasSampleCheckbox && (
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isSample"
                  {...register('isSample')}
                  className="w-4 h-4 rounded border-gray-300 text-[#C64091] focus:ring-[#C64091]"
                />
                <Label htmlFor="isSample" className="cursor-pointer font-normal">
                  Do you wish to provide a Sample?
                </Label>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-between pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/${category}/${prevPath}${id ? `/${id}` : ''}`)}
                data-testid="btn-back"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#C64091] hover:bg-[#A03375]"
                data-testid="btn-save-next"
              >
                {isSubmitting ? 'Saving...' : 'Proceed to Add'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Technical Information Step – category-specific features via config
const FEATURE_MIN = 5;
const FEATURE_MAX = 20;

export const TechInfo = ({ category }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [featureOptions, setFeatureOptions] = useState([]);
  const [featuresLoading, setFeaturesLoading] = useState(false);
  const [featureList, setFeatureList] = useState([]);
  const [selectedFeature, setSelectedFeature] = useState('');
  const [featureDescription, setFeatureDescription] = useState('');

  const tiConfig = getTechInfoConfig(category);
  const { prev: prevPath, next: nextPath } = getPrevNextStepPaths(category, 'techInfo', location?.pathname);
  const prevStepPath = prevPath || 'product-info';
  const nextStepPath = nextPath || 'go-live';
  const hasFeatureSelection = tiConfig.hasFeatureSelection && featureOptions.length > 0;

  useEffect(() => {
    if (!tiConfig.hasFeatureSelection || !getFeatureEndpoint(category)) return;
    const fetchFeatures = async () => {
      setFeaturesLoading(true);
      try {
        const res = await api.get(getFeatureEndpoint(category));
        const root = res?.data?.data ?? res?.data?.body ?? res?.data;
        const list = Array.isArray(root) ? root : root?.data ? root.data : [];
        const fieldName = tiConfig.featureNameField || 'name';
        const opts = list
          .map((item) => {
            const label = item?.[fieldName] || item?.name || item?.value;
            return label ? { label, value: label } : null;
          })
          .filter(Boolean);
        setFeatureOptions(opts);
      } catch {
        setFeatureOptions([]);
      } finally {
        setFeaturesLoading(false);
      }
    };
    fetchFeatures();
  }, [category, tiConfig.hasFeatureSelection, tiConfig.featureNameField]);

  const handleAddFeature = () => {
    if (!selectedFeature) {
      toast.error('Please select a feature');
      return;
    }
    if (featureList.length >= FEATURE_MAX) {
      toast.error(`Maximum ${FEATURE_MAX} features allowed`);
      return;
    }
    if (featureList.some((f) => f.feature === selectedFeature)) {
      toast.error('This feature is already added');
      return;
    }
    setFeatureList((prev) => [...prev, { feature: selectedFeature, description: featureDescription || selectedFeature }]);
    setSelectedFeature('');
    setFeatureDescription('');
  };

  const removeFeature = (idx) => {
    setFeatureList((prev) => prev.filter((_, i) => i !== idx));
  };

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    defaultValues: {
      weight: '',
      dimensions: '',
      material: '',
      warranty: '',
      additionalInfo: '',
    }
  });

  const onSubmit = async (data) => {
    if (!id) {
      toast.error('Product ID missing. Please start from General Information.');
      return;
    }
    if (hasFeatureSelection && featureList.length < FEATURE_MIN) {
      toast.error(`Minimum ${FEATURE_MIN} features required. Add ${FEATURE_MIN - featureList.length} more.`);
      return;
    }
    setIsSubmitting(true);
    try {
      const tags = hasFeatureSelection ? featureList.map((f) => f.feature) : [];
      const payload = {
        _id: id,
        ProductUploadStatus: 'golive',
        ProductTechInfo: {
          Warranty: data.warranty || '',
          WeightBeforePackingPerUnit: data.weight || '',
          Length: data.length || data.dimensions?.split?.('x')?.[0]?.trim() || '',
          Width: data.width || data.dimensions?.split?.('x')?.[1]?.trim() || '',
          Height: data.height || data.dimensions?.split?.('x')?.[2]?.trim() || '',
          Tags: tags,
        },
      };
      await productApi.updateProduct(payload);
      toast.success('Technical information saved!');
      const targetPath = `/${category}/${nextStepPath}/${id}`;
      navigate(targetPath);
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to save. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] py-8" data-testid="tech-info-page">
      <div className="form-container">
        <Stepper currentStep={3} completedSteps={[1, 2]} />

        <div className="form-section">
          <h2 className="form-section-title">
            {hasFeatureSelection ? 'Product Features' : 'Technical Information'}
          </h2>
          {hasFeatureSelection && (
            <p className="text-sm text-[#6B7A99] mb-6">
              Select the best features that describe your brand/product (The more features you write the more you are discovered)
            </p>
          )}
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Weight & Dimensions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...register('weight')}
                  data-testid="input-weight"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dimensions">Dimensions (L x W x H cm)</Label>
                <Input
                  id="dimensions"
                  placeholder="10 x 10 x 10"
                  {...register('dimensions')}
                  data-testid="input-dimensions"
                />
              </div>
            </div>

            {/* Material */}
            <div className="space-y-2">
              <Label htmlFor="material">Material</Label>
              <Input
                id="material"
                placeholder="e.g., Cotton, Polyester, Metal"
                {...register('material')}
                data-testid="input-material"
              />
            </div>

            {/* Warranty */}
            <div className="space-y-2">
              <Label>Warranty Period</Label>
              <Select
                defaultValue=""
                onValueChange={(value) => setValue('warranty', value)}
              >
                <SelectTrigger data-testid="select-warranty">
                  <SelectValue placeholder="Select warranty period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Warranty</SelectItem>
                  <SelectItem value="3months">3 Months</SelectItem>
                  <SelectItem value="6months">6 Months</SelectItem>
                  <SelectItem value="1year">1 Year</SelectItem>
                  <SelectItem value="2years">2 Years</SelectItem>
                  <SelectItem value="lifetime">Lifetime</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Category-specific: Feature/Key selection (Add flow: Min 5, Max 20) */}
            {hasFeatureSelection && (
              <div className="space-y-4">
                <Label className="text-base font-medium">
                  Selected Best Features (Min {FEATURE_MIN} and Max {FEATURE_MAX})
                </Label>
                <p className="text-sm text-[#6B7A99]">
                  Key Features ({featureList.length}) (Minimum {FEATURE_MIN} required,{' '}
                  {featureList.length >= FEATURE_MIN ? '0' : String(FEATURE_MIN - featureList.length)} more needed)
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 space-y-2">
                    <Label>Select Feature</Label>
                    <Select
                      value={selectedFeature}
                      onValueChange={setSelectedFeature}
                      disabled={featuresLoading}
                    >
                      <SelectTrigger data-testid="select-feature">
                        <SelectValue placeholder={featuresLoading ? 'Loading...' : 'Select a feature'} />
                      </SelectTrigger>
                      <SelectContent>
                        {featureOptions
                          .filter((opt) => !featureList.some((f) => f.feature === opt.value))
                          .map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label>Selected Feature Description *</Label>
                    <Input
                      placeholder="Type in two - three words (e.g. Smart watch)"
                      value={featureDescription}
                      onChange={(e) => setFeatureDescription(e.target.value)}
                      data-testid="input-feature-description"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleAddFeature}
                      disabled={!selectedFeature || featureList.length >= FEATURE_MAX}
                      data-testid="btn-add-feature"
                    >
                      Proceed to Add
                    </Button>
                  </div>
                </div>

                {featureList.length > 0 && (
                  <div className="space-y-2">
                    <Label>Added Features</Label>
                    <ul className="space-y-2">
                      {featureList.map((f, idx) => (
                        <li
                          key={`${f.feature}-${idx}`}
                          className="flex items-center justify-between gap-2 rounded-md border border-[#E5E8EB] bg-white px-3 py-2"
                        >
                          <div className="flex-1 min-w-0">
                            <span className="font-medium">{f.feature}</span>
                            {f.description && f.description !== f.feature && (
                              <span className="text-sm text-[#6B7A99] ml-2">— {f.description}</span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFeature(idx)}
                            className="text-[#6B7A99] hover:text-[#C64091] p-1"
                            aria-label={`Remove ${f.feature}`}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Additional Info */}
            <div className="space-y-2">
              <Label htmlFor="additionalInfo">Additional Information</Label>
              <Textarea
                id="additionalInfo"
                placeholder="Any additional technical details..."
                rows={4}
                {...register('additionalInfo')}
                data-testid="input-additional-info"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-between pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/${category}/${prevStepPath}${id ? `/${id}` : ''}`)}
                data-testid="btn-back"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || (hasFeatureSelection && featureList.length < FEATURE_MIN)}
                className="bg-[#C64091] hover:bg-[#A03375]"
                data-testid="btn-save-next"
              >
                {isSubmitting ? 'Saving...' : 'Save & Next'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Go Live Step
export const GoLive = ({ category }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const location = useLocation();
  const isVoucherDesignStep = location.pathname.includes('voucherdesign');
  const stepKey = isVoucherDesignStep ? 'voucherDesign' : 'goLive';
  const { prev: prevStepPath } = getPrevNextStepPaths(category, stepKey, location?.pathname);
  const goLiveBackPath = prevStepPath || 'tech-info';

  const handlePublish = async () => {
    if (!agreed) {
      toast.error('Please agree to the terms and conditions');
      return;
    }
    if (!id) {
      toast.error('Product ID missing. Please start from General Information.');
      return;
    }

    setIsSubmitting(true);
    try {
      await productApi.updateProduct({
        _id: id,
        ProductUploadStatus: 'pendingapproval',
      });
      toast.success('Product submitted for review!');
      navigate('/sellerhub');
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to publish. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!id) {
      toast.success('Product saved as draft!');
      navigate('/sellerhub');
      return;
    }
    setIsSubmitting(true);
    try {
      await productApi.updateProduct({
        _id: id,
        ProductUploadStatus: 'Draft',
      });
      toast.success('Product saved as draft!');
      navigate('/sellerhub');
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to save draft.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] py-8" data-testid="go-live-page">
      <div className="form-container">
        <Stepper currentStep={4} completedSteps={[1, 2, 3]} />

        <div className="form-section">
          <h2 className="form-section-title">Review & Go Live</h2>
          
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-[#FCE7F3] rounded-lg p-6">
              <h3 className="font-semibold text-[#C64091] mb-2">Almost there!</h3>
              <p className="text-gray-600">
                Please review your product information before publishing. 
                Once published, your product will be submitted for admin review 
                before going live on the marketplace.
              </p>
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="terms"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-gray-300 text-[#C64091] focus:ring-[#C64091]"
                data-testid="checkbox-terms"
              />
              <label htmlFor="terms" className="text-sm text-gray-600">
                I confirm that all the information provided is accurate and I agree to the 
                <a href="#" className="text-[#C64091] hover:underline ml-1">Terms & Conditions</a> and 
                <a href="#" className="text-[#C64091] hover:underline ml-1">Seller Guidelines</a>.
              </label>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/${category}/${goLiveBackPath}${id ? `/${id}` : ''}`)}
                data-testid="btn-back"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSaveDraft}
                  disabled={isSubmitting}
                  data-testid="btn-save-draft"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save as Draft
                </Button>
                <Button
                  type="button"
                  onClick={handlePublish}
                  disabled={isSubmitting || !agreed}
                  className="bg-[#C64091] hover:bg-[#A03375]"
                  data-testid="btn-publish"
                >
                  {isSubmitting ? 'Publishing...' : 'Submit for Review'}
                  <CheckCircle2 className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default { GeneralInformation, ProductInfo, TechInfo, GoLive };
