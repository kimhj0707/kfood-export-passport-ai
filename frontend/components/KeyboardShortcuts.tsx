import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Shortcut {
  keys: string[];
  description: string;
  action?: () => void;
}

const KeyboardShortcuts: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const shortcuts: Shortcut[] = [
    { keys: ['Ctrl', 'K'], description: '분석 페이지로 이동', action: () => navigate('/analyze') },
    { keys: ['Ctrl', 'H'], description: '기록 페이지로 이동', action: () => navigate('/history') },
    { keys: ['Ctrl', '/'], description: '홈으로 이동', action: () => navigate('/') },
    { keys: ['?'], description: '단축키 도움말 열기/닫기' },
  ];

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // 입력 필드에서는 단축키 무시
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // ? 키로 단축키 모달 토글
      if (event.key === '?' && !event.ctrlKey && !event.metaKey) {
        setIsOpen((prev) => !prev);
        return;
      }

      // Escape로 모달 닫기
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        return;
      }

      // Ctrl+K: 분석 페이지
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        navigate('/analyze');
        return;
      }

      // Ctrl+H: 기록 페이지
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'h') {
        event.preventDefault();
        navigate('/history');
        return;
      }

      // Ctrl+/: 홈
      if ((event.ctrlKey || event.metaKey) && event.key === '/') {
        event.preventDefault();
        navigate('/');
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* 오버레이 */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />

      {/* 모달 */}
      <div className="relative bg-card border border-card-border rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-scale-in">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-card-border">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">keyboard</span>
            <h3 className="font-semibold text-text-primary">키보드 단축키</h3>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg hover:bg-card-sub-bg transition-colors text-text-muted hover:text-text-primary"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* 본문 */}
        <div className="p-5 space-y-3">
          {shortcuts.map((shortcut, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-2 px-3 rounded-lg bg-card-sub-bg"
            >
              <span className="text-sm text-text-secondary">{shortcut.description}</span>
              <div className="flex items-center gap-1">
                {shortcut.keys.map((key, j) => (
                  <React.Fragment key={j}>
                    <kbd className="px-2 py-1 text-xs font-mono font-medium bg-card border border-card-border rounded text-text-primary">
                      {key}
                    </kbd>
                    {j < shortcut.keys.length - 1 && (
                      <span className="text-text-muted text-xs">+</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* 푸터 */}
        <div className="px-5 py-3 bg-card-sub-bg border-t border-card-border">
          <p className="text-xs text-text-muted text-center">
            <kbd className="px-1.5 py-0.5 font-mono bg-card border border-card-border rounded text-text-secondary">?</kbd>
            {' '}를 눌러 언제든지 이 도움말을 열 수 있습니다
          </p>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcuts;
