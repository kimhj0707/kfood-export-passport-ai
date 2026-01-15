import io
from typing import Tuple, Optional
from PIL import Image


def extract_text_google(image_pil: Image.Image) -> Tuple[str, Optional[str]]:
    """
    Google Cloud Vision API를 사용하여 이미지에서 텍스트를 추출한다.

    Returns:
        (text, error): 성공 시 (텍스트, None), 실패 시 ("", 에러메시지)
    """
    try:
        from google.cloud import vision
    except ImportError:
        return "", "google-cloud-vision 패키지가 설치되지 않았습니다. pip install google-cloud-vision"

    try:
        client = vision.ImageAnnotatorClient()

        buffer = io.BytesIO()
        image_pil.save(buffer, format="PNG")
        content = buffer.getvalue()

        image = vision.Image(content=content)
        response = client.text_detection(image=image)

        if response.error.message:
            return "", f"Vision API 오류: {response.error.message}"

        if response.full_text_annotation and response.full_text_annotation.text:
            return response.full_text_annotation.text.strip(), None

        return "", None

    except Exception as e:
        return "", f"Google Vision OCR 처리 중 오류 발생: {str(e)}"
