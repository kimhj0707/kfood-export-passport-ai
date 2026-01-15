# K-Food Export Passport AI - Frontend

식품 라벨 이미지를 업로드하면 수출국별 규정을 자동으로 체크하고 홍보 문구를 생성하는 AI 서비스의 프론트엔드입니다.

---

## Live Demo

| 서비스 | URL |
|--------|-----|
| **프론트엔드** | https://kfood-export-passport-ai-frontend.vercel.app |
| **백엔드 API** | https://kfood-api-233469550454.asia-northeast3.run.app |

---

## 기술 스택

- **React 19** + **TypeScript**
- **Vite** (빌드 도구)
- **React Router** (라우팅)
- **Vercel** (배포)

---

## 페이지 구성

| 경로 | 페이지 | 설명 |
|------|--------|------|
| `/` | 랜딩 페이지 | 서비스 소개 |
| `/analyze` | 분석 페이지 | 이미지 업로드 및 분석 |
| `/reports/:id` | 결과 페이지 | 분석 결과 상세 |
| `/history` | 히스토리 | 분석 기록 목록 |

---

## 로컬 개발

### Prerequisites

- Node.js 18+

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

브라우저에서 http://localhost:3000 접속

### 환경 변수

`.env.local` 파일 생성:

```env
VITE_API_BASE_URL=http://localhost:8080
```

배포 시 Vercel 환경 변수에서 설정:
```
VITE_API_BASE_URL=https://kfood-api-233469550454.asia-northeast3.run.app
```

---

## 프로젝트 구조

```
frontend/
├── App.tsx                 # 라우터 설정
├── index.tsx               # 엔트리 포인트
├── types.ts                # TypeScript 타입 정의
├── pages/
│   ├── LandingPage.tsx     # 랜딩 페이지
│   ├── AnalyzePage.tsx     # 업로드/분석 페이지
│   ├── ReportPage.tsx      # 결과 상세 페이지
│   └── HistoryPage.tsx     # 히스토리 목록
├── components/
│   ├── Header.tsx          # 헤더 컴포넌트
│   └── Footer.tsx          # 푸터 컴포넌트
├── services/
│   └── api.ts              # API 호출 함수
├── vite.config.ts          # Vite 설정
├── vercel.json             # Vercel 배포 설정
└── package.json
```

---

## 빌드 및 배포

```bash
# 프로덕션 빌드
npm run build

# Vercel 배포
vercel --prod
```

---

## API 연동

백엔드 API 엔드포인트:

| Method | Path | 설명 |
|--------|------|------|
| POST | `/api/analyze` | 이미지 분석 |
| GET | `/api/reports` | 히스토리 목록 |
| GET | `/api/reports/{id}` | 리포트 상세 |
| GET | `/api/reports/{id}/pdf` | PDF 다운로드 |

---

## 관련 저장소

- **백엔드 (FastAPI)**: 동일 모노레포 내 `backend/`
