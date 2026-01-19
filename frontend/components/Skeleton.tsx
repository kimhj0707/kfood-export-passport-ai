import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rectangular',
  width,
  height,
  animation = 'pulse',
}) => {
  const baseClasses = 'bg-card-sub-bg';

  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  const animationClasses = {
    pulse: 'animate-skeleton-pulse',
    wave: 'animate-skeleton-wave',
    none: '',
  };

  const style: React.CSSProperties = {
    width: width,
    height: height,
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={style}
    />
  );
};

// 리포트 페이지 스켈레톤
export const ReportSkeleton: React.FC = () => (
  <div className="max-w-5xl mx-auto w-full px-4 py-6 space-y-6">
    {/* 헤더 스켈레톤 */}
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Skeleton width={80} height={24} className="rounded-md" />
          <Skeleton width={60} height={24} className="rounded-md" />
        </div>
        <Skeleton width={200} height={32} className="mb-2" />
        <Skeleton width={120} height={16} />
      </div>
      <div className="flex gap-2">
        <Skeleton width={36} height={36} className="rounded-lg" />
        <Skeleton width={36} height={36} className="rounded-lg" />
        <Skeleton width={80} height={36} className="rounded-lg" />
      </div>
    </div>

    {/* 위험도 게이지 스켈레톤 */}
    <div className="bg-card border border-card-border rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Skeleton width={24} height={24} variant="circular" />
        <Skeleton width={140} height={20} />
      </div>
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <Skeleton width={144} height={144} variant="circular" />
        <div className="flex-1 space-y-3">
          <Skeleton width={80} height={28} className="rounded-full" />
          <Skeleton width="100%" height={16} />
          <div className="flex gap-4">
            <Skeleton width={60} height={16} />
            <Skeleton width={60} height={16} />
            <Skeleton width={60} height={16} />
          </div>
        </div>
      </div>
    </div>

    {/* 요약 대시보드 스켈레톤 */}
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="rounded-xl p-4 bg-card border border-card-border">
          <div className="flex items-center gap-2 mb-2">
            <Skeleton width={20} height={20} variant="circular" />
            <Skeleton width={60} height={14} />
          </div>
          <Skeleton width={40} height={32} />
        </div>
      ))}
    </div>

    {/* 규정 검토 결과 스켈레톤 */}
    <div className="bg-card border border-card-border rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-card-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton width={24} height={24} variant="circular" />
          <Skeleton width={120} height={20} />
        </div>
        <Skeleton width={40} height={24} className="rounded" />
      </div>
      <div className="divide-y divide-card-border">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4">
            <div className="flex items-start gap-3">
              <Skeleton width={24} height={24} variant="circular" />
              <div className="flex-1 space-y-2">
                <Skeleton width={60} height={16} />
                <Skeleton width="80%" height={18} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// 히스토리 카드 스켈레톤
export const HistoryCardSkeleton: React.FC = () => (
  <div className="p-5 rounded-xl border border-card-border bg-card">
    <div className="flex items-start gap-4">
      <Skeleton width={48} height={48} className="rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton width={100} height={20} />
        <Skeleton width={150} height={14} />
        <Skeleton width={80} height={12} />
      </div>
      <Skeleton width={24} height={24} variant="circular" />
    </div>
  </div>
);

// 히스토리 리스트 스켈레톤
export const HistoryListSkeleton: React.FC<{ count?: number }> = ({ count = 5 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <HistoryCardSkeleton key={i} />
    ))}
  </div>
);

export default Skeleton;
