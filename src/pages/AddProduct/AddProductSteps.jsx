import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import { ArrowLeft, ArrowRight, Save, CheckCircle2, Info, X, CloudUpload, ImageIcon, Trash2, Calendar as CalendarIcon } from 'lucide-react';
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../components/ui/popover';
import { Calendar } from '../../components/ui/calendar';
import { Checkbox } from '../../components/ui/checkbox';
import StateData from '../../utils/StateCityArray.json';
import { supportsBulkUpload, downloadBulkUploadTemplate } from '../../utils/excelTemplates';

const STATE_REGION_MAP = {
  'Delhi': 'North', 'Haryana': 'North', 'Punjab': 'North', 'Uttar Pradesh': 'North',
  'Rajasthan': 'North', 'Himachal Pradesh': 'North', 'Uttarakhand': 'North',
  'Jammu Kashmir': 'North', 'Chandigarh': 'North', 'Ladakh': 'North',
  'Maharashtra': 'West', 'Gujarat': 'West', 'Goa': 'West', 'Madhya Pradesh': 'Central',
  'Chhattisgarh': 'Central', 'West Bengal': 'East', 'Bihar': 'East', 'Jharkhand': 'East',
  'Odisha': 'East', 'Assam': 'East', 'Sikkim': 'East', 'Meghalaya': 'East',
  'Tripura': 'East', 'Mizoram': 'East', 'Manipur': 'East', 'Nagaland': 'East',
  'Arunachal Pradesh': 'East', 'Tamil Nadu': 'South', 'Karnataka': 'South',
  'Kerala': 'South', 'Andhra Pradesh': 'South', 'Telangana': 'South',
  'Puducherry': 'South', 'Andaman Nicobar Islands': 'South', 'Lakshadweep': 'South',
};

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
const PRODUCT_FEATURE_MIN = 5;
const PRODUCT_FEATURE_MAX = 20;

const CLOTHING_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'XXXXL'];
const US_SHOE_SIZES = [30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50];
const UK_SHOE_SIZES = [2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5];
const EU_SHOE_SIZES = [35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48];

