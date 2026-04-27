import axios from 'axios';

// Create API instance for root-level components
// Detects production vs development automatically
const isProduction = typeof window !== 'undefined' && 
  window.location.hostname !== 'localhost' && 
  window.location.hostname !== '127.0.0.1';

export const api = axios.create({
  baseURL: isProduction ? '/api' : 'http://localhost:5000/api',
});

// Request interceptor to add auth token if available
api.interceptors.request.use(
  (config) => {
    // Try to get token from localStorage (if auth store is available)
    try {
      const authData = localStorage.getItem('restohris-auth-storage');
      if (authData) {
        const parsed = JSON.parse(authData);
        if (parsed?.state?.token) {
          config.headers['Authorization'] = `Bearer ${parsed.state.token}`;
        }
      }
    } catch (e) {
      // Ignore if localStorage not available or parse fails
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - could redirect to login if needed
      console.warn('Unauthorized request');
    }
    return Promise.reject(error);
  }
);

export default api;



