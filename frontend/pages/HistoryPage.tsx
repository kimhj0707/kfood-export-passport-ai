
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHistory } from '../services/api';
import { AnalysisReport } from '../types';

const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<AnalysisReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHistory().then(data => {
      setHistory(data);
      setLoading(false);
    });
  }, []);

  const countryFlags: Record<string, string> = {
    'US': '🇺🇸',
    'JP': '🇯🇵',
    'VN': '🇻🇳'
  };

  const countryLabels: Record<string, string> = {
    'US': '미국 (USA)',
    'JP': '일본 (Japan)',
    'VN': '베트남 (Vietnam)'
  };

  return (
    <div className="flex flex-col flex-1 bg-bg-light min-h-[calc(100vh-160px)]">
      <section className="w-full px-4 md:px-10 lg:px-40 py-12">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex flex-col gap-2 mb-10">
            <h1 className="text-[#121617] text-3xl font-black tracking-tight">분석 이력</h1>
            <p className="text-[#677c83] text-lg">최근에 진행한 라벨 분석 내역입니다.</p>
          </div>

          <div className="bg-white rounded-xl border border-[#dde2e4] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#dde2e4] bg-background-light/50">
                    <th className="px-6 py-4 text-sm font-bold text-gray-700">분석 일시</th>
                    <th className="px-6 py-4 text-sm font-bold text-gray-700">대상 국가</th>
                    <th className="px-6 py-4 text-sm font-bold text-gray-700">사용 엔진</th>
                    <th className="px-6 py-4 text-sm font-bold text-gray-700 text-right">상세 보기</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#dde2e4]">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-10 text-center text-gray-400">데이터를 불러오는 중...</td>
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
                          <button 
                            onClick={() => navigate(`/reports/${item.id}`)}
                            className="inline-flex items-center justify-center px-4 py-2 border border-[#dde2e4] rounded-lg text-sm font-semibold text-primary hover:bg-primary/5 transition-colors"
                          >
                            상세 보기
                          </button>
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
              <span className="text-sm text-[#677c83]">총 {history.length}개의 분석 결과가 있습니다.</span>
              <div className="flex gap-2">
                <button className="p-2 border border-[#dde2e4] rounded hover:bg-gray-50 text-gray-400" disabled>
                  <span className="material-symbols-outlined text-sm">chevron_left</span>
                </button>
                <button className="p-2 border border-[#dde2e4] rounded hover:bg-gray-50 text-gray-400" disabled>
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
