import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import Logo from './Logo.svg?react';

const Header: React.FC = () => {
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-solid border-card-border bg-background/80 backdrop-blur-md px-4 md:px-10 lg:px-40 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
      <div className="flex items-center justify-between max-w-7xl mx-auto min-w-0">
        <Link to="/" className="flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <Logo className="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0" />
            <h2 className="text-text-primary text-sm sm:text-lg font-bold leading-tight tracking-tight whitespace-nowrap">K-Food Export Passport</h2>
          </div>
        </Link>
        <div className="flex flex-1 justify-end gap-3 sm:gap-6 items-center">
          <nav className="flex items-center gap-3 sm:gap-6">
            <Link
              to="/analyze"
              className={`text-sm font-semibold transition-colors hover:text-primary ${location.pathname === '/analyze' ? 'text-primary' : 'text-text-secondary'}`}
            >
              분석 시작
            </Link>
            <Link
              to="/history"
              className={`text-sm font-semibold transition-colors hover:text-primary ${location.pathname === '/history' ? 'text-primary' : 'text-text-secondary'}`}
            >
              히스토리
            </Link>
          </nav>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-card-sub-bg transition-colors"
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