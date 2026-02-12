import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowRight, Info } from 'lucide-react';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../components/ui/tooltip';
import { toast } from 'sonner';
import api from '../../utils/api';

const schema = z.object({
  subcategory: z.string().min(1, 'Subcategory is required'),
  productname: z.string().min(5, 'Minimum 5 characters').max(50, 'Maximum 50 characters'),
  productsubtitle: z.string().min(10, 'Minimum 10 characters').max(75, 'Maximum 75 characters'),
  productdescription: z.string().min(20, 'Minimum 20 characters').max(1000, 'Maximum 1000 characters'),
});

export default function MediaGeneralInfo() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productData, setProductData] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      subcategory: '',
      productname: '',
      productsubtitle: '',
      productdescription: '',
    },
  });

  const selectedSubcategory = watch('subcategory');

  // Fetch subcategories
  useEffect(() => {
    const fetchSubcategories = async () => {
      try {
        const res = await api.get('/mediaonlinesub/Get_media_onlinesingle');
        const data = res?.data || [];
        setSubcategories(data);
      } catch (error) {
        toast.error('Failed to load subcategories');
      } finally {
        setLoading(false);
      }
    };
    fetchSubcategories();
  }, []);

  // Fetch existing product data if editing
  useEffect(() => {
    const fetchProduct = async () => {
      const productId = id || location?.state?.id;
      if (!productId) return;
      
      try {
        const res = await api.get(`/product/get_product_byId/${productId}`);
        const data = res?.data;
        setProductData(data);
        if (data) {
          setValue('subcategory', data.ProductSubCategory || '');
          setValue('productname', data.ProductName || '');
          setValue('productsubtitle', data.ProductSubtitle || '');
          setValue('productdescription', data.ProductDescription || '');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      }
    };
    fetchProduct();
  }, [id, location?.state?.id, setValue]);

  const getSubcategoryName = (subcategoryId) => {
    const found = subcategories.find((item) => item._id === subcategoryId);
    return found?.Mediaonlinecategorysingle || '';
  };

  const onSubmit = async (data) => {
    if (!data.subcategory) {
      toast.error('Please select a subcategory');
      return;
    }

    setIsSubmitting(true);
    try {
      const subcategoryName = getSubcategoryName(data.subcategory);
      const productId = id || location?.state?.id;

      const payload = {
        ProductName: data.productname,
        ProductSubtitle: data.productsubtitle,
        ProductDescription: data.productdescription,
        ProductSubCategory: data.subcategory,
        id: productId,
        ProductUploadStatus: 'productinformation',
        ListingType: 'Media',
        ProductCategoryName:
          subcategoryName === 'Multiplex ADs' || data.subcategory === '643cda0c53068696706e3951'
            ? 'Multiplex ADs'
            : 'MediaOnline',
        ProductSubCategoryName: subcategoryName,
      };

      const res = await api.post('/product/product_mutation', payload);
      const responseData = res?.data;

      toast.success('General information saved!');

      // Route based on subcategory
      if (responseData?.ProductSubCategoryName === 'Digital ADs') {
        navigate(`/mediaonline/mediaonlinedigitalscreensinfo/${responseData._id}`);
      } else if (responseData?.ProductCategoryName === 'Multiplex ADs') {
        navigate(`/mediaonline/mediaonlinemultiplexproductinfo/${responseData._id}`);
      } else {
        navigate(`/mediaonline/product-info/${responseData._id}`);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to save. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel?')) {
      navigate('/sellerhub');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] py-8 flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] py-8">
      <div className="form-container">
        <div className="form-section">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="form-section-title">General Information - Media Online</h2>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button type="button" className="text-[#6B7A99] hover:text-[#C64091]">
                    <Info className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>General Information refers to broad and fundamental knowledge or facts about a particular Media. It includes Basic details, features, or descriptions that will provide overview to the Buyer.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
            {/* Subcategory */}
            <div className="space-y-2">
              <Label htmlFor="subcategory">
                Subcategory <span className="text-red-500">*</span>
              </Label>
              {productData?.ProductSubCategory && (
                <p className="text-sm text-[#6B7A99]">
                  Selected: <span className="text-[#C64091] font-medium">{getSubcategoryName(productData.ProductSubCategory)}</span>
                </p>
              )}
              <Select
                value={selectedSubcategory}
                onValueChange={(value) => setValue('subcategory', value, { shouldValidate: true })}
              >
                <SelectTrigger id="subcategory" className={errors.subcategory ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select subcategory" />
                </SelectTrigger>
                <SelectContent>
                  {subcategories
                    .sort((a, b) =>
                      a.Mediaonlinecategorysingle.toLowerCase().localeCompare(
                        b.Mediaonlinecategorysingle.toLowerCase()
                      )
                    )
                    .map((item) => (
                      <SelectItem key={item._id} value={item._id}>
                        {item.Mediaonlinecategorysingle}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {errors.subcategory && (
                <p className="text-sm text-red-500">{errors.subcategory.message}</p>
              )}
            </div>

            {/* Product Name */}
            <div className="space-y-2">
              <Label htmlFor="productname">
                Product Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="productname"
                placeholder="Eg. Cafe coffee Day Juhu (8 keywords max)"
                {...register('productname')}
                className={errors.productname ? 'border-red-500' : ''}
                onKeyDown={(e) => {
                  if (e.key === ' ' && e.target.selectionStart === 0) {
                    e.preventDefault();
                  }
                }}
              />
              {errors.productname && (
                <p className="text-sm text-red-500">{errors.productname.message}</p>
              )}
            </div>

            {/* Subtitle */}
            <div className="space-y-2">
              <Label htmlFor="productsubtitle">
                Subtitle <span className="text-red-500">*</span>
              </Label>
              <Input
                id="productsubtitle"
                placeholder="Eg. Digital Ads inside cafe on 64 inch TV (24 keywords max)"
                {...register('productsubtitle')}
                className={errors.productsubtitle ? 'border-red-500' : ''}
                onKeyDown={(e) => {
                  if (e.key === ' ' && e.target.selectionStart === 0) {
                    e.preventDefault();
                  }
                }}
              />
              {errors.productsubtitle && (
                <p className="text-sm text-red-500">{errors.productsubtitle.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="productdescription">
                Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="productdescription"
                placeholder="Eg. Big Brands Need Big digital 64 inch Screens, strategically placed inside cafeteria at a prominent location..."
                rows={5}
                {...register('productdescription')}
                className={errors.productdescription ? 'border-red-500' : ''}
                onKeyDown={(e) => {
                  if (e.key === ' ' && e.target.selectionStart === 0) {
                    e.preventDefault();
                  }
                }}
              />
              {errors.productdescription && (
                <p className="text-sm text-red-500">{errors.productdescription.message}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-between pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#C64091] hover:bg-[#A03375]"
              >
                {isSubmitting ? 'Saving...' : 'Next'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
