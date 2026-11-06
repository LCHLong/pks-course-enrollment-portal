import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Shield, Award, Users } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 transition-colors mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-900 font-bold">
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="font-bold text-lg text-zinc-900 dark:text-zinc-100 tracking-tight">
                PKS Portal
              </span>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-md leading-relaxed">
              Cổng thông tin đào tạo & ghi danh khóa học công nghệ thực chiến, đào tạo nguồn nhân lực số chất lượng cao chuẩn quốc tế.
            </p>
            <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400 pt-1">
              <span className="inline-flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Bảo mật dữ liệu
              </span>
              <span className="inline-flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                Chứng nhận uy tín
              </span>
              <span className="inline-flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                Cộng đồng năng động
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
              Điều hướng
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/"
                  className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
                >
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link
                  to="/courses"
                  className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
                >
                  Danh mục khóa học
                </Link>
              </li>
              <li>
                <Link
                  to="/my-courses"
                  className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
                >
                  Khóa học của tôi
                </Link>
              </li>
              <li>
                <Link
                  to="/profile"
                  className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
                >
                  Hồ sơ cá nhân
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact / Portal Info */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
              Cổng Đào Tạo PKS
            </h3>
            <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <li>TP. Hồ Chí Minh, Việt Nam</li>
              <li>Hotline: 1900 xxxx</li>
              <li>Email: contact@pks.edu.vn</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 dark:text-zinc-400">
          <p>© 2026 PKS Education & Technology. Tất cả quyền được bảo lưu.</p>
          <p className="text-zinc-400 dark:text-zinc-500">
            Hệ thống quản lý khóa học và ghi danh trực tuyến
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
