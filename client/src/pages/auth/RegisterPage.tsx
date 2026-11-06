import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { UserPlus, AlertCircle } from 'lucide-react';
import { useAuth } from '@/components/ui/AuthContext';
import { Card } from '@/components/ui/Card';
import { RegisterForm } from './RegisterForm';

export const RegisterPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [emailConflictError, setEmailConflictError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleRegister = async (data: { name: string; email: string; password: string }) => {
    setGeneralError(null);
    setEmailConflictError(null);
    setIsLoading(true);
    try {
      await register(data);
      toast.success('Đăng ký tài khoản thành công! Vui lòng đăng nhập.');
      const returnUrl = searchParams.get('returnUrl');
      const target = returnUrl ? `/login?returnUrl=${encodeURIComponent(returnUrl)}` : '/login';
      navigate(target);
    } catch (err: any) {
      const msg = err?.message || 'Đăng ký tài khoản không thành công. Vui lòng thử lại.';
      if (err?.code === 'EMAIL_EXISTS' || err?.code === 'EMAIL_ALREADY_EXISTS' || err?.status === 409) {
        setEmailConflictError('Email này đã được sử dụng. Vui lòng chọn email khác hoặc đăng nhập.');
      } else {
        setGeneralError(msg);
      }
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-160px)] flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 mx-auto flex items-center justify-center">
            <UserPlus className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Đăng ký tài khoản mới
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Tạo tài khoản học viên để bắt đầu hành trình tại PKS
          </p>
        </div>

        {generalError && (
          <div
            role="alert"
            className="p-3.5 rounded-xl border border-red-500/30 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 text-xs flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{generalError}</span>
          </div>
        )}

        <RegisterForm
          isLoading={isLoading}
          onSubmit={handleRegister}
          externalError={emailConflictError}
        />

        <div className="text-center pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Đã có tài khoản?{' '}
            <Link
              to={`/login${searchParams.get('returnUrl') ? `?returnUrl=${encodeURIComponent(searchParams.get('returnUrl')!)}` : ''}`}
              aria-label="Đã có tài khoản? Đăng nhập ngay"
              data-testid="link-register-to-login"
              className="font-semibold text-zinc-900 dark:text-zinc-100 hover:underline"
            >
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
};
export default RegisterPage;
