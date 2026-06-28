'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { useI18n } from '@/lib/i18n/i18n-context';
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

/** Regional land silhouettes — lat/lon polygons wrapped on a sphere, not map tiles. */
const LAND_MASSES: LandMass[] = [
  {
    points: [
      [72, -168],
      [68, -155],
      [62, -145],
      [58, -138],
      [52, -130],
      [48, -125],
      [42, -124],
      [38, -122],
      [34, -118],
      [30, -115],
      [25, -110],
      [20, -105],
      [16, -98],
      [15, -92],
      [18, -88],
      [22, -82],
      [28, -82],
      [32, -87],
      [38, -90],
      [42, -82],
      [45, -75],
      [48, -68],
      [50, -62],
      [52, -58],
      [55, -62],
      [58, -68],
      [62, -75],
      [66, -85],
      [70, -100],
      [72, -120],
      [74, -145],
    ],
  },
  {
    points: [
      [22, -105],
      [18, -98],
      [14, -92],
      [10, -85],
      [8, -80],
      [10, -76],
      [14, -78],
      [18, -84],
      [20, -92],
    ],
  },
  {
    points: [
      [12, -82],
      [8, -78],
      [4, -77],
      [0, -78],
      [-5, -75],
      [-10, -72],
      [-15, -72],
      [-20, -70],
      [-25, -65],
      [-30, -62],
      [-35, -58],
      [-40, -62],
      [-45, -65],
      [-50, -68],
      [-52, -72],
      [-48, -74],
      [-42, -72],
      [-35, -68],
      [-28, -62],
      [-22, -55],
      [-15, -48],
      [-8, -42],
      [-2, -38],
      [2, -45],
      [5, -52],
      [8, -58],
      [10, -65],
      [12, -72],
    ],
  },
  {
    points: [
      [72, -28],
      [70, -18],
      [68, -12],
      [65, -8],
      [62, -5],
      [58, -2],
      [55, 2],
      [52, 5],
      [50, 8],
      [48, 12],
      [46, 8],
      [44, 2],
      [42, -2],
      [40, -5],
      [38, -8],
      [36, -5],
      [38, 2],
      [40, 8],
      [42, 12],
      [44, 18],
      [46, 22],
      [48, 28],
      [50, 32],
      [52, 28],
      [55, 22],
      [58, 18],
      [60, 12],
      [62, 8],
      [65, 5],
      [68, 2],
      [70, -5],
    ],
  },
  {
    points: [
      [37, -8],
      [35, -12],
      [32, -8],
      [28, -12],
      [22, -15],
      [18, -12],
      [12, -8],
      [8, -5],
      [5, 0],
      [2, 8],
      [0, 15],
      [-2, 22],
      [-5, 28],
      [-8, 32],
      [-12, 28],
      [-15, 18],
      [-18, 12],
      [-22, 8],
      [-28, 12],
      [-32, 18],
      [-34, 22],
      [-32, 28],
      [-28, 32],
      [-22, 35],
      [-15, 32],
      [-8, 28],
      [-2, 32],
      [2, 35],
      [5, 38],
      [8, 42],
      [12, 45],
      [15, 48],
      [18, 45],
      [22, 42],
      [25, 38],
      [28, 32],
      [32, 28],
      [35, 22],
      [36, 15],
      [37, 8],
    ],
  },
  {
    points: [
      [42, 28],
      [40, 32],
      [38, 38],
      [35, 42],
      [32, 45],
      [28, 48],
      [25, 52],
      [22, 55],
      [18, 58],
      [15, 55],
      [12, 50],
      [15, 45],
      [18, 42],
      [22, 38],
      [25, 35],
      [28, 32],
      [32, 28],
      [35, 25],
      [38, 22],
      [40, 25],
    ],
  },
  {
    points: [
      [55, 38],
      [52, 42],
      [50, 48],
      [48, 55],
      [45, 62],
      [42, 68],
      [40, 72],
      [38, 78],
      [35, 82],
      [32, 88],
      [28, 92],
      [25, 95],
      [22, 98],
      [18, 95],
      [15, 88],
      [12, 82],
      [15, 75],
      [18, 68],
      [22, 62],
      [25, 58],
      [28, 55],
      [32, 52],
      [35, 48],
      [38, 45],
      [42, 42],
      [45, 38],
      [48, 35],
      [52, 32],
      [55, 35],
    ],
  },
  {
    points: [
      [55, 95],
      [52, 102],
      [48, 108],
      [45, 115],
      [42, 122],
      [38, 128],
      [35, 135],
      [32, 138],
      [28, 135],
      [25, 128],
      [22, 122],
      [25, 115],
      [28, 108],
      [32, 102],
      [35, 98],
      [38, 95],
      [42, 92],
      [45, 88],
      [48, 85],
      [52, 88],
    ],
  },
  {
    points: [
      [45, 128],
      [42, 135],
      [38, 138],
      [35, 142],
      [32, 138],
      [35, 132],
      [38, 128],
      [42, 125],
    ],
  },
  {
    points: [
      [25, 95],
      [18, 98],
      [12, 102],
      [5, 105],
      [0, 108],
      [-5, 105],
      [-8, 110],
      [-5, 115],
      [0, 118],
      [5, 115],
      [10, 110],
      [15, 105],
      [20, 100],
    ],
  },
  {
    points: [
      [-12, 130],
      [-16, 125],
      [-20, 122],
      [-25, 115],
      [-30, 115],
      [-34, 122],
      [-36, 128],
      [-38, 138],
      [-36, 145],
      [-32, 148],
      [-28, 150],
      [-22, 148],
      [-18, 142],
      [-14, 135],
    ],
  },
  {
    points: [
      [76, -58],
      [74, -52],
      [72, -48],
      [70, -45],
      [68, -42],
      [66, -45],
      [68, -52],
      [72, -55],
    ],
  },
];

