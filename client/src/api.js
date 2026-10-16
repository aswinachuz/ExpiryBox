import axios from 'axios';

const isNativeApp = typeof window !== 'undefined' && (
  window.Capacitor?.isNativePlatform?.() ||
  window.location?.protocol === 'capacitor:' ||
  window.location?.protocol === 'ionic:' ||
  (window.location?.hostname === 'localhost' && Boolean(window.Capacitor))
);

export const API_BASE_URL = import.meta.env.VITE_API_URL || (
  isNativeApp
    ? 'https://expirybox-three.vercel.app/api'
    : (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api')
);

export const getAttachmentUrl = (filePath) => {
  if (!filePath) return '';
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) return filePath;
  const baseUrl = import.meta.env.VITE_API_URL 
    ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '') 
    : (isNativeApp ? 'https://expirybox-three.vercel.app' : (import.meta.env.PROD ? '' : 'http://localhost:5000'));
  return `${baseUrl}${filePath.startsWith('/') ? filePath : `/${filePath}`}`;
};

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

// Attach Bearer token to all requests if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('expirybox_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const registerUser = async (data) => {
  const res = await api.post('/auth/register', data);
  if (res.data.token) {
    localStorage.setItem('expirybox_token', res.data.token);
    localStorage.setItem('expirybox_user', JSON.stringify(res.data.user));
  }
  return res.data;
};

export const loginUser = async (data) => {
  const res = await api.post('/auth/login', data);
  if (res.data.token) {
    localStorage.setItem('expirybox_token', res.data.token);
    localStorage.setItem('expirybox_user', JSON.stringify(res.data.user));
  }
  return res.data;
};

export const loginWithGoogle = async (data) => {
  const res = await api.post('/auth/google', data);
  if (res.data.token) {
    localStorage.setItem('expirybox_token', res.data.token);
    localStorage.setItem('expirybox_user', JSON.stringify(res.data.user));
  }
  return res.data;
};

export const getMe = async () => {
  const res = await api.get('/auth/me');
  return res.data;
};

export const updateProfile = async (data) => {
  const res = await api.put('/auth/profile', data);
  if (res.data.user) {
    localStorage.setItem('expirybox_user', JSON.stringify(res.data.user));
  }
  return res.data;
};

export const logoutUser = () => {
  localStorage.removeItem('expirybox_token');
  localStorage.removeItem('expirybox_user');
};

export const getStats = async () => {
  const res = await api.get('/items/stats');
  return res.data;
};

export const getItems = async (params = {}) => {
  const res = await api.get('/items', { params });
  return res.data;
};

export const getItem = async (id) => {
  const res = await api.get(`/items/${id}`);
  return res.data;
};

export const createItem = async (formData) => {
  const res = await api.post('/items', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

export const updateItem = async (id, formData) => {
  const res = await api.put(`/items/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

export const deleteItem = async (id) => {
  const res = await api.delete(`/items/${id}`);
  return res.data;
};

export const renewItem = async (id, data) => {
  const res = await api.patch(`/items/${id}/renew`, data);
  return res.data;
};

export const resolveItem = async (id) => {
  const res = await api.patch(`/items/${id}/resolve`);
  return res.data;
};

export const snoozeItem = async (id, data) => {
  const res = await api.patch(`/items/${id}/snooze`, data);
  return res.data;
};

export const updateChecklist = async (id, taskIndex, isCompleted) => {
  const res = await api.patch(`/items/${id}/checklist`, { taskIndex, isCompleted });
  return res.data;
};

export const getMissedReminders = async () => {
  const res = await api.get('/items/missed-reminders');
  return res.data;
};

export const getTimeline = async () => {
  const res = await api.get('/items/timeline');
  return res.data;
};

export const getCalendar = async (month, year) => {
  const res = await api.get('/items/calendar', { params: { month, year } });
  return res.data;
};

export const searchItems = async (q) => {
  const res = await api.get('/items/search', { params: { q } });
  return res.data;
};

export const getPersons = async () => {
  const res = await api.get('/persons');
  return res.data;
};

export const createPerson = async (data) => {
  const res = await api.post('/persons', data);
  return res.data;
};

export const updatePerson = async (id, data) => {
  const res = await api.put(`/persons/${id}`, data);
  return res.data;
};

export const getAssets = async () => {
  const res = await api.get('/assets');
  return res.data;
};

export const createAsset = async (data) => {
  const res = await api.post('/assets', data);
  return res.data;
};

export const exportBackup = async () => {
  const res = await api.get('/items/backup/export');
  return res.data;
};

export const importBackup = async (data) => {
  const res = await api.post('/items/backup/import', { data });
  return res.data;
};

export const getCsvExportUrl = () => `${API_BASE_URL}/items/export/csv`;

export default api;
