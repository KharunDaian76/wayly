'use client';

import type { UserRole } from '@wayly/types';
import { Card, CardContent, CardHeader, CardTitle } from '@wayly/ui';
import { ChevronDown } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAppMode } from '@/lib/app-mode/app-mode-context';
import { clientEnv } from '@/lib/env';
import type { TranslationKey } from '@/lib/i18n/dictionaries';
import { useI18n } from '@/lib/i18n/i18n-context';
import { api } from '@/lib/sdk';
import { hasOperationsDashboardAccess } from '@/lib/auth/operations-dashboard-access';
import { cn } from '@/lib/utils';

const APP_PANEL_CLASS = 'wayly-app-panel';

function resolveApiHost(apiUrl: string): string {
  try {
    return new URL(apiUrl).host;
  } catch {
    return apiUrl.replace(/^https?:\/\//, '');
  }
}

type StatusTone = 'ok' | 'warn' | 'bad' | 'neutral';

type StatusRow = {
  labelKey: TranslationKey;
  value: string;
  tone: StatusTone;
};

export type MvpWalkthroughStatusPanelProps = {
  userEmail: string;
  userDisplayName: string;
  roles: UserRole[];
  kycApproved: boolean;
  kycLoading: boolean;
  waylerHasActiveAccess: boolean;
  listingsCount: number | null;
  listingsLoading: boolean;
  incomingTotalCount: number | null;
  incomingPendingCount: number | null;
  incomingLoading: boolean;
  openOrdersCount: number;
  waylerAcceptedCount: number;
  senderPublishedCount: number;
  senderAcceptedCount: number;
};

function toneClass(tone: StatusTone): string {
  switch (tone) {
    case 'ok':
      return 'text-[hsl(var(--success))]';
    case 'warn':
      return 'text-amber-600 dark:text-amber-400';
    case 'bad':
      return 'text-[hsl(var(--danger))]';
    default:
      return 'text-muted-foreground';
  }
}

export function MvpWalkthroughStatusPanel({
  userEmail,
  userDisplayName,
  roles,
  kycApproved,
  kycLoading,
  waylerHasActiveAccess,
  listingsCount,
  listingsLoading,
  incomingTotalCount,
  incomingPendingCount,
  incomingLoading,
  openOrdersCount,
  waylerAcceptedCount,
  senderPublishedCount,
  senderAcceptedCount,
}: MvpWalkthroughStatusPanelProps) {
  const { t } = useI18n();
  const { mode } = useAppMode();
  const isAdmin = hasOperationsDashboardAccess(roles);
  const [open, setOpen] = useState(isAdmin);
  const [apiConnected, setApiConnected] = useState<boolean | null>(null);
  const [notificationsCount, setNotificationsCount] = useState<number | null>(null);
  const [supportTicketsCount, setSupportTicketsCount] = useState<number | null>(null);

  const apiHost = resolveApiHost(clientEnv.apiUrl);

  const loadAuxCounts = useCallback(async () => {
    try {
      await api.health.live();
      setApiConnected(true);
    } catch {
      setApiConnected(false);
    }

    try {
      const [notifications, tickets] = await Promise.all([
        api.notifications.listMine({ page: 1, limit: 1 }),
        api.supportTickets.listMine(),
      ]);
      setNotificationsCount(notifications.total);
      setSupportTicketsCount(tickets.items.length);
    } catch {
      setNotificationsCount(null);
      setSupportTicketsCount(null);
    }
  }, []);

  useEffect(() => {
    void loadAuxCounts();
  }, [loadAuxCounts]);

  const rows = useMemo((): StatusRow[] => {
    const base: StatusRow[] = [
      {
        labelKey: 'app.mvpWalkthrough.apiConnected',
        value:
          apiConnected === null
            ? t('app.mvpWalkthrough.loading')
            : apiConnected
              ? t('app.mvpWalkthrough.yes')
              : t('app.mvpWalkthrough.no'),
        tone: apiConnected === null ? 'neutral' : apiConnected ? 'ok' : 'bad',
      },
      {
        labelKey: 'app.mvpWalkthrough.apiHost',
        value: apiHost,
        tone: 'neutral',
      },
      {
        labelKey: 'app.mvpWalkthrough.loggedInAs',
        value: `${userDisplayName} (${userEmail})`,
        tone: 'neutral',
      },
      {
        labelKey: 'app.mvpWalkthrough.mode',
        value: mode === 'sender' ? t('app.mode.sender') : t('app.mode.wayler'),
        tone: 'neutral',
      },
      {
        labelKey: 'app.mvpWalkthrough.kycStatus',
        value: kycLoading
          ? t('app.mvpWalkthrough.loading')
          : kycApproved
            ? t('app.mvpWalkthrough.active')
            : t('app.mvpWalkthrough.inactive'),
        tone: kycLoading ? 'neutral' : kycApproved ? 'ok' : 'warn',
      },
    ];

    if (mode === 'wayler') {
      base.push(
        {
          labelKey: 'app.mvpWalkthrough.waylerAccess',
          value: waylerHasActiveAccess
            ? t('app.mvpWalkthrough.active')
            : t('app.mvpWalkthrough.inactive'),
          tone: waylerHasActiveAccess ? 'ok' : 'warn',
        },
        {
          labelKey: 'app.mvpWalkthrough.listings',
          value: listingsLoading ? t('app.mvpWalkthrough.loading') : String(listingsCount ?? 0),
          tone: listingsLoading ? 'neutral' : (listingsCount ?? 0) > 0 ? 'ok' : 'warn',
        },
        {
          labelKey: 'app.mvpWalkthrough.incomingRequests',
          value: incomingLoading
            ? t('app.mvpWalkthrough.loading')
            : t('app.mvpWalkthrough.incomingSummary')
                .replace('{total}', String(incomingTotalCount ?? 0))
                .replace('{pending}', String(incomingPendingCount ?? 0)),
          tone: incomingLoading ? 'neutral' : (incomingTotalCount ?? 0) > 0 ? 'ok' : 'warn',
        },
        {
          labelKey: 'app.mvpWalkthrough.openOrders',
          value: String(openOrdersCount),
          tone: openOrdersCount > 0 ? 'ok' : 'warn',
        },
        {
          labelKey: 'app.mvpWalkthrough.acceptedOrders',
          value: String(waylerAcceptedCount),
          tone: waylerAcceptedCount > 0 ? 'ok' : 'warn',
        },
      );
    } else {
      base.push(
        {
          labelKey: 'app.mvpWalkthrough.publishedOrders',
          value: String(senderPublishedCount),
          tone: senderPublishedCount > 0 ? 'ok' : 'neutral',
        },
        {
          labelKey: 'app.mvpWalkthrough.acceptedOrders',
          value: String(senderAcceptedCount),
          tone: senderAcceptedCount > 0 ? 'ok' : 'neutral',
        },
      );
    }

    base.push(
      {
        labelKey: 'app.mvpWalkthrough.notifications',
        value:
          notificationsCount === null
            ? t('app.mvpWalkthrough.loading')
            : String(notificationsCount),
        tone: notificationsCount === null ? 'neutral' : notificationsCount > 0 ? 'ok' : 'neutral',
      },
      {
        labelKey: 'app.mvpWalkthrough.supportTickets',
        value:
          supportTicketsCount === null
            ? t('app.mvpWalkthrough.loading')
            : String(supportTicketsCount),
        tone: supportTicketsCount === null ? 'neutral' : supportTicketsCount > 0 ? 'ok' : 'neutral',
      },
    );

    if (isAdmin) {
      base.push({
        labelKey: 'app.mvpWalkthrough.adminAccess',
        value: t('app.mvpWalkthrough.yes'),
        tone: 'ok',
      });
    }

    return base;
  }, [
    apiConnected,
    apiHost,
    incomingLoading,
    incomingPendingCount,
    incomingTotalCount,
    isAdmin,
    kycApproved,
    kycLoading,
    listingsCount,
    listingsLoading,
    mode,
    notificationsCount,
    openOrdersCount,
    senderAcceptedCount,
    senderPublishedCount,
    supportTicketsCount,
    t,
    userDisplayName,
    userEmail,
    waylerAcceptedCount,
    waylerHasActiveAccess,
  ]);

  const showEnvMismatch =
    apiConnected === true &&
    mode === 'wayler' &&
    kycApproved &&
    waylerHasActiveAccess === false &&
    (listingsCount ?? 0) === 0 &&
    (incomingTotalCount ?? 0) === 0 &&
    waylerAcceptedCount === 0;

  return (
    <Card className={cn(APP_PANEL_CLASS, 'border-dashed border-primary/25')}>
      <CardHeader className="pb-2">
        <button
          type="button"
          className="flex w-full items-start justify-between gap-3 text-left"
          onClick={() => setOpen((current) => !current)}
          aria-expanded={open}
        >
          <div>
            <CardTitle className="text-base sm:text-lg">{t('app.mvpWalkthrough.title')}</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">{t('app.mvpWalkthrough.subtitle')}</p>
          </div>
          <ChevronDown
            className={cn(
              'mt-1 size-5 shrink-0 text-muted-foreground transition-transform',
              open ? 'rotate-180' : '',
            )}
            aria-hidden
          />
        </button>
      </CardHeader>
      {open ? (
        <CardContent className="flex flex-col gap-3 pt-0">
          <dl className="grid gap-2 text-sm">
            {rows.map((row) => (
              <div
                key={row.labelKey}
                className="flex flex-col gap-0.5 rounded-lg border border-border/40 bg-muted/10 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
              >
                <dt className="text-muted-foreground">{t(row.labelKey)}</dt>
                <dd className={cn('font-medium', toneClass(row.tone))}>{row.value}</dd>
              </div>
            ))}
          </dl>

          {showEnvMismatch ? (
            <p className="rounded-md border border-amber-500/25 bg-amber-500/[0.06] px-3 py-2 text-xs leading-relaxed text-muted-foreground">
              {t('app.mvpWalkthrough.envMismatchNote')}
            </p>
          ) : null}

          <p className="text-xs leading-relaxed text-muted-foreground">
            {t('app.mvpWalkthrough.demoOnlyNote')}
          </p>
        </CardContent>
      ) : null}
    </Card>
  );
}
