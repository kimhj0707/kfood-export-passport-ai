# K-Food Export Passport AI

## Priority 3: 설명 가능한 AI(Explainability) UI 고도화 작업지시서

**작성일**: 2026-01-16  
**목표**: 분석 결과가 “AI가 판단했다”가 아니라  
**“규정 근거 + OCR 증거 + 확신도”로 설명되는 서비스**처럼 보이게 만들기

---

## 0. 원칙 (범위 고정)

- 새로운 모델 학습 ❌
- 규정 합격/불합격 ‘판정’ ❌
- 기능 과잉(관리자/결제/로그인 강화) ❌
- 현재 파이프라인 유지 ⭕

Priority 3는 **UI/데이터 구조의 ‘설명력’만 강화**한다.

---

## 1. 과제 A (필수): 리스크 항목에 “증거 문장” 연결

### A-1. 요구사항

각 Risk(경고/리스크) 항목이

- 어떤 OCR 문장/구절 때문에 발생했는지
- 사용자가 확인해야 하는 포인트가 어디인지
  를 보여줘야 한다.

### A-2. 구현 방식 (최소 구현)

- 백엔드에서 risks 생성 시 `evidence` 필드를 추가한다.
- evidence는 OCR 텍스트에서 찾은 근거 문자열(또는 주변 문장 일부)을 포함한다.

**Risk 응답 예시**

```json
{
  "type": "allergen_missing",
  "severity": "HIGH",
  "message": "Wheat allergen may be missing",
  "confidence": 0.82,
  "details": {
    "regulation": "FDA FALCPA",
    "article": "Section 403(w)",
    "reason": "Major allergens must be declared..."
  },
  "evidence": {
    "matched": ["Ingredients: ...", "Allergen statement not found"],
    "hint": "Check if 'Contains Wheat' statement is present"
  }
}
A-3. Evidence 추출 규칙 (간단)
알레르기 누락 계열:

"contains", "allergen", "may contain" 등 키워드 주변 1~2줄

라벨 항목 누락 계열:

nutrition, serving, net weight, manufacturer 등 키워드 주변

못 찾으면:

evidence.hint만 제공 (matched는 빈 배열)

2. 과제 B (필수): Confidence(확신도) 표시
B-1. 목적
OCR/규칙 기반 매칭은 100%가 아니므로,
서비스가 스스로 불확실성을 관리하는 모습을 보여야 한다.

B-2. 구현 방식
risks 각 항목에 confidence: 0.0~1.0를 포함

초기 버전은 “휴리스틱”으로 충분 (정교한 통계 모델 필요 없음)

추천 휴리스틱

증거 문장(matched) 존재 + 키워드 다수 발견: 0.8~0.95

matched 1개 이하: 0.6~0.8

hint만 있고 matched 없음: 0.4~0.6

B-3. 프론트 표시
ReportPage에서 리스크 카드에 다음 UI 표시:

Confidence 퍼센트 (예: 82%)

레이블:

80% 이상: “높음”

60~79%: “보통”

60% 미만: “확인 필요”

3. 과제 C (필수): 규정 근거 + 증거 + 조치 권장(Next Step) 3단 구조 고정
C-1. 리스크 카드 UI 구성 고정
각 리스크 항목은 반드시 아래 구조를 갖는다.

무슨 문제인가(요약)

근거(규정)

증거(OCR)

권장 조치(Next Step)

예시:

요약: “알레르기 표기 누락 가능”

근거: “FDA FALCPA 403(w)”

증거: OCR에서 찾은 관련 문장/부재 힌트

Next Step: “라벨에 ‘Contains: Wheat’ 문구 추가 여부 확인”

4. 과제 D (필수): 서비스 성격(법적 판단 아님) Discalimer UI 고정
D-1. 목적
“이거 법적 판단이냐?” 질문을 UI에서 선제 차단.

D-2. 구현
ReportPage 상단 또는 규정 섹션 상단에 고정 문구 표시:

KR:

“본 결과는 수출 라벨의 사전 점검을 지원하기 위한 참고 정보이며, 법적 자문이 아닙니다.”

EN:

“This report is for preliminary compliance review support and does not constitute legal advice.”

문구는 고정(변형 금지).

5. 적용 파일 후보 (가이드)
backend/src/api/main.py

backend/src/api/db.py (risks 저장/조회 JSON에 evidence/confidence 포함)

frontend/pages/ReportPage.tsx (리스크 카드 UI 3단 구조 + confidence + evidence)

frontend/services/api.ts (risk 변환 매핑)

frontend/types.ts (Risk 타입 확장)

6. 완료 기준 (Stop Rule)
Priority 3는 아래 조건을 만족하면 종료:

리포트에서 리스크 항목마다

규정 근거(details)

증거(evidence)

확신도(confidence)

권장 조치(next step)
가 구조적으로 표시된다.

“AI가 판단했다” 인상이 아니라
“규정 기반 체크 + 사용자가 확인할 포인트 제시”로 인식된다.

7. 금지 사항 (재강조)
합격/불합격/통과 같은 판정 UI 금지

법적 확정 표현 금지

모델 학습/대규모 국가 추가 금지
```
