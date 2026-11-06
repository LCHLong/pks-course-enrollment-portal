import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError.js';
import { sendError } from '../utils/apiResponse.js';
import { Prisma } from '@prisma/client';

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    sendError(res, err.code, err.message, err.statusCode, err.details);
    return;
  }

  // Trap Prisma Unique Constraint Error (P2002)
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
    const target = Array.isArray(err.meta?.target) ? (err.meta.target as string[]).join(', ') : 'field';
    if (target.includes('email')) {
      sendError(res, 'EMAIL_EXISTS', 'Email này đã được sử dụng trong hệ thống.', 409);
      return;
    }
    sendError(res, 'ALREADY_ENROLLED', 'Bản ghi đã tồn tại trong hệ thống.', 409);
    return;
  }

  console.error('Unhandled Server Error:', err);
  const message = err instanceof Error ? err.message : 'Đã có lỗi xảy ra từ máy chủ nội bộ.';
  sendError(
    res,
    'INTERNAL_SERVER_ERROR',
    message,
    500,
    process.env.NODE_ENV === 'development' ? err : null
  );
};
