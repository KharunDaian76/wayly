'use client';

import { Button } from '@wayly/ui';

import { useI18n } from '@/lib/i18n/i18n-context';
import { cn } from '@/lib/utils';

export type NextBestActionPriority = 'high' | 'medium' | 'low';
export type NextBestActionVariant = 'sender' | 'wayler' | 'neutral' | 'safety';

const VARIANT_CLASS: Record<NextBestActionVariant, string> = {
  sender: 'border-primary/25 bg-primary/[0.04]',
  wayler: 'border-emerald-500/25 bg-emerald-500/[0.04]',
  neutral: 'border-border/60 bg-muted/15',
  safety: 'border-amber-500/25 bg-amber-500/[0.04]',
};

const PRIORITY_ACCENT: Record<NextBestActionPriority, string> = {
  high: 'border-l-primary',
  medium: 'border-l-emerald-500/70',
  low: 'border-l-border',
};

type NextBestActionCardProps = {
  title: string;
  description: string;
  priority?: NextBestActionPriority;
  variant?: NextBestActionVariant;
  icon?: string;
  actionLabel?: string;
  onAction?: () => void;
  helperItems?: string[];
  completed?: boolean;
  className?: string;
};

export function NextBestActionCard({
  title,
  description,
  priority = 'medium',
  variant = 'neutral',
  icon = '✨',
  actionLabel,
  onAction,
  helperItems,
  completed = false,
  className,
}: NextBestActionCardProps) {
  const { t } = useI18n();
  const hasAction = Boolean(actionLabel && onAction && !completed);
  const hasTips = helperItems !== undefined && helperItems.length > 0;

  return (
    <article
      className={cn(
        'rounded-lg border border-l-4 px-3 py-3 sm:px-4',
        VARIANT_CLASS[variant],
        PRIORITY_ACCENT[priority],
        completed && 'opacity-70',
        className,
      )}
    >
      <div className="flex gap-2.5">
        <span aria-hidden className="mt-0.5 shrink-0 text-sm leading-none">
          {completed ? '✓' : icon}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4
              className={cn(
                'text-sm font-medium text-foreground',
                completed && 'line-through decoration-muted-foreground/60',
              )}
            >
              {title}
            </h4>
            {!completed ? (
              <span className="rounded-full bg-background/80 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                {priority === 'high'
                  ? t('app.nextBestAction.priorityHigh')
                  : priority === 'medium'
                    ? t('app.nextBestAction.priorityMedium')
                    : t('app.nextBestAction.priorityLow')}
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>

          {hasTips ? (
            <ul className="mt-2 flex list-disc flex-col gap-0.5 pl-4 text-[11px] text-muted-foreground">
              {helperItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}

          {hasAction ? (
            <div className="mt-2.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={onAction}
              >
                {actionLabel}
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
