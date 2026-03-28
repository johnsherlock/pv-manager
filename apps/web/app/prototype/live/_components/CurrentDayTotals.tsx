import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface CurrentDayTotalsProps {
  totals: {
    generated: number;
    consumed: number;
    imported: number;
    exported: number;
  };
}

const rows: { key: keyof CurrentDayTotalsProps['totals']; label: string; colorClass: string }[] = [
  { key: 'generated', label: 'Generated', colorClass: 'text-brand-primary' },
  { key: 'consumed', label: 'Consumed', colorClass: 'text-neutral' },
  { key: 'imported', label: 'Imported', colorClass: 'text-on-surface-muted' },
  { key: 'exported', label: 'Exported', colorClass: 'text-positive' },
];

export function CurrentDayTotals({ totals }: CurrentDayTotalsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Today so far</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2.5">
          {rows.map(({ key, label, colorClass }) => (
            <div key={key} className="flex items-baseline justify-between">
              <span className="text-sm text-on-surface-muted">{label}</span>
              <span className={`tabular-nums font-semibold ${colorClass}`}>
                {totals[key].toFixed(1)} kWh
              </span>
            </div>
          ))}
        </div>
        <Link
          href="#"
          className="mt-4 block text-sm font-medium text-brand-primary hover:underline"
        >
          View full day →
        </Link>
      </CardContent>
    </Card>
  );
}
