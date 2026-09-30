import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { AppHeader } from './components/AppHeader';
import { EmailFormView } from './components/EmailFormView';
import { ProcessingView } from './components/ProcessingView';
import { ResultView } from './components/ResultView';
import { ErrorView } from './components/ErrorView';
import { SettingsModal } from './components/SettingsModal';
import { TourGuide } from './components/TourGuide';
import { ViewState, EmailInput, AnalysisResult } from './types';
import { LocalDemoEmailAnalyzer, ApiEmailAnalyzer, EmailAnalyzer, AnalysisError } from './lib/emailAnalysis';

import { AiEmployeeFeature } from './components/AiEmployeeFeature';
import { ValueProposition } from './components/ValueProposition';
import { AppFooter } from './components/AppFooter';

export default function App() {
  const [viewState, setViewState] = useState<ViewState>('form');
  const [emailData, setEmailData] = useState<EmailInput | undefined>(undefined);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  // Structured error state — when the LLM backend fails we show a clear
  // in-UI error instead of a bad classification or a crude browser alert.
  const [error, setError] = useState<{ message: string; retryable: boolean } | null>(null);
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gemma4:31b');
  const [showTour, setShowTour] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

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
  // Records when the user submitted — used to report the honest end-to-end
  // time (submit → result) in the metrics card.
  const submitStartRef = useRef(0);

  const handleSubmit = async (data: EmailInput) => {
    if (activeProcessRef.current) return; // Prevent duplicate submissions
    activeProcessRef.current = true;
    submitStartRef.current = Date.now();
    setEmailData(data);
    setError(null);
    setViewState('processing');
    
    try {
      const analyzer: EmailAnalyzer = selectedModel === 'local-demo' 
        ? new LocalDemoEmailAnalyzer() 
        : new ApiEmailAnalyzer(selectedModel);
        
      const analysisResult = await analyzer.analyze(data);
      // Report the real time the user waited (submit → result). This is the
      // honest figure — the model's self-reported aiSeconds and even the pure
      // server latency understate what the user actually experiences.
      const elapsedSeconds = Math.max(1, Math.round((Date.now() - submitStartRef.current) / 1000));
      analysisResult.aiSeconds = elapsedSeconds;
      setResult(analysisResult);
    } catch (err) {
      console.error("Analysis failed:", err);
      // Show a clear, structured error in the UI — never a bad classification.
      if (err instanceof AnalysisError) {
        setError({ message: err.message, retryable: err.retryable });
      } else {
        setError({
          message: 'Analýza se nezdařila. Zkontrolujte nastavení modelu nebo API klíče.',
          retryable: false,
        });
      }
      setResult(null);
      setViewState('error');
      activeProcessRef.current = false;
    }
  };

  const handleProcessingComplete = () => {
    if (activeProcessRef.current && result) {
      setViewState('result');
      activeProcessRef.current = false;
    }
  };

  const handleRetry = () => {
    // Re-run the analysis with the same input and model.
    if (emailData) {
      handleSubmit(emailData);
    } else {
      handleRestart();
    }
  };

  const handleRestart = () => {
    activeProcessRef.current = false;
    setViewState('form');
    // We intentionally keep emailData to allow the user to modify their previous input
    setResult(null);
    setError(null);
  };

  useEffect(() => {
    return () => {
      activeProcessRef.current = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-gray-900 selection:bg-brand/30 dark:bg-zinc-950 dark:text-zinc-100 dark:selection:bg-brand/40 transition-colors duration-300">
      <AnimatePresence>
        {showTour && <TourGuide onClose={() => setShowTour(false)} />}
      </AnimatePresence>

      <div className="sticky top-0 z-50 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl border-b border-gray-200 dark:border-white/[0.06]">
        <div className="mx-auto flex items-center justify-center gap-2 px-4 py-1.5 text-[10px] uppercase tracking-wider font-medium">
          <span className="text-gray-400 dark:text-zinc-500">🔬</span>
          <span className="text-gray-500 dark:text-zinc-500">Sovereign AI Ecosystem</span>
          <a
            href="https://petrpiskacek.cloud"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-700 dark:text-zinc-300 hover:text-brand dark:hover:text-brand transition-colors"
          >
            AI Lab
          </a>
          <span className="text-gray-300 dark:text-zinc-700">·</span>
          <a
            href="https://4rap.cz"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-700 dark:text-zinc-300 hover:text-brand dark:hover:text-brand transition-colors"
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
            <div id="demo">
            <EmailFormView 
              key="form" 
              initialData={emailData} 
              onSubmit={handleSubmit} 
            />
            </div>
          )}
          {viewState === 'processing' && (
            <ProcessingView 
              key="processing" 
              onComplete={handleProcessingComplete}
              isComplete={!!result}
            />
          )}
          {viewState === 'error' && error && (
            <ErrorView 
              key="error" 
              message={error.message} 
              retryable={error.retryable}
              onRetry={handleRetry} 
              onEdit={handleRestart} 
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

      {viewState === 'form' && (
        <>
          <ValueProposition />
          <AiEmployeeFeature />
        </>
      )}

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
