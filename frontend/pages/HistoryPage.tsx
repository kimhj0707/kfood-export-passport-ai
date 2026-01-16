
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHistory, deleteReport, HistoryFilters } from '../services/api';
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

  // 필터 상태
  const [filterCountry, setFilterCountry] = useState<string>('');
  const [filterDateFrom, setFilterDateFrom] = useState<string>('');
  const [filterDateTo, setFilterDateTo] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

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
    <div className="flex flex-col flex-1 bg-bg-light min-h-[calc(100vh-160px)]">
      <section className="w-full px-4 md:px-10 lg:px-40 py-12">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div className="flex flex-col gap-2">
              <h1 className="text-[#121617] text-3xl font-black tracking-tight">분석 이력</h1>
              <p className="text-[#677c83] text-lg">최근에 진행한 라벨 분석 내역입니다.</p>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                hasActiveFilters
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-[#dde2e4] hover:bg-gray-50 text-[#121617]'
              }`}
            >
              <span className="material-symbols-outlined text-sm">filter_list</span>
              <span className="font-medium text-sm">필터</span>
              {hasActiveFilters && (
                <span className="bg-primary text-white text-xs px-1.5 py-0.5 rounded-full">!</span>
              )}
            </button>
          </div>

          {/* 필터 패널 */}
          {showFilters && (
            <div className="bg-white rounded-xl border border-[#dde2e4] p-4 mb-4 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">국가</label>
                  <select
                    value={filterCountry}
                    onChange={(e) => setFilterCountry(e.target.value)}
                    className="w-full rounded-lg border-[#dde2e4] py-2 px-3 text-sm"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">시작 날짜</label>
                  <input
                    type="date"
                    value={filterDateFrom}
                    onChange={(e) => setFilterDateFrom(e.target.value)}
                    className="w-full rounded-lg border-[#dde2e4] py-2 px-3 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">종료 날짜</label>
                  <input
                    type="date"
                    value={filterDateTo}
                    onChange={(e) => setFilterDateTo(e.target.value)}
                    className="w-full rounded-lg border-[#dde2e4] py-2 px-3 text-sm"
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
                    className="py-2 px-4 rounded-lg text-sm font-medium border border-[#dde2e4] hover:bg-gray-50 transition-colors"
                  >
                    초기화
                  </button>
                </div>
              </div>
              {hasActiveFilters && (
                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2 text-sm text-gray-500">
                  <span className="material-symbols-outlined text-sm">info</span>
                  <span>필터가 적용되었습니다. 총 {total}개의 결과</span>
                </div>
              )}
            </div>
          )}

          <div className="bg-white rounded-xl border border-[#dde2e4] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#dde2e4] bg-background-light/50">
                    <th className="px-6 py-4 text-sm font-bold text-gray-700">분석 일시</th>
                    <th className="px-6 py-4 text-sm font-bold text-gray-700">대상 국가</th>
                    <th className="px-6 py-4 text-sm font-bold text-gray-700">사용 엔진</th>
                    <th className="px-6 py-4 text-sm font-bold text-gray-700 text-right">작업</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#dde2e4]">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-10 text-center text-gray-400">
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
                          <p className="text-gray-500">데이터를 불러오는 중 오류가 발생했습니다.</p>
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
                      <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-5 text-sm text-[#121617]">{item.createdAt}</td>
                        <td className="px-6 py-5 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{countryFlags[item.country]}</span>
                            <span className="text-[#121617]">{countryLabels[item.country]}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                            K-Food Engine {item.ocrEngine === 'google' ? 'v2.1' : 'v2.0'}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => navigate(`/reports/${item.id}`)}
                              className="inline-flex items-center justify-center px-4 py-2 border border-[#dde2e4] rounded-lg text-sm font-semibold text-primary hover:bg-primary/5 transition-colors"
                            >
                              상세 보기
                            </button>
                            <button
                              onClick={(e) => handleDelete(item.id, e)}
                              disabled={deleting === item.id}
                              className="inline-flex items-center justify-center px-3 py-2 border border-red-200 rounded-lg text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
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
                      <td colSpan={4} className="px-6 py-10 text-center text-gray-400">분석 내역이 없습니다.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 border-t border-[#dde2e4] flex items-center justify-between">
              <span className="text-sm text-[#677c83]">
                총 {total}개 중 {currentPage * ITEMS_PER_PAGE + 1}-{Math.min((currentPage + 1) * ITEMS_PER_PAGE, total)}개 표시
                {totalPages > 1 && ` (${currentPage + 1}/${totalPages} 페이지)`}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handlePrevPage}
                  disabled={!hasPrev}
                  className={`p-2 border border-[#dde2e4] rounded hover:bg-gray-50 ${hasPrev ? 'text-gray-700' : 'text-gray-300 cursor-not-allowed'}`}
                >
                  <span className="material-symbols-outlined text-sm">chevron_left</span>
                </button>
                <button
                  onClick={handleNextPage}
                  disabled={!hasNext}
                  className={`p-2 border border-[#dde2e4] rounded hover:bg-gray-50 ${hasNext ? 'text-gray-700' : 'text-gray-300 cursor-not-allowed'}`}
                >
                  <span className="material-symbols-outlined text-sm">chevron_right</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HistoryPage;
