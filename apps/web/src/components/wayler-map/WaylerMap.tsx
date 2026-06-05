'use client';

import type { DeliveryOrderType } from '@wayly/types';
import { Skeleton } from '@wayly/ui';
import { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, Marker, Polyline, TileLayer, Tooltip, useMap } from 'react-leaflet';
import type { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { cn } from '@/lib/utils';

import { geocodePlace, type LatLngTuple } from './geocode';
import { configureLeafletIcons, createColoredIcon } from './leaflet-icons';

export interface WaylerMapLabels {
  pickup: string;
  dropoff: string;
  route: string;
  mapLoading: string;
  mapLoadFailed: string;
  mapUnavailable: string;
}

export interface WaylerMapOrderInfo {
  title: string;
  type: DeliveryOrderType;
  rewardText: string;
  publishedText: string;
}

export interface WaylerMapProps {
  pickupCity: string | null;
  pickupCountry: string | null;
  dropoffCity: string | null;
  dropoffCountry: string | null;
  orderInfo: WaylerMapOrderInfo;
  labels: WaylerMapLabels;
  /** When false, map does not load (feed skeleton phase). */
  feedReady?: boolean;
  className?: string;
}

type MapStatus = 'idle' | 'loading' | 'ready' | 'failed' | 'unavailable';

const PICKUP_COLOR = '#22c55e';
const DROPOFF_COLOR = '#8b5cf6';
const ROUTE_COLOR = '#7c3aed';

function MapBounds({ positions }: { positions: LatLngTuple[] }) {
  const map = useMap();

  useEffect(() => {
    if (positions.length === 0) {
      return;
    }
    const first = positions[0];
    if (positions.length === 1 && first) {
      map.setView(first, 10);
    } else {
      map.fitBounds(positions, { padding: [28, 28], maxZoom: 12 });
    }
    map.invalidateSize();
  }, [map, positions]);

  return null;
}

function MapTooltipContent({ orderInfo }: { orderInfo: WaylerMapOrderInfo }) {
  return (
    <div className="flex flex-col gap-0.5 text-xs">
      <p className="font-semibold leading-tight">{orderInfo.title}</p>
      <p className="text-muted-foreground">{orderInfo.type}</p>
      <p>{orderInfo.rewardText}</p>
      <p className="text-muted-foreground">{orderInfo.publishedText}</p>
    </div>
  );
}

export function WaylerMap({
  pickupCity,
  pickupCountry,
  dropoffCity,
  dropoffCountry,
  orderInfo,
  labels,
  feedReady = true,
  className,
}: WaylerMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [status, setStatus] = useState<MapStatus>('idle');
  const [pickupCoords, setPickupCoords] = useState<LatLngTuple | null>(null);
  const [dropoffCoords, setDropoffCoords] = useState<LatLngTuple | null>(null);

  const hasLocationText = Boolean(
    (pickupCity?.trim() || pickupCountry?.trim()) &&
    (dropoffCity?.trim() || dropoffCountry?.trim()),
  );

  useEffect(() => {
    configureLeafletIcons();
  }, []);

  useEffect(() => {
    const node = containerRef.current;
    if (!node || !feedReady) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '120px' },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [feedReady]);

  useEffect(() => {
    if (!feedReady || !isVisible) {
      return;
    }

    if (!hasLocationText) {
      setStatus('unavailable');
      return;
    }

    let cancelled = false;

    async function resolveCoords() {
      setStatus('loading');
      const [pickup, dropoff] = await Promise.all([
        geocodePlace(pickupCity, pickupCountry),
        geocodePlace(dropoffCity, dropoffCountry),
      ]);

      if (cancelled) {
        return;
      }

      setPickupCoords(pickup);
      setDropoffCoords(dropoff);

      if (!pickup || !dropoff) {
        setStatus('failed');
        return;
      }

      setStatus('ready');
    }

    void resolveCoords();

    return () => {
      cancelled = true;
    };
  }, [
    feedReady,
    isVisible,
    hasLocationText,
    pickupCity,
    pickupCountry,
    dropoffCity,
    dropoffCountry,
  ]);

  const routePositions = useMemo((): LatLngTuple[] => {
    const points: LatLngTuple[] = [];
    if (pickupCoords) {
      points.push(pickupCoords);
    }
    if (dropoffCoords) {
      points.push(dropoffCoords);
    }
    return points;
  }, [pickupCoords, dropoffCoords]);

  const defaultCenter = useMemo((): LatLngExpression => {
    if (pickupCoords && dropoffCoords) {
      return [(pickupCoords[0] + dropoffCoords[0]) / 2, (pickupCoords[1] + dropoffCoords[1]) / 2];
    }
    if (pickupCoords) {
      return pickupCoords;
    }
    return [20, 0];
  }, [pickupCoords, dropoffCoords]);

  const pickupIcon = useMemo(() => createColoredIcon(PICKUP_COLOR), []);
  const dropoffIcon = useMemo(() => createColoredIcon(DROPOFF_COLOR), []);

  const showMap = feedReady && isVisible && status === 'ready' && pickupCoords && dropoffCoords;

  return (
    <div
      ref={containerRef}
      className={cn(
        'wayler-order-map mt-3 w-full overflow-hidden rounded-md border border-border/60',
        className,
      )}
      aria-label={labels.route}
    >
      {feedReady && !isVisible ? <div className="h-40 bg-muted/20 sm:h-44" aria-hidden /> : null}

      {!feedReady || (isVisible && status === 'loading') ? (
        <div className="flex h-40 flex-col justify-center gap-2 bg-muted/30 px-3 sm:h-44">
          <p className="sr-only">{labels.mapLoading}</p>
          <Skeleton className="h-full w-full rounded-sm" />
        </div>
      ) : null}

      {feedReady && isVisible && status === 'unavailable' ? (
        <p className="px-3 py-6 text-center text-xs text-muted-foreground">
          {labels.mapUnavailable}
        </p>
      ) : null}

      {feedReady && isVisible && status === 'failed' ? (
        <p className="px-3 py-6 text-center text-xs text-danger">{labels.mapLoadFailed}</p>
      ) : null}

      {showMap ? (
        <MapContainer
          center={defaultCenter}
          zoom={6}
          scrollWheelZoom={false}
          className="z-0 h-40 w-full sm:h-44"
          attributionControl
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapBounds positions={routePositions} />
          <Marker position={pickupCoords} icon={pickupIcon}>
            <Tooltip direction="top" offset={[0, -6]}>
              {labels.pickup}
            </Tooltip>
          </Marker>
          <Marker position={dropoffCoords} icon={dropoffIcon}>
            <Tooltip direction="top" offset={[0, -6]}>
              {labels.dropoff}
            </Tooltip>
          </Marker>
          <Polyline
            positions={routePositions}
            pathOptions={{ color: ROUTE_COLOR, weight: 3, opacity: 0.85, dashArray: '6 8' }}
          >
            <Tooltip sticky direction="auto" className="wayler-map-route-tooltip">
              <MapTooltipContent orderInfo={orderInfo} />
            </Tooltip>
          </Polyline>
        </MapContainer>
      ) : null}
    </div>
  );
}
