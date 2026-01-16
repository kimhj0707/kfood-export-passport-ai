
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHistory, deleteReport, HistoryFilters, linkEmail, getUser, unlinkEmail } from '../services/api';
import { AnalysisReport } from '../types';
import { useToast } from '../contexts/ToastContext';

const ITEMS_PER_PAGE = 10;

const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [history, setHistory] = useState<AnalysisReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [deleting, setDeleting] = useState<string | null>(null);

  // 이메일 관련 상태
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [isLinking, setIsLinking] = useState(false);

  // 필터 상태
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
    loadHistory(currentPage);
  }, [currentPage, loadHistory]);

  const handleApplyFilters = () => {
    setCurrentPage(0);
    loadHistory(0);
  };

  const handleClearFilters = () => {
    setFilterCountry('');
    setFilterDateFrom('');
    setFilterDateTo('');
    setCurrentPage(0);
  };

  const hasActiveFilters = filterCountry || filterDateFrom || filterDateTo;

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    const maxPage = Math.ceil(total / ITEMS_PER_PAGE) - 1;
    if (currentPage < maxPage) {
      setCurrentPage(currentPage + 1);
    }
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
    if (!userId) {
      showToast('error', '사용자 ID를 찾을 수 없습니다.');
      return;
    }
    if (!emailInput) {
      showToast('error', '이메일을 입력해주세요.');
      return;
    }

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
    if (!userId) {
      showToast('error', '사용자 ID를 찾을 수 없습니다.');
      return;
    }
    if (!confirm('이메일 연결을 해제하시겠습니까? 이 브라우저에서만 이력이 유지됩니다.')) {
      return;
    }

    try {
      await unlinkEmail(userId);
      setUserEmail(null);
      showToast('success', '이메일 연결이 해제되었습니다.');
    } catch (error) {
      showToast('error', (error as Error).message);
    }
  };

  const handleStartNewUser = () => {
    if (!confirm('새 사용자로 시작하시겠습니까? 현재 브라우저의 모든 분석 이력이 초기화됩니다.')) {
      return;
    }
    localStorage.removeItem('user_id');
    window.location.reload(); // 새 사용자 ID로 다시 시작
  };

  const countryFlags: Record<string, string> = {
    'US': '🇺🇸',
    'JP': '🇯🇵',
    'VN': '🇻🇳',
    'EU': '🇪🇺',
    'CN': '🇨🇳'
  };

  const countryLabels: Record<string, string> = {
    'US': '미국 (USA)',
    'JP': '일본 (Japan)',
    'VN': '베트남 (Vietnam)',
    'EU': '유럽연합 (EU)',
    'CN': '중국 (China)'
  };

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
  const hasPrev = currentPage > 0;
  const hasNext = currentPage < totalPages - 1;

  return (
    <div className="flex flex-col flex-1 bg-bg-light min-h-[calc(100vh-160px)] dark:bg-gray-900">
      <section className="w-full px-4 md:px-10 lg:px-40 py-12">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div className="flex flex-col gap-2">
              <h1 className="text-[#121617] dark:text-gray-200 text-3xl font-black tracking-tight">내 분석 이력</h1>
              <p className="text-[#677c83] dark:text-gray-400 text-lg">
                {userEmail ? `연결된 계정: ${userEmail}` : '이 브라우저에 저장된 분석 결과입니다.'}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {userEmail && (
                <button
                  onClick={handleUnlinkEmail}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-900/50 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">link_off</span>
                  <span className="font-medium text-sm">이메일 연결 해제</span>
                </button>
              )}
              <button
                onClick={handleStartNewUser}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#dde2e4] hover:bg-gray-50 text-[#121617] dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">person_add</span>
                <span className="font-medium text-sm">새 사용자로 시작하기</span>
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                  hasActiveFilters
                    ? 'border-primary bg-primary/5 text-primary dark:bg-primary/20 dark:text-primary'
                    : 'border-[#dde2e4] hover:bg-gray-50 text-[#121617] dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700'
                }`}
              >
                <span className="material-symbols-outlined text-sm">filter_list</span>
                <span className="font-medium text-sm">필터</span>
                {hasActiveFilters && (
                  <span className="bg-primary text-white text-xs px-1.5 py-0.5 rounded-full">!</span>
                )}
              </button>
            </div>
          </div>

          {!userEmail && (
            <div className="bg-primary/5 dark:bg-primary/20 border border-primary/20 dark:border-primary/30 rounded-xl p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary text-2xl mt-0.5">link</span>
                <div>
                  <h3 className="font-bold text-primary">이메일을 연결하고 분석 이력을 관리하세요!</h3>
                  <p className="text-sm text-primary/80 mt-1">
                    📧 이메일을 연결하면 이 분석 이력을 다른 기기에서도 이어볼 수 있습니다.<br/>
                    이 서비스는 비밀번호를 저장하지 않으며, 이메일은 분석 이력을 식별하기 위한 용도로만 사용됩니다.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowEmailModal(true)}
                className="bg-primary text-white font-bold py-2 px-5 rounded-lg whitespace-nowrap hover:bg-primary/90 transition-colors"
              >
                이메일로 계속하기
              </button>
            </div>
          )}

          {/* 필터 패널 */}
          {showFilters && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-[#dde2e4] dark:border-gray-700 p-4 mb-4 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">국가</label>
                  <select
                    value={filterCountry}
                    onChange={(e) => setFilterCountry(e.target.value)}
                    className="w-full rounded-lg border-[#dde2e4] dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 py-2 px-3 text-sm"
                  >
                    <option value="">전체</option>
                    <option value="US">미국 (USA)</option>
                    <option value="JP">일본 (Japan)</option>
                    <option value="VN">베트남 (Vietnam)</option>
                    <option value="EU">유럽연합 (EU)</option>
                    <option value="CN">중국 (China)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">시작 날짜</label>
                  <input
                    type="date"
                    value={filterDateFrom}
                    onChange={(e) => setFilterDateFrom(e.target.value)}
                    className="w-full rounded-lg border-[#dde2e4] dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 py-2 px-3 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">종료 날짜</label>
                  <input
                    type="date"
                    value={filterDateTo}
                    onChange={(e) => setFilterDateTo(e.target.value)}
                    className="w-full rounded-lg border-[#dde2e4] dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 py-2 px-3 text-sm"
                  />
                </div>
                <div className="flex items-end gap-2">
                  <button
                    onClick={handleApplyFilters}
                    className="flex-1 bg-primary text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    적용
                  </button>
                  <button
                    onClick={handleClearFilters}
                    className="py-2 px-4 rounded-lg text-sm font-medium border border-[#dde2e4] dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-200 transition-colors"
                  >
                    초기화
                  </button>
                </div>
              </div>
              {hasActiveFilters && (
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="material-symbols-outlined text-sm">info</span>
                  <span>필터가 적용되었습니다. 총 {total}개의 결과</span>
                </div>
              )}
            </div>
          )}

          {/* 🔒 안내 문구 추가 */}
          <div className="flex items-center gap-2 text-sm text-[#677c83] dark:text-gray-400 mb-4">
            <span className="material-symbols-outlined text-lg">lock</span>
            <span className="relative group">
              이 분석 이력은 본인에게만 표시됩니다.
              <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 p-2 text-xs text-white bg-gray-700 dark:bg-gray-900 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                이 브라우저에 저장된 고유 ID로 필터링되어 표시됩니다.
              </span>
            </span>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-[#dde2e4] dark:border-gray-700 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#dde2e4] dark:border-gray-700 bg-background-light/50 dark:bg-gray-900/50">
                    <th className="px-6 py-4 text-sm font-bold text-gray-700 dark:text-gray-300">분석 일시</th>
                    <th className="px-6 py-4 text-sm font-bold text-gray-700 dark:text-gray-300">대상 국가</th>
                    <th className="px-6 py-4 text-sm font-bold text-gray-700 dark:text-gray-300">사용 엔진</th>
                    <th className="px-6 py-4 text-sm font-bold text-gray-700 dark:text-gray-300 text-right">작업</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#dde2e4] dark:divide-gray-700">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-10 text-center text-gray-400 dark:text-gray-500">
                        <div className="flex items-center justify-center gap-2">
                          <span className="material-symbols-outlined animate-spin">progress_activity</span>
                          데이터를 불러오는 중...
                        </div>
                      </td>
                    </tr>
                  ) : loadError ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-10 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <span className="material-symbols-outlined text-3xl text-red-400">cloud_off</span>
                          <p className="text-gray-500 dark:text-gray-400">데이터를 불러오는 중 오류가 발생했습니다.</p>
                          <button
                            onClick={() => loadHistory(currentPage)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                          >
                            <span className="material-symbols-outlined text-sm">refresh</span>
                            다시 시도
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : history.length > 0 ? (
                    history.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-6 py-5 text-sm text-[#121617] dark:text-gray-200">{item.createdAt}</td>
                        <td className="px-6 py-5 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{countryFlags[item.country]}</span>
                            <span className="text-[#121617] dark:text-gray-200">{countryLabels[item.country]}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary dark:bg-primary/20">
                            K-Food Engine {item.ocrEngine === 'google' ? 'v2.1' : 'v2.0'}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => navigate(`/reports/${item.id}`)}
                              className="inline-flex items-center justify-center px-4 py-2 border border-[#dde2e4] dark:border-gray-600 rounded-lg text-sm font-semibold text-primary hover:bg-primary/5 dark:hover:bg-primary/20 transition-colors"
                            >
                              상세 보기
                            </button>
                            <button
                              onClick={(e) => handleDelete(item.id, e)}
                              disabled={deleting === item.id}
                              className="inline-flex items-center justify-center px-3 py-2 border border-red-200 dark:border-red-600 rounded-lg text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/50 transition-colors disabled:opacity-50"
                            >
                              {deleting === item.id ? (
                                <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                              ) : (
                                <span className="material-symbols-outlined text-sm">delete</span>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-10 text-center text-gray-400 dark:text-gray-500">분석 내역이 없습니다.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 border-t border-[#dde2e4] dark:border-gray-700 flex items-center justify-between">
              <span className="text-sm text-[#677c83] dark:text-gray-400">
                총 {total}개 중 {currentPage * ITEMS_PER_PAGE + 1}-{Math.min((currentPage + 1) * ITEMS_PER_PAGE, total)}개 표시
                {totalPages > 1 && ` (${currentPage + 1}/${totalPages} 페이지)`}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handlePrevPage}
                  disabled={!hasPrev}
                  className={`p-2 border border-[#dde2e4] dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 ${hasPrev ? 'text-gray-700 dark:text-gray-300' : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'}`}
                >
                  <span className="material-symbols-outlined text-sm">chevron_left</span>
                </button>
                <button
                  onClick={handleNextPage}
                  disabled={!hasNext}
                  className={`p-2 border border-[#dde2e4] dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 ${hasNext ? 'text-gray-700 dark:text-gray-300' : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'}`}
                >
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 이메일 입력 모달 */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-md m-4">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">이메일로 계속하기</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                이메일을 입력하시면 분석 이력을 여러 기기에서 동기화할 수 있습니다.
              </p>
              <input
                type="email"
                placeholder="user@example.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full rounded-lg border-[#dde2e4] dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 py-2 px-3 text-sm mb-4"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                🔒 이 서비스는 비밀번호를 저장하지 않습니다. 이메일은 분석 이력을 식별하기 위한 용도로만 사용됩니다.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowEmailModal(false)}
                  className="py-2 px-4 rounded-lg text-sm font-medium border border-[#dde2e4] dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-200 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleLinkEmail}
                  disabled={isLinking}
                  className="bg-primary text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
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
