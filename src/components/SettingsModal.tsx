import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedModel: string;
  onModelSelect: (model: string) => void;
}

interface OllamaModel {
  name: string;
  modified_at: string;
  size: number;
}

export function SettingsModal({ isOpen, onClose, selectedModel, onModelSelect }: SettingsModalProps) {
  const [models, setModels] = useState<OllamaModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && models.length === 0) {
      fetchModels();
    }
  }, [isOpen]);

  const fetchModels = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/models');
      if (!response.ok) {
        throw new Error('Failed to fetch models');
      }
      const data = await response.json();
      setModels(data.models || []);
    } catch (err) {
      console.error(err);
      setError('Nepodařilo se načíst modely z Ollama API.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-[#111]"
        >
          <div className="flex items-center justify-between p-6 border-b border-black/5 dark:border-white/5">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Nastavení AI Modelu</h2>
            <button
              onClick={onClose}
              className="p-3 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-700"
              aria-label="Zavřít nastavení"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 md:p-12 max-w-4xl mx-auto w-full mt-8">
            <p className="text-gray-500 dark:text-gray-400 mb-12 text-lg font-light">
              Vyberte cloudový model Ollama pro analýzu e-mailů. Aplikace pro komunikaci používá nastavený OLLAMA_API_KEY.
            </p>

            {loading ? (
              <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400 font-light">
                <div className="w-5 h-5 border-2 border-gray-900 dark:border-brand border-t-transparent rounded-full animate-spin" />
                Načítání dostupných modelů...
              </div>
            ) : error ? (
              <div className="text-gray-900 dark:text-gray-100 font-light border-b border-gray-100 dark:border-gray-800 pb-4">
                {error}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {models.length === 0 ? (
                  <div className="text-gray-500 dark:text-gray-400 font-light">Žádné modely nebyly nalezeny.</div>
                ) : (
                  models.map((model) => (
                    <button
                      key={model.name}
                      onClick={() => onModelSelect(model.name)}
                      className={`text-left py-6 border-b transition-all flex items-center justify-between group ${
                        selectedModel === model.name
                          ? 'border-gray-900 dark:border-brand'
                          : 'border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <div className="flex flex-col gap-1">
                        <div className={`text-xl font-light tracking-tight ${
                          selectedModel === model.name ? 'text-gray-900 dark:text-brand' : 'text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100'
                        }`}>{model.name}</div>
                        <div className="text-xs text-gray-400 uppercase tracking-widest font-semibold">
                          <span>{(model.size / 1024 / 1024 / 1024).toFixed(1)} GB</span>
                        </div>
                      </div>
                      {selectedModel === model.name && (
                        <div className="w-2 h-2 rounded-full bg-gray-900 dark:bg-brand" />
                      )}
                    </button>
                  ))
                )}
              </div>
            )}
            
            {/* Fallback Option */}
            <div className="mt-16 pt-8">
              <h3 className="text-[11px] font-semibold tracking-widest text-gray-400 uppercase mb-4">Lokální testování</h3>
              <button
                onClick={() => onModelSelect('local-demo')}
                className={`text-left py-6 border-b transition-all w-full flex items-center justify-between group ${
                  selectedModel === 'local-demo'
                    ? 'border-gray-900 dark:border-brand'
                    : 'border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex flex-col gap-1">
                  <div className={`text-xl font-light tracking-tight ${
                    selectedModel === 'local-demo' ? 'text-gray-900 dark:text-brand' : 'text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100'
                  }`}>Local Demo</div>
                  <div className="text-xs text-gray-400 font-light">
                    Bez volání API
                  </div>
                </div>
                {selectedModel === 'local-demo' && (
                  <div className="w-2 h-2 rounded-full bg-gray-900 dark:bg-brand" />
                )}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
