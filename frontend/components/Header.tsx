import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import Logo from "./Logo.svg?react";

const Header: React.FC = () => {
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-solid border-card-border bg-background/95 backdrop-blur-md px-3 sm:px-4 md:px-10 lg:px-40 py-2 sm:py-3 pt-[max(0.5rem,env(safe-area-inset-top))]">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* 로고 */}
        <Link to="/" className="flex-shrink-0">
          <div className="flex items-center gap-2">
            <Logo className="w-7 h-7 sm:w-8 sm:h-8 text-text-primary" />
            <h2 className="text-text-primary text-sm sm:text-base font-bold whitespace-nowrap">
              <span className="sm:hidden">K-Food</span>
              <span className="hidden sm:inline">K-Food Export Passport</span>
            </h2>
          </div>
        </Link>

        {/* 네비게이션 */}
        <nav className="flex items-center gap-1 sm:gap-4">
          <Link
            to="/analyze"
            className={`px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors ${
              location.pathname === "/analyze"
                ? "text-white bg-primary"
                : "text-text-secondary hover:bg-card-sub-bg"
            }`}
          >
            분석
          </Link>
          <Link
            to="/history"
            className={`px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors ${
              location.pathname === "/history"
                ? "text-white bg-primary"
                : "text-text-secondary hover:bg-card-sub-bg"
            }`}
          >
            기록
          </Link>
          <button
            onClick={toggleTheme}
            className="p-1.5 sm:p-2 rounded-lg hover:bg-card-sub-bg transition-colors ml-1"
            aria-label="테마 변경"
          >
            <span className="material-symbols-outlined text-lg sm:text-xl text-text-secondary">
              {isDark ? "light_mode" : "dark_mode"}
            </span>
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
