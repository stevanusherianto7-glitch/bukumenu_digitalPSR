
import { Router } from 'express';
import {
  createOrder,
  getOrders,
  completeOrderController,
  getSalesAnalytics,
  getTTSFeed,
  updateOrderToPreparing,
  updateOrderToReady,
  cancelOrderController
} from '../controllers/order.controller';
import { authenticate, authorize } from '../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();

// Endpoint Public (Bisa diakses oleh Tablet Menu tanpa login rumit)
router.post('/', createOrder);

// Endpoint Monitoring (Untuk Owner melihat pesanan)
router.get('/', authenticate, authorize([Role.ADMIN, Role.WAITER]), getOrders);
router.get('/analytics', authenticate, authorize([Role.ADMIN, Role.WAITER]), getSalesAnalytics);

// Endpoint untuk waiter menyelesaikan pesanan
router.patch('/:id/complete', authenticate, authorize([Role.ADMIN, Role.WAITER]), completeOrderController);
router.patch('/:id/preparing', authenticate, authorize([Role.ADMIN, Role.WAITER]), updateOrderToPreparing);
router.patch('/:id/ready', authenticate, authorize([Role.ADMIN, Role.WAITER]), updateOrderToReady);
router.patch('/:id/cancel', authenticate, authorize([Role.ADMIN, Role.WAITER]), cancelOrderController);

// TTS Feed for waiter notifications
router.get('/tts', authenticate, authorize([Role.ADMIN, Role.WAITER]), getTTSFeed);

export default router;
