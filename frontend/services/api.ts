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
} from "../types";

// =============================================================================
// API Base URL (환경변수에서 가져옴)
// =============================================================================

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

// =============================================================================
// 변환 함수: 백엔드 응답 → UI 타입
// =============================================================================

/**
 * 영양성분 변환: dict → array
 */
function convertNutrition(
  nutrition: Record<string, { value: number; unit: string }>
): Nutrient[] {
  if (!nutrition || typeof nutrition !== "object") return [];

  const nutrientNameMap: Record<string, string> = {
    나트륨: "Sodium",
    탄수화물: "Carbohydrate",
    당류: "Total Sugars",
    지방: "Total Fat",
    트랜스지방: "Trans Fat",
    포화지방: "Saturated Fat",
    콜레스테롤: "Cholesterol",
    단백질: "Protein",
    칼슘: "Calcium",
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

  return risks.map((risk) => {
    // severity → type 변환: HIGH/MEDIUM은 warning, LOW는 info
    const type = (risk.severity === 'HIGH' || risk.severity === 'MEDIUM') ? 'warning' : 'info';

    // 타이틀 생성
    let title: string;
    if (risk.allergen === 'PASS' || risk.allergen === 'None') {
      title = risk.risk;
    } else if (risk.allergen === 'CROSS_CONTAMINATION') {
      title = '교차오염 가능성 문구 감지';
    } else {
      title = `[${risk.allergen}] 성분 경고`;
    }

    return {
      type,
      title,
      description: risk.risk,
      confidence: risk.confidence,
      evidence: risk.evidence || { matched: [], hint: '' },
      details: risk.details || {},
      next_step: risk.next_step,
      expert_check_required: risk.expert_check_required,
      severity: risk.severity, // severity 원본 유지
    };
  });
}

/**
 * 홍보문구 변환: promo → marketing
 */
function convertPromo(promo: ApiPromoContent): MarketingSuggestion {
  if (!promo) {
    return {
      localizedDescription: "",
      snsCopy: "",
      buyerPitch: "",
    };
  }

  return {
    localizedDescription: promo.detail_copy || "",
    snsCopy: promo.poster_text || "",
    buyerPitch: promo.buyer_pitch || "",
  };
}

/**
 * 전체 리포트 변환
 */
function convertReportResponse(api: ApiReportResponse): AnalysisReport {
  return {
    id: api.id,
    createdAt: api.created_at,
    country: api.country as "US" | "JP" | "VN",
    ocrEngine: api.ocr_engine as "google" | "tesseract",
    ocrText: api.ocr_text || "",
    ingredients: [], // 백엔드에서 제공하지 않음
    allergens: api.allergens || [],
    nutrients: convertNutrition(api.nutrition),
    regulations: convertRisks(api.risks),
    marketing: convertPromo(api.promo),
    userEmail: api.user_email,
  };
}

/**
 * 히스토리 목록 아이템 변환
 */
function convertReportListItem(api: ApiReportListItem): AnalysisReport {
  return {
    id: api.id,
    createdAt: api.created_at,
    country: api.country as "US" | "JP" | "VN",
    ocrEngine: api.ocr_engine as "google" | "tesseract",
    ocrText: "",
    ingredients: [],
    allergens: [],
    nutrients: [],
    regulations: [],
    marketing: {
      localizedDescription: "",
      snsCopy: "",
      buyerPitch: "",
    },
  };
}

// =============================================================================
// API 호출 함수
// =============================================================================

/**
 * 사용자 ID와 이메일 연결 요청
 */
export const linkEmail = async (
  userId: string,
  email: string
): Promise<void> => {
  const formData = new FormData();
  formData.append("user_id", userId);
  formData.append("email", email);

  const response = await fetch(`${API_BASE_URL}/api/users/link-email`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: "이메일 연결 실패" }));
    throw new Error(error.detail || "이메일 연결 실패");
  }
};

/**
 * 사용자 정보(이메일) 조회
 */
