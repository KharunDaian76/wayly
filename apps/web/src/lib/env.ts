/**
 * Client-side environment access (only NEXT_PUBLIC_* values are available in the
 * browser). Centralized so future config (maps token, Stripe publishable key,
 * Firebase config, Sentry DSN) has a single typed home.
 */
export const clientEnv = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000',
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
} as const;
