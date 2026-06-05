'use client';

import { ApiError } from '@wayly/sdk';
import type { AcceptedDeliveryOrderSummary, OrdersListQuery } from '@wayly/sdk';
import type { DeliveryOrderSummary, KycStatusView } from '@wayly/types';
import { DeliveryOrderStatus, DeliveryOrderType, KycStatus } from '@wayly/types';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Container,
  Input,
  Skeleton,
} from '@wayly/ui';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';

import type { WaylerMapLabels } from '@/components/wayler-map';

import { LanguageSelect } from '@/components/language-select';
import { ModeSwitcher } from '@/components/app/mode-switcher';
import { useAppMode } from '@/lib/app-mode/app-mode-context';
import { useAuth } from '@/lib/auth/auth-context';
import { useI18n } from '@/lib/i18n/i18n-context';
import type { TranslationKey } from '@/lib/i18n/dictionaries';
import { api } from '@/lib/sdk';
import { cn } from '@/lib/utils';

const isDev = process.env.NODE_ENV !== 'production';

const FEED_SELECT_CLASS =
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm';

type FeedSort = 'rewardDesc' | 'publishedDesc' | 'routeAsc';

type SenderAcceptedOrderRow = DeliveryOrderSummary & {
  acceptedAt: string | null;
  deliveredAt: string | null;
};

const SENDER_LIFECYCLE_STATUSES = new Set<DeliveryOrderSummary['status']>([
  DeliveryOrderStatus.ACCEPTED,
  DeliveryOrderStatus.IN_TRANSIT,
  DeliveryOrderStatus.DELIVERED,
]);

const FEED_EXIT_MS = 280;
const SENDER_LIST_LIMIT = 100;

const SENDER_ORDER_CARD_CLASS = cn(
  'rounded-lg border border-border/60 px-4 py-3 text-sm',
  'transition-all duration-200 ease-out hover:shadow-md hover:scale-[1.01]',
  'wayly-feed-item-enter',
);

const WaylerMap = dynamic(() => import('@/components/wayler-map').then((mod) => mod.WaylerMap), {
  ssr: false,
});

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

function canAcceptOpenOrder(
  order: DeliveryOrderSummary,
  currentUserId: string,
  kycApproved: boolean,
): boolean {
  return kycApproved && order.senderId !== currentUserId;
}

function parseRewardAmount(amount: string | null): number | null {
  if (!amount) {
    return null;
  }
  const value = Number(amount);
  return Number.isFinite(value) ? value : null;
}

function routeSortKey(order: DeliveryOrderSummary): string {
  const pickup = [order.pickupCity, order.pickupCountry].filter(Boolean).join(', ');
  const dropoff = [order.dropoffCity, order.dropoffCountry].filter(Boolean).join(', ');
  return `${pickup} → ${dropoff}`.toLowerCase();
}

function sortFeedOrders(orders: DeliveryOrderSummary[], sort: FeedSort): DeliveryOrderSummary[] {
  const copy = [...orders];
  if (sort === 'rewardDesc') {
    copy.sort((a, b) => {
      const rewardA = parseRewardAmount(a.offeredRewardAmount) ?? -Infinity;
      const rewardB = parseRewardAmount(b.offeredRewardAmount) ?? -Infinity;
      return rewardB - rewardA;
    });
    return copy;
  }
  if (sort === 'publishedDesc') {
    copy.sort((a, b) => {
      const timeA = new Date(a.publishedAt ?? a.createdAt).getTime();
      const timeB = new Date(b.publishedAt ?? b.createdAt).getTime();
      return timeB - timeA;
    });
    return copy;
  }
  copy.sort((a, b) => routeSortKey(a).localeCompare(routeSortKey(b)));
  return copy;
}

function filterFeedOrdersByReward(
  orders: DeliveryOrderSummary[],
  minRaw: string,
  maxRaw: string,
): DeliveryOrderSummary[] {
  const minText = minRaw.trim();
  const maxText = maxRaw.trim();
  if (!minText && !maxText) {
    return orders;
  }
  const min = minText ? Number(minText) : null;
  const max = maxText ? Number(maxText) : null;
  return orders.filter((order) => {
    const amount = parseRewardAmount(order.offeredRewardAmount);
    if (amount === null) {
      return false;
    }
    if (min !== null && !Number.isNaN(min) && amount < min) {
      return false;
    }
    if (max !== null && !Number.isNaN(max) && amount > max) {
      return false;
    }
    return true;
  });
}

function OrdersListSkeleton() {
  return (
    <ul className="flex flex-col gap-4" aria-hidden>
      {[0, 1, 2].map((key) => (
        <li key={key} className="rounded-lg border border-border/60 px-4 py-3">
          <Skeleton className="mb-2 h-4 w-3/5 max-w-xs" />
          <Skeleton className="mb-3 h-3 w-24" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
            <Skeleton className="h-3 w-2/5" />
          </div>
        </li>
      ))}
    </ul>
  );
}

function FeedOrdersSkeleton() {
  return <OrdersListSkeleton />;
}

