'use client';

import { useCallback, useEffect, useState } from 'react';

import {
  LOCAL_SAVED_DATA_CHANGED_EVENT,
  isLocalSavedDataScope,
} from '@/lib/local-saved-data-events';

export const RECENT_ROUTE_SEARCHES_STORAGE_KEY = 'wayly.recentRouteSearches.v1';
export const MAX_RECENT_ROUTE_SEARCHES = 8;

export type RecentRouteSearchFields = {
  originCountry: string;
  originCity: string;
  destinationCountry: string;
  destinationCity: string;
};

export type RecentRouteSearchRecord = RecentRouteSearchFields & {
  id: string;
  createdAt: string;
};

function optionalText(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function normalizeCountry(value: string): string {
  return value.trim().toUpperCase();
}

function normalizeCity(value: string): string {
  return value.trim();
}

function searchFingerprint(fields: RecentRouteSearchFields): string {
  return [
    normalizeCountry(fields.originCountry),
    normalizeCity(fields.originCity),
    normalizeCountry(fields.destinationCountry),
    normalizeCity(fields.destinationCity),
  ].join('|');
}

function isRecordShape(value: unknown): value is RecentRouteSearchRecord {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === 'string' &&
    typeof record.originCountry === 'string' &&
    typeof record.originCity === 'string' &&
    typeof record.destinationCountry === 'string' &&
    typeof record.destinationCity === 'string' &&
    typeof record.createdAt === 'string'
  );
}

export function isUsefulRouteSearch(fields: RecentRouteSearchFields): boolean {
  const hasOrigin =
    normalizeCountry(fields.originCountry).length === 2 || Boolean(optionalText(fields.originCity));
  const hasDestination =
    normalizeCountry(fields.destinationCountry).length === 2 ||
    Boolean(optionalText(fields.destinationCity));
  return hasOrigin || hasDestination;
}

function parseStoredSearches(raw: string | null): RecentRouteSearchRecord[] {
  if (!raw) {
    return [];
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter(isRecordShape);
  } catch {
    return [];
  }
}

export function readRecentRouteSearches(): RecentRouteSearchRecord[] {
  if (typeof window === 'undefined') {
    return [];
  }
  return parseStoredSearches(localStorage.getItem(RECENT_ROUTE_SEARCHES_STORAGE_KEY));
}

function writeRecentRouteSearches(records: RecentRouteSearchRecord[]): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  try {
    localStorage.setItem(RECENT_ROUTE_SEARCHES_STORAGE_KEY, JSON.stringify(records));
    return true;
  } catch {
    return false;
  }
}

export function countRecentRouteSearches(): number {
  return readRecentRouteSearches().length;
}

export function clearRecentRouteSearches(): boolean {
  return writeRecentRouteSearches([]);
}

export function removeRecentRouteSearch(id: string): boolean {
  const next = readRecentRouteSearches().filter((record) => record.id !== id);
  return writeRecentRouteSearches(next);
}

export function saveRecentRouteSearch(fields: RecentRouteSearchFields): boolean {
  if (!isUsefulRouteSearch(fields)) {
    return false;
  }

  const fingerprint = searchFingerprint(fields);
  const withoutDuplicate = readRecentRouteSearches().filter(
    (record) => searchFingerprint(record) !== fingerprint,
  );

  const entry: RecentRouteSearchRecord = {
    id: crypto.randomUUID(),
    originCountry: normalizeCountry(fields.originCountry),
    originCity: normalizeCity(fields.originCity),
    destinationCountry: normalizeCountry(fields.destinationCountry),
    destinationCity: normalizeCity(fields.destinationCity),
    createdAt: new Date().toISOString(),
  };

  const next = [entry, ...withoutDuplicate].slice(0, MAX_RECENT_ROUTE_SEARCHES);
  return writeRecentRouteSearches(next);
}

export function isRecentRouteSearchStorageAvailable(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  try {
    const probeKey = `${RECENT_ROUTE_SEARCHES_STORAGE_KEY}.probe`;
    localStorage.setItem(probeKey, '1');
    localStorage.removeItem(probeKey);
    return true;
  } catch {
    return false;
  }
}

export function useRecentRouteSearches() {
  const [searches, setSearches] = useState<RecentRouteSearchRecord[]>([]);
  const [storageAvailable, setStorageAvailable] = useState(true);
  const [clearedNotice, setClearedNotice] = useState(false);

  const refreshSearches = useCallback(() => {
    setSearches(readRecentRouteSearches());
  }, []);

  useEffect(() => {
    refreshSearches();
    setStorageAvailable(isRecentRouteSearchStorageAvailable());
  }, [refreshSearches]);

  useEffect(() => {
    const handleLocalSavedDataChanged = (event: Event) => {
      const scope = (event as CustomEvent<{ scope?: unknown }>).detail?.scope;
      if (isLocalSavedDataScope(scope) && (scope === 'recentSearches' || scope === 'all')) {
        refreshSearches();
      }
    };

    window.addEventListener(LOCAL_SAVED_DATA_CHANGED_EVENT, handleLocalSavedDataChanged);
    return () => {
      window.removeEventListener(LOCAL_SAVED_DATA_CHANGED_EVENT, handleLocalSavedDataChanged);
    };
  }, [refreshSearches]);

  const saveFromFields = useCallback(
    (fields: RecentRouteSearchFields) => {
      const persisted = saveRecentRouteSearch(fields);
      if (!persisted && isUsefulRouteSearch(fields)) {
        setStorageAvailable(false);
      }
      refreshSearches();
      return persisted;
    },
    [refreshSearches],
  );

  const removeSearch = useCallback(
    (id: string) => {
      const persisted = removeRecentRouteSearch(id);
      if (!persisted) {
        setStorageAvailable(false);
      }
      refreshSearches();
    },
    [refreshSearches],
  );

  const clearSearches = useCallback(() => {
    const persisted = clearRecentRouteSearches();
    if (!persisted) {
      setStorageAvailable(false);
    }
    setSearches([]);
    setClearedNotice(true);
  }, []);

  return {
    searches,
    storageAvailable,
    clearedNotice,
    saveFromFields,
    removeSearch,
    clearSearches,
    refreshSearches,
  };
}
