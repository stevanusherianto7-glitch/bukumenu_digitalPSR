
import { Router } from 'express';
import { getMenu, createMenuItem, updateMenuItem, deleteMenuItem } from '../controllers/menu.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Public Access (Pelanggan)
router.get('/', getMenu);

// Admin Access (Owner saja yang bisa manage menu)
router.post('/', authenticate, authorize(['OWNER']), createMenuItem);
router.put('/:id', authenticate, authorize(['OWNER']), updateMenuItem);
router.delete('/:id', authenticate, authorize(['OWNER']), deleteMenuItem);

export default router;
