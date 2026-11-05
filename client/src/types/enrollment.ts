export type EnrollmentStatus = 'enrolled' | 'cancelled' | 'pending';

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  status: EnrollmentStatus;
  created_at: string;
  user?: {
    name: string;
    email: string;
  };
  course?: {
    title: string;
    category: string;
    price: number;
    instructor: string;
  };
}
