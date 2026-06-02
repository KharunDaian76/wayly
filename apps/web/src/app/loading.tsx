/**
 * Global route-level loading state. Skeleton blocks use the design system's
 * shimmer animation token. Feature routes ship their own richer skeletons.
 */
export default function Loading() {
  return (
    <div
      className="container flex min-h-dvh flex-col gap-6 py-16"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="h-10 w-2/3 max-w-md animate-pulse rounded-lg bg-muted" />
      <div className="h-5 w-1/2 max-w-sm animate-pulse rounded-md bg-muted" />
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-40 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}
