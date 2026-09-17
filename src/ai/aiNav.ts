/**
 * Directions to one stop, as links the phone hands to a map app.
 *
 * Each map's documented public link, destination only — the origin is left to
 * the app, which starts from the visitor's current location:
 *   · Kakao Map   https://map.kakao.com/link/to/{name},{lat},{lng}
 *   · Google Maps https://www.google.com/maps/dir/?api=1&destination={lat},{lng}
 *   · Naver Map   the shop's own `naverLink` (its place page, where 길찾기 is one
 *                 tap), or a search for the address when the shop has none.
 * Without coordinates, Kakao and Google fall back to searching the address.
 */
import type { AiCourseSpot } from './aiCourse';

export interface MapLinks {
  kakao: string;
  naver: string;
  google: string;
}

/** The QR's 이동수단 → Google's travel mode. */
const GOOGLE_MODE: Record<string, string> = {
  CAR: 'driving',
  WALK: 'walking',
  BIKE: 'bicycling',
  TRANSIT: 'transit',
};

export function mapLinks(
  spot: Pick<AiCourseSpot, 'name' | 'address' | 'lat' | 'lng' | 'naverLink'>,
  transport: string,
): MapLinks {
  const query = encodeURIComponent(spot.address || spot.name);
  const hasPosition = spot.lat !== null && spot.lng !== null;

  return {
    kakao: hasPosition
      ? `https://map.kakao.com/link/to/${encodeURIComponent(spot.name)},${spot.lat},${spot.lng}`
      : `https://map.kakao.com/link/search/${query}`,
    naver: spot.naverLink || `https://map.naver.com/p/search/${query}`,
    google: hasPosition
      ? `https://www.google.com/maps/dir/?api=1&destination=${spot.lat},${spot.lng}&travelmode=${
          GOOGLE_MODE[transport] ?? 'driving'
        }`
      : `https://www.google.com/maps/search/?api=1&query=${query}`,
  };
}
