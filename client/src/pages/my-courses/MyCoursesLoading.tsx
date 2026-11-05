import React from 'react';

export const MyCoursesLoading: React.FC = () => {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Đang tải danh sách khóa học"
      data-testid="state-loading-my-courses"
      className="space-y-6"
    >
      <div data-testid="loading-skeleton" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 bg-white dark:bg-zinc-900 shadow-sm animate-pulse space-y-4"
          >
            <div className="flex justify-between items-center">
              <div className="h-5 w-24 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
              <div className="h-5 w-20 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
            </div>
            <div className="space-y-2">
              <div className="h-6 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
              <div className="h-4 w-1/2 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
            </div>
            <div className="h-4 w-1/3 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex justify-between items-center">
              <div className="h-6 w-24 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
              <div className="h-11 w-28 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
      <span className="sr-only">Đang tải danh sách khóa học...</span>
    </div>
  );
};
