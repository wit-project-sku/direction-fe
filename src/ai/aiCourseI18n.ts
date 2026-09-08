/**
 * Labels the `/ai` page draws itself, in the eight languages the kiosk ships.
 *
 * The kiosk resolves most of these through Localization_Jeju via `sheetText`;
 * the phone has no sheet, so the authored fallbacks from JejuAiDetail are
 * mirrored here. Keep them in step when the kiosk's change.
 */
import type { Lang } from '../types';
import type { LangText } from './aiCategories';

export function pick(map: LangText, lang: Lang): string {
  return map[lang] ?? map.ko ?? map.en ?? '';
}

/** Course letter -> title. Mirrors COURSE_META.title in JejuAiDetail. */
export const COURSE_TITLE: Record<string, LangText> = {
  A: {
    ko: '자연·유산 탐방 코스', en: 'Nature & Heritage', ja: '自然・遺産探訪コース',
    zh: '自然·遗产探访路线', vi: 'Thiên nhiên & Di sản',
    th: 'เส้นทางธรรมชาติและมรดก', ru: 'Природа и наследие', id: 'Alam & Warisan',
  },
  B: {
    ko: '맛집·감성 코스', en: 'Food & Vibes', ja: 'グルメ・雰囲気コース',
    zh: '美食·情调路线', vi: 'Ẩm thực & Cảm xúc',
    th: 'อาหารและบรรยากาศ', ru: 'Еда и атмосфера', id: 'Kuliner & Suasana',
  },
  C: {
    ko: '가족·체험 코스', en: 'Family & Activities', ja: '家族・体験コース',
    zh: '家庭·体验路线', vi: 'Gia đình & Trải nghiệm',
    th: 'ครอบครัวและกิจกรรม', ru: 'Семья и впечатления', id: 'Keluarga & Aktivitas',
  },
};

/** Course letter -> the hashtag line under the subtitle. */
export const COURSE_TAGS: Record<string, LangText> = {
  A: {
    ko: '#자연 #유산 #힐링', en: '#Nature #Heritage #Healing', ja: '#自然 #遺産 #ヒーリング',
    zh: '#自然 #遗产 #疗愈', vi: '#Thiênnhiên #Disản #Thưgiãn',
    th: '#ธรรมชาติ #มรดก #ผ่อนคลาย', ru: '#Природа #Наследие #Отдых',
    id: '#Alam #Warisan #Relaksasi',
  },
  B: {
    ko: '#미식 #감성 #로컬', en: '#Food #Vibes #Local', ja: '#グルメ #雰囲気 #ローカル',
    zh: '#美食 #情调 #本地', vi: '#Ẩmthực #Cảmxúc #Địaphương',
    th: '#อาหาร #บรรยากาศ #ท้องถิ่น', ru: '#Еда #Атмосфера #Местное',
    id: '#Kuliner #Suasana #Lokal',
  },
  C: {
    ko: '#가족 #체험 #즐거움', en: '#Family #Experience #Fun', ja: '#家族 #体験 #楽しさ',
    zh: '#家庭 #体验 #欢乐', vi: '#Giađình #Trảinghiệm #Vuivẻ',
    th: '#ครอบครัว #กิจกรรม #สนุก', ru: '#Семья #Впечатления #Веселье',
    id: '#Keluarga #Pengalaman #Seru',
  },
};

export const STAT_LABEL: Record<string, LangText> = {
  total: {
    ko: '총 소요시간', en: 'Total time', ja: '所要時間', zh: '总时长',
    vi: 'Tổng thời gian', th: 'เวลารวม', ru: 'Всего времени', id: 'Total waktu',
  },
  dwell: {
    ko: '머무는 시간', en: 'Time here', ja: '滞在時間', zh: '停留时间',
    vi: 'Thời gian ở lại', th: 'เวลาที่แวะ', ru: 'Время на месте', id: 'Waktu di sini',
  },
  transport: {
    ko: '이동수단', en: 'Getting around', ja: '移動手段', zh: '交通方式',
    vi: 'Phương tiện', th: 'การเดินทาง', ru: 'Транспорт', id: 'Transportasi',
  },
  travel: {
    ko: '이동시간', en: 'Travel time', ja: '移動時間', zh: '移动时间',
    vi: 'Thời gian di chuyển', th: 'เวลาเดินทาง', ru: 'Время в пути', id: 'Waktu tempuh',
  },
  distance: {
    ko: '이동거리', en: 'Distance', ja: '移動距離', zh: '移动距离',
    vi: 'Quãng đường', th: 'ระยะทาง', ru: 'Расстояние', id: 'Jarak',
  },
  difficulty: {
    ko: '난이도', en: 'Difficulty', ja: '難易度', zh: '难度',
    vi: 'Độ khó', th: 'ระดับความยาก', ru: 'Сложность', id: 'Tingkat kesulitan',
  },
};

