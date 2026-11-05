import { Course } from '@/types/course';
import { Enrollment } from '@/types/enrollment';

export interface CourseFormData {
  title: string;
  category: string;
  instructor: string;
  description: string;
  price: number;
  capacity: number;
  is_active: boolean;
}

const getBaseUrl = (): string => {
  const envUrl = (import.meta as any).env?.VITE_API_BASE_URL || '';
  if (!envUrl) return '/api';
  return envUrl.endsWith('/api') ? envUrl : `${envUrl.replace(/\/$/, '')}/api`;
};

const getHeaders = (): HeadersInit => {
  const token = localStorage.getItem('pks_token') || localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export async function fetchAdminCourses(search?: string, category?: string): Promise<Course[]> {
  const baseUrl = getBaseUrl();
  const params = new URLSearchParams();
  if (search?.trim()) params.append('search', search.trim());
  if (category && category !== 'all') params.append('category', category);

  const queryStr = params.toString() ? `?${params.toString()}` : '';
  const res = await fetch(`${baseUrl}/admin/courses${queryStr}`, {
    method: 'GET',
    headers: getHeaders(),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => null);
    throw new Error(errData?.error?.message || errData?.message || 'Không thể tải danh sách khóa học');
  }

  const json = await res.json();
  const list = json?.data?.courses || json?.data || json?.courses || [];
  return Array.isArray(list) ? list : [];
}

export async function createAdminCourse(data: CourseFormData): Promise<Course> {
  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/admin/courses`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.error?.message || err?.message || 'Tạo khóa học thất bại');
  }

  const json = await res.json();
  return json?.data?.course || json?.data || json?.course;
}

export async function updateAdminCourse(id: string, data: Partial<CourseFormData>): Promise<Course> {
  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/admin/courses/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.error?.message || err?.message || 'Cập nhật khóa học thất bại');
  }

  const json = await res.json();
  return json?.data?.course || json?.data || json?.course;
}

export async function deleteAdminCourse(id: string): Promise<void> {
  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/admin/courses/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.error?.message || err?.message || 'Xóa khóa học thất bại');
  }
}

export async function fetchCourseEnrollments(courseId: string): Promise<Enrollment[]> {
  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/admin/courses/${courseId}/enrollments`, {
    method: 'GET',
    headers: getHeaders(),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.error?.message || err?.message || 'Không thể tải danh sách học viên');
  }

  const json = await res.json();
  const list = json?.data?.enrollments || json?.data || json?.enrollments || [];
  return Array.isArray(list) ? list : [];
}

export async function updateEnrollmentStatus(
  enrollmentId: string,
  status: 'enrolled' | 'confirmed' | 'cancelled' | 'pending'
): Promise<Enrollment> {
  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/admin/enrollments/${enrollmentId}/status`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ status }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.error?.message || err?.message || 'Cập nhật trạng thái thất bại');
  }

  const json = await res.json();
  return json?.data?.enrollment || json?.data || json?.enrollment;
}
