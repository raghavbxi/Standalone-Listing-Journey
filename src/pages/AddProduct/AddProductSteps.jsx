import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, ArrowRight, Save, CheckCircle2 } from 'lucide-react';
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

const SUBCATEGORY_ENDPOINTS = {
  lifestyle: 'lifestylesubcategory/lifestylegetsubcategory',
  electronics: 'electronicsubcategory/electronicssubcategory',
  officesupply: 'officesupplyubcategory/officesubcategory',
  fmcg: 'fmcgsub/Get_fmcg_subcategory',
  mobility: 'mobilitysub/mobilitysubcategory',
  restaurant: 'restaurantsub/getrestuarantsubcategory',
  others: 'OtherSub/Get_other_Sub',
  textile: 'subcategory/getsubcategory',
  mediaonline: 'mediaonlinesub/Get_media_onlinesingle',
  mediaoffline: 'mediaofflinesub/Get_media_offlinesingle',
  hotels: 'hotelsub/Get_hotel_subcategory',
};

const PRODUCT_TYPE_BY_CATEGORY = {
  textile: 'Textile',
  electronics: 'Electronics',
  officesupply: 'Office Supply',
  fmcg: 'FMCG',
  mobility: 'Mobility',
  restaurant: 'QSR',
  others: 'Others',
  lifestyle: 'Lifestyle',
  mediaonline: 'Media',
  mediaoffline: 'Media',
  hotels: 'Hotel',
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

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    defaultValues: {
      productName: '',
      subcategory: '',
      description: '',
      listingType: 'Product',
    }
  });

  const categoryLabel = category?.charAt(0).toUpperCase() + category?.slice(1) || 'Product';
  const selectedSubcategory = watch('subcategory');

  useEffect(() => {
    const endpoint = SUBCATEGORY_ENDPOINTS[category];
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
          const options = getSubcategoryOptions(res?.data);
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
      const payload = {
        ProductName: data.productName,
        ProductDescription: data.description,
        ProductUploadStatus: 'productinformation',
        ListingType: data.listingType || 'Product',
        ProductType:
          PRODUCT_TYPE_BY_CATEGORY[category] || categoryLabel || 'Others',
        ProductSubCategory: normalizedSubcategory,
        ProductSubCategoryName: normalizedSubcategory,
        Gender: category === 'textile' ? selectedGender : undefined,
        gender: category === 'textile' ? selectedGender : undefined,
      };
      if (id) {
        await productApi.updateProduct({ _id: id, ...payload });
        toast.success('General information updated!');
      } else {
        const res = await productApi.createProduct(payload);
        const created =
          res?.data?.body ||
          res?.data?.data ||
          res?.data?.product ||
          res?.data;

        // BXI ApiWrapper may return ValidationError in body with 200 status.
        if (created?.name === 'ValidationError' || created?.errors) {
          const firstError = created?.errors
            ? Object.values(created.errors)?.[0]?.message
            : null;
          throw new Error(firstError || created?.message || 'Validation failed');
        }

        productId =
          created?._id ||
          created?.id ||
          created?.product?._id ||
          created?.ProductData?._id;

        // Fallback: fetch latest draft for this user session and pick first item
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
      navigate(`/${category}/product-info/${productId}`);
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

            {/* Listing Type */}
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

            {/* Subcategory */}
            <div className="space-y-2">
              {category === 'textile' && genderCategoryData.length > 0 && (
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

// Product Information Step
export const ProductInfo = ({ category }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue } = useForm({
    defaultValues: {
      price: '',
      discountedPrice: '',
      minOrderQty: '1',
      maxOrderQty: '',
      gst: '18',
    }
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      console.log('Product Info:', data);
      toast.success('Product information saved!');
      
      const nextPath = id 
        ? `/${category}/tech-info/${id}` 
        : `/${category}/tech-info`;
      navigate(nextPath);
    } catch (error) {
      toast.error('Failed to save. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] py-8" data-testid="product-info-page">
      <div className="form-container">
        <Stepper currentStep={2} completedSteps={[1]} />

        <div className="form-section">
          <h2 className="form-section-title">Product Information</h2>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Price */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="price">
                  Price (₹) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="0.00"
                  {...register('price', { required: 'Price is required', min: 0 })}
                  className={errors.price ? 'border-red-500' : ''}
                  data-testid="input-price"
                />
                {errors.price && (
                  <p className="text-sm text-red-500">{errors.price.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="discountedPrice">Discounted Price (₹)</Label>
                <Input
                  id="discountedPrice"
                  type="number"
                  placeholder="0.00"
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

            {/* GST */}
            <div className="space-y-2">
              <Label>GST Rate (%)</Label>
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

            {/* Actions */}
            <div className="flex justify-between pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/${category}/general-info${id ? `/${id}` : ''}`)}
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

// Technical Information Step
export const TechInfo = ({ category }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue } = useForm({
    defaultValues: {
      weight: '',
      dimensions: '',
      material: '',
      warranty: '',
      additionalInfo: '',
    }
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      console.log('Tech Info:', data);
      toast.success('Technical information saved!');
      
      const nextPath = id 
        ? `/${category}/go-live/${id}` 
        : `/${category}/go-live`;
      navigate(nextPath);
    } catch (error) {
      toast.error('Failed to save. Please try again.');
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
                onClick={() => navigate(`/${category}/product-info${id ? `/${id}` : ''}`)}
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

// Go Live Step
export const GoLive = ({ category }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreed, setAgreed] = useState(false);

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
                onClick={() => navigate(`/${category}/tech-info${id ? `/${id}` : ''}`)}
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
