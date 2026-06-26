'use client';

import { TripDirection, WaylerAvailabilityType } from '@wayly/types';
import { useCallback, useEffect, useState } from 'react';

import type { WaylerAvailabilityFormFields } from '@/components/app/wayler-availability-composer';
import {
  LOCAL_SAVED_DATA_CHANGED_EVENT,
  isLocalSavedDataScope,
} from '@/lib/local-saved-data-events';

export const WAYLER_AVAILABILITY_TEMPLATES_STORAGE_KEY = 'wayly.waylerAvailabilityTemplates.v1';
export const MAX_WAYLER_AVAILABILITY_TEMPLATES = 5;

const TRIP_DIRECTIONS = new Set<string>([
  TripDirection.ONE_WAY,
  TripDirection.RETURN,
  TripDirection.FLEXIBLE,
]);

const AVAILABILITY_TYPES = new Set<string>([
  WaylerAvailabilityType.LOCAL_AVAILABILITY,
  WaylerAvailabilityType.TRIP_ROUTE,
]);

export type WaylerAvailabilityTemplateFields = {
  type: WaylerAvailabilityType;
  originCountry: string;
  originRegion: string;
  originCity: string;
  destinationCountry: string;
  destinationRegion: string;
  destinationCity: string;
  tripDirection: TripDirection | '';
  maxPackages: string;
  maxWeightKg: string;
  notes: string;
};

export type WaylerAvailabilityTemplate = WaylerAvailabilityTemplateFields & {
  templateId: string;
  templateName: string;
  createdAt: string;
  updatedAt: string;
};

function isTemplateShape(value: unknown): value is WaylerAvailabilityTemplate {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const record = value as Record<string, unknown>;
  if (
    typeof record.templateId !== 'string' ||
    typeof record.templateName !== 'string' ||
    typeof record.createdAt !== 'string' ||
    typeof record.updatedAt !== 'string' ||
    typeof record.type !== 'string' ||
    !AVAILABILITY_TYPES.has(record.type) ||
    typeof record.tripDirection !== 'string' ||
    (record.tripDirection !== '' && !TRIP_DIRECTIONS.has(record.tripDirection))
  ) {
    return false;
  }
  const stringFields = [
    'originCountry',
    'originRegion',
    'originCity',
    'destinationCountry',
    'destinationRegion',
    'destinationCity',
    'maxPackages',
    'maxWeightKg',
    'notes',
  ] as const;
  return stringFields.every((field) => typeof record[field] === 'string');
}

function parseStoredTemplates(raw: string | null): WaylerAvailabilityTemplate[] {
  if (!raw) {
    return [];
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter(isTemplateShape);
  } catch {
    return [];
  }
}

export function readWaylerAvailabilityTemplates(): WaylerAvailabilityTemplate[] {
  if (typeof window === 'undefined') {
    return [];
  }
  return parseStoredTemplates(localStorage.getItem(WAYLER_AVAILABILITY_TEMPLATES_STORAGE_KEY));
}

function writeWaylerAvailabilityTemplates(templates: WaylerAvailabilityTemplate[]): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  try {
    localStorage.setItem(WAYLER_AVAILABILITY_TEMPLATES_STORAGE_KEY, JSON.stringify(templates));
    return true;
  } catch {
    return false;
  }
}

export function countWaylerAvailabilityTemplates(): number {
  return readWaylerAvailabilityTemplates().length;
}

export function clearWaylerAvailabilityTemplates(): boolean {
  return writeWaylerAvailabilityTemplates([]);
}

export function deleteWaylerAvailabilityTemplate(templateId: string): boolean {
  const next = readWaylerAvailabilityTemplates().filter(
    (template) => template.templateId !== templateId,
  );
  return writeWaylerAvailabilityTemplates(next);
}

export function formFieldsToTemplateFields(
  form: WaylerAvailabilityFormFields,
): WaylerAvailabilityTemplateFields {
  return {
    type: form.type,
    originCountry: form.originCountry.trim().toUpperCase(),
    originRegion: form.originRegion.trim(),
    originCity: form.originCity.trim(),
    destinationCountry: form.destinationCountry.trim().toUpperCase(),
    destinationRegion: form.destinationRegion.trim(),
    destinationCity: form.destinationCity.trim(),
    tripDirection: form.tripDirection,
    maxPackages: form.maxPackages.trim(),
    maxWeightKg: form.maxWeightKg.trim(),
    notes: form.notes.trim(),
  };
}

