# K-Food Export Passport AI

식품 라벨 이미지를 업로드하면
**OCR → 알레르기/영양성분 자동 분석 → 수출국별 규정 체크 → 홍보 문구 생성**까지
한 번에 수행하는 식품 수출 지원 AI 서비스입니다.

---

## Live Demo

| 서비스         | URL                                                         |
| -------------- | ----------------------------------------------------------- |
| **프론트엔드** | https://kfood-export-passport-ai-frontend.vercel.app        |
| **백엔드 API** | https://kfood-api-233469550454.asia-northeast3.run.app      |
| **API 문서**   | https://kfood-api-233469550454.asia-northeast3.run.app/docs |

---

## 프로젝트 구조

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
├── docs/                       # 문서
│   ├── SERVICE_MVP_PLAN.md
│   ├── 2026-01-14_개발일지.md
│   ├── 2026-01-15_개발일지.md
│   └── ...
│
├── .env.example
└── README.md
```

---

## 주요 기능

- **OCR 엔진 선택**: Google Vision / Tesseract
- **알레르기 자동 추출**: 13종 키워드 탐지
- **영양성분 파싱**: 나트륨, 탄수화물, 당류 등 9종
- **수출국별 규정 체크**: US / JP / VN 대응
- **홍보 문구 생성**: 상세설명, 포스터, 바이어 피칭용
- **PDF 리포트**: 분석 결과 다운로드

---

## 지원 국가

| 코드 | 국가   | 규정                                |
| ---- | ------ | ----------------------------------- |
| US   | 미국   | FDA Food Allergen Labeling (FALCPA) |
| JP   | 일본   | 식품표시법 (Food Labeling Act)      |
| VN   | 베트남 | 식품안전법 (Decree 43/2017/ND-CP)   |

---

## 빠른 시작

### 백엔드 실행

```bash
cd backend
pip install -r requirements.txt
python -m uvicorn src.api.main:app --reload --port 8080
```

### 프론트엔드 실행

```bash
cd frontend
npm install
npm run dev
```

---

## 환경 변수

### 백엔드 (.env)

```env
OPENAI_API_KEY=sk-xxx
GOOGLE_APPLICATION_CREDENTIALS=path/to/credentials.json
```

### 프론트엔드 (.env.local)

```env
VITE_API_BASE_URL=http://localhost:8080
```

---

## API 엔드포인트

| Method | Path                    | 설명                         |
| ------ | ----------------------- | ---------------------------- |
| GET    | `/`                     | 헬스체크                     |
| POST   | `/api/analyze`          | 이미지 분석 + report_id 반환 |
| GET    | `/api/reports`          | 히스토리 목록                |
| GET    | `/api/reports/{id}`     | 리포트 상세                  |
| GET    | `/api/reports/{id}/pdf` | PDF 다운로드                 |

---

## 기술 스택

| 분류           | 기술                           |
| -------------- | ------------------------------ |
| **백엔드**     | Python, FastAPI, SQLite        |
| **프론트엔드** | React 19, TypeScript, Vite     |
| **OCR**        | Google Cloud Vision, Tesseract |
| **LLM**        | OpenAI GPT                     |
| **배포**       | Google Cloud Run, Vercel       |

---

## 문서

- [서비스 MVP 계획](docs/SERVICE_MVP_PLAN.md)
- [배포 가이드](docs/README_DEPLOY.md)
- [개발일지](docs/)
