import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:7000/api',
});

// Auto-attach token and schoolId
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token && token !== 'null' && token !== 'undefined') {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.schoolId) {
            config.headers['schoolId'] = user.schoolId;

            // Also inject schoolId into req.query for GET requests
            if (config.method === 'get') {
              config.params = { ...config.params, schoolId: user.schoolId };
            }
        }
      } catch (e) {}
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
