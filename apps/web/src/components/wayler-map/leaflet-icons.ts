import L from 'leaflet';

/** Default Leaflet marker assets break under Next.js bundling — use CDN icons. */
export function configureLeafletIcons(): void {
  const iconRetina =
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png';
  const icon = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png';
  const shadow = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png';

  L.Icon.Default.mergeOptions({
    iconRetinaUrl: iconRetina,
    iconUrl: icon,
    shadowUrl: shadow,
  });
}

export function createColoredIcon(color: string): L.DivIcon {
  return L.divIcon({
    className: 'wayly-map-marker',
    html: `<span style="background:${color};width:14px;height:14px;border-radius:50%;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.35);display:block;"></span>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}
