import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

// ─── Auth ──────────────────────────────────────────────────────
export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  firebaseLogin: (data) => api.post('/auth/firebase-login', data),
  me: () => api.get('/auth/me'),
};

// ─── Users ─────────────────────────────────────────────────────
export const usersAPI = {
  list: () => api.get('/users/'),
  create: (data) => api.post('/users/', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  managers: () => api.get('/users/managers'),
};

// ─── Expenses ──────────────────────────────────────────────────
export const expensesAPI = {
  list: (params = {}) => api.get('/expenses/', { params }),
  get: (id) => api.get(`/expenses/${id}`),
  create: (formData) => api.post('/expenses/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  action: (id, data) => api.post(`/expenses/${id}/action`, data),
  delete: (id) => api.delete(`/expenses/${id}`),
};

// ─── Rules ─────────────────────────────────────────────────────
export const rulesAPI = {
  list: () => api.get('/rules/'),
  create: (data) => api.post('/rules/', data),
  update: (id, data) => api.put(`/rules/${id}`, data),
  toggle: (id) => api.patch(`/rules/${id}/toggle`),
  delete: (id) => api.delete(`/rules/${id}`),
};

// ─── OCR ───────────────────────────────────────────────────────
export const ocrAPI = {
  extract: (formData) => api.post('/ocr/extract', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

// ─── Company ───────────────────────────────────────────────────
export const companyAPI = {
  get: () => api.get('/company/'),
  update: (data) => api.put('/company/', data),
};

// ─── External ──────────────────────────────────────────────────
export const fetchCountries = () =>
  axios.get('https://restcountries.com/v3.1/all?fields=name,currencies');

export const fetchExchangeRates = (base) =>
  axios.get(`https://api.exchangerate-api.com/v4/latest/${base}`);
