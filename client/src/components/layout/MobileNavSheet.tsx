import React, { useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Sun, Moon, X, BookOpen, User as UserIcon, LogOut, ShieldAlert, GraduationCap, Home } from 'lucide-react';

export interface MobileNavSheetProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: { name: string; email: string; role: string } | null;
  onLogout?: () => void;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
}

export const MobileNavSheet: React.FC<MobileNavSheetProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogout,
  isDarkMode = false,
  onToggleTheme,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const location = useLocation();
  const isHomeActive = location.pathname === '/';
  const isCoursesActive = location.pathname.startsWith('/courses');

  if (!isOpen) return null;

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `h-11 min-h-[44px] flex items-center px-3.5 rounded-xl text-sm font-medium transition-colors ${
      isActive
        ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold'
        : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
    }`;

  return (
    <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label="Menu điều hướng">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="fixed top-0 right-0 h-full w-4/5 max-w-sm bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl z-50 p-6 flex flex-col justify-between text-zinc-900 dark:text-zinc-100 animate-in slide-in-from-right duration-200">
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
            <Link to="/" onClick={onClose} className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-900 font-bold">
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="font-bold text-base text-zinc-900 dark:text-zinc-100">PKS Portal</span>
            </Link>
            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng menu điều hướng"
              className="w-11 h-11 min-h-[44px] min-w-[44px] rounded-lg border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="space-y-1.5" aria-label="Điều hướng di động">
            <Link
              to="/"
              onClick={onClose}
              data-testid="mobile-link-home"
              className={`h-11 min-h-[44px] flex items-center px-3.5 rounded-xl text-sm font-medium transition-colors ${
                isHomeActive
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold'
                  : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
              }`}
            >
              <Home className="w-4 h-4 mr-3 text-zinc-500" /> Trang chủ
            </Link>

            <Link
              to="/courses"
              onClick={onClose}
              data-testid="mobile-link-courses"
              className={`h-11 min-h-[44px] flex items-center px-3.5 rounded-xl text-sm font-medium transition-colors ${
                isCoursesActive
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold'
                  : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
              }`}
            >
              <BookOpen className="w-4 h-4 mr-3 text-zinc-500" /> Danh mục khóa học
            </Link>
            {currentUser && (
              <NavLink to="/my-courses" onClick={onClose} className={navClass}>
                <GraduationCap className="w-4 h-4 mr-3 text-zinc-500" /> Khóa học của tôi
              </NavLink>
            )}
            {currentUser?.role === 'admin' && (
              <>
                <NavLink to="/admin/courses" onClick={onClose} className={navClass}>
                  <ShieldAlert className="w-4 h-4 mr-3 text-zinc-500" /> Quản lý khóa học (Admin)
                </NavLink>
                <NavLink to="/admin/enrollments" onClick={onClose} className={navClass}>
                  <ShieldAlert className="w-4 h-4 mr-3 text-zinc-500" /> Quản lý ghi danh (Admin)
                </NavLink>
              </>
            )}
            {currentUser && (
              <NavLink to="/profile" onClick={onClose} className={navClass}>
                <UserIcon className="w-4 h-4 mr-3 text-zinc-500" /> Hồ sơ cá nhân ({currentUser.name})
              </NavLink>
            )}
            {onToggleTheme && (
              <button
                type="button"
                onClick={onToggleTheme}
                aria-label="Chuyển chế độ giao diện"
                className="h-11 min-h-[44px] w-full flex items-center px-3.5 rounded-xl text-sm font-medium border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
              >
                {isDarkMode ? <Sun className="w-4 h-4 mr-3 text-amber-500" /> : <Moon className="w-4 h-4 mr-3 text-zinc-500" />}
                <span>{isDarkMode ? 'Giao diện sáng' : 'Giao diện tối'}</span>
              </button>
            )}
          </nav>
        </div>

        <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
          {currentUser ? (
            <button
              type="button"
              onClick={onLogout}
              data-testid="btn-mobile-logout"
              aria-label="Đăng xuất khỏi tài khoản trên di động"
              className="w-full h-11 min-h-[44px] rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-sm font-semibold text-zinc-800 dark:text-zinc-200 flex items-center justify-center gap-2 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Đăng xuất ({currentUser.name})</span>
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/login"
                onClick={onClose}
                className="h-11 min-h-[44px] rounded-xl border border-zinc-200 dark:border-zinc-800 text-sm font-medium flex items-center justify-center text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                onClick={onClose}
                className="h-11 min-h-[44px] rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-medium flex items-center justify-center hover:bg-zinc-800 dark:hover:bg-zinc-200 shadow-sm transition-colors"
              >
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileNavSheet;
