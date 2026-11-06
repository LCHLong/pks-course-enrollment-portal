import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { NotFoundPage } from '@/components/layout/NotFoundPage';

// Subagent C pages
import { CourseCatalogPage, CourseDetailPage } from '@/pages/courses';
import { LoginPage, RegisterPage } from '@/pages/auth';
import { ProfilePage } from '@/pages/profile';

// Subagent D pages
import { MyCoursesPage } from '@/pages/my-courses';
import { AdminCoursesPage, AdminEnrollmentsPage } from '@/pages/admin';

interface AppRoutesProps {
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

/**
 * Standard page wrapper for views requiring container width & padding
 */
const CatalogWrapper: React.FC = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <CourseCatalogPage />
  </div>
);

const DetailWrapper: React.FC = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <CourseDetailPage />
  </div>
);

const ProfileWrapper: React.FC = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <ProfilePage />
  </div>
);

export const AppRoutes: React.FC<AppRoutesProps> = ({ isDarkMode, onToggleTheme }) => {
  return (
    <Routes>
      <Route path="/" element={<Layout isDarkMode={isDarkMode} onToggleTheme={onToggleTheme} />}>
        {/* Public Catalog & Details Routes */}
        <Route index element={<CatalogWrapper />} />
        <Route path="courses" element={<CatalogWrapper />} />
        <Route path="courses/:id" element={<DetailWrapper />} />

        {/* Auth Routes */}
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />

        {/* Protected Student / Authenticated Routes */}
        <Route
          path="my-courses"
          element={
            <ProtectedRoute>
              <MyCoursesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <ProfileWrapper />
            </ProtectedRoute>
          }
        />

        {/* Protected Admin Routes */}
        <Route
          path="admin"
          element={<Navigate to="/admin/courses" replace />}
        />
        <Route
          path="admin/courses"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminCoursesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin/enrollments"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminEnrollmentsPage />
            </ProtectedRoute>
          }
        />

        {/* 404 Catch-All Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
