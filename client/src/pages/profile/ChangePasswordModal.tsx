import React, { useState } from 'react';
import { toast } from 'sonner';
import { Lock, KeyRound } from 'lucide-react';
import { api } from '@/components/ui/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

interface ChangePasswordFormProps {
  onSuccess?: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordFormProps> = ({ onSuccess }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!currentPassword) {
      errs.currentPassword = 'Mật khẩu hiện tại không được để trống';
    }
    if (!newPassword || newPassword.length < 6) {
      errs.newPassword = 'Mật khẩu mới phải có ít nhất 6 ký tự';
    } else if (newPassword === currentPassword) {
      errs.newPassword = 'Mật khẩu mới không được trùng với mật khẩu hiện tại';
    }
    if (newPassword !== confirmNewPassword) {
      errs.confirmNewPassword = 'Mật khẩu xác nhận không khớp';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      await api.post('/user/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
      });
      toast.success('Đổi mật khẩu thành công!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setErrors({});
      onSuccess?.();
    } catch (err: any) {
      const msg = err?.message || 'Không thể đổi mật khẩu. Vui lòng thử lại.';
      if (err?.code === 'INVALID_CURRENT_PASSWORD' || msg.includes('hiện tại')) {
        setErrors((prev) => ({
          ...prev,
          currentPassword: 'Mật khẩu hiện tại không chính xác',
        }));
      }
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card
      aria-label="Đổi mật khẩu bảo mật"
      data-testid="card-change-password"
      className="p-6 space-y-5"
    >
      <div className="flex items-center gap-2.5 pb-2 border-b border-zinc-100 dark:border-zinc-800">
        <KeyRound className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
          Đổi mật khẩu bảo mật
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="cur-pass"
          label="Mật khẩu hiện tại"
          type="password"
          placeholder="••••••••"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          error={errors.currentPassword}
          disabled={isLoading}
          data-testid="input-current-password"
          leftIcon={<Lock className="w-4 h-4" />}
          required
        />

        <Input
          id="new-pass"
          label="Mật khẩu mới"
          type="password"
          placeholder="Ít nhất 6 ký tự"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          error={errors.newPassword}
          disabled={isLoading}
          data-testid="input-new-password"
          leftIcon={<Lock className="w-4 h-4" />}
          required
        />

        <Input
          id="conf-pass"
          label="Xác nhận mật khẩu mới"
          type="password"
          placeholder="Nhập lại mật khẩu mới"
          value={confirmNewPassword}
          onChange={(e) => setConfirmNewPassword(e.target.value)}
          error={errors.confirmNewPassword}
          disabled={isLoading}
          data-testid="input-confirm-new-password"
          leftIcon={<Lock className="w-4 h-4" />}
          required
        />

        <Button
          type="submit"
          isLoading={isLoading}
          loadingText="Đang xử lý..."
          aria-label="Xác nhận đổi mật khẩu"
          data-testid="btn-change-password"
          className="w-full sm:w-auto"
        >
          Đổi mật khẩu
        </Button>
      </form>
    </Card>
  );
};
export default ChangePasswordModal;
