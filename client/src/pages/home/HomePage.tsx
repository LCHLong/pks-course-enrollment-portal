import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, GraduationCap, ArrowRight, Shield, Award, Zap, Sparkles } from 'lucide-react';
import { useAuth } from '@/components/ui/AuthContext';
import { CourseCatalogPage } from '@/pages/courses';

export const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Hero Section */}
      <section
        aria-label="Giới thiệu PKS Portal"
        data-testid="hero-section"
        className="relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-gradient-to-b from-zinc-50/80 via-white to-zinc-50/40 dark:from-zinc-900/90 dark:via-zinc-900/50 dark:to-zinc-950 p-6 sm:p-10 lg:p-12 shadow-sm transition-colors"
      >
        <div className="relative z-10 max-w-3xl space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>Hệ Thống Đào Tạo Công Nghệ Chuẩn Thực Chiến & MOS Quốc Tế</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 leading-tight sm:leading-tight lg:leading-tight">
            Cổng Thông Tin Đào Tạo & Ghi Danh Khóa Học PKS
          </h1>

          {/* Subtitle / Description */}
          <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl">
            Nền tảng học tập và phát triển kỹ năng công nghệ thực chiến. Đào tạo Co-op gắn liền dự án doanh nghiệp, chuẩn hóa chứng chỉ MOS quốc tế, kết nối cơ hội việc làm và cam kết chất lượng đầu ra.
          </p>

          {/* Dual Action CTAs (Min height 44px for mobile standard) */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              to="/courses"
              data-testid="hero-cta-courses"
              className="h-11 min-h-[44px] px-6 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 font-semibold text-sm inline-flex items-center gap-2 shadow-sm transition-all hover:scale-[1.01]"
            >
              <BookOpen className="w-4 h-4 shrink-0" />
              <span>Khám phá tất cả khóa học</span>
            </Link>

            {isAuthenticated ? (
              <Link
                to="/my-courses"
                data-testid="hero-cta-my-courses"
                className="h-11 min-h-[44px] px-6 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 font-semibold text-sm inline-flex items-center gap-2 transition-all shadow-sm"
              >
                <GraduationCap className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Khóa học của tôi</span>
                <ArrowRight className="w-4 h-4 shrink-0 text-zinc-400" />
              </Link>
            ) : (
              <Link
                to="/register"
                data-testid="hero-cta-register"
                className="h-11 min-h-[44px] px-6 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 font-semibold text-sm inline-flex items-center gap-2 transition-all shadow-sm"
              >
                <span>Đăng ký tài khoản</span>
                <ArrowRight className="w-4 h-4 shrink-0 text-zinc-400" />
              </Link>
            )}
          </div>
        </div>

        {/* Feature Value-Proposition Chips */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 mt-8 border-t border-zinc-200/80 dark:border-zinc-800">
          <div className="flex items-start gap-3.5 p-4 rounded-xl bg-white/70 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-700 dark:text-emerald-400 shrink-0">
              <Shield className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">100% Thực Chiến & Co-op</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Học qua dự án thực tế doanh nghiệp với mentor công nghệ hướng dẫn trực tiếp.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-4 rounded-xl bg-white/70 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
            <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-700 dark:text-amber-400 shrink-0">
              <Award className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Chứng Chỉ Chuẩn MOS</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Đào tạo chuẩn hóa quốc tế, kiểm định kỹ năng và cấp chứng nhận giá trị cao.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5 p-4 rounded-xl bg-white/70 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
            <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-700 dark:text-blue-400 shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Ghi Danh Tức Thì</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Theo dõi sĩ số theo thời gian thực, cơ chế giữ chỗ an toàn và minh bạch tuyệt đối.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Course Catalog Preview */}
      <CourseCatalogPage />
    </div>
  );
};

export default HomePage;
