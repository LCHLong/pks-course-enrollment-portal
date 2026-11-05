import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface ProfileNameFormProps {
  email: string;
  initialName: string;
  onSubmit: (newName: string) => Promise<void>;
  isLoading: boolean;
}

export const ProfileNameForm: React.FC<ProfileNameFormProps> = ({
  email,
  initialName,
  onSubmit,
  isLoading,
}) => {
  const [name, setName] = useState(initialName);
  const [nameError, setNameError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameError(null);

    const trimmed = name.trim();
    if (!trimmed || trimmed.length < 2) {
      setNameError('Họ và tên phải có ít nhất 2 ký tự');
      return;
    }

    await onSubmit(trimmed);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        id="prof-email"
        label="Email tài khoản"
        type="email"
        value={email}
        disabled
        readOnly
        data-testid="input-profile-email"
        leftIcon={<Lock className="w-4 h-4" />}
        helperText="Địa chỉ email là định danh duy nhất và không thể thay đổi."
      />

      <Input
        id="prof-name"
        label="Họ và tên hiển thị"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={nameError || undefined}
        disabled={isLoading}
        data-testid="input-profile-name"
        required
      />

      <Button
        type="submit"
        isLoading={isLoading}
        loadingText="Đang lưu..."
        aria-label="Lưu thay đổi họ tên"
        data-testid="btn-update-name"
        className="w-full sm:w-auto"
      >
        Lưu thay đổi
      </Button>
    </form>
  );
};
