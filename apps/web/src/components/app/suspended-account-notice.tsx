'use client';

import type { UserProfile } from '@wayly/types';
import { UserAccountStatus } from '@wayly/types';

import { useI18n } from '@/lib/i18n/i18n-context';

export type SuspendedAccountNoticeProps = {
  user: UserProfile;
};

export function SuspendedAccountNotice({ user }: SuspendedAccountNoticeProps) {
  const { t } = useI18n();

  if (user.accountStatus !== UserAccountStatus.SUSPENDED) {
    return null;
  }

  return (
    <div
      className="wayly-alert wayly-alert-danger rounded-xl border px-4 py-3 text-sm"
      role="alert"
    >
      <p className="font-semibold">{t('app.suspendedAccountNoticeTitle')}</p>
      <p className="mt-1 text-muted-foreground">{t('app.suspendedAccountNoticeBody')}</p>
    </div>
  );
}
