import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL || 'http://localhost:7000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add bxiapikey header if required by backend
// api.defaults.headers.bxiapikey = 'your-api-key';

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // You can add auth token here if needed
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // Redirect to login or handle unauthorized
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

// Product APIs
export const productApi = {
  // Get products by seller company (Live)
  getLiveProducts: (page = 1, type = '') => 
    api.get(`/api/product/get_product_bySellerCompanyId?page=${page}&Type=${type}`),
  
  // Get draft products
  getDraftProducts: (page = 1, type = '') => 
    api.get(`/api/product/get_listed_draft_product?page=${page}&Type=${type}`),
  
  // Get all products by company
  getAllProducts: (page = 1, type = '') => 
    api.get(`/api/product/get_product_byCompanyId?page=${page}&Type=${type}`),
  
  // Get rejected products
  getRejectedProducts: (page = 1, type = '') => 
    api.get(`/api/product/GetListedRejectedProduct?page=${page}&Type=${type}`),
  
  // Get delisted products
  getDelistProducts: (page = 1, type = '') => 
    api.get(`/api/product/GetListedDelistProduct?page=${page}&Type=${type}`),
  
  // Get pending (admin review) products
  getPendingProducts: (page = 1, type = '') => 
    api.get(`/api/product/GetListedPendingProduct?page=${page}&Type=${type}`),
  
  // Get single product by ID
  getProductById: (id) => 
    api.get(`/api/product/get_product_byId/${id}`),
  
  // Delete product
  deleteProduct: (id) => 
    api.delete(`/api/product/delete_product/${id}`),
  
  // Create product
  createProduct: (data) => 
    api.post('/api/product/create_product', data),
  
  // Update product
  updateProduct: (id, data) => 
    api.put(`/api/product/update_product/${id}`, data),
};

// Company APIs
export const companyApi = {
  // Get company type
  getCompanyType: (companyTypeId) => 
    api.get(`/api/company_type/get_companyType/${companyTypeId}`),
};

// Auth APIs
export const authApi = {
  // Get logged in user
  getLoggedInUser: () => 
    api.get('/api/auth/me'),
  
  // Logout
  logout: () => 
    api.post('/api/auth/logout'),
};

// Upload APIs
export const uploadApi = {
  // Upload file
  uploadFile: (formData) => 
    api.post('/api/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
};

export default api;
