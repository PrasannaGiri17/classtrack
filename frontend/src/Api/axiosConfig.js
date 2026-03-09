import axios from 'axios';

// ─── Startup: Check if existing token is expired ────────────────────────────
const token = localStorage.getItem('token');
if (token) {
  try {
    // Decode JWT payload (no signature verification needed on client)
    const payload = JSON.parse(atob(token.split('.')[1]));
    const isExpired = payload.exp && (payload.exp * 1000) < Date.now();
    if (isExpired) {
      console.warn('Token expired — clearing session and redirecting to login.');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  } catch (e) {
    // Malformed token — clear it
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
}

// ─── Interceptor: Auto-logout on any future 401 response ────────────────────
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axios;
