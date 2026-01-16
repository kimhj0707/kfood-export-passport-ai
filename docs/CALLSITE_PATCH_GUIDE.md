## 목적

checker.py의 `check_risks()`가 이제 report_pack(dict)을 반환하므로,
PDF 생성 호출부에서 `generate_pdf_report()`에 필요한 값을 올바르게 분해하여 전달한다.
또한 더미/플레이스홀더 기본값을 제거하여 스펙(ANALYSIS_REPORT_SPEC.md)을 준수한다.

---

## 변경 배경

- `check_risks()` 반환: `List[Dict]` → `Dict[str, Any]` (report_pack)
- `generate_pdf_report()`는 여전히 다음 파라미터를 기대:
  - `risks: List[Dict[str, Any]]`
  - `summary, input_data_status, correction_guide, regulatory_basis`

따라서 호출부에서 `report_pack["..."]` 형태로 분해 전달이 필요하다.

---

## 작업 1) check_risks 기본값 더미 제거 (필수)

### 대상 파일

- `backend/src/rules/checker.py`

### 변경 전 (문제)

- 기본값이 "중간", "한국어/영어 혼합", False 등으로 고정되어 실제 데이터가 없어도 ‘그럴듯한 값’이 출력됨.

### 변경 후 (정답)

- 기본값은 **불명/확인 필요** 또는 None 기반으로 처리한다.

#### 권장 수정

- 시그니처:

````python
def check_risks(
    text: str,
    country: str = "US",
    ocr_confidence: str | None = None,
    detected_language: str | None = None,
    nutrition_detected: bool | None = None
) -> Dict[str, Any]:
input_data_status 구성:

python
코드 복사
input_data_status = {
  "ocr_confidence": ocr_confidence or "불명",
  "detected_language": detected_language or "불명",
  "ingredients_detected": bool(text and text.strip()),
  "allergens_detected": False,   # 아래에서 업데이트
  "nutrition_detected": ("확인 필요" if nutrition_detected is None else bool(nutrition_detected)),
}
작업 2) PDF 생성 호출부 패치 (핵심)
목표
check_risks() 결과를 generate_pdf_report()에 맞게 분해해서 전달한다.

표준 호출 패턴 (정답)
python
코드 복사
report_pack = check_risks(
    text=ocr_text,
    country=country,
    ocr_confidence=ocr_confidence,          # OCR 모듈에서 확보 가능한 값(없으면 None)
    detected_language=detected_language,    # 언어 감지 결과(없으면 None)
    nutrition_detected=nutrition_detected   # 영양 파싱 성공 여부(없으면 None)
)

pdf_bytes = generate_pdf_report(
    report_id=report_id,
    country=country,
    ocr_engine=ocr_engine,
    allergens=allergens,
    nutrition=nutrition,
    risks=report_pack.get("risks", []),
    promo=promo,
    summary=report_pack.get("summary"),
    input_data_status=report_pack.get("input_data_status"),
    correction_guide=report_pack.get("correction_guide"),
    regulatory_basis=report_pack.get("regulatory_basis"),
)
대상 파일 찾기
다음 키워드로 프로젝트에서 검색한다:

generate_pdf_report(

check_risks(

pdf_report

수정 규칙
기존에 risks = check_risks(...)로 받던 곳은 전부 report_pack = ...로 변경

PDF 함수 호출 시 risks=report_pack["risks"] 형태로 전달

누락 방지를 위해 .get() 기본값 사용 권장

작업 3) 호출부가 List를 기대하던 루프 수정 (필수)
문제 패턴
python
코드 복사
risks = check_risks(...)
for r in risks:
    ...
수정 패턴
python
코드 복사
report_pack = check_risks(...)
risks = report_pack.get("risks", [])
for r in risks:
    ...
검증 체크리스트
 서버 실행 시 TypeError 발생하지 않음 (check_risks 인자/반환)

 PDF 생성 성공

 PDF에 다음 섹션이 표시됨: 0 요약, 1 입력 데이터 상태, 3 수정 가이드, 4 규정 근거 정보, 5 면책

 규정 검토 결과에서 규정 ID / rule_description 표시됨

 OCR 정보가 없으면 "불명/확인 필요"로 표시되고 ‘중간/혼합’ 같은 더미가 출력되지 않음

css
코드 복사

---

## 2) 코딩 AI/CLI에 바로 던질 프롬프트 (복붙)

```text
질문/선택지 없이 즉시 작업하세요.

목표:
- check_risks()가 Dict(report_pack)을 반환하는 구조에 맞춰
  generate_pdf_report() 호출부를 전부 패치하여 런타임 에러 없이 PDF가 생성되게 한다.
- 더미 기본값("중간", "한국어/영어 혼합", False) 제거: 값이 없으면 "불명/확인 필요"로 표시한다.

작업:
1) 프로젝트 전체에서 다음을 검색:
   - "generate_pdf_report("
   - "check_risks("
2) check_risks 호출부를 다음 표준 패턴으로 변경:
   - report_pack = check_risks(...)
   - risks = report_pack.get("risks", [])
3) generate_pdf_report 호출 시 다음 키를 분해 전달:
   - risks=report_pack.get("risks", [])
   - summary=report_pack.get("summary")
   - input_data_status=report_pack.get("input_data_status")
   - correction_guide=report_pack.get("correction_guide")
   - regulatory_basis=report_pack.get("regulatory_basis")
4) checker.py에서 check_risks 기본값 더미 제거:
   - 기본값은 None로 받고, 출력 시 "불명/확인 필요"로 처리.

출력:
- 수정된 파일 목록
- 각 파일의 변경 diff 또는 변경된 코드 블록
- 변경 요약(10줄 이내)
설명/토론 금지. 작업 결과만 출력.
````
