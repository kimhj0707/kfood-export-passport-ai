import io
from typing import List, Dict, Any
from datetime import datetime

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, KeepTogether, ListFlowable, ListItem
)


# 모던 컬러 팔레트
PRIMARY = colors.HexColor("#0D9488")
PRIMARY_DARK = colors.HexColor("#0F766E")
PRIMARY_LIGHT = colors.HexColor("#99F6E4")
PRIMARY_BG = colors.HexColor("#F0FDFA")

TEXT_DARK = colors.HexColor("#0F172A")
TEXT_MAIN = colors.HexColor("#334155")
TEXT_MUTED = colors.HexColor("#94A3B8")

CARD_BG = colors.HexColor("#F8FAFC")
CARD_BORDER = colors.HexColor("#E2E8F0")

SUCCESS = colors.HexColor("#10B981")
SUCCESS_BG = colors.HexColor("#ECFDF5")
WARNING = colors.HexColor("#F59E0B")
WARNING_BG = colors.HexColor("#FFFBEB")
DANGER = colors.HexColor("#EF4444")
DANGER_BG = colors.HexColor("#FEF2F2")

# 페이지 설정
PAGE_WIDTH = A4[0]
PAGE_HEIGHT = A4[1]
MARGIN = 20 * mm
CONTENT_WIDTH = PAGE_WIDTH - (2 * MARGIN)


def _register_korean_font():
    """한글 폰트 등록"""
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


def _create_styles(font_name: str):
    """모던 스타일 시트"""
    styles = getSampleStyleSheet()

    return {
        "main_title": ParagraphStyle(
            "MainTitle",
            fontName=font_name,
            fontSize=28,
            textColor=PRIMARY_DARK,
            alignment=TA_CENTER,
            spaceAfter=2 * mm,
            leading=34,
        ),
        "subtitle": ParagraphStyle(
            "Subtitle",
            fontName=font_name,
            fontSize=11,
            textColor=TEXT_MUTED,
            alignment=TA_CENTER,
            spaceAfter=10 * mm,
        ),
        "section_title": ParagraphStyle(
            "SectionTitle",
            fontName=font_name,
            fontSize=13,
            textColor=PRIMARY_DARK,
            spaceBefore=6 * mm,
            spaceAfter=4 * mm,
            leading=18,
        ),
        "body": ParagraphStyle(
            "Body",
            fontName=font_name,
            fontSize=10,
            textColor=TEXT_MAIN,
            leading=16,
            spaceBefore=1 * mm,
            spaceAfter=1 * mm,
        ),
        "body_small": ParagraphStyle(
            "BodySmall",
            fontName=font_name,
            fontSize=9,
            textColor=TEXT_MUTED,
            leading=14,
        ),
        "label": ParagraphStyle(
            "Label",
            fontName=font_name,
            fontSize=9,
            textColor=TEXT_MUTED,
            spaceAfter=1 * mm,
        ),
        "value": ParagraphStyle(
            "Value",
            fontName=font_name,
            fontSize=10,
            textColor=TEXT_DARK,
            leading=14,
        ),
        "tag": ParagraphStyle(
            "Tag",
            fontName=font_name,
            fontSize=10,
            textColor=PRIMARY_DARK,
            leading=14,
        ),
        "success": ParagraphStyle(
            "Success",
            fontName=font_name,
            fontSize=10,
            textColor=SUCCESS,
            leading=16,
        ),
        "warning": ParagraphStyle(
            "Warning",
            fontName=font_name,
            fontSize=10,
            textColor=WARNING,
            leading=16,
        ),
        "danger": ParagraphStyle(
            "Danger",
            fontName=font_name,
            fontSize=10,
            textColor=DANGER,
            leading=16,
        ),
        "footer": ParagraphStyle(
            "Footer",
            fontName=font_name,
            fontSize=8,
            textColor=TEXT_MUTED,
            alignment=TA_CENTER,
            leading=12,
        ),
        "table_header": ParagraphStyle(
            "TableHeader",
            fontName=font_name,
            fontSize=9,
            textColor=colors.white,
            alignment=TA_CENTER,
        ),
        "table_cell": ParagraphStyle(
            "TableCell",
            fontName=font_name,
            fontSize=9,
            textColor=TEXT_MAIN,
            leading=13,
        ),
        "promo_content": ParagraphStyle(
            "PromoContent",
            fontName=font_name,
            fontSize=9,
            textColor=TEXT_MAIN,
            leading=14,
            leftIndent=3 * mm,
        ),
    }


