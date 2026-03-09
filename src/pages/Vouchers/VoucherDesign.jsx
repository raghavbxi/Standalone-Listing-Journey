import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil, Info, Upload, X } from 'lucide-react';
import { toBlob } from 'html-to-image';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
} from '../../components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../components/ui/tooltip';
import { toast } from 'sonner';
import api, { productApi, uploadApi } from '../../utils/api';
import { getPrevNextStepPaths } from '../../config/categoryFormConfig';
import { Stepper } from '../AddProduct/AddProductSteps';

function dataUrlToBlob(dataUrl) {
  if (!dataUrl || typeof dataUrl !== 'string') return null;
  const commaIndex = dataUrl.indexOf(',');
  const meta = dataUrl.substring(0, commaIndex);
  const base64 = dataUrl.substring(commaIndex + 1);
  const mimeMatch = meta.match(/data:([^;]+);base64/);
  const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mimeType });
}

function asFileFromData(data, fileName) {
  let blob = null;
  if (typeof data === 'string') {
    blob = data.startsWith('data:') ? dataUrlToBlob(data) : null;
  } else if (data instanceof Blob) {
    blob = data;
  }
  if (!blob) return null;
  return new File([blob], fileName, { type: blob.type || 'image/png' });
}

async function uploadVoucherImages(frontData, backData) {
  const uploads = [];
  const frontFile = asFileFromData(frontData, 'front.png');
  if (!frontFile) throw new Error('Front image not prepared');
  const leftForm = new FormData();
  leftForm.append('file', frontFile, 'front.png');
  const resFront = await uploadApi.uploadVoucherFile(leftForm);
  if (!resFront?.data?.file) throw new Error('Front upload failed');
  uploads.push({ id: 'front', url: resFront.data.file, typeOfFile: 'image' });

  const backFile = asFileFromData(backData, 'back.png');
  if (!backFile) throw new Error('Back image not prepared');
  const rightForm = new FormData();
  rightForm.append('file', backFile, 'back.png');
  const resBack = await uploadApi.uploadVoucherFile(rightForm);
  if (!resBack?.data?.file) throw new Error('Back upload failed');
  uploads.push({ id: 'back', url: resBack.data.file, typeOfFile: 'image' });
  return uploads;
}

const captureOptions = {
  quality: 1,
  backgroundColor: '#ffffff',
  width: 480,
  height: 320,
  pixelRatio: 2,
  filter: (el) => {
    if (el.tagName === 'SCRIPT') return false;
    if (el.hasAttribute?.('data-html-to-image')) {
      el.style.backdropFilter = 'none';
      el.style.transform = 'none';
      el.style.transition = 'none';
    }
    return true;
  },
};

