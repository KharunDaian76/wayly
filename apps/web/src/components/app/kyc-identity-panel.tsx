'use client';

import { ApiError } from '@wayly/sdk';
import type { KycStatusView } from '@wayly/types';
import { KycStatus } from '@wayly/types';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Skeleton } from '@wayly/ui';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { resolveKycGatePhase, type KycGatePhase } from '@/components/app/kyc-marketplace-gate';
import { PanelEmptyState, PanelErrorState } from '@/components/app/panel-status-states';
import type { TranslationKey } from '@/lib/i18n/dictionaries';
import { useI18n } from '@/lib/i18n/i18n-context';
import { api } from '@/lib/sdk';

const isDev = process.env.NODE_ENV !== 'production';

const ALERT_ERROR_CLASS = 'wayly-alert wayly-alert-danger';
const ALERT_SUCCESS_CLASS = 'wayly-alert wayly-alert-success';

export type KycIdentityPanelProps = {
  kycLoading: boolean;
  kycLoadError: string | null;
  kycStatus: KycStatusView | null;
  defaultCountry: string | null | undefined;
  isApproved: boolean;
  onRetryLoad: () => void;
  onKycStatusUpdated: (status: KycStatusView) => void;
  onUserRefresh: () => Promise<void>;
};

type KycPanelAction = 'start' | 'approve' | 'reject' | null;

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-lg border border-border/40 bg-muted/15 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="break-words text-sm font-medium">{value}</dd>
    </div>
  );
}

function flagLabel(value: boolean, yes: string, no: string): string {
  return value ? yes : no;
}

function normalizeCountry(value: string): string {
  return value.trim().toUpperCase();
}

function isValidCountryCode(value: string): boolean {
  return /^[A-Z]{2}$/.test(value);
}

function KycPanelLoadingSkeleton({ loadingLabel }: { loadingLabel: string }) {
  return (
    <div className="flex flex-col gap-3" role="status" aria-live="polite" aria-busy="true">
      <p className="text-sm text-muted-foreground">{loadingLabel}</p>
      <Skeleton className="h-11 w-full rounded-lg" />
      <Skeleton className="h-11 w-full rounded-lg" />
      <Skeleton className="h-24 w-full rounded-lg" />
    </div>
  );
}

function phaseNoticeCopy(
  phase: KycGatePhase,
  t: (key: TranslationKey) => string,
): { title: string; body: string } | null {
  switch (phase) {
    case 'required':
      return {
        title: t('app.kycPanel.notSubmittedTitle'),
        body: t('app.kycPanel.notSubmittedBody'),
      };
    case 'pending':
      return {
        title: t('app.kycPanel.pendingTitle'),
        body: t('app.kycPanel.pendingBody'),
      };
    case 'rejected':
      return {
        title: t('app.kycPanel.rejectedTitle'),
        body: t('app.kycPanel.rejectedBody'),
      };
    case 'approved':
      return {
        title: t('app.kycPanel.approvedTitle'),
        body: t('app.kycPanel.approvedBody'),
      };
    default:
      return null;
  }
}

