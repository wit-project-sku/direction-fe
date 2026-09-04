import type { DetailPayload, ShopRoute, ShopTransitLeg } from './types';
import { fetchShopById, fetchShopRoute, parseLang, shopToDetailFields } from './shopApi';

/**
 * Compact `r` query from kiosk (ASCII). Mirror of encodeRouteParam.
 * Example: 36.7,56,b40,p90,t52,3008,20,40,w3
 *
 * Stop names come from /api/shop-route — not from this param.
 */
export function parseRouteParam(raw: string | null): ShopRoute | null {
  if (!raw) return null;
  const parts = raw.split(',').map((s) => s.trim()).filter(Boolean);
  if (parts.length < 2) return null;

  const distanceKm = Number(parts[0]);
  const durationMin = Number(parts[1]);
  if (!Number.isFinite(distanceKm)) return null;

  let bikeMin: number | null = null;
  let walkMin: number | null = null;
  let busWalk: number | null = null;
  let totalMin: number | null = null;
  const legs: ShopTransitLeg[] = [];
  let inTransit = false;

  for (let i = 2; i < parts.length; ) {
    const p = parts[i]!;

    if (!inTransit && /^b\d+$/i.test(p)) {
      bikeMin = Number(p.slice(1));
      i += 1;
      continue;
    }
    if (!inTransit && /^p\d+$/i.test(p)) {
      walkMin = Number(p.slice(1));
      i += 1;
      continue;
    }
    if (/^t\d+$/i.test(p)) {
      totalMin = Number(p.slice(1));
      inTransit = true;
      i += 1;
      continue;
    }
    if (/^w\d+$/i.test(p)) {
      busWalk = Number(p.slice(1));
      i += 1;
      continue;
    }

    if (inTransit && i + 2 < parts.length) {
      const rideStops = Number(parts[i + 1]);
      const rideMin = Number(parts[i + 2]);
      if (Number.isFinite(rideStops) && Number.isFinite(rideMin)) {
        legs.push({
          routeNum: p,
          boardStopNameKr: '',
          rideStops,
          rideMin,
        });
        i += 3;
        continue;
      }
    }

    i += 1;
  }

  return {
    distanceKm,
    durationMin: Number.isFinite(durationMin) ? durationMin : null,
    bikeMin,
    walkMin,
    transit: totalMin != null ? { status: 'FOUND', totalMin, legs } : null,
    busStop: busWalk != null ? { nameKr: '', walkMin: busWalk } : null,
  };
}

/** `?id=&lang=&from=&r=` → shop API + optional shop-route enrichment. */
export async function loadDetailFromLocation(
  loc: Location = window.location,
): Promise<DetailPayload | null> {
  const q = new URLSearchParams(loc.search);
  const id = Number(q.get('id'));
  if (!Number.isFinite(id) || id <= 0) return null;

  const lang = parseLang(q.get('lang'));
  const from = q.get('from')?.trim() || 'eat';
  const compactRoute = parseRouteParam(q.get('r'));
  const showShuttle = q.get('s') === '1' ? true : undefined;
  const showFerry = q.get('f') === '1' ? true : undefined;
  const ferryModeLabel = q.get('fl')?.trim() || undefined;

  try {
    const shop = await fetchShopById(id);
    const fields = shopToDetailFields(shop, lang);
    const detailRoute =
      shop.route && typeof shop.route.distanceKm === 'number' ? shop.route : null;

    let richRoute: ShopRoute | null = null;
    const kioskId = typeof shop.kioskId === 'number' ? shop.kioskId : NaN;
    if (Number.isFinite(kioskId) && kioskId > 0) {
      richRoute = await fetchShopRoute(id, kioskId);
    }

    return {
      v: 1,
      lang,
      from,
      ...fields,
      showShuttle,
      showFerry,
      ferryModeLabel,
      route: richRoute ?? detailRoute ?? compactRoute,
    };
  } catch (e) {
    console.error(e);
    return null;
  }
}

export function demoPayload(): DetailPayload {
  return {
    v: 1,
    lang: 'ko',
    from: 'eat',
    shopId: 1612,
    name: '제주 갈치도 협재해수욕장점',
    category: '갈치·고등어',
    photos: [],
    address: '제주특별자치도 제주시 한림읍 한림로 475',
    hours: '11:00 - 22:00',
    phone: '064-123-4567',
    description: '협재해수욕장 인근의 갈치 전문점.',
    tags: '#갈치도 #협재맛집',
    showShuttle: false,
    route: {
      distanceKm: 36.7,
      durationMin: 56,
      transit: {
        status: 'FOUND',
        totalMin: 52,
        legs: [
          {
            routeNum: '3008',
            boardStopNameKr: '제주국제공항',
            rideStops: 20,
            rideMin: 40,
          },
        ],
      },
      busStop: {
        nameKr: '협재해수욕장',
        walkMin: 3,
      },
    },
  };
}
