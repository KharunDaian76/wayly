'use client';

import { DeliveryOrderStatus, type DeliveryOrderSource } from '@wayly/types';
import { useI18n } from '@/lib/i18n/i18n-context';
import type { TranslationKey } from '@/lib/i18n/dictionaries';
import { cn } from '@/lib/utils';

export type OrderLifecycleTimelineProps = {
  status: DeliveryOrderStatus;
  /** Reserved for future source-specific timeline hints; not shown today. */
  sourceType?: DeliveryOrderSource;
  createdAt?: string | null;
  publishedAt?: string | null;
  acceptedAt?: string | null;
  deliveredAt?: string | null;
  cancelledAt?: string | null;
  /** When true, show honest proof helper (current flow supports proof submission). */
  proofFlowEnabled?: boolean;
  /** Hide footer reminder lines (e.g. when proof guidance is shown nearby). */
  hideFooterHints?: boolean;
  compact?: boolean;
  className?: string;
};

type StepState = 'complete' | 'current' | 'pending' | 'stopped' | 'disputed';

type LifecycleStep = {
  id: string;
  labelKey: TranslationKey;
  date: string | null;
};

function formatStepDate(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }
  return new Date(value).toLocaleString();
}

function openStepDate(
  publishedAt: string | null | undefined,
  createdAt: string | null | undefined,
): string | null {
  return formatStepDate(publishedAt ?? createdAt ?? null);
}

/** Maps DeliveryOrderStatus to the active lifecycle step index (0-based, excluding draft). */
export function resolveLifecycleStepIndex(
  status: DeliveryOrderStatus,
  includeDraft: boolean,
): number {
  const offset = includeDraft ? 1 : 0;

  switch (status) {
    case DeliveryOrderStatus.DRAFT:
      return 0;
    case DeliveryOrderStatus.OPEN:
      return offset;
    case DeliveryOrderStatus.ACCEPTED:
      return offset + 1;
    case DeliveryOrderStatus.IN_TRANSIT:
      return offset + 2;
    case DeliveryOrderStatus.DELIVERED:
      return -1;
    case DeliveryOrderStatus.CANCELLED: {
      return offset;
    }
    case DeliveryOrderStatus.DISPUTED: {
      return offset + 2;
    }
    default:
      return offset;
  }
}

function resolveCancelledStepIndex(
  acceptedAt: string | null | undefined,
  deliveredAt: string | null | undefined,
  includeDraft: boolean,
): number {
  const offset = includeDraft ? 1 : 0;
  if (deliveredAt) {
    return offset + 3;
  }
  if (acceptedAt) {
    return offset + 1;
  }
  return offset;
}

function resolveDisputedStepIndex(
  acceptedAt: string | null | undefined,
  deliveredAt: string | null | undefined,
  includeDraft: boolean,
): number {
  const offset = includeDraft ? 1 : 0;
  if (deliveredAt) {
    return offset + 3;
  }
  if (acceptedAt) {
    return offset + 2;
  }
  return offset + 1;
}

function buildLifecycleSteps(props: OrderLifecycleTimelineProps): {
  steps: LifecycleStep[];
  activeIndex: number;
  terminal: 'cancelled' | 'disputed' | null;
} {
  const includeDraft = props.status === DeliveryOrderStatus.DRAFT;
  const steps: LifecycleStep[] = [];

  if (includeDraft) {
    steps.push({
      id: 'draft',
      labelKey: 'app.orderTimeline.stepDraft',
      date: formatStepDate(props.createdAt),
    });
  }

  steps.push(
    {
      id: 'open',
      labelKey: 'app.orderTimeline.stepOpen',
      date: openStepDate(props.publishedAt, props.createdAt),
    },
    {
      id: 'accepted',
      labelKey: 'app.orderTimeline.stepAccepted',
      date: formatStepDate(props.acceptedAt),
    },
    {
      id: 'inTransit',
      labelKey: 'app.orderTimeline.stepInTransit',
      date: null,
    },
    {
      id: 'delivered',
      labelKey: 'app.orderTimeline.stepDelivered',
      date: formatStepDate(props.deliveredAt),
    },
  );

  if (props.status === DeliveryOrderStatus.CANCELLED) {
    return {
      steps,
      activeIndex: resolveCancelledStepIndex(props.acceptedAt, props.deliveredAt, includeDraft),
      terminal: 'cancelled',
    };
  }

  if (props.status === DeliveryOrderStatus.DISPUTED) {
    return {
      steps,
      activeIndex: resolveDisputedStepIndex(props.acceptedAt, props.deliveredAt, includeDraft),
      terminal: 'disputed',
    };
  }

  return {
    steps,
    activeIndex: resolveLifecycleStepIndex(props.status, includeDraft),
    terminal: null,
  };
}

