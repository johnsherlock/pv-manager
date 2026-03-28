import * as React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary disabled:pointer-events-none disabled:opacity-50',
          variant === 'default' && 'bg-brand-primary text-white hover:bg-brand-primary/90',
          variant === 'outline' &&
            'border border-border bg-transparent text-on-surface hover:bg-surface-inset',
          variant === 'ghost' && 'text-on-surface hover:bg-surface-inset',
          size === 'sm' && 'h-8 px-3 text-sm',
          size === 'md' && 'h-10 px-4 text-sm',
          className,
        )}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';
