import React from 'react';

export type BadgeVariant = 'emerald' | 'amber' | 'crimson' | 'neutral';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  children,
  className = '',
  ...props
}) => {
  const variantStyles = {
    emerald:
      'border border-emerald-700/50 dark:border-emerald-500/40 text-[#065F46] dark:text-[#34D399] bg-[#ECFDF5] dark:bg-[#064E3B33]',
    amber:
      'border border-amber-600/40 dark:border-amber-500/30 text-[#92400E] dark:text-[#FBBF24] bg-[#FFFBEB] dark:bg-[#78350F33]',
    crimson:
      'border border-red-700/40 dark:border-red-500/30 text-[#991B1B] dark:text-[#F87171] bg-[#FEF2F2] dark:bg-[#7F1D1D33]',
    neutral:
      'border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold shrink-0 transition-colors ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
