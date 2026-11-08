export const VILLAGE_BOUNDS = { south: 21.052, west: 106.070, north: 21.072, east: 106.094 };
export const VILLAGE_CENTER = { lat: 21.0616, lng: 106.0822 };
export const MIN_ZOOM = 16;
export const MAX_ZOOM = 19;

export function hasCoordinates(point) {
  return typeof point?.latitude === 'number' && Number.isFinite(point.latitude) && Math.abs(point.latitude) <= 90 &&
    typeof point?.longitude === 'number' && Number.isFinite(point.longitude) && Math.abs(point.longitude) <= 180;
}

export function isWithinVillage(point) {
  return hasCoordinates(point) && point.latitude >= VILLAGE_BOUNDS.south && point.latitude <= VILLAGE_BOUNDS.north &&
    point.longitude >= VILLAGE_BOUNDS.west && point.longitude <= VILLAGE_BOUNDS.east;
}

export function distanceMeters(from, to) {
  if (!hasCoordinates(from) || !hasCoordinates(to)) return null;
  const radians = degrees => degrees * Math.PI / 180;
  const latitude = radians(to.latitude - from.latitude);
  const longitude = radians(to.longitude - from.longitude);
  const a = Math.sin(latitude / 2) ** 2 + Math.cos(radians(from.latitude)) * Math.cos(radians(to.latitude)) * Math.sin(longitude / 2) ** 2;
  return 2 * 6371000 * Math.asin(Math.sqrt(Math.max(0, Math.min(1, a))));
}

export function rankStudiosByDistance(studios, position) {
  return studios.map(studio => ({ ...studio, distanceMeters: distanceMeters(position, studio) }))
    .sort((first, second) => {
      if (first.distanceMeters === null) return second.distanceMeters === null ? 0 : 1;
      if (second.distanceMeters === null) return -1;
      return first.distanceMeters - second.distanceMeters;
    });
}

export function formatDistance(meters) {
  if (!Number.isFinite(meters) || meters < 0) return '';
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1 }).format(meters / 1000)} km`;
}

export function googleDirectionsUrl(studio, origin = null) {
  if (!hasCoordinates(studio) || (origin !== null && !hasCoordinates(origin))) throw new Error('Invalid route coordinates');
  const url = new URL('https://www.google.com/maps/dir/');
  url.search = new URLSearchParams({ api: '1', destination: `${studio.latitude},${studio.longitude}`, dir_action: 'navigate' });
  if (origin) url.searchParams.set('origin', `${origin.latitude},${origin.longitude}`);
  return url.toString();
}

export function googleSatelliteUrl(studio) {
  const latitude = Number(studio.latitude);
  const longitude = Number(studio.longitude);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) ||
      Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
    throw new Error('Invalid workshop coordinates');
  }
  const url = new URL('https://www.google.com/maps/@');
  url.search = new URLSearchParams({
    api: '1', map_action: 'map', center: `${latitude},${longitude}`,
    zoom: String(MAX_ZOOM), basemap: 'satellite',
  });
  return url.toString();
}
