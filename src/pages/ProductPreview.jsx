import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CircleDollarSign, Check, Scale, Package } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { productApi, keyFeatureApi } from '../utils/api';
import { toast } from 'sonner';
import { cn } from '../lib/utils';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '../components/ui/carousel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { Skeleton } from '../components/ui/skeleton';
import BXIIcon from '../assets/BXI_COIN.png';

const defaultImage =
  'https://images.unsplash.com/photo-1612538498488-226257115cc4?w=400&h=400&fit=crop';

const CATEGORY_TO_SLUG = {
  Textile: 'textile',
  'Office Supply': 'officesupply',
  Lifestyle: 'lifestyle',
  Others: 'others',
  Electronics: 'electronics',
  FMCG: 'fmcg',
  Mobility: 'mobility',
  QSR: 'restaurant',
  Media: 'mediaonline',
};

function formatPrice(value) {
  if (value == null || value === '') return 'N/A';
  const num = typeof value === 'number' ? value : parseFloat(value);
  if (Number.isNaN(num)) return String(value);
  return num.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function FeatureItem({ name, description }) {
  const [iconUrl, setIconUrl] = useState(null);
  const [imgError, setImgError] = useState(false);
  useEffect(() => {
    if (!name) return;
    keyFeatureApi
      .getByName(name)
      .then((res) => {
        const data = res?.data ?? res;
        const url = data?.URL ?? data?.url;
        if (url) setIconUrl(url);
      })
      .catch(() => {});
  }, [name]);
  const showImg = iconUrl && !imgError;
  return (
    <div className="flex items-start gap-4">
      <div className="shrink-0 w-10 h-10 flex items-center justify-center rounded-lg bg-gray-100">
        {showImg ? (
          <img src={iconUrl} alt={name} className="w-10 h-10 object-contain" onError={() => setImgError(true)} />
        ) : (
          <Package className="h-10 w-10 text-gray-500" />
        )}
      </div>
      <div>
        <p className="font-medium text-gray-600">{name}</p>
        <p className="text-gray-500 text-sm mt-0.5">{description}</p>
      </div>
    </div>
  );
}

function DiscountedPriceDisplay({ regularPrice, discountPrice, percentage }) {
  const reg = Number(regularPrice) || 0;
  const disc = Number(discountPrice) || 0;
  const pct = Number(percentage) || 0;
  const discount = reg - disc;
  const discountPercent = reg > 0 ? (discount / reg) * 100 : 0;
  const gstPrice = pct > 0 ? disc / (1 + pct / 100) : disc;
  const gstAmount = disc - gstPrice;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap items-baseline gap-2">
        {discountPercent > 0 && (
          <span className="text-base font-bold text-red-600">
            -{discountPercent.toFixed(2)}%
          </span>
        )}
        <span className="text-2xl font-bold text-gray-900 md:text-3xl">
          {formatPrice(disc)}
        </span>
        <span className="flex items-center gap-1 text-sm text-gray-500">
          ({formatPrice(gstPrice)}
          <img src={BXIIcon} alt="GST" className="h-4 w-4 inline" />
          + {formatPrice(gstAmount)}₹ GST)
        </span>
      </div>
      {discountPercent > 0 && (
        <span className="text-sm text-gray-400">
          MRP: <span className="text-gray-400 line-through">{formatPrice(reg)}</span>
        </span>
      )}
      <span className="text-xs text-gray-500">All prices are inclusive of Taxes</span>
    </div>
  );
}