function SenderOrdersSkeleton() {
  return <OrdersListSkeleton />;
}

function AcceptedOrdersSkeleton() {
  return (
    <ul className="flex flex-col gap-4" aria-hidden>
      {[0, 1].map((key) => (
        <li key={key} className="rounded-lg border border-border/60 px-4 py-3">
          <Skeleton className="mb-2 h-4 w-3/5 max-w-xs" />
          <Skeleton className="mb-3 h-3 w-24" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
            <Skeleton className="h-3 w-2/5" />
          </div>
        </li>
      ))}
    </ul>
  );
}

function senderStatusBadgeClass(status: DeliveryOrderSummary['status']): string {
  switch (status) {
    case DeliveryOrderStatus.ACCEPTED:
      return 'border-accent/40 bg-accent/15 text-foreground';
    case DeliveryOrderStatus.IN_TRANSIT:
      return 'border-primary/40 bg-primary/10 text-foreground';
    case DeliveryOrderStatus.DELIVERED:
      return 'border-emerald-500/40 bg-emerald-500/10 text-foreground';
    default:
      return 'border-border bg-muted text-muted-foreground';
  }
}

function senderStatusLabel(
  status: DeliveryOrderSummary['status'],
  t: (key: TranslationKey) => string,
): string {
  switch (status) {
    case DeliveryOrderStatus.ACCEPTED:
      return t('app.senderPanel.statusAccepted');
    case DeliveryOrderStatus.IN_TRANSIT:
      return t('app.senderPanel.statusInTransit');
    case DeliveryOrderStatus.DELIVERED:
      return t('app.senderPanel.statusDelivered');
    default:
      return status;
  }
}

function senderStatusNote(
  status: DeliveryOrderSummary['status'],
  t: (key: TranslationKey) => string,
): string | null {
  switch (status) {
    case DeliveryOrderStatus.ACCEPTED:
      return t('app.senderPanel.acceptedNote');
    case DeliveryOrderStatus.IN_TRANSIT:
      return t('app.senderPanel.inTransitNote');
    case DeliveryOrderStatus.DELIVERED:
      return t('app.senderPanel.deliveredNote');
    default:
      return null;
  }
}

