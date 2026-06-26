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
