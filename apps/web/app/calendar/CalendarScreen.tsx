'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AlertTriangle,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Home,
  RefreshCw,
  Settings,
} from 'lucide-react';
import type { RangeSummaryPayload, RangeSeriesDay } from '@/src/range/types';
import type { RepaymentSchedule } from '@/src/range/recovery';
import { getCachedYear, setCachedYear, fetchOrGetYear } from '@/src/calendar/yearCache';
import {
  CALENDAR_METRICS,
  normalizeSeries,
  formatDayValue,
  getMetricBarColor,
  type NormalizedDay,
} from '@/src/calendar/metrics';
import type { CalendarMetric } from '@/src/calendar/types';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export type CalendarScreenProps = {
  payload: RangeSummaryPayload | null;
  year: number;
  today: string;
  earliestDate: string | null;
  repaymentSchedules: RepaymentSchedule[];
  currency: string;
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const DAY_NUMBERS = Array.from({ length: 31 }, (_, i) => i + 1);

/** Returns days in the given month (1-based) for the given year. */
function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/** Returns YYYY-MM-DD or null if the date is not a valid calendar date. */
function isoDate(year: number, month: number, day: number): string | null {
  if (day > daysInMonth(year, month)) return null;
  const mm = String(month).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}

function buildMonthRangeUrl(year: number, month: number): string {
  const mm = String(month).padStart(2, '0');
  const lastDay = daysInMonth(year, month);
  const dd = String(lastDay).padStart(2, '0');
  return `/range?from=${year}-${mm}-01&to=${year}-${mm}-${dd}&mode=months`;
}

// ---------------------------------------------------------------------------
// Root screen
// ---------------------------------------------------------------------------

export function CalendarScreen({
  payload: initialPayload,
  year: initialYear,
  today,
  earliestDate: initialEarliestDate,
  repaymentSchedules,
  currency,
}: CalendarScreenProps) {
  const router = useRouter();

  const [activeYear, setActiveYear] = useState(initialYear);
  const [activeSeries, setActiveSeries] = useState<RangeSeriesDay[]>(
    initialPayload?.series ?? [],
  );
  const [earliestDate, setEarliestDate] = useState(initialEarliestDate);
  const [activeMetric, setActiveMetric] = useState<CalendarMetric>('generation_kwh');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(initialPayload === null);

  const [tooltip, setTooltip] = useState<{
    date: string;
    rawValue: number | null;
    message?: string;
    x: number;
    y: number;
  } | null>(null);

  const currentYear = parseInt(today.slice(0, 4), 10);
  const earliestYear = earliestDate ? parseInt(earliestDate.slice(0, 4), 10) : currentYear;

  // Seed the cache with the server-loaded payload on mount.
  const seededRef = useRef(false);
  useEffect(() => {
    if (seededRef.current || !initialPayload) return;
    seededRef.current = true;
    setCachedYear(String(initialYear), initialPayload);
  }, [initialPayload, initialYear]);

  // ---------------------------------------------------------------------------
  // Year navigation
  // ---------------------------------------------------------------------------

  const navigateYear = useCallback(
    async (newYear: number) => {
      if (newYear === activeYear) return;
      setLoading(true);
      setError(false);
      setTooltip(null);

      // Update URL immediately.
      window.history.replaceState(null, '', `/calendar?year=${newYear}`);

      try {
        const payload = await fetchOrGetYear(String(newYear));
        setActiveSeries(payload.series);
        if (payload.meta.earliestDate) {
          setEarliestDate(payload.meta.earliestDate);
        }
        setActiveYear(newYear);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    },
    [activeYear],
  );

  // Also pre-warm the adjacent year when idle.
  useEffect(() => {
    const nextYear = activeYear + 1;
    const prevYear = activeYear - 1;
    if (nextYear <= currentYear && !getCachedYear(String(nextYear))) {
      fetchOrGetYear(String(nextYear)).catch(() => {});
    }
    if (prevYear >= earliestYear && !getCachedYear(String(prevYear))) {
      fetchOrGetYear(String(prevYear)).catch(() => {});
    }
  }, [activeYear, currentYear, earliestYear]);

  // ---------------------------------------------------------------------------
  // Normalization
  // ---------------------------------------------------------------------------

  const normalizedMap = useMemo<Map<string, NormalizedDay>>(() => {
    const normalized = normalizeSeries(activeSeries, activeMetric, repaymentSchedules);
    return new Map(normalized.map((d) => [d.date, d]));
  }, [activeSeries, activeMetric, repaymentSchedules]);

  // ---------------------------------------------------------------------------
  // Year total
  // ---------------------------------------------------------------------------

  const yearTotal = useMemo(() => {
    let sum = 0;
    let hasAny = false;
    for (const d of normalizedMap.values()) {
      if (d.rawValue !== null && d.rawValue >= 0) {
        sum += d.rawValue;
        hasAny = true;
      }
    }
    if (!hasAny) return null;
    if (activeMetric === 'prorata_coverage') return null; // Average doesn't make sense
    return formatDayValue(sum, activeMetric, currency);
  }, [normalizedMap, activeMetric, currency]);

  // ---------------------------------------------------------------------------
  // Tooltip handlers
  // ---------------------------------------------------------------------------

  const handleCellEnter = useCallback(
    (e: React.MouseEvent, date: string, normalized: NormalizedDay | undefined) => {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      // Use viewport-relative coords (fixed positioning).
      const x = rect.left;
      const y = rect.top;

      if (!normalized || normalized.rawValue === null) {
        const descriptor = CALENDAR_METRICS.find((m) => m.id === activeMetric);
        const day = activeSeries.find((d) => d.date === date);
        let message = 'No data';
        if (day?.hasSummary && descriptor?.requiresTariff && !day.billing) {
          message = 'No tariff';
        } else if (descriptor?.requiresFinance && repaymentSchedules.length === 0) {
          message = 'No finance data';
        }
        setTooltip({ date, rawValue: null, message, x, y });
        return;
      }

      setTooltip({ date, rawValue: normalized.rawValue, x, y });
    },
    [activeMetric, activeSeries, repaymentSchedules],
  );

  const handleCellLeave = useCallback(() => setTooltip(null), []);

  const prevDisabled = activeYear <= earliestYear;
  const nextDisabled = activeYear >= currentYear;

  const barColor = getMetricBarColor(activeMetric);

  return (
    <div
      className="min-h-screen font-sans text-slate-100 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.06),_transparent_30%),linear-gradient(180deg,#050b14_0%,#0b1220_100%)]"
      onClick={() => setTooltip(null)}
    >
      {/* ------------------------------------------------------------------ */}
      {/* Nav bar                                                             */}
      {/* ------------------------------------------------------------------ */}
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-[#101826]">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              href="/live"
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              <ChevronLeft size={14} />
              <Home size={13} />
              <span className="hidden sm:inline">Overview</span>
            </Link>
            <span className="text-slate-700">/</span>
            <div className="flex items-center gap-2">
              <CalendarDays size={14} className="text-indigo-400" />
              <span className="text-sm font-semibold text-slate-100">Calendar</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/range"
              title="Range History"
              className="flex h-8 items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800 px-3 text-xs text-slate-400 hover:border-slate-600 hover:text-slate-200 transition-colors"
            >
              Range History
            </Link>
            <Link
              href="/settings"
              title="Settings"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-200 transition-colors"
            >
              <Settings size={14} />
            </Link>
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------------------ */}
      {/* Year bar                                                            */}
      {/* ------------------------------------------------------------------ */}
      <div className="sticky top-14 z-30 border-b border-slate-800 bg-[#0c1422]/90 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => navigateYear(activeYear - 1)}
              disabled={prevDisabled || loading}
              aria-label="Previous year"
              className={[
                'flex h-8 w-8 items-center justify-center rounded-full border transition-colors',
                prevDisabled || loading
                  ? 'border-slate-800 text-slate-700 cursor-default opacity-40'
                  : 'border-slate-700 bg-slate-900/70 text-slate-300 hover:border-slate-600 hover:text-slate-100',
              ].join(' ')}
            >
              <ChevronLeft size={14} />
            </button>

            <Link
              href={`/range?from=${activeYear}-01-01&to=${activeYear}-12-31&mode=years`}
              className="min-w-[80px] rounded-full border border-slate-700 bg-slate-900/70 px-4 py-1.5 text-center text-sm font-semibold text-slate-200 transition-colors hover:border-indigo-500/60 hover:text-white"
            >
              {activeYear}
            </Link>

            <button
              onClick={() => navigateYear(activeYear + 1)}
              disabled={nextDisabled || loading}
              aria-label="Next year"
              className={[
                'flex h-8 w-8 items-center justify-center rounded-full border transition-colors',
                nextDisabled || loading
                  ? 'border-slate-800 text-slate-700 cursor-default opacity-40'
                  : 'border-slate-700 bg-slate-900/70 text-slate-300 hover:border-slate-600 hover:text-slate-100',
              ].join(' ')}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Main content                                                        */}
      {/* ------------------------------------------------------------------ */}
      <main className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6">
        {error && <HardErrorCard onRetry={() => { setError(false); navigateYear(activeYear); }} />}

        {!error && (
          <>
            {/* Metric strip */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {CALENDAR_METRICS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setActiveMetric(m.id)}
                  className={[
                    'shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                    activeMetric === m.id
                      ? 'border-indigo-500 bg-indigo-600/80 text-white'
                      : 'border-slate-700 bg-slate-900/70 text-slate-400 hover:border-slate-600 hover:text-slate-200',
                  ].join(' ')}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Year total */}
            {yearTotal && (
              <div className="flex items-baseline gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                  {CALENDAR_METRICS.find((m) => m.id === activeMetric)?.label} — {activeYear} total
                </span>
                <span className="font-mono text-lg font-semibold text-slate-100">{yearTotal}</span>
              </div>
            )}

            {/* Grid */}
            {loading ? (
              <LoadingState />
            ) : (
              <CalendarGrid
                year={activeYear}
                today={today}
                normalizedMap={normalizedMap}
                barColor={barColor}
                activeMetric={activeMetric}
                currency={currency}
                repaymentSchedules={repaymentSchedules}
                activeSeries={activeSeries}
                onCellEnter={handleCellEnter}
                onCellLeave={handleCellLeave}
              />
            )}
          </>
        )}
      </main>

      {/* ------------------------------------------------------------------ */}
      {/* Tooltip                                                             */}
      {/* ------------------------------------------------------------------ */}
      {tooltip && (
        <TooltipPopup
          date={tooltip.date}
          rawValue={tooltip.rawValue}
          message={tooltip.message}
          metric={activeMetric}
          currency={currency}
          x={tooltip.x}
          y={tooltip.y}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Calendar grid
// ---------------------------------------------------------------------------

type CalendarGridProps = {
  year: number;
  today: string;
  normalizedMap: Map<string, NormalizedDay>;
  barColor: string;
  activeMetric: CalendarMetric;
  currency: string;
  repaymentSchedules: RepaymentSchedule[];
  activeSeries: RangeSeriesDay[];
  onCellEnter: (e: React.MouseEvent, date: string, normalized: NormalizedDay | undefined) => void;
  onCellLeave: () => void;
};

function CalendarGrid({
  year,
  today,
  normalizedMap,
  barColor,
  onCellEnter,
  onCellLeave,
}: CalendarGridProps) {
  return (
    <div className="rounded-[28px] border border-slate-800 bg-[#111b2b] p-4 sm:p-6">
      {/* Day header row */}
      <div className="mb-1 flex">
        {/* Month label spacer */}
        <div className="w-9 shrink-0 sm:w-11" />
        <div className="flex flex-1 gap-px">
          {DAY_NUMBERS.map((d) => (
            <div
              key={d}
              className="flex-1 text-center text-[9px] font-medium text-slate-600 leading-none"
            >
              {d}
            </div>
          ))}
        </div>
      </div>

      {/* Month rows */}
      <div className="flex flex-col gap-px">
        {MONTH_NAMES.map((monthName, monthIdx) => {
          const month = monthIdx + 1;
          const monthRangeUrl = buildMonthRangeUrl(year, month);

          return (
            <div key={month} className="flex items-end gap-px">
              {/* Month label */}
              <Link
                href={monthRangeUrl}
                className="w-9 shrink-0 pr-1 text-right text-[10px] font-medium text-slate-500 hover:text-indigo-400 transition-colors leading-none pb-0.5 sm:w-11"
              >
                {monthName}
              </Link>

              {/* Day cells */}
              <div className="flex flex-1 gap-px">
                {DAY_NUMBERS.map((day) => {
                  const dateStr = isoDate(year, month, day);

                  if (!dateStr) {
                    // Invalid date for this month
                    return <div key={day} className="flex-1" />;
                  }

                  const isFuture = dateStr > today;
                  const normalized = normalizedMap.get(dateStr);
                  const hasData = normalized && normalized.normalizedHeight !== null;
                  const height = hasData ? normalized.normalizedHeight! : 0;

                  if (isFuture) {
                    return (
                      <div key={day} className="flex-1 h-8 flex items-end">
                        <div className="w-full h-px bg-slate-800/50 rounded-full" />
                      </div>
                    );
                  }

                  const cellContent = (
                    <div className="w-full h-8 relative flex items-end">
                      <div
                        className={[
                          'w-full rounded-sm transition-all duration-300',
                          hasData ? barColor : 'bg-slate-800/40',
                        ].join(' ')}
                        style={{ height: hasData ? `${Math.max(2, height * 100)}%` : '2px' }}
                      />
                    </div>
                  );

                  if (hasData) {
                    return (
                      <Link
                        key={day}
                        href={`/history/${dateStr}`}
                        className="flex-1 flex items-end hover:opacity-80 transition-opacity"
                        onMouseEnter={(e) => onCellEnter(e, dateStr, normalized)}
                        onMouseLeave={onCellLeave}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {cellContent}
                      </Link>
                    );
                  }

                  return (
                    <div
                      key={day}
                      className="flex-1 flex items-end cursor-default"
                      onMouseEnter={(e) => onCellEnter(e, dateStr, normalized)}
                      onMouseLeave={onCellLeave}
                    >
                      {cellContent}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tooltip
// ---------------------------------------------------------------------------

function TooltipPopup({
  date,
  rawValue,
  message,
  metric,
  currency,
  x,
  y,
}: {
  date: string;
  rawValue: number | null;
  message?: string;
  metric: CalendarMetric;
  currency: string;
  x: number;
  y: number;
}) {
  const formatted = rawValue !== null ? formatDayValue(rawValue, metric, currency) : null;
  // Keep tooltip within the right edge of the viewport.
  const safeX = typeof window !== 'undefined' ? Math.min(x, window.innerWidth - 184) : x;

  return (
    <div
      className="pointer-events-none fixed z-50 rounded-xl border border-slate-700 bg-[#131f30] px-3 py-2 text-xs shadow-xl"
      style={{ left: safeX, top: Math.max(8, y - 56) }}
    >
      <p className="font-medium text-slate-300">{formatDateLabel(date)}</p>
      {message ? (
        <p className="mt-0.5 text-slate-500">{message}</p>
      ) : (
        <p className="mt-0.5 font-mono font-semibold text-slate-100">{formatted}</p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Loading state
// ---------------------------------------------------------------------------

function LoadingState() {
  return (
    <div className="flex h-64 items-center justify-center rounded-[28px] border border-slate-800 bg-[#111b2b]">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <RefreshCw size={14} className="animate-spin" />
        Loading year…
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Hard error
// ---------------------------------------------------------------------------

function HardErrorCard({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[28px] border border-rose-800/30 bg-rose-950/20 py-20 text-center">
      <AlertTriangle size={28} className="mb-4 text-rose-600" />
      <p className="mb-1 text-sm font-semibold text-slate-300">Something went wrong loading this year</p>
      <p className="mb-5 text-xs text-slate-500">Try refreshing the page or going back to a previous year.</p>
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/70 px-4 py-2 text-sm text-slate-300 hover:border-slate-600 hover:text-slate-100"
      >
        <RefreshCw size={12} />
        Try again
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDateLabel(iso: string): string {
  return new Intl.DateTimeFormat('en-IE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${iso}T12:00:00`));
}
