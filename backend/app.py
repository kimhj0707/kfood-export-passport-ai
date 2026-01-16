import streamlit as st
from PIL import Image

from src.ocr.ocr_tesseract import extract_text
from src.ocr.ocr_google import extract_text_google
from src.rules.checker import check_risks
from src.rules.allergen_parser import extract_allergens
from src.rules.nutrition_parser import parse_nutrition
from src.llm.promo_generator import generate_promo
from src.report.pdf_report import generate_pdf_report

st.set_page_config(page_title="K-Food Export Passport", layout="wide")
st.title("K-Food Export Passport AI")
st.markdown("식품 라벨 이미지를 업로드하고 **분석 시작** 버튼을 클릭하세요.")

col_ocr, col_country = st.columns(2)
with col_ocr:
    ocr_engine = st.selectbox(
        "OCR 엔진 선택",
        ["Google Vision", "Tesseract"],
        index=0
    )
with col_country:
    export_country = st.selectbox(
        "수출국 선택",
        ["US", "JP", "VN"],
        index=0
    )

uploaded_file = st.file_uploader("라벨 이미지 업로드", type=["png", "jpg", "jpeg"])

if uploaded_file is not None:
    image = Image.open(uploaded_file)
    st.image(image, caption="업로드된 이미지", width=400)

if st.button("분석 시작", disabled=(uploaded_file is None)):
    image = Image.open(uploaded_file)

    with st.spinner("OCR 처리 중..."):
        if ocr_engine == "Google Vision":
            ocr_text, ocr_error = extract_text_google(image)
        else:
            ocr_text, ocr_error = extract_text(image)

    if ocr_error:
        st.error(ocr_error)
        st.stop()

    with st.spinner("규칙 검사 중..."):
        risks = check_risks(ocr_text, country=export_country)

    with st.spinner("홍보 문구 생성 중..."):
        promo = generate_promo(ocr_text, export_country)


    st.markdown("---")

    st.subheader("1. OCR 추출 텍스트")
    st.text_area("추출된 텍스트", ocr_text, height=200)

    st.subheader("2. 알레르기 자동 추출")
    allergens = extract_allergens(ocr_text)
    if allergens:
        cols = st.columns(min(len(allergens), 5))
        for idx, allergen in enumerate(allergens):
            with cols[idx % 5]:
                st.error(f"⚠️ {allergen}")
    else:
        st.info("알레르기 표기 없음 또는 인식 실패")

    st.subheader("3. 영양성분 분석")
    nutrition = parse_nutrition(ocr_text)
    if nutrition:
        nutrition_data = [
            {"영양성분": k, "함량": v["value"], "단위": v["unit"]}
            for k, v in nutrition.items()
        ]
        st.dataframe(nutrition_data, width="stretch")
    else:
        st.info("영양성분 인식 실패")

    st.subheader(f"4. 리스크 분석 ({export_country})")
    for r in risks:
        severity = r.get("severity", "LOW")
        if severity == "HIGH":
            st.error(f"**[{r['allergen']}]** {r['risk']}")
        else:
            st.success(f"**[{r['allergen']}]** {r['risk']}")

    st.subheader("5. 홍보 문구")
    col1, col2, col3 = st.columns(3)
    with col1:
        st.markdown("**상세 설명 (Detail Copy)**")
        st.info(promo["detail_copy"])
    with col2:
        st.markdown("**포스터 문구 (Poster Text)**")
        st.info(promo["poster_text"])
    with col3:
        st.markdown("**바이어 피칭 (Buyer Pitch)**")
        st.info(promo["buyer_pitch"])

    st.markdown("---")
    pdf_bytes = generate_pdf_report(
        country=export_country,
        ocr_engine=ocr_engine,
        allergens=allergens,
        nutrition=nutrition,
        risks=risks,
        promo=promo
    )
    st.download_button(
        label="PDF 리포트 다운로드",
        data=pdf_bytes,
        file_name=f"kfood_export_report_{export_country}.pdf",
        mime="application/pdf"
    )
