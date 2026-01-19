import React from "react";
import { useNavigate } from "react-router-dom";

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full bg-background text-text-primary">
      {/* Hero Section - Card Style */}
      <section className="w-full px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-2xl lg:rounded-3xl">
          {/* 배경 이미지 */}
          <div className="absolute inset-0 z-0">
            {/* 라이트 모드 이미지 */}
            <img
              src="/hero_section2.png"
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover block dark:hidden"
            />
            {/* 다크 모드 이미지 */}
            <img
              src="/hero_section.png"
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover hidden dark:block"
            />
            {/* 다크 모드 오버레이 */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/50 to-slate-950/20 hidden dark:block"></div>
          </div>

          {/* 콘텐츠 - 왼쪽 정렬 */}
          <div className="relative z-10 flex flex-col items-start justify-center px-4 py-28 sm:px-6 sm:py-36 md:px-12 lg:px-28 lg:py-48 text-left">
            <h1 className="text-4xl font-black tracking-tight text-slate-800 dark:text-white sm:text-5xl md:text-6xl lg:text-7xl leading-tight">
              <span className="block">수출길, AI로 여는</span>
              <span className="block mt-2 sm:mt-3 lg:mt-4">식품 라벨의 미래</span>
            </h1>
            <p className="mt-6 max-w-xl text-base text-slate-600 dark:text-slate-200 sm:text-lg md:text-xl leading-relaxed">
              <span className="block">단 한 장의 이미지로</span>
              <span className="block">
                수출 규제와 마케팅 기회를 함께 분석하세요.
              </span>
            </p>
            <div className="mt-8 flex flex-wrap justify-start gap-4">
              <button
                onClick={() => navigate("/analyze")}
                className="flex h-12 sm:h-14 items-center justify-center rounded-full px-6 sm:px-8 text-base sm:text-lg font-bold transition-all hover:scale-105 bg-slate-800 text-white hover:bg-slate-700 dark:bg-primary dark:hover:bg-primary-hover"
              >
                <span className="material-symbols-outlined mr-2">
                  upload_file
                </span>
                <span>지금 분석 시작하기</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="w-full py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-6 rounded-2xl bg-card border border-card-border">
              <div className="text-4xl md:text-5xl font-black text-primary mb-2">5+</div>
              <div className="text-text-secondary font-medium">지원 국가</div>
            </div>
            <div className="text-center p-6 rounded-2xl bg-card border border-card-border">
              <div className="text-4xl md:text-5xl font-black text-primary mb-2">AI</div>
              <div className="text-text-secondary font-medium">기반 분석</div>
            </div>
            <div className="text-center p-6 rounded-2xl bg-card border border-card-border">
              <div className="text-4xl md:text-5xl font-black text-primary mb-2">OCR</div>
              <div className="text-text-secondary font-medium">자동 인식</div>
            </div>
            <div className="text-center p-6 rounded-2xl bg-card border border-card-border">
              <div className="text-4xl md:text-5xl font-black text-primary mb-2">PDF</div>
              <div className="text-text-secondary font-medium">리포트 제공</div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="w-full py-20 px-4 bg-card-sub-bg">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-text-primary">
              핵심 기능
            </h3>
            <p className="text-text-secondary mt-4 text-lg">
              수출에 필요한 모든 분석을 한 번에 제공합니다.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-card border border-card-border hover:border-primary transition-colors">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-3xl text-primary">document_scanner</span>
              </div>
              <h4 className="text-xl font-bold text-text-primary mb-2">OCR 텍스트 인식</h4>
              <p className="text-text-secondary text-sm leading-relaxed">
                Google Vision AI로 라벨의 텍스트를 정확하게 추출합니다.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-card border border-card-border hover:border-primary transition-colors">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-3xl text-primary">warning</span>
              </div>
              <h4 className="text-xl font-bold text-text-primary mb-2">알레르겐 검출</h4>
              <p className="text-text-secondary text-sm leading-relaxed">
                각 국가별 주요 알레르겐을 자동으로 식별하고 위험도를 분석합니다.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-card border border-card-border hover:border-primary transition-colors">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-3xl text-primary">gavel</span>
              </div>
              <h4 className="text-xl font-bold text-text-primary mb-2">규정 준수 검토</h4>
              <p className="text-text-secondary text-sm leading-relaxed">
                미국, 일본, EU 등 주요 수출국의 식품 규정을 자동 검토합니다.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-card border border-card-border hover:border-primary transition-colors">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-3xl text-primary">auto_awesome</span>
              </div>
              <h4 className="text-xl font-bold text-text-primary mb-2">마케팅 문구 생성</h4>
              <p className="text-text-secondary text-sm leading-relaxed">
                AI가 타겟 시장에 맞는 홍보 문구를 자동으로 생성합니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Process Section */}
      <section className="w-full py-20 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto overflow-visible">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-text-primary">
              간편한 3단계 프로세스
            </h3>
            <p className="text-text-secondary mt-4 text-lg">
              전문적인 분석 결과를 단 몇 분 만에 확인하세요.
            </p>
          </div>
          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 pt-16">
            <div className="absolute top-16 left-0 right-0 h-0.5 bg-card-border hidden md:block" style={{top: 'calc(4rem + 50%)'}}></div>

            <div className="relative flex flex-col items-center text-center p-8 rounded-2xl border border-card-border bg-card shadow-lg dark:backdrop-blur-md">
              <div className="absolute -top-12 size-24 rounded-full bg-slate-100 dark:bg-slate-900 border-4 border-card-border flex items-center justify-center text-primary shadow-lg z-10">
                <span className="material-symbols-outlined text-5xl">
                  cloud_upload
                </span>
              </div>
              <h4 className="text-text-primary text-2xl font-bold mb-3 mt-12">
                1. 라벨 업로드
              </h4>
              <p className="text-text-secondary leading-relaxed break-keep">
                분석할 라벨 이미지를 업로드합니다. 다국어 텍스트를 자동으로
                인식합니다.
              </p>
            </div>

            <div className="relative flex flex-col items-center text-center p-8 rounded-2xl border border-card-border bg-card shadow-lg dark:backdrop-blur-md">
              <div className="absolute -top-12 size-24 rounded-full bg-slate-100 dark:bg-slate-900 border-4 border-card-border flex items-center justify-center text-primary shadow-lg z-10">
                <span className="material-symbols-outlined text-5xl">
                  psychology
                </span>
              </div>
              <h4 className="text-text-primary text-2xl font-bold mb-3 mt-12">
                2. AI 분석
              </h4>
              <p className="text-text-secondary leading-relaxed break-keep">
                AI가 성분, 영양 정보를 분석하여 목표 국가의 규정 준수 여부를
                검토합니다.
              </p>
            </div>

            <div className="relative flex flex-col items-center text-center p-8 rounded-2xl border border-card-border bg-card shadow-lg dark:backdrop-blur-md">
              <div className="absolute -top-12 size-24 rounded-full bg-slate-100 dark:bg-slate-900 border-4 border-card-border flex items-center justify-center text-primary shadow-lg z-10">
                <span className="material-symbols-outlined text-5xl">
                  description
                </span>
              </div>
              <h4 className="text-text-primary text-2xl font-bold mb-3 mt-12">
                3. 리포트 생성
              </h4>
              <p className="text-text-secondary leading-relaxed break-keep">
                수출용 검토 보고서와 마케팅 문구가 포함된 결과물을 확인하고
                다운로드합니다.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default LandingPage;
