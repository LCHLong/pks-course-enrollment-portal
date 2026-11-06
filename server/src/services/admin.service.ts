import { prisma } from '../config/database.js';
import { AppError } from '../utils/appError.js';
import { formatDateVN } from '../utils/date.js';

export interface CreateCourseDTO {
  title: string;
  category: string;
  instructor: string;
  description?: string;
  price: number;
  capacity: number;
  is_active?: boolean;
  status?: 'active' | 'hidden' | 'deleted';
}

export interface UpdateCourseDTO {
  title?: string;
  category?: string;
  instructor?: string;
  description?: string;
  price?: number;
  capacity?: number;
  is_active?: boolean;
  status?: 'active' | 'hidden' | 'deleted';
}

export class AdminService {
  static async createCourse(data: CreateCourseDTO) {
    const is_active =
      data.status !== undefined
        ? data.status === 'active'
        : data.is_active !== undefined
          ? data.is_active
          : true;

    const course = await prisma.course.create({
      data: {
        title: data.title.trim(),
        category: data.category.trim(),
        instructor: data.instructor.trim(),
        description: data.description?.trim() || '',
        price: data.price,
        capacity: data.capacity,
        enrolled_count: 0,
        is_active,
      },
    });

    return course;
  }

  static async updateCourse(id: string, data: UpdateCourseDTO) {
    return await prisma.$transaction(async (tx) => {
      // Row locking SELECT ... FOR UPDATE
      const rows = await tx.$queryRaw<any[]>`
        SELECT * FROM "courses" WHERE "id" = ${id} FOR UPDATE
      `;

      if (!rows || rows.length === 0) {
        throw new AppError('COURSE_NOT_FOUND', 'Không tìm thấy khóa học.', 404);
      }

      const current = rows[0];

      // Invariant: capacity >= enrolled_count and capacity > 0
      if (data.capacity !== undefined) {
        if (data.capacity <= 0 || data.capacity < current.enrolled_count) {
          throw new AppError(
            'INVALID_CAPACITY',
            `Sĩ số tối đa (${data.capacity}) không hợp lệ hoặc thấp hơn số lượng học viên đã ghi danh (${current.enrolled_count}).`,
            400
          );
        }
      }

      const is_active =
        data.status !== undefined
          ? data.status === 'active'
          : data.is_active !== undefined
            ? data.is_active
            : undefined;

      const updated = await tx.course.update({
        where: { id },
        data: {
          title: data.title?.trim(),
          category: data.category?.trim(),
          instructor: data.instructor?.trim(),
          description: data.description?.trim(),
          price: data.price,
          capacity: data.capacity,
          is_active,
        },
      });

      return updated;
    });
  }

  static async deleteCourse(id: string) {
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        _count: {
          select: { enrollments: true },
        },
      },
    });

    if (!course) {
      throw new AppError('COURSE_NOT_FOUND', 'Không tìm thấy khóa học.', 404);
    }

    if (course.enrolled_count > 0 || course._count.enrollments > 0) {
      throw new AppError(
        'COURSE_HAS_ENROLLMENTS',
        'Không thể xóa khóa học đã có học viên đăng ký. Vui lòng chuyển trạng thái ẩn.',
        409
      );
    }

    await prisma.course.delete({
      where: { id },
    });

    return { message: 'Xóa khóa học thành công.' };
  }

  static async getCourseEnrollments(courseId: string) {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new AppError('COURSE_NOT_FOUND', 'Không tìm thấy khóa học.', 404);
    }

    const enrollments = await prisma.enrollment.findMany({
      where: { course_id: courseId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        course: true,
      },
      orderBy: { created_at: 'desc' },
    });

    return enrollments.map((e) => ({
      ...e,
      registration_date: formatDateVN(e.created_at),
    }));
  }

  static async updateEnrollmentStatus(
    enrollmentId: string,
    status: 'enrolled' | 'confirmed' | 'cancelled' | 'pending'
  ) {
    return await prisma.$transaction(async (tx) => {
      const enrollment = await tx.enrollment.findUnique({
        where: { id: enrollmentId },
        include: { course: true, user: true },
      });

      if (!enrollment) {
        throw new AppError('NOT_FOUND', 'Không tìm thấy lượt ghi danh.', 404);
      }

      const oldStatus = enrollment.status;
      const newStatus = status;

      if (oldStatus !== newStatus) {
        const wasActive = oldStatus === 'enrolled' || oldStatus === 'confirmed';
        const willBeActive = newStatus === 'enrolled' || newStatus === 'confirmed';

        if (wasActive && !willBeActive) {
          // Decrement counter
          await tx.$executeRaw`
            UPDATE "courses"
            SET "enrolled_count" = GREATEST(0, "enrolled_count" - 1), "updated_at" = NOW()
            WHERE "id" = ${enrollment.course_id}
          `;
        } else if (!wasActive && willBeActive) {
          // Increment counter with capacity check
          const updated = await tx.$executeRaw`
            UPDATE "courses"
            SET "enrolled_count" = "enrolled_count" + 1, "updated_at" = NOW()
            WHERE "id" = ${enrollment.course_id} AND "enrolled_count" < "capacity"
          `;

          if (updated === 0) {
            throw new AppError('CAPACITY_FULL', 'Khóa học đã đủ sĩ số tối đa.', 409);
          }
        }
      }

      const updatedEnrollment = await tx.enrollment.update({
        where: { id: enrollmentId },
        data: { status: newStatus },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          course: true,
        },
      });

      return {
        ...updatedEnrollment,
        registration_date: formatDateVN(updatedEnrollment.created_at),
      };
    });
  }
}
