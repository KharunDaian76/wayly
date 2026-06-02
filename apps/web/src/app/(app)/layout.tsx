/**
 * Authenticated app shell (scaffold only — no screens yet).
 *
 * This route group will host the mobile-first PWA experience under its own path
 * segments (e.g. /home, /feed, /orders, /chat, /wallet). Future responsibilities
 * that attach HERE without restructuring:
 *   - Auth guard + session hydration (M1)
 *   - KYC gate: block unverified users from orders/feed/chat/contact (M2)
 *   - Client providers: TanStack Query, WebSocket (chat/status), maps, FCM
 *   - App chrome: top role switch (Sender/Wayler), bottom tab navigation,
 *     bottom-sheet host for mobile interactions
 *
 * Kept intentionally minimal so the foundation review stays focused.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh">{children}</div>;
}
