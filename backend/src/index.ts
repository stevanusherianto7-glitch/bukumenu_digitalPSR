
import express from 'express';
import cors from 'cors';
import apiRoutes from './routes';
import path from 'path';
// FIX: Resolve `__dirname` not being available in ES modules.
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*'
}));

// Increase body limit for base64 image uploads and serve static files
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, '../../public')));


// API Routes
app.use('/api', apiRoutes);

// Health Check
app.get('/', (req, res) => {
  res.send('RestoHRIS API is running!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});