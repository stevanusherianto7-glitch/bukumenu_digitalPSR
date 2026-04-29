
import { Router } from 'express';
import { getMenu, createMenuItem, updateMenuItem, deleteMenuItem } from '../controllers/menu.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Public Access (Pelanggan)
router.get('/', getMenu);

// Admin Access (Owner / Manager)
// Menggunakan middleware authenticate untuk memastikan user login
// dan authorize untuk memastikan role yang tepat
router.post('/', authenticate, authorize(['SUPER_ADMIN', 'OWNER', 'RESTAURANT_MANAGER']), createMenuItem);
router.put('/:id', authenticate, authorize(['SUPER_ADMIN', 'OWNER', 'RESTAURANT_MANAGER']), updateMenuItem);
router.delete('/:id', authenticate, authorize(['SUPER_ADMIN', 'OWNER', 'RESTAURANT_MANAGER']), deleteMenuItem);

export default router;
