/**
 * Category-wise form configuration for Add Product journey.
 * Maps fields, dropdowns, validation, and API endpoints per category.
 * Aligned with bxi-dashboard productCategories.js.
 */

// Subcategory API endpoint keys (used for subcategory fetch)
export const SUBCATEGORY_ENDPOINTS = {
  textile: 'subcategory/getsubcategory',
  electronics: 'electronicsubcategory/electronicssubcategory',
  officesupply: 'officesupplyubcategory/officesubcategory',
  fmcg: 'fmcgsub/Get_fmcg_subcategory',
  mobility: 'mobilitysub/mobilitysubcategory',
  restaurant: 'restaurantsub/getrestuarantsubcategory',
  others: 'OtherSub/Get_other_Sub',
  lifestyle: 'lifestylesubcategory/lifestylegetsubcategory',
  mediaonline: 'mediaonlinesub/Get_media_onlinesingle',
  mediaoffline: 'mediaofflinesub/Get_media_offline',
  hotelsVoucher: 'hotelsub/Get_hotel_subcategory',
  electronicsVoucher: 'electronicsubcategory/electronicssubcategory',
  fmcgVoucher: 'fmcgsub/Get_fmcg_subcategory',
  mobilityVoucher: 'mobilitysub/mobilitysubcategory',
  officesupplyVoucher: 'officesupplyubcategory/officesubcategory',
  eeVoucher: 'entertainmentsub/Get_enter_sub',
  textileVoucher: 'subcategory/getsubcategory',
  lifestyleVoucher: 'lifestylesubcategory/lifestylegetsubcategory',
  qsrVoucher: 'restaurantsub/getrestuarantsubcategory',
  otherVoucher: 'OtherSub/Get_other_Sub',
  airlineVoucher: 'airfeature/Get_airline_feature',
};

// Product type / API product type per category
export const PRODUCT_TYPE_BY_CATEGORY = {
  textile: 'Textile',
  electronics: 'Electronics',
  officesupply: 'Office Supply',
  fmcg: 'FMCG',
  mobility: 'Mobility',
  restaurant: 'QSR',
  others: 'Others',
  lifestyle: 'Lifestyle',
  mediaonline: 'Media',
  mediaoffline: 'Media',
  hotelsVoucher: 'Hotel',
  electronicsVoucher: 'Electronics',
  fmcgVoucher: 'FMCG',
  mobilityVoucher: 'Mobility',
  officesupplyVoucher: 'Office Supply',
  eeVoucher: 'Entertainment & Events',
  textileVoucher: 'Textile',
  lifestyleVoucher: 'Lifestyle',
  qsrVoucher: 'QSR',
  airlineVoucher: 'Airline Tickets',
  otherVoucher: 'Others',
};

// API paths for each step (product-info, tech-info, go-live)
export const STEP_API_PATHS = {
  textile: { productInfo: 'texttileproductinfo', techInfo: 'technicalinfo', goLive: 'golive' },
  electronics: { productInfo: 'electronicsproductinfo', techInfo: 'electronicstechinfo', goLive: 'electronicsgolive' },
  fmcg: { productInfo: 'fmcgproductinfo', techInfo: 'fmcgtechinfo', goLive: 'fmcggolive' },
  officesupply: { productInfo: 'officesupplyproductinfo', techInfo: 'officesupplytechinfo', goLive: 'officesupplygolive' },
  mobility: { productInfo: 'mobilityproductinfo', techInfo: 'mobilitytechinfo', goLive: 'mobilitygolive' },
  restaurant: { productInfo: 'restaurantproductinfo', techInfo: 'restauranttechinfo', goLive: 'restaurantgolive' },
  others: { productInfo: 'othersproductinfo', techInfo: 'otherstechinfo', goLive: 'othersgolive' },
  lifestyle: { productInfo: 'lifestyleproductinfo', techInfo: 'lifestyletechinfo', goLive: 'lifestylegolive' },
  mediaonline: { productInfo: 'mediaonlineproductinfo', techInfo: 'mediaonlinetechinfo', goLive: 'mediaonlinegolive' },
  mediaoffline: { productInfo: 'mediaofflineproductinfo', techInfo: 'mediaofflinetechinfo', goLive: 'mediaofflinegolive' },
  hotelsVoucher: { productInfo: 'hotelsproductinfo', techInfo: 'hotelstechinfo', goLive: 'hotelsgolive' },
};

