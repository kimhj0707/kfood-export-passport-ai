import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { analyzeLabel, getUser, linkEmail } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import AnalysisProgress from '../components/AnalysisProgress';

// 샘플 라벨 데이터
const SAMPLE_LABELS = [
  { id: 1, name: '신라면', path: '/samples/sample_label_1.svg', description: '라면 제품 라벨' },
  { id: 2, name: '녹차 음료', path: '/samples/sample_label_2.svg', description: '음료 제품 라벨' },
  { id: 3, name: '참치 김밥', path: '/samples/sample_label_3.svg', description: '알레르겐 포함 제품' },
];

const AnalyzePage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [country, setCountry] = useState('US');
  const [ocrEngine, setOcrEngine] = useState('google');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showSamples, setShowSamples] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [emailInput, setEmailInput] = useState('');

  useEffect(() => {
    let currentUserId = localStorage.getItem('user_id');
    if (!currentUserId) {
      currentUserId = uuidv4();
      localStorage.setItem('user_id', currentUserId);
    }
    const fetchUserEmail = async () => {
      if (currentUserId) {
        const { email } = await getUser(currentUserId);
        if (email) {
          setUserEmail(email);
          setEmailInput(email);
        }
      }
    };
    fetchUserEmail();
  }, []);

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile) return;
    if (!['image/jpeg', 'image/png', 'image/svg+xml'].includes(selectedFile.type)) {
      showToast('error', 'JPG, PNG 또는 SVG 파일만 업로드할 수 있습니다.');
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      showToast('error', '파일 크기는 10MB를 초과할 수 없습니다.');
      return;
    }
    setFile(selectedFile);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(selectedFile);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSampleSelect = async (sample: typeof SAMPLE_LABELS[0]) => {
    try {
      const response = await fetch(sample.path);
      const blob = await response.blob();
      const file = new File([blob], `${sample.name}.svg`, { type: 'image/svg+xml' });
      setFile(file);
      setPreview(sample.path);
      setShowSamples(false);
      showToast('success', `'${sample.name}' 샘플이 선택되었습니다.`);
    } catch (error) {
      showToast('error', '샘플 이미지를 불러오는데 실패했습니다.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      showToast('warning', '분석할 이미지를 업로드해주세요.');
      return;
    }

    setIsAnalyzing(true);
    let currentUserId = localStorage.getItem('user_id');
    if (!currentUserId) {
      currentUserId = uuidv4();
      localStorage.setItem('user_id', currentUserId);
    }

    try {
      if (emailInput && emailInput !== userEmail) {
        await linkEmail(currentUserId, emailInput);
        setUserEmail(emailInput);
        showToast('success', '이메일이 성공적으로 연결되었습니다.');
      }
      const reportId = await analyzeLabel(file, country, ocrEngine);
      showToast('success', '분석이 완료되었습니다!');
      navigate(`/reports/${reportId}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : '분석 중 오류가 발생했습니다.';
      showToast('error', message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-background text-text-primary min-h-[calc(100vh-160px)]">
      <div className="w-full max-w-2xl">
        <div className="rounded-2xl border border-card-border bg-card shadow-lg dark:backdrop-blur-lg overflow-hidden">
          <div className="p-8">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-black text-text-primary mb-2 tracking-tight">라벨 분석 시작</h2>
              <p className="text-text-secondary">수출용 식품 라벨 이미지를 업로드하고 분석을 시작하세요.</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-text-primary">라벨 이미지 업로드 (JPG, PNG, SVG)</label>
                {preview ? (
                  <div className="relative">
                    <div className="relative w-full rounded-xl overflow-hidden border-2 border-primary bg-card-sub-bg">
                      <img src={preview} alt="미리보기" className="w-full max-h-64 object-contain" />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                        <p className="text-white text-sm font-medium truncate">{file?.name}</p>
                        <p className="text-white/70 text-xs">{file && (file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <button type="button" onClick={handleRemoveFile} className="absolute top-2 right-2 p-2 bg-red-600 hover:bg-red-500 text-white rounded-full shadow-lg transition-colors" aria-label="파일 제거">
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  </div>
                ) : (
                  <div
                    className={`relative group flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl transition-colors cursor-pointer 
                      ${isDragging ? 'border-primary bg-primary/10' : 'border-card-border bg-card-sub-bg hover:border-primary/50'}`}
                    onClick={() => inputRef.current?.click()}
                    onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onDragOver={handleDragOver} onDrop={handleDrop}
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <span className="material-symbols-outlined text-4xl mb-3 text-text-muted group-hover:animate-bounce">cloud_upload</span>
                      <p className="mb-2 text-sm text-text-primary font-medium">클릭하거나 파일을 여기로 끌어다 놓으세요</p>
                      <p className="text-xs text-text-muted">최대 파일 크기: 10MB</p>
                    </div>
                  </div>
                )}
                <input ref={inputRef} id="fileInput" accept="image/jpeg,image/png,image/svg+xml" className="hidden" type="file" onChange={handleFileChange} />

                {/* 샘플 라벨 버튼 */}
                {!preview && (
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => setShowSamples(!showSamples)}
                      className="flex items-center gap-2 text-sm text-primary hover:text-primary-hover font-medium transition-colors"
                    >
                      <span className="material-symbols-outlined text-lg">science</span>
                      {showSamples ? '샘플 닫기' : '샘플 라벨로 테스트하기'}
                      <span className="material-symbols-outlined text-sm">
                        {showSamples ? 'expand_less' : 'expand_more'}
                      </span>
                    </button>

                    {showSamples && (
                      <div className="mt-3 grid grid-cols-3 gap-3">
                        {SAMPLE_LABELS.map((sample) => (
                          <button
                            key={sample.id}
                            type="button"
                            onClick={() => handleSampleSelect(sample)}
                            className="group flex flex-col items-center p-3 rounded-xl border border-card-border bg-card-sub-bg hover:border-primary hover:bg-primary/5 transition-all"
                          >
                            <div className="w-full aspect-[2/3] rounded-lg overflow-hidden bg-white border border-card-border mb-2">
                              <img
                                src={sample.path}
                                alt={sample.name}
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <span className="text-xs font-medium text-text-primary group-hover:text-primary">{sample.name}</span>
                            <span className="text-[10px] text-text-muted">{sample.description}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-text-primary flex items-center gap-2" htmlFor="email">
                  <span className="material-symbols-outlined text-sm">mail</span>이메일 (선택 사항)
                </label>
                <input id="email" type="email" placeholder="user@example.com" value={emailInput} onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full rounded-lg border border-card-border bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 py-3 px-4 text-sm focus:border-primary focus:ring-0" />
                <p className="text-xs text-text-muted">이메일을 입력하시면 분석 이력이 해당 이메일로 식별됩니다.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-text-primary flex items-center gap-2" htmlFor="country">
                    <span className="material-symbols-outlined text-sm">public</span>수출 대상 국가
                  </label>
                  <div className="relative">
                    <select id="country" value={country} onChange={(e) => setCountry(e.target.value)}
                      className="block w-full rounded-lg border border-card-border bg-white dark:bg-slate-800 py-3 px-4 text-slate-900 dark:text-white focus:border-primary focus:ring-0 text-sm appearance-none cursor-pointer">
                      <option value="US">🇺🇸 미국 (USA)</option><option value="JP">🇯🇵 일본 (Japan)</option><option value="VN">🇻🇳 베트남 (Vietnam)</option><option value="EU">🇪🇺 유럽연합 (EU)</option><option value="CN">🇨🇳 중국 (China)</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-text-muted"><span className="material-symbols-outlined">expand_more</span></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-text-primary flex items-center gap-2" htmlFor="ocr">
                    <span className="material-symbols-outlined text-sm">document_scanner</span>OCR 엔진 선택
                  </label>
                  <div className="relative">
                    <select id="ocr" value={ocrEngine} onChange={(e) => setOcrEngine(e.target.value)}
                      className="block w-full rounded-lg border border-card-border bg-white dark:bg-slate-800 py-3 px-4 text-slate-900 dark:text-white focus:border-primary focus:ring-0 text-sm appearance-none cursor-pointer">
                      <option value="google">Google Cloud Vision</option><option value="tesseract">Tesseract</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-text-muted"><span className="material-symbols-outlined">expand_more</span></div>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button disabled={isAnalyzing || !file} className={`w-full flex items-center justify-center rounded-lg h-14 text-white text-lg font-bold shadow-lg transition-all active:scale-[0.98] 
                  ${isAnalyzing || !file ? 'bg-text-muted/50 cursor-not-allowed' : 'bg-primary hover:bg-primary-hover'}`} type="submit">
                  {isAnalyzing ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      분석 중...
                    </span>
                  ) : (
                    <><span>분석 시작하기</span><span className="material-symbols-outlined ml-2">arrow_forward</span></>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-4 rounded-xl border border-card-border bg-card">
            <span className="material-symbols-outlined text-primary text-lg">info</span>
            <p className="text-xs text-text-secondary">선명한 이미지를 업로드할수록 OCR 분석의 정확도가 올라갑니다.</p>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-xl border border-card-border bg-card">
            <span className="material-symbols-outlined text-primary text-lg">security</span>
            <p className="text-xs text-text-secondary">업로드된 이미지는 분석 완료 후 관련 보안 규정에 따라 처리됩니다.</p>
          </div>
        </div>
      </div>

      <AnalysisProgress isOpen={isAnalyzing} />
    </div>
  );
};

export default AnalyzePage;