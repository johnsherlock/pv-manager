'use client';

import { useMemo } from 'react';
import { EChart } from '@/src/live/EChartsWrapper';
import { buildPeriodCostDonutOption, type PeriodCostTotals } from '@/src/range/rangeChartOptions';

type Props = {
  totals: PeriodCostTotals;
  simplified: boolean;
  currency: string;
};

export function PeriodCostDonutChart({ totals, simplified, currency }: Props) {
  const option = useMemo(() => buildPeriodCostDonutOption(totals, currency), [totals, currency]);

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-IE', { style: 'currency', currency, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

  const { importCost, fixedCharges, exportCredit = 0, savings = 0, freeImportValue = 0, freeImportKwh = 0, avgPaidRate = 0 } = totals;
  const netBill = importCost + fixedCharges - exportCredit;
  const hasExport = exportCredit > 0;
  const hasSavings = savings > 0;
  const hasFreeImport = freeImportValue > 0;

  return (
    <div className="space-y-2">
      {simplified && (
        <p className="text-[10px] text-slate-500">
          Import costs estimated at day rate (time-of-use data not available for this period)
        </p>
      )}
      <EChart
        option={option}
        notMerge
        style={{ width: '100%', height: 'clamp(200px, 26vw, 260px)' }}
      />

      {/* Offsets summary — shows what reduced the gross bill */}
      {(hasExport || hasSavings || hasFreeImport) && (
        <div className="border-t border-slate-800/60 pt-3 space-y-1.5 text-[11px]">
          {hasExport && (
            <div className="flex items-baseline justify-between">
              <span className="text-slate-400">
                Net bill <span className="text-slate-600">(after −{fmt(exportCredit)} export credit)</span>
              </span>
              <span className="font-mono text-slate-300">{fmt(netBill)}</span>
            </div>
          )}
          {(hasSavings || hasFreeImport) && (
            <div className="flex items-baseline justify-between">
              <span className="text-slate-500">
                Est. savings vs without solar
                {hasSavings && <span className="ml-1 text-indigo-300/70">solar {fmt(savings)}</span>}
                {hasFreeImport && (
                  <span
                    className="ml-1 text-teal-400/70"
                    title={`${freeImportKwh.toFixed(2)} kWh at zero tariff rate, valued at avg. paid rate ${avgPaidRate.toFixed(4)}/kWh`}
                  >
                    free import ~{fmt(freeImportValue)}
                  </span>
                )}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
