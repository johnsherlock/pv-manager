export type TrustState = 'fresh' | 'stale' | 'warning' | 'disconnected';

export interface TrendPoint {
  time: string;
  generation: number;
  consumption: number;
  import: number;
  export: number;
}

export interface LiveScreenData {
  trustState: TrustState;
  freshnessLabel: string;
  showWarningBanner: boolean;
  warningMessage?: string;
  warningCta?: { label: string; href: string };
  metrics: {
    generation: number;
    consumption: number;
    import: number;
    export: number;
    unit: 'W' | 'kW';
  };
  coveragePercent: number;
  trendData: TrendPoint[];
  todayTotals: {
    generated: number;
    consumed: number;
    imported: number;
    exported: number;
  };
  efficiencyPercent?: number;
  notes?: string[];
  providerError?: string;
}

// Shared 30-minute rolling trend data (healthy baseline)
const healthyTrend: TrendPoint[] = [
  { time: '13:00', generation: 2.8, consumption: 1.1, import: 0.0, export: 1.7 },
  { time: '13:05', generation: 2.9, consumption: 1.2, import: 0.0, export: 1.7 },
  { time: '13:10', generation: 3.1, consumption: 1.0, import: 0.0, export: 2.1 },
  { time: '13:15', generation: 3.2, consumption: 1.3, import: 0.0, export: 1.9 },
  { time: '13:20', generation: 3.0, consumption: 1.4, import: 0.0, export: 1.6 },
  { time: '13:25', generation: 2.7, consumption: 1.5, import: 0.0, export: 1.2 },
  { time: '13:30', generation: 2.5, consumption: 1.8, import: 0.0, export: 0.7 },
  { time: '13:35', generation: 2.6, consumption: 2.0, import: 0.0, export: 0.6 },
  { time: '13:40', generation: 2.8, consumption: 1.6, import: 0.0, export: 1.2 },
  { time: '13:45', generation: 3.0, consumption: 1.4, import: 0.0, export: 1.6 },
  { time: '13:50', generation: 3.1, consumption: 1.2, import: 0.0, export: 1.9 },
  { time: '13:55', generation: 2.9, consumption: 0.9, import: 0.0, export: 2.0 },
  { time: '14:00', generation: 2.8, consumption: 1.0, import: 0.0, export: 1.8 },
  { time: '14:05', generation: 2.1, consumption: 1.1, import: 0.3, export: 0.9 },
  { time: '14:10', generation: 2.3, consumption: 1.2, import: 0.1, export: 1.0 },
  { time: '14:15', generation: 2.6, consumption: 1.4, import: 0.0, export: 1.2 },
  { time: '14:20', generation: 2.8, consumption: 1.5, import: 0.0, export: 1.3 },
  { time: '14:25', generation: 2.9, consumption: 0.9, import: 0.0, export: 2.0 },
  { time: '14:30', generation: 2.1, consumption: 1.0, import: 0.3, export: 1.1 },
];

export const healthyState: LiveScreenData = {
  trustState: 'fresh',
  freshnessLabel: 'Updated 12 seconds ago',
  showWarningBanner: false,
  metrics: {
    generation: 2140,
    consumption: 920,
    import: 0,
    export: 810,
    unit: 'W',
  },
  coveragePercent: 100,
  trendData: healthyTrend,
  todayTotals: {
    generated: 14.2,
    consumed: 9.8,
    imported: 0.4,
    exported: 4.8,
  },
  efficiencyPercent: 78,
  notes: ["Today's totals are still accumulating — check back after midnight for the full day."],
};

export const staleState: LiveScreenData = {
  trustState: 'stale',
  freshnessLabel: 'Last seen 22 minutes ago',
  showWarningBanner: true,
  warningMessage: 'Live data is delayed — your system was last seen 22 minutes ago. Historical summaries remain accurate.',
  warningCta: { label: 'Review Data Health', href: '#' },
  metrics: {
    generation: 2140,
    consumption: 920,
    import: 0,
    export: 810,
    unit: 'W',
  },
  coveragePercent: 100,
  trendData: healthyTrend,
  todayTotals: {
    generated: 14.2,
    consumed: 9.8,
    imported: 0.4,
    exported: 4.8,
  },
  // efficiencyPercent intentionally omitted — tests silent omission in stale state
  notes: ['Data may not reflect your system\'s current state.'],
};

export const warningState: LiveScreenData = {
  trustState: 'disconnected',
  freshnessLabel: 'Last seen 3 hours ago',
  showWarningBanner: false, // replaced by full-screen error card
  metrics: {
    generation: 0,
    consumption: 0,
    import: 0,
    export: 0,
    unit: 'W',
  },
  coveragePercent: 0,
  trendData: [],
  todayTotals: {
    generated: 14.2,
    consumed: 9.8,
    imported: 0.4,
    exported: 4.8,
  },
  providerError: 'MyEnergi is not responding. Credentials may have expired or the service may be temporarily unavailable.',
  // efficiencyPercent intentionally omitted
};
