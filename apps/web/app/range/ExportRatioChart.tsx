'use client';

import { useEffect, useMemo, useRef } from 'react';
import * as echarts from 'echarts';
import type EChartsReact from 'echarts-for-react';
import { EChart } from '@/src/live/EChartsWrapper';
import { buildExportRatioOption } from '@/src/range/rangeChartOptions';
import type { RangeSeriesDay } from '@/src/range/types';

const CHART_GROUP = 'range-history';

type Props = {
  series: RangeSeriesDay[];
};

export function ExportRatioChart({ series }: Props) {
  const chartRef = useRef<EChartsReact>(null);
  const option = useMemo(() => buildExportRatioOption(series), [series]);

  useEffect(() => {
    const instance = chartRef.current?.getEchartsInstance();
    if (!instance) return;
    instance.group = CHART_GROUP;
    echarts.connect(CHART_GROUP);
  }, []);

  return (
    <EChart
      ref={chartRef}
      option={option}
      notMerge
      style={{ width: '100%', height: 'clamp(200px, 24vw, 260px)' }}
    />
  );
}
