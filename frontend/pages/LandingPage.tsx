import React from "react";
import { useNavigate } from "react-router-dom";

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col">
      <section className="w-full px-4 md:px-10 lg:px-40 py-10 md:py-20">
        <div className="max-w-[1200px] mx-auto">
          <div className="relative overflow-hidden rounded-2xl bg-slate-900 min-h-[480px] flex flex-col items-center justify-center p-8 text-center">
            <div
              className="absolute inset-0 z-0 bg-cover bg-center opacity-40"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.7) 100%), url("https://picsum.photos/seed/kfood/1200/600")',
              }}
            ></div>
            <div className="relative z-10 flex flex-col gap-6 max-w-[850px]">
              <h1 className="text-white text-3xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight break-keep">
                수출 준비는 문서가 아니라, 패키지에서 시작됩니다
              </h1>
              <p className="text-gray-200 text-lg md:text-xl font-medium max-w-2xl mx-auto break-keep">
                패키지 이미지 한 장으로 국가별 라벨 리스크와 홍보 문구를 동시에
                확인하세요.
              </p>
              <div className="flex flex-wrap gap-4 justify-center mt-6">
                <button
                  onClick={() => navigate("/analyze")}
                  className="flex min-w-[200px] cursor-pointer items-center justify-center rounded-lg h-14 px-8 bg-primary text-white text-lg font-bold shadow-lg hover:brightness-110 transition-all"
                >
                  <span className="material-symbols-outlined mr-2">
                    upload_file
                  </span>
                  <span>분석 시작하기</span>
                </button>
                <button
                  onClick={() => navigate("/history")}
                  className="flex min-w-[200px] cursor-pointer items-center justify-center rounded-lg h-14 px-8 bg-white/10 backdrop-blur-md border border-white/30 text-white text-lg font-bold hover:bg-white/20 transition-all"
                >
                  <span className="material-symbols-outlined mr-2">
                    history
                  </span>
                  <span>분석 이력 확인</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full px-4 md:px-10 lg:px-40 py-16 bg-[#f8fafb]">
        <div className="max-w-[1200px] mx-auto text-center mb-12">
          <h3 className="text-[#121617] text-3xl font-bold">
            간편한 3단계 프로세스
          </h3>
          <p className="text-[#677c83] mt-3">
            전문적인 분석 결과를 단 몇 분 만에 확인하세요.
          </p>
        </div>
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col p-8 rounded-xl bg-white shadow-sm border border-gray-100 text-center items-center">
            <div className="size-16 rounded-full bg-primary/5 flex items-center justify-center text-primary mb-6">
              <span className="material-symbols-outlined text-4xl">
                cloud_upload
              </span>
            </div>
            <h4 className="text-[#121617] text-xl font-bold mb-3">
              1. 라벨 업로드
            </h4>
            <p className="text-[#677c83] leading-relaxed break-keep text-sm">
              분석하고자 하는 식품의 라벨 이미지를 업로드합니다. 다국어 텍스트를
              자동으로 인식합니다.
            </p>
          </div>
          <div className="flex flex-col p-8 rounded-xl bg-white shadow-sm border border-gray-100 text-center items-center">
            <div className="size-16 rounded-full bg-primary/5 flex items-center justify-center text-primary mb-6">
              <span className="material-symbols-outlined text-4xl">
                psychology
              </span>
            </div>
            <h4 className="text-[#121617] text-xl font-bold mb-3">
              2. AI 분석
            </h4>
            <p className="text-[#677c83] leading-relaxed break-keep text-sm">
              AI가 성분, 영양 정보를 분석하여 목표 국가의 수출 규정 준수 여부를
              검토합니다.
            </p>
          </div>
          <div className="flex flex-col p-8 rounded-xl bg-white shadow-sm border border-gray-100 text-center items-center">
            <div className="size-16 rounded-full bg-primary/5 flex items-center justify-center text-primary mb-6">
              <span className="material-symbols-outlined text-4xl">
                description
              </span>
            </div>
            <h4 className="text-[#121617] text-xl font-bold mb-3">
              3. 리포트 생성
            </h4>
            <p className="text-[#677c83] leading-relaxed break-keep text-sm">
              수출용 검토 보고서와 현지 맞춤형 마케팅 문구가 포함된 결과물을
              확인하고 다운로드합니다.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
