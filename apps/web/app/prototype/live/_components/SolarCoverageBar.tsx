import { cn } from '@/lib/utils';

interface SolarCoverageBarProps {
  coveragePercent: number;
  stale?: boolean;
}

export function SolarCoverageBar({ coveragePercent, stale }: SolarCoverageBarProps) {
  const clamped = Math.min(100, Math.max(0, coveragePercent));

  return (
    <div className={cn('rounded-2xl border bg-surface-raised p-4', stale ? 'border-warning/30' : 'border-border')}>
      <div className="mb-2 flex items-center justify-between text-xs text-on-surface-muted">
        <span>Solar</span>
        <span>Grid</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-neutral/20">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            stale ? 'bg-on-surface-muted' : 'bg-brand-primary',
          )}
          style={{ width: `${clamped}%` }}
        />
      </div>
      <p className={cn('mt-2 text-sm', stale ? 'text-on-surface-muted' : 'text-on-surface')}>
        {stale ? (
          <span className="text-warning">Coverage data delayed</span>
        ) : clamped === 100 ? (
          <>
            <span className="font-semibold text-brand-primary">100%</span> of your home is running on solar right now
          </>
        ) : (
          <>
            <span className="font-semibold text-brand-primary">{clamped}%</span> of your home is running on solar right now
          </>
        )}
      </p>
    </div>
  );
}
