import json
import os
import re
from typing import List, Dict

RULES_DIR = os.path.dirname(__file__)

COUNTRY_NAMES = {
    "US": "US FDA",
    "JP": "일본 식품표시법",
    "VN": "베트남 식품안전법"
}

# "경고/주의/포함" 같은 표기 마커(단, 이 마커만 있다고 PASS 처리하면 오탐이 생기므로
# marker + 알레르겐이 같은 줄(근접 문맥)에 함께 있어야 "명시적 경고"로 인정함)
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
    - 그 주변 일정 거리(window) 안에 해당 알레르겐(이름 또는 키워드)이 같이 있으면 True

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

    # marker 주변 window 범위 안에 알레르겐이 같이 있으면 경고로 인정
    for pos in marker_positions:
        start = max(0, pos - window)
        end = min(len(t), pos + window)
        context = t[start:end]

        if any(term and term in context for term in allergen_terms):
            return True

    return False



def check_risks(text: str, country: str = "US") -> List[Dict[str, str]]:
    """
    텍스트에서 알레르겐 누락 가능성을 검사한다.

    동작 규칙(확정):
    - OCR 텍스트에서 알레르겐 키워드가 잡히면 → "해당 알레르겐이 존재/언급됨"으로 간주
    - 그 알레르겐이 '명시적 경고 문구(마커+알레르겐 동시 표기)'로 함께 표시되지 않았다면 → HIGH 리스크
    - 알레르겐 키워드가 하나도 잡히지 않으면 → None(LOW) (근거 부족)

    Returns:
        [{"allergen": "...", "risk": "...", "severity": "HIGH/LOW"}]
    """
    country = (country or "US").upper()

    # 0) 빈 입력 방어
    if not text or not text.strip():
        return [{
            "allergen": "None",
            "risk": f"[{country}] OCR 텍스트가 비어 있어 분석할 수 없습니다.",
            "severity": "LOW"
        }]

    rules = _load_rules(country)
    country_name = COUNTRY_NAMES.get(country, country)

    if not rules:
        return [{
            "allergen": "Unknown",
            "risk": f"[{country}] 국가의 규칙 파일을 찾을 수 없습니다.",
            "severity": "LOW"
        }]

    text_lower = text.lower()
    risks: List[Dict[str, str]] = []
    detected_any = False

    for allergen in rules.get("major_allergens", []):
        allergen_name = allergen.get("name", "").strip()
        keywords = allergen.get("keywords", []) or []

        # 1) 키워드 감지
        found_keywords = [kw for kw in keywords if _keyword_found(text_lower, kw)]
        if not found_keywords:
            continue

        detected_any = True

        # 2) 명시적 경고 문구 여부(마커+알레르겐 동시 표기)
        has_warning = _has_explicit_warning(text, allergen_name, found_keywords)

        # 3) 경고 문구가 명시적이지 않으면 HIGH 리스크
        if not has_warning:
            risks.append({
                "allergen": allergen_name,
                "risk": (
                    f"[{country}] Allergen detected: {allergen_name}. "
                    f"{country_name} requires explicit allergen disclosure "
                    f"(e.g., 'Contains: {allergen_name}')."
                ),
                "severity": "HIGH"
            })


    # 4) 알레르겐 키워드 자체가 안 잡히면 None(LOW)
    if not detected_any:
        return [{
            "allergen": "None",
            "risk": f"[{country}] 알레르겐 키워드가 감지되지 않았습니다.",
            "severity": "LOW"
        }]

    # 5) 알레르겐은 감지됐지만(예: wheat/soy) 명시적 경고가 있어서 모두 PASS면 LOW
    if not risks:
        return [{
        "allergen": "PASS",
        "risk": f"[{country}] 알레르겐 키워드가 감지되었으며, 경고 문구(예: Contains/알레르기 유발물질)가 함께 표기된 것으로 판단됩니다.",
        "severity": "LOW"
        }]

    return risks
