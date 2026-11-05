import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service.js';
import { sendSuccess } from '../utils/apiResponse.js';

export class UserController {
  static async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await UserService.getProfile(req.user!.id);
      sendSuccess(res, { user }, 'Lấy thông tin hồ sơ thành công', 200);
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await UserService.updateProfile(req.user!.id, req.body);
      sendSuccess(res, { user }, 'Cập nhật hồ sơ thành công', 200);
    } catch (error) {
      next(error);
    }
  }

  static async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await UserService.changePassword(req.user!.id, req.body);
      sendSuccess(res, null, result.message, 200);
    } catch (error) {
      next(error);
    }
  }
}
