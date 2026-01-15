# K-Food Export Passport AI - 서비스 MVP 실행 계획

> **목표**: "데모"가 아닌 **"서비스"**로 보이는 최소 구성 완성
> **핵심**: 기능보다 **서비스의 3요소** (URL 접속 → 결과 페이지 → 히스토리)

---

## 현재 상태 분석

### 이미 완성된 것 ✅
| 모듈 | 파일 | 상태 |
|------|------|------|
| OCR | `src/ocr/ocr_google.py`, `ocr_tesseract.py` | ✅ 완료 |
| 알레르겐 파싱 | `src/rules/allergen_parser.py` | ✅ 완료 |
| 영양성분 파싱 | `src/rules/nutrition_parser.py` | ✅ 완료 |
| 리스크 체커 | `src/rules/checker.py` | ✅ 완료 |
| 홍보 문구 | `src/llm/promo_generator.py` | ✅ 완료 |
| PDF 리포트 | `src/report/pdf_report.py` | ✅ 완료 |
| FastAPI 기본 | `src/api/main.py` | ✅ 기본 구조 있음 |
| Streamlit 데모 | `app.py` | ✅ 완료 |

### 추가해야 하는 것 🔧
| 항목 | 설명 | 예상 시간 |
|------|------|----------|
| SQLite DB | 분석 결과 저장 + report_id 발급 | 1시간 |
| FastAPI 확장 | `/api/reports/{id}`, `/api/reports` 추가 | 1시간 |
| Next.js 프론트 | 4페이지 (랜딩/업로드/결과/히스토리) | 4~6시간 |
| 배포 | Cloud Run + Vercel | 2시간 |

---

## 서비스의 3요소 (발표장에서 "서비스"로 보이는 핵심)

```
1. URL 접속 → 랜딩/시작 화면
2. 업로드 → 결과 페이지 (고유 URL로 공유 가능)
3. 분석 히스토리 (최근 기록 조회)
```

이 3개만 있으면 **옆 팀이 뭘 더 만들어도 "서비스"로 인식**된다.

---

## 최종 구조

```
kfood-export-passport-ai/
├── backend/                    # FastAPI (Cloud Run)
│   ├── app/
│   │   ├── main.py            # FastAPI 앱
│   │   ├── db.py              # SQLite 연결
│   │   ├── models.py          # Pydantic 모델
│   │   └── services/          # 기존 분석 로직 재사용
│   │       ├── ocr.py
│   │       ├── risk.py
│   │       └── promo.py
│   ├── data/
│   │   └── reports.db         # SQLite 파일
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/                   # Next.js (Vercel)
│   ├── app/
│   │   ├── page.tsx           # 랜딩 페이지
│   │   ├── analyze/
│   │   │   └── page.tsx       # 업로드 폼
│   │   ├── reports/
│   │   │   └── [id]/
│   │   │       └── page.tsx   # 결과 페이지
│   │   └── history/
│   │       └── page.tsx       # 히스토리
│   ├── package.json
│   └── next.config.js
│
└── src/                        # 기존 Python 모듈 (backend에서 import)
    ├── ocr/
    ├── rules/
    ├── llm/
    └── report/
```

---

## API 설계

### FastAPI 엔드포인트

| Method | Path | 설명 | 반환 |
|--------|------|------|------|
| GET | `/` | 헬스체크 | `{"status": "ok"}` |
| POST | `/api/analyze` | 이미지 분석 + DB 저장 | `{"report_id": "abc123", ...}` |
| GET | `/api/reports/{id}` | 특정 리포트 조회 | 분석 결과 JSON |
| GET | `/api/reports` | 최근 10개 목록 | 리포트 목록 |
| GET | `/api/reports/{id}/pdf` | PDF 다운로드 | PDF 파일 |

### SQLite 스키마

```sql
CREATE TABLE reports (
    id TEXT PRIMARY KEY,           -- UUID
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    country TEXT NOT NULL,
    ocr_engine TEXT NOT NULL,
    ocr_text TEXT,
    allergens TEXT,                -- JSON string
    nutrition TEXT,                -- JSON string
    risks TEXT,                    -- JSON string
    promo TEXT                     -- JSON string
);
```

---

## Next.js 페이지 구성

### 1. 랜딩 (`/`)
```
┌────────────────────────────────────────┐
│                                        │
│   K-Food Export Passport AI            │
│   ─────────────────────────            │
│   식품 라벨 이미지 한 장으로           │
│   수출 규정 분석 + 홍보 문구 자동 생성 │
│                                        │
│         [ 시작하기 버튼 ]              │
│                                        │
└────────────────────────────────────────┘
```

