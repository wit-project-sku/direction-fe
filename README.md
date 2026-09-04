# direction-fe

제주 키오스크 **흰 상세 카드**를 폰에서 보고 이미지로 저장하는 페이지.

## QR URL (짧게)

```
https://{host}/?id={shopId}&lang=ko&from=eat#z{zlib(route-only)}
```

- 쿼리 `id` → 웹이 `GET /api/shops/{id}`로 **사진·이름·주소·전화** 조회 (Vercel/Vite `/api` 프록시)
- 해시 → **가는 방법(route)** 만 (상세 API의 `route`는 null)

로컬 데모: `http://localhost:5174/?demo=1`  
실데이터: `http://localhost:5174/?id=1612&lang=ko`

## 개발

```bash
npm install
npm run dev
```

## Vercel

`vercel.json`이 `/api/*` → `api-stage-v3.witteria.com` 으로 프록시합니다.  
키오스크 `.env`: `VITE_DETAIL_SAVE_ORIGIN=https://direction-fe.vercel.app`
