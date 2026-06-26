'use client';

import { Button, Input } from '@wayly/ui';
import { Package, Trash2 } from 'lucide-react';
import { useState } from 'react';

import type { SenderRequestFormFields } from '@/components/app/sender-request-composer';
import { useI18n } from '@/lib/i18n/i18n-context';
import {
  MAX_SENDER_REQUEST_TEMPLATES,
  type SenderRequestTemplate,
} from '@/lib/sender-request-template-storage';
import { cn } from '@/lib/utils';

const PANEL_CLASS = cn(
  'rounded-lg border border-violet-500/20 bg-violet-500/[0.04] px-3 py-2.5 text-xs text-muted-foreground',
);

const CARD_CLASS = cn(
  'flex flex-col gap-2 rounded-md border border-border/60 bg-background/80 px-3 py-2 sm:flex-row sm:items-center sm:justify-between',
);

type SenderRequestTemplatesProps = {
  templates: SenderRequestTemplate[];
  form: SenderRequestFormFields;
  disabled?: boolean;
  storageAvailable?: boolean;
  onSave: (
    name: string,
    form: SenderRequestFormFields,
  ) =>
    | { ok: true; template: SenderRequestTemplate }
    | { ok: false; reason: 'emptyName' | 'maxReached' | 'storage' };
  onApply: (template: SenderRequestTemplate) => void;
  onDelete: (templateId: string) => void;
  onClear: () => void;
  className?: string;
};

export function SenderRequestTemplates({
  templates,
  form,
  disabled = false,
  storageAvailable = true,
  onSave,
  onApply,
  onDelete,
  onClear,
  className,
}: SenderRequestTemplatesProps) {
  const { t } = useI18n();
  const [templateName, setTemplateName] = useState('');
  const [savedNotice, setSavedNotice] = useState(false);
  const [appliedNotice, setAppliedNotice] = useState<string | null>(null);
  const [deletedNotice, setDeletedNotice] = useState(false);
  const [clearedNotice, setClearedNotice] = useState(false);
  const [errorNotice, setErrorNotice] = useState<'maxReached' | 'storage' | null>(null);

  const handleSave = () => {
    setSavedNotice(false);
    setErrorNotice(null);
    const result = onSave(templateName, form);
    if (result.ok) {
      setTemplateName('');
      setSavedNotice(true);
      return;
    }
    if (result.reason === 'maxReached') {
      setErrorNotice('maxReached');
      return;
    }
    if (result.reason === 'storage') {
      setErrorNotice('storage');
    }
  };

  const handleApply = (template: SenderRequestTemplate) => {
    onApply(template);
    setAppliedNotice(template.templateId);
    setSavedNotice(false);
    setErrorNotice(null);
  };

  const handleDelete = (templateId: string) => {
    onDelete(templateId);
    setDeletedNotice(true);
    if (appliedNotice === templateId) {
      setAppliedNotice(null);
    }
  };

  const handleClear = () => {
    onClear();
    setClearedNotice(true);
    setSavedNotice(false);
    setAppliedNotice(null);
    setDeletedNotice(false);
    setErrorNotice(null);
  };

  return (
    <section
      className={cn(PANEL_CLASS, className)}
      aria-labelledby="sender-request-templates-title"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <Package
            className="h-3.5 w-3.5 shrink-0 text-violet-700/80 dark:text-violet-400/90"
            aria-hidden
          />
          <div className="min-w-0">
            <h4 id="sender-request-templates-title" className="text-sm font-medium text-foreground">
              {t('app.senderRequestTemplates.title')}
            </h4>
            <p className="mt-0.5">{t('app.senderRequestTemplates.subtitle')}</p>
          </div>
        </div>
        {templates.length > 0 ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            disabled={disabled}
            onClick={handleClear}
          >
            {t('app.senderRequestTemplates.clear')}
          </Button>
        ) : null}
      </div>

      <p className="mt-1.5 text-[11px] opacity-90">{t('app.senderRequestTemplates.localOnly')}</p>
      <p className="mt-1 text-[11px] opacity-90">
        {t('app.senderRequestTemplates.noSensitiveData')}
      </p>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end">
        <label className="flex min-w-0 flex-1 flex-col gap-1 text-sm">
          <span className="font-medium text-foreground">
            {t('app.senderRequestTemplates.nameLabel')}
          </span>
          <Input
            value={templateName}
            disabled={disabled || !storageAvailable}
            placeholder={t('app.senderRequestTemplates.namePlaceholder')}
            onChange={(e) => setTemplateName(e.target.value)}
          />
        </label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || !storageAvailable || templateName.trim().length === 0}
          onClick={handleSave}
        >
          {t('app.senderRequestTemplates.saveCurrent')}
        </Button>
      </div>

      {savedNotice ? (
        <p className="mt-2 text-emerald-700 dark:text-emerald-300" role="status">
          {t('app.senderRequestTemplates.saved')}
        </p>
      ) : null}
      {errorNotice === 'maxReached' ? (
        <p className="mt-2 text-amber-700 dark:text-amber-300" role="status">
          {t('app.senderRequestTemplates.maxReached').replace(
            '{max}',
            String(MAX_SENDER_REQUEST_TEMPLATES),
          )}
        </p>
      ) : null}
      {clearedNotice && templates.length === 0 ? (
        <p className="mt-2" role="status">
          {t('app.senderRequestTemplates.cleared')}
        </p>
      ) : null}
      {deletedNotice && templates.length > 0 ? (
        <p className="mt-2" role="status">
          {t('app.senderRequestTemplates.deleted')}
        </p>
      ) : null}

      {templates.length === 0 ? (
        !clearedNotice ? (
          <p className="mt-3">{t('app.senderRequestTemplates.empty')}</p>
        ) : null
      ) : (
        <ul className="mt-3 flex flex-col gap-2">
          {templates.map((template) => (
            <li key={template.templateId} className={CARD_CLASS}>
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">{template.templateName}</p>
                {appliedNotice === template.templateId ? (
                  <div className="mt-0.5 space-y-0.5">
                    <p className="text-emerald-700 dark:text-emerald-300" role="status">
                      {t('app.senderRequestTemplates.applied')}
                    </p>
                    <p className="text-[11px] opacity-90">
                      {t('app.senderRequestTemplates.applyKeepsRoute')}
                    </p>
                  </div>
                ) : null}
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={disabled}
                  onClick={() => handleApply(template)}
                >
                  {t('app.senderRequestTemplates.apply')}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="px-2"
                  disabled={disabled}
                  aria-label={t('app.senderRequestTemplates.delete')}
                  onClick={() => handleDelete(template.templateId)}
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {templates.length > 0 ? (
        <p className="mt-2 text-[11px] opacity-90">
          {t('app.senderRequestTemplates.count')
            .replace('{count}', String(templates.length))
            .replace('{max}', String(MAX_SENDER_REQUEST_TEMPLATES))}
        </p>
      ) : null}
    </section>
  );
}
