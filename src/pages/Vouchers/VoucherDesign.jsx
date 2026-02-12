import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Upload, Download, X, Check } from 'lucide-react';
import { SketchPicker } from 'react-color';
import { toPng } from 'html-to-image';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { toast } from 'sonner';
import api, { productApi } from '../../utils/api';
import QRCode from 'react-qr-code';

// Template preview components
const VoucherTypeOne = ({ design, productData }) => (
  <div className="w-full h-[400px] rounded-lg overflow-hidden shadow-lg" style={{ backgroundColor: design.bgColor }}>
    <div className="h-full flex flex-col p-6">
      <div className="flex justify-between items-start mb-4">
        {design.logo && <img src={design.logo} alt="Logo" className="h-12 object-contain" />}
        <div className="text-right">
          <h2 className="text-2xl font-bold" style={{ color: design.primaryColor }}>VOUCHER</h2>
          <p className="text-sm opacity-75" style={{ color: design.textColor }}>#{productData?.ProductCode}</p>
        </div>
      </div>
      <div className="flex-1 flex flex-col justify-center text-center">
        <h1 className="text-4xl font-bold mb-2" style={{ color: design.primaryColor, fontFamily: design.fontFamily }}>
          {productData?.ProductName || 'Voucher Title'}
        </h1>
        <p className="text-lg opacity-90" style={{ color: design.textColor }}>
          {productData?.ProductDescription || 'Experience amazing offers'}
        </p>
      </div>
      <div className="flex justify-between items-end">
        <div>
          <p className="text-sm opacity-75" style={{ color: design.textColor }}>Valid Until</p>
          <p className="font-semibold" style={{ color: design.primaryColor }}>
            {productData?.ExpiryDate || 'DD/MM/YYYY'}
          </p>
        </div>
        <QRCode value={productData?._id || 'sample'} size={80} />
      </div>
    </div>
  </div>
);

const VoucherTypeTwo = ({ design, productData }) => (
  <div className="w-full h-[400px] rounded-lg overflow-hidden shadow-lg relative">
    <div className="absolute inset-0" style={{ backgroundColor: design.bgColor, opacity: 0.95 }} />
    <div className="relative h-full flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        {design.logo && <img src={design.logo} alt="Logo" className="h-16 mx-auto mb-6 object-contain" />}
        <h1 className="text-5xl font-bold mb-4" style={{ color: design.primaryColor, fontFamily: design.fontFamily }}>
          {productData?.ProductName || 'Exclusive Voucher'}
        </h1>
        <div className="w-24 h-1 mx-auto mb-4" style={{ backgroundColor: design.primaryColor }} />
        <p className="text-lg mb-6" style={{ color: design.textColor }}>
          {productData?.ProductDescription || 'Enjoy premium benefits'}
        </p>
        <QRCode value={productData?._id || 'sample'} size={100} />
        <p className="mt-4 text-sm opacity-75" style={{ color: design.textColor }}>
          Valid until {productData?.ExpiryDate || 'DD/MM/YYYY'}
        </p>
      </div>
    </div>
  </div>
);

