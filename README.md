# direction-fe

제주 키오스크 흰 상세 카드를 폰에서 보고 이미지로 저장.

## QR (짧게 — 성긴 모듈)

```
https://{host}/?id=1612&lang=ko&from=eat&r=36.7,56,t52,3008,12,40,w3
```

- `id` → `/api/shops/{id}` 사진·이름·주소
- `r` → 거리/버스 숫자만 (한글 정류장명 없음 → QR이 빽빽해지지 않음)
- 정류장명 → `/api/shop-route?id=&kioskId=` (서버가 목록에서 route만 캐시)

## 개발

```bash
npm install
npm run dev
```

로컬에서 shop-route 서버리스가 없으면 `/api/shops?kioskId=` 목록으로 폴백합니다.
