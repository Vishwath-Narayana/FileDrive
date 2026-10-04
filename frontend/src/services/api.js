import axios from 'axios';
import { supabase } from './supabaseClient';

// Kept for AuthContext compatibility; the interceptor below always prefers a fresh session token.
let cachedToken = null;

export const setAuthToken = (token) => {
  cachedToken = token;
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// getSession() reads local storage and refreshes an expired access token, so long-lived tabs
// never send a stale token (the old cached-token approach did after the 1h expiry).
api.interceptors.request.use(
  async (config) => {
    let token = cachedToken;
    try {
      const { data } = await supabase.auth.getSession();
      token = data.session?.access_token || token;
    } catch {
      /* fall back to cached token */
    }
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const PUBLIC_PATHS = ['/login', '/register', '/forgot-password', '/reset-password', '/accept-invite', '/'];

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const code = error.response?.data?.code;

    // Password accepted but the 2FA step is still pending: the login screen handles it.
    if (status === 401 && code === 'MFA_REQUIRED') {
      return Promise.reject(error);
    }

    if (status === 401 && !PUBLIC_PATHS.includes(window.location.pathname)) {
      cachedToken = null;
      supabase.auth.signOut().finally(() => {
        window.location.href = '/login';
      });
    }
    return Promise.reject(error);
  }
);

export default api;
