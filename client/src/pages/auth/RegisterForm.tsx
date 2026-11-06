import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface RegisterFormProps {
  isLoading: boolean;
  onSubmit: (data: { name: string; email: string; password: string }) => Promise<void>;
  externalError?: string | null;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  isLoading,
  onSubmit,
  externalError,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!name.trim() || name.trim().length < 2) {
      errs.name = 'Họ và tên phải có ít nhất 2 ký tự';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      errs.email = 'Định dạng email không hợp lệ';
    }
    if (!password || password.length < 6) {
      errs.password = 'Mật khẩu phải chứa ít nhất 6 ký tự';
    }
    if (password !== confirmPassword) {
      errs.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit({ name: name.trim(), email: email.trim().toLowerCase(), password });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        id="reg-name"
        label="Họ và tên"
        type="text"
        placeholder="Nguyễn Văn A"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={errors.name}
        disabled={isLoading}
        data-testid="input-register-name"
        required
      />

      <Input
        id="reg-email"
        label="Email"
        type="email"
        placeholder="nguyen.van.a@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email || externalError || undefined}
        disabled={isLoading}
        data-testid="input-register-email"
        required
      />

      <Input
        id="reg-pass"
        label="Mật khẩu"
        type="password"
        placeholder="Ít nhất 6 ký tự"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
        disabled={isLoading}
        data-testid="input-register-password"
        required
      />

      <Input
        id="reg-conf"
        label="Xác nhận mật khẩu"
        type="password"
        placeholder="Nhập lại mật khẩu"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        error={errors.confirmPassword}
        disabled={isLoading}
        data-testid="input-register-confirm-password"
        required
      />

      <Button
        type="submit"
        isLoading={isLoading}
        loadingText="Đang xử lý..."
        aria-label="Đăng ký tài khoản"
        data-testid="btn-register-submit"
        className="w-full"
      >
        Đăng ký
      </Button>
    </form>
  );
};
