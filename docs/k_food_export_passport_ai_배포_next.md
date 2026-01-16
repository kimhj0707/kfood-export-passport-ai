# K-Food Export Passport AI

## 배포 → Next.js 전환 전체 실행 가이드 (고정 문서)

본 문서는 **K-Food Export Passport AI 프로젝트**에서 이미 완성된 STEP 1(LLM 홍보 문구 생성)을 기준으로,
**배포 → 프론트엔드(Next.js) 분리까지**의 전체 실행 과정을 고정 기록한다.

> 목적

- 학원 발표
- 공모전 제출
- 취업 포트폴리오

> 원칙

- 이미 합의된 구조는 변경하지 않는다
- 실행 가능한 결과물만 만든다
- 비용 폭주 리스크를 원천 차단한다

---

## 현재 완료 상태 (기준선)

### 완료된 기능

- OCR (Google Vision / Tesseract)
- 알레르기·영양성분 자동 파싱
- 국가별 리스크 분석 (US / JP / VN)
- LLM 기반 홍보 문구 생성
  - OpenAI Responses API 사용
  - JSON 강제 출력
  - 실패 시 fallback 더미
  - 국가 톤 반영
- PDF 리포트 생성

> 이 문서를 기준으로 이후 단계는 **추가만** 한다.

---

## 전체 단계 요약

```
[STEP 1] Streamlit 로컬 완성  ✅ (완료)
   ↓
[STEP 2] Cloud Run 배포 (Streamlit 그대로)
   ↓
[STEP 3] API 역할 분리 (FastAPI or endpoint 정리)
   ↓
[STEP 4] Next.js 프론트엔드 구축
   ↓
[STEP 5] Next.js ↔ Cloud Run 연동
```

---

## STEP 2. Cloud Run 배포 (Streamlit 유지)

### 목표

- URL 하나 확보
- 포트폴리오/공모전 제출 가능 상태
- 비용 0원~소액 유지

### 배포 전략

- **Streamlit 앱 그대로 배포**
- UI는 임시, 기능 검증 중심

### 필수 비용 안전 원칙 (절대 변경 금지)

- Budget: 3,000~5,000원
- Cloud Run
  - min instances = 0
  - max instances = 1
  - CPU always allocated ❌
- 인증 필요 (unauthenticated OFF)

### 산출물

- Dockerfile
- .dockerignore
- README_DEPLOY.md
- Cloud Run URL

---

## STEP 3. 백엔드 역할 고정 (API 관점 정리)

### 목표

- Streamlit을 "임시 UI"로 격하
- Cloud Run을 **AI 처리 서버**로 인식

### 논리적 API 역할

| 기능           | 역할 |
| -------------- | ---- |
| 이미지 업로드  | 입력 |
| OCR            | 처리 |
| 규칙 검사      | 처리 |
| 홍보 문구 생성 | 처리 |
| PDF 생성       | 출력 |

> 실제 FastAPI로 바로 바꾸지 않아도 됨
> **역할 분리 개념만 고정**

---

## STEP 4. Next.js 프론트엔드 구축

### 목표

- "정식 서비스"처럼 보이는 UI
- Cloud Run을 호출하는 프론트엔드

### 구조

```
apps/
  web/        # Next.js
backend/
  streamlit/  # 기존 프로젝트
```

### Next.js 역할

- 이미지 업로드 UI
- 국가 선택 UI
- 분석 요청
- 결과 시각화
- PDF 다운로드 버튼

> 비즈니스 로직 없음
> 모든 처리는 Cloud Run

---

## STEP 5. Next.js ↔ Cloud Run 연동

### 통신 구조

```
[Browser]
   ↓
[Next.js (Vercel)]
   ↓  HTTPS
[Cloud Run AI Server]
```

### 핵심 포인트

- Next.js는 fetch/axios로 Cloud Run 호출
- 인증 헤더 포함
- 응답은 JSON

### 예시 호출 흐름

1. 이미지 업로드
2. POST /analyze
3. JSON 결과 수신
4. 화면 렌더링

---

## 최종 구조 요약 (포트폴리오용)

- Frontend: Next.js (Vercel)
- Backend: Cloud Run (Python / AI 처리)
- Core Value:
  - 라벨 이미지 → 수출 규정 분석 → 홍보 문구 자동 생성

---

## 사용 시나리오 (발표용 한 줄 요약)

> "K-푸드 수출 시 필요한 라벨 검토와 홍보 문구 생성을
> 이미지 한 장으로 자동화하는 AI 서비스입니다."

---

## 문서 사용 규칙

- 본 문서는 **마스터 실행 문서**이다
- 이후 대화/개발은 이 문서를 기준으로만 진행한다
- 단계 건너뛰기 금지
- 구조 변경 시 반드시 문서 먼저 수정

---

(끝)
