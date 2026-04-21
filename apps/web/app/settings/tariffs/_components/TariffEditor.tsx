'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Info,
  ArrowLeft,
  X,
} from 'lucide-react';
import type { TariffVersionSummary } from '@/src/tariffs/loader';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SLOT_WIDTH = 12;
const SLOT_GAP = 2;
const SLOT_HEIGHT = 22;
const SLOT_COUNT = 48;
const GRID_WIDTH = SLOT_COUNT * SLOT_WIDTH + (SLOT_COUNT - 1) * SLOT_GAP;
const DAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const TWO_HOUR_MARKERS = Array.from({ length: 13 }, (_, i) => i * 2);
const DAY_PILL_SIZE = 38;
const LABEL_COL_WIDTH = 220;

// Slot colours matching the overview TariffSchemeBlock
const ACTIVE_SLOT_FILL = '#3f4f67';
const ACTIVE_SLOT_BORDER = 'rgba(235,248,255,0.35)';
const INACTIVE_SLOT_FILL = '#27324a';
const INACTIVE_SLOT_BORDER = 'rgba(255,255,255,0.06)';

const COLOUR_PALETTE = [
  '#3b82f6',
  '#f59e0b',
  '#ef4444',
  '#10b981',
  '#8b5cf6',
  '#f97316',
  '#14b8a6',
  '#ec4899',
];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DOW_LABELS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type EditorPeriod = {
  id: string;
  periodLabel: string;
  ratePerKwh: string;
  isFreeImport: boolean;
  colourHex: string;
};

type EditorGroup = {
  id: string;
  days: number[];
  periods: EditorPeriod[];
  /** 48-element array: period ID for each half-hour slot, or '' if unassigned. */
  slots: string[];
};

export type TariffEditorInitialData = {
  versionId?: string;
  supplierName: string;
  planName: string;
  validFromLocalDate: string;
  validToLocalDate: string;
  periods: EditorPeriod[];
  /** 336-element flat schedule (7 days × 48 slots, Mon = 0). Used to derive groups. */
  schedule: string[];
  exportRate: string;
  /** VAT rate as a percentage string, e.g. "9" or "8.5". */
  vatRate: string;
  /** Standing charge per day. */
  standingChargeAmount: string;
};

