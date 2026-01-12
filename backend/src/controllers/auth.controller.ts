
import { Request, Response } from 'express';
// FIX: This error (Module '"@prisma/client"' has no exported member) is likely due to the Prisma client not being generated. Run `npx prisma generate`.
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        restaurant: true // Include info restoran untuk frontend context
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is inactive' });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { 
        userId: user.id, 
        role: user.role,
        restaurantId: user.restaurantId 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return user data exclude password
    const { passwordHash, ...userData } = user;

    res.json({
      token,
      user: userData
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
