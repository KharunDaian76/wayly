'use client';

import { ApiError } from '@wayly/sdk';
import type { NotificationSummary } from '@wayly/types';
import { Button } from '@wayly/ui';
import { Bell } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useI18n } from '@/lib/i18n/i18n-context';
import {
  getAcceptedPanelForNotification,
  type AcceptedOrdersPanel,
} from '@/lib/notifications/notification-order-focus';
import { api } from '@/lib/sdk';
import { cn } from '@/lib/utils';

const UNREAD_COUNT_POLL_MS = 30_000;
const LIST_POLL_MS = 60_000;

interface NotificationBellProps {
  onFocusOrder?: (orderId: string, panel: AcceptedOrdersPanel) => void | Promise<void>;
}

export function NotificationBell({ onFocusOrder }: NotificationBellProps) {
  const { t } = useI18n();
  const containerRef = useRef<HTMLDivElement>(null);
  const countInFlightRef = useRef(false);
  const listInFlightRef = useRef(false);
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(
    () => typeof document !== 'undefined' && document.visibilityState === 'visible',
  );
  const [unreadTotal, setUnreadTotal] = useState(0);
  const [items, setItems] = useState<NotificationSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [markingReadId, setMarkingReadId] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const actionBusy = markingReadId !== null || markingAll;

  const fetchUnreadCount = useCallback(async () => {
    if (countInFlightRef.current) {
      return;
    }
    countInFlightRef.current = true;
    try {
      const result = await api.notifications.unreadCount();
      setUnreadTotal(result.unreadTotal);
    } catch {
      // Silent for background polling; badge keeps last known value.
    } finally {
      countInFlightRef.current = false;
    }
  }, []);

  const fetchList = useCallback(
    async (foreground = true) => {
      if (listInFlightRef.current) {
        return;
      }
      listInFlightRef.current = true;
      if (foreground) {
        setLoading(true);
        setError(null);
      }
      try {
        const result = await api.notifications.list({ page: 1, limit: 10 });
        setItems(result.items);
        setUnreadTotal(result.unreadTotal);
      } catch {
        if (foreground) {
          setError(t('app.notifications.loadFailed'));
        }
      } finally {
        if (foreground) {
          setLoading(false);
        }
        listInFlightRef.current = false;
      }
    },
    [t],
  );

  useEffect(() => {
    function handleVisibilityChange() {
      setVisible(document.visibilityState === 'visible');
    }
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  useEffect(() => {
    if (!visible) {
      return;
    }
    void fetchUnreadCount();
    const intervalId = window.setInterval(() => {
      void fetchUnreadCount();
    }, UNREAD_COUNT_POLL_MS);
    return () => window.clearInterval(intervalId);
  }, [visible, fetchUnreadCount]);

  useEffect(() => {
    if (!open) {
      return;
    }
    setSuccessMessage(null);
    void fetchList(true);
    void fetchUnreadCount();
  }, [open, fetchList, fetchUnreadCount]);

  useEffect(() => {
    if (!open || !visible) {
      return;
    }
    const intervalId = window.setInterval(() => {
      void fetchList(false);
    }, LIST_POLL_MS);
    return () => window.clearInterval(intervalId);
  }, [open, visible, fetchList]);

  useEffect(() => {
    if (!open) {
      return;
    }
    function handlePointerDown(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [open]);

  async function handleMarkRead(id: string) {
    setMarkingReadId(id);
    setError(null);
    setSuccessMessage(null);
    try {
      const updated = await api.notifications.markRead(id);
      setItems((prev) => prev.map((item) => (item.id === id ? updated : item)));
      await fetchUnreadCount();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message || t('app.notifications.loadFailed')
          : t('app.notifications.loadFailed'),
      );
    } finally {
      setMarkingReadId(null);
    }
  }

  async function handleOrderLinkedNotificationClick(item: NotificationSummary) {
    if (!item.relatedOrderId || actionBusy) {
      return;
    }

    setMarkingReadId(item.id);
    setError(null);
    setSuccessMessage(null);
    setOpen(false);

    try {
      if (item.readAt === null) {
        const updated = await api.notifications.markRead(item.id);
        setItems((prev) => prev.map((entry) => (entry.id === item.id ? updated : entry)));
        await fetchUnreadCount();
      }
      await onFocusOrder?.(item.relatedOrderId, getAcceptedPanelForNotification(item.type));
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message || t('app.notifications.loadFailed')
          : t('app.notifications.loadFailed'),
      );
    } finally {
      setMarkingReadId(null);
    }
  }

  async function handleMarkAllRead() {
    setMarkingAll(true);
    setError(null);
    setSuccessMessage(null);
    try {
      await api.notifications.markAllRead();
      setUnreadTotal(0);
      await fetchList(true);
      setSuccessMessage(t('app.notifications.markAllReadSuccess'));
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message || t('app.notifications.loadFailed')
          : t('app.notifications.loadFailed'),
      );
    } finally {
      setMarkingAll(false);
    }
  }

  const badgeLabel =
    unreadTotal > 0
      ? t('app.notifications.unreadCount').replace('{count}', String(unreadTotal))
      : undefined;

  return (
    <div ref={containerRef} className="relative z-[60]">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="relative px-2.5"
        aria-label={t('app.notifications.open')}
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((prev) => !prev)}
      >
        <Bell className="h-4 w-4" aria-hidden />
        {unreadTotal > 0 ? (
          <span
            className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground"
            aria-label={badgeLabel}
          >
            {unreadTotal > 99 ? '99+' : unreadTotal}
          </span>
        ) : null}
      </Button>

      {open ? (
        <div
          className="absolute right-0 z-[100] mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-lg border border-border bg-background shadow-lg"
          role="dialog"
          aria-label={t('app.notifications.title')}
        >
          <div className="flex items-center justify-between gap-2 border-b border-border/60 px-3 py-2">
            <p className="text-sm font-semibold">{t('app.notifications.title')}</p>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs"
                disabled={loading || actionBusy}
                onClick={() => void fetchList(true)}
              >
                {t('app.notifications.refresh')}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs"
                disabled={loading || actionBusy || unreadTotal === 0}
                onClick={() => void handleMarkAllRead()}
              >
                {markingAll
                  ? t('app.notifications.markingRead')
                  : t('app.notifications.markAllRead')}
              </Button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto p-2">
            {error ? (
              <p className="rounded-md border border-danger/30 bg-danger/10 px-2 py-1.5 text-xs text-danger">
                {error}
              </p>
            ) : null}
            {successMessage ? (
              <p
                className="mb-2 rounded-md border border-accent/30 bg-accent/10 px-2 py-1.5 text-xs text-foreground"
                role="status"
              >
                {successMessage}
              </p>
            ) : null}
            {loading ? (
              <p className="px-2 py-4 text-center text-sm text-muted-foreground">
                {t('app.notifications.loading')}
              </p>
            ) : items.length === 0 ? (
              <p className="px-2 py-4 text-center text-sm text-muted-foreground">
                {t('app.notifications.empty')}
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {items.map((item) => {
                  const isUnread = item.readAt === null;
                  const isMarking = markingReadId === item.id;
                  const hasOrderLink = item.relatedOrderId !== null;
                  const orderLinkLabel = hasOrderLink
                    ? `${item.title}. ${t('app.notifications.viewAcceptedOrder')}`
                    : undefined;

                  return (
                    <li
                      key={item.id}
                      className={cn(
                        'rounded-md border text-sm',
                        isUnread
                          ? 'border-primary/30 bg-primary/5'
                          : 'border-border/60 bg-muted/20',
                      )}
                    >
                      {hasOrderLink ? (
                        <button
                          type="button"
                          className={cn(
                            'w-full rounded-md px-3 py-2 text-left transition-colors',
                            'hover:bg-muted/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
                            actionBusy && 'cursor-not-allowed opacity-60',
                          )}
                          disabled={actionBusy}
                          aria-label={orderLinkLabel}
                          onClick={() => void handleOrderLinkedNotificationClick(item)}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-medium leading-snug">{item.title}</p>
                            <span
                              className={cn(
                                'shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium',
                                isUnread
                                  ? 'bg-primary/15 text-foreground'
                                  : 'bg-muted text-muted-foreground',
                              )}
                            >
                              {isUnread
                                ? t('app.notifications.unread')
                                : t('app.notifications.read')}
                            </span>
                          </div>
                          {item.body ? (
                            <p className="mt-1 text-xs text-muted-foreground">{item.body}</p>
                          ) : null}
                          <p className="mt-1 text-xs text-muted-foreground">
                            {new Date(item.createdAt).toLocaleString()}
                          </p>
                          <p className="mt-2 text-xs font-medium text-primary">
                            {isMarking
                              ? t('app.notifications.markingRead')
                              : t('app.notifications.viewAcceptedOrder')}
                          </p>
                        </button>
                      ) : (
                        <div className="px-3 py-2">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-medium leading-snug">{item.title}</p>
                            <span
                              className={cn(
                                'shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium',
                                isUnread
                                  ? 'bg-primary/15 text-foreground'
                                  : 'bg-muted text-muted-foreground',
                              )}
                            >
                              {isUnread
                                ? t('app.notifications.unread')
                                : t('app.notifications.read')}
                            </span>
                          </div>
                          {item.body ? (
                            <p className="mt-1 text-xs text-muted-foreground">{item.body}</p>
                          ) : null}
                          <p className="mt-1 text-xs text-muted-foreground">
                            {new Date(item.createdAt).toLocaleString()}
                          </p>
                          {isUnread ? (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="mt-2 h-7 px-2 text-xs"
                              disabled={actionBusy}
                              onClick={() => void handleMarkRead(item.id)}
                            >
                              {isMarking
                                ? t('app.notifications.markingRead')
                                : t('app.notifications.markRead')}
                            </Button>
                          ) : null}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