// Feature/key-fields API for Tech Info step
export const FEATURE_ENDPOINTS = {
  textile: 'textilefeature/Get_textile_feature',
  electronics: 'electronicfeature/Get_electronics_feature',
  fmcg: 'fmcgproinfo/Get_fmcg_productinfo',
  officesupply: 'officesupfeature/Get_officesupply_feature',
  mobility: 'mobilityfeature/Get_mobility_feature',
  restaurant: 'restuarantfeatures/Get_restaurant_feature',
  others: 'otherfeature/Get_other_feature',
  lifestyle: 'lifestylefeature/Get_lifestyle_feature',
  eeVoucher: 'entertainmentfeature/Get_enter_feature',
  airlineVoucher: 'airfeature/Get_airline_feature',
  mediaonline: 'mediaonlinesinfeature/Get_media_onlinesinglefea',
  mediaoffline: 'mediaonlinesinfeature/Get_media_onlinesinglefea',
};

/**
 * General Info step config per category
 */
export const GENERAL_INFO_CONFIG = {
  textile: {
    hasGenderSelection: true,
    hasSubtitle: true,
    hasRadioButtons: false,
    hasStarRating: false,
    fields: ['gender', 'subcategory', 'productname', 'productsubtitle', 'productdescription'],
    subcategoryDataPath: 'data',
  },
  electronics: {
    hasGenderSelection: false,
    hasSubtitle: true,
    hasRadioButtons: false,
    hasStarRating: false,
    fields: ['subcategory', 'productname', 'productsubtitle', 'productdescription'],
  },
  fmcg: {
    hasGenderSelection: false,
    hasSubtitle: true,
    hasRadioButtons: false,
    hasStarRating: false,
    fields: ['subcategory', 'productname', 'productsubtitle', 'productdescription'],
  },
  officesupply: {
    hasGenderSelection: false,
    hasSubtitle: true,
    hasRadioButtons: false,
    hasStarRating: false,
    fields: ['subcategory', 'productname', 'productsubtitle', 'productdescription'],
  },
  mobility: {
    hasGenderSelection: false,
    hasSubtitle: false,
    hasRadioButtons: true,
    radioButtonField: 'hasRegistrationProcess',
    radioButtonLabel: 'Does this product have a registration process?',
    hasStarRating: false,
    fields: ['subcategory', 'productname', 'productdescription', 'hasRegistrationProcess'],
  },
  restaurant: {
    hasGenderSelection: false,
    hasSubtitle: true,
    hasRadioButtons: false,
    hasStarRating: false,
    fields: ['subcategory', 'productname', 'productsubtitle', 'productdescription'],
  },
  others: {
    hasGenderSelection: false,
    hasSubtitle: true,
    hasRadioButtons: false,
    hasStarRating: false,
    fields: ['subcategory', 'productname', 'productsubtitle', 'productdescription'],
  },
  lifestyle: {
    hasGenderSelection: false,
    hasSubtitle: true,
    hasRadioButtons: false,
    hasStarRating: false,
    fields: ['subcategory', 'productname', 'productsubtitle', 'productdescription'],
  },
  mediaonline: {
    hasGenderSelection: false,
    hasSubtitle: true,
    hasRadioButtons: false,
    hasStarRating: false,
    fields: ['subcategory', 'productname', 'productsubtitle', 'productdescription'],
  },
  mediaoffline: {
    hasGenderSelection: false,
    hasSubtitle: true,
    hasRadioButtons: false,
    hasStarRating: false,
    fields: ['subcategory', 'productname', 'productsubtitle', 'productdescription'],
  },
  hotelsVoucher: {
    hasGenderSelection: false,
    hasSubtitle: true,
    hasRadioButtons: false,
    hasStarRating: true,
    starRatingField: 'HotelStars',
    starRatingLabel: 'Hotel Star Rating',
    fields: ['subcategory', 'productname', 'productsubtitle', 'productdescription', 'HotelStars'],
  },
  airlineVoucher: {
    hasGenderSelection: false,
    hasSubtitle: true,
    hasRadioButtons: false,
    hasStarRating: false,
    fields: ['subcategory', 'productname', 'productsubtitle', 'productdescription'],
  },
};

/**
 * Product Info step config – size options determine which variant fields to show
 */
