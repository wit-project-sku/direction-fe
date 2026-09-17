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

/**
 * Course code -> title. Mirrors COURSE_META.title (A/B/C/D) and AI_COURSE_NAME
 * (X) in the kiosk's JejuAiDetail. A / B / C are the themed courses; the kiosk
 * sends its own code for the two routes that are not one of those
 * (`AiCourseQrCourse` in kiosk-app's aiCourseSave):
 *   X — the 커스텀 코스, built from the visitor's own picks;
 *   D — 쇼핑·로컬 체험, which the API schedules as course B.
 */
export const COURSE_TITLE: Record<string, LangText> = {
  X: {
    ko: 'AI 맞춤 추천 코스', en: 'AI Custom Course', ja: 'AIおすすめコース', zh: 'AI定制推荐路线',
    vi: 'Lộ trình gợi ý AI', th: 'เส้นทางแนะนำโดย AI', ru: 'Маршрут от ИИ', id: 'Rute Rekomendasi AI',
  },
  D: {
    ko: '쇼핑·로컬 체험 코스', en: 'Shopping & Local', ja: 'ショッピング・ローカル体験コース',
    zh: '购物·当地体验路线', vi: 'Mua sắm & Trải nghiệm địa phương',
    th: 'เส้นทางช้อปปิ้งและท้องถิ่น', ru: 'Шопинг и местный колорит', id: 'Belanja & Pengalaman Lokal',
  },
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

/**
 * Course code -> the hashtag line under the subtitle. X is the 커스텀 코스
 * frame's own line (Figma 7058:21462); D is the kiosk's 쇼핑·로컬 tags.
 * COURSE_FALLBACK has no X / D rows on purpose: both fall back to A's
 * placeholders, which is also what the kiosk draws for them offline.
 */
export const COURSE_TAGS: Record<string, LangText> = {
  X: {
    ko: '#취향 #맞춤 #내맘대로', en: '#Taste #Custom #MyWay', ja: '#好み #カスタム #思いのまま',
    zh: '#喜好 #定制 #随心所欲', vi: '#Sởthích #Tùychỉnh #Theoýbạn',
    th: '#รสนิยม #ตามใจ #แบบของฉัน', ru: '#Вкус #Посвоему #Какхочу',
    id: '#Selera #Kustom #Sesukaku',
  },
  D: {
    ko: '#쇼핑 #로컬 #기념품', en: '#Shopping #Local #Souvenirs', ja: '#ショッピング #ローカル #お土産',
    zh: '#购物 #本地 #纪念品', vi: '#Muasắm #Địaphương #Quàlưuniệm',
    th: '#ช้อปปิ้ง #ท้องถิ่น #ของที่ระลึก', ru: '#Шопинг #Местное #Сувениры',
    id: '#Belanja #Lokal #Suvenir',
  },
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

/** "약 4시간 30분" — the summary bar's total. Mirrors `aboutMinutesLabel`. */
export function aboutMinutesLabel(total: number, lang: Lang): string {
  const prefix = pick(
    { ko: '약 ', en: 'Approx. ', ja: '約', zh: '约 ', vi: 'Khoảng ', th: 'ประมาณ ', ru: 'Около ', id: 'Sekitar ' },
    lang,
  );
  return `${prefix}${minutesLabel(total, lang)}`;
}

/** 1.1 → "1.1km" (whole kilometres from 100). Mirrors the kiosk's leg pill. */
export function kmLabel(km: number): string {
  return `${km >= 100 ? Math.round(km) : km.toFixed(1)}km`;
}

/** The summary bar's third caption. Mirrors STAT_LABEL.partyStay in JejuAiDetail. */
export const PARTY_STAY_LABEL: LangText = {
  ko: '방문 인원/ 일정', en: 'Group / Stay', ja: '人数 / 日程', zh: '人数 / 行程',
  vi: 'Số người / Lịch', th: 'จำนวนคน / กำหนดการ', ru: 'Гости / Срок', id: 'Orang / Jadwal',
};

/**
 * Where DAY 1 sets off — the kiosk the course was built on, by its number (the
 * QR's `k`). Mirrors START_PLACE in JejuAiDetail.
 */
export const START_PLACE: Record<number, LangText> = {
  6: {
    ko: '제주국제공항', en: 'Jeju International Airport', ja: '済州国際空港', zh: '济州国际机场',
    vi: 'Sân bay Quốc tế Jeju', th: 'ท่าอากาศยานนานาชาติเชจู', ru: 'Международный аэропорт Чеджу',
    id: 'Bandara Internasional Jeju',
  },
  7: {
    ko: '제주국제여객터미널', en: 'Jeju International Ferry Terminal', ja: '済州国際旅客ターミナル',
    zh: '济州国际客运码头', vi: 'Bến tàu khách quốc tế Jeju', th: 'ท่าเรือโดยสารระหว่างประเทศเชจู',
    ru: 'Международный пассажирский терминал Чеджу', id: 'Terminal Penumpang Internasional Jeju',
  },
  8: {
    ko: '세계자연유산본부', en: 'World Natural Heritage Center', ja: '世界自然遺産本部',
    zh: '世界自然遗产本部', vi: 'Trụ sở Di sản Thiên nhiên Thế giới', th: 'สำนักงานมรดกโลกทางธรรมชาติ',
    ru: 'Центр всемирного природного наследия', id: 'Kantor Warisan Alam Dunia',
  },
};

/** Korean reads "제주국제공항(Jeju International Airport)", as the kiosk plate does. */
export function startPlaceLabel(kiosk: number, lang: Lang): string {
  const names = START_PLACE[kiosk] ?? START_PLACE[6]!;
  return lang === 'ko' ? `${names.ko}(${names.en})` : pick(names, lang);
}

/** The stop detail's own copy. */
export const DETAIL_COPY = {
  back: {
    ko: '코스로 돌아가기', en: 'Back to course', ja: 'コースに戻る', zh: '返回路线',
    vi: 'Quay lại lộ trình', th: 'กลับไปที่เส้นทาง', ru: 'Назад к маршруту', id: 'Kembali ke rute',
  },
  viewDetail: {
    ko: '상세 보기', en: 'Details', ja: '詳細を見る', zh: '查看详情',
    vi: 'Xem chi tiết', th: 'ดูรายละเอียด', ru: 'Подробнее', id: 'Lihat detail',
  },
  address: {
    ko: '주소', en: 'Address', ja: '住所', zh: '地址', vi: 'Địa chỉ', th: 'ที่อยู่', ru: 'Адрес', id: 'Alamat',
  },
  hours: {
    ko: '영업시간', en: 'Hours', ja: '営業時間', zh: '营业时间',
    vi: 'Giờ mở cửa', th: 'เวลาทำการ', ru: 'Часы работы', id: 'Jam buka',
  },
  phone: {
    ko: '전화', en: 'Phone', ja: '電話', zh: '电话', vi: 'Điện thoại', th: 'โทรศัพท์', ru: 'Телефон', id: 'Telepon',
  },
  navTitle: {
    ko: '길찾기', en: 'Directions', ja: '経路案内', zh: '导航',
    vi: 'Chỉ đường', th: 'นำทาง', ru: 'Маршрут', id: 'Petunjuk arah',
  },
  navNote: {
    ko: '지도 앱을 선택하면 현재 위치에서 이 장소까지 길을 안내해요.',
    en: 'Pick a map app for directions from where you are to this place.',
    ja: '地図アプリを選ぶと、現在地からこの場所までご案内します。',
    zh: '选择地图应用，即可从当前位置导航到此地点。',
    vi: 'Chọn ứng dụng bản đồ để được chỉ đường từ vị trí hiện tại đến đây.',
    th: 'เลือกแอปแผนที่เพื่อนำทางจากตำแหน่งปัจจุบันมายังสถานที่นี้',
    ru: 'Выберите приложение карт, чтобы проложить маршрут от вашего местоположения.',
    id: 'Pilih aplikasi peta untuk petunjuk arah dari lokasi Anda ke tempat ini.',
  },
  kakao: {
    ko: '카카오맵', en: 'Kakao Map', ja: 'カカオマップ', zh: 'Kakao地图',
    vi: 'Kakao Map', th: 'Kakao Map', ru: 'Kakao Map', id: 'Kakao Map',
  },
  naver: {
    ko: '네이버 지도', en: 'Naver Map', ja: 'NAVERマップ', zh: 'Naver地图',
    vi: 'Naver Map', th: 'Naver Map', ru: 'Naver Map', id: 'Naver Map',
  },
  google: {
    ko: '구글 지도', en: 'Google Maps', ja: 'Googleマップ', zh: '谷歌地图',
    vi: 'Google Maps', th: 'Google Maps', ru: 'Google Карты', id: 'Google Maps',
  },
  prev: {
    ko: '이전 장소', en: 'Previous stop', ja: '前の場所', zh: '上一个地点',
    vi: 'Điểm trước', th: 'สถานที่ก่อนหน้า', ru: 'Предыдущая', id: 'Tempat sebelumnya',
  },
  next: {
    ko: '다음 장소', en: 'Next stop', ja: '次の場所', zh: '下一个地点',
    vi: 'Điểm tiếp theo', th: 'สถานที่ถัดไป', ru: 'Следующая', id: 'Tempat berikutnya',
  },
} satisfies Record<string, LangText>;

/** "1일차 · 2번째 장소" */
export function stopPositionLabel(day: number, order: number, lang: Lang): string {
  return pick(
    {
      ko: `${day}일차 · ${order}번째 장소`, en: `Day ${day} · Stop ${order}`,
      ja: `${day}日目 · ${order}番目の場所`, zh: `第${day}天 · 第${order}站`,
      vi: `Ngày ${day} · Điểm ${order}`, th: `วันที่ ${day} · จุดที่ ${order}`,
      ru: `День ${day} · Остановка ${order}`, id: `Hari ${day} · Tempat ${order}`,
    },
    lang,
  );
}

/** "뱅크시 전시회에서" — where a leg starts. */
export function fromPlaceLabel(place: string, lang: Lang): string {
  return pick(
    {
      ko: `${place}에서`, en: `From ${place}`, ja: `${place}から`, zh: `从${place}出发`,
      vi: `Từ ${place}`, th: `จาก ${place}`, ru: `От: ${place}`, id: `Dari ${place}`,
    },
    lang,
  );
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
