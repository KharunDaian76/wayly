'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

type City = {
  name: string;
  lat: number;
  lon: number;
  label?: boolean;
};

type Vec3 = { x: number; y: number; z: number };

type Projected = {
  x: number;
  y: number;
  z: number;
  visible: boolean;
};

type LandMass = {
  points: [number, number][];
  color: string;
};

const CITIES: City[] = [
  { name: 'Bishkek', lat: 42.8746, lon: 74.5698, label: true },
  { name: 'Istanbul', lat: 41.0082, lon: 28.9784, label: true },
  { name: 'New York', lat: 40.7128, lon: -74.006, label: true },
  { name: 'London', lat: 51.5074, lon: -0.1278, label: true },
  { name: 'Paris', lat: 48.8566, lon: 2.3522, label: true },
  { name: 'Berlin', lat: 52.52, lon: 13.405, label: true },
  { name: 'Amsterdam', lat: 52.3676, lon: 4.9041 },
  { name: 'Almaty', lat: 43.222, lon: 76.8512 },
  { name: 'Dubai', lat: 25.2048, lon: 55.2708, label: true },
  { name: 'Tokyo', lat: 35.6762, lon: 139.6503, label: true },
  { name: 'Seoul', lat: 37.5665, lon: 126.978 },
  { name: 'Singapore', lat: 1.3521, lon: 103.8198 },
  { name: 'Madrid', lat: 40.4168, lon: -3.7038 },
  { name: 'Rome', lat: 41.9028, lon: 12.4964 },
  { name: 'Warsaw', lat: 52.2297, lon: 21.0122 },
  { name: 'Tashkent', lat: 41.2995, lon: 69.2401 },
  { name: 'Los Angeles', lat: 34.0522, lon: -118.2437 },
  { name: 'Toronto', lat: 43.6532, lon: -79.3832 },
  { name: 'Doha', lat: 25.2854, lon: 51.531 },
  { name: 'Bangkok', lat: 13.7563, lon: 100.5018 },
];

const CITY_INDEX = new Map(CITIES.map((city, index) => [city.name, index]));

const ROUTES: [string, string][] = [
  ['Bishkek', 'Istanbul'],
  ['Istanbul', 'New York'],
  ['Berlin', 'Paris'],
  ['Paris', 'London'],
  ['Amsterdam', 'London'],
  ['Almaty', 'Bishkek'],
  ['Dubai', 'London'],
  ['Tokyo', 'Singapore'],
  ['Seoul', 'Tokyo'],
  ['Madrid', 'Rome'],
  ['Doha', 'New York'],
  ['Los Angeles', 'Toronto'],
];

/** Simplified original continent silhouettes — lat/lon polygons, not map tiles. */
const LAND_MASSES: LandMass[] = [
  {
    color: 'land-a',
    points: [
      [72, -168],
      [60, -145],
      [55, -130],
      [49, -125],
      [38, -122],
      [32, -117],
      [25, -110],
      [18, -105],
      [15, -92],
      [10, -85],
      [8, -77],
      [12, -72],
      [25, -80],
      [30, -88],
      [45, -75],
      [50, -58],
      [47, -53],
      [60, -65],
      [70, -95],
      [75, -140],
    ],
  },
  {
    color: 'land-b',
    points: [
      [12, -82],
      [5, -77],
      [-5, -75],
      [-15, -75],
      [-25, -65],
      [-35, -58],
      [-50, -68],
      [-55, -72],
      [-45, -65],
      [-20, -45],
      [-5, -35],
      [5, -52],
      [10, -62],
    ],
  },
  {
    color: 'land-c',
    points: [
      [36, -10],
      [43, -9],
      [50, 0],
      [55, 8],
      [58, 22],
      [62, 28],
      [70, 28],
      [72, 55],
      [65, 75],
      [55, 85],
      [45, 95],
      [35, 100],
      [20, 105],
      [5, 100],
      [-5, 95],
      [-15, 85],
      [-35, 75],
      [-35, 55],
      [-25, 45],
      [-10, 40],
      [5, 35],
      [15, 20],
      [25, 10],
      [32, -5],
    ],
  },
  {
    color: 'land-d',
    points: [
      [72, -25],
      [68, -10],
      [60, 5],
      [55, 15],
      [50, 25],
      [45, 38],
      [42, 28],
      [38, 22],
      [35, 32],
      [30, 32],
      [22, 38],
      [12, 44],
      [5, 50],
      [-5, 40],
      [-15, 12],
      [-25, 15],
      [-35, 18],
      [-35, 28],
      [-20, 35],
      [0, 42],
      [15, 52],
      [30, 60],
      [45, 68],
      [55, 75],
      [62, 85],
      [68, 95],
      [75, 110],
      [70, 140],
      [65, 160],
      [55, 175],
      [45, 170],
      [35, 140],
      [25, 120],
      [15, 100],
      [10, 80],
      [15, 60],
      [25, 45],
      [35, 30],
      [50, 20],
      [60, 10],
      [65, -5],
    ],
  },
  {
    color: 'land-e',
    points: [
      [-12, 130],
      [-18, 122],
      [-25, 115],
      [-32, 115],
      [-38, 145],
      [-35, 150],
      [-28, 153],
      [-20, 148],
      [-15, 135],
    ],
  },
  {
    color: 'land-f',
    points: [
      [75, -55],
      [70, -45],
      [65, -40],
      [60, -45],
      [55, -60],
      [60, -75],
      [68, -85],
    ],
  },
];

