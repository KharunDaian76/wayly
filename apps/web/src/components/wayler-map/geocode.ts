export type LatLngTuple = [number, number];

const geocodeCache = new Map<string, LatLngTuple | null>();

function buildPlaceQuery(city: string | null, country: string | null): string | null {
  const parts = [city?.trim(), country?.trim()].filter((part) => Boolean(part));
  return parts.length > 0 ? parts.join(', ') : null;
}

/** Geocode a city/country pair via OpenStreetMap Nominatim (frontend-only). */
export async function geocodePlace(
  city: string | null,
  country: string | null,
): Promise<LatLngTuple | null> {
  const query = buildPlaceQuery(city, country);
  if (!query) {
    return null;
  }

  const cacheKey = query.toLowerCase();
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey) ?? null;
  }

  try {
    const url = new URL('https://nominatim.openstreetmap.org/search');
    url.searchParams.set('format', 'json');
    url.searchParams.set('limit', '1');
    url.searchParams.set('q', query);

    const response = await fetch(url.toString(), {
      headers: {
        Accept: 'application/json',
        'Accept-Language': 'en',
      },
    });

    if (!response.ok) {
      geocodeCache.set(cacheKey, null);
      return null;
    }

    const results = (await response.json()) as Array<{ lat: string; lon: string }>;
    const first = results[0];
    if (!first) {
      geocodeCache.set(cacheKey, null);
      return null;
    }

    const coords: LatLngTuple = [Number(first.lat), Number(first.lon)];
    if (!Number.isFinite(coords[0]) || !Number.isFinite(coords[1])) {
      geocodeCache.set(cacheKey, null);
      return null;
    }

    geocodeCache.set(cacheKey, coords);
    return coords;
  } catch {
    geocodeCache.set(cacheKey, null);
    return null;
  }
}

export function clearGeocodeCache(): void {
  geocodeCache.clear();
}