export default function ProductPreview() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!id) {
      setError('No product ID');
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    productApi
      .getProductById(id)
      .then((res) => {
        const raw = res?.data ?? res;
        const data = raw?.body ?? raw?.data ?? raw;
        if (cancelled) return;
        setProduct(data);
        const variants = data?.ProductsVariantions ?? [];
        if (variants.length > 0) {
          setSelectedVariant(variants[0]?._id ?? variants[0]?.id);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err?.message || 'Failed to load product');
          setProduct(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleBack = () => {
    const cat = product?.ProductCategoryName;
    const slug = CATEGORY_TO_SLUG[cat];
    if (slug) {
      navigate(`/${slug}/go-live/${id}`);
    } else {
      navigate('/sellerhub');
    }
  };

  const handleUpload = () => {
    if (!id || uploading) return;
    setUploading(true);
    productApi
      .productMutation({ id, ProductUploadStatus: 'pendingapproval' })
      .then(() => {
        toast.success('Once uploaded, changes are subject to approval.');
        setTimeout(() => navigate('/sellerhub'), 2000);
      })
      .catch(() => {
        toast.error('Failed to upload product');
      })
      .finally(() => setUploading(false));
  };

  const variants = product?.ProductsVariantions ?? [];
  const selectedVariantData = variants.find(
    (v) => (v._id ?? v.id) === selectedVariant
  );
  const images = product?.ProductImages ?? [];
  const sizeChartUrl = product?.SizeChart?.[0]?.url;
  const canShowUpload =
    product?.ProductUploadStatus !== 'Approved' &&
    product?.ProductUploadStatus !== 'pendingapproval' &&
    images.length > 0;

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-[#f8fafc] py-6 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto w-full">
          <Skeleton className="h-10 w-48 mb-6" />
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
              <Skeleton className="aspect-square" />
              <div className="p-6 md:p-8 space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-12 w-1/3" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="w-full min-h-screen bg-[#f8fafc] py-6 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto w-full">
          <Button
            variant="ghost"
            onClick={() => navigate('/sellerhub')}
            className="mb-6 text-gray-600 hover:text-[#C64091]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to My Products
          </Button>
          <div className="bg-white rounded-xl shadow-sm border border-red-200 p-8 text-center">
            <p className="text-red-600 font-medium">{error || 'Product not found'}</p>
            <Button
              variant="outline"
              onClick={() => navigate('/sellerhub')}
              className="mt-4"
            >
              Go to Seller Hub
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isTextileStyle =
    ['Textile', 'Lifestyle', 'Office Supply', 'Others'].includes(
      product?.ProductCategoryName
    ) || !product?.ProductCategoryName;

  return (
    <div className="w-full min-h-screen bg-[#f8fafc] py-6 pb-12 px-4 sm:px-6 lg:px-8" data-testid="product-preview-page">
      <div className="max-w-6xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-center relative py-6 border-b border-gray-100">
          <Button
            variant="ghost"
            size="icon"
            onClick={product?.ProductUploadStatus === 'Approved' ? () => navigate('/sellerhub') : handleBack}
            className="absolute left-0 text-gray-600 hover:text-[#C64091]"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold text-gray-900">Preview Page</h1>
        </div>

        {/* Main content */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
          {/* Image carousel */}
          <div className="flex flex-col items-center">
            {images.length === 0 ? (
              <div className="w-full aspect-square max-w-[450px] rounded-2xl border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center">
                <p className="text-gray-500 font-medium">No Image Uploaded</p>
              </div>
            ) : (
              <Carousel className="w-full max-w-[450px]">
                <CarouselContent>
                  {images.map((img, idx) => (
                    <CarouselItem key={idx}>
                      <div
                        className="aspect-square rounded-2xl bg-cover bg-center bg-no-repeat"
                        style={{
                          backgroundImage: `url(${img?.url || defaultImage})`,
                        }}
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {images.length > 1 && (
                  <>
                    <CarouselPrevious className="left-0" />
                    <CarouselNext className="right-0" />
                  </>
                )}
              </Carousel>
            )}
          </div>

          {/* Product info */}
          <div className="flex flex-col gap-4">
            <div>
              <Badge
                className={cn(
                  product?.ProductUploadStatus === 'Approved'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-amber-100 text-amber-700'
                )}
              >
                {product?.ProductUploadStatus || 'Draft'}
              </Badge>
              <h1
                className="mt-2 text-xl font-semibold text-gray-900 md:text-2xl"
                data-testid="product-name"
              >
                {product?.ProductName}
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                {[product?.ProductCategoryName, product?.ProductSubCategoryName].filter(Boolean).join(' / ')}
              </p>
            </div>

            {variants.length > 1 && (
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-2">
                  Select Variant
                </label>
                <select
                  value={selectedVariant ?? ''}
                  onChange={(e) => setSelectedVariant(e.target.value)}
                  className="w-full max-w-md rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C64091]"
                >
                  {variants.map((v) => (
                    <option key={v._id ?? v.id} value={v._id ?? v.id}>
                      ID: {v.ProductIdType || 'N/A'} /{' '}
                      {v.ProductSize || v.flavor || v.NutritionInfo || 'N/A'}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <DiscountedPriceDisplay
              regularPrice={selectedVariantData?.PricePerUnit}
              discountPrice={selectedVariantData?.DiscountedPrice}
              percentage={selectedVariantData?.GST}
            />

            {/* Colors */}
            {product?.ProductCategoryName !== 'QSR' &&
              product?.ProductCategoryName !== 'FMCG' &&
              selectedVariantData?.ProductColor && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Colors</p>
                  <div
                    className="w-10 h-10 rounded-xl border-2 border-gray-300"
                    style={{ backgroundColor: selectedVariantData.ProductColor }}
                  />
                </div>
              )}

            {product?.gender && (
              <div>
                <p className="text-sm font-medium text-gray-600">Gender</p>
                <p className="text-gray-900 capitalize">{product.gender}</p>
              </div>
            )}

            {/* Variant table */}
            {selectedVariantData && (
              <div className="mt-4 rounded-xl border border-gray-200 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="text-center">Disc. MRP</TableHead>
                      <TableHead className="text-center">Sizes</TableHead>
                      <TableHead className="text-center">Min QTY</TableHead>
                      <TableHead className="text-center">Max QTY</TableHead>
                      <TableHead className="text-center">GST</TableHead>
                      <TableHead className="text-center">HSN</TableHead>
                      <TableHead className="text-center">Product Size</TableHead>
                      <TableHead className="text-center">Product ID</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="text-center font-medium">
                        <span className="flex items-center justify-center gap-1">
                          <Check className="h-4 w-4 text-green-600 shrink-0" />
                          <CircleDollarSign className="h-4 w-4" />
                          {formatPrice(selectedVariantData.DiscountedPrice) || 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        {selectedVariantData.ShoeSize != null
                          ? `${selectedVariantData.ShoeSize} ${selectedVariantData.MeasurementUnit || ''}`
                          : selectedVariantData.ProductSize ||
                            selectedVariantData.NutritionInfo ||
                            (selectedVariantData.length && selectedVariantData.MeasurementUnit
                              ? `${selectedVariantData.length} ${selectedVariantData.MeasurementUnit}`
                              : 'N/A')}
                      </TableCell>
                      <TableCell className="text-center">
                        {selectedVariantData.MinOrderQuantity ?? 'N/A'}
                      </TableCell>
                      <TableCell className="text-center">
                        {selectedVariantData.MaxOrderQuantity ?? 'N/A'}
                      </TableCell>
                      <TableCell className="text-center">
                        {selectedVariantData.GST ? `${selectedVariantData.GST}%` : 'N/A'}
                      </TableCell>
                      <TableCell className="text-center">
                        {selectedVariantData.HSN ?? 'N/A'}
                      </TableCell>
                      <TableCell className="text-center">
                        {selectedVariantData.ProductSize ?? 'N/A'}
                      </TableCell>
                      <TableCell className="text-center">
                        {selectedVariantData.ProductIdType ?? 'N/A'}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Size chart */}
            {(isTextileStyle || product?.ProductCategoryName === 'Textile') && (
              <div className="relative inline-block">
                <button
                  type="button"
                  className="text-[#1A56DB] font-semibold text-sm hover:underline"
                  onMouseEnter={() => setShowSizeChart(true)}
                  onMouseLeave={() => setShowSizeChart(false)}
                >
                  Size Chart
                </button>
                {showSizeChart && (
                  <div
                    className="absolute left-0 top-full z-20 mt-2 bg-white rounded-lg shadow-lg p-2 border border-gray-200"
                    onMouseEnter={() => setShowSizeChart(true)}
                    onMouseLeave={() => setShowSizeChart(false)}
                  >
                    {sizeChartUrl ? (
                      <img
                        src={sizeChartUrl}
                        alt="Size chart"
                        className="h-[300px] w-auto object-contain max-w-[400px]"
                      />
                    ) : (
                      <p className="text-gray-500 text-sm px-4 py-2">Size Chart Unavailable</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-10 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <Tabs defaultValue="1" className="w-full">
            <TabsList className="w-full justify-start border-b bg-gray-50 px-4 h-14 gap-8">
              <TabsTrigger
                value="1"
                className="relative pb-3 text-sm font-medium text-gray-600 
                data-[state=active]:text-[#1E40AF] 
                data-[state=active]:after:absolute 
                data-[state=active]:after:-bottom-[1px] 
                data-[state=active]:after:left-0 
                data-[state=active]:after:h-[3px] 
                data-[state=active]:after:w-full 
                data-[state=active]:after:bg-[#1E40AF]"
              >
                Description
              </TabsTrigger>

              <TabsTrigger
                value="2"
                className="relative pb-3 text-sm font-medium text-gray-600 
                data-[state=active]:text-[#1E40AF] 
                data-[state=active]:after:absolute 
                data-[state=active]:after:-bottom-[1px] 
                data-[state=active]:after:left-0 
                data-[state=active]:after:h-[3px] 
                data-[state=active]:after:w-full 
                data-[state=active]:after:bg-[#1E40AF]"
              >
                Technical Information
              </TabsTrigger>

              <TabsTrigger
                value="3"
                className="relative pb-3 text-sm font-medium text-gray-600 
                data-[state=active]:text-[#1E40AF] 
                data-[state=active]:after:absolute 
                data-[state=active]:after:-bottom-[1px] 
                data-[state=active]:after:left-0 
                data-[state=active]:after:h-[3px] 
                data-[state=active]:after:w-full 
                data-[state=active]:after:bg-[#1E40AF]"
              >
                Key Features
              </TabsTrigger>
            </TabsList>

            <div className="p-6">
              <TabsContent value="1" className="mt-0">
                {(() => {
                  const loc = product?.LocationDetails || product?.locationDetails || {};
                  const hasLoc = loc.region || loc.state || loc.city || loc.landmark || loc.pincode;
                  return (
                <div className="space-y-4">
                  <p className="text-gray-600">{product?.ProductSubtittle || product?.ProductSubtitle || product?.ProductDescription || 'No description available.'}</p>
                  {product?.ModelName && (
                    <div>
                      <p className="text-sm font-semibold text-[#1E40AF]">Model Name</p>
                      <p className="text-gray-700 mt-1">{product.ModelName}</p>
                    </div>
                  )}

                  {/* Sample Details */}
                  <div>
                    <p className="text-sm font-semibold text-[#1E40AF] mb-2">Sample Details</p>
                    <p className="text-gray-700">Sample Available : {variants.some((v) => v.SampleAvailability) ? 'Yes' : 'No'}</p>
                  </div>

                  {/* Product Pickup Location */}
                  {hasLoc && (
                    <div>
                      <p className="text-sm font-semibold text-[#1E40AF] mb-2">Product Pickup Location & Pincode</p>
                      <div className="flex flex-wrap gap-6 mt-2">
                        {loc.region && (
                          <div>
                            <p className="text-xs text-gray-500">Region</p>
                            <p className="text-gray-700">{loc.region}</p>
                          </div>
                        )}
                        {loc.state && (
                          <div>
                            <p className="text-xs text-gray-500">State</p>
                            <p className="text-gray-700">{loc.state}</p>
                          </div>
                        )}
                        {loc.city && (
                          <div>
                            <p className="text-xs text-gray-500">City</p>
                            <p className="text-gray-700">{loc.city}</p>
                          </div>
                        )}
                        {loc.landmark && (
                          <div>
                            <p className="text-xs text-gray-500">Landmark</p>
                            <p className="text-gray-700">{loc.landmark}</p>
                          </div>
                        )}
                        {loc.pincode && (
                          <div>
                            <p className="text-xs text-gray-500">Pincode</p>
                            <p className="text-gray-700">{loc.pincode}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Listing Period */}
                  {product?.listperiod && (
                    <div>
                      <p className="text-sm font-semibold text-[#1E40AF]">This product is listed for</p>
                      <p className="text-gray-700 mt-1">{product.listperiod} Days</p>
                    </div>
                  )}

                  {/* Additional Cost */}
                  <div>
                    <p className="text-sm font-semibold text-[#1E40AF] mb-2">Additional Cost</p>
                    {product?.OtherCost?.length > 0 ? (
                      <div className="space-y-2">
                        {product.OtherCost.map((cost, i) => (
                          <div key={i} className="flex flex-wrap gap-4 text-sm">
                            <span>Applicable on - {cost.AdCostApplicableOn}</span>
                            <span>Reason of Cost - {cost.ReasonOfCost}</span>
                            <span>HSN - {cost.AdCostHSN}</span>
                            <span>GST - {cost.AdCostGST}%</span>
                            <span>
                              Cost - {formatPrice(cost.CostPrice)} {cost.currencyType === 'BXITokens' ? 'BXI' : '₹'}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-700">No</p>
                    )}
                  </div>

                  {/* Manufacturing & Expiry Date */}
                  {(product?.ManufacturingDate || product?.ManufacturingData) && (
                    <div className="flex flex-wrap gap-8">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Manufacturing Date</p>
                        <p className="text-gray-700 mt-1">
                          {new Date(product.ManufacturingDate || product.ManufacturingData).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Expiry Date</p>
                        <p className="text-gray-700 mt-1">
                          {product?.ExpiryDate ? new Date(product.ExpiryDate).toLocaleDateString() : 'Not Given'}
                        </p>
                      </div>
                    </div>
                  )}

                </div>
                  );
                })()}
              </TabsContent>
              <TabsContent value="2" className="mt-0">
                {(() => {
                  const ti = product?.ProductTechInfo;
                  const hasAny =
                    ti?.WeightBeforePackingPerUnit ||
                    ti?.Height ||
                    ti?.Width ||
                    ti?.Length ||
                    ti?.Warranty ||
                    ti?.GuaranteePeriod ||
                    ti?.PackagingDetails ||
                    ti?.LegalCompliance ||
                    ti?.PackagingType ||
                    ti?.UsageInstructions ||
                    ti?.CareInstructions ||
                    ti?.SafetyWarnings || 
                    ti?.Certifications; 
                  
                  if (!hasAny) {
                    return <p className="text-gray-500">No technical information available.</p>;
                  }
                  
                  return (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {ti?.Warranty && (
                          <div>
                            <p className="text-base font-semibold text-[#1E40AF] mb-2">Warranty</p>
                            <p className="font-medium text-gray-900 mt-1">{ti.Warranty}</p>
                          </div>
                        )}
                        {ti?.GuaranteePeriod && (
                          <div>
                            <p className="text-base font-semibold text-[#1E40AF] mb-2">Guarantee Period</p>
                            <p className="font-medium text-gray-900 mt-1">{ti.GuaranteePeriod}</p>
                          </div>
                        )}
                      </div>

                      {(ti?.Height || ti?.Width || ti?.Length) && (
                        <div>
                          <p className="text-base font-semibold text-[#1E40AF] mb-2">Dimensions</p>
                          <div className="grid grid-cols-3 gap-4">
                            {ti?.Height && (
                              <div>
                                <p className="text-sm text-gray-600">Height</p>
                                <p className="font-medium text-gray-900">{ti.Height}</p>
                              </div>
                            )}
                            {ti?.Width && (
                              <div>
                                <p className="text-sm text-gray-600">Width</p>
                                <p className="font-medium text-gray-900">{ti.Width}</p>
                              </div>
                            )}
                            {ti?.Length && (
                              <div>
                                <p className="text-sm text-gray-600">Length</p>
                                <p className="font-medium text-gray-900">{ti.Length}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {ti?.WeightBeforePackingPerUnit && (
                        <div>
                          <p className="text-base font-semibold text-[#1E40AF] mb-2">Packaging Information</p>
                          <div className="flex items-start gap-3">
                            <Scale className="h-10 w-10 text-gray-500 shrink-0" />
                            <div>
                              <p className="text-sm text-gray-600">Product Weight Before Packaging</p>
                              <p className="font-medium text-gray-900">
                                {ti.WeightBeforePackingPerUnit}{' '}
                                {product.WeightBeforePackingPerUnitMeasurUnit || product.UnitOfWeight || 'Grams'}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {ti?.PackagingDetails && (
                        <div>
                          <p className="text-base font-semibold text-[#1E40AF] mb-2">Packaging Details</p>
                          <p className="text-gray-700">{ti.PackagingDetails}</p>
                        </div>
                      )}

                      {ti?.GuaranteeDetails && (
                        <div>
                          <p className="text-base font-semibold text-[#1E40AF] mb-2">Guarantee Details</p>
                          <p className="text-gray-700">{ti.GuaranteeDetails}</p>
                        </div>
                      )}

                      {ti?.PackagingType && (
                        <div>
                          <p className="text-base font-semibold text-[#1E40AF] mb-2">Packaging Type</p>
                          <p className="text-gray-700">{ti.PackagingType}</p>
                        </div>
                      )}

                      {ti?.UsageInstructions && (
                        <div>
                          <p className="text-base font-semibold text-[#1E40AF] mb-2">Instructions to use product</p>
                          <p className="text-gray-700">{ti.UsageInstructions}</p>
                        </div>
                      )}

                      {ti?.CareInstructions && (
                        <div>
                          <p className="text-base font-semibold text-[#1E40AF] mb-2">Care Instructions</p>
                          <p className="text-gray-700">{ti.CareInstructions}</p>
                        </div>
                      )}

                      {ti?.SafetyWarnings && (
                        <div>
                          <p className="text-base font-semibold text-[#1E40AF] mb-2">Safety Warnings</p>
                          <p className="text-gray-700">{ti.SafetyWarnings}</p>
                        </div>
                      )}

                      {ti?.Certifications && (
                        <div>
                          <p className="text-base font-semibold text-[#1E40AF] mb-2">Certifications</p>
                          <p className="text-gray-700">{ti.Certifications}</p>
                        </div>
                      )}

                      {ti?.LegalCompliance && (
                        <div>
                          <p className="text-base font-semibold text-[#1E40AF] mb-2">Legal Information</p>
                          <p className="text-gray-700">{ti.LegalCompliance}</p>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </TabsContent>
              <TabsContent value="3" className="mt-0">
                <div>
                  <p className="text-base font-semibold text-[#156DB6] mb-4">Key Features</p>
                  {product?.ProductFeatures?.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {product.ProductFeatures.map((f, i) => (
                        <FeatureItem key={i} name={f?.FeatureName || f?.name} description={f?.FeatureDesc || f?.FeatureDescription || f?.description || ''} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No key features available.</p>
                  )}
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Upload Product button */}
        {canShowUpload && (
          <div className="mt-8 flex justify-center">
            <Button
              onClick={handleUpload}
              disabled={uploading}
              className="bg-[#C64091] hover:bg-[#A03375] px-8"
            >
              {uploading ? 'Uploading...' : 'Upload Product'}
            </Button>
          </div>
        )}

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-end">
          <Button variant="outline" onClick={() => navigate('/sellerhub')} data-testid="btn-back-listing">
            Back to Listing
          </Button>
          <Button
            onClick={() => {
              const cat = product?.ProductCategoryName;
              const slug = CATEGORY_TO_SLUG[cat] || 'textile';
              navigate(`/${slug}/general-info/${id}`);
            }}
            className="bg-[#C64091] hover:bg-[#A03375]"
            data-testid="btn-edit-product"
          >
            Edit Product
          </Button>
        </div>
      </div>
    </div>
  );
}