const MIN_ZOOM = 0.88;
const MAX_ZOOM = 1.28;
const AUTO_ROTATE_SPEED = 0.018;
const TILT_LIMIT = 0.55;

/** Deterministic star positions for starfield (no external assets). */
const STARS = Array.from({ length: 120 }, (_, index) => ({
  x: ((index * 73) % 100) / 100,
  y: ((index * 41) % 100) / 100,
  size: 0.4 + (index % 5) * 0.25,
  alpha: 0.15 + (index % 7) * 0.08,
}));

function degToRad(value: number): number {
  return (value * Math.PI) / 180;
}

function hslAlpha(channel: string, alpha: number): string {
  return `hsl(${channel} / ${alpha})`;
}

function latLonToUnit(lat: number, lon: number): Vec3 {
  const phi = degToRad(lat);
  const lambda = degToRad(lon);
  return {
    x: Math.cos(phi) * Math.sin(lambda),
    y: -Math.sin(phi),
    z: Math.cos(phi) * Math.cos(lambda),
  };
}

function rotateY(v: Vec3, angle: number): Vec3 {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return { x: v.x * c + v.z * s, y: v.y, z: -v.x * s + v.z * c };
}

function rotateX(v: Vec3, angle: number): Vec3 {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return { x: v.x, y: v.y * c - v.z * s, z: v.y * s + v.z * c };
}

function projectUnit(
  v: Vec3,
  radius: number,
  cx: number,
  cy: number,
  rotY: number,
  rotX: number,
): Projected {
  let p = rotateY(v, rotY);
  p = rotateX(p, rotX);
  return {
    x: cx + p.x * radius,
    y: cy + p.y * radius,
    z: p.z,
    visible: p.z > -0.06,
  };
}

function projectLatLon(
  lat: number,
  lon: number,
  radius: number,
  cx: number,
  cy: number,
  rotY: number,
  rotX: number,
): Projected {
  return projectUnit(latLonToUnit(lat, lon), radius, cx, cy, rotY, rotX);
}

function slerpLatLon(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  t: number,
): [number, number] {
  const a = latLonToUnit(lat1, lon1);
  const b = latLonToUnit(lat2, lon2);
  const dot = Math.max(-1, Math.min(1, a.x * b.x + a.y * b.y + a.z * b.z));
  const omega = Math.acos(dot);
  if (omega < 0.0001) {
    return [lat1, lon1];
  }
  const sinOmega = Math.sin(omega);
  const w1 = Math.sin((1 - t) * omega) / sinOmega;
  const w2 = Math.sin(t * omega) / sinOmega;
  const x = w1 * a.x + w2 * b.x;
  const y = w1 * a.y + w2 * b.y;
  const z = w1 * a.z + w2 * b.z;
  const lat = (-Math.asin(y) * 180) / Math.PI;
  const lon = (Math.atan2(x, z) * 180) / Math.PI;
  return [lat, lon];
}

