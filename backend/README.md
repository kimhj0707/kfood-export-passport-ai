# K-Food Export Passport AI - Backend

식품 라벨 분석 AI 서비스의 백엔드 API입니다.

---

## Live API

| 서비스         | URL                                                         |
| -------------- | ----------------------------------------------------------- |
| **API**        | https://kfood-api-233469550454.asia-northeast3.run.app      |
| **Swagger UI** | https://kfood-api-233469550454.asia-northeast3.run.app/docs |

---

## 기술 스택

- **Python 3.11+**
- **FastAPI** (REST API)
- **SQLite** (데이터 저장)
- **Google Cloud Vision** (OCR)
- **OpenAI GPT** (홍보 문구 생성)

---

## 프로젝트 구조

```
backend/
├── app.py                      # Streamlit 데모
├── requirements.txt
├── Dockerfile
├── src/
│   ├── api/
│   │   ├── main.py             # FastAPI 앱
│   │   ├── db.py               # SQLite CRUD
│   │   └── models.py           # Pydantic 모델
│   ├── ocr/
│   │   ├── ocr_google.py       # Google Vision OCR
│   │   └── ocr_tesseract.py    # Tesseract OCR
│   ├── rules/
│   │   ├── allergen_parser.py  # 알레르기 추출
│   │   ├── nutrition_parser.py # 영양성분 파싱
│   │   ├── checker.py          # 규칙 체크 엔진
│   │   ├── us_fda.json
│   │   ├── jp_food_label.json
│   │   └── vn_food_label.json
│   ├── llm/
│   │   └── promo_generator.py  # 홍보 문구 생성
│   └── report/
│       └── pdf_report.py       # PDF 리포트 생성
└── data/
    └── reports.db              # SQLite DB (자동 생성)
```

---

## 로컬 실행

### 1. 환경 설정

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### 2. 환경 변수 설정

`.env` 파일 생성:

```env
OPENAI_API_KEY=sk-xxx
GOOGLE_APPLICATION_CREDENTIALS=path/to/credentials.json
```

### 3. FastAPI 서버 실행

```bash
python -m uvicorn src.api.main:app --reload --port 8080
```

### 4. Streamlit 데모 실행

```bash
streamlit run app.py
```

---

## API 엔드포인트

### v2.0.0 API

| Method | Path                    | 설명                                   |
| ------ | ----------------------- | -------------------------------------- |
| GET    | `/`                     | 헬스체크                               |
| POST   | `/api/analyze`          | 이미지 분석 + DB 저장 + report_id 반환 |
| GET    | `/api/reports`          | 최근 리포트 목록 (히스토리)            |
| GET    | `/api/reports/{id}`     | 리포트 상세 조회                       |
| GET    | `/api/reports/{id}/pdf` | PDF 다운로드                           |
| DELETE | `/api/reports/{id}`     | 리포트 삭제                            |

### 레거시 API (하위 호환)

| Method | Path       | 설명                       |
| ------ | ---------- | -------------------------- |
| POST   | `/analyze` | 이미지 분석 (DB 저장 없음) |
| POST   | `/report`  | 이미지 → PDF 반환          |

---

## Docker 빌드

```bash
cd backend
docker build -t kfood-api .
docker run -p 8080:8080 kfood-api
```

---

## Cloud Run 배포

### 1. Docker 인증 설정 (최초 1회)

```bash
gcloud auth configure-docker asia-northeast3-docker.pkg.dev
```

### 2. 이미지 빌드 및 푸시

```bash
cd backend
gcloud builds submit --tag asia-northeast3-docker.pkg.dev/k-food-export-passport-ai/kfood-repo/kfood-api
```

### 3. Cloud Run 배포

```bash
gcloud run deploy kfood-api \
  --image asia-northeast3-docker.pkg.dev/k-food-export-passport-ai/kfood-repo/kfood-api \
  --region asia-northeast3 \
  --platform managed \
  --min-instances 0 \
  --max-instances 1 \
  --memory 1Gi \
  --cpu 1 \
  --timeout 300 \
  --allow-unauthenticated
```

### 4. 배포 확인

```bash
# 이미지 목록 확인
gcloud artifacts docker images list \
  asia-northeast3-docker.pkg.dev/k-food-export-passport-ai/kfood-repo

# 서비스 상태 확인
gcloud run services describe kfood-api --region asia-northeast3
```

---

## 테스트

```bash
# 헬스체크
curl http://localhost:8080/

# 이미지 분석
curl -X POST http://localhost:8080/api/analyze \
  -F "file=@test.jpg" \
  -F "country=US" \
  -F "ocr_engine=google"

# 히스토리 조회
curl http://localhost:8080/api/reports
```
