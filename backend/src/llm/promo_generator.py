import os
import json
import re
from typing import Dict, Optional

from dotenv import load_dotenv


COUNTRY_TONE = {
    "US": "compliance-friendly, concise, factual for the American market",
    "JP": "polite, trustworthy, respectful (丁寧) for the Japanese market",
    "VN": "youthful and friendly without exaggeration for the Vietnamese market",
}


def _extract_country_from_risks(risks: list) -> str:
    """
    risks(list) 안의 risk 메시지에서 [US]/[JP]/[VN] 을 찾아 국가 코드를 추출.
    어떤 형태가 와도 절대 예외를 던지지 않게 방어적으로 구현.
    """
    try:
        for r in risks or []:
            if isinstance(r, dict):
                msg = str(r.get("risk", ""))
            else:
                msg = str(r)

            m = re.search(r"\[(US|JP|VN)\]", msg)
            if m:
                return m.group(1)
    except Exception:
        pass

    return "US"


def _normalize_country(country) -> str:
    if isinstance(country, list):
        return _extract_country_from_risks(country)

    if not country:
        return "US"

    c = str(country).upper().strip()

    if c in ("USA", "UNITED STATES"):
        return "US"
    if c in ("JPN", "JAPAN"):
        return "JP"
    if c in ("VNM", "VIETNAM"):
        return "VN"
    if c in ("US", "JP", "VN"):
        return c

    return "US"


def _dummy_promo_us(text: str, has_risk: bool, product_name: Optional[str] = None) -> Dict[str, str]:
    """US(미국) 전용 영어 fallback 문구."""
    name = product_name or "This product"

    if has_risk:
        detail_copy = (
            f"{name} offers an authentic Korean flavor experience with quick preparation. "
            "Prior to distribution, we recommend a label review to ensure full compliance with US labeling requirements."
        )
        poster_text = "Korean Flavor, Label Review Needed"
        buyer_pitch = (
            f"{name} is a shelf-stable Korean food item with strong repeat purchase potential. "
            "Ideal for grocery, convenience, and specialty channels. "
            "Final label confirmation available upon request before bulk orders."
        )
    else:
        detail_copy = (
            f"{name} delivers bold Korean taste with the convenience of quick preparation. "
            "A great addition to any lineup seeking authentic Asian flavors."
        )
        poster_text = "Bold Korean Taste"
        buyer_pitch = (
            f"{name} is shelf-stable and ready for distribution across grocery, convenience, and specialty channels. "
            "Its appealing flavor profile supports strong repeat purchase rates. "
            "Samples and promotional support available."
        )

    return {
        "detail_copy": detail_copy,
        "poster_text": poster_text,
        "buyer_pitch": buyer_pitch,
    }


def _dummy_promo_jp(text: str, has_risk: bool, product_name: Optional[str] = None) -> Dict[str, str]:
    """JP(일본) 전용 일본어/한국어 혼합 fallback 문구."""
    name = product_name or "本製品"

    if has_risk:
        detail_copy = (
            f"{name}は韓国の伝統的な味わいを手軽にお楽しみいただけます。"
            "日本市場向けにラベル表記の最終確認を推奨いたします。"
        )
        poster_text = "本格韓国の味"
        buyer_pitch = (
            f"{name}は常温保存可能で、スーパー・コンビニ・専門店など幅広いチャネルに適しています。"
            "リピート購入率の高い商品です。サンプル提供・販促協力が可能です。"
        )
    else:
        detail_copy = (
            f"{name}は韓国本場の味を簡単な調理でお届けします。"
            "日本の食卓に新しい風味をお届けする一品です。"
        )
        poster_text = "韓国本場の味わい"
        buyer_pitch = (
            f"{name}は常温流通が可能で、小売・量販店・専門チャネルに最適です。"
            "高いリピート率が見込める商品構成です。サンプル・販促素材のご提供が可能です。"
        )

    return {
        "detail_copy": detail_copy,
        "poster_text": poster_text,
        "buyer_pitch": buyer_pitch,
    }


def _dummy_promo_vn(text: str, has_risk: bool, product_name: Optional[str] = None) -> Dict[str, str]:
    """VN(베트남) 전용 베트남어/영어 혼합 fallback 문구."""
    name = product_name or "Sản phẩm"

    if has_risk:
        detail_copy = (
            f"{name} mang đến hương vị Hàn Quốc đậm đà, dễ chế biến. "
            "Khuyến nghị kiểm tra nhãn mác trước khi phân phối tại Việt Nam."
        )
        poster_text = "Hương vị Hàn Quốc"
        buyer_pitch = (
            f"{name} là sản phẩm bảo quản thường, phù hợp với siêu thị, cửa hàng tiện lợi và kênh đặc sản. "
            "Tiềm năng mua lại cao. Hỗ trợ mẫu thử và chương trình khuyến mãi."
        )
    else:
        detail_copy = (
            f"{name} đem lại trải nghiệm ẩm thực Hàn Quốc chính gốc với cách chế biến nhanh gọn. "
            "Lựa chọn lý tưởng cho thực khách yêu thích hương vị châu Á."
        )
        poster_text = "Vị Hàn đích thực"
        buyer_pitch = (
            f"{name} bảo quản thường, sẵn sàng phân phối qua các kênh grocery, convenience, specialty. "
            "Tỷ lệ mua lại cao, hỗ trợ mẫu và khuyến mãi."
        )

    return {
        "detail_copy": detail_copy,
        "poster_text": poster_text,
        "buyer_pitch": buyer_pitch,
    }


