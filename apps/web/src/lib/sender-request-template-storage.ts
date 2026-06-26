'use client';

import { useCallback, useEffect, useState } from 'react';

import type { SenderRequestFormFields } from '@/components/app/sender-request-composer';
import {
  LOCAL_SAVED_DATA_CHANGED_EVENT,
  isLocalSavedDataScope,
} from '@/lib/local-saved-data-events';

export const SENDER_REQUEST_TEMPLATES_STORAGE_KEY = 'wayly.senderRequestTemplates.v1';
export const MAX_SENDER_REQUEST_TEMPLATES = 5;

export type SenderRequestTemplateFields = {
  title: string;
  packageDescription: string;
  proposedReward: string;
  currency: string;
  message: string;
  pickupCountry: string;
  pickupCity: string;
  dropoffCountry: string;
  dropoffCity: string;
};

export type SenderRequestTemplate = SenderRequestTemplateFields & {
  templateId: string;
  templateName: string;
  createdAt: string;
  updatedAt: string;
};

function isTemplateShape(value: unknown): value is SenderRequestTemplate {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const record = value as Record<string, unknown>;
  if (
    typeof record.templateId !== 'string' ||
    typeof record.templateName !== 'string' ||
    typeof record.createdAt !== 'string' ||
    typeof record.updatedAt !== 'string'
  ) {
    return false;
  }
  const stringFields = [
    'title',
    'packageDescription',
    'proposedReward',
    'currency',
    'message',
    'pickupCountry',
    'pickupCity',
    'dropoffCountry',
    'dropoffCity',
  ] as const;
  return stringFields.every((field) => typeof record[field] === 'string');
}

function parseStoredTemplates(raw: string | null): SenderRequestTemplate[] {
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

export function readSenderRequestTemplates(): SenderRequestTemplate[] {
  if (typeof window === 'undefined') {
    return [];
  }
  return parseStoredTemplates(localStorage.getItem(SENDER_REQUEST_TEMPLATES_STORAGE_KEY));
}

function writeSenderRequestTemplates(templates: SenderRequestTemplate[]): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  try {
    localStorage.setItem(SENDER_REQUEST_TEMPLATES_STORAGE_KEY, JSON.stringify(templates));
    return true;
  } catch {
    return false;
  }
}

export function countSenderRequestTemplates(): number {
  return readSenderRequestTemplates().length;
}

export function clearSenderRequestTemplates(): boolean {
  return writeSenderRequestTemplates([]);
}

export function deleteSenderRequestTemplate(templateId: string): boolean {
  const next = readSenderRequestTemplates().filter(
    (template) => template.templateId !== templateId,
  );
  return writeSenderRequestTemplates(next);
}

export function formFieldsToTemplateFields(
  form: SenderRequestFormFields,
): SenderRequestTemplateFields {
  return {
    title: form.title.trim(),
    packageDescription: form.packageDescription.trim(),
    proposedReward: form.proposedReward.trim(),
    currency: form.currency.trim().toUpperCase() || 'EUR',
    message: form.message.trim(),
    pickupCountry: form.pickupCountry.trim().toUpperCase(),
    pickupCity: form.pickupCity.trim(),
    dropoffCountry: form.dropoffCountry.trim().toUpperCase(),
    dropoffCity: form.dropoffCity.trim(),
  };
}

export function templateFieldsToFormPatch(
  template: SenderRequestTemplateFields,
): Partial<SenderRequestFormFields> {
  const patch: Partial<SenderRequestFormFields> = {
    title: template.title,
    packageDescription: template.packageDescription,
    proposedReward: template.proposedReward,
    currency: template.currency,
    message: template.message,
  };

  if (template.pickupCountry.trim()) {
    patch.pickupCountry = template.pickupCountry;
  }
  if (template.pickupCity.trim()) {
    patch.pickupCity = template.pickupCity;
  }
  if (template.dropoffCountry.trim()) {
    patch.dropoffCountry = template.dropoffCountry;
  }
  if (template.dropoffCity.trim()) {
    patch.dropoffCity = template.dropoffCity;
  }

  return patch;
}

export function saveSenderRequestTemplate(
  templateName: string,
  form: SenderRequestFormFields,
):
  | { ok: true; template: SenderRequestTemplate }
  | { ok: false; reason: 'emptyName' | 'maxReached' | 'storage' } {
  const name = templateName.trim();
  if (!name) {
    return { ok: false, reason: 'emptyName' };
  }

  const existing = readSenderRequestTemplates();
  if (existing.length >= MAX_SENDER_REQUEST_TEMPLATES) {
    return { ok: false, reason: 'maxReached' };
  }

  const now = new Date().toISOString();
  const template: SenderRequestTemplate = {
    templateId: crypto.randomUUID(),
    templateName: name,
    createdAt: now,
    updatedAt: now,
    ...formFieldsToTemplateFields(form),
  };

  const persisted = writeSenderRequestTemplates(
    [template, ...existing].slice(0, MAX_SENDER_REQUEST_TEMPLATES),
  );
  if (!persisted) {
    return { ok: false, reason: 'storage' };
  }
  return { ok: true, template };
}

export function isSenderRequestTemplateStorageAvailable(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  try {
    const probeKey = `${SENDER_REQUEST_TEMPLATES_STORAGE_KEY}.probe`;
    localStorage.setItem(probeKey, '1');
    localStorage.removeItem(probeKey);
    return true;
  } catch {
    return false;
  }
}

export function useSenderRequestTemplates() {
  const [templates, setTemplates] = useState<SenderRequestTemplate[]>([]);
  const [storageAvailable, setStorageAvailable] = useState(true);

  const refreshTemplates = useCallback(() => {
    setTemplates(readSenderRequestTemplates());
  }, []);

  useEffect(() => {
    refreshTemplates();
    setStorageAvailable(isSenderRequestTemplateStorageAvailable());
  }, [refreshTemplates]);

  useEffect(() => {
    const handleLocalSavedDataChanged = (event: Event) => {
      const scope = (event as CustomEvent<{ scope?: unknown }>).detail?.scope;
      if (isLocalSavedDataScope(scope) && (scope === 'senderRequestTemplates' || scope === 'all')) {
        refreshTemplates();
      }
    };

    window.addEventListener(LOCAL_SAVED_DATA_CHANGED_EVENT, handleLocalSavedDataChanged);
    return () => {
      window.removeEventListener(LOCAL_SAVED_DATA_CHANGED_EVENT, handleLocalSavedDataChanged);
    };
  }, [refreshTemplates]);

  const saveTemplate = useCallback(
    (templateName: string, form: SenderRequestFormFields) => {
      const result = saveSenderRequestTemplate(templateName, form);
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
      const persisted = deleteSenderRequestTemplate(templateId);
      if (!persisted) {
        setStorageAvailable(false);
      }
      refreshTemplates();
      return persisted;
    },
    [refreshTemplates],
  );

  const clearTemplates = useCallback(() => {
    const persisted = clearSenderRequestTemplates();
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
