import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, 'Họ và tên phải có ít nhất 2 ký tự'),
});

export const changePasswordSchema = z.object({
  current_password: z.string().min(1, 'Mật khẩu hiện tại không được để trống'),
  new_password: z.string().min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự'),
});
