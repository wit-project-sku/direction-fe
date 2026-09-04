# direction-fe

제주 키오스크 **흰 상세 카드**를 폰에서 보고 이미지로 저장하는 페이지.

## QR URL (짧게 — 성긴 QR)

```
https://{host}/?id=1612&lang=ko&from=eat&r=36.7,56,t52,3008,20,40,w3
```

- `id` → `GET /api/shops/{id}` 로 사진·이름·주소 (Vercel `/api` 프록시)
- `r` → 가는 방법 압축 숫자열 (JSON/hash 없음 → QR 모듈이 큼)

로컬: `npm run dev` → `http://localhost:5174/?id=1612&lang=ko&r=36.7,56`
