'use client';

import { useEffect } from 'react';

/**
 * Global error boundary state. Catches render/runtime errors in the route tree
 * and offers recovery. The baseline pattern reused by feature error states.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Wired to Sentry in the monitoring milestone.
    console.error(error);
  }, [error]);

  return (
    <main className="container flex min-h-dvh flex-col items-center justify-center gap-5 py-16 text-center">
      <p className="rounded-full bg-danger/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-danger">
        Something went wrong
      </p>
      <h1 className="font-display text-3xl font-bold">We hit an unexpected error</h1>
      <p className="max-w-md text-muted-foreground">
        An error occurred while loading this page. You can try again — if it keeps happening, please
        come back shortly.
      </p>
      <button
        type="button"
        onClick={reset}
        className="inline-flex items-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-[1.02]"
      >
        Try again
      </button>
    </main>
  );
}
