
import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { getSalesRecap } from '../controllers/analytics.controller';

const router = Router();

router.use(authenticate);

router.get(
  '/sales', 
  authorize(['OWNER']), 
  getSalesRecap
);

export default router;
