import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactElement } from 'react';
import { toPng } from 'html-to-image';
import { DetailCard } from './DetailCard';
import { demoPayload, loadDetailFromLocation } from './payload';
import type { DetailPayload, Lang } from './types';
import styles from './App.module.css';

const COPY = {
  save: {
    ko: '이미지 저장',
    en: 'Save image',
    ja: '画像を保存',
    zh: '保存图片',
    vi: 'Lưu ảnh',
    th: 'บันทึกรูป',
    ru: 'Сохранить изображение',
    id: 'Simpan gambar',
  },
  saving: {
    ko: '저장 중…',
    en: 'Saving…',
    ja: '保存中…',
    zh: '保存中…',
    vi: 'Đang lưu…',
    th: 'กำลังบันทึก…',
    ru: 'Сохранение…',
    id: 'Menyimpan…',
  },
  loading: {
    ko: '불러오는 중…',
    en: 'Loading…',
    ja: '読み込み中…',
    zh: '加载中…',
    vi: 'Đang tải…',
    th: 'กำลังโหลด…',
    ru: 'Загрузка…',
    id: 'Memuat…',
  },
  missing: {
    ko: '키오스크 QR로 열어 주세요. (상세 데이터가 없습니다)',
    en: 'Open this page from the kiosk QR.',
    ja: 'キオスクのQRから開いてください。',
    zh: '请通过一体机二维码打开。',
    vi: 'Hãy mở bằng mã QR trên kiosk.',
    th: 'เปิดจาก QR บนคีออสก์',
    ru: 'Откройте через QR на киоске.',
    id: 'Buka lewat QR di kiosk.',
  },
  fail: {
    ko: '저장에 실패했습니다.',
    en: 'Save failed.',
    ja: '保存に失敗しました。',
    zh: '保存失败。',
    vi: 'Lưu thất bại.',
    th: 'บันทึกไม่สำเร็จ',
    ru: 'Не удалось сохранить.',
    id: 'Gagal menyimpan.',
  },
};

function pick(map: Partial<Record<Lang, string>>, lang: Lang): string {
  return map[lang] ?? map.ko ?? map.en ?? '';
}

function isMobileSharePreferred(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  const touch = navigator.maxTouchPoints > 0;
  return touch || /iPhone|iPad|iPod|Android/i.test(ua);
}

async function triggerDownload(blob: Blob, fileName: string): Promise<void> {
  const url = URL.createObjectURL(blob);
  try {
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.rel = 'noopener';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    a.remove();
  } finally {
    // Keep the blob URL alive briefly so the browser can start the download.
    window.setTimeout(() => URL.revokeObjectURL(url), 4_000);
  }
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, data] = dataUrl.split(',');
  const mime = header?.match(/:(.*?);/)?.[1] || 'image/png';
  const binary = atob(data || '');
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

/** Capture at natural card size off-screen so the visible scale() UI never jumps. */
async function captureCardOffscreen(cardEl: HTMLElement): Promise<string> {
  const w = cardEl.offsetWidth;
  const h = cardEl.offsetHeight;
  if (w <= 0 || h <= 0) throw new Error('Invalid card size');

  const host = document.createElement('div');
  host.setAttribute('aria-hidden', 'true');
  Object.assign(host.style, {
    position: 'fixed',
    left: '-10000px',
    top: '0',
    width: `${w}px`,
    pointerEvents: 'none',
    opacity: '0',
    zIndex: '-1',
  });

  const clone = cardEl.cloneNode(true) as HTMLElement;
  clone.style.transform = 'none';
  clone.style.width = `${w}px`;
  host.appendChild(clone);
  document.body.appendChild(host);

  try {
    const imgs = Array.from(clone.querySelectorAll('img'));
    await Promise.all(
      imgs.map(
        (img) =>
          new Promise<void>((resolve) => {
            if (img.complete) {
              resolve();
              return;
            }
            img.onload = () => resolve();
            img.onerror = () => resolve();
          }),
      ),
    );

    return await toPng(clone, {
      cacheBust: true,
      pixelRatio: 1,
      backgroundColor: '#ffffff',
      width: w,
      height: h,
      canvasWidth: Math.round(w * 2),
      canvasHeight: Math.round(h * 2),
      skipFonts: true,
    });
  } finally {
    host.remove();
  }
}

const CARD_WIDTH = 1820;

export default function App(): ReactElement {
  const [payload, setPayload] = useState<DetailPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [scale, setScale] = useState(1);
  const [saving, setSaving] = useState(false);
  const [cardHeight, setCardHeight] = useState(0);
  const cardRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (q.get('demo') === '1') {
      setPayload(demoPayload());
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    void loadDetailFromLocation()
      .then((p) => {
        if (!cancelled) setPayload(p);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const update = (): void => {
      const pad = 24;
      const w = Math.max(280, window.innerWidth - pad);
      setScale(Math.min(1, w / CARD_WIDTH));
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    if (!cardRef.current) return;
    const el = cardRef.current;
    const ro = new ResizeObserver(() => setCardHeight(el.offsetHeight));
    ro.observe(el);
    setCardHeight(el.offsetHeight);
    return () => ro.disconnect();
  }, [payload]);

  const lang: Lang = payload?.lang ?? 'ko';
  const stageStyle = useMemo(
    () =>
      ({
        height: cardHeight > 0 ? cardHeight * scale : undefined,
      }) as CSSProperties,
    [cardHeight, scale],
  );

  const saveImage = async (): Promise<void> => {
    if (!cardRef.current || !payload || saving) return;
    setSaving(true);

    try {
      const dataUrl = await captureCardOffscreen(cardRef.current);
      if (!dataUrl || dataUrl.length < 100) {
        throw new Error('Empty image capture');
      }

      const blob = dataUrlToBlob(dataUrl);
      const fileName = `jeju-detail-${payload.shopId ?? 'card'}.png`;
      const file = new File([blob], fileName, { type: 'image/png' });

      // Prefer share only on phones (album-friendly). Desktop → direct download.
      if (isMobileSharePreferred() && typeof navigator.share === 'function') {
        const canShareFiles =
          typeof navigator.canShare !== 'function' || navigator.canShare({ files: [file] });
        if (canShareFiles) {
          try {
            await navigator.share({ files: [file], title: payload.name });
            return;
          } catch (shareErr) {
            if (shareErr instanceof DOMException && shareErr.name === 'AbortError') return;
          }
        }
      }

      await triggerDownload(blob, fileName);
    } catch (e) {
      console.error(e);
      window.alert(pick(COPY.fail, lang));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        {loading ? (
          <p className={styles.status}>{pick(COPY.loading, lang)}</p>
        ) : !payload ? (
          <p className={styles.status}>
            {pick(COPY.missing, lang)}
            <br />
            <a className={styles.demoLink} href="/?demo=1">
              demo
            </a>
          </p>
        ) : (
          <div className={styles.stage} style={stageStyle}>
            <div className={styles.scale} style={{ transform: `scale(${scale})` }}>
              <DetailCard ref={cardRef} payload={payload} />
            </div>
          </div>
        )}
      </main>

      <footer className={styles.bottom}>
        <button
          type="button"
          className={styles.saveBtn}
          disabled={!payload || saving || loading}
          onClick={() => void saveImage()}
        >
          {saving ? pick(COPY.saving, lang) : pick(COPY.save, lang)}
        </button>
      </footer>
    </div>
  );
}
