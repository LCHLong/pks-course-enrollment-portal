import { Router, Request, Response } from 'express';
import { authRouter } from './auth.routes.js';
import { courseRouter } from './course.routes.js';
import { enrollmentRouter } from './enrollment.routes.js';
import { studentRouter } from './student.routes.js';
import { adminRouter } from './admin.routes.js';
import { userRouter } from './user.routes.js';

export const apiRouter = Router();

// Test index endpoint
apiRouter.get('/', (_req: Request, res: Response) => {
  res.json({
    message: 'Chào mừng đến với API Cổng Khóa Học & Ghi Danh PKS',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth (POST /register, POST /login, GET /me, POST /logout)',
      courses: '/api/courses (GET /, GET /:id, POST /:id/enroll)',
      enrollments: '/api/enrollments (POST /, GET /my, GET /:id)',
      student: '/api/student (GET /my-courses)',
      admin: '/api/admin/courses, /api/admin/enrollments (Yêu cầu role admin)',
      users: '/api/users (GET /profile, PUT /profile, POST /change-password)',
    },
  });
});

apiRouter.use('/auth', authRouter);
apiRouter.use('/courses', courseRouter);
apiRouter.use('/enrollments', enrollmentRouter);
apiRouter.use('/student', studentRouter);
apiRouter.use('/admin', adminRouter);
apiRouter.use('/users', userRouter);
apiRouter.use('/user', userRouter);
