/**
 * Returns one shop's `route` (with bus stop names) from the shops list.
 * Detail GET /api/shops/{id} has route:null — list is the source of truth.
 *
 * Cached at the CDN / instance so phones never download the full 3MB catalogue.
 */
const UPSTREAM = process.env.SHOP_API_BASE || 'https://api-stage-v3.witteria.com';

type CacheEntry = { at: number; byId: Map<number, unknown> };

const cache = new Map<number, CacheEntry>();
const TTL_MS = 60 * 60 * 1000;

async function loadKioskShops(kioskId: number): Promise<Map<number, unknown>> {
  const hit = cache.get(kioskId);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.byId;

  const res = await fetch(`${UPSTREAM}/api/shops?kioskId=${kioskId}`, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'direction-fe-shop-route',
    },
  });
  if (!res.ok) throw new Error(`upstream ${res.status}`);

  const body = (await res.json()) as { data?: unknown } | unknown[];
  const list = Array.isArray(body) ? body : Array.isArray((body as { data?: unknown }).data)
    ? ((body as { data: unknown[] }).data)
    : [];

  const byId = new Map<number, unknown>();
  for (const row of list) {
    if (row && typeof row === 'object' && typeof (row as { id?: unknown }).id === 'number') {
      byId.set((row as { id: number }).id, row);
    }
  }
  cache.set(kioskId, { at: Date.now(), byId });
  return byId;
}

export default async function handler(
  req: { method?: string; query?: Record<string, string | string[] | undefined> },
  res: {
    setHeader: (k: string, v: string) => void;
    status: (n: number) => { json: (b: unknown) => void };
  },
): Promise<void> {
  if (req.method && req.method !== 'GET') {
    res.status(405).json({ error: 'method' });
    return;
  }

  const idRaw = req.query?.id;
  const kioskRaw = req.query?.kioskId;
  const id = Number(Array.isArray(idRaw) ? idRaw[0] : idRaw);
  const kioskId = Number(Array.isArray(kioskRaw) ? kioskRaw[0] : kioskRaw);

  if (!Number.isFinite(id) || id <= 0 || !Number.isFinite(kioskId) || kioskId <= 0) {
    res.status(400).json({ error: 'id and kioskId required' });
    return;
  }

  try {
    const byId = await loadKioskShops(kioskId);
    const shop = byId.get(id) as { route?: unknown } | undefined;
    if (!shop) {
      res.status(404).json({ error: 'not found' });
      return;
    }
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    res.status(200).json({ route: shop.route ?? null });
  } catch (e) {
    console.error(e);
    res.status(502).json({ error: 'upstream failed' });
  }
}
