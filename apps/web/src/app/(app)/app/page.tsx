'use client';

import { ApiError } from '@wayly/sdk';
import type { DeliveryOrderSummary, KycStatusView } from '@wayly/types';
import { DeliveryOrderType, KycStatus } from '@wayly/types';
import { Button, Card, CardContent, CardHeader, CardTitle, Container, Input } from '@wayly/ui';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState, type FormEvent } from 'react';

import { LanguageSelect } from '@/components/language-select';
import { ModeSwitcher } from '@/components/app/mode-switcher';
import { useAppMode } from '@/lib/app-mode/app-mode-context';
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

function formatLocation(city: string | null, country: string | null): string {
  const parts = [city, country].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : '—';
}

function formatReward(amount: string | null, currency: string, noneLabel: string): string {
  return amount ? `${amount} ${currency}` : noneLabel;
}

export default function AppHomePage() {
  const router = useRouter();
  const { user, logout, refreshUser } = useAuth();
  const { mode } = useAppMode();
  const { t } = useI18n();
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [kycStatus, setKycStatus] = useState<KycStatusView | null>(null);
  const [kycLoading, setKycLoading] = useState(true);
  const [kycError, setKycError] = useState<string | null>(null);
  const [action, setAction] = useState<'start' | 'approve' | 'reject' | null>(null);
  const [orderTitle, setOrderTitle] = useState('');
  const [orderType, setOrderType] = useState<'LOCAL' | 'INTERNATIONAL'>('LOCAL');
  const [orderDescription, setOrderDescription] = useState('');
  const [pickupCountry, setPickupCountry] = useState('');
  const [pickupCity, setPickupCity] = useState('');
  const [dropoffCountry, setDropoffCountry] = useState('');
  const [dropoffCity, setDropoffCity] = useState('');
  const [orderCurrency, setOrderCurrency] = useState('USD');
  const [offeredRewardAmount, setOfferedRewardAmount] = useState('');
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState<{ id: string; status: string } | null>(null);
  const [draftOrders, setDraftOrders] = useState<DeliveryOrderSummary[]>([]);
  const [draftsLoading, setDraftsLoading] = useState(false);
  const [draftsError, setDraftsError] = useState<string | null>(null);
  const [publishingOrderId, setPublishingOrderId] = useState<string | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [publishSuccess, setPublishSuccess] = useState(false);

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

  const isApproved = kycStatus?.verified && kycStatus?.kycStatus === KycStatus.APPROVED;

  const loadDraftOrders = useCallback(async () => {
    setDraftsLoading(true);
    setDraftsError(null);
    try {
      const result = await api.orders.list({ status: 'DRAFT' });
      setDraftOrders(result.items);
    } catch {
      setDraftsError(t('app.orders.draftsLoadFailed'));
    } finally {
      setDraftsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (user && mode === 'sender' && isApproved) {
      void loadDraftOrders();
    }
  }, [user, mode, isApproved, loadDraftOrders]);

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

  const hasPendingVerification = kycStatus?.latestVerification?.status === KycStatus.PENDING;

  async function handlePublishDraft(orderId: string) {
    setPublishError(null);
    setPublishSuccess(false);
    setPublishingOrderId(orderId);
    try {
      await api.orders.publish(orderId);
      setPublishSuccess(true);
      await loadDraftOrders();
    } catch (err) {
      setPublishError(err instanceof ApiError ? err.message : t('app.orders.publishFailed'));
    } finally {
      setPublishingOrderId(null);
    }
  }

  async function handleCreateDraftOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setOrderError(null);
    setOrderSuccess(null);

    const title = orderTitle.trim();
    if (!title) {
      return;
    }

    setOrderSubmitting(true);
    try {
      const body: {
        type: typeof orderType;
        title: string;
        currency: string;
        description?: string;
        pickupCountry?: string;
        pickupCity?: string;
        dropoffCountry?: string;
        dropoffCity?: string;
        offeredRewardAmount?: number;
      } = {
        type: orderType,
        title,
        currency: orderCurrency.trim() || 'USD',
      };
      const description = orderDescription.trim();
      if (description) body.description = description;
      const pickupCountryValue = pickupCountry.trim();
      if (pickupCountryValue) body.pickupCountry = pickupCountryValue;
      const pickupCityValue = pickupCity.trim();
      if (pickupCityValue) body.pickupCity = pickupCityValue;
      const dropoffCountryValue = dropoffCountry.trim();
      if (dropoffCountryValue) body.dropoffCountry = dropoffCountryValue;
      const dropoffCityValue = dropoffCity.trim();
      if (dropoffCityValue) body.dropoffCity = dropoffCityValue;
      const rewardRaw = offeredRewardAmount.trim();
      if (rewardRaw) {
        const reward = Number(rewardRaw);
        if (!Number.isNaN(reward)) {
          body.offeredRewardAmount = reward;
        }
      }

      const created = await api.orders.create(body);
      setOrderSuccess({ id: created.id, status: created.status });
      setOrderTitle('');
      setOrderDescription('');
      setPickupCountry('');
      setPickupCity('');
      setDropoffCountry('');
      setDropoffCity('');
      setOfferedRewardAmount('');
      await loadDraftOrders();
    } catch (err) {
      setOrderError(err instanceof ApiError ? err.message : t('app.orders.createFailed'));
    } finally {
      setOrderSubmitting(false);
    }
  }

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

        <ModeSwitcher />

        <Card>
          <CardHeader>
            <CardTitle>
              {mode === 'sender'
                ? t('app.mode.senderDashboard.title')
                : t('app.mode.waylerDashboard.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              {mode === 'sender'
                ? t('app.mode.senderDashboard.description')
                : t('app.mode.waylerDashboard.description')}
            </p>
            {!kycLoading && !isApproved ? (
              <p className="rounded-md border border-accent/30 bg-accent/10 px-3 py-2 text-sm text-foreground">
                {mode === 'sender'
                  ? t('app.mode.senderDashboard.kycRequired')
                  : t('app.mode.waylerDashboard.kycRequired')}
              </p>
            ) : null}
            {mode === 'wayler' ? (
              <div>
                <Button disabled>{t('app.mode.waylerDashboard.browseRequests')}</Button>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {mode === 'sender' ? (
          <>
            <Card>
              <CardHeader>
                <CardTitle>{t('app.orders.createTitle')}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <p className="text-sm text-muted-foreground">{t('app.orders.createDescription')}</p>
                {!kycLoading && !isApproved ? (
                  <p className="rounded-md border border-accent/30 bg-accent/10 px-3 py-2 text-sm text-foreground">
                    {t('app.orders.kycRequiredNote')}
                  </p>
                ) : null}
                {orderError ? (
                  <p className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
                    {orderError}
                  </p>
                ) : null}
                {orderSuccess ? (
                  <p
                    className="rounded-md border border-accent/30 bg-accent/10 px-3 py-2 text-sm text-foreground"
                    role="status"
                  >
                    {t('app.orders.createSuccess')}{' '}
                    <span className="font-mono text-xs">
                      {orderSuccess.id} ({orderSuccess.status})
                    </span>
                  </p>
                ) : null}
                <form className="flex flex-col gap-4" onSubmit={handleCreateDraftOrder}>
                  <label className="flex flex-col gap-1.5 text-sm">
                    <span className="font-medium">{t('app.orders.fieldTitle')}</span>
                    <Input
                      value={orderTitle}
                      onChange={(e) => setOrderTitle(e.target.value)}
                      required
                      disabled={!isApproved || orderSubmitting}
                    />
                  </label>
                  <label className="flex flex-col gap-1.5 text-sm">
                    <span className="font-medium">{t('app.orders.fieldType')}</span>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={orderType}
                      onChange={(e) => setOrderType(e.target.value as 'LOCAL' | 'INTERNATIONAL')}
                      disabled={!isApproved || orderSubmitting}
                    >
                      <option value={DeliveryOrderType.LOCAL}>{t('app.orders.typeLocal')}</option>
                      <option value={DeliveryOrderType.INTERNATIONAL}>
                        {t('app.orders.typeInternational')}
                      </option>
                    </select>
                  </label>
                  <label className="flex flex-col gap-1.5 text-sm">
                    <span className="font-medium">{t('app.orders.fieldDescription')}</span>
                    <Input
                      value={orderDescription}
                      onChange={(e) => setOrderDescription(e.target.value)}
                      disabled={!isApproved || orderSubmitting}
                    />
                  </label>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="flex flex-col gap-1.5 text-sm">
                      <span className="font-medium">{t('app.orders.fieldPickupCountry')}</span>
                      <Input
                        value={pickupCountry}
                        onChange={(e) => setPickupCountry(e.target.value)}
                        disabled={!isApproved || orderSubmitting}
                      />
                    </label>
                    <label className="flex flex-col gap-1.5 text-sm">
                      <span className="font-medium">{t('app.orders.fieldPickupCity')}</span>
                      <Input
                        value={pickupCity}
                        onChange={(e) => setPickupCity(e.target.value)}
                        disabled={!isApproved || orderSubmitting}
                      />
                    </label>
                    <label className="flex flex-col gap-1.5 text-sm">
                      <span className="font-medium">{t('app.orders.fieldDropoffCountry')}</span>
                      <Input
                        value={dropoffCountry}
                        onChange={(e) => setDropoffCountry(e.target.value)}
                        disabled={!isApproved || orderSubmitting}
                      />
                    </label>
                    <label className="flex flex-col gap-1.5 text-sm">
                      <span className="font-medium">{t('app.orders.fieldDropoffCity')}</span>
                      <Input
                        value={dropoffCity}
                        onChange={(e) => setDropoffCity(e.target.value)}
                        disabled={!isApproved || orderSubmitting}
                      />
                    </label>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="flex flex-col gap-1.5 text-sm">
                      <span className="font-medium">{t('app.orders.fieldCurrency')}</span>
                      <Input
                        value={orderCurrency}
                        onChange={(e) => setOrderCurrency(e.target.value)}
                        disabled={!isApproved || orderSubmitting}
                      />
                    </label>
                    <label className="flex flex-col gap-1.5 text-sm">
                      <span className="font-medium">{t('app.orders.fieldReward')}</span>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        value={offeredRewardAmount}
                        onChange={(e) => setOfferedRewardAmount(e.target.value)}
                        disabled={!isApproved || orderSubmitting}
                      />
                    </label>
                  </div>
                  <Button
                    type="submit"
                    disabled={!isApproved || orderSubmitting || !orderTitle.trim()}
                  >
                    {orderSubmitting ? t('app.orders.submitting') : t('app.orders.submitCreate')}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('app.orders.draftsTitle')}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <p className="text-sm text-muted-foreground">{t('app.orders.publishedNote')}</p>
                {publishError ? (
                  <p className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
                    {publishError}
                  </p>
                ) : null}
                {publishSuccess ? (
                  <p
                    className="rounded-md border border-accent/30 bg-accent/10 px-3 py-2 text-sm text-foreground"
                    role="status"
                  >
                    {t('app.orders.publishSuccess')}
                  </p>
                ) : null}
                {draftsLoading ? (
                  <p className="text-sm text-muted-foreground">{t('app.orders.draftsLoading')}</p>
                ) : draftsError ? (
                  <p className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
                    {draftsError}
                  </p>
                ) : draftOrders.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t('app.orders.draftsEmpty')}</p>
                ) : (
                  <ul className="flex flex-col gap-4">
                    {draftOrders.map((order) => (
                      <li
                        key={order.id}
                        className="rounded-lg border border-border/60 px-4 py-3 text-sm"
                      >
                        <p className="font-medium">{order.title}</p>
                        <p className="text-muted-foreground">{order.type}</p>
                        <dl className="mt-2 flex flex-col gap-1">
                          <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                            <dt className="text-muted-foreground">{t('app.orders.labelRoute')}</dt>
                            <dd>
                              {formatLocation(order.pickupCity, order.pickupCountry)}{' '}
                              {t('app.orders.routeSeparator')}{' '}
                              {formatLocation(order.dropoffCity, order.dropoffCountry)}
                            </dd>
                          </div>
                          <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                            <dt className="text-muted-foreground">{t('app.orders.labelReward')}</dt>
                            <dd>
                              {formatReward(
                                order.offeredRewardAmount,
                                order.currency,
                                t('app.orders.rewardNone'),
                              )}
                            </dd>
                          </div>
                          <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                            <dt className="text-muted-foreground">
                              {t('app.orders.labelCreatedAt')}
                            </dt>
                            <dd>{new Date(order.createdAt).toLocaleString()}</dd>
                          </div>
                          <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                            <dt className="text-muted-foreground">{t('app.orders.labelStatus')}</dt>
                            <dd>{order.status}</dd>
                          </div>
                        </dl>
                        <div className="mt-3">
                          <Button
                            variant="secondary"
                            size="sm"
                            disabled={!isApproved || publishingOrderId !== null}
                            onClick={() => void handlePublishDraft(order.id)}
                          >
                            {publishingOrderId === order.id
                              ? t('app.orders.publishing')
                              : t('app.orders.publish')}
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </>
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
