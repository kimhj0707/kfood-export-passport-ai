# K-Food Export Passport AI - 기능 추가 계획

**작성일**: 2026-01-15
**상태**: 계획 수립 완료

---

## 현재 완성된 기능

| 카테고리 | 기능 | 상태 |
|---------|------|------|
| OCR | Google Vision OCR | ✅ 완성 |
| OCR | Tesseract OCR | ⚠️ 부분 구현 |
| 분석 | 알레르겐 추출 (13종) | ✅ 완성 |
| 분석 | 영양성분 파싱 (9종) | ✅ 완성 |
| 분석 | 규정 체크 (US/JP/VN) | ✅ 완성 |
| LLM | 마케팅 문구 생성 | ✅ 완성 |
| 리포트 | PDF 생성 | ✅ 완성 |
| API | CRUD 엔드포인트 | ✅ 완성 |
| DB | SQLite 저장 | ✅ 완성 |
| UI | 랜딩 페이지 | ✅ 완성 |
| UI | 분석 페이지 | ✅ 완성 |
| UI | 결과 페이지 | ✅ 완성 |
| UI | 히스토리 페이지 | ⚠️ 페이지네이션 미구현 |

---

## 즉시 구현 예정 (Sprint 1)

### 1. 히스토리 페이지네이션

**현재 상태**: 백엔드 API 준비됨, 프론트엔드 UI 버튼만 있음

**작업 내용**:
- [ ] `HistoryPage.tsx`에서 페이지 상태 관리
- [ ] 이전/다음 버튼 클릭 시 offset 변경
- [ ] `api.ts`의 `getReportHistory()`에 offset/limit 파라미터 추가
- [ ] 페이지 번호 표시

**관련 파일**:
- `frontend/pages/HistoryPage.tsx`
- `frontend/services/api.ts`

**예상 소요**: 1시간

---

### 2. 이미지 미리보기

**현재 상태**: 이미지 업로드 후 확인 불가

**작업 내용**:
- [ ] `AnalyzePage.tsx`에 이미지 미리보기 영역 추가
- [ ] FileReader API로 업로드된 이미지 표시
- [ ] 이미지 삭제/교체 버튼 추가
- [ ] 이미지 크기 제한 안내 (10MB)

**관련 파일**:
- `frontend/pages/AnalyzePage.tsx`

**예상 소요**: 30분

---

### 3. 리포트 삭제 버튼

**현재 상태**: 백엔드 DELETE API 있음, 프론트엔드 UI 없음

**작업 내용**:
- [ ] `HistoryPage.tsx`에 삭제 버튼 추가
- [ ] `ReportPage.tsx`에 삭제 버튼 추가
- [ ] 삭제 확인 다이얼로그
- [ ] 삭제 후 히스토리 페이지로 리다이렉트
- [ ] `api.ts`에 `deleteReport()` 함수 추가

**관련 파일**:
- `frontend/pages/HistoryPage.tsx`
- `frontend/pages/ReportPage.tsx`
- `frontend/services/api.ts`

**예상 소요**: 1시간

---

## 다음 구현 예정 (Sprint 2)

### 4. 에러 핸들링 강화

**작업 내용**:
- [ ] API 에러 시 토스트 메시지 표시
- [ ] 분석 실패 시 상세 원인 표시
- [ ] 네트워크 오류 시 재시도 버튼
- [ ] 로딩 타임아웃 처리

---

### 5. 분석 단계별 진행 표시

**작업 내용**:
- [ ] 분석 진행 상태 표시 (OCR → 분석 → 문구 생성)
- [ ] 각 단계별 완료 체크 아이콘
- [ ] 예상 소요 시간 표시

---

### 6. 분석 결과 공유

**작업 내용**:
- [ ] 공유 가능한 URL 생성
- [ ] 클립보드 복사 버튼
- [ ] 소셜 미디어 공유 (선택)

---

### 7. 재분석 기능

**작업 내용**:
- [ ] ReportPage에서 "다른 국가로 재분석" 버튼
- [ ] 기존 이미지 재사용
- [ ] 국가/OCR 엔진 변경 옵션

---

## 향후 고도화 (Sprint 3+)

### 사용자 경험 개선

| 기능 | 설명 | 우선순위 |
|------|------|---------|
| 히스토리 필터 | 국가/날짜별 필터링 | 중 |
| 다크 모드 | 테마 전환 | 낮음 |
| 다국어 지원 | 영어/베트남어 UI | 낮음 |
| 모바일 최적화 | 반응형 개선 | 중 |

### 기능 확장

| 기능 | 설명 | 우선순위 |
|------|------|---------|
| 일괄 분석 | 여러 이미지 한번에 | 중 |
| 국가 추가 | EU, CN 등 | 중 |
| OCR 정확도 향상 | 이미지 전처리 | 높음 |
| 규정 상세화 | FDA/MHLW 세부 규정 | 높음 |

### 인프라 개선

| 기능 | 설명 | 우선순위 |
|------|------|---------|
| 사용자 인증 | 로그인/회원가입 | 중 |
| PostgreSQL | DB 마이그레이션 | 낮음 |
| 캐싱 | API 응답 캐시 | 낮음 |
| 모니터링 | 로그/메트릭 | 낮음 |

---

## API 현황

### 구현 완료

| Method | Path | 설명 |
|--------|------|------|
| GET | `/` | 헬스체크 |
| POST | `/api/analyze` | 이미지 분석 |
| GET | `/api/reports` | 히스토리 목록 |
| GET | `/api/reports/{id}` | 리포트 상세 |
| GET | `/api/reports/{id}/pdf` | PDF 다운로드 |
| DELETE | `/api/reports/{id}` | 리포트 삭제 |

### 프론트엔드 연동 현황

| API | 프론트엔드 | 상태 |
|-----|-----------|------|
| POST `/api/analyze` | AnalyzePage | ✅ 연동됨 |
| GET `/api/reports` | HistoryPage | ⚠️ 페이지네이션 미연동 |
| GET `/api/reports/{id}` | ReportPage | ✅ 연동됨 |
| GET `/api/reports/{id}/pdf` | ReportPage | ✅ 연동됨 |
| DELETE `/api/reports/{id}` | - | ❌ UI 없음 |

---

## 참고 사항

### 백엔드 API 페이지네이션 파라미터

```
GET /api/reports?limit=10&offset=0
```

- `limit`: 한 페이지당 항목 수 (기본값: 10)
- `offset`: 건너뛸 항목 수 (기본값: 0)

### 프론트엔드 환경 변수

```env
VITE_API_BASE_URL=https://kfood-api-233469550454.asia-northeast3.run.app
```

---

## 변경 이력

| 날짜 | 내용 |
|------|------|
| 2026-01-15 | 최초 작성, Sprint 1 계획 수립 |
