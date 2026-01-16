# K-Food Export Passport AI - Frontend

K-Food Export Passport AI 서비스의 프론트엔드 애플리케이션입니다. 사용자 인터페이스를 통해 식품 라벨 이미지를 업로드하고, 분석 결과를 확인하며, 리포트를 생성하는 기능을 제공합니다.

> **모노레포 구성 안내**: 이 프로젝트는 `frontend/` (Vercel) + `backend/` (Cloud Run)로 분리 배포됩니다. 따라서, **루트에서 커밋/푸시해도 `frontend/` 변경이 포함될 때만 Vercel 배포가 생성**됩니다.

---

## 🌐 Live Demo

| 서비스                     | URL                                                                                                              |
| :------------------------- | :--------------------------------------------------------------------------------------------------------------- |
| **프론트엔드 (Vercel)**    | [https://kfood-export-passport-ai-frontend.vercel.app](https://kfood-export-passport-ai-frontend.vercel.app)     |
| **백엔드 API (Cloud Run)** | [https://kfood-api-233469550454.asia-northeast3.run.app](https://kfood-api-233469550454.asia-northeast3.run.app) |

---

## 🛠 기술 스택

*   **React 19** + **TypeScript**
*   **Vite** (빌드 도구)
*   **React Router** (라우팅)
*   **TailwindCSS** (스타일링)
*   **Vercel** (프론트 배포)
*   **Backend 연동**: FastAPI (Cloud Run)

---

## 📂 모노레포 구조와 배포 방식

이 프로젝트는 하나의 GitHub 저장소 안에 프론트엔드와 백엔드가 함께 존재합니다.

```
repo-root/
├── frontend/   # Vercel 배포 대상
└── backend/    # Cloud Run 배포 대상
```

### ✅ Vercel 자동 배포 규칙 (중요)

*   `frontend/**` 경로 내 파일 변경이 커밋에 포함되면 → **Vercel이 자동으로 새 Deployment 생성**
*   `backend/**` 경로 내 파일만 변경되면 → **Vercel 배포는 생성되지 않음 (정상 동작)**
*   `README.md` 등 루트 파일만 변경되면 → **Vercel 배포는 생성되지 않을 수 있음 (정상 동작)**

---

## 🚀 페이지 구성

| 경로           | 페이지      | 설명                                          |
| :------------- | :---------- | :-------------------------------------------- |
| `/`            | 랜딩 페이지 | 서비스 소개 및 주요 기능 안내                 |
| `/analyze`     | 분석 페이지 | 라벨 이미지 업로드 및 AI 분석 실행            |
| `/reports/:id` | 결과 페이지 | 특정 분석 리포트의 상세 결과 표시             |
| `/history`     | 히스토리    | 과거 분석 기록 목록 및 각 리포트로 이동       |
| `/privacy-policy` | 개인정보 처리방침 | 개인정보 처리방침 안내                       |
| `/terms-of-service` | 이용 약관 | 서비스 이용 약관 안내                        |


---

## ▶ 로컬 개발

### 1. Prerequisites

*   Node.js **18+** (권장: 20 LTS)

### 2. 설치 및 실행

루트 디렉토리에서 다음 명령어를 실행합니다.

```bash
cd frontend
npm install # 의존성 설치
npm run dev # 개발 서버 실행
```

개발 서버가 시작되면 브라우저에서 `http://localhost:5173` (Vite 기본 포트)에 접속합니다.

---

## ⚙️ 환경 변수

`frontend/.env.local` 파일을 생성하고 다음 내용을 추가합니다.

```env
VITE_API_BASE_URL=http://localhost:8080 # 로컬 백엔드 API 주소
```

**참고**: 배포 시 Vercel 환경 변수에서 `VITE_API_BASE_URL`을 실제 배포된 백엔드 API 주소로 설정해야 합니다.

```env
VITE_API_BASE_URL=https://kfood-api-233469550454.asia-northeast3.run.app
```

---

## 📁 프로젝트 구조 (Frontend)

```
frontend/
├── src/
│   ├── App.tsx             # 메인 애플리케이션 컴포넌트
│   ├── index.tsx           # 애플리케이션 엔트리포인트
│   ├── pages/              # 라우팅되는 페이지 컴포넌트들
│   │   ├── LandingPage.tsx
│   │   ├── AnalyzePage.tsx
│   │   ├── ReportPage.tsx
│   │   └── HistoryPage.tsx
│   ├── components/         # 재사용 가능한 UI 컴포넌트들
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── HeroVisual.svg
│   ├── services/           # API 호출 및 데이터 처리 로직
│   │   └── api.ts
│   ├── contexts/           # 전역 상태 관리 Context
│   │   ├── ThemeContext.tsx
│   │   └── ToastContext.tsx
│   └── types.ts            # 공통 타입 정의
├── public/                 # 정적 자산 (이미지 등)
├── vite.config.ts          # Vite 설정 파일
├── tailwind.config.cjs     # TailwindCSS 설정 파일
├── postcss.config.cjs      # PostCSS 설정 파일
├── vercel.json             # Vercel 배포 설정 파일 (모노레포 Root Directory 지정)
└── package.json            # 프로젝트 메타데이터 및 의존성
```

---

## 빌드

```bash
cd frontend
npm run build
```

빌드 산출물은 `frontend/dist/` 디렉토리에 생성됩니다.

---

## 배포

### 1) 프론트엔드: Vercel 자동 배포 (Git Push 기반)

기본적으로 `git push` 시 Vercel에 자동 배포가 동작하도록 설정되어 있습니다.

#### Vercel 설정 체크리스트 (필수)

Vercel Project 설정에서 다음 항목들을 확인하고 필요시 수정합니다.

*   **Settings → Build & Development**
    *   **Root Directory**: `frontend`
    *   **Build Command**: `npm run build`
    *   **Output Directory**: `dist`
    *   **Install Command**: `npm install` (또는 사용 중인 패키지 매니저)

*   **Settings → Git**
    *   **Connected Repository**: `kimhj0707/kfood-export-passport-ai`
    *   **Production Branch**: 실제 사용하는 브랜치 (예: `main` 또는 `master`)로 일치

> ⚠️ **주의**: 모노레포에서 `Root Directory`가 비어있거나 `Production Branch`가 다르면 "푸시했는데 배포가 생성되지 않는" 문제가 발생할 수 있습니다.

---

### 2) 프론트엔드: 수동 배포 (긴급 시)

자동 배포가 일시적으로 꼬였거나 즉시 배포가 필요한 경우 다음 명령어를 사용할 수 있습니다.

```bash
cd frontend
npx vercel --prod
```

---

## ⚠️ 배포 트러블슈팅 (자동 배포가 안 될 때)

### A. "푸시했는데 Vercel Deployments에 새 줄이 안 생김"

대부분 다음 3가지 중 하나가 원인입니다.

1.  **`frontend/` 변경이 커밋에 포함되지 않음**:
    *   `backend/` 코드만 변경한 경우 → 정상 (프론트엔드 배포는 생성되지 않습니다)
2.  **Vercel Project 설정에 `Root Directory`가 제대로 설정되지 않음**:
    *   프로젝트 `Root Directory`가 `frontend`로 설정되어 있는지 확인하세요.
3.  **Vercel Project 설정의 `Production Branch`와 푸시한 브랜치가 불일치**:
    *   내가 푸시한 브랜치와 Vercel의 `Production Branch`가 다르면 배포가 생성되지 않습니다.

---

### B. "Vercel Settings → Git에 Reconnect/에러가 표시됨"

*   GitHub 연결이 끊긴 상태일 수 있습니다.
*   Vercel 대시보드에서 해당 프로젝트의 **Settings → Git**으로 이동하여 **Reconnect** 버튼을 클릭하고 GitHub 권한 승인 절차를 완료하여 복구합니다.

---

### C. "배포는 Ready인데 화면이 안 바뀜"

*   캐시 문제일 가능성이 큽니다.
*   Vercel Deployments 목록에서 최신 배포를 클릭 → **Visit** 버튼으로 접속 후 브라우저에서 `Ctrl + Shift + R` (Windows/Linux) 또는 `Cmd + Shift + R` (macOS)을 눌러 강력 새로고침을 시도합니다.

---

## 🤝 API 연동

백엔드 API 엔드포인트:

| Method | Path                    | 설명                                   |
| :----- | :---------------------- | :------------------------------------- |
| `POST` | `/api/analyze`          | 이미지 분석 및 리포트 ID 반환        |
| `GET`  | `/api/reports`          | 분석 히스토리 목록 조회                |
| `GET`  | `/api/reports/{id}`     | 특정 리포트 상세 정보 조회             |
| `GET`  | `/api/reports/{id}/pdf` | 특정 리포트의 PDF 파일 다운로드        |
| `DELETE` | `/api/reports/{id}`     | 특정 리포트 삭제                       |

---

## 🔗 관련 정보

*   **백엔드(FastAPI)**: 동일 모노레포 내 `backend/` 디렉토리에 위치
*   **백엔드 배포**: Google Cloud Run으로 운영됨 (자동 CI/CD)