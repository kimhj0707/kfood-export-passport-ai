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
MARGIN = 15 * mm
CONTENT_WIDTH = PAGE_WIDTH - (2 * MARGIN)


def _register_korean_font():
    """한글 폰트 등록 - 프로젝트 내 폰트 우선"""
    import os

    current_dir = os.path.dirname(os.path.abspath(__file__))
    project_font = os.path.join(current_dir, "..", "fonts", "malgun.ttf")

    font_paths = [
        project_font,
        "/app/src/fonts/malgun.ttf",
        "C:/Windows/Fonts/malgun.ttf",
        "C:/Windows/Fonts/gulim.ttc",
        "/usr/share/fonts/truetype/nanum/NanumGothic.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    ]

    for path in font_paths:
        try:
            if os.path.exists(path):
                pdfmetrics.registerFont(TTFont("Korean", path))
                return "Korean"
        except Exception:
            continue

    return "Helvetica"


def _create_styles(font_name: str):
    """모던 스타일 시트 - 간결한 간격"""
    return {
        "main_title": ParagraphStyle(
            "MainTitle",
            fontName=font_name,
            fontSize=22,
            textColor=PRIMARY_DARK,
            alignment=TA_CENTER,
            spaceAfter=1 * mm,
            leading=26,
        ),
        "subtitle": ParagraphStyle(
            "Subtitle",
            fontName=font_name,
            fontSize=10,
            textColor=TEXT_MUTED,
            alignment=TA_CENTER,
            spaceAfter=4 * mm,
        ),
        "section_title": ParagraphStyle(
            "SectionTitle",
            fontName=font_name,
            fontSize=11,
            textColor=PRIMARY_DARK,
            spaceBefore=4 * mm,
            spaceAfter=2 * mm,
            leading=14,
        ),
        "body": ParagraphStyle(
            "Body",
            fontName=font_name,
            fontSize=9,
            textColor=TEXT_MAIN,
            leading=14,
            spaceBefore=0.5 * mm,
            spaceAfter=0.5 * mm,
        ),
        "body_small": ParagraphStyle(
            "BodySmall",
            fontName=font_name,
            fontSize=8,
            textColor=TEXT_MUTED,
            leading=12,
        ),
        "label": ParagraphStyle(
            "Label",
            fontName=font_name,
            fontSize=8,
            textColor=TEXT_MUTED,
            spaceAfter=0.5 * mm,
        ),
        "value": ParagraphStyle(
            "Value",
            fontName=font_name,
            fontSize=9,
            textColor=TEXT_DARK,
            leading=12,
        ),
        "tag": ParagraphStyle(
            "Tag",
            fontName=font_name,
            fontSize=9,
            textColor=PRIMARY_DARK,
            leading=12,
        ),
        "success": ParagraphStyle(
            "Success",
            fontName=font_name,
            fontSize=9,
            textColor=SUCCESS,
            leading=14,
        ),
        "warning": ParagraphStyle(
            "Warning",
            fontName=font_name,
            fontSize=9,
            textColor=WARNING,
            leading=14,
        ),
        "danger": ParagraphStyle(
            "Danger",
            fontName=font_name,
            fontSize=9,
            textColor=DANGER,
            leading=14,
        ),
        "footer": ParagraphStyle(
            "Footer",
            fontName=font_name,
            fontSize=7,
            textColor=TEXT_MUTED,
            alignment=TA_CENTER,
            leading=10,
        ),
        "table_header": ParagraphStyle(
            "TableHeader",
            fontName=font_name,
            fontSize=8,
            textColor=colors.white,
            alignment=TA_CENTER,
        ),
        "table_cell": ParagraphStyle(
            "TableCell",
            fontName=font_name,
            fontSize=8,
            textColor=TEXT_MAIN,
            leading=11,
        ),
        "promo_content": ParagraphStyle(
            "PromoContent",
            fontName=font_name,
            fontSize=8,
            textColor=TEXT_MAIN,
            leading=12,
            leftIndent=2 * mm,
        ),
    }


def _create_summary_cards(high: int, medium: int, low: int, allergen_count: int, styles: dict):
    """요약 대시보드 카드"""
    data = [[
        Paragraph(f"<font color='#EF4444'><b>{high}</b></font><br/><font size='7' color='#94A3B8'>높은 위험</font>", styles["body"]),
        Paragraph(f"<font color='#F59E0B'><b>{medium}</b></font><br/><font size='7' color='#94A3B8'>주의 필요</font>", styles["body"]),
        Paragraph(f"<font color='#10B981'><b>{low}</b></font><br/><font size='7' color='#94A3B8'>정상</font>", styles["body"]),
        Paragraph(f"<font color='#0D9488'><b>{allergen_count}</b></font><br/><font size='7' color='#94A3B8'>알레르겐</font>", styles["body"]),
    ]]

    col_width = CONTENT_WIDTH / 4
    table = Table(data, colWidths=[col_width] * 4)
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, 0), DANGER_BG if high > 0 else CARD_BG),
        ("BACKGROUND", (1, 0), (1, 0), WARNING_BG if medium > 0 else CARD_BG),
        ("BACKGROUND", (2, 0), (2, 0), SUCCESS_BG),
        ("BACKGROUND", (3, 0), (3, 0), CARD_BG),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("LEFTPADDING", (0, 0), (-1, -1), 4),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4),
        ("LINEAFTER", (0, 0), (-2, -1), 0.5, CARD_BORDER),
    ]))
    return table


