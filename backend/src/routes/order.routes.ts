import { Router } from 'express';
import { createOrder, getOrders, getSalesAnalytics, completeOrderController } from '../controllers/order.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Public endpoint: Customer can create order from tablet
router.post('/', createOrder);

// Protected endpoints: Require authentication
router.get('/', authenticate, authorize(['SUPER_ADMIN', 'OWNER', 'RESTAURANT_MANAGER', 'STAFF_FOH']), getOrders);
router.get('/analytics', authenticate, authorize(['SUPER_ADMIN', 'OWNER', 'RESTAURANT_MANAGER', 'FINANCE_MANAGER']), getSalesAnalytics);
router.patch('/:id/complete', authenticate, authorize(['SUPER_ADMIN', 'OWNER', 'RESTAURANT_MANAGER', 'STAFF_FOH']), completeOrderController);

export default router;
