import Link from 'next/link';
import { cn } from '@/lib/utils';

type PrototypeState = 'healthy' | 'stale' | 'warning';

const states: { value: PrototypeState; label: string }[] = [
  { value: 'healthy', label: 'Healthy' },
  { value: 'stale', label: 'Stale' },
  { value: 'warning', label: 'Disconnected' },
];

export function StateSelector({ currentState }: { currentState: PrototypeState }) {
  return (
    <div className="sticky top-0 z-50 flex items-center gap-4 border-b border-white/10 bg-neutral px-4 py-2 text-xs text-white">
      <span className="font-semibold uppercase tracking-widest opacity-60">Prototype</span>
      <span className="opacity-30">·</span>
      <span className="opacity-60">State:</span>
      <div className="flex gap-1">
        {states.map(({ value, label }) => (
          <Link
            key={value}
            href={`?state=${value}`}
            className={cn(
              'rounded px-2.5 py-1 font-medium transition-colors',
              currentState === value
                ? 'bg-white/20 text-white'
                : 'text-white/60 hover:bg-white/10 hover:text-white',
            )}
          >
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}
