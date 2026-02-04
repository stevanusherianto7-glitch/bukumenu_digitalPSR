
import { Request, Response } from 'express';
// FIX: This error (Module '"@prisma/client"' has no exported member) is likely due to the Prisma client not being generated. Run `npx prisma generate`.
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// GET /api/employees
// FIX: Changed signature to use base Request type for router compatibility.
export const getAllEmployees = async (req: Request, res: Response) => {
  try {
    const employees = await prisma.user.findMany({
      where: {
        role: {
          in: ['HR_MANAGER', 'RESTAURANT_MANAGER', 'FINANCE_MANAGER', 'MARKETING_MANAGER', 'STAFF_FOH', 'STAFF_BOH']
        }
      },
      include: {
        employeeProfile: true,
        restaurant: {
          select: { name: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const employeesWithoutPassword = employees.map(emp => {
      const { passwordHash, ...employeeData } = emp;
      return employeeData;
    });

    res.json(employeesWithoutPassword);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while fetching employees' });
  }
};

// POST /api/employees
// FIX: Changed signature to use base Request type for router compatibility.
export const createEmployee = async (req: Request, res: Response) => {
  const { name, email, password, phone, role, position, salary, joinDate, restaurantId, department } = req.body;

  if (!name || !email || !password || !role || !position || !salary || !joinDate || !department) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  
  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        phone,
        role,
        restaurantId,
        employeeProfile: {
          create: {
            position,
            salary: parseFloat(salary),
            joinDate: new Date(joinDate),
            department,
          }
        }
      },
      include: {
        employeeProfile: true
      }
    });
    
    const { passwordHash: _, ...userWithoutPassword } = newUser;

    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while creating employee' });
  }
};

// GET /api/employees/:id
// FIX: Changed signature to use base Request type for router compatibility.
export const getEmployeeById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const employee = await prisma.user.findUnique({
      where: { id },
      include: {
        employeeProfile: true,
        restaurant: { select: { name: true } }
      }
    });

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    const { passwordHash, ...employeeData } = employee;
    res.json(employeeData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while fetching employee data' });
  }
};

// PATCH /api/employees/:id
// FIX: Changed signature to use base Request type for router compatibility.
export const updateEmployee = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, phone, role, position, salary, isActive, department } = req.body;
  
  try {
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name,
        phone,
        role,
        isActive,
        employeeProfile: {
          update: {
            position,
            salary: salary ? parseFloat(salary) : undefined,
            department,
          }
        }
      },
      include: {
        employeeProfile: true
      }
    });

    const { passwordHash, ...userWithoutPassword } = updatedUser;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while updating employee' });
  }
};

// DELETE /api/employees/:id
// FIX: Changed signature to use base Request type for router compatibility.
export const deleteEmployee = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    // We'll soft delete by setting isActive to false instead of actually deleting
    const deactivatedUser = await prisma.user.update({
      where: { id },
      data: { isActive: false }
    });
    res.status(200).json({ message: 'Employee deactivated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while deactivating employee' });
  }
};
