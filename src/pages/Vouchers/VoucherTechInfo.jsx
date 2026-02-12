import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowRight, Upload, FileText, X } from 'lucide-react';
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
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { toast } from 'sonner';
import api, { productApi } from '../../utils/api';
import StateData from '../../utils/StateCityArray.json';
import { getPrevNextStepPaths } from '../../config/categoryFormConfig';

const schema = z.object({
  inclusions: z.string().min(20, 'Minimum 20 characters').max(2000, 'Maximum 2000 characters'),
  exclusions: z.string().min(20, 'Minimum 20 characters').max(2000, 'Maximum 2000 characters'),
  termsAndConditions: z.string().min(20, 'Minimum 20 characters').max(3000, 'Maximum 3000 characters'),
  redemptionSteps: z.string().min(20, 'Minimum 20 characters').max(2000, 'Maximum 2000 characters'),
  redemptionType: z.enum(['Online', 'Offline', 'Both']),
  codeGenerationType: z.enum(['BXI', 'Upload']),
  onlineRedemptionUrl: z.string().url().optional().or(z.literal('')),
});

export default function VoucherTechInfo({ category }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [productData, setProductData] = useState(null);
  const [codeFile, setCodeFile] = useState(null);
  const [storeListFile, setStoreListFile] = useState(null);
  const [offlineAddress, setOfflineAddress] = useState({
    address: '',
    area: '',
    landmark: '',
    city: '',
    state: '',
  });
  const [cities, setCities] = useState([]);
  const codeFileRef = useRef(null);
  const storeFileRef = useRef(null);

  const { prev: prevStepPath, next: nextStepPath } = getPrevNextStepPaths(category, 'techInfo');
  const prevPath = prevStepPath || 'hotelsproductinfo';
  const nextPath = 'voucherdesign';

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      inclusions: '',
      exclusions: '',
      termsAndConditions: '',
      redemptionSteps: '',
      redemptionType: 'Online',
      codeGenerationType: 'BXI',
      onlineRedemptionUrl: '',
    },
  });

  const redemptionType = watch('redemptionType');
  const codeGenerationType = watch('codeGenerationType');

  // Fetch product data
  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      try {
        const res = await productApi.getProductById(id);
        setProductData(res?.data);
      } catch (error) {
        console.error('Error fetching product:', error);
      }
    };
    fetchProduct();
  }, [id]);

  // Update cities when state changes
  useEffect(() => {
    if (offlineAddress.state) {
      const stateObj = StateData.find((s) => s.name === offlineAddress.state);
      setCities(stateObj?.data || []);
    } else {
      setCities([]);
    }
  }, [offlineAddress.state]);

  const handleCodeFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast.error('Please upload an Excel file (.xlsx or .xls)');
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }
    
    setCodeFile(file);
    toast.success('Code file added');
  };

  const handleStoreListChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast.error('Please upload an Excel file (.xlsx or .xls)');
      return;
    }
    
    setStoreListFile(file);
    toast.success('Store list file added');
  };

  const onSubmit = async (data) => {
    if (!id) {
      toast.error('Product ID missing');
      return;
    }

    // Validation for online redemption URL
    if ((redemptionType === 'Online' || redemptionType === 'Both') && !data.onlineRedemptionUrl) {
      toast.error('Online redemption URL is required');
      return;
    }

    // Validation for offline address
    if ((redemptionType === 'Offline' || redemptionType === 'Both')) {
      if (!offlineAddress.address || !offlineAddress.city || !offlineAddress.state) {
        toast.error('Complete offline address is required');
        return;
      }
    }

    // Validation for code upload
    if (codeGenerationType === 'Upload' && !codeFile) {
      toast.error('Please upload voucher codes Excel file');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('_id', id);
      formData.append('ProductUploadStatus', 'voucherdesign');
      formData.append('Inclusions', data.inclusions);
      formData.append('Exclusions', data.exclusions);
      formData.append('TermsAndConditions', data.termsAndConditions);
      formData.append('RedemptionSteps', data.redemptionSteps);
      formData.append('RedemptionType', data.redemptionType);
      formData.append('CodeGenerationType', data.codeGenerationType);

      if (data.onlineRedemptionUrl) {
        formData.append('OnlineRedemptionURL', data.onlineRedemptionUrl);
      }

      if (redemptionType === 'Offline' || redemptionType === 'Both') {
        formData.append('OfflineAddress', JSON.stringify(offlineAddress));
        if (storeListFile) {
          formData.append('storeList', storeListFile);
        }
      }

      if (codeGenerationType === 'Upload' && codeFile) {
        formData.append('voucherCodes', codeFile);
      }

      await api.post('/product/product_mutation', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Voucher technical information saved!');
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
          <h2 className="form-section-title">Voucher Technical Information</h2>
          <p className="text-sm text-[#6B7A99] mb-6">
            Provide redemption details, terms, and voucher code information
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Inclusions */}
            <div className="space-y-2">
              <Label htmlFor="inclusions">
                Inclusions <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="inclusions"
                placeholder="What's included in this voucher? (e.g., Free meal, 20% discount, complimentary services)"
                rows={4}
                {...register('inclusions')}
                className={errors.inclusions ? 'border-red-500' : ''}
              />
              {errors.inclusions && (
                <p className="text-sm text-red-500">{errors.inclusions.message}</p>
              )}
            </div>

            {/* Exclusions */}
            <div className="space-y-2">
              <Label htmlFor="exclusions">
                Exclusions <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="exclusions"
                placeholder="What's NOT included? (e.g., Alcohol, delivery charges, peak hour usage)"
                rows={4}
                {...register('exclusions')}
                className={errors.exclusions ? 'border-red-500' : ''}
              />
              {errors.exclusions && (
                <p className="text-sm text-red-500">{errors.exclusions.message}</p>
              )}
            </div>

            {/* Terms & Conditions */}
            <div className="space-y-2">
              <Label htmlFor="termsAndConditions">
                Terms & Conditions <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="termsAndConditions"
                placeholder="Complete terms and conditions for voucher usage..."
                rows={6}
                {...register('termsAndConditions')}
                className={errors.termsAndConditions ? 'border-red-500' : ''}
              />
              {errors.termsAndConditions && (
                <p className="text-sm text-red-500">{errors.termsAndConditions.message}</p>
              )}
            </div>

            {/* Redemption Steps */}
            <div className="space-y-2">
              <Label htmlFor="redemptionSteps">
                Redemption Steps <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="redemptionSteps"
                placeholder="How to redeem this voucher? (Step-by-step instructions)"
                rows={4}
                {...register('redemptionSteps')}
                className={errors.redemptionSteps ? 'border-red-500' : ''}
              />
              {errors.redemptionSteps && (
                <p className="text-sm text-red-500">{errors.redemptionSteps.message}</p>
              )}
            </div>

            {/* Redemption Type */}
            <div className="space-y-4 pt-4 border-t border-[#E5E8EB]">
              <h3 className="text-base font-semibold text-[#111827]">Redemption Details</h3>
              
              <div className="space-y-2">
                <Label>Redemption Type <span className="text-red-500">*</span></Label>
                <RadioGroup
                  value={redemptionType}
                  onValueChange={(value) => setValue('redemptionType', value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Online" id="online" />
                    <Label htmlFor="online" className="cursor-pointer font-normal">Online</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Offline" id="offline" />
                    <Label htmlFor="offline" className="cursor-pointer font-normal">Offline</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Both" id="both" />
                    <Label htmlFor="both" className="cursor-pointer font-normal">Both</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Online Redemption URL */}
              {(redemptionType === 'Online' || redemptionType === 'Both') && (
                <div className="space-y-2">
                  <Label htmlFor="onlineRedemptionUrl">
                    Online Redemption URL <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="onlineRedemptionUrl"
                    type="url"
                    placeholder="https://example.com/redeem"
                    {...register('onlineRedemptionUrl')}
                    className={errors.onlineRedemptionUrl ? 'border-red-500' : ''}
                  />
                  {errors.onlineRedemptionUrl && (
                    <p className="text-sm text-red-500">{errors.onlineRedemptionUrl.message}</p>
                  )}
                </div>
              )}

              {/* Offline Address */}
              {(redemptionType === 'Offline' || redemptionType === 'Both') && (
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-[#111827]">Offline Redemption Address</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Address <span className="text-red-500">*</span></Label>
                      <Input
                        placeholder="Street address"
                        value={offlineAddress.address}
                        onChange={(e) => setOfflineAddress({ ...offlineAddress, address: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Area <span className="text-red-500">*</span></Label>
                      <Input
                        placeholder="Area or locality"
                        value={offlineAddress.area}
                        onChange={(e) => setOfflineAddress({ ...offlineAddress, area: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Landmark</Label>
                      <Input
                        placeholder="Nearby landmark"
                        value={offlineAddress.landmark}
                        onChange={(e) => setOfflineAddress({ ...offlineAddress, landmark: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>State <span className="text-red-500">*</span></Label>
                      <Select
                        value={offlineAddress.state}
                        onValueChange={(v) => {
                          setOfflineAddress({ ...offlineAddress, state: v, city: '' });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          {StateData.map((s) => (
                            <SelectItem key={s.name} value={s.name}>{s.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>City <span className="text-red-500">*</span></Label>
                      <Select
                        value={offlineAddress.city}
                        onValueChange={(v) => setOfflineAddress({ ...offlineAddress, city: v })}
                        disabled={!offlineAddress.state}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select city" />
                        </SelectTrigger>
                        <SelectContent>
                          {cities.map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Store List Upload */}
                  <div className="space-y-2">
                    <Label>Store List (Optional)</Label>
                    <p className="text-xs text-[#6B7A99]">Upload Excel file with store locations</p>
                    <div className="flex gap-4 items-center">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => storeFileRef.current?.click()}
                        className="border-[#C64091] text-[#C64091]"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {storeListFile ? 'Change File' : 'Upload Store List'}
                      </Button>
                      {storeListFile && (
                        <div className="flex items-center gap-2 text-sm">
                          <FileText className="w-4 h-4 text-[#C64091]" />
                          <span>{storeListFile.name}</span>
                          <button
                            type="button"
                            onClick={() => setStoreListFile(null)}
                            className="text-[#6B7A99] hover:text-[#C64091]"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                    <input
                      ref={storeFileRef}
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleStoreListChange}
                      className="hidden"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Code Generation */}
            <div className="space-y-4 pt-4 border-t border-[#E5E8EB]">
              <h3 className="text-base font-semibold text-[#111827]">Voucher Code Generation</h3>
              
              <div className="space-y-2">
                <Label>Code Generation Type <span className="text-red-500">*</span></Label>
                <RadioGroup
                  value={codeGenerationType}
                  onValueChange={(value) => setValue('codeGenerationType', value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="BXI" id="bxi-generate" />
                    <Label htmlFor="bxi-generate" className="cursor-pointer font-normal">
                      BXI Will Generate Codes Automatically
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Upload" id="upload-codes" />
                    <Label htmlFor="upload-codes" className="cursor-pointer font-normal">
                      Upload Codes Now
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Code Upload */}
              {codeGenerationType === 'Upload' && (
                <div className="space-y-2">
                  <Label>Voucher Codes File <span className="text-red-500">*</span></Label>
                  <p className="text-xs text-[#6B7A99]">
                    Upload Excel with voucher codes. Must have one column per product variation.
                  </p>
                  <div className="flex gap-4 items-center">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => codeFileRef.current?.click()}
                      className="border-[#C64091] text-[#C64091]"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {codeFile ? 'Change File' : 'Upload Codes'}
                    </Button>
                    {codeFile && (
                      <div className="flex items-center gap-2 text-sm">
                        <FileText className="w-4 h-4 text-[#C64091]" />
                        <span>{codeFile.name}</span>
                        <button
                          type="button"
                          onClick={() => setCodeFile(null)}
                          className="text-[#6B7A99] hover:text-[#C64091]"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  <input
                    ref={codeFileRef}
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleCodeFileChange}
                    className="hidden"
                  />
                </div>
              )}
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
