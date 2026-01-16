# backend/src/rules/checker.py
import os
import json
import re
from typing import List, Dict, Any, Optional, Tuple

RULES_DIR = os.path.dirname(__file__)

COUNTRY_NAMES = {
    "US": "US FDA",
    "JP": "일본 식품표시법",
    "VN": "베트남 식품안전법",
    "EU": "EU 식품정보규정",
    "CN": "중국 식품안전법"
}

# "경고/주의/포함" 같은 표기 마커
WARNING_MARKERS = [
    "contains", "contain", "containing",
    "may contain",
    "포함", "함유", "들어있", "함유하고",
    "allergen", "allergy", "알레르기",
    "warning", "주의", "경고"
]


def _load_rules(country: str) -> Dict[str, Any]:
    """국가별 규칙 파일 로드"""
    rule_files = {
        "US": "us_fda.json",
        "JP": "jp_food_label.json",
        "VN": "vn_food_label.json",
        "EU": "eu_food_label.json",
        "CN": "cn_food_label.json",
    }
    filename = rule_files.get((country or "").upper())
    if not filename:
        return {}

    filepath = os.path.join(RULES_DIR, filename)
    if not os.path.isfile(filepath):
        return {}

    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)


def _is_korean(s: str) -> bool:
    """문자열에 한글이 포함되어 있으면 True"""
    for ch in s:
        if "\uac00" <= ch <= "\ud7a3":
            return True
    return False


def _keyword_found(text_lower: str, kw: str) -> bool:
    """
    키워드 매칭:
    - 영어/숫자 위주 키워드는 단어 경계(\b)로 매칭 (오탐 감소)
    - 한글 키워드는 부분 매칭 허용 (OCR 특성상 띄어쓰기/조사 등 변형이 많음)
    """
    k = (kw or "").strip().lower()
    if not k:
        return False

    if _is_korean(k):
        return k in text_lower

    return re.search(rf"\b{re.escape(k)}\b", text_lower) is not None


def _split_lines_for_context(text: str) -> List[str]:
    """
    OCR 텍스트를 '근접 문맥' 단위로 쪼갠다.
    - 줄바꿈 + 문장 구분(., 。 등) 기준
    """
    return [
        ln.strip()
        for ln in re.split(r"[\n\r]+|[.。]", text or "")
        if ln.strip()
    ]


def _detect_cross_contamination(text: str) -> bool:
    """
    교차오염(동일 시설/장비 제조, may contain 등) 문구 감지 (bool)
    """
    t = (text or "").lower()
    markers = [
        "같은 제조",
        "같은 제조시설",
        "같은 시설",
        "제조 시설",
        "동일한 제조",
        "동일 시설",
        "같은 장비",
        "shared facility",
        "shared equipment",
        "processed in a facility",
        "processed on shared equipment",
        "may contain",
    ]
    return any(m in t for m in markers)


def _find_cross_contamination_evidence(text: str, limit: int = 2) -> List[str]:
    """
    교차오염 관련 문장이 포함된 라인만 근거로 뽑는다. (List[str])
    ✅ MEDIUM(CROSS_CONTAMINATION) 근거는 이 함수로만 고정 사용
    """
    t = text or ""
    lines = _split_lines_for_context(t)
    markers = [
        "같은 제조", "같은 제조시설", "같은 시설", "제조 시설",
        "동일한 제조", "동일 시설", "같은 장비",
        "may contain", "processed in a facility",
        "processed on shared equipment", "shared facility", "shared equipment"
    ]

    hits: List[str] = []
    for ln in lines:
        ln_lower = ln.lower()
        if any(m.lower() in ln_lower for m in markers):
            hits.append(ln.strip())
        if len(hits) >= limit:
            break
    return hits


def _build_non_cc_text(text: str, window: int = 2) -> str:
    """
    교차오염(같은 제조시설/may contain 등) '문맥'에 해당하는 라인들을 제거한 텍스트를 만든다.
    - 교차오염 마커가 등장한 라인 기준으로 앞/뒤 window 라인을 함께 제거
    - 이렇게 해야 '- 이 제품은 난류, 게, 새우...' 같은 '앞줄'도 같이 제거됨(중요)
    """
    lines = _split_lines_for_context(text or "")
    if not lines:
        return ""

    # 교차오염 마커가 있는 라인 인덱스 찾기
    marker_idx = []
    for i, ln in enumerate(lines):
        if _is_cross_contamination_line(ln):
            marker_idx.append(i)

    if not marker_idx:
        return "\n".join(lines)

    # 마커 주변 라인까지 제거 대상으로 확장
    remove_idx = set()
    for i in marker_idx:
        start = max(0, i - window)
        end = min(len(lines), i + window + 1)
        for j in range(start, end):
            remove_idx.add(j)

    # 제거되지 않은 라인만 합쳐서 반환
    kept = [ln for idx, ln in enumerate(lines) if idx not in remove_idx]
    return "\n".join(kept)


