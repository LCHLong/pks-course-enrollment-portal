import { prisma } from '../config/database.js';
import { AppError } from '../utils/appError.js';
import { removeVietnameseTones, matchesVietnamese } from '../utils/vietnamese.js';

export interface CourseQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  userId?: string;
}

export class CourseService {
  static async listCourses(params: CourseQueryParams) {
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = {
      is_active: true,
    };

    if (params.category && params.category.trim() !== '') {
      where.category = {
        equals: params.category.trim(),
        mode: 'insensitive',
      };
    }

    const searchTerm = params.search ? params.search.trim() : '';
    const cleanSearch = removeVietnameseTones(searchTerm);
    const isGenericCourseQuery = ['khoa', 'khoa hoc', 'course', 'courses', 'tat ca', 'all'].includes(cleanSearch);

    let total: number;
    let coursesList: any[];

    if (searchTerm && !isGenericCourseQuery) {
      // Fetch all candidate active courses under current category filter to perform accent-insensitive search
      const baseWhere: any = { is_active: true };
      if (params.category && params.category.trim() !== '') {
        baseWhere.category = {
          equals: params.category.trim(),
          mode: 'insensitive',
        };
      }

      const candidateCourses = await prisma.course.findMany({
        where: baseWhere,
        orderBy: { created_at: 'desc' },
      });

      const matched = candidateCourses.filter((course) => {
        return (
          matchesVietnamese(course.title, searchTerm) ||
          matchesVietnamese(course.description, searchTerm) ||
          matchesVietnamese(course.instructor, searchTerm) ||
          matchesVietnamese(course.category, searchTerm)
        );
      });

      total = matched.length;
      coursesList = matched.slice(skip, skip + limit);
    } else {
      [total, coursesList] = await Promise.all([
        prisma.course.count({ where }),
        prisma.course.findMany({
          where,
          skip,
          take: limit,
          orderBy: { created_at: 'desc' },
        }),
      ]);
    }

    let userEnrolledCourseIds = new Set<string>();
    if (params.userId) {
      const userEnrollments = await prisma.enrollment.findMany({
        where: {
          user_id: params.userId,
          status: { in: ['enrolled', 'confirmed'] },
        },
        select: { course_id: true },
      });
      userEnrolledCourseIds = new Set(userEnrollments.map((e) => e.course_id));
    }

    const courses = coursesList.map((course) => ({
      ...course,
      is_enrolled: params.userId ? userEnrolledCourseIds.has(course.id) : false,
      status_label: course.enrolled_count >= course.capacity ? 'Hết chỗ' : 'Còn chỗ',
    }));

    return {
      courses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  static async getCourseById(id: string, userId?: string) {
    const course = await prisma.course.findUnique({
      where: { id },
    });

    if (!course) {
      throw new AppError('COURSE_NOT_FOUND', 'Không tìm thấy thông tin khóa học.', 404);
    }

    let is_enrolled = false;
    if (userId) {
      const enrollment = await prisma.enrollment.findUnique({
        where: {
          user_id_course_id: {
            user_id: userId,
            course_id: id,
          },
        },
      });
      is_enrolled = !!enrollment && (enrollment.status === 'enrolled' || enrollment.status === 'confirmed');
    }

    return {
      ...course,
      is_enrolled,
      status_label: course.enrolled_count >= course.capacity ? 'Hết chỗ' : 'Còn chỗ',
    };
  }

  static async getCategories(): Promise<string[]> {
    const courses = await prisma.course.findMany({
      where: { is_active: true },
      select: { category: true },
      distinct: ['category'],
    });
    return courses.map((c) => c.category).filter(Boolean);
  }

  static async getAdminCourses(params: CourseQueryParams = {}) {
    return getAdminCourses(params);
  }
}

export async function getAdminCourses(params: CourseQueryParams = {}) {
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 10;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (params.category && params.category.trim() !== '') {
    where.category = {
      equals: params.category.trim(),
      mode: 'insensitive',
    };
  }

  if (params.search && params.search.trim() !== '') {
    where.OR = [
      { title: { contains: params.search.trim(), mode: 'insensitive' } },
      { description: { contains: params.search.trim(), mode: 'insensitive' } },
      { instructor: { contains: params.search.trim(), mode: 'insensitive' } },
    ];
  }

  const [total, coursesList] = await Promise.all([
    prisma.course.count({ where }),
    prisma.course.findMany({
      where,
      skip,
      take: limit,
      orderBy: { created_at: 'desc' },
    }),
  ]);

  const courses = coursesList.map((course) => ({
    ...course,
    status_label: course.enrolled_count >= course.capacity ? 'Hết chỗ' : 'Còn chỗ',
  }));

  return {
    courses,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

