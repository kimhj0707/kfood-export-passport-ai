import re
from typing import List

ALLERGEN_KEYWORDS = [
    "밀", "대두", "계란", "우유", "돼지고기", "쇠고기", "닭고기",
    "새우", "게", "땅콩", "호두", "오징어", "조개"
]

CONTEXT_PATTERNS = [
    r"함유",
    r"포함",
    r"사용한\s*제품",
    r"같은\s*제조\s*시설",
]


def extract_allergens(text: str) -> List[str]:
    """
    OCR 텍스트에서 알레르겐 키워드를 추출한다.
    "함유", "포함", "사용한 제품", "같은 제조 시설" 문맥 내에서만 탐지.

    Returns:
        중복 제거된 알레르겐 리스트
    """
    if not text:
        return []

    found = set()
    sentences = re.split(r'[.。\n]', text)

    for sentence in sentences:
        has_context = any(re.search(pattern, sentence) for pattern in CONTEXT_PATTERNS)

        if has_context:
            for allergen in ALLERGEN_KEYWORDS:
                if allergen in sentence:
                    found.add(allergen)

    return list(found)
