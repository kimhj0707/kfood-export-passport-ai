
// =============================================================================
// UI에서 사용하는 타입 (기존 유지)
// =============================================================================

export interface AnalysisReport {
  id: string;
  createdAt: string;
  country: 'US' | 'JP' | 'VN' | 'EU' | 'CN';
  ocrEngine: 'google' | 'tesseract';
  ocrText: string;
  ingredients: string[];
  allergens: string[];
  nutrients: Nutrient[];
  regulations: RegulationCheck[];
  marketing: MarketingSuggestion;
}

export interface Nutrient {
  name: string;
  nameEn: string;
  amount: string;
  percent?: string;
}

export interface RegulationCheck {
  type: 'warning' | 'info';
  title: string;
  description: string;
  regulation?: string;
  article?: string;
  reason?: string;
}

export interface MarketingSuggestion {
  localizedDescription: string;
  snsCopy: string;
  buyerPitch: string;
}

// =============================================================================
// 백엔드 API 응답 타입
// =============================================================================

export interface ApiAnalyzeResponse {
  report_id: string;
  country: string;
  ocr_engine: string;
  ocr_text: string;
  allergens: string[];
  nutrition: Record<string, { value: number; unit: string }>;
  risks: ApiRiskItem[];
  promo: ApiPromoContent;
}

export interface ApiReportResponse {
  id: string;
  created_at: string;
  country: string;
  ocr_engine: string;
  ocr_text: string;
  allergens: string[];
  nutrition: Record<string, { value: number; unit: string }>;
  risks: ApiRiskItem[];
  promo: ApiPromoContent;
}

export interface ApiRiskItem {
  allergen: string;
  risk: string;
  severity: 'HIGH' | 'LOW';
  regulation?: string;
  article?: string;
  reason?: string;
}

export interface ApiPromoContent {
  detail_copy: string;
  poster_text: string;
  buyer_pitch: string;
}

export interface ApiReportListResponse {
  reports: ApiReportListItem[];
  total: number;
}

export interface ApiReportListItem {
  id: string;
  created_at: string;
  country: string;
  ocr_engine: string;
}