export const ProductInfo = ({ category }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [featureOptions, setFeatureOptions] = useState([]);
  const [featuresLoading, setFeaturesLoading] = useState(false);
  const [featureList, setFeatureList] = useState([]);
  const [selectedFeature, setSelectedFeature] = useState('');
  const [featureDescription, setFeatureDescription] = useState('');
  const [locationDetails, setLocationDetails] = useState({ region: '', state: '', city: '', landmark: '', pincode: '' });
  const [cityArray, setCityArray] = useState([]);
  const [otherCosts, setOtherCosts] = useState([]);
  const [otherCostForm, setOtherCostForm] = useState({ AdCostApplicableOn: 'All', CostPrice: '', currencyType: '₹', AdCostHSN: '', AdCostGST: 18, ReasonOfCost: '' });
  const [productsVariations, setProductsVariations] = useState([]);
  
  // Manufacturing & Expiry Dates
  const [manufacturingDate, setManufacturingDate] = useState(null);
  const [hasExpiryDate, setHasExpiryDate] = useState(false);
  const [expiryDate, setExpiryDate] = useState(null);
  
  // Mobility Registration Details
  const [registrationDetails, setRegistrationDetails] = useState({
    registrationDetails: '',
    insuranceDetails: '',
    taxesDetails: '',
  });

  const piConfig = getProductInfoConfig(category);
  const { prev: prevStepPath, next: nextStepPath } = getPrevNextStepPaths(category, 'productInfo', location?.pathname);
  const prevPath = prevStepPath || 'general-info';
  const nextPath = nextStepPath || 'tech-info';
  const hasSizeOptions = piConfig.sizeOptions && piConfig.sizeOptions.length > 0 && category !== 'restaurant';

  const hasHsn = piConfig.commonFields?.includes?.('hsn') ?? true;
  const hasSampleCheckbox = !category?.endsWith?.('Voucher');
  const hasGenderInProductInfo = ['textile', 'lifestyle', 'others'].includes(category);
  const hasProductInfoExtras = !category?.endsWith?.('Voucher');
  const featureEndpoint = getFeatureEndpoint(category);
  const tiConfig = getTechInfoConfig(category);
  const featureNameField = tiConfig?.featureNameField || 'SampleLifestyleFeature';

  useEffect(() => {
    if (!hasProductInfoExtras || !featureEndpoint) return;
    const fetchFeatures = async () => {
      setFeaturesLoading(true);
      try {
        const res = await api.get(featureEndpoint);
        const root = res?.data?.data ?? res?.data?.body ?? res?.data;
        const list = Array.isArray(root) ? root : root?.data ? root.data : [];
        const opts = list
          .map((item) => {
            const label = item?.[featureNameField] || item?.name || item?.value;
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
  }, [category, hasProductInfoExtras, featureEndpoint, featureNameField]);

  useEffect(() => {
    if (locationDetails.state && StateData?.length) {
      const stateObj = StateData.find((s) => s.name === locationDetails.state);
      setCityArray(stateObj?.data || []);
    } else {
      setCityArray([]);
    }
  }, [locationDetails.state]);

  const handlePincodeLookup = async (pincode) => {
    if (String(pincode).length !== 6) return;
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      const data = await res.json();
      if (data?.[0]?.Status === 'Success' && data?.[0]?.PostOffice?.length > 0) {
        const po = data[0].PostOffice[0];
        const normalize = (s) => (s || '').toLowerCase().replace(/\s+/g, '');
        const matchedState = StateData.find((s) => normalize(s.name) === normalize(po.State));
        if (matchedState) {
          setLocationDetails((prev) => ({
            ...prev,
            pincode: String(pincode),
            region: STATE_REGION_MAP[matchedState.name] || 'North',
            state: matchedState.name,
            city: (matchedState.data || []).find((c) => normalize(c) === normalize(po.District)) || matchedState.data?.[0] || '',
            landmark: po.Name || prev.landmark,
          }));
          setCityArray(matchedState.data || []);
          toast.success('Location auto-filled!');
        } else {
          toast.warning(`State "${po.State}" not found. Please select manually.`);
        }
      } else {
        toast.error('Invalid pincode or no data found');
      }
    } catch {
      toast.error('Failed to fetch location data');
    }
  };

  const handleAddFeature = () => {
    const featureToAdd = selectedFeature || featureDescription?.trim();
    if (!featureToAdd) {
      toast.error('Please select a feature or enter a custom feature name');
      return;
    }
    if (featureList.length >= PRODUCT_FEATURE_MAX) {
      toast.error(`Maximum ${PRODUCT_FEATURE_MAX} features allowed`);
      return;
    }
    if (featureList.some((f) => f.name === featureToAdd)) {
      toast.error('This feature is already added');
      return;
    }
    setFeatureList((prev) => [...prev, { name: featureToAdd, description: featureDescription?.trim() || featureToAdd }]);
    setSelectedFeature('');
    setFeatureDescription('');
  };

  const handleRemoveFeature = (idx) => {
    setFeatureList((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleAddOtherCost = () => {
    const cp = parseFloat(String(otherCostForm.CostPrice).replace(/,/g, '')) || 0;
    if (cp <= 0) {
      toast.error('Cost price must be greater than 0');
      return;
    }
    if (!otherCostForm.ReasonOfCost?.trim()) {
      toast.error('Reason of cost is required');
      return;
    }
    const hs = String(otherCostForm.AdCostHSN || '').trim();
    if (!/^\d{4}$|^\d{6}$|^\d{8}$/.test(hs) && hs) {
      toast.error('HSN must be 4, 6, or 8 digits');
      return;
    }
    setOtherCosts((prev) => [...prev, {
      AdCostApplicableOn: otherCostForm.AdCostApplicableOn || 'All',
      CostPrice: cp,
      currencyType: otherCostForm.currencyType || '₹',
      AdCostHSN: hs || '',
      AdCostGST: Number(otherCostForm.AdCostGST) || 18,
      ReasonOfCost: otherCostForm.ReasonOfCost?.trim() || '',
    }]);
    setOtherCostForm({ AdCostApplicableOn: 'All', CostPrice: '', currencyType: '₹', AdCostHSN: '', AdCostGST: 18, ReasonOfCost: '' });
  };

  const handleRemoveOtherCost = (idx) => {
    setOtherCosts((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleAddVariation = () => {
    const d = getValues();
    const price = parseFloat(String(d.price || 0).replace(/,/g, '')) || 0;
    const discountedPrice = parseFloat(String(d.discountedPrice || 0).replace(/,/g, '')) || price;
    if (price <= 0) {
      toast.error('MRP is required and must be greater than 0');
      return;
    }
    if (discountedPrice <= 0) {
      toast.error('Discounted MRP is required and must be greater than 0');
      return;
    }
    if (!d.hsn?.trim() && hasHsn) {
      toast.error('HSN is required');
      return;
    }
    if (d.selectedSize === 'Shoes' && !d.shoeSize) {
      toast.error('Please select a shoe size');
      return;
    }
    if (d.selectedSize === 'Volume' && !d.volume) {
      toast.error('Please enter volume');
      return;
    }
    let productSize = d.selectedSize || '';
    let measurementUnit = d.sizeUnit || 'cm';
    let shoeSize = '';
    if (d.selectedSize === 'Shoes' && d.shoeSize) {
      shoeSize = String(d.shoeSize);
      measurementUnit = d.shoeMeasurementUnit || 'US';
      productSize = shoeSize;
    } else if (CLOTHING_SIZES.includes(d.selectedSize)) {
      productSize = d.selectedSize;
    } else if (d.selectedSize === 'Volume' && d.volume) {
      productSize = `${d.volume}${d.sizeUnit || 'L'}`;
    }
    const variation = {
      PricePerUnit: price,
      DiscountedPrice: discountedPrice,
      MinOrderQuantity: parseInt(d.minOrderQty, 10) || 1,
      MaxOrderQuantity: parseInt(d.maxOrderQty, 10) || 100,
      GST: String(d.gst || '18'),
      HSN: d.hsn || '',
      ProductSize: productSize,
      ProductColor: d.productColor || '#ffffff',
      ProductIdType: d.productIdType || `SKU-${Date.now()}`,
      Length: d.length || '',
      Width: d.width || '',
      Height: d.height || '',
      Weight: d.weight || '',
      MeasurementUnit: measurementUnit,
      ...(shoeSize && { ShoeSize: shoeSize }),
    };
    setProductsVariations((prev) => [...prev, variation]);
    toast.success('Product variation added');
  };

  const handleRemoveVariation = (idx) => {
    setProductsVariations((prev) => prev.filter((_, i) => i !== idx));
  };

  // Date requirements per category
  const dateRequirements = {
    electronics: { manufacturing: 'mandatory', expiry: 'optional' },
    fmcg: { manufacturing: 'mandatory', expiry: 'mandatory' },
    officesupply: { manufacturing: 'optional', expiry: 'optional' },
    mobility: { manufacturing: 'optional', expiry: 'optional' },
    restaurant: { manufacturing: 'optional', expiry: 'optional' },
    others: { manufacturing: 'mandatory', expiry: 'optional' },
  };
  const currentDateReqs = dateRequirements[category] || { manufacturing: 'optional', expiry: 'optional' };

  const { register, handleSubmit, formState: { errors }, setValue, watch, getValues } = useForm({
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
      shoeSize: '',
      shoeMeasurementUnit: 'US',
      sampleAvailability: '',
      priceOfSample: '',
      volume: '',
    }
  });

  const selectedSize = watch('selectedSize');

  const onSubmit = async (data) => {
    if (!id) {
      toast.error('Product ID missing. Please start from General Information.');
      return;
    }
    const isVoucher = category?.endsWith?.('Voucher');
    if (productsVariations.length === 0 && !isVoucher) {
      toast.error('Please add at least one product variation using "Proceed to Add"');
      return;
    }
    if (hasProductInfoExtras && featureList.length < PRODUCT_FEATURE_MIN) {
      toast.error(`Minimum ${PRODUCT_FEATURE_MIN} product features required. Add ${PRODUCT_FEATURE_MIN - featureList.length} more.`);
      return;
    }
    if (hasProductInfoExtras && featureList.length > PRODUCT_FEATURE_MAX) {
      toast.error(`Maximum ${PRODUCT_FEATURE_MAX} product features allowed.`);
      return;
    }
    
    // Validate Manufacturing Date (mandatory for electronics, fmcg, others)
    if (currentDateReqs.manufacturing === 'mandatory' && !manufacturingDate) {
      toast.error('Manufacturing date is required for this category');
      return;
    }
    
    // Validate Expiry Date (mandatory for FMCG, optional for others if checkbox checked)
    if (category === 'fmcg' && !expiryDate) {
      toast.error('Expiry date is required for FMCG products');
      return;
    }
    if (hasExpiryDate && !expiryDate && category !== 'fmcg') {
      toast.error('Please select an expiry date or uncheck the expiry date option');
      return;
    }
    
    setIsSubmitting(true);
    try {
      let variants = productsVariations;
      if (variants.length === 0 && isVoucher) {
        const d = getValues();
        variants = [{
          PricePerUnit: parseFloat(String(d.price || 0).replace(/,/g, '')) || 0,
          DiscountedPrice: parseFloat(String(d.discountedPrice || 0).replace(/,/g, '')) || parseFloat(String(d.price || 0).replace(/,/g, '')) || 0,
          MinOrderQuantity: parseInt(d.minOrderQty, 10) || 1,
          MaxOrderQuantity: parseInt(d.maxOrderQty, 10) || 100,
          GST: String(d.gst || '18'),
          HSN: d.hsn || '',
          ProductSize: d.selectedSize || '',
          ProductColor: d.productColor || '#ffffff',
          ProductIdType: d.productIdType || `SKU-${Date.now()}`,
          Length: d.length || '',
          Width: d.width || '',
          Height: d.height || '',
          Weight: d.weight || '',
        }];
      }
      const payload = {
        _id: id,
        ProductUploadStatus: hasProductInfoExtras ? 'productinformation' : 'technicalinformation',
        ProductsVariantions: variants,
        IsSample: !!data.isSample,
        ...(data.isSample && {
          SampleAvailability: parseInt(data.sampleAvailability, 10) || 0,
          PriceOfSample: parseFloat(String(data.priceOfSample || 0).replace(/,/g, '')) || 0,
        }),
        ...(hasGenderInProductInfo && { Gender: data.gender, gender: data.gender }),
        ...(hasProductInfoExtras && {
          LocationDetails: locationDetails,
          OtherCost: otherCosts,
          ProductFeatures: featureList,
        }),
        // Manufacturing & Expiry Dates
        ...(manufacturingDate && { ManufacturingDate: format(manufacturingDate, 'yyyy-MM-dd') }),
        ...(expiryDate && { ExpiryDate: format(expiryDate, 'yyyy-MM-dd') }),
        // FMCG Product Form
        ...(category === 'fmcg' && data.productForm && { ProductForm: data.productForm }),
        // Mobility Registration Details
        ...(category === 'mobility' && productData?.hasRegistrationProcess === 'Yes' && {
          RegistrationDetails: registrationDetails.registrationDetails || '',
          InsuranceDetails: registrationDetails.insuranceDetails || '',
          TaxesDetails: registrationDetails.taxesDetails || '',
        }),
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
          
          {/* Template Download for Bulk Upload Categories */}
          {supportsBulkUpload(category) && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-blue-900 mb-1">
                    Bulk Upload Available
                  </h3>
                  <p className="text-xs text-blue-700 mb-3">
                    Upload multiple products at once using our Excel template. Download the template, fill in your product details, and upload.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const success = downloadBulkUploadTemplate(category);
                    if (success) {
                      toast.success('Template downloaded successfully!');
                    } else {
                      toast.error('Failed to download template');
                    }
                  }}
                  className="border-blue-500 text-blue-700 hover:bg-blue-100 whitespace-nowrap ml-4"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download Template
                </Button>
              </div>
            </div>
          )}
          
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

            {/* Shoes size – ShoeSize dropdown + MeasurementUnit (US/UK/EU) */}
            {hasSizeOptions && selectedSize === 'Shoes' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Shoe Size <span className="text-red-500">*</span></Label>
                  <div className="flex gap-2">
                    <Select
                      value={watch('shoeMeasurementUnit')}
                      onValueChange={(v) => {
                        setValue('shoeMeasurementUnit', v);
                        setValue('shoeSize', '');
                      }}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue placeholder="Unit" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="US">US</SelectItem>
                        <SelectItem value="UK">UK</SelectItem>
                        <SelectItem value="EU">EU</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select
                      value={watch('shoeSize')}
                      onValueChange={(v) => setValue('shoeSize', v)}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        {((watch('shoeMeasurementUnit') || 'US') === 'US' ? US_SHOE_SIZES : (watch('shoeMeasurementUnit') || 'US') === 'UK' ? UK_SHOE_SIZES : EU_SHOE_SIZES).map((s) => (
                          <SelectItem key={s} value={String(s)}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Size value + unit – when dimension type selected (not clothing, not shoes) */}
            {hasSizeOptions && selectedSize && !CLOTHING_SIZES.includes(selectedSize) && selectedSize !== 'Shoes' && ['Length', 'Length x Height', 'Length x Height x Width', 'Weight', 'Custom Size'].includes(selectedSize) && (
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

            {/* Clothing sizes (XS, S, M, L, etc.) – ProductSize = selectedSize, no extra input */}
            {hasSizeOptions && selectedSize && CLOTHING_SIZES.includes(selectedSize) && (
              <div className="space-y-2">
                <Label>Selected Size</Label>
                <p className="text-sm text-[#6B7A99]">Size: <span className="font-medium text-[#111827]">{selectedSize}</span></p>
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

            {/* Manufacturing & Expiry Dates – for electronics, fmcg, officesupply, mobility, restaurant, others */}
            {!category?.endsWith?.('Voucher') && ['electronics', 'fmcg', 'officesupply', 'mobility', 'restaurant', 'others'].includes(category) && (
              <div className="space-y-4 pt-4 border-t border-[#E5E8EB]">
                <h3 className="text-base font-semibold text-[#111827]">Product Dates</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Manufacturing Date */}
                  <div className="space-y-2">
                    <Label>
                      Manufacturing Date{' '}
                      {currentDateReqs.manufacturing === 'mandatory' && <span className="text-red-500">*</span>}
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className={cn(
                            'w-full justify-start text-left font-normal',
                            !manufacturingDate && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {manufacturingDate ? format(manufacturingDate, 'PPP') : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={manufacturingDate}
                          onSelect={setManufacturingDate}
                          disabled={(date) => date > new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Expiry Date */}
                  <div className="space-y-2">
                    {/* For FMCG, expiry is mandatory (no checkbox) */}
                    {category === 'fmcg' ? (
                      <>
                        <Label>
                          Expiry Date <span className="text-red-500">*</span>
                        </Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              className={cn(
                                'w-full justify-start text-left font-normal',
                                !expiryDate && 'text-muted-foreground'
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {expiryDate ? format(expiryDate, 'PPP') : <span>Pick a date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={expiryDate}
                              onSelect={setExpiryDate}
                              disabled={(date) => {
                                if (date < new Date()) return true;
                                if (manufacturingDate && date <= manufacturingDate) return true;
                                return false;
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="has-expiry"
                            checked={hasExpiryDate}
                            onCheckedChange={setHasExpiryDate}
                          />
                          <Label htmlFor="has-expiry" className="cursor-pointer">
                            This product has an expiry date
                          </Label>
                        </div>
                        {hasExpiryDate && (
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                type="button"
                                variant="outline"
                                className={cn(
                                  'w-full justify-start text-left font-normal',
                                  !expiryDate && 'text-muted-foreground'
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {expiryDate ? format(expiryDate, 'PPP') : <span>Pick a date</span>}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={expiryDate}
                                onSelect={setExpiryDate}
                                disabled={(date) => {
                                  if (date < new Date()) return true;
                                  if (manufacturingDate && date <= manufacturingDate) return true;
                                  return false;
                                }}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        )}
                      </>
                    )}
                  </div>
                </div>
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

            {/* Volume – for lifestyle, others, fmcg, restaurant, mobility */}
            {hasSizeOptions && selectedSize === 'Volume' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Volume <span className="text-red-500">*</span></Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="e.g. 500"
                      {...register('volume')}
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
                        <SelectItem value="ml">ml</SelectItem>
                        <SelectItem value="L">L</SelectItem>
                        <SelectItem value="cl">cl</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
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

            {/* Mobility Registration & Compliance Details – only when hasRegistrationProcess === 'Yes' */}
            {category === 'mobility' && productData?.hasRegistrationProcess === 'Yes' && (
              <div className="space-y-4 pt-4 border-t border-[#E5E8EB]">
                <h3 className="text-base font-semibold text-[#111827]">Registration & Compliance Details</h3>
                <p className="text-sm text-[#6B7A99]">
                  Provide registration, insurance, and tax details for this mobility product
                </p>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="registrationDetails">Registration Details</Label>
                    <Textarea
                      id="registrationDetails"
                      placeholder="Enter registration requirements and process details..."
                      rows={3}
                      value={registrationDetails.registrationDetails}
                      onChange={(e) => setRegistrationDetails(prev => ({ ...prev, registrationDetails: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="insuranceDetails">Insurance Details</Label>
                    <Textarea
                      id="insuranceDetails"
                      placeholder="Enter insurance requirements and coverage details..."
                      rows={3}
                      value={registrationDetails.insuranceDetails}
                      onChange={(e) => setRegistrationDetails(prev => ({ ...prev, insuranceDetails: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="taxesDetails">Taxes Details</Label>
                    <Textarea
                      id="taxesDetails"
                      placeholder="Enter applicable taxes and related information..."
                      rows={3}
                      value={registrationDetails.taxesDetails}
                      onChange={(e) => setRegistrationDetails(prev => ({ ...prev, taxesDetails: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Add Product Variation */}
            {!category?.endsWith?.('Voucher') && (
              <div className="space-y-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleAddVariation}
                  className="border-[#C64091] text-[#C64091] hover:bg-[#FCE7F3]"
                  data-testid="btn-add-variation"
                >
                  Proceed to Add
                </Button>
                {productsVariations.length > 0 && (
                  <div className="space-y-2">
                    <Label>Added Variations ({productsVariations.length})</Label>
                    <div className="rounded-md border border-[#E5E8EB] overflow-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-[#F8F9FA] border-b border-[#E5E8EB]">
                            <th className="text-left px-3 py-2">Size</th>
                            <th className="text-left px-3 py-2">Color</th>
                            <th className="text-left px-3 py-2">HSN</th>
                            <th className="text-left px-3 py-2">GST</th>
                            <th className="text-left px-3 py-2">Product ID</th>
                            <th className="text-left px-3 py-2">MRP</th>
                            <th className="text-left px-3 py-2">Disc. MRP</th>
                            <th className="text-left px-3 py-2">Min</th>
                            <th className="text-left px-3 py-2">Max</th>
                            <th className="w-10 px-2 py-2"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {productsVariations.map((v, idx) => (
                            <tr key={idx} className="border-b border-[#E5E8EB] last:border-0">
                              <td className="px-3 py-2">
                                {v.ShoeSize ? `${v.ShoeSize} (${v.MeasurementUnit || ''})` : v.ProductSize || '-'}
                              </td>
                              <td className="px-3 py-2">
                                <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: v.ProductColor || '#ffffff' }} />
                                <span className="ml-1 text-xs font-mono">{v.ProductColor || '#ffffff'}</span>
                              </td>
                              <td className="px-3 py-2">{v.HSN || '-'}</td>
                              <td className="px-3 py-2">{v.GST ? `${v.GST}%` : '-'}</td>
                              <td className="px-3 py-2">{v.ProductIdType || '-'}</td>
                              <td className="px-3 py-2">{v.PricePerUnit ?? '-'}</td>
                              <td className="px-3 py-2">{v.DiscountedPrice ?? '-'}</td>
                              <td className="px-3 py-2">{v.MinOrderQuantity ?? '-'}</td>
                              <td className="px-3 py-2">{v.MaxOrderQuantity ?? '-'}</td>
                              <td className="px-2 py-2">
                                <button type="button" onClick={() => handleRemoveVariation(idx)} className="text-[#6B7A99] hover:text-[#C64091] p-1" aria-label="Remove variation">
                                  <X className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Sample provision */}
            {hasSampleCheckbox && (
              <div className="space-y-4">
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
                {watch('isSample') && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
                    <div className="space-y-2">
                      <Label htmlFor="sampleAvailability">Sample Availability (Quantity)</Label>
                      <Input
                        id="sampleAvailability"
                        type="number"
                        placeholder="e.g. 5"
                        min={1}
                        {...register('sampleAvailability')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="priceOfSample">Price of Sample (₹)</Label>
                      <Input
                        id="priceOfSample"
                        type="number"
                        placeholder="e.g. 100"
                        min={0}
                        step="0.01"
                        {...register('priceOfSample')}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Product Pickup Location */}
            {hasProductInfoExtras && (
              <div className="space-y-4 pt-4 border-t border-[#E5E8EB]">
                <h3 className="text-base font-semibold text-[#111827]">Product Pickup Location</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Pincode <span className="text-red-500">*</span></Label>
                    <Input
                      placeholder="Enter 6-digit pincode"
                      maxLength={6}
                      value={locationDetails.pincode}
                      onChange={(e) => {
                        const v = e.target.value.replace(/\D/g, '');
                        setLocationDetails((prev) => ({ ...prev, pincode: v }));
                        if (v.length === 6) handlePincodeLookup(v);
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Region</Label>
                    <Select
                      value={locationDetails.region}
                      onValueChange={(v) => setLocationDetails((prev) => ({ ...prev, region: v }))}
                    >
                      <SelectTrigger><SelectValue placeholder="Select region" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="North">North</SelectItem>
                        <SelectItem value="South">South</SelectItem>
                        <SelectItem value="East">East</SelectItem>
                        <SelectItem value="West">West</SelectItem>
                        <SelectItem value="Central">Central</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>State</Label>
                    <Select
                      value={locationDetails.state}
                      onValueChange={(v) => setLocationDetails((prev) => ({ ...prev, state: v }))}
                    >
                      <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                      <SelectContent>
                        {StateData?.map((s, i) => (
                          <SelectItem key={i} value={s.name}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>City</Label>
                    <Select
                      value={locationDetails.city}
                      onValueChange={(v) => setLocationDetails((prev) => ({ ...prev, city: v }))}
                    >
                      <SelectTrigger><SelectValue placeholder="Select city" /></SelectTrigger>
                      <SelectContent>
                        {cityArray?.map((c, i) => (
                          <SelectItem key={i} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Landmark</Label>
                    <Input
                      placeholder="Eg. Near Metro Station"
                      value={locationDetails.landmark}
                      onChange={(e) => setLocationDetails((prev) => ({ ...prev, landmark: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Additional Cost */}
            {hasProductInfoExtras && (
              <div className="space-y-4 pt-4 border-t border-[#E5E8EB]">
                <h3 className="text-base font-semibold text-[#111827]">
                  Additional Cost <span className="text-sm font-normal text-[#6B7A99]">(Additional cost is not mandatory)</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Applicable On</Label>
                    <Select
                      value={otherCostForm.AdCostApplicableOn}
                      onValueChange={(v) => setOtherCostForm((prev) => ({ ...prev, AdCostApplicableOn: v }))}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All">One Time Cost</SelectItem>
                        <SelectItem value="PerUnit">Per Unit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Cost Price</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={otherCostForm.CostPrice}
                      onChange={(e) => setOtherCostForm((prev) => ({ ...prev, CostPrice: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Currency</Label>
                    <Select
                      value={otherCostForm.currencyType}
                      onValueChange={(v) => setOtherCostForm((prev) => ({ ...prev, currencyType: v }))}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="₹">INR (₹)</SelectItem>
                        <SelectItem value="BXITokens">BXI Tokens</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>HSN (4/6/8 digits)</Label>
                    <Input
                      placeholder="e.g. 9983"
                      maxLength={8}
                      value={otherCostForm.AdCostHSN}
                      onChange={(e) => setOtherCostForm((prev) => ({ ...prev, AdCostHSN: e.target.value.replace(/\D/g, '') }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>GST %</Label>
                    <Select
                      value={String(otherCostForm.AdCostGST)}
                      onValueChange={(v) => setOtherCostForm((prev) => ({ ...prev, AdCostGST: Number(v) }))}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {[5, 12, 18, 28].map((n) => (
                          <SelectItem key={n} value={String(n)}>{n}%</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Reason of Cost</Label>
                    <Input
                      placeholder="Describe the cost"
                      value={otherCostForm.ReasonOfCost}
                      onChange={(e) => setOtherCostForm((prev) => ({ ...prev, ReasonOfCost: e.target.value }))}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button type="button" variant="secondary" onClick={handleAddOtherCost}>
                      Add Additional Cost
                    </Button>
                  </div>
                </div>
                {otherCosts.length > 0 && (
                  <ul className="space-y-2 mt-4">
                    {otherCosts.map((oc, idx) => (
                      <li key={idx} className="flex items-center justify-between rounded-md border border-[#E5E8EB] bg-white px-3 py-2">
                        <span>{oc.AdCostApplicableOn} • {oc.CostPrice} {oc.currencyType} • {oc.ReasonOfCost}</span>
                        <button type="button" onClick={() => handleRemoveOtherCost(idx)} className="text-[#6B7A99] hover:text-[#C64091] p-1"><X className="w-4 h-4" /></button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Product Features – always show for non-voucher categories */}
            {hasProductInfoExtras && (
              <div className="space-y-4 pt-4 border-t border-[#E5E8EB]">
                <h3 className="text-base font-semibold text-[#111827]">Product Features</h3>
                <p className="text-sm text-[#6B7A99]">
                  Select the best features that describe your brand/product (The more features you write the more you are discovered)
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {featureOptions.length > 0 ? (
                    <div className="space-y-2">
                      <Label>Select Best Features (Min {PRODUCT_FEATURE_MIN} and Max {PRODUCT_FEATURE_MAX})</Label>
                      <Select
                        value={selectedFeature}
                        onValueChange={setSelectedFeature}
                        disabled={featuresLoading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={featuresLoading ? 'Loading...' : 'Select a feature'} />
                        </SelectTrigger>
                        <SelectContent>
                          {featureOptions
                            .filter((o) => !featureList.some((f) => f.name === o.value))
                            .map((o) => (
                              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label>Feature Name (Min {PRODUCT_FEATURE_MIN} and Max {PRODUCT_FEATURE_MAX})</Label>
                      <Input
                        placeholder="e.g. Water Resistant, Eco-Friendly"
                        value={selectedFeature}
                        onChange={(e) => setSelectedFeature(e.target.value)}
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label>Feature Description *</Label>
                    <Input
                      placeholder="Eg. Smart watch (Type in two - three words)"
                      value={featureDescription}
                      onChange={(e) => setFeatureDescription(e.target.value)}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleAddFeature}
                      disabled={featureList.length >= PRODUCT_FEATURE_MAX || (!selectedFeature && !featureDescription?.trim())}
                    >
                      Proceed to Add
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-[#6B7A99]">
                  Key Features ({featureList.length}) (Minimum {PRODUCT_FEATURE_MIN} required,{' '}
                  {featureList.length >= PRODUCT_FEATURE_MIN ? '0' : String(PRODUCT_FEATURE_MIN - featureList.length)} more needed)
                </p>
                {featureList.length > 0 && (
                  <ul className="space-y-2">
                    {featureList.map((f, idx) => (
                      <li key={idx} className="flex items-center justify-between gap-2 rounded-md border border-[#E5E8EB] bg-white px-3 py-2">
                        <div>
                          <span className="font-medium">{f.name}</span>
                          {f.description && f.description !== f.name && (
                            <span className="text-sm text-[#6B7A99] ml-2">— {f.description}</span>
                          )}
                        </div>
                        <button type="button" onClick={() => handleRemoveFeature(idx)} className="text-[#6B7A99] hover:text-[#C64091] p-1"><X className="w-4 h-4" /></button>
                      </li>
                    ))}
                  </ul>
                )}
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
                disabled={isSubmitting || (!category?.endsWith?.('Voucher') && productsVariations.length === 0) || (hasProductInfoExtras && featureList.length < PRODUCT_FEATURE_MIN)}
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

// Technical Information Step – weight, dimensions, warranty, additional info
export const TechInfo = ({ category }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [productData, setProductData] = useState(null);

  const { prev: prevPath, next: nextPath } = getPrevNextStepPaths(category, 'techInfo', location?.pathname);
  const prevStepPath = prevPath || 'product-info';
  const nextStepPath = nextPath || 'go-live';

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    defaultValues: {
      weight: '',
      dimensions: '',
      material: '',
      warranty: '',
      guaranteePeriod: '',
      guaranteeDetails: '',
      packagingType: '',
      packagingDetails: '',
      usageInstructions: '',
      careInstructions: '',
      safetyWarnings: '',
      legalCompliance: '',
      certifications: '',
      tags: '',
      additionalInfo: '',
    }
  });

  // Fetch product data
  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      try {
        const res = await productApi.getProductById(id);
        setProductData(res?.data);
        
        // Pre-fill if data exists
        if (res?.data?.ProductTechInfo) {
          const techInfo = res.data.ProductTechInfo;
          setValue('weight', techInfo.WeightBeforePackingPerUnit || '');
          setValue('dimensions', `${techInfo.Length || ''} x ${techInfo.Width || ''} x ${techInfo.Height || ''}`.trim());
          setValue('warranty', techInfo.Warranty || '');
          setValue('guaranteePeriod', techInfo.GuaranteePeriod || '');
          setValue('guaranteeDetails', techInfo.GuaranteeDetails || '');
          setValue('packagingType', techInfo.PackagingType || '');
          setValue('packagingDetails', techInfo.PackagingDetails || '');
          setValue('usageInstructions', techInfo.UsageInstructions || '');
          setValue('careInstructions', techInfo.CareInstructions || '');
          setValue('safetyWarnings', techInfo.SafetyWarnings || '');
          setValue('legalCompliance', techInfo.LegalCompliance || '');
          setValue('certifications', techInfo.Certifications || '');
        }
        
        if (res?.data?.ProductTags) {
          setValue('tags', res.data.ProductTags.join(', '));
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      }
    };
    fetchProduct();
  }, [id, setValue]);

  const onSubmit = async (data) => {
    if (!id) {
      toast.error('Product ID missing. Please start from General Information.');
      return;
    }
    setIsSubmitting(true);
    try {
      const tags = data.tags
        ? data.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : [];

      const payload = {
        _id: id,
        ProductUploadStatus: 'golive',
        ProductTechInfo: {
          Warranty: data.warranty || '',
          GuaranteePeriod: data.guaranteePeriod || '',
          GuaranteeDetails: data.guaranteeDetails || '',
          WeightBeforePackingPerUnit: data.weight || '',
          Length: data.length || data.dimensions?.split?.('x')?.[0]?.trim() || '',
          Width: data.width || data.dimensions?.split?.('x')?.[1]?.trim() || '',
          Height: data.height || data.dimensions?.split?.('x')?.[2]?.trim() || '',
          PackagingType: data.packagingType || '',
          PackagingDetails: data.packagingDetails || '',
          UsageInstructions: data.usageInstructions || '',
          CareInstructions: data.careInstructions || '',
          SafetyWarnings: data.safetyWarnings || '',
          LegalCompliance: data.legalCompliance || '',
          Certifications: data.certifications || '',
        },
        ProductTags: tags,
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
          <h2 className="form-section-title">Technical Information</h2>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Weight & Dimensions */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-[#111827]">Physical Specifications</h3>
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
            </div>

            {/* Warranty & Guarantee */}
            <div className="space-y-4 pt-4 border-t border-[#E5E8EB]">
              <h3 className="text-base font-semibold text-[#111827]">Warranty & Guarantee</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Warranty Period</Label>
                  <Select
                    value={watch('warranty')}
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
                      <SelectItem value="5years">5 Years</SelectItem>
                      <SelectItem value="lifetime">Lifetime</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Guarantee Period (Optional)</Label>
                  <Select
                    value={watch('guaranteePeriod')}
                    onValueChange={(value) => setValue('guaranteePeriod', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select guarantee period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Guarantee</SelectItem>
                      <SelectItem value="6months">6 Months</SelectItem>
                      <SelectItem value="1year">1 Year</SelectItem>
                      <SelectItem value="2years">2 Years</SelectItem>
                      <SelectItem value="3years">3 Years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="guaranteeDetails">Warranty/Guarantee Details (Optional)</Label>
                <Textarea
                  id="guaranteeDetails"
                  placeholder="What does the warranty/guarantee cover? Any exclusions?"
                  rows={3}
                  {...register('guaranteeDetails')}
                />
              </div>
            </div>

            {/* Packaging */}
            <div className="space-y-4 pt-4 border-t border-[#E5E8EB]">
              <h3 className="text-base font-semibold text-[#111827]">Packaging Information</h3>
              
              <div className="space-y-2">
                <Label>Packaging Type</Label>
                <Select
                  value={watch('packagingType')}
                  onValueChange={(value) => setValue('packagingType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select packaging type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="box">Box</SelectItem>
                    <SelectItem value="poly-bag">Poly Bag</SelectItem>
                    <SelectItem value="bubble-wrap">Bubble Wrap</SelectItem>
                    <SelectItem value="carton">Carton</SelectItem>
                    <SelectItem value="shrink-wrap">Shrink Wrap</SelectItem>
                    <SelectItem value="eco-friendly">Eco-Friendly</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="packagingDetails">Packaging Details (Optional)</Label>
                <Textarea
                  id="packagingDetails"
                  placeholder="Describe the packaging, materials used, sustainability aspects..."
                  rows={3}
                  {...register('packagingDetails')}
                />
              </div>
            </div>

            {/* Usage & Care Instructions */}
            <div className="space-y-4 pt-4 border-t border-[#E5E8EB]">
              <h3 className="text-base font-semibold text-[#111827]">Usage & Care Instructions</h3>
              
              <div className="space-y-2">
                <Label htmlFor="usageInstructions">Usage Instructions (Optional)</Label>
                <Textarea
                  id="usageInstructions"
                  placeholder="How to use this product? Step-by-step instructions..."
                  rows={4}
                  {...register('usageInstructions')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="careInstructions">Care & Maintenance Instructions (Optional)</Label>
                <Textarea
                  id="careInstructions"
                  placeholder="How to clean, maintain, or store this product?"
                  rows={3}
                  {...register('careInstructions')}
                />
              </div>
            </div>

            {/* Legal & Safety */}
            <div className="space-y-4 pt-4 border-t border-[#E5E8EB]">
              <h3 className="text-base font-semibold text-[#111827]">Legal & Safety Information</h3>
              
              <div className="space-y-2">
                <Label htmlFor="safetyWarnings">Safety Warnings (Optional)</Label>
                <Textarea
                  id="safetyWarnings"
                  placeholder="Any safety warnings, age restrictions, or hazard information..."
                  rows={3}
                  {...register('safetyWarnings')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="legalCompliance">Legal Compliance (Optional)</Label>
                <Textarea
                  id="legalCompliance"
                  placeholder="Compliance standards (ISO, CE, FDA, etc.), regulations met..."
                  rows={2}
                  {...register('legalCompliance')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="certifications">Certifications (Optional)</Label>
                <Input
                  id="certifications"
                  placeholder="e.g., ISO 9001, CE Mark, FDA Approved (comma separated)"
                  {...register('certifications')}
                />
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2 pt-4 border-t border-[#E5E8EB]">
              <Label htmlFor="tags">
                <Tag className="w-4 h-4 inline mr-2" />
                Product Tags (Optional)
              </Label>
              <Input
                id="tags"
                placeholder="eco-friendly, handmade, premium, limited-edition (comma separated)"
                {...register('tags')}
              />
              <p className="text-xs text-[#6B7A99]">Add tags to help customers find your product</p>
            </div>

            {/* Additional Info */}
            <div className="space-y-2">
              <Label htmlFor="additionalInfo">Additional Information (Optional)</Label>
              <Textarea
                id="additionalInfo"
                placeholder="Any other technical or important details..."
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

// Go Live Step – Product Images, Size Chart, Listing Period (from bxi-dashboard GoLive)
const MEDIA_CATEGORIES = ['mediaonline', 'mediaoffline'];
const RESTRICTED_ASPECT_CATEGORIES = ['textile', 'officesupply', 'lifestyle', 'others'];

export const GoLive = ({ category }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const [files, setFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [sizechart, setSizechart] = useState(null);
  const [sizeChartPreview, setSizeChartPreview] = useState(null);
  const [listPeriod, setListPeriod] = useState('');
  const [productData, setProductData] = useState(null);
  const [selectedPreviewImage, setSelectedPreviewImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState(null);
  const inputRef = React.useRef(null);
  const sizechartRef = React.useRef(null);

  const isMediaCategory = MEDIA_CATEGORIES.includes(category);
  const requiresListingPeriod = !isMediaCategory;
  const hasRestrictedAspect = RESTRICTED_ASPECT_CATEGORIES.includes(category);

  const isVoucherDesignStep = location.pathname.includes('voucherdesign');
  const stepKey = isVoucherDesignStep ? 'voucherDesign' : 'goLive';
  const { prev: prevStepPath } = getPrevNextStepPaths(category, stepKey, location?.pathname);
  const goLiveBackPath = prevStepPath || 'tech-info';

  useEffect(() => {
    if (!id) return;
    productApi.getProductById(id)
      .then((res) => {
        const data = res?.data?.body ?? res?.data ?? res;
        setProductData(data);
        if (data?.listperiod) setListPeriod(String(data.listperiod));
        if (data?.ProductImages?.[0]?.url && !selectedPreviewImage) setSelectedPreviewImage(data.ProductImages[0].url);
      })
      .catch(() => setProductData(null));
  }, [id]);

  useEffect(() => {
    if (isMediaCategory) setListPeriod('1');
  }, [isMediaCategory]);

  const processFiles = (newFiles) => {
    const valid = Array.from(newFiles).filter((f) => f.type?.startsWith('image/'));
    if (valid.length === 0) return;

    const toAdd = valid.filter((f) => !files.some((p) => p.name === f.name));
    if (toAdd.length < valid.length) {
      toast.error('Duplicate files are not allowed');
      return;
    }
    const nextFiles = [...files, ...toAdd];
    if (nextFiles.length > 6) {
      toast.error('Maximum 6 images allowed');
      return;
    }

    setFiles(nextFiles);
    const added = toAdd.map((f) => ({ file: f, preview: URL.createObjectURL(f) }));
    setImagePreviews((p) => [...p, ...added]);
    if (!selectedPreviewImage && added[0]) setSelectedPreviewImage(added[0].preview);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const dropped = e.dataTransfer?.files;
    if (dropped?.length) processFiles(Array.from(dropped));
  };

  const handleFileChange = (e) => {
    const selected = e.target.files;
    if (selected?.length) processFiles(Array.from(selected));
  };

  const handleDeleteFile = (idx) => {
    const prev = imagePreviews[idx];
    if (prev?.preview?.startsWith('blob:')) URL.revokeObjectURL(prev.preview);
    setFiles((f) => f.filter((_, i) => i !== idx));
    setImagePreviews((p) => p.filter((_, i) => i !== idx));
    if (selectedPreviewImage === prev?.preview && imagePreviews.length > 1) {
      const next = imagePreviews[idx === 0 ? 1 : 0];
      setSelectedPreviewImage(next?.preview || productData?.ProductImages?.[0]?.url);
    } else if (imagePreviews.length === 1) {
      setSelectedPreviewImage(productData?.ProductImages?.[0]?.url || null);
    }
  };

  const handleSizeChartChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Size chart max 5MB');
      return;
    }
    setSizechart(file);
    const reader = new FileReader();
    reader.onloadend = () => setSizeChartPreview(reader.result);
    reader.readAsDataURL(file);
    if (sizechartRef.current) sizechartRef.current.value = '';
  };

  const handleSizeChartDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer?.files?.[0];
    if (f) handleSizeChartChange({ target: { files: [f] } });
  };

  const previewImagesArray = [
    ...imagePreviews.map((p) => p.preview),
    ...(productData?.ProductImages || []).map((img) => img.url).filter(Boolean),
  ].filter((v, i, a) => a.indexOf(v) === i);
  const previewPrice = productData?.ProductsVariantions?.[0]?.DiscountedPrice ?? productData?.ProductsVariantions?.[0]?.PricePerUnit ?? 0;

  const handleGoToPreview = async (e) => {
    e.preventDefault();
    setUploadError(null);
    const totalImages = files.length + (productData?.ProductImages?.length || 0);
    if (totalImages < 3) {
      toast.error('Please upload at least 3 images');
      return;
    }
    if (files.length > 6) {
      toast.error('Maximum 6 images allowed');
      return;
    }
    if (requiresListingPeriod) {
      const val = listPeriod?.toString()?.trim();
      if (!val && !productData?.listperiod) {
        toast.error('Please enter the listing period (days)');
        return;
      }
      const num = parseInt(val || productData?.listperiod || '0', 10);
      if (num < 1 || num > 365) {
        toast.error('Listing period must be between 1 and 365 days');
        return;
      }
      if (productData?.ManufacturingData && productData?.ExpiryDate) {
        const mfg = new Date(productData.ManufacturingData);
        const exp = new Date(productData.ExpiryDate);
        const maxDays = Math.round((exp - mfg) / (1000 * 3600 * 24));
        if (num > maxDays) {
          toast.error(`Listing period cannot exceed ${maxDays} days (manufacturing to expiry)`);
          return;
        }
      }
    }
    for (const f of files) {
      if (!f.type?.startsWith('image/')) {
        toast.error('Only image files are allowed');
        return;
      }
    }
    const formData = new FormData();
    formData.append('id', id);
    formData.append('ProductUploadStatus', 'golive');
    formData.append('listperiod', listPeriod || (isMediaCategory ? '1' : '') || productData?.listperiod || '70');
    formData.append('ListingType', productData?.ListingType || 'Product');
    formData.append('productName', productData?.ProductName || '');
    formData.append('productSubCategory', productData?.ProductSubCategory || '');
    formData.append('productDescription', productData?.ProductDescription || '');
    files.forEach((f) => formData.append('files', f));
    if (sizechart) formData.append('sizechart', sizechart);

    setIsUploading(true);
    setUploadProgress(0);
    try {
      await productApi.productMutationFormData(formData, (ev) => {
        if (ev.total) setUploadProgress(Math.round((ev.loaded * 100) / ev.total));
      });
      toast.success('Images uploaded! Redirecting to preview.');
      if (isMediaCategory) {
        navigate(`/mediaonlineproductpreview/${id}`);
      } else {
        navigate(`/allproductpreview/${id}`);
      }
    } catch (err) {
      setUploadError(err?.response?.data?.message || err?.message || 'Upload failed. Please try again.');
      toast.error('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] py-8" data-testid="go-live-page">
      <div className="form-container max-w-6xl">
        <Stepper currentStep={4} completedSteps={[1, 2, 3]} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="form-section">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <h2 className="form-section-title text-[#C64091]">Go Live - Product Images</h2>
                  <p className="text-sm text-[#6B7A99] mt-1">Upload high-quality product images to showcase your product</p>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button type="button" className="text-[#6B7A99] hover:text-[#C64091]">
                        <Info className="w-5 h-5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Go to preview makes your product available for purchase by other members.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <form onSubmit={handleGoToPreview} className="space-y-6">
                <div>
                  <Label className="text-base font-semibold">
                    Product Images <span className="text-red-500">*</span>
                  </Label>
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    onClick={() => !isProcessing && inputRef.current?.click()}
                    className={cn(
                      'mt-2 border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all',
                      'border-[#C64091] bg-white hover:bg-[#FCE7F3]',
                      isProcessing && 'opacity-70 pointer-events-none'
                    )}
                  >
                    <CloudUpload className="w-16 h-16 mx-auto text-[#C64091] mb-3" />
                    <p className="font-semibold text-[#C64091]">Drag & Drop images here</p>
                    <p className="text-sm text-[#6B7A99] mt-1">or <span className="text-[#C64091] font-semibold underline">browse files</span> (Select multiple)</p>
                    <div className="flex flex-wrap justify-center gap-2 mt-3">
                      <span className="px-2 py-1 rounded bg-[#FCE7F3] text-[#C64091] text-xs">JPEG, PNG, GIF</span>
                      <span className="px-2 py-1 rounded bg-[#FCE7F3] text-[#C64091] text-xs">Max 10MB</span>
                      <span className="px-2 py-1 rounded bg-[#FCE7F3] text-[#C64091] text-xs">
                        {hasRestrictedAspect ? '4:3, 3:2, 16:9' : '4:3, 3:2, 16:9 or 32:9'}
                      </span>
                    </div>
                    <input
                      ref={inputRef}
                      type="file"
                      multiple
                      accept="image/png,image/jpeg,image/gif,image/webp,image/jpg"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>

                  {uploadError && (
                    <div className="mt-4 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                      {uploadError}
                    </div>
                  )}

                  {(files.length > 0 || imagePreviews.length > 0) && (
                    <div className="mt-6">
                      <Label className="text-base font-semibold">Uploaded Images ({imagePreviews.length})</Label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-3">
                        {imagePreviews.map((item, idx) => (
                          <div
                            key={idx}
                            className={cn(
                              'relative rounded-lg overflow-hidden border-2 transition-all',
                              selectedPreviewImage === item.preview ? 'border-[#C64091]' : 'border-gray-200'
                            )}
                          >
                            <div className="aspect-[3/4] bg-gray-100 flex items-center justify-center">
                              <img src={item.preview} alt={`Preview ${idx + 1}`} className="w-full h-full object-contain" />
                            </div>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); handleDeleteFile(idx); }}
                              className="absolute top-2 right-2 p-1.5 rounded bg-white/90 text-red-500 hover:bg-red-500 hover:text-white"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            {selectedPreviewImage === item.preview && (
                              <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-[#C64091] text-white text-xs font-medium">Preview</span>
                            )}
                            <div
                              className="absolute inset-0 cursor-pointer"
                              onClick={() => setSelectedPreviewImage(item.preview)}
                            />
                            <p className="text-xs truncate px-2 py-1 bg-white">{item.file?.name}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {!isMediaCategory && (
                    <>
                      <div className="mt-8">
                        <Label className="text-base font-semibold">Size Chart & Additional Documents</Label>
                        <div
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={handleSizeChartDrop}
                          onClick={() => sizechartRef.current?.click()}
                          className="mt-2 border-2 border-dashed border-[#C64091] rounded-xl p-6 text-center cursor-pointer hover:bg-[#FCE7F3] transition-all"
                        >
                          {sizechart ? (
                            <div className="flex items-center justify-center gap-2">
                              <ImageIcon className="w-10 h-10 text-[#C64091]" />
                              <span className="font-semibold text-[#C64091]">{sizechart.name}</span>
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setSizechart(null); setSizeChartPreview(null); }}
                                className="p-1 text-red-500 hover:bg-red-50 rounded"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <>
                              <ImageIcon className="w-12 h-12 mx-auto text-[#C64091] mb-2" />
                              <p className="font-semibold text-[#C64091]">Upload Size Chart / Dimensions</p>
                              <p className="text-xs text-[#6B7A99] mt-1">JPG, PNG, JPEG, WEBP, SVG (Max 5 MB)</p>
                            </>
                          )}
                          <input ref={sizechartRef} type="file" accept=".png,.jpeg,.jpg,.webp,.svg" onChange={handleSizeChartChange} className="hidden" />
                        </div>
                      </div>

                      {requiresListingPeriod && (
                        <div className="mt-6">
                          <Label className="text-base font-semibold">
                            Listing Period <span className="text-red-500">*</span>
                          </Label>
                          <div className="flex items-center gap-2 mt-2 max-w-[300px]">
                            <Input
                              type="number"
                              min={1}
                              max={365}
                              placeholder="70"
                              value={listPeriod}
                              onChange={(e) => {
                                const v = e.target.value.replace(/\D/g, '');
                                const n = parseInt(v, 10);
                                if (v === '' || (n >= 1 && n <= 365)) setListPeriod(v);
                              }}
                              className="text-center font-semibold text-[#C64091]"
                            />
                            <span className="text-sm text-[#6B7A99] py-2 px-3 bg-gray-100 rounded">Days</span>
                          </div>
                          <p className="text-xs text-[#6B7A99] mt-1">Maximum 365 days</p>
                        </div>
                      )}
                    </>
                  )}

                  {isUploading && (
                    <div className="mt-4">
                      <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                        <div className="h-full bg-[#C64091] transition-all" style={{ width: `${uploadProgress}%` }} />
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between pt-6 border-t border-gray-200">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate(`/${category}/${goLiveBackPath}${id ? `/${id}` : ''}`)}
                      data-testid="btn-back"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={isUploading}
                      className="bg-[#C64091] hover:bg-[#A03375]"
                      data-testid="btn-go-preview"
                    >
                      {isUploading ? `Uploading ${uploadProgress}%...` : 'Go to Preview'}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="form-section sticky top-6">
              <h3 className="font-semibold text-[#111827] mb-4">Marketplace Preview</h3>
              <div className="rounded-xl border border-gray-200 overflow-hidden bg-white">
                <div className="aspect-square bg-gray-100 flex items-center justify-center">
                  <img
                    src={selectedPreviewImage || productData?.ProductImages?.[0]?.url || 'https://via.placeholder.com/300'}
                    alt="Preview"
                    className="w-full h-full object-contain"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/300'; }}
                  />
                </div>
                <div className="p-4">
                  <p className="font-semibold text-[#111827] truncate">{productData?.ProductName || 'Product Name'}</p>
                  <p className="text-[#C64091] font-bold mt-1">₹{previewPrice || 0}</p>
                </div>
              </div>
              <div className="mt-4 p-4 rounded-lg bg-[#F8F9FA]">
                <p className="text-sm font-semibold text-[#6B7A99] mb-1">Tip</p>
                <p className="text-xs text-[#6B7A99]">
                  Upload multiple images to see them in a carousel. Click any uploaded image to set it as the preview.
                </p>
              </div>
            </div>
          </div>
        </div>

        {(productData?.ProductImages?.length > 0 || sizeChartPreview) && (
          <div className="mt-8 form-section">
            <h3 className="font-semibold text-[#111827] mb-4">Previously Uploaded</h3>
            {productData?.ProductImages?.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                {productData.ProductImages.map((img, i) => (
                  <div
                    key={i}
                    className="rounded-lg overflow-hidden border cursor-pointer hover:border-[#C64091]"
                    onClick={() => setSelectedPreviewImage(img.url)}
                  >
                    <img src={img.url} alt={`Previous ${i + 1}`} className="w-full aspect-square object-contain bg-gray-50" />
                  </div>
                ))}
              </div>
            )}
            {sizeChartPreview && (
              <div className="mt-4">
                <Label className="text-sm font-semibold">Size Chart</Label>
                <img src={sizeChartPreview} alt="Size chart" className="mt-2 max-w-xs rounded border" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default { GeneralInformation, ProductInfo, TechInfo, GoLive };
