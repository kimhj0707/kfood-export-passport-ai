import React, { useEffect, useRef } from 'react';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title?: string;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({ isOpen, onClose, url, title = '리포트 공유' }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // QR 코드 API URL (Google Charts API)
  const qrCodeUrl = `https://chart.googleapis.com/chart?cht=qr&chs=250x250&chl=${encodeURIComponent(url)}&choe=UTF-8`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url).then(() => {
      alert('링크가 복사되었습니다!');
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        ref={modalRef}
        className="relative bg-card border border-card-border rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden animate-scale-in"
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-card-border">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">qr_code_2</span>
            <h3 className="font-semibold text-text-primary">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-card-sub-bg transition-colors text-text-muted hover:text-text-primary"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* 본문 */}
        <div className="p-6 flex flex-col items-center">
          <p className="text-sm text-text-secondary text-center mb-4">
            QR 코드를 스캔하여 리포트를 확인하세요
          </p>

          {/* QR 코드 이미지 */}
          <div className="bg-white p-4 rounded-xl shadow-inner mb-4">
            <img
              src={qrCodeUrl}
              alt="QR Code"
              className="w-48 h-48"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>

          {/* URL 표시 */}
          <div className="w-full bg-card-sub-bg rounded-lg p-3 mb-4">
            <p className="text-xs text-text-muted text-center break-all font-mono">
              {url.length > 50 ? url.substring(0, 50) + '...' : url}
            </p>
          </div>

          {/* 버튼들 */}
          <div className="flex gap-3 w-full">
            <button
              onClick={handleCopyLink}
              className="flex-1 flex items-center justify-center gap-2 h-11 rounded-lg bg-card border border-card-border text-text-primary text-sm font-medium hover:bg-card-sub-bg transition-colors"
            >
              <span className="material-symbols-outlined text-base">content_copy</span>
              링크 복사
            </button>
            <button
              onClick={onClose}
              className="flex-1 flex items-center justify-center gap-2 h-11 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors"
            >
              완료
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeModal;
