import type { DetailPayload, Lang, ShopRoute } from './types';
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

interface RouteHashV2 {
  v: 2;
  r?: ShopRoute | null;
  s?: boolean;
  f?: boolean;
  fl?: string;
}

function isRouteHashV2(data: unknown): data is RouteHashV2 {
  return Boolean(data && typeof data === 'object' && (data as RouteHashV2).v === 2);
}

/**
 * Load detail for the phone page:
 * 1) `?id=&lang=&from=` + optional `#z` route hash (v2) — preferred short QR
 * 2) legacy full payload in hash (v1)
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

  // Preferred: shop id query → fetch photos/text; hash = route only.
  if (Number.isFinite(id) && id > 0) {
    let route: ShopRoute | null = null;
    let showShuttle: boolean | undefined;
    let showFerry: boolean | undefined;
    let ferryModeLabel: string | undefined;

    if (hash) {
      const decoded = await decodeHashJson(hash);
      if (isRouteHashV2(decoded)) {
        route = decoded.r ?? null;
        showShuttle = decoded.s || undefined;
        showFerry = decoded.f || undefined;
        ferryModeLabel = decoded.fl || undefined;
      } else if (decoded && typeof decoded === 'object' && (decoded as DetailPayload).v === 1) {
        // Old full payload accidentally opened with ?id= — still use its route.
        const legacy = normalizeLegacy(decoded as DetailPayload);
        if (legacy) {
          route = legacy.route ?? null;
          showShuttle = legacy.showShuttle;
          showFerry = legacy.showFerry;
          ferryModeLabel = legacy.ferryModeLabel;
        }
      }
    }

    try {
      const shop = await fetchShopById(id);
      const fields = shopToDetailFields(shop, lang);
      // Detail API returns route:null — prefer QR route; fall back to API if present.
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

  // Legacy: full card in hash / ?d=
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
    route: {
      distanceKm: 36.7,
      durationMin: 56,
      bikeMin: 120,
      walkMin: 400,
      transit: {
        status: 'FOUND',
        totalMin: 90,
        basedOn: '2026-03',
        legs: [
          {
            routeNum: '202',
            boardStopNameKr: '제주국제공항',
            rideStops: 20,
            rideMin: 70,
          },
        ],
      },
      busStop: {
        nameKr: '협재해수욕장',
        walkMin: 8,
      },
    },
  };
}
