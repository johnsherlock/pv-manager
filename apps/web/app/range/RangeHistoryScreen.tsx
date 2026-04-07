'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Home,
  Info,
  RefreshCw,
  TrendingUp,
  X,
  Zap,
} from 'lucide-react';
import type { RangeSummaryPayload } from '@/src/range/types';
import {
  type RangePreset,
  type PresetWindow,
  PRESET_LABELS,
  PRESET_ORDER,
  DEFAULT_PRESET,
  computePresetWindow,
  clampToLoadedWindow,
  formatCustomWindowLabel,
  loadedWindowStart,
} from '@/src/range/presets';
import {
  aggregateKpisFromSeries,
  allDatesInWindow,
  formatCurrency,
  formatPercent,
} from '@/src/range/kpi';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export type RangeHistoryScreenProps = {
  payload: RangeSummaryPayload | null;
  today: string;
  financeMode: string | null;
  error: boolean;
};

// ---------------------------------------------------------------------------
// Root screen
// ---------------------------------------------------------------------------

export function RangeHistoryScreen({ payload, today, financeMode, error }: RangeHistoryScreenProps) {
  const [activePreset, setActivePreset] = useState<RangePreset | 'custom'>(DEFAULT_PRESET);
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [customOpen, setCustomOpen] = useState(false);
  const [tariffCalloutDismissed, setTariffCalloutDismissed] = useState(false);

  const windowStart = loadedWindowStart(today);

  const activeWindow: PresetWindow = useMemo(() => {
    if (activePreset === 'custom' && customFrom && customTo) {
      return clampToLoadedWindow(customFrom, customTo, today);
    }
    return computePresetWindow(activePreset as RangePreset, today);
  }, [activePreset, customFrom, customTo, today]);

  const windowLabel = useMemo(() => {
    if (activePreset === 'custom' && customFrom && customTo) {
      return formatCustomWindowLabel(customFrom, customTo);
    }
    return PRESET_LABELS[activePreset as RangePreset];
  }, [activePreset, customFrom, customTo]);

  const windowDates = useMemo(
    () => allDatesInWindow(activeWindow.from, activeWindow.to),
    [activeWindow],
  );

  const kpis = useMemo(() => {
    if (!payload) return null;
    const filtered = payload.series.filter(
      (d) => d.date >= activeWindow.from && d.date <= activeWindow.to,
    );
    return aggregateKpisFromSeries(filtered, activeWindow.from, activeWindow.to, windowDates);
  }, [payload, activeWindow, windowDates]);

  const isFinanced = financeMode === 'finance';

  function handlePresetClick(preset: RangePreset) {
    setActivePreset(preset);
    setCustomOpen(false);
  }

  function handleCustomApply() {
    if (customFrom && customTo && customFrom <= customTo) {
      setActivePreset('custom');
      setCustomOpen(false);
    }
  }

  const health = payload?.health;
  const hasTariffChange = health?.hasTariffChange && !tariffCalloutDismissed;
  const hasMissing = (kpis?.missingDays ?? 0) > 0;
  const hasPartial = (kpis?.partialDays ?? 0) > 0;
  const showCompletenessBanner = hasMissing || hasPartial;

  // Trust strip: last day in the loaded window that has a summary
  const lastCoveredDate = payload
    ? [...payload.series].reverse().find((d) => true)?.date ?? null
    : null;

  return (
    <div className="min-h-screen bg-[#0d1520] text-slate-100">
      {/* ------------------------------------------------------------------ */}
      {/* §1 — Sticky header: nav + period selector + trust strip             */}
      {/* ------------------------------------------------------------------ */}
      <div className="sticky top-0 z-40 border-b border-slate-800 bg-[#101826] shadow-sm">
        {/* Nav row */}
        <div className="mx-auto flex h-12 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200">
              <ChevronLeft size={14} />
              <Home size={13} />
              <span className="hidden sm:inline">Overview</span>
            </Link>
            <span className="text-slate-700">/</span>
            <div className="flex items-center gap-2">
              <BarChart3 size={14} className="text-indigo-400" />
              <span className="text-sm font-semibold text-slate-100">Range History</span>
            </div>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-xs font-bold text-slate-200">
            J
          </div>
        </div>

        {/* Period selector row */}
        <div className="mx-auto max-w-7xl px-4 pb-3 sm:px-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-hide">
            {PRESET_ORDER.map((preset) => (
              <button
                key={preset}
                onClick={() => handlePresetClick(preset)}
                className={[
                  'shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                  activePreset === preset
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700',
                ].join(' ')}
              >
                {PRESET_LABELS[preset]}
              </button>
            ))}

            {/* Custom range button */}
            <button
              onClick={() => setCustomOpen((v) => !v)}
              className={[
                'shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                activePreset === 'custom'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700',
              ].join(' ')}
            >
              {activePreset === 'custom' ? windowLabel : 'Custom…'}
            </button>
          </div>

          {/* Custom range disclosure */}
          {customOpen && (
            <div className="mt-2 flex flex-wrap items-end gap-3 rounded-xl border border-slate-700 bg-slate-900 p-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase tracking-widest text-slate-500">From</label>
                <input
                  type="date"
                  value={customFrom}
                  min={windowStart}
                  max={customTo || today}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase tracking-widest text-slate-500">To</label>
                <input
                  type="date"
                  value={customTo}
                  min={customFrom || windowStart}
                  max={today}
                  onChange={(e) => setCustomTo(e.target.value)}
                  className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <button
                onClick={handleCustomApply}
                disabled={!customFrom || !customTo || customFrom > customTo}
                className="rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white disabled:opacity-40 hover:bg-indigo-500"
              >
                Apply
              </button>
              <button
                onClick={() => setCustomOpen(false)}
                className="rounded-lg px-3 py-1.5 text-sm text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Trust strip */}
          <div className="mt-1.5 flex items-center gap-2 text-[11px] text-slate-500">
            {lastCoveredDate ? (
              <>
                <span className="h-1.5 w-1.5 rounded-full bg-slate-600" />
                Data through {formatDate(lastCoveredDate)}
              </>
            ) : (
              <>
                <span className="h-1.5 w-1.5 rounded-full bg-slate-700" />
                No data loaded
              </>
            )}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Main content                                                        */}
      {/* ------------------------------------------------------------------ */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {/* Hard error */}
        {error && <HardErrorCard />}

        {!error && (
          <>
            {/* Empty — no coverage at all */}
            {kpis && kpis.coveredDays === 0 && (
              <EmptyCard from={activeWindow.from} to={activeWindow.to} />
            )}

            {kpis && kpis.coveredDays > 0 && (
              <>
                {/* §2 — KPI row */}
                <KpiRow
                  kpis={kpis}
                  currency={payload?.meta.currency ?? 'EUR'}
                  note={payload?.summary.note}
                />

                {/* §3 — Tariff-change callout */}
                {hasTariffChange && (
                  <TariffChangeCallout
                    health={health!}
                    onDismiss={() => setTariffCalloutDismissed(true)}
                  />
                )}

                {/* Completeness strip */}
                {showCompletenessBanner && (
                  <CompletenessStrip
                    missingDays={kpis.missingDays}
                    partialDays={kpis.partialDays}
                    totalDays={windowDates.length}
                    tariffGapDays={kpis.tariffGapDays}
                  />
                )}

                {/* §4–§9 Chart placeholder cards */}
                <ChartPlaceholders hasTariff={kpis.hasTariff} />

                {/* §10 — Payback placeholder (financed only) */}
                {isFinanced && <PaybackPlaceholder />}
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}

// ---------------------------------------------------------------------------
// §2 — KPI row
// ---------------------------------------------------------------------------

type KpiRowProps = {
  kpis: ReturnType<typeof aggregateKpisFromSeries>;
  currency: string;
  note?: 'banded-daily-rate' | 'simplified-daily-rate';
};

function KpiRow({ kpis, currency, note }: KpiRowProps) {
  if (!kpis.hasTariff) {
    return (
      <div className="mb-6 rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 p-6 text-center">
        <p className="mb-1 text-sm font-medium text-slate-300">Add a tariff to see cost and savings</p>
        <p className="mb-4 text-xs text-slate-500">
          Energy charts are still available below. Financial data requires a tariff to be configured.
        </p>
        <Link
          href="/tariffs"
          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
        >
          Set up tariff →
        </Link>
      </div>
    );
  }

  const partial = kpis.tariffGapDays > 0;

  return (
    <div className="mb-4">
      {partial && (
        <p className="mb-2 text-xs text-slate-500">
          Financial data covers {kpis.coveredDays - kpis.tariffGapDays} of {kpis.coveredDays} days.{' '}
          <Link href="/tariffs" className="text-indigo-400 hover:underline">
            Add tariff history to extend coverage.
          </Link>
        </p>
      )}
      {note === 'simplified-daily-rate' && (
        <p className="mb-2 text-[11px] text-slate-500">Cost calculated using day rate only</p>
      )}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <KpiCard
          label="Solar savings"
          value={formatCurrency(kpis.savings, currency)}
          highlight
        />
        <KpiCard
          label="Actual cost"
          value={formatCurrency(kpis.actualNetCost, currency)}
        />
        <KpiCard
          label="Without solar"
          value={formatCurrency(kpis.withoutSolarNetCost, currency)}
        />
        <KpiCard
          label="Export credit"
          value={formatCurrency(kpis.actualExportCredit, currency)}
        />
        <KpiCard
          label="Avg solar coverage"
          value={kpis.avgSelfConsumptionRatio != null ? formatPercent(kpis.avgSelfConsumptionRatio) : '—'}
          className="col-span-2 sm:col-span-1"
        />
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  highlight = false,
  className = '',
}: {
  label: string;
  value: string;
  highlight?: boolean;
  className?: string;
}) {
  return (
    <div
      className={[
        'rounded-2xl border p-4',
        highlight
          ? 'border-indigo-500/30 bg-indigo-500/10'
          : 'border-slate-700/60 bg-slate-800/60',
        className,
      ].join(' ')}
    >
      <p className="mb-1 text-[10px] uppercase tracking-[0.15em] text-slate-400">{label}</p>
      <p className={['text-xl font-semibold tabular-nums', highlight ? 'text-indigo-200' : 'text-slate-100'].join(' ')}>
        {value}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// §3 — Tariff-change callout
// ---------------------------------------------------------------------------

function TariffChangeCallout({
  health,
  onDismiss,
}: {
  health: RangeSummaryPayload['health'];
  onDismiss: () => void;
}) {
  return (
    <div className="mb-4 flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
      <AlertTriangle size={15} className="mt-0.5 shrink-0 text-amber-400" />
      <div className="flex-1 text-sm">
        <span className="font-medium text-amber-200">Tariff changed during this period</span>
        <span className="ml-2 text-amber-300/80">
          — {health.tariffVersionIds.length} tariff version
          {health.tariffVersionIds.length !== 1 ? 's' : ''} applied. Financial totals reflect each
          day's applicable rate.
        </span>
      </div>
      <button onClick={onDismiss} className="shrink-0 text-amber-400/60 hover:text-amber-300">
        <X size={14} />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Completeness strip
// ---------------------------------------------------------------------------

function CompletenessStrip({
  missingDays,
  partialDays,
  totalDays,
  tariffGapDays,
}: {
  missingDays: number;
  partialDays: number;
  totalDays: number;
  tariffGapDays: number;
}) {
  const parts: string[] = [];
  if (missingDays > 0) {
    parts.push(`${missingDays} day${missingDays !== 1 ? 's' : ''} in this range ${missingDays !== 1 ? 'have' : 'has'} no data and ${missingDays !== 1 ? 'are' : 'is'} excluded from totals.`);
  }
  if (partialDays > 0) {
    parts.push(`${partialDays} day${partialDays !== 1 ? 's are' : ' is'} partial.`);
  }

  return (
    <div className="mb-4 flex items-start gap-2 rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-xs text-slate-400">
      <Info size={13} className="mt-0.5 shrink-0 text-slate-500" />
      <span>{parts.join(' ')}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function EmptyCard({ from, to }: { from: string; to: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-900/50 py-16 text-center">
      <BarChart3 size={32} className="mb-4 text-slate-600" />
      <p className="mb-1 text-sm font-medium text-slate-300">No data for this period</p>
      <p className="text-xs text-slate-500">
        No summaries found between {formatDate(from)} and {formatDate(to)}.
        Check the Data Health screen if you expected data here.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Hard error
// ---------------------------------------------------------------------------

function HardErrorCard() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-rose-700/40 bg-rose-900/10 py-16 text-center">
      <AlertTriangle size={32} className="mb-4 text-rose-500" />
      <p className="mb-1 text-sm font-medium text-slate-300">Something went wrong loading this period</p>
      <p className="mb-4 text-xs text-slate-500">Try refreshing the page.</p>
      <button
        onClick={() => window.location.reload()}
        className="flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
      >
        <RefreshCw size={13} />
        Try again
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// §4–§9 Chart placeholder cards
// ---------------------------------------------------------------------------

function ChartPlaceholders({ hasTariff }: { hasTariff: boolean }) {
  return (
    <div className="space-y-4">
      <PlaceholderCard section="§4" title="Energy trend" icon={<TrendingUp size={16} />} />
      <PlaceholderCard section="§5" title="Per-day breakdown" icon={<BarChart3 size={16} />} />
      {hasTariff ? (
        <>
          <PlaceholderCard section="§6" title="Daily cost vs without solar" icon={<BarChart3 size={16} />} />
          <PlaceholderCard section="§7" title="Period cost breakdown" icon={<Zap size={16} />} />
        </>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 p-6 text-center text-xs text-slate-500">
          Financial charts (§6, §7) require a tariff to be configured.{' '}
          <Link href="/tariffs" className="text-indigo-400 hover:underline">Set up tariff →</Link>
        </div>
      )}
      <PlaceholderCard section="§8" title="Solar coverage" icon={<Zap size={16} />} />
      <PlaceholderCard section="§9" title="Export ratio" icon={<ChevronRight size={16} />} />
    </div>
  );
}

function PlaceholderCard({
  section,
  title,
  icon,
}: {
  section: string;
  title: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-slate-600">{icon}</span>
        <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">{title}</span>
        <span className="ml-auto text-[10px] text-slate-700">{section}</span>
      </div>
      <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-slate-800 text-xs text-slate-700">
        Chart coming in U-042 / U-043 / U-044
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// §10 — Payback placeholder (financed installations only)
// ---------------------------------------------------------------------------

function PaybackPlaceholder() {
  return (
    <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
      <div className="mb-3 flex items-center gap-2">
        <TrendingUp size={16} className="text-slate-600" />
        <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Payback progress</span>
        <span className="ml-auto text-[10px] text-slate-700">§10</span>
      </div>
      <div className="flex h-16 items-center justify-center rounded-xl border border-dashed border-slate-800 text-xs text-slate-700">
        Payback tracker coming in U-044
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-IE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${iso}T12:00:00`));
}
