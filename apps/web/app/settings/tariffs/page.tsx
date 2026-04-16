import Link from 'next/link';
import {
  Receipt,
  Plus,
  CalendarClock,
  AlertTriangle,
  Info,
  ArrowRight,
  CheckCircle2,
  History,
} from 'lucide-react';
import { loadTariffOverview } from '@/src/tariffs/loader';
import type { TariffVersionDetail, TariffVersionSummary, ContractInfo, PricePeriod } from '@/src/tariffs/loader';

export const dynamic = 'force-dynamic';

const SEED_INSTALLATION_ID = '00000000-0000-0000-0000-000000000002';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-IE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso + 'T00:00:00'));
}

function formatRate(rate: string | null): string {
  if (!rate) return '—';
  const c = (parseFloat(rate) * 100).toFixed(2);
  return `${c}¢`;
}

function formatStandingCharge(amount: string, unit: string): string {
  const val = parseFloat(amount).toFixed(2);
  if (unit === 'per_day') return `€${val}/day`;
  if (unit === 'per_month') return `€${val}/mo`;
  return `€${val}`;
}

/** Days until a local date string (YYYY-MM-DD). Negative = already past. */
function daysUntil(localDate: string): number {
  const target = new Date(localDate + 'T00:00:00');
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / 86_400_000);
}

// Slot index → HH:MM label (every 3 hours for axis labels)
function slotToTime(slot: number): string {
  const h = Math.floor(slot / 2);
  const m = slot % 2 === 0 ? '00' : '30';
  return `${String(h).padStart(2, '0')}:${m}`;
}

// ---------------------------------------------------------------------------
// Contract reminder banner
// ---------------------------------------------------------------------------

