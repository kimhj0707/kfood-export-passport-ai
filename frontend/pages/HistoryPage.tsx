import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHistory, deleteReport, HistoryFilters, linkEmail, getUser, unlinkEmail } from '../services/api';
import { AnalysisReport } from '../types';
import { useToast } from '../contexts/ToastContext';
import { HistoryListSkeleton } from '../components/Skeleton';
import StatsDashboard from '../components/StatsDashboard';

const ITEMS_PER_PAGE = 9;

const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [history, setHistory] = useState<AnalysisReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [deleting, setDeleting] = useState<string | null>(null);

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [isLinking, setIsLinking] = useState(false);

  const [filterCountry, setFilterCountry] = useState<string>('');
  const [filterDateFrom, setFilterDateFrom] = useState<string>('');
  const [filterDateTo, setFilterDateTo] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchUserEmail = async () => {
      const userId = localStorage.getItem('user_id');
      if (userId) {
        const { email } = await getUser(userId);
        setUserEmail(email);
      }
    };
    fetchUserEmail();
  }, []);

  const loadHistory = useCallback(async (page: number) => {
    setLoading(true);
    setLoadError(false);
    try {
      const offset = page * ITEMS_PER_PAGE;
      const filters: HistoryFilters = {};
      if (filterCountry) filters.country = filterCountry;
      if (filterDateFrom) filters.dateFrom = filterDateFrom;
      if (filterDateTo) filters.dateTo = filterDateTo;
      const result = await getHistory(ITEMS_PER_PAGE, offset, filters);
      setHistory(result.reports);
      setTotal(result.total);
    } catch {
      setLoadError(true);
      showToast('error', '데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [filterCountry, filterDateFrom, filterDateTo, showToast]);

  useEffect(() => {
    // 이메일이 연결된 경우에만 히스토리 로드
    if (userEmail) {
      loadHistory(currentPage);
    }
  }, [currentPage, loadHistory, userEmail]);

  const handleApplyFilters = () => {
    setCurrentPage(0);
    loadHistory(0);
  };

  const handleClearFilters = () => {
    setFilterCountry('');
    setFilterDateFrom('');
    setFilterDateTo('');
    if (hasActiveFilters) {
      loadHistory(0);
    }
  };

  const hasActiveFilters = filterCountry || filterDateFrom || filterDateTo;

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('이 분석 결과를 삭제하시겠습니까?')) return;
    setDeleting(id);
    try {
      const success = await deleteReport(id);
      if (success) {
        showToast('success', '분석 결과가 삭제되었습니다.');
        loadHistory(currentPage);
      } else {
        showToast('error', '삭제에 실패했습니다.');
      }
    } catch {
      showToast('error', '삭제 중 오류가 발생했습니다.');
    } finally {
      setDeleting(null);
    }
  };

  const handleLinkEmail = async () => {
    const userId = localStorage.getItem('user_id');
    if (!userId || !emailInput) return;
    setIsLinking(true);
    try {
      await linkEmail(userId, emailInput);
      setUserEmail(emailInput);
      setShowEmailModal(false);
      showToast('success', '이메일이 성공적으로 연결되었습니다.');
    } catch (error) {
      showToast('error', (error as Error).message);
    } finally {
      setIsLinking(false);
    }
  };

  const handleUnlinkEmail = async () => {
    const userId = localStorage.getItem('user_id');
    if (!userId || !confirm('이메일 연결을 해제하시겠습니까?')) return;
    try {
      await unlinkEmail(userId);
      setUserEmail(null);
      showToast('success', '이메일 연결이 해제되었습니다.');
    } catch (error) {
      showToast('error', (error as Error).message);
    }
  };

  const countryFlags: Record<string, string> = { 'US': '🇺🇸', 'JP': '🇯🇵', 'VN': '🇻🇳', 'EU': '🇪🇺', 'CN': '🇨🇳' };
  const countryLabels: Record<string, string> = { 'US': '미국', 'JP': '일본', 'VN': '베트남', 'EU': '유럽연합', 'CN': '중국' };
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  return (
    <div className="flex flex-col flex-1 bg-background text-text-primary min-h-[calc(100vh-160px)]">
      <main className="w-full max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-text-primary text-3xl font-black tracking-tight leading-tight">내 분석 이력</h1>
            <p className="text-text-secondary text-lg">{userEmail ? `연결된 계정: ${userEmail}` : '이메일을 입력하여 분석 이력을 확인하세요.'}</p>
          </div>
          {userEmail && (
            <div className="flex flex-wrap items-center gap-3">
              <button onClick={handleUnlinkEmail} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-500/30 text-red-500 dark:text-red-400 hover:bg-red-500/10 transition-colors">
                <span className="material-symbols-outlined text-sm">link_off</span><span className="font-medium text-sm">이메일 연결 해제</span>
              </button>
              <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${hasActiveFilters ? 'border-primary bg-primary/10 text-primary' : 'border-card-border hover:bg-card-sub-bg text-text-secondary'}`}>
                <span className="material-symbols-outlined text-sm">filter_list</span><span className="font-medium text-sm">필터</span>
                {hasActiveFilters && <span className="w-2.5 h-2.5 bg-primary rounded-full"></span>}
              </button>
            </div>
          )}
        </div>

        {!userEmail && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="bg-card border border-card-border rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
              <span className="material-symbols-outlined text-6xl text-primary mb-4">mail</span>
              <h2 className="text-2xl font-bold text-text-primary mb-2">이메일로 로그인하세요</h2>
              <p className="text-text-secondary mb-6 leading-relaxed">
                이메일을 입력하면 분석 이력을 조회하고 여러 기기에서 동기화할 수 있습니다.
              </p>
              <input
                type="email"
                placeholder="user@example.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full rounded-lg border border-card-border bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 py-3 px-4 text-sm mb-4 focus:border-primary focus:ring-0"
              />
              <button
                onClick={handleLinkEmail}
                disabled={isLinking || !emailInput}
                className="w-full bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLinking ? '연결 중...' : '이메일로 계속하기'}
              </button>
              <p className="text-xs text-text-muted mt-4">🔒 비밀번호 없이 이메일만으로 이력을 관리합니다.</p>
            </div>
          </div>
        )}

        {userEmail && showFilters && (
          <div className="bg-card border border-card-border rounded-2xl p-4 mb-8 shadow-md">
            <h3 className="text-lg font-bold text-text-primary mb-4">필터 설정</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">대상 국가</label>
                <select value={filterCountry} onChange={(e) => setFilterCountry(e.target.value)} className="w-full rounded-lg border border-card-border bg-card-sub-bg text-text-primary py-2 px-3 text-sm focus:border-primary focus:ring-0">
                  <option value="">전체</option><option value="US">🇺🇸 미국</option><option value="JP">🇯🇵 일본</option><option value="VN">🇻🇳 베트남</option><option value="EU">🇪🇺 유럽연합</option><option value="CN">🇨🇳 중국</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">시작 날짜</label>
                <input type="date" value={filterDateFrom} onChange={(e) => setFilterDateFrom(e.target.value)} className="w-full rounded-lg border border-card-border bg-card-sub-bg text-text-primary py-2 px-3 text-sm focus:border-primary focus:ring-0" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">종료 날짜</label>
                <input type="date" value={filterDateTo} onChange={(e) => setFilterDateTo(e.target.value)} className="w-full rounded-lg border border-card-border bg-card-sub-bg text-text-primary py-2 px-3 text-sm focus:border-primary focus:ring-0" />
              </div>
              <div className="flex items-end gap-2">
                <button onClick={handleApplyFilters} className="flex-1 bg-primary text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors">적용</button>
                <button onClick={handleClearFilters} className="py-2 px-4 rounded-lg text-sm font-medium border border-card-border bg-card hover:bg-card-sub-bg text-text-secondary transition-colors">초기화</button>
              </div>
            </div>
            {hasActiveFilters && (
                <div className="mt-3 pt-3 border-t border-card-border flex items-center gap-2 text-sm text-text-muted">
                  <span className="material-symbols-outlined text-sm">info</span>
                  <span>필터가 적용되었습니다. 총 {total}개의 결과</span>
                </div>
              )}
          </div>
        )}

        {/* 통계 대시보드 */}
        {userEmail && !loading && history.length > 0 && (
          <StatsDashboard reports={history} total={total} />
        )}

        {userEmail && (loading ? (
          <HistoryListSkeleton count={ITEMS_PER_PAGE} />
        ) : loadError ? (
          <div className="text-center py-16 bg-card rounded-2xl border border-card-border">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-5xl text-red-500">cloud_off</span>
            </div>
            <h3 className="text-xl font-bold text-text-primary mb-2">연결에 문제가 발생했습니다</h3>
            <p className="text-text-secondary mb-6 max-w-sm mx-auto">
              네트워크 연결을 확인하고<br />다시 시도해 주세요.
            </p>
            <button onClick={() => loadHistory(currentPage)} className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-hover transition-all hover:scale-105 font-bold">
              <span className="material-symbols-outlined text-base">refresh</span>
              다시 시도
            </button>
          </div>
        ) : history.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {history.map((item) => (
                <div key={item.id} onClick={() => navigate(`/reports/${item.id}`)} className="group relative cursor-pointer rounded-2xl bg-card border border-card-border p-6 transition-all hover:bg-card-sub-bg hover:border-primary">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{countryFlags[item.country]}</span>
                      <h3 className="font-bold text-text-primary group-hover:text-primary leading-tight">{countryLabels[item.country]}</h3>
                    </div>
                    <button onClick={(e) => handleDelete(item.id, e)} disabled={deleting === item.id} className="p-2 rounded-full text-text-muted hover:bg-red-500/10 hover:text-red-500 dark:hover:bg-red-500/20 dark:hover:text-red-400 transition-colors disabled:opacity-50">
                      {deleting === item.id ? (
                        <svg className="animate-spin h-4 w-4 text-text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <span className="material-symbols-outlined text-lg">delete</span>
                      )}
                    </button>
                  </div>
                  <div className="flex flex-col gap-2 text-sm text-text-secondary">
                    <div className="flex items-center gap-2"><span className="material-symbols-outlined text-base">calendar_today</span><span>{item.createdAt}</span></div>
                    <div className="flex items-center gap-2"><span className="material-symbols-outlined text-base">memory_chip</span><span>{item.ocrEngine === 'google' ? 'Google Vision AI' : 'Tesseract OCR'}</span></div>
                  </div>
                  <div className="mt-4">
                    <button onClick={(e) => { e.stopPropagation(); navigate(`/reports/${item.id}`); }} className="w-full text-center py-2 rounded-lg bg-primary/10 text-primary font-bold hover:bg-primary/20 transition-colors">리포트 보기</button>
                  </div>
                </div>
              ))}
            </div>
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center items-center gap-2">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button key={i} onClick={() => handlePageChange(i)} className={`w-9 h-9 rounded-full text-sm font-bold transition-colors ${currentPage === i ? 'bg-primary text-white' : 'bg-card-sub-bg text-text-secondary hover:bg-primary/10 hover:text-primary'}`}>
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16 bg-card rounded-2xl border border-card-border">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-5xl text-primary">inventory_2</span>
            </div>
            <h3 className="text-xl font-bold text-text-primary mb-2">아직 분석 내역이 없습니다</h3>
            <p className="text-text-secondary mb-6 max-w-sm mx-auto">
              첫 번째 식품 라벨을 업로드하고<br />AI 분석 결과를 확인해 보세요!
            </p>
            <button onClick={() => navigate('/analyze')} className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-hover transition-all hover:scale-105 font-bold shadow-lg shadow-primary/25">
              <span className="material-symbols-outlined text-base">add_circle</span>
              첫 분석 시작하기
            </button>
          </div>
        ))}
      </main>

      {showEmailModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-slate-900/80 backdrop-blur-lg flex items-center justify-center z-50">
          <div className="bg-card border border-card-border rounded-2xl shadow-2xl w-full max-w-md m-4">
            <div className="p-6">
              <h2 className="text-xl font-bold text-text-primary mb-2">이메일로 계속하기</h2>
              <p className="text-sm text-text-secondary mb-4">이메일을 입력하시면 분석 이력을 여러 기기에서 동기화할 수 있습니다.</p>
              <input type="email" placeholder="user@example.com" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} className="w-full rounded-lg border border-card-border bg-card-sub-bg text-text-primary py-2 px-3 text-sm mb-4 focus:border-primary focus:ring-0" />
              <p className="text-xs text-text-muted mb-4">🔒 비밀번호를 저장하지 않으며, 이메일은 분석 이력을 식별하는 용도로만 사용됩니다.</p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setShowEmailModal(false)} className="py-2 px-4 rounded-lg text-sm font-medium border border-card-border bg-card hover:bg-card-sub-bg text-text-secondary transition-colors">취소</button>
                <button onClick={handleLinkEmail} disabled={isLinking} className="bg-primary text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors disabled:opacity-50">
                  {isLinking ? '연결 중...' : '이메일 연결'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;