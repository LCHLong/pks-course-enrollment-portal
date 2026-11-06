import React, { useState } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Sun, Moon, Menu, BookOpen, User as UserIcon, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/components/ui/AuthContext';
import { MobileNavSheet } from './MobileNavSheet';

export interface HeaderProps {
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
  user?: { name: string; email: string; role: string } | null;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isDarkMode = false,
  onToggleTheme,
  user: userProp,
  onLogout: onLogoutProp,
}) => {
  const { user: authUser, logout, isLoading } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Allow prop overrides for testing / storybook while defaulting to live context
  const currentUser = userProp !== undefined ? userProp : authUser;

  const handleLogout = async () => {
    try {
      if (onLogoutProp) {
        onLogoutProp();
      } else {
        await logout();
      }
    } catch {
      // Ignored: cleanup happens in AuthContext
    } finally {
      toast.success('Đã đăng xuất tài khoản thành công.');
      setMobileMenuOpen(false);
      navigate('/');
    }
  };

  const location = useLocation();
  const isHomeActive = location.pathname === '/';
  const isCoursesActive = location.pathname.startsWith('/courses');

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold'
        : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800/50'
    }`;

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur border-b border-zinc-200 dark:border-zinc-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand Logo & Navigation Clustered */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2.5 group" aria-label="Trang chủ PKS Portal">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-900 font-bold shadow-sm transition-transform group-hover:scale-105">
              <BookOpen className="w-4 h-4" />
            </div>
            <span className="font-bold text-base sm:text-lg text-zinc-900 dark:text-zinc-100 tracking-tight">
              PKS Portal
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5" aria-label="Điều hướng chính">
            <Link
              to="/"
              data-testid="nav-link-home"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isHomeActive
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800/50'
              }`}
            >
              Trang chủ
            </Link>

            <Link
              to="/courses"
              data-testid="nav-link-courses"
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isCoursesActive
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800/50'
              }`}
            >
              Khóa học
            </Link>

            {currentUser && (
              <NavLink to="/my-courses" className={navLinkClass}>
                Khóa học của tôi
              </NavLink>
            )}

            {currentUser?.role === 'admin' && (
              <>
                <NavLink to="/admin/courses" className={navLinkClass}>
                  Quản lý khóa học
                </NavLink>
                <NavLink to="/admin/enrollments" className={navLinkClass}>
                  Quản lý ghi danh
                </NavLink>
              </>
            )}
          </nav>
        </div>

        {/* Right: Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          {/* Theme Toggle Button */}
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              aria-label="Toggle Theme"
              type="button"
              className="w-9 h-9 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400 transition-colors"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          )}

          {/* Auth State Handling */}
          {isLoading ? (
            <div
              className="h-9 w-28 bg-zinc-200 dark:bg-zinc-800 rounded-md animate-pulse"
              aria-label="Đang tải phiên đăng nhập"
            />
          ) : currentUser ? (
            <div className="flex items-center gap-3">
              {/* User Identity & Profile Link */}
              <Link
                to="/profile"
                data-testid="link-header-profile"
                aria-label="Xem trang cá nhân"
                className="flex items-center gap-2 px-2.5 py-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-zinc-700 dark:text-zinc-200 text-xs font-semibold">
                  <UserIcon className="w-3.5 h-3.5" />
                </div>
                <span
                  data-testid="badge-user-name"
                  aria-label={`Tài khoản đang đăng nhập: ${currentUser.name}`}
                  className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 max-w-[140px] truncate"
                >
                  {currentUser.name}
                </span>
                <span
                  data-testid="badge-user-role"
                  aria-label={`Vai trò: ${currentUser.role}`}
                  className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                    currentUser.role === 'admin'
                      ? 'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                      : 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                  }`}
                >
                  {currentUser.role === 'admin' ? 'Quản trị viên' : 'Học viên'}
                </span>
              </Link>

              {/* Logout Button */}
              <button
                type="button"
                onClick={handleLogout}
                data-testid="btn-header-logout"
                aria-label="Đăng xuất khỏi tài khoản"
                className="text-xs px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium inline-flex items-center gap-1.5 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Đăng xuất</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                data-testid="btn-header-login"
                aria-label="Đăng nhập"
                className="text-xs px-3.5 py-2 rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-medium transition-colors"
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                data-testid="btn-header-register"
                aria-label="Đăng ký"
                className="text-xs px-3.5 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 font-medium shadow-sm transition-colors"
              >
                Đăng ký
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex items-center gap-2 md:hidden">
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              aria-label="Toggle Theme"
              type="button"
              className="w-11 h-11 min-h-[44px] min-w-[44px] rounded-lg border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          )}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Mở menu điều hướng"
            className="w-11 h-11 min-h-[44px] min-w-[44px] rounded-lg border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile Sheet Drawer */}
      <MobileNavSheet
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        currentUser={currentUser}
        onLogout={handleLogout}
        isDarkMode={isDarkMode}
        onToggleTheme={onToggleTheme}
      />
    </header>
  );
};

export default Header;
