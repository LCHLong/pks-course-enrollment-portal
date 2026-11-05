import { prisma } from '../config/database.js';
import { AppError } from '../utils/appError.js';
import { formatDateVN } from '../utils/date.js';

export class EnrollmentService {
  static async enrollCourse(userId: string, courseId: string) {
    if (!courseId || courseId.trim() === '') {
      throw new AppError('VALIDATION_ERROR', 'Mã khóa học không hợp lệ.', 400);
    }

    const trimmedCourseId = courseId.trim();

    return await prisma.$transaction(async (tx) => {
      // 1. Kiểm tra khóa học tồn tại
      const targetCourse = await tx.course.findUnique({
        where: { id: trimmedCourseId },
      });

      if (!targetCourse) {
        throw new AppError('COURSE_NOT_FOUND', 'Không tìm thấy khóa học.', 404);
      }

      if (!targetCourse.is_active) {
        throw new AppError('COURSE_INACTIVE', 'Khóa học hiện không mở đăng ký.', 400);
      }

      // 2. Chặn ghi danh trùng lặp (nếu đã có bản ghi chưa bị hủy)
      const existingEnrollment = await tx.enrollment.findUnique({
        where: {
          user_id_course_id: {
            user_id: userId,
            course_id: trimmedCourseId,
          },
        },
      });

      if (existingEnrollment && existingEnrollment.status !== 'cancelled') {
        throw new AppError('ALREADY_ENROLLED', 'Bạn đã ghi danh khóa học này rồi.', 409);
      }

      // 3. Kiểm tra sĩ số trước khi cập nhật
      if (targetCourse.enrolled_count >= targetCourse.capacity) {
        throw new AppError('COURSE_FULL', 'Khóa học đã đủ sĩ số tối đa.', 400);
      }

      // 4. PostgreSQL Atomic Update chống race condition khi tranh suất cuối
      const updateResult = await tx.$executeRaw`
        UPDATE "courses"
        SET "enrolled_count" = "enrolled_count" + 1, "updated_at" = NOW()
        WHERE "id" = ${trimmedCourseId} AND "enrolled_count" < "capacity" AND "is_active" = true
      `;

      if (updateResult === 0) {
        throw new AppError('COURSE_FULL', 'Khóa học đã đủ sĩ số tối đa.', 400);
      }

      // 5. Tạo mới hoặc tái kích hoạt bản ghi enrollment
      let enrollment;
      try {
        if (existingEnrollment && existingEnrollment.status === 'cancelled') {
          enrollment = await tx.enrollment.update({
            where: { id: existingEnrollment.id },
            data: {
              status: 'enrolled',
              updated_at: new Date(),
            },
            include: {
              course: true,
            },
          });
        } else {
          enrollment = await tx.enrollment.create({
            data: {
              user_id: userId,
              course_id: trimmedCourseId,
              status: 'enrolled',
            },
            include: {
              course: true,
            },
          });
        }
      } catch (err: any) {
        if (err?.code === 'P2002') {
          throw new AppError('ALREADY_ENROLLED', 'Bạn đã ghi danh khóa học này rồi.', 409);
        }
        throw err;
      }

      return {
        ...enrollment,
        registration_date: formatDateVN(enrollment.created_at),
      };
    });
  }

  static async getMyCourses(userId: string) {
    const enrollments = await prisma.enrollment.findMany({
      where: {
        user_id: userId,
      },
      include: {
        course: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return enrollments.map((e) => ({
      ...e,
      registration_date: formatDateVN(e.created_at),
    }));
  }

  static async getEnrollmentById(id: string, userId: string, role: string) {
    const enrollment = await prisma.enrollment.findUnique({
      where: { id },
      include: {
        course: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!enrollment) {
      throw new AppError('NOT_FOUND', 'Không tìm thấy thông tin ghi danh.', 404);
    }

    if (role !== 'admin' && enrollment.user_id !== userId) {
      throw new AppError('FORBIDDEN', 'Bạn không có quyền xem thông tin ghi danh này.', 403);
    }

    return {
      ...enrollment,
      registration_date: formatDateVN(enrollment.created_at),
    };
  }
}
