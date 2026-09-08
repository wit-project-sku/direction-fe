/** AI course result shown on the phone (kiosk node 6760:18772, header omitted). */
import type { Lang } from '../types';

export interface AiCourseSummaryItem {
  /** Small caption above the value, e.g. `총 소요시간`. */
  label: string;
  /** Bold value, e.g. `약 4~5시간`. */
  value: string;
}

export interface AiCourseSpot {
  id: string;
  name: string;
  /** Category hashtag shown to the right of the name, e.g. `#유산`. */
  tag: string;
  photo: string;
  address: string;
  /** Rendered as one block, clamped like the artboard. */
  description: string;
  /** Ready to draw: `머무는 시간 : 2-3시간`. */
  stayTime: string;
  /** Ready to draw: `난이도 : 쉬움`. Empty where the server graded nothing. */
  level: string;
}

export interface AiCourseDay {
  day: number;
  /** `DAY 1` */
  label: string;
  spots: AiCourseSpot[];
}

export interface AiCourse {
  lang: Lang;
  /** `자연·유산 탐방 코스 - 1일차` */
  subtitle: string;
  /** `#자연 #유산 #힐링` */
  hashtags: string;
  summary: AiCourseSummaryItem[];
  /** Search conditions echoed back as pills. */
  filters: string[];
  /**
   * Every day of the trip. The kiosk pages between days with its arrow pair;
   * the phone scrolls, so all of them are drawn one after another under their
   * own DAY heading.
   */
  days: AiCourseDay[];
}

const SAMPLE_PHOTO = '/ai-course/sample-place.png';

function sampleSpot(id: string, name: string, tag: string): AiCourseSpot {
  return {
    id,
    name,
    tag,
    photo: SAMPLE_PHOTO,
    address: '서울시 중구 충무로5길 24 1층',
    description: '유네스코 자연유산으로 지정된 제주대표명소 탁 트인 전망과 함께 산책을 즐겨보세요.',
    stayTime: '머무는 시간 : 2-3시간',
    level: '난이도 : 쉬움',
  };
}

/** `/ai?demo=1` — the artboard's own placeholder content, for design review. */
export function demoCourse(): AiCourse {
  return {
    lang: 'ko',
    subtitle: '자연·유산 탐방 코스 - 1일차',
    hashtags: '#자연 #유산 #힐링',
    summary: [
      { label: '총 소요시간', value: '약 4~5시간' },
      { label: '이동수단', value: '자동차' },
      { label: '이동거리', value: '약 18Km' },
      { label: '난이도', value: '쉬움' },
    ],
    filters: ['2명', '3박 이상', '3박 이상', '흑돼지', '한식', '레저·액티비티'],
    days: [
      {
        day: 1,
        label: 'DAY 1',
        spots: [
          sampleSpot('1', '뱅크시 전시회', '#유산'),
          sampleSpot('2', '뱅크시 전시회', '#유산'),
          sampleSpot('3', '뱅크시 전시회', '#유산'),
          sampleSpot('4', '뱅크시 전시회', '#유산'),
        ],
      },
    ],
  };
}
