'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

type City = {
  name: string;
  lat: number;
  lon: number;
};

type ProjectedCity = City & {
  x: number;
  y: number;
  z: number;
  visible: boolean;
};

const CITIES: City[] = [
  { name: 'Istanbul', lat: 41.0082, lon: 28.9784 },
  { name: 'New York', lat: 40.7128, lon: -74.006 },
  { name: 'Berlin', lat: 52.52, lon: 13.405 },
  { name: 'Paris', lat: 48.8566, lon: 2.3522 },
  { name: 'Bishkek', lat: 42.8746, lon: 74.5698 },
  { name: 'London', lat: 51.5074, lon: -0.1278 },
];

/** Demo route arcs between city pairs (indices into CITIES). */
const ROUTE_PAIRS: [number, number][] = [
  [0, 1],
  [2, 3],
  [0, 2],
  [4, 0],
  [5, 3],
  [1, 5],
];

const MIN_ZOOM = 0.75;
const MAX_ZOOM = 1.45;

/** Shadcn stores --primary as "H S% L%" channels; canvas needs hsl(H S% L% / alpha). */
function hslChannel(channel: string, alpha: number): string {
  return `hsl(${channel} / ${alpha})`;
}

function projectCity(
  city: City,
  rotationDeg: number,
  radius: number,
  cx: number,
  cy: number,
): ProjectedCity {
  const phi = (city.lat * Math.PI) / 180;
  const lambda = ((city.lon + rotationDeg) * Math.PI) / 180;
  const x3 = Math.cos(phi) * Math.sin(lambda);
  const y3 = -Math.sin(phi);
  const z3 = Math.cos(phi) * Math.cos(lambda);

  return {
    ...city,
    x: cx + x3 * radius,
    y: cy + y3 * radius,
    z: z3,
    visible: z3 > -0.08,
  };
}

function drawGlobeGrid(
  ctx: CanvasRenderingContext2D,
  rotationDeg: number,
  radius: number,
  cx: number,
  cy: number,
  stroke: string,
) {
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 0.6;

  for (let lat = -60; lat <= 60; lat += 30) {
    ctx.beginPath();
    let started = false;
    for (let lon = -180; lon <= 180; lon += 6) {
      const p = projectCity({ name: '', lat, lon }, rotationDeg, radius, cx, cy);
      if (!p.visible) {
        started = false;
        continue;
      }
      if (!started) {
        ctx.moveTo(p.x, p.y);
        started = true;
      } else {
        ctx.lineTo(p.x, p.y);
      }
    }
    ctx.stroke();
  }

  for (let lon = -180; lon < 180; lon += 30) {
    ctx.beginPath();
    let started = false;
    for (let lat = -90; lat <= 90; lat += 6) {
      const p = projectCity({ name: '', lat, lon }, rotationDeg, radius, cx, cy);
      if (!p.visible) {
        started = false;
        continue;
      }
      if (!started) {
        ctx.moveTo(p.x, p.y);
        started = true;
      } else {
        ctx.lineTo(p.x, p.y);
      }
    }
    ctx.stroke();
  }
}

function drawRouteArc(
  ctx: CanvasRenderingContext2D,
  from: ProjectedCity,
  to: ProjectedCity,
  accent: string,
  phase: number,
) {
  if (!from.visible || !to.visible) {
    return;
  }

  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2 - Math.hypot(to.x - from.x, to.y - from.y) * 0.22;
  const gradient = ctx.createLinearGradient(from.x, from.y, to.x, to.y);
  gradient.addColorStop(0, accent.replace(/\/ [\d.]+\)$/, ' / 0.15)'));
  gradient.addColorStop(0.5, accent);
  gradient.addColorStop(1, accent.replace(/\/ [\d.]+\)$/, ' / 0.2)'));

  ctx.strokeStyle = gradient;
  ctx.lineWidth = 1.4;
  ctx.setLineDash([5, 7]);
  ctx.lineDashOffset = -phase * 24;
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.quadraticCurveTo(midX, midY, to.x, to.y);
  ctx.stroke();
  ctx.setLineDash([]);
}

type InteractiveRouteGlobeProps = {
  className?: string;
};

