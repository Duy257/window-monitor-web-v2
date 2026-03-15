import axios from 'axios';
import { API_TIMEOUT } from '../config';
import { getApiKey } from './auth';

/** Axios instance với base URL /api và auto-inject x-api-key */
export const apiClient = axios.create({
  baseURL: '/api',
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: thêm API key vào mỗi request
apiClient.interceptors.request.use((config) => {
  const key = getApiKey();
  if (key) {
    config.headers['x-api-key'] = key;
  }
  return config;
});

// Interceptor: xử lý lỗi 401 (key hết hạn hoặc sai)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Xóa key trong localStorage để hiển thị lại modal login
      localStorage.removeItem('winmonitor_api_key');
      window.dispatchEvent(new Event('auth:required'));
    }
    return Promise.reject(error);
  }
);
