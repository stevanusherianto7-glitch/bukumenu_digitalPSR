import { Router } from 'express';
import { createOrder, getOrders, getSalesAnalytics, completeOrderController } from '../controllers/order.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Public endpoint: Customer can create order from tablet
router.post('/', createOrder);

// Get orders endpoint: Waiter dan Owner bisa akses
router.get('/', authenticate, authorize(['OWNER', 'STAFF_FOH']), getOrders);
router.get('/analytics', authenticate, authorize(['OWNER']), getSalesAnalytics);
router.patch('/:id/complete', authenticate, authorize(['OWNER', 'STAFF_FOH']), completeOrderController);

export default router;
