import axios from 'axios';

// Token cache — set by AuthContext, read by interceptor (no await needed)
let cachedToken = null;

export const setAuthToken = (token) => {
  cachedToken = token;
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Synchronous — never hangs
api.interceptors.request.use(
  (config) => {
    if (cachedToken) {
      config.headers.Authorization = `Bearer ${cachedToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      cachedToken = null;
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
