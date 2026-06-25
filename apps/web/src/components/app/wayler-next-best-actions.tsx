'use client';

import {
  NextBestActionCard,
  type NextBestActionPriority,
} from '@/components/app/next-best-action-card';
import { useI18n } from '@/lib/i18n/i18n-context';
import { scrollToMarketplaceSection } from '@/lib/scroll-marketplace-section';
import { cn } from '@/lib/utils';

type WaylerActionId =
  | 'complete-kyc'
  | 'activate-access'
  | 'review-requests'
  | 'continue-delivery'
  | 'publish-availability';

type WaylerActionCandidate = {
  id: WaylerActionId;
  priority: NextBestActionPriority;
  rank: number;
};

export type WaylerNextBestActionsProps = {
  kycLoading: boolean;
  isApproved: boolean;
  waylerHasActiveAccess: boolean;
  hasAcceptedWork: boolean;
  acceptedWorkLoading: boolean;
  availabilityLoading: boolean | null;
  hasPublishedAvailability: boolean | null;
  incomingLoading: boolean | null;
  pendingIncomingCount: number | null;
  className?: string;
};

const PRIORITY_RANK: Record<NextBestActionPriority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

function resolveWaylerActions(context: WaylerNextBestActionsProps): WaylerActionCandidate[] {
  const actions: WaylerActionCandidate[] = [];

  if (!context.isApproved) {
    actions.push({ id: 'complete-kyc', priority: 'high', rank: 0 });
  } else {
    if (!context.waylerHasActiveAccess) {
      actions.push({ id: 'activate-access', priority: 'high', rank: 1 });
    }
    if (context.pendingIncomingCount !== null && context.pendingIncomingCount > 0) {
      actions.push({ id: 'review-requests', priority: 'high', rank: 2 });
    }
    if (context.hasAcceptedWork) {
      actions.push({ id: 'continue-delivery', priority: 'high', rank: 3 });
    }
    if (
      context.waylerHasActiveAccess &&
      context.hasPublishedAvailability === false &&
      context.availabilityLoading === false
    ) {
      actions.push({ id: 'publish-availability', priority: 'medium', rank: 4 });
    }
  }

  return actions
    .sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] || a.rank - b.rank)
    .slice(0, 3);
}

export function WaylerNextBestActions(props: WaylerNextBestActionsProps) {
  const { t } = useI18n();
  const { className, kycLoading, acceptedWorkLoading } = props;

  if (kycLoading || acceptedWorkLoading) {
    return null;
  }

  const actions = resolveWaylerActions(props);
  if (actions.length === 0) {
    return null;
  }

  return (
    <section
      className={cn(
        'flex flex-col gap-2.5 rounded-xl border border-border/50 bg-background/60 p-3',
        className,
      )}
      aria-labelledby="wayler-next-best-actions-heading"
    >
      <div className="flex flex-col gap-0.5">
        <h3 id="wayler-next-best-actions-heading" className="text-sm font-semibold text-foreground">
          {t('app.nextBestAction.waylerTitle')}
        </h3>
        <p className="text-xs text-muted-foreground">{t('app.nextBestAction.waylerSubtitle')}</p>
      </div>

      <div className="flex flex-col gap-2">
        {actions.map((action) => {
          switch (action.id) {
            case 'complete-kyc':
              return (
                <NextBestActionCard
                  key={action.id}
                  variant="safety"
                  priority={action.priority}
                  icon="🛡️"
                  title={t('app.nextBestAction.completeKycTitle')}
                  description={t('app.nextBestAction.completeKycDescription')}
                  actionLabel={t('app.nextBestAction.completeKycAction')}
                  onAction={() => scrollToMarketplaceSection('wayler-kyc')}
                />
              );
            case 'activate-access':
              return (
                <NextBestActionCard
                  key={action.id}
                  variant="wayler"
                  priority={action.priority}
                  icon="🔑"
                  title={t('app.nextBestAction.activateAccessTitle')}
                  description={t('app.nextBestAction.activateAccessDescription')}
                  actionLabel={t('app.nextBestAction.activateAccessAction')}
                  onAction={() => scrollToMarketplaceSection('wayler-access')}
                />
              );
            case 'review-requests':
              return (
                <NextBestActionCard
                  key={action.id}
                  variant="wayler"
                  priority={action.priority}
                  icon="📥"
                  title={t('app.nextBestAction.reviewRequestsTitle')}
                  description={t('app.nextBestAction.reviewRequestsDescription')}
                  actionLabel={t('app.nextBestAction.reviewRequestsAction')}
                  onAction={() => scrollToMarketplaceSection('wayler-requests')}
                />
              );
            case 'continue-delivery':
              return (
                <NextBestActionCard
                  key={action.id}
                  variant="wayler"
                  priority={action.priority}
                  icon="🛣️"
                  title={t('app.nextBestAction.continueDeliveryTitle')}
                  description={t('app.nextBestAction.continueDeliveryDescription')}
                  actionLabel={t('app.nextBestAction.continueDeliveryAction')}
                  onAction={() => scrollToMarketplaceSection('wayler-accepted-panel')}
                />
              );
            case 'publish-availability':
              return (
                <NextBestActionCard
                  key={action.id}
                  variant="wayler"
                  priority={action.priority}
                  icon="📍"
                  title={t('app.nextBestAction.publishAvailabilityTitle')}
                  description={t('app.nextBestAction.publishAvailabilityDescription')}
                  actionLabel={t('app.nextBestAction.publishAvailabilityAction')}
                  onAction={() => scrollToMarketplaceSection('wayler-availability-publish')}
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
