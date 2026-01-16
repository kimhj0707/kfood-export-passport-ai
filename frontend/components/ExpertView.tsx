import React from 'react';
import { AnalysisReport } from '../types';

interface ExpertViewProps {
  report: AnalysisReport;
}

const ExpertView: React.FC<ExpertViewProps> = ({ report }) => {
  const expertChecks = report.regulations.filter(r => r.expert_check_required);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">전문가 검토용 리포트 (Expert View)</h2>

      {/* 제품/분석 요약 */}
      <section className="mb-8">
        <h3 className="text-lg font-semibold border-b pb-2 mb-4 dark:text-gray-200">1. 분석 요약</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><strong className="text-gray-500 dark:text-gray-400">분석 ID:</strong> {report.id}</div>
          <div><strong className="text-gray-500 dark:text-gray-400">대상 국가:</strong> {report.country}</div>
          <div><strong className="text-gray-500 dark:text-gray-400">분석 일시:</strong> {report.createdAt}</div>
          <div><strong className="text-gray-500 dark:text-gray-400">OCR 엔진:</strong> {report.ocrEngine}</div>
          <div className="col-span-2"><strong className="text-gray-500 dark:text-gray-400">분석 목적:</strong> 수출 라벨 사전 검토</div>
        </div>
      </section>

      {/* 핵심 리스크 요약 */}
      <section className="mb-8">
        <h3 className="text-lg font-semibold border-b pb-2 mb-4 dark:text-gray-200">2. 핵심 검토 사항 (Top Risks)</h3>
        <ul className="space-y-2">
          {report.regulations
            .filter(r => r.severity === 'HIGH')
            .map((risk, index) => (
              <li key={index} className="text-sm flex items-start">
                <span className="text-red-500 mr-2">■</span>
                <div>
                  <span className="font-bold">{risk.title}</span>
                  <span className="text-gray-500 dark:text-gray-400 ml-2"> (확신도: {(risk.confidence * 100).toFixed(0)}%)</span>
                </div>
              </li>
          ))}
        </ul>
      </section>

      {/* 전문가 확인 요청 체크리스트 */}
      <section className="mb-8">
        <h3 className="text-lg font-semibold border-b pb-2 mb-4 dark:text-gray-200">3. 전문가 확인 요청 항목</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">AI가 규정 기반으로 제시한 아래 항목에 대해 전문가의 최종 검토가 필요합니다.</p>
        <ul className="space-y-3">
          {expertChecks.map((check, index) => (
            <li key={index} className="flex items-start p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
              <input type="checkbox" className="mt-1 mr-3 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
              <div className="text-sm">
                <p className="font-semibold text-gray-800 dark:text-gray-100">{check.next_step}</p>
                <p className="text-gray-600 dark:text-gray-300 mt-1">{check.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* 전문가 코멘트 영역 */}
      <section>
        <h3 className="text-lg font-semibold border-b pb-2 mb-4 dark:text-gray-200">4. 전문가 의견 (선택)</h3>
        <textarea 
          rows={5}
          className="w-full p-2 border rounded-md text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
          placeholder="이 리포트에 대한 전문가 의견을 기재합니다. 이 내용은 PDF로 저장되거나 공유 링크에 포함될 수 있습니다."
        ></textarea>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">이 의견은 현재 브라우저에만 임시 저장됩니다.</p>
      </section>

      <div className="text-center mt-8 pt-6 border-t border-dashed">
         <p className="text-sm text-gray-600 dark:text-gray-400">AI는 규정 근거 기반의 확인 포인트만 제시하며, 최종 판단은 전문가의 몫입니다.</p>
      </div>
    </div>
  );
};

export default ExpertView;
