export type ResolvedLocation = {
  displayName: string;
  latitude: number;
  longitude: number;
  precisionMode: 'exact' | 'approximate';
  countryCode?: string;
  locality?: string;
  geocoderProvider: string;
};

export type GeocoderResult =
  | { ok: true; location: ResolvedLocation }
  | { ok: false; error: string };

// ---------------------------------------------------------------------------
// Geoapify
// ---------------------------------------------------------------------------

async function geocodeViaGeoapify(
  text: string,
  precisionMode: 'exact' | 'approximate',
  apiKey: string,
): Promise<GeocoderResult> {
  const url = new URL('https://api.geoapify.com/v1/geocode/search');
  url.searchParams.set('text', text);
  url.searchParams.set('limit', '1');
  url.searchParams.set('apiKey', apiKey);

  const res = await fetch(url.toString());
  if (!res.ok) {
    return { ok: false, error: `Geoapify responded with HTTP ${res.status}` };
  }

  const json = (await res.json()) as {
    features?: {
      properties?: {
        lat?: number;
        lon?: number;
        formatted?: string;
        city?: string;
        town?: string;
        county?: string;
        country_code?: string;
      };
    }[];
  };

  const props = json.features?.[0]?.properties;
  if (!props?.lat || !props?.lon) {
    return { ok: false, error: 'Location not found. Try a different search term.' };
  }

  const locality = props.city ?? props.town ?? props.county;
  const displayName =
    precisionMode === 'approximate'
      ? (locality ?? props.formatted ?? text)
      : (props.formatted ?? text);

  return {
    ok: true,
    location: {
      displayName,
      latitude: props.lat,
      longitude: props.lon,
      precisionMode,
      countryCode: props.country_code?.toUpperCase(),
      locality,
      geocoderProvider: 'geoapify',
    },
  };
}

// ---------------------------------------------------------------------------
// Open-Meteo geocoding (fallback — no API key required)
// ---------------------------------------------------------------------------

async function geocodeViaOpenMeteo(
  text: string,
  precisionMode: 'exact' | 'approximate',
): Promise<GeocoderResult> {
  const url = new URL('https://geocoding-api.open-meteo.com/v1/search');
  url.searchParams.set('name', text);
  url.searchParams.set('count', '1');
  url.searchParams.set('language', 'en');
  url.searchParams.set('format', 'json');

  const res = await fetch(url.toString());
  if (!res.ok) {
    return { ok: false, error: `Geocoding service responded with HTTP ${res.status}` };
  }

  const json = (await res.json()) as {
    results?: {
      latitude?: number;
      longitude?: number;
      name?: string;
      country_code?: string;
      admin1?: string;
    }[];
  };

  const result = json.results?.[0];
  if (!result?.latitude || !result?.longitude) {
    return { ok: false, error: 'Location not found. Try a different search term.' };
  }

  const locality = result.name;
  const displayName =
    precisionMode === 'approximate'
      ? (locality ?? text)
      : ([result.name, result.admin1, result.country_code].filter(Boolean).join(', ') || text);

  return {
    ok: true,
    location: {
      displayName,
      latitude: result.latitude,
      longitude: result.longitude,
      precisionMode,
      countryCode: result.country_code?.toUpperCase(),
      locality,
      geocoderProvider: 'open-meteo-geocoding',
    },
  };
}

// ---------------------------------------------------------------------------
// Public API — uses Geoapify if key is set, else Open-Meteo
// ---------------------------------------------------------------------------

export async function geocodeLocation(
  text: string,
  precisionMode: 'exact' | 'approximate',
): Promise<GeocoderResult> {
  const geoapifyKey = process.env.GEOAPIFY_API_KEY;
  if (geoapifyKey) {
    return geocodeViaGeoapify(text, precisionMode, geoapifyKey);
  }
  return geocodeViaOpenMeteo(text, precisionMode);
}
