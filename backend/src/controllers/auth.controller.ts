
import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Security: JWT_SECRET must be set in environment variables
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required. Please set it in your .env file.');
}
const JWT_SECRET = process.env.JWT_SECRET;

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
    // Security: Don't expose error details to client
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
