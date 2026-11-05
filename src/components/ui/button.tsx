import { cn } from '@/lib/utils';
import type { ButtonHTMLAttributes } from 'react';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'warning';
  size?: 'sm' | 'md' | 'lg';
};

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  type = 'button',
  ...props
}: Props) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-50',
        size === 'sm' && 'h-9 px-3 text-xs',
        size === 'md' && 'h-10 px-4 text-sm',
        size === 'lg' && 'h-12 px-5 text-sm',
        variant === 'primary' &&
          'bg-forest-600 text-white shadow-sm hover:bg-forest-700',
        variant === 'secondary' &&
          'border border-forest-200 bg-forest-50 text-forest-800 hover:bg-forest-100',
        variant === 'ghost' && 'text-slate-600 hover:bg-slate-100',
        variant === 'danger' && 'bg-clay text-white hover:bg-clay-700',
        variant === 'warning' && 'bg-safety-100 text-safety-700 hover:bg-safety-500 hover:text-white',
        className,
      )}
      {...props}
    />
  );
}
