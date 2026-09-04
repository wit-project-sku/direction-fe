import type { ReactElement } from 'react';
import type { DetailPayload, Lang, ShopRoute, ShopTransitLeg } from './types';
import styles from './Directions.module.css';

const T = {
  fromAirport: {
    ko: '제주공항에서',
    en: 'From Jeju Airport',
    ja: '済州空港から',
    zh: '从济州机场',
    vi: 'Từ sân bay Jeju',
    th: 'จากสนามบินเชจู',
    ru: 'От аэропорта Чеджу',
    id: 'Dari Bandara Jeju',
  },
  car: {
    ko: '자동차', en: 'Car', ja: '自動車', zh: '汽车', vi: 'Ô tô', th: 'รถยนต์', ru: 'Авто', id: 'Mobil',
  },
  bike: {
    ko: '자전거', en: 'Bicycle', ja: '自転車', zh: '自行车', vi: 'Xe đạp', th: 'จักรยาน', ru: 'Велосипед', id: 'Sepeda',
  },
  walk: {
    ko: '도보', en: 'Walk', ja: '徒歩', zh: '步行', vi: 'Đi bộ', th: 'เดิน', ru: 'Пешком', id: 'Jalan kaki',
  },
  shuttle: {
    ko: '공항 셔틀', en: 'Airport shuttle', ja: '空港シャトル', zh: '机场班车',
    vi: 'Xe đưa sân bay', th: 'รถรับส่งสนามบิน', ru: 'Аэропортный шаттл', id: 'Antar-jemput bandara',
  },
  shuttleNote: {
    ko: '공항에서 업체 셔틀버스로 이동합니다',
    en: 'Take the company shuttle bus from the airport',
    ja: '空港から各社シャトルバスで移動します',
    zh: '从机场乘坐各公司班车前往',
    vi: 'Di chuyển bằng xe đưa của công ty từ sân bay',
    th: 'เดินทางด้วยรถรับส่งของบริษัทจากสนามบิน',
    ru: 'Доберитесь на шаттле компании от аэропорта',
    id: 'Naik shuttle perusahaan dari bandara',
  },
  bus: {
    ko: '버스', en: 'Bus', ja: 'バス', zh: '公交', vi: 'Xe buýt', th: 'รถเมล์', ru: 'Автобус', id: 'Bus',
  },
  aboutMin: {
    ko: (n: number) => `약 ${n}분`,
    en: (n: number) => `Approx. ${n} min`,
    ja: (n: number) => `約${n}分`,
    zh: (n: number) => `约 ${n} 分钟`,
    vi: (n: number) => `Khoảng ${n} phút`,
    th: (n: number) => `ประมาณ ${n} นาที`,
    ru: (n: number) => `Около ${n} мин`,
    id: (n: number) => `Sekitar ${n} menit`,
  },
  board: {
    ko: (n: string) => `${n}번`,
    en: (n: string) => `Board ${n}`,
    ja: (n: string) => `${n}番 乗車`,
    zh: (n: string) => `乘坐 ${n} 路`,
    vi: (n: string) => `Lên xe ${n}`,
    th: (n: string) => `ขึ้น ${n}`,
    ru: (n: string) => `Садиться ${n}`,
    id: (n: string) => `Naik ${n}`,
  },
  transfer: {
    ko: (n: string) => `${n}번`,
    en: (n: string) => `Transfer ${n}`,
    ja: (n: string) => `${n}番 乗換`,
    zh: (n: string) => `换乘 ${n} 路`,
    vi: (n: string) => `Chuyển ${n}`,
    th: (n: string) => `ต่อ ${n}`,
    ru: (n: string) => `Пересадка ${n}`,
    id: (n: string) => `Transfer ${n}`,
  },
  alight: {
    ko: '하차', en: 'Get off', ja: '降車', zh: '下车', vi: 'Xuống xe', th: 'ลง', ru: 'Выход', id: 'Turun',
  },
  rideMeta: {
    ko: (stops: number, min: number) => `${stops}정류장 · 약 ${min}분`,
    en: (stops: number, min: number) => `${stops} stops · approx. ${min} min`,
    ja: (stops: number, min: number) => `${stops}停留所 · 約${min}分`,
    zh: (stops: number, min: number) => `${stops}站 · 约${min}分钟`,
    vi: (stops: number, min: number) => `${stops} trạm · khoảng ${min} phút`,
    th: (stops: number, min: number) => `${stops} ป้าย · ประมาณ ${min} นาที`,
    ru: (stops: number, min: number) => `${stops} ост. · около ${min} мин`,
    id: (stops: number, min: number) => `${stops} halte · sekitar ${min} menit`,
  },
  walkMeta: {
    ko: (min: number) => `도보 약 ${min}분`,
    en: (min: number) => `Walk approx. ${min} min`,
    ja: (min: number) => `徒歩 約${min}分`,
    zh: (min: number) => `步行约 ${min} 分钟`,
    vi: (min: number) => `Đi bộ khoảng ${min} phút`,
    th: (min: number) => `เดิน ประมาณ ${min} นาที`,
    ru: (min: number) => `Пешком около ${min} мин`,
    id: (min: number) => `Jalan kaki sekitar ${min} menit`,
  },
  footnote: {
    ko: (month: string) => `${month} 기준 · 배차 간격은 정류장에서 확인하세요`,
    en: (month: string) => `As of ${month} · Check intervals at the stop`,
    ja: (month: string) => `${month} 基準 · 運行間隔は停留所でご確認ください`,
    zh: (month: string) => `${month} 基准 · 请在站点确认发车间隔`,
    vi: (month: string) => `Tính đến ${month} · Kiểm tra tần suất tại trạm`,
    th: (month: string) => `ข้อมูล ${month} · ตรวจสอบช่วงเวลาได้ที่ป้าย`,
    ru: (month: string) => `По состоянию на ${month} · Интервалы уточняйте на остановке`,
    id: (month: string) => `Per ${month} · Cek interval di halte`,
  },
};