function resolveStepState(
  index: number,
  activeIndex: number,
  terminal: 'cancelled' | 'disputed' | null,
  allComplete: boolean,
): StepState {
  if (allComplete) {
    return 'complete';
  }

  if (terminal === 'cancelled' && index === activeIndex) {
    return 'stopped';
  }

  if (terminal === 'disputed' && index === activeIndex) {
    return 'disputed';
  }

  if (terminal === 'cancelled' || terminal === 'disputed') {
    if (index < activeIndex) {
      return 'complete';
    }
    if (index > activeIndex) {
      return 'pending';
    }
  }

  if (activeIndex < 0) {
    return 'complete';
  }

  if (index < activeIndex) {
    return 'complete';
  }
  if (index === activeIndex) {
    return 'current';
  }
  return 'pending';
}

function stepStateLabel(state: StepState, t: (key: TranslationKey) => string): string | null {
  switch (state) {
    case 'current':
      return t('app.orderTimeline.current');
    case 'complete':
      return t('app.orderTimeline.completed');
    case 'pending':
      return t('app.orderTimeline.pending');
    case 'stopped':
      return t('app.orderTimeline.stopped');
    case 'disputed':
      return t('app.orderTimeline.underReview');
    default:
      return null;
  }
}

function StepIndicator({ state }: { state: StepState }) {
  return (
    <span
      className={cn(
        'flex h-3 w-3 shrink-0 items-center justify-center rounded-full border-2 text-[8px] leading-none',
        state === 'complete' && 'border-primary bg-primary text-primary-foreground',
        state === 'current' && 'border-primary bg-background ring-2 ring-primary/25',
        state === 'pending' && 'border-muted-foreground/35 bg-background',
        state === 'stopped' && 'border-destructive bg-destructive/15',
        state === 'disputed' && 'border-amber-500 bg-amber-500/15',
      )}
      aria-hidden
    >
      {state === 'complete' ? '✓' : null}
    </span>
  );
}

