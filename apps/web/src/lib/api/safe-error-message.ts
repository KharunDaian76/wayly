import { ApiError } from '@wayly/sdk';

import type { TranslationKey } from '@/lib/i18n/dictionaries';

type SafeErrorOptions = {
  fallbackKey: TranslationKey;
  adminRequiredKey?: TranslationKey;
  rateLimitKey?: TranslationKey;
  t: (key: TranslationKey) => string;
};

/** Maps SDK errors to safe, user-facing panel messages without stack traces or internals. */
export function safePanelErrorMessage(error: unknown, options: SafeErrorOptions): string {
  const {
    fallbackKey,
    adminRequiredKey = 'app.admin.accessRequired',
    rateLimitKey = 'app.admin.rateLimitExceeded',
    t,
  } = options;

  if (!(error instanceof ApiError)) {
    return t(fallbackKey);
  }

  if (error.status === 401 || error.status === 403) {
    return t(adminRequiredKey);
  }

  if (error.status === 429) {
    return t(rateLimitKey);
  }

  if (error.status >= 500) {
    return t(fallbackKey);
  }

  const message = error.message?.trim();
  if (message && message.length > 0 && message.length <= 200) {
    return message;
  }

  return t(fallbackKey);
}
