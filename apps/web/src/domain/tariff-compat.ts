/**
 * Compatibility helpers for migrating simple-window tariff data to the
 * schedule-based model.
 *
 * The simple-window model stored up to three named time windows per tariff
 * version (night, peak, and an implicit day window for everything else). The
 * schedule-based model lets users define any number of price periods and
 * assign them freely to a 7-day × 48-half-hour grid.
 *
 * These helpers synthesise a { periods, schedule } pair from existing
 * simple-window fields so that the billing engine can treat old data uniformly.
 * They are also the reference for how common real-world tariff shapes map to
 * the new model:
 *
 *   - Flat rate     → 1 period, all 336 slots point to it
 *   - Day / Night   → 2 periods, night-window slots point to Night period
 *   - Day/Night/Peak→ 3 periods, peak-window slots take priority over night
 *   - EV window     → add an extra low-rate period for specific overnight slots
 *   - Free hours    → add a period with isFreeImport:true for the offer slots
 *
 * There is no fixed limit on the number of periods per version.
 */

import { inWindow, type TariffPricePeriod, type TariffVersion, type WeeklySchedule } from './billing';

/**
 * Derive a deterministic UUID-v5-like hex string from a tariff version ID and
 * a period label. The result is valid UUID format so it can be safely used as a
 * primary key if the caller chooses to persist the synthesised periods.
 *
 * The implementation is a simple but collision-resistant hash — not a true
 * RFC 4122 UUID. For in-memory billing use this is sufficient; for actual DB
 * insertion callers should verify uniqueness or replace with real UUIDs.
 */
function deterministicId(versionId: string, label: string): string {
  // XOR-fold a djb2-style hash to fill a 32-hex UUID-shaped string
  const src = `${versionId}:${label}`;
  let h1 = 0x9e3779b9;
  let h2 = 0x6c62272e;
  for (let i = 0; i < src.length; i++) {
    const c = src.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 0x5bd1e995);
    h2 = Math.imul(h2 ^ c, 0x9e3779b1);
  }
  h1 ^= h2 >>> 13; h2 ^= h1 >>> 11;
  const p = (n: number) => (n >>> 0).toString(16).padStart(8, '0');
  // Shape: 8-4-4-4-12 hex chars
  const a = p(h1), b = p(h2 >>> 0);
  return `${a.slice(0,8)}-${b.slice(0,4)}-4${b.slice(5,8)}-${(0x80 | (h1 >>> 24) & 0x3f).toString(16).padStart(2,'0')}${a.slice(2,6)}-${b}${a.slice(0,4)}`;
}

/**
 * Synthesise TariffPricePeriod records and a WeeklySchedule from the simple
 * night/peak window fields on a TariffVersion.
 *
 * The resulting schedule applies uniformly across all 7 days — the simple
 * window model had no weekday/weekend distinction.
 *
 * @param tariff  A TariffVersion with optional night/peak window fields.
 * @returns       { periods, schedule } ready for use in the schedule-based
 *                billing functions.
 */
export function migrateWindowsToSchedule(tariff: TariffVersion): {
  periods: TariffPricePeriod[];
  schedule: WeeklySchedule;
} {
  // Deterministic IDs keyed on the version ID so they are stable across calls
  // and unique per version. UUID-format so they are safe to persist if needed.
  const dayId   = deterministicId(tariff.id, 'Day');
  const nightId = deterministicId(tariff.id, 'Night');
  const peakId  = deterministicId(tariff.id, 'Peak');

  const base: Omit<TariffPricePeriod, 'id' | 'periodLabel' | 'ratePerKwh' | 'isFreeImport' | 'sortOrder'> = {
    tariffPlanVersionId: tariff.id,
  };

  const dayPeriod: TariffPricePeriod = {
    ...base,
    id: dayId,
    periodLabel: 'Day',
    ratePerKwh: tariff.dayRate,
    isFreeImport: false,
    sortOrder: 0,
  };

  const periods: TariffPricePeriod[] = [dayPeriod];

  const nightPeriod: TariffPricePeriod | null =
    tariff.nightRate != null && tariff.nightStartLocalTime && tariff.nightEndLocalTime
      ? {
          ...base,
          id: nightId,
          periodLabel: 'Night',
          ratePerKwh: tariff.nightRate,
          isFreeImport: false,
          sortOrder: 1,
        }
      : null;

  if (nightPeriod) periods.push(nightPeriod);

  const peakPeriod: TariffPricePeriod | null =
    tariff.peakRate != null && tariff.peakStartLocalTime && tariff.peakEndLocalTime
      ? {
          ...base,
          id: peakId,
          periodLabel: 'Peak',
          ratePerKwh: tariff.peakRate,
          isFreeImport: false,
          sortOrder: 2,
        }
      : null;

  if (peakPeriod) periods.push(peakPeriod);

  // Build a 336-slot schedule.
  // Slot index = dayIndex * 48 + slotIndex (dayIndex 0=Mon…6=Sun)
  // Priority: peak > night > day (matches the original getTariffRateForInterval logic)
  const schedule: WeeklySchedule = [];

  for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
    for (let slotIndex = 0; slotIndex < 48; slotIndex++) {
      const totalMinutes = slotIndex * 30;
      const hh = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
      const mm = String(totalMinutes % 60).padStart(2, '0');
      const slotTime = `${hh}:${mm}`;

      if (peakPeriod && inWindow(slotTime, tariff.peakStartLocalTime, tariff.peakEndLocalTime)) {
        schedule.push(peakId);
      } else if (nightPeriod && inWindow(slotTime, tariff.nightStartLocalTime, tariff.nightEndLocalTime)) {
        schedule.push(nightId);
      } else {
        schedule.push(dayId);
      }
    }
  }

  return { periods, schedule };
}
