import { RefreshCw, WifiOff } from 'lucide-react';
import Link from 'next/link';
import { healthyState, staleState, warningState } from './mock-data';
import { StateSelector } from './_components/StateSelector';
import { TrustBadge } from './_components/TrustBadge';
import { WarningBanner } from './_components/WarningBanner';
import { MetricCard } from './_components/MetricCard';
import { SolarCoverageBar } from './_components/SolarCoverageBar';
import { LiveTrendChart } from './_components/LiveTrendChart';
import { CurrentDayTotals } from './_components/CurrentDayTotals';
import { NotesPanel } from './_components/NotesPanel';

type PrototypeState = 'healthy' | 'stale' | 'warning';

const stateMap = {
  healthy: healthyState,
  stale: staleState,
  warning: warningState,
} as const;

interface PageProps {
  searchParams: Promise<{ state?: string }>;
}

export default async function LivePrototypePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const stateKey = (params.state ?? 'healthy') as PrototypeState;
  const data = stateMap[stateKey] ?? healthyState;

  const isStale = data.trustState === 'stale';
  const isDisconnected = data.trustState === 'disconnected';

  return (
    <div className="min-h-screen bg-surface font-sans text-on-surface">
      {/* Prototype chrome */}
      <StateSelector currentState={stateKey} />

      {/* Nav bar */}
      <header className="flex items-center justify-between border-b border-border bg-surface-raised px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <h1 className="text-base font-semibold">Live</h1>
          {!isDisconnected && (
            <span className="flex items-center gap-1 text-xs text-on-surface-muted">
              <RefreshCw size={11} className={isStale ? '' : 'animate-spin'} />
              {isStale ? 'Paused' : 'Auto-refreshing'}
            </span>
          )}
        </div>
        <TrustBadge trustState={data.trustState} freshnessLabel={data.freshnessLabel} />
      </header>

      {/* Warning banner */}
      {data.showWarningBanner && data.warningMessage && (
        <WarningBanner message={data.warningMessage} cta={data.warningCta} />
      )}

      {/* Provider disconnected state */}
      {isDisconnected ? (
        <main className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
          <div className="rounded-2xl border border-destructive/20 bg-red-50 p-8">
            <WifiOff size={32} className="mx-auto mb-4 text-destructive" />
            <h2 className="mb-2 text-lg font-semibold text-destructive">Provider disconnected</h2>
            <p className="mb-6 text-sm text-on-surface-muted">{data.providerError}</p>
            <div className="flex justify-center gap-3">
              <Link
                href="#"
                className="rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-white hover:bg-destructive/90"
              >
                Reconnect
              </Link>
              <Link
                href="#"
                className="rounded-lg border border-border bg-surface-raised px-4 py-2 text-sm font-medium text-on-surface hover:bg-surface-inset"
              >
                Troubleshoot →
              </Link>
            </div>
          </div>
          {/* Today's totals still shown even when disconnected */}
          <div className="mt-8 text-left">
            <CurrentDayTotals totals={data.todayTotals} />
          </div>
        </main>
      ) : (
        <main className="mx-auto max-w-5xl space-y-4 px-4 py-4 sm:px-6 sm:py-6">
          {/* Current metrics row — 4 columns on desktop, 2x2 on mobile */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MetricCard
              label="Generation"
              value={data.metrics.generation}
              unit={data.metrics.unit}
              supportText="from panels"
              stale={isStale}
              colorClass="text-brand-primary"
            />
            <MetricCard
              label="Consumption"
              value={data.metrics.consumption}
              unit={data.metrics.unit}
              supportText="home using now"
              stale={isStale}
              colorClass="text-on-surface"
            />
            <MetricCard
              label="Import"
              value={data.metrics.import}
              unit={data.metrics.unit}
              supportText="from grid"
              stale={isStale}
              colorClass="text-neutral"
            />
            <MetricCard
              label="Export"
              value={data.metrics.export}
              unit={data.metrics.unit}
              supportText="to grid"
              stale={isStale}
              colorClass="text-positive"
            />
          </div>

          {/* Solar coverage bar */}
          <SolarCoverageBar coveragePercent={data.coveragePercent} stale={isStale} />

          {/* Live trend chart */}
          <LiveTrendChart data={data.trendData} stale={isStale} />

          {/* Secondary row — today totals + notes */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <CurrentDayTotals totals={data.todayTotals} />
            <NotesPanel
              efficiencyPercent={data.efficiencyPercent}
              notes={data.notes}
            />
          </div>
        </main>
      )}
    </div>
  );
}