def generate_expert_pdf_report(
    report_id: str,
    country: str,
    risks: List[Dict[str, Any]],
    expert_comment: str = ""
) -> bytes:
    """전문가 검토용 PDF"""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer, pagesize=A4,
        topMargin=MARGIN, bottomMargin=MARGIN,
        leftMargin=MARGIN, rightMargin=MARGIN,
    )

    font_name = _register_korean_font()
    styles = _create_styles(font_name)
    elements = []

    # 헤더
    elements.append(Paragraph("K-Food Export Passport", styles["main_title"]))
    elements.append(Paragraph("전문가 검토용 리포트", styles["subtitle"]))

    # 기본 정보
    country_names = {"US": "미국", "JP": "일본", "VN": "베트남", "EU": "유럽연합", "CN": "중국"}
    info_text = f"<b>리포트 ID:</b> {report_id}  |  <b>수출국:</b> {country_names.get(country, country)}  |  <b>생성일:</b> {datetime.now().strftime('%Y-%m-%d %H:%M')}"
    elements.append(Paragraph(info_text, styles["body_small"]))
    elements.append(Spacer(1, 4 * mm))

    # 핵심 리스크
    elements.append(Paragraph("핵심 리스크 항목", styles["section_title"]))
    high_risks = [r for r in risks if r.get('severity') == 'HIGH']

    if high_risks:
        for i, risk in enumerate(high_risks, 1):
            allergen = risk.get('allergen', '')
            risk_msg = risk.get('risk', '')
            elements.append(Paragraph(f"<b>{i}.</b> [{allergen}] {risk_msg}", styles["danger"]))
    else:
        elements.append(Paragraph("고위험 항목이 발견되지 않았습니다.", styles["success"]))

    elements.append(Spacer(1, 4 * mm))

    # 체크리스트
    expert_checks = [r for r in risks if r.get('expert_check_required')]
    if expert_checks:
        elements.append(Paragraph("전문가 확인 체크리스트", styles["section_title"]))
        data = [[
            Paragraph("No.", styles["table_header"]),
            Paragraph("확인 항목", styles["table_header"]),
            Paragraph("확인", styles["table_header"])
        ]]
        for i, check in enumerate(expert_checks, 1):
            data.append([
                Paragraph(str(i), styles["table_cell"]),
                Paragraph(check.get('next_step', 'N/A'), styles["table_cell"]),
                Paragraph("☐", styles["table_cell"])
            ])

        table = Table(data, colWidths=[10 * mm, CONTENT_WIDTH - 28 * mm, 18 * mm])
        table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), PRIMARY),
            ("BACKGROUND", (0, 1), (-1, -1), colors.white),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("ALIGN", (0, 0), (0, -1), "CENTER"),
            ("ALIGN", (2, 0), (2, -1), "CENTER"),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ("LINEBELOW", (0, 0), (-1, -2), 0.5, CARD_BORDER),
        ]))
        elements.append(table)
        elements.append(Spacer(1, 4 * mm))

    # 의견란
    elements.append(Paragraph("전문가 의견", styles["section_title"]))
    comment_data = [[Paragraph(expert_comment or "(의견을 작성해 주세요)", styles["body"])]]
    comment_table = Table(comment_data, colWidths=[CONTENT_WIDTH])
    comment_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), CARD_BG),
        ("TOPPADDING", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 25),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
    ]))
    elements.append(comment_table)
    elements.append(Spacer(1, 6 * mm))

    # 서명란
    elements.append(Paragraph("검토자: ________________    서명: ________________    일자: ________________", styles["body"]))

    # 푸터
    elements.append(Spacer(1, 8 * mm))
    elements.append(Paragraph(f"K-Food Export Passport AI  |  {datetime.now().strftime('%Y-%m-%d %H:%M')}", styles["footer"]))

    doc.build(elements)
    buffer.seek(0)
    return buffer.getvalue()


