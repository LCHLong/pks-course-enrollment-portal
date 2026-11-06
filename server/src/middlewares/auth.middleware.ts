import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { sendError } from '../utils/apiResponse.js';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: 'student' | 'admin';
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export const authenticateJWT = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    sendError(res, 'UNAUTHORIZED', 'Yêu cầu xác thực: Vui lòng đăng nhập để tiếp tục.', 401);
    return;
  }

  const token = authHeader.split(' ')[1];
  const secret = process.env.JWT_SECRET || 'super-secret-jwt-key-replace-in-production-at-least-32-chars';

  try {
    const decoded = jwt.verify(token, secret) as AuthenticatedUser;
    req.user = decoded;
    next();
  } catch (error) {
    sendError(res, 'UNAUTHORIZED', 'Token không hợp lệ hoặc đã hết hạn phiên đăng nhập.', 401);
    return;
  }
};

export const optionalAuthenticateJWT = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  const secret = process.env.JWT_SECRET || 'super-secret-jwt-key-replace-in-production-at-least-32-chars';

  try {
    const decoded = jwt.verify(token, secret) as AuthenticatedUser;
    req.user = decoded;
  } catch {
    // Guest access if token invalid
  }

  next();
};
