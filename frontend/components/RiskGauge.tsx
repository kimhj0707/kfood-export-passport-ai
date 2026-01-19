import React from 'react';

interface RiskGaugeProps {
  highCount: number;
  mediumCount: number;
  lowCount: number;
}

const RiskGauge: React.FC<RiskGaugeProps> = ({ highCount, mediumCount, lowCount }) => {
  const total = highCount + mediumCount + lowCount;
  if (total === 0) return null;

  // 위험도 점수 계산 (0-100)
  // HIGH = 30점, MEDIUM = 10점, LOW = 0점
  const riskScore = Math.min(100, Math.round(((highCount * 30) + (mediumCount * 10)) / total * 10));

  // 색상 및 라벨 결정
  let color = 'text-emerald-500';
  let bgColor = 'bg-emerald-500';
  let label = '안전';
  let description = '수출 규정을 대부분 준수하고 있습니다.';

  if (riskScore >= 70) {
    color = 'text-red-500';
    bgColor = 'bg-red-500';
    label = '위험';
    description = '심각한 규정 위반 사항이 있습니다.';
  } else if (riskScore >= 40) {
    color = 'text-amber-500';
    bgColor = 'bg-amber-500';
    label = '주의';
    description = '일부 규정 검토가 필요합니다.';
  }

  // SVG 원형 게이지 계산
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (riskScore / 100) * circumference;

  return (
    <div className="bg-card border border-card-border rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-primary">speed</span>
        <h3 className="font-semibold text-text-primary">수출 적합성 지수</h3>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* 원형 게이지 */}
        <div className="relative w-36 h-36 flex-shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 140 140">
            {/* 배경 원 */}
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="12"
              className="text-card-sub-bg"
            />
            {/* 진행률 원 */}
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="12"
              strokeLinecap="round"
              className={color}
              style={{
                strokeDasharray: circumference,
                strokeDashoffset: strokeDashoffset,
                transition: 'stroke-dashoffset 1s ease-out',
              }}
            />
          </svg>

          {/* 중앙 텍스트 */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-3xl font-black ${color}`}>{100 - riskScore}</span>
            <span className="text-xs text-text-muted">/ 100</span>
          </div>
        </div>

        {/* 설명 영역 */}
        <div className="flex-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold text-white ${bgColor}`}>
              {label}
            </span>
          </div>
          <p className="text-sm text-text-secondary mb-4">{description}</p>

          {/* 세부 내역 */}
          <div className="flex justify-center sm:justify-start gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
              <span className="text-xs text-text-muted">위험 {highCount}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span className="text-xs text-text-muted">주의 {mediumCount}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="text-xs text-text-muted">정상 {lowCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskGauge;
