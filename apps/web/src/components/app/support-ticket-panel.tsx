'use client';

import { ApiError } from '@wayly/sdk';
import type { SupportTicketSummary } from '@wayly/types';
import { SupportTicketCategory, SupportTicketPriority, SupportTicketStatus } from '@wayly/types';
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '@wayly/ui';
import { ChevronDown, ChevronUp, LifeBuoy } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import {
  PanelEmptyState,
  PanelErrorState,
  RequestsListSkeleton,
} from '@/components/app/panel-status-states';
import type { TranslationKey } from '@/lib/i18n/dictionaries';
import { useI18n } from '@/lib/i18n/i18n-context';
import { api } from '@/lib/sdk';
import { cn } from '@/lib/utils';

const APP_PANEL_CLASS = 'wayly-app-panel';

const MIN_SUBJECT_LENGTH = 3;
const MAX_SUBJECT_LENGTH = 200;
const MIN_MESSAGE_LENGTH = 10;
const MAX_MESSAGE_LENGTH = 5000;

const CATEGORY_OPTIONS = [
  SupportTicketCategory.GENERAL,
  SupportTicketCategory.ACCOUNT,
  SupportTicketCategory.SAFETY,
  SupportTicketCategory.PAYMENT_STATUS,
  SupportTicketCategory.ORDER_ISSUE,
  SupportTicketCategory.BUG_REPORT,
  SupportTicketCategory.OTHER,
] as const;

const TEXTAREA_CLASS = cn(
  'flex min-h-[96px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
  'ring-offset-background placeholder:text-muted-foreground',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
  'disabled:cursor-not-allowed disabled:opacity-50',
);

const SELECT_CLASS =
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm';

const LISTING_CARD_CLASS = cn(
  'wayly-order-card rounded-xl px-4 py-3 text-sm',
  'wayly-feed-item-enter',
);

export function supportTicketCategoryKey(category: SupportTicketCategory): TranslationKey {
  return `app.supportTickets.category.${category}` as TranslationKey;
}

export function supportTicketStatusKey(status: SupportTicketStatus): TranslationKey {
  return `app.supportTickets.status.${status}` as TranslationKey;
}

export function supportTicketPriorityKey(priority: SupportTicketPriority): TranslationKey {
  return `app.supportTickets.priority.${priority}` as TranslationKey;
}

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

export function SupportTicketPanel({ className }: { className?: string }) {
  const { t } = useI18n();
  const [expanded, setExpanded] = useState(false);

  const [items, setItems] = useState<SupportTicketSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadedOnce, setLoadedOnce] = useState(false);

  const [category, setCategory] = useState<SupportTicketCategory>(SupportTicketCategory.GENERAL);
  const [orderId, setOrderId] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const loadTickets = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const response = await api.supportTickets.listMine();
      setItems(response.items);
      setLoadedOnce(true);
    } catch (error) {
      setLoadError(error instanceof ApiError ? error.message : t('app.supportTickets.loadError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (expanded && !loadedOnce && !loading) {
      void loadTickets();
    }
  }, [expanded, loadedOnce, loading, loadTickets]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(false);

    const trimmedSubject = subject.trim();
    const trimmedMessage = message.trim();
    const trimmedOrderId = orderId.trim();

    if (trimmedSubject.length < MIN_SUBJECT_LENGTH || trimmedMessage.length < MIN_MESSAGE_LENGTH) {
      return;
    }

    setSubmitting(true);
    try {
      await api.supportTickets.create({
        subject: trimmedSubject,
        message: trimmedMessage,
        category,
        ...(trimmedOrderId ? { orderId: trimmedOrderId } : {}),
      });
      setSubject('');
      setMessage('');
      setOrderId('');
      setCategory(SupportTicketCategory.GENERAL);
      setSubmitSuccess(true);
      await loadTickets();
    } catch (error) {
      setSubmitError(
        error instanceof ApiError ? error.message : t('app.supportTickets.createError'),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit =
    subject.trim().length >= MIN_SUBJECT_LENGTH &&
    message.trim().length >= MIN_MESSAGE_LENGTH &&
    !submitting;

  return (
    <Card id="support-tickets" className={cn(APP_PANEL_CLASS, className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <LifeBuoy className="size-4 shrink-0 text-primary/80" aria-hidden />
              {t('app.supportTickets.title')}
            </CardTitle>
            <p className="text-sm text-muted-foreground">{t('app.supportTickets.subtitle')}</p>
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
                <span className="sr-only sm:not-sr-only">{t('app.supportTickets.collapse')}</span>
              </>
            ) : (
              <>
                <ChevronDown className="size-4" aria-hidden />
                <span className="sr-only sm:not-sr-only">{t('app.supportTickets.expand')}</span>
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      {expanded ? (
        <CardContent className="flex flex-col gap-4">
          <p className="rounded-md border border-amber-500/20 bg-amber-500/[0.04] px-3 py-2 text-xs leading-relaxed text-muted-foreground">
            {t('app.supportTickets.notice')}
          </p>

          <form className="flex flex-col gap-3" onSubmit={(event) => void handleSubmit(event)}>
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium">{t('app.supportTickets.category')}</span>
              <select
                className={SELECT_CLASS}
                value={category}
                onChange={(event) => setCategory(event.target.value as SupportTicketCategory)}
                disabled={submitting}
              >
                {CATEGORY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {t(supportTicketCategoryKey(option))}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium">{t('app.supportTickets.orderId')}</span>
              <Input
                value={orderId}
                onChange={(event) => setOrderId(event.target.value)}
                placeholder={t('app.supportTickets.orderIdHint')}
                disabled={submitting}
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium">{t('app.supportTickets.subject')}</span>
              <Input
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                maxLength={MAX_SUBJECT_LENGTH}
                disabled={submitting}
                required
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium">{t('app.supportTickets.message')}</span>
              <textarea
                className={TEXTAREA_CLASS}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                maxLength={MAX_MESSAGE_LENGTH}
                disabled={submitting}
                required
              />
            </label>

            {submitError ? (
              <p className="text-sm text-destructive" role="alert">
                {submitError}
              </p>
            ) : null}
            {submitSuccess ? (
              <p className="text-sm text-emerald-600 dark:text-emerald-400" role="status">
                {t('app.supportTickets.createSuccess')}
              </p>
            ) : null}

            <Button type="submit" disabled={!canSubmit} className="self-start">
              {submitting ? t('app.supportTickets.submitting') : t('app.supportTickets.submit')}
            </Button>
          </form>

          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold">{t('app.supportTickets.recent')}</h3>
            {loading && !loadedOnce ? <RequestsListSkeleton rows={2} /> : null}
            {loadError ? (
              <PanelErrorState
                message={loadError}
                retryLabel={t('app.supportTickets.retry')}
                onRetry={() => void loadTickets()}
              />
            ) : null}
            {!loading && loadedOnce && items.length === 0 ? (
              <PanelEmptyState
                title={t('app.supportTickets.recent')}
                body={t('app.supportTickets.empty')}
              />
            ) : null}
            {items.length > 0 ? (
              <ul className="flex flex-col gap-2">
                {items.map((ticket) => (
                  <li key={ticket.id} className={LISTING_CARD_CLASS}>
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <p className="font-medium">{ticket.subject}</p>
                      <span className="wayly-status-badge wayly-status-default text-[10px]">
                        {t(supportTicketStatusKey(ticket.status))}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {t(supportTicketCategoryKey(ticket.category))}
                      {' · '}
                      {t('app.supportTickets.created')}: {formatDateTime(ticket.createdAt)}
                    </p>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </CardContent>
      ) : null}
    </Card>
  );
}
