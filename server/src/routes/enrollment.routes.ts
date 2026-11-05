import { Router } from 'express';
import { EnrollmentController } from '../controllers/enrollment.controller.js';
import { authenticateJWT } from '../middlewares/auth.middleware.js';
import { validateBody } from '../middlewares/validate.middleware.js';
import { enrollSchema } from '../validations/enrollment.validation.js';

export const enrollmentRouter = Router();

enrollmentRouter.use(authenticateJWT);

enrollmentRouter.post('/', validateBody(enrollSchema), EnrollmentController.enroll);
enrollmentRouter.get('/my', EnrollmentController.getMyCourses);
enrollmentRouter.get('/my-courses', EnrollmentController.getMyCourses);
enrollmentRouter.get('/:id', EnrollmentController.getById);
