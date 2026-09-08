/**
 * Read the kiosk QR's `/ai` query and turn it into a display-ready course.
 *
 * Mirror of `buildAiCourseSaveUrlForQr` in kiosk-app
 * (`src/renderer/src/lib/aiCourseSave.ts`) — change one and change the other.
 *
 *   /ai?c=A&t=CAR&p=2&n=3&v=250913&lang=ko&i=22.7.17
 *      &tm=280&tv=95&g=1&d1=1612.150.1_1043.120.1&d2=...
 *
 * The QR carries ids and numbers only. Every string on the page comes either
 * from GET /api/shops/{id} (per spot) or from this app's own tables (labels),
 * so the page localizes without the kiosk having to send any Korean.
 */
import type { Lang } from '../types';
import { fetchShopById, parseLang, shopToDetailFields } from '../shopApi';
import { aiCategoryLabel } from './aiCategories';
import type { AiCourse, AiCourseDay, AiCourseSpot } from './aiCourse';
import {
  COURSE_FALLBACK,
  COURSE_TAGS,
  COURSE_TITLE,
  DIFFICULTY_WORD,
  STAT_LABEL,
  TRANSPORT_WORD,
  courseNameWithDay,
  minutesLabel,
  nightsLabel,
  partyLabel,
  pick,
} from './aiCourseI18n';

interface ParsedStop {
  shopId: number;
  dwellMinutes: number;
  difficulty: number;
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
  days: ParsedDay[];
}

function int(raw: string | null, fallback: number): number {
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

/** `1612.150.1` — dwell and difficulty are trimmed when zero. */
function parseStop(token: string): ParsedStop | null {
  const [id, dwell, grade] = token.split('.');
  const shopId = Number(id);
  if (!Number.isFinite(shopId) || shopId <= 0) return null;
  return {
    shopId,
    dwellMinutes: Math.max(0, int(dwell ?? null, 0)),
    difficulty: Math.max(0, int(grade ?? null, 0)),
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
    days,
  };
}

/** The kiosk strips the numeric prefix off a category before showing it. */
function stripPrefix(s: string): string {
  return s.replace(/^\s*\d+\s*(?:[-.)]+\s*|\s+(?=\D))/, '').trim();
}

/**
 * Load every shop the itinerary names, then assemble the page's course.
 *
 * Shops are fetched once each even when a spot repeats across days, and a shop
 * that fails to load is DROPPED rather than drawn blank — a card with no name
 * or address is worse than a shorter list.
 */
export async function loadAiCourseFromLocation(
  loc: Location = window.location,
): Promise<AiCourse | null> {
  const params = parseAiCourseParams(loc);
  if (!params) return null;

  const { lang, course } = params;
  const fallback = COURSE_FALLBACK[course] ?? COURSE_FALLBACK.A!;

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
  const shopById = new Map(loaded);

  const toSpot = (stop: ParsedStop, key: string): AiCourseSpot | null => {
    const shop = shopById.get(stop.shopId);
    if (!shop) return null;
    const fields = shopToDetailFields(shop, lang);

    const dwell =
      stop.dwellMinutes > 0
        ? minutesLabel(stop.dwellMinutes, lang)
        : pick(fallback.spotDuration, lang);
    const grade = stop.difficulty > 0 ? stop.difficulty : fallback.spotDifficulty;
    const category = stripPrefix(fields.category);

    return {
      id: key,
      name: fields.name,
      tag: category ? `#${category}` : '',
      photo: fields.photos[0] ?? '',
      address: fields.address,
      description: fields.description,
      stayTime: `${pick(STAT_LABEL.dwell!, lang)} : ${dwell}`,
      level: grade > 0 ? `${pick(STAT_LABEL.difficulty!, lang)} : ${pick(DIFFICULTY_WORD[grade] ?? {}, lang)}` : '',
    };
  };

  const days: AiCourseDay[] = params.days
    .map((d) => ({
      day: d.day,
      label: `DAY ${d.day}`,
      spots: d.stops
        .map((stop, i) => toSpot(stop, `${d.day}-${i}-${stop.shopId}`))
        .filter((s): s is AiCourseSpot => s !== null),
    }))
    .filter((d) => d.spots.length > 0);

  if (days.length === 0) return null;

  /**
   * The third stat is 이동시간 on the scheduled path and 이동거리 on the offline
   * one — same split the kiosk makes, because the endpoint returns no distance
   * and an authored "약 18Km" beside real numbers would be worse than an honest
   * fourth stat.
   */
  const travelStat =
    params.travelMinutes !== null
      ? { label: pick(STAT_LABEL.travel!, lang), value: minutesLabel(params.travelMinutes, lang) }
      : { label: pick(STAT_LABEL.distance ?? STAT_LABEL.travel!, lang), value: pick(fallback.distance, lang) };

  const grade = params.difficulty > 0 ? params.difficulty : fallback.difficulty;

  return {
    lang,
    subtitle: courseNameWithDay(pick(COURSE_TITLE[course]!, lang), days[0]!.day, lang),
    hashtags: pick(COURSE_TAGS[course]!, lang),
    summary: [
      {
        label: pick(STAT_LABEL.total!, lang),
        value:
          params.totalMinutes !== null
            ? minutesLabel(params.totalMinutes, lang)
            : pick(fallback.duration, lang),
      },
      {
        label: pick(STAT_LABEL.transport!, lang),
        value: pick(TRANSPORT_WORD[params.transport] ?? TRANSPORT_WORD.CAR!, lang),
      },
      travelStat,
      {
        label: pick(STAT_LABEL.difficulty!, lang),
        value: pick(DIFFICULTY_WORD[grade] ?? {}, lang),
      },
    ],
    filters: [
      partyLabel(params.party, lang),
      nightsLabel(params.nights, lang),
      ...params.interests
        .map((code) => aiCategoryLabel(code, lang))
        .filter((s): s is string => Boolean(s)),
    ],
    days,
  };
}
