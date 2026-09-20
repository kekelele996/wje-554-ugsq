import axios from 'axios';
import { storage } from '../utils/storage';

export const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000
});

request.interceptors.request.use((config) => {
  const token = storage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

request.interceptors.response.use(
  (response) => response.data.data,
  (error) => {
    if (error.response?.status === 401) {
      storage.clearToken();
      window.location.href = '/login';
    }
    const message = error.response?.data?.message || error.message || '请求失败';
    window.dispatchEvent(new CustomEvent('app:error', { detail: message }));
    return Promise.reject(error);
  }
);
