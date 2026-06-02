import * as React from 'react';

import { cn } from '../lib/cn';

/**
 * Responsive layout primitive. Centers content with mobile-first padding and a
 * max width. The single horizontal-rhythm source for marketing, app, and admin.
 */
export const Container = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('mx-auto w-full max-w-screen-xl px-4 sm:px-6 lg:px-8', className)}
      {...props}
    />
  ),
);
Container.displayName = 'Container';
