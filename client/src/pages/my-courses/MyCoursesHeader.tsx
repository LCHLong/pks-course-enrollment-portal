import React from 'react';

interface MyCoursesHeaderProps {
  totalCount: number;
}

export const MyCoursesHeader: React.FC<MyCoursesHeaderProps> = ({ totalCount }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Khóa Học Của Tôi
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Theo dõi các khóa học bạn đã đăng ký và trạng thái ghi danh học tập tại PKS.
        </p>
      </div>
      {totalCount > 0 && (
        <div className="shrink-0">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            Tổng cộng: <span className="font-mono text-zinc-900 dark:text-zinc-100">{totalCount}</span> khóa học
          </span>
        </div>
      )}
    </div>
  );
};
