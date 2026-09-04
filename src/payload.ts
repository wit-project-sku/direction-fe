import type { DetailPayload, Lang, ShopRoute, ShopTransitLeg } from './types';
import { fetchShopById, parseLang, shopToDetailFields } from './shopApi';

const LANGS: Lang[] = ['ko', 'en', 'ja', 'zh', 'vi', 'th', 'ru', 'id'];

function fromBase64Url(encoded: string): Uint8Array {
  const pad = encoded.length % 4 === 0 ? '' : '='.repeat(4 - (encoded.length % 4));
  const b64 = encoded.replace(/-/g, '+').replace(/_/g, '/') + pad;
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function inflateZlib(bytes: Uint8Array): Promise<string> {
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate'));
  return new Response(stream).text();
}

async function decodeHashJson(encoded: string): Promise<unknown | null> {
  try {
    const raw = encoded.trim();
    if (!raw) return null;
    const json = raw.startsWith('z')
      ? await inflateZlib(fromBase64Url(raw.slice(1)))
      : new TextDecoder().decode(fromBase64Url(raw));
    return JSON.parse(json) as unknown;
  } catch {
    return null;
  }
}

function normalizeLegacy(data: DetailPayload): DetailPayload | null {
  if (data?.v !== 1 || typeof data.name !== 'string') return null;
  if (!LANGS.includes(data.lang)) data.lang = 'ko';
  if (!Array.isArray(data.photos)) data.photos = [];
  if (typeof data.category !== 'string') data.category = '';
  if (typeof data.address !== 'string') data.address = '';
  if (typeof data.hours !== 'string') data.hours = '';
  if (typeof data.phone !== 'string') data.phone = '';
  if (typeof data.description !== 'string') data.description = '';
  if (typeof data.tags !== 'string') data.tags = '';
  if (typeof data.from !== 'string') data.from = 'eat';
  return data;
}

/**
 * Compact `r` query from kiosk (ASCII). Mirror of encodeRouteParam.
 * Example: 36.7,56,b40,p90,t52,3008,20,40,w3
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
          boardStopNameKr: legs.length === 0 ? '승차' : '환승',
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
    transit:
      totalMin != null
        ? { status: 'FOUND', totalMin, legs }
        : null,
    busStop: busWalk != null ? { nameKr: '하차', walkMin: busWalk } : null,
  };
}

/**
 * Preferred QR: `?id=&lang=&from=&r=` (+ photos via /api/shops/{id}).
 * Still accepts legacy hash payloads.
 */
export async function loadDetailFromLocation(
  loc: Location = window.location,
): Promise<DetailPayload | null> {
  const q = new URLSearchParams(loc.search);
  const idRaw = q.get('id');
  const id = idRaw ? Number(idRaw) : NaN;
  const lang = parseLang(q.get('lang'));
  const from = q.get('from')?.trim() || 'eat';
  const hash = loc.hash.replace(/^#/, '').trim();

  if (Number.isFinite(id) && id > 0) {
    let route = parseRouteParam(q.get('r'));
    let showShuttle = q.get('s') === '1' || undefined;
    let showFerry = q.get('f') === '1' || undefined;
    let ferryModeLabel = q.get('fl')?.trim() || undefined;

    // Legacy route-only hash (v2) if `r` query missing.
    if (!route && hash) {
      const decoded = await decodeHashJson(hash);
      if (decoded && typeof decoded === 'object' && (decoded as { v?: number }).v === 2) {
        const v2 = decoded as {
          r?: ShopRoute | null;
          s?: boolean;
          f?: boolean;
          fl?: string;
        };
        route = v2.r ?? null;
        showShuttle = showShuttle || v2.s || undefined;
        showFerry = showFerry || v2.f || undefined;
        ferryModeLabel = ferryModeLabel || v2.fl || undefined;
      } else if (decoded && typeof decoded === 'object' && (decoded as DetailPayload).v === 1) {
        const legacy = normalizeLegacy(decoded as DetailPayload);
        if (legacy) {
          route = legacy.route ?? null;
          showShuttle = showShuttle || legacy.showShuttle;
          showFerry = showFerry || legacy.showFerry;
          ferryModeLabel = ferryModeLabel || legacy.ferryModeLabel;
        }
      }
    }

    try {
      const shop = await fetchShopById(id);
      const fields = shopToDetailFields(shop, lang);
      const apiRoute =
        shop.route && typeof shop.route.distanceKm === 'number' ? shop.route : null;
      return {
        v: 1,
        lang,
        from,
        ...fields,
        showShuttle,
        showFerry,
        ferryModeLabel,
        route: route ?? apiRoute,
      };
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  if (hash) {
    const decoded = await decodeHashJson(hash);
    if (decoded && typeof decoded === 'object' && (decoded as DetailPayload).v === 1) {
      return normalizeLegacy(decoded as DetailPayload);
    }
  }
  const d = q.get('d');
  if (d) {
    const decoded = await decodeHashJson(d);
    if (decoded && typeof decoded === 'object' && (decoded as DetailPayload).v === 1) {
      return normalizeLegacy(decoded as DetailPayload);
    }
  }

  return null;
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
    route: parseRouteParam('36.7,56,t52,3008,20,40,w3'),
  };
}
