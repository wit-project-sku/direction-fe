/**
 * Read the kiosk QR's `/ai` query and turn it into a display-ready course.
 *
 * Mirror of `buildAiCourseSaveUrlForQr` in kiosk-app
 * (`src/renderer/src/lib/aiCourseSave.ts`) — change one and change the other.
 *
 *   /ai?c=A&t=CAR&p=2&n=3&lang=ko&i=22.7.17&k=7
 *      &tm=280&tv=95&g=1&d1=1612.150.1.15.11_1043.120.1.8.24&d2=...
 *
 * A stop is `shopId.dwell.difficulty.travel.km10` with trailing zeros trimmed —
 * the last two are the leg INTO the stop (minutes, tenths of a km). Links from
 * before those fields existed, and long courses the kiosk trimmed to keep its QR
 * scannable, simply carry no legs.
 *
 * The QR carries ids and numbers only. Every string on the page comes either
 * from GET /api/shops/{id} (per spot) or from this app's own tables (labels),
 * so the page localizes without the kiosk having to send any Korean.
 */
import type { Lang } from '../types';
import { fetchShopById, parseLang, shopToDetailFields, type ApiShop } from '../shopApi';
import { aiCategoryLabel } from './aiCategories';
import type { AiCourse, AiCourseDay, AiCourseSpot } from './aiCourse';
import {
  COURSE_FALLBACK,
  COURSE_TAGS,
  COURSE_TITLE,
  PARTY_STAY_LABEL,
  STAT_LABEL,
  TRANSPORT_WORD,
  aboutMinutesLabel,
  courseNameWithDay,
  kmLabel,
  minutesLabel,
  nightsLabel,
  partyLabel,
  pick,
  startPlaceLabel,
} from './aiCourseI18n';

interface ParsedStop {
  shopId: number;
  dwellMinutes: number;
  difficulty: number;
  /** The leg into this stop; 0 when the QR carried none. */
  travelMinutes: number;
  travelKm: number;
}

interface ParsedDay {
  day: number;
  stops: ParsedStop[];
}

export interface AiCourseParams {
  lang: Lang;
  course: string;
  transport: string;
  party: number;
  nights: number;
  interests: number[];
  totalMinutes: number | null;
  travelMinutes: number | null;
  difficulty: number;
  /** The kiosk the course was built on (6 / 7 / 8) — DAY 1 starts there. */
  kiosk: number;
  days: ParsedDay[];
}

function int(raw: string | null, fallback: number): number {
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

/** `1612.150.1.15.11` — every field after the id is optional. */
function parseStop(token: string): ParsedStop | null {
  const [id, dwell, grade, travel, km10] = token.split('.');
  const shopId = Number(id);
  if (!Number.isFinite(shopId) || shopId <= 0) return null;
  return {
    shopId,
    dwellMinutes: Math.max(0, int(dwell ?? null, 0)),
    difficulty: Math.max(0, int(grade ?? null, 0)),
    travelMinutes: Math.max(0, int(travel ?? null, 0)),
    travelKm: Math.max(0, int(km10 ?? null, 0)) / 10,
  };
}

/** Null when the URL carries no itinerary at all — i.e. not a kiosk QR. */
export function parseAiCourseParams(loc: Location = window.location): AiCourseParams | null {
  const q = new URLSearchParams(loc.search);

  const days: ParsedDay[] = [];
  for (const [key, value] of q.entries()) {
    const m = /^d(\d+)$/.exec(key);
    if (!m) continue;
    const stops = value.split('_').map(parseStop).filter((s): s is ParsedStop => s !== null);
    if (stops.length > 0) days.push({ day: Number(m[1]), stops });
  }
  if (days.length === 0) return null;
  days.sort((a, b) => a.day - b.day);

  const course = (q.get('c') ?? 'A').toUpperCase();

  return {
    lang: parseLang(q.get('lang')),
    course: COURSE_TITLE[course] ? course : 'A',
    transport: (q.get('t') ?? 'CAR').toUpperCase(),
    party: Math.max(1, int(q.get('p'), 1)),
    nights: Math.max(0, int(q.get('n'), 0)),
    interests: (q.get('i') ?? '')
      .split('.')
      .map((s) => Number(s))
      .filter((n) => Number.isFinite(n) && n > 0),
    totalMinutes: q.has('tm') ? int(q.get('tm'), 0) : null,
    travelMinutes: q.has('tv') ? int(q.get('tv'), 0) : null,
    difficulty: Math.max(0, int(q.get('g'), 0)),
    kiosk: q.has('k') ? Math.max(1, int(q.get('k'), 6)) : 6,
    days,
  };
}

/** The kiosk strips the numeric prefix off a category before showing it. */
function stripPrefix(s: string): string {
  return s.replace(/^\s*\d+\s*(?:[-.)]+\s*|\s+(?=\D))/, '').trim();
}

