import { Router } from 'express';
import { getTts } from '../controllers/tts.controller';

const router = Router();

// Endpoint: GET /api/tts
router.get('/', getTts);

export default router;
