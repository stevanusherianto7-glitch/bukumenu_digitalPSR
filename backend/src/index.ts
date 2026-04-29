
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import apiRoutes from './routes';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware Setup
// 1. Security Headers (Helmet) - MUST be first
app.use(helmet());

// 2. Request Logging (Morgan)
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined')); // Apache combined format
} else {
  app.use(morgan('dev')); // Colorized development format
}

// 3. Rate Limiting - General
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// 4. Rate Limiting - Auth routes (stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 attempts per 15 minutes
  skipSuccessfulRequests: true,
  message: 'Too many login attempts, please try again later.',
});

// 5. Strict CORS Whitelist - Zero Error Tolerance
const allowedOrigins = [process.env.FRONTEND_URL || 'http://localhost:3000'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS - Zero Error Tolerance Policy'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 2. Security Verification
if (!process.env.JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET is not defined in environment variables.");
  if (process.env.NODE_ENV === 'production') {
    process.exit(1); 
  }
}

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
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// Export app untuk Vercel
export default app;