function resolveAcceptError(err: unknown, t: (key: TranslationKey) => string): string {
  if (!(err instanceof ApiError)) {
    return t('app.waylerFeed.acceptFailed');
  }
  const message = err.message.toLowerCase();
  if (message.includes('own delivery order')) {
    return t('app.waylerFeed.senderCannotAcceptOwn');
  }
  if (message.includes('already been accepted') || message.includes('only open')) {
    return t('app.waylerFeed.acceptAlreadyAccepted');
  }
  return err.message || t('app.waylerFeed.acceptFailed');
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
  const [publishedOrders, setPublishedOrders] = useState<DeliveryOrderSummary[]>([]);
  const [publishedLoading, setPublishedLoading] = useState(false);
  const [publishedError, setPublishedError] = useState<string | null>(null);
  const [senderAcceptedOrders, setSenderAcceptedOrders] = useState<SenderAcceptedOrderRow[]>([]);
  const [senderAcceptedLoading, setSenderAcceptedLoading] = useState(false);
  const [senderAcceptedError, setSenderAcceptedError] = useState<string | null>(null);
  const [publishingOrderId, setPublishingOrderId] = useState<string | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [exitingDraftIds, setExitingDraftIds] = useState<ReadonlySet<string>>(() => new Set());
  const [feedOrders, setFeedOrders] = useState<DeliveryOrderSummary[]>([]);
  const [feedLoading, setFeedLoading] = useState(false);
  const [feedError, setFeedError] = useState<string | null>(null);
  const [feedType, setFeedType] = useState<'' | 'LOCAL' | 'INTERNATIONAL'>('');
  const [feedRewardMin, setFeedRewardMin] = useState('');
  const [feedRewardMax, setFeedRewardMax] = useState('');
  const [feedPickupCountry, setFeedPickupCountry] = useState('');
  const [feedPickupCity, setFeedPickupCity] = useState('');
  const [feedDropoffCountry, setFeedDropoffCountry] = useState('');
  const [feedDropoffCity, setFeedDropoffCity] = useState('');
  const [feedSort, setFeedSort] = useState<FeedSort>('publishedDesc');
  const [exitingOrderIds, setExitingOrderIds] = useState<ReadonlySet<string>>(() => new Set());
  const [acceptingOrderId, setAcceptingOrderId] = useState<string | null>(null);
  const [acceptError, setAcceptError] = useState<string | null>(null);
  const [acceptSuccess, setAcceptSuccess] = useState(false);
  const [acceptedOrders, setAcceptedOrders] = useState<AcceptedDeliveryOrderSummary[]>([]);
  const [acceptedLoading, setAcceptedLoading] = useState(false);
  const [acceptedError, setAcceptedError] = useState<string | null>(null);
  const [progressingOrderId, setProgressingOrderId] = useState<string | null>(null);
  const [progressAction, setProgressAction] = useState<'start-transit' | 'mark-delivered' | null>(
    null,
  );
  const [progressError, setProgressError] = useState<string | null>(null);
  const [progressSuccess, setProgressSuccess] = useState<'transit' | 'delivered' | null>(null);

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
  const canViewSenderOrders =
    Boolean(user?.verified) && kycStatus?.kycStatus === KycStatus.APPROVED;

  const loadDraftOrders = useCallback(async () => {
    setDraftsLoading(true);
    setDraftsError(null);
    try {
      const result = await api.orders.mine({ status: 'DRAFT' });
      setDraftOrders(result.items);
    } catch {
      setDraftsError(t('app.senderPanel.draftsLoadFailed'));
    } finally {
      setDraftsLoading(false);
    }
  }, [t]);

  const loadPublishedOrders = useCallback(async () => {
    setPublishedLoading(true);
    setPublishedError(null);
    try {
      const result = await api.orders.mine({ status: 'OPEN', limit: SENDER_LIST_LIMIT });
      const items = [...result.items];
      items.sort((a, b) => {
        const timeA = new Date(a.publishedAt ?? a.createdAt).getTime();
        const timeB = new Date(b.publishedAt ?? b.createdAt).getTime();
        return timeB - timeA;
      });
      setPublishedOrders(items);
    } catch {
      setPublishedError(t('app.senderPanel.publishedLoadFailed'));
    } finally {
      setPublishedLoading(false);
    }
  }, [t]);

  const loadSenderAcceptedOrders = useCallback(async () => {
    setSenderAcceptedLoading(true);
    setSenderAcceptedError(null);
    try {
      const [acceptedResult, inTransitResult, deliveredResult] = await Promise.all([
        api.orders.mine({ status: 'ACCEPTED', limit: SENDER_LIST_LIMIT }),
        api.orders.mine({ status: 'IN_TRANSIT', limit: SENDER_LIST_LIMIT }),
        api.orders.mine({ status: 'DELIVERED', limit: SENDER_LIST_LIMIT }),
      ]);
      const items = [
        ...acceptedResult.items,
        ...inTransitResult.items,
        ...deliveredResult.items,
      ].filter((order) => SENDER_LIFECYCLE_STATUSES.has(order.status));
      const withTimestamps = await Promise.all(
        items.map(async (order) => {
          const detail = await api.orders.detail(order.id);
          return {
            ...order,
            acceptedAt: detail.acceptedAt,
            deliveredAt: detail.deliveredAt,
          };
        }),
      );
      withTimestamps.sort((a, b) => {
        const timeA = a.acceptedAt ? new Date(a.acceptedAt).getTime() : 0;
        const timeB = b.acceptedAt ? new Date(b.acceptedAt).getTime() : 0;
        return timeB - timeA;
      });
      setSenderAcceptedOrders(withTimestamps);
    } catch {
      setSenderAcceptedError(t('app.senderPanel.acceptedLoadFailed'));
    } finally {
      setSenderAcceptedLoading(false);
    }
  }, [t]);

  const loadFeedOrders = useCallback(async () => {
    setFeedLoading(true);
    setFeedError(null);
    try {
      const query: OrdersListQuery = { status: 'OPEN' };
      if (feedType) {
        query.type = feedType;
      }
      const pickupCountryValue = feedPickupCountry.trim();
      if (pickupCountryValue) {
        query.pickupCountry = pickupCountryValue;
      }
      const pickupCityValue = feedPickupCity.trim();
      if (pickupCityValue) {
        query.pickupCity = pickupCityValue;
      }
      const dropoffCountryValue = feedDropoffCountry.trim();
      if (dropoffCountryValue) {
        query.dropoffCountry = dropoffCountryValue;
      }
      const dropoffCityValue = feedDropoffCity.trim();
      if (dropoffCityValue) {
        query.dropoffCity = dropoffCityValue;
      }
      const result = await api.orders.list(query);
      setFeedOrders(result.items);
    } catch {
      setFeedError(t('app.waylerFeed.loadFailed'));
    } finally {
      setFeedLoading(false);
    }
  }, [t, feedType, feedPickupCountry, feedPickupCity, feedDropoffCountry, feedDropoffCity]);

  const displayedFeedOrders = useMemo(() => {
    const rewardFiltered = filterFeedOrdersByReward(feedOrders, feedRewardMin, feedRewardMax);
    return sortFeedOrders(rewardFiltered, feedSort);
  }, [feedOrders, feedRewardMin, feedRewardMax, feedSort]);

  const waylerMapLabels = useMemo(
    (): WaylerMapLabels => ({
      pickup: t('app.waylerFeed.map.pickup'),
      dropoff: t('app.waylerFeed.map.dropoff'),
      route: t('app.waylerFeed.map.route'),
      mapLoading: t('app.waylerFeed.map.mapLoading'),
      mapLoadFailed: t('app.waylerFeed.map.mapLoadFailed'),
      mapUnavailable: t('app.waylerFeed.map.mapUnavailable'),
    }),
    [t],
  );

  const loadAcceptedOrders = useCallback(async () => {
    setAcceptedLoading(true);
    setAcceptedError(null);
    try {
      const items = await api.orders.accepted();
      setAcceptedOrders(items);
    } catch {
      setAcceptedError(t('app.waylerFeed.acceptedPanel.loadFailed'));
    } finally {
      setAcceptedLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (user && mode === 'sender' && canViewSenderOrders) {
      void loadDraftOrders();
      void loadPublishedOrders();
      void loadSenderAcceptedOrders();
    }
  }, [
    user,
    mode,
    canViewSenderOrders,
    loadDraftOrders,
    loadPublishedOrders,
    loadSenderAcceptedOrders,
  ]);

  useEffect(() => {
    if (user && mode === 'wayler' && isApproved) {
      void loadAcceptedOrders();
    }
  }, [user, mode, isApproved, loadAcceptedOrders]);

  useEffect(() => {
    if (!user || mode !== 'wayler' || !isApproved) {
      return;
    }
    const timer = setTimeout(() => {
      void loadFeedOrders();
    }, 350);
    return () => clearTimeout(timer);
  }, [user, mode, isApproved, loadFeedOrders]);

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

  async function handleStartTransit(orderId: string) {
    setProgressError(null);
    setProgressSuccess(null);
    setProgressingOrderId(orderId);
    setProgressAction('start-transit');
    try {
      await api.orders.startTransit(orderId);
      setProgressSuccess('transit');
      await loadAcceptedOrders();
    } catch (err) {
      setProgressError(
        err instanceof ApiError
          ? err.message || t('app.waylerFeed.acceptedPanel.progressFailed')
          : t('app.waylerFeed.acceptedPanel.progressFailed'),
      );
    } finally {
      setProgressingOrderId(null);
      setProgressAction(null);
    }
  }

  async function handleMarkDelivered(orderId: string) {
    setProgressError(null);
    setProgressSuccess(null);
    setProgressingOrderId(orderId);
    setProgressAction('mark-delivered');
    try {
      await api.orders.markDelivered(orderId);
      setProgressSuccess('delivered');
      await loadAcceptedOrders();
    } catch (err) {
      setProgressError(
        err instanceof ApiError
          ? err.message || t('app.waylerFeed.acceptedPanel.progressFailed')
          : t('app.waylerFeed.acceptedPanel.progressFailed'),
      );
    } finally {
      setProgressingOrderId(null);
      setProgressAction(null);
    }
  }

  async function handleAcceptOrder(orderId: string) {
    setAcceptError(null);
    setAcceptSuccess(false);
    setAcceptingOrderId(orderId);
    try {
      await api.orders.accept(orderId);
      setAcceptSuccess(true);
      setExitingOrderIds((prev) => new Set(prev).add(orderId));
      await new Promise((resolve) => setTimeout(resolve, FEED_EXIT_MS));
      setFeedOrders((prev) => prev.filter((order) => order.id !== orderId));
      setExitingOrderIds((prev) => {
        const next = new Set(prev);
        next.delete(orderId);
        return next;
      });
      await Promise.all([loadFeedOrders(), loadAcceptedOrders()]);
    } catch (err) {
      setAcceptError(resolveAcceptError(err, t));
    } finally {
      setAcceptingOrderId(null);
    }
  }

  async function handlePublishDraft(orderId: string) {
    setPublishError(null);
    setPublishSuccess(false);
    setPublishingOrderId(orderId);
    try {
      await api.orders.publish(orderId);
      setPublishSuccess(true);
      setExitingDraftIds((prev) => new Set(prev).add(orderId));
      await new Promise((resolve) => setTimeout(resolve, FEED_EXIT_MS));
      setDraftOrders((prev) => prev.filter((order) => order.id !== orderId));
      setExitingDraftIds((prev) => {
        const next = new Set(prev);
        next.delete(orderId);
        return next;
      });
      await Promise.all([loadDraftOrders(), loadPublishedOrders()]);
    } catch (err) {
      setPublishError(err instanceof ApiError ? err.message : t('app.senderPanel.publishFailed'));
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
          </CardContent>
        </Card>

        {mode === 'wayler' ? (
          <>
            <Card>
              <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle>{t('app.waylerFeed.title')}</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!isApproved || feedLoading}
                  onClick={() => void loadFeedOrders()}
                >
                  {t('app.waylerFeed.refresh')}
                </Button>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {!kycLoading && !isApproved ? (
                  <p className="rounded-md border border-accent/30 bg-accent/10 px-3 py-2 text-sm text-foreground">
                    {t('app.waylerFeed.kycRequired')}
                  </p>
                ) : null}
                {isApproved ? (
                  <fieldset
                    className="flex flex-col gap-4 rounded-lg border border-border/60 p-4"
                    disabled={feedLoading}
                  >
                    <legend className="px-1 text-sm font-medium">
                      {t('app.waylerFeed.filtersTitle')}
                    </legend>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      <label className="flex flex-col gap-1.5 text-sm">
                        <span className="font-medium">{t('app.waylerFeed.filterStatus')}</span>
                        <select className={FEED_SELECT_CLASS} value="OPEN" disabled aria-readonly>
                          <option value="OPEN">{t('app.waylerFeed.filterStatusOpen')}</option>
                          <option value="ACCEPTED" disabled>
                            {t('app.waylerFeed.filterStatusAccepted')}
                          </option>
                        </select>
                      </label>
                      <label className="flex flex-col gap-1.5 text-sm">
                        <span className="font-medium">{t('app.waylerFeed.filterType')}</span>
                        <select
                          className={FEED_SELECT_CLASS}
                          value={feedType}
                          onChange={(e) =>
                            setFeedType(e.target.value as '' | 'LOCAL' | 'INTERNATIONAL')
                          }
                        >
                          <option value="">{t('app.waylerFeed.filterTypeAll')}</option>
                          <option value={DeliveryOrderType.LOCAL}>
                            {t('app.orders.typeLocal')}
                          </option>
                          <option value={DeliveryOrderType.INTERNATIONAL}>
                            {t('app.orders.typeInternational')}
                          </option>
                        </select>
                      </label>
                      <label className="flex flex-col gap-1.5 text-sm">
                        <span className="font-medium">{t('app.waylerFeed.sortLabel')}</span>
                        <select
                          className={FEED_SELECT_CLASS}
                          value={feedSort}
                          onChange={(e) => setFeedSort(e.target.value as FeedSort)}
                        >
                          <option value="rewardDesc">{t('app.waylerFeed.sortRewardDesc')}</option>
                          <option value="publishedDesc">
                            {t('app.waylerFeed.sortPublishedDesc')}
                          </option>
                          <option value="routeAsc">{t('app.waylerFeed.sortRouteAsc')}</option>
                        </select>
                      </label>
                      <label className="flex flex-col gap-1.5 text-sm">
                        <span className="font-medium">{t('app.waylerFeed.filterRewardMin')}</span>
                        <Input
                          type="number"
                          min={0}
                          step="any"
                          value={feedRewardMin}
                          onChange={(e) => setFeedRewardMin(e.target.value)}
                        />
                      </label>
                      <label className="flex flex-col gap-1.5 text-sm">
                        <span className="font-medium">{t('app.waylerFeed.filterRewardMax')}</span>
                        <Input
                          type="number"
                          min={0}
                          step="any"
                          value={feedRewardMax}
                          onChange={(e) => setFeedRewardMax(e.target.value)}
                        />
                      </label>
                      <label className="flex flex-col gap-1.5 text-sm">
                        <span className="font-medium">
                          {t('app.waylerFeed.filterPickupCountry')}
                        </span>
                        <Input
                          value={feedPickupCountry}
                          onChange={(e) => setFeedPickupCountry(e.target.value)}
                        />
                      </label>
                      <label className="flex flex-col gap-1.5 text-sm">
                        <span className="font-medium">{t('app.waylerFeed.filterPickupCity')}</span>
                        <Input
                          value={feedPickupCity}
                          onChange={(e) => setFeedPickupCity(e.target.value)}
                        />
                      </label>
                      <label className="flex flex-col gap-1.5 text-sm">
                        <span className="font-medium">
                          {t('app.waylerFeed.filterDropoffCountry')}
                        </span>
                        <Input
                          value={feedDropoffCountry}
                          onChange={(e) => setFeedDropoffCountry(e.target.value)}
                        />
                      </label>
                      <label className="flex flex-col gap-1.5 text-sm">
                        <span className="font-medium">{t('app.waylerFeed.filterDropoffCity')}</span>
                        <Input
                          value={feedDropoffCity}
                          onChange={(e) => setFeedDropoffCity(e.target.value)}
                        />
                      </label>
                    </div>
                  </fieldset>
                ) : null}
                {feedError ? (
                  <p className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
                    {feedError}
                  </p>
                ) : null}
                {acceptError ? (
                  <p className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
                    {acceptError}
                  </p>
                ) : null}
                {acceptSuccess ? (
                  <p
                    className="rounded-md border border-accent/30 bg-accent/10 px-3 py-2 text-sm text-foreground"
                    role="status"
                  >
                    {t('app.waylerFeed.acceptSuccess')}
                  </p>
                ) : null}
                {isApproved && feedLoading ? (
                  <>
                    <p className="sr-only">{t('app.waylerFeed.loading')}</p>
                    <FeedOrdersSkeleton />
                  </>
                ) : isApproved && feedOrders.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t('app.waylerFeed.empty')}</p>
                ) : isApproved && displayedFeedOrders.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {t('app.waylerFeed.emptyFiltered')}
                  </p>
                ) : isApproved ? (
                  <ul className="flex flex-col gap-4">
                    {displayedFeedOrders.map((order) => {
                      const isOwnOrder = order.senderId === user.id;
                      const canAccept = canAcceptOpenOrder(order, user.id, isApproved);
                      const isAccepting = acceptingOrderId === order.id;
                      const acceptDisabled = !canAccept || acceptingOrderId !== null;
                      const isExiting = exitingOrderIds.has(order.id);

                      return (
                        <li
                          key={order.id}
                          className={cn(
                            'rounded-lg border border-border/60 px-4 py-3 text-sm',
                            'transition-all duration-200 ease-out hover:shadow-md hover:scale-[1.01]',
                            isExiting ? 'wayly-feed-item-exit' : 'wayly-feed-item-enter',
                          )}
                        >
                          <p className="font-medium">{order.title}</p>
                          <p className="text-muted-foreground">{order.type}</p>
                          <WaylerMap
                            feedReady={!feedLoading}
                            pickupCity={order.pickupCity}
                            pickupCountry={order.pickupCountry}
                            dropoffCity={order.dropoffCity}
                            dropoffCountry={order.dropoffCountry}
                            labels={waylerMapLabels}
                            orderInfo={{
                              title: order.title,
                              type: order.type,
                              rewardText: formatReward(
                                order.offeredRewardAmount,
                                order.currency,
                                t('app.orders.rewardNone'),
                              ),
                              publishedText: new Date(
                                order.publishedAt ?? order.createdAt,
                              ).toLocaleString(),
                            }}
                          />
                          <dl className="mt-2 flex flex-col gap-1">
                            <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                              <dt className="text-muted-foreground">
                                {t('app.orders.labelRoute')}
                              </dt>
                              <dd>
                                {formatLocation(order.pickupCity, order.pickupCountry)}{' '}
                                {t('app.orders.routeSeparator')}{' '}
                                {formatLocation(order.dropoffCity, order.dropoffCountry)}
                              </dd>
                            </div>
                            <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                              <dt className="text-muted-foreground">
                                {t('app.orders.labelReward')}
                              </dt>
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
                                {t('app.waylerFeed.labelPublished')}
                              </dt>
                              <dd>
                                {new Date(order.publishedAt ?? order.createdAt).toLocaleString()}
                              </dd>
                            </div>
                            <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                              <dt className="text-muted-foreground">
                                {t('app.orders.labelStatus')}
                              </dt>
                              <dd>{t('app.waylerFeed.statusOpen')}</dd>
                            </div>
                          </dl>
                          <div className="mt-3 flex flex-col gap-2">
                            <Button
                              variant="secondary"
                              size="sm"
                              className="transition-all duration-200 ease-out"
                              disabled={acceptDisabled}
                              onClick={() => void handleAcceptOrder(order.id)}
                            >
                              {isAccepting
                                ? t('app.waylerFeed.accepting')
                                : t('app.waylerFeed.accept')}
                            </Button>
                            {isOwnOrder ? (
                              <p className="text-xs text-muted-foreground" role="note">
                                {t('app.waylerFeed.senderCannotAcceptOwn')}
                              </p>
                            ) : !isApproved ? (
                              <p className="text-xs text-muted-foreground" role="note">
                                {t('app.waylerFeed.acceptDisabledKyc')}
                              </p>
                            ) : null}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle>{t('app.waylerFeed.acceptedPanel.title')}</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!isApproved || acceptedLoading || progressingOrderId !== null}
                  onClick={() => void loadAcceptedOrders()}
                >
                  {t('app.waylerFeed.acceptedPanel.refresh')}
                </Button>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {!kycLoading && !isApproved ? (
                  <p className="rounded-md border border-accent/30 bg-accent/10 px-3 py-2 text-sm text-foreground">
                    {t('app.waylerFeed.kycRequired')}
                  </p>
                ) : null}
                {progressSuccess === 'transit' ? (
                  <p className="rounded-md border border-accent/30 bg-accent/10 px-3 py-2 text-sm text-foreground">
                    {t('app.waylerFeed.acceptedPanel.transitStarted')}
                  </p>
                ) : null}
                {progressSuccess === 'delivered' ? (
                  <p className="rounded-md border border-accent/30 bg-accent/10 px-3 py-2 text-sm text-foreground">
                    {t('app.waylerFeed.acceptedPanel.deliveredSuccess')}
                  </p>
                ) : null}
                {progressError ? (
                  <p className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
                    {progressError}
                  </p>
                ) : null}
                {acceptedError ? (
                  <p className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
                    {acceptedError}
                  </p>
                ) : null}
                {isApproved && acceptedLoading ? (
                  <>
                    <p className="sr-only">{t('app.waylerFeed.acceptedPanel.loading')}</p>
                    <AcceptedOrdersSkeleton />
                  </>
                ) : isApproved && acceptedOrders.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {t('app.waylerFeed.acceptedPanel.empty')}
                  </p>
                ) : isApproved ? (
                  <ul className="flex flex-col gap-4">
                    {acceptedOrders.map((order) => {
                      const isProgressing = progressingOrderId === order.id;
                      const progressDisabled = progressingOrderId !== null;

                      return (
                        <li
                          key={order.id}
                          className="rounded-lg border border-border/60 px-4 py-3 text-sm"
                        >
                          <p className="font-medium">{order.title}</p>
                          <p className="text-muted-foreground">{order.type}</p>
                          <dl className="mt-2 flex flex-col gap-1">
                            <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                              <dt className="text-muted-foreground">
                                {t('app.orders.labelRoute')}
                              </dt>
                              <dd>
                                {formatLocation(order.pickupCity, order.pickupCountry)}{' '}
                                {t('app.orders.routeSeparator')}{' '}
                                {formatLocation(order.dropoffCity, order.dropoffCountry)}
                              </dd>
                            </div>
                            <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                              <dt className="text-muted-foreground">
                                {t('app.orders.labelReward')}
                              </dt>
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
                                {t('app.waylerFeed.acceptedPanel.labelAcceptedAt')}
                              </dt>
                              <dd>
                                {order.acceptedAt
                                  ? new Date(order.acceptedAt).toLocaleString()
                                  : '—'}
                              </dd>
                            </div>
                            <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                              <dt className="text-muted-foreground">
                                {t('app.orders.labelStatus')}
                              </dt>
                              <dd>{order.status}</dd>
                            </div>
                          </dl>
                          {order.status === DeliveryOrderStatus.ACCEPTED ? (
                            <Button
                              className="mt-3 w-full sm:w-auto"
                              size="sm"
                              disabled={progressDisabled}
                              onClick={() => void handleStartTransit(order.id)}
                            >
                              {isProgressing && progressAction === 'start-transit'
                                ? t('app.waylerFeed.acceptedPanel.startingTransit')
                                : t('app.waylerFeed.acceptedPanel.startTransit')}
                            </Button>
                          ) : null}
                          {order.status === DeliveryOrderStatus.IN_TRANSIT ? (
                            <Button
                              className="mt-3 w-full sm:w-auto"
                              size="sm"
                              disabled={progressDisabled}
                              onClick={() => void handleMarkDelivered(order.id)}
                            >
                              {isProgressing && progressAction === 'mark-delivered'
                                ? t('app.waylerFeed.acceptedPanel.markingDelivered')
                                : t('app.waylerFeed.acceptedPanel.markDelivered')}
                            </Button>
                          ) : null}
                          {order.status === DeliveryOrderStatus.DELIVERED ? (
                            <p className="mt-3 text-sm text-muted-foreground">
                              {t('app.waylerFeed.acceptedPanel.delivered')}
                            </p>
                          ) : null}
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
              </CardContent>
            </Card>
          </>
        ) : null}

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
              <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle>{t('app.senderPanel.draftsTitle')}</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!canViewSenderOrders || draftsLoading}
                  onClick={() => void loadDraftOrders()}
                >
                  {t('app.senderPanel.refresh')}
                </Button>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {!kycLoading && !canViewSenderOrders ? (
                  <p className="rounded-md border border-accent/30 bg-accent/10 px-3 py-2 text-sm text-foreground">
                    {t('app.senderPanel.kycRequired')}
                  </p>
                ) : null}
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
                    {t('app.senderPanel.publishSuccess')}
                  </p>
                ) : null}
                {draftsError ? (
                  <p className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
                    {draftsError}
                  </p>
                ) : null}
                {canViewSenderOrders && draftsLoading ? (
                  <>
                    <p className="sr-only">{t('app.senderPanel.draftsLoading')}</p>
                    <SenderOrdersSkeleton />
                  </>
                ) : canViewSenderOrders && draftOrders.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {t('app.senderPanel.draftsEmpty')}
                  </p>
                ) : canViewSenderOrders ? (
                  <ul className="flex flex-col gap-4">
                    {draftOrders.map((order) => {
                      const isExitingDraft = exitingDraftIds.has(order.id);
                      return (
                        <li
                          key={order.id}
                          className={cn(
                            SENDER_ORDER_CARD_CLASS,
                            isExitingDraft && 'wayly-feed-item-exit',
                          )}
                        >
                          <p className="font-medium">{order.title}</p>
                          <p className="text-muted-foreground">{order.type}</p>
                          <dl className="mt-2 flex flex-col gap-1">
                            <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                              <dt className="text-muted-foreground">
                                {t('app.senderPanel.labelRoute')}
                              </dt>
                              <dd>
                                {formatLocation(order.pickupCity, order.pickupCountry)}{' '}
                                {t('app.orders.routeSeparator')}{' '}
                                {formatLocation(order.dropoffCity, order.dropoffCountry)}
                              </dd>
                            </div>
                            <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                              <dt className="text-muted-foreground">
                                {t('app.senderPanel.labelReward')}
                              </dt>
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
                                {t('app.senderPanel.labelCreatedAt')}
                              </dt>
                              <dd>{new Date(order.createdAt).toLocaleString()}</dd>
                            </div>
                          </dl>
                          <div className="mt-3">
                            <Button
                              variant="secondary"
                              size="sm"
                              className="transition-all duration-200 ease-out"
                              disabled={!canViewSenderOrders || publishingOrderId !== null}
                              onClick={() => void handlePublishDraft(order.id)}
                            >
                              {publishingOrderId === order.id
                                ? t('app.senderPanel.publishing')
                                : t('app.orders.publish')}
                            </Button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle>{t('app.senderPanel.publishedTitle')}</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!canViewSenderOrders || publishedLoading}
                  onClick={() => void loadPublishedOrders()}
                >
                  {t('app.senderPanel.refresh')}
                </Button>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {!kycLoading && !canViewSenderOrders ? (
                  <p className="rounded-md border border-accent/30 bg-accent/10 px-3 py-2 text-sm text-foreground">
                    {t('app.senderPanel.kycRequired')}
                  </p>
                ) : null}
                {publishedError ? (
                  <p className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
                    {publishedError}
                  </p>
                ) : null}
                {canViewSenderOrders && publishedLoading ? (
                  <>
                    <p className="sr-only">{t('app.senderPanel.publishedLoading')}</p>
                    <SenderOrdersSkeleton />
                  </>
                ) : canViewSenderOrders && publishedOrders.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {t('app.senderPanel.publishedEmpty')}
                  </p>
                ) : canViewSenderOrders ? (
                  <ul className="flex flex-col gap-4">
                    {publishedOrders.map((order) => (
                      <li key={order.id} className={SENDER_ORDER_CARD_CLASS}>
                        <p className="font-medium">{order.title}</p>
                        <p className="text-muted-foreground">{order.type}</p>
                        <dl className="mt-2 flex flex-col gap-1">
                          <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                            <dt className="text-muted-foreground">
                              {t('app.senderPanel.labelRoute')}
                            </dt>
                            <dd>
                              {formatLocation(order.pickupCity, order.pickupCountry)}{' '}
                              {t('app.orders.routeSeparator')}{' '}
                              {formatLocation(order.dropoffCity, order.dropoffCountry)}
                            </dd>
                          </div>
                          <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                            <dt className="text-muted-foreground">
                              {t('app.senderPanel.labelReward')}
                            </dt>
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
                              {t('app.senderPanel.labelPublishedAt')}
                            </dt>
                            <dd>
                              {new Date(order.publishedAt ?? order.createdAt).toLocaleString()}
                            </dd>
                          </div>
                          <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                            <dt className="text-muted-foreground">{t('app.orders.labelStatus')}</dt>
                            <dd>{t('app.senderPanel.statusOpen')}</dd>
                          </div>
                        </dl>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle>{t('app.senderPanel.acceptedTitle')}</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!canViewSenderOrders || senderAcceptedLoading}
                  onClick={() => void loadSenderAcceptedOrders()}
                >
                  {t('app.senderPanel.refresh')}
                </Button>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {!kycLoading && !canViewSenderOrders ? (
                  <p className="rounded-md border border-accent/30 bg-accent/10 px-3 py-2 text-sm text-foreground">
                    {t('app.senderPanel.kycRequired')}
                  </p>
                ) : null}
                {senderAcceptedError ? (
                  <p className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
                    {senderAcceptedError}
                  </p>
                ) : null}
                {canViewSenderOrders && senderAcceptedLoading ? (
                  <>
                    <p className="sr-only">{t('app.senderPanel.acceptedLoading')}</p>
                    <SenderOrdersSkeleton />
                  </>
                ) : canViewSenderOrders && senderAcceptedOrders.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {t('app.senderPanel.acceptedEmpty')}
                  </p>
                ) : canViewSenderOrders ? (
                  <ul className="flex flex-col gap-4">
                    {senderAcceptedOrders.map((order) => {
                      const statusNote = senderStatusNote(order.status, t);

                      return (
                        <li key={order.id} className={SENDER_ORDER_CARD_CLASS}>
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-medium">{order.title}</p>
                            <span
                              className={cn(
                                'shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium',
                                senderStatusBadgeClass(order.status),
                              )}
                            >
                              {senderStatusLabel(order.status, t)}
                            </span>
                          </div>
                          <p className="text-muted-foreground">{order.type}</p>
                          {statusNote ? (
                            <p className="mt-2 rounded-md border border-border/60 bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
                              {statusNote}
                            </p>
                          ) : null}
                          <dl className="mt-2 flex flex-col gap-1">
                            <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                              <dt className="text-muted-foreground">
                                {t('app.senderPanel.labelRoute')}
                              </dt>
                              <dd>
                                {formatLocation(order.pickupCity, order.pickupCountry)}{' '}
                                {t('app.orders.routeSeparator')}{' '}
                                {formatLocation(order.dropoffCity, order.dropoffCountry)}
                              </dd>
                            </div>
                            <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                              <dt className="text-muted-foreground">
                                {t('app.senderPanel.labelReward')}
                              </dt>
                              <dd>
                                {formatReward(
                                  order.offeredRewardAmount,
                                  order.currency,
                                  t('app.orders.rewardNone'),
                                )}
                              </dd>
                            </div>
                            {order.acceptedAt ? (
                              <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                                <dt className="text-muted-foreground">
                                  {t('app.senderPanel.labelAcceptedAt')}
                                </dt>
                                <dd>{new Date(order.acceptedAt).toLocaleString()}</dd>
                              </div>
                            ) : null}
                            {order.deliveredAt ? (
                              <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                                <dt className="text-muted-foreground">
                                  {t('app.senderPanel.labelDeliveredAt')}
                                </dt>
                                <dd>{new Date(order.deliveredAt).toLocaleString()}</dd>
                              </div>
                            ) : null}
                          </dl>
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
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
