'use client';

import { useCallback, useEffect, useState } from 'react';

export const WAYLER_SHORTLIST_STORAGE_KEY = 'wayly.shortlistedAvailabilityIds.v1';

function parseStoredIds(raw: string | null): Set<string> {
  if (!raw) {
    return new Set();
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return new Set();
    }
    return new Set(parsed.filter((id): id is string => typeof id === 'string' && id.length > 0));
  } catch {
    return new Set();
  }
}

export function readWaylerShortlistIds(): Set<string> {
  if (typeof window === 'undefined') {
    return new Set();
  }
  return parseStoredIds(localStorage.getItem(WAYLER_SHORTLIST_STORAGE_KEY));
}

export function writeWaylerShortlistIds(ids: Set<string>): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  try {
    localStorage.setItem(WAYLER_SHORTLIST_STORAGE_KEY, JSON.stringify([...ids]));
    return true;
  } catch {
    return false;
  }
}

export function clearWaylerShortlistIds(): boolean {
  return writeWaylerShortlistIds(new Set());
}

export function useWaylerShortlist() {
  const [shortlistedIds, setShortlistedIds] = useState<Set<string>>(() => new Set());
  const [storageAvailable, setStorageAvailable] = useState(true);
  const [clearedNotice, setClearedNotice] = useState(false);

  useEffect(() => {
    setShortlistedIds(readWaylerShortlistIds());
  }, []);

  const toggleShortlist = useCallback((listingId: string) => {
    setShortlistedIds((prev) => {
      const next = new Set(prev);
      if (next.has(listingId)) {
        next.delete(listingId);
      } else {
        next.add(listingId);
      }
      const persisted = writeWaylerShortlistIds(next);
      if (!persisted) {
        setStorageAvailable(false);
      }
      return next;
    });
  }, []);

  const clearShortlist = useCallback(() => {
    const persisted = clearWaylerShortlistIds();
    setShortlistedIds(new Set());
    if (!persisted) {
      setStorageAvailable(false);
    }
    setClearedNotice(true);
  }, []);

  const isShortlisted = useCallback(
    (listingId: string) => shortlistedIds.has(listingId),
    [shortlistedIds],
  );

  return {
    shortlistedIds,
    shortlistCount: shortlistedIds.size,
    toggleShortlist,
    clearShortlist,
    isShortlisted,
    storageAvailable,
    clearedNotice,
    dismissClearedNotice: () => setClearedNotice(false),
  };
}
