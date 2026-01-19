import React from "react";
import { Link } from "react-router-dom";

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* 아이콘 */}
        <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-primary/10 flex items-center justify-center animate-bounce">
          <span className="material-symbols-outlined text-6xl text-primary">explore_off</span>
        </div>

        {/* 404 텍스트 */}
        <h1 className="text-7xl font-black text-primary mb-4 tracking-tight">404</h1>

        {/* 메시지 */}
        <h2 className="text-2xl font-bold text-text-primary mb-3">
          길을 잃으셨나요?
        </h2>
        <p className="text-text-secondary mb-8 leading-relaxed">
          요청하신 페이지가 존재하지 않거나<br />다른 곳으로 이동되었을 수 있습니다.
        </p>

        {/* 버튼들 */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-all hover:scale-105 shadow-lg shadow-primary/25"
          >
            <span className="material-symbols-outlined text-xl">home</span>
            홈으로 돌아가기
          </Link>
          <Link
            to="/analyze"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-card border border-card-border text-text-primary font-bold rounded-xl hover:bg-card-sub-bg transition-colors"
          >
            <span className="material-symbols-outlined text-xl">document_scanner</span>
            분석 시작하기
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