/** Front card – matches bxi CardOne leftCard */
const VoucherCardFront = React.forwardRef(
  ({ cardBgColor, cardImage, productData, textInverted, gradientColors }, ref) => {
    const grad = gradientColors || { start: '#7c3aed', end: '#3b82f6' };
    return (
      <div
        ref={ref}
        data-html-to-image="voucher-card"
        className="rounded-[20px] overflow-hidden border border-white/10 shadow-lg flex flex-col"
        style={{
          height: 320,
          width: 480,
          maxWidth: '100%',
          background: cardBgColor || '#1a1a2e',
        }}
      >
        <div className="flex flex-row h-full p-2.5 gap-4">
          <div className="relative w-[220px] h-[296px] flex-shrink-0 rounded-[10px] overflow-hidden bg-gray-800">
            {cardImage ? (
              <img src={cardImage} alt="voucher" className="w-full h-full object-cover block" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/50 text-sm">Upload image</div>
            )}
          </div>
          <div className="flex-1 flex flex-col justify-start py-2 min-w-0 gap-4">
            <div>
              <p
                className="text-[20px] font-semibold leading-tight mb-1.5 truncate"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  color: textInverted ? '#fff' : '#000',
                }}
              >
                {productData?.productName || 'Voucher'}
              </p>
              <p
                className="text-xs font-normal"
                style={{
                  fontFamily: 'Inter, sans-serif',
                  color: textInverted ? 'rgba(255,255,255,0.66)' : 'rgba(0,0,0,0.66)',
                }}
              >
                {productData?.voucherType || 'Gift Card'}
              </p>
            </div>
            <div
              className="p-3 rounded-xl border text-center"
              style={{
                background: `linear-gradient(135deg, ${grad.start}26 0%, ${grad.end}26 100%)`,
                borderColor: `${grad.start}33`,
              }}
            >
              <p
                className="text-[11px] uppercase tracking-wider font-medium mb-1"
                style={{ color: textInverted ? 'rgba(255,255,255,0.66)' : 'rgba(0,0,0,0.66)' }}
              >
                Value
              </p>
              <p
                className="text-[32px] font-semibold leading-none"
                style={{
                  background: `linear-gradient(135deg, ${grad.start} 0%, ${grad.end} 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {productData?.pricePerUnit ?? '1000'}
              </p>
            </div>
            <div className="flex flex-col gap-2 p-3 rounded-xl bg-black/5 border border-black/10">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-medium" style={{ color: textInverted ? 'rgba(255,255,255,0.99)' : 'rgba(0,0,0,0.6)' }}>Valid for</span>
                <span className="text-xs font-medium" style={{ color: textInverted ? '#fff' : '#000' }}>
                  {productData?.validityOfVoucherValue} {productData?.validityOfVoucherUnit || 'Days'}
                </span>
              </div>
              <div className="w-full h-px bg-black/10" />
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-medium" style={{ color: textInverted ? 'rgba(255,255,255,0.93)' : 'rgba(0,0,0,0.6)' }}>Redemption</span>
                <span className="text-xs font-medium capitalize" style={{ color: textInverted ? '#fff' : '#000' }}>
                  {productData?.redemptionType || 'Online'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

/** Back card – matches bxi CardOne rightCard */
const VoucherCardBack = React.forwardRef(
  ({ cardBgColor, productData, textInverted }, ref) => {
    return (
      <div
        ref={ref}
        data-html-to-image="voucher-card"
        className="rounded-[20px] overflow-hidden border border-white/10 shadow-lg"
        style={{
          height: 320,
          width: 480,
          maxWidth: '100%',
          background: cardBgColor || '#1a1a2e',
        }}
      >
        <div className="h-full p-5 flex flex-col gap-3 overflow-hidden">
          <p className="text-base font-semibold" style={{ fontFamily: 'Inter, sans-serif', color: textInverted ? '#fff' : '#000' }}>
            Details
          </p>
          <p className="text-xs font-medium mb-2" style={{ color: textInverted ? 'rgb(255,255,255)' : 'rgba(0,0,0,0.6)' }}>
            What's included
          </p>
          <div
            className="p-3 rounded-[10px] border text-xs"
            style={{
              background: textInverted ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
              borderColor: textInverted ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
              color: textInverted ? '#fff' : 'rgba(0,0,0,0.8)',
            }}
          >
            {productData?.inclusions || 'Inclusions will appear here.'}
          </div>
          <p className="text-xs font-medium mb-2" style={{ color: textInverted ? 'rgb(255,255,255)' : 'rgba(0,0,0,0.6)' }}>
            Exclusions
          </p>
          <div
            className="p-3 rounded-[10px] border text-xs "
            style={{
              background: textInverted ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
              borderColor: textInverted ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
              color: textInverted ? '#fff' : 'rgba(0,0,0,0.8)',
            }}
          >
            {productData?.exclusions || 'Exclusions will appear here.'}
          </div>
          <p className="text-xs font-medium mb-2" style={{ color: textInverted ? 'rgb(255,255,255)' : 'rgba(0,0,0,0.6)' }}>
            Terms and conditions
          </p>
          <div
            className="p-3 rounded-[10px] border text-xs"
            style={{
              background: textInverted ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
              borderColor: textInverted ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
              color: textInverted ? '#fff' : 'rgba(0,0,0,0.8)',
            }}
          >
            {productData?.termsAndConditions || 'Terms and conditions will appear here.'}
          </div>
        </div>
      </div>
    );
  }
);

const COLORS = [
  '#FFE5E580', '#FFE5CC80', '#FFF9E580', '#E5FFE580', '#E5F9FF80', '#E5E5FF80',
  '#FF6B9D', '#FF8C42', '#FFD93D', '#6BCF7F', '#4ECDC4', '#5B8DEF', '#A78BFA', '#EC4899', '#F59E0B',
  '#DC2626', '#2563EB', '#7C3AED', '#BE185D', '#64748B', '#92400E', '#1a1a2e', '#ffffff',
];

export default function VoucherDesign({ category }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const myRefFront = useRef(null);
  const myRefBack = useRef(null);
  const fileInputRef = useRef(null);

  const [productData, setProductData] = useState(null);
  const [cardBgColor, setCardBgColor] = useState('#1a1a2e');
  const [cardImage, setCardImage] = useState(null);
  const [cardImageFile, setCardImageFile] = useState(null);
  const [gradientColors, setGradientColors] = useState({ start: '#7c3aed', end: '#3b82f6' });
  const [textInverted, setTextInverted] = useState(true);
  const [listDays, setListDays] = useState('');
  const [listUnit, setListUnit] = useState('Days');
  const [hasStartedTyping, setHasStartedTyping] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editErrors, setEditErrors] = useState({});

  const { prev: prevStepPath, next: nextStepPath } = getPrevNextStepPaths(category, 'voucherDesign');
  const prevPath = prevStepPath || 'vouchertechinfo';
  const nextPath = nextStepPath || 'vouchergolive';

  /** Preview path after design upload: by voucher type (same as sellerHubNavigation view route). */
  const getVoucherPreviewPath = useCallback((productId, voucherType) => {
    const vt = (voucherType || '').trim();
    if (vt.includes('Offer Specific')) return `/spacificvoucher/${productId}`;
    if (vt.includes('Value Voucher') || vt.includes('Gift Card')) return `/valueandgiftvoucher/${productId}`;
    return `/allvoucherpreview/${productId}`;
  }, []);

  const validateDays = useCallback((val) => {
    const n = parseInt(val, 10);
    return !isNaN(n) && n > 0 && n <= 365;
  }, []);

  const listDaysValid = listDays !== '' && validateDays(listDays);

  useEffect(() => {
    if (!id) return;
    const run = async () => {
      try {
        const res = await productApi.getProductById(id);
        const d = res?.data;
        if (!d) return;
        const v = d?.ProductsVariantions?.[0];
        const digitalData = typeof localStorage !== 'undefined' ? localStorage.getItem('digitalData') : null;
        const voucherType = digitalData === 'Offer Specific' ? 'Offer Specific' : 'Gift Card';
        setProductData({
          productName: d?.ProductName,
          productSubtitle: d?.ProductSubtitle,
          validityOfVoucherValue: v?.validityOfVoucherValue,
          validityOfVoucherUnit: v?.validityOfVoucherUnit || 'Days',
          pricePerUnit: v?.PricePerUnit ?? '',
          redemptionType: d?.redemptionType || 'Online',
          inclusions: d?.Inclusions || '',
          exclusions: d?.Exclusions || '',
          termsAndConditions: d?.TermConditions || '',
          redemptionURL: d?.Link || '',
          voucherType,
        });
        if (v?.validityOfVoucherValue) setListDays(String(v.validityOfVoucherValue));
      } catch (e) {
        console.error(e);
        toast.error('Failed to load product');
      }
    };
    run();
  }, [id]);

  const handleCardImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) {
      toast.error('Please select an image file (jpg, png, jpeg)');
      return;
    }
    setCardImageFile(file);
    setCardImage(URL.createObjectURL(file));
    toast.success('Card image added');
  };

  const handleListDaysChange = (e) => {
    setListDays(e.target.value);
    setHasStartedTyping(true);
  };

  const captureAndUpload = useCallback(async () => {
    if (!myRefFront.current || !myRefBack.current) {
      toast.error('Failed to generate voucher images');
      return;
    }
    setShowSpinner(true);
    try {
      await new Promise((r) => setTimeout(r, 500));
      const [frontBlob, backBlob] = await Promise.all([
        toBlob(myRefFront.current, captureOptions),
        toBlob(myRefBack.current, captureOptions),
      ]);
      if (!frontBlob?.size || !backBlob?.size) {
        toast.error('Generated image is empty. Please check the voucher preview.');
        setShowSpinner(false);
        return;
      }
      const uploaded = await uploadVoucherImages(frontBlob, backBlob);
      const voucherImages = uploaded.map((u) => ({ id: u.id, url: u.url, typeOfFile: u.typeOfFile }));
      await api.post('/product/product_mutation', {
        _id: id,
        id,
        ListThisProductForAmount: listDays.trim(),
        ListThisProductForUnitOfTime: listUnit,
        VoucherImages: voucherImages,
      });
      toast.success('Voucher images uploaded successfully!');
      if (nextPath) {
        navigate(`/${category}/${nextPath}/${id}`);
      } else {
        // Hotel and other vouchers with no next step: go to preview page (same as other vouchers)
        const voucherType = productData?.voucherType || (typeof localStorage !== 'undefined' ? localStorage.getItem('digitalData') : null);
        const previewPath = getVoucherPreviewPath(id, voucherType);
        navigate(previewPath);
      }
    } catch (err) {
      toast.error(err?.message || 'Failed to upload voucher images. Please try again.');
    } finally {
      setShowSpinner(false);
      setConfirmOpen(false);
    }
  }, [id, listDays, listUnit, category, nextPath, productData?.voucherType, getVoucherPreviewPath]);

  const handleNext = () => {
    if (!listDaysValid) {
      toast.error('Please enter valid days!');
      return;
    }
    if (!cardImage) {
      toast.error('Please upload a card image for the voucher');
      return;
    }
    setConfirmOpen(true);
  };

  const onConfirmNext = () => captureAndUpload();

  const validateEditForm = () => {
    const err = {};
    const name = (productData?.productName || '').trim();
    if (name.length < 5) err.productName = 'Product name should be at least 5 characters long';
    else if (name.length > 25) err.productName = 'Product name should be at most 25 characters long';
    const subtitle = (productData?.productSubtitle || '').trim();
    if (subtitle.length < 10) err.productSubtitle = 'Product subtitle should be at least 10 characters long';
    else if (subtitle.length > 50) err.productSubtitle = 'Product subtitle should be at most 50 characters long';
    if (!(productData?.inclusions || '').trim()) err.inclusions = 'This field is required';
    if (!(productData?.exclusions || '').trim()) err.exclusions = 'This field is required';
    const validity = productData?.validityOfVoucherValue;
    if (validity !== undefined && validity !== null && validity !== '') {
      const n = parseInt(validity, 10);
      if (isNaN(n) || n < 1) err.validityOfVoucherValue = 'Validity must be at least 1';
    }
    setEditErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleEditSave = () => {
    if (!validateEditForm()) return;
    setEditOpen(false);
    setEditErrors({});
    toast.success('Content updated');
  };

  return (
    <div className="min-h-screen bg-[#EEF1F6] overflow-y-auto">
      <div className="form-container px-6 py-4 max-w-[1400px] mx-auto">
        <Stepper currentStep={4} completedSteps={[1, 2, 3]} />
        <div className="flex items-center gap-2 py-2.5">
          <h2 className="text-xl font-semibold text-[#6B7A99]">Voucher Design - {category}</h2>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" className="text-[#6B7A99] hover:text-[#C64091]">
                  <Info className="w-5 h-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Go to preview time at which something becomes available to use and purchased by other members on the platform.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[520px_1fr] gap-10 items-start">
          {/* Left: Voucher Template */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-[20px] font-semibold text-[#315794]">Voucher Template</h3>
              <button
                type="button"
                onClick={() => setEditOpen(true)}
                className="bg-transparent border-none text-[#445FD2] cursor-pointer p-1"
                aria-label="Edit content"
              >
                <Pencil className="w-6 h-6" />
              </button>
            </div>
            <div id="voucher-live-preview-front" className="flex flex-col gap-5">
              <VoucherCardFront
                ref={myRefFront}
                cardBgColor={cardBgColor}
                cardImage={cardImage}
                productData={productData}
                textInverted={textInverted}
                gradientColors={gradientColors}
              />
              <VoucherCardBack
                ref={myRefBack}
                cardBgColor={cardBgColor}
                productData={productData}
                textInverted={textInverted}
              />
            </div>
          </div>

          {/* Right: Custom options */}
          <div className="bg-white rounded-2xl border border-[#E3E3E3] shadow-sm p-6 space-y-6">
            <div className="bg-white rounded-xl border border-[#E3E3E3] p-4 shadow-sm">
              <Label className="text-sm font-medium text-[#6B7A99] mb-2 block">Upload card image</Label>
              <p className="text-xs text-[#6B7A99] mb-2">Image for the left side of the voucher (jpg, png, jpeg)</p>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="border-[#C64091] text-[#C64091]"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {cardImage ? 'Change' : 'Upload'}
                </Button>
                {cardImage && (
                  <span className="text-sm text-[#6B7A99] flex items-center gap-1">
                    <img src={cardImage} alt="Card" className="h-8 w-12 object-cover rounded" />
                    <button type="button" onClick={() => { setCardImage(null); setCardImageFile(null); }} className="text-[#6B7A99] hover:text-red-500"><X className="w-4 h-4" /></button>
                  </span>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/jpg,image/jpeg,image/png" onChange={handleCardImageChange} className="hidden" />
            </div>

            <div className="bg-white rounded-xl border border-[#E3E3E3] p-4 shadow-sm">
              <Label className="text-sm font-medium text-[#6B7A99] mb-2 block">Background colour</Label>
              <div className="flex flex-wrap gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCardBgColor(c)}
                    className="w-8 h-8 rounded-full border-2 border-gray-200 hover:border-[#C64091]"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[#E3E3E3] p-4 shadow-sm">
              <Label className="text-sm font-medium text-[#6B7A99] mb-2 block">Gradient (value section)</Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={gradientColors.start}
                  onChange={(e) => setGradientColors((g) => ({ ...g, start: e.target.value }))}
                  className="w-10 h-10 rounded border cursor-pointer"
                />
                <input
                  type="color"
                  value={gradientColors.end}
                  onChange={(e) => setGradientColors((g) => ({ ...g, end: e.target.value }))}
                  className="w-10 h-10 rounded border cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="textInvert"
                checked={textInverted}
                onChange={(e) => setTextInverted(e.target.checked)}
              />
              <Label htmlFor="textInvert" className="text-sm text-[#6B7A99] cursor-pointer">Light text (dark background)</Label>
            </div>
          </div>
        </div>

        {/* List this voucher for number of days */}
        <div className="mt-6 ml-2 max-w-[550px]">
          <Label className="text-base text-[#6B7A99]" style={{ fontFamily: 'Poppins' }}>
            List this voucher for number of days ( maximum 365 days ) <span className="text-red-500">*</span>
          </Label>
          <p className="text-xs text-black font-normal mt-1" style={{ fontFamily: 'Poppins' }}>
            Note: Activation of Voucher after you sell is when the expiry should start
          </p>
          {productData?.validityOfVoucherValue && (
            <p className="text-sm text-[#C64091] mb-1" style={{ fontFamily: 'Poppins' }}>
              You have already added validity of Voucher of {productData.validityOfVoucherValue}
            </p>
          )}
          <div className="flex border border-[#E3E3E3] rounded-lg overflow-hidden bg-white">
            <Input
              type="number"
              min={1}
              max={365}
              placeholder="30"
              value={listDays}
              onChange={handleListDaysChange}
              className="rounded-r-none border-0 text-[#C64091] font-medium"
            />
            <Select value={listUnit} onValueChange={setListUnit}>
              <SelectTrigger className="w-[100px] rounded-l-none border-0 border-l bg-white text-[#C64091] font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Days">Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {hasStartedTyping && !validateDays(listDays) && (
            <p className="text-sm text-red-500 mt-1">Please enter valid days! (1–365)</p>
          )}
        </div>

        {/* Bottom navigation */}
        <div className="flex justify-end gap-2 py-4 px-6 mt-4 bg-[#EEF1F6] border-t border-gray-200">
          {prevPath && (
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/${category}/${prevPath}/${id}`)}
              className="bg-white text-[#636161] hover:bg-gray-100 border border-gray-300"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (window.confirm('Are you sure you want to cancel the product?')) navigate('/sellerhub');
            }}
            className="bg-white text-[#636161] hover:bg-gray-100 border border-gray-300"
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!listDaysValid || !cardImage || showSpinner}
            onClick={handleNext}
            className="bg-[#C64091] hover:bg-[#A03375] disabled:opacity-50 disabled:pointer-events-none"
          >
            {showSpinner ? (
              <span className="flex items-center gap-2">
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Next
              </span>
            ) : (
              'Next'
            )}
          </Button>
        </div>
      </div>

      {/* Edit Content dialog – bxi EditVoucherForm: productname 5–25, productsubtitle 10–50, inclusions/exclusions required */}
      <Dialog open={editOpen} onOpenChange={(open) => { setEditOpen(open); if (!open) setEditErrors({}); }}>
        <DialogContent className="bg-[#EEF1F6] max-w-md max-h-[90vh] overflow-y-auto">
          <DialogTitle>Edit Content on Voucher</DialogTitle>
          {productData && (
            <div className="space-y-4 pt-2">
              <div>
                <Label>Product name (5–25 characters) *</Label>
                <Input
                  value={productData.productName || ''}
                  onChange={(e) => setProductData((p) => ({ ...p, productName: e.target.value }))}
                  className={`mt-1 bg-white ${editErrors.productName ? 'border-red-500' : ''}`}
                  maxLength={25}
                />
                {editErrors.productName && <p className="text-xs text-red-500 mt-0.5">{editErrors.productName}</p>}
              </div>
              <div>
                <Label>Product subtitle (10–50 characters) *</Label>
                <Input
                  value={productData.productSubtitle || ''}
                  onChange={(e) => setProductData((p) => ({ ...p, productSubtitle: e.target.value }))}
                  className={`mt-1 bg-white ${editErrors.productSubtitle ? 'border-red-500' : ''}`}
                  maxLength={50}
                />
                {editErrors.productSubtitle && <p className="text-xs text-red-500 mt-0.5">{editErrors.productSubtitle}</p>}
              </div>
              <div>
                <Label>Inclusions *</Label>
                <Input
                  value={productData.inclusions || ''}
                  onChange={(e) => setProductData((p) => ({ ...p, inclusions: e.target.value }))}
                  className={`mt-1 bg-white ${editErrors.inclusions ? 'border-red-500' : ''}`}
                />
                {editErrors.inclusions && <p className="text-xs text-red-500 mt-0.5">{editErrors.inclusions}</p>}
              </div>
              <div>
                <Label>Exclusions *</Label>
                <Input
                  value={productData.exclusions || ''}
                  onChange={(e) => setProductData((p) => ({ ...p, exclusions: e.target.value }))}
                  className={`mt-1 bg-white ${editErrors.exclusions ? 'border-red-500' : ''}`}
                />
                {editErrors.exclusions && <p className="text-xs text-red-500 mt-0.5">{editErrors.exclusions}</p>}
              </div>
              <div>
                <Label>Validity of voucher value (min 1)</Label>
                <Input
                  type="number"
                  min={1}
                  value={productData.validityOfVoucherValue ?? ''}
                  onChange={(e) => setProductData((p) => ({ ...p, validityOfVoucherValue: e.target.value }))}
                  className={`mt-1 bg-white ${editErrors.validityOfVoucherValue ? 'border-red-500' : ''}`}
                />
                {editErrors.validityOfVoucherValue && <p className="text-xs text-red-500 mt-0.5">{editErrors.validityOfVoucherValue}</p>}
              </div>
              <div>
                <Label>Voucher type</Label>
                <Input
                  value={productData.voucherType || ''}
                  onChange={(e) => setProductData((p) => ({ ...p, voucherType: e.target.value }))}
                  className="mt-1 bg-white"
                />
              </div>
              <div>
                <Label>Price per unit</Label>
                <Input
                  value={productData.pricePerUnit ?? ''}
                  onChange={(e) => setProductData((p) => ({ ...p, pricePerUnit: e.target.value }))}
                  className="mt-1 bg-white"
                />
              </div>
              <div>
                <Label>Redemption type</Label>
                <Input
                  value={productData.redemptionType || ''}
                  onChange={(e) => setProductData((p) => ({ ...p, redemptionType: e.target.value }))}
                  className="mt-1 bg-white"
                />
              </div>
              <div>
                <Label>Redemption URL</Label>
                <Input
                  value={productData.redemptionURL || ''}
                  onChange={(e) => setProductData((p) => ({ ...p, redemptionURL: e.target.value }))}
                  className="mt-1 bg-white"
                />
              </div>
              <DialogFooter className="pt-4">
                <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
                <Button className="bg-[#C64091] hover:bg-[#A03375]" onClick={handleEditSave}>Save</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirm upload dialog – bxi: "Once you upload a voucher image, it cannot be changed later" */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogTitle>Note</DialogTitle>
          <p className="text-[#6B7A99]">
            Once you upload a voucher image, it cannot be changed later.
            <br /><br />
            Are you sure you want to continue?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={showSpinner}>No</Button>
            <Button className="bg-[#C64091] hover:bg-[#A03375]" onClick={onConfirmNext} disabled={showSpinner}>
              {showSpinner ? (
                <span className="flex items-center gap-2">
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Uploading...
                </span>
              ) : (
                'Yes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
