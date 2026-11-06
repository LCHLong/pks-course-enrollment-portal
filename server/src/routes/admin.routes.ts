import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller.js';
import { CourseController } from '../controllers/course.controller.js';
import { authenticateJWT } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';
import { validateBody, validateQuery } from '../middlewares/validate.middleware.js';
import { createCourseSchema, updateCourseSchema, queryCourseSchema } from '../validations/course.validation.js';
import { updateEnrollmentStatusSchema } from '../validations/enrollment.validation.js';

export const adminRouter = Router();

// Toàn bộ Admin routes yêu cầu xác thực JWT và quyền admin
adminRouter.use(authenticateJWT, requireRole('admin'));

// Quản lý khóa học (Course CRUD)
adminRouter.get('/courses', validateQuery(queryCourseSchema), CourseController.list);
adminRouter.get('/courses/:id', CourseController.getById);
adminRouter.post('/courses', validateBody(createCourseSchema), AdminController.createCourse);
adminRouter.put('/courses/:id', validateBody(updateCourseSchema), AdminController.updateCourse);
adminRouter.patch('/courses/:id', validateBody(updateCourseSchema), AdminController.updateCourse);
adminRouter.delete('/courses/:id', AdminController.deleteCourse);

// Quản lý ghi danh khóa học (Enrollment Tracking & Status)
adminRouter.get('/courses/:id/enrollments', AdminController.getCourseEnrollments);
adminRouter.patch('/enrollments/:id/status', validateBody(updateEnrollmentStatusSchema), AdminController.updateEnrollmentStatus);
adminRouter.put('/enrollments/:id/status', validateBody(updateEnrollmentStatusSchema), AdminController.updateEnrollmentStatus);
