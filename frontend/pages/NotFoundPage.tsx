import React from "react";
import { Link } from "react-router-dom";

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-8xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-text-primary mb-2">
          페이지를 찾을 수 없습니다
        </h2>
        <p className="text-text-secondary mb-8">
          요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-colors"
        >
          <span className="material-symbols-outlined text-xl">home</span>
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
