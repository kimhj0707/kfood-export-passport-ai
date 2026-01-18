import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
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
import { v4 as uuidv4 } from 'uuid';

const App: React.FC = () => {
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

  return (
    <ThemeProvider>
      <ToastProvider>
        <Router>
        <div className="flex flex-col min-h-screen w-full overflow-hidden">
          <Header />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/analyze" element={<AnalyzePage />} />
              <Route path="/reports/:id" element={<ReportPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
              <Route path="/terms-of-service" element={<TermsOfServicePage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
        <ToastContainer />
        </Router>
      </ToastProvider>
    </ThemeProvider>
  );
};

export default App;