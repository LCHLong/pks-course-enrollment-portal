import { Router, Request, Response } from 'express';

export const apiRouter = Router();

// Test index endpoint
apiRouter.get('/', (_req: Request, res: Response) => {
  res.json({
    message: 'Chào mừng đến với API Cổng Khóa Học & Ghi Danh PKS',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth (POST /register, POST /login, GET /me)',
      courses: '/api/courses (GET /, GET /:id)',
      enrollments: '/api/enrollments (POST /:courseId, GET /my-courses)',
      admin: '/api/admin/courses, /api/admin/enrollments (Yêu cầu role admin)',
    },
  });
});
