import json
import os
import re
from typing import List, Dict

RULES_DIR = os.path.dirname(__file__)

COUNTRY_NAMES = {
    "US": "US FDA",
    "JP": "일본 식품표시법",
    "VN": "베트남 식품안전법",
    "EU": "EU 식품정보규정",
    "CN": "중국 식품안전법"
}

# "경고/주의/포함" 같은 표기 마커(단, 이 마커만 있다고 PASS 처리하면 오탐이 생기므로
# marker + 알레르기이 같은 줄(근접 문맥)에 함께 있어야 "명시적 경고"로 인정함)
WARNING_MARKERS = [
    "contains", "contain", "containing",
    "포함", "함유", "들어있",
    "allergen", "allergy", "알레르기",
    "warning", "주의", "경고"
]


def _load_rules(country: str) -> Dict:
    """국가별 규칙 파일을 로드한다."""
    rule_files = {
        "US": "us_fda.json",
        "JP": "jp_food_label.json",
        "VN": "vn_food_label.json",
        "EU": "eu_food_label.json",
        "CN": "cn_food_label.json",
    }
    filename = rule_files.get(country.upper())
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

    # 영어는 단어 경계 우선
    # 예: "soy"가 "soya"를 놓칠 수 있는데, 여기선 안정성 우선.
    # 필요하면 keywords에 "soya"도 추가해서 커버.
    return re.search(rf"\b{re.escape(k)}\b", text_lower) is not None


def _split_lines_for_context(text: str) -> List[str]:
    """
    OCR 텍스트를 '근접 문맥' 단위로 쪼갠다.
    - 줄바꿈 + 문장 구분(., 。 등) 기준
    """
    return [ln.strip() for ln in re.split(r"[\n\r]+|[.。]", (text or "").lower()) if ln.strip()]


def _has_explicit_warning(text: str, allergen_name: str, keywords: List[str]) -> bool:
    """
    '명시적 경고 문구' 인정 조건(현실 OCR 대응 강화 버전):
    - WARNING_MARKERS(contains/알레르기/주의/포함 등) 중 하나가 등장하면
    - 그 주변 일정 거리(window) 안에 해당 알레르기(이름 또는 키워드)이 같이 있으면 True

    목적:
    - OCR 줄바꿈/기호 인식 오류로 "같은 줄" 조건이 깨져도 경고로 인정
    - "알레르기 유발물질: 우유, 새우..." 같은 한국 라벨 문구도 안정적으로 PASS 처리
    """
    t = (text or "").lower()
    if not t.strip():
        return False

    allergen_terms = []
    if allergen_name:
        allergen_terms.append(allergen_name.lower())
    allergen_terms.extend([(kw or "").lower().strip() for kw in keywords if (kw or "").strip()])

    # marker 주변 몇 글자까지를 "근접 문맥"으로 볼지 (너무 크면 오탐↑, 너무 작으면 미탐↑)
    window = 120

    # marker가 하나도 없으면 경고 문구로 인정 불가
    marker_positions = []
    for marker in WARNING_MARKERS:
        for m in re.finditer(re.escape(marker), t):
            marker_positions.append(m.start())

    if not marker_positions:
        return False

    # marker 주변 window 범위 안에 알레르기이 같이 있으면 경고로 인정
    for pos in marker_positions:
        start = max(0, pos - window)
        end = min(len(t), pos + window)
        context = t[start:end]

        if any(term and term in context for term in allergen_terms):
            return True

    return False



def _get_evidence_and_confidence(text_lower: str, keywords: List[str]) -> (List[str], float):
    """
    OCR 텍스트에서 근거 문장과 확신도를 계산한다.
    - 근거 문장: 키워드가 포함된 문장 (또는 줄)
    - 확신도: 근거 문장 수에 기반한 휴리스틱 점수
    """
    if not text_lower or not keywords:
        return [], 0.0

    lines = _split_lines_for_context(text_lower)
    matched_lines = []
    
    for line in lines:
        if any(_keyword_found(line, kw) for kw in keywords):
            matched_lines.append(line.strip())
            
    matched_lines = list(set(matched_lines)) # 중복 제거

    # 확신도 휴리스틱
    confidence = 0.0
    if len(matched_lines) > 1:
        confidence = 0.85 + min(0.1, (len(matched_lines) - 2) * 0.05) # 0.85 ~ 0.95
    elif len(matched_lines) == 1:
        confidence = 0.7
    
    return matched_lines, round(confidence, 2)


def check_risks(text: str, country: str = "US") -> List[Dict[str, str]]:
    """
    텍스트에서 알레르기 누락 가능성을 검사하고,
    '설명 가능한 AI'를 위해 근거(evidence)와 확신도(confidence)를 포함한다.
    """
    country = (country or "US").upper()

    if not text or not text.strip():
        return [{
            "allergen": "None",
            "risk": f"[{country}] OCR 텍스트가 비어 있어 분석할 수 없습니다.",
            "severity": "LOW",
            "confidence": 0.0,
            "evidence": {"matched": [], "hint": "No text provided for analysis."}
        }]

    rules = _load_rules(country)
    country_name = COUNTRY_NAMES.get(country, country)

    if not rules:
        return [{
            "allergen": "Unknown",
            "risk": f"[{country}] 국가의 규칙 파일을 찾을 수 없습니다.",
            "severity": "LOW",
            "confidence": 0.0,
            "evidence": {"matched": [], "hint": f"Rules for country '{country}' not found."}
        }]

    text_lower = text.lower()
    risks: List[Dict[str, str]] = []
    detected_any = False

    for allergen in rules.get("major_allergens", []):
        allergen_name = allergen.get("name", "").strip()
        keywords = allergen.get("keywords", []) or []

        found_keywords = [kw for kw in keywords if _keyword_found(text_lower, kw)]
        if not found_keywords:
            continue

        detected_any = True
        
        has_warning = _has_explicit_warning(text, allergen_name, found_keywords)
        
        if not has_warning:
            matched_sentences, confidence = _get_evidence_and_confidence(text_lower, found_keywords)
            
            # 확신도가 너무 낮으면(0에 가까우면) 리스크로 보고하지 않음 (오탐 방지)
            if confidence < 0.4:
                continue

            details = allergen.get("details", {})
            next_step = (
                f"라벨에 '{allergen_name}'에 대한 명시적인 알레르기 경고(예: 'Contains {allergen_name}')가 있는지 확인하세요."
            )



            risk_item = {

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

                "expert_check_required": True  # HIGH severity or low confidence

            }

            risks.append(risk_item)



    if not detected_any:

        return [{

            "allergen": "None",

            "risk": f"[{country_name}] 주요 알레르기 관련 키워드가 감지되지 않았습니다.",

            "severity": "LOW",

            "confidence": 0.9,

            "evidence": {"matched": [], "hint": "No major allergen keywords found in the text."},

            "expert_check_required": False

        }]



    if not risks:

        return [{

        "allergen": "PASS",

        "risk": f"[{country_name}] 주요 알레르기 키워드가 감지되었고, 관련 경고 문구가 함께 발견되어 규정을 준수하는 것으로 보입니다.",

        "severity": "LOW",

        "confidence": 0.95,

        "evidence": {"matched": [], "hint": "Allergen keywords were found with explicit warning statements."},

        "expert_check_required": False

        }]



    # 리스크 항목별로 expert_check_required 최종 결정

    for risk in risks:

        if risk['confidence'] < 0.7:

            risk['expert_check_required'] = True

    

    return risks
