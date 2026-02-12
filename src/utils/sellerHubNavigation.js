/**
 * Resolves the route path for Edit or View actions from Seller Hub
 * Based on product type, company type, listing type, and action
 */

// Category route mappings for products
const categoryRoutes = {
  'Textile': '/textile',
  'Electronics': '/electronics',
  'FMCG': '/fmcg',
  'Office Supply': '/officesupply',
  'Lifestyle': '/lifestyle',
  'Mobility': '/mobility',
  'Others': '/others',
  'QSR': '/restaurant',
  'Hotel': '/hotelsVoucher',
  'Airline Tickets': '/airlineVoucher',
  'Entertainment & Events': '/eeVoucher',
};

// Voucher route mappings
const voucherRoutes = {
  'Textile': '/textileVoucher',
  'Electronics': '/electronicsVoucher',
  'FMCG': '/fmcgVoucher',
  'Office Supply': '/officesupplyVoucher',
  'Lifestyle': '/lifestyleVoucher',
  'Mobility': '/mobilityVoucher',
  'Others': '/otherVoucher',
  'QSR': '/qsrVoucher',
  'Hotel': '/hotelsVoucher',
  'Airline Tickets': '/airlineVoucher',
  'Entertainment & Events': '/eeVoucher',
};

// Media category mappings
const mediaRoutes = {
  'Multiplex ADs': '/mediaonline',
  'Digital ADs': '/mediaonline',
  'Hoardings': '/mediaoffline',
  'News Paper & Magazine': '/mediaoffline',
};

// Preview route mappings
const previewRoutes = {
  'Textile': '/textilepreviewpage',
  'Electronics': '/electronicsproductpreview',
  'FMCG': '/fmcgproductpreview',
  'Office Supply': '/allproductpreview',
  'Lifestyle': '/allproductpreview',
  'Mobility': '/mobilityproductpreview',
  'Others': '/allproductpreview',
  'QSR': '/RestaurantProductPreview',
  'Hotel': '/allvoucherpreview',
  'Media': '/mediaonlineproductpreview',
};

// Step mappings for edit navigation (based on reviewReasonNavigation)
const stepMappings = {
  'generalinformation': '/general-info',
  'productinformation': '/product-info',
  'technicalinformation': '/tech-info',
  'golive': '/go-live',
};

// Hotel voucher uses different step names (per bxi-dashboard)
const hotelVoucherStepMappings = {
  'generalinformation': '/generalinformation',
  'productinformation': '/hotelsproductinfo',
  'technicalinformation': '/hotelstechinfo',
  'golive': '/hotelsgolive',
};

/**
 * Resolve the route for Edit or View action from Seller Hub
 * @param {Object} params
 * @param {Object} params.product - The product object
 * @param {string} params.companyType - Company type name (e.g., 'Textile', 'Media')
 * @param {string} params.action - 'edit' or 'view'
 * @param {string} params.reviewReasonNavigation - Optional step for edit navigation
 * @returns {string} - The route path
 */
export const resolveSellerHubRoute = ({ product, companyType, action, reviewReasonNavigation }) => {
  const productId = product?._id;
  const listingType = product?.ListingType;
  const productCategory = product?.ProductCategoryName;
  const productSubCategory = product?.ProductSubCategoryName;
  const voucherType = product?.VoucherType;
  const isBulkUpload = !!product?.bulk_upload_res_id;

  if (!productId) {
    console.warn('No product ID found');
    return '/sellerhub';
  }

  // Handle View action
  if (action === 'view') {
    return resolveViewRoute({ product, companyType, listingType, productCategory, productSubCategory, productId });
  }

  // Handle Edit action
  if (action === 'edit') {
    return resolveEditRoute({ 
      product, 
      companyType, 
      listingType, 
      productCategory, 
      productSubCategory, 
      voucherType,
      productId, 
      reviewReasonNavigation,
      isBulkUpload 
    });
  }

  return '/sellerhub';
};

/**
 * Resolve View route
 */
const resolveViewRoute = ({ product, companyType, listingType, productCategory, productSubCategory, productId }) => {
  // Handle Media company type
  if (companyType === 'Media') {
    if (productCategory === 'Multiplex ADs') {
      if (productSubCategory === 'Digital ADs') {
        return `/mediaonlineproductpreview/${productId}`;
      }
      return `/multiplexmediaonlineproductpreview/${productId}`;
    }
    if (productCategory === 'Hoardings' || productSubCategory === 'Hoardings') {
      return `/mediaonlineproductpreview/${productId}`;
    }
    return `/mediaonlineproductpreview/${productId}`;
  }

  // Handle Voucher listing type
  if (listingType === 'Voucher') {
    const voucherType = product?.VoucherType;
    if (voucherType?.includes('Value Voucher') || voucherType?.includes('Gift Card')) {
      return `/valueandgiftvoucher/${productId}`;
    }
    if (voucherType?.includes('Offer Specific')) {
      return `/spacificvoucher/${productId}`;
    }
    return `/allvoucherpreview/${productId}`;
  }

  // Handle Product listing type
  const previewRoute = previewRoutes[companyType] || '/allproductpreview';
  return `${previewRoute}/${productId}`;
};

