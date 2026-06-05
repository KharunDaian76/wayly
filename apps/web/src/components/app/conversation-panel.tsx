'use client';

import { ApiError } from '@wayly/sdk';
import type { ChatMessageSummary } from '@wayly/types';
import { Button } from '@wayly/ui';
import { useCallback, useEffect, useState } from 'react';

import { useI18n } from '@/lib/i18n/i18n-context';
import { api } from '@/lib/sdk';
import { cn } from '@/lib/utils';

const MAX_MESSAGE_LENGTH = 2000;

type ConversationPanelProps = {
  open: boolean;
  onClose: () => void;
  conversationId: string | null;
  orderTitle: string | null;
  orderId: string | null;
  currentUserId: string;
};

export function ConversationPanel({
  open,
  onClose,
  conversationId,
  orderTitle,
  orderId,
  currentUserId,
}: ConversationPanelProps) {
  const { t } = useI18n();
  const [messages, setMessages] = useState<ChatMessageSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [markReadError, setMarkReadError] = useState<string | null>(null);
  const [draft, setDraft] = useState('');

  const trimmedDraft = draft.trim();
  const remainingChars = MAX_MESSAGE_LENGTH - draft.length;
  const canSend =
    trimmedDraft.length > 0 &&
    draft.length <= MAX_MESSAGE_LENGTH &&
    !sending &&
    !loading &&
    conversationId !== null;

  const loadConversation = useCallback(async () => {
    if (!conversationId) {
      return;
    }
    setLoading(true);
    setError(null);
    setMarkReadError(null);
    try {
      const detail = await api.conversations.detail(conversationId);
      setMessages(detail.messages);
      try {
        await api.conversations.markRead(conversationId);
      } catch {
        setMarkReadError(t('app.chat.markReadFailed'));
      }
    } catch {
      setError(t('app.chat.loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [conversationId, t]);

  useEffect(() => {
    if (open && conversationId) {
      void loadConversation();
    }
  }, [open, conversationId, loadConversation]);

  useEffect(() => {
    if (!open) {
      setDraft('');
      setError(null);
      setMarkReadError(null);
      setMessages([]);
    }
  }, [open]);

  async function handleSend() {
    if (!conversationId || !canSend) {
      return;
    }
    setSending(true);
    setError(null);
    try {
      await api.conversations.sendMessage(conversationId, { body: trimmedDraft });
      setDraft('');
      await loadConversation();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message || t('app.chat.sendFailed')
          : t('app.chat.sendFailed'),
      );
    } finally {
      setSending(false);
    }
  }

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-md flex-col rounded-lg border border-border bg-background shadow-lg"
        role="dialog"
        aria-label={t('app.chat.title')}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-2 border-b border-border/60 px-4 py-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold">{t('app.chat.title')}</p>
            {orderTitle ? (
              <p className="truncate text-xs text-muted-foreground">{orderTitle}</p>
            ) : null}
            {orderId ? (
              <p className="truncate font-mono text-[10px] text-muted-foreground">{orderId}</p>
            ) : null}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs"
              disabled={loading || sending}
              onClick={() => void loadConversation()}
            >
              {t('app.chat.refresh')}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs"
              onClick={onClose}
            >
              {t('app.chat.close')}
            </Button>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-3">
          {error ? (
            <p className="rounded-md border border-danger/30 bg-danger/10 px-2 py-1.5 text-xs text-danger">
              {error}
            </p>
          ) : null}
          {markReadError ? (
            <p className="rounded-md border border-accent/30 bg-accent/10 px-2 py-1.5 text-xs text-foreground">
              {markReadError}
            </p>
          ) : null}
          {loading ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              {t('app.chat.loading')}
            </p>
          ) : messages.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">{t('app.chat.empty')}</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {messages.map((message) => {
                const isMine = message.senderId === currentUserId;

                return (
                  <li
                    key={message.id}
                    className={cn('flex flex-col gap-0.5', isMine ? 'items-end' : 'items-start')}
                  >
                    <span className="text-[10px] font-medium text-muted-foreground">
                      {isMine ? t('app.chat.you') : t('app.chat.other')}
                    </span>
                    <div
                      className={cn(
                        'max-w-[85%] rounded-md border px-3 py-2 text-sm',
                        isMine ? 'border-primary/30 bg-primary/10' : 'border-border/60 bg-muted/30',
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
        </div>

        <div className="border-t border-border/60 p-3">
          <label className="flex flex-col gap-1.5 text-sm">
            <textarea
              className={cn(
                'flex min-h-[72px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
                'ring-offset-background placeholder:text-muted-foreground',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                'disabled:cursor-not-allowed disabled:opacity-50',
              )}
              value={draft}
              maxLength={MAX_MESSAGE_LENGTH}
              placeholder={t('app.chat.messagePlaceholder')}
              disabled={loading || sending || !conversationId}
              onChange={(event) => setDraft(event.target.value)}
              rows={3}
            />
            <span className="text-xs text-muted-foreground">
              {t('app.chat.charactersRemaining').replace('{count}', String(remainingChars))}
            </span>
          </label>
          <Button
            type="button"
            className="mt-2 w-full sm:w-auto"
            size="sm"
            disabled={!canSend}
            onClick={() => void handleSend()}
          >
            {sending ? t('app.chat.sending') : t('app.chat.send')}
          </Button>
        </div>
      </div>
    </div>
  );
}