const VoucherTypeThree = ({ design, productData }) => (
  <div className="w-full h-[400px] rounded-lg overflow-hidden shadow-lg flex">
    <div className="w-2/3 p-8 flex flex-col" style={{ backgroundColor: design.bgColor }}>
      {design.logo && <img src={design.logo} alt="Logo" className="h-10 mb-6 object-contain self-start" />}
      <h1 className="text-3xl font-bold mb-3" style={{ color: design.primaryColor, fontFamily: design.fontFamily }}>
        {productData?.ProductName || 'Gift Voucher'}
      </h1>
      <p className="text-sm mb-4 flex-1" style={{ color: design.textColor }}>
        {productData?.ProductDescription || 'A perfect gift for your loved ones'}
      </p>
      <div className="flex justify-between items-end">
        <div>
          <p className="text-xs opacity-75" style={{ color: design.textColor }}>Code</p>
          <p className="font-mono font-semibold" style={{ color: design.primaryColor }}>
            {productData?.ProductCode || 'XXXXXX'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs opacity-75" style={{ color: design.textColor }}>Valid Till</p>
          <p className="font-semibold" style={{ color: design.primaryColor }}>
            {productData?.ExpiryDate || 'DD/MM/YYYY'}
          </p>
        </div>
      </div>
    </div>
    <div className="w-1/3 flex items-center justify-center p-4" style={{ backgroundColor: design.primaryColor }}>
      <QRCode value={productData?._id || 'sample'} size={120} />
    </div>
  </div>
);

const VoucherTypeFour = ({ design, productData }) => (
  <div className="w-full h-[400px] rounded-lg overflow-hidden shadow-lg" style={{ backgroundColor: design.primaryColor }}>
    <div className="h-full flex flex-col p-6">
      <div className="flex justify-between items-start mb-6">
        {design.logo && (
          <div className="bg-white p-2 rounded">
            <img src={design.logo} alt="Logo" className="h-8 object-contain" />
          </div>
        )}
        <div className="bg-white px-4 py-2 rounded" style={{ color: design.primaryColor }}>
          <p className="text-sm font-bold">VOUCHER</p>
        </div>
      </div>
      <div className="flex-1 flex items-center">
        <div className="flex-1">
          <h1 className="text-4xl font-bold mb-3" style={{ color: design.bgColor, fontFamily: design.fontFamily }}>
            {productData?.ProductName || 'Special Offer'}
          </h1>
          <p className="text-base mb-4" style={{ color: design.bgColor, opacity: 0.9 }}>
            {productData?.ProductDescription || 'Limited time offer'}
          </p>
          <div className="inline-block bg-white px-4 py-2 rounded">
            <p className="text-xs" style={{ color: design.primaryColor }}>Valid until</p>
            <p className="font-bold" style={{ color: design.primaryColor }}>
              {productData?.ExpiryDate || 'DD/MM/YYYY'}
            </p>
          </div>
        </div>
        <div className="bg-white p-3 rounded">
          <QRCode value={productData?._id || 'sample'} size={100} />
        </div>
      </div>
    </div>
  </div>
);

const VoucherTypeFive = ({ design, productData }) => (
  <div className="w-full h-[400px] rounded-lg overflow-hidden shadow-lg relative">
    <div className="absolute top-0 left-0 right-0 h-1/2" style={{ backgroundColor: design.primaryColor }} />
    <div className="absolute bottom-0 left-0 right-0 h-1/2" style={{ backgroundColor: design.bgColor }} />
    <div className="relative h-full flex flex-col items-center justify-center p-8">
      {design.logo && (
        <div className="bg-white p-3 rounded-full mb-4 shadow-lg">
          <img src={design.logo} alt="Logo" className="h-12 w-12 object-contain" />
        </div>
      )}
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md text-center">
        <h1 className="text-3xl font-bold mb-3" style={{ color: design.primaryColor, fontFamily: design.fontFamily }}>
          {productData?.ProductName || 'Premium Voucher'}
        </h1>
        <p className="text-sm mb-6" style={{ color: design.textColor }}>
          {productData?.ProductDescription || 'Enjoy exclusive benefits'}
        </p>
        <QRCode value={productData?._id || 'sample'} size={120} className="mx-auto mb-4" />
        <p className="text-xs opacity-75" style={{ color: design.textColor }}>
          Valid until {productData?.ExpiryDate || 'DD/MM/YYYY'}
        </p>
      </div>
    </div>
  </div>
);

const VoucherTypeSix = ({ design, productData }) => (
  <div className="w-full h-[400px] rounded-lg overflow-hidden shadow-lg flex flex-col" style={{ backgroundColor: design.bgColor }}>
    <div className="h-16 flex items-center justify-between px-6" style={{ backgroundColor: design.primaryColor }}>
      {design.logo && <img src={design.logo} alt="Logo" className="h-8 object-contain" />}
      <h2 className="text-xl font-bold" style={{ color: design.bgColor }}>VOUCHER</h2>
    </div>
    <div className="flex-1 flex p-8 gap-6">
      <div className="flex-1 flex flex-col justify-center">
        <p className="text-sm opacity-75 mb-2" style={{ color: design.textColor }}>CODE: {productData?.ProductCode || 'XXXXXX'}</p>
        <h1 className="text-3xl font-bold mb-4" style={{ color: design.primaryColor, fontFamily: design.fontFamily }}>
          {productData?.ProductName || 'Gift Card'}
        </h1>
        <p className="text-sm mb-6" style={{ color: design.textColor }}>
          {productData?.ProductDescription || 'The perfect gift for any occasion'}
        </p>
        <div className="inline-block">
          <p className="text-xs opacity-75" style={{ color: design.textColor }}>Valid Until</p>
          <p className="text-lg font-bold" style={{ color: design.primaryColor }}>
            {productData?.ExpiryDate || 'DD/MM/YYYY'}
          </p>
        </div>
      </div>
      <div className="flex items-center">
        <QRCode value={productData?._id || 'sample'} size={140} />
      </div>
    </div>
  </div>
);

const TEMPLATE_MAP = {
  TypeOne: VoucherTypeOne,
  TypeTwo: VoucherTypeTwo,
  TypeThree: VoucherTypeThree,
  TypeFour: VoucherTypeFour,
  TypeFive: VoucherTypeFive,
  TypeSix: VoucherTypeSix,
};

const FONT_OPTIONS = [
  { value: 'Inter, sans-serif', label: 'Inter' },
  { value: 'Roboto, sans-serif', label: 'Roboto' },
  { value: 'Poppins, sans-serif', label: 'Poppins' },
  { value: 'Montserrat, sans-serif', label: 'Montserrat' },
  { value: 'Lato, sans-serif', label: 'Lato' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: 'Times New Roman, serif', label: 'Times New Roman' },
];

export default function VoucherDesign({ category }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [productData, setProductData] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState('TypeOne');
  const [design, setDesign] = useState({
    bgColor: '#FFFFFF',
    primaryColor: '#C64091',
    textColor: '#111827',
    fontFamily: 'Inter, sans-serif',
    logo: null,
  });
  const [showBgPicker, setShowBgPicker] = useState(false);
  const [showPrimaryPicker, setShowPrimaryPicker] = useState(false);
  const [showTextPicker, setShowTextPicker] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const logoInputRef = useRef(null);
  const voucherRef = useRef(null);

  const prevPath = 'vouchertechinfo';
  const nextPath = 'vouchergolive';

  // Fetch product data
  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      try {
        const res = await productApi.getProductById(id);
        setProductData(res?.data);
        
        // Load existing design if available
        if (res?.data?.VoucherDesign) {
          const savedDesign = JSON.parse(res.data.VoucherDesign);
          setDesign(savedDesign);
          setSelectedTemplate(res.data.VoucherTemplate || 'TypeOne');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      }
    };
    fetchProduct();
  }, [id]);

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Logo size must be less than 2MB');
      return;
    }

    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setDesign({ ...design, logo: reader.result });
    };
    reader.readAsDataURL(file);
    toast.success('Logo uploaded');
  };

  const handleDownloadPreview = async () => {
    if (!voucherRef.current) return;
    try {
      const dataUrl = await toPng(voucherRef.current, { quality: 0.95 });
      const link = document.createElement('a');
      link.download = `voucher-preview-${selectedTemplate}.png`;
      link.href = dataUrl;
      link.click();
      toast.success('Preview downloaded');
    } catch (error) {
      toast.error('Failed to download preview');
    }
  };

  const onSubmit = async () => {
    if (!id) {
      toast.error('Product ID missing');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('_id', id);
      formData.append('ProductUploadStatus', 'vouchergolive');
      formData.append('VoucherTemplate', selectedTemplate);
      formData.append('VoucherDesign', JSON.stringify(design));

      if (logoFile) {
        formData.append('voucherLogo', logoFile);
      }

      await api.post('/product/product_mutation', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Voucher design saved!');
      navigate(`/${category}/${nextPath}/${id}`);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to save. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const TemplateComponent = TEMPLATE_MAP[selectedTemplate];

  return (
    <div className="min-h-screen bg-[#F8F9FA] py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-2xl font-bold text-[#111827] mb-2">Voucher Design</h2>
          <p className="text-sm text-[#6B7A99]">
            Choose a template and customize your voucher design
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel - Customization */}
          <div className="space-y-6">
            {/* Template Selection */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-[#111827] mb-4">Select Template</h3>
              <div className="grid grid-cols-3 gap-3">
                {Object.keys(TEMPLATE_MAP).map((template) => (
                  <button
                    key={template}
                    onClick={() => setSelectedTemplate(template)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedTemplate === template
                        ? 'border-[#C64091] bg-[#C64091]/5'
                        : 'border-[#E5E8EB] hover:border-[#C64091]/50'
                    }`}
                  >
                    <div className="text-sm font-semibold text-center">{template}</div>
                    {selectedTemplate === template && (
                      <Check className="w-4 h-4 text-[#C64091] mx-auto mt-2" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Customization */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-[#111827] mb-4">Customize Design</h3>
              <Tabs defaultValue="colors" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="colors">Colors</TabsTrigger>
                  <TabsTrigger value="logo">Logo</TabsTrigger>
                  <TabsTrigger value="font">Font</TabsTrigger>
                </TabsList>

                <TabsContent value="colors" className="space-y-4">
                  {/* Background Color */}
                  <div className="space-y-2">
                    <Label>Background Color</Label>
                    <div className="flex gap-3 items-center">
                      <button
                        onClick={() => setShowBgPicker(!showBgPicker)}
                        className="w-12 h-12 rounded border-2 border-[#E5E8EB]"
                        style={{ backgroundColor: design.bgColor }}
                      />
                      <Input value={design.bgColor} readOnly className="flex-1" />
                    </div>
                    {showBgPicker && (
                      <div className="absolute z-10">
                        <div className="fixed inset-0" onClick={() => setShowBgPicker(false)} />
                        <SketchPicker
                          color={design.bgColor}
                          onChange={(color) => setDesign({ ...design, bgColor: color.hex })}
                        />
                      </div>
                    )}
                  </div>

                  {/* Primary Color */}
                  <div className="space-y-2">
                    <Label>Primary Color</Label>
                    <div className="flex gap-3 items-center">
                      <button
                        onClick={() => setShowPrimaryPicker(!showPrimaryPicker)}
                        className="w-12 h-12 rounded border-2 border-[#E5E8EB]"
                        style={{ backgroundColor: design.primaryColor }}
                      />
                      <Input value={design.primaryColor} readOnly className="flex-1" />
                    </div>
                    {showPrimaryPicker && (
                      <div className="absolute z-10">
                        <div className="fixed inset-0" onClick={() => setShowPrimaryPicker(false)} />
                        <SketchPicker
                          color={design.primaryColor}
                          onChange={(color) => setDesign({ ...design, primaryColor: color.hex })}
                        />
                      </div>
                    )}
                  </div>

                  {/* Text Color */}
                  <div className="space-y-2">
                    <Label>Text Color</Label>
                    <div className="flex gap-3 items-center">
                      <button
                        onClick={() => setShowTextPicker(!showTextPicker)}
                        className="w-12 h-12 rounded border-2 border-[#E5E8EB]"
                        style={{ backgroundColor: design.textColor }}
                      />
                      <Input value={design.textColor} readOnly className="flex-1" />
                    </div>
                    {showTextPicker && (
                      <div className="absolute z-10">
                        <div className="fixed inset-0" onClick={() => setShowTextPicker(false)} />
                        <SketchPicker
                          color={design.textColor}
                          onChange={(color) => setDesign({ ...design, textColor: color.hex })}
                        />
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="logo" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Upload Logo</Label>
                    <p className="text-xs text-[#6B7A99]">PNG or JPG, max 2MB</p>
                    {design.logo && (
                      <div className="p-4 border rounded-lg flex items-center justify-between">
                        <img src={design.logo} alt="Logo preview" className="h-16 object-contain" />
                        <button
                          onClick={() => {
                            setDesign({ ...design, logo: null });
                            setLogoFile(null);
                          }}
                          className="text-[#6B7A99] hover:text-[#C64091]"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => logoInputRef.current?.click()}
                      className="w-full border-[#C64091] text-[#C64091]"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {design.logo ? 'Change Logo' : 'Upload Logo'}
                    </Button>
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="font" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Font Family</Label>
                    <Select
                      value={design.fontFamily}
                      onValueChange={(v) => setDesign({ ...design, fontFamily: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FONT_OPTIONS.map((font) => (
                          <SelectItem key={font.value} value={font.value}>
                            <span style={{ fontFamily: font.value }}>{font.label}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Right Panel - Preview */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-[#111827]">Preview</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadPreview}
                  className="border-[#C64091] text-[#C64091]"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
              <div ref={voucherRef}>
                {TemplateComponent && <TemplateComponent design={design} productData={productData} />}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/${category}/${prevPath}/${id}`)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button
            onClick={onSubmit}
            disabled={isSubmitting}
            className="bg-[#C64091] hover:bg-[#A03375]"
          >
            {isSubmitting ? 'Saving...' : 'Save & Next'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
