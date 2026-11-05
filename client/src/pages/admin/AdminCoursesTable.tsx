import React from 'react';
import { Course } from '@/types/course';
import { AdminCourseRow } from './AdminCourseRow';

interface AdminCoursesTableProps {
  courses: Course[];
  onEdit: (course: Course) => void;
  onToggleActive: (course: Course) => void;
  onDelete: (course: Course) => void;
}

export const AdminCoursesTable: React.FC<AdminCoursesTableProps> = ({
  courses,
  onEdit,
  onToggleActive,
  onDelete,
}) => {
  return (
    <div
      data-testid="admin-course-table"
      className="border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900 overflow-hidden shadow-sm"
    >
      <div className="overflow-x-auto">
        <table
          role="table"
          aria-label="Bảng danh sách quản trị khóa học"
          data-testid="table-admin-courses"
          className="w-full text-left border-collapse"
        >
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/75 dark:bg-zinc-800/40 text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              <th className="py-3.5 px-4">Tên khóa học & Giảng viên</th>
              <th className="py-3.5 px-4">Danh mục</th>
              <th className="py-3.5 px-4">Học phí</th>
              <th className="py-3.5 px-4 min-w-[160px]">Sĩ số & Tiến độ</th>
              <th className="py-3.5 px-4">Trạng thái</th>
              <th className="py-3.5 px-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <AdminCourseRow
                key={course.id}
                course={course}
                onEdit={onEdit}
                onToggleActive={onToggleActive}
                onDelete={onDelete}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
