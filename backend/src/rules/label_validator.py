"""
라벨 이미지 검증 모듈
OCR 텍스트를 분석하여 식품 라벨인지 판단합니다.
"""

from typing import Tuple, List
import re

# 최소 텍스트 길이 (너무 짧으면 라벨이 아닐 가능성 높음)
MIN_TEXT_LENGTH = 30

# 라벨 관련 키워드 (한국어/영어)
LABEL_KEYWORDS = {
    "nutrition": [
        # 한국어
        "열량", "칼로리", "단백질", "지방", "탄수화물", "당류", "나트륨",
        "포화지방", "트랜스지방", "콜레스테롤", "식이섬유", "칼슘", "철분",
        "영양성분", "영양정보", "1회 제공량", "총 내용량",
        # 영어
        "calories", "protein", "fat", "carbohydrate", "sodium", "sugar",
        "saturated fat", "trans fat", "cholesterol", "dietary fiber",
        "nutrition facts", "serving size", "servings per container",
        "total fat", "total carbohydrate",
    ],
    "ingredients": [
        # 한국어
        "원재료", "원료", "성분", "함유", "원재료명", "식품유형",
        "내용량", "제조원", "판매원", "유통기한", "소비기한",
        # 영어
        "ingredients", "contains", "made with", "manufactured by",
        "distributed by", "best before", "expiration", "use by",
    ],
    "allergen": [
        # 한국어
        "알레르기", "알러지", "유발물질", "주의", "경고",
        "우유", "대두", "밀", "땅콩", "견과류", "갑각류", "계란", "생선",
        # 영어
        "allergen", "allergy", "warning", "caution",
        "milk", "soy", "wheat", "peanut", "tree nut", "shellfish", "egg", "fish",
    ],
}


def validate_label_image(ocr_text: str) -> Tuple[bool, str, dict]:
    """
    OCR 텍스트를 분석하여 식품 라벨인지 검증합니다.

    Args:
        ocr_text: OCR로 추출된 텍스트

    Returns:
        Tuple[bool, str, dict]: (유효 여부, 메시지, 상세 정보)
    """
    details = {
        "text_length": 0,
        "matched_keywords": [],
        "category_matches": {},
        "confidence": 0.0,
    }

    # 텍스트가 없는 경우
    if not ocr_text or not ocr_text.strip():
        return False, "이미지에서 텍스트를 인식할 수 없습니다. 식품 라벨 이미지를 업로드해주세요.", details

    text_lower = ocr_text.lower()
    text_length = len(ocr_text.strip())
    details["text_length"] = text_length

    # 텍스트 길이가 너무 짧은 경우
    if text_length < MIN_TEXT_LENGTH:
        return False, f"인식된 텍스트가 너무 짧습니다 ({text_length}자). 식품 라벨이 잘 보이는 이미지를 업로드해주세요.", details

    # 각 카테고리별 키워드 매칭
    total_matches = 0
    matched_categories = 0

    for category, keywords in LABEL_KEYWORDS.items():
        category_matches = []
        for keyword in keywords:
            # 한글은 부분 매칭, 영어는 단어 경계 매칭
            if _is_korean(keyword):
                if keyword in ocr_text:
                    category_matches.append(keyword)
            else:
                if re.search(rf'\b{re.escape(keyword)}\b', text_lower):
                    category_matches.append(keyword)

        details["category_matches"][category] = category_matches
        if category_matches:
            matched_categories += 1
            total_matches += len(category_matches)
            details["matched_keywords"].extend(category_matches)

    # 신뢰도 계산
    # - 3개 카테고리 중 2개 이상 매칭되면 높은 신뢰도
    # - 총 매칭 키워드 수에 따라 추가 점수
    confidence = 0.0
    if matched_categories >= 2:
        confidence = 0.7 + min(0.3, total_matches * 0.03)
    elif matched_categories == 1:
        confidence = 0.3 + min(0.3, total_matches * 0.05)
    else:
        confidence = min(0.2, total_matches * 0.05)

    details["confidence"] = round(confidence, 2)

    # 판단 기준: 최소 1개 카테고리에서 키워드 매칭 필요
    if matched_categories == 0:
        return False, "업로드된 이미지가 식품 라벨이 아닌 것 같습니다. 영양성분, 원재료 등이 표시된 식품 라벨 이미지를 업로드해주세요.", details

    # 신뢰도가 낮은 경우 경고
    if confidence < 0.5:
        return True, "라벨로 인식되었으나 일부 정보가 불명확합니다. 분석 결과를 주의 깊게 확인해주세요.", details

    return True, "식품 라벨로 확인되었습니다.", details


def _is_korean(text: str) -> bool:
    """텍스트에 한글이 포함되어 있는지 확인"""
    return bool(re.search(r'[가-힣]', text))


def get_validation_summary(details: dict) -> str:
    """검증 상세 정보를 요약 문자열로 반환"""
    summary_parts = []

    if details.get("text_length"):
        summary_parts.append(f"인식된 텍스트: {details['text_length']}자")

    if details.get("matched_keywords"):
        keywords = details["matched_keywords"][:5]  # 최대 5개만 표시
        if len(details["matched_keywords"]) > 5:
            keywords.append(f"외 {len(details['matched_keywords']) - 5}개")
        summary_parts.append(f"매칭 키워드: {', '.join(keywords)}")

    if details.get("confidence"):
        summary_parts.append(f"신뢰도: {details['confidence'] * 100:.0f}%")

    return " | ".join(summary_parts)
