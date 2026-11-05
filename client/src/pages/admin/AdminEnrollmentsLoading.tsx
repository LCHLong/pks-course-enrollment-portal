import React from 'react';

export const AdminEnrollmentsLoading: React.FC = () => {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Đang tải danh sách học viên ghi danh"
      data-testid="state-loading-enrollments"
      className="border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900 overflow-hidden shadow-sm p-4 space-y-4"
    >
      <div data-testid="loading-skeleton" className="space-y-3">
        {[1, 2, 3, 4, 5].map((row) => (
          <div key={row} className="flex items-center gap-4 py-3 border-b border-zinc-100 dark:border-zinc-800 last:border-0 animate-pulse">
            <div className="space-y-1.5 flex-1">
              <div className="h-4 w-36 bg-zinc-200 dark:bg-zinc-800 rounded" />
              <div className="h-3 w-48 bg-zinc-200 dark:bg-zinc-800 rounded" />
            </div>
            <div className="h-5 w-40 bg-zinc-200 dark:bg-zinc-800 rounded hidden sm:block" />
            <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-800 rounded" />
            <div className="h-5 w-20 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
            <div className="h-9 w-28 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
          </div>
        ))}
      </div>
      <span className="sr-only">Đang tải danh sách ghi danh...</span>
    </div>
  );
};
