'use client';

import type { SenderRequestFormFields } from '@/components/app/sender-request-composer';

export type SenderRequestDraftSaveStatus = 'idle' | 'saving' | 'saved';

export type SenderRequestDraft = SenderRequestFormFields;

export const SENDER_REQUEST_DRAFT_KEY_PREFIX = 'wayly.senderRequestDraft.v1.';

export function getSenderRequestDraftKey(availabilityId: string): string {
  return `${SENDER_REQUEST_DRAFT_KEY_PREFIX}${availabilityId}`;
}

function isDraftShape(value: unknown): value is SenderRequestDraft {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const draft = value as Record<string, unknown>;
  const stringFields = [
    'title',
    'packageDescription',
    'pickupCountry',
    'pickupCity',
    'pickupAddress',
    'dropoffCountry',
    'dropoffCity',
    'dropoffAddress',
    'desiredPickupFrom',
    'desiredPickupTo',
    'desiredDeliveryFrom',
    'desiredDeliveryTo',
    'proposedReward',
    'currency',
    'message',
  ] as const;
  return stringFields.every((field) => typeof draft[field] === 'string');
}

export function readSenderRequestDraft(availabilityId: string): SenderRequestDraft | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const raw = localStorage.getItem(getSenderRequestDraftKey(availabilityId));
    if (!raw) {
      return null;
    }
    const parsed: unknown = JSON.parse(raw);
    return isDraftShape(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function writeSenderRequestDraft(
  availabilityId: string,
  draft: SenderRequestDraft,
): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  try {
    localStorage.setItem(getSenderRequestDraftKey(availabilityId), JSON.stringify(draft));
    return true;
  } catch {
    return false;
  }
}

export function clearSenderRequestDraft(availabilityId: string): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  try {
    localStorage.removeItem(getSenderRequestDraftKey(availabilityId));
    return true;
  } catch {
    return false;
  }
}

export function hasSenderRequestDraft(availabilityId: string): boolean {
  return readSenderRequestDraft(availabilityId) !== null;
}

export function isSenderRequestDraftStorageAvailable(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  try {
    const probeKey = `${SENDER_REQUEST_DRAFT_KEY_PREFIX}__probe__`;
    localStorage.setItem(probeKey, '1');
    localStorage.removeItem(probeKey);
    return true;
  } catch {
    return false;
  }
}

function isSenderRequestDraftStorageKey(key: string): boolean {
  return key.startsWith(SENDER_REQUEST_DRAFT_KEY_PREFIX) && !key.includes('__probe__');
}

export function countSenderRequestDrafts(): number {
  if (typeof window === 'undefined') {
    return 0;
  }
  try {
    let count = 0;
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (key && isSenderRequestDraftStorageKey(key)) {
        count += 1;
      }
    }
    return count;
  } catch {
    return 0;
  }
}

export function clearAllSenderRequestDrafts(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  try {
    const keysToRemove: string[] = [];
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (key && isSenderRequestDraftStorageKey(key)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));
    return true;
  } catch {
    return false;
  }
}
