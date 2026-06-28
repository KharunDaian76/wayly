'use client';

import { clientEnv } from '@/lib/env';

function resolveApiHost(apiUrl: string): string {
  try {
    return new URL(apiUrl).host;
  } catch {
    return apiUrl.replace(/^https?:\/\//, '');
  }
}

function shouldShowEnvBadge(): boolean {
  return (
    process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_SHOW_ENV_BADGE === 'true'
  );
}

/** Safe dev-only hint showing which API host the browser SDK targets (no secrets). */
export function EnvDiagnosticsBadge() {
  if (!shouldShowEnvBadge()) {
    return null;
  }

  const apiHost = resolveApiHost(clientEnv.apiUrl);

  return (
    <span
      className="inline-flex max-w-full items-center rounded-md border border-border/60 bg-muted/40 px-2 py-1 font-mono text-[10px] leading-none text-muted-foreground"
      title="Browser API target (read-only diagnostic)"
    >
      API: {apiHost}
    </span>
  );
}
