import axios from 'axios';

const BXI_API_KEY = process.env.REACT_APP_BXI_API_KEY || 'Bearer K8sY2jF4pL3rQ1hA9gZ6bX7wC5vU0t';

// Create axios instance with base configuration (BXI mounts routes at root, no /api)
const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL || 'http://localhost:7000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    bxiapikey: BXI_API_KEY,
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          console.error('Unauthorized - redirecting to login');
          break;
        case 403:
          console.error('Forbidden');
          break;
        case 404:
          console.error('Not found');
          break;
        case 500:
          console.error('Server error');
          break;
        default:
          break;
      }
    }
    return Promise.reject(error);
  }
);

// Product APIs (paths match BXI routes: product/*)
const buildListingParams = (page = 1, type = '') => {
  const params = { page };
  if (type && String(type).trim()) {
    params.Type = type;
  }
  return { params };
};

export const productApi = {
  getLiveProducts: (page = 1, type = '') =>
    api.get('product/get_product_bySellerCompanyId', buildListingParams(page, type)),

  getDraftProducts: (page = 1, type = '') =>
    api.get('product/get_listed_draft_product', buildListingParams(page, type)),

  getAllProducts: (page = 1, type = '') =>
    api.get('product/get_product_byCompanyId', buildListingParams(page, type)),

  getRejectedProducts: (page = 1, type = '') =>
    api.get('product/GetListedRejectedProduct', buildListingParams(page, type)),

  getDelistProducts: (page = 1, type = '') =>
    api.get('product/GetListedDelistProduct', buildListingParams(page, type)),

  getPendingProducts: (page = 1, type = '') =>
    api.get('product/GetListedPendingProduct', buildListingParams(page, type)),

  getProductById: (id) =>
    api.get(`product/get_product_byId/${id}`),

  // General delete (live/rejected etc.) – BXI: DELETE product/deleteProduct/:id
  deleteProduct: (id) =>
    api.delete(`product/deleteProduct/${id}`),

  // Draft permanent delete – BXI: DELETE product/deleteDraftProduct?ProductId=...
  deleteDraftProduct: (productId) =>
    api.delete(`product/deleteDraftProduct`, { params: { ProductId: productId } }),

  createProduct: (data) =>
    api.post('product/add_product', data),

  updateProduct: (data) =>
    api.put('product/update_product', data),

  relistProduct: (data) =>
    api.post('product/delist_relist_live_products', data),
};

// Company APIs
export const companyApi = {
  getCompanyType: (companyTypeId) =>
    api.get(`company_type/get_companyType/${companyTypeId}`),
};

// Auth APIs (BXI: auth/logged_user GET, auth/logout GET)
export const authApi = {
  getLoggedInUser: () =>
    api.get('auth/logged_user'),

  getAuthCompany: () =>
    api.get('auth/getauthsCompany'),

  logout: () =>
    api.get('auth/logout'),
};

// Upload APIs
export const uploadApi = {
  uploadFile: (formData) =>
    api.post('product/add_Image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

// Bulk upload (BXI: publiq_bulk_upload/bulk_upload, single file field 'file')
export const bulkUploadApi = {
  uploadBulkFile: (formData) =>
    api.post('publiq_bulk_upload/bulk_upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

export default api;
