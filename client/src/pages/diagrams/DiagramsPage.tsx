import React from 'react';
import { ExternalLink, Layers } from 'lucide-react';

export const DiagramsPage: React.FC = () => {
  return (
    <div className="w-full flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Top Banner Toolbar */}
      <div className="bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-4 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              Sơ Đồ Kiến Trúc & Báo Cáo Nghiệp Vụ
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                100% KCS Đạt Chuẩn
              </span>
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 hidden sm:block">
              Trực quan hóa toàn bộ yêu cầu đề bài, ERD, xử lý Race Condition và phân quyền RBAC
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/diagrams.html"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 flex items-center gap-1.5 transition shadow-sm"
          >
            <span>Mở Trang Toàn Màn Hình</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Embedded Interactive Viewer */}
      <div className="flex-1 w-full bg-zinc-950 min-h-[85vh]">
        <iframe
          src="/diagrams.html"
          title="PKS Architecture Diagrams & Specs"
          className="w-full h-full min-h-[85vh] border-0"
        />
      </div>
    </div>
  );
};