function drawStarfield(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  isDark: boolean,
) {
  const base = isDark ? '220 40% 98%' : '240 20% 30%';
  for (const star of STARS) {
    ctx.fillStyle = hslAlpha(base, isDark ? star.alpha : star.alpha * 0.45);
    ctx.beginPath();
    ctx.arc(star.x * width, star.y * height, star.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawVignette(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  isDark: boolean,
) {
  const vignette = ctx.createRadialGradient(
    width / 2,
    height / 2,
    Math.min(width, height) * 0.2,
    width / 2,
    height / 2,
    Math.max(width, height) * 0.72,
  );
  vignette.addColorStop(0, isDark ? 'rgba(0,0,0,0)' : 'rgba(255,255,255,0)');
  vignette.addColorStop(1, isDark ? 'rgba(0,0,0,0.45)' : 'rgba(240,242,248,0.35)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, width, height);
}

function drawOceanSphere(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  isDark: boolean,
) {
  const ocean = ctx.createRadialGradient(
    cx - radius * 0.35,
    cy - radius * 0.38,
    radius * 0.08,
    cx + radius * 0.08,
    cy + radius * 0.12,
    radius * 1.05,
  );
  if (isDark) {
    ocean.addColorStop(0, 'hsl(210 55% 42% / 0.95)');
    ocean.addColorStop(0.45, 'hsl(218 62% 22% / 0.98)');
    ocean.addColorStop(0.85, 'hsl(228 70% 10% / 1)');
    ocean.addColorStop(1, 'hsl(235 75% 6% / 1)');
  } else {
    ocean.addColorStop(0, 'hsl(205 70% 55% / 0.92)');
    ocean.addColorStop(0.5, 'hsl(215 65% 38% / 0.96)');
    ocean.addColorStop(1, 'hsl(225 60% 22% / 1)');
  }

  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fillStyle = ocean;
  ctx.fill();
}

function drawLandMasses(
  ctx: CanvasRenderingContext2D,
  radius: number,
  cx: number,
  cy: number,
  rotY: number,
  rotX: number,
  isDark: boolean,
) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.995, 0, Math.PI * 2);
  ctx.clip();

  for (const mass of LAND_MASSES) {
    const projected = mass.points.map(([lat, lon]) =>
      projectLatLon(lat, lon, radius, cx, cy, rotY, rotX),
    );
    const avgZ = projected.reduce((sum, point) => sum + point.z, 0) / projected.length;
    if (avgZ < -0.15) {
      continue;
    }

    ctx.beginPath();
    let started = false;
    for (const point of projected) {
      if (!point.visible) {
        started = false;
        continue;
      }
      if (!started) {
        ctx.moveTo(point.x, point.y);
        started = true;
      } else {
        ctx.lineTo(point.x, point.y);
      }
    }
    ctx.closePath();

    const landLight = isDark ? 0.42 + avgZ * 0.25 : 0.5 + avgZ * 0.2;
    ctx.fillStyle = hslAlpha(isDark ? '152 38% 38%' : '148 35% 42%', landLight);
    ctx.fill();
  }

  ctx.restore();
}

function drawCloudTexture(
  ctx: CanvasRenderingContext2D,
  radius: number,
  cx: number,
  cy: number,
  rotY: number,
  rotX: number,
  isDark: boolean,
) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.99, 0, Math.PI * 2);
  ctx.clip();

  for (let index = 0; index < 28; index += 1) {
    const lat = -40 + ((index * 17) % 80);
    const lon = -180 + ((index * 43) % 360);
    const point = projectLatLon(lat, lon, radius * 1.01, cx, cy, rotY, rotX);
    if (!point.visible || point.z < 0.1) {
      continue;
    }
    ctx.fillStyle = hslAlpha('210 30% 96%', isDark ? 0.04 + point.z * 0.05 : 0.08 + point.z * 0.06);
    ctx.beginPath();
    ctx.arc(point.x, point.y, 2 + (index % 4), 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawLatLonGrid(
  ctx: CanvasRenderingContext2D,
  radius: number,
  cx: number,
  cy: number,
  rotY: number,
  rotX: number,
  stroke: string,
) {
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 0.55;

  for (let lat = -60; lat <= 60; lat += 30) {
    ctx.beginPath();
    let started = false;
    for (let lon = -180; lon <= 180; lon += 4) {
      const point = projectLatLon(lat, lon, radius, cx, cy, rotY, rotX);
      if (!point.visible) {
        started = false;
        continue;
      }
      if (!started) {
        ctx.moveTo(point.x, point.y);
        started = true;
      } else {
        ctx.lineTo(point.x, point.y);
      }
    }
    ctx.stroke();
  }

  for (let lon = -180; lon < 180; lon += 30) {
    ctx.beginPath();
    let started = false;
    for (let lat = -90; lat <= 90; lat += 4) {
      const point = projectLatLon(lat, lon, radius, cx, cy, rotY, rotX);
      if (!point.visible) {
        started = false;
        continue;
      }
      if (!started) {
        ctx.moveTo(point.x, point.y);
        started = true;
      } else {
        ctx.lineTo(point.x, point.y);
      }
    }
    ctx.stroke();
  }
}

function drawAtmosphere(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  accent: string,
  isDark: boolean,
) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.clip();

  const rim = ctx.createRadialGradient(cx, cy, radius * 0.82, cx, cy, radius * 1.08);
  rim.addColorStop(0, 'rgba(0,0,0,0)');
  rim.addColorStop(0.72, hslAlpha(accent, isDark ? 0.08 : 0.12));
  rim.addColorStop(1, hslAlpha(accent, isDark ? 0.35 : 0.22));
  ctx.fillStyle = rim;
  ctx.fillRect(cx - radius * 1.2, cy - radius * 1.2, radius * 2.4, radius * 2.4);
  ctx.restore();

  ctx.strokeStyle = hslAlpha(accent, isDark ? 0.25 : 0.18);
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();
}

function drawRouteArc(
  ctx: CanvasRenderingContext2D,
  from: City,
  to: City,
  radius: number,
  cx: number,
  cy: number,
  rotY: number,
  rotX: number,
  accent: string,
  phase: number,
  animate: boolean,
) {
  const samples: Projected[] = [];
  for (let step = 0; step <= 24; step += 1) {
    const t = step / 24;
    const [lat, lon] = slerpLatLon(from.lat, from.lon, to.lat, to.lon, t);
    samples.push(projectLatLon(lat, lon, radius, cx, cy, rotY, rotX));
  }

  const visibleSamples = samples.filter((point) => point.visible && point.z > 0.05);
  if (visibleSamples.length < 2) {
    return;
  }

  const avgZ = visibleSamples.reduce((sum, point) => sum + point.z, 0) / visibleSamples.length;
  const alpha = 0.2 + avgZ * 0.55;

  ctx.strokeStyle = hslAlpha(accent, alpha);
  ctx.lineWidth = 1.2 + avgZ * 0.8;
  ctx.setLineDash(animate ? [6, 10] : []);
  ctx.lineDashOffset = animate ? -phase * 28 : 0;
  ctx.beginPath();
  visibleSamples.forEach((point, index) => {
    const lift = 1 + (1 - Math.abs(index / 24 - 0.5) * 2) * 0.04;
    const px = cx + (point.x - cx) * lift;
    const py = cy + (point.y - cy) * lift;
    if (index === 0) {
      ctx.moveTo(px, py);
    } else {
      ctx.lineTo(px, py);
    }
  });
  ctx.stroke();
  ctx.setLineDash([]);

  if (animate && visibleSamples.length > 4) {
    const particleT = (phase * 0.35) % 1;
    const sampleIndex = Math.floor(particleT * (visibleSamples.length - 1));
    const particle = visibleSamples[sampleIndex];
    if (particle) {
      ctx.fillStyle = hslAlpha(accent, 0.75 + particle.z * 0.2);
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

type InteractiveRouteGlobeProps = {
  className?: string;
};

export function InteractiveRouteGlobe({ className }: InteractiveRouteGlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rotationYRef = useRef(degToRad(-24));
  const rotationXRef = useRef(degToRad(12));
  const zoomRef = useRef(1.05);
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

    const rootStyles = getComputedStyle(document.documentElement);
    const accent = rootStyles.getPropertyValue('--accent').trim() || '174 58% 45%';
    const isDark = document.documentElement.classList.contains('dark');

    drawStarfield(ctx, width, height, isDark);

    const cx = width / 2;
    const cy = height / 2;
    const baseRadius = Math.min(width, 680);
    const radius = (baseRadius * 0.52 + Math.min(width, height) * 0.08) * zoomRef.current;

    const rotY = rotationYRef.current;
    const rotX = rotationXRef.current;

    drawOceanSphere(ctx, cx, cy, radius, isDark);
    drawLandMasses(ctx, radius, cx, cy, rotY, rotX, isDark);
    drawCloudTexture(ctx, radius, cx, cy, rotY, rotX, isDark);
    drawLatLonGrid(
      ctx,
      radius,
      cx,
      cy,
      rotY,
      rotX,
      hslAlpha(isDark ? '210 40% 88%' : '220 30% 40%', isDark ? 0.12 : 0.18),
    );

    const projectedCities = CITIES.map((city) => ({
      city,
      point: projectLatLon(city.lat, city.lon, radius, cx, cy, rotY, rotX),
    }));

    const animateRoutes = !reducedMotionRef.current;
    for (const [fromName, toName] of ROUTES) {
      const from = CITIES[CITY_INDEX.get(fromName)!];
      const to = CITIES[CITY_INDEX.get(toName)!];
      if (!from || !to) {
        continue;
      }
      drawRouteArc(
        ctx,
        from,
        to,
        radius,
        cx,
        cy,
        rotY,
        rotX,
        accent,
        phaseRef.current,
        animateRoutes,
      );
    }

    for (const { city, point } of projectedCities) {
      if (!point.visible || point.z < 0.08) {
        continue;
      }

      const glow = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, 14);
      glow.addColorStop(0, hslAlpha(accent, 0.35 + point.z * 0.35));
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(point.x, point.y, 12, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = hslAlpha(accent, 0.7 + point.z * 0.25);
      ctx.beginPath();
      ctx.arc(point.x, point.y, 2.4 + point.z * 1.4, 0, Math.PI * 2);
      ctx.fill();

      if (city.label) {
        ctx.font = '600 11px system-ui, sans-serif';
        ctx.fillStyle = hslAlpha(isDark ? '210 40% 96%' : '228 35% 18%', 0.55 + point.z * 0.4);
        ctx.textAlign = 'center';
        ctx.fillText(city.name, point.x, point.y - 14);
      }
    }

    drawAtmosphere(ctx, cx, cy, radius, accent, isDark);
    drawVignette(ctx, width, height, isDark);

    if (!reducedMotionRef.current && autoRotateRef.current && !draggingRef.current) {
      rotationYRef.current += AUTO_ROTATE_SPEED;
      phaseRef.current += 0.014;
    }
  }, []);

  useEffect(() => {
    reducedMotionRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onMotionChange = (event: MediaQueryListEvent) => {
      reducedMotionRef.current = event.matches;
    };
    motionQuery.addEventListener('change', onMotionChange);

    const loop = () => {
      paint();
      frameRef.current = window.requestAnimationFrame(loop);
    };
    frameRef.current = window.requestAnimationFrame(loop);

    const observer = new ResizeObserver(() => {
      paint();
    });
    const container = containerRef.current;
    if (container) {
      observer.observe(container);
    }

    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
      observer.disconnect();
      motionQuery.removeEventListener('change', onMotionChange);
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
    const dy = event.clientY - lastPointerRef.current.y;
    lastPointerRef.current = { x: event.clientX, y: event.clientY };
    rotationYRef.current += dx * 0.006;
    rotationXRef.current = Math.max(
      -TILT_LIMIT,
      Math.min(TILT_LIMIT, rotationXRef.current + dy * 0.004),
    );
  };

  const onPointerUp = (event: React.PointerEvent<HTMLCanvasElement>) => {
    draggingRef.current = false;
    setIsDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    window.setTimeout(() => {
      autoRotateRef.current = true;
    }, 2200);
  };

  const onWheel = (event: React.WheelEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const delta = event.deltaY > 0 ? -0.04 : 0.04;
    zoomRef.current = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoomRef.current + delta));
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        'pointer-events-auto absolute inset-0 z-[1] flex items-center justify-center overflow-hidden',
        className,
      )}
    >
      <canvas
        ref={canvasRef}
        className={cn(
          'h-full w-full max-h-[820px] max-w-[820px] touch-none select-none',
          isDragging ? 'cursor-grabbing' : 'cursor-grab',
        )}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onWheel={onWheel}
      />
      <p className="sr-only">
        Interactive 3D-style Earth globe with global delivery routes. Drag to rotate, scroll to
        zoom.
      </p>
    </div>
  );
}
