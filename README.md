# direction-fe

제주 키오스크 **흰 상세 카드**를 폰에서 그대로 보고 이미지로 저장하는 페이지.

## 데이터 방식 (중요)

가는 방법(`route`)은 `/api/shops` 목록에만 있으므로, **키오스크가 이미 가진 표시용 텍스트·route를 QR에 실어 보냅니다.**

```
https://{host}/#{base64url(JSON payload)}
```

로컬 데모:

```
http://localhost:5174/?demo=1
```

## Payload (`DetailPayload`)

키오스크에서 **이미 언어가 정해진 문자열** + `route` 객체:

- `name`, `category`, `photos[]`, `address`, `hours`, `phone`
- `description`, `tags` (rating 제외)
- `showShuttle`, `showFerry`, `ferryModeLabel`
- `route` (distanceKm, durationMin, transit, busStop, …)
- `lang`, `from`, `shopId?`

인코딩: `src/payload.ts` → `encodePayload` / `buildDetailUrl`  
키오스크: `src/renderer/src/lib/detailCardSave.ts` (동일 인코딩)

## UI

키오스크 `JejuSpotDetailCard` + `JejuAirportDirections`와 **같은 1820px 카드 비율**을  
폰 폭에 `scale`로 맞춰 보여 줍니다.

## 개발

```bash
npm install
npm run dev
```

## 키오스크 쪽

QR value = `buildDetailCardSaveUrl(payload)`  
가는 방법 패널 옆에 작은 QR로 노출하면 됩니다.
