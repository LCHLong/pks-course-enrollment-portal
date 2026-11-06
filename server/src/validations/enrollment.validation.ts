import { z } from 'zod';

export const enrollSchema = z.object({
  course_id: z.string().optional(),
});

export const updateEnrollmentStatusSchema = z.object({
  status: z.enum(['enrolled', 'confirmed', 'cancelled', 'pending'], {
    errorMap: () => ({ message: 'Trạng thái ghi danh không hợp lệ' }),
  }),
});
