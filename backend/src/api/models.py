"""
Pydantic 모델 정의 (FastAPI 응답 스키마)
- 실제 /api/analyze, /api/reports/{id} 응답과 최대한 1:1로 맞춤
- checker.py에서 내려오는 확장 필드( confidence/evidence/rule_id 등 )도 수용
"""

from typing import List, Dict, Optional, Any, Union
from pydantic import BaseModel, Field


class NutritionItem(BaseModel):
    """영양성분 단일 항목"""
    value: float
    unit: str


class Evidence(BaseModel):
    """리스크/판단 근거"""
    matched: List[str] = []
    hint: str = ""


class RiskItem(BaseModel):
    """
    리스크 분석 결과 항목
    - checker.py가 내려주는 필드들을 모두 Optional로 수용
    """
    allergen: str
    risk: str
    severity: str = "LOW"

    confidence: Optional[float] = None
    evidence: Optional[Evidence] = None
    expert_check_required: Optional[bool] = None

    rule_id: Optional[str] = None
    rule_description: Optional[str] = None

    next_step: Optional[str] = None
    details: Optional[Dict[str, Any]] = None
    cross_contamination: Optional[bool] = None


class PromoContent(BaseModel):
    """홍보 문구 결과"""
    detail_copy: str = ""
    poster_text: str = ""
    buyer_pitch: str = ""


class Summary(BaseModel):
    """리포트 요약"""
    overall_summary: str = ""
    priority_item: str = ""
    expected_effect: str = ""


class InputDataStatus(BaseModel):
    """입력 데이터 상태"""
    ocr_confidence: Union[str, bool] = "불명"
    detected_language: str = "불명"
    ingredients_detected: bool = False
    allergens_detected: bool = False
    nutrition_detected: Union[bool, str] = "확인 필요"


class CorrectionGuideItem(BaseModel):
    """Before → After 수정 가이드"""
    before: str = ""
    after: str = ""


class AnalyzeRequest(BaseModel):
    """분석 요청 모델 (multipart/form-data라 실제로는 거의 안 씀)"""
    country: str = Field(default="US", description="수출국 코드 (US/JP/VN/EU/CN)")
    ocr_engine: str = Field(default="google", description="OCR 엔진 (google/tesseract)")
    user_id: str = Field(default="anonymous", description="사용자 ID")


class AnalyzeResponse(BaseModel):
    """분석 결과 응답 모델 (/api/analyze)"""
    report_id: str = Field(..., description="생성된 리포트 ID")
    country: str
    ocr_engine: str
    ocr_text: str

    allergens: List[str] = []
    nutrition: Dict[str, NutritionItem] = {}
    promo: PromoContent = PromoContent()
    risks: List[RiskItem] = []

    # ✅ 확장 섹션들
    summary: Summary = Summary()
    input_data_status: InputDataStatus = InputDataStatus()
    correction_guide: List[CorrectionGuideItem] = []
    regulatory_basis: List[str] = []

    user_id: str = "anonymous"


class ReportResponse(BaseModel):
    """리포트 조회 응답 모델 (/api/reports/{id})"""
    id: str = Field(..., description="리포트 ID")
    created_at: str = Field(..., description="생성 시간")
    user_id: str = "anonymous"
    country: str
    ocr_engine: str
    ocr_text: str

    allergens: List[str] = []
    nutrition: Dict[str, Any] = {}
    risks: List[Dict[str, Any]] = []
    promo: Dict[str, str] = {}

    # ✅ DB에 저장/조회되는 확장 필드들
    summary: Dict[str, Any] = {}
    input_data_status: Dict[str, Any] = {}
    correction_guide: List[Dict[str, Any]] = []
    regulatory_basis: List[str] = []

    # get_report에서 user_email 내려주면 포함
    user_email: Optional[str] = None


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
