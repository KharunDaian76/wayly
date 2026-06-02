import * as React from 'react';

import { cn } from '../lib/cn';

/**
 * Loading-state primitive. Every async surface (feeds, order cards, chat,
 * maps panels) uses Skeleton placeholders for a polished perceived performance.
 */
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('animate-pulse rounded-md bg-muted', className)} {...props} />;
}