export const PRODUCT_INFO_CONFIG = {
  textile: {
    sizeOptions: ['Shoes', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'XXXXL', 'Length', 'Length x Height', 'Length x Height x Width', 'Weight', 'Custom Size'],
    defaultSize: 'S',
    hasColorPicker: true,
    hasProductId: true,
    commonFields: ['price', 'discountedPrice', 'minOrderQty', 'maxOrderQty', 'gst', 'hsn'],
  },
  electronics: {
    sizeOptions: ['Weight', 'BatteryCapacity', 'PowerConsumption', 'StorageCapacity', 'Resolution', 'Amplification', 'Frequency', 'Length', 'Length x Height', 'Length x Height x Width', 'Custom Size'],
    defaultSize: 'Weight',
    hasColorPicker: true,
    hasProductId: true,
    commonFields: ['price', 'discountedPrice', 'minOrderQty', 'maxOrderQty', 'gst', 'hsn'],
  },
  fmcg: {
    sizeOptions: ['Length', 'Length x Height', 'Length x Height x Width', 'Volume', 'CalorieCount', 'ShelfLife', 'NutritionalInformation', 'Temprature', 'Custom Size'],
    defaultSize: 'Length',
    hasFormSelection: true, // dry/wet form
    hasColorPicker: true,
    hasProductId: true,
    commonFields: ['price', 'discountedPrice', 'minOrderQty', 'maxOrderQty', 'gst', 'hsn'],
  },
  officesupply: {
    sizeOptions: ['Length', 'Length x Height', 'Length x Height x Width', 'Weight', 'GSM', 'Custom Size'],
    defaultSize: 'Length',
    hasColorPicker: true,
    hasProductId: true,
    commonFields: ['price', 'discountedPrice', 'minOrderQty', 'maxOrderQty', 'gst', 'hsn'],
  },
  mobility: {
    sizeOptions: ['Weight', 'BatteryCapacity', 'PowerConsumption', 'Volume', 'Length', 'Length x Height', 'Length x Height x Width', 'Custom Size'],
    defaultSize: 'Length',
    hasColorPicker: true,
    hasProductId: true,
    commonFields: ['price', 'discountedPrice', 'minOrderQty', 'maxOrderQty', 'gst', 'hsn'],
  },
  restaurant: {
    sizeOptions: [], // Restaurant should not show size selection
    defaultSize: null,
    hideSizeSelection: true,
    hasColorPicker: true,
    hasProductId: true,
    commonFields: ['price', 'discountedPrice', 'minOrderQty', 'maxOrderQty', 'gst', 'hsn'],
  },
  others: {
    sizeOptions: ['Length', 'Length x Height', 'Length x Height x Width', 'GSM', 'Volume', 'CalorieCount', 'ShelfLife', 'NutritionalInformation', 'Temprature', 'Shoes', 'BatteryCapacity', 'PowerConsumption', 'Resolution', 'Amplification', 'Frequency', 'Humidity', 'Pressure', 'Custom Size'],
    defaultSize: 'Length',
    hasColorPicker: true,
    hasProductId: true,
    commonFields: ['price', 'discountedPrice', 'minOrderQty', 'maxOrderQty', 'gst', 'hsn'],
  },
  lifestyle: {
    sizeOptions: ['Shoes', 'Length', 'Length x Height', 'Length x Height x Width', 'Weight', 'Volume', 'Custom Size'],
    defaultSize: 'Length',
    hasColorPicker: true,
    hasProductId: true,
    commonFields: ['price', 'discountedPrice', 'minOrderQty', 'maxOrderQty', 'gst', 'hsn'],
  },
  mediaonline: {
    sizeOptions: ['Length', 'Length x Height', 'Length x Height x Width', 'Custom Size'],
    defaultSize: 'Length',
    hasColorPicker: false,
    hasProductId: true,
    commonFields: ['price', 'discountedPrice', 'minOrderQty', 'maxOrderQty', 'gst', 'hsn'],
  },
  mediaoffline: {
    sizeOptions: ['Length', 'Length x Height', 'Length x Height x Width', 'Custom Size'],
    defaultSize: 'Length',
    hasColorPicker: false,
    hasProductId: true,
    commonFields: ['price', 'discountedPrice', 'minOrderQty', 'maxOrderQty', 'gst', 'hsn'],
  },
  hotelsVoucher: {
    sizeOptions: [],
    defaultSize: null,
    hasColorPicker: false,
    hasProductId: true,
    commonFields: ['price', 'discountedPrice', 'minOrderQty', 'maxOrderQty', 'gst', 'hsn'],
  },
};

