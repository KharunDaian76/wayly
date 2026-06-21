'use client';

import { ApiError } from '@wayly/sdk';
import type { AcceptedDeliveryOrderSummary, OrdersListQuery } from '@wayly/sdk';
import type {
  DeliveryOrderSummary,
  DisputeSummary,
  KycStatusView,
  PaymentIntentSummary,
} from '@wayly/types';
import { DeliveryOrderStatus, DeliveryOrderType, KycStatus, PaymentStatus } from '@wayly/types';
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
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';

import type { WaylerMapLabels } from '@/components/wayler-map';

import {
  AcceptedOrderDetailsDrawer,
  type AcceptedOrderDetailsInput,
  type AcceptedOrderDetailsPanelRole,
} from '@/components/app/accepted-order-details-drawer';
import { ConversationPanel } from '@/components/app/conversation-panel';
import { DeliveryOrderSourceBadge } from '@/components/app/delivery-order-source-badge';
import { DisputePanel, disputeReasonKey, disputeStatusKey } from '@/components/app/dispute-panel';
import {
  KycActionBlockedHint,
  KycMarketplaceGateNotice,
  type KycGateProps,
} from '@/components/app/kyc-marketplace-gate';
import { NotificationBell } from '@/components/app/notification-bell';
import { PanelEmptyState, PanelErrorState } from '@/components/app/panel-status-states';
import { SenderWaylersPanel } from '@/components/app/sender-waylers-panel';
import { WaylerAccessPanel } from '@/components/app/wayler-access-panel';
import { WaylerAvailabilityPanel } from '@/components/app/wayler-availability-panel';
import { WaylerIncomingRequestsPanel } from '@/components/app/wayler-incoming-requests-panel';
import { LanguageSelect } from '@/components/language-select';
import { ModeSwitcher } from '@/components/app/mode-switcher';
import { useAppMode } from '@/lib/app-mode/app-mode-context';
import { useAuth } from '@/lib/auth/auth-context';
import { useI18n } from '@/lib/i18n/i18n-context';
import type { TranslationKey } from '@/lib/i18n/dictionaries';
import { acceptedOrderElementId } from '@/lib/notifications/notification-order-focus';
import { useFocusAcceptedOrder } from '@/lib/notifications/use-focus-accepted-order';
import { api } from '@/lib/sdk';
import { cn } from '@/lib/utils';

const isDev = process.env.NODE_ENV !== 'production';

const APP_PANEL_CLASS = 'wayly-app-panel';
const ALERT_ERROR_CLASS = 'wayly-alert wayly-alert-danger';
const ALERT_SUCCESS_CLASS = 'wayly-alert wayly-alert-success';

const FEED_SELECT_CLASS =
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm';

const PROOF_TEXTAREA_CLASS = cn(
  'flex min-h-[72px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
  'ring-offset-background placeholder:text-muted-foreground',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
  'disabled:cursor-not-allowed disabled:opacity-50',
);

type WaylerAcceptedOrderRow = AcceptedDeliveryOrderSummary & {
  proofNote?: string | null;
  proofConfirmationCode?: string | null;
  proofSubmittedAt?: string | null;
  proofLoadFailed: boolean;
  paymentIntent: PaymentIntentSummary | null;
  paymentLoadFailed: boolean;
};

type ProofInputDraft = {
  note: string;
  confirmationCode: string;
};

type FeedSort = 'rewardDesc' | 'publishedDesc' | 'routeAsc';

type SenderAcceptedOrderRow = DeliveryOrderSummary & {
  acceptedAt: string | null;
  deliveredAt: string | null;
  proofNote?: string | null;
  proofConfirmationCode?: string | null;
  proofSubmittedAt?: string | null;
  proofLoadFailed: boolean;
  paymentIntent: PaymentIntentSummary | null;
  paymentLoadFailed: boolean;
};

type AcceptedOrderRowForDetails = WaylerAcceptedOrderRow | SenderAcceptedOrderRow;

function toAcceptedOrderDetailsInput(order: AcceptedOrderRowForDetails): AcceptedOrderDetailsInput {
  return {
    id: order.id,
    title: order.title,
    status: order.status,
    type: order.type,
    sourceType: order.sourceType,
    availabilityRequestId: order.availabilityRequestId,
    pickupCountry: order.pickupCountry,
    pickupCity: order.pickupCity,
    dropoffCountry: order.dropoffCountry,
    dropoffCity: order.dropoffCity,
    currency: order.currency,
    offeredRewardAmount: order.offeredRewardAmount,
    acceptedAt: order.acceptedAt ?? null,
    deliveredAt: 'deliveredAt' in order ? (order.deliveredAt ?? null) : null,
    paymentStatus: order.paymentLoadFailed ? undefined : (order.paymentIntent?.status ?? null),
  };
}

const SENDER_LIFECYCLE_STATUSES = new Set<DeliveryOrderSummary['status']>([
  DeliveryOrderStatus.ACCEPTED,
  DeliveryOrderStatus.IN_TRANSIT,
  DeliveryOrderStatus.DELIVERED,
]);

const FEED_EXIT_MS = 280;
const SENDER_LIST_LIMIT = 100;

const ORDER_CARD_CLASS = cn(
  'wayly-order-card rounded-xl px-4 py-4 text-sm',
  'transition-all duration-200 ease-out hover:scale-[1.005]',
  'wayly-feed-item-enter',
);

