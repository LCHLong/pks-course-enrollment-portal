import { Request, Response, NextFunction } from 'express';
import { CourseService } from '../services/course.service.js';
import { sendSuccess } from '../utils/apiResponse.js';

export class CourseController {
  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await CourseService.listCourses({
        ...req.query,
        userId: req.user?.id,
      });
      sendSuccess(res, result, 'Lấy danh sách khóa học thành công', 200);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const course = await CourseService.getCourseById(id, req.user?.id);
      sendSuccess(res, { course }, 'Lấy chi tiết khóa học thành công', 200);
    } catch (error) {
      next(error);
    }
  }
}
