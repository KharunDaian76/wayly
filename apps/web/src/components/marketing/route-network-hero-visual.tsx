'use client';

import {
  CheckCircle2,
  MapPin,
  MessageSquare,
  Package,
  Plane,
  Shield,
  Star,
  Ticket,
} from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { TranslationKey } from '@/lib/i18n/dictionaries';
import { useI18n } from '@/lib/i18n/i18n-context';
import { cn } from '@/lib/utils';

type CityNode = {
  id: string;
  x: number;
  y: number;
  labelKey: TranslationKey;
};

type RouteEdge = {
  id: string;
  from: string;
  to: string;
  path: string;
  labelKey?: TranslationKey;
  duration: number;
  delay: number;
};

const CITIES: CityNode[] = [
  { id: 'nyc', x: 165, y: 318, labelKey: 'marketing.landing.routeNetwork.cityNewYork' },
  { id: 'lon', x: 505, y: 238, labelKey: 'marketing.landing.routeNetwork.cityLondon' },
  { id: 'par', x: 528, y: 278, labelKey: 'marketing.landing.routeNetwork.cityParis' },
  { id: 'ber', x: 568, y: 218, labelKey: 'marketing.landing.routeNetwork.cityBerlin' },
  { id: 'ams', x: 538, y: 212, labelKey: 'marketing.landing.routeNetwork.cityAmsterdam' },
  { id: 'ist', x: 612, y: 308, labelKey: 'marketing.landing.routeNetwork.cityIstanbul' },
  { id: 'dxb', x: 688, y: 392, labelKey: 'marketing.landing.routeNetwork.cityDubai' },
  { id: 'bish', x: 768, y: 268, labelKey: 'marketing.landing.routeNetwork.cityBishkek' },
  { id: 'ala', x: 808, y: 288, labelKey: 'marketing.landing.routeNetwork.cityAlmaty' },
  { id: 'tyo', x: 1010, y: 298, labelKey: 'marketing.landing.routeNetwork.cityTokyo' },
];

const ROUTES: RouteEdge[] = [
  {
    id: 'par-lon',
    from: 'par',
    to: 'lon',
    path: 'M528,278 Q518,252 505,238',
    labelKey: 'marketing.landing.routeNetwork.routeParLon',
    duration: 5,
    delay: 0,
  },
  {
    id: 'ber-par',
    from: 'ber',
    to: 'par',
    path: 'M568,218 Q548,248 528,278',
    labelKey: 'marketing.landing.routeNetwork.routeBerPar',
    duration: 4.5,
    delay: 0.6,
  },
  {
    id: 'ams-lon',
    from: 'ams',
    to: 'lon',
    path: 'M538,212 Q522,222 505,238',
    duration: 4,
    delay: 1.2,
  },
  {
    id: 'ist-nyc',
    from: 'ist',
    to: 'nyc',
    path: 'M612,308 Q420,340 165,318',
    labelKey: 'marketing.landing.routeNetwork.routeIstNyc',
    duration: 7,
    delay: 0.3,
  },
  {
    id: 'bish-ist',
    from: 'bish',
    to: 'ist',
    path: 'M768,268 Q690,285 612,308',
    labelKey: 'marketing.landing.routeNetwork.routeBishIst',
    duration: 5.5,
    delay: 1.5,
  },
  {
    id: 'ala-bish',
    from: 'ala',
    to: 'bish',
    path: 'M808,288 Q788,278 768,268',
    duration: 3.5,
    delay: 2,
  },
  {
    id: 'dxb-lon',
    from: 'dxb',
    to: 'lon',
    path: 'M688,392 Q580,320 505,238',
    labelKey: 'marketing.landing.routeNetwork.routeDxbLon',
    duration: 6,
    delay: 0.9,
  },
  {
    id: 'tyo-dxb',
    from: 'tyo',
    to: 'dxb',
    path: 'M1010,298 Q860,350 688,392',
    duration: 6.5,
    delay: 1.8,
  },
  {
    id: 'nyc-lon',
    from: 'nyc',
    to: 'lon',
    path: 'M165,318 Q320,200 505,238',
    labelKey: 'marketing.landing.routeNetwork.routeNycLon',
    duration: 7.5,
    delay: 2.4,
  },
];