export function InteractiveRouteGlobe({ className }: InteractiveRouteGlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rotationRef = useRef(-18);
  const zoomRef = useRef(1);
  const draggingRef = useRef(false);
  const lastPointerRef = useRef({ x: 0, y: 0 });
  const autoRotateRef = useRef(true);
  const reducedMotionRef = useRef(false);
  const frameRef = useRef<number | null>(null);
  const phaseRef = useRef(0);
  const [isDragging, setIsDragging] = useState(false);

  const paint = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) {
      return;
    }

    const rect = container.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.floor(rect.width));
    const height = Math.max(1, Math.floor(rect.height));

    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const styles = getComputedStyle(container);
    const primary = styles.getPropertyValue('--primary').trim() || '222 47% 55%';
    const accent = styles.getPropertyValue('--accent').trim() || '174 58% 45%';
    const border = styles.getPropertyValue('--border').trim() || '220 14% 80%';
    const card = styles.getPropertyValue('--card').trim() || '0 0% 100%';

    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(width, height) * 0.34 * zoomRef.current;

    const globeGradient = ctx.createRadialGradient(
      cx - radius * 0.25,
      cy - radius * 0.25,
      radius * 0.15,
      cx,
      cy,
      radius,
    );
    globeGradient.addColorStop(0, hslChannel(primary, 0.35));
    globeGradient.addColorStop(0.55, hslChannel(primary, 0.14));
    globeGradient.addColorStop(1, hslChannel(card, 0.04));

    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = globeGradient;
    ctx.fill();

    ctx.strokeStyle = hslChannel(border, 0.55);
    ctx.lineWidth = 1.4;
    ctx.stroke();

    drawGlobeGrid(ctx, rotationRef.current, radius, cx, cy, hslChannel(border, 0.4));

    const projected = CITIES.map((city) => projectCity(city, rotationRef.current, radius, cx, cy));

    const accentStroke = hslChannel(accent, 0.85);
    for (const [fromIdx, toIdx] of ROUTE_PAIRS) {
      const from = projected[fromIdx];
      const to = projected[toIdx];
      if (!from || !to) {
        continue;
      }
      drawRouteArc(ctx, from, to, accentStroke, phaseRef.current);
    }

    for (const city of projected) {
      if (!city.visible) {
        continue;
      }

      const glow = ctx.createRadialGradient(city.x, city.y, 0, city.x, city.y, 10);
      glow.addColorStop(0, hslChannel(accent, 0.35 + city.z * 0.35));
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(city.x, city.y, 10, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = hslChannel(accent, 0.65 + city.z * 0.35);
      ctx.beginPath();
      ctx.arc(city.x, city.y, 3 + city.z * 1.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = '500 11px system-ui, sans-serif';
      ctx.fillStyle = hslChannel(primary, 0.55 + city.z * 0.4);
      ctx.textAlign = 'center';
      ctx.fillText(city.name, city.x, city.y - 12);
    }

    if (!reducedMotionRef.current && autoRotateRef.current && !draggingRef.current) {
      rotationRef.current += 0.04;
      phaseRef.current += 0.012;
    }
  }, []);

  useEffect(() => {
    reducedMotionRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const loop = () => {
      paint();
      frameRef.current = window.requestAnimationFrame(loop);
    };
    frameRef.current = window.requestAnimationFrame(loop);

    const observer = new ResizeObserver(() => {
      paint();
    });
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
      observer.disconnect();
    };
  }, [paint]);

  const onPointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    draggingRef.current = true;
    setIsDragging(true);
    autoRotateRef.current = false;
    lastPointerRef.current = { x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!draggingRef.current) {
      return;
    }
    const dx = event.clientX - lastPointerRef.current.x;
    lastPointerRef.current = { x: event.clientX, y: event.clientY };
    rotationRef.current += dx * 0.35;
  };

  const onPointerUp = (event: React.PointerEvent<HTMLCanvasElement>) => {
    draggingRef.current = false;
    setIsDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    window.setTimeout(() => {
      autoRotateRef.current = true;
    }, 1800);
  };

  const onWheel = (event: React.WheelEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const delta = event.deltaY > 0 ? -0.06 : 0.06;
    zoomRef.current = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoomRef.current + delta));
  };

  return (
    <div
      ref={containerRef}
      className={cn('pointer-events-auto absolute inset-0 z-[1] overflow-hidden', className)}
      aria-hidden
    >
      <canvas
        ref={canvasRef}
        className={cn(
          'h-full w-full touch-none select-none',
          isDragging ? 'cursor-grabbing' : 'cursor-grab',
        )}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onWheel={onWheel}
      />
      <p className="sr-only">
        Interactive route globe showing Istanbul, New York, Berlin, Paris, Bishkek, and London. Drag
        to rotate; scroll or pinch to zoom.
      </p>
    </div>
  );
}
