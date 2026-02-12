import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
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
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner';
import api from '../../utils/api';

const schema = z.object({
  offeringType: z.string().min(1, 'Offering type is required'),
  repetition: z.string().min(1, 'Repetition is required'),
  dimensionSize: z.string().min(1, 'Dimension size is required'),
  timeslotMin: z.coerce.number().positive().min(1),
  timeslotMax: z.coerce.number().positive().min(1),
  timelineMin: z.coerce.number().positive().min(1),
  timelineMax: z.coerce.number().positive().min(1),
  hsn: z.string().min(4, 'HSN must be at least 4 digits').max(8, 'HSN must be at most 8 digits'),
});

export default function MediaMultiplexTechInfo() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [features, setFeatures] = useState([]);
  const [featureInput, setFeatureInput] = useState('');
  const [featureDescInput, setFeatureDescInput] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      offeringType: 'BMP',
      repetition: '',
      dimensionSize: '',
      timeslotMin: 10,
      timeslotMax: 30,
      timelineMin: 1,
      timelineMax: 30,
      hsn: '',
    },
  });

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

  const handleAddFeature = () => {
    if (!featureInput.trim()) {
      toast.error('Feature name is required');
      return;
    }
    if (features.length >= 20) {
      toast.error('Maximum 20 features allowed');
      return;
    }
    if (features.some((f) => f.name === featureInput.trim())) {
      toast.error('Feature already added');
      return;
    }
    setFeatures([...features, { name: featureInput.trim(), description: featureDescInput.trim() || featureInput.trim() }]);
    setFeatureInput('');
    setFeatureDescInput('');
  };

  const handleRemoveFeature = (idx) => {
    setFeatures(features.filter((_, i) => i !== idx));
  };

  const onSubmit = async (data) => {
    if (features.length < 5) {
      toast.error('Minimum 5 features required');
      return;
    }
    if (tags.length === 0) {
      toast.error('At least one tag is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        _id: id,
        ProductUploadStatus: 'golive',
        OfferingType: data.offeringType,
        Repetition: data.repetition,
        DimensionSize: data.dimensionSize,
        TimeslotMin: data.timeslotMin,
        TimeslotMax: data.timeslotMax,
        OrderQtyTimelineMin: data.timelineMin,
        OrderQtyTimelineMax: data.timelineMax,
        HSN: data.hsn,
        ProductFeatures: features,
        tags: tags,
      };

      await api.post('/product/product_mutation_multimedia', payload);
      toast.success('Technical information saved!');
      navigate(`/mediaonline/go-live/${id}`);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to save');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] py-8">
      <div className="form-container">
        <div className="form-section">
          <h2 className="form-section-title">Multiplex Technical Information</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
            {/* Offering Type */}
            <div className="space-y-2">
              <Label>Offering Type <span className="text-red-500">*</span></Label>
              <Select value={watch('offeringType')} onValueChange={(v) => setValue('offeringType', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BMP">BMP</SelectItem>
                  <SelectItem value="Interval">Interval</SelectItem>
                  <SelectItem value="Both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Repetition & Dimension */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Repetition <span className="text-red-500">*</span></Label>
                <Input placeholder="e.g. 10 times/day" {...register('repetition')} />
                {errors.repetition && <p className="text-sm text-red-500">{errors.repetition.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Dimension Size <span className="text-red-500">*</span></Label>
                <Input placeholder="e.g. 1920x1080" {...register('dimensionSize')} />
                {errors.dimensionSize && <p className="text-sm text-red-500">{errors.dimensionSize.message}</p>}
              </div>
            </div>

            {/* Timeslot Min/Max */}
            <div className="space-y-2">
              <Label>Timeslot (seconds)</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-normal">Min</Label>
                  <Input type="number" {...register('timeslotMin')} />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-normal">Max</Label>
                  <Input type="number" {...register('timeslotMax')} />
                </div>
              </div>
            </div>

            {/* Order Qty Timeline Min/Max */}
            <div className="space-y-2">
              <Label>Order Qty Timeline</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-normal">Min</Label>
                  <Input type="number" {...register('timelineMin')} />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-normal">Max</Label>
                  <Input type="number" {...register('timelineMax')} />
                </div>
              </div>
            </div>

            {/* HSN */}
            <div className="space-y-2">
              <Label>HSN <span className="text-red-500">*</span></Label>
              <Input placeholder="4-8 digits" {...register('hsn')} />
              {errors.hsn && <p className="text-sm text-red-500">{errors.hsn.message}</p>}
            </div>

            {/* Product Features */}
            <div className="space-y-4 pt-4 border-t border-[#E5E8EB]">
              <h3 className="text-base font-semibold text-[#111827]">Product Features (Min 5, Max 20)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Feature Name</Label>
                  <Input
                    placeholder="e.g. High Traffic"
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    placeholder="Feature description"
                    value={featureDescInput}
                    onChange={(e) => setFeatureDescInput(e.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleAddFeature}
                    disabled={features.length >= 20}
                  >
                    Add Feature
                  </Button>
                </div>
              </div>
              <p className="text-sm text-[#6B7A99]">
                Features: {features.length} (Min 5 required, {features.length >= 5 ? '0' : 5 - features.length} more needed)
              </p>
              {features.length > 0 && (
                <div className="space-y-2">
                  {features.map((f, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 border border-[#E5E8EB] rounded-md bg-white">
                      <div>
                        <span className="font-medium">{f.name}</span>
                        {f.description && f.description !== f.name && (
                          <span className="text-sm text-[#6B7A99] ml-2">— {f.description}</span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(idx)}
                        className="text-[#6B7A99] hover:text-[#C64091]"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label>Tags <span className="text-red-500">*</span></Label>
              <Input
                placeholder="Type a tag and press Enter"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
              />
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag, idx) => (
                    <Badge key={idx} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveTag(tag)}>
                      {tag} <X className="w-3 h-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              )}
              {tags.length === 0 && <p className="text-sm text-red-500">Add at least one tag</p>}
            </div>

            {/* Actions */}
            <div className="flex justify-between pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/mediaonline/mediaonlinemultiplexproductinfo/${id}`)}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || features.length < 5}
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
