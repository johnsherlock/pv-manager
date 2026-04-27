'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Loader2, AlertCircle, CheckCircle2, Trash2 } from 'lucide-react';
import { saveLocation, clearLocation } from './actions';

type Props = {
  current: {
    rawInput: string | null;
    displayName: string | null;
    precisionMode: string | null;
  } | null;
};

function FieldLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="block text-xs font-medium text-slate-300 mb-1.5">
      {children}
    </label>
  );
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={[
        'w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2.5 text-sm text-slate-100 placeholder-slate-600',
        'focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500',
        'transition-colors',
        props.className ?? '',
      ].join(' ')}
    />
  );
}

export function LocationForm({ current }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isClearing, startClearTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [rawInput, setRawInput] = useState(current?.rawInput ?? '');
  const [precisionMode, setPrecisionMode] = useState<'exact' | 'approximate'>(
    (current?.precisionMode as 'exact' | 'approximate') ?? 'approximate',
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await saveLocation({ rawInput, precisionMode });
      if (!result.ok) {
        setError(result.error);
      } else {
        router.refresh();
      }
    });
  }

  function handleClear() {
    setError(null);
    startClearTransition(async () => {
      const result = await clearLocation();
      if (!result.ok) {
        setError(result.error);
      } else {
        setRawInput('');
        setPrecisionMode('approximate');
        router.refresh();
      }
    });
  }

  const isSubmitting = isPending || isClearing;

  return (
    <div className="max-w-md">
      {current?.displayName && (
        <div className="mb-6 rounded-[16px] border border-emerald-800/30 bg-[#0d1f18] p-4">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-emerald-400" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-emerald-400">Location saved</p>
              <p className="mt-0.5 text-sm text-slate-200 break-words">{current.displayName}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <FieldLabel htmlFor="rawInput">
            Town, postcode, or Eircode
          </FieldLabel>
          <TextInput
            id="rawInput"
            type="text"
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            placeholder="e.g. Cork, D02 XY45, or Galway"
            autoComplete="off"
            disabled={isSubmitting}
          />
          <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
            Used to fetch weather and solar context. Never shared or used to identify your street address.
          </p>
        </div>

        <div>
          <p className="text-xs font-medium text-slate-300 mb-2">Location precision</p>
          <div className="flex flex-col gap-2">
            {(
              [
                { value: 'approximate', label: 'Approximate', description: 'Show only town or area name — preserves privacy' },
                { value: 'exact', label: 'Exact', description: 'Show full address — improves solar context' },
              ] as const
            ).map(({ value, label, description }) => (
              <label
                key={value}
                className={[
                  'flex items-start gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-colors',
                  precisionMode === value
                    ? 'border-indigo-500/50 bg-indigo-600/10'
                    : 'border-slate-700 bg-slate-900/40 hover:border-slate-600',
                ].join(' ')}
              >
                <input
                  type="radio"
                  name="precisionMode"
                  value={value}
                  checked={precisionMode === value}
                  onChange={() => setPrecisionMode(value)}
                  disabled={isSubmitting}
                  className="mt-0.5 accent-indigo-500"
                />
                <div>
                  <p className="text-sm font-medium text-slate-200">{label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-red-800/40 bg-red-950/30 px-4 py-3">
            <AlertCircle size={14} className="mt-0.5 shrink-0 text-red-400" />
            <p className="text-xs text-red-300">{error}</p>
          </div>
        )}

        <div className="flex items-center gap-3 pt-1">
          <button
            type="submit"
            disabled={isSubmitting || !rawInput.trim()}
            className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/50 bg-indigo-600/80 px-4 py-2 text-xs font-medium text-white hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isPending ? <Loader2 size={12} className="animate-spin" /> : <MapPin size={12} />}
            {current?.displayName ? 'Update location' : 'Save location'}
          </button>

          {current?.displayName && (
            <button
              type="button"
              onClick={handleClear}
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 px-4 py-2 text-xs font-medium text-slate-400 hover:border-red-800/60 hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isClearing ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
              Remove location
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
