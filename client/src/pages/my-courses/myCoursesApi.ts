import { Enrollment } from '@/types/enrollment';

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

export async function fetchStudentEnrollments(): Promise<Enrollment[]> {
  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/student/my-courses`, {
    method: 'GET',
    headers: getHeaders(),
  });

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error('Vui lòng đăng nhập để xem khóa học của bạn');
    }
    const errData = await res.json().catch(() => null);
    throw new Error(errData?.error?.message || errData?.message || 'Không thể tải danh sách khóa học');
  }

  const json = await res.json();
  const rawList = json?.data?.enrollments || json?.data || json?.enrollments || [];
  return Array.isArray(rawList) ? rawList : [];
}

export async function cancelEnrollment(enrollmentId: string): Promise<void> {
  const baseUrl = getBaseUrl();
  const res = await fetch(`${baseUrl}/student/enrollments/${enrollmentId}/cancel`, {
    method: 'POST',
    headers: getHeaders(),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => null);
    throw new Error(errData?.error?.message || errData?.message || 'Không thể hủy ghi danh');
  }
}

export const cancelStudentEnrollment = cancelEnrollment;
