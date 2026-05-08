
import axios from 'axios';

// Logika penentuan URL Backend
// Jika di Vercel (Production), gunakan relatif path '/api' agar otomatis satu domain
// Jika di Localhost, gunakan 'http://localhost:5000/api'
const isProduction = (import.meta as any).env.PROD; 
// Atau bisa cek hostname window.location.hostname !== 'localhost'

const api = axios.create({
  baseURL: isProduction ? '/api' : 'http://localhost:5000/api',
});

// Interceptor untuk menyisipkan Token JWT secara otomatis
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
