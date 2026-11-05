import React from 'react';
import { useAdminEnrollments } from './useAdminEnrollments';
import { AdminEnrollmentsStats } from './AdminEnrollmentsStats';
import { AdminEnrollmentsFilter } from './AdminEnrollmentsFilter';
import { AdminEnrollmentsTable } from './AdminEnrollmentsTable';
import { AdminEnrollmentsLoading } from './AdminEnrollmentsLoading';
import { AdminEnrollmentsEmpty } from './AdminEnrollmentsEmpty';
import { AdminEnrollmentsError } from './AdminEnrollmentsError';

export const AdminEnrollmentsPage: React.FC = () => {
  const {
    courses,
    selectedCourseId,
    selectedCourse,
    isLoading,
    errorMessage,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    filteredEnrollments,
    loadEnrollments,
    handleSelectCourse,
    handleStatusChange,
  } = useAdminEnrollments();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Quản Lý Ghi Danh Khóa Học
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Theo dõi học viên ghi danh, kiểm tra liên hệ và duyệt trạng thái hồ sơ tuyển sinh.
        </p>
      </div>

      <AdminEnrollmentsStats course={selectedCourse} />

      <AdminEnrollmentsFilter
        courses={courses}
        selectedCourseId={selectedCourseId}
        onSelectCourse={handleSelectCourse}
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onClearFilter={() => {
          setSearch('');
          setStatusFilter('all');
        }}
      />

      {isLoading && <AdminEnrollmentsLoading />}

      {!isLoading && errorMessage && (
        <AdminEnrollmentsError message={errorMessage} onRetry={loadEnrollments} />
      )}

      {!isLoading && !errorMessage && filteredEnrollments.length === 0 && (
        <AdminEnrollmentsEmpty
          isFiltered={!!search.trim() || statusFilter !== 'all'}
          onClearFilter={() => {
            setSearch('');
            setStatusFilter('all');
          }}
        />
      )}

      {!isLoading && !errorMessage && filteredEnrollments.length > 0 && (
        <AdminEnrollmentsTable
          enrollments={filteredEnrollments}
          courseTitle={selectedCourse?.title}
          onChangeStatus={handleStatusChange}
        />
      )}
    </div>
  );
};

export default AdminEnrollmentsPage;
