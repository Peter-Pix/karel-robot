import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { AppHeader } from './components/AppHeader';
import { EmailFormView } from './components/EmailFormView';
import { ProcessingView } from './components/ProcessingView';
import { ResultView } from './components/ResultView';
import { SettingsModal } from './components/SettingsModal';
import { TourGuide } from './components/TourGuide';
import { ViewState, EmailInput, AnalysisResult } from './types';
import { LocalDemoEmailAnalyzer, ApiEmailAnalyzer, EmailAnalyzer } from './lib/emailAnalysis';

import { AiEmployeeFeature } from './components/AiEmployeeFeature';
import { AppFooter } from './components/AppFooter';

export default function App() {
  const [viewState, setViewState] = useState<ViewState>('form');
  const [emailData, setEmailData] = useState<EmailInput | undefined>(undefined);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState('deepseek-v4-flash');
  const [showTour, setShowTour] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // We keep a ref to ensure any lingering timers in sub-components don't
  // affect our state if we've unmounted or restarted them manually.
  const activeProcessRef = useRef(false);

  const handleSubmit = async (data: EmailInput) => {
    if (activeProcessRef.current) return; // Prevent duplicate submissions
    activeProcessRef.current = true;
    setEmailData(data);
    setViewState('processing');
    
    try {
      const analyzer: EmailAnalyzer = selectedModel === 'local-demo' 
        ? new LocalDemoEmailAnalyzer() 
        : new ApiEmailAnalyzer(selectedModel);
        
      const analysisResult = await analyzer.analyze(data);
      setResult(analysisResult);
    } catch (error) {
      console.error("Analysis failed:", error);
      handleRestart();
      // Optionally show an error toast here
      alert("Chyba při analýze e-mailu. Zkontrolujte nastavení modelu nebo API klíče.");
    }
  };

  const handleProcessingComplete = () => {
    if (activeProcessRef.current && result) {
      setViewState('result');
      activeProcessRef.current = false;
    }
  };

  const handleRestart = () => {
    activeProcessRef.current = false;
    setViewState('form');
    // We intentionally keep emailData to allow the user to modify their previous input
    setResult(null);
  };

  useEffect(() => {
    return () => {
      activeProcessRef.current = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-gray-200 dark:bg-[#0a0a0a] dark:text-gray-100 dark:selection:bg-brand">
      <AnimatePresence>
        {showTour && <TourGuide onClose={() => setShowTour(false)} />}
      </AnimatePresence>

      <div className="sticky top-0 z-50 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-gray-200 dark:border-white/[0.06]">
        <div className="mx-auto flex items-center justify-center gap-2 px-4 py-1.5 text-xs">
          <span className="text-gray-400 dark:text-zinc-500">🔬</span>
          <span className="text-gray-500 dark:text-zinc-500">Součást AI ekosystému</span>
          <a
            href="https://petrpiskacek.cloud"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-700 dark:text-zinc-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            AI Lab
          </a>
          <span className="text-gray-300 dark:text-zinc-700">·</span>
          <a
            href="https://4rap.cz"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-700 dark:text-zinc-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            4rap.cz
          </a>
        </div>
      </div>

      <AppHeader 
        onRestart={handleRestart} 
        onOpenSettings={() => setIsSettingsOpen(true)} 
        onOpenTour={() => setShowTour(true)} 
        isDarkMode={isDarkMode}
        toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
      />
      
      <main className="w-full pt-4 sm:pt-8 md:pt-12">
        <AnimatePresence mode="wait">
          {viewState === 'form' && (
            <EmailFormView 
              key="form" 
              initialData={emailData} 
              onSubmit={handleSubmit} 
            />
          )}
          {viewState === 'processing' && (
            <ProcessingView 
              key="processing" 
              onComplete={handleProcessingComplete} 
            />
          )}
          {viewState === 'result' && result && (
            <ResultView 
              key="result" 
              result={result} 
              onRestart={handleRestart} 
            />
          )}
        </AnimatePresence>
      </main>

      {viewState === 'form' && <AiEmployeeFeature />}

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        selectedModel={selectedModel}
        onModelSelect={(model) => {
          setSelectedModel(model);
          setIsSettingsOpen(false);
        }}
      />

      <AppFooter />
    </div>
  );
}
