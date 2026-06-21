/**
 * Gate for mock/dev-only client UI (KYC mock review, mock payments, mock Wayler access).
 *
 * Enabled when running a non-production build (`next dev`) or when
 * `NEXT_PUBLIC_ENABLE_DEMO_TOOLS=true` is set explicitly (e.g. staging demos).
 * Production builds hide these controls by default.
 */
export const demoToolsEnabled =
  process.env.NEXT_PUBLIC_ENABLE_DEMO_TOOLS === 'true' || process.env.NODE_ENV !== 'production';