function ContractBanner({ contract }: { contract: ContractInfo }) {
  const reviewDays = contract.expectedReviewDate ? daysUntil(contract.expectedReviewDate) : null;
  const endDays = contract.contractEndDate ? daysUntil(contract.contractEndDate) : null;

  const isExpired = endDays !== null && endDays < 0;
  const endingSoon = !isExpired && endDays !== null && endDays <= 90;
  const reviewSoon = !isExpired && reviewDays !== null && reviewDays >= 0 && reviewDays <= 60;

  if (!isExpired && !endingSoon && !reviewSoon) return null;

  const isUrgent = isExpired || (endDays !== null && endDays <= 30);

  return (
    <div
      className={[
        'flex items-start gap-3 rounded-2xl border px-4 py-3.5',
        isUrgent
          ? 'border-red-800/40 bg-red-950/30'
          : 'border-amber-700/30 bg-amber-950/20',
      ].join(' ')}
    >
      <AlertTriangle
        size={15}
        className={['mt-0.5 shrink-0', isUrgent ? 'text-red-400' : 'text-amber-400'].join(' ')}
      />
      <div className="flex-1 min-w-0">
        {isExpired && (
          <p className="text-sm font-medium text-red-300">Contract expired</p>
        )}
        {!isExpired && endingSoon && endDays !== null && (
          <p className={['text-sm font-medium', isUrgent ? 'text-red-300' : 'text-amber-300'].join(' ')}>
            Contract ends in {endDays} day{endDays !== 1 ? 's' : ''}
          </p>
        )}
        {!isExpired && !endingSoon && reviewSoon && reviewDays !== null && (
          <p className="text-sm font-medium text-amber-300">
            Tariff review due in {reviewDays} day{reviewDays !== 1 ? 's' : ''}
          </p>
        )}
        <p className="mt-0.5 text-xs text-slate-400">
          {contract.contractEndDate
            ? `Contract end date: ${formatDate(contract.contractEndDate)}.`
            : ''}{' '}
          {contract.notes && <span className="text-slate-500">{contract.notes}</span>}
        </p>
      </div>
      <Link
        href="#"
        className="shrink-0 inline-flex items-center gap-1 rounded-full border border-slate-700 px-3 py-1 text-xs font-medium text-slate-300 hover:border-slate-500 hover:text-slate-100 transition-colors"
      >
        Review <ArrowRight size={10} />
      </Link>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Price period legend
// ---------------------------------------------------------------------------

function PeriodLegend({ periods }: { periods: PricePeriod[] }) {
  return (
    <div className="flex flex-wrap gap-3">
      {periods.map((p) => (
        <div key={p.id} className="flex items-center gap-1.5">
          <span
            className="inline-block h-2.5 w-2.5 rounded-sm"
            style={{ backgroundColor: p.colourHex ?? '#64748b' }}
          />
          <span className="text-xs text-slate-300">{p.periodLabel}</span>
          <span className="text-xs text-slate-500">{formatRate(p.ratePerKwh)}</span>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Weekly schedule preview (schedule-based)
// 7 rows (Mon–Sun) × 48 columns (half-hours), each cell coloured by period
// ---------------------------------------------------------------------------

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
// Show tick marks every 6 slots (3 hours): 00, 06, 12, 18, 24, 30, 36, 42
const AXIS_TICKS = [0, 6, 12, 18, 24, 30, 36, 42, 48];

function WeeklyScheduleGrid({
  schedule,
  periods,
}: {
  schedule: string[];
  periods: PricePeriod[];
}) {
  const colourMap = new Map(periods.map((p) => [p.id, p.colourHex ?? '#64748b']));

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-medium text-slate-400">Weekly schedule</span>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        <div style={{ minWidth: 360 }}>
          {/* Time axis */}
          <div className="flex mb-1 pl-8">
            {AXIS_TICKS.map((tick) => (
              <div
                key={tick}
                className="text-[9px] text-slate-600 tabular-nums"
                style={{ width: `${(100 / 48) * (tick === 48 ? 0 : 1)}%`, flexShrink: 0 }}
              >
                {tick < 48 ? slotToTime(tick) : ''}
              </div>
            ))}
          </div>

          {/* Day rows */}
          {DAY_LABELS.map((day, dayIdx) => (
            <div key={day} className="flex items-center gap-1 mb-0.5">
              <span className="w-7 shrink-0 text-[10px] text-slate-500 text-right pr-1">{day}</span>
              <div className="flex flex-1 gap-px">
                {Array.from({ length: 48 }, (_, slot) => {
                  const periodId = schedule[dayIdx * 48 + slot];
                  const colour = colourMap.get(periodId) ?? '#1e293b';
                  return (
                    <div
                      key={slot}
                      className="flex-1 rounded-[1px]"
                      style={{
                        height: 12,
                        backgroundColor: colour,
                        opacity: 0.85,
                      }}
                      title={`${day} ${slotToTime(slot)}–${slotToTime(slot + 1)}`}
                    />
                  );
                })}
              </div>
            </div>
          ))}

          {/* Bottom axis labels at select positions */}
          <div className="flex mt-1 pl-8">
            {AXIS_TICKS.slice(0, -1).map((tick) => (
              <div
                key={tick}
                className="text-[9px] text-slate-600 tabular-nums"
                style={{ width: `${(100 / 48) * 6}%` }}
              >
                {slotToTime(tick)}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3">
        <PeriodLegend periods={periods} />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Legacy rate window fallback (when no weeklyScheduleJson)
// Shows horizontal bands: night / day / peak / day / night across 24h
// ---------------------------------------------------------------------------

function LegacyRateBands({ version }: { version: TariffVersionDetail }) {
  const hasPeriods = version.pricePeriods.length > 0;
  if (hasPeriods) return null; // shouldn't reach here, but guard

  const bands = [
    {
      label: 'Night',
      time: `${version.nightStartLocalTime ?? '23:00'}–${version.nightEndLocalTime ?? '08:00'}`,
      rate: version.nightRate,
      colour: '#3b82f6',
    },
    {
      label: 'Day',
      time: `${version.nightEndLocalTime ?? '08:00'}–${version.peakStartLocalTime ?? '17:00'}`,
      rate: version.dayRate,
      colour: '#f59e0b',
    },
    {
      label: 'Peak',
      time: `${version.peakStartLocalTime ?? '17:00'}–${version.peakEndLocalTime ?? '19:00'}`,
      rate: version.peakRate,
      colour: '#ef4444',
    },
    {
      label: 'Day',
      time: `${version.peakEndLocalTime ?? '19:00'}–${version.nightStartLocalTime ?? '23:00'}`,
      rate: version.dayRate,
      colour: '#f59e0b',
    },
  ].filter((b) => b.rate);

  return (
    <div>
      <p className="text-xs font-medium text-slate-400 mb-2">Rate windows</p>
      <div className="flex flex-wrap gap-2">
        {bands.map((b, i) => (
          <div
            key={i}
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2"
          >
            <span
              className="inline-block h-2 w-2 rounded-sm"
              style={{ backgroundColor: b.colour }}
            />
            <div>
              <p className="text-xs font-medium text-slate-200">{b.label}</p>
              <p className="text-[10px] text-slate-500">{b.time}</p>
              <p className="text-xs text-slate-300 tabular-nums">{formatRate(b.rate)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Current tariff card
// ---------------------------------------------------------------------------

function CurrentTariffCard({
  version,
  supplierName,
  planName,
  isExportEnabled,
}: {
  version: TariffVersionDetail;
  supplierName: string;
  planName: string;
  isExportEnabled: boolean;
}) {
  const hasSchedule = version.weeklyScheduleJson !== null && version.pricePeriods.length > 0;
  const standingCharge = version.fixedCharges.find((c) => c.chargeType === 'standing_charge') ?? null;

  return (
    <div className="rounded-[20px] border border-emerald-800/30 bg-[#0d1f18] p-5 shadow-[0_8px_30px_rgba(2,6,23,0.25)]">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wide">
              Active tariff
            </span>
          </div>
          <h2 className="text-base font-semibold text-slate-100">{planName}</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {supplierName}
            {version.versionLabel !== planName ? ` · ${version.versionLabel}` : ''}
          </p>
        </div>
        <Link
          href="#"
          className="shrink-0 inline-flex items-center gap-1.5 rounded-full border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-slate-500 hover:text-slate-100 transition-colors"
        >
          Edit <ArrowRight size={10} />
        </Link>
      </div>

      {/* Validity and meta */}
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
        <span>
          From <span className="text-slate-300">{formatDate(version.validFromLocalDate)}</span>
        </span>
        {version.validToLocalDate ? (
          <span>
            To <span className="text-slate-300">{formatDate(version.validToLocalDate)}</span>
          </span>
        ) : (
          <span className="text-emerald-600">No end date</span>
        )}
        {isExportEnabled && version.exportRate && (
          <span>
            Export <span className="text-slate-300">{formatRate(version.exportRate)}</span>
          </span>
        )}
        {standingCharge && (
          <span>
            Standing charge{' '}
            <span className="text-slate-300">
              {formatStandingCharge(standingCharge.amount, standingCharge.unit)}
            </span>
            {!standingCharge.vatInclusive && (
              <span className="text-slate-600"> excl. VAT</span>
            )}
          </span>
        )}
        {version.vatRate && (
          <span>
            VAT <span className="text-slate-300">{(parseFloat(version.vatRate) * 100).toFixed(0)}%</span>
          </span>
        )}
      </div>

      {/* Schedule preview or legacy bands */}
      <div className="mt-5 pt-4 border-t border-slate-800/60">
        {hasSchedule ? (
          <WeeklyScheduleGrid
            schedule={version.weeklyScheduleJson!}
            periods={version.pricePeriods}
          />
        ) : (
          <LegacyRateBands version={version} />
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Version timeline
// ---------------------------------------------------------------------------

function VersionTimeline({ versions }: { versions: TariffVersionSummary[] }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <History size={15} className="text-slate-400" />
          <h3 className="text-sm font-semibold text-slate-200">Version history</h3>
        </div>
        <Link
          href="#"
          className="inline-flex items-center gap-1 rounded-full border border-indigo-500/40 bg-indigo-600/70 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-600 transition-colors"
        >
          <Plus size={11} />
          Add version
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        {versions.map((v, i) => {
          const isCurrent = v.isActiveDefault || v.validToLocalDate === null;
          return (
            <div
              key={v.id}
              className={[
                'relative flex items-start gap-4 rounded-2xl border px-4 py-3.5',
                isCurrent
                  ? 'border-emerald-800/30 bg-[#0d1f18]'
                  : 'border-slate-800/60 bg-slate-900/40',
              ].join(' ')}
            >
              {/* Timeline connector line */}
              {i < versions.length - 1 && (
                <div className="absolute left-[1.65rem] top-full h-2 w-px bg-slate-800" />
              )}

              <div
                className={[
                  'mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full border',
                  isCurrent
                    ? 'border-emerald-500 bg-emerald-500/40'
                    : 'border-slate-600 bg-slate-700',
                ].join(' ')}
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div>
                    <p
                      className={[
                        'text-sm font-medium',
                        isCurrent ? 'text-slate-100' : 'text-slate-300',
                      ].join(' ')}
                    >
                      {v.versionLabel}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {formatDate(v.validFromLocalDate)}
                      {' — '}
                      {v.validToLocalDate ? formatDate(v.validToLocalDate) : 'present'}
                    </p>
                  </div>
                  {isCurrent && (
                    <span className="shrink-0 rounded-full bg-emerald-900/50 border border-emerald-800/40 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                      Current
                    </span>
                  )}
                </div>

                {/* Key rates */}
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-slate-500">
                  {v.dayRate && (
                    <span>Day <span className="text-slate-300">{formatRate(v.dayRate)}</span></span>
                  )}
                  {v.nightRate && (
                    <span>Night <span className="text-slate-300">{formatRate(v.nightRate)}</span></span>
                  )}
                  {v.peakRate && (
                    <span>Peak <span className="text-slate-300">{formatRate(v.peakRate)}</span></span>
                  )}
                  {v.exportRate && (
                    <span>Export <span className="text-slate-300">{formatRate(v.exportRate)}</span></span>
                  )}
                </div>
              </div>

              {!isCurrent && (
                <Link
                  href="#"
                  className="shrink-0 text-xs text-slate-500 hover:text-slate-300 transition-colors"
                >
                  View
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function EmptyState() {
  return (
    <div className="mt-8 rounded-[20px] border border-dashed border-slate-700 bg-slate-900/40 px-6 py-12 text-center">
      <Receipt size={28} className="mx-auto mb-4 text-slate-600" />
      <p className="text-sm font-semibold text-slate-300">No tariff set up yet</p>
      <p className="mt-2 text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
        Add your electricity tariff to start seeing cost and savings calculations.
        You can add multiple rate versions if your tariff has changed over time.
      </p>
      <Link
        href="#"
        className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-indigo-500/50 bg-indigo-600/80 px-4 py-2 text-xs font-medium text-white hover:bg-indigo-600 transition-colors"
      >
        <Plus size={12} />
        Set up tariff
      </Link>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function TariffsPage() {
  const data = await loadTariffOverview(SEED_INSTALLATION_ID);

  const isEmpty = !data.plan || data.allVersions.length === 0;

  return (
    <div className="max-w-2xl">
      {/* Page header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Receipt size={18} className="text-slate-400" />
          <h1 className="text-lg font-semibold text-slate-100">Tariffs</h1>
        </div>
        {!isEmpty && (
          <Link
            href="#"
            className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/40 bg-indigo-600/70 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-600 transition-colors"
          >
            <Plus size={11} />
            Add version
          </Link>
        )}
      </div>

      <p className="text-sm text-slate-400 leading-relaxed max-w-prose mb-8">
        Manage your electricity tariff history — import rates, export rates, standing charges,
        and contract dates. Tariff data is required for all cost and savings calculations.
      </p>

      {isEmpty ? (
        <EmptyState />
      ) : (
        <div className="flex flex-col gap-6">
          {/* Contract reminder banner */}
          {data.contract && <ContractBanner contract={data.contract} />}

          {/* Current tariff */}
          {data.activeVersion && (
            <CurrentTariffCard
              version={data.activeVersion}
              supplierName={data.plan!.supplierName}
              planName={data.plan!.planName}
              isExportEnabled={data.plan!.isExportEnabled}
            />
          )}

          {/* Version history */}
          {data.allVersions.length > 0 && (
            <VersionTimeline versions={data.allVersions} />
          )}

          {/* Info note */}
          <div className="flex items-start gap-2.5 rounded-2xl border border-slate-800/60 bg-slate-900/30 px-4 py-3.5">
            <Info size={13} className="mt-0.5 shrink-0 text-slate-500" />
            <p className="text-xs text-slate-500 leading-relaxed">
              Editing a tariff version will trigger a recalculation of all historical cost and savings
              figures that fall within that version's date range. This may take a few moments.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
