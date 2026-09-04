import { forwardRef, type ReactElement } from 'react';
import type { DetailPayload } from './types';
import { Directions } from './Directions';
import styles from './DetailCard.module.css';

interface Props {
  payload: DetailPayload;
}

export const DetailCard = forwardRef<HTMLElement, Props>(function DetailCard(
  { payload },
  ref,
): ReactElement {
  const isRentcar = payload.from === 'rentcar';
  const photos = payload.photos.filter(Boolean).slice(0, 4);
  while (!isRentcar && photos.length < 4) photos.push('');
  const hours = payload.hours.trim();

  const showDirections =
    Boolean(payload.showFerry && payload.ferryModeLabel) ||
    (payload.route != null &&
      typeof payload.route.distanceKm === 'number' &&
      Number.isFinite(payload.route.distanceKm));

  return (
    <article ref={ref} className={styles.card}>
      <div className={styles.head}>
        <div className={styles.nameRow}>
          <p className={styles.name}>{payload.name}</p>
          {payload.category ? (
            <span className={styles.cat}>
              <span className={styles.dot} />
              {payload.category}
            </span>
          ) : null}
        </div>

        {!isRentcar ? (
          <div className={styles.photos}>
            {photos.map((src, i) => (
              <div key={i} className={styles.photo}>
                {src ? <img src={src} alt="" crossOrigin="anonymous" /> : null}
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div className={styles.divider} />

      <div className={styles.infoList}>
        {payload.address ? (
          <div className={styles.infoItem}>
            <span className={styles.infoIcon} aria-hidden>
              📍
            </span>
            <p className={styles.infoText}>{payload.address}</p>
          </div>
        ) : null}
        {hours ? (
          <div className={styles.infoItem}>
            <span className={styles.infoIcon} aria-hidden>
              🕒
            </span>
            <p className={styles.infoText}>{hours}</p>
          </div>
        ) : null}
        {payload.phone ? (
          <div className={styles.infoItem}>
            <span className={styles.infoIcon} aria-hidden>
              📞
            </span>
            <p className={styles.infoText}>{payload.phone}</p>
          </div>
        ) : null}
      </div>

      {!isRentcar && (payload.description || payload.tags) ? (
        <>
          <div className={styles.divider} />
          {payload.description ? <p className={styles.desc}>{payload.description}</p> : null}
          {payload.tags ? <p className={styles.tags}>{payload.tags}</p> : null}
        </>
      ) : null}

      {showDirections ? (
        <>
          <div className={styles.divider} />
          <div className={styles.airportDirections}>
            <Directions payload={payload} />
          </div>
        </>
      ) : null}
    </article>
  );
});
