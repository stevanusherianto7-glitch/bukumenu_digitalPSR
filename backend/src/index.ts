
import express from 'express';
import cors from 'cors';
import apiRoutes from './routes';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware - Security: Restrict CORS to specific origins
app.use(cors({
  origin: process.env.CORS_ORIGIN || (process.env.NODE_ENV === 'production' ? false : 'http://localhost:3000'),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Increase body limit for base64 image uploads
app.use(express.json({ limit: '10mb' }));

// Catatan: Di Vercel, static files sebaiknya dihandle oleh Frontend build, 
// tapi kita biarkan untuk fallback development
// app.use(express.static(path.join(__dirname, '../../public')));

// API Routes
// Penting: Di Vercel, semua request ke backend akan diarahkan ke file ini.
// Jadi route dasarnya tetap /api
app.use('/api', apiRoutes);

// Health Check
app.get('/api', (req, res) => {
  res.send('RestoHRIS API is running on Vercel!');
});

// Vercel Serverless environment tidak membutuhkan app.listen()
// Namun kita pertahankan untuk local development
// Development server (not needed in Vercel serverless)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`Server is running on port ${PORT}`);
    }
  });
}

// Export app untuk Vercel
export default app;
