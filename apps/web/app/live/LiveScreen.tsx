'use client';

import { use, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  RefreshCw,
  AlertTriangle,
  WifiOff,
  CheckCircle2,
  Clock,
  Zap,
  Home,
  ArrowDownToLine,
  ArrowUpFromLine,
  ChevronRight,
  Activity,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type ScreenState = 'healthy' | 'stale' | 'warning' | 'disconnected';

// ─── Mock data ────────────────────────────────────────────────────────────────

function generateChartData(state: ScreenState) {
  // 30-minute rolling window, one point per 5 minutes = 6 points
  const labels = ['11:00', '11:05', '11:10', '11:15', '11:20', '11:25', '11:30'];
  const base = [
    { gen: 2.1, cons: 0.9, imp: 0.1, exp: 1.2 },
    { gen: 2.3, cons: 1.0, imp: 0.0, exp: 1.3 },
    { gen: 2.4, cons: 0.8, imp: 0.0, exp: 1.6 },
    { gen: 2.2, cons: 1.1, imp: 0.2, exp: 1.1 },
    { gen: 2.1, cons: 0.9, imp: 0.1, exp: 1.2 },
    { gen: 2.3, cons: 1.0, imp: 0.0, exp: 1.3 },
    { gen: 2.1, cons: 0.9, imp: 0.1, exp: 1.2 },
  ];

  if (state === 'stale' || state === 'warning') {
    // Only show data up to 5th point, last two are absent
    return labels.slice(0, 5).map((t, i) => ({
      time: t,
      generation: base[i].gen,
      consumption: base[i].cons,
      import: base[i].imp,
      export: base[i].exp,
    }));
  }
  if (state === 'disconnected') {
    return [];
  }
  return labels.map((t, i) => ({
    time: t,
    generation: base[i].gen,
    consumption: base[i].cons,
    import: base[i].imp,
    export: base[i].exp,
  }));
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function PrototypeSwitcher({
  current,
  onChange,
}: {
  current: ScreenState;
  onChange: (s: ScreenState) => void;
}) {
  const states: { id: ScreenState; label: string }[] = [
    { id: 'healthy', label: 'Healthy' },
    { id: 'stale', label: 'Stale data' },
    { id: 'warning', label: 'Warning' },
    { id: 'disconnected', label: 'Disconnected' },
  ];
  return (
    <div className="bg-slate-800 text-slate-200 px-4 py-2 flex items-center gap-3 text-xs font-medium flex-wrap">
      <span className="text-slate-400 uppercase tracking-widest text-[10px]">
        Prototype state:
      </span>
      {states.map((s) => (
        <button
          key={s.id}
          onClick={() => onChange(s.id)}
          className={`px-3 py-1 rounded-full border transition-colors ${
            current === s.id
              ? 'bg-amber-500 border-amber-500 text-white'
              : 'border-slate-600 text-slate-300 hover:border-slate-400'
          }`}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}

function TrustBadge({ state }: { state: ScreenState }) {
  const configs: Record<
    ScreenState,
    { icon: React.ReactNode; label: string; className: string }
  > = {
    healthy: {
      icon: <CheckCircle2 size={13} />,
      label: 'Updated 12 seconds ago',
      className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    stale: {
      icon: <Clock size={13} />,
      label: 'Last seen 18 minutes ago',
      className: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    warning: {
      icon: <AlertTriangle size={13} />,
      label: 'Suspicious data — last seen 3 minutes ago',
      className: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    disconnected: {
      icon: <WifiOff size={13} />,
      label: 'Provider disconnected',
      className: 'bg-red-50 text-red-700 border-red-200',
    },
  };
  const { icon, label, className } = configs[state];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${className}`}
    >
      {icon}
      {label}
    </span>
  );
}

function WarningBanner({
  state,
  onDataHealth,
}: {
  state: ScreenState;
  onDataHealth: () => void;
}) {
  if (state === 'healthy') return null;

  const messages: Partial<Record<ScreenState, string>> = {
    stale:
      'Live data is delayed. Your system was last seen 18 minutes ago.',
    warning:
      'Some readings look unusually high. This may be a provider reporting issue.',
    disconnected:
      'MyEnergi is not connected. Credentials may have expired.',
  };

  const msg = messages[state];
  if (!msg) return null;

  const isDestructive = state === 'disconnected';

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 text-sm border-b ${
        isDestructive
          ? 'bg-red-50 text-red-800 border-red-200'
          : 'bg-amber-50 text-amber-800 border-amber-200'
      }`}
    >
      {isDestructive ? (
        <WifiOff size={16} className="mt-0.5 shrink-0" />
      ) : (
        <AlertTriangle size={16} className="mt-0.5 shrink-0" />
      )}
      <span className="flex-1">{msg}</span>
      <button
        onClick={onDataHealth}
        className={`shrink-0 text-xs font-medium underline underline-offset-2 ${
          isDestructive ? 'text-red-700' : 'text-amber-700'
        }`}
      >
        {isDestructive ? 'Reconnect →' : 'Review Data Health →'}
      </button>
    </div>
  );
}

type MetricCardProps = {
  label: string;
  value: string;
  unit: string;
  caption: string;
  icon: React.ReactNode;
  accentClass: string;
  stale?: boolean;
};

function MetricCard({
  label,
  value,
  unit,
  caption,
  icon,
  accentClass,
  stale,
}: MetricCardProps) {
  return (
    <div
      className={`bg-white rounded-xl p-4 border flex flex-col gap-1 transition-all ${
        stale ? 'opacity-60 border-amber-200' : 'border-gray-100 shadow-sm'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          {label}
        </span>
        <span className={`${accentClass} opacity-70`}>{icon}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className={`text-3xl font-bold tabular-nums ${stale ? 'text-gray-400' : 'text-gray-900'}`}>
          {value}
        </span>
        <span className="text-sm text-gray-400">{unit}</span>
        {stale && <Clock size={12} className="text-amber-500 mb-0.5" />}
      </div>
      <span className="text-xs text-gray-400">{caption}</span>
    </div>
  );
}

function CoverageBar({
  solarPct,
  stale,
}: {
  solarPct: number;
  stale?: boolean;
}) {
  return (
    <div
      className={`bg-white rounded-xl p-4 border ${
        stale ? 'border-amber-200 opacity-70' : 'border-gray-100 shadow-sm'
      }`}
    >
      <div className="flex justify-between text-xs font-medium text-gray-500 mb-2">
        <span>Solar</span>
        <span>Grid</span>
      </div>
      <div className="relative h-3 rounded-full bg-gray-100 overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-amber-400 transition-all duration-500"
          style={{ width: `${solarPct}%` }}
        />
      </div>
      <p className="mt-2 text-sm text-gray-600">
        <span className="font-semibold text-amber-600">{solarPct}%</span> of
        your home is running on solar right now
        {stale && (
          <span className="ml-2 text-xs text-amber-500">(last known)</span>
        )}
      </p>
    </div>
  );
}

const SERIES_COLORS = {
  generation: '#f59e0b',
  consumption: '#6b7280',
  import: '#d1d5db',
  export: '#10b981',
};

function LiveTrendChart({
  data,
  stale,
}: {
  data: ReturnType<typeof generateChartData>;
  stale?: boolean;
}) {
  const [resolution, setResolution] = useState<'5min' | '15min'>('5min');

  return (
    <div
      className={`bg-white rounded-xl border shadow-sm overflow-hidden ${
        stale ? 'border-amber-200' : 'border-gray-100'
      }`}
    >
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <h3 className="text-sm font-semibold text-gray-700">
          Live trend{' '}
          <span className="font-normal text-gray-400">(last 30 min)</span>
        </h3>
        <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs">
          {(['5min', '15min'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setResolution(r)}
              className={`px-2.5 py-1 transition-colors ${
                resolution === r
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-500 hover:bg-gray-50'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {stale && data.length > 0 && (
        <div className="mx-4 mb-2 flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg">
          <Clock size={11} />
          Data delayed — shown up to last available point
        </div>
      )}

      <div className="px-2 pb-4">
        {data.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-sm text-gray-400 bg-gray-50 rounded-lg mx-2">
            No live data available
          </div>
        ) : (
          <div className={stale ? 'opacity-60 saturate-50' : ''}>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart
                data={data}
                margin={{ top: 4, right: 12, left: -8, bottom: 0 }}
              >
                <defs>
                  {Object.entries(SERIES_COLORS).map(([key, color]) => (
                    <linearGradient
                      key={key}
                      id={`grad-${key}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor={color} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={color} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v}kW`}
                />
                <Tooltip
                  contentStyle={{
                    fontSize: 12,
                    borderRadius: 8,
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  }}
                  formatter={(v, name) => [
                    typeof v === 'number' ? `${v.toFixed(2)} kW` : v,
                    typeof name === 'string'
                      ? name.charAt(0).toUpperCase() + name.slice(1)
                      : name,
                  ]}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                  formatter={(v) =>
                    v.charAt(0).toUpperCase() + v.slice(1)
                  }
                />
                <Area
                  type="monotone"
                  dataKey="generation"
                  stroke={SERIES_COLORS.generation}
                  fill={`url(#grad-generation)`}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
                <Area
                  type="monotone"
                  dataKey="consumption"
                  stroke={SERIES_COLORS.consumption}
                  fill={`url(#grad-consumption)`}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
                <Area
                  type="monotone"
                  dataKey="import"
                  stroke={SERIES_COLORS.import}
                  fill={`url(#grad-import)`}
                  strokeWidth={1.5}
                  dot={false}
                  activeDot={{ r: 3 }}
                />
                <Area
                  type="monotone"
                  dataKey="export"
                  stroke={SERIES_COLORS.export}
                  fill={`url(#grad-export)`}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

function TodayTotals({
  stale,
  onViewDay,
}: {
  stale?: boolean;
  onViewDay: () => void;
}) {
  const totals = [
    { label: 'Generated', value: '14.2 kWh', color: 'text-amber-600' },
    { label: 'Consumed', value: '9.8 kWh', color: 'text-gray-600' },
    { label: 'Imported', value: '1.6 kWh', color: 'text-gray-400' },
    { label: 'Exported', value: '4.4 kWh', color: 'text-emerald-600' },
  ];
  return (
    <div
      className={`bg-white rounded-xl p-4 border h-full ${
        stale ? 'border-amber-100' : 'border-gray-100 shadow-sm'
      }`}
    >
      <h3 className="text-sm font-semibold text-gray-700 mb-3">
        Today so far
        {stale && (
          <span className="ml-2 text-xs font-normal text-amber-500">
            (may be incomplete)
          </span>
        )}
      </h3>
      <div className="space-y-2">
        {totals.map(({ label, value, color }) => (
          <div key={label} className="flex justify-between items-baseline">
            <span className="text-sm text-gray-500">{label}</span>
            <span className={`text-sm font-semibold tabular-nums ${color}`}>
              {value}
            </span>
          </div>
        ))}
      </div>
      <button
        onClick={onViewDay}
        className="mt-4 flex items-center gap-1 text-xs font-medium text-amber-600 hover:text-amber-700"
      >
        View full day <ChevronRight size={12} />
      </button>
    </div>
  );
}

function NotesPanel({
  state,
  showEfficiency,
  onDataHealth,
}: {
  state: ScreenState;
  showEfficiency: boolean;
  onDataHealth: () => void;
}) {
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm h-full space-y-3">
      <h3 className="text-sm font-semibold text-gray-700">Notes</h3>

      {state === 'healthy' && (
        <div className="flex items-start gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
          <Activity size={13} className="mt-0.5 shrink-0 text-gray-400" />
          Today&apos;s totals are still accumulating — check back after
          midnight for the full day summary.
        </div>
      )}

      {(state === 'stale' || state === 'warning') && (
        <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2 border border-amber-100">
          <AlertTriangle size={13} className="mt-0.5 shrink-0" />
          <div>
            <span className="font-medium block mb-0.5">
              {state === 'stale' ? 'Data delayed' : 'Suspicious readings'}
            </span>
            {state === 'stale'
              ? 'Live feed has not updated in 18 minutes. Historical summaries remain accurate.'
              : 'One or more interval readings appear unusually high. Provider reporting may be at fault.'}
            <button
              onClick={onDataHealth}
              className="block mt-1 font-medium underline underline-offset-1 text-amber-600"
            >
              Review Data Health →
            </button>
          </div>
        </div>
      )}

      {showEfficiency && state !== 'disconnected' && (
        <div className="text-xs text-gray-500">
          Efficiency:{' '}
          <span className="font-medium text-gray-700">78% of 18 kWp max</span>
        </div>
      )}
    </div>
  );
}

function DisconnectedState({ onReconnect }: { onReconnect: () => void }) {
  return (
    <div className="flex-1 flex items-center justify-center py-16 px-4">
      <div className="max-w-sm text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-50 border border-red-200 flex items-center justify-center mx-auto">
          <WifiOff size={22} className="text-red-500" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-gray-900 mb-1">
            MyEnergi is not connected
          </h2>
          <p className="text-sm text-gray-500">
            Your provider credentials may have expired. Reconnect to resume
            live monitoring.
          </p>
        </div>
        <div className="flex gap-3 justify-center">
          <button
            onClick={onReconnect}
            className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800"
          >
            Reconnect
          </button>
          <button className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">
            Troubleshoot
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Nav bar ─────────────────────────────────────────────────────────────────

function NavBar({
  state,
  onHome,
}: {
  state: ScreenState;
  onHome: () => void;
}) {
  return (
    <header className="flex items-center justify-between px-4 sm:px-6 h-14 bg-white border-b border-gray-100">
      <div className="flex items-center gap-4">
        <button
          onClick={onHome}
          className="text-xs font-medium text-gray-400 hover:text-gray-600 flex items-center gap-1"
        >
          <Home size={14} />
          <span className="hidden sm:inline">Overview</span>
        </button>
        <span className="text-gray-200">/</span>
        <span className="text-sm font-semibold text-gray-900">Live</span>
      </div>

      <div className="flex items-center gap-3">
        {state === 'healthy' && (
          <span className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400">
            <RefreshCw size={11} className="animate-spin" style={{ animationDuration: '3s' }} />
            Auto-refreshing
          </span>
        )}
        <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-xs font-bold text-amber-700">
          J
        </div>
      </div>
    </header>
  );
}

// ─── Root component ───────────────────────────────────────────────────────────

export function LiveScreen({
  searchParams,
}: {
  searchParams: Promise<{ state?: string }>;
}) {
  const params = use(searchParams);
  const initialState = (params.state as ScreenState) ?? 'healthy';

  const [screenState, setScreenState] = useState<ScreenState>(initialState);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  function showToast(msg: string) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  }

  const chartData = generateChartData(screenState);
  const isStale = screenState === 'stale' || screenState === 'warning';
  const isDisconnected = screenState === 'disconnected';

  return (
    <div className="min-h-screen bg-[#f6f2ea] font-sans">
      {/* Prototype chrome */}
      <PrototypeSwitcher current={screenState} onChange={setScreenState} />

      {/* App shell */}
      <div className="flex flex-col min-h-[calc(100vh-40px)]">
        <NavBar state={screenState} onHome={() => showToast('→ Overview (not yet built)')} />

        <WarningBanner
          state={screenState}
          onDataHealth={() => showToast('→ Data Health (not yet built)')}
        />

        {/* Trust strip */}
        <div className="px-4 sm:px-6 py-2.5 border-b border-gray-100 bg-white flex items-center gap-3">
          <TrustBadge state={screenState} />
        </div>

        {/* Main content */}
        <main className="flex-1 px-4 sm:px-6 py-5 max-w-5xl w-full mx-auto space-y-4">
          {isDisconnected ? (
            <DisconnectedState onReconnect={() => showToast('→ Provider reconnect (not yet built)')} />
          ) : (
            <>
              {/* Metrics row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <MetricCard
                  label="Generation"
                  value="2,140"
                  unit="W"
                  caption="↑ from panels"
                  icon={<Zap size={16} />}
                  accentClass="text-amber-500"
                  stale={isStale}
                />
                <MetricCard
                  label="Consumption"
                  value="920"
                  unit="W"
                  caption="home using now"
                  icon={<Home size={16} />}
                  accentClass="text-gray-400"
                  stale={isStale}
                />
                <MetricCard
                  label="Import"
                  value="310"
                  unit="W"
                  caption="from grid"
                  icon={<ArrowDownToLine size={16} />}
                  accentClass="text-gray-300"
                  stale={isStale}
                />
                <MetricCard
                  label="Export"
                  value="810"
                  unit="W"
                  caption="to grid"
                  icon={<ArrowUpFromLine size={16} />}
                  accentClass="text-emerald-400"
                  stale={isStale}
                />
              </div>

              {/* Coverage bar */}
              <CoverageBar solarPct={85} stale={isStale} />

              {/* Live trend chart */}
              <LiveTrendChart data={chartData} stale={isStale} />

              {/* Secondary row: today totals + notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TodayTotals
                  stale={isStale}
                  onViewDay={() => showToast('→ Daily History (not yet built)')}
                />
                <NotesPanel
                  state={screenState}
                  showEfficiency={true}
                  onDataHealth={() => showToast('→ Data Health (not yet built)')}
                />
              </div>
            </>
          )}
        </main>
      </div>

      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-4 py-2.5 rounded-lg shadow-lg z-50 animate-fade-in">
          {toastMsg}
        </div>
      )}
    </div>
  );
}
