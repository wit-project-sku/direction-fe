import { Fragment, useCallback, useEffect, useMemo, useRef, useState, type ReactElement } from 'react';
import { demoCourse, type AiCourse, type AiCourseDay, type AiCourseSpot } from './aiCourse';
import { loadAiCourseFromLocation } from './loadAiCourse';
import { DETAIL_COPY, STATUS_COPY, pick } from './aiCourseI18n';
import { AiSpotDetail } from './AiSpotDetail';
import styles from './AiCoursePage.module.css';

interface Props {
  /** Injected in tests; production loads from the kiosk QR's query. */
  course?: AiCourse;
}

const SPOT_HASH = /^#spot=(.+)$/;

function spotIdFromHash(): string | null {
  const m = SPOT_HASH.exec(window.location.hash);
  return m ? decodeURIComponent(m[1]!) : null;
}

/**
 * `/ai` — phone view of the kiosk AI course result, reached by scanning the QR
 * on 제주 AI 코스 상세. The itinerary rides in the query as shopIds and numbers;
 * see `loadAiCourse` for the format.
 *
 * Laid out after the kiosk's result page (Figma 7058:21462 / 7058:22277) minus
 * its header: the course + day subtitle, the summary bar, the 즐길 거리 chips
 * (커스텀 코스 only), DAY tabs over a white sheet, DAY 1's start plate, and the
 * numbered timeline with a "15분 / 1.1km" pill on every leg.
 *
 * A card opens that stop's detail — photos, hours, phone and directions — as
 * `#spot=<id>`, so the phone's own back gesture returns to the list.
 */