def _is_cross_contamination_line(line: str) -> bool:
    t = (line or "").lower()
    markers = [
        "같은 제조", "같은 제조시설", "같은 시설", "제조 시설",
        "동일한 제조", "동일 시설", "같은 장비",
        "may contain", "processed in a facility",
        "processed on shared equipment", "shared facility", "shared equipment"
    ]
    if any(m.lower() in t for m in markers):
        return True

    stripped = (line or "").strip()
    if (stripped.startswith("-") or stripped.startswith("•")):
        if ("이 제품은" in line or "본 제품은" in line):
            allergen_indicators = ["난류", "새우", "게", "땅콩", "호두", "대두", "밀", "우유", "메밀", "고등어", "돼지고기", "복숭아", "토마토", "아황산"]
            comma_count = line.count(",")
            allergen_count = sum(1 for a in allergen_indicators if a in line)
            if comma_count >= 2 and allergen_count >= 2:
                return True

    return False
    
def _has_explicit_warning(text: str, allergen_name: str, keywords: List[str]) -> bool:
    """
    '명시적 경고 문구' 인정:
    - WARNING_MARKERS 중 하나가 등장하고
    - 그 주변(window) 안에 해당 알레르겐(이름 또는 키워드)이 함께 있으면 True
    """
    t = (text or "").lower()
    if not t.strip():
        return False

    allergen_terms: List[str] = []
    if allergen_name:
        allergen_terms.append(allergen_name.lower())
    allergen_terms.extend([(kw or "").lower().strip() for kw in keywords if (kw or "").strip()])

    window = 120

    marker_positions: List[int] = []
    for marker in WARNING_MARKERS:
        for m in re.finditer(re.escape(marker), t):
            marker_positions.append(m.start())

    if not marker_positions:
        return False

    for pos in marker_positions:
        start = max(0, pos - window)
        end = min(len(t), pos + window)
        context = t[start:end]
        if any(term and term in context for term in allergen_terms):
            return True

    return False


def _get_evidence_and_confidence(text: str, keywords: List[str]) -> Tuple[List[str], float]:
    """
    OCR 텍스트에서 근거 문장과 확신도를 계산한다.
    - 근거 문장: 키워드가 포함된 문장/줄 (원문 유지)
    - 확신도: 근거 문장 수 기반 휴리스틱
    """
    if not text or not keywords:
        return [], 0.0

    lines = _split_lines_for_context(text)  # ✅ 원문 기준
    matched_lines: List[str] = []

    for line in lines:
        line_lower = line.lower()
        if any(_keyword_found(line_lower, kw) for kw in keywords):
            matched_lines.append(line.strip())

    # 순서 유지 중복 제거
    matched_lines = list(dict.fromkeys(matched_lines))

    if len(matched_lines) > 1:
        confidence = 0.85 + min(0.1, (len(matched_lines) - 2) * 0.05)  # 0.85~0.95
    elif len(matched_lines) == 1:
        confidence = 0.7
    else:
        confidence = 0.0

    return matched_lines, round(confidence, 2)


def _get_allergen_rule_description(country: str, allergen_name: str) -> str:
    # ✅ "8가지" 같이 고정 숫자 표현 제거 (나중에 규정 바뀌면 위험)
    if country == "US":
        return f"미국 FDA 기준으로 주요 알레르겐({allergen_name} 포함)은 'Contains' 등으로 명확히 표시하는 것이 권장/요구됩니다."
    if country == "JP":
        return f"일본 식품표시법은 알레르기 유발 물질({allergen_name} 포함)에 대한 명확한 표시를 요구합니다."
    if country == "VN":
        return f"베트남 식품안전법은 알레르겐({allergen_name} 포함)에 대한 규정된 표기를 요구합니다."
    if country == "EU":
        return f"EU 식품정보규정(FIC)은 알레르겐({allergen_name} 포함)의 명확하고 강조된 표시를 의무화합니다."
    if country == "CN":
        return f"중국 식품안전법은 알레르겐({allergen_name} 포함)에 대한 적절한 라벨링을 규정합니다."
    return f"[{country}] 식품 규정은 '{allergen_name}'에 대한 적절한 알레르겐 표시를 요구합니다."


