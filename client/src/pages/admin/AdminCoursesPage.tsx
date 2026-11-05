import React from 'react';
import { useAdminCourses } from './useAdminCourses';
import { AdminCoursesHeader } from './AdminCoursesHeader';
import { AdminCoursesTable } from './AdminCoursesTable';
import { AdminCoursesLoading } from './AdminCoursesLoading';
import { AdminCoursesEmpty } from './AdminCoursesEmpty';
import { AdminCoursesError } from './AdminCoursesError';
import { CourseFormModal } from '@/components/admin/CourseFormModal';
import { DeleteCourseDialog } from '@/components/admin/DeleteCourseDialog';

export const AdminCoursesPage: React.FC = () => {
  const {
    isLoading,
    errorMessage,
    search,
    setSearch,
    category,
    setCategory,
    categories,
    filteredCourses,
    isModalOpen,
    setIsModalOpen,
    editingCourse,
    setEditingCourse,
    isSubmittingForm,
    deletingCourse,
    setDeletingCourse,
    isDeleting,
    loadCourses,
    handleFormSubmit,
    handleToggleActive,
    handleConfirmDelete,
  } = useAdminCourses();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <AdminCoursesHeader
        search={search}
        onSearchChange={setSearch}
        category={category}
        onCategoryChange={setCategory}
        categories={categories}
        onAddCourse={() => {
          setEditingCourse(null);
          setIsModalOpen(true);
        }}
      />

      {isLoading && <AdminCoursesLoading />}

      {!isLoading && errorMessage && (
        <AdminCoursesError message={errorMessage} onRetry={loadCourses} />
      )}

      {!isLoading && !errorMessage && filteredCourses.length === 0 && (
        <AdminCoursesEmpty
          isFiltered={!!search.trim() || category !== 'all'}
          onClearFilter={() => {
            setSearch('');
            setCategory('all');
          }}
          onAddCourse={() => {
            setEditingCourse(null);
            setIsModalOpen(true);
          }}
        />
      )}

      {!isLoading && !errorMessage && filteredCourses.length > 0 && (
        <AdminCoursesTable
          courses={filteredCourses}
          onEdit={(c) => {
            setEditingCourse(c);
            setIsModalOpen(true);
          }}
          onToggleActive={handleToggleActive}
          onDelete={(c) => setDeletingCourse(c)}
        />
      )}

      <CourseFormModal
        isOpen={isModalOpen}
        editingCourse={editingCourse}
        isSubmitting={isSubmittingForm}
        onSubmit={handleFormSubmit}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCourse(null);
        }}
      />

      <DeleteCourseDialog
        course={deletingCourse}
        isOpen={!!deletingCourse}
        isDeleting={isDeleting}
        onConfirmDelete={handleConfirmDelete}
        onToggleActiveInstead={
          deletingCourse ? () => handleToggleActive(deletingCourse) : undefined
        }
        onClose={() => setDeletingCourse(null)}
      />
    </div>
  );
};

export default AdminCoursesPage;
