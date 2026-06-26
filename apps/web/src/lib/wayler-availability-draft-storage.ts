'use client';

import { TripDirection, WaylerAvailabilityType } from '@wayly/types';

import type { WaylerAvailabilityFormFields } from '@/components/app/wayler-availability-composer';

export type WaylerAvailabilityDraftSaveStatus = 'idle' | 'saving' | 'saved';

export type WaylerAvailabilityDraft = WaylerAvailabilityFormFields;

export const WAYLER_AVAILABILITY_DRAFT_STORAGE_KEY = 'wayly.waylerAvailabilityDraft.v1';

const TRIP_DIRECTIONS = new Set<string>([
  TripDirection.ONE_WAY,
  TripDirection.RETURN,
  TripDirection.FLEXIBLE,
]);

const AVAILABILITY_TYPES = new Set<string>([
  WaylerAvailabilityType.LOCAL_AVAILABILITY,
  WaylerAvailabilityType.TRIP_ROUTE,
]);

function isDraftShape(value: unknown): value is WaylerAvailabilityDraft {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const draft = value as Record<string, unknown>;
  if (
    typeof draft.type !== 'string' ||
    !AVAILABILITY_TYPES.has(draft.type) ||
    typeof draft.tripDirection !== 'string' ||
    (draft.tripDirection !== '' && !TRIP_DIRECTIONS.has(draft.tripDirection))
  ) {
    return false;
  }
  const stringFields = [
    'originCountry',
    'originCity',
    'originRegion',
    'destinationCountry',
    'destinationCity',
    'destinationRegion',
    'availableFrom',
    'availableTo',
    'departureDate',
    'returnDate',
    'maxPackages',
    'maxWeightKg',
    'notes',
  ] as const;
  return stringFields.every((field) => typeof draft[field] === 'string');
}

export function readWaylerAvailabilityDraft(): WaylerAvailabilityDraft | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const raw = localStorage.getItem(WAYLER_AVAILABILITY_DRAFT_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed: unknown = JSON.parse(raw);
    return isDraftShape(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function writeWaylerAvailabilityDraft(draft: WaylerAvailabilityDraft): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  try {
    localStorage.setItem(WAYLER_AVAILABILITY_DRAFT_STORAGE_KEY, JSON.stringify(draft));
    return true;
  } catch {
    return false;
  }
}

export function clearWaylerAvailabilityDraft(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  try {
    localStorage.removeItem(WAYLER_AVAILABILITY_DRAFT_STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

export function hasWaylerAvailabilityDraft(): boolean {
  return readWaylerAvailabilityDraft() !== null;
}

export function isWaylerAvailabilityDraftStorageAvailable(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  try {
    const probeKey = `${WAYLER_AVAILABILITY_DRAFT_STORAGE_KEY}.__probe__`;
    localStorage.setItem(probeKey, '1');
    localStorage.removeItem(probeKey);
    return true;
  } catch {
    return false;
  }
}
