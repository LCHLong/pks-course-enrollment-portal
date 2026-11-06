import { Router } from 'express';
import { EnrollmentController } from '../controllers/enrollment.controller.js';
import { cancelEnrollmentController } from '../controllers/student.controller.js';
import { authenticateJWT } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';

export const studentRouter = Router();

studentRouter.use(authenticateJWT);

studentRouter.get('/my-courses', EnrollmentController.getMyCourses);
studentRouter.get('/enrollments', EnrollmentController.getMyCourses);
studentRouter.post(
  '/enrollments/:id/cancel',
  authenticateJWT,
  requireRole('student'),
  cancelEnrollmentController
);

