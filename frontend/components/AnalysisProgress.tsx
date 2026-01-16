import React, { useEffect, useState } from "react";

interface AnalysisStep {
  id: string;
  label: string;
  description: string;
  icon: string;
}

const steps: AnalysisStep[] = [
  { id: "upload", label: "이미지 업로드", description: "이미지를 서버로 전송 중...", icon: "cloud_upload" },
  { id: "ocr", label: "OCR 텍스트 추출", description: "이미지에서 텍스트를 인식하는 중...", icon: "document_scanner" },
  { id: "analyze", label: "성분 분석", description: "알레르기 및 영양성분을 분석하는 중...", icon: "science" },
  { id: "regulation", label: "규정 검토", description: "수출 대상 국가의 규정을 검토하는 중...", icon: "gavel" },
  { id: "marketing", label: "마케팅 문구 생성", description: "AI가 마케팅 문구를 생성하는 중...", icon: "auto_awesome" },
];

interface AnalysisProgressProps {
  isOpen: boolean;
}

const AnalysisProgress: React.FC<AnalysisProgressProps> = ({ isOpen }) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      return;
    }
    const intervals = [800, 2500, 2000, 1500, 3000];
    let stepIndex = 0;
    const advanceStep = () => {
      if (stepIndex < steps.length - 1) {
        stepIndex++;
        setCurrentStep(stepIndex);
        setTimeout(advanceStep, intervals[stepIndex] || 2000);
      }
    };
    const timer = setTimeout(advanceStep, intervals[0]);
    return () => clearTimeout(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="bg-slate-100 dark:bg-slate-800 px-6 py-5">
          <h3 className="text-slate-900 dark:text-white text-lg font-bold">라벨 분석 진행 중</h3>
          <p className="text-slate-600 dark:text-slate-300 text-sm mt-1">잠시만 기다려주세요...</p>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {steps.map((step, index) => {
              const isCompleted = index < currentStep;
              const isCurrent = index === currentStep;
              const isPending = index > currentStep;

              return (
                <div 
                  key={step.id} 
                  className={`flex items-start gap-4 transition-all duration-300 ${isPending ? "opacity-30" : isCompleted ? "opacity-70" : "opacity-100"}`}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  <div className={`relative flex items-center justify-center w-10 h-10 rounded-full shrink-0 transition-all duration-300
                    ${isCompleted ? "bg-green-500 text-white" : isCurrent ? "bg-primary text-white ring-2 ring-primary/50 ring-offset-2 ring-offset-white dark:ring-offset-slate-900" : "bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500"}`}>
                    {isCompleted ? (
                      <span className="material-symbols-outlined text-xl">check</span>
                    ) : (
                      <span className={`material-symbols-outlined text-xl ${isCurrent ? 'animate-pulse' : ''}`}>{step.icon}</span>
                    )}
                  </div>
                  <div className="flex-1 pt-1">
                    <p className={`font-medium text-sm ${isCurrent ? 'text-slate-900 dark:text-white font-bold' : isCompleted ? 'text-slate-600 dark:text-slate-300' : 'text-slate-400 dark:text-slate-500'}`}>
                      {step.label}
                      {isCompleted && <span className="ml-2 text-xs font-normal bg-green-500 text-white px-1.5 py-0.5 rounded-sm">완료</span>}
                    </p>
                    {isCurrent && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{step.description}</p>}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
              <span>진행률</span>
              <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
            </div>
            <div className="mt-2 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden relative">
              <div className="h-full bg-gradient-to-r from-primary via-primary to-primary rounded-full transition-all duration-500"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisProgress;