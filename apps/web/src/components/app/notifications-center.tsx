'use client';

import { ApiError } from '@wayly/sdk';
import type { NotificationSummary } from '@wayly/types';
import { NotificationEntityType } from '@wayly/types';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@wayly/ui';
import { Bell, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

import {
  PanelEmptyState,
  PanelErrorState,
  RequestsListSkeleton,
} from '@/components/app/panel-status-states';
import type { TranslationKey } from '@/lib/i18n/dictionaries';
import { useI18n } from '@/lib/i18n/i18n-context';
import { resolveOrderIdFromNotification } from '@/lib/notifications/notification-order-focus';
import { api } from '@/lib/sdk';
import { cn } from '@/lib/utils';

const APP_PANEL_CLASS = 'wayly-app-panel';

const LISTING_CARD_CLASS = cn('rounded-lg border px-3 py-2.5 text-sm', 'wayly-feed-item-enter');

export type NotificationsCenterProps = {
  className?: string;
  onFocusOrder?: (orderId: string) => void | Promise<void>;
};

function formatDateTime(value: string): string {
  try {
    return new Date(value).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return value;
  }
}

function notificationTypeKey(type: NotificationSummary['type']): TranslationKey {
  return `app.notifications.type.${type}` as TranslationKey;
}

export function NotificationsCenter({ className, onFocusOrder }: NotificationsCenterProps) {
  const { t } = useI18n();
  const [expanded, setExpanded] = useState(false);
  const [items, setItems] = useState<NotificationSummary[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadedOnce, setLoadedOnce] = useState(false);
  const [markingReadId, setMarkingReadId] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);

  const loadUnreadCount = useCallback(async () => {
    try {
      const result = await api.notifications.unreadCount();
      setUnreadCount(result.unreadCount);
    } catch {
      // Keep last known badge on background failure.
    }
  }, []);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.notifications.listMine({ page: 1, limit: 20 });
      setItems(result.items);
      setUnreadCount(result.unreadCount);
      setLoadedOnce(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('app.notifications.error'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (expanded && !loadedOnce && !loading) {
      void loadNotifications();
    }
  }, [expanded, loadedOnce, loading, loadNotifications]);

  useEffect(() => {
    void loadUnreadCount();
  }, [loadUnreadCount]);

  const handleMarkRead = async (id: string) => {
    setMarkingReadId(id);
    try {
      const updated = await api.notifications.markRead(id);
      setItems((current) => current.map((item) => (item.id === id ? updated : item)));
      await loadUnreadCount();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('app.notifications.error'));
    } finally {
      setMarkingReadId(null);
    }
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      await api.notifications.markAllRead();
      setUnreadCount(0);
      await loadNotifications();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('app.notifications.error'));
    } finally {
      setMarkingAll(false);
    }
  };

  const handleItemAction = async (item: NotificationSummary) => {
    if (item.readAt === null) {
      await handleMarkRead(item.id);
    }
    const orderId = resolveOrderIdFromNotification(item);
    if (orderId && onFocusOrder) {
      await onFocusOrder(orderId);
      return;
    }
    if (item.linkHref?.startsWith('/')) {
      window.location.assign(item.linkHref);
    }
  };

  return (
    <Card id="notifications-center" className={cn(APP_PANEL_CLASS, className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Bell className="size-4 shrink-0 text-primary/80" aria-hidden />
              {t('app.notifications.title')}
              {unreadCount > 0 ? (
                <span className="wayly-status-badge wayly-status-default text-[10px]">
                  {t('app.notifications.unreadCount').replace('{count}', String(unreadCount))}
                </span>
              ) : null}
            </CardTitle>
            <p className="text-sm text-muted-foreground">{t('app.notifications.subtitle')}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="shrink-0"
            onClick={() => setExpanded((value) => !value)}
            aria-expanded={expanded}
          >
            {expanded ? (
              <>
                <ChevronUp className="size-4" aria-hidden />
                <span className="sr-only sm:not-sr-only">{t('app.notifications.collapse')}</span>
              </>
            ) : (
              <>
                <ChevronDown className="size-4" aria-hidden />
                <span className="sr-only sm:not-sr-only">{t('app.notifications.expand')}</span>
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      {expanded ? (
        <CardContent className="flex flex-col gap-3">
          <p className="rounded-md border border-amber-500/20 bg-amber-500/[0.04] px-3 py-2 text-xs leading-relaxed text-muted-foreground">
            {t('app.notifications.notice')}
          </p>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={loading || markingAll}
              onClick={() => void loadNotifications()}
            >
              {loading ? t('app.notifications.loading') : t('app.notifications.refresh')}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={loading || markingAll || unreadCount === 0}
              onClick={() => void handleMarkAllRead()}
            >
              {markingAll
                ? t('app.notifications.markAllReadLoading')
                : t('app.notifications.markAllRead')}
            </Button>
          </div>

          {loading && !loadedOnce ? (
            <RequestsListSkeleton rows={3} itemClassName="h-16 w-full rounded-lg" />
          ) : null}
          {error ? (
            <PanelErrorState
              message={error}
              retryLabel={t('app.notifications.retry')}
              onRetry={() => void loadNotifications()}
            />
          ) : null}
          {!loading && loadedOnce && items.length === 0 ? (
            <PanelEmptyState
              title={t('app.notifications.emptyTitle')}
              body={t('app.notifications.empty')}
            />
          ) : null}

          {items.length > 0 ? (
            <ul className="flex max-h-80 flex-col gap-2 overflow-y-auto">
              {items.map((item) => {
                const isUnread = item.readAt === null;
                const orderId = resolveOrderIdFromNotification(item);
                const hasLink = Boolean(orderId || item.linkHref);
                return (
                  <li
                    key={item.id}
                    className={cn(
                      LISTING_CARD_CLASS,
                      isUnread ? 'border-primary/30 bg-primary/5' : 'border-border/60 bg-muted/10',
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium leading-snug">{item.title}</p>
                        <p className="mt-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                          {t(notificationTypeKey(item.type))}
                        </p>
                      </div>
                      <span className="shrink-0 text-[10px] font-medium text-muted-foreground">
                        {isUnread
                          ? t('app.notifications.unreadStatus')
                          : t('app.notifications.read')}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{item.body}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {t('app.notifications.created')}: {formatDateTime(item.createdAt)}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {isUnread ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="h-7 px-2 text-xs"
                          disabled={markingReadId === item.id || markingAll}
                          onClick={() => void handleMarkRead(item.id)}
                        >
                          {markingReadId === item.id
                            ? t('app.notifications.markReadLoading')
                            : t('app.notifications.markRead')}
                        </Button>
                      ) : null}
                      {hasLink ? (
                        item.linkHref?.startsWith('/') && !orderId ? (
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-xs"
                            asChild
                          >
                            <Link href={item.linkHref}>
                              {t('app.notifications.openLink')}
                              <ExternalLink className="ml-1 size-3" aria-hidden />
                            </Link>
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-xs"
                            disabled={markingReadId === item.id}
                            onClick={() => void handleItemAction(item)}
                          >
                            {orderId && item.entityType === NotificationEntityType.DELIVERY_ORDER
                              ? t('app.notifications.viewAcceptedOrder')
                              : t('app.notifications.openLink')}
                          </Button>
                        )
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </CardContent>
      ) : null}
    </Card>
  );
}
