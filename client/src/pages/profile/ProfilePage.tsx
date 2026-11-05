import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { AlertCircle } from 'lucide-react';
import { api } from '@/components/ui/api';
import { useAuth } from '@/components/ui/AuthContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { ChangePasswordModal } from './ChangePasswordModal';
import { ProfileHeader } from './ProfileHeader';
import { ProfileNameForm } from './ProfileNameForm';

export const ProfilePage: React.FC = () => {
  const { user: authUser, isAuthenticated, isLoading: authLoading, updateUser } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<any>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login?returnUrl=/profile');
    }
  }, [authLoading, isAuthenticated, navigate]);

  const loadProfile = useCallback(async () => {
    setIsFetching(true);
    setFetchError(null);
    try {
      const res = await api.get<{ user?: any }>('/user/profile');
      const userData = res?.user || res;
      setProfile(userData);
    } catch (err: any) {
      setFetchError(err?.message || 'Không thể tải thông tin hồ sơ cá nhân');
    } finally {
      setIsFetching(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadProfile();
    }
  }, [isAuthenticated, loadProfile]);

  const handleUpdateName = async (trimmedName: string) => {
    setIsUpdating(true);
    try {
      const res = await api.put<{ user?: any }>('/user/profile', { name: trimmedName });
      const updated = res?.user || res;
      setProfile((prev: any) => ({ ...prev, ...updated, name: trimmedName }));
      updateUser({ name: trimmedName });
      toast.success('Cập nhật họ tên thành công!');
    } catch (err: any) {
      toast.error(err?.message || 'Không thể cập nhật họ tên');
    } finally {
      setIsUpdating(false);
    }
  };

  if (authLoading || isFetching) {
    return (
      <div data-testid="skeleton-profile" aria-label="Đang tải thông tin hồ sơ" className="max-w-2xl mx-auto py-8 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card className="p-6 space-y-4">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
        </Card>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <div data-testid="alert-profile-error" role="alert" aria-live="assertive" className="p-4 rounded-xl border border-red-500/30 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 text-sm flex items-center justify-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{fetchError}</span>
        </div>
        <button onClick={loadProfile} data-testid="btn-profile-retry" aria-label="Thử tải lại thông tin cá nhân" className="h-11 px-6 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-semibold text-sm">
          Thử lại
        </button>
      </div>
    );
  }

  const currentUser = profile || authUser;
  if (!currentUser) {
    return (
      <div data-testid="state-profile-empty" className="max-w-md mx-auto py-16 text-center space-y-4">
        <p className="text-zinc-500">Không thể tìm thấy thông tin tài khoản.</p>
        <Button onClick={() => navigate('/login?returnUrl=/profile')}>Đăng nhập lại</Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Hồ sơ cá nhân
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Quản lý thông tin tài khoản và bảo mật mật khẩu của bạn
        </p>
      </div>

      <Card aria-label="Thông tin tài khoản cá nhân" data-testid="card-user-profile" className="p-6 sm:p-8 space-y-6">
        <ProfileHeader user={currentUser} />
        <ProfileNameForm
          email={currentUser.email}
          initialName={currentUser.name || ''}
          onSubmit={handleUpdateName}
          isLoading={isUpdating}
        />
      </Card>

      <ChangePasswordModal />
    </div>
  );
};
export default ProfilePage;
