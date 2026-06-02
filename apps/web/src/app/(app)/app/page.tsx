'use client';

import { ApiError } from '@wayly/sdk';
import type { KycStatusView } from '@wayly/types';
import { KycStatus } from '@wayly/types';
import { Button, Card, CardContent, CardHeader, CardTitle, Container } from '@wayly/ui';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { LanguageSelect } from '@/components/language-select';
import { useAuth } from '@/lib/auth/auth-context';
import { useI18n } from '@/lib/i18n/i18n-context';
import { api } from '@/lib/sdk';

const isDev = process.env.NODE_ENV !== 'production';

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium">{value}</dd>
    </div>
  );
}

function flagLabel(value: boolean, yes: string, no: string): string {
  return value ? yes : no;
}

export default function AppHomePage() {
  const router = useRouter();
  const { user, logout, refreshUser } = useAuth();
  const { t } = useI18n();
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [kycStatus, setKycStatus] = useState<KycStatusView | null>(null);
  const [kycLoading, setKycLoading] = useState(true);
  const [kycError, setKycError] = useState<string | null>(null);
  const [action, setAction] = useState<'start' | 'approve' | 'reject' | null>(null);

  const loadKycStatus = useCallback(async () => {
    setKycLoading(true);
    setKycError(null);
    try {
      const status = await api.kyc.status();
      setKycStatus(status);
    } catch {
      setKycError(t('app.kycPanel.loadFailed'));
    } finally {
      setKycLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (user) {
      void loadKycStatus();
    }
  }, [user, loadKycStatus]);

  if (!user) {
    return null;
  }

  async function handleLogout() {
    setError(null);
    setLoggingOut(true);
    try {
      await logout();
      router.replace('/login');
    } catch {
      setError(t('app.signOutFailed'));
    } finally {
      setLoggingOut(false);
    }
  }

  async function handleKycAction(
    type: 'start' | 'approve' | 'reject',
    run: () => Promise<KycStatusView | void>,
  ) {
    setError(null);
    setKycError(null);
    setAction(type);
    try {
      const result = await run();
      if (result) {
        setKycStatus(result);
      } else {
        await loadKycStatus();
      }
      await refreshUser();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : t('app.kycPanel.actionFailed');
      setKycError(message);
    } finally {
      setAction(null);
    }
  }

  const isApproved = kycStatus?.kycStatus === KycStatus.APPROVED;
  const hasPendingVerification = kycStatus?.latestVerification?.status === KycStatus.PENDING;

  return (
    <div className="border-b border-border/60 bg-background">
      <Container className="flex flex-col gap-8 py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{t('app.signedInAs')}</p>
            <h1 className="font-display text-2xl font-bold tracking-tight">{user.displayName}</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <LanguageSelect />
            <Button variant="outline" asChild>
              <Link href="/">{t('common.backToHome')}</Link>
            </Button>
            <Button variant="secondary" onClick={handleLogout} disabled={loggingOut}>
              {loggingOut ? t('app.signingOut') : t('app.signOut')}
            </Button>
          </div>
        </div>

        {error ? (
          <p className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
            {error}
          </p>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>{t('app.yourAccount')}</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="flex flex-col gap-4">
              <StatusRow label={t('common.email')} value={user.email} />
              <StatusRow label={t('common.displayName')} value={user.displayName} />
              <StatusRow label={t('app.roles')} value={user.roles.join(', ') || t('common.none')} />
              <StatusRow
                label={t('app.verified')}
                value={user.verified ? t('common.yes') : t('common.no')}
              />
              <StatusRow label={t('app.kycStatus')} value={user.kycStatus} />
              <StatusRow
                label={t('app.phoneVerified')}
                value={user.phoneVerified ? t('common.yes') : t('common.no')}
              />
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('app.kycPanel.title')}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {kycLoading ? (
              <p className="text-sm text-muted-foreground">{t('app.kycPanel.loading')}</p>
            ) : kycStatus ? (
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

            {kycError ? (
              <p className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
                {kycError}
              </p>
            ) : null}

            {isApproved ? (
              <p className="text-sm text-muted-foreground">{t('app.kycPanel.approvedHelper')}</p>
            ) : null}

            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() =>
                  handleKycAction('start', async () => {
                    await api.kyc.start({
                      country: user.country ?? 'US',
                      levelName: 'basic-kyc',
                    });
                  })
                }
                disabled={action !== null || isApproved}
              >
                {action === 'start'
                  ? t('app.kycPanel.starting')
                  : t('app.kycPanel.startVerification')}
              </Button>

              {isDev ? (
                <>
                  <Button
                    variant="secondary"
                    onClick={() => handleKycAction('approve', () => api.kyc.mockApprove())}
                    disabled={action !== null || !hasPendingVerification}
                  >
                    {t('app.kycPanel.mockApprove')}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      handleKycAction('reject', () =>
                        api.kyc.mockReject({
                          rejectionReason: 'Rejected by local mock flow',
                        }),
                      )
                    }
                    disabled={action !== null || !hasPendingVerification}
                  >
                    {t('app.kycPanel.mockReject')}
                  </Button>
                  <span className="self-center text-xs text-muted-foreground">
                    {t('app.kycPanel.devOnly')}
                  </span>
                </>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <div
          className="rounded-xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-foreground"
          role="status"
        >
          {t('app.kycNotice')}
        </div>

        <p className="text-sm text-muted-foreground">{t('app.placeholderNotice')}</p>
      </Container>
    </div>
  );
}
