'use client';

import {
  NextBestActionCard,
  type NextBestActionPriority,
} from '@/components/app/next-best-action-card';
import { useI18n } from '@/lib/i18n/i18n-context';
import { scrollToMarketplaceSection } from '@/lib/scroll-marketplace-section';
import { cn } from '@/lib/utils';

type SenderActionId = 'continue-order' | 'track-requests' | 'browse-waylers' | 'broaden-search';

type SenderActionCandidate = {
  id: SenderActionId;
  priority: NextBestActionPriority;
};

export type SenderNextBestActionsProps = {
  canBrowse: boolean;
  requestsLoading: boolean;
  hasSentRequests: boolean;
  hasPendingRequests: boolean;
  hasAcceptedOrders: boolean;
  acceptedOrdersLoading: boolean;
  listingsLoading: boolean;
  listingsEmpty: boolean;
  hasActiveSearchFilters: boolean;
  className?: string;
};

const PRIORITY_RANK: Record<NextBestActionPriority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

function resolveSenderActions(context: SenderNextBestActionsProps): SenderActionCandidate[] {
  const actions: SenderActionCandidate[] = [];

  if (context.hasAcceptedOrders) {
    actions.push({ id: 'continue-order', priority: 'high' });
  }
  if (context.hasPendingRequests) {
    actions.push({ id: 'track-requests', priority: 'high' });
  }
  if (context.canBrowse && !context.requestsLoading && !context.hasSentRequests) {
    actions.push({ id: 'browse-waylers', priority: 'medium' });
  }
  if (
    context.canBrowse &&
    !context.listingsLoading &&
    context.listingsEmpty &&
    context.hasActiveSearchFilters
  ) {
    actions.push({ id: 'broaden-search', priority: 'low' });
  }

  return actions.sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]).slice(0, 3);
}

export function SenderNextBestActions(props: SenderNextBestActionsProps) {
  const { t } = useI18n();
  const { className, canBrowse, acceptedOrdersLoading, requestsLoading, listingsLoading } = props;

  if (!canBrowse || acceptedOrdersLoading || (requestsLoading && listingsLoading)) {
    return null;
  }

  const actions = resolveSenderActions(props);
  if (actions.length === 0) {
    return null;
  }

  return (
    <section
      className={cn(
        'flex flex-col gap-2.5 rounded-xl border border-border/50 bg-background/60 p-3',
        className,
      )}
      aria-labelledby="sender-next-best-actions-heading"
    >
      <div className="flex flex-col gap-0.5">
        <h3 id="sender-next-best-actions-heading" className="text-sm font-semibold text-foreground">
          {t('app.nextBestAction.senderTitle')}
        </h3>
        <p className="text-xs text-muted-foreground">{t('app.nextBestAction.senderSubtitle')}</p>
      </div>

      <div className="flex flex-col gap-2">
        {actions.map((action) => {
          switch (action.id) {
            case 'continue-order':
              return (
                <NextBestActionCard
                  key={action.id}
                  variant="sender"
                  priority={action.priority}
                  icon="📦"
                  title={t('app.nextBestAction.continueOrderTitle')}
                  description={t('app.nextBestAction.continueOrderDescription')}
                  actionLabel={t('app.nextBestAction.continueOrderAction')}
                  onAction={() => scrollToMarketplaceSection('sender-accepted-panel')}
                />
              );
            case 'track-requests':
              return (
                <NextBestActionCard
                  key={action.id}
                  variant="sender"
                  priority={action.priority}
                  icon="📬"
                  title={t('app.nextBestAction.trackRequestsTitle')}
                  description={t('app.nextBestAction.trackRequestsDescription')}
                  actionLabel={t('app.nextBestAction.trackRequestsAction')}
                  onAction={() => scrollToMarketplaceSection('sender-requests')}
                />
              );
            case 'browse-waylers':
              return (
                <NextBestActionCard
                  key={action.id}
                  variant="sender"
                  priority={action.priority}
                  icon="🌐"
                  title={t('app.nextBestAction.browseWaylersTitle')}
                  description={t('app.nextBestAction.browseWaylersDescription')}
                  actionLabel={t('app.nextBestAction.browseWaylersAction')}
                  onAction={() => scrollToMarketplaceSection('sender-waylers-results')}
                />
              );
            case 'broaden-search':
              return (
                <NextBestActionCard
                  key={action.id}
                  variant="sender"
                  priority={action.priority}
                  icon="🔍"
                  title={t('app.nextBestAction.browseWaylersTitle')}
                  description={t('app.nextBestAction.browseWaylersDescription')}
                  actionLabel={t('app.nextBestAction.browseWaylersAction')}
                  onAction={() => scrollToMarketplaceSection('sender-waylers-filters')}
                />
              );
            default:
              return null;
          }
        })}
      </div>
    </section>
  );
}
