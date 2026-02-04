
import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { getAllEmployees, createEmployee, getEmployeeById, updateEmployee, deleteEmployee } from '../controllers/employee.controller';

const router = Router();

// Semua rute di bawah ini memerlukan login
router.use(authenticate);

router.get(
  '/', 
  authorize(['SUPER_ADMIN', 'OWNER', 'HR_MANAGER', 'RESTAURANT_MANAGER']), 
  getAllEmployees
);

router.post(
  '/', 
  authorize(['HR_MANAGER', 'OWNER']), 
  createEmployee
);

router.get(
  '/:id', 
  authorize(['SUPER_ADMIN', 'OWNER', 'HR_MANAGER', 'RESTAURANT_MANAGER']), 
  getEmployeeById
);

router.patch(
  '/:id', 
  authorize(['HR_MANAGER', 'OWNER']), 
  updateEmployee
);

router.delete(
  '/:id', 
  authorize(['HR_MANAGER', 'OWNER']), 
  deleteEmployee
);

export default router;
