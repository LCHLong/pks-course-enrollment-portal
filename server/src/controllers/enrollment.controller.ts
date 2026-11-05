import { Request, Response, NextFunction } from 'express';
import { EnrollmentService } from '../services/enrollment.service.js';
import { sendSuccess } from '../utils/apiResponse.js';

export class EnrollmentController {
  static async enroll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const courseId = (req.params.id || req.params.courseId || req.body.course_id) as string;
      const enrollment = await EnrollmentService.enrollCourse(req.user!.id, courseId);
      sendSuccess(res, { enrollment }, 'Ghi danh khóa học thành công', 201);
    } catch (error) {
      next(error);
    }
  }

  static async getMyCourses(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const enrollments = await EnrollmentService.getMyCourses(req.user!.id);
      sendSuccess(res, { enrollments }, 'Lấy danh sách khóa học của tôi thành công', 200);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const enrollment = await EnrollmentService.getEnrollmentById(
        id,
        req.user!.id,
        req.user!.role
      );
      sendSuccess(res, { enrollment }, 'Lấy chi tiết lượt ghi danh thành công', 200);
    } catch (error) {
      next(error);
    }
  }
}
