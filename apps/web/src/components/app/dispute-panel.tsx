'use client';

import { ApiError } from '@wayly/sdk';
import type { DisputeDetail, DisputeEvidenceSummary, DisputeMessageSummary } from '@wayly/types';
import { DisputeReason, DisputeStatus } from '@wayly/types';
import { Button } from '@wayly/ui';
import { useCallback, useEffect, useState } from 'react';

import { useI18n } from '@/lib/i18n/i18n-context';
import type { TranslationKey } from '@/lib/i18n/dictionaries';
import { api } from '@/lib/sdk';
import { cn } from '@/lib/utils';
import {
  PanelEmptyState,
  PanelErrorState,
  RequestsListSkeleton,
} from '@/components/app/panel-status-states';
import {
  DisputeGuidanceNote,
  DisputeNoDisputeGuidance,
  DisputeStatusHelp,
} from '@/components/app/dispute-guidance-note';
import {
  DisputeEvidenceEmpty,
  DisputeEvidenceFormHints,
  DisputeEvidenceGuidance,
} from '@/components/app/dispute-evidence-guidance';

const MIN_DESCRIPTION_LENGTH = 10;
const MAX_DESCRIPTION_LENGTH = 3000;
const MAX_MESSAGE_LENGTH = 3000;
const MAX_EVIDENCE_TITLE_LENGTH = 200;
const MAX_EVIDENCE_DESCRIPTION_LENGTH = 2000;
const MAX_FILE_URL_LENGTH = 1000;

const DISPUTE_REASONS = [
  DisputeReason.ITEM_NOT_DELIVERED,
  DisputeReason.ITEM_DAMAGED,
  DisputeReason.WRONG_ITEM,
  DisputeReason.PAYMENT_ISSUE,
  DisputeReason.SAFETY_CONCERN,
  DisputeReason.OTHER,
] as const;

const ACTIVE_DISPUTE_STATUSES = new Set<DisputeStatus>([
  DisputeStatus.OPEN,
  DisputeStatus.UNDER_REVIEW,
]);

const TEXTAREA_CLASS = cn(
  'flex min-h-[72px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
  'ring-offset-background placeholder:text-muted-foreground',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
  'disabled:cursor-not-allowed disabled:opacity-50',
);

const SELECT_CLASS =
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm';

type DisputePanelProps = {
  open: boolean;
  onClose: () => void;
  orderId: string | null;
  orderTitle: string | null;
  disputeId: string | null;
  currentUserId: string;
  onDisputeChanged?: () => void;
  onDisputeOpened?: (disputeId: string) => void;
};

export function disputeReasonKey(reason: DisputeReason): TranslationKey {
  return `app.disputes.reason.${reason}` as TranslationKey;
}

export function disputeStatusKey(status: DisputeStatus): TranslationKey {
  return `app.disputes.status.${status}` as TranslationKey;
}

