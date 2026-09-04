import type { DetailPayload, Lang, ShopRoute } from './types';

const LANGS: Lang[] = ['ko', 'en', 'ja', 'zh', 'vi', 'th', 'ru', 'id'];

type Suffix = 'Kr' | 'En' | 'Jp' | 'Ch' | 'Vn' | 'Id' | 'Th' | 'Ru';

const LANG_SUFFIX: Record<Lang, Suffix> = {
  ko: 'Kr',
  en: 'En',
  ja: 'Jp',
  zh: 'Ch',
  vi: 'Vn',
  id: 'Id',
  th: 'Th',
  ru: 'Ru',
};

interface ShopImage {
  id?: number;
  imageUrl?: string;
  sortOrder?: number;
}

/** Raw shape from GET /api/shops/{id} (multilingual fields). */
export interface ApiShop {
  id: number;
  kioskId?: number;
  tel?: string | null;
  openTime?: string | null;
  images?: ShopImage[] | null;
  route?: ShopRoute | null;
  shopNameKr?: string;
  shopNameEn?: string;
  shopNameJp?: string;
  shopNameCh?: string;
  shopNameVn?: string;
  shopNameId?: string;
  shopNameTh?: string;
  shopNameRu?: string;
  secondCategoryKr?: string | null;
  secondCategoryEn?: string | null;
  secondCategoryJp?: string | null;
  secondCategoryCh?: string | null;
  secondCategoryVn?: string | null;
  secondCategoryId?: string | null;
  secondCategoryTh?: string | null;
  secondCategoryRu?: string | null;
  addressKr?: string;
  addressEn?: string;
  addressJp?: string;
  addressCh?: string;
  addressVn?: string;
  addressId?: string;
  addressTh?: string;
  addressRu?: string;
  descriptionKr?: string | null;
  descriptionEn?: string | null;
  descriptionJp?: string | null;
  descriptionCh?: string | null;
  descriptionVn?: string | null;
  descriptionId?: string | null;
  descriptionTh?: string | null;
  descriptionRu?: string | null;
  hashTagKr?: string | null;
  hashTagEn?: string | null;
  hashTagJp?: string | null;
  hashTagCh?: string | null;
  hashTagVn?: string | null;
  hashTagId?: string | null;
  hashTagTh?: string | null;
  hashTagRu?: string | null;
  [key: string]: unknown;
}

interface ApiEnvelope {
  success?: boolean;
  data?: ApiShop | ApiShop[];
}

function isApiShop(v: unknown): v is ApiShop {
  return Boolean(v && typeof v === 'object' && typeof (v as ApiShop).id === 'number');
}

function field(shop: ApiShop, base: string, lang: Lang): string {
  const suf = LANG_SUFFIX[lang] ?? 'Kr';
  const primary = shop[`${base}${suf}`];
  if (typeof primary === 'string' && primary.trim()) return primary.trim();
  const fallback = shop[`${base}Kr`];
  return typeof fallback === 'string' ? fallback.trim() : '';
}

export function shopToDetailFields(
  shop: ApiShop,
  lang: Lang,
): Pick<
  DetailPayload,
  'shopId' | 'name' | 'category' | 'photos' | 'address' | 'hours' | 'phone' | 'description' | 'tags'
> {
  const photos = [...(shop.images ?? [])]
    .filter((i) => i?.imageUrl)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .map((i) => i.imageUrl!)
    .slice(0, 4);

  return {
    shopId: shop.id,
    name: field(shop, 'shopName', lang) || `Shop ${shop.id}`,
    category: field(shop, 'secondCategory', lang),
    photos,
    address: field(shop, 'address', lang),
    hours: (shop.openTime ?? '').trim(),
    phone: (shop.tel ?? '').trim(),
    description: field(shop, 'description', lang),
    tags: field(shop, 'hashTag', lang),
  };
}

export function parseLang(raw: string | null): Lang {
  if (raw && LANGS.includes(raw as Lang)) return raw as Lang;
  return 'ko';
}

/** Same-origin `/api/shops/{id}` — Vite/Vercel proxy avoids CORS. */
export async function fetchShopById(id: number): Promise<ApiShop> {
  const res = await fetch(`/api/shops/${id}`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`shop ${id}: HTTP ${res.status}`);
  const body = (await res.json()) as ApiEnvelope | ApiShop;
  const shop: ApiShop = isApiShop(body)
    ? body
    : isApiShop((body as ApiEnvelope).data)
      ? ((body as ApiEnvelope).data as ApiShop)
      : (() => {
          throw new Error(`shop ${id}: bad body`);
        })();
  return shop;
}

/**
 * Full route (with stop names) from the shops list via serverless/cache.
 * Detail endpoint returns route:null.
 */
export async function fetchShopRoute(
  id: number,
  kioskId: number,
): Promise<ShopRoute | null> {
  try {
    const res = await fetch(`/api/shop-route?id=${id}&kioskId=${kioskId}`, {
      headers: { Accept: 'application/json' },
    });
    if (res.ok) {
      const body = (await res.json()) as { route?: ShopRoute | null };
      return body.route ?? null;
    }
  } catch (e) {
    console.warn('shop-route endpoint failed', e);
  }

  // Local Vite: no serverless — pull from proxied list once (dev only).
  try {
    const res = await fetch(`/api/shops?kioskId=${kioskId}`, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return null;
    const body: unknown = await res.json();
    let list: ApiShop[] = [];
    if (Array.isArray(body)) {
      list = body as ApiShop[];
    } else if (body && typeof body === 'object' && Array.isArray((body as ApiEnvelope).data)) {
      list = (body as ApiEnvelope).data as ApiShop[];
    }
    const shop = list.find((s) => s.id === id);
    return shop?.route && typeof shop.route.distanceKm === 'number' ? shop.route : null;
  } catch (e) {
    console.warn('shops list route fallback failed', e);
    return null;
  }
}