def _dummy_promo(text: str, country: str, product_name: Optional[str] = None) -> Dict[str, str]:
    """키 없거나 실패 시에도 앱이 절대 죽지 않도록 더미(fallback) 문구 반환."""
    has_risk = "HIGH" in (text or "").upper()

    if country == "US":
        return _dummy_promo_us(text, has_risk, product_name)
    elif country == "JP":
        return _dummy_promo_jp(text, has_risk, product_name)
    elif country == "VN":
        return _dummy_promo_vn(text, has_risk, product_name)

    return _dummy_promo_us(text, has_risk, product_name)


def _build_prompt(text: str, country: str, product_name: Optional[str]) -> str:
    tone = COUNTRY_TONE.get(country, COUNTRY_TONE["US"])
    name = product_name or "This product"

    lang_instruction = ""
    if country == "US":
        lang_instruction = "IMPORTANT: All output text MUST be in English only. No Korean, no other languages."
    elif country == "JP":
        lang_instruction = "IMPORTANT: All output text should be in Japanese (日本語)."
    elif country == "VN":
        lang_instruction = "IMPORTANT: All output text should be in Vietnamese (Tiếng Việt)."

    return f"""
You are generating export marketing copy for a Korean food product.

{lang_instruction}

STRICT OUTPUT RULE:
- Return ONLY valid JSON.
- No markdown, no headings/labels, no extra text.
- Must be parseable by json.loads().

Return exactly this JSON schema (exact keys only):
{{
  "detail_copy": "string",
  "poster_text": "string",
  "buyer_pitch": "string"
}}

Safety rules (must follow):
- No medical/therapy/disease prevention claims.
- No false certifications (e.g., "FDA approved").
- No exaggeration or guarantees (avoid words like "best", "number one", "miracle").
- Do not invent claims that are not supported by the input.
- Do NOT assume or state specific country of origin unless clearly stated in the input.

Style requirements:
- Do NOT include storage instructions, expiration guidance, or handling tips.
- Keep writing concrete and product-focused.
- If the input suggests compliance/label risks, add ONE neutral line recommending label review.
- Avoid the word "consumers"; use "shoppers", "customers", or channel-focused language instead.

Content requirements:
1) detail_copy:
   - 2-3 sentences
   - Focus on taste profile + quick preparation convenience + key ingredients if present
   - No long lists

2) poster_text:
   - 3 to 6 words ONLY
   - Punchy banner tagline
   - No exclamation marks

3) buyer_pitch:
   - 2-3 sentences
   - B2B-focused: mention shelf-stable convenience, quick preparation appeal,
     repeat purchase potential, fit for grocery/convenience/specialty channels
   - Avoid consumer-only language

Target market: {country}
Tone guide: {tone}
Product name: {name}

Input text (OCR and/or notes):
{text[:2500]}
""".strip()


def _parse_json_safely(raw: str) -> Optional[Dict[str, str]]:
    """
    모델이 가끔 JSON 앞뒤로 텍스트를 섞어서 주는 경우를 대비:
    1) json.loads(raw) 시도
    2) 실패하면 raw에서 {...} 블록만 추출해서 json.loads 재시도
    """
    if not raw or not isinstance(raw, str):
        return None

    raw = raw.strip()

    try:
        data = json.loads(raw)
        if isinstance(data, dict):
            return data
    except Exception:
        pass

    try:
        m = re.search(r"\{[\s\S]*\}", raw)
        if not m:
            return None
        data = json.loads(m.group(0))
        if isinstance(data, dict):
            return data
    except Exception:
        return None

    return None


def _generate_with_openai(text: str, country: str, product_name: Optional[str]) -> Optional[Dict[str, str]]:
    """OpenAI Responses API로 3종 문구 생성. 실패하면 None."""
    load_dotenv()

    api_key = (os.getenv("OPENAI_API_KEY") or "").strip()
    if not api_key:
        return None

    model = (os.getenv("OPENAI_MODEL") or "gpt-4o-mini").strip()

    try:
        from openai import OpenAI

        client = OpenAI(api_key=api_key)
        prompt = _build_prompt(text, country, product_name)

        resp = client.responses.create(
            model=model,
            input=[
                {
                    "role": "system",
                    "content": "You must output ONLY valid JSON with keys: detail_copy, poster_text, buyer_pitch. No extra text.",
                },
                {"role": "user", "content": prompt},
            ],
            temperature=0.5,
            max_output_tokens=350,
            timeout=20,
        )

        raw = getattr(resp, "output_text", None)
        data = _parse_json_safely(raw)
        if not data:
            return None

        required = ["detail_copy", "poster_text", "buyer_pitch"]
        if not all(k in data for k in required):
            return None
        if not all(isinstance(data[k], str) for k in required):
            return None

        poster = data["poster_text"].strip()
        poster = re.sub(r"[!?]+", "", poster).strip()

        words = poster.split()
        if len(words) > 6:
            poster = " ".join(words[:6])

        if not poster:
            poster = "Bold Korean Flavor"

        return {
            "detail_copy": data["detail_copy"].strip(),
            "poster_text": poster,
            "buyer_pitch": data["buyer_pitch"].strip(),
        }

    except Exception:
        return None


def generate_promo(text: str, country, product_name: Optional[str] = None) -> Dict[str, str]:
    """
    실제 호출:
    - generate_promo(ocr_text, risks)
    - generate_promo(ocr_text, "US")
    둘 다 안전하게 처리

    요구사항 핵심:
    - OPENAI_API_KEY 있으면 OpenAI로 생성
    - 실패/없음이면 fallback
    - 앱 절대 안 죽지 않게
    """
    c = _normalize_country(country)

    result = _generate_with_openai(text, c, product_name)
    if result:
        return result

    return _dummy_promo(text, c, product_name)
