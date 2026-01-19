import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { getReport, downloadPdf } from "../services/api";
import { AnalysisReport, RegulationCheck } from "../types";
import { useToast } from "../contexts/ToastContext";
import ExpertView from '../components/ExpertView';
import NutritionTable from '../components/NutritionTable';
import RiskGauge from '../components/RiskGauge';
import Confetti from '../components/Confetti';
import QRCodeModal from '../components/QRCodeModal';
import { ReportSkeleton } from '../components/Skeleton';
import Tooltip from '../components/Tooltip';
import SocialShare from '../components/SocialShare';

const ReportPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isExpertView, setIsExpertView] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set([0]));
  const [showOcrText, setShowOcrText] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);

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

  // 새로운 리포트 로드 시 축하 애니메이션
  useEffect(() => {
    if (report && !loading) {
      const shownKey = `confetti_shown_${report.id}`;
      if (!sessionStorage.getItem(shownKey)) {
        setShowConfetti(true);
        sessionStorage.setItem(shownKey, 'true');
        setTimeout(() => setShowConfetti(false), 3500);
      }
    }
  }, [report, loading]);

  const handleDownloadPdf = (isExpert: boolean = false) => {
    if (!report) return;
    downloadPdf(report.id, { isExpert });
    showToast("info", `${isExpert ? '전문가용' : '일반'} PDF 다운로드가 시작됩니다.`);
  };

  const handleExportJson = () => {
    if (!report) return;
    const dataStr = JSON.stringify(report, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report_${report.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("success", "JSON 파일이 다운로드되었습니다.");
  };

  const handleShare = (isExpert: boolean = false) => {
    const urlObject = new URL(window.location.href);
    if (isExpert) urlObject.searchParams.set('view', 'expert');
    else urlObject.searchParams.delete('view');
    navigator.clipboard.writeText(urlObject.toString()).then(() => {
      showToast("success", `링크가 클립보드에 복사되었습니다!`)
    });
  };

  const toggleCard = (index: number) => {
    setExpandedCards(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="bg-background text-text-primary min-h-screen">
        <ReportSkeleton />
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

  const countryLabels: Record<string, string> = { US: "🇺🇸 미국", JP: "🇯🇵 일본", VN: "🇻🇳 베트남", EU: "🇪🇺 유럽연합", CN: "🇨🇳 중국" };

  // 위험도 카운트
  const highCount = report.regulations.filter(r => r.severity === 'HIGH').length;
  const mediumCount = report.regulations.filter(r => r.severity === 'MEDIUM').length;
  const lowCount = report.regulations.filter(r => r.severity === 'LOW' || !r.severity).length;

  const getSeverityStyle = (severity?: string) => {
    switch (severity) {
      case 'HIGH': return { bg: 'bg-red-500/10', border: 'border-red-500', text: 'text-red-600 dark:text-red-400', icon: 'error', label: '높음' };
      case 'MEDIUM': return { bg: 'bg-amber-500/10', border: 'border-amber-500', text: 'text-amber-600 dark:text-amber-400', icon: 'warning', label: '중간' };
      default: return { bg: 'bg-emerald-500/10', border: 'border-emerald-500', text: 'text-emerald-600 dark:text-emerald-400', icon: 'check_circle', label: '낮음' };
    }
  };

  return (
    <div className="bg-background text-text-primary min-h-screen">
      <Confetti isActive={showConfetti} />
      <QRCodeModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        url={window.location.href}
        title="리포트 QR 공유"
      />
      <main className="flex flex-col flex-1 max-w-5xl mx-auto w-full px-4 py-6 gap-6">
        {/* 헤더 */}
        <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-primary/10 text-primary px-2.5 py-1 rounded-md text-xs font-bold">{countryLabels[report.country]}</span>
              <span className="bg-card-sub-bg text-text-secondary px-2.5 py-1 rounded-md text-xs font-medium">{report.ocrEngine.toUpperCase()}</span>
              <span className="text-text-muted text-xs">#{report.id}</span>
            </div>
            <h1 className="text-2xl font-bold text-text-primary">분석 결과</h1>
            <p className="text-sm text-text-secondary mt-1">{report.createdAt.split(" ")[0]} 생성</p>
          </div>
          <div className="flex gap-2 no-print">
            <Tooltip content={isExpertView ? '일반 보기로 전환' : '전문가 보기로 전환'}>
              <button onClick={() => setIsExpertView(!isExpertView)} className="flex items-center gap-1.5 rounded-lg h-9 px-4 bg-card border border-card-border text-text-primary text-sm hover:bg-card-sub-bg transition-colors">
                <span className="material-symbols-outlined text-base">{isExpertView ? 'visibility' : 'military_tech'}</span>
                <span className="hidden sm:inline">{isExpertView ? '일반' : '전문가'}</span>
              </button>
            </Tooltip>
            <Tooltip content="QR 코드로 공유">
              <button onClick={() => setShowQRModal(true)} className="flex items-center gap-1.5 rounded-lg h-9 px-4 bg-card border border-card-border text-text-primary text-sm hover:bg-card-sub-bg transition-colors">
                <span className="material-symbols-outlined text-base">qr_code_2</span>
              </button>
            </Tooltip>
            <Tooltip content="링크 복사">
              <button onClick={() => handleShare(isExpertView)} className="flex items-center gap-1.5 rounded-lg h-9 px-4 bg-card border border-card-border text-text-primary text-sm hover:bg-card-sub-bg transition-colors">
                <span className="material-symbols-outlined text-base">share</span>
              </button>
            </Tooltip>
            <Tooltip content="JSON으로 내보내기">
              <button onClick={handleExportJson} className="flex items-center gap-1.5 rounded-lg h-9 px-4 bg-card border border-card-border text-text-primary text-sm hover:bg-card-sub-bg transition-colors">
                <span className="material-symbols-outlined text-base">data_object</span>
              </button>
            </Tooltip>
            <Tooltip content="PDF로 다운로드">
              <button onClick={() => handleDownloadPdf(isExpertView)} className="flex items-center gap-1.5 rounded-lg h-9 px-4 bg-primary text-white text-sm hover:bg-primary-hover transition-colors">
                <span className="material-symbols-outlined text-base">download</span>
                <span className="hidden sm:inline">PDF</span>
              </button>
            </Tooltip>
          </div>
        </section>

        {isExpertView ? (<ExpertView report={report} />) : (
          <>
            {/* 위험도 게이지 */}
            <RiskGauge highCount={highCount} mediumCount={mediumCount} lowCount={lowCount} />

            {/* 요약 대시보드 */}
            <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className={`rounded-xl p-4 ${highCount > 0 ? 'bg-red-500/10 border border-red-500/30' : 'bg-card border border-card-border'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`material-symbols-outlined text-lg ${highCount > 0 ? 'text-red-500' : 'text-text-muted'}`}>error</span>
                  <span className="text-xs text-text-secondary">높은 위험</span>
                </div>
                <p className={`text-2xl font-bold ${highCount > 0 ? 'text-red-600 dark:text-red-400' : 'text-text-muted'}`}>{highCount}</p>
              </div>
              <div className={`rounded-xl p-4 ${mediumCount > 0 ? 'bg-amber-500/10 border border-amber-500/30' : 'bg-card border border-card-border'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`material-symbols-outlined text-lg ${mediumCount > 0 ? 'text-amber-500' : 'text-text-muted'}`}>warning</span>
                  <span className="text-xs text-text-secondary">주의 필요</span>
                </div>
                <p className={`text-2xl font-bold ${mediumCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-text-muted'}`}>{mediumCount}</p>
              </div>
              <div className="rounded-xl p-4 bg-emerald-500/10 border border-emerald-500/30">
                <div className="flex items-center gap-2 mb-1">
                  <span className="material-symbols-outlined text-lg text-emerald-500">check_circle</span>
                  <span className="text-xs text-text-secondary">정상</span>
                </div>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{lowCount}</p>
              </div>
              <div className="rounded-xl p-4 bg-card border border-card-border">
                <div className="flex items-center gap-2 mb-1">
                  <span className="material-symbols-outlined text-lg text-primary">science</span>
                  <span className="text-xs text-text-secondary">알레르겐</span>
                </div>
                <p className="text-2xl font-bold text-primary">{report.allergens.length}</p>
              </div>
            </section>

            {/* 알레르기 태그 */}
            {report.allergens.length > 0 && (
              <section className="flex flex-wrap gap-2">
                {report.allergens.map((allergen, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 bg-red-500/10 text-red-700 dark:text-red-300 border border-red-500/20 px-3 py-1.5 rounded-full text-sm font-medium">
                    <span className="material-symbols-outlined text-sm">warning</span>
                    {allergen}
                  </span>
                ))}
              </section>
            )}

            {/* 규정 검토 결과 */}
            <section className="bg-card border border-card-border rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-card-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">gavel</span>
                  <h3 className="font-semibold text-text-primary">규정 검토 결과</h3>
                </div>
                <span className="text-xs text-text-muted bg-card-sub-bg px-2 py-1 rounded">{report.regulations.length}건</span>
              </div>

              <div className="divide-y divide-card-border">
                {report.regulations.map((reg, i) => {
                  const style = getSeverityStyle(reg.severity);
                  const isExpanded = expandedCards.has(i);
                  return (
                    <div key={i} className={`${style.bg}`}>
                      <button
                        onClick={() => toggleCard(i)}
                        className="w-full flex items-start gap-3 p-4 text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                      >
                        <span className={`material-symbols-outlined text-xl mt-0.5 ${style.text}`}>{style.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs font-bold ${style.text}`}>{style.label}</span>
                          </div>
                          <p className="font-medium text-text-primary text-sm leading-relaxed">{reg.title}</p>
                        </div>
                        <span className={`material-symbols-outlined text-text-muted transition-transform ${isExpanded ? 'rotate-180' : ''}`}>expand_more</span>
                      </button>

                      {isExpanded && (
                        <div className="px-4 pb-4 pl-12 space-y-3">
                          <p className="text-sm text-text-secondary leading-relaxed">{reg.description}</p>

                          {reg.evidence?.matched && reg.evidence.matched.length > 0 && (
                            <div className="bg-background rounded-lg p-3 border border-card-border">
                              <p className="text-xs font-semibold text-text-muted mb-2">OCR 증거</p>
                              <div className="space-y-1">
                                {reg.evidence.matched.map((line, j) => (
                                  <p key={j} className="text-xs text-text-secondary font-mono">"{line}"</p>
                                ))}
                              </div>
                              {reg.evidence?.hint && (
                                <p className="text-xs text-text-muted mt-2 italic">{reg.evidence.hint}</p>
                              )}
                            </div>
                          )}

                          {reg.next_step && (
                            <div className="bg-primary/10 rounded-lg p-3 flex items-start gap-2">
                              <span className="material-symbols-outlined text-primary text-sm mt-0.5">lightbulb</span>
                              <p className="text-sm text-primary font-medium">{reg.next_step}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* 법적 고지 */}
              <div className="px-4 py-3 bg-amber-500/5 border-t border-amber-500/20">
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  <span className="font-semibold">참고:</span> 본 결과는 법적 자문이 아닙니다. 정확한 판단을 위해 전문가 상담을 권장합니다.
                </p>
              </div>
            </section>

            {/* OCR 텍스트 (토글) */}
            <section className="bg-card border border-card-border rounded-2xl overflow-hidden">
              <button
                onClick={() => setShowOcrText(!showOcrText)}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-card-sub-bg/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">description</span>
                  <h3 className="font-semibold text-text-primary">OCR 추출 텍스트</h3>
                </div>
                <span className={`material-symbols-outlined text-text-muted transition-transform ${showOcrText ? 'rotate-180' : ''}`}>expand_more</span>
              </button>

              {showOcrText && (
                <div className="px-5 pb-5">
                  <div className="flex justify-end mb-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(report.ocrText);
                        showToast('success', 'OCR 텍스트가 복사되었습니다.');
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-primary bg-card border border-card-border rounded-lg hover:border-primary transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">content_copy</span>
                      복사
                    </button>
                  </div>
                  <div className="max-h-64 overflow-y-auto bg-card-sub-bg p-4 rounded-lg font-mono text-xs leading-relaxed text-text-secondary whitespace-pre-wrap">
                    {report.ocrText}
                  </div>
                </div>
              )}
            </section>

            {/* 국가별 영양성분표 */}
            {report.nutrients && report.nutrients.length > 0 && (
              <NutritionTable
                country={report.country}
                nutrition={report.nutrients.reduce((acc, n) => {
                  acc[n.name] = {
                    value: n.amount,
                    unit: n.percent ? '' : '',
                  };
                  return acc;
                }, {} as Record<string, { value: string | number; unit: string }>)}
              />
            )}

            {/* 마케팅 제안 */}
            {report.marketing.localizedDescription && (
              <section className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-primary/20 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">auto_awesome</span>
                  <h3 className="font-semibold text-text-primary">AI 마케팅 제안</h3>
                </div>

                <div className="p-5 space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-primary mb-2">현지화 상품 설명</p>
                    <p className="text-sm text-text-primary leading-relaxed">{report.marketing.localizedDescription}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white/50 dark:bg-black/20 rounded-xl p-4">
                      <p className="text-xs font-semibold text-text-muted mb-2 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">share</span> SNS 문구
                      </p>
                      <p className="text-sm text-text-primary italic">{report.marketing.snsCopy}</p>
                    </div>
                    <div className="bg-white/50 dark:bg-black/20 rounded-xl p-4">
                      <p className="text-xs font-semibold text-text-muted mb-2 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">handshake</span> 바이어 피치
                      </p>
                      <p className="text-sm text-text-primary">{report.marketing.buyerPitch}</p>
                    </div>
                  </div>

                  {/* 소셜 공유 */}
                  <div className="pt-4 border-t border-primary/20">
                    <SocialShare
                      url={window.location.href}
                      title={`K-Food Export Passport - ${countryLabels[report.country]} 수출 분석 리포트`}
                      description={report.marketing.localizedDescription}
                    />
                  </div>
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default ReportPage;
