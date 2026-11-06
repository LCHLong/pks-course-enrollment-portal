export type EnrollmentStatus = 'enrolled' | 'pending' | 'cancelled' | 'confirmed';

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
