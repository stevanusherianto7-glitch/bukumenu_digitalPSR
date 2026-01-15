
import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { getAllEmployees, createEmployee, getEmployeeById, updateEmployee, deleteEmployee } from '../controllers/employee.controller';

const router = Router();

// Semua rute di bawah ini memerlukan login
router.use(authenticate);

// Employee routes - hanya Owner yang bisa manage
router.get(
  '/', 
  authorize(['OWNER']), 
  getAllEmployees
);

router.post(
  '/', 
  authorize(['OWNER']), 
  createEmployee
);

router.get(
  '/:id', 
  authorize(['OWNER']), 
  getEmployeeById
);

router.patch(
  '/:id', 
  authorize(['OWNER']), 
  updateEmployee
);

router.delete(
  '/:id', 
  authorize(['OWNER']), 
  deleteEmployee
);

export default router;
