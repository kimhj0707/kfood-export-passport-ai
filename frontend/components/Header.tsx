
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

const Header: React.FC = () => {
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-solid border-[#dde2e4] dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md px-4 md:px-10 lg:px-40 py-4">
      <div className="flex items-center justify-between whitespace-nowrap max-w-[1200px] mx-auto">
        <Link to="/" className="flex items-center gap-3 text-primary">
          <div className="size-8 flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl">language_korean_latin</span>
          </div>
          <h2 className="text-[#121617] dark:text-white text-lg font-bold leading-tight tracking-tight">K-Food 수출 패스포트 AI</h2>
        </Link>
        <div className="flex flex-1 justify-end gap-6 items-center">
          <nav className="flex items-center gap-6">
            <Link
              to="/analyze"
              className={`text-sm font-semibold transition-colors hover:text-primary ${location.pathname === '/analyze' ? 'text-primary' : 'text-[#121617] dark:text-gray-300'}`}
            >
              분석 시작
            </Link>
            <Link
              to="/history"
              className={`text-sm font-semibold transition-colors hover:text-primary ${location.pathname === '/history' ? 'text-primary' : 'text-[#121617] dark:text-gray-300'}`}
            >
              히스토리
            </Link>
          </nav>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="테마 변경"
          >
            <span className="material-symbols-outlined text-xl text-[#121617] dark:text-gray-300">
              {isDark ? 'light_mode' : 'dark_mode'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
