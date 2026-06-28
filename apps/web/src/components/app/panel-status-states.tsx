'use client';

import { Button, Skeleton } from '@wayly/ui';

export function PanelEmptyState({
  title,
  body,
  actionLabel,
  onAction,
}: {
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div
      className="wayly-empty-state rounded-xl border border-border/60 bg-muted/20 px-5 py-8 text-center sm:text-left"
      role="status"
    >
      <div
        className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary sm:mx-0"
        aria-hidden
      >
        <svg
          viewBox="0 0 24 24"
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0H4"
          />
        </svg>
      </div>
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
      {actionLabel && onAction ? (
        <Button type="button" variant="outline" size="sm" className="mt-4" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}

export function PanelErrorState({
  message,
  retryLabel,
  onRetry,
  retryDisabled,
}: {
  message: string;
  retryLabel: string;
  onRetry: () => void;
  retryDisabled?: boolean;
}) {
  return (
    <div className="wayly-panel-error flex flex-col gap-2 rounded-lg border px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm" role="alert">
        {message}
      </p>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-8 shrink-0 text-xs"
        disabled={retryDisabled}
        onClick={onRetry}
      >
        {retryLabel}
      </Button>
    </div>
  );
}

export function RequestsListSkeleton({
  rows = 2,
  itemClassName = 'h-20 w-full rounded-lg',
}: {
  rows?: number;
  itemClassName?: string;
}) {
  return (
    <ul className="flex flex-col gap-2" aria-hidden>
      {Array.from({ length: rows }, (_, key) => (
        <li key={key} className="wayly-skeleton-enter">
          <Skeleton className={itemClassName} />
        </li>
      ))}
    </ul>
  );
}
