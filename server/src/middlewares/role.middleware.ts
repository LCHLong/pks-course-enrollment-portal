import { Request, Response, NextFunction } from 'express';

export const requireRole = (role: 'student' | 'admin') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Chưa xác thực người dùng.',
      });
      return;
    }

    if (req.user.role !== role) {
      res.status(403).json({
        success: false,
        message: 'Truy cập bị từ chối: Bạn không có quyền quản trị viên.',
      });
      return;
    }

    next();
  };
};
