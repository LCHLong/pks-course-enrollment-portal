import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/apiResponse.js';

export const requireRole = (role: 'student' | 'admin') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'UNAUTHORIZED', 'Chưa xác thực người dùng.', 401);
      return;
    }

    if (req.user.role !== role) {
      sendError(res, 'FORBIDDEN', 'Truy cập bị từ chối: Bạn không có quyền truy cập chức năng này.', 403);
      return;
    }

    next();
  };
};
