/**
 * Earth radius in meters (mean spherical radius)
 */
export const EARTH_RADIUS_METERS = 6371000;

/**
 * Converts degrees to radians
 */
function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Calculates the great-circle distance between two geographic coordinates on Earth
 * using the server-authoritative Haversine formula:
 *
 * distance = 2r * arcsin(sqrt(sin^2(Δφ / 2) + cos(φ1) * cos(φ2) * sin^2(Δλ / 2)))
 *
 * @param lat1 User device latitude (degrees)
 * @param lon1 User device longitude (degrees)
 * @param lat2 Target rehearsal location latitude (degrees)
 * @param lon2 Target rehearsal location longitude (degrees)
 * @returns Distance in meters rounded to one decimal place
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const phi1 = toRadians(lat1);
  const phi2 = toRadians(lat2);
  const deltaPhi = toRadians(lat2 - lat1);
  const deltaLambda = toRadians(lon2 - lon1);

  const sinHalfDeltaPhi = Math.sin(deltaPhi / 2);
  const sinHalfDeltaLambda = Math.sin(deltaLambda / 2);

  const a =
    sinHalfDeltaPhi * sinHalfDeltaPhi +
    Math.cos(phi1) * Math.cos(phi2) * sinHalfDeltaLambda * sinHalfDeltaLambda;

  // Clamp 'a' to [0, 1] to avoid potential floating point precision errors with asin
  const clampedA = Math.min(1, Math.max(0, a));
  const c = 2 * Math.asin(Math.sqrt(clampedA));

  const distanceMeters = EARTH_RADIUS_METERS * c;

  // Return rounded to one decimal place
  return Math.round(distanceMeters * 10) / 10;
}

/**
 * Evaluates whether a given device coordinate falls within a rehearsal's geofence radius
 */
export function isWithinGeofence(
  deviceLat: number,
  deviceLon: number,
  targetLat: number,
  targetLon: number,
  radiusMeters: number
): { isInside: boolean; distance: number } {
  const distance = calculateHaversineDistance(deviceLat, deviceLon, targetLat, targetLon);
  return {
    isInside: distance <= radiusMeters,
    distance,
  };
}

