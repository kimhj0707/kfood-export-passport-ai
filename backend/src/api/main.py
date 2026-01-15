"""
K-Food Export Passport API
- 이미지 분석 + DB 저장 + report_id 발급
- 리포트 조회/목록/PDF 다운로드
"""
import io
from typing import Optional

from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
from PIL import Image

from src.ocr.ocr_google import extract_text_google
from src.ocr.ocr_tesseract import extract_text
from src.rules.checker import check_risks
from src.rules.allergen_parser import extract_allergens
from src.rules.nutrition_parser import parse_nutrition
from src.llm.promo_generator import generate_promo
from src.report.pdf_report import generate_pdf_report

from src.api.db import save_report, get_report, get_reports, delete_report
from src.api.models import (
    AnalyzeResponse,
    ReportResponse,
    ReportListItem,
    ReportListResponse,
    ErrorResponse
)

app = FastAPI(
    title="K-Food Export Passport API",
    description="식품 라벨 분석 및 수출 규정 체크 API",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =============================================================================
# Health Check
# =============================================================================

@app.get("/")
def health_check():
    """헬스체크"""
    return {"status": "ok", "service": "kfood-api", "version": "2.0.0"}


# =============================================================================
# 분석 API (신규: DB 저장 + report_id 발급)
# =============================================================================

@app.post("/api/analyze", response_model=AnalyzeResponse)
async def api_analyze(
    file: UploadFile = File(..., description="라벨 이미지 파일"),
    country: str = Form(default="US", description="수출국 코드 (US/JP/VN)"),
    ocr_engine: str = Form(default="google", description="OCR 엔진 (google/tesseract)")
):
    """
    이미지 업로드 → OCR → 규칙 체크 → 홍보 문구 생성 → DB 저장

    Returns:
        report_id와 함께 분석 결과 반환
    """
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))

        # OCR
        if ocr_engine.lower() == "google":
            ocr_text, ocr_error = extract_text_google(image)
        else:
            ocr_text, ocr_error = extract_text(image)

        if ocr_error:
            raise HTTPException(status_code=400, detail=ocr_error)

        # 분석
        allergens = extract_allergens(ocr_text)
        nutrition = parse_nutrition(ocr_text)
        risks = check_risks(ocr_text, country=country)
        promo = generate_promo(ocr_text, country)

        # DB 저장
        report_id = save_report(
            country=country,
            ocr_engine=ocr_engine,
            ocr_text=ocr_text,
            allergens=allergens,
            nutrition=nutrition,
            risks=risks,
            promo=promo
        )

        return JSONResponse(content={
            "report_id": report_id,
            "country": country,
            "ocr_engine": ocr_engine,
            "ocr_text": ocr_text,
            "allergens": allergens,
            "nutrition": nutrition,
            "risks": risks,
            "promo": promo
        })

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# =============================================================================
# 리포트 조회 API
# =============================================================================

@app.get("/api/reports/{report_id}", response_model=ReportResponse)
async def api_get_report(report_id: str):
    """
    특정 리포트 조회

    Args:
        report_id: 리포트 ID (8자리)

    Returns:
        리포트 상세 정보
    """
    report = get_report(report_id)

    if not report:
        raise HTTPException(status_code=404, detail=f"Report not found: {report_id}")

    return JSONResponse(content=report)


@app.get("/api/reports", response_model=ReportListResponse)
async def api_list_reports(
    limit: int = Query(default=10, ge=1, le=100, description="최대 개수"),
    offset: int = Query(default=0, ge=0, description="시작 위치")
):
    """
    최근 리포트 목록 조회 (히스토리)

    Args:
        limit: 최대 개수 (기본 10, 최대 100)
        offset: 시작 위치

    Returns:
        리포트 목록 (최신순)
    """
    reports = get_reports(limit=limit, offset=offset)

    return JSONResponse(content={
        "reports": reports,
        "total": len(reports)
    })


# =============================================================================
# PDF 다운로드 API
# =============================================================================

@app.get("/api/reports/{report_id}/pdf")
async def api_download_pdf(report_id: str):
    """
    리포트 PDF 다운로드

    Args:
        report_id: 리포트 ID

    Returns:
        PDF 파일
    """
    report = get_report(report_id)

    if not report:
        raise HTTPException(status_code=404, detail=f"Report not found: {report_id}")

    try:
        pdf_bytes = generate_pdf_report(
            country=report["country"],
            ocr_engine=report["ocr_engine"],
            allergens=report["allergens"],
            nutrition=report["nutrition"],
            risks=report["risks"],
            promo=report["promo"]
        )

        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=kfood_report_{report_id}.pdf"
            }
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# =============================================================================
# 리포트 삭제 API
# =============================================================================

@app.delete("/api/reports/{report_id}")
async def api_delete_report(report_id: str):
    """
    리포트 삭제

    Args:
        report_id: 리포트 ID

    Returns:
        삭제 결과
    """
    success = delete_report(report_id)

    if not success:
        raise HTTPException(status_code=404, detail=f"Report not found: {report_id}")

    return JSONResponse(content={"message": f"Report {report_id} deleted successfully"})


# =============================================================================
# 레거시 API (하위 호환용)
# =============================================================================

@app.post("/analyze")
async def legacy_analyze(
    file: UploadFile = File(...),
    country: str = Form(default="US"),
    ocr_engine: str = Form(default="google")
):
    """
    [레거시] 이미지 분석 (DB 저장 없음)

    Deprecated: /api/analyze 사용 권장
    """
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))

        if ocr_engine.lower() == "google":
            ocr_text, ocr_error = extract_text_google(image)
        else:
            ocr_text, ocr_error = extract_text(image)

        if ocr_error:
            raise HTTPException(status_code=400, detail=ocr_error)

        allergens = extract_allergens(ocr_text)
        nutrition = parse_nutrition(ocr_text)
        risks = check_risks(ocr_text, country=country)
        promo = generate_promo(ocr_text, country)

        return JSONResponse(content={
            "ocr_text": ocr_text,
            "allergens": allergens,
            "nutrition": nutrition,
            "risks": risks,
            "promo": promo,
            "country": country,
            "ocr_engine": ocr_engine
        })

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/report")
async def legacy_report(
    file: UploadFile = File(...),
    country: str = Form(default="US"),
    ocr_engine: str = Form(default="google")
):
    """
    [레거시] 이미지 → 분석 → PDF 리포트 반환 (DB 저장 없음)

    Deprecated: /api/analyze + /api/reports/{id}/pdf 사용 권장
    """
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))

        if ocr_engine.lower() == "google":
            ocr_text, ocr_error = extract_text_google(image)
        else:
            ocr_text, ocr_error = extract_text(image)

        if ocr_error:
            raise HTTPException(status_code=400, detail=ocr_error)

        allergens = extract_allergens(ocr_text)
        nutrition = parse_nutrition(ocr_text)
        risks = check_risks(ocr_text, country=country)
        promo = generate_promo(ocr_text, country)

        pdf_bytes = generate_pdf_report(
            country=country,
            ocr_engine=ocr_engine,
            allergens=allergens,
            nutrition=nutrition,
            risks=risks,
            promo=promo
        )

        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=kfood_report_{country}.pdf"
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
