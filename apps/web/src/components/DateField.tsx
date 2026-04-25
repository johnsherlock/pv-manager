'use client';

import { useState, useEffect, useRef } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DOW_LABELS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toLocalIso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function buildCalCells(year: number, month: number) {
  const startDow = (new Date(year, month, 1).getDay() + 6) % 7;
  const cells: { iso: string; day: number; inMonth: boolean }[] = [];

  for (let i = startDow - 1; i >= 0; i--) {
    const d = new Date(year, month, -i);
    cells.push({ iso: toLocalIso(d), day: d.getDate(), inMonth: false });
  }
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ iso: toLocalIso(new Date(year, month, d)), day: d, inMonth: true });
  }
  const remaining = (7 - (cells.length % 7)) % 7;
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(year, month + 1, i);
    cells.push({ iso: toLocalIso(d), day: d.getDate(), inMonth: false });
  }
  return cells;
}

export function formatDisplayDate(iso: string): string {
  return new Intl.DateTimeFormat('en-IE', {
    day: 'numeric', month: 'short', year: 'numeric',
  }).format(new Date(iso + 'T00:00:00'));
}

export { toLocalIso };

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function DateField({
  value,
  onChange,
  placeholder = 'Select date',
  error,
  disabled,
  minDate,
}: {
  value: string;
  onChange: (iso: string) => void;
  placeholder?: string;
  error?: boolean;
  disabled?: boolean;
  minDate?: string;
}) {
  const today = toLocalIso(new Date());
  const seed = value || today;
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(() => parseInt(seed.slice(0, 4)));
  const [viewMonth, setViewMonth] = useState(() => parseInt(seed.slice(5, 7)) - 1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  useEffect(() => {
    if (value) {
      setViewYear(parseInt(value.slice(0, 4)));
      setViewMonth(parseInt(value.slice(5, 7)) - 1);
    }
  }, [value]);

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  }

  const cells = buildCalCells(viewYear, viewMonth);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        className={[
          'flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-sm transition-colors bg-slate-900/60 focus:outline-none',
          disabled
            ? 'border-slate-800 cursor-not-allowed opacity-40'
            : error
              ? 'border-red-700 hover:border-red-600'
              : open
                ? 'border-slate-500'
                : 'border-slate-700 hover:border-slate-600',
        ].join(' ')}
      >
        <span className={value ? 'text-slate-100' : 'text-slate-600'}>
          {value ? formatDisplayDate(value) : placeholder}
        </span>
        <Calendar size={13} className="shrink-0 text-slate-500" />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-64 rounded-2xl border border-slate-700 bg-[#0f1a2b] shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 px-3 py-2.5">
            <button
              type="button"
              onClick={prevMonth}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            >
              <ChevronLeft size={13} />
            </button>
            <span className="text-xs font-semibold text-slate-200">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            >
              <ChevronRight size={13} />
            </button>
          </div>

          <div className="px-3 py-3">
            <div className="mb-1 grid grid-cols-7 text-center">
              {DOW_LABELS.map((d) => (
                <span key={d} className="text-[10px] font-semibold text-slate-600">{d}</span>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {cells.map((cell) => {
                const isSelected = cell.iso === value;
                const isToday = cell.iso === today;
                const isDisabled = !!(minDate && cell.iso < minDate);
                return (
                  <button
                    key={cell.iso}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => { if (!isDisabled) { onChange(cell.iso); setOpen(false); } }}
                    className={[
                      'flex h-7 w-full items-center justify-center rounded-full text-[11px] transition-colors',
                      isDisabled
                        ? 'text-slate-700 cursor-not-allowed'
                        : isSelected
                          ? 'bg-emerald-600 font-semibold text-white'
                          : isToday
                            ? 'font-medium text-emerald-400 ring-1 ring-emerald-600/60 hover:bg-slate-800'
                            : cell.inMonth
                              ? 'text-slate-300 hover:bg-slate-800'
                              : 'text-slate-600 hover:bg-slate-800',
                    ].join(' ')}
                  >
                    {cell.day}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
