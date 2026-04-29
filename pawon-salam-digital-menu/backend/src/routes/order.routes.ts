
import { Router } from 'express';
import { createOrder, getOrders, getSalesAnalytics, completeOrderController } from '../controllers/order.controller';

const router = Router();

// Endpoint Public (Bisa diakses oleh Tablet Menu tanpa login rumit)
router.post('/', createOrder);

// Endpoint Monitoring (Untuk Owner melihat pesanan)
// Nanti bisa ditambahkan middleware auth jika perlu
router.get('/', getOrders); 
router.get('/analytics', getSalesAnalytics);

// Endpoint untuk waiter menyelesaikan pesanan
router.patch('/:id/complete', completeOrderController);

export default router;
