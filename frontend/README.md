# K-Food Export Passport AI - Frontend

식품 라벨 이미지를 업로드하면 수출국별 규정을 자동으로 체크하고 홍보 문구를 생성하는 AI 서비스의 **프론트엔드(모노레포 구성)** 입니다.

> 이 레포는 `frontend/`(Vercel) + `backend/`(Cloud Run)로 분리 배포됩니다.
> 따라서 **루트에서 커밋/푸시해도 `frontend/` 변경이 포함될 때만 Vercel 배포가 생성**됩니다.

---

## Live Demo

| 서비스                     | URL                                                                                                              |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **프론트엔드 (Vercel)**    | [https://kfood-export-passport-ai-frontend.vercel.app](https://kfood-export-passport-ai-frontend.vercel.app)     |
| **백엔드 API (Cloud Run)** | [https://kfood-api-233469550454.asia-northeast3.run.app](https://kfood-api-233469550454.asia-northeast3.run.app) |

---

## 기술 스택

- **React 19** + **TypeScript**
- **Vite** (빌드 도구)
- **React Router** (라우팅)
- **Vercel** (프론트 배포)
- **Backend 연동**: FastAPI (Cloud Run)

---

## 모노레포 구조와 배포 방식

이 프로젝트는 하나의 GitHub 저장소 안에 프론트/백이 같이 존재합니다.

```
repo-root/
├── frontend/   # Vercel 배포 대상
└── backend/    # Cloud Run 배포 대상
```

### ✅ Vercel 자동배포 규칙 (중요)

- `frontend/**` 변경이 커밋에 포함되면 → **Vercel이 자동으로 새 Deployment 생성**
- `backend/**`만 변경되면 → **Vercel 배포는 생성되지 않음(정상 동작)**
- README 등 루트 파일만 변경되면 → **Vercel 배포는 생성되지 않을 수 있음(정상 동작)**

---

## 페이지 구성

| 경로           | 페이지      | 설명                  |
| -------------- | ----------- | --------------------- |
| `/`            | 랜딩 페이지 | 서비스 소개           |
| `/analyze`     | 분석 페이지 | 이미지 업로드 및 분석 |
| `/reports/:id` | 결과 페이지 | 분석 결과 상세        |
| `/history`     | 히스토리    | 분석 기록 목록        |

---

## 로컬 개발

### Prerequisites

- Node.js **18+** (권장: 20 LTS)

### 설치 및 실행

```bash
# repo-root 기준
cd frontend

npm install
npm run dev
```

브라우저에서 `http://localhost:5173` 접속 (Vite 기본 포트)

---

## 환경 변수

`frontend/.env.local` 생성:

```env
VITE_API_BASE_URL=http://localhost:8080
```

배포 시 Vercel 환경 변수에서 설정:

```env
VITE_API_BASE_URL=https://kfood-api-233469550454.asia-northeast3.run.app
```

---

## 프로젝트 구조 (frontend)

```
frontend/
├── src/
│   ├── App.tsx
│   ├── pages/
│   │   ├── LandingPage.tsx
│   │   ├── AnalyzePage.tsx
│   │   ├── ReportPage.tsx
│   │   └── HistoryPage.tsx
│   ├── components/
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   ├── services/
│   │   └── api.ts
│   └── types.ts
├── vite.config.ts
├── vercel.json
└── package.json
```

---

## 빌드

```bash
cd frontend
npm run build
```

산출물은 `frontend/dist/`에 생성됩니다.

---

## 배포

### 1) 프론트: Vercel 자동배포 (Git Push)

기본적으로 `git push` 시 자동배포가 동작합니다.

#### Vercel 설정 체크리스트 (필수)

Vercel Project → **Settings → Build & Development**

- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install` (또는 사용 중인 패키지 매니저)

Vercel Project → **Settings → Git**

- **Connected Repository**: `kimhj0707/kfood-export-passport-ai`
- **Production Branch**: 실제 사용하는 브랜치(`main` 또는 `master`)로 일치

> ⚠️ 모노레포에서 Root Directory가 비어있거나 Production Branch가 다르면
> “푸시했는데 배포가 안 생기는” 문제가 발생합니다.

---

### 2) 프론트: 수동 배포 (급할 때)

자동배포가 잠시 꼬였거나 즉시 배포가 필요하면:

```bash
cd frontend
npx vercel --prod
```

---

## 배포 트러블슈팅 (자동배포가 안 될 때)

### A. “푸시했는데 Vercel Deployments에 새 줄이 안 생김”

대부분 아래 3개 중 하나입니다.

1. **frontend 변경이 커밋에 포함되지 않음**

- `backend`만 변경한 경우 → 정상 (프론트 배포 안 생김)

2. **Vercel Root Directory 미설정**

- `frontend`로 설정되어 있는지 확인

3. **Production Branch 불일치**

- 내가 푸시한 브랜치와 Vercel Production Branch가 다르면 배포가 안 뜹니다.

---

### B. “Vercel Settings → Git에 Reconnect/에러가 뜸”

- GitHub 연결이 끊긴 상태일 수 있습니다.
- Vercel에서 **Reconnect** 후 GitHub 권한 승인으로 복구합니다.

---

### C. “배포는 Ready인데 화면이 안 바뀜”

- 캐시/URL 문제일 가능성이 큽니다.
- Deployments에서 최신 배포 클릭 → **Visit**로 접속 후 `Ctrl + Shift + R` 강력 새로고침.

---

## API 연동

백엔드 API 엔드포인트:

| Method | Path                    | 설명          |
| -----: | ----------------------- | ------------- |
|   POST | `/api/analyze`          | 이미지 분석   |
|    GET | `/api/reports`          | 히스토리 목록 |
|    GET | `/api/reports/{id}`     | 리포트 상세   |
|    GET | `/api/reports/{id}/pdf` | PDF 다운로드  |

---

## 관련

- **백엔드(FastAPI)**: 동일 모노레포 내 `backend/`
- **배포**: Backend는 Cloud Run으로 운영(현재는 수동 배포)