export function DisputePanel({
  open,
  onClose,
  orderId,
  orderTitle,
  disputeId,
  currentUserId,
  onDisputeChanged,
  onDisputeOpened,
}: DisputePanelProps) {
  const { t } = useI18n();
  const isOpenMode = disputeId === null;

  const [detail, setDetail] = useState<DisputeDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [openError, setOpenError] = useState<string | null>(null);
  const [openSuccess, setOpenSuccess] = useState(false);

  const [reason, setReason] = useState<DisputeReason>(DisputeReason.OTHER);
  const [description, setDescription] = useState('');
  const [submittingOpen, setSubmittingOpen] = useState(false);

  const [messageDraft, setMessageDraft] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageError, setMessageError] = useState<string | null>(null);

  const [evidenceTitle, setEvidenceTitle] = useState('');
  const [evidenceDescription, setEvidenceDescription] = useState('');
  const [evidenceFileUrl, setEvidenceFileUrl] = useState('');
  const [addingEvidence, setAddingEvidence] = useState(false);
  const [evidenceError, setEvidenceError] = useState<string | null>(null);

  const trimmedDescription = description.trim();
  const trimmedMessage = messageDraft.trim();
  const trimmedEvidenceTitle = evidenceTitle.trim();
  const messageRemainingChars = MAX_MESSAGE_LENGTH - messageDraft.length;
  const canSubmitOpen =
    orderId !== null &&
    trimmedDescription.length >= MIN_DESCRIPTION_LENGTH &&
    description.length <= MAX_DESCRIPTION_LENGTH &&
    !submittingOpen &&
    !loading;

  const canSendMessage =
    disputeId !== null &&
    trimmedMessage.length > 0 &&
    messageDraft.length <= MAX_MESSAGE_LENGTH &&
    !sendingMessage &&
    !loading &&
    detail !== null &&
    ACTIVE_DISPUTE_STATUSES.has(detail.status);

  const canAddEvidence =
    disputeId !== null &&
    trimmedEvidenceTitle.length > 0 &&
    evidenceTitle.length <= MAX_EVIDENCE_TITLE_LENGTH &&
    evidenceDescription.length <= MAX_EVIDENCE_DESCRIPTION_LENGTH &&
    evidenceFileUrl.length <= MAX_FILE_URL_LENGTH &&
    !addingEvidence &&
    !loading &&
    detail !== null &&
    ACTIVE_DISPUTE_STATUSES.has(detail.status);

  const refreshDetail = useCallback(
    async (foreground: boolean) => {
      if (!disputeId) {
        return;
      }
      if (foreground) {
        setLoading(true);
        setLoadError(null);
      }
      try {
        const next = await api.disputes.detail(disputeId);
        setDetail(next);
        setLoadError(null);
      } catch {
        if (foreground) {
          setLoadError(t('app.disputes.loadFailed'));
        }
      } finally {
        if (foreground) {
          setLoading(false);
        }
      }
    },
    [disputeId, t],
  );

  useEffect(() => {
    if (open && disputeId) {
      void refreshDetail(true);
    }
  }, [open, disputeId, refreshDetail]);

  useEffect(() => {
    if (!open) {
      setDetail(null);
      setLoadError(null);
      setOpenError(null);
      setOpenSuccess(false);
      setReason(DisputeReason.OTHER);
      setDescription('');
      setMessageDraft('');
      setMessageError(null);
      setEvidenceTitle('');
      setEvidenceDescription('');
      setEvidenceFileUrl('');
      setEvidenceError(null);
    }
  }, [open]);

  async function handleOpenDispute() {
    if (!orderId || !canSubmitOpen) {
      return;
    }
    setSubmittingOpen(true);
    setOpenError(null);
    setLoadError(null);
    setOpenSuccess(false);
    try {
      const created = await api.disputes.open({
        orderId,
        reason,
        description: trimmedDescription,
      });
      setOpenSuccess(true);
      onDisputeOpened?.(created.id);
      onDisputeChanged?.();
      setDetail(created);
      setLoadError(null);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setOpenError(t('app.disputes.duplicateActive'));
        onDisputeChanged?.();
      } else {
        setOpenError(
          err instanceof ApiError
            ? err.message || t('app.disputes.disputeSubmitFailed')
            : t('app.disputes.disputeSubmitFailed'),
        );
      }
    } finally {
      setSubmittingOpen(false);
    }
  }

  async function handleSendMessage() {
    if (!disputeId || !canSendMessage) {
      return;
    }
    setSendingMessage(true);
    setMessageError(null);
    try {
      await api.disputes.addMessage(disputeId, { body: trimmedMessage });
      setMessageDraft('');
      await refreshDetail(true);
    } catch (err) {
      setMessageError(
        err instanceof ApiError
          ? err.message || t('app.disputes.messageFailed')
          : t('app.disputes.messageFailed'),
      );
    } finally {
      setSendingMessage(false);
    }
  }

  async function handleAddEvidence() {
    if (!disputeId || !canAddEvidence) {
      return;
    }
    setAddingEvidence(true);
    setEvidenceError(null);
    try {
      const body: {
        title: string;
        description?: string;
        fileUrl?: string;
      } = { title: trimmedEvidenceTitle };
      const trimmedEvidenceDescription = evidenceDescription.trim();
      const trimmedFileUrl = evidenceFileUrl.trim();
      if (trimmedEvidenceDescription) {
        body.description = trimmedEvidenceDescription;
      }
      if (trimmedFileUrl) {
        body.fileUrl = trimmedFileUrl;
      }
      await api.disputes.addEvidence(disputeId, body);
      setEvidenceTitle('');
      setEvidenceDescription('');
      setEvidenceFileUrl('');
      await refreshDetail(true);
    } catch (err) {
      setEvidenceError(
        err instanceof ApiError
          ? err.message || t('app.disputes.evidenceFailed')
          : t('app.disputes.evidenceFailed'),
      );
    } finally {
      setAddingEvidence(false);
    }
  }

  if (!open) {
    return null;
  }

  const showDetail = !isOpenMode || (openSuccess && detail !== null);
  const panelTitle = showDetail ? t('app.disputes.viewTitle') : t('app.disputes.openTitle');
  const showInitialLoading = showDetail && loading && detail === null;
  const isRefreshing = showDetail && loading && detail !== null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-lg border border-border bg-background shadow-lg"
        role="dialog"
        aria-label={panelTitle}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-2 border-b border-border/60 px-4 py-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold">{panelTitle}</p>
            {orderTitle ? (
              <p className="truncate text-xs text-muted-foreground">{orderTitle}</p>
            ) : null}
            {orderId ? (
              <p className="truncate font-mono text-[10px] text-muted-foreground">{orderId}</p>
            ) : null}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {showDetail && disputeId ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs"
                disabled={loading || submittingOpen || sendingMessage || addingEvidence}
                onClick={() => void refreshDetail(true)}
              >
                {isRefreshing ? t('app.disputes.refreshing') : t('app.disputes.refresh')}
              </Button>
            ) : null}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs"
              onClick={onClose}
            >
              {t('app.disputes.close')}
            </Button>
          </div>
        </div>

        <div className="border-b border-border/40 px-4 py-1.5">
          <DisputeGuidanceNote variant="neutral" />
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4">
          {loadError ? (
            <PanelErrorState
              message={loadError}
              retryLabel={t('app.disputes.retryDisputeStatus')}
              onRetry={() => void refreshDetail(true)}
              retryDisabled={loading}
            />
          ) : null}
          {openSuccess ? (
            <p className="rounded-md border border-accent/30 bg-accent/10 px-2 py-1.5 text-xs text-foreground">
              {t('app.disputes.openSuccess')}
            </p>
          ) : null}

          {showDetail ? (
            <>
              {showInitialLoading ? (
                <div className="flex flex-col gap-2 py-2">
                  <p className="text-xs text-muted-foreground" role="status" aria-live="polite">
                    {t('app.disputes.disputeLoading')}
                  </p>
                  <RequestsListSkeleton rows={2} itemClassName="h-14 w-full rounded-md" />
                </div>
              ) : detail ? (
                <>
                  {isRefreshing ? (
                    <p className="text-xs text-muted-foreground" role="status" aria-live="polite">
                      {t('app.disputes.disputeRefreshing')}
                    </p>
                  ) : null}
                  <DisputeStatusHelp status={detail.status} compact minimal />
                  <dl className="flex flex-col gap-2 text-sm">
                    <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                      <dt className="text-muted-foreground">{t('app.disputes.reason')}</dt>
                      <dd className="font-medium">{t(disputeReasonKey(detail.reason))}</dd>
                    </div>
                    <div className="flex flex-col gap-1">
                      <dt className="text-muted-foreground">{t('app.disputes.description')}</dt>
                      <dd className="whitespace-pre-wrap break-words">{detail.description}</dd>
                    </div>
                    <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between">
                      <dt className="text-muted-foreground">{t('app.disputes.createdAt')}</dt>
                      <dd>{new Date(detail.createdAt).toLocaleString()}</dd>
                    </div>
                  </dl>

                  {ACTIVE_DISPUTE_STATUSES.has(detail.status) ? <DisputeEvidenceGuidance /> : null}

                  <section className="flex flex-col gap-2">
                    <p className="text-sm font-medium">{t('app.disputes.messages')}</p>
                    {detail.messages.length === 0 ? (
                      <PanelEmptyState
                        title={t('app.disputes.noMessagesTitle')}
                        body={t('app.disputes.noMessagesBody')}
                      />
                    ) : (
                      <ul className="flex flex-col gap-2">
                        {detail.messages.map((message: DisputeMessageSummary) => {
                          const isMine = message.senderId === currentUserId;
                          return (
                            <li
                              key={message.id}
                              className={cn(
                                'flex flex-col gap-0.5',
                                isMine ? 'items-end' : 'items-start',
                              )}
                            >
                              <div
                                className={cn(
                                  'max-w-[90%] rounded-md border px-3 py-2 text-sm',
                                  isMine
                                    ? 'border-primary/30 bg-primary/10'
                                    : 'border-border/60 bg-muted/30',
                                )}
                              >
                                <p className="whitespace-pre-wrap break-words">{message.body}</p>
                                <p className="mt-1 text-[10px] text-muted-foreground">
                                  {new Date(message.createdAt).toLocaleString()}
                                </p>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </section>

                  {ACTIVE_DISPUTE_STATUSES.has(detail.status) ? (
                    <div className="flex flex-col gap-2 border-t border-border/60 pt-3">
                      {messageError ? <p className="text-xs text-danger">{messageError}</p> : null}
                      <label className="flex flex-col gap-1.5 text-sm">
                        <textarea
                          className={TEXTAREA_CLASS}
                          value={messageDraft}
                          maxLength={MAX_MESSAGE_LENGTH}
                          placeholder={t('app.disputes.messagePlaceholder')}
                          disabled={sendingMessage || loading}
                          onChange={(event) => setMessageDraft(event.target.value)}
                          rows={3}
                        />
                        <span className="text-xs text-muted-foreground">
                          {t('app.disputeEvidence.messageCounter').replace(
                            '{count}',
                            String(messageRemainingChars),
                          )}
                        </span>
                      </label>
                      <Button
                        type="button"
                        size="sm"
                        className="w-full sm:w-auto"
                        disabled={!canSendMessage}
                        onClick={() => void handleSendMessage()}
                      >
                        {sendingMessage
                          ? t('app.disputeEvidence.submitting')
                          : t('app.disputes.sendMessage')}
                      </Button>
                    </div>
                  ) : null}

                  <section className="flex flex-col gap-2 border-t border-border/60 pt-3">
                    <p className="text-sm font-medium">{t('app.disputes.evidence')}</p>
                    {detail.evidence.length === 0 ? (
                      <DisputeEvidenceEmpty />
                    ) : (
                      <ul className="flex flex-col gap-2">
                        {detail.evidence.map((item: DisputeEvidenceSummary) => (
                          <li
                            key={item.id}
                            className="rounded-md border border-border/60 bg-muted/20 px-3 py-2 text-sm"
                          >
                            <p className="font-medium">{item.title}</p>
                            {item.description ? (
                              <p className="mt-1 whitespace-pre-wrap break-words text-muted-foreground">
                                {item.description}
                              </p>
                            ) : null}
                            {item.fileUrl ? (
                              <p className="mt-1 break-all font-mono text-[10px] text-muted-foreground">
                                {item.fileUrl}
                              </p>
                            ) : null}
                            <p className="mt-1 text-[10px] text-muted-foreground">
                              {new Date(item.createdAt).toLocaleString()}
                            </p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>

                  {ACTIVE_DISPUTE_STATUSES.has(detail.status) ? (
                    <div className="flex flex-col gap-3 border-t border-border/60 pt-3">
                      {evidenceError ? (
                        <p className="text-xs text-danger">{evidenceError}</p>
                      ) : null}
                      <DisputeEvidenceFormHints />
                      <label className="flex flex-col gap-1.5 text-sm">
                        <span className="font-medium">{t('app.disputes.evidenceTitle')}</span>
                        <input
                          className={SELECT_CLASS}
                          value={evidenceTitle}
                          maxLength={MAX_EVIDENCE_TITLE_LENGTH}
                          disabled={addingEvidence || loading}
                          onChange={(event) => setEvidenceTitle(event.target.value)}
                        />
                      </label>
                      <label className="flex flex-col gap-1.5 text-sm">
                        <span className="font-medium">{t('app.disputes.evidenceDescription')}</span>
                        <textarea
                          className={TEXTAREA_CLASS}
                          value={evidenceDescription}
                          maxLength={MAX_EVIDENCE_DESCRIPTION_LENGTH}
                          disabled={addingEvidence || loading}
                          onChange={(event) => setEvidenceDescription(event.target.value)}
                          rows={2}
                        />
                      </label>
                      <label className="flex flex-col gap-1.5 text-sm">
                        <span className="font-medium">{t('app.disputes.evidenceFileUrl')}</span>
                        <input
                          className={SELECT_CLASS}
                          value={evidenceFileUrl}
                          maxLength={MAX_FILE_URL_LENGTH}
                          placeholder="https://"
                          disabled={addingEvidence || loading}
                          onChange={(event) => setEvidenceFileUrl(event.target.value)}
                        />
                      </label>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="w-full sm:w-auto"
                        disabled={!canAddEvidence}
                        onClick={() => void handleAddEvidence()}
                      >
                        {addingEvidence
                          ? t('app.disputeEvidence.submitting')
                          : t('app.disputes.addEvidence')}
                      </Button>
                    </div>
                  ) : null}
                </>
              ) : null}
            </>
          ) : (
            <div className="flex flex-col gap-3">
              <DisputeNoDisputeGuidance />
              {openError ? (
                <p
                  className="rounded-md border border-danger/30 bg-danger/10 px-2 py-1.5 text-xs text-danger"
                  role="alert"
                >
                  {openError}
                </p>
              ) : null}
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium">{t('app.disputes.reason')}</span>
                <select
                  className={SELECT_CLASS}
                  value={reason}
                  disabled={submittingOpen}
                  onChange={(event) => setReason(event.target.value as DisputeReason)}
                >
                  {DISPUTE_REASONS.map((value) => (
                    <option key={value} value={value}>
                      {t(disputeReasonKey(value))}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium">{t('app.disputes.description')}</span>
                <textarea
                  className={TEXTAREA_CLASS}
                  value={description}
                  maxLength={MAX_DESCRIPTION_LENGTH}
                  placeholder={t('app.disputes.descriptionPlaceholder')}
                  disabled={submittingOpen}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={5}
                />
                <span className="text-xs text-muted-foreground">
                  {t('app.disputes.descriptionHelp')}
                </span>
              </label>
              <Button
                type="button"
                className="w-full sm:w-auto"
                disabled={!canSubmitOpen}
                onClick={() => void handleOpenDispute()}
              >
                {submittingOpen
                  ? t('app.disputes.submittingDispute')
                  : t('app.disputes.submitDispute')}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
