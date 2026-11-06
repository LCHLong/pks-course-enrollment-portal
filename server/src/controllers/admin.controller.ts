import { Request, Response, NextFunction } from 'express';
import { AdminService } from '../services/admin.service.js';
import { sendSuccess } from '../utils/apiResponse.js';

export class AdminController {
  static async createCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const course = await AdminService.createCourse(req.body);
      sendSuccess(res, { course }, 'Tạo khóa học thành công', 201);
    } catch (error) {
      next(error);
    }
  }

  static async updateCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const course = await AdminService.updateCourse(id, req.body);
      sendSuccess(res, { course }, 'Cập nhật khóa học thành công', 200);
    } catch (error) {
      next(error);
    }
  }

  static async deleteCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const result = await AdminService.deleteCourse(id);
      sendSuccess(res, null, result.message, 200);
    } catch (error) {
      next(error);
    }
  }

  static async getCourseEnrollments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const enrollments = await AdminService.getCourseEnrollments(id);
      sendSuccess(res, { enrollments }, 'Lấy danh sách học viên ghi danh thành công', 200);
    } catch (error) {
      next(error);
    }
  }

  static async updateEnrollmentStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const enrollment = await AdminService.updateEnrollmentStatus(id, req.body.status);
      sendSuccess(res, { enrollment }, 'Cập nhật trạng thái ghi danh thành công', 200);
    } catch (error) {
      next(error);
    }
  }
}
