import React from 'react';
import { RobotIcon } from './icons/RobotIcon';
import { Settings, Play, Moon, Sun } from 'lucide-react';

interface AppHeaderProps {
  onRestart?: () => void;
  onOpenSettings: () => void;
  onOpenTour: () => void;
  isDarkMode?: boolean;
  toggleDarkMode?: () => void;
}

export function AppHeader({ onRestart, onOpenSettings, onOpenTour, isDarkMode, toggleDarkMode }: AppHeaderProps) {
  return (
    <header className="w-full flex items-center justify-between py-4 md:py-6 px-4 md:px-12 max-w-7xl mx-auto">
      <button 
        onClick={onRestart}
        className="flex items-center gap-2 text-gray-900 dark:text-gray-100 hover:opacity-70 transition-opacity focus:outline-none focus:ring-2 focus:ring-gray-300 rounded-md p-1"
        aria-label="Návrat na formulář"
      >
        <div className="bg-black dark:bg-brand text-white dark:text-black p-1.5 rounded-lg">
          <RobotIcon className="w-5 h-5" />
        </div>
        <span className="font-semibold text-lg tracking-tight">Karel Robot</span>
      </button>
      
      <div className="flex items-center gap-2 sm:gap-4">
        <button 
          onClick={onOpenTour}
          className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 outline-none"
        >
          <Play className="w-4 h-4" />
          <span className="hidden sm:inline">Průvodce</span>
        </button>
        <button 
          onClick={toggleDarkMode}
          className="p-2.5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-700"
          aria-label="Přepnout motiv"
        >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        <button 
          onClick={onOpenSettings}
          className="p-2.5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-700"
          aria-label="Nastavení modelu"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
