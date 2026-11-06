import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/components/ui/AuthContext';
import { Loader2 } from 'lucide-react';

export interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div
        role="status"
        aria-label="Đang kiểm tra quyền truy cập"
        className="min-h-[50vh] flex flex-col items-center justify-center gap-3 text-zinc-500 dark:text-zinc-400"
      >
        <Loader2 className="w-8 h-8 animate-spin text-zinc-900 dark:text-zinc-100" />
        <span className="text-sm">Đang xác thực thông tin...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    const returnUrl = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?returnUrl=${returnUrl}`} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    toast.error('Bạn không có quyền truy cập trang này.');
    return <Navigate to="/courses" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
