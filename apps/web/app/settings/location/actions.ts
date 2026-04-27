'use server';

import { eq } from 'drizzle-orm';
import { getSession } from '@/src/auth-helpers';
import { resolveEffectiveInstallationId } from '@/src/installation-helpers';
import { UserStatus } from '@/src/user-constants';
import { geocodeLocation } from '@/src/location/geocoder';

export type LocationInput = {
  rawInput: string;
  precisionMode: 'exact' | 'approximate';
};

export type LocationResult =
  | { ok: true; displayName: string }
  | { ok: false; error: string };

// ---------------------------------------------------------------------------
// Lazy DB deps
// ---------------------------------------------------------------------------

type DbModule = typeof import('@/src/db/client');
type SchemaModule = typeof import('@/src/db/schema');

let _deps: Promise<{
  db: DbModule['db'];
  installations: SchemaModule['installations'];
}> | null = null;

async function getDeps() {
  if (!_deps) {
    _deps = Promise.all([import('@/src/db/client'), import('@/src/db/schema')]).then(
      ([client, schema]) => ({ db: client.db, installations: schema.installations }),
    );
  }
  return _deps;
}

// ---------------------------------------------------------------------------
// Save (geocode + persist)
// ---------------------------------------------------------------------------

export async function saveLocation(input: LocationInput): Promise<LocationResult> {
  const session = await getSession();
  if (!session?.userId || session.status !== UserStatus.Approved) {
    return { ok: false, error: 'Not authorised.' };
  }

  const rawInput = input.rawInput.trim();
  if (!rawInput) {
    return { ok: false, error: 'Please enter a location.' };
  }
  if (input.precisionMode !== 'exact' && input.precisionMode !== 'approximate') {
    return { ok: false, error: 'Invalid precision mode.' };
  }

  const installationId = await resolveEffectiveInstallationId();
  if (!installationId) return { ok: false, error: 'No installation found.' };

  const geocodeResult = await geocodeLocation(rawInput, input.precisionMode);
  if (!geocodeResult.ok) {
    return { ok: false, error: geocodeResult.error };
  }

  const { location } = geocodeResult;
  const { db, installations } = await getDeps();

  await db
    .update(installations)
    .set({
      locationRawInput: rawInput,
      locationDisplayName: location.displayName,
      locationLatitude: String(location.latitude),
      locationLongitude: String(location.longitude),
      locationPrecisionMode: location.precisionMode,
      locationCountryCode: location.countryCode ?? null,
      locationLocality: location.locality ?? null,
      locationGeocodedAt: new Date(),
      locationGeocoderProvider: location.geocoderProvider,
      updatedAt: new Date(),
    })
    .where(eq(installations.id, installationId));

  return { ok: true, displayName: location.displayName };
}

// ---------------------------------------------------------------------------
// Clear
// ---------------------------------------------------------------------------

export async function clearLocation(): Promise<LocationResult> {
  const session = await getSession();
  if (!session?.userId || session.status !== UserStatus.Approved) {
    return { ok: false, error: 'Not authorised.' };
  }

  const installationId = await resolveEffectiveInstallationId();
  if (!installationId) return { ok: false, error: 'No installation found.' };

  const { db, installations } = await getDeps();

  await db
    .update(installations)
    .set({
      locationRawInput: null,
      locationDisplayName: null,
      locationLatitude: null,
      locationLongitude: null,
      locationPrecisionMode: null,
      locationCountryCode: null,
      locationLocality: null,
      locationGeocodedAt: null,
      locationGeocoderProvider: null,
      updatedAt: new Date(),
    })
    .where(eq(installations.id, installationId));

  return { ok: true, displayName: '' };
}
