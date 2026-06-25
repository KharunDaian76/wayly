/** Aggregate active Wayler counts for a marketplace location (privacy-safe). */
export interface ActiveWaylerLocationCount {
  country: string;
  city?: string | null;
  activeWaylerCount: number;
  availableTripCount?: number;
}

/** GET /marketplace/active-waylers response. */
export interface ActiveWaylerMarketplaceResponse {
  totalActiveWaylers: number;
  locations: ActiveWaylerLocationCount[];
}
