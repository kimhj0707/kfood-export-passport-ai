K-Food Export Passport AI – Backend

식품 라벨 이미지를 분석하여
수출국별 식품 규정 준수 여부를 점검하고, AI 기반 홍보 문구와 리포트를 생성하는 백엔드 API입니다.

본 서비스는 실제 배포·운영 환경을 기준으로 설계된 FastAPI 기반 API 서버입니다.

🌐 Live API
구분 URL
API Base https://kfood-api-233469550454.asia-northeast3.run.app

Swagger UI https://kfood-api-233469550454.asia-northeast3.run.app/docs
🧩 주요 기능

식품 라벨 이미지 업로드

OCR 기반 텍스트 추출 (Google Vision / Tesseract)

수출국별 식품 라벨 규정 자동 검사

알레르겐·영양성분 파싱

OpenAI 기반 홍보 문구 생성

분석 결과 DB 저장 및 히스토리 관리

PDF 리포트 자동 생성

🛠 기술 스택

Python 3.11

FastAPI – REST API

SQLite – 경량 데이터 저장

Google Cloud Vision API – OCR

OpenAI GPT API – 홍보 문구 생성

Docker – 컨테이너화

Google Cloud Run – 서버리스 배포

GitHub Actions – CI/CD 자동 배포

📁 프로젝트 구조
backend/
├── app.py # Streamlit 데모 (보조)
├── requirements.txt
├── Dockerfile
├── src/
│ ├── api/
│ │ ├── main.py # FastAPI 엔트리포인트
│ │ ├── db.py # SQLite CRUD
│ │ └── models.py # Pydantic 모델
│ ├── ocr/
│ │ ├── ocr_google.py # Google Vision OCR
│ │ └── ocr_tesseract.py # Tesseract OCR
│ ├── rules/
│ │ ├── allergen_parser.py
│ │ ├── nutrition_parser.py
│ │ ├── checker.py
│ │ ├── us_fda.json
│ │ ├── jp_food_label.json
│ │ └── vn_food_label.json
│ ├── llm/
│ │ └── promo_generator.py # 홍보 문구 생성
│ └── report/
│ └── pdf_report.py # PDF 리포트 생성
└── data/
└── reports.db # SQLite DB (자동 생성)

▶ 로컬 실행

1. 환경 설정
   cd backend
   python -m venv .venv
   source .venv/bin/activate # Windows: .venv\Scripts\activate
   pip install -r requirements.txt

2. 환경 변수 설정

.env 파일 생성:

OPENAI_API_KEY=sk-xxxx
GOOGLE_APPLICATION_CREDENTIALS=path/to/credentials.json

3. FastAPI 실행
   python -m uvicorn src.api.main:app --reload --port 8080

4. Streamlit 데모 (선택)
   streamlit run app.py

🔗 API 엔드포인트
v2 API (권장)
Method Path 설명
GET / 헬스 체크
POST /api/analyze 이미지 분석 → DB 저장
GET /api/reports 분석 히스토리
GET /api/reports/{id} 리포트 상세
GET /api/reports/{id}/pdf PDF 다운로드
DELETE /api/reports/{id} 리포트 삭제
Legacy API (하위 호환)
Method Path 설명
POST /analyze 단일 분석
POST /report PDF 즉시 반환
🐳 Docker 로컬 테스트
cd backend
docker build -t kfood-api .
docker run -p 8080:8080 kfood-api

☁️ Cloud Run 배포
수동 배포 (참고)
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

🔁 CI/CD 자동 배포 (운영 방식)

본 백엔드는 GitHub Actions + Cloud Run 기반 자동 배포가 구성되어 있습니다.

배포 흐름
backend/ 변경
→ git push
→ GitHub Actions 실행
→ Cloud Build
→ Artifact Registry
→ Cloud Run 자동 배포

특징

별도 수동 명령 없이 push만으로 배포

min-instances=0, max-instances=1 설정으로 비용 폭주 방지

서비스 계정 기반 IAM 권한 최소화 적용

실서비스 운영을 고려한 구성

🧪 테스트 예시

# 헬스 체크

curl https://kfood-api-233469550454.asia-northeast3.run.app/

# 이미지 분석

curl -X POST https://kfood-api-233469550454.asia-northeast3.run.app/api/analyze \
 -F "file=@test.jpg" \
 -F "country=US" \
 -F "ocr_engine=google"

📌 비고

본 프로젝트는 학원 발표 / 공모전 / 취업 포트폴리오 목적의
실제 배포 가능한 MVP로 설계되었습니다.

프론트엔드(Vercel)와 분리된 백엔드 전용 API 서버입니다.
