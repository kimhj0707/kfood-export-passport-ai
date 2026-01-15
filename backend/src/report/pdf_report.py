import io
from typing import List, Dict, Any

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle


def _register_korean_font():
    """한글 폰트 등록 시도."""
    font_paths = [
        "C:/Windows/Fonts/malgun.ttf",
        "C:/Windows/Fonts/gulim.ttc",
        "/usr/share/fonts/truetype/nanum/NanumGothic.ttf",
    ]
    for path in font_paths:
        try:
            pdfmetrics.registerFont(TTFont("Korean", path))
            return "Korean"
        except:
            continue
    return "Helvetica"


def generate_pdf_report(
    country: str,
    ocr_engine: str,
    allergens: List[str],
    nutrition: Dict[str, Any],
    risks: List[Dict[str, str]],
    promo: Dict[str, str]
) -> bytes:
    """
    분석 결과를 PDF 리포트로 생성한다.

    Returns:
        PDF 파일 bytes
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=20*mm, bottomMargin=20*mm)

    font_name = _register_korean_font()
    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "TitleKR", parent=styles["Title"], fontName=font_name, fontSize=18
    )
    heading_style = ParagraphStyle(
        "HeadingKR", parent=styles["Heading2"], fontName=font_name, fontSize=12,
        spaceAfter=6
    )
    body_style = ParagraphStyle(
        "BodyKR", parent=styles["Normal"], fontName=font_name, fontSize=10,
        leading=14
    )

    elements = []

    # Title
    elements.append(Paragraph("K-Food Export Passport AI Report", title_style))
    elements.append(Spacer(1, 10*mm))

    # Meta Info
    elements.append(Paragraph("Basic Information", heading_style))
    meta_data = [
        ["Export Country", country],
        ["OCR Engine", ocr_engine],
    ]
    meta_table = Table(meta_data, colWidths=[50*mm, 100*mm])
    meta_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, -1), colors.lightgrey),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ("FONTNAME", (0, 0), (-1, -1), font_name),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("PADDING", (0, 0), (-1, -1), 6),
    ]))
    elements.append(meta_table)
    elements.append(Spacer(1, 8*mm))

    # Allergens
    elements.append(Paragraph("Detected Allergens", heading_style))
    if allergens:
        allergen_text = ", ".join(allergens)
    else:
        allergen_text = "None detected"
    elements.append(Paragraph(allergen_text, body_style))
    elements.append(Spacer(1, 8*mm))

    # Nutrition
    elements.append(Paragraph("Nutrition Information", heading_style))
    if nutrition:
        nutrition_data = [["Nutrient", "Value", "Unit"]]
        for k, v in nutrition.items():
            nutrition_data.append([k, str(v["value"]), v["unit"]])
        nutrition_table = Table(nutrition_data, colWidths=[50*mm, 40*mm, 30*mm])
        nutrition_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
            ("FONTNAME", (0, 0), (-1, -1), font_name),
            ("FONTSIZE", (0, 0), (-1, -1), 10),
            ("PADDING", (0, 0), (-1, -1), 6),
        ]))
        elements.append(nutrition_table)
    else:
        elements.append(Paragraph("No nutrition data detected", body_style))
    elements.append(Spacer(1, 8*mm))

    # Risks
    elements.append(Paragraph("Risk Analysis", heading_style))
    for r in risks:
        severity = r.get("severity", "LOW")
        allergen = r.get("allergen", "")
        risk_msg = r.get("risk", "")
        level_text = f"[{severity}] {allergen}: {risk_msg}"
        elements.append(Paragraph(level_text, body_style))
    elements.append(Spacer(1, 8*mm))

    # Promo
    elements.append(Paragraph("Promotional Texts", heading_style))
    promo_data = [
        ["Type", "Content"],
        ["Detail Copy", promo.get("detail_copy", "")],
        ["Poster Text", promo.get("poster_text", "")],
        ["Buyer Pitch", promo.get("buyer_pitch", "")],
    ]
    promo_table = Table(promo_data, colWidths=[35*mm, 120*mm])
    promo_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ("FONTNAME", (0, 0), (-1, -1), font_name),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("PADDING", (0, 0), (-1, -1), 6),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]))
    elements.append(promo_table)

    doc.build(elements)
    buffer.seek(0)
    return buffer.getvalue()
