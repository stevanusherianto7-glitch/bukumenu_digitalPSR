
import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { getSalesRecap } from '../controllers/analytics.controller';

const router = Router();

router.use(authenticate);

router.get(
  '/sales', 
  authorize(['SUPER_ADMIN', 'OWNER', 'RESTAURANT_MANAGER', 'FINANCE_MANAGER']), 
  getSalesRecap
);

export default router;
