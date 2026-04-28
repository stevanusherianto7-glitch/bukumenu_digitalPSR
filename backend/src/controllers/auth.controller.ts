
import { Request, Response } from 'express';
// FIX: This error (Module '"@prisma/client"' has no exported member) is likely due to the Prisma client not being generated. Run `npx prisma generate`.
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { generateToken } from '../lib/auth';

const prisma = new PrismaClient();

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = generateToken({ 
      userId: user.id, 
      role: user.role,
      restaurantId: user.restaurantId 
    });

    // Return user data exclude password
    const { password: _, ...userData } = user;

    res.json({
      token,
      user: userData
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
