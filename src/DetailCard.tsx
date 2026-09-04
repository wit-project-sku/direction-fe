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
  const photos = (payload.photos ?? []).filter(Boolean).slice(0, 4);
  while (!isRentcar && photos.length < 4) photos.push('');
  const hours = (payload.hours ?? '').trim();
  const address = payload.address ?? '';
  const phone = payload.phone ?? '';
  const description = payload.description ?? '';
  const tags = payload.tags ?? '';
  const category = payload.category ?? '';

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
          {category ? (
            <span className={styles.cat}>
              <span className={styles.dot} />
              {category}
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
        {address ? (
          <div className={styles.infoItem}>
            <span className={styles.infoIcon} aria-hidden>
              📍
            </span>
            <p className={styles.infoText}>{address}</p>
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
        {phone ? (
          <div className={styles.infoItem}>
            <span className={styles.infoIcon} aria-hidden>
              📞
            </span>
            <p className={styles.infoText}>{phone}</p>
          </div>
        ) : null}
      </div>

      {!isRentcar && (description || tags) ? (
        <>
          <div className={styles.divider} />
          {description ? <p className={styles.desc}>{description}</p> : null}
          {tags ? <p className={styles.tags}>{tags}</p> : null}
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