const WaylerMap = dynamic(() => import('@/components/wayler-map').then((mod) => mod.WaylerMap), {
  ssr: false,
});

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
  hasActiveAccess: boolean,
): boolean {
  return kycApproved && hasActiveAccess && order.senderId !== currentUserId;
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
        <li key={key} className="wayly-order-card rounded-xl px-4 py-4">
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
        <li key={key} className="wayly-order-card rounded-xl px-4 py-4">
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

function orderStatusBadgeClass(status: DeliveryOrderSummary['status']): string {
  const base = 'wayly-status-badge';
  switch (status) {
    case DeliveryOrderStatus.DRAFT:
      return cn(base, 'wayly-status-draft');
    case DeliveryOrderStatus.OPEN:
      return cn(base, 'wayly-status-open');
    case DeliveryOrderStatus.ACCEPTED:
      return cn(base, 'wayly-status-accepted');
    case DeliveryOrderStatus.IN_TRANSIT:
      return cn(base, 'wayly-status-in-transit');
    case DeliveryOrderStatus.DELIVERED:
      return cn(base, 'wayly-status-delivered');
    case DeliveryOrderStatus.CANCELLED:
      return cn(base, 'wayly-status-cancelled');
    default:
      return cn(base, 'wayly-status-default');
  }
}

function orderStatusLabel(
  status: DeliveryOrderSummary['status'],
  t: (key: TranslationKey) => string,
): string {
  switch (status) {
    case DeliveryOrderStatus.OPEN:
      return t('app.senderPanel.statusOpen');
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

function OrderStatusBadge({
  status,
  label,
}: {
  status: DeliveryOrderSummary['status'];
  label: string;
}) {
  return <span className={orderStatusBadgeClass(status)}>{label}</span>;
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

function resolveCancelError(err: unknown, t: (key: TranslationKey) => string): string {
  if (!(err instanceof ApiError)) {
    return t('app.senderPanel.cancelFailed');
  }
  const message = err.message.toLowerCase();
  if (message.includes('already cancelled') || message.includes('only draft or open')) {
    return t('app.senderPanel.cancelUnavailable');
  }
  return err.message || t('app.senderPanel.cancelFailed');
}

function resolveAcceptError(err: unknown, t: (key: TranslationKey) => string): string {
  if (!(err instanceof ApiError)) {
    return t('app.waylerFeed.acceptFailed');
  }
  if (err.code === 'WAYLER_ACCESS_REQUIRED') {
    return t('app.waylerFeed.accessRequiredAcceptFailed');
  }
  const message = err.message.toLowerCase();
  if (message.includes('work access')) {
    return t('app.waylerFeed.accessRequiredAcceptFailed');
  }
  if (message.includes('own delivery order')) {
    return t('app.waylerFeed.senderCannotAcceptOwn');
  }
  if (message.includes('already been accepted') || message.includes('only open')) {
    return t('app.waylerFeed.acceptAlreadyAccepted');
  }
  return err.message || t('app.waylerFeed.acceptFailed');
}

function resolveChatAccessError(
  err: unknown,
  t: (key: TranslationKey) => string,
  context: 'contact' | 'message',
): string {
  if (!(err instanceof ApiError)) {
    return context === 'contact' ? t('app.chat.loadFailed') : t('app.chat.sendFailed');
  }
  if (err.code === 'WAYLER_ACCESS_REQUIRED') {
    return context === 'contact'
      ? t('app.chat.accessRequiredContactFailed')
      : t('app.chat.accessRequiredMessageFailed');
  }
  const message = err.message.toLowerCase();
  if (message.includes('work access') || message.includes('contacting')) {
    return t('app.chat.accessRequiredContactFailed');
  }
  if (message.includes('sending messages')) {
    return t('app.chat.accessRequiredMessageFailed');
  }
  return (
    err.message || (context === 'contact' ? t('app.chat.loadFailed') : t('app.chat.sendFailed'))
  );
}

function formatPaymentAmount(amount: string | null | undefined, currency: string): string {
  return amount ? `${amount} ${currency}` : '—';
}

function senderPaymentStatusLabel(
  intent: PaymentIntentSummary | null,
  t: (key: TranslationKey) => string,
): string {
  if (!intent) {
    return t('app.senderPanel.payment.notAuthorized');
  }
  switch (intent.status) {
    case PaymentStatus.AUTHORIZED:
      return t('app.senderPanel.payment.authorized');
    case PaymentStatus.HELD_IN_ESCROW:
      return t('app.senderPanel.payment.heldInEscrow');
    case PaymentStatus.RELEASED:
      return t('app.senderPanel.payment.released');
    case PaymentStatus.REFUNDED:
      return t('app.senderPanel.payment.refunded');
    case PaymentStatus.FAILED:
      return t('app.senderPanel.payment.failed');
    case PaymentStatus.CANCELLED:
      return t('app.senderPanel.payment.cancelled');
    default:
      return t('app.senderPanel.payment.notAuthorized');
  }
}

async function fetchPaymentIntentForOrder(
  orderId: string,
): Promise<{ intent: PaymentIntentSummary | null; loadFailed: boolean }> {
  try {
    const intent = await api.payments.forOrder(orderId);
    return { intent, loadFailed: false };
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      return { intent: null, loadFailed: false };
    }
    return { intent: null, loadFailed: true };
  }
}

type OrderPaymentRow = {
  id: string;
  paymentIntent: PaymentIntentSummary | null;
  paymentLoadFailed: boolean;
};

function mergeOrderPaymentFromPrevious<T extends OrderPaymentRow>(orders: T[], previous: T[]): T[] {
  const prevById = new Map(previous.map((order) => [order.id, order]));
  return orders.map((order) => {
    const prior = prevById.get(order.id);
    if (order.paymentLoadFailed && prior?.paymentIntent && !order.paymentIntent) {
      return { ...order, paymentIntent: prior.paymentIntent };
    }
    return order;
  });
}

type OrderProofRow = {
  id: string;
  proofNote?: string | null;
  proofConfirmationCode?: string | null;
  proofSubmittedAt?: string | null;
  proofLoadFailed: boolean;
};

function mergeOrderProofFromPrevious<T extends OrderProofRow>(orders: T[], previous: T[]): T[] {
  const prevById = new Map(previous.map((order) => [order.id, order]));
  return orders.map((order) => {
    const prior = prevById.get(order.id);
    if (!order.proofLoadFailed || !prior) {
      return order;
    }
    const hadProof = prior.proofSubmittedAt || prior.proofNote || prior.proofConfirmationCode;
    if (!hadProof) {
      return order;
    }
    return {
      ...order,
      proofNote: prior.proofNote,
      proofConfirmationCode: prior.proofConfirmationCode,
      proofSubmittedAt: prior.proofSubmittedAt,
    };
  });
}

function mergeSenderAcceptedFromPrevious(
  orders: SenderAcceptedOrderRow[],
  previous: SenderAcceptedOrderRow[],
): SenderAcceptedOrderRow[] {
  const prevById = new Map(previous.map((order) => [order.id, order]));
  const merged = orders.map((order) => {
    const prior = prevById.get(order.id);
    if (!order.proofLoadFailed || !prior) {
      return order;
    }
    return {
      ...order,
      acceptedAt: order.acceptedAt ?? prior.acceptedAt,
      deliveredAt: order.deliveredAt ?? prior.deliveredAt,
      proofNote: order.proofNote ?? prior.proofNote,
      proofConfirmationCode: order.proofConfirmationCode ?? prior.proofConfirmationCode,
      proofSubmittedAt: order.proofSubmittedAt ?? prior.proofSubmittedAt,
    };
  });
  return mergeOrderProofFromPrevious(merged, previous);
}

function waylerPaymentStatusLabel(
  intent: PaymentIntentSummary | null,
  t: (key: TranslationKey) => string,
): string {
  if (!intent) {
    return t('app.waylerFeed.acceptedPanel.payment.notAuthorized');
  }
  switch (intent.status) {
    case PaymentStatus.AUTHORIZED:
      return t('app.waylerFeed.acceptedPanel.payment.authorized');
    case PaymentStatus.HELD_IN_ESCROW:
      return t('app.waylerFeed.acceptedPanel.payment.heldInEscrow');
    case PaymentStatus.RELEASED:
      return t('app.waylerFeed.acceptedPanel.payment.released');
    case PaymentStatus.REFUNDED:
      return t('app.waylerFeed.acceptedPanel.payment.refunded');
    case PaymentStatus.FAILED:
      return t('app.waylerFeed.acceptedPanel.payment.failed');
    case PaymentStatus.CANCELLED:
      return t('app.waylerFeed.acceptedPanel.payment.cancelled');
    default:
      return t('app.waylerFeed.acceptedPanel.payment.notAuthorized');
  }
}

function waylerPaymentStatusNote(
  intent: PaymentIntentSummary,
  t: (key: TranslationKey) => string,
): string | null {
  switch (intent.status) {
    case PaymentStatus.AUTHORIZED:
      return t('app.waylerFeed.acceptedPanel.payment.authorizedNote');
    case PaymentStatus.HELD_IN_ESCROW:
      return t('app.waylerFeed.acceptedPanel.payment.heldNote');
    case PaymentStatus.RELEASED:
      return t('app.waylerFeed.acceptedPanel.payment.releasedNote');
    default:
      return null;
  }
}

function AcceptedOrderDisputeSection({
  dispute,
  disputesLoading,
  disputesListLoadFailed,
  onRetryDisputes,
  t,
}: {
  dispute: DisputeSummary | undefined;
  disputesLoading: boolean;
  disputesListLoadFailed: boolean;
  onRetryDisputes: () => void;
  t: (key: TranslationKey) => string;
}) {
  const hasKnownDispute = Boolean(dispute);

  return (
    <div className="wayly-proof-panel mt-3 rounded-xl border p-3">
      <p className="text-sm font-medium">{t('app.disputes.title')}</p>
      {disputesLoading ? (
        <p className="mt-1 text-xs text-muted-foreground" role="status" aria-live="polite">
          {hasKnownDispute ? t('app.disputes.disputeRefreshing') : t('app.disputes.disputeLoading')}
        </p>
      ) : null}
      {disputesListLoadFailed && !disputesLoading ? (
        <div className="mt-2">
          <PanelErrorState
            message={t('app.disputes.disputeLoadFailed')}
            retryLabel={t('app.disputes.retryDisputeStatus')}
            onRetry={onRetryDisputes}
            retryDisabled={disputesLoading}
          />
        </div>
      ) : null}
      {dispute ? (
        <dl className="mt-2 flex flex-col gap-1 text-sm">
          <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
            <dt className="text-muted-foreground">{t('app.disputes.status')}</dt>
            <dd className="font-medium">{t(disputeStatusKey(dispute.status))}</dd>
          </div>
          <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
            <dt className="text-muted-foreground">{t('app.disputes.reason')}</dt>
            <dd className="font-medium">{t(disputeReasonKey(dispute.reason))}</dd>
          </div>
          <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
            <dt className="text-muted-foreground">{t('app.disputes.createdAt')}</dt>
            <dd>{new Date(dispute.createdAt).toLocaleString()}</dd>
          </div>
        </dl>
      ) : !disputesListLoadFailed && !disputesLoading ? (
        <div className="mt-2">
          <PanelEmptyState
            title={t('app.disputes.noDisputeYet')}
            body={t('app.disputes.noDisputeYetBody')}
          />
        </div>
      ) : null}
    </div>
  );
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
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [cancelSuccessPanel, setCancelSuccessPanel] = useState<'draft' | 'published' | null>(null);
  const [exitingDraftIds, setExitingDraftIds] = useState<ReadonlySet<string>>(() => new Set());
  const [exitingPublishedIds, setExitingPublishedIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const senderListActionBusy = publishingOrderId !== null || cancellingOrderId !== null;
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
  const [waylerHasActiveAccess, setWaylerHasActiveAccess] = useState(false);
  const [acceptedOrders, setAcceptedOrders] = useState<WaylerAcceptedOrderRow[]>([]);
  const [acceptedLoading, setAcceptedLoading] = useState(false);
  const [acceptedError, setAcceptedError] = useState<string | null>(null);
  const [progressingOrderId, setProgressingOrderId] = useState<string | null>(null);
  const [progressAction, setProgressAction] = useState<'start-transit' | 'mark-delivered' | null>(
    null,
  );
  const [progressError, setProgressError] = useState<string | null>(null);
  const [progressSuccess, setProgressSuccess] = useState<'transit' | 'delivered' | null>(null);
  const [proofInputs, setProofInputs] = useState<Record<string, ProofInputDraft>>({});
  const [submittingProofOrderId, setSubmittingProofOrderId] = useState<string | null>(null);
  const [proofError, setProofError] = useState<string | null>(null);
  const [proofErrorOrderId, setProofErrorOrderId] = useState<string | null>(null);
  const [proofSuccessOrderId, setProofSuccessOrderId] = useState<string | null>(null);
  const [progressErrorOrderId, setProgressErrorOrderId] = useState<string | null>(null);
  const [proofDetailLoadingOrderIds, setProofDetailLoadingOrderIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const [chatOpen, setChatOpen] = useState(false);
  const [chatConversationId, setChatConversationId] = useState<string | null>(null);
  const [chatOrderTitle, setChatOrderTitle] = useState<string | null>(null);
  const [chatOrderId, setChatOrderId] = useState<string | null>(null);
  const [openingChatOrderId, setOpeningChatOrderId] = useState<string | null>(null);
  const [chatOpenError, setChatOpenError] = useState<string | null>(null);
  const [disputesByOrderId, setDisputesByOrderId] = useState<Record<string, DisputeSummary>>({});
  const [disputesLoading, setDisputesLoading] = useState(false);
  const [disputesListLoadFailed, setDisputesListLoadFailed] = useState(false);
  const [disputeOpen, setDisputeOpen] = useState(false);
  const [disputeOrderId, setDisputeOrderId] = useState<string | null>(null);
  const [disputeOrderTitle, setDisputeOrderTitle] = useState<string | null>(null);
  const [disputeId, setDisputeId] = useState<string | null>(null);
  const [paymentActionOrderId, setPaymentActionOrderId] = useState<string | null>(null);
  const [paymentAction, setPaymentAction] = useState<'authorize' | 'hold' | 'release' | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentErrorOrderId, setPaymentErrorOrderId] = useState<string | null>(null);
  const [paymentSuccessOrderId, setPaymentSuccessOrderId] = useState<string | null>(null);
  const [paymentSuccessKind, setPaymentSuccessKind] = useState<
    'authorize' | 'hold' | 'release' | null
  >(null);
  const [paymentStatusLoadingOrderIds, setPaymentStatusLoadingOrderIds] = useState<
    ReadonlySet<string>
  >(() => new Set());
  const [highlightedOrderId, setHighlightedOrderId] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsOrder, setDetailsOrder] = useState<AcceptedOrderDetailsInput | null>(null);
  const [detailsPanelRole, setDetailsPanelRole] = useState<AcceptedOrderDetailsPanelRole>('sender');
  const [detailsStatusLabel, setDetailsStatusLabel] = useState('');
  const paymentActionBusy = paymentActionOrderId !== null;
  const focusFromUrlHandledRef = useRef(false);

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

  const kycGateProps = useMemo(
    (): KycGateProps => ({
      kycLoading,
      kycError,
      kycStatus,
      isApproved: !!isApproved,
      onRetryKyc: () => {
        void loadKycStatus();
      },
    }),
    [kycLoading, kycError, kycStatus, isApproved, loadKycStatus],
  );

  const senderKycGateProps = useMemo(
    (): KycGateProps => ({
      ...kycGateProps,
      isApproved: !!canViewSenderOrders,
    }),
    [kycGateProps, canViewSenderOrders],
  );

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
      setPublishedError(t('app.senderPanel.postedOrdersLoadFailed'));
    } finally {
      setPublishedLoading(false);
    }
  }, [t]);

  const loadUserDisputes = useCallback(async () => {
    setDisputesLoading(true);
    try {
      const result = await api.disputes.list({ limit: 100 });
      const map: Record<string, DisputeSummary> = {};
      for (const item of result.items) {
        const existing = map[item.orderId];
        if (
          !existing ||
          new Date(item.createdAt).getTime() > new Date(existing.createdAt).getTime()
        ) {
          map[item.orderId] = item;
        }
      }
      setDisputesByOrderId(map);
      setDisputesListLoadFailed(false);
    } catch {
      setDisputesListLoadFailed(true);
    } finally {
      setDisputesLoading(false);
    }
  }, []);

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
          const [detailResult, payment] = await Promise.all([
            api.orders
              .detail(order.id)
              .then((detail) => ({ detail, loadFailed: false as const }))
              .catch(() => ({ detail: null, loadFailed: true as const })),
            fetchPaymentIntentForOrder(order.id),
          ]);
          return {
            ...order,
            acceptedAt: detailResult.detail?.acceptedAt ?? null,
            deliveredAt: detailResult.detail?.deliveredAt ?? null,
            proofNote: detailResult.detail?.proofNote,
            proofConfirmationCode: detailResult.detail?.proofConfirmationCode,
            proofSubmittedAt: detailResult.detail?.proofSubmittedAt,
            proofLoadFailed: detailResult.loadFailed,
            paymentIntent: payment.intent,
            paymentLoadFailed: payment.loadFailed,
          };
        }),
      );
      withTimestamps.sort((a, b) => {
        const timeA = a.acceptedAt ? new Date(a.acceptedAt).getTime() : 0;
        const timeB = b.acceptedAt ? new Date(b.acceptedAt).getTime() : 0;
        return timeB - timeA;
      });
      setSenderAcceptedOrders((previous) =>
        mergeSenderAcceptedFromPrevious(
          mergeOrderPaymentFromPrevious(withTimestamps, previous),
          previous,
        ),
      );
      await loadUserDisputes();
      return withTimestamps;
    } catch {
      setSenderAcceptedError(t('app.senderPanel.acceptedLoadFailed'));
      return [];
    } finally {
      setSenderAcceptedLoading(false);
    }
  }, [loadUserDisputes, t]);

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
      setFeedError(t('app.waylerFeed.openOrdersLoadFailed'));
    } finally {
      setFeedLoading(false);
    }
  }, [t, feedType, feedPickupCountry, feedPickupCity, feedDropoffCountry, feedDropoffCity]);

  const loadWaylerAccessState = useCallback(async () => {
    if (!isApproved) {
      setWaylerHasActiveAccess(false);
      return;
    }
    try {
      const state = await api.waylerAccess.today();
      setWaylerHasActiveAccess(state.hasActiveAccess);
    } catch {
      setWaylerHasActiveAccess(false);
    }
  }, [isApproved]);

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
      const enriched = await Promise.all(
        items.map(async (order): Promise<WaylerAcceptedOrderRow> => {
          const needsProofDetail =
            order.status === DeliveryOrderStatus.IN_TRANSIT ||
            order.status === DeliveryOrderStatus.DELIVERED;
          const [payment, detailResult] = await Promise.all([
            fetchPaymentIntentForOrder(order.id),
            needsProofDetail
              ? api.orders
                  .detail(order.id)
                  .then((detail) => ({ detail, loadFailed: false as const }))
                  .catch(() => ({ detail: null, loadFailed: true as const }))
              : Promise.resolve({ detail: null, loadFailed: false as const }),
          ]);
          return {
            ...order,
            proofNote: detailResult.detail?.proofNote,
            proofConfirmationCode: detailResult.detail?.proofConfirmationCode,
            proofSubmittedAt: detailResult.detail?.proofSubmittedAt,
            proofLoadFailed: detailResult.loadFailed,
            paymentIntent: payment.intent,
            paymentLoadFailed: payment.loadFailed,
          };
        }),
      );
      setAcceptedOrders((previous) =>
        mergeOrderProofFromPrevious(mergeOrderPaymentFromPrevious(enriched, previous), previous),
      );
      await loadUserDisputes();
      return enriched;
    } catch {
      setAcceptedError(t('app.waylerFeed.acceptedPanel.loadFailed'));
      return [];
    } finally {
      setAcceptedLoading(false);
    }
  }, [loadUserDisputes, t]);

  const setPaymentStatusLoading = useCallback((orderId: string, loading: boolean) => {
    setPaymentStatusLoadingOrderIds((previous) => {
      const next = new Set(previous);
      if (loading) {
        next.add(orderId);
      } else {
        next.delete(orderId);
      }
      return next;
    });
  }, []);

  const refreshSenderOrderPayment = useCallback(
    async (orderId: string) => {
      setPaymentStatusLoading(orderId, true);
      try {
        const payment = await fetchPaymentIntentForOrder(orderId);
        setSenderAcceptedOrders((previous) =>
          previous.map((order) => {
            if (order.id !== orderId) {
              return order;
            }
            if (payment.loadFailed) {
              return {
                ...order,
                paymentLoadFailed: true,
                paymentIntent: order.paymentIntent,
              };
            }
            return {
              ...order,
              paymentIntent: payment.intent,
              paymentLoadFailed: false,
            };
          }),
        );
      } finally {
        setPaymentStatusLoading(orderId, false);
      }
    },
    [setPaymentStatusLoading],
  );

  const refreshWaylerOrderPayment = useCallback(
    async (orderId: string) => {
      setPaymentStatusLoading(orderId, true);
      try {
        const payment = await fetchPaymentIntentForOrder(orderId);
        setAcceptedOrders((previous) =>
          previous.map((order) => {
            if (order.id !== orderId) {
              return order;
            }
            if (payment.loadFailed) {
              return {
                ...order,
                paymentLoadFailed: true,
                paymentIntent: order.paymentIntent,
              };
            }
            return {
              ...order,
              paymentIntent: payment.intent,
              paymentLoadFailed: false,
            };
          }),
        );
      } finally {
        setPaymentStatusLoading(orderId, false);
      }
    },
    [setPaymentStatusLoading],
  );

  const setProofDetailLoading = useCallback((orderId: string, loading: boolean) => {
    setProofDetailLoadingOrderIds((previous) => {
      const next = new Set(previous);
      if (loading) {
        next.add(orderId);
      } else {
        next.delete(orderId);
      }
      return next;
    });
  }, []);

  const refreshSenderOrderProof = useCallback(
    async (orderId: string) => {
      setProofDetailLoading(orderId, true);
      try {
        const detail = await api.orders.detail(orderId);
        setSenderAcceptedOrders((previous) =>
          previous.map((order) => {
            if (order.id !== orderId) {
              return order;
            }
            return {
              ...order,
              acceptedAt: detail.acceptedAt ?? order.acceptedAt,
              deliveredAt: detail.deliveredAt ?? order.deliveredAt,
              proofNote: detail.proofNote,
              proofConfirmationCode: detail.proofConfirmationCode,
              proofSubmittedAt: detail.proofSubmittedAt,
              proofLoadFailed: false,
            };
          }),
        );
      } catch {
        setSenderAcceptedOrders((previous) =>
          previous.map((order) => {
            if (order.id !== orderId) {
              return order;
            }
            return {
              ...order,
              proofLoadFailed: true,
              proofNote: order.proofNote,
              proofConfirmationCode: order.proofConfirmationCode,
              proofSubmittedAt: order.proofSubmittedAt,
            };
          }),
        );
      } finally {
        setProofDetailLoading(orderId, false);
      }
    },
    [setProofDetailLoading],
  );

  const refreshWaylerOrderProof = useCallback(
    async (orderId: string) => {
      setProofDetailLoading(orderId, true);
      try {
        const detail = await api.orders.detail(orderId);
        setAcceptedOrders((previous) =>
          previous.map((order) => {
            if (order.id !== orderId) {
              return order;
            }
            return {
              ...order,
              proofNote: detail.proofNote,
              proofConfirmationCode: detail.proofConfirmationCode,
              proofSubmittedAt: detail.proofSubmittedAt,
              proofLoadFailed: false,
            };
          }),
        );
      } catch {
        setAcceptedOrders((previous) =>
          previous.map((order) => {
            if (order.id !== orderId) {
              return order;
            }
            return {
              ...order,
              proofLoadFailed: true,
              proofNote: order.proofNote,
              proofConfirmationCode: order.proofConfirmationCode,
              proofSubmittedAt: order.proofSubmittedAt,
            };
          }),
        );
      } finally {
        setProofDetailLoading(orderId, false);
      }
    },
    [setProofDetailLoading],
  );

  const focusAcceptedOrder = useFocusAcceptedOrder<AcceptedOrderRowForDetails>({
    setHighlightedOrderId,
    loadSenderAcceptedOrders,
    loadAcceptedOrders,
  });

  const focusAcceptedOrderFromNotification = useCallback(
    (orderId: string, panelHint?: 'sender' | 'wayler') =>
      focusAcceptedOrder(orderId, panelHint, {
        openDetails: true,
        onOpenDetails: (order, panel) => {
          const input = toAcceptedOrderDetailsInput(order);
          setDetailsOrder(input);
          setDetailsPanelRole(panel);
          setDetailsStatusLabel(orderStatusLabel(input.status, t));
          setDetailsOpen(true);
        },
      }),
    [focusAcceptedOrder, t],
  );

  useEffect(() => {
    if (focusFromUrlHandledRef.current || !user || !isApproved) {
      return;
    }
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get('focusOrderId');
    if (!orderId) {
      return;
    }
    focusFromUrlHandledRef.current = true;
    const panelParam = params.get('focusPanel');
    const panelHint =
      panelParam === 'wayler' ? 'wayler' : panelParam === 'sender' ? 'sender' : undefined;
    void focusAcceptedOrder(orderId, panelHint).finally(() => {
      params.delete('focusOrderId');
      params.delete('focusPanel');
      const query = params.toString();
      router.replace(query ? `/app?${query}` : '/app', { scroll: false });
    });
  }, [user, isApproved, focusAcceptedOrder, router]);

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
      void loadWaylerAccessState();
    }
  }, [user, mode, isApproved, loadAcceptedOrders, loadWaylerAccessState]);

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
    setProgressErrorOrderId(null);
    setProgressSuccess(null);
    setProofError(null);
    setProofErrorOrderId(null);
    setProofSuccessOrderId(null);
    setProgressingOrderId(orderId);
    setProgressAction('start-transit');
    try {
      await api.orders.startTransit(orderId);
      setProgressSuccess('transit');
      await loadAcceptedOrders();
    } catch (err) {
      setProgressErrorOrderId(orderId);
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
    setProgressErrorOrderId(null);
    setProgressSuccess(null);
    setProofError(null);
    setProofErrorOrderId(null);
    setProofSuccessOrderId(null);
    setProgressingOrderId(orderId);
    setProgressAction('mark-delivered');
    try {
      await api.orders.markDelivered(orderId);
      setProgressSuccess('delivered');
      await loadAcceptedOrders();
    } catch (err) {
      setProgressErrorOrderId(orderId);
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

  function getProofDraft(order: WaylerAcceptedOrderRow): ProofInputDraft {
    return (
      proofInputs[order.id] ?? {
        note: order.proofNote ?? '',
        confirmationCode: order.proofConfirmationCode ?? '',
      }
    );
  }

  function updateProofDraft(orderId: string, patch: Partial<ProofInputDraft>) {
    setProofInputs((prev) => {
      const existing = prev[orderId];
      if (existing) {
        return { ...prev, [orderId]: { ...existing, ...patch } };
      }
      const order = acceptedOrders.find((item) => item.id === orderId);
      const base: ProofInputDraft = {
        note: order?.proofNote ?? '',
        confirmationCode: order?.proofConfirmationCode ?? '',
      };
      return { ...prev, [orderId]: { ...base, ...patch } };
    });
  }

  async function handleSubmitProof(orderId: string) {
    const order = acceptedOrders.find((item) => item.id === orderId);
    if (!order) {
      return;
    }
    const draft = getProofDraft(order);
    const note = draft.note.trim();
    const confirmationCode = draft.confirmationCode.trim();
    if (!note && !confirmationCode) {
      return;
    }

    setProofError(null);
    setProofErrorOrderId(null);
    setProgressError(null);
    setProgressErrorOrderId(null);
    setSubmittingProofOrderId(orderId);
    try {
      const body: { note?: string; confirmationCode?: string } = {};
      if (note) {
        body.note = note;
      }
      if (confirmationCode) {
        body.confirmationCode = confirmationCode;
      }
      await api.orders.submitProof(orderId, body);
      setProofSuccessOrderId(orderId);
      await loadAcceptedOrders();
    } catch (err) {
      setProofErrorOrderId(orderId);
      setProofError(
        err instanceof ApiError
          ? err.message || t('app.waylerFeed.acceptedPanel.proofFailed')
          : t('app.waylerFeed.acceptedPanel.proofFailed'),
      );
    } finally {
      setSubmittingProofOrderId(null);
    }
  }

  async function handleOpenChat(orderId: string, orderTitle: string) {
    setChatOpenError(null);
    setOpeningChatOrderId(orderId);
    try {
      const conversation = await api.conversations.forOrder(orderId);
      setChatConversationId(conversation.id);
      setChatOrderTitle(orderTitle);
      setChatOrderId(conversation.orderId);
      setChatOpen(true);
    } catch (err) {
      setChatOpenError(resolveChatAccessError(err, t, 'contact'));
    } finally {
      setOpeningChatOrderId(null);
    }
  }

  function handleCloseChat() {
    setChatOpen(false);
    setChatConversationId(null);
    setChatOrderTitle(null);
    setChatOrderId(null);
  }

  function handleOpenDispute(orderId: string, orderTitle: string) {
    const existing = disputesByOrderId[orderId];
    setDisputeOrderId(orderId);
    setDisputeOrderTitle(orderTitle);
    setDisputeId(existing?.id ?? null);
    setDisputeOpen(true);
  }

  function handleCloseDispute() {
    setDisputeOpen(false);
    setDisputeOrderId(null);
    setDisputeOrderTitle(null);
    setDisputeId(null);
  }

  function handleOpenOrderDetails(
    order: AcceptedOrderDetailsInput,
    panelRole: AcceptedOrderDetailsPanelRole,
  ) {
    setDetailsOrder(order);
    setDetailsPanelRole(panelRole);
    setDetailsStatusLabel(orderStatusLabel(order.status, t));
    setDetailsOpen(true);
  }

  function handleCloseOrderDetails() {
    setDetailsOpen(false);
    setDetailsOrder(null);
    setDetailsStatusLabel('');
  }

  function handleDisputeOpened(id: string) {
    setDisputeId(id);
    void loadUserDisputes();
  }

  async function handleMockAuthorizePayment(orderId: string) {
    setPaymentError(null);
    setPaymentErrorOrderId(null);
    setPaymentSuccessOrderId(null);
    setPaymentSuccessKind(null);
    setPaymentActionOrderId(orderId);
    setPaymentAction('authorize');
    try {
      await api.payments.mockAuthorizeOrder(orderId);
      setPaymentSuccessOrderId(orderId);
      setPaymentSuccessKind('authorize');
      await loadSenderAcceptedOrders();
    } catch (err) {
      setPaymentErrorOrderId(orderId);
      setPaymentError(
        err instanceof ApiError ? err.message : t('app.senderPanel.payment.actionFailed'),
      );
    } finally {
      setPaymentActionOrderId(null);
      setPaymentAction(null);
    }
  }

  async function handleMockHoldEscrow(orderId: string, paymentIntentId: string) {
    setPaymentError(null);
    setPaymentErrorOrderId(null);
    setPaymentSuccessOrderId(null);
    setPaymentSuccessKind(null);
    setPaymentActionOrderId(orderId);
    setPaymentAction('hold');
    try {
      await api.payments.mockHoldEscrow(paymentIntentId);
      setPaymentSuccessOrderId(orderId);
      setPaymentSuccessKind('hold');
      await loadSenderAcceptedOrders();
    } catch (err) {
      setPaymentErrorOrderId(orderId);
      setPaymentError(
        err instanceof ApiError ? err.message : t('app.senderPanel.payment.actionFailed'),
      );
    } finally {
      setPaymentActionOrderId(null);
      setPaymentAction(null);
    }
  }

  async function handleMockReleasePayment(orderId: string, paymentIntentId: string) {
    setPaymentError(null);
    setPaymentErrorOrderId(null);
    setPaymentSuccessOrderId(null);
    setPaymentSuccessKind(null);
    setPaymentActionOrderId(orderId);
    setPaymentAction('release');
    try {
      await api.payments.mockRelease(paymentIntentId);
      setPaymentSuccessOrderId(orderId);
      setPaymentSuccessKind('release');
      await loadSenderAcceptedOrders();
    } catch (err) {
      setPaymentErrorOrderId(orderId);
      setPaymentError(
        err instanceof ApiError ? err.message : t('app.senderPanel.payment.actionFailed'),
      );
    } finally {
      setPaymentActionOrderId(null);
      setPaymentAction(null);
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

  async function handleCancelOrder(orderId: string, panel: 'draft' | 'published') {
    setCancelError(null);
    setCancelSuccessPanel(null);
    setPublishError(null);
    setPublishSuccess(false);
    setCancellingOrderId(orderId);
    try {
      await api.orders.cancel(orderId);
      setCancelSuccessPanel(panel);
      if (panel === 'draft') {
        setExitingDraftIds((prev) => new Set(prev).add(orderId));
      } else {
        setExitingPublishedIds((prev) => new Set(prev).add(orderId));
      }
      await new Promise((resolve) => setTimeout(resolve, FEED_EXIT_MS));
      if (panel === 'draft') {
        setDraftOrders((prev) => prev.filter((order) => order.id !== orderId));
        setExitingDraftIds((prev) => {
          const next = new Set(prev);
          next.delete(orderId);
          return next;
        });
        await loadDraftOrders();
      } else {
        setPublishedOrders((prev) => prev.filter((order) => order.id !== orderId));
        setExitingPublishedIds((prev) => {
          const next = new Set(prev);
          next.delete(orderId);
          return next;
        });
        await loadPublishedOrders();
      }
    } catch (err) {
      setCancelError(resolveCancelError(err, t));
    } finally {
      setCancellingOrderId(null);
    }
  }

  async function handlePublishDraft(orderId: string) {
    setPublishError(null);
    setPublishSuccess(false);
    setCancelError(null);
    setCancelSuccessPanel(null);
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
    <div className="wayly-app-shell">
      <Container className="relative flex min-w-0 flex-col gap-6 py-6 sm:gap-8 sm:py-10">
        <header className="wayly-app-header flex flex-col gap-4 rounded-2xl border px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {t('app.signedInAs')}
            </p>
            <h1 className="truncate font-display text-2xl font-bold tracking-tight sm:text-3xl">
              {user.displayName}
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <LanguageSelect />
            <NotificationBell onFocusOrder={focusAcceptedOrderFromNotification} />
            <Button variant="outline" asChild>
              <Link href="/">{t('common.backToHome')}</Link>
            </Button>
            <Button variant="secondary" onClick={handleLogout} disabled={loggingOut}>
              {loggingOut ? t('app.signingOut') : t('app.signOut')}
            </Button>
          </div>
        </header>

        {error ? <p className={ALERT_ERROR_CLASS}>{error}</p> : null}

        <ModeSwitcher />

        <Card className={APP_PANEL_CLASS}>
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
            {!isApproved ? <KycMarketplaceGateNotice {...kycGateProps} /> : null}
          </CardContent>
        </Card>

        {mode === 'wayler' ? (
          <>
            <Card className={APP_PANEL_CLASS}>
              <CardHeader>
                <CardTitle>{t('app.waylerAccess.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <WaylerAccessPanel
                  kycGate={kycGateProps}
                  onAccessChanged={setWaylerHasActiveAccess}
                />
              </CardContent>
            </Card>

            <Card className={APP_PANEL_CLASS}>
              <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle>{t('app.waylerFeed.title')}</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={kycLoading || !isApproved || feedLoading}
                  onClick={() => void loadFeedOrders()}
                >
                  {feedLoading && feedOrders.length > 0
                    ? t('app.waylerFeed.openOrdersRefreshing')
                    : t('app.waylerFeed.refresh')}
                </Button>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <KycMarketplaceGateNotice {...kycGateProps} />
                {isApproved ? (
                  <fieldset
                    className="wayly-filter-panel flex flex-col gap-4 rounded-xl border p-4"
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
                  <PanelErrorState
                    message={feedError}
                    retryLabel={t('app.waylerFeed.retryOpenOrders')}
                    onRetry={() => void loadFeedOrders()}
                    retryDisabled={feedLoading}
                  />
                ) : null}
                {acceptError ? (
                  <p className="wayly-alert wayly-alert-danger">{acceptError}</p>
                ) : null}
                {acceptSuccess ? (
                  <p className="wayly-alert wayly-alert-success" role="status">
                    {t('app.waylerFeed.acceptSuccess')}
                  </p>
                ) : null}
                {isApproved && feedLoading && feedOrders.length === 0 ? (
                  <div className="flex flex-col gap-3">
                    <p className="text-xs text-muted-foreground" role="status" aria-live="polite">
                      {t('app.waylerFeed.openOrdersLoading')}
                    </p>
                    <FeedOrdersSkeleton />
                  </div>
                ) : isApproved && !feedLoading && !feedError && feedOrders.length === 0 ? (
                  <PanelEmptyState
                    title={t('app.waylerFeed.openOrdersEmptyTitle')}
                    body={t('app.waylerFeed.openOrdersEmptyBody')}
                  />
                ) : isApproved &&
                  !feedError &&
                  feedOrders.length > 0 &&
                  displayedFeedOrders.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {t('app.waylerFeed.emptyFiltered')}
                  </p>
                ) : isApproved && displayedFeedOrders.length > 0 ? (
                  <ul className="flex flex-col gap-4">
                    {displayedFeedOrders.map((order) => {
                      const isOwnOrder = order.senderId === user.id;
                      const canAcceptEligible = !!isApproved && !isOwnOrder;
                      const canAccept = canAcceptOpenOrder(
                        order,
                        user.id,
                        !!isApproved,
                        waylerHasActiveAccess,
                      );
                      const isAccepting = acceptingOrderId === order.id;
                      const acceptDisabled = !canAccept || acceptingOrderId !== null;
                      const isExiting = exitingOrderIds.has(order.id);

                      return (
                        <li
                          key={order.id}
                          className={cn(
                            ORDER_CARD_CLASS,
                            isExiting ? 'wayly-feed-item-exit' : undefined,
                          )}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-medium">{order.title}</p>
                            <OrderStatusBadge
                              status={DeliveryOrderStatus.OPEN}
                              label={t('app.waylerFeed.statusOpen')}
                            />
                          </div>
                          <p className="mt-1 text-muted-foreground">{order.type}</p>
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
                          </dl>
                          <div className="wayly-action-group flex-col sm:flex-row">
                            <Button
                              variant="primary"
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
                              <KycActionBlockedHint
                                {...kycGateProps}
                                actionHint="acceptPostedOrder"
                              />
                            ) : canAcceptEligible && !waylerHasActiveAccess ? (
                              <p className="text-xs text-muted-foreground" role="note">
                                {t('app.waylerFeed.accessRequiredForAccept')}
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

            <Card id="wayler-accepted-panel" className={APP_PANEL_CLASS}>
              <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex flex-col gap-1">
                  <CardTitle>{t('app.waylerFeed.acceptedPanel.title')}</CardTitle>
                  {isApproved && acceptedOrders.length > 0 ? (
                    <p className="text-xs text-muted-foreground">
                      {t('app.waylerFeed.acceptedPanel.payment.refreshHint')}
                    </p>
                  ) : null}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                  disabled={
                    !isApproved ||
                    acceptedLoading ||
                    progressingOrderId !== null ||
                    submittingProofOrderId !== null
                  }
                  onClick={() => void loadAcceptedOrders()}
                >
                  {acceptedLoading
                    ? t('app.waylerFeed.acceptedPanel.refreshing')
                    : t('app.waylerFeed.acceptedPanel.refresh')}
                </Button>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <KycMarketplaceGateNotice {...kycGateProps} />
                {progressSuccess === 'transit' ? (
                  <p className="wayly-alert wayly-alert-success">
                    {t('app.waylerFeed.acceptedPanel.transitStarted')}
                  </p>
                ) : null}
                {progressSuccess === 'delivered' ? (
                  <p className="wayly-alert wayly-alert-success">
                    {t('app.waylerFeed.acceptedPanel.deliveredSuccess')}
                  </p>
                ) : null}
                {chatOpenError ? (
                  <p className="wayly-alert wayly-alert-danger">{chatOpenError}</p>
                ) : null}
                {disputesListLoadFailed && Object.keys(disputesByOrderId).length === 0 ? (
                  <PanelErrorState
                    message={t('app.disputes.disputeLoadFailed')}
                    retryLabel={t('app.disputes.retryDisputeStatus')}
                    onRetry={() => void loadUserDisputes()}
                    retryDisabled={disputesLoading}
                  />
                ) : null}
                {isApproved && acceptedError ? (
                  <PanelErrorState
                    message={acceptedError}
                    retryLabel={t('app.waylerFeed.acceptedPanel.retry')}
                    onRetry={() => void loadAcceptedOrders()}
                    retryDisabled={acceptedLoading}
                  />
                ) : null}
                {isApproved && acceptedLoading && acceptedOrders.length === 0 ? (
                  <div className="flex flex-col gap-3">
                    <p className="text-xs text-muted-foreground" role="status" aria-live="polite">
                      {t('app.waylerFeed.acceptedPanel.loading')}
                    </p>
                    <AcceptedOrdersSkeleton />
                  </div>
                ) : isApproved &&
                  !acceptedLoading &&
                  !acceptedError &&
                  acceptedOrders.length === 0 ? (
                  <PanelEmptyState
                    title={t('app.waylerFeed.acceptedPanel.emptyTitle')}
                    body={t('app.waylerFeed.acceptedPanel.emptyBody')}
                  />
                ) : isApproved && acceptedOrders.length > 0 ? (
                  <ul className="flex flex-col gap-4">
                    {acceptedOrders.map((order) => {
                      const isProgressing = progressingOrderId === order.id;
                      const isSubmittingProof = submittingProofOrderId === order.id;
                      const actionDisabled =
                        progressingOrderId !== null || submittingProofOrderId !== null;
                      const proofDraft = getProofDraft(order);
                      const proofNoteValue = proofDraft.note.trim();
                      const proofCodeValue = proofDraft.confirmationCode.trim();
                      const canSubmitProof = proofNoteValue.length > 0 || proofCodeValue.length > 0;
                      const hasExistingProof = Boolean(order.proofSubmittedAt);
                      const showProofForm =
                        order.status === DeliveryOrderStatus.IN_TRANSIT ||
                        order.status === DeliveryOrderStatus.DELIVERED;
                      const isProofDetailLoading =
                        proofDetailLoadingOrderIds.has(order.id) ||
                        (acceptedLoading && acceptedOrders.length > 0 && showProofForm);
                      const hasKnownProof =
                        hasExistingProof || Boolean(order.proofNote || order.proofConfirmationCode);
                      const paymentIntent = order.paymentIntent;
                      const paymentStatusNote = paymentIntent
                        ? waylerPaymentStatusNote(paymentIntent, t)
                        : null;

                      return (
                        <li
                          key={order.id}
                          id={acceptedOrderElementId(order.id)}
                          className={cn(
                            ORDER_CARD_CLASS,
                            highlightedOrderId === order.id &&
                              'ring-2 ring-primary ring-offset-2 ring-offset-background',
                          )}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-medium">{order.title}</p>
                            <OrderStatusBadge
                              status={order.status}
                              label={orderStatusLabel(order.status, t)}
                            />
                          </div>
                          <p className="mt-1 text-muted-foreground">{order.type}</p>
                          <DeliveryOrderSourceBadge
                            sourceType={order.sourceType}
                            availabilityRequestId={order.availabilityRequestId}
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
                                {t('app.waylerFeed.acceptedPanel.labelAcceptedAt')}
                              </dt>
                              <dd>
                                {order.acceptedAt
                                  ? new Date(order.acceptedAt).toLocaleString()
                                  : '—'}
                              </dd>
                            </div>
                          </dl>
                          {order.paymentLoadFailed ? (
                            <div className="mt-2">
                              <PanelErrorState
                                message={t('app.waylerFeed.acceptedPanel.payment.loadFailed')}
                                retryLabel={t(
                                  'app.waylerFeed.acceptedPanel.payment.retryPaymentStatus',
                                )}
                                onRetry={() => void refreshWaylerOrderPayment(order.id)}
                                retryDisabled={
                                  paymentStatusLoadingOrderIds.has(order.id) ||
                                  acceptedLoading ||
                                  paymentActionBusy
                                }
                              />
                            </div>
                          ) : null}
                          {paymentStatusLoadingOrderIds.has(order.id) ||
                          (acceptedLoading && acceptedOrders.length > 0) ? (
                            <p
                              className="mt-2 text-xs text-muted-foreground"
                              role="status"
                              aria-live="polite"
                            >
                              {paymentIntent
                                ? t('app.waylerFeed.acceptedPanel.payment.paymentRefreshing')
                                : t('app.waylerFeed.acceptedPanel.payment.paymentLoading')}
                            </p>
                          ) : null}
                          {!order.paymentLoadFailed &&
                          !paymentIntent &&
                          !paymentStatusLoadingOrderIds.has(order.id) &&
                          !(acceptedLoading && acceptedOrders.length > 0) ? (
                            <p className="mt-2 text-sm text-muted-foreground">
                              {t('app.waylerFeed.acceptedPanel.payment.notAuthorized')}
                            </p>
                          ) : null}
                          {paymentIntent ? (
                            <div className="wayly-proof-panel mt-3 rounded-xl border p-3">
                              <p className="text-sm font-medium">
                                {t('app.waylerFeed.acceptedPanel.payment.title')}
                              </p>
                              <p className="mt-1 text-sm font-medium">
                                {waylerPaymentStatusLabel(paymentIntent, t)}
                              </p>
                              {paymentStatusNote ? (
                                <p className="mt-2 text-sm text-muted-foreground">
                                  {paymentStatusNote}
                                </p>
                              ) : null}
                              <dl className="mt-2 flex flex-col gap-1 text-sm">
                                <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                                  <dt className="text-muted-foreground">
                                    {t('app.waylerFeed.acceptedPanel.payment.provider')}
                                  </dt>
                                  <dd>{paymentIntent.provider}</dd>
                                </div>
                                <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                                  <dt className="text-muted-foreground">
                                    {t('app.waylerFeed.acceptedPanel.payment.status')}
                                  </dt>
                                  <dd>{waylerPaymentStatusLabel(paymentIntent, t)}</dd>
                                </div>
                                <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                                  <dt className="text-muted-foreground">
                                    {t('app.waylerFeed.acceptedPanel.payment.amount')}
                                  </dt>
                                  <dd>
                                    {formatPaymentAmount(
                                      paymentIntent.amount,
                                      paymentIntent.currency,
                                    )}
                                  </dd>
                                </div>
                                {paymentIntent.platformFeeAmount ? (
                                  <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                                    <dt className="text-muted-foreground">
                                      {t('app.waylerFeed.acceptedPanel.payment.platformFee')}
                                    </dt>
                                    <dd>
                                      {formatPaymentAmount(
                                        paymentIntent.platformFeeAmount,
                                        paymentIntent.currency,
                                      )}
                                    </dd>
                                  </div>
                                ) : null}
                                {paymentIntent.escrowAmount ? (
                                  <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                                    <dt className="text-muted-foreground">
                                      {t('app.waylerFeed.acceptedPanel.payment.escrowAmount')}
                                    </dt>
                                    <dd>
                                      {formatPaymentAmount(
                                        paymentIntent.escrowAmount,
                                        paymentIntent.currency,
                                      )}
                                    </dd>
                                  </div>
                                ) : null}
                              </dl>
                            </div>
                          ) : null}
                          {order.status === DeliveryOrderStatus.ACCEPTED ? (
                            <>
                              {progressErrorOrderId === order.id && progressError ? (
                                <p className={cn(ALERT_ERROR_CLASS, 'mt-3 text-sm')} role="alert">
                                  {progressError}
                                </p>
                              ) : null}
                              <Button
                                className="mt-3 w-full sm:w-auto"
                                size="sm"
                                disabled={actionDisabled}
                                onClick={() => void handleStartTransit(order.id)}
                              >
                                {isProgressing && progressAction === 'start-transit'
                                  ? t('app.waylerFeed.acceptedPanel.startingTransit')
                                  : t('app.waylerFeed.acceptedPanel.startTransit')}
                              </Button>
                              <p className="mt-2 text-sm text-muted-foreground">
                                {t('app.waylerFeed.acceptedPanel.proofTransitRequired')}
                              </p>
                            </>
                          ) : null}
                          {order.status === DeliveryOrderStatus.IN_TRANSIT ? (
                            <>
                              {progressErrorOrderId === order.id && progressError ? (
                                <p className={cn(ALERT_ERROR_CLASS, 'mt-3 text-sm')} role="alert">
                                  {progressError}
                                </p>
                              ) : null}
                              <Button
                                className="mt-3 w-full sm:w-auto"
                                size="sm"
                                disabled={actionDisabled}
                                onClick={() => void handleMarkDelivered(order.id)}
                              >
                                {isProgressing && progressAction === 'mark-delivered'
                                  ? t('app.waylerFeed.acceptedPanel.markingDelivered')
                                  : t('app.waylerFeed.acceptedPanel.markDelivered')}
                              </Button>
                            </>
                          ) : null}
                          {order.status === DeliveryOrderStatus.DELIVERED ? (
                            <p className="mt-3 text-sm text-muted-foreground">
                              {t('app.waylerFeed.acceptedPanel.delivered')}
                            </p>
                          ) : null}
                          {SENDER_LIFECYCLE_STATUSES.has(order.status) ? (
                            <AcceptedOrderDisputeSection
                              dispute={disputesByOrderId[order.id]}
                              disputesLoading={disputesLoading}
                              disputesListLoadFailed={disputesListLoadFailed}
                              onRetryDisputes={() => void loadUserDisputes()}
                              t={t}
                            />
                          ) : null}
                          <div className="wayly-action-group mt-3">
                            <Button
                              className="w-full sm:w-auto"
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleOpenOrderDetails(toAcceptedOrderDetailsInput(order), 'wayler')
                              }
                            >
                              {t('app.orders.viewDetails')}
                            </Button>
                            {SENDER_LIFECYCLE_STATUSES.has(order.status) ? (
                              <>
                                <Button
                                  className="w-full sm:w-auto"
                                  variant="outline"
                                  size="sm"
                                  disabled={openingChatOrderId !== null || !waylerHasActiveAccess}
                                  onClick={() => void handleOpenChat(order.id, order.title)}
                                >
                                  {openingChatOrderId === order.id
                                    ? t('app.chat.loading')
                                    : t('app.chat.open')}
                                </Button>
                                {!waylerHasActiveAccess ? (
                                  <p className="text-xs text-muted-foreground" role="note">
                                    {t('app.chat.accessRequiredForContact')}
                                  </p>
                                ) : null}
                                <Button
                                  className="w-full sm:w-auto"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleOpenDispute(order.id, order.title)}
                                >
                                  {disputesByOrderId[order.id]
                                    ? t('app.disputes.view')
                                    : t('app.disputes.open')}
                                </Button>
                              </>
                            ) : null}
                          </div>
                          {showProofForm ? (
                            <div className="wayly-proof-panel mt-3 rounded-xl border p-3">
                              <p className="text-sm font-medium">
                                {t('app.waylerFeed.acceptedPanel.proofTitle')}
                              </p>
                              {isProofDetailLoading ? (
                                <p
                                  className="mt-1 text-xs text-muted-foreground"
                                  role="status"
                                  aria-live="polite"
                                >
                                  {hasKnownProof
                                    ? t('app.waylerFeed.acceptedPanel.proofRefreshing')
                                    : t('app.waylerFeed.acceptedPanel.proofLoading')}
                                </p>
                              ) : null}
                              {order.proofLoadFailed ? (
                                <div className="mt-2">
                                  <PanelErrorState
                                    message={t('app.waylerFeed.acceptedPanel.proofLoadFailed')}
                                    retryLabel={t('app.waylerFeed.acceptedPanel.retryProofStatus')}
                                    onRetry={() => void refreshWaylerOrderProof(order.id)}
                                    retryDisabled={
                                      isProofDetailLoading || actionDisabled || paymentActionBusy
                                    }
                                  />
                                </div>
                              ) : null}
                              {order.proofNote ||
                              order.proofConfirmationCode ||
                              order.proofSubmittedAt ? (
                                <dl className="mt-2 flex flex-col gap-1 text-sm">
                                  {order.proofNote ? (
                                    <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                                      <dt className="text-muted-foreground">
                                        {t('app.waylerFeed.acceptedPanel.proofNote')}
                                      </dt>
                                      <dd>{order.proofNote}</dd>
                                    </div>
                                  ) : null}
                                  {order.proofConfirmationCode ? (
                                    <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                                      <dt className="text-muted-foreground">
                                        {t('app.waylerFeed.acceptedPanel.proofConfirmationCode')}
                                      </dt>
                                      <dd className="font-mono text-xs">
                                        {order.proofConfirmationCode}
                                      </dd>
                                    </div>
                                  ) : null}
                                  {order.proofSubmittedAt ? (
                                    <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                                      <dt className="text-muted-foreground">
                                        {t('app.waylerFeed.acceptedPanel.proofSubmittedAt')}
                                      </dt>
                                      <dd>{new Date(order.proofSubmittedAt).toLocaleString()}</dd>
                                    </div>
                                  ) : null}
                                </dl>
                              ) : !order.proofLoadFailed &&
                                !isProofDetailLoading &&
                                !hasExistingProof ? (
                                <div className="mt-2">
                                  <PanelEmptyState
                                    title={t('app.waylerFeed.acceptedPanel.proofEmptyTitle')}
                                    body={t('app.waylerFeed.acceptedPanel.proofEmptyBody')}
                                  />
                                </div>
                              ) : null}
                              {proofSuccessOrderId === order.id ? (
                                <p
                                  className={cn('mt-2', ALERT_SUCCESS_CLASS, 'px-2 py-1.5')}
                                  role="status"
                                >
                                  {t('app.waylerFeed.acceptedPanel.proofSuccess')}
                                </p>
                              ) : null}
                              {proofErrorOrderId === order.id && proofError ? (
                                <p className={cn(ALERT_ERROR_CLASS, 'mt-2 text-sm')} role="alert">
                                  {proofError}
                                </p>
                              ) : null}
                              <div className="mt-3 flex flex-col gap-3">
                                <label className="flex flex-col gap-1.5 text-sm">
                                  <span className="font-medium">
                                    {t('app.waylerFeed.acceptedPanel.proofNote')}
                                  </span>
                                  <textarea
                                    className={PROOF_TEXTAREA_CLASS}
                                    value={proofDraft.note}
                                    onChange={(e) =>
                                      updateProofDraft(order.id, { note: e.target.value })
                                    }
                                    disabled={actionDisabled}
                                    rows={3}
                                  />
                                </label>
                                <label className="flex flex-col gap-1.5 text-sm">
                                  <span className="font-medium">
                                    {t('app.waylerFeed.acceptedPanel.proofConfirmationCode')}
                                  </span>
                                  <Input
                                    value={proofDraft.confirmationCode}
                                    onChange={(e) =>
                                      updateProofDraft(order.id, {
                                        confirmationCode: e.target.value,
                                      })
                                    }
                                    disabled={actionDisabled}
                                  />
                                </label>
                                {!canSubmitProof ? (
                                  <p className="text-xs text-muted-foreground">
                                    {t('app.waylerFeed.acceptedPanel.proofAtLeastOne')}
                                  </p>
                                ) : null}
                                <Button
                                  className="w-full sm:w-auto"
                                  size="sm"
                                  disabled={actionDisabled || !canSubmitProof}
                                  onClick={() => void handleSubmitProof(order.id)}
                                >
                                  {isSubmittingProof
                                    ? t('app.waylerFeed.acceptedPanel.submittingProof')
                                    : hasExistingProof
                                      ? t('app.waylerFeed.acceptedPanel.updateProof')
                                      : t('app.waylerFeed.acceptedPanel.submitProof')}
                                </Button>
                              </div>
                            </div>
                          ) : null}
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
              </CardContent>
            </Card>

            <Card className={APP_PANEL_CLASS}>
              <CardHeader>
                <CardTitle>{t('app.waylerAvailability.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <WaylerAvailabilityPanel kycGate={kycGateProps} />
              </CardContent>
            </Card>

            <Card className={APP_PANEL_CLASS}>
              <CardHeader>
                <CardTitle>{t('app.availabilityRequests.incomingRequests')}</CardTitle>
              </CardHeader>
              <CardContent>
                <WaylerIncomingRequestsPanel
                  kycGate={kycGateProps}
                  waylerHasActiveAccess={waylerHasActiveAccess}
                  onRequestAccepted={() => void loadAcceptedOrders()}
                />
              </CardContent>
            </Card>
          </>
        ) : null}

        {mode === 'sender' ? (
          <>
            <Card className={APP_PANEL_CLASS}>
              <CardHeader>
                <CardTitle>{t('app.orders.createTitle')}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <p className="text-sm text-muted-foreground">{t('app.orders.createDescription')}</p>
                <KycMarketplaceGateNotice {...senderKycGateProps} />
                {orderError ? <p className="wayly-alert wayly-alert-danger">{orderError}</p> : null}
                {orderSuccess ? (
                  <p className="wayly-alert wayly-alert-success" role="status">
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
                      disabled={kycLoading || !isApproved || orderSubmitting}
                    />
                  </label>
                  <label className="flex flex-col gap-1.5 text-sm">
                    <span className="font-medium">{t('app.orders.fieldType')}</span>
                    <select
                      className={FEED_SELECT_CLASS}
                      value={orderType}
                      onChange={(e) => setOrderType(e.target.value as 'LOCAL' | 'INTERNATIONAL')}
                      disabled={kycLoading || !isApproved || orderSubmitting}
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
                      disabled={kycLoading || !isApproved || orderSubmitting}
                    />
                  </label>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="flex flex-col gap-1.5 text-sm">
                      <span className="font-medium">{t('app.orders.fieldPickupCountry')}</span>
                      <Input
                        value={pickupCountry}
                        onChange={(e) => setPickupCountry(e.target.value)}
                        disabled={kycLoading || !isApproved || orderSubmitting}
                      />
                    </label>
                    <label className="flex flex-col gap-1.5 text-sm">
                      <span className="font-medium">{t('app.orders.fieldPickupCity')}</span>
                      <Input
                        value={pickupCity}
                        onChange={(e) => setPickupCity(e.target.value)}
                        disabled={kycLoading || !isApproved || orderSubmitting}
                      />
                    </label>
                    <label className="flex flex-col gap-1.5 text-sm">
                      <span className="font-medium">{t('app.orders.fieldDropoffCountry')}</span>
                      <Input
                        value={dropoffCountry}
                        onChange={(e) => setDropoffCountry(e.target.value)}
                        disabled={kycLoading || !isApproved || orderSubmitting}
                      />
                    </label>
                    <label className="flex flex-col gap-1.5 text-sm">
                      <span className="font-medium">{t('app.orders.fieldDropoffCity')}</span>
                      <Input
                        value={dropoffCity}
                        onChange={(e) => setDropoffCity(e.target.value)}
                        disabled={kycLoading || !isApproved || orderSubmitting}
                      />
                    </label>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="flex flex-col gap-1.5 text-sm">
                      <span className="font-medium">{t('app.orders.fieldCurrency')}</span>
                      <Input
                        value={orderCurrency}
                        onChange={(e) => setOrderCurrency(e.target.value)}
                        disabled={kycLoading || !isApproved || orderSubmitting}
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
                        disabled={kycLoading || !isApproved || orderSubmitting}
                      />
                    </label>
                  </div>
                  <Button
                    type="submit"
                    disabled={kycLoading || !isApproved || orderSubmitting || !orderTitle.trim()}
                  >
                    {orderSubmitting ? t('app.orders.submitting') : t('app.orders.submitCreate')}
                  </Button>
                  {!isApproved ? (
                    <KycActionBlockedHint {...kycGateProps} actionHint="postOrder" />
                  ) : null}
                </form>
              </CardContent>
            </Card>

            <Card className={APP_PANEL_CLASS}>
              <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle>{t('app.senderPanel.draftsTitle')}</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!canViewSenderOrders || draftsLoading || senderListActionBusy}
                  onClick={() => void loadDraftOrders()}
                >
                  {t('app.senderPanel.refresh')}
                </Button>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <KycMarketplaceGateNotice {...senderKycGateProps} />
                {cancelError ? (
                  <p className="wayly-alert wayly-alert-danger">{cancelError}</p>
                ) : null}
                {cancelSuccessPanel === 'draft' ? (
                  <p className="wayly-alert wayly-alert-success" role="status">
                    {t('app.senderPanel.cancelSuccess')}
                  </p>
                ) : null}
                {publishError ? (
                  <p className="wayly-alert wayly-alert-danger">{publishError}</p>
                ) : null}
                {publishSuccess ? (
                  <p className="wayly-alert wayly-alert-success" role="status">
                    {t('app.senderPanel.publishSuccess')}
                  </p>
                ) : null}
                {draftsError ? (
                  <p className="wayly-alert wayly-alert-danger">{draftsError}</p>
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
                          className={cn(ORDER_CARD_CLASS, isExitingDraft && 'wayly-feed-item-exit')}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-medium">{order.title}</p>
                            <OrderStatusBadge
                              status={DeliveryOrderStatus.DRAFT}
                              label={orderStatusLabel(DeliveryOrderStatus.DRAFT, t)}
                            />
                          </div>
                          <p className="mt-1 text-muted-foreground">{order.type}</p>
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
                          <div className="wayly-action-group">
                            <Button
                              variant="secondary"
                              size="sm"
                              className="transition-all duration-200 ease-out"
                              disabled={!canViewSenderOrders || senderListActionBusy}
                              onClick={() => void handlePublishDraft(order.id)}
                            >
                              {publishingOrderId === order.id
                                ? t('app.senderPanel.publishing')
                                : t('app.orders.publish')}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={!canViewSenderOrders || senderListActionBusy}
                              onClick={() => void handleCancelOrder(order.id, 'draft')}
                            >
                              {cancellingOrderId === order.id
                                ? t('app.senderPanel.cancelling')
                                : t('app.senderPanel.cancel')}
                            </Button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
              </CardContent>
            </Card>

            <Card className={APP_PANEL_CLASS}>
              <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle>{t('app.senderPanel.publishedTitle')}</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!canViewSenderOrders || publishedLoading || senderListActionBusy}
                  onClick={() => void loadPublishedOrders()}
                >
                  {publishedLoading && publishedOrders.length > 0
                    ? t('app.senderPanel.refreshing')
                    : t('app.senderPanel.refresh')}
                </Button>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <KycMarketplaceGateNotice {...senderKycGateProps} />
                {cancelError ? (
                  <p className="wayly-alert wayly-alert-danger">{cancelError}</p>
                ) : null}
                {cancelSuccessPanel === 'published' ? (
                  <p className="wayly-alert wayly-alert-success" role="status">
                    {t('app.senderPanel.cancelSuccess')}
                  </p>
                ) : null}
                {canViewSenderOrders && publishedError ? (
                  <PanelErrorState
                    message={publishedError}
                    retryLabel={t('app.senderPanel.retryPostedOrders')}
                    onRetry={() => void loadPublishedOrders()}
                    retryDisabled={publishedLoading}
                  />
                ) : null}
                {canViewSenderOrders && publishedLoading && publishedOrders.length === 0 ? (
                  <div className="flex flex-col gap-3">
                    <p className="text-xs text-muted-foreground" role="status" aria-live="polite">
                      {t('app.senderPanel.postedOrdersLoading')}
                    </p>
                    <SenderOrdersSkeleton />
                  </div>
                ) : canViewSenderOrders &&
                  !publishedLoading &&
                  !publishedError &&
                  publishedOrders.length === 0 ? (
                  <PanelEmptyState
                    title={t('app.senderPanel.postedOrdersEmptyTitle')}
                    body={t('app.senderPanel.postedOrdersEmptyBody')}
                  />
                ) : canViewSenderOrders && publishedOrders.length > 0 ? (
                  <ul className="flex flex-col gap-4">
                    {publishedOrders.map((order) => {
                      const isExitingPublished = exitingPublishedIds.has(order.id);

                      return (
                        <li
                          key={order.id}
                          className={cn(
                            ORDER_CARD_CLASS,
                            isExitingPublished && 'wayly-feed-item-exit',
                          )}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-medium">{order.title}</p>
                            <OrderStatusBadge
                              status={DeliveryOrderStatus.OPEN}
                              label={orderStatusLabel(DeliveryOrderStatus.OPEN, t)}
                            />
                          </div>
                          <p className="mt-1 text-muted-foreground">{order.type}</p>
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
                          </dl>
                          <div className="wayly-action-group">
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={!canViewSenderOrders || senderListActionBusy}
                              onClick={() => void handleCancelOrder(order.id, 'published')}
                            >
                              {cancellingOrderId === order.id
                                ? t('app.senderPanel.cancelling')
                                : t('app.senderPanel.cancel')}
                            </Button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
              </CardContent>
            </Card>

            <Card id="sender-accepted-panel" className={APP_PANEL_CLASS}>
              <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle>{t('app.senderPanel.acceptedTitle')}</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!canViewSenderOrders || senderAcceptedLoading}
                  onClick={() => void loadSenderAcceptedOrders()}
                >
                  {senderAcceptedLoading
                    ? t('app.senderPanel.refreshing')
                    : t('app.senderPanel.refresh')}
                </Button>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <KycMarketplaceGateNotice {...senderKycGateProps} />
                {chatOpenError ? (
                  <p className="wayly-alert wayly-alert-danger">{chatOpenError}</p>
                ) : null}
                {disputesListLoadFailed && Object.keys(disputesByOrderId).length === 0 ? (
                  <PanelErrorState
                    message={t('app.disputes.disputeLoadFailed')}
                    retryLabel={t('app.disputes.retryDisputeStatus')}
                    onRetry={() => void loadUserDisputes()}
                    retryDisabled={disputesLoading}
                  />
                ) : null}
                {canViewSenderOrders && senderAcceptedError ? (
                  <PanelErrorState
                    message={senderAcceptedError}
                    retryLabel={t('app.senderPanel.retryAccepted')}
                    onRetry={() => void loadSenderAcceptedOrders()}
                    retryDisabled={senderAcceptedLoading}
                  />
                ) : null}
                {canViewSenderOrders &&
                senderAcceptedLoading &&
                senderAcceptedOrders.length === 0 ? (
                  <div className="flex flex-col gap-3">
                    <p className="text-xs text-muted-foreground" role="status" aria-live="polite">
                      {t('app.senderPanel.acceptedLoading')}
                    </p>
                    <SenderOrdersSkeleton />
                  </div>
                ) : canViewSenderOrders &&
                  !senderAcceptedLoading &&
                  !senderAcceptedError &&
                  senderAcceptedOrders.length === 0 ? (
                  <PanelEmptyState
                    title={t('app.senderPanel.acceptedEmptyTitle')}
                    body={t('app.senderPanel.acceptedEmptyBody')}
                  />
                ) : canViewSenderOrders && senderAcceptedOrders.length > 0 ? (
                  <ul className="flex flex-col gap-4">
                    {senderAcceptedOrders.map((order) => {
                      const statusNote = senderStatusNote(order.status, t);
                      const paymentIntent = order.paymentIntent;
                      const paymentStatus = paymentIntent?.status ?? null;
                      const canAuthorizePayment =
                        (!paymentIntent || paymentStatus === PaymentStatus.PENDING) &&
                        (order.status === DeliveryOrderStatus.ACCEPTED ||
                          order.status === DeliveryOrderStatus.IN_TRANSIT);
                      const canHoldEscrow = paymentStatus === PaymentStatus.AUTHORIZED;
                      const canReleasePayment =
                        paymentStatus === PaymentStatus.HELD_IN_ESCROW &&
                        order.status === DeliveryOrderStatus.DELIVERED &&
                        Boolean(order.proofSubmittedAt);
                      const showReleaseRequirements =
                        paymentStatus === PaymentStatus.HELD_IN_ESCROW && !canReleasePayment;
                      const terminalPaymentStatus =
                        paymentStatus === PaymentStatus.REFUNDED ||
                        paymentStatus === PaymentStatus.FAILED ||
                        paymentStatus === PaymentStatus.CANCELLED;
                      const paymentSuccessMessage =
                        paymentSuccessOrderId === order.id
                          ? paymentSuccessKind === 'authorize'
                            ? t('app.senderPanel.payment.authorizeSuccess')
                            : paymentSuccessKind === 'hold'
                              ? t('app.senderPanel.payment.holdSuccess')
                              : paymentSuccessKind === 'release'
                                ? t('app.senderPanel.payment.releaseSuccess')
                                : null
                          : null;
                      const showSenderProofPanel =
                        order.status === DeliveryOrderStatus.IN_TRANSIT ||
                        order.status === DeliveryOrderStatus.DELIVERED ||
                        Boolean(order.proofSubmittedAt);
                      const isSenderProofLoading =
                        proofDetailLoadingOrderIds.has(order.id) ||
                        (senderAcceptedLoading &&
                          senderAcceptedOrders.length > 0 &&
                          showSenderProofPanel);
                      const hasSenderKnownProof =
                        Boolean(order.proofSubmittedAt) ||
                        Boolean(order.proofNote || order.proofConfirmationCode);

                      return (
                        <li
                          key={order.id}
                          id={acceptedOrderElementId(order.id)}
                          className={cn(
                            ORDER_CARD_CLASS,
                            highlightedOrderId === order.id &&
                              'ring-2 ring-primary ring-offset-2 ring-offset-background',
                          )}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-medium">{order.title}</p>
                            <OrderStatusBadge
                              status={order.status}
                              label={orderStatusLabel(order.status, t)}
                            />
                          </div>
                          <p className="mt-1 text-muted-foreground">{order.type}</p>
                          <DeliveryOrderSourceBadge
                            sourceType={order.sourceType}
                            availabilityRequestId={order.availabilityRequestId}
                          />
                          {statusNote ? (
                            <p className="wayly-inline-note mt-2 rounded-lg border px-3 py-2 text-sm text-muted-foreground">
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
                          {showSenderProofPanel ? (
                            <div className="wayly-proof-panel mt-3 rounded-xl border p-3">
                              <p className="text-sm font-medium">
                                {t('app.senderPanel.proofTitle')}
                              </p>
                              {isSenderProofLoading ? (
                                <p
                                  className="mt-1 text-xs text-muted-foreground"
                                  role="status"
                                  aria-live="polite"
                                >
                                  {hasSenderKnownProof
                                    ? t('app.senderPanel.proofRefreshing')
                                    : t('app.senderPanel.proofLoading')}
                                </p>
                              ) : null}
                              {order.proofLoadFailed ? (
                                <div className="mt-2">
                                  <PanelErrorState
                                    message={t('app.senderPanel.proofLoadFailed')}
                                    retryLabel={t('app.senderPanel.retryProofStatus')}
                                    onRetry={() => void refreshSenderOrderProof(order.id)}
                                    retryDisabled={
                                      isSenderProofLoading ||
                                      senderAcceptedLoading ||
                                      paymentActionBusy
                                    }
                                  />
                                </div>
                              ) : null}
                              {order.proofSubmittedAt ? (
                                <dl className="mt-2 flex flex-col gap-1 text-sm">
                                  {order.proofNote ? (
                                    <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                                      <dt className="text-muted-foreground">
                                        {t('app.senderPanel.proofNote')}
                                      </dt>
                                      <dd>{order.proofNote}</dd>
                                    </div>
                                  ) : null}
                                  {order.proofConfirmationCode ? (
                                    <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                                      <dt className="text-muted-foreground">
                                        {t('app.senderPanel.proofConfirmationCode')}
                                      </dt>
                                      <dd className="font-mono text-xs">
                                        {order.proofConfirmationCode}
                                      </dd>
                                    </div>
                                  ) : null}
                                  <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                                    <dt className="text-muted-foreground">
                                      {t('app.senderPanel.proofSubmittedAt')}
                                    </dt>
                                    <dd>{new Date(order.proofSubmittedAt).toLocaleString()}</dd>
                                  </div>
                                </dl>
                              ) : !order.proofLoadFailed && !isSenderProofLoading ? (
                                <div className="mt-2">
                                  <PanelEmptyState
                                    title={
                                      order.status === DeliveryOrderStatus.DELIVERED
                                        ? t('app.senderPanel.proofMissingTitle')
                                        : t('app.senderPanel.proofPendingTitle')
                                    }
                                    body={
                                      order.status === DeliveryOrderStatus.DELIVERED
                                        ? t('app.senderPanel.proofMissingBody')
                                        : t('app.senderPanel.proofPendingBody')
                                    }
                                  />
                                </div>
                              ) : null}
                            </div>
                          ) : null}
                          <div className="wayly-proof-panel mt-3 rounded-xl border p-3">
                            <p className="text-sm font-medium">
                              {t('app.senderPanel.payment.title')}
                            </p>
                            {senderAcceptedLoading && senderAcceptedOrders.length > 0 ? (
                              <p
                                className="mt-1 text-xs text-muted-foreground"
                                role="status"
                                aria-live="polite"
                              >
                                {paymentIntent
                                  ? t('app.senderPanel.payment.paymentRefreshing')
                                  : t('app.senderPanel.payment.paymentLoading')}
                              </p>
                            ) : null}
                            {paymentStatusLoadingOrderIds.has(order.id) &&
                            !senderAcceptedLoading ? (
                              <p
                                className="mt-1 text-xs text-muted-foreground"
                                role="status"
                                aria-live="polite"
                              >
                                {paymentIntent
                                  ? t('app.senderPanel.payment.paymentRefreshing')
                                  : t('app.senderPanel.payment.paymentLoading')}
                              </p>
                            ) : null}
                            {order.paymentLoadFailed ? (
                              <div className="mt-2">
                                <PanelErrorState
                                  message={t('app.senderPanel.payment.loadFailed')}
                                  retryLabel={t('app.senderPanel.payment.retryPaymentStatus')}
                                  onRetry={() => void refreshSenderOrderPayment(order.id)}
                                  retryDisabled={
                                    paymentStatusLoadingOrderIds.has(order.id) ||
                                    senderAcceptedLoading ||
                                    paymentActionBusy
                                  }
                                />
                              </div>
                            ) : null}
                            {paymentSuccessMessage ? (
                              <p className={cn(ALERT_SUCCESS_CLASS, 'mt-2 text-sm')}>
                                {paymentSuccessMessage}
                              </p>
                            ) : null}
                            {paymentErrorOrderId === order.id && paymentError ? (
                              <p className={cn(ALERT_ERROR_CLASS, 'mt-2 text-sm')} role="alert">
                                {paymentError}
                              </p>
                            ) : null}
                            <p className="mt-1 text-sm font-medium">
                              {senderPaymentStatusLabel(paymentIntent, t)}
                            </p>
                            <dl className="mt-2 flex flex-col gap-1 text-sm">
                              {paymentIntent ? (
                                <>
                                  <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                                    <dt className="text-muted-foreground">
                                      {t('app.senderPanel.payment.provider')}
                                    </dt>
                                    <dd>{paymentIntent.provider}</dd>
                                  </div>
                                  <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                                    <dt className="text-muted-foreground">
                                      {t('app.senderPanel.payment.amount')}
                                    </dt>
                                    <dd>
                                      {formatPaymentAmount(
                                        paymentIntent.amount,
                                        paymentIntent.currency,
                                      )}
                                    </dd>
                                  </div>
                                  {paymentIntent.platformFeeAmount ? (
                                    <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                                      <dt className="text-muted-foreground">
                                        {t('app.senderPanel.payment.platformFee')}
                                      </dt>
                                      <dd>
                                        {formatPaymentAmount(
                                          paymentIntent.platformFeeAmount,
                                          paymentIntent.currency,
                                        )}
                                      </dd>
                                    </div>
                                  ) : null}
                                  {paymentIntent.escrowAmount ? (
                                    <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                                      <dt className="text-muted-foreground">
                                        {t('app.senderPanel.payment.escrowAmount')}
                                      </dt>
                                      <dd>
                                        {formatPaymentAmount(
                                          paymentIntent.escrowAmount,
                                          paymentIntent.currency,
                                        )}
                                      </dd>
                                    </div>
                                  ) : null}
                                </>
                              ) : null}
                            </dl>
                            {showReleaseRequirements ? (
                              <p className="mt-2 text-sm text-muted-foreground">
                                {t('app.senderPanel.payment.releaseRequirements')}
                              </p>
                            ) : null}
                            {!terminalPaymentStatus && paymentStatus !== PaymentStatus.RELEASED ? (
                              <div className="wayly-action-group mt-3">
                                {canAuthorizePayment ? (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={paymentActionBusy}
                                    onClick={() => void handleMockAuthorizePayment(order.id)}
                                  >
                                    {paymentActionOrderId === order.id &&
                                    paymentAction === 'authorize'
                                      ? t('app.senderPanel.payment.mockAuthorizing')
                                      : t('app.senderPanel.payment.mockAuthorize')}
                                  </Button>
                                ) : null}
                                {canHoldEscrow && paymentIntent ? (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={paymentActionBusy}
                                    onClick={() =>
                                      void handleMockHoldEscrow(order.id, paymentIntent.id)
                                    }
                                  >
                                    {paymentActionOrderId === order.id && paymentAction === 'hold'
                                      ? t('app.senderPanel.payment.capturing')
                                      : t('app.senderPanel.payment.mockHoldEscrow')}
                                  </Button>
                                ) : null}
                                {canReleasePayment && paymentIntent ? (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={paymentActionBusy}
                                    onClick={() =>
                                      void handleMockReleasePayment(order.id, paymentIntent.id)
                                    }
                                  >
                                    {paymentActionOrderId === order.id &&
                                    paymentAction === 'release'
                                      ? t('app.senderPanel.payment.mockReleasing')
                                      : t('app.senderPanel.payment.mockRelease')}
                                  </Button>
                                ) : null}
                              </div>
                            ) : null}
                          </div>
                          {SENDER_LIFECYCLE_STATUSES.has(order.status) ? (
                            <AcceptedOrderDisputeSection
                              dispute={disputesByOrderId[order.id]}
                              disputesLoading={disputesLoading}
                              disputesListLoadFailed={disputesListLoadFailed}
                              onRetryDisputes={() => void loadUserDisputes()}
                              t={t}
                            />
                          ) : null}
                          <div className="wayly-action-group mt-3">
                            <Button
                              className="w-full sm:w-auto"
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleOpenOrderDetails(toAcceptedOrderDetailsInput(order), 'sender')
                              }
                            >
                              {t('app.orders.viewDetails')}
                            </Button>
                            {SENDER_LIFECYCLE_STATUSES.has(order.status) ? (
                              <>
                                <Button
                                  className="w-full sm:w-auto"
                                  variant="outline"
                                  size="sm"
                                  disabled={openingChatOrderId !== null}
                                  onClick={() => void handleOpenChat(order.id, order.title)}
                                >
                                  {openingChatOrderId === order.id
                                    ? t('app.chat.loading')
                                    : t('app.chat.open')}
                                </Button>
                                <Button
                                  className="w-full sm:w-auto"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleOpenDispute(order.id, order.title)}
                                >
                                  {disputesByOrderId[order.id]
                                    ? t('app.disputes.view')
                                    : t('app.disputes.open')}
                                </Button>
                              </>
                            ) : null}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
              </CardContent>
            </Card>

            <Card className={APP_PANEL_CLASS}>
              <CardHeader>
                <CardTitle>{t('app.senderWaylers.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <SenderWaylersPanel
                  kycGate={senderKycGateProps}
                  canBrowse={!!canViewSenderOrders}
                  onAcceptedOrdersRefresh={() => void loadSenderAcceptedOrders()}
                />
              </CardContent>
            </Card>
          </>
        ) : null}

        <ConversationPanel
          open={chatOpen}
          onClose={handleCloseChat}
          conversationId={chatConversationId}
          orderTitle={chatOrderTitle}
          orderId={chatOrderId}
          currentUserId={user.id}
          waylerSendBlocked={mode === 'wayler' && !waylerHasActiveAccess}
        />

        <DisputePanel
          open={disputeOpen}
          onClose={handleCloseDispute}
          orderId={disputeOrderId}
          orderTitle={disputeOrderTitle}
          disputeId={disputeId}
          currentUserId={user.id}
          onDisputeOpened={handleDisputeOpened}
          onDisputeChanged={() => void loadUserDisputes()}
        />

        <AcceptedOrderDetailsDrawer
          open={detailsOpen}
          onClose={handleCloseOrderDetails}
          order={detailsOrder}
          panelRole={detailsPanelRole}
          statusLabel={detailsStatusLabel}
        />

        <Card className={APP_PANEL_CLASS}>
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

        <Card className={APP_PANEL_CLASS}>
          <CardHeader>
            <CardTitle>{t('app.kycPanel.title')}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {kycError ? (
              <PanelErrorState
                message={kycError}
                retryLabel={t('app.kycGate.retryKycStatus')}
                onRetry={() => void loadKycStatus()}
                retryDisabled={kycLoading}
              />
            ) : null}
            {kycLoading ? (
              <p className="text-sm text-muted-foreground" role="status" aria-live="polite">
                {t('app.kycGate.kycLoading')}
              </p>
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

        <div className={cn('wayly-alert wayly-alert-info rounded-2xl px-4 py-3')} role="status">
          {t('app.kycNotice')}
        </div>

        <p className="text-sm text-muted-foreground">{t('app.placeholderNotice')}</p>
      </Container>
    </div>
  );
}
