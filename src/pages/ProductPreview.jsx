import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Package } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';

const defaultImage = 'https://images.unsplash.com/photo-1612538498488-226257115cc4?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2MDV8MHwxfHNlYXJjaHwzfHxtb2Rlcm4lMjBtaW5pbWFsaXN0JTIwcHJvZHVjdCUyMHBhY2thZ2luZyUyMHdoaXRlJTIwYmFja2dyb3VuZHxlbnwwfHx8fDE3NzA3OTI2MDh8MA&ixlib=rb-4.1.0&q=85';

export default function ProductPreview() {
  const navigate = useNavigate();
  const { id } = useParams();

  // Mock product data - in real implementation, fetch by id
  const product = {
    _id: id,
    ProductName: 'Sample Product',
    ProductCategoryName: 'Electronics',
    ProductSubCategoryName: 'Gadgets',
    ListingType: 'Product',
    ProductUploadStatus: 'Approved',
    ProductDescription: 'This is a sample product description. In the real implementation, this would be fetched from the API based on the product ID.',
    ProductImages: [{ url: defaultImage }],
    ProductsVariantions: [
      { PricePerUnit: 2999, DiscountedPrice: 2499 }
    ],
    TechnicalDetails: {
      weight: '0.5 kg',
      dimensions: '15 x 10 x 5 cm',
      material: 'Plastic, Metal',
      warranty: '1 Year',
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] py-8" data-testid="product-preview-page">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/sellerhub')}
          className="mb-6 text-gray-600 hover:text-[#C64091]"
          data-testid="btn-back-to-listing"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to My Products
        </Button>

        {/* Product Details Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Image Gallery */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            <div className="aspect-square bg-gray-100">
              <img
                src={product.ProductImages?.[0]?.url || defaultImage}
                alt={product.ProductName}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = defaultImage; }}
              />
            </div>
            
            {/* Product Info */}
            <div className="p-6 md:p-8 flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <Badge className="bg-emerald-100 text-emerald-700 mb-2">
                    {product.ProductUploadStatus}
                  </Badge>
                  <h1 
                    className="text-2xl font-bold text-gray-900"
                    style={{ fontFamily: 'Manrope, sans-serif' }}
                    data-testid="product-name"
                  >
                    {product.ProductName}
                  </h1>
                </div>
                {product.ListingType === 'Voucher' && (
                  <Badge className="bg-[#C64091] text-white">
                    Voucher
                  </Badge>
                )}
              </div>

              <p className="text-gray-500 text-sm mb-4">
                {product.ProductCategoryName} 
                {product.ProductSubCategoryName && ` / ${product.ProductSubCategoryName}`}
              </p>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-[#C64091]">
                    ₹{product.ProductsVariantions?.[0]?.DiscountedPrice?.toLocaleString('en-IN')}
                  </span>
                  {product.ProductsVariantions?.[0]?.PricePerUnit !== product.ProductsVariantions?.[0]?.DiscountedPrice && (
                    <span className="text-lg text-gray-400 line-through">
                      ₹{product.ProductsVariantions?.[0]?.PricePerUnit?.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">Inclusive of all taxes</p>
              </div>

              {/* Description */}
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {product.ProductDescription}
                </p>
              </div>
            </div>
          </div>

          {/* Technical Details */}
          <div className="border-t border-gray-200 p-6 md:p-8">
            <h3 className="font-semibold text-gray-900 mb-4" style={{ fontFamily: 'Manrope, sans-serif' }}>
              Technical Details
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {product.TechnicalDetails?.weight && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Weight</p>
                  <p className="font-medium text-gray-900 mt-1">{product.TechnicalDetails.weight}</p>
                </div>
              )}
              {product.TechnicalDetails?.dimensions && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Dimensions</p>
                  <p className="font-medium text-gray-900 mt-1">{product.TechnicalDetails.dimensions}</p>
                </div>
              )}
              {product.TechnicalDetails?.material && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Material</p>
                  <p className="font-medium text-gray-900 mt-1">{product.TechnicalDetails.material}</p>
                </div>
              )}
              {product.TechnicalDetails?.warranty && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Warranty</p>
                  <p className="font-medium text-gray-900 mt-1">{product.TechnicalDetails.warranty}</p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="border-t border-gray-200 p-6 md:p-8 bg-gray-50">
            <div className="flex flex-col sm:flex-row gap-4 justify-end">
              <Button
                variant="outline"
                onClick={() => navigate('/sellerhub')}
                data-testid="btn-back-listing"
              >
                Back to Listing
              </Button>
              <Button
                onClick={() => navigate(`/textile/general-info/${id}`)}
                className="bg-[#C64091] hover:bg-[#A03375]"
                data-testid="btn-edit-product"
              >
                Edit Product
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
