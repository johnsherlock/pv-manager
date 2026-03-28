import * as React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'fresh' | 'stale' | 'warning' | 'disconnected' | 'default';
}

const variantClasses: Record<NonNullable<BadgeProps['variant']>, string> = {
  fresh: 'bg-brand-primary/10 text-brand-primary border-brand-primary/20',
  stale: 'bg-warning-bg text-warning border-warning/20',
  warning: 'bg-warning-bg text-warning border-warning/20',
  disconnected: 'bg-red-50 text-destructive border-red-200',
  default: 'bg-surface-inset text-on-surface-muted border-border',
};

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}