### 2. 업로드 (`/analyze`)
```
┌────────────────────────────────────────┐
│   라벨 이미지 업로드                   │
│   ┌──────────────────────────────┐     │
│   │    드래그 앤 드롭 영역        │     │
│   └──────────────────────────────┘     │
│                                        │
│   수출국: [US ▼]                       │
│   OCR 엔진: [Google Vision ▼]          │
│                                        │
│         [ 분석 시작 ]                  │
└────────────────────────────────────────┘
```

### 3. 결과 (`/reports/[id]`)
```
┌────────────────────────────────────────┐
│   분석 결과 #abc123                    │
│   ─────────────────────────────        │
│   📋 OCR 텍스트    [펼치기]            │
│   ⚠️ 리스크 분석   [HIGH] Wheat...     │
│   🏷️ 알레르겐     밀, 대두, 우유       │
│   📊 영양성분     나트륨 1200mg...     │
│   📝 홍보 문구    "Bold Korean..."     │
│                                        │
│   [ 🔗 링크 복사 ]  [ 📥 PDF 다운로드 ]│
└────────────────────────────────────────┘
```

### 4. 히스토리 (`/history`)
```
┌────────────────────────────────────────┐
│   최근 분석 기록                       │
│   ─────────────────────────────        │
│   #abc123  US  2024-01-14 14:30  →     │
│   #def456  JP  2024-01-14 13:15  →     │
│   #ghi789  VN  2024-01-14 11:00  →     │
│   ...                                  │
│                                        │
│         [ 새 분석 시작하기 ]           │
└────────────────────────────────────────┘
```

---

## 발표용 데모 시나리오 (2분)

```
1. 홈 화면에서 "시작하기" 클릭
2. 라벨 이미지 업로드 + 국가 US 선택
3. "분석 시작" → 로딩 → 결과 페이지로 이동
4. 결과 페이지 URL 보여주기 (/reports/abc123)
   → "이 링크로 팀원/바이어에게 공유 가능합니다"
5. PDF 다운로드 버튼 클릭
   → "통관 문서 작업에 바로 사용 가능합니다"
6. 히스토리 페이지 보여주기
   → "이전 분석 기록도 조회 가능합니다"
```

**핵심 멘트**: "서비스입니다. 데모가 아닙니다."

---

## 실행 순서 (48시간 타임라인)

### Day 1 (8시간)

| 시간 | 작업 | 산출물 |
|------|------|--------|
| 0-2h | FastAPI 확장 (DB + report_id) | `backend/app/main.py`, `db.py` |
| 2-4h | Next.js 초기 세팅 + 랜딩 페이지 | `frontend/app/page.tsx` |
| 4-6h | 업로드 페이지 + API 연동 | `frontend/app/analyze/page.tsx` |
| 6-8h | 결과 페이지 | `frontend/app/reports/[id]/page.tsx` |

### Day 2 (8시간)

| 시간 | 작업 | 산출물 |
|------|------|--------|
| 0-2h | 히스토리 페이지 | `frontend/app/history/page.tsx` |
| 2-4h | UI 다듬기 (Tailwind) | 전체 스타일링 |
| 4-6h | Cloud Run 배포 (FastAPI) | 백엔드 URL |
| 6-8h | Vercel 배포 (Next.js) | 프론트 URL |

---

## 비용 안전 원칙 (유지)

| 항목 | 설정 |
|------|------|
| Cloud Run min-instances | 0 |
| Cloud Run max-instances | 1 |
| Budget Alert | 5,000원 |
| Vercel | Free tier |
| SQLite | 서버 내 파일 (비용 0) |

---

## 다음 액션

**즉시 실행할 파일 생성 순서:**

1. `backend/app/db.py` - SQLite 연결 + 테이블 생성
2. `backend/app/models.py` - Pydantic 모델
3. `backend/app/main.py` - FastAPI 확장 (기존 코드 마이그레이션)
4. `frontend/` - Next.js 프로젝트 초기화

---

## 핵심 포인트 요약

> **서비스 = URL + 저장 + 공유**

- `/reports/abc123` → 고유 URL로 결과 공유 가능
- SQLite → 분석 결과 영구 저장
- 히스토리 → "이전 기록 조회 가능"

이 3가지가 "데모"와 "서비스"를 가르는 차이다.