export function OrderLifecycleTimeline(props: OrderLifecycleTimelineProps) {
  const { t } = useI18n();
  const { compact = false, className, proofFlowEnabled = false, hideFooterHints = false } = props;

  const allComplete = props.status === DeliveryOrderStatus.DELIVERED;
  const { steps, activeIndex, terminal } = buildLifecycleSteps(props);

  if (steps.length === 0) {
    return (
      <p className={cn('text-xs text-muted-foreground', className)}>
        {t('app.orderTimeline.noTimelineData')}
      </p>
    );
  }

  const cancelledDate = formatStepDate(props.cancelledAt);

  return (
    <section
      className={cn(
        'rounded-lg border border-border/60 bg-muted/10',
        compact ? 'p-2.5' : 'p-3',
        className,
      )}
      aria-label={t('app.orderTimeline.title')}
    >
      <div className="mb-2 flex flex-col gap-0.5">
        <h3
          className={cn(
            'font-semibold uppercase tracking-wide text-muted-foreground',
            compact ? 'text-[10px]' : 'text-xs',
          )}
        >
          {t('app.orderTimeline.title')}
        </h3>
        {!compact ? (
          <p className="text-xs text-muted-foreground">{t('app.orderTimeline.subtitle')}</p>
        ) : null}
      </div>

      {terminal === 'cancelled' ? (
        <p className="mb-2 rounded-md border border-destructive/25 bg-destructive/5 px-2 py-1.5 text-xs font-medium text-destructive">
          {t('app.orderTimeline.stepCancelled')}
          {cancelledDate ? ` · ${cancelledDate}` : null}
        </p>
      ) : null}

      {terminal === 'disputed' ? (
        <p className="mb-2 rounded-md border border-amber-500/25 bg-amber-500/5 px-2 py-1.5 text-xs font-medium text-amber-700 dark:text-amber-400">
          {t('app.orderTimeline.stepDisputed')}
        </p>
      ) : null}

      <ol
        className={cn(
          'flex gap-0',
          compact
            ? 'flex-col sm:flex-row sm:flex-wrap sm:items-start sm:gap-x-1'
            : 'flex-col sm:flex-row sm:items-start',
        )}
      >
        {steps.map((step, index) => {
          const state = resolveStepState(index, activeIndex, terminal, allComplete);
          const stateLabel = stepStateLabel(state, t);

          return (
            <li
              key={step.id}
              className={cn(
                'flex min-w-0 flex-1',
                compact
                  ? 'flex-row sm:flex-col sm:items-center sm:text-center'
                  : 'flex-row sm:flex-col sm:items-center sm:text-center',
                index < steps.length - 1 && 'sm:pb-0',
              )}
            >
              <div
                className={cn(
                  'flex items-center',
                  compact ? 'flex-row sm:flex-col' : 'flex-row sm:flex-col',
                )}
              >
                <div className="flex flex-col items-center">
                  <StepIndicator state={state} />
                  {index < steps.length - 1 ? (
                    <span
                      className={cn(
                        'bg-border sm:hidden',
                        compact
                          ? 'my-0.5 w-px min-h-[0.875rem] flex-1'
                          : 'my-0.5 w-px min-h-[1.125rem] flex-1',
                        state === 'complete' ? 'bg-primary/50' : 'bg-border',
                      )}
                      aria-hidden
                    />
                  ) : null}
                </div>
                {index < steps.length - 1 ? (
                  <span
                    className={cn(
                      'hidden h-px flex-1 sm:block',
                      state === 'complete' ? 'bg-primary/50' : 'bg-border',
                    )}
                    aria-hidden
                  />
                ) : null}
              </div>

              <div
                className={cn(
                  'min-w-0 flex-1',
                  compact
                    ? 'pb-2 pl-2 sm:px-1 sm:pb-0 sm:pt-1.5'
                    : 'pb-3 pl-3 sm:px-1.5 sm:pb-0 sm:pt-2',
                )}
              >
                <p
                  className={cn(
                    'font-medium leading-snug',
                    compact ? 'text-xs' : 'text-sm',
                    (state === 'pending' || state === 'stopped') && 'text-muted-foreground',
                  )}
                >
                  {t(step.labelKey)}
                </p>
                {stateLabel ? (
                  <p className="mt-0.5 text-[10px] text-muted-foreground sm:text-xs">
                    {stateLabel}
                  </p>
                ) : null}
                {step.date ? (
                  <p className="mt-0.5 text-[10px] text-muted-foreground sm:text-xs">{step.date}</p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>

      {!hideFooterHints ? (
        <div
          className={cn(
            'flex flex-col gap-1 border-t border-border/40',
            compact ? 'mt-2 pt-2' : 'mt-3 pt-2',
          )}
        >
          <p className="text-[11px] text-muted-foreground sm:text-xs">
            {t('app.orderTimeline.chatInsideWayly')}
          </p>
          {proofFlowEnabled ? (
            <p className="text-[11px] text-muted-foreground sm:text-xs">
              {t('app.orderTimeline.proofMayBeRequired')}
            </p>
          ) : null}
          {terminal === 'disputed' ? (
            <p className="text-[11px] text-muted-foreground sm:text-xs">
              {t('app.orderTimeline.reviewToolsHelp')}
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
