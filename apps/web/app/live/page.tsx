import { fetchMinuteData } from '@/src/providers/v1/adapter';
import { buildDayDetail } from '@/src/live/normalizer';
import {
  loadInstallationContext,
  loadTariffContext,
  computeFinancialEstimate,
  deriveScreenState,
  getMinutesStale,
  getLastReadingLocalTime,
  getCurrentMetrics,
  minuteDataToFiveMinPoints,
  periodDataToChartPoints,
} from '@/src/live/loader';
import { LiveScreen } from './LiveScreen';

export const dynamic = 'force-dynamic';

// ---------------------------------------------------------------------------
// Single-user seed path — no auth or user selection for the local-dev slice.
// ---------------------------------------------------------------------------
const SEED_INSTALLATION_ID = '00000000-0000-0000-0000-000000000002';

function getTodayLocalDate(): string {
  // Returns "YYYY-MM-DD" in the installation timezone.
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Dublin',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

function formatDisplayDate(isoDate: string): string {
  return new Intl.DateTimeFormat('en-IE', {
    timeZone: 'Europe/Dublin',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${isoDate}T12:00:00`));
}

export const metadata = {
  title: 'Live — PV Manager',
  description: 'Real-time solar system status',
};

export default async function LivePage() {
  const now = new Date();
  const today = getTodayLocalDate();
  const fetchedAt = now.toISOString();

  // Load installation context and tariff in parallel with the provider fetch.
  const [installationContext, tariffContext, minuteData] = await Promise.all([
    loadInstallationContext(SEED_INSTALLATION_ID),
    loadTariffContext(SEED_INSTALLATION_ID, today),
    fetchMinuteData(today),
  ]);

  // Build the normalised day-detail from raw minute readings.
  const dayDetail = buildDayDetail(today, minuteData, fetchedAt);
  const installationTimezone = installationContext?.timezone ?? 'Europe/Dublin';

  // Derive screen state from health signals and freshness.
  const screenState = deriveScreenState(dayDetail.health, minuteData, now, installationTimezone);

  // Current instantaneous metrics from the most recent reading.
  const currentMetrics = getCurrentMetrics(minuteData);

  // Financial estimate is only meaningful when tariff context is present
  // and we have some data to compute against.
  const financialEstimate =
    tariffContext && screenState !== 'disconnected'
      ? computeFinancialEstimate(dayDetail.summary, tariffContext)
      : null;

  // Pre-compute chart data at all three resolutions so the client can
  // switch resolution without a server round-trip.
  const fiveMinChartData = minuteDataToFiveMinPoints(minuteData);
  const halfHourChartData = periodDataToChartPoints(dayDetail.halfHourData, 30);
  const hourChartData = periodDataToChartPoints(dayDetail.hourData, 60);

  const todayTotals =
    screenState !== 'disconnected'
      ? {
          generatedKwh: dayDetail.summary.totalGeneratedKwh,
          consumedKwh: dayDetail.summary.totalConsumedKwh,
          importKwh: dayDetail.summary.totalImportKwh,
          exportKwh: dayDetail.summary.totalExportKwh,
        }
      : null;

  return (
    <LiveScreen
      today={today}
      displayDate={formatDisplayDate(today)}
      installationContext={installationContext ? { name: installationContext.name } : null}
      screenState={screenState}
      health={{
        minutesStale: getMinutesStale(minuteData, now, installationTimezone),
        lastReadingLocalTime: getLastReadingLocalTime(minuteData),
      }}
      hasTariff={tariffContext !== null}
      hasCoordinates={false}
      hasCapacity={false}
      currentMetrics={currentMetrics}
      fiveMinChartData={fiveMinChartData}
      halfHourChartData={halfHourChartData}
      hourChartData={hourChartData}
      todayTotals={todayTotals}
      financialEstimate={financialEstimate}
    />
  );
}
