'use client';

import { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Label,
} from 'recharts';
import { cn } from '@/lib/utils';
import type { TrendPoint } from '../mock-data';

interface LiveTrendChartProps {
  data: TrendPoint[];
  stale?: boolean;
}

type Resolution = '5min' | '15min';

const COLORS = {
  generation: '#0d6b57',
  consumption: '#374151',
  import: '#9ca3af',
  export: '#059669',
};

export function LiveTrendChart({ data, stale }: LiveTrendChartProps) {
  const [resolution, setResolution] = useState<Resolution>('5min');

  const displayData =
    resolution === '15min'
      ? data.filter((_, i) => i % 3 === 0)
      : data;

  return (
    <div className="rounded-2xl border border-border bg-surface-raised p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-on-surface">
          Live trend
          {stale && <span className="ml-2 text-xs font-normal text-warning">(delayed)</span>}
        </h3>
        <div className="flex rounded-lg border border-border text-xs">
          {(['5min', '15min'] as Resolution[]).map((r) => (
            <button
              key={r}
              onClick={() => setResolution(r)}
              className={cn(
                'px-2.5 py-1 transition-colors first:rounded-l-lg last:rounded-r-lg',
                resolution === r
                  ? 'bg-on-surface text-surface'
                  : 'text-on-surface-muted hover:bg-surface-inset',
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {data.length === 0 ? (
        <div className="flex h-40 items-center justify-center text-sm text-on-surface-muted">
          No data available
        </div>
      ) : (
        <div className={cn('transition-opacity', stale ? 'opacity-40' : 'opacity-100')}>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={displayData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                {Object.entries(COLORS).map(([key, color]) => (
                  <linearGradient key={key} id={`grad-${key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(31,42,42,0.08)" vertical={false} />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 11, fill: '#596868' }}
                axisLine={false}
                tickLine={false}
              >
                {stale && (
                  <Label
                    value="Data delayed"
                    position="insideRight"
                    offset={-4}
                    style={{ fontSize: 10, fill: '#b45309' }}
                  />
                )}
              </XAxis>
              <YAxis
                tick={{ fontSize: 11, fill: '#596868' }}
                axisLine={false}
                tickLine={false}
                unit=" kW"
              />
              <Tooltip
                contentStyle={{
                  background: 'rgba(255,252,245,0.95)',
                  border: '1px solid rgba(31,42,42,0.12)',
                  borderRadius: 8,
                  fontSize: 12,
                }}
                labelStyle={{ color: '#1f2a2a', fontWeight: 600, marginBottom: 4 }}
              />
              <Area
                type="monotone"
                dataKey="generation"
                name="Generation"
                stroke={COLORS.generation}
                fill={`url(#grad-generation)`}
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="consumption"
                name="Consumption"
                stroke={COLORS.consumption}
                fill={`url(#grad-consumption)`}
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="import"
                name="Import"
                stroke={COLORS.import}
                fill={`url(#grad-import)`}
                strokeWidth={1.5}
                strokeDasharray="4 2"
              />
              <Area
                type="monotone"
                dataKey="export"
                name="Export"
                stroke={COLORS.export}
                fill={`url(#grad-export)`}
                strokeWidth={1.5}
              />
            </AreaChart>
          </ResponsiveContainer>
          <div className="mt-3 flex flex-wrap gap-3">
            {[
              { key: 'generation', label: 'Generation' },
              { key: 'consumption', label: 'Consumption' },
              { key: 'import', label: 'Import' },
              { key: 'export', label: 'Export' },
            ].map(({ key, label }) => (
              <span key={key} className="flex items-center gap-1 text-xs text-on-surface-muted">
                <span
                  className="inline-block h-2 w-4 rounded-full"
                  style={{ background: COLORS[key as keyof typeof COLORS] }}
                />
                {label}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
