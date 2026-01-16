import React from "react";
import Logo from "./Logo.svg";

const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-solid border-card-border bg-background px-4 md:px-10 lg:px-40 py-10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-3">
          <img src={Logo} alt="Logo" className="w-8 h-8" />
          <span className="font-bold text-lg text-text-primary">
            K-Food Export Passport
          </span>
        </div>
        <div className="flex gap-8">
          <a
            className="text-sm font-medium text-text-muted hover:text-text-primary transition-colors"
            href="#/terms-of-service"
          >
            서비스 이용약관
          </a>
          <a
            className="text-sm font-medium text-text-muted hover:text-text-primary transition-colors"
            href="#/privacy-policy"
          >
            개인정보 처리방침
          </a>
        </div>
        <div className="text-xs text-text-muted">
          © 2024 K-Food Export Passport. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