export function templateFieldsToFormPatch(
  template: WaylerAvailabilityTemplateFields,
): Partial<WaylerAvailabilityFormFields> {
  return {
    type: template.type,
    originCountry: template.originCountry,
    originRegion: template.originRegion,
    originCity: template.originCity,
    destinationCountry: template.destinationCountry,
    destinationRegion: template.destinationRegion,
    destinationCity: template.destinationCity,
    tripDirection: template.tripDirection,
    maxPackages: template.maxPackages,
    maxWeightKg: template.maxWeightKg,
    notes: template.notes,
    availableFrom: '',
    availableTo: '',
    departureDate: '',
    returnDate: '',
  };
}

export function saveWaylerAvailabilityTemplate(
  templateName: string,
  form: WaylerAvailabilityFormFields,
):
  | { ok: true; template: WaylerAvailabilityTemplate }
  | { ok: false; reason: 'emptyName' | 'maxReached' | 'storage' } {
  const name = templateName.trim();
  if (!name) {
    return { ok: false, reason: 'emptyName' };
  }

  const existing = readWaylerAvailabilityTemplates();
  if (existing.length >= MAX_WAYLER_AVAILABILITY_TEMPLATES) {
    return { ok: false, reason: 'maxReached' };
  }

  const now = new Date().toISOString();
  const template: WaylerAvailabilityTemplate = {
    templateId: crypto.randomUUID(),
    templateName: name,
    createdAt: now,
    updatedAt: now,
    ...formFieldsToTemplateFields(form),
  };

  const persisted = writeWaylerAvailabilityTemplates(
    [template, ...existing].slice(0, MAX_WAYLER_AVAILABILITY_TEMPLATES),
  );
  if (!persisted) {
    return { ok: false, reason: 'storage' };
  }
  return { ok: true, template };
}

export function isWaylerAvailabilityTemplateStorageAvailable(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  try {
    const probeKey = `${WAYLER_AVAILABILITY_TEMPLATES_STORAGE_KEY}.probe`;
    localStorage.setItem(probeKey, '1');
    localStorage.removeItem(probeKey);
    return true;
  } catch {
    return false;
  }
}

export function useWaylerAvailabilityTemplates() {
  const [templates, setTemplates] = useState<WaylerAvailabilityTemplate[]>([]);
  const [storageAvailable, setStorageAvailable] = useState(true);

  const refreshTemplates = useCallback(() => {
    setTemplates(readWaylerAvailabilityTemplates());
  }, []);

  useEffect(() => {
    refreshTemplates();
    setStorageAvailable(isWaylerAvailabilityTemplateStorageAvailable());
  }, [refreshTemplates]);

  useEffect(() => {
    const handleLocalSavedDataChanged = (event: Event) => {
      const scope = (event as CustomEvent<{ scope?: unknown }>).detail?.scope;
      if (isLocalSavedDataScope(scope) && (scope === 'availabilityTemplates' || scope === 'all')) {
        refreshTemplates();
      }
    };

    window.addEventListener(LOCAL_SAVED_DATA_CHANGED_EVENT, handleLocalSavedDataChanged);
    return () => {
      window.removeEventListener(LOCAL_SAVED_DATA_CHANGED_EVENT, handleLocalSavedDataChanged);
    };
  }, [refreshTemplates]);

  const saveTemplate = useCallback(
    (templateName: string, form: WaylerAvailabilityFormFields) => {
      const result = saveWaylerAvailabilityTemplate(templateName, form);
      if (result.ok) {
        refreshTemplates();
      } else if (result.reason === 'storage') {
        setStorageAvailable(false);
      }
      return result;
    },
    [refreshTemplates],
  );

  const deleteTemplate = useCallback(
    (templateId: string) => {
      const persisted = deleteWaylerAvailabilityTemplate(templateId);
      if (!persisted) {
        setStorageAvailable(false);
      }
      refreshTemplates();
      return persisted;
    },
    [refreshTemplates],
  );

  const clearTemplates = useCallback(() => {
    const persisted = clearWaylerAvailabilityTemplates();
    if (!persisted) {
      setStorageAvailable(false);
    }
    setTemplates([]);
    return persisted;
  }, []);

  return {
    templates,
    storageAvailable,
    saveTemplate,
    deleteTemplate,
    clearTemplates,
    refreshTemplates,
  };
}