type FloatingCardConfig = {
  titleKey: TranslationKey;
  icon: typeof Package;
  tone: 'primary' | 'accent' | 'success' | 'info';
  className: string;
  hideBelow?: 'sm' | 'md' | 'lg';
  floatDelay: number;
};

const FLOATING_CARDS: FloatingCardConfig[] = [
  {
    titleKey: 'marketing.landing.routeNetwork.cardSenderRequest',
    icon: Package,
    tone: 'primary',
    className: 'left-[4%] top-[14%] sm:left-[6%] sm:top-[16%]',
    floatDelay: 0,
  },
  {
    titleKey: 'marketing.landing.routeNetwork.cardWaylerAvailability',
    icon: Plane,
    tone: 'accent',
    className: 'right-[4%] top-[12%] sm:right-[5%] sm:top-[14%]',
    floatDelay: 0.8,
  },
  {
    titleKey: 'marketing.landing.routeNetwork.cardLocalHandoff',
    icon: MapPin,
    tone: 'success',
    className: 'left-[2%] top-[42%] sm:left-[4%]',
    hideBelow: 'md',
    floatDelay: 1.2,
  },
  {
    titleKey: 'marketing.landing.routeNetwork.cardProofUploaded',
    icon: CheckCircle2,
    tone: 'info',
    className: 'right-[3%] top-[38%] sm:right-[4%]',
    hideBelow: 'md',
    floatDelay: 1.6,
  },
  {
    titleKey: 'marketing.landing.routeNetwork.cardSupportTicket',
    icon: Ticket,
    tone: 'primary',
    className: 'bottom-[28%] left-[6%]',
    hideBelow: 'lg',
    floatDelay: 2,
  },
  {
    titleKey: 'marketing.landing.routeNetwork.cardReviewReady',
    icon: Star,
    tone: 'accent',
    className: 'bottom-[24%] right-[5%]',
    hideBelow: 'lg',
    floatDelay: 2.4,
  },
];

const TONE_DOT: Record<FloatingCardConfig['tone'], string> = {
  primary: 'bg-primary',
  accent: 'bg-accent',
  success: 'bg-success',
  info: 'bg-info',
};

function FloatingCard({
  titleKey,
  icon: Icon,
  tone,
  className,
  hideBelow,
  floatDelay,
}: FloatingCardConfig) {
  const { t } = useI18n();
  const reduce = useReducedMotion();

  const hideClass =
    hideBelow === 'sm'
      ? 'hidden sm:flex'
      : hideBelow === 'md'
        ? 'hidden md:flex'
        : hideBelow === 'lg'
          ? 'hidden lg:flex'
          : 'flex';

  return (
    <motion.div
      className={cn(
        'wayly-route-network-card wayly-landing-glass pointer-events-none absolute z-[3] max-w-[200px] items-center gap-2 rounded-xl border border-border/50 px-3 py-2 text-left shadow-glow backdrop-blur-md',
        hideClass,
        className,
      )}
      initial={false}
      animate={reduce ? undefined : { y: [0, -7, 0] }}
      transition={{
        duration: 5.5 + floatDelay,
        repeat: Infinity,
        ease: 'easeInOut',
        delay: floatDelay,
      }}
    >
      <span
        className={cn(
          'inline-flex size-7 shrink-0 items-center justify-center rounded-lg bg-card/80 ring-1 ring-border/40',
        )}
      >
        <Icon
          className={cn(
            'size-3.5',
            tone === 'primary' && 'text-primary',
            tone === 'accent' && 'text-accent',
            tone === 'success' && 'text-success',
            tone === 'info' && 'text-info',
          )}
          aria-hidden
        />
      </span>
      <span className="min-w-0 flex-1 text-[10px] font-medium leading-snug text-foreground/90 sm:text-[11px]">
        {t(titleKey)}
      </span>
      <span className={cn('size-1.5 shrink-0 rounded-full', TONE_DOT[tone])} aria-hidden />
    </motion.div>
  );
}

