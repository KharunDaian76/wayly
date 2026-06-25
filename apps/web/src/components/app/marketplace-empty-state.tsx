'use client';

import { Button } from '@wayly/ui';

import { useI18n } from '@/lib/i18n/i18n-context';
import { cn } from '@/lib/utils';

export type MarketplaceEmptyStateVariant = 'sender' | 'wayler' | 'neutral' | 'safety';

const VARIANT_CLASS: Record<MarketplaceEmptyStateVariant, string> = {
  sender: 'border-primary/20 bg-primary/[0.04]',
  wayler: 'border-emerald-500/20 bg-emerald-500/[0.04]',
  neutral: 'border-border/60 bg-muted/15',
  safety: 'border-amber-500/20 bg-amber-500/[0.04]',
};

const DEFAULT_ICON: Record<MarketplaceEmptyStateVariant, string> = {
  sender: '📦',
  wayler: '🛣️',
  neutral: '🌐',
  safety: '🛡️',
};

type MarketplaceEmptyStateProps = {
  title: string;
  description: string;
  variant?: MarketplaceEmptyStateVariant;
  icon?: string;
  helperItems?: string[];
  primaryActionLabel?: string;
  secondaryActionLabel?: string;
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
  className?: string;
};

export function MarketplaceEmptyState({
  title,
  description,
  variant = 'neutral',
  icon,
  helperItems,
  primaryActionLabel,
  secondaryActionLabel,
  onPrimaryAction,
  onSecondaryAction,
  className,
}: MarketplaceEmptyStateProps) {
  const { t } = useI18n();
  const displayIcon = icon ?? DEFAULT_ICON[variant];
  const hasActions = Boolean(primaryActionLabel || secondaryActionLabel);
  const hasTips = helperItems !== undefined && helperItems.length > 0;

  return (
    <div
      className={cn(
        'rounded-xl border px-4 py-4 sm:px-5 sm:py-4',
        VARIANT_CLASS[variant],
        className,
      )}
      role="status"
    >
      <div className="flex gap-3">
        <span aria-hidden className="mt-0.5 shrink-0 text-base leading-none">
          {displayIcon}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground">{title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>

          {hasTips ? (
            <div className="mt-3">
              <p className="text-xs font-medium text-foreground">
                {t('app.marketplaceEmpty.nextSteps')}
              </p>
              <ul className="mt-1.5 flex list-disc flex-col gap-1 pl-4 text-xs text-muted-foreground">
                {helperItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {hasActions ? (
            <div className="wayly-action-group mt-4">
              {primaryActionLabel && onPrimaryAction ? (
                <Button type="button" variant="primary" size="sm" onClick={onPrimaryAction}>
                  {primaryActionLabel}
                </Button>
              ) : null}
              {secondaryActionLabel && onSecondaryAction ? (
                <Button type="button" variant="outline" size="sm" onClick={onSecondaryAction}>
                  {secondaryActionLabel}
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
