import axios from 'axios';

// Create API instance for root-level components
// Detects production vs development automatically
const isProduction = typeof window !== 'undefined' && 
  window.location.hostname !== 'localhost' && 
  window.location.hostname !== '127.0.0.1';

// Simple API instance without auth interceptors
export const api = axios.create({
  baseURL: isProduction ? '/api' : 'http://localhost:5000/api',
});

export default api;



