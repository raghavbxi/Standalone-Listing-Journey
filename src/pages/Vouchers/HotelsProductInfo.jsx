import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowRight, Plus, Trash2, Tag } from 'lucide-react';
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
import { Checkbox } from '../../components/ui/checkbox';
import { toast } from 'sonner';
import api, { productApi } from '../../utils/api';

const MEAL_PLANS = [
  { value: 'EP', label: 'EP (European Plan - Room Only)' },
  { value: 'CP', label: 'CP (Continental Plan - Room + Breakfast)' },
  { value: 'MAP', label: 'MAP (Modified American Plan - Room + Breakfast + Dinner)' },
  { value: 'AP', label: 'AP (American Plan - Room + All Meals)' },
];

const ROOM_TYPES = [
  'Standard Room',
  'Deluxe Room',
  'Suite',
  'Executive Suite',
  'Presidential Suite',
  'Twin Sharing',
  'Double Occupancy',
  'Single Occupancy',
];

const AMENITIES = [
  'WiFi',
  'Swimming Pool',
  'Gym/Fitness Center',
  'Spa',
  'Restaurant',
  'Bar',
  'Room Service',
  'Parking',
  'Airport Transfer',
  'Laundry Service',
  'Conference Room',
  'Kids Play Area',
];

const schema = z.object({
  numberOfNights: z.number().min(1, 'Minimum 1 night').max(365, 'Maximum 365 nights'),
  roomType: z.string().min(1, 'Room type is required'),
  mealPlan: z.string().min(1, 'Meal plan is required'),
  numberOfGuests: z.number().min(1, 'Minimum 1 guest').max(20, 'Maximum 20 guests'),
  checkInTime: z.string().min(1, 'Check-in time is required'),
  checkOutTime: z.string().min(1, 'Check-out time is required'),
  hotelAddress: z.string().min(10, 'Minimum 10 characters').max(500, 'Maximum 500 characters'),
  tags: z.string().optional(),
});

