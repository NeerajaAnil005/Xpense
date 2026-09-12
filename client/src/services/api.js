import axios from 'axios';

// Centralized API Base URL Configuration
const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl) return '/api';
  
  // Clean trailing slash
  const cleanUrl = envUrl.endsWith('/') ? envUrl.slice(0, -1) : envUrl;
  
  // If envUrl already ends with /api, return cleanUrl, otherwise append /api
  return cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;
};

export const API_BASE_URL = getBaseURL();

const API = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach Authorization token to requests if available
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('xpense_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Handle 401 Unauthorized responses globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('xpense_token');
      localStorage.removeItem('xpense_user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth Services
export const authService = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
  updateProfile: (data) => API.put('/auth/profile', data)
};

// Transaction Services
export const transactionService = {
  getAll: (params) => API.get('/transactions', { params }),
  getById: (id) => API.get(`/transactions/${id}`),
  create: (data) => API.post('/transactions', data),
  update: (id, data) => API.put(`/transactions/${id}`, data),
  delete: (id) => API.delete(`/transactions/${id}`),
  getSummaryStats: () => API.get('/transactions/summary/stats'),
  exportCSV: () => API.get('/transactions/export/csv', { responseType: 'blob' }),
  exportCSVUrl: () => `${API_BASE_URL}/transactions/export/csv`
};

// Budget Services
export const budgetService = {
  getAll: (params) => API.get('/budgets', { params }),
  createOrUpdate: (data) => API.post('/budgets', data),
  update: (id, data) => API.put(`/budgets/${id}`, data),
  delete: (id) => API.delete(`/budgets/${id}`)
};

// Report Services
export const reportService = {
  getSummary: (params) => API.get('/reports/summary', { params }),
  getMonthly: () => API.get('/reports/monthly'),
  getCategories: (params) => API.get('/reports/categories', { params }),
  getTrends: (params) => API.get('/reports/trends', { params }),
  getBudgetVsActual: (params) => API.get('/reports/budget-vs-actual', { params })
};

// AI Services
export const aiService = {
  getInsights: () => API.post('/ai/insights'),
  getMonthlySummary: () => API.post('/ai/monthly-summary')
};

// Notification Services
export const notificationService = {
  getAll: () => API.get('/notifications'),
  markRead: (id) => API.put(`/notifications/${id}/read`),
  markAllRead: () => API.put('/notifications/read-all'),
  delete: (id) => API.delete(`/notifications/${id}`),
  clearAll: () => API.delete('/notifications/clear-all')
};

export default API;