function MarketplacePanel() {
  const { t } = useI18n();
  const reduce = useReducedMotion();

  return (
    <motion.div
      className="wayly-route-network-panel pointer-events-none absolute left-1/2 top-[22%] z-[2] w-[min(92vw,420px)] -translate-x-1/2 sm:top-[20%] sm:w-[min(88vw,480px)] lg:w-[520px]"
      initial={false}
      animate={reduce ? undefined : { y: [0, -4, 0] }}
      transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
    >
      <div className="wayly-landing-gradient-border rounded-2xl p-[1px]">
        <div className="wayly-landing-glass rounded-2xl px-4 py-3 sm:px-5 sm:py-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {t('marketing.landing.routeNetwork.panelTitle')}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-2 py-0.5 text-[9px] font-medium text-success">
              <span className="size-1.5 rounded-full bg-success wayly-landing-route-dot" />
              {t('marketing.landing.routeNetwork.panelRouteActive')}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <div className="rounded-lg border border-border/40 bg-background/40 px-2.5 py-2">
              <p className="text-lg font-bold tabular-nums text-foreground sm:text-xl">24</p>
              <p className="text-[9px] text-muted-foreground sm:text-[10px]">
                {t('marketing.landing.routeNetwork.panelRoutesAvailable')}
              </p>
            </div>
            <div className="rounded-lg border border-border/40 bg-background/40 px-2.5 py-2">
              <p className="text-lg font-bold tabular-nums text-foreground sm:text-xl">8</p>
              <p className="text-[9px] text-muted-foreground sm:text-[10px]">
                {t('marketing.landing.routeNetwork.panelLocalHandoffs')}
              </p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-primary/25 bg-primary/10 px-2 py-0.5 text-[9px] font-medium text-primary">
              {t('marketing.landing.routeNetwork.panelDemoPayment')}
            </span>
            <span className="inline-flex items-center gap-1 text-[9px] text-muted-foreground">
              <Shield className="size-3 shrink-0 text-accent" aria-hidden />
              {t('marketing.landing.routeNetwork.panelTrustNote')}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function RouteNetworkHeroVisual() {
  const { t } = useI18n();
  const reduce = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  const onMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (reduce) {
        return;
      }
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) {
        return;
      }
      const nx = (event.clientX - rect.left) / rect.width - 0.5;
      const ny = (event.clientY - rect.top) / rect.height - 0.5;
      setParallax({ x: nx * 12, y: ny * 8 });
    },
    [reduce],
  );

  const onMouseLeave = useCallback(() => {
    setParallax({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    if (reduce) {
      setParallax({ x: 0, y: 0 });
    }
  }, [reduce]);

  const cityById = new Map(CITIES.map((city) => [city.id, city]));

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      {/* Theme-aware premium gradient base */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-100 via-slate-50 to-background dark:from-[hsl(228_45%_6%)] dark:via-[hsl(232_42%_8%)] dark:to-[hsl(var(--background))]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_35%,hsl(var(--primary)/0.12),transparent_65%)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_35%,hsl(260_50%_22%/0.35),transparent_65%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_20%_60%,hsl(var(--accent)/0.08),transparent_55%)] dark:bg-[radial-gradient(ellipse_50%_40%_at_20%_60%,hsl(190_70%_35%/0.12),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_45%_35%_at_85%_45%,hsl(var(--success)/0.06),transparent_50%)] dark:bg-[radial-gradient(ellipse_45%_35%_at_85%_45%,hsl(155_45%_30%/0.1),transparent_50%)]" />

      {/* Grid layer */}
      <div className="wayly-route-network-grid absolute inset-0 opacity-50 dark:opacity-60" />

      {/* Glow blobs */}
      <div
        className="wayly-landing-glow-blob absolute -left-20 top-[10%] h-64 w-64 rounded-full bg-primary/15 blur-3xl dark:bg-[hsl(270_60%_45%/0.2)]"
        style={{ transform: `translate(${parallax.x * -0.5}px, ${parallax.y * -0.5}px)` }}
      />
      <div
        className="wayly-landing-glow-blob wayly-landing-float-delay-1 absolute -right-16 top-[18%] h-56 w-56 rounded-full bg-accent/15 blur-3xl dark:bg-[hsl(190_80%_45%/0.18)]"
        style={{ transform: `translate(${parallax.x * 0.4}px, ${parallax.y * 0.3}px)` }}
      />
      <div
        className="wayly-landing-glow-blob wayly-landing-float-delay-2 absolute bottom-[20%] left-1/4 h-48 w-48 rounded-full bg-success/10 blur-3xl dark:bg-[hsl(155_55%_38%/0.14)]"
        style={{ transform: `translate(${parallax.x * 0.3}px, ${parallax.y * -0.4}px)` }}
      />

      {/* Route network SVG */}
      <svg
        className="absolute inset-0 h-full w-full opacity-80 dark:opacity-90"
        viewBox="0 0 1200 520"
        preserveAspectRatio="xMidYMid slice"
        style={{ transform: `translate(${parallax.x * 0.15}px, ${parallax.y * 0.1}px)` }}
      >
        <defs>
          <linearGradient id="waylyRouteGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.15" />
            <stop offset="45%" stopColor="hsl(var(--accent))" stopOpacity="0.85" />
            <stop offset="100%" stopColor="hsl(190 70% 55%)" stopOpacity="0.35" />
          </linearGradient>
          <filter id="waylyNodeGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {ROUTES.map((route) => (
          <g key={route.id}>
            <path
              d={route.path}
              fill="none"
              stroke="url(#waylyRouteGrad)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeDasharray="6 10"
              className={reduce ? undefined : 'wayly-route-line-pulse'}
              opacity="0.75"
            />
            {!reduce ? (
              <circle r="2.5" fill="hsl(var(--accent))" opacity="0.9">
                <animateMotion
                  dur={`${route.duration}s`}
                  repeatCount="indefinite"
                  begin={`${route.delay}s`}
                  path={route.path}
                />
              </circle>
            ) : null}
          </g>
        ))}

        {CITIES.map((city) => (
          <g key={city.id} filter="url(#waylyNodeGlow)">
            <circle cx={city.x} cy={city.y} r="5" fill="hsl(var(--accent))" opacity="0.35" />
            <circle cx={city.x} cy={city.y} r="2.5" fill="hsl(var(--primary))" />
          </g>
        ))}
      </svg>

      {/* City label pills */}
      <div
        className="absolute inset-0"
        style={{ transform: `translate(${parallax.x * 0.12}px, ${parallax.y * 0.08}px)` }}
      >
        {CITIES.map((city) => (
          <span
            key={city.id}
            className="absolute hidden rounded-full border border-border/50 bg-card/70 px-2 py-0.5 text-[9px] font-medium text-foreground/80 backdrop-blur-sm sm:inline-block dark:text-muted-foreground"
            style={{
              left: `${(city.x / 1200) * 100}%`,
              top: `${(city.y / 520) * 100}%`,
              transform: 'translate(-50%, -130%)',
            }}
          >
            {t(city.labelKey)}
          </span>
        ))}
      </div>

      {/* Route label pills at midpoints */}
      <div className="absolute inset-0 hidden md:block">
        {ROUTES.filter((route) => route.labelKey).map((route) => {
          const from = cityById.get(route.from);
          const to = cityById.get(route.to);
          if (!from || !to) {
            return null;
          }
          const mx = ((from.x + to.x) / 2 / 1200) * 100;
          const my = ((from.y + to.y) / 2 / 520) * 100;
          return (
            <span
              key={`label-${route.id}`}
              className="absolute rounded-full border border-accent/25 bg-accent/10 px-2 py-0.5 text-[8px] font-semibold uppercase tracking-wide text-accent/90 backdrop-blur-sm"
              style={{
                left: `${mx}%`,
                top: `${my}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              {t(route.labelKey!)}
            </span>
          );
        })}
      </div>

      <MarketplacePanel />

      {FLOATING_CARDS.map((card) => (
        <FloatingCard key={card.titleKey} {...card} />
      ))}

      {/* Decorative chat bubble — subtle activity signal */}
      <motion.div
        className="wayly-landing-glass pointer-events-none absolute bottom-[18%] left-1/2 z-[3] hidden -translate-x-1/2 items-center gap-1.5 rounded-full border border-border/40 px-3 py-1.5 text-[10px] text-muted-foreground backdrop-blur md:flex"
        animate={reduce ? undefined : { opacity: [0.5, 0.85, 0.5] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <MessageSquare className="size-3 text-primary" aria-hidden />
        {t('marketing.landing.routeNetwork.panelRouteActive')}
      </motion.div>

      <p className="sr-only">{t('marketing.landing.routeNetwork.a11yDescription')}</p>
    </div>
  );
}
