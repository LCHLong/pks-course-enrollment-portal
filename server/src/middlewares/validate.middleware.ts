import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { sendError } from '../utils/apiResponse.js';

export const validateBody = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        sendError(res, 'VALIDATION_ERROR', 'Dữ liệu không hợp lệ', 400, issues);
        return;
      }
      sendError(res, 'VALIDATION_ERROR', 'Dữ liệu không hợp lệ', 400);
    }
  };
};

export const validateQuery = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.query = await schema.parseAsync(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        sendError(res, 'VALIDATION_ERROR', 'Tham số truy vấn không hợp lệ', 400, issues);
        return;
      }
      sendError(res, 'VALIDATION_ERROR', 'Tham số truy vấn không hợp lệ', 400);
    }
  };
};
