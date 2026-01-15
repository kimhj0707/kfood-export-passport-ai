"""
Pydantic 모델 정의
"""
from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field
from datetime import datetime


class NutritionItem(BaseModel):
    """영양성분 단일 항목"""
    value: float
    unit: str


class RiskItem(BaseModel):
    """리스크 분석 결과 항목"""
    allergen: str
    risk: str
    severity: str = "LOW"


class PromoContent(BaseModel):
    """홍보 문구 결과"""
    detail_copy: str = ""
    poster_text: str = ""
    buyer_pitch: str = ""


class AnalyzeRequest(BaseModel):
    """분석 요청 모델 (Form 데이터용이므로 실제로는 미사용)"""
    country: str = Field(default="US", description="수출국 코드 (US/JP/VN)")
    ocr_engine: str = Field(default="google", description="OCR 엔진 (google/tesseract)")


class AnalyzeResponse(BaseModel):
    """분석 결과 응답 모델"""
    report_id: str = Field(..., description="생성된 리포트 ID")
    country: str
    ocr_engine: str
    ocr_text: str
    allergens: List[str] = []
    nutrition: Dict[str, NutritionItem] = {}
    risks: List[RiskItem] = []
    promo: PromoContent = PromoContent()


class ReportResponse(BaseModel):
    """리포트 조회 응답 모델"""
    id: str = Field(..., description="리포트 ID")
    created_at: str = Field(..., description="생성 시간")
    country: str
    ocr_engine: str
    ocr_text: str
    allergens: List[str] = []
    nutrition: Dict[str, Any] = {}
    risks: List[Dict[str, str]] = []
    promo: Dict[str, str] = {}


class ReportListItem(BaseModel):
    """히스토리 목록용 간소화 모델"""
    id: str
    created_at: str
    country: str
    ocr_engine: str


class ReportListResponse(BaseModel):
    """히스토리 목록 응답"""
    reports: List[ReportListItem]
    total: int = 0


class ErrorResponse(BaseModel):
    """에러 응답 모델"""
    detail: str
    status_code: int = 400