function pick<T>(map: Partial<Record<Lang, T>>, lang: Lang): T {
  return (map[lang] ?? map.ko ?? map.en) as T;
}

function legName(leg: ShopTransitLeg, lang: Lang): string {
  if (lang === 'en' && leg.boardStopNameEn) return leg.boardStopNameEn;
  if (lang === 'ja' && leg.boardStopNameJp) return leg.boardStopNameJp;
  if (lang === 'zh' && leg.boardStopNameCh) return leg.boardStopNameCh;
  return leg.boardStopNameKr;
}

function busStopName(
  stop: NonNullable<ShopRoute['busStop']>,
  lang: Lang,
): string {
  if (lang === 'en' && stop.nameEn) return stop.nameEn;
  if (lang === 'ja' && stop.nameJp) return stop.nameJp;
  if (lang === 'zh' && stop.nameCh) return stop.nameCh;
  return stop.nameKr;
}

interface TimelineNode {
  key: string;
  kind: 'ride' | 'alight' | 'dest';
  name: string;
  meta?: string;
  pill?: { label: string; dark?: boolean };
  dashed?: boolean;
  last?: boolean;
}

function buildTimeline(route: ShopRoute, destination: string, lang: Lang): TimelineNode[] {
  const transit = route.transit;
  const busStop = route.busStop;
  if (!transit || transit.status !== 'FOUND' || !Array.isArray(transit.legs) || transit.legs.length === 0) {
    return [];
  }

  const nodes: TimelineNode[] = transit.legs.map((leg, index) => ({
    key: `leg-${index}-${leg.routeNum}`,
    kind: 'ride' as const,
    name: legName(leg, lang),
    meta: pick(T.rideMeta, lang)(leg.rideStops, leg.rideMin),
    pill: {
      label: index === 0 ? pick(T.board, lang)(leg.routeNum) : pick(T.transfer, lang)(leg.routeNum),
    },
  }));

  if (busStop?.nameKr) {
    const walk = busStop.walkMin;
    nodes.push({
      key: 'alight',
      kind: 'alight',
      name: busStopName(busStop, lang),
      meta: typeof walk === 'number' && Number.isFinite(walk) ? pick(T.walkMeta, lang)(walk) : undefined,
      pill: { label: pick(T.alight, lang), dark: true },
    });
  }

  nodes.push({ key: 'dest', kind: 'dest', name: destination, last: true });
  const beforeDest = nodes[nodes.length - 2];
  if (beforeDest) beforeDest.dashed = true;
  return nodes;
}

interface Props {
  payload: DetailPayload;
}

