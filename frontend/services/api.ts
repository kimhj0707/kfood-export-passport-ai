
import {
  AnalysisReport,
  Nutrient,
  RegulationCheck,
  MarketingSuggestion,
  ApiAnalyzeResponse,
  ApiReportResponse,
  ApiReportListResponse,
  ApiReportListItem,
  ApiRiskItem,
  ApiPromoContent,
} from '../types';

// =============================================================================
// API Base URL (환경변수에서 가져옴)
// =============================================================================

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// =============================================================================
// 변환 함수: 백엔드 응답 → UI 타입
// =============================================================================

/**
 * 영양성분 변환: dict → array
 */
function convertNutrition(nutrition: Record<string, { value: number; unit: string }>): Nutrient[] {
  if (!nutrition || typeof nutrition !== 'object') return [];

  const nutrientNameMap: Record<string, string> = {
    '나트륨': 'Sodium',
    '탄수화물': 'Carbohydrate',
    '당류': 'Total Sugars',
    '지방': 'Total Fat',
    '트랜스지방': 'Trans Fat',
    '포화지방': 'Saturated Fat',
    '콜레스테롤': 'Cholesterol',
    '단백질': 'Protein',
    '칼슘': 'Calcium',
  };

  return Object.entries(nutrition).map(([name, data]) => ({
    name,
    nameEn: nutrientNameMap[name] || name,
    amount: `${data.value} ${data.unit}`,
    percent: undefined,
  }));
}

/**
 * 리스크 변환: risks → regulations
 */
function convertRisks(risks: ApiRiskItem[]): RegulationCheck[] {
  if (!risks || !Array.isArray(risks)) return [];

  return risks.map((risk) => ({
    type: risk.severity === 'HIGH' ? 'warning' : 'info',
    title: risk.allergen === 'PASS' || risk.allergen === 'None'
      ? '규정 준수 확인'
      : `알레르겐 주의: ${risk.allergen}`,
    description: risk.risk,
  }));
}

/**
 * 홍보문구 변환: promo → marketing
 */
function convertPromo(promo: ApiPromoContent): MarketingSuggestion {
  if (!promo) {
    return {
      localizedDescription: '',
      snsCopy: '',
      buyerPitch: '',
    };
  }

  return {
    localizedDescription: promo.detail_copy || '',
    snsCopy: promo.poster_text || '',
    buyerPitch: promo.buyer_pitch || '',
  };
}

/**
 * 전체 리포트 변환
 */
function convertReportResponse(api: ApiReportResponse): AnalysisReport {
  return {
    id: api.id,
    createdAt: api.created_at,
    country: api.country as 'US' | 'JP' | 'VN',
    ocrEngine: api.ocr_engine as 'google' | 'tesseract',
    ocrText: api.ocr_text || '',
    ingredients: [], // 백엔드에서 제공하지 않음
    allergens: api.allergens || [],
    nutrients: convertNutrition(api.nutrition),
    regulations: convertRisks(api.risks),
    marketing: convertPromo(api.promo),
  };
}

/**
 * 히스토리 목록 아이템 변환
 */
function convertReportListItem(api: ApiReportListItem): AnalysisReport {
  return {
    id: api.id,
    createdAt: api.created_at,
    country: api.country as 'US' | 'JP' | 'VN',
    ocrEngine: api.ocr_engine as 'google' | 'tesseract',
    ocrText: '',
    ingredients: [],
    allergens: [],
    nutrients: [],
    regulations: [],
    marketing: {
      localizedDescription: '',
      snsCopy: '',
      buyerPitch: '',
    },
  };
}

// =============================================================================
// API 호출 함수
// =============================================================================

/**
 * 라벨 이미지 분석 요청
 * @returns report_id (성공 시)
 */
export const analyzeLabel = async (
  file: File,
  country: string,
  ocrEngine: string
): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('country', country);
  formData.append('ocr_engine', ocrEngine);

  const response = await fetch(`${API_BASE_URL}/api/analyze`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: '분석 요청 실패' }));
    throw new Error(error.detail || '분석 요청 실패');
  }

  const data: ApiAnalyzeResponse = await response.json();
  return data.report_id;
};

/**
 * 특정 리포트 조회
 */
export const getReport = async (id: string): Promise<AnalysisReport | undefined> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/reports/${id}`);

    if (!response.ok) {
      if (response.status === 404) return undefined;
      throw new Error('리포트 조회 실패');
    }

    const data: ApiReportResponse = await response.json();
    return convertReportResponse(data);
  } catch (error) {
    console.error('getReport error:', error);
    return undefined;
  }
};

/**
 * 리포트 히스토리 목록 조회
 */
export const getHistory = async (limit: number = 10): Promise<AnalysisReport[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/reports?limit=${limit}`);

    if (!response.ok) {
      throw new Error('히스토리 조회 실패');
    }

    const data: ApiReportListResponse = await response.json();
    return data.reports.map(convertReportListItem);
  } catch (error) {
    console.error('getHistory error:', error);
    return [];
  }
};

/**
 * PDF 다운로드
 */
export const downloadPdf = async (id: string): Promise<void> => {
  try {
    const url = `${API_BASE_URL}/api/reports/${id}/pdf`;

    // 새 탭에서 PDF 다운로드 (브라우저가 처리)
    window.open(url, '_blank');
  } catch (error) {
    console.error('downloadPdf error:', error);
    alert('PDF 다운로드 중 오류가 발생했습니다.');
  }
};
