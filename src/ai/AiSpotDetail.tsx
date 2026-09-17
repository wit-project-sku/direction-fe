import type { ReactElement, ReactNode } from 'react';
import type { AiCourse, AiCourseSpot } from './aiCourse';
import { DETAIL_COPY, STAT_LABEL, fromPlaceLabel, pick, stopPositionLabel } from './aiCourseI18n';
import { mapLinks } from './aiNav';
import pageStyles from './AiCoursePage.module.css';
import styles from './AiSpotDetail.module.css';

interface Props {
  course: AiCourse;
  spot: AiCourseSpot;
  onBack: () => void;
  onOpen: (spot: AiCourseSpot) => void;
}

/**
 * One stop of the course, opened from its card — the phone's counterpart of the
 * kiosk's 상세 card, plus what only a phone can do: call the place, and hand the
 * route to a map app.
 *
 *   · photos (swipe), name and category, the day and stop number;
 *   · 주소 · 영업시간 · 머무는 시간 · 전화 (tap to call);
 *   · the description and the shop's hashtags;
 *   · 길찾기 — the leg the course plans into this stop ("뱅크시 전시회에서 · 15분 ·
 *     1.1km", from the kiosk itself for DAY 1's first stop), then Kakao Map,
 *     Naver Map and Google Maps, each routing from the visitor's own location;
 *   · 이전 장소 / 다음 장소 within the same day.
 */
export function AiSpotDetail({ course, spot, onBack, onOpen }: Props): ReactElement {
  const { lang } = course;
  const day = course.days.find((d) => d.day === spot.day);
  const index = day ? day.spots.findIndex((s) => s.id === spot.id) : -1;
  const prev = day && index > 0 ? day.spots[index - 1] : undefined;
  const next = day && index >= 0 ? day.spots[index + 1] : undefined;

  const links = mapLinks(spot, course.transport);
  const legFrom = prev ? prev.name : spot.day === 1 && index === 0 ? course.startLabel : '';
  const leg = [spot.legTime, spot.legKm].filter(Boolean).join(' · ');
  const telHref = spot.phone ? `tel:${spot.phone.replace(/[^\d+]/g, '')}` : '';

  return (
    <div className={pageStyles.page}>
      <div className={pageStyles.bg} aria-hidden />

      <main className={pageStyles.content}>
        <div className={styles.topBar}>
          <button type="button" className={styles.back} onClick={onBack}>
            ‹ {pick(DETAIL_COPY.back, lang)}
          </button>
        </div>

        <p className={styles.position}>{stopPositionLabel(spot.day, spot.order, lang)}</p>
        <div className={styles.titleRow}>
          <h1 className={styles.name}>{spot.name}</h1>
          {spot.category ? <span className={styles.category}>{spot.category}</span> : null}
        </div>

        <div className={styles.gallery}>
          {spot.photos.length > 0 ? (
            spot.photos.map((src, i) => (
              <div
                key={`${src}-${i}`}
                className={spot.photos.length === 1 ? `${styles.slide} ${styles.slideOnly}` : styles.slide}
              >
                <img src={src} alt="" loading={i === 0 ? 'eager' : 'lazy'} />
              </div>
            ))
          ) : (
            <div className={`${styles.slide} ${styles.slideOnly}`} />
          )}
        </div>

        <section className={styles.panel}>
          <div className={styles.info}>
            {spot.address ? (
              <InfoRow icon="/ai-course/marker.svg" label={pick(DETAIL_COPY.address, lang)}>
                {spot.address}
              </InfoRow>
            ) : null}
            {spot.hours ? (
              <InfoRow icon="/ai-course/clock.svg" label={pick(DETAIL_COPY.hours, lang)}>
                {spot.hours}
              </InfoRow>
            ) : null}
            <InfoRow icon="/ai-course/level.svg" bars label={pick(STAT_LABEL.dwell!, lang)}>
              {spot.dwellValue}
            </InfoRow>
            {spot.phone ? (
              <InfoRow label={pick(DETAIL_COPY.phone, lang)}>
                <a className={styles.tel} href={telHref}>
                  {spot.phone}
                </a>
              </InfoRow>
            ) : null}
          </div>
        </section>

        {spot.description || spot.hashtags ? (
          <section className={styles.panel}>
            {spot.description ? <p className={styles.desc}>{spot.description}</p> : null}
            {spot.hashtags ? <p className={styles.hashtags}>{spot.hashtags}</p> : null}
          </section>
        ) : null}

        <section className={styles.panel}>
          <h2 className={styles.navTitle}>{pick(DETAIL_COPY.navTitle, lang)}</h2>
          {legFrom && leg ? (
            <p className={styles.navLeg}>
              {fromPlaceLabel(legFrom, lang)} · {leg}
            </p>
          ) : null}
          <p className={styles.navNote}>{pick(DETAIL_COPY.navNote, lang)}</p>
          <div className={styles.navBtns}>
            <a className={`${styles.navBtn} ${styles.kakao}`} href={links.kakao} target="_blank" rel="noopener noreferrer">
              {pick(DETAIL_COPY.kakao, lang)}
            </a>
            <a className={`${styles.navBtn} ${styles.naver}`} href={links.naver} target="_blank" rel="noopener noreferrer">
              {pick(DETAIL_COPY.naver, lang)}
            </a>
            <a className={`${styles.navBtn} ${styles.google}`} href={links.google} target="_blank" rel="noopener noreferrer">
              {pick(DETAIL_COPY.google, lang)}
            </a>
          </div>
        </section>

        {prev || next ? (
          <nav className={styles.stepper}>
            {prev ? (
              <button type="button" className={styles.stepBtn} onClick={() => onOpen(prev)}>
                <span className={styles.stepLabel}>‹ {pick(DETAIL_COPY.prev, lang)}</span>
                <span className={styles.stepName}>{prev.name}</span>
              </button>
            ) : null}
            {next ? (
              <button type="button" className={`${styles.stepBtn} ${styles.stepNext}`} onClick={() => onOpen(next)}>
                <span className={styles.stepLabel}>{pick(DETAIL_COPY.next, lang)} ›</span>
                <span className={styles.stepName}>{next.name}</span>
              </button>
            ) : null}
          </nav>
        ) : null}
      </main>
    </div>
  );
}

function InfoRow({
  icon,
  bars,
  label,
  children,
}: {
  icon?: string;
  bars?: boolean;
  label: string;
  children: ReactNode;
}): ReactElement {
  return (
    <div className={styles.infoRow}>
      {icon ? (
        <img className={bars ? `${styles.icon} ${styles.iconBars}` : styles.icon} src={icon} alt="" />
      ) : (
        <span />
      )}
      <span className={styles.infoLabel}>{label}</span>
      <p className={styles.infoValue}>{children}</p>
    </div>
  );
}