export function Directions({ payload }: Props): ReactElement | null {
  const { lang, name, route, showShuttle, showFerry, ferryModeLabel } = payload;

  if (showFerry && ferryModeLabel) {
    return (
      <div className={styles.wrap}>
        <div className={styles.modeList}>
          <div className={styles.shuttleCard}>
            <div className={styles.modeHead}>
              <span className={styles.modeHeadLeft}>
                <span className={styles.modeIcon} aria-hidden>⛴️</span>
                <span className={styles.modeLabel}>{ferryModeLabel}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!route || typeof route.distanceKm !== 'number' || !Number.isFinite(route.distanceKm)) {
    return null;
  }

  const carMin = route.durationMin;
  const bikeMin = typeof route.bikeMin === 'number' ? route.bikeMin : null;
  const walkMin = typeof route.walkMin === 'number' ? route.walkMin : null;
  const transit = route.transit;
  const showBus = transit?.status === 'FOUND' && typeof transit.totalMin === 'number';
  const timeline = buildTimeline(route, name, lang);
  const about = pick(T.aboutMin, lang);

  return (
    <div className={styles.wrap}>
      <p className={styles.distance}>
        {pick(T.fromAirport, lang)}{' '}
        <span className={styles.distanceKm}>{route.distanceKm.toFixed(1)}</span> km
      </p>

      <div className={styles.modeList}>
        {showShuttle && (
          <div className={styles.shuttleCard}>
            <div className={styles.modeHead}>
              <span className={styles.modeHeadLeft}>
                <span className={styles.modeIcon} aria-hidden>🚌</span>
                <span className={styles.modeLabel}>{pick(T.shuttle, lang)}</span>
              </span>
              {typeof carMin === 'number' && Number.isFinite(carMin) && (
                <span className={`${styles.modeTime} ${styles.modeTimeAccent}`}>{about(carMin)}</span>
              )}
            </div>
            <p className={styles.shuttleNote}>
              <span className={styles.shuttleBullet} aria-hidden />
              {pick(T.shuttleNote, lang)}
            </p>
          </div>
        )}

        {typeof carMin === 'number' && Number.isFinite(carMin) && (
          <div className={styles.modeHead}>
            <span className={styles.modeHeadLeft}>
              <span className={styles.modeIcon} aria-hidden>🚗</span>
              <span className={styles.modeLabel}>{pick(T.car, lang)}</span>
            </span>
            <span className={styles.modeTime}>{about(carMin)}</span>
          </div>
        )}

        {showBus && timeline.length > 0 && (
          <div className={styles.busCard}>
            <div className={styles.modeHead}>
              <span className={styles.modeHeadLeft}>
                <span className={styles.modeIcon} aria-hidden>🚌</span>
                <span className={styles.modeLabel}>{pick(T.bus, lang)}</span>
              </span>
              <span className={`${styles.modeTime} ${styles.modeTimeAccent}`}>
                {about(transit!.totalMin!)}
              </span>
            </div>

            <div className={styles.timeline}>
              {timeline.map((node) => (
                <div
                  key={node.key}
                  className={[
                    styles.stop,
                    node.dashed ? styles.stopDashed : '',
                    node.last ? styles.stopLast : '',
                    node.kind === 'dest' ? styles.stopDest : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <div className={styles.rail}>
                    <span
                      className={`${styles.dot} ${node.kind === 'dest' ? styles.dotHollow : ''}`}
                      aria-hidden
                    />
                  </div>
                  <div className={styles.stopBody}>
                    <div className={styles.stopTop}>
                      <p className={`${styles.stopName} ${node.kind === 'dest' ? styles.stopNameDest : ''}`}>
                        {node.name}
                      </p>
                      {node.pill && (
                        <span className={`${styles.pill} ${node.pill.dark ? styles.pillDark : ''}`}>
                          {node.pill.label}
                        </span>
                      )}
                    </div>
                    {node.meta && <p className={styles.stopMeta}>{node.meta}</p>}
                  </div>
                </div>
              ))}
            </div>

            {transit?.basedOn && (
              <p className={styles.busFoot}>{pick(T.footnote, lang)(transit.basedOn)}</p>
            )}
          </div>
        )}

        {bikeMin != null && (
          <div className={styles.modeHead}>
            <span className={styles.modeHeadLeft}>
              <span className={styles.modeIcon} aria-hidden>🚲</span>
              <span className={styles.modeLabel}>{pick(T.bike, lang)}</span>
            </span>
            <span className={styles.modeTime}>{about(bikeMin)}</span>
          </div>
        )}

        {walkMin != null && (
          <div className={styles.modeHead}>
            <span className={styles.modeHeadLeft}>
              <span className={styles.modeIcon} aria-hidden>🚶</span>
              <span className={styles.modeLabel}>{pick(T.walk, lang)}</span>
            </span>
            <span className={styles.modeTime}>{about(walkMin)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