def _find_pass_evidence(text: str, found_keywords: List[str], limit: int = 2) -> List[str]:
    """
    PASS 근거 라인 뽑기:
    - WARNING_MARKERS(함유/contains/알레르기/경고 등) + (발견된 알레르겐 키워드) 같이 있는 라인만 뽑는다.
    ✅ '주의사항' 같은 무관 문장이 섞이는 걸 줄이기 위해, 키워드 동시 포함 조건을 건다.
    """
    if not text or not found_keywords:
        return []

    lines = _split_lines_for_context(text)
    keywords_lower = [(k or "").strip().lower() for k in found_keywords if (k or "").strip()]
    hits: List[str] = []

    for ln in lines:
        ln_lower = ln.lower()
        has_marker = any(m.lower() in ln_lower for m in WARNING_MARKERS)
        has_kw = any(kw in ln_lower for kw in keywords_lower)
        if has_marker and has_kw:
            hits.append(ln.strip())
        if len(hits) >= limit:
            break

    return hits


def check_risks(
    text: str,
    country: str = "US",
    ocr_confidence: Optional[str] = None,
    detected_language: Optional[str] = None,
    nutrition_detected: Optional[bool] = None
) -> Dict[str, Any]:
    """
    텍스트에서 알레르기 누락 가능성 검사 + 리포트 패키지 반환
    returns:
      {
        risks: [...],
        summary: {...},
        input_data_status: {...},
        correction_guide: [...],
        regulatory_basis: [...]
      }
    """
    country = (country or "US").upper()
    rules = _load_rules(country)
    country_name = COUNTRY_NAMES.get(country, country)

    input_data_status = {
        "ocr_confidence": ocr_confidence or "불명",
        "detected_language": detected_language or "불명",
        "ingredients_detected": bool(text and text.strip()),
        "allergens_detected": False,
        "nutrition_detected": ("확인 필요" if nutrition_detected is None else bool(nutrition_detected)),
    }

    if not text or not text.strip():
        risks_list = [{
            "allergen": "None",
            "risk": f"[{country_name}] OCR 텍스트가 비어 있어 분석할 수 없습니다.",
            "severity": "LOW",
            "confidence": 0.0,
            "evidence": {"matched": [], "hint": "No text provided for analysis."},
            "expert_check_required": False,
            "rule_id": f"{country}_NO_TEXT_001",
            "rule_description": "분석을 위한 텍스트 입력이 없습니다.",
        }]
        return {
            "risks": risks_list,
            "summary": {
                "overall_summary": "분석할 텍스트가 없어 리포트 생성이 제한됩니다.",
                "priority_item": "텍스트 없음",
                "expected_effect": "텍스트를 입력하여 상세 분석을 수행하세요."
            },
            "input_data_status": input_data_status,
            "correction_guide": [],
            "regulatory_basis": []
        }

    if not rules:
        risks_list = [{
            "allergen": "Unknown",
            "risk": f"[{country_name}] 국가의 규칙 파일을 찾을 수 없습니다.",
            "severity": "LOW",
            "confidence": 0.0,
            "evidence": {"matched": [], "hint": f"Rules for country '{country}' not found."},
            "expert_check_required": False,
            "rule_id": f"{country}_NO_RULES_001",
            "rule_description": "선택된 국가에 대한 규정 파일이 시스템에 존재하지 않습니다.",
        }]
        return {
            "risks": risks_list,
            "summary": {
                "overall_summary": f"{country_name}에 대한 규정 파일을 찾을 수 없어 분석이 제한됩니다.",
                "priority_item": "규정 파일 없음",
                "expected_effect": "정확한 국가 규정 파일 설정이 필요합니다."
            },
            "input_data_status": input_data_status,
            "correction_guide": [],
            "regulatory_basis": []
        }

    text_lower = text.lower()
    non_cc_text = _build_non_cc_text(text, window=2)
    non_cc_lower = non_cc_text.lower()

    risks: List[Dict[str, Any]] = []
    detected_any_allergen_keyword = False

    # ✅ 2번(MEDIUM) 교차오염 감지 (있냐/없냐)
    cross_contamination = _detect_cross_contamination(text)

    # PASS 근거를 위해 "발견된 알레르겐 키워드"를 모아둔다
    all_found_keywords: List[str] = []

    # 1) 알레르겐 키워드 기반 HIGH 리스크 탐지
    for allergen in rules.get("major_allergens", []):
        allergen_name = (allergen.get("name", "") or "").strip()
        keywords = allergen.get("keywords", []) or []

        # 교차오염 문맥(마커 줄 + 주변 2줄)을 제거한 텍스트에서 키워드 검색
        found_keywords = [kw for kw in keywords if _keyword_found(non_cc_lower, kw)]

        if not found_keywords:
            continue

        detected_any_allergen_keyword = True
        all_found_keywords.extend(found_keywords)

        has_warning = _has_explicit_warning(non_cc_text, allergen_name, found_keywords)

        # 경고 문구가 "없다"면 HIGH (표기 누락 가능)
        if not has_warning:
            matched_sentences, confidence = _get_evidence_and_confidence(non_cc_text, found_keywords)

            # 너무 낮으면 오탐 방지
            if confidence < 0.4:
                continue

            details = allergen.get("details", {})
            next_step = f"라벨에 '{allergen_name}'에 대한 명시적인 알레르기 경고(예: 'Contains {allergen_name}')가 있는지 확인하세요."

            risks.append({
                "allergen": allergen_name,
                "risk": (
                    f"[{country_name}] 필수 알레르겐 '{allergen_name}' 포함 가능성이 있으나, "
                    "명시적인 경고 문구가 확인되지 않았습니다."
                ),
                "severity": "HIGH",
                "confidence": confidence,
                "details": details,
                "evidence": {
                    "matched": matched_sentences,
                    "hint": f"'{', '.join(found_keywords)}' 키워드가 발견되었습니다."
                },
                "next_step": next_step,
                "expert_check_required": True,
                "rule_id": f"{country}_{allergen_name.upper().replace(' ', '_')}_LABELING_001",
                "rule_description": _get_allergen_rule_description(country, allergen_name),
            })

    input_data_status["allergens_detected"] = detected_any_allergen_keyword

    # 2) ✅ MEDIUM: 교차오염 문구가 있을 경우
    #    - 규정 "위반"이라기보단 수출 라벨에서 표현/표기 확인 필요 → MEDIUM
    if cross_contamination:
        evidence = _find_cross_contamination_evidence(text, limit=2)  # ✅ 여기! (너가 헷갈린 그 라인)
        risks.append({
            "allergen": "CROSS_CONTAMINATION",
            "risk": f"[{country_name}] 동일 제조시설/교차오염 가능성 문구가 감지되었습니다. 수출 라벨에서 문구 처리/표기 방식 확인이 필요합니다.",
            "severity": "MEDIUM",
            "confidence": 0.8,
            "evidence": {
                "matched": evidence,
                "hint": "Cross-contamination marker detected (e.g., '같은 제조시설', 'may contain')."
            },
            "expert_check_required": True,
            "rule_id": f"{country}_CROSS_CONTAMINATION_001",
            "rule_description": f"{country_name} 기준으로 교차오염(동일 시설 제조) 문구의 표기/표현 적합성 확인이 필요합니다.",
            "cross_contamination": True,
        })

    # 3) PASS/NO_KEYWORD 처리
    if not detected_any_allergen_keyword:
        risks.append({
            "allergen": "None",
            "risk": f"[{country_name}] 주요 알레르기 관련 키워드가 감지되지 않았습니다.",
            "severity": "LOW",
            "confidence": 0.9,
            "evidence": {"matched": [], "hint": "No major allergen keywords found in the text."},
            "expert_check_required": False,
            "rule_id": f"{country}_NO_ALLERGEN_KEYWORD_001",
            "rule_description": f"'{country_name}'의 주요 알레르겐 키워드가 텍스트에서 발견되지 않았습니다.",
        })
    else:
        # 알레르겐 키워드는 있었는데 HIGH가 하나도 없으면 = 경고문구가 있었다고 보고 PASS를 넣어준다.
        high_exists = any(r.get("severity") == "HIGH" for r in risks)
        if not high_exists:
            # ✅ PASS 근거: "마커 + 알레르겐키워드"가 같이 있는 라인만
            pass_evidence = _find_pass_evidence(text, all_found_keywords, limit=2)
            hint = "Allergen keywords were found with explicit warning statements."
            if cross_contamination:
                hint += " Cross-contamination marker also detected."

            risks.append({
                "allergen": "PASS",
                "risk": f"[{country_name}] 주요 알레르기 키워드가 감지되었고, 관련 경고 문구가 함께 발견되어 규정을 준수하는 것으로 보입니다.",
                "severity": "LOW",
                "confidence": 0.95,
                "evidence": {
                    "matched": pass_evidence,
                    "hint": hint
                },
                "expert_check_required": False,
                "rule_id": f"{country}_ALLERGEN_COMPLIANT_001",
                "rule_description": f"'{country_name}'의 알레르겐 표시 규정을 준수하는 것으로 판단됩니다.",
                "cross_contamination": cross_contamination,
            })

    # 4) summary 생성
    high_risks = [r for r in risks if r.get("severity") == "HIGH"]
    medium_risks = [r for r in risks if r.get("severity") == "MEDIUM"]

    # priority_item 한글 변환
    def _translate_priority(allergen: str) -> str:
        translations = {
            "CROSS_CONTAMINATION": "교차오염 문구 확인",
            "None": "없음",
            "PASS": "규정 준수",
            "Unknown": "알 수 없음",
        }
        return translations.get(allergen, allergen)

    if high_risks:
        overall_summary = f"높은 위험도의 알레르기 규정 위반 {len(high_risks)}건이 감지되었습니다. 즉시 확인이 필요합니다."
        priority_item = _translate_priority(high_risks[0].get("allergen", "Unknown"))
    elif medium_risks:
        overall_summary = f"중간 위험도의 주의 항목 {len(medium_risks)}건이 감지되었습니다. 추가 검토(표기/표현) 권장."
        priority_item = _translate_priority(medium_risks[0].get("allergen", "MEDIUM_ITEM"))
    else:
        overall_summary = "현재 OCR 텍스트에서는 알레르기 관련 주요 위험이 감지되지 않았습니다."
        priority_item = "없음"

    summary = {
        "overall_summary": overall_summary,
        "priority_item": priority_item,
        "expected_effect": "규정 준수 및 수출 가능성 향상"
    }

    # 5) correction_guide 생성 (HIGH 또는 MEDIUM 있을 때)
    correction_guide: List[Dict[str, str]] = []

    # HIGH 위험: 알레르겐 표기 누락
    if high_risks:
        allergen_for_guide = high_risks[0].get("allergen", "ALLERGEN")
        correction_guide.append({
            "before": "Ingredients: Wheat flour, sugar, salt",
            "after": f"Ingredients: Wheat flour, sugar, salt\nContains: {allergen_for_guide}"
        })
        correction_guide.append({
            "before": "제품명: 맛있는 과자",
            "after": f"제품명: 맛있는 과자\n알레르기 정보: {allergen_for_guide} 함유"
        })

    # MEDIUM 위험: 교차오염 문구 처리
    if cross_contamination:
        correction_guide.append({
            "before": "이 제품은 난류, 우유, 새우를 사용한 제품과 같은 시설에서 제조",
            "after": "May contain traces of: Eggs, Milk, Shrimp\n(교차오염 가능성을 영문으로 명확히 표기)"
        })
        correction_guide.append({
            "before": "같은 제조시설에서 제조하고 있습니다",
            "after": "Produced in a facility that also processes: [알레르겐 목록]\n(수출국 규정에 맞는 표현으로 변경)"
        })

    # 6) regulatory_basis
    regulatory_basis: List[str] = []
    if country == "US":
        regulatory_basis += [
            "미국: FDA allergen 'Contains' labeling",
            "미국: 식품 영양 정보 표시 규정"
        ]
    elif country == "JP":
        regulatory_basis += [
            "일본: 식품표시법 알레르기 27품목",
            "일본: 영양성분 표시 기준"
        ]
    elif country == "VN":
        regulatory_basis += [
            "베트남: 현지어 라벨 표시 요건",
            "베트남: 식품 첨가물 규제"
        ]
    elif country == "EU":
        regulatory_basis += [
            "유럽연합: FIC(Food Information to Consumers) 규정",
            "유럽연합: 알레르겐 강조 표시 의무"
        ]
    elif country == "CN":
        regulatory_basis += [
            "중국: GB 7718 (사전 포장 식품 라벨)",
            "중국: GB 28050 (영양성분 표시)"
        ]
    else:
        regulatory_basis.append(f"{country_name}: 일반 식품 라벨링 규정")

    # 7) expert_check_required 후처리: confidence 낮고 severity가 LOW가 아니면 True
    for r in risks:
        sev = r.get("severity", "LOW")
        conf = float(r.get("confidence", 0.0) or 0.0)
        if sev != "LOW" and conf < 0.7:
            r["expert_check_required"] = True

    return {
        "risks": risks,
        "summary": summary,
        "input_data_status": input_data_status,
        "correction_guide": correction_guide,
        "regulatory_basis": regulatory_basis,
    }
