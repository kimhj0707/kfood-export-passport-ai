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


# 모던 컬러 팔레트 - 가독성 강화
PRIMARY = colors.HexColor("#0D9488")
PRIMARY_DARK = colors.HexColor("#0F766E")
PRIMARY_LIGHT = colors.HexColor("#5EEAD4")
PRIMARY_BG = colors.HexColor("#CCFBF1")

TEXT_DARK = colors.HexColor("#0F172A")
TEXT_MAIN = colors.HexColor("#1E293B")
TEXT_MUTED = colors.HexColor("#64748B")

CARD_BG = colors.HexColor("#F1F5F9")
CARD_BORDER = colors.HexColor("#CBD5E1")

SUCCESS = colors.HexColor("#059669")
SUCCESS_BG = colors.HexColor("#A7F3D0")
WARNING = colors.HexColor("#D97706")
WARNING_BG = colors.HexColor("#FDE68A")
DANGER = colors.HexColor("#DC2626")
DANGER_BG = colors.HexColor("#FECACA")

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


def _create_fda_nutrition_table(nutrition: Dict[str, Any], font_name: str) -> Table:
    """미국 FDA Nutrition Facts 스타일 영양성분표 생성"""

    # FDA 표준 영양성분 매핑 (한글 → 영문)
    nutrient_mapping = {
        "열량": ("Calories", ""),
        "칼로리": ("Calories", ""),
        "탄수화물": ("Total Carbohydrate", "g"),
        "당류": ("Total Sugars", "g"),
        "식이섬유": ("Dietary Fiber", "g"),
        "단백질": ("Protein", "g"),
        "지방": ("Total Fat", "g"),
        "포화지방": ("Saturated Fat", "g"),
        "트랜스지방": ("Trans Fat", "g"),
        "콜레스테롤": ("Cholesterol", "mg"),
        "나트륨": ("Sodium", "mg"),
        "칼슘": ("Calcium", "mg"),
        "철분": ("Iron", "mg"),
        "비타민D": ("Vitamin D", "mcg"),
        "칼륨": ("Potassium", "mg"),
    }

    # 일일 권장량 (FDA 기준)
    daily_values = {
        "Total Fat": 78,
        "Saturated Fat": 20,
        "Cholesterol": 300,
        "Sodium": 2300,
        "Total Carbohydrate": 275,
        "Dietary Fiber": 28,
        "Protein": 50,
        "Vitamin D": 20,
        "Calcium": 1300,
        "Iron": 18,
        "Potassium": 4700,
    }

    # 스타일 정의
    title_style = ParagraphStyle("FDATitle", fontName=font_name, fontSize=16, textColor=colors.black, leading=18)
    subtitle_style = ParagraphStyle("FDASubtitle", fontName=font_name, fontSize=7, textColor=colors.black, leading=9)
    calorie_style = ParagraphStyle("FDACalorie", fontName=font_name, fontSize=12, textColor=colors.black, leading=14)
    item_style = ParagraphStyle("FDAItem", fontName=font_name, fontSize=7, textColor=colors.black, leading=9)
    item_bold_style = ParagraphStyle("FDAItemBold", fontName=font_name, fontSize=7, textColor=colors.black, leading=9)
    percent_style = ParagraphStyle("FDAPercent", fontName=font_name, fontSize=7, textColor=colors.black, alignment=TA_RIGHT, leading=9)

    # 표 너비 - 더 넓게
    table_width = 85 * mm

    # 영양성분 데이터 변환
    fda_data = {}
    calories = 0

    for kor_name, value_dict in nutrition.items():
        if kor_name in nutrient_mapping:
            eng_name, unit = nutrient_mapping[kor_name]
            val = value_dict.get('value', 0)
            try:
                val = float(str(val).replace(',', '').replace('kcal', '').replace('g', '').replace('mg', '').strip())
            except:
                val = 0
            fda_data[eng_name] = val
            if eng_name == "Calories":
                calories = val

    # 테이블 데이터 구성
    data = []

    # 헤더
    data.append([Paragraph("<b>Nutrition Facts</b>", title_style)])
    data.append([Paragraph("Serving Size 1 package", subtitle_style)])

    # 칼로리
    cal_val = fda_data.get("Calories", calories)
    data.append([Paragraph(f"<b>Calories</b> {int(cal_val)}", calorie_style)])

    # % Daily Value 헤더
    data.append([Paragraph("<b>% Daily Value*</b>", ParagraphStyle("Right", fontName=font_name, fontSize=7, alignment=TA_RIGHT))])

    # 영양성분 항목들
    nutrient_order = [
        ("Total Fat", True, 0),
        ("Saturated Fat", False, 1),
        ("Trans Fat", False, 1),
        ("Cholesterol", True, 0),
        ("Sodium", True, 0),
        ("Total Carbohydrate", True, 0),
        ("Dietary Fiber", False, 1),
        ("Total Sugars", False, 1),
        ("Protein", True, 0),
        ("Vitamin D", True, 0),
        ("Calcium", True, 0),
        ("Iron", True, 0),
        ("Potassium", True, 0),
    ]

    for nutrient, is_bold, indent in nutrient_order:
        val = fda_data.get(nutrient, 0)
        unit = "g" if nutrient in ["Total Fat", "Saturated Fat", "Trans Fat", "Total Carbohydrate", "Dietary Fiber", "Total Sugars", "Protein"] else "mg"
        if nutrient == "Cholesterol":
            unit = "mg"

        # % Daily Value 계산
        dv = daily_values.get(nutrient, 0)
        if dv > 0 and val > 0:
            percent = int((val / dv) * 100)
            percent_text = f"{percent}%"
        else:
            percent_text = ""

        # 들여쓰기
        prefix = "&nbsp;&nbsp;&nbsp;" if indent else ""

        if is_bold:
            text = f"{prefix}<b>{nutrient}</b> {int(val)}{unit}"
        else:
            text = f"{prefix}{nutrient} {int(val)}{unit}"

        # 2열 레이아웃 (항목 | %)
        row_data = [[
            Paragraph(text, item_style),
            Paragraph(f"<b>{percent_text}</b>", percent_style)
        ]]
        inner_table = Table(row_data, colWidths=[table_width * 0.82, table_width * 0.18])
        inner_table.setStyle(TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("TOPPADDING", (0, 0), (-1, -1), 1),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 1),
            ("LEFTPADDING", (0, 0), (-1, -1), 2),
            ("RIGHTPADDING", (0, 0), (-1, -1), 2),
        ]))
        data.append([inner_table])

    # 푸터
    data.append([Paragraph("<i>* The % Daily Value tells you how much a nutrient in a serving contributes to a daily diet.</i>",
                           ParagraphStyle("Footer", fontName=font_name, fontSize=6, textColor=TEXT_MUTED, leading=8))])

    # 메인 테이블 생성
    table = Table(data, colWidths=[table_width])

    # 스타일 적용 - FDA 특유의 굵은 검정 테두리
    style_commands = [
        # 외곽 굵은 테두리
        ("BOX", (0, 0), (-1, -1), 2, colors.black),
        # 배경색
        ("BACKGROUND", (0, 0), (-1, -1), colors.white),
        # 패딩
        ("TOPPADDING", (0, 0), (-1, -1), 2),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
        ("LEFTPADDING", (0, 0), (-1, -1), 4),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4),
        # 제목 아래 굵은 선
        ("LINEBELOW", (0, 0), (-1, 0), 1.5, colors.black),
        # 서빙사이즈 아래 굵은 선
        ("LINEBELOW", (0, 1), (-1, 1), 4, colors.black),
        # 칼로리 아래 굵은 선
        ("LINEBELOW", (0, 2), (-1, 2), 3, colors.black),
        # 각 항목 사이 얇은 선
        ("LINEBELOW", (0, 3), (-1, -2), 0.5, colors.black),
    ]

    table.setStyle(TableStyle(style_commands))

    return table


