import { Router } from 'express';
import { EnrollmentController } from '../controllers/enrollment.controller.js';
import { authenticateJWT } from '../middlewares/auth.middleware.js';

export const studentRouter = Router();

studentRouter.use(authenticateJWT);

studentRouter.get('/my-courses', EnrollmentController.getMyCourses);
studentRouter.get('/enrollments', EnrollmentController.getMyCourses);
