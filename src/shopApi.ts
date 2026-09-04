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
  data?: ApiShop;
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
  const body = (await res.json()) as ApiEnvelope & ApiShop;
  const shop: ApiShop =
    body && typeof body === 'object' && body.data && typeof body.data.id === 'number'
      ? body.data
      : body;
  if (!shop || typeof shop.id !== 'number') throw new Error(`shop ${id}: bad body`);
  return shop;
}
