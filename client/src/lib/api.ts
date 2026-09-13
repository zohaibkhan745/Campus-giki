import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || '/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
  timeout: 15000,
});

// Request Interceptor: Attach JWT Bearer Token if available
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response Interceptor: Handle HTTP errors globally (e.g. 401 Unauthorized)
api.interceptors.response.use(
  (response) => {
    // Verify response envelope structure ({ success: boolean, data: unknown })
    if (
      response.data &&
      typeof response.data === 'object' &&
      'success' in response.data &&
      'data' in response.data
    ) {
      return response.data.data;
    }
    return response.data;
  },
  (error: AxiosError) => {
    if (error.response && error.response.status === 401) {
      // Clear token on 401 Unauthorized and notify state observers
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      }
    }
    return Promise.reject(error);
  },
);

export const getMediaUrl = (path: string | undefined | null) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const base = API_BASE_URL.replace('/api/v1', '');
  return `${base}${path.startsWith('/') ? path : '/' + path}`;
};
