'use client';

import { Button, Skeleton } from '@wayly/ui';

export function PanelEmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div
      className="rounded-lg border border-border/60 bg-muted/15 px-4 py-5 text-center sm:text-left"
      role="status"
    >
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="mt-1.5 text-sm text-muted-foreground">{body}</p>
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
    <div className="flex flex-col gap-2 rounded-lg border border-danger/30 bg-danger/10 px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-danger" role="alert">
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
        <li key={key}>
          <Skeleton className={itemClassName} />
        </li>
      ))}
    </ul>
  );
}
