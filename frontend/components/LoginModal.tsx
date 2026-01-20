import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('이메일을 입력해주세요.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('유효한 이메일 형식을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);

    const result = await login(email);

    setIsSubmitting(false);

    if (result.success) {
      setEmail('');
      onClose();
    } else {
      setError(result.error || '로그인에 실패했습니다.');
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      onClick={handleBackdropClick}
    >
      {/* 오버레이 */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* 모달 */}
      <div className="relative bg-card border border-card-border rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-scale-in">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-card-border">
          <h2 className="text-xl font-bold text-text-primary">로그인</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-card-sub-bg transition-colors"
          >
            <span className="material-symbols-outlined text-text-secondary">close</span>
          </button>
        </div>

        {/* 콘텐츠 */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <p className="text-text-secondary text-sm mb-4">
              이메일을 입력하면 이전에 분석한 기록을 확인할 수 있습니다.
            </p>
            <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
              이메일
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              className="w-full px-4 py-3 rounded-lg border border-card-border bg-background text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              disabled={isSubmitting}
              autoFocus
            />
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-sm text-red-500">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 rounded-lg bg-primary text-white font-medium hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
                로그인 중...
              </>
            ) : (
              '로그인'
            )}
          </button>

          <p className="mt-4 text-xs text-text-muted text-center">
            계정이 없으면 자동으로 생성됩니다.
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
