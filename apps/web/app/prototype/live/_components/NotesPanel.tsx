import { Info } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface NotesPanelProps {
  efficiencyPercent?: number;
  notes?: string[];
}

export function NotesPanel({ efficiencyPercent, notes }: NotesPanelProps) {
  const hasContent = efficiencyPercent !== undefined || (notes && notes.length > 0);

  if (!hasContent) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2.5">
          {efficiencyPercent !== undefined && (
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-on-surface-muted">Efficiency</span>
              <span className="font-semibold text-on-surface tabular-nums">
                {efficiencyPercent}% of capacity
              </span>
            </div>
          )}
          {notes?.map((note, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-on-surface-muted">
              <Info size={14} className="mt-0.5 shrink-0 text-on-surface-muted/60" />
              <span>{note}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