export const getUser = async (
  userId: string
): Promise<{ email: string | null }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}`);
    if (!response.ok) {
      return { email: null };
    }
    const data = await response.json();
    return { email: data.email };
  } catch {
    return { email: null };
  }
};

/**
 * 사용자 ID의 이메일 연결 해제 요청
 */
export const unlinkEmail = async (userId: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/users/${userId}/email`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: "이메일 연결 해제 실패" }));
    throw new Error(error.detail || "이메일 연결 해제 실패");
  }
};

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
  formData.append("file", file);
  formData.append("country", country);
  formData.append("ocr_engine", ocrEngine);

  // user_id 추가
  const userId = localStorage.getItem("user_id");
  if (userId) {
    formData.append("user_id", userId);
  }

  const response = await fetch(`${API_BASE_URL}/api/analyze`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: "분석 요청 실패" }));
    throw new Error(error.detail || "분석 요청 실패");
  }

  const data: ApiAnalyzeResponse = await response.json();
  return data.report_id;
};

/**
 * 특정 리포트 조회
 */
export const getReport = async (
  id: string
): Promise<AnalysisReport | undefined> => {
  try {
    const params = new URLSearchParams();
    const userId = localStorage.getItem("user_id");
    if (userId) {
      params.append("user_id", userId);
    }

    const response = await fetch(
      `${API_BASE_URL}/api/reports/${id}?${params.toString()}`
    );

    if (!response.ok) {
      if (response.status === 404) return undefined;
      throw new Error("리포트 조회 실패");
    }

    const data: ApiReportResponse = await response.json();
    return convertReportResponse(data);
  } catch (error) {
    console.error("getReport error:", error);
    return undefined;
  }
};

export interface HistoryFilters {
  country?: string;
  dateFrom?: string;
  dateTo?: string;
}

/**
 * 리포트 히스토리 목록 조회 (페이지네이션 + 필터 지원)
 */
export const getHistory = async (
  limit: number = 10,
  offset: number = 0,
  filters?: HistoryFilters
): Promise<{ reports: AnalysisReport[]; total: number }> => {
  try {
    const params = new URLSearchParams();
    params.append("limit", limit.toString());
    params.append("offset", offset.toString());

    // user_id 추가
    const userId = localStorage.getItem("user_id");
    if (userId) {
      params.append("user_id", userId);
    }

    if (filters?.country) {
      params.append("country", filters.country);
    }
    if (filters?.dateFrom) {
      params.append("date_from", filters.dateFrom);
    }
    if (filters?.dateTo) {
      params.append("date_to", filters.dateTo);
    }

    const response = await fetch(
      `${API_BASE_URL}/api/reports?${params.toString()}`
    );

    if (!response.ok) {
      throw new Error("히스토리 조회 실패");
    }

    const data: ApiReportListResponse = await response.json();
    return {
      reports: data.reports.map(convertReportListItem),
      total: data.total || data.reports.length,
    };
  } catch (error) {
    console.error("getHistory error:", error);
    return { reports: [], total: 0 };
  }
};

/**
 * 리포트 삭제
 */
export const deleteReport = async (id: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/reports/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("리포트 삭제 실패");
    }

    return true;
  } catch (error) {
    console.error("deleteReport error:", error);
    return false;
  }
};

/**
 * PDF 다운로드
 */
export const downloadPdf = async (id: string, options?: { isExpert?: boolean; expertComment?: string }): Promise<void> => {
  try {
    const params = new URLSearchParams();
    if (options?.isExpert) {
      params.append('is_expert', 'true');
    }
    if (options?.expertComment) {
      params.append('expert_comment', options.expertComment);
    }
    const url = `${API_BASE_URL}/api/reports/${id}/pdf?${params.toString()}`;

    // 새 탭에서 PDF 다운로드 (브라우저가 처리)
    window.open(url, "_blank");
  } catch (error) {
    console.error("downloadPdf error:", error);
    alert("PDF 다운로드 중 오류가 발생했습니다.");
  }
};
