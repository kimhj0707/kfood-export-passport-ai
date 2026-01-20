import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AnalyzePage from './pages/AnalyzePage';
import ReportPage from './pages/ReportPage';
import HistoryPage from './pages/HistoryPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import NotFoundPage from './pages/NotFoundPage';
import Header from './components/Header';
import Footer from './components/Footer';
import ToastContainer from './components/Toast';
import { ToastProvider } from './contexts/ToastContext';
import { ThemeProvider } from './contexts/ThemeContext';
import GuideTour from './components/GuideTour';
import KeyboardShortcuts from './components/KeyboardShortcuts';
import { v4 as uuidv4 } from 'uuid';

// 애니메이션 적용된 라우트
const AnimatedRoutes: React.FC = () => {
  const location = useLocation();

  return (
    <div key={location.pathname} className="animate-page-enter">
      <Routes location={location}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/analyze" element={<AnalyzePage />} />
        <Route path="/reports/:id" element={<ReportPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/terms-of-service" element={<TermsOfServicePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
};

const App: React.FC = () => {
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  useEffect(() => {
    let userId = localStorage.getItem('user_id');
    if (!userId) {
      userId = uuidv4();
      localStorage.setItem('user_id', userId);
      console.log('New user_id generated:', userId);
    } else {
      console.log('Existing user_id:', userId);
    }
  }, []);

  const handleOpenGuide = () => setIsGuideOpen(true);
  const handleCloseGuide = () => setIsGuideOpen(false);

  return (
    <ThemeProvider>
      <ToastProvider>
        <Router>
        <div className="flex flex-col min-h-screen w-full overflow-hidden">
          <Header onOpenGuide={handleOpenGuide} />
          <main className="flex-grow">
            <AnimatedRoutes />
          </main>
          <Footer />
        </div>
        <ToastContainer />
        <GuideTour isOpen={isGuideOpen} onClose={handleCloseGuide} />
        <KeyboardShortcuts />
        </Router>
      </ToastProvider>
    </ThemeProvider>
  );
};

export default App;