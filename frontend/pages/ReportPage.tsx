import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getReport, downloadPdf } from "../services/api";
import { AnalysisReport } from "../types";
import { useToast } from "../contexts/ToastContext";

const ReportPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadReport = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(false);
    try {
      const data = await getReport(id);
      if (data) {
        setReport(data);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
      showToast("error", "리포트를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }, [id, showToast]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const handleDownloadPdf = () => {
    downloadPdf(report!.id);
    showToast("info", "PDF 다운로드가 시작됩니다.");
  };

  const handleShare = async () => {
    const url = window.location.href;

    try {
      await navigator.clipboard.writeText(url);
      showToast("success", "링크가 클립보드에 복사되었습니다!");
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      showToast("success", "링크가 클립보드에 복사되었습니다!");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3">
        <span className="material-symbols-outlined text-4xl text-primary animate-spin">
          progress_activity
        </span>
        <p className="text-gray-500">리포트를 불러오는 중...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <span className="material-symbols-outlined text-5xl text-red-400">
          error_outline
        </span>
        <p className="text-gray-600 text-lg">리포트를 찾을 수 없습니다.</p>
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/history")}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            목록으로 돌아가기
          </button>
          <button
            onClick={loadReport}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">refresh</span>
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  const countryLabels: Record<string, string> = {
    US: "미국 (USA)",
    JP: "일본 (Japan)",
    VN: "베트남 (Vietnam)",
    EU: "유럽연합 (EU)",
    CN: "중국 (China)",
  };

  return (
    <div className="bg-bg-report min-h-screen">
      <main className="flex flex-col flex-1 max-w-[1000px] mx-auto w-full px-4 md:px-10 py-8 gap-8">
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-gray-200">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 mb-2 text-sm text-green-700 font-semibold">
              <span className="material-symbols-outlined text-lg">
                verified_user
              </span>
              <span>
                {report.userEmail
                  ? `✔ Your Analysis Report Linked to: ${report.userEmail}`
                  : "✔ Your Analysis Report. This report is stored locally in this browser."}
              </span>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded text-xs font-bold uppercase">
                {countryLabels[report.country]}
              </span>
              <span className="bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-tight">
                {report.ocrEngine.toUpperCase()} OCR
              </span>
            </div>
            <h1 className="text-3xl font-black text-[#121617] leading-tight">
              분석 결과 리포트
            </h1>
            <div className="flex items-center gap-4 text-sm text-[#677c83]">
              <span className="font-medium">리포트 ID: {report.id}</span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">
                  calendar_today
                </span>
                생성일: {report.createdAt.split(" ")[0]}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 no-print">
            <button
              onClick={() => navigate("/history")}
              className="flex items-center justify-center gap-2 rounded-lg h-11 px-6 bg-white border border-[#dde2e4] text-[#121617] font-bold text-sm hover:bg-gray-50 transition-colors"
            >
              <span className="material-symbols-outlined text-lg">
                arrow_back
              </span>
              <span>목록으로</span>
            </button>
            <button
              onClick={() => navigate("/analyze")}
              className="flex items-center justify-center gap-2 rounded-lg h-11 px-6 bg-white border border-[#dde2e4] text-[#121617] font-bold text-sm hover:bg-gray-50 transition-colors"
            >
              <span className="material-symbols-outlined text-lg">refresh</span>
              <span>새 분석</span>
            </button>
            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-2 rounded-lg h-11 px-6 bg-white border border-[#dde2e4] text-[#121617] font-bold text-sm hover:bg-gray-50 transition-colors"
            >
              <span className="material-symbols-outlined text-lg">share</span>
              <span>공유</span>
            </button>
            <button
              onClick={handleDownloadPdf}
              className="flex items-center justify-center gap-2 rounded-lg h-11 px-6 bg-primary text-white font-bold text-sm shadow-md hover:bg-opacity-90 transition-all"
            >
              <span className="material-symbols-outlined text-lg">
                file_download
              </span>
              <span>PDF 다운로드</span>
            </button>
          </div>
        </section>

        <section className="bg-white rounded-xl border border-[#dde2e4] shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-[#dde2e4] bg-gray-50/50 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">
              description
            </span>
            <h3 className="font-bold text-[#121617]">OCR 추출 텍스트</h3>
          </div>
          <div className="p-6">
            <div className="bg-gray-50 p-4 rounded-lg border border-dashed border-gray-200 font-mono text-sm leading-relaxed text-[#4a5a5e] whitespace-pre-wrap">
              {report.ocrText}
            </div>
          </div>
        </section>

        <section className="bg-white rounded-xl border border-[#dde2e4] shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-[#dde2e4] bg-gray-50/50 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">
              science
            </span>
            <h3 className="font-bold text-[#121617]">성분 및 알레르기</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">
                  추출 성분 리스트
                </h4>
                <div className="flex flex-wrap gap-2">
                  {report.ingredients.map((ing, i) => (
                    <span
                      key={i}
                      className="bg-gray-100 px-3 py-1 rounded-full text-sm"
                    >
                      {ing}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-bold text-red-500 uppercase tracking-wider mb-3">
                  알레르기 정보
                </h4>
                <div className="flex flex-wrap gap-2">
                  {report.allergens.length > 0 ? (
                    report.allergens.map((all, i) => (
                      <span
                        key={i}
                        className="bg-red-50 text-red-700 border border-red-100 px-3 py-1 rounded-full text-sm font-bold"
                      >
                        {all}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400 text-sm">
                      발견된 알레르기 없음
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {report.nutrients.length > 0 && (
          <section className="bg-white rounded-xl border border-[#dde2e4] shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-[#dde2e4] bg-gray-50/50 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">
                nutrition
              </span>
              <h3 className="font-bold text-[#121617]">
                영양성분 정보 (Parsed)
              </h3>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 font-bold">영양소 (Nutrient)</th>
                      <th className="px-4 py-3 font-bold">함량 (Amount)</th>
                      <th className="px-4 py-3 font-bold text-right">
                        1일 영양성분 기준치 비율 (%)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {report.nutrients.map((n, i) => (
                      <tr key={i}>
                        <td className="px-4 py-3 font-medium">
                          {n.name} ({n.nameEn})
                        </td>
                        <td className="px-4 py-3">{n.amount}</td>
                        <td className="px-4 py-3 text-right">
                          {n.percent || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        <section className="bg-white dark:bg-gray-800 rounded-xl border border-[#dde2e4] dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-[#dde2e4] dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">
              gavel
            </span>
            <h3 className="font-bold text-[#121617] dark:text-gray-200">
              {countryLabels[report.country]} 수출 규정 검토 결과
            </h3>
          </div>
          <div className="p-4 md:p-6">
            <ul className="space-y-3">
              {report.regulations.length > 0 ? (
                report.regulations.map((reg, i) => (
                  <li
                    key={i}
                    className="flex gap-4 p-4 rounded-lg bg-white dark:bg-gray-700/50 even:bg-gray-50/50 dark:even:bg-gray-700/80 border border-gray-100 dark:border-gray-700"
                  >
                    <span
                      className={`material-symbols-outlined shrink-0 mt-1 ${
                        reg.type === "warning"
                          ? "text-amber-500"
                          : "text-blue-500"
                      }`}
                    >
                      {reg.type === "warning" ? "warning" : "info"}
                    </span>
                    <div className="text-sm w-full">
                      <p className="font-bold text-[#121617] dark:text-gray-200">
                        {reg.title}
                      </p>
                      <p className="text-[#677c83] dark:text-gray-400 mt-1 break-keep">
                        {reg.description}
                      </p>

                      {(reg.regulation || reg.article || reg.reason) && (
                        <div className="mt-3 pt-3 border-t border-dashed border-gray-200 dark:border-gray-600">
                          <h5 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase mb-2">
                            근거 정보
                          </h5>
                          <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
                            {reg.regulation && (
                              <p>
                                <strong className="font-semibold text-gray-600 dark:text-gray-300">
                                  관련 규정:
                                </strong>{" "}
                                {reg.regulation}
                              </p>
                            )}
                            {reg.article && (
                              <p>
                                <strong className="font-semibold text-gray-600 dark:text-gray-300">
                                  세부 조항:
                                </strong>{" "}
                                {reg.article}
                              </p>
                            )}
                            {reg.reason && (
                              <p>
                                <strong className="font-semibold text-gray-600 dark:text-gray-300">
                                  사유:
                                </strong>{" "}
                                {reg.reason}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </li>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm px-4">
                  검토 결과 데이터가 없습니다.
                </p>
              )}
            </ul>
          </div>
        </section>

        {report.marketing.localizedDescription && (
          <section className="bg-white rounded-xl border border-[#dde2e4] shadow-sm overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-[#dde2e4] bg-gray-50/50 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">
                auto_awesome
              </span>
              <h3 className="font-bold text-[#121617]">AI 기반 마케팅 제안</h3>
            </div>
            <div className="p-6 flex flex-col gap-8">
              <div>
                <h4 className="text-sm font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">
                    edit_note
                  </span>{" "}
                  현지화 상품 설명
                </h4>
                <p className="text-sm leading-relaxed text-[#121617] break-keep">
                  {report.marketing.localizedDescription}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-sm font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">
                      share
                    </span>{" "}
                    SNS 홍보 문구
                  </h4>
                  <div className="bg-primary/5 p-4 rounded-lg text-sm italic break-keep">
                    {report.marketing.snsCopy}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">
                      record_voice_over
                    </span>{" "}
                    바이어 피치 텍스트
                  </h4>
                  <div className="bg-primary/5 p-4 rounded-lg text-sm break-keep">
                    {report.marketing.buyerPitch}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default ReportPage;
