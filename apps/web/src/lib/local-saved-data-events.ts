export const LOCAL_SAVED_DATA_CHANGED_EVENT = 'wayly:local-saved-data-changed';

export type LocalSavedDataScope = 'shortlist' | 'senderDrafts' | 'waylerDraft' | 'all';

export function dispatchLocalSavedDataChanged(scope: LocalSavedDataScope): void {
  if (typeof window === 'undefined') {
    return;
  }
  window.dispatchEvent(new CustomEvent(LOCAL_SAVED_DATA_CHANGED_EVENT, { detail: { scope } }));
}

export function isLocalSavedDataScope(value: unknown): value is LocalSavedDataScope {
  return (
    value === 'shortlist' || value === 'senderDrafts' || value === 'waylerDraft' || value === 'all'
  );
}