const MIN_ZOOM = 0.9;
const MAX_ZOOM = 1.22;
const AUTO_ROTATE_SPEED = 0.012;
const TILT_LIMIT = 0.48;
const MAX_VISIBLE_LABELS = 8;

/** Deterministic starfield — depth tiers, no external assets. */
const STARS = Array.from({ length: 200 }, (_, index) => ({
  x: ((index * 73 + 11) % 100) / 100,
  y: ((index * 41 + 29) % 100) / 100,
  size: index % 9 === 0 ? 1.1 : index % 4 === 0 ? 0.75 : 0.35 + (index % 3) * 0.15,
  alpha: index % 9 === 0 ? 0.55 : index % 5 === 0 ? 0.32 : 0.12 + (index % 6) * 0.04,
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

function computeGlobeMetrics(width: number, height: number, zoom: number) {
  const size = Math.min(width, height);
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(size * 0.42, 390) * zoom;
  return { size, cx, cy, radius };
}

function isInHeadlineZone(x: number, y: number, cx: number, cy: number, radius: number): boolean {
  const dx = (x - cx) / (radius * 0.52);
  const dy = (y - (cy - radius * 0.08)) / (radius * 0.38);
  return dx * dx + dy * dy < 1;
}

function drawStarfield(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  cx: number,
  cy: number,
  radius: number,
  isDark: boolean,
) {
  const base = isDark ? '220 40% 98%' : '240 20% 30%';
  for (const star of STARS) {
    const sx = star.x * width;
    const sy = star.y * height;
    if (isInHeadlineZone(sx, sy, cx, cy, radius)) {
      continue;
    }
    ctx.fillStyle = hslAlpha(base, isDark ? star.alpha : star.alpha * 0.4);
    ctx.beginPath();
    ctx.arc(sx, sy, star.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawVignette(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  cx: number,
  cy: number,
  isDark: boolean,
) {
  const vignette = ctx.createRadialGradient(
    cx,
    cy,
    Math.min(width, height) * 0.18,
    cx,
    cy,
    Math.max(width, height) * 0.62,
  );
  vignette.addColorStop(0, isDark ? 'rgba(0,0,0,0)' : 'rgba(255,255,255,0)');
  vignette.addColorStop(1, isDark ? 'rgba(0,0,0,0.35)' : 'rgba(240,242,248,0.28)');
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
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.clip();

  const ocean = ctx.createRadialGradient(
    cx - radius * 0.38,
    cy - radius * 0.42,
    radius * 0.05,
    cx + radius * 0.12,
    cy + radius * 0.18,
    radius * 1.08,
  );
  if (isDark) {
    ocean.addColorStop(0, 'hsl(205 62% 48% / 0.96)');
    ocean.addColorStop(0.35, 'hsl(215 68% 28% / 0.98)');
    ocean.addColorStop(0.72, 'hsl(225 72% 14% / 1)');
    ocean.addColorStop(1, 'hsl(232 78% 7% / 1)');
  } else {
    ocean.addColorStop(0, 'hsl(200 72% 58% / 0.94)');
    ocean.addColorStop(0.45, 'hsl(212 65% 40% / 0.96)');
    ocean.addColorStop(1, 'hsl(222 58% 20% / 1)');
  }

  ctx.fillStyle = ocean;
  ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);

  const night = ctx.createRadialGradient(
    cx + radius * 0.42,
    cy + radius * 0.38,
    radius * 0.08,
    cx - radius * 0.25,
    cy - radius * 0.15,
    radius * 1.05,
  );
  night.addColorStop(0, 'rgba(0,0,0,0)');
  night.addColorStop(0.5, isDark ? 'rgba(0,0,0,0.22)' : 'rgba(0,0,0,0.12)');
  night.addColorStop(1, isDark ? 'rgba(0,0,0,0.48)' : 'rgba(0,0,0,0.28)');
  ctx.fillStyle = night;
  ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);

  ctx.restore();
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
  ctx.arc(cx, cy, radius * 0.998, 0, Math.PI * 2);
  ctx.clip();

  for (const mass of LAND_MASSES) {
    const projected = mass.points.map(([lat, lon]) =>
      projectLatLon(lat, lon, radius, cx, cy, rotY, rotX),
    );
    const avgZ = projected.reduce((sum, point) => sum + point.z, 0) / projected.length;
    if (avgZ < -0.12) {
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

    const landFill = hslAlpha(isDark ? '158 32% 36%' : '150 28% 40%', 0.38 + avgZ * 0.32);
    ctx.fillStyle = landFill;
    ctx.fill();

    ctx.strokeStyle = hslAlpha(isDark ? '155 28% 22%' : '145 25% 28%', 0.35 + avgZ * 0.2);
    ctx.lineWidth = 0.6;
    ctx.stroke();
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

  for (let index = 0; index < 22; index += 1) {
    const lat = -35 + ((index * 19) % 70);
    const lon = -180 + ((index * 47) % 360);
    const point = projectLatLon(lat, lon, radius * 1.005, cx, cy, rotY, rotX);
    if (!point.visible || point.z < 0.12) {
      continue;
    }
    ctx.fillStyle = hslAlpha('210 30% 96%', isDark ? 0.03 + point.z * 0.04 : 0.06 + point.z * 0.05);
    ctx.beginPath();
    ctx.arc(point.x, point.y, 1.5 + (index % 3), 0, Math.PI * 2);
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
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.998, 0, Math.PI * 2);
  ctx.clip();

  ctx.strokeStyle = stroke;
  ctx.lineWidth = 0.45;

  for (let lat = -60; lat <= 60; lat += 30) {
    ctx.beginPath();
    let started = false;
    for (let lon = -180; lon <= 180; lon += 5) {
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
    for (let lat = -90; lat <= 90; lat += 5) {
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

  ctx.restore();
}

function drawAtmosphereHalo(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  accent: string,
  isDark: boolean,
) {
  const halo = ctx.createRadialGradient(cx, cy, radius * 0.92, cx, cy, radius * 1.2);
  halo.addColorStop(0, 'rgba(0,0,0,0)');
  halo.addColorStop(0.55, hslAlpha('190 85% 62%', isDark ? 0.06 : 0.04));
  halo.addColorStop(0.82, hslAlpha(accent, isDark ? 0.14 : 0.1));
  halo.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 1.2, 0, Math.PI * 2);
  ctx.fill();
}

function drawAtmosphereRim(
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

  const rim = ctx.createRadialGradient(
    cx - radius * 0.35,
    cy - radius * 0.35,
    radius * 0.78,
    cx,
    cy,
    radius * 1.06,
  );
  rim.addColorStop(0, 'rgba(0,0,0,0)');
  rim.addColorStop(0.7, hslAlpha(accent, isDark ? 0.06 : 0.1));
  rim.addColorStop(1, hslAlpha('195 90% 68%', isDark ? 0.28 : 0.18));
  ctx.fillStyle = rim;
  ctx.fillRect(cx - radius * 1.15, cy - radius * 1.15, radius * 2.3, radius * 2.3);
  ctx.restore();

  ctx.strokeStyle = hslAlpha('195 90% 72%', isDark ? 0.35 : 0.22);
  ctx.lineWidth = 1.2;
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

  const visibleSamples = samples.filter((point) => point.visible && point.z > 0.04);
  if (visibleSamples.length < 2) {
    return;
  }

  const avgZ = visibleSamples.reduce((sum, point) => sum + point.z, 0) / visibleSamples.length;
  const inHeadline = visibleSamples.some((point) =>
    isInHeadlineZone(point.x, point.y, cx, cy, radius),
  );
  const alpha = (inHeadline ? 0.12 : 0.22) + avgZ * 0.45;

  ctx.strokeStyle = hslAlpha(accent, alpha);
  ctx.lineWidth = 0.9 + avgZ * 0.7;
  ctx.setLineDash(animate ? [5, 9] : []);
  ctx.lineDashOffset = animate ? -phase * 24 : 0;
  ctx.beginPath();
  visibleSamples.forEach((point, index) => {
    const lift = 1 + (1 - Math.abs(index / 24 - 0.5) * 2) * 0.035;
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
      ctx.fillStyle = hslAlpha(accent, 0.65 + particle.z * 0.25);
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

type InteractiveRouteGlobeProps = {
  className?: string;
};

export function InteractiveRouteGlobe({ className }: InteractiveRouteGlobeProps) {
  const { t } = useI18n();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rotationYRef = useRef(degToRad(-24));
  const rotationXRef = useRef(degToRad(10));
  const zoomRef = useRef(1.04);
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

    const { cx, cy, radius } = computeGlobeMetrics(width, height, zoomRef.current);

    drawStarfield(ctx, width, height, cx, cy, radius, isDark);
    drawAtmosphereHalo(ctx, cx, cy, radius, accent, isDark);
    drawOceanSphere(ctx, cx, cy, radius, isDark);
    drawLandMasses(ctx, radius, cx, cy, rotationYRef.current, rotationXRef.current, isDark);
    drawCloudTexture(ctx, radius, cx, cy, rotationYRef.current, rotationXRef.current, isDark);
    drawLatLonGrid(
      ctx,
      radius,
      cx,
      cy,
      rotationYRef.current,
      rotationXRef.current,
      hslAlpha(isDark ? '210 40% 88%' : '220 30% 40%', isDark ? 0.07 : 0.1),
    );

    const rotY = rotationYRef.current;
    const rotX = rotationXRef.current;

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

    for (const { point } of projectedCities) {
      if (!point.visible || point.z < 0.08) {
        continue;
      }

      const glow = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, 12);
      glow.addColorStop(0, hslAlpha(accent, 0.28 + point.z * 0.32));
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(point.x, point.y, 10, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = hslAlpha(accent, 0.65 + point.z * 0.28);
      ctx.beginPath();
      ctx.arc(point.x, point.y, 2.2 + point.z * 1.2, 0, Math.PI * 2);
      ctx.fill();
    }

    const labelCandidates = projectedCities
      .filter(({ city, point }) => city.label && point.visible && point.z > 0.14)
      .sort((a, b) => b.point.z - a.point.z)
      .slice(0, MAX_VISIBLE_LABELS);

    for (const { city, point } of labelCandidates) {
      const inHeadline = isInHeadlineZone(point.x, point.y, cx, cy, radius);
      const alpha = inHeadline ? 0.12 + point.z * 0.15 : 0.5 + point.z * 0.38;
      ctx.font = '600 10px system-ui, sans-serif';
      ctx.fillStyle = hslAlpha(isDark ? '210 40% 96%' : '228 35% 18%', alpha);
      ctx.textAlign = 'center';
      ctx.fillText(city.name, point.x, point.y - 12);
    }

    drawAtmosphereRim(ctx, cx, cy, radius, accent, isDark);
    drawVignette(ctx, width, height, cx, cy, isDark);

    if (!reducedMotionRef.current && autoRotateRef.current && !draggingRef.current) {
      rotationYRef.current += AUTO_ROTATE_SPEED;
      phaseRef.current += 0.012;
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
    rotationYRef.current += dx * 0.0045;
    rotationXRef.current = Math.max(
      -TILT_LIMIT,
      Math.min(TILT_LIMIT, rotationXRef.current + dy * 0.0035),
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
    }, 2400);
  };

  const onWheel = (event: React.WheelEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const delta = event.deltaY > 0 ? -0.03 : 0.03;
    zoomRef.current = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoomRef.current + delta));
  };

  return (
    <div className={cn('relative aspect-square w-full', className)}>
      <div ref={containerRef} className="absolute inset-0">
        <canvas
          ref={canvasRef}
          className={cn(
            'block h-full w-full touch-none select-none',
            isDragging ? 'cursor-grabbing' : 'cursor-grab',
          )}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          onWheel={onWheel}
        />
      </div>
      <p
        className="pointer-events-none absolute bottom-[4%] left-1/2 z-10 hidden -translate-x-1/2 rounded-full border border-border/40 bg-card/45 px-2.5 py-1 text-[10px] text-muted-foreground backdrop-blur-sm sm:inline-block"
        aria-hidden
      >
        {t('marketing.landing.globeDragHint')}
      </p>
      <p className="sr-only">
        Interactive 3D-style Earth globe with global delivery routes. Drag to rotate, scroll to
        zoom.
      </p>
    </div>
  );
}
