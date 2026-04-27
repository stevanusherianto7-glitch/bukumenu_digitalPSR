
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// Logika penentuan URL Backend
// Jika di Vercel (Production), gunakan relatif path '/api' agar otomatis satu domain
// Jika di Localhost, gunakan 'http://localhost:5000/api'
const isProduction = (import.meta as any).env.PROD; 
// Atau bisa cek hostname window.location.hostname !== 'localhost'

const api = axios.create({
  baseURL: isProduction ? '/api' : 'http://localhost:5000/api',
});

// Request Interceptor to add JWT token to headers
api.interceptors.request.use(
  (config) => {
    const { token } = useAuthStore.getState();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Optional: Response Interceptor for handling 401 errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid, log out the user
      useAuthStore.getState().logout();
      // Jangan redirect paksa jika sedang di halaman publik (misal menu)
      if (!window.location.pathname.includes('/login')) {
          // window.location.href = '/login'; 
      }
    }
    return Promise.reject(error);
  }
);

export default api;
