import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './error-handler.middleware';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export async function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new AppError(401, 'No token provided');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    req.user = decoded;
    next();
  } catch (error: any) {
    next(new AppError(401, error.message || 'Invalid token'));
  }
}

export async function refreshToken(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const token = req.body.refreshToken;

    if (!token) {
      throw new AppError(401, 'No refresh token provided');
    }

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as any;
    req.user = decoded;
    next();
  } catch (error: any) {
    next(new AppError(401, error.message || 'Invalid refresh token'));
  }
}

export function optional(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      req.user = decoded;
    }
  } catch (error) {
    // Token invalid but not required
  }

  next();
}
