/** Display-ready detail payload — already localized by the kiosk. */
export type Lang = 'ko' | 'en' | 'ja' | 'zh' | 'vi' | 'th' | 'ru' | 'id';

export interface ShopTransitLeg {
  routeNum: string;
  boardStopNameKr: string;
  boardStopNameEn?: string;
  boardStopNameCh?: string;
  boardStopNameJp?: string;
  rideStops: number;
  rideMin: number;
}

export interface ShopTransit {
  status: string;
  transferCount?: number | null;
  totalMin?: number | null;
  basedOn?: string | null;
  legs: ShopTransitLeg[];
}

export interface ShopBusStop {
  nameKr: string;
  nameEn?: string;
  nameCh?: string;
  nameJp?: string;
  routes?: string;
  walkMin?: number | null;
}

export interface ShopRoute {
  distanceKm: number | null;
  durationMin: number | null;
  guideType?: string | null;
  walkable?: boolean;
  bikeable?: boolean;
  bikeMin?: number | null;
  walkMin?: number | null;
  busStop?: ShopBusStop | null;
  transit?: ShopTransit | null;
}

/**
 * Everything the phone page needs to paint the kiosk white card.
 * Text/address/photos: GET /api/shops/{id}. Route stop names: /api/shop-route.
 */
export interface DetailPayload {
  v: 1;
  lang: Lang;
  from: string;
  shopId?: number;
  name: string;
  category: string;
  photos: string[];
  address: string;
  hours: string;
  phone: string;
  description: string;
  tags: string;
  showShuttle?: boolean;
  showFerry?: boolean;
  ferryModeLabel?: string;
  route?: ShopRoute | null;
}
