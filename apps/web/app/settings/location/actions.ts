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

// Resolved but not yet saved — passed back to the client for confirmation.
export type ResolvedLocationPreview = {
  rawInput: string;
  displayName: string;
  latitude: number;
  longitude: number;
  precisionMode: 'exact' | 'approximate';
  countryCode: string | undefined;
  locality: string | undefined;
  geocoderProvider: string;
};

export type ResolveLocationResult =
  | { ok: true; preview: ResolvedLocationPreview }
  | { ok: false; error: string };

export type SaveLocationResult =
  | { ok: true }
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
// Step 1: Geocode only — no DB write
// ---------------------------------------------------------------------------

export async function resolveLocation(input: LocationInput): Promise<ResolveLocationResult> {
  const session = await getSession();
  if (!session?.userId || session.status !== UserStatus.Approved) {
    return { ok: false, error: 'Not authorised.' };
  }

  const rawInput = input.rawInput.trim();
  if (!rawInput) return { ok: false, error: 'Please enter a location.' };
  if (input.precisionMode !== 'exact' && input.precisionMode !== 'approximate') {
    return { ok: false, error: 'Invalid precision mode.' };
  }

  const result = await geocodeLocation(rawInput, input.precisionMode);
  if (!result.ok) return result;

  const { location } = result;
  return {
    ok: true,
    preview: {
      rawInput,
      displayName: location.displayName,
      latitude: location.latitude,
      longitude: location.longitude,
      precisionMode: location.precisionMode,
      countryCode: location.countryCode,
      locality: location.locality,
      geocoderProvider: location.geocoderProvider,
    },
  };
}

// ---------------------------------------------------------------------------
// Step 2: Persist a confirmed preview
// ---------------------------------------------------------------------------

export async function saveLocation(preview: ResolvedLocationPreview): Promise<SaveLocationResult> {
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
      locationRawInput: preview.rawInput,
      locationDisplayName: preview.displayName,
      locationLatitude: String(preview.latitude),
      locationLongitude: String(preview.longitude),
      locationPrecisionMode: preview.precisionMode,
      locationCountryCode: preview.countryCode ?? null,
      locationLocality: preview.locality ?? null,
      locationGeocodedAt: new Date(),
      locationGeocoderProvider: preview.geocoderProvider,
      updatedAt: new Date(),
    })
    .where(eq(installations.id, installationId));

  return { ok: true };
}

// ---------------------------------------------------------------------------
// Clear
// ---------------------------------------------------------------------------

export type ClearLocationResult = { ok: true } | { ok: false; error: string };

export async function clearLocation(): Promise<ClearLocationResult> {
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

  return { ok: true };
}
