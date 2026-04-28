
import { Request, Response, NextFunction } from 'express';
import { PrismaClient, Role } from '@prisma/client';
import { verifyToken } from '../lib/auth';

const prisma = new PrismaClient();

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: Role;
    restaurantId: string | null;
  };
}

// FIX: Changed signature to match Express RequestHandler for router compatibility.
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token) as any;
    // FIX: Cast req to AuthRequest to attach the custom 'user' property.
    (req as AuthRequest).user = {
      id: decoded.userId,
      role: decoded.role,
      restaurantId: decoded.restaurantId
    };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// FIX: Changed signature to match Express RequestHandler for router compatibility.
export const authorize = (allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // FIX: Cast req to AuthRequest to access the custom 'user' property.
    const authReq = req as AuthRequest;
    if (!authReq.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    if (!allowedRoles.includes(authReq.user.role)) {
      return res.status(403).json({ 
        message: 'Forbidden: You do not have permission to access this resource' 
      });
    }

    next();
  };
};
