'use client';

import { ApiError } from '@wayly/sdk';
import { Button, Input } from '@wayly/ui';
import { registerSchema, type RegisterInput } from '@wayly/validation';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';

import { AuthShell } from '@/components/auth/auth-shell';
import { PasswordInput } from '@/components/auth/password-input';
import { useAuth } from '@/lib/auth/auth-context';

export default function RegisterPage() {
  const router = useRouter();
  const { status, register } = useAuth();
  const [form, setForm] = useState<RegisterInput>({
    email: '',
    password: '',
    displayName: '',
  });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof RegisterInput, string>>>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/app');
    }
  }, [status, router]);

  if (status === 'loading' || status === 'authenticated') {
    return (
      <AuthShell title="Create account" description="Checking your session…">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </AuthShell>
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setFieldErrors({});

    const parsed = registerSchema.safeParse(form);
    if (!parsed.success) {
      const next: Partial<Record<keyof RegisterInput, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof RegisterInput;
        if (!next[key]) next[key] = issue.message;
      }
      setFieldErrors(next);
      return;
    }

    setSubmitting(true);
    try {
      await register(parsed.data);
      router.replace('/app');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell title="Create account" description="Join Wayly to send and deliver with trust.">
      <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
        <div className="flex flex-col gap-2">
          <label htmlFor="displayName" className="text-sm font-medium">
            Display name
          </label>
          <Input
            id="displayName"
            autoComplete="name"
            value={form.displayName}
            aria-invalid={fieldErrors.displayName ? true : undefined}
            onChange={(event) => setForm((prev) => ({ ...prev, displayName: event.target.value }))}
            disabled={submitting}
            required
          />
          {fieldErrors.displayName ? (
            <p className="text-sm text-danger">{fieldErrors.displayName}</p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={form.email}
            aria-invalid={fieldErrors.email ? true : undefined}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            disabled={submitting}
            required
          />
          {fieldErrors.email ? <p className="text-sm text-danger">{fieldErrors.email}</p> : null}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <PasswordInput
            id="password"
            autoComplete="new-password"
            value={form.password}
            aria-invalid={fieldErrors.password ? true : undefined}
            onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
            disabled={submitting}
            required
          />
          {fieldErrors.password ? (
            <p className="text-sm text-danger">{fieldErrors.password}</p>
          ) : null}
        </div>

        {error ? (
          <p className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
            {error}
          </p>
        ) : null}

        <Button type="submit" fullWidth disabled={submitting}>
          {submitting ? 'Creating account…' : 'Create account'}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
