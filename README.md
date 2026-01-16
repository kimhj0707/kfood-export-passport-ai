# K-Food Export Passport AI

식품 라벨 이미지를 업로드하면 OCR 기반 분석, 알레르기/영양성분 검출, 수출국별 규정 준수 체크, 그리고 AI 기반 홍보 문구 생성까지 원스톱으로 지원하는 식품 수출 지원 AI 서비스입니다. 이 모노레포는 백엔드(FastAPI)와 프론트엔드(React)로 구성됩니다.

---

## 🚀 Live Demo

| 서비스         | URL                                                           |
| :------------- | :------------------------------------------------------------ |
| **프론트엔드** | [https://kfood-export-passport-ai-frontend.vercel.app](https://kfood-export-passport-ai-frontend.vercel.app) |
| **백엔드 API** | [https://kfood-api-233469550454.asia-northeast3.run.app](https://kfood-api-233469550454.asia-northeast3.run.app) |
| **API 문서**   | [https://kfood-api-233469550454.asia-northeast3.run.app/docs](https://kfood-api-233469550454.asia-northeast3.run.app/docs) |

---

## 🌳 프로젝트 구조

```
kfood-export-passport-ai/
├── backend/                    # 백엔드 (Python/FastAPI)
│   ├── app.py                  # Streamlit 데모
│   ├── src/
│   │   ├── api/                # FastAPI 앱
│   │   ├── ocr/                # OCR 모듈
│   │   ├── rules/              # 규칙 체크
│   │   ├── llm/                # 홍보 문구 생성
│   │   └── report/             # PDF 생성
│   ├── requirements.txt
│   ├── Dockerfile
│   └── README.md
│
├── frontend/                   # 프론트엔드 (React/Vite)
│   ├── App.tsx
│   ├── pages/
│   ├── components/
│   ├── services/
│   ├── package.json
│   ├── vite.config.ts
│   └── README.md
│
├── docs/                       # 프로젝트 문서 및 개발일지
│   ├── SERVICE_MVP_PLAN.md
│   └── ...
│
├── .env.example                # 환경 변수 예시 파일
└── README.md                   # 최상위 README 파일
```

---

## ✨ 주요 기능

*   **OCR 엔진 선택**: Google Vision / Tesseract
*   **알레르기 자동 추출**: 13종 알레르겐 키워드 탐지
*   **영양성분 파싱**: 나트륨, 탄수화물, 당류 등 9종 영양성분 분석
*   **수출국별 규정 체크**: US, JP, VN 식품 라벨링 규정 대응
*   **홍보 문구 생성**: 상세설명, 포스터, 바이어 피칭용 문구 생성
*   **PDF 리포트**: 상세 분석 결과 다운로드

---

## 🌍 지원 국가

| 코드 | 국가   | 규정                                    |
| :--- | :----- | :-------------------------------------- |
| US   | 미국   | FDA Food Allergen Labeling (FALCPA)     |
| JP   | 일본   | 식품표시법 (Food Labeling Act)          |
| VN   | 베트남 | 식품안전법 (Decree 43/2017/ND-CP)       |

---

## 🛠 로컬 개발 (Quick Start)

### 1. 환경 변수 설정

루트 디렉토리에 `.env` 파일을 생성하고 다음 내용을 추가합니다.

```env
OPENAI_API_KEY=sk-xxx # OpenAI API 키
GOOGLE_APPLICATION_CREDENTIALS=path/to/credentials.json # Google Cloud 서비스 계정 키 파일 경로
```

프론트엔드 개발을 위해 `frontend/.env.local` 파일을 생성하고 다음 내용을 추가합니다.

```env
VITE_API_BASE_URL=http://localhost:8080 # 로컬 백엔드 API 주소
```

### 2. 백엔드 실행

```bash
cd backend
pip install -r requirements.txt
python -m uvicorn src.api.main:app --reload --port 8080
```
API 문서는 `http://localhost:8080/docs`에서 확인 가능합니다.

### 3. 프론트엔드 실행

```bash
cd frontend
npm install
npm run dev
```
브라우저에서 `http://localhost:5173`으로 접속합니다.

---

## ⚙️ 기술 스택

| 분류           | 기술                                |
| :------------- | :---------------------------------- |
| **백엔드**     | Python, FastAPI, SQLite             |
| **프론트엔드** | React 19, TypeScript, Vite, TailwindCSS |
| **OCR**        | Google Cloud Vision, Tesseract      |
| **LLM**        | OpenAI GPT                          |
| **배포**       | Google Cloud Run, Vercel            |

---

## 🔗 주요 API 엔드포인트

| Method | Path                    | 설명                                   |
| :----- | :---------------------- | :------------------------------------- |
| `GET`  | `/`                     | 백엔드 헬스체크                        |
| `POST` | `/api/analyze`          | 이미지 분석 및 리포트 ID 반환        |
| `GET`  | `/api/reports`          | 분석 히스토리 목록 조회                |
| `GET`  | `/api/reports/{id}`     | 특정 리포트 상세 정보 조회             |
| `GET`  | `/api/reports/{id}/pdf` | 특정 리포트의 PDF 파일 다운로드        |
| `DELETE` | `/api/reports/{id}`     | 특정 리포트 삭제                       |

---

## 📚 문서

-   [서비스 MVP 계획](docs/SERVICE_MVP_PLAN.md)
-   [백엔드 배포 가이드](backend/DEPLOY_TRIGGER.md)
-   [프론트엔드 배포 가이드](frontend/vercel.json)
-   [개발일지](docs/)