/** 이동수단 code -> word. Mirrors the questionnaire's four chips. */
export const TRANSPORT_WORD: Record<string, LangText> = {
  WALK: {
    ko: '도보', en: 'On foot', ja: '徒歩', zh: '步行',
    vi: 'Đi bộ', th: 'เดิน', ru: 'Пешком', id: 'Jalan kaki',
  },
  BIKE: {
    ko: '자전거', en: 'Bicycle', ja: '自転車', zh: '自行车',
    vi: 'Xe đạp', th: 'จักรยาน', ru: 'Велосипед', id: 'Sepeda',
  },
  TRANSIT: {
    ko: '대중교통', en: 'Public transit', ja: '公共交通', zh: '公共交通',
    vi: 'Giao thông công cộng', th: 'ขนส่งสาธารณะ', ru: 'Общественный транспорт',
    id: 'Transportasi umum',
  },
  CAR: {
    ko: '자동차', en: 'Car', ja: '自動車', zh: '汽车',
    vi: 'Ô tô', th: 'รถยนต์', ru: 'Автомобиль', id: 'Mobil',
  },
};

/** 1 = 쉬움 and up. Index 0 is "the server gave no grade". */
export const DIFFICULTY_WORD: LangText[] = [
  {},
  { ko: '쉬움', en: 'Easy', ja: 'やさしい', zh: '简单', vi: 'Dễ', th: 'ง่าย', ru: 'Лёгкий', id: 'Mudah' },
  { ko: '보통', en: 'Moderate', ja: 'ふつう', zh: '普通', vi: 'Trung bình', th: 'ปานกลาง', ru: 'Средний', id: 'Sedang' },
  { ko: '어려움', en: 'Hard', ja: 'むずかしい', zh: '困难', vi: 'Khó', th: 'ยาก', ru: 'Сложный', id: 'Sulit' },
];

export const VIEW_LABEL: Record<string, LangText> = {
  all: {
    ko: '전체보기', en: 'View all', ja: 'すべて表示', zh: '查看全部',
    vi: 'Xem tất cả', th: 'ดูทั้งหมด', ru: 'Показать всё', id: 'Lihat semua',
  },
  day: {
    ko: '선택보기', en: 'Selected day', ja: '選択日のみ', zh: '仅所选日',
    vi: 'Ngày đã chọn', th: 'เฉพาะวันที่เลือก', ru: 'Выбранный день', id: 'Hari terpilih',
  },
};

export const STATUS_COPY: Record<string, LangText> = {
  loading: {
    ko: '코스를 불러오는 중…', en: 'Loading your course…', ja: 'コースを読み込み中…',
    zh: '正在加载路线…', vi: 'Đang tải lộ trình…', th: 'กำลังโหลดเส้นทาง…',
    ru: 'Загрузка маршрута…', id: 'Memuat rute…',
  },
  missing: {
    ko: '키오스크 QR로 열어 주세요.', en: 'Open this page from the kiosk QR.',
    ja: 'キオスクのQRから開いてください。', zh: '请通过一体机二维码打开。',
    vi: 'Hãy mở bằng mã QR trên kiosk.', th: 'เปิดจาก QR บนคีออสก์',
    ru: 'Откройте через QR на киоске.', id: 'Buka lewat QR di kiosk.',
  },
};

/** The 박수 chip. 0 nights is 당일치기. */
export function nightsLabel(nights: number, lang: Lang): string {
  if (nights <= 0) {
    return pick(
      {
        ko: '당일치기', en: 'Day trip', ja: '日帰り', zh: '当天往返',
        vi: 'Đi trong ngày', th: 'ไป-กลับวันเดียว', ru: 'Однодневная', id: 'Sehari',
      },
      lang,
    );
  }
  const plural = nights > 1 ? 's' : '';
  return pick(
    {
      ko: `${nights}박 ${nights + 1}일`,
      en: `${nights} night${plural}`,
      ja: `${nights}泊${nights + 1}日`,
      zh: `${nights}晚${nights + 1}天`,
      vi: `${nights} đêm`,
      th: `${nights} คืน`,
      ru: `${nights} ноч.`,
      id: `${nights} malam`,
    },
    lang,
  );
}

/** The 인원 chip. */
export function partyLabel(party: number, lang: Lang): string {
  const people = party > 1 ? 'people' : 'person';
  return pick(
    {
      ko: `${party}명`,
      en: `${party} ${people}`,
      ja: `${party}名`,
      zh: `${party}人`,
      vi: `${party} người`,
      th: `${party} คน`,
      ru: `${party} чел.`,
      id: `${party} orang`,
    },
    lang,
  );
}

function minutePart(m: number, lang: Lang): string {
  return pick(
    { ko: `${m}분`, en: `${m} min`, ja: `${m}分`, zh: `${m} 分钟`, vi: `${m} phút`, th: `${m} นาที`, ru: `${m} мин`, id: `${m} menit` },
    lang,
  );
}

