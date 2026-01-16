import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import Logo from './Logo.svg?react';

const Header: React.FC = () => {
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-solid border-card-border bg-background/80 backdrop-blur-md px-4 md:px-10 lg:px-40 py-2.5 sm:py-3 pt-[max(0.625rem,env(safe-area-inset-top))] sm:pt-[max(0.75rem,env(safe-area-inset-top))]">
      <div className="flex items-center justify-between max-w-7xl mx-auto min-w-0">
        {/* 로고 - 모바일에서는 아이콘만, sm 이상에서 텍스트 표시 */}
        <Link to="/" className="flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <Logo className="w-8 h-8 sm:w-8 sm:h-8 flex-shrink-0" />
            <h2 className="hidden sm:block text-text-primary text-lg font-bold leading-tight tracking-tight whitespace-nowrap">
              K-Food Export Passport
            </h2>
          </div>
        </Link>

        {/* 네비게이션 - 모바일에서는 아이콘, sm 이상에서 텍스트 */}
        <div className="flex items-center gap-1 sm:gap-6">
          <nav className="flex items-center gap-1 sm:gap-6">
            <Link
              to="/analyze"
              className={`flex items-center gap-1.5 px-3 py-2 sm:px-0 sm:py-0 rounded-lg sm:rounded-none transition-colors hover:text-primary hover:bg-card-sub-bg sm:hover:bg-transparent ${location.pathname === '/analyze' ? 'text-primary bg-primary/10 sm:bg-transparent' : 'text-text-secondary'}`}
            >
              <span className="material-symbols-outlined text-xl sm:hidden">upload_file</span>
              <span className="hidden sm:inline text-sm font-semibold">분석 시작</span>
            </Link>
            <Link
              to="/history"
              className={`flex items-center gap-1.5 px-3 py-2 sm:px-0 sm:py-0 rounded-lg sm:rounded-none transition-colors hover:text-primary hover:bg-card-sub-bg sm:hover:bg-transparent ${location.pathname === '/history' ? 'text-primary bg-primary/10 sm:bg-transparent' : 'text-text-secondary'}`}
            >
              <span className="material-symbols-outlined text-xl sm:hidden">history</span>
              <span className="hidden sm:inline text-sm font-semibold">히스토리</span>
            </Link>
          </nav>
          <button
            onClick={toggleTheme}
            className="p-2.5 sm:p-2 rounded-lg hover:bg-card-sub-bg transition-colors"
            aria-label="테마 변경"
          >
            <span className="material-symbols-outlined text-xl text-text-secondary hover:text-text-primary">
              {isDark ? 'light_mode' : 'dark_mode'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;