import { z } from 'zod';

export const createCourseSchema = z.object({
  title: z.string().trim().min(1, 'Tên khóa học không được để trống'),
  category: z.string().trim().min(1, 'Danh mục không được để trống'),
  instructor: z.string().trim().min(1, 'Giảng viên không được để trống'),
  description: z.string().default(''),
  price: z.coerce.number().int().min(0, 'Học phí phải lớn hơn hoặc bằng 0'),
  capacity: z.coerce.number().int().min(1, 'Sĩ số tối đa phải lớn hơn 0'),
  is_active: z.boolean().optional(),
  status: z.enum(['active', 'hidden', 'deleted']).optional(),
});

export const updateCourseSchema = z.object({
  title: z.string().trim().min(1).optional(),
  category: z.string().trim().min(1).optional(),
  instructor: z.string().trim().min(1).optional(),
  description: z.string().optional(),
  price: z.coerce.number().int().min(0).optional(),
  capacity: z.coerce.number().int().optional(),
  is_active: z.boolean().optional(),
  status: z.enum(['active', 'hidden', 'deleted']).optional(),
});

export const queryCourseSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().optional(),
  category: z.string().trim().optional(),
});
