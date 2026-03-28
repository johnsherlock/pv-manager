import { Clock, CheckCircle, AlertTriangle, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TrustState } from '../mock-data';

interface TrustBadgeProps {
  trustState: TrustState;
  freshnessLabel: string;
}

const config: Record<TrustState, { icon: React.ElementType; className: string }> = {
  fresh: {
    icon: CheckCircle,
    className: 'text-brand-primary',
  },
  stale: {
    icon: Clock,
    className: 'text-warning',
  },
  warning: {
    icon: AlertTriangle,
    className: 'text-warning',
  },
  disconnected: {
    icon: WifiOff,
    className: 'text-destructive',
  },
};

export function TrustBadge({ trustState, freshnessLabel }: TrustBadgeProps) {
  const { icon: Icon, className } = config[trustState];
  return (
    <span className={cn('flex items-center gap-1.5 text-sm', className)}>
      <Icon size={14} />
      <span>{freshnessLabel}</span>
    </span>
  );
}
