import { Router } from 'express';
import { createOrder, getOrders, getSalesAnalytics, completeOrderController } from '../controllers/order.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Public endpoint: Customer can create order from tablet
router.post('/', createOrder);

// Get orders endpoint: Public for waiter dashboard (no auth required for now)
// TODO: Add authentication later if needed for security
router.get('/', getOrders);
router.get('/analytics', authenticate, authorize(['SUPER_ADMIN', 'OWNER', 'RESTAURANT_MANAGER', 'FINANCE_MANAGER']), getSalesAnalytics);
router.patch('/:id/complete', authenticate, authorize(['SUPER_ADMIN', 'OWNER', 'RESTAURANT_MANAGER', 'STAFF_FOH']), completeOrderController);

export default router;
