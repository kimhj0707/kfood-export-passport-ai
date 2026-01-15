# K-Food Export Passport AI - Cloud Run 배포 가이드

## 비용 안전 원칙 (절대 변경 금지)

| 항목                 | 설정값                          | 이유                 |
| -------------------- | ------------------------------- | -------------------- |
| Budget               | 3,000~5,000원                   | 학습/포트폴리오 용도 |
| min-instances        | 0                               | 미사용 시 과금 0원   |
| max-instances        | 1                               | 트래픽 폭주 방지     |
| CPU always allocated | ❌ OFF                          | 요청 시에만 CPU 사용 |
| 인증                 | ON (--no-allow-unauthenticated) | 무단 접근 차단       |
| timeout              | 60~300s                         | 적절한 범위          |

---

## 사전 준비

### 1. GCP 프로젝트 설정

```bash
# 프로젝트 ID 설정 (본인 프로젝트로 변경)
export PROJECT_ID=your-project-id
export REGION=asia-northeast3

# gcloud 로그인
gcloud auth login
gcloud config set project $PROJECT_ID

# 필요 API 활성화
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

### 2. Budget Alert 설정 (필수)

GCP Console → Billing → Budgets & alerts → CREATE BUDGET

- 금액: 5,000원
- 알림: 50%, 80%, 100%

---

## STEP 2: Streamlit 배포 (데모용)

### 배포 명령어 (복붙)

```bash
export PROJECT_ID=your-project-id
export REGION=asia-northeast3
export SERVICE_NAME=kfood-streamlit

gcloud run deploy $SERVICE_NAME \
  --source . \
  --region $REGION \
  --platform managed \
  --min-instances 0 \
  --max-instances 1 \
  --memory 1Gi \
  --cpu 1 \
  --timeout 300 \
  --no-allow-unauthenticated \
  --set-env-vars="OPENAI_API_KEY=sk-xxx"
```

### 배포 후 접속

```bash
# 프록시로 로컬에서 접속
gcloud run services proxy $SERVICE_NAME --region $REGION
# → http://localhost:8080 에서 확인
```

---

## STEP 3: FastAPI 배포 (API 서버)

### Dockerfile 변경

```bash
# Dockerfile.api 사용 시
gcloud run deploy kfood-api \
  --source . \
  --region $REGION \
  --platform managed \
  --min-instances 0 \
  --max-instances 1 \
  --memory 1Gi \
  --cpu 1 \
  --timeout 60 \
  --no-allow-unauthenticated \
  --set-env-vars="OPENAI_API_KEY=sk-xxx"
```

---

## 최종 URL 구조

| 서비스          | 용도                 |
| --------------- | -------------------- |
| kfood-streamlit | 데모/발표/포트폴리오 |
| kfood-api       | Next.js 연동 백엔드  |

---

## 서비스 삭제 (비용 차단)

```bash
gcloud run services delete kfood-streamlit --region $REGION
gcloud run services delete kfood-api --region $REGION
```

---

## 배포 전 체크리스트

- [ ] `.env.example` 존재
- [ ] `requirements.txt`에 openai 포함
- [ ] Budget Alert 설정 완료
- [ ] OPENAI_API_KEY 준비
