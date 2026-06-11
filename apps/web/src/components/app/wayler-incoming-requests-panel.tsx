'use client';

import { ApiError } from '@wayly/sdk';
import type { WaylerAvailabilityRequestSummary } from '@wayly/types';
import { WaylerAvailabilityRequestStatus } from '@wayly/types';
import { Button, Skeleton } from '@wayly/ui';
import { useCallback, useEffect, useState } from 'react';

import { AvailabilityRequestConvertedOrder } from '@/components/app/availability-request-converted-order';
import { useI18n } from '@/lib/i18n/i18n-context';
import type { TranslationKey } from '@/lib/i18n/dictionaries';
import { api } from '@/lib/sdk';
import { cn } from '@/lib/utils';

const REQUEST_CARD_CLASS = cn(
  'rounded-lg border border-border bg-background/60 px-3 py-3 text-sm',
  'wayly-feed-item-enter',
);

const TEXTAREA_CLASS = cn(
  'flex min-h-[64px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
  'ring-offset-background placeholder:text-muted-foreground',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
  'disabled:cursor-not-allowed disabled:opacity-50',
);

const ALERT_ERROR_CLASS = 'wayly-alert wayly-alert-danger';
const ALERT_INFO_CLASS = 'wayly-alert wayly-alert-info';
const ALERT_SUCCESS_CLASS = 'wayly-alert wayly-alert-success';

type ActionKind = 'accept' | 'decline';

type WaylerIncomingRequestsPanelProps = {
  isApproved: boolean;
  kycLoading: boolean;
  waylerHasActiveAccess: boolean;
};

function formatLocation(city: string, country: string): string {
  return [city, country].filter(Boolean).join(', ') || '—';
}

function formatRequestRoute(request: WaylerAvailabilityRequestSummary): string {
  const pickup = formatLocation(request.pickupCity, request.pickupCountry);
  const dropoff = formatLocation(request.dropoffCity, request.dropoffCountry);
  return `${pickup} → ${dropoff}`;
}

function formatRewardCents(cents: number, currency: string): string {
  return `${(cents / 100).toFixed(2)} ${currency}`;
}

function formatDateTime(value: string | null): string {
  if (!value) {
    return '—';
  }
  return new Date(value).toLocaleString();
}

function requestStatusKey(status: WaylerAvailabilityRequestStatus): TranslationKey {
  switch (status) {
    case WaylerAvailabilityRequestStatus.PENDING:
      return 'app.availabilityRequests.statusPending';
    case WaylerAvailabilityRequestStatus.ACCEPTED:
      return 'app.availabilityRequests.statusAccepted';
    case WaylerAvailabilityRequestStatus.DECLINED:
      return 'app.availabilityRequests.statusDeclined';
    case WaylerAvailabilityRequestStatus.CANCELLED:
      return 'app.availabilityRequests.statusCancelled';
    case WaylerAvailabilityRequestStatus.EXPIRED:
      return 'app.availabilityRequests.statusExpired';
    default:
      return 'app.availabilityRequests.requestStatus';
  }
}

function requestStatusBadgeClass(status: WaylerAvailabilityRequestStatus): string {
  const base = 'wayly-status-badge';
  switch (status) {
    case WaylerAvailabilityRequestStatus.PENDING:
      return cn(base, 'wayly-status-open');
    case WaylerAvailabilityRequestStatus.ACCEPTED:
      return cn(base, 'wayly-status-default');
    case WaylerAvailabilityRequestStatus.DECLINED:
    case WaylerAvailabilityRequestStatus.CANCELLED:
    case WaylerAvailabilityRequestStatus.EXPIRED:
      return cn(base, 'wayly-status-cancelled');
    default:
      return cn(base, 'wayly-status-default');
  }
}

