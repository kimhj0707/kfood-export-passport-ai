
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyzeLabel } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import AnalysisProgress from '../components/AnalysisProgress';

const AnalyzePage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [country, setCountry] = useState('US');
  const [ocrEngine, setOcrEngine] = useState('google');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];

      // 파일 크기 체크 (10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        showToast('error', '파일 크기는 10MB를 초과할 수 없습니다.');
        return;
      }

      setFile(selectedFile);

      // 이미지 미리보기 생성
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreview(null);
    // input 초기화
    const input = document.getElementById('fileInput') as HTMLInputElement;
    if (input) input.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      showToast('warning', '분석할 이미지를 업로드해주세요.');
      return;
    }

    setIsAnalyzing(true);
    try {
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
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-bg-light min-h-[calc(100vh-160px)]">
      <div className="w-full max-w-[600px]">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-black text-[#121617] mb-2 tracking-tight">라벨 분석 시작</h2>
          <p className="text-[#677c83]">수출용 식품 라벨 이미지를 업로드하고 분석을 시작하세요.</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-[#dde2e4] overflow-hidden">
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#121617]">라벨 이미지 업로드 (JPG, PNG)</label>

                {/* 이미지 미리보기 */}
                {preview ? (
                  <div className="relative">
                    <div className="relative w-full rounded-xl overflow-hidden border-2 border-primary bg-gray-50">
                      <img
                        src={preview}
                        alt="미리보기"
                        className="w-full max-h-64 object-contain"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                        <p className="text-white text-sm font-medium truncate">{file?.name}</p>
                        <p className="text-white/70 text-xs">
                          {file && (file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  </div>
                ) : (
                  <div
                    className="relative group flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl transition-colors cursor-pointer border-[#dde2e4] bg-gray-50 hover:bg-gray-100 hover:border-primary"
                    onClick={() => document.getElementById('fileInput')?.click()}
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <span className="material-symbols-outlined text-4xl mb-3 text-gray-400">
                        cloud_upload
                      </span>
                      <p className="mb-2 text-sm text-[#121617] font-medium">
                        클릭하거나 파일을 여기로 끌어다 놓으세요
                      </p>
                      <p className="text-xs text-[#677c83]">최대 파일 크기: 10MB</p>
                    </div>
                  </div>
                )}

                <input
                  id="fileInput"
                  accept="image/jpeg,image/png"
                  className="hidden"
                  type="file"
                  onChange={handleFileChange}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-[#121617] flex items-center gap-2" htmlFor="country">
                  <span className="material-symbols-outlined text-sm">public</span>
                  수출 대상 국가
                </label>
                <div className="relative">
                  <select
                    id="country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="block w-full rounded-lg border-[#dde2e4] bg-white py-3 px-4 text-[#121617] focus:border-primary focus:ring-primary text-sm appearance-none cursor-pointer"
                  >
                    <option value="US">미국 (USA)</option>
                    <option value="JP">일본 (Japan)</option>
                    <option value="VN">베트남 (Vietnam)</option>
                    <option value="EU">유럽연합 (EU)</option>
                    <option value="CN">중국 (China)</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                    <span className="material-symbols-outlined">expand_more</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-[#121617] flex items-center gap-2" htmlFor="ocr">
                  <span className="material-symbols-outlined text-sm">document_scanner</span>
                  OCR 엔진 선택
                </label>
                <div className="relative">
                  <select
                    id="ocr"
                    value={ocrEngine}
                    onChange={(e) => setOcrEngine(e.target.value)}
                    className="block w-full rounded-lg border-[#dde2e4] bg-white py-3 px-4 text-[#121617] focus:border-primary focus:ring-primary text-sm appearance-none cursor-pointer"
                  >
                    <option value="google">Google Cloud Vision</option>
                    <option value="tesseract">Tesseract</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                    <span className="material-symbols-outlined">expand_more</span>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  disabled={isAnalyzing || !file}
                  className={`w-full flex items-center justify-center rounded-lg h-14 text-white text-lg font-bold shadow-lg transition-all active:scale-[0.98]
                    ${isAnalyzing || !file ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-opacity-90'}`}
                  type="submit"
                >
                  {isAnalyzing ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      분석 중...
                    </span>
                  ) : (
                    <>
                      <span>분석 시작하기</span>
                      <span className="material-symbols-outlined ml-2">arrow_forward</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3 p-4 bg-white/50 rounded-lg">
            <span className="material-symbols-outlined text-primary text-sm">info</span>
            <p className="text-xs text-[#677c83]">선명한 이미지를 업로드할수록 OCR 분석의 정확도가 올라갑니다.</p>
          </div>
          <div className="flex items-start gap-3 p-4 bg-white/50 rounded-lg">
            <span className="material-symbols-outlined text-primary text-sm">security</span>
            <p className="text-xs text-[#677c83]">업로드된 이미지는 분석 완료 후 관련 보안 규정에 따라 처리됩니다.</p>
          </div>
        </div>
      </div>

      <AnalysisProgress isOpen={isAnalyzing} />
    </div>
  );
};

export default AnalyzePage;
