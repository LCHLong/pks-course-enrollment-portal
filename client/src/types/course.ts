export interface Course {
  id: string;
  title: string;
  category: string;
  instructor: string;
  description: string;
  price: number;
  capacity: number;
  enrolled_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CourseFilter {
  search?: string;
  category?: string;
}
