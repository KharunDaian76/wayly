/** Premium hero backdrop — CSS/SVG only, no canvas. */
export function LandingHeroBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="wayly-landing-hero-grid absolute inset-0 opacity-80" />
      <div className="wayly-landing-glow-blob absolute -left-24 top-16 h-72 w-72 rounded-full bg-primary/25 blur-3xl" />
      <div className="wayly-landing-glow-blob absolute -right-16 top-32 h-64 w-64 rounded-full bg-accent/20 blur-3xl wayly-landing-float-delay-1" />
      <div className="wayly-landing-glow-blob absolute bottom-8 left-1/3 h-48 w-48 rounded-full bg-info/15 blur-3xl wayly-landing-float-delay-2" />

      <svg
        className="absolute inset-0 h-full w-full opacity-40 dark:opacity-55"
        viewBox="0 0 1200 600"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M80 420 C 280 120, 520 480, 720 220 S 980 80, 1120 300"
          stroke="url(#routeGrad1)"
          strokeWidth="1.5"
          strokeDasharray="6 10"
          className="wayly-landing-route-dot"
        />
        <path
          d="M40 320 C 220 520, 460 180, 680 380 S 920 520, 1160 160"
          stroke="url(#routeGrad2)"
          strokeWidth="1"
          strokeDasharray="4 12"
          opacity="0.7"
        />
        <circle
          cx="720"
          cy="220"
          r="4"
          fill="hsl(var(--accent))"
          className="wayly-landing-route-dot"
        />
        <circle
          cx="280"
          cy="180"
          r="3"
          fill="hsl(var(--primary))"
          className="wayly-landing-route-dot wayly-landing-float-delay-1"
        />
        <circle
          cx="980"
          cy="120"
          r="3"
          fill="hsl(var(--success))"
          className="wayly-landing-route-dot wayly-landing-float-delay-2"
        />
        <defs>
          <linearGradient id="routeGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
            <stop offset="50%" stopColor="hsl(var(--accent))" stopOpacity="0.9" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
          </linearGradient>
          <linearGradient id="routeGrad2" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--info))" stopOpacity="0.3" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.6" />
          </linearGradient>
        </defs>
      </svg>

      <div className="wayly-landing-float absolute left-[8%] top-[22%] hidden rounded-full border border-border/60 bg-card/70 px-3 py-1.5 text-[11px] font-medium text-muted-foreground shadow-glow backdrop-blur sm:inline-flex">
        Istanbul
      </div>
      <div className="wayly-landing-float wayly-landing-float-delay-1 absolute right-[10%] top-[28%] hidden rounded-full border border-border/60 bg-card/70 px-3 py-1.5 text-[11px] font-medium text-muted-foreground shadow-glow backdrop-blur sm:inline-flex">
        Berlin
      </div>
      <div className="wayly-landing-float wayly-landing-float-delay-2 absolute bottom-[30%] left-[18%] hidden rounded-full border border-border/60 bg-card/70 px-3 py-1.5 text-[11px] font-medium text-muted-foreground shadow-glow backdrop-blur md:inline-flex">
        <span className="mr-1.5 size-1.5 rounded-full bg-accent" />
        Route active
      </div>
      <div className="wayly-landing-float absolute bottom-[24%] right-[14%] hidden rounded-full border border-border/60 bg-card/70 px-3 py-1.5 text-[11px] font-medium text-muted-foreground shadow-glow backdrop-blur lg:inline-flex">
        <span className="mr-1.5 size-1.5 rounded-full bg-success" />
        Local handoff
      </div>
    </div>
  );
}
