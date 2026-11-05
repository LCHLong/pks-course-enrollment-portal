import React from 'react';
import { User as UserIcon, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/utils/formatDate';

interface ProfileHeaderProps {
  user: {
    name: string;
    email: string;
    role: string;
    created_at: string;
    registration_date?: string;
  };
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user }) => {
  const isStudent = user.role === 'student';

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold flex items-center justify-center text-lg shrink-0">
          {user.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-6 h-6" />}
        </div>
        <div>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{user.name}</h2>
          <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            <Calendar className="w-3.5 h-3.5" />
            <span>Ngày tham gia: </span>
            <span
              data-testid="text-user-created-at"
              aria-label="Ngày tham gia hệ thống"
              className="font-mono font-medium text-zinc-700 dark:text-zinc-300"
            >
              {user.registration_date || formatDate(user.created_at)}
            </span>
          </div>
        </div>
      </div>

      <div>
        <Badge
          variant={isStudent ? 'emerald' : 'amber'}
          role="status"
          data-testid="badge-profile-role"
          aria-label={`Vai trò người dùng: ${user.role}`}
        >
          {isStudent ? 'Học viên' : 'Quản trị viên'}
        </Badge>
      </div>
    </div>
  );
};