def _wrap_text(text: str, style: ParagraphStyle) -> Paragraph:
    """텍스트를 Paragraph로 감싸서 자동 줄바꿈"""
    return Paragraph(str(text), style)


def _create_info_card(items: List[tuple], font_name: str, styles: dict):
    """정보 카드 스타일 테이블"""
    data = []
    for label, value in items:
        data.append([
            Paragraph(f"<font color='#94A3B8'>{label}</font>", styles["body_small"]),
            Paragraph(str(value), styles["value"])
        ])

    col_width = (CONTENT_WIDTH - 10 * mm) / 2
    table = Table(data, colWidths=[col_width, col_width])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), CARD_BG),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 12),
        ("RIGHTPADDING", (0, 0), (-1, -1), 12),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("LINEBELOW", (0, 0), (-1, -2), 0.5, CARD_BORDER),
    ]))
    return table


def _create_tag_list(items: List[str], styles: dict):
    """태그 리스트 스타일"""
    if not items:
        return Paragraph("검출된 항목 없음", styles["body_small"])

    tag_text = "  •  ".join(items)
    return Paragraph(tag_text, styles["tag"])


def generate_expert_pdf_report(
    report_id: str,
    country: str,
    risks: List[Dict[str, Any]],
    expert_comment: str = ""
) -> bytes:
    """전문가 검토용 PDF"""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        topMargin=MARGIN,
        bottomMargin=MARGIN,
        leftMargin=MARGIN,
        rightMargin=MARGIN,
    )

    font_name = _register_korean_font()
    styles = _create_styles(font_name)
    elements = []

    # 헤더
    elements.append(Paragraph("K-Food Export Passport", styles["main_title"]))
    elements.append(Paragraph("전문가 검토용 리포트", styles["subtitle"]))

    # 기본 정보
    country_names = {
        "US": "미국", "JP": "일본", "VN": "베트남", "EU": "유럽연합", "CN": "중국"
    }
    info_items = [
        ("리포트 ID", report_id),
        ("수출 대상국", country_names.get(country, country)),
        ("생성일시", datetime.now().strftime("%Y년 %m월 %d일 %H:%M")),
        ("문서 유형", "전문가 검토용"),
    ]
    elements.append(_create_info_card(info_items, font_name, styles))
    elements.append(Spacer(1, 8 * mm))

    # 핵심 리스크
    elements.append(Paragraph("핵심 리스크 항목", styles["section_title"]))
    high_risks = [r for r in risks if r.get('severity') == 'HIGH']

    if high_risks:
        for i, risk in enumerate(high_risks, 1):
            confidence = risk.get('confidence', 0) * 100
            allergen = risk.get('allergen', '')
            risk_msg = risk.get('risk', '')
            text = f"<b>{i}.</b> [{allergen}] {risk_msg}"
            if confidence > 0:
                text += f" (확신도 {confidence:.0f}%)"
            elements.append(Paragraph(text, styles["danger"]))
            elements.append(Spacer(1, 2 * mm))
    else:
        elements.append(Paragraph("고위험 항목이 발견되지 않았습니다.", styles["success"]))

    elements.append(Spacer(1, 6 * mm))

    # 체크리스트
    elements.append(Paragraph("전문가 확인 체크리스트", styles["section_title"]))
    expert_checks = [r for r in risks if r.get('expert_check_required')]

    if expert_checks:
        data = [[
            Paragraph("No.", styles["table_header"]),
            Paragraph("확인 항목", styles["table_header"]),
            Paragraph("확인", styles["table_header"])
        ]]
        for i, check in enumerate(expert_checks, 1):
            next_step = check.get('next_step', 'N/A')
            data.append([
                Paragraph(str(i), styles["table_cell"]),
                Paragraph(next_step, styles["table_cell"]),
                Paragraph("☐", styles["table_cell"])
            ])

        table = Table(data, colWidths=[12 * mm, CONTENT_WIDTH - 32 * mm, 20 * mm])
        table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), PRIMARY),
            ("BACKGROUND", (0, 1), (-1, -1), colors.white),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("ALIGN", (0, 0), (0, -1), "CENTER"),
            ("ALIGN", (2, 0), (2, -1), "CENTER"),
            ("TOPPADDING", (0, 0), (-1, -1), 10),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
            ("LEFTPADDING", (1, 0), (1, -1), 10),
            ("LINEBELOW", (0, 0), (-1, -2), 0.5, CARD_BORDER),
        ]))
        elements.append(table)
    else:
        elements.append(Paragraph("전문가 확인이 필요한 항목이 없습니다.", styles["body_small"]))

    elements.append(Spacer(1, 8 * mm))

    # 의견란
    elements.append(Paragraph("전문가 의견", styles["section_title"]))
    comment_data = [[Paragraph(expert_comment or "(의견을 작성해 주세요)", styles["body"])]]
    comment_table = Table(comment_data, colWidths=[CONTENT_WIDTH])
    comment_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), CARD_BG),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 15),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 40),
        ("LEFTPADDING", (0, 0), (-1, -1), 12),
        ("RIGHTPADDING", (0, 0), (-1, -1), 12),
    ]))
    elements.append(comment_table)

    elements.append(Spacer(1, 15 * mm))

    # 서명란
    sig_text = "검토자: ________________    서명: ________________    일자: ________________"
    elements.append(Paragraph(sig_text, styles["body"]))

    # 푸터
    elements.append(Spacer(1, 15 * mm))
    elements.append(Paragraph(
        f"K-Food Export Passport AI  |  {datetime.now().strftime('%Y-%m-%d %H:%M')}",
        styles["footer"]
    ))

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
    """분석 결과 PDF 리포트 생성"""
    if is_expert:
        return generate_expert_pdf_report(
            report_id=report_id,
            country=country,
            risks=risks,
            expert_comment=expert_comment
        )

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        topMargin=MARGIN,
        bottomMargin=MARGIN,
        leftMargin=MARGIN,
        rightMargin=MARGIN,
    )

    font_name = _register_korean_font()
    styles = _create_styles(font_name)
    elements = []

    # ===== 헤더 =====
    elements.append(Paragraph("K-Food Export Passport", styles["main_title"]))
    elements.append(Paragraph("식품 라벨 분석 리포트", styles["subtitle"]))

    # ===== 기본 정보 카드 =====
    country_names = {
        "US": "미국 (United States)",
        "JP": "일본 (Japan)",
        "VN": "베트남 (Vietnam)",
        "EU": "유럽연합 (EU)",
        "CN": "중국 (China)",
    }
    info_items = [
        ("리포트 ID", report_id),
        ("수출 대상국", country_names.get(country, country)),
        ("생성일시", datetime.now().strftime("%Y년 %m월 %d일 %H:%M")),
        ("OCR 엔진", ocr_engine.upper()),
    ]
    elements.append(_create_info_card(info_items, font_name, styles))
    elements.append(Spacer(1, 8 * mm))

    # ===== 검출된 알레르겐 =====
    elements.append(Paragraph("검출된 알레르겐", styles["section_title"]))
    if allergens:
        # 카드 스타일로 표시
        allergen_data = [[_create_tag_list(allergens, styles)]]
        allergen_table = Table(allergen_data, colWidths=[CONTENT_WIDTH])
        allergen_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), WARNING_BG),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("TOPPADDING", (0, 0), (-1, -1), 12),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 12),
            ("LEFTPADDING", (0, 0), (-1, -1), 15),
            ("RIGHTPADDING", (0, 0), (-1, -1), 15),
        ]))
        elements.append(allergen_table)
    else:
        elements.append(Paragraph("검출된 알레르겐이 없습니다.", styles["body_small"]))

    elements.append(Spacer(1, 6 * mm))

    # ===== 영양성분 정보 =====
    elements.append(Paragraph("영양성분 정보", styles["section_title"]))

    if nutrition:
        # 헤더 행
        data = [[
            Paragraph("영양성분", styles["table_header"]),
            Paragraph("함량", styles["table_header"]),
            Paragraph("단위", styles["table_header"])
        ]]
        # 데이터 행
        for k, v in nutrition.items():
            data.append([
                Paragraph(k, styles["table_cell"]),
                Paragraph(str(v.get("value", "")), styles["table_cell"]),
                Paragraph(v.get("unit", ""), styles["table_cell"])
            ])

        table = Table(data, colWidths=[CONTENT_WIDTH * 0.45, CONTENT_WIDTH * 0.30, CONTENT_WIDTH * 0.25])
        table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), PRIMARY),
            ("BACKGROUND", (0, 1), (-1, -1), colors.white),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("ALIGN", (1, 0), (-1, -1), "CENTER"),
            ("TOPPADDING", (0, 0), (-1, -1), 8),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ("LEFTPADDING", (0, 0), (-1, -1), 10),
            ("LINEBELOW", (0, 0), (-1, -2), 0.5, CARD_BORDER),
        ]))
        elements.append(table)
    else:
        elements.append(Paragraph("영양성분 정보가 검출되지 않았습니다.", styles["body_small"]))

    elements.append(Spacer(1, 6 * mm))

    # ===== 규정 검토 결과 =====
    elements.append(Paragraph("규정 검토 결과", styles["section_title"]))

    if risks:
        for r in risks:
            severity = r.get("severity", "LOW")
            allergen = r.get("allergen", "")
            risk_msg = r.get("risk", "")
            confidence = r.get("confidence", 0)

            # 스타일 선택
            if severity == "HIGH":
                style = styles["danger"]
                prefix = "⚠"
            elif severity == "MEDIUM":
                style = styles["warning"]
                prefix = "●"
            else:
                style = styles["success"]
                prefix = "✓"

            # 메시지 구성
            if allergen and allergen not in ["None", "PASS"]:
                text = f"{prefix} <b>[{allergen}]</b> {risk_msg}"
            else:
                text = f"{prefix} {risk_msg}"

            if confidence > 0:
                text += f" <font size='8' color='#94A3B8'>(확신도 {confidence * 100:.0f}%)</font>"

            elements.append(Paragraph(text, style))
            elements.append(Spacer(1, 2 * mm))
    else:
        elements.append(Paragraph("규정 검토 결과가 없습니다.", styles["body_small"]))

    elements.append(Spacer(1, 6 * mm))

    # ===== AI 마케팅 제안 =====
    elements.append(Paragraph("AI 마케팅 제안", styles["section_title"]))

    promo_sections = [
        ("상세 설명", promo.get("detail_copy", "")),
        ("포스터 문구", promo.get("poster_text", "")),
        ("바이어 피치", promo.get("buyer_pitch", "")),
    ]

    for label, content in promo_sections:
        if content:
            elements.append(Paragraph(label, styles["label"]))
            # 콘텐츠를 카드 형태로 표시
            content_data = [[Paragraph(content, styles["promo_content"])]]
            content_table = Table(content_data, colWidths=[CONTENT_WIDTH])
            content_table.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, -1), CARD_BG),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("TOPPADDING", (0, 0), (-1, -1), 10),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
                ("LEFTPADDING", (0, 0), (-1, -1), 12),
                ("RIGHTPADDING", (0, 0), (-1, -1), 12),
            ]))
            elements.append(content_table)
            elements.append(Spacer(1, 4 * mm))

    # ===== 푸터 =====
    elements.append(Spacer(1, 10 * mm))
    elements.append(HRFlowable(width="100%", thickness=0.5, color=CARD_BORDER, spaceAfter=3 * mm))

    footer_text = f"K-Food Export Passport AI  |  Report ID: {report_id}  |  {datetime.now().strftime('%Y-%m-%d %H:%M')}"
    elements.append(Paragraph(footer_text, styles["footer"]))

    disclaimer = "본 리포트는 AI 분석 결과이며, 참고용으로만 사용하시기 바랍니다. 실제 수출 시에는 반드시 해당 국가의 공식 규정을 확인하세요."
    elements.append(Spacer(1, 2 * mm))
    elements.append(Paragraph(disclaimer, styles["footer"]))

    doc.build(elements)
    buffer.seek(0)
    return buffer.getvalue()
