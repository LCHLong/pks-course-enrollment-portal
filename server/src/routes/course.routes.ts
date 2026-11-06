import { Router } from 'express';
import { CourseController } from '../controllers/course.controller.js';
import { EnrollmentController } from '../controllers/enrollment.controller.js';
import { authenticateJWT, optionalAuthenticateJWT } from '../middlewares/auth.middleware.js';
import { validateQuery } from '../middlewares/validate.middleware.js';
import { queryCourseSchema } from '../validations/course.validation.js';

export const courseRouter = Router();

courseRouter.get('/', optionalAuthenticateJWT, validateQuery(queryCourseSchema), CourseController.list);
courseRouter.get('/:id', optionalAuthenticateJWT, CourseController.getById);
courseRouter.post('/:id/enroll', authenticateJWT, EnrollmentController.enroll);
