import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getHistory } from "../services/api";
import { AnalysisReport } from "../types";

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [recentReports, setRecentReports] = useState<AnalysisReport[]>([]);

  useEffect(() => {
    const fetchRecentReports = async () => {
      try {
        const { reports } = await getHistory(5, 0);
        setRecentReports(reports);
      } catch (error) {
        console.error("Failed to fetch recent reports:", error);
      }
    };
    fetchRecentReports();
  }, []);

  return (
    
    <div className="flex flex-col bg-bg-light dark:bg-bg-dark">
          {/* Hero Section */}
          <section className="w-full bg-bg-dark text-white">
            <div className="max-w-[1200px] mx-auto flex flex-col items-center justify-center text-center min-h-[560px] p-8 relative overflow-hidden">
              
              <div className="absolute inset-0 z-0 opacity-40">
                          <div className="absolute w-[400px] h-[400px] bg-blue-500 rounded-full filter blur-3xl opacity-30 animate-blob"></div>
                          <div className="absolute w-[300px] h-[300px] bg-purple-500 rounded-full filter blur-3xl opacity-30 animate-blob animation-delay-2000 top-1/2 left-1/2"></div>
                          <div className="absolute w-[200px] h-[200px] bg-pink-500 rounded-full filter blur-3xl opacity-30 animate-blob animation-delay-4000 bottom-0 right-1/4"></div>
                        </div>
              <div className="relative z-10 flex flex-col gap-6 max-w-[850px]">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter break-keep">
                  수출 준비, 패키지에서 시작됩니다
                </h1>
                <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto break-keep">
                  AI와 함께, 패키지 이미지 한 장으로 국가별 라벨 리스크와 마케팅 포인트를 한 번에 확인하세요.
                </p>
                <div className="flex flex-wrap gap-4 justify-center mt-6">
                  <button
                    onClick={() => navigate("/analyze")}
                    className="flex min-w-[200px] items-center justify-center rounded-full h-14 px-8 bg-primary text-white text-lg font-bold shadow-lg hover:bg-blue-600 transition-all transform hover:scale-105"
                  >
                    <span className="material-symbols-outlined mr-2">upload_file</span>
                    <span>분석 시작하기</span>
                  </button>
                </div>
              </div>
            </div>
          </section>
    
          {/* 3-Step Process Section */}
          <section className="w-full px-4 md:px-10 lg:px-40 py-20 bg-secondary">
            <div className="max-w-[1200px] mx-auto">
              <div className="text-center mb-16">
                <h3 className="text-text-dark dark:text-text-light text-4xl font-bold">간편한 3단계 프로세스</h3>
                <p className="text-gray-600 dark:text-gray-400 mt-4 text-lg">전문적인 분석 결과를 단 몇 분 만에 확인하세요.</p>
              </div>
              <div className="relative">
                {/* Dashed line */}
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 dark:bg-gray-700 hidden md:block">
                  <div className="absolute top-1/2 left-0 w-full h-0.5 border-t-2 border-dashed border-gray-300 dark:border-gray-600"></div>
                </div>
    
                <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12">
                  <div className="flex flex-col items-center text-center">
                    <div className="size-24 rounded-full bg-white dark:bg-gray-800 border-4 border-primary/20 dark:border-primary/50 flex items-center justify-center text-primary mb-6 shadow-lg">
                      <span className="material-symbols-outlined text-5xl">cloud_upload</span>
                    </div>
                    <h4 className="text-text-dark dark:text-text-light text-2xl font-bold mb-3">1. 라벨 업로드</h4>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed break-keep">분석할 라벨 이미지를 업로드합니다. 다국어 텍스트를 자동으로 인식합니다.</p>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <div className="size-24 rounded-full bg-white dark:bg-gray-800 border-4 border-primary/20 dark:border-primary/50 flex items-center justify-center text-primary mb-6 shadow-lg">
                      <span className="material-symbols-outlined text-5xl">psychology</span>
                    </div>
                    <h4 className="text-text-dark dark:text-text-light text-2xl font-bold mb-3">2. AI 분석</h4>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed break-keep">AI가 성분, 영양 정보를 분석하여 목표 국가의 규정 준수 여부를 검토합니다.</p>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <div className="size-24 rounded-full bg-white dark:bg-gray-800 border-4 border-primary/20 dark:border-primary/50 flex items-center justify-center text-primary mb-6 shadow-lg">
                      <span className="material-symbols-outlined text-5xl">description</span>
                    </div>
                    <h4 className="text-text-dark dark:text-text-light text-2xl font-bold mb-3">3. 리포트 생성</h4>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed break-keep">수출용 검토 보고서와 마케팅 문구가 포함된 결과물을 확인하고 다운로드합니다.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
    
          {/* Recent Reports Section */}
          {recentReports.length > 0 && (
            <section className="w-full px-4 md:px-10 lg:px-40 py-20">
              <div className="max-w-[1200px] mx-auto">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-text-dark dark:text-text-light text-3xl font-bold">최근 분석 리포트</h3>
                  <button
                    onClick={() => navigate('/history')}
                    className="text-primary font-bold flex items-center gap-1 hover:underline"
                  >
                    <span>모두 보기</span>
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recentReports.map((report) => (
                    <div
                      key={report.id}
                      onClick={() => navigate(`/reports/${report.id}`)}
                      className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-lg hover:border-primary dark:hover:border-primary transition-all cursor-pointer group"
                    >
                      <p className="font-bold text-lg text-text-dark dark:text-text-light group-hover:text-primary">Report #{report.id}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Country: {report.country}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Created: {new Date(report.createdAt).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
        </div>
      );
    };
    
          

export default LandingPage;
