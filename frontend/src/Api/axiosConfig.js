import axios from 'axios';
import { getDecodedToken } from '../Utils/authUtils';

// ─── Startup: Check if existing token is expired ────────────────────────────
const payload = getDecodedToken(localStorage.getItem('token'));
if (payload) {
    const isExpired = payload.exp && (payload.exp * 1000) < Date.now();
    if (isExpired) {
        console.warn('Token expired — clearing session and redirecting to login.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    }
} else if (localStorage.getItem('token')) {
    // Malformed or invalid token — clear it
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
}

// ─── Interceptor: Add Authorization header to every request ─────────────────
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && token !== 'null' && token !== 'undefined') {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Interceptor: Auto-logout on any future 401 response ────────────────────
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Avoid redirecting if already on login page
      if (window.location.pathname !== '/login') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axios;