function resolveActionError(
  err: unknown,
  t: (key: TranslationKey) => string,
  action: ActionKind,
): string {
  if (!(err instanceof ApiError)) {
    return action === 'accept'
      ? t('app.availabilityRequests.acceptFailed')
      : t('app.availabilityRequests.declineFailed');
  }
  if (err.code === 'AVAILABILITY_REQUEST_NOT_PENDING') {
    return t('app.availabilityRequests.requestNotPending');
  }
  if (err.code === 'AVAILABILITY_REQUEST_FORBIDDEN') {
    return t('app.availabilityRequests.requestForbidden');
  }
  if (action === 'accept' && err.code === 'WAYLER_ACCESS_REQUIRED') {
    return t('app.availabilityRequests.accessRequiredAcceptRequestFailed');
  }
  return t('app.availabilityRequests.updateFailed');
}

function optionalResponseMessage(draft: string): { responseMessage?: string } {
  const trimmed = draft.trim();
  return trimmed.length > 0 ? { responseMessage: trimmed } : {};
}

export function WaylerIncomingRequestsPanel({
  isApproved,
  kycLoading,
  waylerHasActiveAccess,
}: WaylerIncomingRequestsPanelProps) {
  const { t } = useI18n();

  const [requests, setRequests] = useState<WaylerAvailabilityRequestSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionBusy, setActionBusy] = useState<{ id: string; action: ActionKind } | null>(null);
  const [responseDrafts, setResponseDrafts] = useState<Record<string, string>>({});

  const loadRequests = useCallback(async () => {
    if (!isApproved) {
      setRequests([]);
      return;
    }
    setLoading(true);
    setLoadError(null);
    try {
      const result = await api.waylerAvailabilityRequests.mineAsWayler({ limit: 10 });
      setRequests(result.items);
    } catch {
      setLoadError(t('app.availabilityRequests.incomingLoadFailed'));
    } finally {
      setLoading(false);
    }
  }, [isApproved, t]);

  useEffect(() => {
    if (!kycLoading && isApproved) {
      void loadRequests();
    }
  }, [kycLoading, isApproved, loadRequests]);

  const updateResponseDraft = (id: string, value: string) => {
    setResponseDrafts((prev) => ({ ...prev, [id]: value }));
  };

  const handleAccept = async (id: string) => {
    setActionError(null);
    setActionSuccess(null);
    setActionBusy({ id, action: 'accept' });
    try {
      await api.waylerAvailabilityRequests.accept(
        id,
        optionalResponseMessage(responseDrafts[id] ?? ''),
      );
      setActionSuccess(t('app.availabilityRequests.requestAccepted'));
      setResponseDrafts((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      await loadRequests();
    } catch (err) {
      setActionError(resolveActionError(err, t, 'accept'));
    } finally {
      setActionBusy(null);
    }
  };

  const handleDecline = async (id: string) => {
    setActionError(null);
    setActionSuccess(null);
    setActionBusy({ id, action: 'decline' });
    try {
      await api.waylerAvailabilityRequests.decline(
        id,
        optionalResponseMessage(responseDrafts[id] ?? ''),
      );
      setActionSuccess(t('app.availabilityRequests.requestDeclined'));
      setResponseDrafts((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      await loadRequests();
    } catch (err) {
      setActionError(resolveActionError(err, t, 'decline'));
    } finally {
      setActionBusy(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {!kycLoading && !isApproved ? (
        <p className={ALERT_INFO_CLASS}>{t('app.senderPanel.kycRequired')}</p>
      ) : null}

      {actionSuccess ? <p className={ALERT_SUCCESS_CLASS}>{actionSuccess}</p> : null}
      {actionError ? <p className={ALERT_ERROR_CLASS}>{actionError}</p> : null}
      {loadError ? <p className={ALERT_ERROR_CLASS}>{loadError}</p> : null}

      {isApproved ? (
        <>
          {loading ? (
            <ul className="flex flex-col gap-2" aria-hidden>
              {[0, 1].map((key) => (
                <li key={key}>
                  <Skeleton className="h-28 w-full rounded-lg" />
                </li>
              ))}
            </ul>
          ) : requests.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t('app.availabilityRequests.noIncomingRequests')}
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {requests.map((request) => {
                const isPending = request.status === WaylerAvailabilityRequestStatus.PENDING;
                const isAccepting = actionBusy?.id === request.id && actionBusy.action === 'accept';
                const isDeclining =
                  actionBusy?.id === request.id && actionBusy.action === 'decline';
                const actionDisabled = actionBusy !== null;
                const acceptDisabled = actionDisabled || !waylerHasActiveAccess;

                return (
                  <li key={request.id} className={REQUEST_CARD_CLASS}>
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <p className="font-medium">{request.title}</p>
                      <span className={requestStatusBadgeClass(request.status)}>
                        {t(requestStatusKey(request.status))}
                      </span>
                    </div>

                    <p className="mt-1 text-muted-foreground">
                      {t('app.availabilityRequests.senderRequest')}
                    </p>

                    <dl className="mt-2 flex flex-col gap-1">
                      <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                        <dt className="text-muted-foreground">
                          {t('app.availabilityRequests.packageDescription')}
                        </dt>
                        <dd className="break-words sm:max-w-[60%] sm:text-right">
                          {request.packageDescription}
                        </dd>
                      </div>
                      <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                        <dt className="text-muted-foreground">
                          {t('app.availabilityRequests.requestRoute')}
                        </dt>
                        <dd>{formatRequestRoute(request)}</dd>
                      </div>
                      <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                        <dt className="text-muted-foreground">
                          {t('app.availabilityRequests.proposedReward')}
                        </dt>
                        <dd>{formatRewardCents(request.proposedRewardCents, request.currency)}</dd>
                      </div>
                    </dl>

                    <p className="mt-1 text-muted-foreground">
                      {formatDateTime(request.createdAt)}
                    </p>

                    {request.message ? (
                      <p className="mt-2 break-words">
                        <span className="text-muted-foreground">
                          {t('app.availabilityRequests.senderMessage')}:{' '}
                        </span>
                        {request.message}
                      </p>
                    ) : null}

                    {request.responseMessage ? (
                      <p className="mt-2 break-words">
                        <span className="text-muted-foreground">
                          {t('app.availabilityRequests.responseMessage')}:{' '}
                        </span>
                        {request.responseMessage}
                      </p>
                    ) : null}

                    {request.deliveryOrderId ? (
                      <AvailabilityRequestConvertedOrder
                        deliveryOrderId={request.deliveryOrderId}
                      />
                    ) : null}

                    {isPending ? (
                      <div className="mt-3 flex flex-col gap-3">
                        <label className="flex flex-col gap-1.5 text-sm">
                          <span className="font-medium">
                            {t('app.availabilityRequests.responseMessageField')}
                          </span>
                          <textarea
                            className={TEXTAREA_CLASS}
                            value={responseDrafts[request.id] ?? ''}
                            disabled={actionDisabled}
                            onChange={(e) => updateResponseDraft(request.id, e.target.value)}
                          />
                        </label>
                        <div className="wayly-action-group flex-col sm:flex-row">
                          <Button
                            variant="primary"
                            size="sm"
                            disabled={acceptDisabled}
                            onClick={() => void handleAccept(request.id)}
                          >
                            {isAccepting
                              ? t('app.senderWaylers.loading')
                              : t('app.availabilityRequests.acceptRequest')}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={actionDisabled}
                            onClick={() => void handleDecline(request.id)}
                          >
                            {isDeclining
                              ? t('app.senderWaylers.loading')
                              : t('app.availabilityRequests.declineRequest')}
                          </Button>
                          {!waylerHasActiveAccess ? (
                            <p className="text-xs text-muted-foreground" role="note">
                              {t('app.availabilityRequests.accessRequiredForAcceptRequest')}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}

          <div className="wayly-action-group">
            <Button
              variant="outline"
              size="sm"
              disabled={loading}
              onClick={() => void loadRequests()}
            >
              {loading ? t('app.senderWaylers.loading') : t('app.senderWaylers.refresh')}
            </Button>
          </div>
        </>
      ) : null}
    </div>
  );
}
