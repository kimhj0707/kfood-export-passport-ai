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


def generate_expert_pdf_report(
    report_id: str,
    country: str,
    risks: List[Dict[str, Any]],
    expert_comment: str = ""
) -> bytes:
    """
    전문가 검토용 PDF 리포트를 생성한다.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=20*mm, bottomMargin=20*mm)

    font_name = _register_korean_font()
    styles = getSampleStyleSheet()
    
    # 스타일 정의
    title_style = ParagraphStyle("TitleKR", parent=styles["Title"], fontName=font_name, fontSize=16)
    heading_style = ParagraphStyle("HeadingKR", parent=styles["h2"], fontName=font_name, fontSize=12, spaceBefore=10, spaceAfter=4)
    body_style = ParagraphStyle("BodyKR", parent=styles["Normal"], fontName=font_name, fontSize=10, leading=14)
    code_style = ParagraphStyle("Code", parent=styles["Code"], fontName=font_name, fontSize=9, leading=12, textColor=colors.darkblue)

    elements = []

    # Header
    elements.append(Paragraph("[Expert Review Copy]", styles['h1']))
    elements.append(Paragraph("This report is generated for preliminary compliance review support. Final determination must be made by a qualified expert.", body_style))
    elements.append(Spacer(1, 10*mm))
    
    # 1. 요약
    elements.append(Paragraph("1. 분석 요약", heading_style))
    summary_data = [
        ["Report ID", report_id],
        ["대상 국가", country],
        ["분석 목적", "수출 라벨 사전 검토"],
    ]
    summary_table = Table(summary_data, colWidths=[50*mm, 120*mm])
    summary_table.setStyle(TableStyle([('GRID', (0,0), (-1,-1), 0.5, colors.grey), ('FONTNAME', (0,0), (-1,-1), font_name)]))
    elements.append(summary_table)
    elements.append(Spacer(1, 8*mm))

    # 2. 핵심 검토 사항
    top_risks = [r for r in risks if r.get('severity') == 'HIGH']
    if top_risks:
        elements.append(Paragraph("2. 핵심 검토 사항 (Top Risks)", heading_style))
        for risk in top_risks:
            elements.append(Paragraph(f"• {risk.get('title', risk.get('risk'))} (확신도: {risk.get('confidence', 0)*100:.0f}%)", body_style))
        elements.append(Spacer(1, 8*mm))

    # 3. 전문가 확인 요청 체크리스트
    expert_checks = [r for r in risks if r.get('expert_check_required')]
    if expert_checks:
        elements.append(Paragraph("3. 전문가 확인 요청 항목", heading_style))
        for check in expert_checks:
            p = Paragraph(f"☐ {check.get('next_step', 'N/A')}", body_style)
            elements.append(p)
            if check.get('evidence', {}).get('matched'):
                evidence_text = "  <font size=8><b>증거(OCR):</b> " + ", ".join([f"'{e}'" for e in check['evidence']['matched']]) + "</font>"
                elements.append(Paragraph(evidence_text, body_style))
            elements.append(Spacer(1, 4*mm))
        elements.append(Spacer(1, 8*mm))

    # 4. 전문가 코멘트
    elements.append(Paragraph("4. 전문가 의견", heading_style))
    elements.append(Paragraph(expert_comment or " ", body_style))
    
    doc.build(elements)
    buffer.seek(0)
    return buffer.getvalue()


def generate_pdf_report(
    report_id: str,
    country: str,
    ocr_engine: str,
    allergens: List[str],
    nutrition: Dict[str, Any],
    risks: List[Dict[str, str]],
    promo: Dict[str, str],
    is_expert: bool = False,
    expert_comment: str = ""
) -> bytes:
    """
    분석 결과를 PDF 리포트로 생성한다.
    is_expert 플래그에 따라 일반용 또는 전문가용 리포트 생성.
    """
    if is_expert:
        return generate_expert_pdf_report(
            report_id=report_id,
            country=country,
            risks=risks,
            expert_comment=expert_comment
        )
        
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