def _create_japan_nutrition_table(nutrition: Dict[str, Any], font_name: str) -> Table:
    """일본 栄養成分表示 스타일 영양성분표 생성"""

    # 일본 표준 영양성분 매핑
    nutrient_mapping = {
        "열량": "熱量",
        "칼로리": "熱量",
        "단백질": "たんぱく質",
        "지방": "脂質",
        "탄수화물": "炭水化物",
        "나트륨": "食塩相当量",
        "당류": "糖類",
        "식이섬유": "食物繊維",
    }

    table_width = 65 * mm

    # 스타일
    title_style = ParagraphStyle("JPTitle", fontName=font_name, fontSize=10, textColor=colors.black, alignment=TA_CENTER, leading=12)
    item_style = ParagraphStyle("JPItem", fontName=font_name, fontSize=8, textColor=colors.black, leading=10)

    data = []
    data.append([Paragraph("<b>栄養成分表示</b>", title_style)])
    data.append([Paragraph("1食分当たり", ParagraphStyle("Sub", fontName=font_name, fontSize=7, alignment=TA_CENTER))])

    for kor_name, value_dict in nutrition.items():
        jp_name = nutrient_mapping.get(kor_name, kor_name)
        val = value_dict.get('value', '')
        unit = value_dict.get('unit', '')
        data.append([Paragraph(f"{jp_name}　{val}{unit}", item_style)])

    table = Table(data, colWidths=[table_width])
    table.setStyle(TableStyle([
        ("BOX", (0, 0), (-1, -1), 1, colors.black),
        ("BACKGROUND", (0, 0), (-1, -1), colors.white),
        ("LINEBELOW", (0, 0), (-1, 0), 1, colors.black),
        ("LINEBELOW", (0, 1), (-1, 1), 0.5, colors.black),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
        ("LEFTPADDING", (0, 0), (-1, -1), 4),
    ]))

    return table


