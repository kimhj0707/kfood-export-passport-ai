# K-Food Export Passport AI - Backend

K-Food Export Passport AI 프로젝트의 백엔드 API 서버입니다. 식품 라벨 이미지를 분석하여 수출국별 식품 규정 준수 여부를 점검하고, AI 기반 홍보 문구 및 상세 분석 리포트를 생성합니다.

본 백엔드 서비스는 실제 배포 및 운영 환경을 기준으로 설계된 FastAPI 기반의 RESTful API 서버입니다.

---

## 🌐 Live API

| 구분          | URL                                                          |
| :------------ | :----------------------------------------------------------- |
| **API Base**  | [https://kfood-api-233469550454.asia-northeast3.run.app](https://kfood-api-233469550454.asia-northeast3.run.app) |
| **Swagger UI**| [https://kfood-api-233469550454.asia-northeast3.run.app/docs](https://kfood-api-233469550454.asia-northeast3.run.app/docs) |

---

## ✨ 주요 기능

*   **식품 라벨 이미지 업로드**: 사용자로부터 라벨 이미지 수신
*   **OCR 기반 텍스트 추출**: Google Cloud Vision 및 Tesseract 엔진 선택 가능
*   **수출국별 식품 라벨 규정 자동 검사**: US, JP, VN 등 국가별 규정 준수 여부 판별
*   **알레르겐 & 영양성분 파싱**: 라벨 텍스트에서 알레르겐 및 영양성분 정보 추출
*   **OpenAI 기반 홍보 문구 생성**: 분석 결과를 바탕으로 마케팅 문구 자동 생성
*   **분석 결과 DB 저장 및 히스토리 관리**: SQLite를 활용한 경량 데이터 저장
*   **PDF 리포트 자동 생성**: 상세 분석 결과를 포함한 PDF 리포트 제공

---

## 🛠 기술 스택

*   **언어**: Python 3.11
*   **웹 프레임워크**: FastAPI (REST API)
*   **데이터베이스**: SQLite (경량 데이터 저장)
*   **OCR**: Google Cloud Vision API, Tesseract
*   **LLM**: OpenAI GPT API (홍보 문구 생성)
*   **컨테이너**: Docker
*   **클라우드 배포**: Google Cloud Run
*   **CI/CD**: GitHub Actions

---

## 📁 프로젝트 구조

```
backend/
├── app.py                  # Streamlit 데모 (보조)
├── requirements.txt        # Python 종속성
├── Dockerfile              # Docker 이미지 빌드 파일
├── src/
│   ├── api/                # FastAPI 애플리케이션 핵심 (엔트리포인트, DB, 모델)
│   │   ├── main.py         # FastAPI 엔트리포인트
│   │   ├── db.py           # SQLite CRUD 작업
│   │   └── models.py       # Pydantic 모델 정의
│   ├── ocr/                # OCR 모듈
│   │   ├── ocr_google.py   # Google Cloud Vision OCR 구현
│   │   └── ocr_tesseract.py# Tesseract OCR 구현
│   ├── rules/              # 규정 검사 및 파싱 모듈
│   │   ├── allergen_parser.py # 알레르겐 파싱 로직
│   │   ├── nutrition_parser.py# 영양성분 파싱 로직
│   │   ├── checker.py      # 규정 검사 로직
│   │   ├── us_fda.json     # 미국 FDA 규정 데이터
│   │   ├── jp_food_label.json # 일본 식품표시법 규정 데이터
│   │   └── vn_food_label.json # 베트남 식품안전법 규정 데이터
│   ├── llm/                # LLM 기반 홍보 문구 생성 모듈
│   │   └── promo_generator.py # 홍보 문구 생성 로직
│   └── report/             # PDF 리포트 생성 모듈
│       └── pdf_report.py   # PDF 리포트 생성 로직
└── data/                   # 데이터 저장 디렉토리
    └── reports.db          # SQLite DB 파일 (자동 생성)
```

---

## ▶ 로컬 개발

### 1. 환경 설정

```bash
cd backend
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS/Linux
source .venv/bin/activate
pip install -r requirements.txt
```

### 2. 환경 변수 설정

루트 디렉토리(`.env.example` 참조)에 `.env` 파일을 생성하고 다음 내용을 추가합니다.
(Vite 프론트엔드와 혼동하지 않도록 유의하세요. 백엔드 환경 변수는 `.env`에 정의합니다.)

```env
OPENAI_API_KEY=sk-xxxx # OpenAI API 키
GOOGLE_APPLICATION_CREDENTIALS=path/to/credentials.json # Google Cloud 서비스 계정 키 파일 경로
```

### 3. FastAPI 서버 실행

```bash
python -m uvicorn src.api.main:app --reload --port 8080
```
서버가 `http://localhost:8080`에서 실행됩니다.
API 문서는 `http://localhost:8080/docs`에서 확인할 수 있습니다.

### 4. Streamlit 데모 실행 (선택 사항)

```bash
streamlit run app.py
```
Streamlit 데모는 `app.py` 파일을 통해 실행되며, 추가적인 테스트 환경을 제공합니다.

---

## 🔗 API 엔드포인트

### v2 API (권장)

| Method | Path                    | 설명                           |
| :----- | :---------------------- | :----------------------------- |
| `GET`  | `/`                     | 헬스 체크                      |
| `POST` | `/api/analyze`          | 이미지 분석 및 DB 저장         |
| `GET`  | `/api/reports`          | 분석 히스토리 목록 조회        |
| `GET`  | `/api/reports/{id}`     | 특정 리포트 상세 정보 조회     |
| `GET`  | `/api/reports/{id}/pdf` | 특정 리포트의 PDF 파일 다운로드|
| `DELETE` | `/api/reports/{id}`     | 특정 리포트 삭제               |

### Legacy API (하위 호환성을 위해 유지)

| Method | Path         | 설명                           |
| :----- | :----------- | :----------------------------- |
| `POST` | `/analyze`   | 단일 분석                      |
| `POST` | `/report`    | PDF 즉시 반환 (단일 분석 기반) |

---

## 🐳 Docker 로컬 테스트

```bash
cd backend
docker build -t kfood-api .
docker run -p 8080:8080 kfood-api
```

---

## ☁️ Google Cloud Run 배포

### 수동 배포 (참고용)

```bash
gcloud run deploy kfood-api \
 --source backend \
 --region asia-northeast3 \
 --platform managed \
 --min-instances 0 \
 --max-instances 1 \
 --memory 1Gi \
 --cpu 1 \
 --timeout 300 \
 --allow-unauthenticated
```

### 🔁 CI/CD 자동 배포 (운영 방식)

본 백엔드는 GitHub Actions와 Google Cloud Run을 기반으로 자동 배포가 구성되어 있습니다.

**배포 흐름**:
1.  `backend/` 디렉토리 내 변경 사항 발생
2.  `git push`
3.  GitHub Actions 실행
4.  Cloud Build 트리거
5.  Artifact Registry에 이미지 저장
6.  Cloud Run 서비스 자동 업데이트

**특징**:
*   별도 수동 명령 없이 `push`만으로 배포가 이루어집니다.
*   `min-instances=0`, `max-instances=1` 설정으로 비용 효율성을 극대화합니다.
*   서비스 계정 기반의 IAM 권한을 최소화하여 보안을 강화합니다.
*   실제 서비스 운영을 고려한 구성입니다.

---

## 🧪 테스트 예시

### 헬스 체크

```bash
curl https://kfood-api-233469550454.asia-northeast3.run.app/
```

### 이미지 분석

```bash
curl -X POST https://kfood-api-233469550454.asia-northeast3.run.app/api/analyze \
 -F "file=@test.jpg" \
 -F "country=US" \
 -F "ocr_engine=google"
```

---

## 📌 비고

*   본 프로젝트는 학원 발표, 공모전, 취업 포트폴리오 목적의 실제 배포 가능한 MVP로 설계되었습니다.
*   프론트엔드(Vercel 배포)와 분리된 백엔드 전용 API 서버입니다.