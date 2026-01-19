import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface TourStep {
  id: string;
  title: string;
  description: string;
  target?: string; // CSS selector for highlighting
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  route?: string; // Route to navigate to
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    title: 'K-Food Export Passport에 오신 것을 환영합니다!',
    description: 'AI 기반 식품 라벨 분석 서비스입니다. 수출용 라벨의 규정 준수 여부를 자동으로 검토해 드립니다.',
    position: 'center',
  },
  {
    id: 'analyze',
    title: '라벨 분석하기',
    description: '여기서 식품 라벨 이미지를 업로드하고 수출 대상 국가를 선택할 수 있습니다.',
    position: 'center',
    route: '/analyze',
  },
  {
    id: 'sample',
    title: '샘플 라벨로 테스트',
    description: '직접 이미지가 없다면 샘플 라벨을 선택해서 서비스를 체험해 보세요!',
    position: 'center',
    route: '/analyze',
  },
  {
    id: 'history',
    title: '분석 기록 확인',
    description: '이메일을 등록하면 이전 분석 기록을 언제든지 다시 확인할 수 있습니다.',
    position: 'center',
    route: '/history',
  },
  {
    id: 'complete',
    title: '준비 완료!',
    description: '이제 K-Food Export Passport를 사용할 준비가 되었습니다. 첫 번째 라벨을 분석해 보세요!',
    position: 'center',
  },
];

const GuideTour: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // 첫 방문 여부 확인
    const hasSeenTour = localStorage.getItem('guide_tour_completed');
    if (!hasSeenTour && location.pathname === '/') {
      // 첫 방문 시 약간의 딜레이 후 투어 시작
      const timer = setTimeout(() => setIsActive(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  const handleNext = () => {
    const nextStep = currentStep + 1;
    if (nextStep < TOUR_STEPS.length) {
      const step = TOUR_STEPS[nextStep];
      if (step.route && location.pathname !== step.route) {
        navigate(step.route);
      }
      setCurrentStep(nextStep);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    const prevStep = currentStep - 1;
    if (prevStep >= 0) {
      const step = TOUR_STEPS[prevStep];
      if (step.route && location.pathname !== step.route) {
        navigate(step.route);
      }
      setCurrentStep(prevStep);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('guide_tour_completed', 'true');
    setIsActive(false);
    navigate('/');
  };

  const handleComplete = () => {
    localStorage.setItem('guide_tour_completed', 'true');
    setIsActive(false);
    navigate('/analyze');
  };

  if (!isActive) return null;

  const step = TOUR_STEPS[currentStep];
  const isLastStep = currentStep === TOUR_STEPS.length - 1;
  const isFirstStep = currentStep === 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* 오버레이 */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* 툴팁 카드 */}
      <div className="relative bg-card border border-card-border rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-scale-in">
        {/* 진행률 바 */}
        <div className="h-1 bg-card-sub-bg">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${((currentStep + 1) / TOUR_STEPS.length) * 100}%` }}
          />
        </div>

        {/* 콘텐츠 */}
        <div className="p-6">
          {/* 아이콘 */}
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl text-primary">
              {isLastStep ? 'celebration' : isFirstStep ? 'waving_hand' : 'lightbulb'}
            </span>
          </div>

          {/* 제목 */}
          <h3 className="text-xl font-bold text-text-primary text-center mb-2">
            {step.title}
          </h3>

          {/* 설명 */}
          <p className="text-text-secondary text-center text-sm leading-relaxed mb-6">
            {step.description}
          </p>

          {/* 단계 표시 */}
          <div className="flex justify-center gap-1.5 mb-6">
            {TOUR_STEPS.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === currentStep
                    ? 'bg-primary w-6'
                    : i < currentStep
                    ? 'bg-primary/50'
                    : 'bg-card-sub-bg'
                }`}
              />
            ))}
          </div>

          {/* 버튼 */}
          <div className="flex gap-3">
            {!isFirstStep && (
              <button
                onClick={handlePrev}
                className="flex-1 h-11 rounded-lg border border-card-border text-text-secondary text-sm font-medium hover:bg-card-sub-bg transition-colors"
              >
                이전
              </button>
            )}
            {isFirstStep && (
              <button
                onClick={handleSkip}
                className="flex-1 h-11 rounded-lg border border-card-border text-text-secondary text-sm font-medium hover:bg-card-sub-bg transition-colors"
              >
                건너뛰기
              </button>
            )}
            <button
              onClick={handleNext}
              className="flex-1 h-11 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors flex items-center justify-center gap-1"
            >
              {isLastStep ? '시작하기' : '다음'}
              {!isLastStep && <span className="material-symbols-outlined text-base">arrow_forward</span>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuideTour;