type Props = {
  mode: 'create' | 'edit';
  initial: TariffEditorInitialData;
  existingVersions: TariffVersionSummary[];
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function slotToTime(slot: number): string {
  const h = Math.floor(slot / 2);
  const m = slot % 2 === 0 ? '00' : '30';
  return `${String(h).padStart(2, '0')}:${m}`;
}

function newId(): string {
  return Math.random().toString(36).slice(2, 9);
}

function nextColour(periods: EditorPeriod[]): string {
  const used = new Set(periods.map((p) => p.colourHex));
  return (
    COLOUR_PALETTE.find((c) => !used.has(c)) ??
    COLOUR_PALETTE[periods.length % COLOUR_PALETTE.length]
  );
}

function deriveGroups(periods: EditorPeriod[], schedule: string[]): EditorGroup[] {
  if (periods.length === 0 || schedule.length < 336 || schedule.every((s) => s === '')) return [];
  const periodMap = new Map(periods.map((p) => [p.id, p]));
  const dayPatterns = Array.from({ length: 7 }, (_, d) =>
    schedule.slice(d * SLOT_COUNT, d * SLOT_COUNT + SLOT_COUNT).join(','),
  );
  const seen = new Map<string, number>();
  const groups: EditorGroup[] = [];
  for (let d = 0; d < 7; d++) {
    const key = dayPatterns[d];
    if (seen.has(key)) {
      groups[seen.get(key)!].days.push(d);
    } else {
      const slots = schedule.slice(d * SLOT_COUNT, d * SLOT_COUNT + SLOT_COUNT);
      const usedIds = [...new Set(slots)].filter(Boolean);
      const groupPeriods = usedIds
        .map((id) => periodMap.get(id))
        .filter((p): p is EditorPeriod => !!p);
      seen.set(key, groups.length);
      groups.push({ id: newId(), days: [d], periods: groupPeriods, slots });
    }
  }
  return groups;
}

function addMonths(dateStr: string, months: number): string {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

function checkOverlap(
  from: string,
  to: string,
  versions: TariffVersionSummary[],
  excludeId?: string,
): TariffVersionSummary | null {
  if (!from) return null;
  const aEnd = to || '9999-12-31';
  for (const v of versions) {
    if (excludeId && v.id === excludeId) continue;
    const bEnd = v.validToLocalDate ?? '9999-12-31';
    if (from <= bEnd && aEnd >= v.validFromLocalDate) return v;
  }
  return null;
}

function dailyToAnnual(daily: string): string {
  const v = parseFloat(daily);
  if (isNaN(v)) return '';
  return (v * 365).toFixed(2);
}

function annualToDaily(annual: string): string {
  const v = parseFloat(annual);
  if (isNaN(v)) return '';
  return (v / 365).toFixed(4);
}

function buildCalCells(year: number, month: number) {
  const startDow = (new Date(year, month, 1).getDay() + 6) % 7; // Mon = 0
  const cells: { iso: string; day: number; inMonth: boolean }[] = [];
  for (let i = startDow - 1; i >= 0; i--) {
    const d = new Date(year, month, -i);
    cells.push({ iso: d.toISOString().slice(0, 10), day: d.getDate(), inMonth: false });
  }
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({
      iso: new Date(year, month, d).toISOString().slice(0, 10),
      day: d,
      inMonth: true,
    });
  }
  let next = 1;
  while (cells.length < 42) {
    cells.push({
      iso: new Date(year, month + 1, next++).toISOString().slice(0, 10),
      day: next - 1,
      inMonth: false,
    });
  }
  return cells;
}

function formatDisplayDate(iso: string): string {
  return new Intl.DateTimeFormat('en-IE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso + 'T00:00:00'));
}

// ---------------------------------------------------------------------------
// Shared styling
// ---------------------------------------------------------------------------

const INPUT_CLS =
  'w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:border-slate-500 focus:outline-none';
const LABEL_CLS =
  'block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 mb-1.5';
const ERR_CLS = 'mt-1 text-xs text-red-400';

// ---------------------------------------------------------------------------
// DateField — custom date picker matching the app's calendar style
// ---------------------------------------------------------------------------

function DateField({
  value,
  onChange,
  placeholder = 'Select date',
  error,
}: {
  value: string;
  onChange: (iso: string) => void;
  placeholder?: string;
  error?: boolean;
}) {
  const today = new Date().toISOString().slice(0, 10);
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
        onClick={() => setOpen((o) => !o)}
        className={[
          'flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-sm transition-colors bg-slate-900/60 hover:border-slate-600 focus:outline-none',
          error ? 'border-red-700' : open ? 'border-slate-500' : 'border-slate-700',
        ].join(' ')}
      >
        <span className={value ? 'text-slate-100' : 'text-slate-600'}>
          {value ? formatDisplayDate(value) : placeholder}
        </span>
        <Calendar size={13} className="shrink-0 text-slate-500" />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 w-64 rounded-2xl border border-slate-700 bg-[#0f1a2b] shadow-2xl">
          {/* Month navigator */}
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
            {/* Day of week headers */}
            <div className="mb-1 grid grid-cols-7 text-center">
              {DOW_LABELS.map((d) => (
                <span key={d} className="text-[10px] font-semibold text-slate-600">
                  {d}
                </span>
              ))}
            </div>
            {/* Calendar cells */}
            <div className="grid grid-cols-7">
              {cells.map((cell) => {
                const isSelected = cell.iso === value;
                const isToday = cell.iso === today;
                return (
                  <button
                    key={cell.iso}
                    type="button"
                    onClick={() => { onChange(cell.iso); setOpen(false); }}
                    className={[
                      'flex h-7 w-full items-center justify-center rounded-full text-[11px] transition-colors',
                      isSelected
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

// ---------------------------------------------------------------------------
// SectionCard
// ---------------------------------------------------------------------------

function SectionCard({
  title,
  children,
  collapsible,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50">
      <button
        type="button"
        onClick={() => collapsible && setOpen((o) => !o)}
        className={[
          'flex w-full items-center justify-between px-5 py-4',
          collapsible ? 'cursor-pointer' : 'cursor-default',
        ].join(' ')}
      >
        <span className="text-sm font-semibold text-slate-200">{title}</span>
        {collapsible &&
          (open ? (
            <ChevronUp size={14} className="text-slate-500" />
          ) : (
            <ChevronDown size={14} className="text-slate-500" />
          ))}
      </button>
      {(!collapsible || open) && (
        <div className="px-5 pb-5 border-t border-slate-800/60">
          <div className="pt-4">{children}</div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// PeriodInputs — name + rate fields rendered inline in a period row
// ---------------------------------------------------------------------------

function PeriodInputs({
  period,
  index,
  canDelete,
  onChange,
  onDelete,
}: {
  period: EditorPeriod;
  index: number;
  canDelete: boolean;
  onChange: (updated: EditorPeriod) => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center gap-2 min-w-0 flex-1">
      <input
        type="text"
        value={period.periodLabel}
        onChange={(e) => onChange({ ...period, periodLabel: e.target.value })}
        placeholder={`Period ${index + 1}`}
        className="min-w-0 w-24 rounded-lg border border-slate-700 bg-slate-950/60 px-2.5 py-1.5 text-sm text-slate-100 placeholder-slate-600 focus:border-slate-500 focus:outline-none"
      />
      <input
        type="number"
        step="0.000001"
        min="0"
        value={period.ratePerKwh}
        onChange={(e) => onChange({ ...period, ratePerKwh: e.target.value })}
        placeholder="€/kWh"
        className="w-20 rounded-lg border border-slate-700 bg-slate-950/60 px-2.5 py-1.5 text-sm text-slate-100 placeholder-slate-600 focus:border-slate-500 focus:outline-none tabular-nums"
      />
      {canDelete && (
        <button
          type="button"
          onClick={onDelete}
          className="shrink-0 rounded-lg p-1 text-slate-600 hover:text-red-400 hover:bg-red-950/30 transition-colors"
          title="Remove period"
        >
          <Trash2 size={11} />
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ActivityBar — one period's interactive 48-slot bar
// ---------------------------------------------------------------------------

function ActivityBar({
  groupSlots,
  periodId,
  onMouseDown,
  onMouseEnter,
}: {
  groupSlots: string[];
  periodId: string;
  onMouseDown: (slotIdx: number) => void;
  onMouseEnter: (slotIdx: number) => void;
}) {
  return (
    <div className="relative flex-1">
      <div
        className="grid select-none"
        style={{
          gridTemplateColumns: `repeat(${SLOT_COUNT}, ${SLOT_WIDTH}px)`,
          columnGap: `${SLOT_GAP}px`,
          width: GRID_WIDTH,
        }}
      >
        {groupSlots.map((pid, slotIdx) => {
          const isActive = pid === periodId;
          return (
            <div
              key={slotIdx}
              data-slot={slotIdx}
              style={{
                height: SLOT_HEIGHT,
                backgroundColor: isActive ? ACTIVE_SLOT_FILL : INACTIVE_SLOT_FILL,
                border: `1px solid ${isActive ? ACTIVE_SLOT_BORDER : INACTIVE_SLOT_BORDER}`,
                borderRadius: 1,
                boxSizing: 'border-box',
                cursor: 'crosshair',
              }}
              title={`${slotToTime(slotIdx)}–${slotToTime(slotIdx + 1)}`}
              onMouseDown={() => onMouseDown(slotIdx)}
              onMouseEnter={() => onMouseEnter(slotIdx)}
            />
          );
        })}
      </div>

      {/* 2-hour guide lines */}
      {TWO_HOUR_MARKERS.map((hour) => {
        const left =
          hour === 0
            ? -SLOT_GAP / 2
            : hour === 24
              ? GRID_WIDTH + SLOT_GAP / 2
              : hour * 2 * (SLOT_WIDTH + SLOT_GAP) - SLOT_GAP / 2;
        const strong = hour % 6 === 0;
        return (
          <div
            key={hour}
            className="pointer-events-none absolute inset-y-[-6px] w-px"
            style={{
              left,
              backgroundImage: `repeating-linear-gradient(to bottom,
                ${strong ? 'rgba(74,222,128,0.9)' : 'rgba(74,222,128,0.45)'} 0 5px,
                transparent 5px 9px)`,
            }}
          />
        );
      })}
    </div>
  );
}

function TimeAxis() {
  return (
    <div className="relative h-5" style={{ width: GRID_WIDTH }}>
      {TWO_HOUR_MARKERS.map((hour) => {
        const left = Math.max(0, Math.min(GRID_WIDTH, hour * 2 * (SLOT_WIDTH + SLOT_GAP)));
        const strong = hour % 6 === 0 || hour === 24;
        const pos =
          hour === 0 ? 'translate-x-0' : hour === 24 ? '-translate-x-full' : '-translate-x-1/2';
        return (
          <div
            key={hour}
            className={`absolute top-0 text-[10px] tabular-nums pointer-events-none ${pos}`}
            style={{ left }}
          >
            <span className={strong ? 'font-semibold text-slate-300' : 'text-slate-500'}>
              {hour}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ScheduleGroupCard
// ---------------------------------------------------------------------------

type GroupCardProps = {
  group: EditorGroup;
  allGroups: EditorGroup[];
  canDelete: boolean;
  submitted: boolean;
  onUpdate: (updated: EditorGroup) => void;
  onDelete: () => void;
  onClaimDay: (dayIdx: number) => void;
  onPaintSlot: (slotIdx: number, value: string) => void;
};

function ScheduleGroupCard({
  group,
  allGroups,
  canDelete,
  submitted,
  onUpdate,
  onDelete,
  onClaimDay,
  onPaintSlot,
}: GroupCardProps) {
  const isPaintingRef = useRef(false);
  const paintValueRef = useRef<string>('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stop = () => { isPaintingRef.current = false; };
    window.addEventListener('mouseup', stop);
    return () => window.removeEventListener('mouseup', stop);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onTouchMove = (e: TouchEvent) => {
      if (!isPaintingRef.current) return;
      e.preventDefault();
      const touch = e.touches[0];
      const target = document.elementFromPoint(touch.clientX, touch.clientY) as HTMLElement;
      const slotStr = target?.dataset?.slot;
      if (slotStr !== undefined) onPaintSlot(parseInt(slotStr, 10), paintValueRef.current);
    };
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    return () => el.removeEventListener('touchmove', onTouchMove);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSlotMouseDown(periodId: string, slotIdx: number) {
    isPaintingRef.current = true;
    paintValueRef.current = group.slots[slotIdx] === periodId ? '' : periodId;
    onPaintSlot(slotIdx, paintValueRef.current);
  }

  function handleSlotMouseEnter(slotIdx: number) {
    if (isPaintingRef.current) onPaintSlot(slotIdx, paintValueRef.current);
  }

  function toggleDay(dayIdx: number) {
    if (group.days.includes(dayIdx)) {
      onUpdate({ ...group, days: group.days.filter((d) => d !== dayIdx) });
    } else {
      onClaimDay(dayIdx);
    }
  }

  function addPeriod() {
    const period: EditorPeriod = {
      id: newId(),
      periodLabel: '',
      ratePerKwh: '',
      isFreeImport: false,
      colourHex: nextColour(group.periods),
    };
    onUpdate({ ...group, periods: [...group.periods, period] });
  }

  function updatePeriod(idx: number, updated: EditorPeriod) {
    onUpdate({ ...group, periods: group.periods.map((p, i) => (i === idx ? updated : p)) });
  }

  function removePeriod(idx: number) {
    const removed = group.periods[idx];
    onUpdate({
      ...group,
      periods: group.periods.filter((_, i) => i !== idx),
      slots: group.slots.map((pid) => (pid === removed.id ? '' : pid)),
    });
  }

  const daySet = new Set(group.days);
  const otherDays = new Set(allGroups.filter((g) => g.id !== group.id).flatMap((g) => g.days));
  const unassigned = group.slots.filter((s) => s === '').length;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-4">
      {/* Day pills + delete */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <p className={LABEL_CLS + ' mb-2'}>Days</p>
          <div className="flex gap-1.5">
            {DAY_LETTERS.map((letter, i) => {
              const active = daySet.has(i);
              const taken = !active && otherDays.has(i);
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => !taken && toggleDay(i)}
                  disabled={taken}
                  title={taken ? `${DAY_LABELS[i]} is in another group` : DAY_LABELS[i]}
                  style={{
                    width: DAY_PILL_SIZE,
                    height: DAY_PILL_SIZE,
                    borderRadius: '50%',
                    fontSize: 12,
                    fontWeight: 600,
                    userSelect: 'none',
                    boxSizing: 'border-box',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: active ? '#475569' : taken ? '#18202e' : '#1e293b',
                    color: active ? '#f1f5f9' : taken ? '#2d3a4e' : '#64748b',
                    border: `1.5px solid ${active ? '#64748b' : taken ? '#232d3e' : '#2d3a4e'}`,
                    cursor: taken ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.1s, color 0.1s',
                  }}
                >
                  {letter}
                </button>
              );
            })}
          </div>
        </div>
        {canDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="mt-1 shrink-0 rounded-lg p-1.5 text-slate-600 hover:text-red-400 hover:bg-red-950/30 transition-colors"
            title="Remove group"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {group.periods.length === 0 && (
        <p className="text-xs text-slate-600 mb-3">
          Add a price period, then click or drag on its bar to assign time slots.
        </p>
      )}

      {/* Bars region */}
      {group.periods.length > 0 && (
        <div className="overflow-x-auto -mx-4 px-4" ref={containerRef}>
          <div style={{ minWidth: GRID_WIDTH + LABEL_COL_WIDTH + 12 }}>
            <div className="flex flex-col gap-3">
              {group.periods.map((period, pIdx) => (
                <div key={period.id}>
                  <div className="mb-1.5 md:hidden">
                    <PeriodInputs
                      period={period}
                      index={pIdx}
                      canDelete={group.periods.length > 1}
                      onChange={(u) => updatePeriod(pIdx, u)}
                      onDelete={() => removePeriod(pIdx)}
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="hidden md:flex shrink-0" style={{ width: LABEL_COL_WIDTH }}>
                      <PeriodInputs
                        period={period}
                        index={pIdx}
                        canDelete={group.periods.length > 1}
                        onChange={(u) => updatePeriod(pIdx, u)}
                        onDelete={() => removePeriod(pIdx)}
                      />
                    </div>
                    <ActivityBar
                      groupSlots={group.slots}
                      periodId={period.id}
                      onMouseDown={(s) => handleSlotMouseDown(period.id, s)}
                      onMouseEnter={handleSlotMouseEnter}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-start gap-3 mt-2">
              <div className="hidden md:block shrink-0" style={{ width: LABEL_COL_WIDTH }} />
              <TimeAxis />
            </div>
          </div>
        </div>
      )}

      {/* Unassigned warning — only shown after a save attempt */}
      {submitted && unassigned > 0 && group.periods.length > 0 && (
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-700/30 bg-amber-950/20 px-3 py-2.5">
          <AlertTriangle size={12} className="mt-0.5 shrink-0 text-amber-400" />
          <p className="text-xs text-amber-300">
            {unassigned} slot{unassigned !== 1 ? 's' : ''} unassigned — click or drag on a
            period&apos;s bar to assign.
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={addPeriod}
        disabled={group.periods.length >= COLOUR_PALETTE.length}
        className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-slate-500 hover:text-slate-100 transition-colors disabled:opacity-40"
      >
        <Plus size={11} />
        Add price period
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main editor
// ---------------------------------------------------------------------------

export default function TariffEditor({ mode, initial, existingVersions }: Props) {
  // ---- Identity ----
  const [supplierName, setSupplierName] = useState(initial.supplierName);
  const [planName, setPlanName] = useState(initial.planName);
  const [validFrom, setValidFrom] = useState(initial.validFromLocalDate);
  const [validTo, setValidTo] = useState(initial.validToLocalDate);

  // ---- Charges ----
  const [exportRate, setExportRate] = useState(initial.exportRate);
  const [vatRate, setVatRate] = useState(initial.vatRate);
  const [standingChargeDaily, setStandingChargeDaily] = useState(initial.standingChargeAmount);
  const [standingChargeAnnual, setStandingChargeAnnual] = useState(
    () => dailyToAnnual(initial.standingChargeAmount),
  );

  // ---- Schedule groups ----
  const [groups, setGroups] = useState<EditorGroup[]>(() =>
    deriveGroups(initial.periods, initial.schedule),
  );

  // ---- UI ----
  const [submitted, setSubmitted] = useState(false);
  const [saveState, setSaveState] = useState<'idle' | 'success'>('idle');

  // ---- Standing charge dual-entry ----
  function handleDailyChange(val: string) {
    setStandingChargeDaily(val);
    setStandingChargeAnnual(dailyToAnnual(val));
  }
  function handleAnnualChange(val: string) {
    setStandingChargeAnnual(val);
    setStandingChargeDaily(annualToDaily(val));
  }

  // ---- Valid-to default in create mode ----
  function handleValidFromChange(val: string) {
    setValidFrom(val);
    if (mode === 'create' && !validTo && val) setValidTo(addMonths(val, 12));
  }

  // ---- Group management ----
  function updateGroup(groupId: string, updated: EditorGroup) {
    setGroups((prev) => prev.map((g) => (g.id === groupId ? updated : g)));
  }
  function removeGroup(groupId: string) {
    setGroups((prev) => prev.filter((g) => g.id !== groupId));
  }
  function addGroup() {
    setGroups((prev) => [
      ...prev,
      { id: newId(), days: [], periods: [], slots: new Array(SLOT_COUNT).fill('') },
    ]);
  }
  function claimDayForGroup(groupId: string, dayIdx: number) {
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id === groupId) return { ...g, days: [...g.days, dayIdx] };
        return { ...g, days: g.days.filter((d) => d !== dayIdx) };
      }),
    );
  }
  function paintGroupSlot(groupId: string, slotIdx: number, value: string) {
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        if (g.slots[slotIdx] === value) return g;
        const slots = [...g.slots];
        slots[slotIdx] = value;
        return { ...g, slots };
      }),
    );
  }

  // ---- Derived ----
  const overlapWarning = checkOverlap(validFrom, validTo, existingVersions, initial.versionId);
  const coveredDays = new Set(groups.flatMap((g) => g.days));
  const uncoveredDays = Array.from({ length: 7 }, (_, i) => i).filter((d) => !coveredDays.has(d));

  // ---- Validation ----
  function validate(): Record<string, string> {
    const e: Record<string, string> = {};
    if (!supplierName.trim()) e.supplierName = 'Supplier name is required';
    if (!validFrom) e.validFrom = 'Start date is required';
    if (!validTo) e.validTo = 'End date is required';
    if (validFrom && validTo && validTo < validFrom) e.validTo = 'End date must be after start date';
    if (exportRate === '') e.exportRate = 'Export rate is required (enter 0 if none)';
    if (vatRate === '') e.vatRate = 'VAT rate is required (enter 0 if none)';
    if (standingChargeDaily === '') e.standingChargeDaily = 'Standing charge is required (enter 0 if none)';
    if (groups.length === 0) e.groups = 'At least one schedule group is required';
    if (uncoveredDays.length > 0)
      e.coverage = `${uncoveredDays.map((d) => DAY_LABELS[d]).join(', ')} not assigned to any group`;
    groups.forEach((g, gi) => {
      if (g.days.length === 0) e[`g${gi}_days`] = `Group ${gi + 1}: select at least one day`;
      if (g.periods.length === 0) e[`g${gi}_periods`] = `Group ${gi + 1}: add at least one price period`;
      g.periods.forEach((p, pi) => {
        if (!p.periodLabel.trim()) e[`g${gi}p${pi}_label`] = `Group ${gi + 1}, period ${pi + 1}: name required`;
        if (!p.ratePerKwh) e[`g${gi}p${pi}_rate`] = `Group ${gi + 1}, period ${pi + 1}: rate required`;
      });
      const unassigned = g.slots.filter((s) => s === '').length;
      if (unassigned > 0) e[`g${gi}_slots`] = `Group ${gi + 1}: ${unassigned} slot${unassigned !== 1 ? 's' : ''} unassigned`;
    });
    return e;
  }

  const errors = submitted ? validate() : {};
  const errorCount = Object.keys(errors).length;

  function handleSave() {
    setSubmitted(true);
    if (Object.keys(validate()).length > 0) return;
    setSaveState('success');
  }

  // ---- Success screen ----
  if (saveState === 'success') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4">
        <div className="rounded-full bg-emerald-900/40 border border-emerald-800/30 p-5 mb-6">
          <CheckCircle2 size={36} className="text-emerald-400" />
        </div>
        <h2 className="text-xl font-semibold text-slate-100 mb-2">
          {mode === 'create' ? 'Tariff version added' : 'Tariff version updated'}
        </h2>
        <p className="text-sm text-slate-400 leading-relaxed max-w-sm mb-2">
          Historical cost and savings calculations from{' '}
          <span className="text-slate-200">{validFrom}</span>
          {validTo ? (
            <> to <span className="text-slate-200">{validTo}</span></>
          ) : (
            ' onwards'
          )}{' '}
          will be recalculated. This may take a few moments.
        </p>
        <p className="text-xs text-slate-600 mb-8">
          This is a prototype — no data was actually saved.
        </p>
        <Link
          href="/settings/tariffs"
          className="inline-flex items-center gap-2 rounded-full bg-emerald-700/80 border border-emerald-600/40 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
        >
          Back to Tariffs
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/settings/tariffs"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft size={13} />
          Tariffs
        </Link>
        <span className="text-slate-700">/</span>
        <span className="text-sm font-semibold text-slate-100">
          {mode === 'create' ? 'New tariff version' : 'Edit tariff version'}
        </span>
      </div>

      {/* 1. Tariff identity */}
      <SectionCard title="Tariff identity">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={LABEL_CLS}>Supplier</label>
            <input
              type="text"
              value={supplierName}
              onChange={(e) => setSupplierName(e.target.value)}
              placeholder="e.g. Energia"
              className={[INPUT_CLS, errors.supplierName ? 'border-red-700' : ''].join(' ')}
              readOnly={mode === 'edit'}
            />
            {errors.supplierName && <p className={ERR_CLS}>{errors.supplierName}</p>}
          </div>
          <div>
            <label className={LABEL_CLS}>Plan name</label>
            <input
              type="text"
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              placeholder="e.g. Smart Meter 24h"
              className={INPUT_CLS}
              readOnly={mode === 'edit'}
            />
          </div>
        </div>

        {mode === 'edit' && (
          <p className="mt-3 text-xs text-slate-600">
            Supplier and plan name apply to all versions and cannot be changed here.
          </p>
        )}

        {/* Dates — two columns on all screen sizes */}
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <label className={LABEL_CLS}>Start date</label>
            <DateField
              value={validFrom}
              onChange={handleValidFromChange}
              placeholder="Pick a date"
              error={!!errors.validFrom}
            />
            {errors.validFrom && <p className={ERR_CLS}>{errors.validFrom}</p>}
          </div>
          <div>
            <label className={LABEL_CLS}>End date</label>
            <DateField
              value={validTo}
              onChange={setValidTo}
              placeholder="Pick a date"
              error={!!errors.validTo}
            />
            {errors.validTo && <p className={ERR_CLS}>{errors.validTo}</p>}
          </div>
        </div>

        {overlapWarning && (
          <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-amber-700/30 bg-amber-950/20 px-3.5 py-3">
            <AlertTriangle size={13} className="mt-0.5 shrink-0 text-amber-400" />
            <p className="text-xs text-amber-300">
              This date range overlaps with{' '}
              <span className="font-medium">{overlapWarning.versionLabel}</span> (
              {overlapWarning.validFromLocalDate}
              {overlapWarning.validToLocalDate
                ? ` – ${overlapWarning.validToLocalDate}`
                : ' onwards'}
              ). Adjust the dates or update the other version first.
            </p>
          </div>
        )}
      </SectionCard>

      {/* 2. Charges */}
      <SectionCard title="Charges">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={LABEL_CLS}>Export rate (€/kWh, VAT-inclusive)</label>
            <input
              type="number"
              step="0.000001"
              min="0"
              value={exportRate}
              onChange={(e) => setExportRate(e.target.value)}
              placeholder="0.1850"
              className={[INPUT_CLS, errors.exportRate ? 'border-red-700' : ''].join(' ')}
            />
            {errors.exportRate ? (
              <p className={ERR_CLS}>{errors.exportRate}</p>
            ) : (
              <p className="mt-1 text-xs text-slate-600">Enter 0 if you don&apos;t export.</p>
            )}
          </div>
          <div>
            <label className={LABEL_CLS}>VAT rate %</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={vatRate}
              onChange={(e) => setVatRate(e.target.value)}
              placeholder="e.g. 9 or 8.5"
              className={[INPUT_CLS, errors.vatRate ? 'border-red-700' : ''].join(' ')}
            />
            {errors.vatRate ? (
              <p className={ERR_CLS}>{errors.vatRate}</p>
            ) : (
              <p className="mt-1 text-xs text-slate-600">
                Applies to imports and standing charge. Enter 0 if no VAT.
              </p>
            )}
          </div>

          {/* Standing charge — dual entry, both columns */}
          <div className="sm:col-span-2">
            <label className={LABEL_CLS}>Standing charge (VAT-exclusive)</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Annual (€/year)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={standingChargeAnnual}
                  onChange={(e) => handleAnnualChange(e.target.value)}
                  placeholder="200.75"
                  className={[INPUT_CLS, errors.standingChargeDaily ? 'border-red-700' : ''].join(' ')}
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Daily (€/day)</label>
                <input
                  type="number"
                  step="0.0001"
                  min="0"
                  value={standingChargeDaily}
                  onChange={(e) => handleDailyChange(e.target.value)}
                  placeholder="0.5500"
                  className={[INPUT_CLS, errors.standingChargeDaily ? 'border-red-700' : ''].join(' ')}
                />
              </div>
            </div>
            {errors.standingChargeDaily ? (
              <p className={ERR_CLS}>{errors.standingChargeDaily}</p>
            ) : (
              <p className="mt-1.5 text-xs text-slate-600">
                Enter either field — the other is calculated automatically. Enter 0 if no standing
                charge.
              </p>
            )}
          </div>
        </div>
      </SectionCard>

      {/* 3. Rate schedule */}
      <SectionCard title="Rate schedule">
        <div className="flex flex-col gap-4">
          {submitted && errors.coverage && (
            <div className="flex items-start gap-2.5 rounded-xl border border-red-800/40 bg-red-950/20 px-3.5 py-3">
              <AlertTriangle size={13} className="mt-0.5 shrink-0 text-red-400" />
              <p className="text-xs text-red-300">{errors.coverage}</p>
            </div>
          )}
          {submitted && errors.groups && <p className={ERR_CLS}>{errors.groups}</p>}

          {groups.length === 0 && (
            <p className="text-sm text-slate-500 leading-relaxed">
              Add a schedule group to define which days share the same rate pattern. For example:
              Mon–Fri in one group, Sat–Sun in another.
            </p>
          )}

          {groups.map((group, gi) => {
            const groupErrors = Object.entries(errors)
              .filter(([k]) => k.startsWith(`g${gi}`))
              .map(([, v]) => v);
            return (
              <div key={group.id}>
                <ScheduleGroupCard
                  group={group}
                  allGroups={groups}
                  canDelete={groups.length > 1}
                  submitted={submitted}
                  onUpdate={(updated) => updateGroup(group.id, updated)}
                  onDelete={() => removeGroup(group.id)}
                  onClaimDay={(dayIdx) => claimDayForGroup(group.id, dayIdx)}
                  onPaintSlot={(slotIdx, value) => paintGroupSlot(group.id, slotIdx, value)}
                />
                {submitted && groupErrors.length > 0 && (
                  <div className="mt-2 flex flex-col gap-0.5 px-1">
                    {groupErrors.map((msg, i) => (
                      <p key={i} className={ERR_CLS}>{msg}</p>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          <button
            type="button"
            onClick={addGroup}
            className="self-start inline-flex items-center gap-1.5 rounded-full border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-slate-500 hover:text-slate-100 transition-colors"
          >
            <Plus size={11} />
            Add tariff schedule
          </button>

          <div className="flex items-start gap-2 rounded-xl border border-slate-800/60 bg-slate-900/30 px-3.5 py-3">
            <Info size={12} className="mt-0.5 shrink-0 text-slate-600" />
            <p className="text-xs text-slate-500 leading-relaxed">
              Each group covers a set of days sharing the same rate pattern. Click or drag on a
              period&apos;s bar to assign half-hour slots. All 48 slots in every group must be
              assigned before saving.
            </p>
          </div>
        </div>
      </SectionCard>

      {/* Recalculation note */}
      <div className="flex items-start gap-2.5 rounded-2xl border border-slate-800/60 bg-slate-900/30 px-4 py-3.5">
        <Info size={13} className="mt-0.5 shrink-0 text-slate-500" />
        <p className="text-xs text-slate-500 leading-relaxed">
          {mode === 'create'
            ? 'Saving this version will calculate cost and savings figures for all days within its date range.'
            : "Saving changes will recalculate all cost and savings figures within this version's date range. This may take a few moments."}
        </p>
      </div>

      {/* Save / Cancel */}
      <div className="flex items-center justify-between gap-4 pt-2 pb-8">
        <Link
          href="/settings/tariffs"
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:border-slate-500 hover:text-slate-100 transition-colors"
        >
          Cancel
        </Link>
        <div className="flex items-center gap-3">
          {submitted && errorCount > 0 && (
            <p className="text-xs text-red-400">
              {errorCount} issue{errorCount !== 1 ? 's' : ''} to fix before saving
            </p>
          )}
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/40 bg-indigo-600/80 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-600 transition-colors"
          >
            {mode === 'create' ? 'Add version' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
