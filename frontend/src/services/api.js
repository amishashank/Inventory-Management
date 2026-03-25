import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

// Dashboard
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
};

// Categories
export const categoryAPI = {
  getAll: () => api.get('/categories'),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

// Products
export const productAPI = {
  getAll: () => api.get('/products'),
  getById: (id) => api.get(`/products/${id}`),
  getByCategory: (catId) => api.get(`/products/category/${catId}`),
  getLowStock: () => api.get('/products/low-stock'),
  search: (q) => api.get(`/products/search?q=${q}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

// Discounts
export const discountAPI = {
  getAll: () => api.get('/discounts'),
  getActive: () => api.get('/discounts/active'),
  create: (data) => api.post('/discounts', data),
  update: (id, data) => api.put(`/discounts/${id}`, data),
  delete: (id) => api.delete(`/discounts/${id}`),
};

// Bills
export const billAPI = {
  getAll: () => api.get('/bills'),
  getById: (id) => api.get(`/bills/${id}`),
  create: (data) => api.post('/bills', data),
};

export default api;
