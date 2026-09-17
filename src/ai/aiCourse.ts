/**
 * AI course result shown on the phone — the kiosk's result page (Figma
 * 7058:21462 / 7058:22277) rebuilt for a phone: subtitle, summary bar, DAY tabs
 * on a white sheet, and a numbered timeline of stop cards, each opening its own
 * detail with directions.
 */
import type { Lang } from '../types';

export interface AiCourseSummaryItem {
  /** Small caption above the value, e.g. `총 소요시간`. */
  label: string;
  /** Bold value, e.g. `약 4시간 30분`. */
  value: string;
}

export interface AiCourseSpot {
  /** Unique within the course — also the `#spot=` hash that opens its detail. */
  id: string;
  shopId: number;
  day: number;
  /** 1-based position within its day — the disc number. */
  order: number;
  name: string;
  /** `#유산` — the category as the card's tag. */
  tag: string;
  /** `유산` — the same, bare, for the detail's chip. */
  category: string;
  photos: string[];
  address: string;
  description: string;
  /** The shop's own hashtag line. */
  hashtags: string;
  /** `08:00-20:00` — drawn without a label, as the kiosk card does. '' when unknown. */
  hours: string;
  phone: string;
  /** `2시간` */
  dwellValue: string;
  /** `머무는 시간 : 2시간` */
  dwell: string;
  lat: number | null;
  lng: number | null;
  naverLink: string;
  /** The leg INTO this stop — `15분` / `1.1km`; '' when the QR carried none. */
  legTime: string;
  legKm: string;
}

export interface AiCourseDay {
  day: number;
  /** `DAY 1` — the tab. */
  label: string;
  /** `자연·유산 탐방 코스 - 1일차` — the subtitle while this day is open. */
  title: string;
  spots: AiCourseSpot[];
}

export interface AiCourse {
  lang: Lang;
  /** The QR's 이동수단 code — picks the Google Maps travel mode. */
  transport: string;
  /** `#자연 #유산 #힐링` */
  hashtags: string;
  /** 총 소요시간 · 이동시간 · 방문 인원/일정 · 이동수단, in the kiosk's order. */
  summary: AiCourseSummaryItem[];
  /** The 커스텀 코스's 즐길 거리 chips; empty for a themed course. */
  filters: string[];
  /** `제주국제공항(Jeju International Airport)` — DAY 1's start plate. */
  startLabel: string;
  days: AiCourseDay[];
}

const SAMPLE_PHOTO = '/ai-course/sample-place.png';

function sampleSpot(day: number, order: number, legTime = '', legKm = ''): AiCourseSpot {
  return {
    id: `${day}-${order - 1}-demo`,
    shopId: 0,
    day,
    order,
    name: '뱅크시 전시회',
    tag: '#유산',
    category: '유산',
    photos: [SAMPLE_PHOTO, SAMPLE_PHOTO],
    address: '서울시 중구 충무로5길 24 1층',
    description: '유네스코 자연유산으로 지정된 제주대표명소 탁 트인 전망과 함께 산책을 즐겨보세요.',
    hashtags: '#전시 #실내 #포토존',
    hours: '08:00-20:00',
    phone: '064-740-6000',
    dwellValue: '2-3시간',
    dwell: '머무는 시간 : 2-3시간',
    lat: 33.3575,
    lng: 126.46292,
    naverLink: '',
    legTime,
    legKm,
  };
}

/** `/ai?demo=1` — the artboard's own placeholder content, for design review. */
export function demoCourse(): AiCourse {
  return {
    lang: 'ko',
    transport: 'CAR',
    hashtags: '#취향 #맞춤 #내맘대로',
    summary: [
      { label: '총 소요시간', value: '약 4~5시간' },
      { label: '이동시간', value: '1시간 5분' },
      { label: '방문 인원/ 일정', value: '2명 / 1박 2일' },
      { label: '이동수단', value: '자동차' },
    ],
    filters: ['흑돼지', '한식', '레저·액티비티'],
    startLabel: '제주국제공항(Jeju International Airport)',
    days: [1, 2].map((day) => ({
      day,
      label: `DAY ${day}`,
      title: `AI 맞춤 추천 코스 - ${day}일차`,
      spots: [
        sampleSpot(day, 1, '35분', '21.6km'),
        sampleSpot(day, 2, '15분', '1.1km'),
        sampleSpot(day, 3, '22분', '8.4km'),
        sampleSpot(day, 4, '11분', '2.9km'),
      ],
    })),
  };
}
