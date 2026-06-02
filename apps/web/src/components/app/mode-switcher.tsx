'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@wayly/ui';

import { type AppMode, useAppMode } from '@/lib/app-mode/app-mode-context';
import { useI18n } from '@/lib/i18n/i18n-context';
import { cn } from '@/lib/utils';

const MODE_OPTIONS: AppMode[] = ['sender', 'wayler'];

const MODE_LABEL_KEYS = {
  sender: 'app.mode.sender',
  wayler: 'app.mode.wayler',
} as const;

export function ModeSwitcher() {
  const { mode, setMode } = useAppMode();
  const { t } = useI18n();

  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-display text-lg font-semibold tracking-tight">{t('app.mode.title')}</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {MODE_OPTIONS.map((option) => {
          const selected = mode === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => setMode(option)}
              aria-pressed={selected}
              className="text-start"
            >
              <Card
                className={cn(
                  'transition-colors hover:border-accent/50',
                  selected && 'border-accent bg-accent/5 ring-2 ring-accent/30',
                )}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{t(MODE_LABEL_KEYS[option])}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {t(`app.mode.${option}Description`)}
                  </p>
                </CardContent>
              </Card>
            </button>
          );
        })}
      </div>
    </section>
  );
}
