import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, ArrowRight, Plus, X, Trash2 } from 'lucide-react';
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
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner';
import api from '../../utils/api';

export default function HoardingTechInfo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Product Features (5-20)
  const [productFeatures, setProductFeatures] = useState([]);
  const [featureName, setFeatureName] = useState('');
  const [featureDescription, setFeatureDescription] = useState('');
  
  // Tags
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  
  // Supporting Documents
  const [supportingDocs, setSupportingDocs] = useState({
    inspectionPass: false,
    pictures: false,
    logReport: false,
    exhibitionCertificate: false,
    videos: false,
    other: false,
  });
  
  // Other Costs
  const [otherCosts, setOtherCosts] = useState([]);
  const [costForm, setCostForm] = useState({
    applicableOn: 'All',
    costPrice: '',
    currencyType: '₹',
    hsn: '',
    gst: '18',
    reasonOfCost: '',
  });
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      hsnCode: '',
      gstRate: '18',
      adType: '',
      uploadLink: '',
      minOrderQuantity: '1',
      maxOrderQuantity: '1',
      minTimeslot: '',
      maxTimeslot: '',
      repetition: '',
      dimensionSize: '',
      otherInformation: '',
    },
  });

  // Add Product Feature
  const handleAddFeature = () => {
    if (!featureName.trim() || !featureDescription.trim()) {
      toast.error('Please enter both feature name and description');
      return;
    }

    if (productFeatures.length >= 20) {
      toast.error('Maximum 20 features allowed');
      return;
    }

    setProductFeatures([
      ...productFeatures,
      { name: featureName.trim(), description: featureDescription.trim() },
    ]);
    setFeatureName('');
    setFeatureDescription('');
    toast.success('Feature added');
  };

  const handleRemoveFeature = (index) => {
    setProductFeatures(productFeatures.filter((_, i) => i !== index));
  };

  // Add Tag
  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // Add Other Cost
  const handleAddOtherCost = () => {
    if (!costForm.costPrice || !costForm.reasonOfCost) {
      toast.error('Please enter cost price and reason');
      return;
    }

    setOtherCosts([...otherCosts, { ...costForm }]);
    setCostForm({
      applicableOn: 'All',
      costPrice: '',
      currencyType: '₹',
      hsn: '',
      gst: '18',
      reasonOfCost: '',
    });
    toast.success('Cost added');
  };

  const handleRemoveOtherCost = (index) => {
    setOtherCosts(otherCosts.filter((_, i) => i !== index));
  };

  const onSubmit = async (data) => {
    // Validation
    if (productFeatures.length < 5) {
      toast.error('Minimum 5 product features required');
      return;
    }

    if (productFeatures.length > 20) {
      toast.error('Maximum 20 product features allowed');
      return;
    }

    if (tags.length === 0) {
      toast.error('Please add at least one tag');
      return;
    }

    if (!data.hsnCode) {
      toast.error('HSN Code is required');
      return;
    }

    if (!data.gstRate) {
      toast.error('GST Rate is required');
      return;
    }

    if (!data.adType) {
      toast.error('Ad Type is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        _id: id,
        ProductUploadStatus: 'golive',
        ProductFeatures: productFeatures,
        ProductTags: tags,
        HSNCode: data.hsnCode,
        GST: data.gstRate,
        AdType: data.adType,
        SupportingDocuments: Object.keys(supportingDocs).filter((key) => supportingDocs[key]),
        UploadLink: data.uploadLink || '',
        MinOrderQuantity: data.minOrderQuantity,
        MaxOrderQuantity: data.maxOrderQuantity,
        MinTimeslotSeconds: data.minTimeslot || '',
        MaxTimeslotSeconds: data.maxTimeslot || '',
        Repetition: data.repetition || '',
        DimensionSize: data.dimensionSize || '',
        OtherCost: otherCosts,
        OtherInformation: data.otherInformation || '',
      };

      await api.post('/product/product_mutation_hoardings', payload);
      toast.success('Technical information saved!');
      navigate(`/mediaoffline/hoardingsgolive/${id}`);
    } catch (error) {
      console.error('Error:', error);
      toast.error(error?.response?.data?.message || 'Failed to save');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-2xl font-bold text-[#111827] mb-2">Hoarding Technical Information</h2>
          <p className="text-sm text-[#6B7A99]">
            Provide technical specifications and features
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Product Features */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-[#111827] mb-4">
              Product Features <span className="text-red-500">*</span>
              <span className="text-sm font-normal text-[#6B7A99] ml-2">
                (Minimum 5, Maximum 20) - {productFeatures.length}/20
              </span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <Label>Feature Name</Label>
                <Input
                  placeholder="e.g., High Visibility"
                  value={featureName}
                  onChange={(e) => setFeatureName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Feature Description</Label>
                <Input
                  placeholder="e.g., Located at main intersection"
                  value={featureDescription}
                  onChange={(e) => setFeatureDescription(e.target.value)}
                />
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleAddFeature}
              disabled={productFeatures.length >= 20}
              className="mb-4"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Feature
            </Button>

            {productFeatures.length > 0 && (
              <div className="space-y-2">
                {productFeatures.map((feature, idx) => (
                  <div
                    key={idx}
                    className="flex items-start justify-between p-3 border border-[#E5E8EB] rounded bg-[#F8F9FA]"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">{feature.name}</p>
                      <p className="text-xs text-[#6B7A99]">{feature.description}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(idx)}
                      className="text-[#6B7A99] hover:text-[#C64091] ml-2"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {productFeatures.length < 5 && (
              <p className="text-sm text-red-500 mt-2">
                Please add at least {5 - productFeatures.length} more feature(s)
              </p>
            )}
          </div>

          {/* HSN & GST */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-[#111827] mb-4">HSN & GST Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>
                  HSN Code <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="e.g., 998346"
                  {...register('hsnCode', { required: true })}
                  className={errors.hsnCode ? 'border-red-500' : ''}
                />
              </div>

              <div className="space-y-2">
                <Label>
                  GST Rate <span className="text-red-500">*</span>
                </Label>
                <Select value={watch('gstRate')} onValueChange={(v) => setValue('gstRate', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[0, 5, 12, 18, 28].map((rate) => (
                      <SelectItem key={rate} value={String(rate)}>
                        {rate}%
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Ad Type & Supporting Documents */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-[#111827] mb-4">
              Ad Type & Supporting Documents
            </h3>

            <div className="space-y-4 mb-6">
              <div className="space-y-2">
                <Label>
                  Ad Type <span className="text-red-500">*</span>
                </Label>
                <Select value={watch('adType')} onValueChange={(v) => setValue('adType', v)}>
                  <SelectTrigger className={errors.adType ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select ad type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Static Display">Static Display</SelectItem>
                    <SelectItem value="Digital Display">Digital Display</SelectItem>
                    <SelectItem value="LED Display">LED Display</SelectItem>
                    <SelectItem value="Vinyl Hoarding">Vinyl Hoarding</SelectItem>
                    <SelectItem value="Backlit">Backlit</SelectItem>
                    <SelectItem value="Non-Backlit">Non-Backlit</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Supporting Documents</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { key: 'inspectionPass', label: 'Inspection Pass' },
                    { key: 'pictures', label: 'Pictures' },
                    { key: 'logReport', label: 'Log Report' },
                    { key: 'exhibitionCertificate', label: 'Exhibition Certificate' },
                    { key: 'videos', label: 'Videos' },
                    { key: 'other', label: 'Other' },
                  ].map((doc) => (
                    <div key={doc.key} className="flex items-center space-x-2">
                      <Checkbox
                        id={doc.key}
                        checked={supportingDocs[doc.key]}
                        onCheckedChange={(checked) =>
                          setSupportingDocs({ ...supportingDocs, [doc.key]: checked })
                        }
                      />
                      <Label htmlFor={doc.key} className="cursor-pointer font-normal text-sm">
                        {doc.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Upload Link (Optional)</Label>
                <Input placeholder="https://..." {...register('uploadLink')} />
                <p className="text-xs text-[#6B7A99]">
                  Link to supporting documents (Google Drive, Dropbox, etc.)
                </p>
              </div>
            </div>
          </div>

          {/* Timeline & Specifications */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-[#111827] mb-4">Timeline & Specifications</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Min Order Quantity</Label>
                <Input type="number" {...register('minOrderQuantity')} />
              </div>

              <div className="space-y-2">
                <Label>Max Order Quantity</Label>
                <Input type="number" {...register('maxOrderQuantity')} />
              </div>

              <div className="space-y-2">
                <Label>Min Timeslot (Seconds)</Label>
                <Input type="number" placeholder="e.g., 10" {...register('minTimeslot')} />
              </div>

              <div className="space-y-2">
                <Label>Max Timeslot (Seconds)</Label>
                <Input type="number" placeholder="e.g., 30" {...register('maxTimeslot')} />
              </div>

              <div className="space-y-2">
                <Label>Repetition</Label>
                <Input placeholder="e.g., 5 times per day" {...register('repetition')} />
              </div>

              <div className="space-y-2">
                <Label>Dimension Size</Label>
                <Input placeholder="e.g., 20x10 feet" {...register('dimensionSize')} />
              </div>
            </div>
          </div>

          {/* Other Costs */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-[#111827] mb-4">Other Costs (Optional)</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="space-y-2">
                <Label>Applicable On</Label>
                <Select
                  value={costForm.applicableOn}
                  onValueChange={(v) => setCostForm({ ...costForm, applicableOn: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All</SelectItem>
                    <SelectItem value="Selected">Selected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Cost Price (₹)</Label>
                <Input
                  type="number"
                  placeholder="1000"
                  value={costForm.costPrice}
                  onChange={(e) => setCostForm({ ...costForm, costPrice: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>GST (%)</Label>
                <Select
                  value={costForm.gst}
                  onValueChange={(v) => setCostForm({ ...costForm, gst: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[0, 5, 12, 18, 28].map((rate) => (
                      <SelectItem key={rate} value={String(rate)}>
                        {rate}%
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-3">
                <Label>Reason of Cost</Label>
                <Input
                  placeholder="e.g., Installation charges"
                  value={costForm.reasonOfCost}
                  onChange={(e) => setCostForm({ ...costForm, reasonOfCost: e.target.value })}
                />
              </div>
            </div>

            <Button type="button" variant="outline" onClick={handleAddOtherCost}>
              <Plus className="w-4 h-4 mr-2" />
              Add Cost
            </Button>

            {otherCosts.length > 0 && (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-[#F8F9FA]">
                      <th className="text-left p-2 border">Applicable On</th>
                      <th className="text-left p-2 border">Cost (₹)</th>
                      <th className="text-left p-2 border">GST (%)</th>
                      <th className="text-left p-2 border">Reason</th>
                      <th className="text-left p-2 border">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {otherCosts.map((cost, idx) => (
                      <tr key={idx}>
                        <td className="p-2 border">{cost.applicableOn}</td>
                        <td className="p-2 border">₹{cost.costPrice}</td>
                        <td className="p-2 border">{cost.gst}%</td>
                        <td className="p-2 border">{cost.reasonOfCost}</td>
                        <td className="p-2 border">
                          <button
                            type="button"
                            onClick={() => handleRemoveOtherCost(idx)}
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
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-[#111827] mb-4">
              Tags <span className="text-red-500">*</span>
            </h3>
            <Input
              placeholder="Type a tag and press Enter"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
            />
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {tags.map((tag, idx) => (
                  <Badge
                    key={idx}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    {tag} <X className="w-3 h-3 ml-1" />
                  </Badge>
                ))}
              </div>
            )}
            {tags.length === 0 && (
              <p className="text-sm text-[#6B7A99] mt-2">Add at least one tag</p>
            )}
          </div>

          {/* Other Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-[#111827] mb-4">
              Other Information Buyer Must Know
            </h3>
            <Textarea
              placeholder="Any additional information about the hoarding..."
              rows={4}
              {...register('otherInformation')}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/mediaoffline/mediaofflinehoardinginfo/${id}`)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || productFeatures.length < 5 || tags.length === 0}
              className="bg-[#C64091] hover:bg-[#A03375]"
            >
              {isSubmitting ? 'Saving...' : 'Save & Next'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
