import React, { useMemo } from 'react';
import { AnalysisReport } from '../types';

interface StatsDashboardProps {
  reports: AnalysisReport[];
  total: number;
}

const StatsDashboard: React.FC<StatsDashboardProps> = ({ reports, total }) => {
  const stats = useMemo(() => {
    const countryCount: Record<string, number> = {};
    const ocrCount: Record<string, number> = {};

    reports.forEach((report) => {
      countryCount[report.country] = (countryCount[report.country] || 0) + 1;
      ocrCount[report.ocrEngine] = (ocrCount[report.ocrEngine] || 0) + 1;
    });

    // 가장 많이 분석한 국가
    const topCountry = Object.entries(countryCount).sort((a, b) => b[1] - a[1])[0];

    return {
      countryCount,
      ocrCount,
      topCountry: topCountry ? topCountry[0] : null,
    };
  }, [reports]);

  const countryFlags: Record<string, string> = {
    US: '🇺🇸',
    JP: '🇯🇵',
    VN: '🇻🇳',
    EU: '🇪🇺',
    CN: '🇨🇳',
  };

  const countryLabels: Record<string, string> = {
    US: '미국',
    JP: '일본',
    VN: '베트남',
    EU: '유럽연합',
    CN: '중국',
  };

  const countryColors: Record<string, string> = {
    US: 'bg-blue-500',
    JP: 'bg-red-500',
    VN: 'bg-yellow-500',
    EU: 'bg-indigo-500',
    CN: 'bg-rose-500',
  };

  // 국가별 비율 계산
  const totalReports = Object.values(stats.countryCount).reduce((a, b) => a + b, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {/* 총 분석 수 */}
      <div className="bg-card border border-card-border rounded-2xl p-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-2xl text-primary">analytics</span>
          </div>
          <div>
            <p className="text-sm text-text-muted">총 분석 횟수</p>
            <p className="text-2xl font-black text-text-primary">{total}</p>
          </div>
        </div>
      </div>

      {/* 주요 수출 대상국 */}
      <div className="bg-card border border-card-border rounded-2xl p-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <span className="text-2xl">{stats.topCountry ? countryFlags[stats.topCountry] : '🌍'}</span>
          </div>
          <div>
            <p className="text-sm text-text-muted">주요 수출 대상국</p>
            <p className="text-2xl font-black text-text-primary">
              {stats.topCountry ? countryLabels[stats.topCountry] : '-'}
            </p>
          </div>
        </div>
      </div>

      {/* 국가별 분포 */}
      <div className="bg-card border border-card-border rounded-2xl p-5">
        <p className="text-sm text-text-muted mb-3">국가별 분포</p>
        <div className="space-y-2">
          {Object.entries(stats.countryCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([country, count]) => {
              const percentage = totalReports > 0 ? (count / totalReports) * 100 : 0;
              return (
                <div key={country} className="flex items-center gap-2">
                  <span className="text-sm">{countryFlags[country]}</span>
                  <div className="flex-1 h-2 bg-card-sub-bg rounded-full overflow-hidden">
                    <div
                      className={`h-full ${countryColors[country]} transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-text-muted w-8 text-right">{count}</span>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default StatsDashboard;
