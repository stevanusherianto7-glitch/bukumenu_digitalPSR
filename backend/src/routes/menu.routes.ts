
import { Router } from 'express';
import { getMenu, createMenuItem, updateMenuItem, deleteMenuItem } from '../controllers/menu.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Public Access (Pelanggan)
router.get('/', getMenu);

// Admin Access (Owner / Manager) - Public for simple management
router.post('/', createMenuItem);
router.put('/:id', updateMenuItem);
router.delete('/:id', deleteMenuItem);

export default router;
