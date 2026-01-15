import os
import pytesseract
from PIL import Image, ImageEnhance, ImageOps
from typing import Tuple, Optional


def _find_tesseract_cmd() -> Optional[str]:
    """Windows에서 Tesseract 실행 파일 경로를 찾는다."""
    env_path = os.environ.get("TESSERACT_CMD")
    if env_path and os.path.isfile(env_path):
        return env_path

    default_paths = [
        r"C:\Program Files\Tesseract-OCR\tesseract.exe",
        r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
    ]
    for path in default_paths:
        if os.path.isfile(path):
            return path

    return None


def _preprocess_image(image_pil: Image.Image) -> Image.Image:
    """OCR 정확도를 높이기 위한 이미지 전처리."""
    img = image_pil.convert("L")
    enhancer = ImageEnhance.Contrast(img)
    img = enhancer.enhance(2.5)
    width, height = img.size
    img = img.resize((width * 2, height * 2), Image.LANCZOS)
    img = img.point(lambda p: 255 if p > 160 else 0)
    return img


def extract_text(image_pil: Image.Image) -> Tuple[str, Optional[str]]:
    """
    PIL Image에서 텍스트를 추출한다.

    Returns:
        (text, error): 성공 시 (텍스트, None), 실패 시 ("", 에러메시지)
    """
    tesseract_cmd = _find_tesseract_cmd()

    if tesseract_cmd is None:
        error_msg = (
            "Tesseract OCR을 찾을 수 없습니다.\n\n"
            "해결 방법:\n"
            "1. Tesseract 설치: https://github.com/UB-Mannheim/tesseract/wiki\n"
            "2. 환경변수 TESSERACT_CMD에 tesseract.exe 경로 설정\n"
            "   예: set TESSERACT_CMD=C:\\Program Files\\Tesseract-OCR\\tesseract.exe"
        )
        return "", error_msg

    pytesseract.pytesseract.tesseract_cmd = tesseract_cmd

    try:
        processed_img = _preprocess_image(image_pil)
        config = "--oem 3 --psm 6"
        text = pytesseract.image_to_string(processed_img, lang="kor+eng", config=config)
        return text.strip(), None
    except Exception as e:
        return "", f"OCR 처리 중 오류 발생: {str(e)}"