/** The shops API sends coordinates as numbers today; a string is tolerated. */
function coord(v: unknown): number | null {
  const n = typeof v === 'number' ? v : typeof v === 'string' && v.trim() ? Number(v) : Number.NaN;
  return Number.isFinite(n) ? n : null;
}

const text = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');

/**
 * Load every shop the itinerary names, then assemble the page's course.
 *
 * Shops are fetched once each even when a spot repeats across days, and a shop
 * that fails to load is DROPPED rather than drawn blank — a card with no name
 * or address is worse than a shorter list. The stop after a dropped one loses
 * its leg too: that leg was measured from a place the page no longer shows.
 */
export async function loadAiCourseFromLocation(
  loc: Location = window.location,
): Promise<AiCourse | null> {
  const params = parseAiCourseParams(loc);
  if (!params) return null;

  const { lang, course } = params;
  const fallback = COURSE_FALLBACK[course] ?? COURSE_FALLBACK.A!;
  const courseTitle = pick(COURSE_TITLE[course]!, lang);

  const ids = [...new Set(params.days.flatMap((d) => d.stops.map((s) => s.shopId)))];
  const loaded = await Promise.all(
    ids.map(async (id) => {
      try {
        return [id, await fetchShopById(id)] as const;
      } catch (e) {
        console.error(`shop ${id} failed to load`, e);
        return [id, null] as const;
      }
    }),
  );
  const shopById = new Map<number, ApiShop | null>(loaded);

  const days: AiCourseDay[] = params.days
    .map((d) => {
      const spots: AiCourseSpot[] = [];
      let previousDropped = false;
      d.stops.forEach((stop, i) => {
        const shop = shopById.get(stop.shopId);
        if (!shop) {
          previousDropped = true;
          return;
        }
        const fields = shopToDetailFields(shop, lang);
        const category = stripPrefix(fields.category);
        const dwellValue =
          stop.dwellMinutes > 0 ? minutesLabel(stop.dwellMinutes, lang) : pick(fallback.spotDuration, lang);
        const legKnown = !previousDropped && stop.travelMinutes > 0;
        previousDropped = false;

        spots.push({
          id: `${d.day}-${i}-${stop.shopId}`,
          shopId: shop.id,
          day: d.day,
          order: spots.length + 1,
          name: fields.name,
          tag: category ? `#${category}` : '',
          category,
          photos: fields.photos,
          address: fields.address,
          description: fields.description,
          hashtags: fields.tags,
          hours: fields.hours.replace(/\s+/g, ' ').trim(),
          phone: fields.phone,
          dwellValue,
          dwell: `${pick(STAT_LABEL.dwell!, lang)} : ${dwellValue}`,
          lat: coord(shop['latitude']),
          lng: coord(shop['longitude']),
          naverLink: text(shop['naverLink']),
          legTime: legKnown ? minutesLabel(stop.travelMinutes, lang) : '',
          legKm: legKnown && stop.travelKm > 0 ? kmLabel(stop.travelKm) : '',
        });
      });
      return {
        day: d.day,
        label: `DAY ${d.day}`,
        title: courseNameWithDay(courseTitle, d.day, lang),
        spots,
      };
    })
    .filter((d) => d.spots.length > 0);

  if (days.length === 0) return null;

  /**
   * The second stat is 이동시간 on the scheduled path and 이동거리 on the offline
   * one — the same split the kiosk's summary bar makes.
   */
  const travelStat =
    params.travelMinutes !== null
      ? { label: pick(STAT_LABEL.travel!, lang), value: minutesLabel(params.travelMinutes, lang) }
      : { label: pick(STAT_LABEL.distance!, lang), value: pick(fallback.distance, lang) };

  return {
    lang,
    transport: params.transport,
    hashtags: pick(COURSE_TAGS[course] ?? {}, lang),
    summary: [
      {
        label: pick(STAT_LABEL.total!, lang),
        value:
          params.totalMinutes !== null
            ? aboutMinutesLabel(params.totalMinutes, lang)
            : pick(fallback.duration, lang),
      },
      travelStat,
      {
        label: pick(PARTY_STAY_LABEL, lang),
        value: `${partyLabel(params.party, lang)} / ${nightsLabel(params.nights, lang)}`,
      },
      {
        label: pick(STAT_LABEL.transport!, lang),
        value: pick(TRANSPORT_WORD[params.transport] ?? TRANSPORT_WORD.CAR!, lang),
      },
    ],
    // The kiosk echoes 즐길 거리 on the 커스텀 코스 only; a theme has none to show.
    filters:
      course === 'X'
        ? params.interests
            .map((code) => aiCategoryLabel(code, lang))
            .filter((s): s is string => Boolean(s))
        : [],
    startLabel: startPlaceLabel(params.kiosk, lang),
    days,
  };
}
