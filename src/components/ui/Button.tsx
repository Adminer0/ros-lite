import React from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'secondary' | 'destructive' | 'subtle';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    const base = 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer';

    const variants = {
      default: 'bg-emerald-800 text-white hover:bg-emerald-900 shadow-sm',
      outline: 'border border-stone-300 bg-white text-stone-800 hover:bg-stone-50 shadow-xs',
      ghost: 'text-stone-700 hover:bg-stone-100 hover:text-stone-900',
      secondary: 'bg-stone-100 text-stone-800 hover:bg-stone-200',
      destructive: 'bg-rose-700 text-white hover:bg-rose-800 shadow-sm',
      subtle: 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100',
    };

    const sizes = {
      sm: 'h-8 px-3 text-xs gap-1.5',
      md: 'h-9 px-4 text-sm gap-2',
      lg: 'h-11 px-6 text-base gap-2.5',
      icon: 'h-9 w-9 p-0',
    };

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