/**
 * Resolve Edit route
 */
const resolveEditRoute = ({ 
  product, 
  companyType, 
  listingType, 
  productCategory, 
  productSubCategory,
  voucherType,
  productId, 
  reviewReasonNavigation,
  isBulkUpload 
}) => {
  // Determine step from reviewReasonNavigation
  const step = reviewReasonNavigation ? stepMappings[reviewReasonNavigation] || '/general-info' : '/general-info';

  // Handle bulk upload products
  if (isBulkUpload) {
    return `/mediaSheetsProductsPreview/${productId}`;
  }

  // Handle Media company type (multiplex, digital, hoarding have specific step routes)
  if (companyType === 'Media') {
    const reviewKey = (reviewReasonNavigation || 'productinformation').toLowerCase();
    if (productCategory === 'Multiplex ADs') {
      if (productSubCategory === 'Digital ADs') {
        const digitalSteps = { productinformation: 'mediaonlinedigitalscreensinfo', technicalinformation: 'mediaonlinedigitalscreenstechinfo', golive: 'digitalscreensgolive' };
        const digitalStep = digitalSteps[reviewKey] || 'mediaonlinedigitalscreensinfo';
        return `/mediaonline/${digitalStep}/${productId}`;
      }
      const multiplexSteps = { productinformation: 'mediaonlinemultiplexproductinfo', technicalinformation: 'mediamultiplextechinfo', golive: 'go-live' };
      const multiplexStep = multiplexSteps[reviewKey] || 'mediaonlinemultiplexproductinfo';
      return `/mediaonline/${multiplexStep}/${productId}`;
    }
    if (productCategory === 'Hoardings' || productSubCategory === 'Hoardings') {
      const hoardingSteps = { productinformation: 'mediaofflinehoardinginfo', technicalinformation: 'mediaofflinehoardingtechinfo', golive: 'hoardingsgolive' };
      const hoardingStep = hoardingSteps[reviewKey] || 'mediaofflinehoardinginfo';
      return `/mediaoffline/${hoardingStep}/${productId}`;
    }
    return `/mediaoffline/product-info/${productId}`;
  }

  // Handle Voucher listing type
  if (listingType === 'Voucher') {
    const voucherRoute = voucherRoutes[companyType];
    if (voucherRoute) {
      // Hotel voucher uses different step names (hotelsproductinfo, hotelstechinfo, hotelsgolive)
      const isHotel = companyType === 'Hotel' || companyType === 'Hotels';
      const reviewKey = (reviewReasonNavigation || '').toLowerCase();
      if (isHotel && hotelVoucherStepMappings[reviewKey]) {
        return `${voucherRoute}${hotelVoucherStepMappings[reviewKey]}/${productId}`;
      }
      // Generic voucher step mapping: product step 2->techinfo, 3->golive, 4->voucherdesign
      const voucherStepMap = {
        '/general-info': '/generalinformation',
        '/product-info': '/techinfo',
        '/tech-info': '/golive',
        '/go-live': '/voucherdesign',
      };
      const voucherStep = voucherStepMap[step] || '/generalinformation';
      return `${voucherRoute}${voucherStep}/${productId}`;
    }
    return `/voucher/voucherinfo/${productId}`;
  }

  // Handle Product listing type
  const categoryRoute = categoryRoutes[companyType];
  if (categoryRoute) {
    return `${categoryRoute}${step}/${productId}`;
  }

  // Default fallback
  return `/others${step}/${productId}`;
};

/**
 * Get category options based on company type
 */
export const getCategoryOptions = (companyType) => {
  if (companyType === 'Media') {
    return [
      { value: 'mediaonline', label: 'Media Online' },
      { value: 'mediaoffline', label: 'Media Offline' },
    ];
  }

  return [
    { value: 'textile', label: 'Textile' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'fmcg', label: 'FMCG' },
    { value: 'officesupply', label: 'Office Supply' },
    { value: 'lifestyle', label: 'Lifestyle' },
    { value: 'mobility', label: 'Mobility' },
    { value: 'others', label: 'Others' },
    { value: 'restaurant', label: 'Restaurant/QSR' },
  ];
};

/**
 * Get voucher options based on company type
 */
export const getVoucherOptions = (companyType) => {
  return [
    { value: 'electronicsVoucher', label: 'Electronics Voucher' },
    { value: 'fmcgVoucher', label: 'FMCG Voucher' },
    { value: 'mobilityVoucher', label: 'Mobility Voucher' },
    { value: 'officesupplyVoucher', label: 'Office Supply Voucher' },
    { value: 'eeVoucher', label: 'Entertainment & Events Voucher' },
    { value: 'textileVoucher', label: 'Textile Voucher' },
    { value: 'lifestyleVoucher', label: 'Lifestyle Voucher' },
    { value: 'airlineVoucher', label: 'Airline Voucher' },
    { value: 'qsrVoucher', label: 'QSR Voucher' },
    { value: 'otherVoucher', label: 'Other Voucher' },
    { value: 'hotelsVoucher', label: 'Hotels Voucher' },
  ];
};

export default resolveSellerHubRoute;
