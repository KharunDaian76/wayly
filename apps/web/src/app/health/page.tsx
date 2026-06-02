'use client';

import type { HealthResult } from '@wayly/sdk';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Container,
  Skeleton,
} from '@wayly/ui';
import { useCallback, useEffect, useState } from 'react';

import { api } from '@/lib/sdk';

type Status = 'loading' | 'success' | 'error';

/**
 * Diagnostic health page. Verifies web → API connectivity end-to-end through
 * @wayly/sdk and demonstrates the loading / error / success patterns the whole
 * app reuses — now built from @wayly/ui primitives.
 */
export default function HealthPage() {
  const [status, setStatus] = useState<Status>('loading');
  const [result, setResult] = useState<HealthResult | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const check = useCallback(async () => {
    setStatus('loading');
    setMessage(null);
    try {
      const data = await api.health.ready();
      setResult(data);
      setStatus(data.status === 'ok' ? 'success' : 'error');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unknown error');
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    void check();
  }, [check]);

  return (
    <Container className="flex min-h-dvh items-center justify-center py-16">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>System health</CardTitle>
          <CardDescription>Live status of the Wayly API.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {status === 'loading' && (
            <div className="flex items-center gap-3" aria-live="polite">
              <Skeleton className="size-3 rounded-full" />
              <Skeleton className="h-4 w-32" />
            </div>
          )}

          {status === 'success' && (
            <div className="flex items-center gap-3 rounded-lg bg-success/10 px-4 py-3 text-success">
              <span className="size-2.5 rounded-full bg-success" />
              <span className="text-sm font-semibold">All systems operational</span>
            </div>
          )}

          {status === 'error' && (
            <div className="flex items-center gap-3 rounded-lg bg-danger/10 px-4 py-3 text-danger">
              <span className="size-2.5 rounded-full bg-danger" />
              <span className="text-sm font-semibold">
                {message ?? 'One or more dependencies are unavailable'}
              </span>
            </div>
          )}

          {result && (
            <pre className="max-h-56 overflow-auto rounded-lg bg-secondary p-4 text-xs text-secondary-foreground">
              {JSON.stringify(result, null, 2)}
            </pre>
          )}

          <Button variant="outline" fullWidth onClick={() => void check()}>
            Re-check
          </Button>
        </CardContent>
      </Card>
    </Container>
  );
}