export function AiCoursePage({ course: injected }: Props): ReactElement {
  const [course, setCourse] = useState<AiCourse | null>(injected ?? null);
  const [loading, setLoading] = useState(!injected);
  const [dayIndex, setDayIndex] = useState(0);
  const [spotId, setSpotId] = useState<string | null>(spotIdFromHash);
  /** True once THIS page pushed the #spot entry — only then is 뒤로 a history.back(). */
  const pushed = useRef(false);
  const listScroll = useRef(0);

  useEffect(() => {
    if (injected) return;

    if (new URLSearchParams(window.location.search).get('demo') === '1') {
      setCourse(demoCourse());
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    void loadAiCourseFromLocation()
      .then((loaded) => {
        if (!cancelled) setCourse(loaded);
      })
      .catch((e: unknown) => {
        console.error(e);
        if (!cancelled) setCourse(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [injected]);

  useEffect(() => {
    const onHash = (): void => {
      const id = spotIdFromHash();
      if (!id) pushed.current = false;
      setSpotId(id);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const spots = useMemo(() => course?.days.flatMap((d) => d.spots) ?? [], [course]);
  const spot = spotId ? (spots.find((s) => s.id === spotId) ?? null) : null;

  /* A detail opens at its top, on its own day's tab; closing it puts the list
     back where the visitor left it. */
  useEffect(() => {
    if (spot && course) {
      const index = course.days.findIndex((d) => d.day === spot.day);
      if (index >= 0) setDayIndex(index);
      window.scrollTo(0, 0);
    } else {
      window.scrollTo(0, listScroll.current);
    }
  }, [spot, course]);

  const openSpot = useCallback((next: AiCourseSpot): void => {
    if (!spotIdFromHash()) {
      listScroll.current = window.scrollY;
      pushed.current = true;
      window.location.hash = `spot=${encodeURIComponent(next.id)}`;
      return;
    }
    // Detail → another stop: replaced, so 뒤로 still lands on the list.
    window.history.replaceState(null, '', `#spot=${encodeURIComponent(next.id)}`);
    setSpotId(next.id);
  }, []);

  const closeSpot = useCallback((): void => {
    if (pushed.current) {
      window.history.back();
      return;
    }
    // Opened straight from a shared #spot link: there is no list entry to go back to.
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
    setSpotId(null);
  }, []);

  const lang = course?.lang ?? 'ko';

  /* The tab / share title names what is open — the stop, or the course day —
     rather than index.html's generic "장소 상세". */
  const title = spot ? spot.name : course ? course.days[Math.min(dayIndex, course.days.length - 1)]!.title : '';
  useEffect(() => {
    if (title) document.title = title;
  }, [title]);

  if (course && spot) {
    return <AiSpotDetail course={course} spot={spot} onBack={closeSpot} onOpen={openSpot} />;
  }

  return (
    <div className={styles.page}>
      <div className={styles.bg} aria-hidden />

      <main className={styles.content}>
        {loading ? (
          <p className={styles.status}>{pick(STATUS_COPY.loading!, lang)}</p>
        ) : !course ? (
          <p className={styles.status}>
            {pick(STATUS_COPY.missing!, lang)}
            <br />
            <a className={styles.demoLink} href="/ai?demo=1">
              demo
            </a>
          </p>
        ) : (
          <CourseView
            course={course}
            dayIndex={Math.min(dayIndex, course.days.length - 1)}
            onDay={setDayIndex}
            onOpen={openSpot}
          />
        )}
      </main>
    </div>
  );
}

function CourseView({
  course,
  dayIndex,
  onDay,
  onOpen,
}: {
  course: AiCourse;
  dayIndex: number;
  onDay: (index: number) => void;
  onOpen: (spot: AiCourseSpot) => void;
}): ReactElement {
  const { days, lang } = course;
  const day = days[dayIndex]!;
  const sheetClass = [
    styles.sheet,
    // The open tab carries the corner on its own side, so the sheet gives it up.
    dayIndex === 0 ? styles.sheetSquareLeft : '',
    dayIndex === days.length - 1 ? styles.sheetSquareRight : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      <header className={styles.header}>
        <div className={styles.subtitleRow}>
          <img className={styles.star} src="/ai-course/star.svg" alt="" />
          <h1 className={styles.subtitle}>{day.title}</h1>
        </div>
        {course.hashtags ? <p className={styles.hashtags}>{course.hashtags}</p> : null}
      </header>

      <section className={styles.summary}>
        {course.summary.map((item) => (
          <div key={item.label} className={styles.summaryCell}>
            <p className={styles.summaryLabel}>{item.label}</p>
            <p className={styles.summaryValue}>{item.value}</p>
          </div>
        ))}
      </section>

      {course.filters.length > 0 ? (
        <div className={styles.filters}>
          {course.filters.map((label, i) => (
            <span key={`${label}-${i}`} className={styles.filter}>
              {label}
            </span>
          ))}
        </div>
      ) : null}

      <div className={styles.tabs} role="tablist" aria-label="DAY">
        {days.map((d, i) => (
          <button
            key={d.day}
            type="button"
            role="tab"
            aria-selected={i === dayIndex}
            className={i === dayIndex ? `${styles.tab} ${styles.tabOn}` : styles.tab}
            onClick={() => onDay(i)}
          >
            {d.label}
          </button>
        ))}
      </div>

      <div className={sheetClass}>
        {/* Only DAY 1 sets off from the kiosk; later days start at the last stop. */}
        {day.day === 1 && course.startLabel ? <div className={styles.startPlate}>{course.startLabel}</div> : null}
        <DayTimeline day={day} lang={lang} onOpen={onOpen} />
      </div>
    </>
  );
}

function DayTimeline({
  day,
  lang,
  onOpen,
}: {
  day: AiCourseDay;
  lang: AiCourse['lang'];
  onOpen: (spot: AiCourseSpot) => void;
}): ReactElement {
  const last = day.spots.length - 1;

  return (
    <ol className={styles.timeline}>
      {day.spots.map((spot, i) => (
        <Fragment key={spot.id}>
          {/* The leg between two stops: its pill sits on the rail. */}
          {i > 0 ? (
            <li className={styles.legRow} aria-hidden>
              <div className={styles.rail}>
                {spot.legTime ? (
                  <span className={styles.leg}>
                    <span>{spot.legTime}</span>
                    {spot.legKm ? <span>{spot.legKm}</span> : null}
                  </span>
                ) : null}
              </div>
            </li>
          ) : null}

          <li
            className={[styles.stopRow, i === 0 ? styles.stopFirst : '', i === last ? styles.stopLast : '']
              .filter(Boolean)
              .join(' ')}
          >
            <div className={styles.rail}>
              <span className={styles.disc}>{spot.order}</span>
            </div>

            <button type="button" className={styles.card} onClick={() => onOpen(spot)}>
              <div className={styles.photo}>
                {spot.photos[0] ? <img src={spot.photos[0]} alt="" loading="lazy" /> : null}
              </div>

              <div className={styles.cardBody}>
                <div className={styles.nameRow}>
                  <p className={styles.name}>{spot.name}</p>
                  {spot.tag ? <span className={styles.tag}>{spot.tag}</span> : null}
                </div>

                {spot.description ? <p className={styles.desc}>{spot.description}</p> : null}

                {spot.address ? (
                  <p className={styles.infoRow}>
                    <img className={styles.icon} src="/ai-course/marker.svg" alt="" />
                    <span className={styles.infoText}>{spot.address}</span>
                  </p>
                ) : null}

                <div className={styles.metaRow}>
                  {/* Hours without a label, as the kiosk card draws them. */}
                  {spot.hours ? (
                    <span className={`${styles.metaItem} ${styles.metaHours}`}>
                      <img className={styles.icon} src="/ai-course/clock.svg" alt="" />
                      <span className={styles.metaText}>{spot.hours}</span>
                    </span>
                  ) : null}
                  <span className={`${styles.metaItem} ${styles.metaDwell}`}>
                    <img className={styles.iconBars} src="/ai-course/level.svg" alt="" />
                    <span className={styles.metaText}>{spot.dwell}</span>
                  </span>
                </div>

                <span className={styles.more}>{pick(DETAIL_COPY.viewDetail, lang)} ›</span>
              </div>
            </button>
          </li>
        </Fragment>
      ))}
    </ol>
  );
}

export default AiCoursePage;
