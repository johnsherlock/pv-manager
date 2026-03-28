import { Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  label: string;
  value: number;
  unit: string;
  supportText: string;
  stale?: boolean;
  colorClass?: string;
}

function formatValue(value: number, unit: string): string {
  if (unit === 'W') {
    if (value >= 1000) return `${(value / 1000).toFixed(1)} kW`;
    return `${value} W`;
  }
  return `${value} ${unit}`;
}

export function MetricCard({ label, value, unit, supportText, stale, colorClass }: MetricCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-1.5">
          <span
            className={cn(
              'text-3xl font-bold tabular-nums',
              stale ? 'text-on-surface-muted' : (colorClass ?? 'text-on-surface'),
            )}
          >
            {formatValue(value, unit)}
          </span>
          {stale && <Clock size={14} className="text-warning" />}
        </div>
        <p className="mt-1 text-xs text-on-surface-muted">{supportText}</p>
      </CardContent>
    </Card>
  );
}
