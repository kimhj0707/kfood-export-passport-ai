import React from 'react';

interface SocialShareProps {
  url: string;
  title: string;
  description?: string;
}

const SocialShare: React.FC<SocialShareProps> = ({ url, title, description }) => {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDesc = encodeURIComponent(description || '');

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
  };

  const handleKakaoShare = () => {
    // 카카오톡 공유는 Kakao SDK가 필요하므로 링크 복사로 대체
    navigator.clipboard.writeText(url).then(() => {
      alert('링크가 복사되었습니다. 카카오톡에 붙여넣기 하세요!');
    });
  };

  const openShareWindow = (shareUrl: string) => {
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-text-muted mr-1">공유:</span>

      {/* Twitter */}
      <button
        onClick={() => openShareWindow(shareLinks.twitter)}
        className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#1DA1F2]/10 hover:bg-[#1DA1F2]/20 transition-colors group"
        title="Twitter에 공유"
      >
        <svg className="w-4 h-4 text-[#1DA1F2]" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </button>

      {/* Facebook */}
      <button
        onClick={() => openShareWindow(shareLinks.facebook)}
        className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#1877F2]/10 hover:bg-[#1877F2]/20 transition-colors group"
        title="Facebook에 공유"
      >
        <svg className="w-4 h-4 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      </button>

      {/* LinkedIn */}
      <button
        onClick={() => openShareWindow(shareLinks.linkedin)}
        className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#0A66C2]/10 hover:bg-[#0A66C2]/20 transition-colors group"
        title="LinkedIn에 공유"
      >
        <svg className="w-4 h-4 text-[#0A66C2]" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      </button>

      {/* 카카오톡 (링크 복사) */}
      <button
        onClick={handleKakaoShare}
        className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#FEE500]/20 hover:bg-[#FEE500]/40 transition-colors group"
        title="카카오톡으로 공유"
      >
        <svg className="w-4 h-4 text-[#391B1B]" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3zm5.907 8.06l1.47-1.424a.472.472 0 0 0-.656-.678l-1.928 1.866V9.282a.472.472 0 0 0-.944 0v2.557a.471.471 0 0 0 0 .222V13.5a.472.472 0 0 0 .944 0v-1.363l.427-.413 1.428 2.033a.472.472 0 1 0 .773-.543l-1.514-2.155zm-2.958 1.924h-1.46V9.297a.472.472 0 0 0-.943 0v4.159c0 .26.21.472.471.472h1.932a.472.472 0 1 0 0-.944zm-5.857-1.092l.696-1.707.638 1.707H9.092zm2.523.488l.002-.016a.469.469 0 0 0-.127-.32l-1.545-2.62a.47.47 0 0 0-.808 0l-1.55 2.21-.003.004a.473.473 0 0 0 .39.738h.001a.472.472 0 0 0 .401-.222l.347-.465h1.663l.347.465a.47.47 0 0 0 .39.206h.002a.472.472 0 0 0 .39-.738l-.002.003a.453.453 0 0 0 .102-.245zM5.81 13.984a.472.472 0 0 0 .471-.472V11.09h.986a.472.472 0 1 0 0-.944H4.353a.472.472 0 1 0 0 .944h.986v2.422c0 .26.21.472.471.472z" />
        </svg>
      </button>
    </div>
  );
};

export default SocialShare;
