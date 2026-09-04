import type { DetailPayload, Lang } from './types';

const LANGS: Lang[] = ['ko', 'en', 'ja', 'zh', 'vi', 'th', 'ru', 'id'];

/** UTF-8 JSON → base64url (no compression — keep in sync with kiosk detailCardSave). */
export function encodePayload(payload: DetailPayload): string {
  const json = JSON.stringify(payload);
  const bytes = new TextEncoder().encode(json);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]!);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function decodePayload(encoded: string): DetailPayload | null {
  try {
    const pad = encoded.length % 4 === 0 ? '' : '='.repeat(4 - (encoded.length % 4));
    const b64 = encoded.replace(/-/g, '+').replace(/_/g, '/') + pad;
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    const json = new TextDecoder().decode(bytes);
    const data = JSON.parse(json) as DetailPayload;
    if (data?.v !== 1 || typeof data.name !== 'string') return null;
    if (!LANGS.includes(data.lang)) data.lang = 'ko';
    if (!Array.isArray(data.photos)) data.photos = [];
    return data;
  } catch {
    return null;
  }
}

export function buildDetailUrl(baseUrl: string, payload: DetailPayload): string {
  const root = baseUrl.replace(/\/+$/, '');
  return `${root}/#${encodePayload(payload)}`;
}

export function readPayloadFromLocation(loc: Location = window.location): DetailPayload | null {
  const hash = loc.hash.replace(/^#/, '').trim();
  if (hash) {
    const fromHash = decodePayload(hash);
    if (fromHash) return fromHash;
  }
  const d = new URLSearchParams(loc.search).get('d');
  if (d) return decodePayload(d);
  return null;
}

export function demoPayload(): DetailPayload {
  return {
    v: 1,
    lang: 'ko',
    from: 'eat',
    shopId: 1308,
    name: '돈사돈',
    category: '흑돼지',
    photos: [],
    address: '제주특별자치도 제주시 연동',
    hours: '11:00 - 22:00',
    phone: '064-123-4567',
    description: '제주 흑돼지 전문점입니다.',
    tags: '#흑돼지 #연동',
    showShuttle: false,
    route: {
      distanceKm: 3.1,
      durationMin: 12,
      guideType: 'ROAD',
      bikeMin: 25,
      walkMin: 45,
      transit: {
        status: 'FOUND',
        totalMin: 28,
        basedOn: '2026-03',
        legs: [
          {
            routeNum: '365',
            boardStopNameKr: '제주국제공항',
            rideStops: 8,
            rideMin: 18,
          },
        ],
      },
      busStop: {
        nameKr: '연동입구',
        walkMin: 7,
      },
    },
  };
}
