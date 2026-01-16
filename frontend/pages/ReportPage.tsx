import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { getReport, downloadPdf } from "../services/api";
import { AnalysisReport, RegulationCheck } from "../types";
import { useToast } from "../contexts/ToastContext";
import ExpertView from '../components/ExpertView';

const ReportPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isExpertView, setIsExpertView] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<number | null>(null);
  const [hoveredRisk, setHoveredRisk] = useState<RegulationCheck | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setIsExpertView(params.get('view') === 'expert');
  }, [location.search]);

  const loadReport = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(false);
    try {
      const data = await getReport(id);
      setReport(data || null);
      if (!data) setError(true);
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

  const handleDownloadPdf = (isExpert: boolean = false) => {
    if (!report) return;
    downloadPdf(report.id, { isExpert });
    showToast("info", `${isExpert ? '전문가용' : '일반'} PDF 다운로드가 시작됩니다.`);
  };

  const handleShare = (isExpert: boolean = false) => {
    const urlObject = new URL(window.location.href);
    if (isExpert) urlObject.searchParams.set('view', 'expert');
    else urlObject.searchParams.delete('view');
    
    navigator.clipboard.writeText(urlObject.toString()).then(() => {
      showToast("success", `링크가 클립보드에 복사되었습니다!`)
    });
  };

  const RiskIndicator: React.FC<{ level: 'High' | 'Medium' | 'Low' }> = ({ level }) => {
    const levelMap = {
      High: { text: '높음', color: 'text-red-500 dark:text-red-400', icon: 'error' },
      Medium: { text: '중간', color: 'text-amber-500 dark:text-amber-400', icon: 'warning' },
      Low: { text: '낮음', color: 'text-sky-500 dark:text-sky-400', icon: 'info' },
    };
    const { text, color, icon } = levelMap[level];
    return (
      <div className={`flex items-center gap-1.5 text-xs font-bold ${color}`}>
        <span className="material-symbols-outlined text-sm">{icon}</span>
        <span>{text}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3 bg-background text-text-primary">
        <span className="material-symbols-outlined text-4xl text-primary animate-spin">progress_activity</span>
        <p className="text-text-secondary">리포트를 불러오는 중...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-background text-text-primary">
        <span className="material-symbols-outlined text-5xl text-red-500">error_outline</span>
        <p className="text-text-primary text-lg">리포트를 찾을 수 없습니다.</p>
        <div className="flex gap-3 mt-4">
          <button onClick={() => navigate("/history")} className="h-11 px-6 rounded-lg bg-card border border-card-border text-text-primary hover:bg-card-sub-bg transition-colors">목록으로 돌아가기</button>
          <button onClick={loadReport} className="h-11 px-6 rounded-lg bg-primary text-white hover:bg-primary-hover transition-colors flex items-center gap-2"><span className="material-symbols-outlined text-sm">refresh</span>다시 시도</button>
        </div>
      </div>
    );
  }

  const countryLabels: Record<string, string> = { US: "미국 (USA)", JP: "일본 (Japan)", VN: "베트남 (Vietnam)", EU: "유럽연합 (EU)", CN: "중국 (China)" };

  return (
    <div className="bg-background text-text-primary min-h-screen">
      <main className="flex flex-col flex-1 max-w-7xl mx-auto w-full px-4 py-8 gap-8">
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-card-border">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 mb-2 text-sm text-green-600 dark:text-green-400 font-semibold"><span className="material-symbols-outlined text-lg">verified_user</span><span>{report.userEmail ? `✔ 리포트가 이메일에 연결됨: ${report.userEmail}` : "✔ 브라우저에 저장된 분석 리포트입니다."}</span></div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded text-xs font-bold uppercase">{countryLabels[report.country]}</span>
              <span className="bg-card-sub-bg text-text-secondary px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-tight">{report.ocrEngine.toUpperCase()} OCR</span>
            </div>
            <h1 className="text-3xl font-black text-text-primary leading-tight">분석 결과 리포트</h1>
            <div className="flex items-center gap-4 text-sm text-text-secondary"><span className="font-medium">리포트 ID: {report.id}</span><span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">calendar_today</span>생성일: {report.createdAt.split(" ")[0]}</span></div>
          </div>
          <div className="flex flex-wrap gap-3 no-print">
            <button onClick={() => setIsExpertView(!isExpertView)} className="flex items-center justify-center gap-2 rounded-lg h-11 px-6 bg-card border border-card-border text-text-primary font-bold text-sm hover:bg-card-sub-bg transition-colors"><span className="material-symbols-outlined text-lg">{isExpertView ? 'visibility' : 'military_tech'}</span><span>{isExpertView ? '일반 뷰' : '전문가 뷰'}</span></button>
            <button onClick={() => handleShare(isExpertView)} className="flex items-center justify-center gap-2 rounded-lg h-11 px-6 bg-card border border-card-border text-text-primary font-bold text-sm hover:bg-card-sub-bg transition-colors"><span className="material-symbols-outlined text-lg">share</span><span>공유</span></button>
            <button onClick={() => handleDownloadPdf(isExpertView)} className="flex items-center justify-center gap-2 rounded-lg h-11 px-6 bg-primary text-white font-bold text-sm shadow-lg hover:bg-primary-hover transition-all"><span className="material-symbols-outlined text-lg">file_download</span><span>PDF 다운로드</span></button>
          </div>
        </section>

        {isExpertView ? (<ExpertView report={report} />) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 flex flex-col gap-8">
                <section className="bg-card border border-card-border rounded-2xl shadow-lg dark:backdrop-blur-lg">
                  <div className="px-6 py-4 border-b border-card-border bg-card-sub-bg/30 flex items-center gap-3"><span className="material-symbols-outlined text-primary">gavel</span><h3 className="font-bold text-text-primary">{countryLabels[report.country]} 수출 규정 검토 결과</h3></div>
                  <div className="p-4 border-b border-card-border bg-amber-500/10"><div className="flex items-start gap-3"><span className="material-symbols-outlined text-amber-500 dark:text-amber-400 mt-0.5">info</span><div><p className="text-sm font-bold text-amber-800 dark:text-amber-300">본 결과는 참고 정보이며, 법적 자문이 아닙니다.</p><p className="text-xs text-amber-700 dark:text-amber-400 mt-1">This report is for preliminary compliance review support and does not constitute legal advice.</p></div></div></div>
                  <div className="p-4 md:p-6"><ul className="space-y-3">
                    {report.regulations.length > 0 ? (report.regulations.map((reg, i) => {
                      const riskLevel = reg.confidence >= 0.8 ? 'Low' : reg.confidence >= 0.6 ? 'Medium' : 'High';
                      const riskColor = riskLevel === 'High' ? 'red-500' : riskLevel === 'Medium' ? 'amber-500' : 'sky-500';
                      const isOpen = openAccordion === i;
                      return (
                        <li key={i} className={`border-l-4 bg-card-sub-bg rounded-r-lg overflow-hidden border-${riskColor}`} onMouseEnter={() => setHoveredRisk(reg)} onMouseLeave={() => setHoveredRisk(null)}>
                          <button onClick={() => setOpenAccordion(isOpen ? null : i)} className="w-full flex items-center justify-between p-4 hover:bg-card-sub-bg/50">
                            <div className="flex items-center gap-3"><RiskIndicator level={riskLevel} /><span className="font-semibold text-text-primary text-left">{reg.title}</span></div>
                            <div className="flex items-center gap-4 text-text-secondary"><span className={`material-symbols-outlined transition-transform ${isOpen ? 'rotate-180' : ''}`}>expand_more</span></div>
                          </button>
                          {isOpen && (
                            <div className="p-4 bg-background border-t border-card-border"><p className="text-sm text-text-secondary mt-1 mb-4 break-keep">{reg.description}</p>
                              <div className="space-y-4">
                                {(reg.details.regulation || reg.details.article) && (<div><h5 className="text-xs font-bold text-text-muted uppercase mb-1.5">규정 근거</h5><div className="text-xs text-text-secondary"><p>{reg.details.regulation}: {reg.details.article}</p></div></div>)}
                                {reg.evidence.matched.length > 0 && (<div><h5 className="text-xs font-bold text-text-muted uppercase mb-1.5">OCR 증거</h5><div className="space-y-1 text-xs text-text-secondary font-mono bg-background p-2 rounded">{reg.evidence.matched.map((line, j) => (<p key={j}>- "{line}"</p>))}</div><p className="text-xs text-text-muted mt-1">Hint: {reg.evidence.hint}</p></div>)}
                                {reg.next_step && (<div className="p-4 rounded-lg bg-primary/10 mt-4"><h5 className="text-xs font-bold text-primary uppercase mb-1.5 flex items-center gap-1"><span className="material-symbols-outlined text-sm">recommend</span>권장 조치</h5><p className="text-sm text-primary font-semibold">{reg.next_step}</p></div>)}
                              </div>
                            </div>
                          )}
                        </li>
                      );
                    })) : (<p className="text-text-secondary text-sm px-4">검토 결과 데이터가 없습니다.</p>)}
                  </ul></div>
                </section>

                {report.nutrients.length > 0 && (
                  <section className="bg-card border border-card-border rounded-2xl shadow-lg dark:backdrop-blur-lg">
                    <div className="px-6 py-4 border-b border-card-border bg-card-sub-bg/30 flex items-center gap-3"><span className="material-symbols-outlined text-primary">nutrition</span><h3 className="font-bold text-text-primary">영양성분 정보</h3></div>
                    <div className="p-6"><div className="overflow-x-auto">
                      <table className="w-full text-sm text-left"><thead className="text-xs text-text-secondary uppercase bg-card-sub-bg"><tr><th className="px-4 py-3 font-semibold">영양소</th><th className="px-4 py-3 font-semibold">함량</th><th className="px-4 py-3 font-semibold text-right">1일 기준치(DV)</th></tr></thead>
                        <tbody className="divide-y divide-card-border">
                          {report.nutrients.map((n, i) => (
                            <tr key={i} className="hover:bg-card-sub-bg/50">
                              <td className="px-4 py-3 font-medium text-text-primary">{n.name} ({n.nameEn})</td>
                              <td className="px-4 py-3 text-text-secondary">{n.amount}</td>
                              <td className="px-4 py-3 text-right text-text-secondary">
                                <div className="flex items-center justify-end gap-2">
                                  <span>{n.percent || "-"}%</span>
                                  <div className="w-20 h-2 bg-card-sub-bg rounded-full overflow-hidden"><div className="h-full bg-primary" style={{ width: `${n.percent || 0}%` }}></div></div>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div></div>
                  </section>
                )}
              </div>

              <div className="lg:col-span-1 flex flex-col gap-8">
                <section className="bg-card border border-card-border rounded-2xl shadow-lg dark:backdrop-blur-lg">
                  <div className="px-6 py-4 border-b border-card-border bg-card-sub-bg/30 flex items-center gap-3"><span className="material-symbols-outlined text-primary">science</span><h3 className="font-bold text-text-primary">성분 및 알레르기</h3></div>
                  <div className="p-6 space-y-6">
                    <div><h4 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-3">추출 성분 리스트</h4><div className="flex flex-wrap gap-2">{report.ingredients.map((ing, i) => (<span key={i} className="bg-card-sub-bg px-3 py-1 rounded-full text-sm text-text-secondary">{ing}</span>))}</div></div>
                    <div><h4 className="text-sm font-bold text-red-500 dark:text-red-400 uppercase tracking-wider mb-3">알레르기 정보</h4><div className="flex flex-wrap gap-2">{report.allergens.length > 0 ? (report.allergens.map((all, i) => (<span key={i} className="bg-red-500/10 text-red-700 dark:text-red-300 border border-red-500/20 px-3 py-1 rounded-full text-sm font-bold">{all}</span>))) : (<span className="text-text-muted text-sm">발견된 알레르기 없음</span>)}</div></div>
                  </div>
                </section>
                
                <section className="bg-card border border-card-border rounded-2xl shadow-lg dark:backdrop-blur-lg">
                  <div className="px-6 py-4 border-b border-card-border bg-card-sub-bg/30 flex items-center gap-3"><span className="material-symbols-outlined text-primary">description</span><h3 className="font-bold text-text-primary">OCR 추출 텍스트</h3></div>
                  <div className="p-6"><div className="max-h-96 overflow-y-auto bg-card-sub-bg p-4 rounded-lg border border-dashed border-card-border font-mono text-sm leading-relaxed text-text-secondary whitespace-pre-wrap">{report.ocrText.split('\n').map((line, i) => (<span key={i} data-sentence-index={i} className={`${hoveredRisk?.evidence.matched.includes(line) ? 'bg-yellow-400/20' : ''}`}>{line}<br /></span>))}</div></div>
                </section>
              </div>
            </div>

            {report.marketing.localizedDescription && (
              <div className="space-y-8">
                <section className="bg-card border border-card-border rounded-2xl shadow-lg dark:backdrop-blur-lg">
                  <div className="px-6 py-4 border-b border-card-border bg-card-sub-bg/30 flex items-center gap-3"><span className="material-symbols-outlined text-primary">auto_awesome</span><h3 className="font-bold text-text-primary">AI 기반 마케팅 제안</h3></div>
                  <div className="p-6"><h4 className="text-sm font-bold text-text-muted uppercase mb-3 flex items-center gap-2"><span className="material-symbols-outlined text-base">edit_note</span> 현지화 상품 설명</h4><p className="text-sm leading-relaxed text-text-primary break-keep">{report.marketing.localizedDescription}</p></div>
                </section>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-card border border-card-border rounded-2xl shadow-lg dark:backdrop-blur-lg p-6">
                    <h4 className="text-sm font-bold text-text-muted uppercase mb-3 flex items-center gap-2"><span className="material-symbols-outlined text-base">share</span> SNS 홍보 문구</h4>
                    <div className="bg-primary/10 p-4 rounded-lg text-sm italic break-keep text-primary">{report.marketing.snsCopy}</div>
                  </div>
                  <div className="bg-card border border-card-border rounded-2xl shadow-lg dark:backdrop-blur-lg p-6">
                    <h4 className="text-sm font-bold text-text-muted uppercase mb-3 flex items-center gap-2"><span className="material-symbols-outlined text-base">record_voice_over</span> 바이어 피치 텍스트</h4>
                    <div className="bg-primary/10 p-4 rounded-lg text-sm break-keep text-primary">{report.marketing.buyerPitch}</div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default ReportPage;
