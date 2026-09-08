import { useEffect, useState, type ReactElement } from 'react';
import { demoCourse, type AiCourse, type AiCourseDay } from './aiCourse';
import { loadAiCourseFromLocation } from './loadAiCourse';
import { STATUS_COPY, VIEW_LABEL, pick } from './aiCourseI18n';
import styles from './AiCoursePage.module.css';

interface Props {
  /** Injected in tests; production loads from the kiosk QR's query. */
  course?: AiCourse;
}

/**
 * `/ai` — phone view of the kiosk AI course result, reached by scanning the
 * QR on 제주 AI 코스 상세. The itinerary rides in the query as shopIds and
 * numbers; see `loadAiCourse` for the format.
 *
 * The kiosk header (location, date, home/back buttons, search title) is
 * intentionally omitted — the phone starts at the course subtitle.
 */
export function AiCoursePage({ course: injected }: Props): ReactElement {
  const [course, setCourse] = useState<AiCourse | null>(injected ?? null);
  const [loading, setLoading] = useState(!injected);

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

  const lang = course?.lang ?? 'ko';

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
          <>
            <div className={styles.subtitleRow}>
              <img className={styles.star} src="/ai-course/star.svg" alt="" />
              <p className={styles.subtitle}>{course.subtitle}</p>
            </div>

            <p className={styles.hashtags}>{course.hashtags}</p>

            <div className={styles.summary}>
              {course.summary.map((item) => (
                <div key={item.label} className={styles.summaryCell}>
                  <p className={styles.summaryLabel}>{item.label}</p>
                  <p className={styles.summaryValue}>{item.value}</p>
                </div>
              ))}
            </div>

            <div className={styles.filters}>
              {course.filters.map((label, i) => (
                <span key={`${label}-${i}`} className={styles.filter}>
                  {label}
                </span>
              ))}
            </div>

            {course.days.map((day) => (
              <Day key={day.day} day={day} lang={lang} />
            ))}
          </>
        )}
      </main>
    </div>
  );
}

function Day({ day, lang }: { day: AiCourseDay; lang: AiCourse['lang'] }): ReactElement {
  return (
    <>
      <div className={styles.dayRow}>
        <p className={styles.dayLabel}>{day.label}</p>
        <div className={styles.viewBtns}>
          <button type="button" className={styles.viewBtn}>
            {pick(VIEW_LABEL.all!, lang)}
          </button>
          <button type="button" className={styles.viewBtn}>
            {pick(VIEW_LABEL.day!, lang)}
          </button>
        </div>
      </div>

      <ol className={styles.timeline}>
        {day.spots.map((spot, i) => (
          <li key={spot.id} className={styles.spot}>
            <div className={styles.marker}>
              <span className={styles.stepNo}>{i + 1}</span>
            </div>

            <article className={styles.card}>
              <div className={styles.thumb}>{spot.photo ? <img src={spot.photo} alt="" /> : null}</div>

              <div className={styles.body}>
                <div className={styles.nameRow}>
                  <p className={styles.name}>{spot.name}</p>
                  {spot.tag ? <span className={styles.spotTag}>{spot.tag}</span> : null}
                </div>

                {spot.address ? (
                  <div className={styles.addrRow}>
                    <img className={styles.markerIcon} src="/ai-course/marker.svg" alt="" />
                    <p className={styles.addr}>{spot.address}</p>
                  </div>
                ) : null}

                {spot.description ? <p className={styles.desc}>{spot.description}</p> : null}

                <div className={styles.metaRow}>
                  <div className={styles.meta}>
                    <img className={styles.clockIcon} src="/ai-course/clock.svg" alt="" />
                    <p className={styles.metaText}>{spot.stayTime}</p>
                  </div>
                  {spot.level ? (
                    <div className={styles.meta}>
                      <img className={styles.levelIcon} src="/ai-course/level.svg" alt="" />
                      <p className={styles.metaText}>{spot.level}</p>
                    </div>
                  ) : null}
                </div>
              </div>
            </article>
          </li>
        ))}
      </ol>
    </>
  );
}

export default AiCoursePage;