def _create_eu_nutrition_table(nutrition: Dict[str, Any], font_name: str) -> Table:
    """EU Nutrition Declaration 스타일 영양성분표 생성"""

    nutrient_mapping = {
        "열량": "Energy",
        "칼로리": "Energy",
        "지방": "Fat",
        "포화지방": "of which saturates",
        "탄수화물": "Carbohydrate",
        "당류": "of which sugars",
        "단백질": "Protein",
        "나트륨": "Salt",
        "식이섬유": "Fibre",
    }

    table_width = 80 * mm

    title_style = ParagraphStyle("EUTitle", fontName=font_name, fontSize=10, textColor=colors.black, leading=12)
    header_style = ParagraphStyle("EUHeader", fontName=font_name, fontSize=7, textColor=colors.white, alignment=TA_CENTER)
    item_style = ParagraphStyle("EUItem", fontName=font_name, fontSize=8, textColor=colors.black, leading=10)
    value_style = ParagraphStyle("EUValue", fontName=font_name, fontSize=8, textColor=colors.black, alignment=TA_CENTER)

    data = []
    # 헤더
    data.append([
        Paragraph("<b>Nutrition Declaration</b>", title_style),
        Paragraph("", title_style)
    ])
    data.append([
        Paragraph("<b>per 100g</b>", header_style),
        Paragraph("<b>per serving</b>", header_style)
    ])

    for kor_name, value_dict in nutrition.items():
        eu_name = nutrient_mapping.get(kor_name, kor_name)
        val = value_dict.get('value', '')
        unit = value_dict.get('unit', '')

        # 들여쓰기 처리
        if eu_name.startswith("of which"):
            eu_name = f"&nbsp;&nbsp;{eu_name}"

        data.append([
            Paragraph(f"{eu_name}", item_style),
            Paragraph(f"{val}{unit}", value_style)
        ])

    table = Table(data, colWidths=[table_width * 0.6, table_width * 0.4])
    table.setStyle(TableStyle([
        ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#1E40AF")),
        ("BACKGROUND", (0, 0), (-1, 0), colors.white),
        ("BACKGROUND", (0, 1), (-1, 1), colors.HexColor("#1E40AF")),
        ("BACKGROUND", (0, 2), (-1, -1), colors.white),
        ("LINEBELOW", (0, 0), (-1, -2), 0.5, colors.HexColor("#BFDBFE")),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
        ("LEFTPADDING", (0, 0), (-1, -1), 4),
    ]))

    return table


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

        # ===== 수출국 규격 영양성분표 =====
        if country in ["US", "JP", "EU"]:
            country_label = {"US": "미국 FDA", "JP": "일본", "EU": "유럽연합"}
            elements.append(Paragraph(f"5-1. {country_label[country]} 규격 영양성분표", styles["section_title"]))
            elements.append(Paragraph("아래 표는 수출국 규격에 맞게 변환된 영양성분표입니다. 실제 라벨 제작 시 참고하세요.", styles["body_small"]))
            elements.append(Spacer(1, 2 * mm))

            if country == "US":
                nutrition_table = _create_fda_nutrition_table(nutrition, font_name)
            elif country == "JP":
                nutrition_table = _create_japan_nutrition_table(nutrition, font_name)
            elif country == "EU":
                nutrition_table = _create_eu_nutrition_table(nutrition, font_name)

            # 표를 가운데 정렬하기 위해 외부 테이블로 감싸기
            wrapper_data = [[nutrition_table]]
            wrapper_table = Table(wrapper_data, colWidths=[CONTENT_WIDTH])
            wrapper_table.setStyle(TableStyle([
                ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ]))
            elements.append(wrapper_table)
            elements.append(Spacer(1, 3 * mm))

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
