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
import { useI18n } from '@/lib/i18n/i18n-context';

export default function RegisterPage() {
  const router = useRouter();
  const { status, register } = useAuth();
  const { t } = useI18n();
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
      <AuthShell title={t('register.title')} description={t('register.checkingSession')}>
        <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
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
      setError(err instanceof ApiError ? err.message : t('register.registrationFailed'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell title={t('register.title')} description={t('register.description')}>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
        <div className="flex flex-col gap-2">
          <label htmlFor="displayName" className="text-sm font-medium">
            {t('common.displayName')}
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
            {t('common.email')}
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
            {t('common.password')}
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
          {submitting ? t('register.creatingAccount') : t('register.createAccount')}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          {t('register.hasAccount')}{' '}
          <Link href="/login" className="font-medium text-primary hover:underline">
            {t('register.signIn')}
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
