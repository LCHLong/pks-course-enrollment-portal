import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '@/components/ui/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const getSafeReturnUrl = (): string => {
    const raw = searchParams.get('returnUrl');
    if (raw && raw.startsWith('/') && !raw.startsWith('//')) {
      return raw;
    }
    return '/';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage('Vui lòng nhập đầy đủ email và mật khẩu');
      return;
    }

    setIsLoading(true);
    try {
      const { user } = await login({ email: email.trim(), password });
      toast.success(
        user.role === 'admin'
          ? 'Đăng nhập quản trị viên thành công'
          : `Chào mừng bạn quay trở lại, ${user.name}!`
      );
      const returnUrl = getSafeReturnUrl();
      if (user.role === 'admin' && returnUrl === '/') {
        navigate('/admin/courses');
      } else {
        navigate(returnUrl);
      }
    } catch (err: any) {
      const msg = err?.message || 'Email hoặc mật khẩu không chính xác.';
      setErrorMessage(msg);
      setPassword('');
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
            <LogIn className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Đăng nhập vào hệ thống
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Chào mừng bạn đến với Cổng đào tạo & ghi danh PKS
          </p>
        </div>

        {errorMessage && (
          <div
            data-testid="alert-login-error"
            role="alert"
            aria-live="assertive"
            className="p-3.5 rounded-xl border border-red-500/30 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 text-xs flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="login-email"
            label="Email"
            type="email"
            autoFocus
            autoComplete="email"
            placeholder="nguyen.van.a@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            data-testid="input-login-email"
            required
          />

          <Input
            id="login-pass"
            label="Mật khẩu"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            data-testid="input-login-password"
            required
          />

          <Button
            type="submit"
            isLoading={isLoading}
            loadingText="Đang xử lý..."
            aria-label="Đăng nhập vào hệ thống"
            data-testid="btn-login-submit"
            className="w-full"
          >
            Đăng nhập
          </Button>
        </form>

        <div className="text-center pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Chưa có tài khoản?{' '}
            <Link
              to={`/register${searchParams.get('returnUrl') ? `?returnUrl=${encodeURIComponent(searchParams.get('returnUrl')!)}` : ''}`}
              aria-label="Chưa có tài khoản? Đăng ký ngay"
              data-testid="link-login-to-register"
              className="font-semibold text-zinc-900 dark:text-zinc-100 hover:underline"
            >
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
};
export default LoginPage;
