
import axios from 'axios';

// Logika penentuan URL Backend
// Jika di Vercel (Production), gunakan relatif path '/api' agar otomatis satu domain
// Jika di Localhost, gunakan 'http://localhost:5000/api'
const isProduction = (import.meta as any).env.PROD; 
// Atau bisa cek hostname window.location.hostname !== 'localhost'

const api = axios.create({
  baseURL: isProduction ? '/api' : 'http://localhost:5000/api',
});

export default api;
