
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
  userEmail?: string;
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
  confidence: number;
  evidence: {
    matched: string[];
    hint: string;
  };
  details?: {
    regulation?: string;
    article?: string;
    reason?: string;
  };
  next_step?: string;
  expert_check_required: boolean;
  severity?: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface MarketingSuggestion {
...
export interface ApiRiskItem {
  allergen: string;
  risk: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  confidence: number;
  evidence: {
    matched: string[];
    hint: string;
  };
  details?: {
    regulation?: string;
    article?: string;
    reason?: string;
  };
  next_step?: string;
  expert_check_required: boolean;
}

export interface ApiPromoContent {
...

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
