
import axios from 'axios';

// Ganti dengan URL backend Anda saat deploy
const BACKEND_URL = 'http://localhost:5000';

const api = axios.create({
  baseURL: `${BACKEND_URL}/api`,
});

export { api, BACKEND_URL };
