import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
    }
    return Promise.reject(err);
  }
);

// Products
export const getProducts = (params) => API.get('/products', { params });
export const getProduct = (id) => API.get(`/products/${id}`);
export const createProduct = (data) => API.post('/products', data);
export const updateProduct = (id, data) => API.put(`/products/${id}`, data);
export const deleteProduct = (id) => API.delete(`/products/${id}`);
export const likeProduct = (id) => API.post(`/products/${id}/like`);
export const shareProduct = (id) => API.post(`/products/${id}/share`);
export const addReview = (id, data) => API.post(`/products/${id}/reviews`, data);
export const updateStock = (id, stock) => API.patch(`/products/${id}/stock`, { stock });
export const getProductStats = () => API.get('/products/admin/stats');

// Categories
export const getCategories = () => API.get('/categories');
export const createCategory = (data) => API.post('/categories', data);
export const updateCategory = (id, data) => API.put(`/categories/${id}`, data);
export const deleteCategory = (id) => API.delete(`/categories/${id}`);
export const seedCategories = () => API.post('/categories/seed');

// Events
export const getEvents = (params) => API.get('/events', { params });
export const getEvent = (id) => API.get(`/events/${id}`);
export const getAdminEvents = () => API.get('/events/admin/all');
export const createEvent = (data) => API.post('/events', data);
export const updateEvent = (id, data) => API.put(`/events/${id}`, data);
export const deleteEvent = (id) => API.delete(`/events/${id}`);
export const syncEventStatus = () => API.post('/events/admin/sync-status');

// Auth
export const login = (data) => API.post('/auth/login', data);
export const register = (data) => API.post('/auth/register', data);
export const getMe = () => API.get('/auth/me');

// Upload
export const uploadImage = (formData) => API.post('/upload/image', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const uploadImages = (formData) => API.post('/upload/images', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteImage = (publicId) => API.delete(`/upload/image/${encodeURIComponent(publicId)}`);

export default API;
