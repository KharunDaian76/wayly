import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="container flex min-h-dvh flex-col items-center justify-center gap-5 py-16 text-center">
      <p className="font-display text-7xl font-extrabold text-primary">404</p>
      <h1 className="font-display text-2xl font-bold">Page not found</h1>
      <p className="max-w-md text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or has moved.
      </p>
      <Link
        href="/"
        className="inline-flex items-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-[1.02]"
      >
        Back home
      </Link>
    </main>
  );
}
