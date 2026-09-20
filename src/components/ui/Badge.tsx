import React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'destructive' | 'info' | 'purple';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const base = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide whitespace-nowrap transition-colors';

  const variants = {
    default: 'bg-stone-900 text-white',
    secondary: 'bg-stone-100 text-stone-700 border border-stone-200',
    outline: 'border border-stone-300 text-stone-700',
    success: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
    warning: 'bg-amber-100 text-amber-800 border border-amber-200',
    destructive: 'bg-rose-100 text-rose-800 border border-rose-200',
    info: 'bg-sky-100 text-sky-800 border border-sky-200',
    purple: 'bg-purple-100 text-purple-800 border border-purple-200',
  };

  return <span className={cn(base, variants[variant], className)} {...props} />;
}
