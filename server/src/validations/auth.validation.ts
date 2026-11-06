import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Họ và tên phải có ít nhất 2 ký tự'),
  email: z.string().trim().email('Địa chỉ email không đúng định dạng'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

export const loginSchema = z.object({
  email: z.string().trim().email('Địa chỉ email không đúng định dạng'),
  password: z.string().min(1, 'Mật khẩu không được để trống'),
});
