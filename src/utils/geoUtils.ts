import type { MapBounds } from '@/types/battle'

/** Degrees to radians */
export const toRad = (deg: number): number => (deg * Math.PI) / 180

/** Radians to degrees */
export const toDeg = (rad: number): number => (rad * 180) / Math.PI

/** Haversine distance between two lat/lng points in kilometers */
export function distanceKm(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
): number {
  const R = 6371
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

/** Bearing in degrees from point A to point B (0 = north) */
export function bearing(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
): number {
  const dLng = toRad(lng2 - lng1)
  const y = Math.sin(dLng) * Math.cos(toRad(lat2))
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLng)
  return (toDeg(Math.atan2(y, x)) + 360) % 360
}

/** Center of a MapBounds */
export function boundsCenter(bounds: MapBounds): [number, number] {
  return [
    (bounds.west + bounds.east) / 2,
    (bounds.south + bounds.north) / 2,
  ]
}

/** Pad a MapBounds by a factor (e.g. 0.1 = 10% padding) */
export function padBounds(bounds: MapBounds, factor = 0.05): MapBounds {
  const dLat = (bounds.north - bounds.south) * factor
  const dLng = (bounds.east - bounds.west) * factor
  return {
    north: bounds.north + dLat,
    south: bounds.south - dLat,
    east: bounds.east + dLng,
    west: bounds.west - dLng,
  }
}

/** Convert MapBounds to MapLibre LngLatBoundsLike [[west,south],[east,north]] */
export function boundsToMapLibre(bounds: MapBounds): [[number, number], [number, number]] {
  return [
    [bounds.west, bounds.south],
    [bounds.east, bounds.north],
  ]
}
