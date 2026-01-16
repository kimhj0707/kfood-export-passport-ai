
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-solid border-[#dde2e4] dark:border-gray-700 bg-white dark:bg-gray-800 px-4 md:px-10 lg:px-40 py-10">
      <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-2 text-primary">
          <span className="material-symbols-outlined">language_korean_latin</span>
          <span className="font-bold text-lg text-[#121617] dark:text-gray-200">K-Food 수출 패스포트 AI</span>
        </div>
        <div className="flex gap-8">
          <a className="text-sm font-medium text-[#677c83] dark:text-gray-400 hover:text-primary transition-colors" href="#">서비스 이용약관</a>
          <a className="text-sm font-medium text-[#677c83] dark:text-gray-400 hover:text-primary transition-colors" href="#">개인정보 처리방침</a>
        </div>
        <div className="text-xs text-[#677c83] dark:text-gray-400">
          © 2024 K-Food 수출 패스포트 AI. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