function hourPart(h: number, lang: Lang): string {
  return pick(
    { ko: `${h}시간`, en: `${h} hr`, ja: `${h}時間`, zh: `${h} 小时`, vi: `${h} giờ`, th: `${h} ชม.`, ru: `${h} ч`, id: `${h} jam` },
    lang,
  );
}

/** Minutes -> "4시간 30분". Mirrors `minutesLabel` in @renderer/lib/jejuCourse. */
export function minutesLabel(total: number, lang: Lang): string {
  const mins = Math.max(0, Math.round(total));
  const h = Math.floor(mins / 60);
  const m = mins % 60;

  if (h === 0) return minutePart(m, lang);
  if (m === 0) return hourPart(h, lang);
  return `${hourPart(h, lang)} ${minutePart(m, lang)}`;
}

/** "자연·유산 탐방 코스 - 1일차". Mirrors `jejuCourseNameWithDay`. */
export function courseNameWithDay(title: string, day: number, lang: Lang): string {
  const suffix = pick(
    {
      ko: `${day}일차`, en: `Day ${day}`, ja: `${day}日目`, zh: `第${day}天`,
      vi: `Ngày ${day}`, th: `วันที่ ${day}`, ru: `День ${day}`, id: `Hari ${day}`,
    },
    lang,
  );
  return `${title} - ${suffix}`;
}

/**
 * Authored per-course placeholders, mirroring COURSE_META in JejuAiDetail.
 *
 * Used only where the QR carries no scheduled number — i.e. the kiosk was on
 * its OFFLINE fallback and is itself drawing these. Keying them off the course
 * letter is why the wire format has no `dh`/`dg`/distance params.
 */
export interface CourseFallback {
  duration: LangText;
  distance: LangText;
  difficulty: number;
  spotDuration: LangText;
  spotDifficulty: number;
}

export const COURSE_FALLBACK: Record<string, CourseFallback> = {
  A: {
    duration: {
      ko: '약 4~5시간', en: 'Approx. 4–5 hrs', ja: '約4〜5時間', zh: '约 4–5 小时',
      vi: 'Khoảng 4–5 giờ', th: 'ประมาณ 4–5 ชม.', ru: 'Около 4–5 ч', id: 'Sekitar 4–5 jam',
    },
    distance: {
      ko: '약 18Km', en: 'Approx. 18 km', ja: '約18km', zh: '约 18 公里',
      vi: 'Khoảng 18 km', th: 'ประมาณ 18 กม.', ru: 'Около 18 км', id: 'Sekitar 18 km',
    },
    difficulty: 1,
    spotDuration: {
      ko: '2-3시간', en: '2–3 hrs', ja: '2〜3時間', zh: '2–3 小时',
      vi: '2–3 giờ', th: '2–3 ชม.', ru: '2–3 ч', id: '2–3 jam',
    },
    spotDifficulty: 1,
  },
  B: {
    duration: {
      ko: '약 4~5시간', en: 'Approx. 4–5 hrs', ja: '約4〜5時間', zh: '约 4–5 小时',
      vi: 'Khoảng 4–5 giờ', th: 'ประมาณ 4–5 ชม.', ru: 'Около 4–5 ч', id: 'Sekitar 4–5 jam',
    },
    distance: {
      ko: '약 15Km', en: 'Approx. 15 km', ja: '約15km', zh: '约 15 公里',
      vi: 'Khoảng 15 km', th: 'ประมาณ 15 กม.', ru: 'Около 15 км', id: 'Sekitar 15 km',
    },
    difficulty: 1,
    spotDuration: {
      ko: '1-2시간', en: '1–2 hrs', ja: '1〜2時間', zh: '1–2 小时',
      vi: '1–2 giờ', th: '1–2 ชม.', ru: '1–2 ч', id: '1–2 jam',
    },
    spotDifficulty: 1,
  },
  C: {
    duration: {
      ko: '약 5~6시간', en: 'Approx. 5–6 hrs', ja: '約5〜6時間', zh: '约 5–6 小时',
      vi: 'Khoảng 5–6 giờ', th: 'ประมาณ 5–6 ชม.', ru: 'Около 5–6 ч', id: 'Sekitar 5–6 jam',
    },
    distance: {
      ko: '약 22Km', en: 'Approx. 22 km', ja: '約22km', zh: '约 22 公里',
      vi: 'Khoảng 22 km', th: 'ประมาณ 22 กม.', ru: 'Около 22 км', id: 'Sekitar 22 km',
    },
    difficulty: 2,
    spotDuration: {
      ko: '2-3시간', en: '2–3 hrs', ja: '2〜3時間', zh: '2–3 小时',
      vi: '2–3 giờ', th: '2–3 ชม.', ru: '2–3 ч', id: '2–3 jam',
    },
    spotDifficulty: 1,
  },
};
