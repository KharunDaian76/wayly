'use client';

import { Button, Input } from '@wayly/ui';
import { LayoutTemplate, Trash2 } from 'lucide-react';
import { useState } from 'react';

import type { WaylerAvailabilityFormFields } from '@/components/app/wayler-availability-composer';
import { useI18n } from '@/lib/i18n/i18n-context';
import {
  MAX_WAYLER_AVAILABILITY_TEMPLATES,
  type WaylerAvailabilityTemplate,
} from '@/lib/wayler-availability-template-storage';
import { cn } from '@/lib/utils';

const PANEL_CLASS = cn(
  'rounded-lg border border-indigo-500/20 bg-indigo-500/[0.04] px-3 py-2.5 text-xs text-muted-foreground',
);

const CARD_CLASS = cn(
  'flex flex-col gap-2 rounded-md border border-border/60 bg-background/80 px-3 py-2 sm:flex-row sm:items-center sm:justify-between',
);

type WaylerAvailabilityTemplatesProps = {
  templates: WaylerAvailabilityTemplate[];
  form: WaylerAvailabilityFormFields;
  disabled?: boolean;
  storageAvailable?: boolean;
  onSave: (
    name: string,
    form: WaylerAvailabilityFormFields,
  ) =>
    | { ok: true; template: WaylerAvailabilityTemplate }
    | { ok: false; reason: 'emptyName' | 'maxReached' | 'storage' };
  onApply: (template: WaylerAvailabilityTemplate) => void;
  onDelete: (templateId: string) => void;
  onClear: () => void;
  className?: string;
};

export function WaylerAvailabilityTemplates({
  templates,
  form,
  disabled = false,
  storageAvailable = true,
  onSave,
  onApply,
  onDelete,
  onClear,
  className,
}: WaylerAvailabilityTemplatesProps) {
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

  const handleApply = (template: WaylerAvailabilityTemplate) => {
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
      aria-labelledby="wayler-availability-templates-title"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <LayoutTemplate
            className="h-3.5 w-3.5 shrink-0 text-indigo-700/80 dark:text-indigo-400/90"
            aria-hidden
          />
          <div className="min-w-0">
            <h4
              id="wayler-availability-templates-title"
              className="text-sm font-medium text-foreground"
            >
              {t('app.waylerAvailabilityTemplates.title')}
            </h4>
            <p className="mt-0.5">{t('app.waylerAvailabilityTemplates.subtitle')}</p>
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
            {t('app.waylerAvailabilityTemplates.clear')}
          </Button>
        ) : null}
      </div>

      <p className="mt-1.5 text-[11px] opacity-90">
        {t('app.waylerAvailabilityTemplates.localOnly')}
      </p>
      <p className="mt-1 text-[11px] opacity-90">
        {t('app.waylerAvailabilityTemplates.noSensitiveData')}
      </p>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end">
        <label className="flex min-w-0 flex-1 flex-col gap-1 text-sm">
          <span className="font-medium text-foreground">
            {t('app.waylerAvailabilityTemplates.nameLabel')}
          </span>
          <Input
            value={templateName}
            disabled={disabled || !storageAvailable}
            placeholder={t('app.waylerAvailabilityTemplates.namePlaceholder')}
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
          {t('app.waylerAvailabilityTemplates.saveCurrent')}
        </Button>
      </div>

      {savedNotice ? (
        <p className="mt-2 text-emerald-700 dark:text-emerald-300" role="status">
          {t('app.waylerAvailabilityTemplates.saved')}
        </p>
      ) : null}
      {errorNotice === 'maxReached' ? (
        <p className="mt-2 text-amber-700 dark:text-amber-300" role="status">
          {t('app.waylerAvailabilityTemplates.maxReached').replace(
            '{max}',
            String(MAX_WAYLER_AVAILABILITY_TEMPLATES),
          )}
        </p>
      ) : null}
      {clearedNotice && templates.length === 0 ? (
        <p className="mt-2" role="status">
          {t('app.waylerAvailabilityTemplates.cleared')}
        </p>
      ) : null}
      {deletedNotice && templates.length > 0 ? (
        <p className="mt-2" role="status">
          {t('app.waylerAvailabilityTemplates.deleted')}
        </p>
      ) : null}

      {templates.length === 0 ? (
        !clearedNotice ? (
          <p className="mt-3">{t('app.waylerAvailabilityTemplates.empty')}</p>
        ) : null
      ) : (
        <ul className="mt-3 flex flex-col gap-2">
          {templates.map((template) => (
            <li key={template.templateId} className={CARD_CLASS}>
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">{template.templateName}</p>
                {appliedNotice === template.templateId ? (
                  <p className="mt-0.5 text-emerald-700 dark:text-emerald-300" role="status">
                    {t('app.waylerAvailabilityTemplates.applied')}
                  </p>
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
                  {t('app.waylerAvailabilityTemplates.apply')}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="px-2"
                  disabled={disabled}
                  aria-label={t('app.waylerAvailabilityTemplates.delete')}
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
          {t('app.waylerAvailabilityTemplates.count')
            .replace('{count}', String(templates.length))
            .replace('{max}', String(MAX_WAYLER_AVAILABILITY_TEMPLATES))}
        </p>
      ) : null}
    </section>
  );
}