def generate_pdf_report(
    report_id: str,
    country: str,
    ocr_engine: str,
    allergens: List[str],
    nutrition: Dict[str, Any],
    risks: List[Dict[str, Any]],
    promo: Dict[str, str],
    summary: Dict[str, str] = None,
    input_data_status: Dict[str, Any] = None,
    correction_guide: List[Dict[str, str]] = None,
    regulatory_basis: List[str] = None,
    is_expert: bool = False,
    expert_comment: str = ""
) -> bytes:
    """분석 결과 PDF 리포트 생성 - 2024 모던 스타일"""
    if is_expert:
        return generate_expert_pdf_report(report_id, country, risks, expert_comment)

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer, pagesize=A4,
        topMargin=MARGIN, bottomMargin=MARGIN,
        leftMargin=MARGIN, rightMargin=MARGIN,
    )

    font_name = _register_korean_font()
    styles = _create_styles(font_name)
    elements = []

    country_names = {
        "US": "미국 (USA)", "JP": "일본 (Japan)", "VN": "베트남 (Vietnam)",
        "EU": "유럽연합 (EU)", "CN": "중국 (China)",
    }

    # ===== 헤더 =====
    elements.append(Paragraph("K-Food Export Passport", styles["main_title"]))
    header_info = f"{country_names.get(country, country)}  •  {ocr_engine.upper()}  •  #{report_id}"
    elements.append(Paragraph(header_info, styles["subtitle"]))

    # ===== 요약 대시보드 =====
    high_count = len([r for r in risks if r.get('severity') == 'HIGH'])
    medium_count = len([r for r in risks if r.get('severity') == 'MEDIUM'])
    low_count = len([r for r in risks if r.get('severity') not in ['HIGH', 'MEDIUM']])

    elements.append(_create_summary_cards(high_count, medium_count, low_count, len(allergens), styles))
    elements.append(Spacer(1, 3 * mm))

    # ===== 0. 요약 =====
    if summary and summary.get("overall_summary"):
        elements.append(Paragraph("0. 요약", styles["section_title"]))
        summary_text = summary.get("overall_summary", "")
        if summary.get("priority_item"):
            summary_text += f"<br/><b>우선 조치 항목:</b> {summary['priority_item']}"
        if summary.get("expected_effect"):
            summary_text += f"<br/><b>기대 효과:</b> {summary['expected_effect']}"
        elements.append(Paragraph(summary_text, styles["body"]))
        elements.append(Spacer(1, 2 * mm))

    # ===== 1. 입력 데이터 상태 =====
    elements.append(Paragraph("1. 입력 데이터 상태", styles["section_title"]))
    info_items = [
        ("리포트 ID", report_id),
        ("수출 대상국", country_names.get(country, country)),
        ("생성일시", datetime.now().strftime("%Y-%m-%d %H:%M")),
        ("OCR 엔진", ocr_engine.upper()),
    ]
    if input_data_status:
        if input_data_status.get("ocr_confidence"):
            info_items.append(("OCR 신뢰도", input_data_status["ocr_confidence"]))
        if input_data_status.get("detected_language"):
            info_items.append(("감지 언어", input_data_status["detected_language"]))
        if "ingredients_detected" in input_data_status:
            info_items.append(("성분표 인식", "예" if input_data_status["ingredients_detected"] else "아니오"))
        if "allergens_detected" in input_data_status:
            info_items.append(("알레르겐 검출", "예" if input_data_status["allergens_detected"] else "아니오"))
        if "nutrition_detected" in input_data_status:
            val = input_data_status["nutrition_detected"]
            info_items.append(("영양정보 인식", "예" if val == True else ("아니오" if val == False else "확인 필요")))

    # 2열 테이블로 표시
    data = []
    for i in range(0, len(info_items), 2):
        row = []
        row.append(Paragraph(f"<b>{info_items[i][0]}:</b> {info_items[i][1]}", styles["body_small"]))
        if i + 1 < len(info_items):
            row.append(Paragraph(f"<b>{info_items[i+1][0]}:</b> {info_items[i+1][1]}", styles["body_small"]))
        else:
            row.append(Paragraph("", styles["body_small"]))
        data.append(row)

    info_table = Table(data, colWidths=[CONTENT_WIDTH / 2, CONTENT_WIDTH / 2])
    info_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), CARD_BG),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
    ]))
    elements.append(info_table)
    elements.append(Spacer(1, 2 * mm))

    # ===== 알레르겐 태그 =====
    if allergens:
        allergen_text = "  •  ".join(allergens)
        allergen_data = [[Paragraph(f"<font color='#DC2626'><b>검출된 알레르겐:</b></font>  {allergen_text}", styles["body"])]]
        allergen_table = Table(allergen_data, colWidths=[CONTENT_WIDTH])
        allergen_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), WARNING_BG),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ]))
        elements.append(allergen_table)
        elements.append(Spacer(1, 2 * mm))

    # ===== 2. 규정 검토 결과 =====
    elements.append(Paragraph("2. 규정 검토 결과", styles["section_title"]))

    if risks:
        for r in risks:
            severity = r.get("severity", "LOW")
            allergen = r.get("allergen", "")
            risk_msg = r.get("risk", "")
            confidence = r.get("confidence", 0)

            if severity == "HIGH":
                style, prefix = styles["danger"], "⚠"
            elif severity == "MEDIUM":
                style, prefix = styles["warning"], "●"
            else:
                style, prefix = styles["success"], "✓"

            if allergen and allergen not in ["None", "PASS", "CROSS_CONTAMINATION"]:
                text = f"{prefix} <b>[{allergen}]</b> {risk_msg}"
            elif allergen == "CROSS_CONTAMINATION":
                text = f"{prefix} <b>[교차오염]</b> {risk_msg}"
            else:
                text = f"{prefix} {risk_msg}"

            if confidence > 0:
                text += f" <font size='7' color='#94A3B8'>({confidence * 100:.0f}%)</font>"

            elements.append(Paragraph(text, style))

            # 증거가 있으면 표시
            evidence = r.get("evidence", {})
            if evidence.get("matched"):
                evidence_text = " | ".join(evidence["matched"][:2])
                elements.append(Paragraph(f"<font size='7' color='#64748B'>→ {evidence_text}</font>", styles["body_small"]))
    else:
        elements.append(Paragraph("규정 검토 결과가 없습니다.", styles["body_small"]))

    elements.append(Spacer(1, 2 * mm))

    # ===== 3. 수정 가이드 (Before → After) =====
    elements.append(Paragraph("3. 수정 가이드 (Before → After)", styles["section_title"]))
    if correction_guide and len(correction_guide) > 0:
        for i, item in enumerate(correction_guide):
            before_text = item.get("before", "")
            after_text = item.get("after", "")
            if before_text and after_text:
                elements.append(Paragraph(f"<b>{i+1}. Before:</b> {before_text}", styles["body_small"]))
                elements.append(Paragraph(f"<b>   After:</b> {after_text}", styles["body"]))
                elements.append(Spacer(1, 1 * mm))
    else:
        elements.append(Paragraph("현재 수정이 필요한 항목이 없습니다.", styles["body_small"]))
    elements.append(Spacer(1, 2 * mm))

    # ===== 4. 규정 근거 정보 =====
    elements.append(Paragraph("4. 규정 근거 정보", styles["section_title"]))
    if regulatory_basis and len(regulatory_basis) > 0:
        for item in regulatory_basis:
            elements.append(Paragraph(f"• {item}", styles["body_small"]))
    else:
        elements.append(Paragraph("규정 근거 정보가 없습니다.", styles["body_small"]))
    elements.append(Spacer(1, 2 * mm))

    # ===== 영양정보 (있을 때만) =====
    if nutrition:
        elements.append(Paragraph("5. 영양성분", styles["section_title"]))
        data = [[
            Paragraph("영양성분", styles["table_header"]),
            Paragraph("함량", styles["table_header"]),
        ]]
        for k, v in nutrition.items():
            data.append([
                Paragraph(k, styles["table_cell"]),
                Paragraph(f"{v.get('value', '')} {v.get('unit', '')}", styles["table_cell"]),
            ])

        table = Table(data, colWidths=[CONTENT_WIDTH * 0.5, CONTENT_WIDTH * 0.5])
        table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), PRIMARY),
            ("BACKGROUND", (0, 1), (-1, -1), colors.white),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ("LEFTPADDING", (0, 0), (-1, -1), 6),
            ("LINEBELOW", (0, 0), (-1, -2), 0.5, CARD_BORDER),
        ]))
        elements.append(table)
        elements.append(Spacer(1, 2 * mm))

    # ===== AI 마케팅 제안 =====
    if promo and any([promo.get("detail_copy"), promo.get("poster_text"), promo.get("buyer_pitch")]):
        elements.append(Paragraph("6. AI 마케팅 제안", styles["section_title"]))

        promo_items = [
            ("상품 설명", promo.get("detail_copy", "")),
            ("SNS 문구", promo.get("poster_text", "")),
            ("바이어 피치", promo.get("buyer_pitch", "")),
        ]

        for label, content in promo_items:
            if content:
                promo_data = [[Paragraph(f"<b>{label}</b><br/>{content}", styles["promo_content"])]]
                promo_table = Table(promo_data, colWidths=[CONTENT_WIDTH])
                promo_table.setStyle(TableStyle([
                    ("BACKGROUND", (0, 0), (-1, -1), PRIMARY_BG),
                    ("TOPPADDING", (0, 0), (-1, -1), 5),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                    ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ]))
                elements.append(promo_table)
                elements.append(Spacer(1, 1 * mm))

    # ===== 푸터 =====
    elements.append(Spacer(1, 3 * mm))
    elements.append(HRFlowable(width="100%", thickness=0.5, color=CARD_BORDER, spaceAfter=2 * mm))
    elements.append(Paragraph(
        "본 결과는 참고용이며, 최종 수출 적합성 판단은 전문 기관 검토가 필요합니다.",
        styles["footer"]
    ))
    elements.append(Paragraph(
        f"K-Food Export Passport AI  •  {report_id}  •  {datetime.now().strftime('%Y-%m-%d %H:%M')}",
        styles["footer"]
    ))

    doc.build(elements)
    buffer.seek(0)
    return buffer.getvalue()
