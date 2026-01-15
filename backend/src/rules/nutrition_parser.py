import re
from typing import Dict, Any

NUTRITION_KEYWORDS = [
    "나트륨", "탄수화물", "당류", "지방", "트랜스지방",
    "포화지방", "콜레스테롤", "단백질", "칼슘"
]


def parse_nutrition(text: str) -> Dict[str, Any]:
    """
    OCR 텍스트에서 영양성분 정보를 추출한다.

    Returns:
        {
            "나트륨": {"value": 1790, "unit": "mg"},
            "탄수화물": {"value": 79, "unit": "g"},
            ...
        }
    """
    if not text:
        return {}

    result = {}
    text_clean = text.replace(" ", "").replace(",", "")

    for keyword in NUTRITION_KEYWORDS:
        pattern = rf"{keyword}[:\s]*(\d+(?:\.\d+)?)\s*(mg|g|㎎|㎍|ug|mcg)"
        match = re.search(pattern, text_clean, re.IGNORECASE)

        if match:
            value = float(match.group(1))
            unit = match.group(2)
            unit = unit.replace("㎎", "mg").replace("㎍", "ug")

            if value == int(value):
                value = int(value)

            result[keyword] = {"value": value, "unit": unit}

    return result
