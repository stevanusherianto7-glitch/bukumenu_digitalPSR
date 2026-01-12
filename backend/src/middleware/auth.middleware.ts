
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
// FIX: This error (Module '"@prisma/client"' has no exported member) is likely due to the Prisma client not being generated. Run `npx prisma generate`.
import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

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
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    // FIX: Cast req to AuthRequest to attach the custom 'user' property.
    (req as AuthRequest).user = {
      id: decoded.userId,
      role: decoded.role,
      restaurantId: decoded.restaurantId
    };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
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