/**
 * Tech Info step config – feature/key fields from API
 */
export const TECH_INFO_CONFIG = {
  textile: { hasFeatureSelection: true, featureDataPath: 'data', featureNameField: 'SampleTextileFeature' },
  electronics: { hasFeatureSelection: true, featureDataPath: 'data', featureNameField: 'ElectronicsFeature' },
  fmcg: { hasFeatureSelection: true, featureDataPath: 'data', featureNameField: 'SampleFmcgFeature' },
  officesupply: { hasFeatureSelection: true, featureDataPath: 'data', featureNameField: 'SampleOfficeSupplyFeature' },
  mobility: { hasFeatureSelection: true, featureDataPath: 'data', featureNameField: 'SampleMobilityFeature' },
  restaurant: { hasFeatureSelection: true, featureDataPath: 'data', featureNameField: 'RestuarantQsrFeatureType' },
  others: { hasFeatureSelection: true, featureDataPath: 'data', featureNameField: 'SampleOtherFeature' },
  lifestyle: { hasFeatureSelection: true, featureDataPath: 'data', featureNameField: 'SampleLifestyleFeature' },
  mediaonline: { hasFeatureSelection: true, featureDataPath: 'data', featureNameField: 'MediaonlineFeaturesingle' },
  mediaoffline: { hasFeatureSelection: true, featureDataPath: 'data', featureNameField: 'MediaonlineFeaturesingle' },
  hotelsVoucher: { hasFeatureSelection: false },
  eeVoucher: { hasFeatureSelection: true, featureDataPath: 'data', featureNameField: 'EntertainmentFeature' },
  airlineVoucher: { hasFeatureSelection: true, featureDataPath: 'data', featureNameField: 'SampleAirlineFeature' },
};

/**
 * Date requirements for Manufacturing and Expiry dates per category
 */
export const DATE_REQUIREMENTS = {
  electronics: { manufacturing: 'mandatory', expiry: 'optional' },
  fmcg: { manufacturing: 'mandatory', expiry: 'mandatory' },
  officesupply: { manufacturing: 'optional', expiry: 'optional' },
  mobility: { manufacturing: 'optional', expiry: 'optional' },
  restaurant: { manufacturing: 'optional', expiry: 'optional' },
  others: { manufacturing: 'mandatory', expiry: 'optional' },
};

export function getDateRequirements(category) {
  return DATE_REQUIREMENTS[category] || { manufacturing: 'optional', expiry: 'optional' };
}

/**
 * Voucher step path names (different from product)
 */
export const VOUCHER_STEP_PATHS = {
  generalInfo: 'generalinformation',
  productInfo: 'techinfo',
  techInfo: 'golive',
  goLive: 'voucherdesign',
};

/** Hotel voucher uses different step names */
export const HOTEL_VOUCHER_STEP_PATHS = {
  generalInfo: 'generalinformation',
  productInfo: 'hotelsproductinfo',
  techInfo: 'hotelstechinfo',
  goLive: 'hotelsgolive',
  voucherDesign: 'voucherdesign',
};

/** Media-specific step path mappings (per bxi-dashboard) */
const MEDIA_STEP_PATHS = {
  mediaonline: {
    mediaonlinemultiplexproductinfo: { prev: 'general-info', next: 'mediamultiplextechinfo' },
    mediamultiplextechinfo: { prev: 'mediaonlinemultiplexproductinfo', next: 'go-live' },
    mediaonlinedigitalscreensinfo: { prev: 'general-info', next: 'mediaonlinedigitalscreenstechinfo' },
    mediaonlinedigitalscreenstechinfo: { prev: 'mediaonlinedigitalscreensinfo', next: 'digitalscreensgolive' },
    digitalscreensgolive: { prev: 'mediaonlinedigitalscreenstechinfo', next: null },
    'product-info': { prev: 'general-info', next: 'tech-info' },
    'tech-info': { prev: 'product-info', next: 'go-live' },
    'go-live': { prev: 'tech-info', next: null },
  },
  mediaoffline: {
    mediaofflinehoardinginfo: { prev: 'general-info', next: 'mediaofflinehoardingtechinfo' },
    mediaofflinehoardingtechinfo: { prev: 'mediaofflinehoardinginfo', next: 'hoardingsgolive' },
    hoardingsgolive: { prev: 'mediaofflinehoardingtechinfo', next: null },
    mediaofflineproductinfo: { prev: 'general-info', next: 'tech-info' },
    'product-info': { prev: 'general-info', next: 'tech-info' },
    'tech-info': { prev: 'product-info', next: 'go-live' },
    'go-live': { prev: 'tech-info', next: null },
  },
};