export function KycIdentityPanel({
  kycLoading,
  kycLoadError,
  kycStatus,
  defaultCountry,
  isApproved,
  onRetryLoad,
  onKycStatusUpdated,
  onUserRefresh,
}: KycIdentityPanelProps) {
  const { t } = useI18n();
  const [countryDraft, setCountryDraft] = useState(defaultCountry ?? '');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [action, setAction] = useState<KycPanelAction>(null);

  useEffect(() => {
    if (!countryDraft.trim() && defaultCountry) {
      setCountryDraft(defaultCountry);
    }
  }, [defaultCountry, countryDraft]);

  const gateInput = useMemo(
    () => ({
      kycLoading,
      kycError: kycLoadError,
      kycStatus,
      isApproved,
      onRetryKyc: onRetryLoad,
    }),
    [kycLoading, kycLoadError, kycStatus, isApproved, onRetryLoad],
  );

  const phase = resolveKycGatePhase(gateInput);
  const phaseNotice = !kycLoading && kycStatus ? phaseNoticeCopy(phase, t) : null;
  const rejectionReason = kycStatus?.latestVerification?.rejectionReason?.trim() || null;
  const hasPendingVerification = kycStatus?.latestVerification?.status === KycStatus.PENDING;
  const canShowForm =
    !kycLoading &&
    kycStatus !== null &&
    !isApproved &&
    (phase === 'required' || phase === 'rejected');
  const showInitialLoading = kycLoading && kycStatus === null;
  const showRefreshingHint = kycLoading && kycStatus !== null;

  const refreshKycStatus = useCallback(async () => {
    const status = await api.kyc.status();
    onKycStatusUpdated(status);
    await onUserRefresh();
    return status;
  }, [onKycStatusUpdated, onUserRefresh]);

  async function handlePanelAction(
    type: Exclude<KycPanelAction, null>,
    run: () => Promise<KycStatusView | void>,
  ) {
    setSubmitError(null);
    setSubmitSuccess(false);
    setAction(type);
    try {
      const result = await run();
      if (result) {
        onKycStatusUpdated(result);
      } else {
        await refreshKycStatus();
      }
      await onUserRefresh();
      if (type === 'start') {
        setSubmitSuccess(true);
      }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : t('app.kycPanel.submitFailed');
      setSubmitError(message);
    } finally {
      setAction(null);
    }
  }

  function handleSubmitVerification() {
    setFieldError(null);
    setSubmitError(null);
    setSubmitSuccess(false);

    const normalized = normalizeCountry(countryDraft);
    if (!normalized) {
      setFieldError(t('app.kycPanel.requiredField'));
      return;
    }
    if (!isValidCountryCode(normalized)) {
      setFieldError(t('app.kycPanel.invalidCountry'));
      return;
    }

    void handlePanelAction('start', async () => {
      await api.kyc.start({
        country: normalized,
        levelName: 'basic-kyc',
      });
    });
  }

  return (
    <Card className="wayly-app-panel">
      <CardHeader>
        <CardTitle>{t('app.kycPanel.title')}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {kycLoadError ? (
          <PanelErrorState
            message={kycLoadError}
            retryLabel={t('app.kycPanel.retryStatus')}
            onRetry={onRetryLoad}
            retryDisabled={kycLoading}
          />
        ) : null}

        {showInitialLoading ? (
          <KycPanelLoadingSkeleton loadingLabel={t('app.kycPanel.loading')} />
        ) : null}

        {showRefreshingHint ? (
          <p className="text-xs text-muted-foreground" role="status" aria-live="polite">
            {t('app.kycPanel.loading')}
          </p>
        ) : null}

        {phaseNotice ? <PanelEmptyState title={phaseNotice.title} body={phaseNotice.body} /> : null}

        {phase === 'rejected' && rejectionReason ? (
          <div className="rounded-lg border border-border/60 bg-muted/15 px-4 py-3" role="note">
            <p className="text-sm font-medium text-foreground">
              {t('app.kycPanel.rejectionReason')}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{rejectionReason}</p>
          </div>
        ) : null}

        {kycStatus && !showInitialLoading ? (
          <>
            <dl className="flex flex-col gap-4">
              <StatusRow
                label={t('app.verified')}
                value={kycStatus.verified ? t('common.yes') : t('common.no')}
              />
              <StatusRow label={t('app.kycStatus')} value={kycStatus.kycStatus} />
              {kycStatus.latestVerification ? (
                <StatusRow
                  label={t('app.kycPanel.latestVerification')}
                  value={kycStatus.latestVerification.status}
                />
              ) : null}
            </dl>

            <div>
              <p className="mb-3 text-sm font-medium">{t('app.kycPanel.accessTitle')}</p>
              <dl className="flex flex-col gap-3">
                <StatusRow
                  label={t('app.kycPanel.canCreateOrder')}
                  value={flagLabel(kycStatus.canCreateOrder, t('common.yes'), t('common.no'))}
                />
                <StatusRow
                  label={t('app.kycPanel.canBrowseOrders')}
                  value={flagLabel(kycStatus.canBrowseOrders, t('common.yes'), t('common.no'))}
                />
                <StatusRow
                  label={t('app.kycPanel.canAcceptOrder')}
                  value={flagLabel(kycStatus.canAcceptOrder, t('common.yes'), t('common.no'))}
                />
                <StatusRow
                  label={t('app.kycPanel.canChat')}
                  value={flagLabel(kycStatus.canChat, t('common.yes'), t('common.no'))}
                />
                <StatusRow
                  label={t('app.kycPanel.canContact')}
                  value={flagLabel(kycStatus.canContact, t('common.yes'), t('common.no'))}
                />
                <StatusRow
                  label={t('app.kycPanel.canReceivePayout')}
                  value={flagLabel(kycStatus.canReceivePayout, t('common.yes'), t('common.no'))}
                />
              </dl>
            </div>
          </>
        ) : null}

        {submitSuccess ? (
          <p className={ALERT_SUCCESS_CLASS} role="status">
            {t('app.kycPanel.submitSucceeded')}
          </p>
        ) : null}

        {submitError ? (
          <p className={ALERT_ERROR_CLASS} role="alert">
            {submitError}
          </p>
        ) : null}

        {canShowForm ? (
          <div className="flex flex-col gap-3 rounded-lg border border-border/60 bg-muted/10 px-4 py-4">
            <p className="text-sm text-muted-foreground">{t('app.kycPanel.formIntro')}</p>
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium">
                {t('app.kycPanel.countryLabel')}
                <span className="text-danger" aria-hidden="true">
                  {' '}
                  *
                </span>
              </span>
              <Input
                value={countryDraft}
                onChange={(event) => {
                  setCountryDraft(event.target.value);
                  if (fieldError) {
                    setFieldError(null);
                  }
                }}
                placeholder={t('app.kycPanel.countryPlaceholder')}
                maxLength={2}
                autoComplete="country"
                disabled={action !== null}
                aria-invalid={fieldError ? true : undefined}
                aria-describedby={fieldError ? 'kyc-country-error' : 'kyc-country-helper'}
              />
              {fieldError ? (
                <span id="kyc-country-error" className="text-xs text-danger" role="alert">
                  {fieldError}
                </span>
              ) : (
                <span id="kyc-country-helper" className="text-xs text-muted-foreground">
                  {t('app.kycPanel.countryHelper')}
                </span>
              )}
            </label>
            <div className="flex flex-wrap gap-3">
              <Button type="button" onClick={handleSubmitVerification} disabled={action !== null}>
                {action === 'start'
                  ? t('app.kycPanel.submittingVerification')
                  : t('app.kycPanel.startVerification')}
              </Button>
            </div>
          </div>
        ) : null}

        {isDev && kycStatus && !isApproved && hasPendingVerification ? (
          <div className="flex flex-wrap items-center gap-3 border-t border-border/40 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => handlePanelAction('approve', () => api.kyc.mockApprove())}
              disabled={action !== null}
            >
              {t('app.kycPanel.mockApprove')}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                handlePanelAction('reject', () =>
                  api.kyc.mockReject({
                    rejectionReason: 'Rejected by local mock flow',
                  }),
                )
              }
              disabled={action !== null}
            >
              {t('app.kycPanel.mockReject')}
            </Button>
            <span className="text-xs text-muted-foreground">{t('app.kycPanel.devOnly')}</span>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
