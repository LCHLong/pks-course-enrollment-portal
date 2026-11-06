import { Request, Response, NextFunction } from 'express';
import { cancelStudentEnrollment } from '../services/enrollment.service.js';
import { sendSuccess } from '../utils/apiResponse.js';

export async function cancelEnrollmentController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const enrollmentId = req.params.id as string;
    const userId = req.user!.id;
    const result = await cancelStudentEnrollment(enrollmentId, userId);
    sendSuccess(res, result, 'Hủy ghi danh thành công', 200);
  } catch (error) {
    next(error);
  }
}

export class StudentController {
  static cancelEnrollmentController = cancelEnrollmentController;
  static cancelEnrollment = cancelEnrollmentController;
}