export default function HotelsProductInfo({ category }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [productData, setProductData] = useState(null);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [variations, setVariations] = useState([]);
  const [currentVariation, setCurrentVariation] = useState({
    price: '',
    discountedPrice: '',
    minOrderQty: '1',
    maxOrderQty: '',
    gst: '',
  });

  const prevPath = 'general-information';
  const nextPath = 'vouchertechinfo';

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      numberOfNights: 1,
      roomType: '',
      mealPlan: '',
      numberOfGuests: 2,
      checkInTime: '14:00',
      checkOutTime: '11:00',
      hotelAddress: '',
      tags: '',
    },
  });

  // Fetch product data
  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      try {
        const res = await productApi.getProductById(id);
        setProductData(res?.data);
        
        // Pre-fill if data exists
        if (res?.data?.HotelDetails) {
          const hotelDetails = JSON.parse(res.data.HotelDetails);
          setValue('numberOfNights', hotelDetails.numberOfNights);
          setValue('roomType', hotelDetails.roomType);
          setValue('mealPlan', hotelDetails.mealPlan);
          setValue('numberOfGuests', hotelDetails.numberOfGuests);
          setValue('checkInTime', hotelDetails.checkInTime);
          setValue('checkOutTime', hotelDetails.checkOutTime);
          setValue('hotelAddress', hotelDetails.hotelAddress);
          setSelectedAmenities(hotelDetails.amenities || []);
        }
        
        if (res?.data?.ProductsVariantions) {
          setVariations(res.data.ProductsVariantions);
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

  const handleAmenityToggle = (amenity) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const handleAddVariation = () => {
    if (!currentVariation.price) {
      toast.error('Price is required');
      return;
    }

    const price = parseFloat(currentVariation.price);
    const discountedPrice = currentVariation.discountedPrice
      ? parseFloat(currentVariation.discountedPrice)
      : null;

    if (discountedPrice && discountedPrice >= price) {
      toast.error('Discounted price must be less than price');
      return;
    }

    const newVariation = {
      ProductPrice: price,
      ProductDiscountedPrice: discountedPrice,
      MinOrderQuantity: parseInt(currentVariation.minOrderQty) || 1,
      MaxOrderQuantity: currentVariation.maxOrderQty ? parseInt(currentVariation.maxOrderQty) : null,
      ProductGST: currentVariation.gst ? parseFloat(currentVariation.gst) : 0,
    };

    setVariations([...variations, newVariation]);
    setCurrentVariation({
      price: '',
      discountedPrice: '',
      minOrderQty: '1',
      maxOrderQty: '',
      gst: '',
    });
    toast.success('Variation added');
  };

  const handleRemoveVariation = (index) => {
    setVariations(variations.filter((_, i) => i !== index));
    toast.success('Variation removed');
  };

  const onSubmit = async (data) => {
    if (!id) {
      toast.error('Product ID missing');
      return;
    }

    if (variations.length === 0) {
      toast.error('Please add at least one pricing variation');
      return;
    }

    if (selectedAmenities.length === 0) {
      toast.error('Please select at least one amenity');
      return;
    }

    setIsSubmitting(true);
    try {
      const hotelDetails = {
        numberOfNights: data.numberOfNights,
        roomType: data.roomType,
        mealPlan: data.mealPlan,
        numberOfGuests: data.numberOfGuests,
        checkInTime: data.checkInTime,
        checkOutTime: data.checkOutTime,
        hotelAddress: data.hotelAddress,
        amenities: selectedAmenities,
      };

      const tags = data.tags
        ? data.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : [];

      await api.post('/product/product_mutation', {
        _id: id,
        ProductUploadStatus: 'vouchertechinfo',
        HotelDetails: JSON.stringify(hotelDetails),
        ProductsVariantions: variations,
        ProductTags: tags,
      });

      toast.success('Hotel details saved!');
      navigate(`/${category}/${nextPath}/${id}`);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to save. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] py-8">
      <div className="form-container">
        <div className="form-section">
          <h2 className="form-section-title">Hotel Voucher Information</h2>
          <p className="text-sm text-[#6B7A99] mb-6">
            Provide hotel-specific details for your voucher
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Hotel Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="numberOfNights">
                  Number of Nights <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="numberOfNights"
                  type="number"
                  {...register('numberOfNights', { valueAsNumber: true })}
                  className={errors.numberOfNights ? 'border-red-500' : ''}
                />
                {errors.numberOfNights && (
                  <p className="text-sm text-red-500">{errors.numberOfNights.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="numberOfGuests">
                  Number of Guests <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="numberOfGuests"
                  type="number"
                  {...register('numberOfGuests', { valueAsNumber: true })}
                  className={errors.numberOfGuests ? 'border-red-500' : ''}
                />
                {errors.numberOfGuests && (
                  <p className="text-sm text-red-500">{errors.numberOfGuests.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="roomType">
                  Room Type <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={watch('roomType')}
                  onValueChange={(value) => setValue('roomType', value)}
                >
                  <SelectTrigger className={errors.roomType ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select room type" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROOM_TYPES.map((room) => (
                      <SelectItem key={room} value={room}>{room}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.roomType && (
                  <p className="text-sm text-red-500">{errors.roomType.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="mealPlan">
                  Meal Plan <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={watch('mealPlan')}
                  onValueChange={(value) => setValue('mealPlan', value)}
                >
                  <SelectTrigger className={errors.mealPlan ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select meal plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {MEAL_PLANS.map((plan) => (
                      <SelectItem key={plan.value} value={plan.value}>{plan.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.mealPlan && (
                  <p className="text-sm text-red-500">{errors.mealPlan.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="checkInTime">
                  Check-in Time <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="checkInTime"
                  type="time"
                  {...register('checkInTime')}
                  className={errors.checkInTime ? 'border-red-500' : ''}
                />
                {errors.checkInTime && (
                  <p className="text-sm text-red-500">{errors.checkInTime.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="checkOutTime">
                  Check-out Time <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="checkOutTime"
                  type="time"
                  {...register('checkOutTime')}
                  className={errors.checkOutTime ? 'border-red-500' : ''}
                />
                {errors.checkOutTime && (
                  <p className="text-sm text-red-500">{errors.checkOutTime.message}</p>
                )}
              </div>
            </div>

            {/* Hotel Address */}
            <div className="space-y-2">
              <Label htmlFor="hotelAddress">
                Hotel Address <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="hotelAddress"
                placeholder="Full address of the hotel..."
                rows={3}
                {...register('hotelAddress')}
                className={errors.hotelAddress ? 'border-red-500' : ''}
              />
              {errors.hotelAddress && (
                <p className="text-sm text-red-500">{errors.hotelAddress.message}</p>
              )}
            </div>

            {/* Amenities */}
            <div className="space-y-3">
              <Label>Amenities <span className="text-red-500">*</span></Label>
              <p className="text-xs text-[#6B7A99]">Select all amenities available with this voucher</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {AMENITIES.map((amenity) => (
                  <div key={amenity} className="flex items-center space-x-2">
                    <Checkbox
                      id={amenity}
                      checked={selectedAmenities.includes(amenity)}
                      onCheckedChange={() => handleAmenityToggle(amenity)}
                    />
                    <Label htmlFor={amenity} className="cursor-pointer font-normal text-sm">
                      {amenity}
                    </Label>
                  </div>
                ))}
              </div>
              {selectedAmenities.length === 0 && (
                <p className="text-sm text-red-500">Please select at least one amenity</p>
              )}
            </div>

            {/* Pricing Variations */}
            <div className="space-y-4 pt-4 border-t border-[#E5E8EB]">
              <h3 className="text-base font-semibold text-[#111827]">Pricing Variations</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                <div className="space-y-2">
                  <Label>Price (₹) <span className="text-red-500">*</span></Label>
                  <Input
                    type="number"
                    placeholder="1000"
                    value={currentVariation.price}
                    onChange={(e) =>
                      setCurrentVariation({ ...currentVariation, price: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Discounted Price (₹)</Label>
                  <Input
                    type="number"
                    placeholder="900"
                    value={currentVariation.discountedPrice}
                    onChange={(e) =>
                      setCurrentVariation({ ...currentVariation, discountedPrice: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Min Order Qty</Label>
                  <Input
                    type="number"
                    placeholder="1"
                    value={currentVariation.minOrderQty}
                    onChange={(e) =>
                      setCurrentVariation({ ...currentVariation, minOrderQty: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max Order Qty</Label>
                  <Input
                    type="number"
                    placeholder="100"
                    value={currentVariation.maxOrderQty}
                    onChange={(e) =>
                      setCurrentVariation({ ...currentVariation, maxOrderQty: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>GST (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="18"
                    value={currentVariation.gst}
                    onChange={(e) =>
                      setCurrentVariation({ ...currentVariation, gst: e.target.value })
                    }
                  />
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleAddVariation}
                className="border-[#C64091] text-[#C64091]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Variation
              </Button>

              {/* Variations Table */}
              {variations.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-[#F8F9FA]">
                        <th className="text-left p-3 text-sm font-semibold">Price</th>
                        <th className="text-left p-3 text-sm font-semibold">Discounted</th>
                        <th className="text-left p-3 text-sm font-semibold">Min Qty</th>
                        <th className="text-left p-3 text-sm font-semibold">Max Qty</th>
                        <th className="text-left p-3 text-sm font-semibold">GST</th>
                        <th className="text-left p-3 text-sm font-semibold">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {variations.map((v, idx) => (
                        <tr key={idx} className="border-t">
                          <td className="p-3">₹{v.ProductPrice}</td>
                          <td className="p-3">{v.ProductDiscountedPrice ? `₹${v.ProductDiscountedPrice}` : '-'}</td>
                          <td className="p-3">{v.MinOrderQuantity}</td>
                          <td className="p-3">{v.MaxOrderQuantity || '∞'}</td>
                          <td className="p-3">{v.ProductGST}%</td>
                          <td className="p-3">
                            <button
                              type="button"
                              onClick={() => handleRemoveVariation(idx)}
                              className="text-[#6B7A99] hover:text-[#C64091]"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label htmlFor="tags">
                <Tag className="w-4 h-4 inline mr-2" />
                Tags (Optional)
              </Label>
              <Input
                id="tags"
                placeholder="luxury, romantic, weekend getaway (comma separated)"
                {...register('tags')}
              />
              <p className="text-xs text-[#6B7A99]">Add tags to help customers find your voucher</p>
            </div>

            {/* Actions */}
            <div className="flex justify-between pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/${category}/${prevPath}/${id}`)}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#C64091] hover:bg-[#A03375]"
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
}
