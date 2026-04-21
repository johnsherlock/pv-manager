'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertTriangle,
  Info,
  ArrowLeft,
  Eraser,
} from 'lucide-react';
import type { TariffVersionSummary } from '@/src/tariffs/loader';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SLOT_WIDTH = 12;
const SLOT_GAP = 2;
const SLOT_HEIGHT = 22;
const SLOT_COUNT = 48;
const DAY_COUNT = 7;
const GRID_WIDTH = SLOT_COUNT * SLOT_WIDTH + (SLOT_COUNT - 1) * SLOT_GAP;
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const TWO_HOUR_MARKERS = Array.from({ length: 13 }, (_, i) => i * 2);
const DAY_LABEL_WIDTH = 36;

const COLOUR_PALETTE = [
  '#3b82f6', // blue
  '#f59e0b', // amber
  '#ef4444', // red
  '#10b981', // emerald
  '#8b5cf6', // purple
  '#f97316', // orange
  '#14b8a6', // teal
  '#ec4899', // pink
];

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

export type TariffEditorInitialData = {
  versionId?: string;
  versionLabel: string;
  supplierName: string;
  planName: string;
  validFromLocalDate: string;
  validToLocalDate: string;
  periods: EditorPeriod[];
  /** 336-element array (7 days × 48 half-hours, Mon=0). Each element is a
   *  period id, or '' for unassigned. */
  schedule: string[];
  exportRate: string;
  vatRate: string;
  hasStandingCharge: boolean;
  standingChargeAmount: string;
  standingChargeUnit: string;
  standingChargeVatInclusive: boolean;
  contractEndDate: string;
  showRateReviewField: boolean;
  rateReviewDate: string;
  contractNotes: string;
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

function checkOverlap(
  from: string,
  to: string,
  versions: TariffVersionSummary[],
  excludeId?: string,
): TariffVersionSummary | null {
  if (!from) return null;
  const aStart = from;
  const aEnd = to || '9999-12-31';
  for (const v of versions) {
    if (excludeId && v.id === excludeId) continue;
    const bStart = v.validFromLocalDate;
    const bEnd = v.validToLocalDate ?? '9999-12-31';
    if (aStart <= bEnd && aEnd >= bStart) return v;
  }
  return null;
}

function usedColours(periods: EditorPeriod[]): Set<string> {
  return new Set(periods.map((p) => p.colourHex));
}

function nextAvailableColour(periods: EditorPeriod[]): string {
  const used = usedColours(periods);
  return COLOUR_PALETTE.find((c) => !used.has(c)) ?? COLOUR_PALETTE[periods.length % COLOUR_PALETTE.length];
}

// ---------------------------------------------------------------------------
// Input styling shared constants
// ---------------------------------------------------------------------------

const INPUT_CLASS =
  'w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:border-slate-500 focus:outline-none';
const LABEL_CLASS = 'block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 mb-1.5';
const FIELD_ERROR_CLASS = 'mt-1 text-xs text-red-400';

// ---------------------------------------------------------------------------
// Section card wrapper
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
        {collapsible && (
          open
            ? <ChevronUp size={14} className="text-slate-500" />
            : <ChevronDown size={14} className="text-slate-500" />
        )}
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
// Period row
// ---------------------------------------------------------------------------

function PeriodRow({
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
    <div className="rounded-xl border border-slate-800 bg-slate-950/50 px-4 py-3.5">
      <div className="flex items-start gap-3">
        {/* Colour picker */}
        <div className="shrink-0 pt-0.5">
          <p className={LABEL_CLASS}>Colour</p>
          <div className="flex gap-1.5 flex-wrap" style={{ maxWidth: 120 }}>
            {COLOUR_PALETTE.map((hex) => (
              <button
                key={hex}
                type="button"
                onClick={() => onChange({ ...period, colourHex: hex })}
                className="h-5 w-5 rounded-sm transition-transform hover:scale-110"
                style={{
                  backgroundColor: hex,
                  outline: period.colourHex === hex ? '2px solid #f1f5f9' : '2px solid transparent',
                  outlineOffset: 1,
                }}
                title={hex}
              />
            ))}
          </div>
        </div>

        {/* Label + rate */}
        <div className="flex-1 grid grid-cols-2 gap-3 min-w-0">
          <div>
            <label className={LABEL_CLASS}>Period name</label>
            <input
              type="text"
              value={period.periodLabel}
              onChange={(e) => onChange({ ...period, periodLabel: e.target.value })}
              placeholder={`Period ${index + 1}`}
              className={INPUT_CLASS}
            />
          </div>
          <div>
            <label className={LABEL_CLASS}>Rate (€/kWh)</label>
            <input
              type="number"
              step="0.000001"
              min="0"
              value={period.ratePerKwh}
              onChange={(e) => onChange({ ...period, ratePerKwh: e.target.value })}
              placeholder="0.2450"
              className={INPUT_CLASS}
              disabled={period.isFreeImport}
            />
          </div>
        </div>

        {/* Delete */}
        {canDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="mt-6 shrink-0 rounded-lg p-1.5 text-slate-600 hover:text-red-400 hover:bg-red-950/30 transition-colors"
            title="Remove period"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>

      {/* Free import toggle */}
      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          role="checkbox"
          aria-checked={period.isFreeImport}
          onClick={() => onChange({ ...period, isFreeImport: !period.isFreeImport, ratePerKwh: period.isFreeImport ? period.ratePerKwh : '0' })}
          className={[
            'h-4 w-4 rounded border flex items-center justify-center transition-colors',
            period.isFreeImport
              ? 'border-emerald-500 bg-emerald-500/20'
              : 'border-slate-600 bg-slate-800',
          ].join(' ')}
        >
          {period.isFreeImport && <CheckCircle2 size={10} className="text-emerald-400" />}
        </button>
        <label
          onClick={() => onChange({ ...period, isFreeImport: !period.isFreeImport, ratePerKwh: period.isFreeImport ? period.ratePerKwh : '0' })}
          className="text-xs text-slate-400 cursor-pointer select-none"
        >
          Free import (rate is €0.00)
        </label>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Schedule grid
// ---------------------------------------------------------------------------

type ScheduleGridProps = {
  schedule: string[];
  periods: EditorPeriod[];
  selectedPeriodId: string | null;
  onSlotMouseDown: (idx: number) => void;
  onSlotMouseEnter: (idx: number) => void;
  gridRef: React.RefObject<HTMLDivElement | null>;
};

function ScheduleGrid({
  schedule,
  periods,
  selectedPeriodId,
  onSlotMouseDown,
  onSlotMouseEnter,
  gridRef,
}: ScheduleGridProps) {
  const periodMap = new Map(periods.map((p) => [p.id, p]));

  return (
    <div className="overflow-x-auto -mx-5 px-5" ref={gridRef}>
      <div style={{ minWidth: GRID_WIDTH + DAY_LABEL_WIDTH + 12 }}>
        {DAY_LABELS.map((dayLabel, dayIdx) => (
          <div key={dayIdx} className="flex items-center gap-3 mb-1">
            <div
              className="shrink-0 text-right text-xs font-medium text-slate-500 select-none"
              style={{ width: DAY_LABEL_WIDTH }}
            >
              {dayLabel}
            </div>
            <div
              className="grid select-none"
              style={{
                gridTemplateColumns: `repeat(${SLOT_COUNT}, ${SLOT_WIDTH}px)`,
                columnGap: `${SLOT_GAP}px`,
                width: GRID_WIDTH,
              }}
            >
              {Array.from({ length: SLOT_COUNT }, (_, slotIdx) => {
                const absIdx = dayIdx * SLOT_COUNT + slotIdx;
                const pid = schedule[absIdx] ?? '';
                const period = pid ? periodMap.get(pid) : undefined;
                return (
                  <div
                    key={slotIdx}
                    data-slot={absIdx}
                    style={{
                      height: SLOT_HEIGHT,
                      backgroundColor: period?.colourHex ?? '#1a2233',
                      border: `1px solid ${
                        period
                          ? 'rgba(0,0,0,0.25)'
                          : 'rgba(255,255,255,0.05)'
                      }`,
                      borderRadius: 1,
                      boxSizing: 'border-box',
                      cursor: 'crosshair',
                    }}
                    title={`${dayLabel} ${slotToTime(slotIdx)}–${slotToTime(slotIdx + 1)}`}
                    onMouseDown={() => onSlotMouseDown(absIdx)}
                    onMouseEnter={() => onSlotMouseEnter(absIdx)}
                  />
                );
              })}
            </div>
          </div>
        ))}

        {/* Time axis */}
        <div className="flex items-start gap-3 mt-1">
          <div className="shrink-0" style={{ width: DAY_LABEL_WIDTH }} />
          <div className="relative h-5" style={{ width: GRID_WIDTH }}>
            {TWO_HOUR_MARKERS.map((hour) => {
              const left = Math.max(0, Math.min(GRID_WIDTH, hour * 2 * (SLOT_WIDTH + SLOT_GAP)));
              const isStrong = hour % 6 === 0 || hour === 24;
              const posClass =
                hour === 0 ? 'translate-x-0' : hour === 24 ? '-translate-x-full' : '-translate-x-1/2';
              return (
                <div
                  key={hour}
                  className={`absolute top-0 text-[10px] tabular-nums pointer-events-none ${posClass}`}
                  style={{ left }}
                >
                  <span className={isStrong ? 'font-semibold text-slate-300' : 'text-slate-500'}>
                    {hour}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function TariffEditor({ mode, initial, existingVersions }: Props) {
  // ---- form state ----
  const [versionLabel, setVersionLabel] = useState(initial.versionLabel);
  const [supplierName, setSupplierName] = useState(initial.supplierName);
  const [planName, setPlanName] = useState(initial.planName);
  const [validFrom, setValidFrom] = useState(initial.validFromLocalDate);
  const [validTo, setValidTo] = useState(initial.validToLocalDate);
  const [periods, setPeriods] = useState<EditorPeriod[]>(
    initial.periods.length > 0
      ? initial.periods
      : [{ id: newId(), periodLabel: '', ratePerKwh: '', isFreeImport: false, colourHex: COLOUR_PALETTE[0] }],
  );
  const [schedule, setSchedule] = useState<string[]>(() => {
    const s = initial.schedule;
    return s.length === SLOT_COUNT * DAY_COUNT ? [...s] : new Array(SLOT_COUNT * DAY_COUNT).fill('');
  });
  const [selectedPeriodId, setSelectedPeriodId] = useState<string | null>(
    initial.periods[0]?.id ?? null,
  );
  const [erasing, setErasing] = useState(false);

  // optional rate fields
  const [exportRate, setExportRate] = useState(initial.exportRate);
  const [vatRate, setVatRate] = useState(initial.vatRate);
  const [hasStandingCharge, setHasStandingCharge] = useState(initial.hasStandingCharge);
  const [standingAmount, setStandingAmount] = useState(initial.standingChargeAmount);
  const [standingUnit, setStandingUnit] = useState(initial.standingChargeUnit || 'per_day');
  const [standingVat, setStandingVat] = useState(initial.standingChargeVatInclusive);

  // contract fields
  const [contractEndDate, setContractEndDate] = useState(initial.contractEndDate);
  const [showRateReview, setShowRateReview] = useState(initial.showRateReviewField);
  const [rateReviewDate, setRateReviewDate] = useState(initial.rateReviewDate);
  const [contractNotes, setContractNotes] = useState(initial.contractNotes);

  // ui state
  const [submitted, setSubmitted] = useState(false);
  const [saveState, setSaveState] = useState<'idle' | 'success'>('idle');

  // ---- painting ----
  const isPaintingRef = useRef(false);
  const paintValueRef = useRef<string>('');
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stop = () => { isPaintingRef.current = false; };
    window.addEventListener('mouseup', stop);
    return () => window.removeEventListener('mouseup', stop);
  }, []);

  // Touch drag via non-passive listener on the grid container
  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const handleTouchMove = (e: TouchEvent) => {
      if (!isPaintingRef.current) return;
      e.preventDefault();
      const touch = e.touches[0];
      const target = document.elementFromPoint(touch.clientX, touch.clientY) as HTMLElement;
      const slotStr = target?.dataset?.slot;
      if (slotStr !== undefined) paintSlot(parseInt(slotStr, 10));
    };
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    return () => el.removeEventListener('touchmove', handleTouchMove);
  // paintSlot is stable via useCallback
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const paintSlot = useCallback((idx: number) => {
    setSchedule((prev) => {
      if (prev[idx] === paintValueRef.current) return prev;
      const next = [...prev];
      next[idx] = paintValueRef.current;
      return next;
    });
  }, []);

  function handleSlotMouseDown(idx: number) {
    isPaintingRef.current = true;
    paintValueRef.current = erasing ? '' : (selectedPeriodId ?? '');
    paintSlot(idx);
  }

  function handleSlotMouseEnter(idx: number) {
    if (isPaintingRef.current) paintSlot(idx);
  }

  // Fill an entire day row with the selected period
  function fillDay(dayIdx: number) {
    if (!selectedPeriodId && !erasing) return;
    const value = erasing ? '' : selectedPeriodId!;
    setSchedule((prev) => {
      const next = [...prev];
      for (let s = 0; s < SLOT_COUNT; s++) {
        next[dayIdx * SLOT_COUNT + s] = value;
      }
      return next;
    });
  }

  // ---- period management ----
  function addPeriod() {
    const newPeriod: EditorPeriod = {
      id: newId(),
      periodLabel: '',
      ratePerKwh: '',
      isFreeImport: false,
      colourHex: nextAvailableColour(periods),
    };
    setPeriods((p) => [...p, newPeriod]);
    setSelectedPeriodId(newPeriod.id);
  }

  function updatePeriod(idx: number, updated: EditorPeriod) {
    setPeriods((p) => p.map((x, i) => (i === idx ? updated : x)));
  }

  function removePeriod(idx: number) {
    const removed = periods[idx];
    const newPeriods = periods.filter((_, i) => i !== idx);
    setPeriods(newPeriods);
    // Clear slots that used the removed period
    setSchedule((prev) => prev.map((pid) => (pid === removed.id ? '' : pid)));
    if (selectedPeriodId === removed.id) {
      setSelectedPeriodId(newPeriods[0]?.id ?? null);
    }
  }

  // ---- derived ----
  const unassignedCount = schedule.filter((s) => s === '').length;
  const overlapWarning = checkOverlap(validFrom, validTo, existingVersions, initial.versionId);

  function validate(): Record<string, string> {
    const errs: Record<string, string> = {};
    if (!versionLabel.trim()) errs.versionLabel = 'Version label is required';
    if (!validFrom) errs.validFrom = 'Valid from date is required';
    if (periods.length === 0) errs.periods = 'At least one price period is required';
    periods.forEach((p, i) => {
      if (!p.periodLabel.trim()) errs[`period_${i}_label`] = 'Period name required';
      if (!p.isFreeImport && !p.ratePerKwh) errs[`period_${i}_rate`] = 'Rate required';
    });
    if (unassignedCount > 0) errs.schedule = `${unassignedCount} slot${unassignedCount !== 1 ? 's' : ''} unassigned — all slots must be assigned before saving`;
    return errs;
  }

  const errors = submitted ? validate() : {};

  function handleSave() {
    setSubmitted(true);
    if (Object.keys(validate()).length > 0) return;
    setSaveState('success');
  }

  // ---- render ----

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
          {validTo ? <> to <span className="text-slate-200">{validTo}</span></> : ' onwards'} will be
          recalculated. This may take a few moments.
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

  const totalErrors = Object.keys(errors).length;

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

      {/* Tariff identity */}
      <SectionCard title="Tariff details">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={LABEL_CLASS}>Supplier</label>
            <input
              type="text"
              value={supplierName}
              onChange={(e) => setSupplierName(e.target.value)}
              placeholder="e.g. Energia"
              className={INPUT_CLASS}
              readOnly={mode === 'edit'}
            />
          </div>
          <div>
            <label className={LABEL_CLASS}>Plan name</label>
            <input
              type="text"
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              placeholder="e.g. Smart Meter 24h"
              className={INPUT_CLASS}
              readOnly={mode === 'edit'}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS}>Version label</label>
            <input
              type="text"
              value={versionLabel}
              onChange={(e) => setVersionLabel(e.target.value)}
              placeholder="e.g. Energia Smart 24h — Oct 2025"
              className={[INPUT_CLASS, errors.versionLabel ? 'border-red-700' : ''].join(' ')}
            />
            {errors.versionLabel && <p className={FIELD_ERROR_CLASS}>{errors.versionLabel}</p>}
          </div>
        </div>
        {mode === 'edit' && (
          <p className="mt-3 text-xs text-slate-600">Supplier and plan name apply to all versions and cannot be changed here.</p>
        )}
      </SectionCard>

      {/* Price periods */}
      <SectionCard title="Price periods">
        <div className="flex flex-col gap-3">
          {errors.periods && <p className={FIELD_ERROR_CLASS}>{errors.periods}</p>}
          {periods.map((period, i) => (
            <PeriodRow
              key={period.id}
              period={period}
              index={i}
              canDelete={periods.length > 1}
              onChange={(updated) => updatePeriod(i, updated)}
              onDelete={() => removePeriod(i)}
            />
          ))}
          <button
            type="button"
            onClick={addPeriod}
            disabled={periods.length >= COLOUR_PALETTE.length}
            className="inline-flex items-center gap-1.5 self-start rounded-full border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-slate-500 hover:text-slate-100 transition-colors disabled:opacity-40"
          >
            <Plus size={11} />
            Add period
          </button>
        </div>
      </SectionCard>

      {/* Weekly schedule */}
      <SectionCard title="Weekly schedule">
        <div className="flex flex-col gap-4">

          {/* Period selector */}
          <div>
            <p className={LABEL_CLASS}>Select a period to paint</p>
            <div className="flex flex-wrap gap-2 items-center">
              {periods.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => { setSelectedPeriodId(p.id); setErasing(false); }}
                  className={[
                    'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                    selectedPeriodId === p.id && !erasing
                      ? 'border-slate-400 text-slate-100 bg-slate-700/60'
                      : 'border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200',
                  ].join(' ')}
                >
                  <span
                    className="h-2.5 w-2.5 rounded-sm shrink-0"
                    style={{ backgroundColor: p.colourHex }}
                  />
                  {p.periodLabel || `Period ${periods.indexOf(p) + 1}`}
                </button>
              ))}
              <button
                type="button"
                onClick={() => { setErasing(true); setSelectedPeriodId(null); }}
                className={[
                  'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                  erasing
                    ? 'border-slate-400 text-slate-100 bg-slate-700/60'
                    : 'border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200',
                ].join(' ')}
              >
                <Eraser size={11} />
                Erase
              </button>
            </div>
          </div>

          {/* Unassigned warning */}
          {unassignedCount > 0 && (
            <div className="flex items-start gap-2.5 rounded-xl border border-amber-700/30 bg-amber-950/20 px-3.5 py-3">
              <AlertTriangle size={13} className="mt-0.5 shrink-0 text-amber-400" />
              <p className="text-xs text-amber-300">
                {unassignedCount} slot{unassignedCount !== 1 ? 's' : ''} unassigned —
                click or drag slots in the grid below to assign them to a period.
                All slots must be assigned before saving.
              </p>
            </div>
          )}
          {errors.schedule && !unassignedCount && (
            <p className={FIELD_ERROR_CLASS}>{errors.schedule}</p>
          )}

          {/* Grid */}
          <ScheduleGrid
            schedule={schedule}
            periods={periods}
            selectedPeriodId={erasing ? null : selectedPeriodId}
            onSlotMouseDown={handleSlotMouseDown}
            onSlotMouseEnter={handleSlotMouseEnter}
            gridRef={gridRef}
          />

          {/* Fill-day shortcuts */}
          <div>
            <p className={LABEL_CLASS}>Fill whole day</p>
            <div className="flex flex-wrap gap-2">
              {DAY_LABELS.map((dayLabel, dayIdx) => (
                <button
                  key={dayIdx}
                  type="button"
                  onClick={() => fillDay(dayIdx)}
                  disabled={!selectedPeriodId && !erasing}
                  className="rounded-lg border border-slate-700 px-2.5 py-1 text-xs text-slate-400 hover:border-slate-500 hover:text-slate-200 transition-colors disabled:opacity-30"
                >
                  {dayLabel}
                </button>
              ))}
            </div>
            <p className="mt-1.5 text-xs text-slate-600">
              Fills all 48 slots for that day with the currently selected period.
            </p>
          </div>
        </div>
      </SectionCard>

      {/* Validity window */}
      <SectionCard title="Validity window">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={LABEL_CLASS}>Valid from</label>
            <input
              type="date"
              value={validFrom}
              onChange={(e) => setValidFrom(e.target.value)}
              className={[INPUT_CLASS, errors.validFrom ? 'border-red-700' : ''].join(' ')}
            />
            {errors.validFrom && <p className={FIELD_ERROR_CLASS}>{errors.validFrom}</p>}
          </div>
          <div>
            <label className={LABEL_CLASS}>Valid to <span className="normal-case font-normal text-slate-600">(leave blank if current)</span></label>
            <input
              type="date"
              value={validTo}
              onChange={(e) => setValidTo(e.target.value)}
              className={INPUT_CLASS}
            />
          </div>
        </div>

        {overlapWarning && (
          <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-amber-700/30 bg-amber-950/20 px-3.5 py-3">
            <AlertTriangle size={13} className="mt-0.5 shrink-0 text-amber-400" />
            <p className="text-xs text-amber-300">
              This date range overlaps with <span className="font-medium">{overlapWarning.versionLabel}</span>{' '}
              ({overlapWarning.validFromLocalDate}
              {overlapWarning.validToLocalDate ? ` – ${overlapWarning.validToLocalDate}` : ' onwards'}).
              Adjust the dates or update the other version first.
            </p>
          </div>
        )}

        <div className="mt-3 flex items-start gap-2 rounded-xl border border-slate-800/60 bg-slate-900/30 px-3.5 py-3">
          <Info size={12} className="mt-0.5 shrink-0 text-slate-600" />
          <p className="text-xs text-slate-500 leading-relaxed">
            Leave <span className="text-slate-400">valid to</span> blank if these rates are still current.
            Adding a newer version will automatically end this one.
          </p>
        </div>
      </SectionCard>

      {/* Optional rate fields */}
      <SectionCard title="Export rate and charges" collapsible defaultOpen={!!(exportRate || vatRate || hasStandingCharge)}>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={LABEL_CLASS}>Export rate (€/kWh)</label>
              <input
                type="number"
                step="0.000001"
                min="0"
                value={exportRate}
                onChange={(e) => setExportRate(e.target.value)}
                placeholder="0.1850"
                className={INPUT_CLASS}
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>VAT rate</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={vatRate}
                onChange={(e) => setVatRate(e.target.value)}
                placeholder="0.09 (9%)"
                className={INPUT_CLASS}
              />
            </div>
          </div>

          {/* Standing charge */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <button
                type="button"
                role="checkbox"
                aria-checked={hasStandingCharge}
                onClick={() => setHasStandingCharge((v) => !v)}
                className={[
                  'h-4 w-4 rounded border flex items-center justify-center transition-colors',
                  hasStandingCharge
                    ? 'border-emerald-500 bg-emerald-500/20'
                    : 'border-slate-600 bg-slate-800',
                ].join(' ')}
              >
                {hasStandingCharge && <CheckCircle2 size={10} className="text-emerald-400" />}
              </button>
              <span
                className="text-xs text-slate-400 cursor-pointer select-none"
                onClick={() => setHasStandingCharge((v) => !v)}
              >
                Includes standing charge
              </span>
            </div>
            {hasStandingCharge && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pl-6">
                <div className="sm:col-span-2">
                  <label className={LABEL_CLASS}>Amount (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={standingAmount}
                    onChange={(e) => setStandingAmount(e.target.value)}
                    placeholder="0.5500"
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className={LABEL_CLASS}>Unit</label>
                  <select
                    value={standingUnit}
                    onChange={(e) => setStandingUnit(e.target.value)}
                    className={INPUT_CLASS}
                  >
                    <option value="per_day">Per day</option>
                    <option value="per_month">Per month</option>
                  </select>
                </div>
                <div className="sm:col-span-3 flex items-center gap-2">
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={standingVat}
                    onClick={() => setStandingVat((v) => !v)}
                    className={[
                      'h-4 w-4 rounded border flex items-center justify-center transition-colors',
                      standingVat
                        ? 'border-emerald-500 bg-emerald-500/20'
                        : 'border-slate-600 bg-slate-800',
                    ].join(' ')}
                  >
                    {standingVat && <CheckCircle2 size={10} className="text-emerald-400" />}
                  </button>
                  <span
                    className="text-xs text-slate-400 cursor-pointer select-none"
                    onClick={() => setStandingVat((v) => !v)}
                  >
                    VAT inclusive
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </SectionCard>

      {/* Contract details */}
      <SectionCard
        title="Contract details"
        collapsible
        defaultOpen={!!(contractEndDate || contractNotes)}
      >
        <div className="flex flex-col gap-4">
          <div>
            <label className={LABEL_CLASS}>Contract end date</label>
            <input
              type="date"
              value={contractEndDate}
              onChange={(e) => setContractEndDate(e.target.value)}
              className={INPUT_CLASS}
            />
            <p className="mt-1 text-xs text-slate-600">When your fixed-term deal with the supplier expires.</p>
          </div>

          {/* Rate review reminder */}
          {!showRateReview ? (
            <button
              type="button"
              onClick={() => setShowRateReview(true)}
              className="self-start text-xs text-slate-500 hover:text-slate-300 transition-colors underline decoration-dotted underline-offset-2"
            >
              Some suppliers update rates mid-contract. Add a reminder to check your rates?
            </button>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className={LABEL_CLASS + ' mb-0'}>Rate review reminder date</label>
                <button
                  type="button"
                  onClick={() => { setShowRateReview(false); setRateReviewDate(''); }}
                  className="text-[10px] text-slate-600 hover:text-slate-400 transition-colors"
                >
                  Remove
                </button>
              </div>
              <input
                type="date"
                value={rateReviewDate}
                onChange={(e) => setRateReviewDate(e.target.value)}
                className={INPUT_CLASS}
              />
              <p className="mt-1 text-xs text-slate-600">
                A reminder that will appear in the Tariffs section when this date approaches.
              </p>
            </div>
          )}

          <div>
            <label className={LABEL_CLASS}>Notes</label>
            <textarea
              value={contractNotes}
              onChange={(e) => setContractNotes(e.target.value)}
              placeholder="Anything else worth remembering about this contract, e.g. renewal terms."
              rows={3}
              className={INPUT_CLASS + ' resize-none'}
            />
          </div>
        </div>
      </SectionCard>

      {/* Recalculation impact */}
      <div className="flex items-start gap-2.5 rounded-2xl border border-slate-800/60 bg-slate-900/30 px-4 py-3.5">
        <Info size={13} className="mt-0.5 shrink-0 text-slate-500" />
        <p className="text-xs text-slate-500 leading-relaxed">
          {mode === 'create'
            ? 'Saving this version will calculate cost and savings figures for all days within its validity window.'
            : 'Saving changes will recalculate all cost and savings figures that fall within this version\'s date range. This may take a few moments.'}
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
          {submitted && totalErrors > 0 && (
            <p className="text-xs text-red-400">
              {totalErrors} issue{totalErrors !== 1 ? 's' : ''} to fix before saving
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