/**
 * Get prev/next step path for ProductInfo, TechInfo, GoLive (by step name)
 * @param {string} category - e.g. mediaonline, mediaoffline
 * @param {string} stepName - productInfo, techInfo, goLive
 * @param {string} [pathname] - optional for media path-based resolution
 */
export function getPrevNextStepPaths(category, stepName, pathname) {
  const isMedia = category === 'mediaonline' || category === 'mediaoffline';
  if (isMedia && pathname) {
    const path = String(pathname || '');
    const map = MEDIA_STEP_PATHS[category];
    if (map) {
      let match = '';
      const keys = Object.keys(map).sort((a, b) => b.length - a.length);
      for (const key of keys) {
        if (path.includes(key)) {
          match = key;
          break;
        }
      }
      const entry = map[match];
      if (entry) return { prev: entry.prev, next: entry.next };
    }
  }

  const isVoucher = category?.endsWith?.('Voucher');
  const isHotel = category === 'hotelsVoucher';
  if (!isVoucher) {
    const steps = ['general-info', 'product-info', 'tech-info', 'go-live'];
    const stepMap = { productInfo: 'product-info', techInfo: 'tech-info', goLive: 'go-live' };
    const s = stepMap[stepName] || stepName;
    const i = steps.indexOf(s);
    return { prev: i > 0 ? steps[i - 1] : null, next: i >= 0 && i < 3 ? steps[i + 1] : null };
  }
  return isHotel
    ? {
        productInfo: { prev: 'generalinformation', next: 'hotelstechinfo' },
        techInfo: { prev: 'hotelsproductinfo', next: 'hotelsgolive' },
        goLive: { prev: 'hotelstechinfo', next: 'voucherdesign' },
        voucherDesign: { prev: 'hotelsgolive', next: null },
      }[stepName] || { prev: null, next: null }
    : {
        productInfo: { prev: 'generalinformation', next: 'vouchertechinfo' },
        techInfo: { prev: 'techinfo', next: 'golive' },
        goLive: { prev: 'golive', next: 'voucherdesign' },
        voucherDesign: { prev: 'golive', next: null },
      }[stepName] || { prev: null, next: null };
}

/**
 * Get base category from voucher slug (e.g. electronicsVoucher -> electronics)
 */
function getBaseCategory(category) {
  if (!category || !category.endsWith('Voucher')) return category;
  const base = category.replace(/Voucher$/, '');
  const voucherBaseMap = { ee: 'others', qsr: 'restaurant' };
  return voucherBaseMap[base] || base;
}

/**
 * Get config for a category (with fallback to base category for vouchers)
 */
export function getGeneralInfoConfig(category) {
  return (
    GENERAL_INFO_CONFIG[category] ||
    GENERAL_INFO_CONFIG[getBaseCategory(category)] ||
    GENERAL_INFO_CONFIG.others
  );
}

export function getProductInfoConfig(category) {
  return (
    PRODUCT_INFO_CONFIG[category] ||
    PRODUCT_INFO_CONFIG[getBaseCategory(category)] ||
    PRODUCT_INFO_CONFIG.others
  );
}

export function getTechInfoConfig(category) {
  return (
    TECH_INFO_CONFIG[category] ||
    TECH_INFO_CONFIG[getBaseCategory(category)] ||
    TECH_INFO_CONFIG.others
  );
}

export function getStepApiPath(category, step) {
  const paths = STEP_API_PATHS[category];
  return paths?.[step] || null;
}

export function getSubcategoryEndpoint(category) {
  return SUBCATEGORY_ENDPOINTS[category] || null;
}

export function getFeatureEndpoint(category) {
  return FEATURE_ENDPOINTS[category] || FEATURE_ENDPOINTS[getBaseCategory(category)] || null;
}
