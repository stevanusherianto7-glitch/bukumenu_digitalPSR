import { Router } from 'express';
import employeeRoutes from './employee.routes';
import uploadRoutes from './upload.routes';
import analyticsRoutes from './analytics.routes';
import orderRoutes from './order.routes';
import menuRoutes from './menu.routes';
import ttsRoutes from './tts.routes';

const router = Router();

router.use('/employees', employeeRoutes);
router.use('/upload', uploadRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/orders', orderRoutes);
router.use('/menu', menuRoutes); // Endpoint: /api/menu
router.use('/tts', ttsRoutes); // Endpoint: /api/tts

export default router;
