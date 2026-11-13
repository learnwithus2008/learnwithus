import React, { useState, useEffect } from 'react';
import {
  X,
  BookOpen,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  Search,
  Globe,
  Layers
} from 'lucide-react';
import { useDictionary } from '../../context/DictionaryContext';
import WordMeaningSearch from './WordMeaningSearch';
import WordMeaningResult from './WordMeaningResult';
import { LEARNING_STAGES } from '../../data/learningStages';
import { LEARNING_LANGUAGES } from '../../data/learningLanguages';

export default function GlobalWordMeaningModal() {
  const {
    isOpen,
    isMinimized,
    isExpanded,
    closeDictionary,
    minimizeDictionary,
    restoreDictionary,
    toggleExpanded,
    query,
    setQuery,
    result,
    isSearching,
    error,
    lookupWord,
    selectedLanguage,
    selectedStage
  } = useDictionary();

  const [activeStage, setActiveStage] = useState(selectedStage);
  const [activeLanguage, setActiveLanguage] = useState(selectedLanguage);

  useEffect(() => {
    if (isOpen) {
      setActiveStage(selectedStage);
      setActiveLanguage(selectedLanguage);
    }
  }, [isOpen, selectedStage, selectedLanguage]);

  const handleStageChange = (newStage) => {
    setActiveStage(newStage);
    if (query.trim()) {
      lookupWord(query.trim(), activeLanguage, newStage);
    }
  };

  const handleLanguageChange = (newLang) => {
    setActiveLanguage(newLang);
    if (query.trim()) {
      lookupWord(query.trim(), newLang, activeStage);
    }
  };

  const handleSearch = (term) => {
    if (term.trim()) {
      lookupWord(term.trim(), activeLanguage, activeStage);
    }
  };

  if (!isOpen) return null;

  // -------------------------------------------------------------
  // 1. MINIMIZED MODE: Sleek floating chip (Matches Floating Notepad)
  // -------------------------------------------------------------
  if (isMinimized) {
    return (
      <div id="tour-floating-dictionary-minimized" className="floating-dock-dictionary animate-in">
        <div className="flex items-center gap-2 p-1.5 pl-3 rounded-2xl bg-white dark:bg-[#102B50] text-[#102B50] dark:text-white shadow-xl hover:shadow-2xl transition cursor-pointer border border-[#E2E8F0] dark:border-[#1E3A5F] hover:border-[#FFB800]">
          <div
            onClick={restoreDictionary}
            className="flex items-center gap-2 text-xs font-bold select-none pr-1"
          >
            <BookOpen size={16} className="text-[#0756A5] dark:text-[#FFB800] shrink-0" />
            <span className="truncate max-w-[140px] sm:max-w-[200px]">
              {query ? `Word: ${query}` : "Python Dictionary"}
            </span>
            {result && (
              <span className="w-2 h-2 rounded-full bg-[#FFB800] animate-pulse shrink-0" />
            )}
          </div>
          <button
            onClick={restoreDictionary}
            className="notepad-action-btn"
            title="Expand Word Dictionary"
            aria-label="Expand dictionary"
          >
            <ChevronUp size={14} strokeWidth={2.5} />
          </button>
          <button
            onClick={closeDictionary}
            className="notepad-action-btn btn-close"
            title="Close Word Dictionary"
            aria-label="Close dictionary"
          >
            <X size={14} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 2. FLOATING DOCKED WINDOW: Matches Floating Notepad Architecture
  //    (No full-screen overlay, no background scroll lock)
  // -------------------------------------------------------------
  return (
    <div
      id="tour-floating-dictionary-window"
      className={`floating-dictionary-window animate-in ${isExpanded ? "is-expanded" : ""}`}
      role="dialog"
      aria-modal="false"
      aria-labelledby="dictionary-floating-title"
    >
      {/* A. Window Header */}
      <div className="bg-[#F3F7FC] dark:bg-[#102B50] text-[#102B50] dark:text-white px-3 sm:px-4 py-2.5 sm:py-3 shrink-0 flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#1E3A5F]">
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-xl bg-white dark:bg-[#0C1B30] border border-[#E2E8F0] dark:border-[#1E3A5F] text-[#0756A5] dark:text-[#FFB800] flex items-center justify-center shrink-0">
            <BookOpen size={15} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 id="dictionary-floating-title" className="text-xs sm:text-sm font-extrabold leading-tight tracking-tight truncate max-w-[150px] xs:max-w-[200px] sm:max-w-none text-[#102B50] dark:text-white">
                Word Meaning Dictionary
              </h3>
              <span className="text-[10px] text-[#0756A5] dark:text-[#FFB800] font-mono font-bold border border-[#E2E8F0] dark:border-[#1E3A5F] px-1.5 py-0.2 rounded bg-white dark:bg-[#0C1B30] hidden sm:inline-block">
                ⌘K
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-[#64748B] dark:text-slate-400 truncate font-medium mt-0.5">
              {query ? `Term: "${query}"` : "Instant Multi-Lingual Explanations"}
            </p>
          </div>
        </div>

        {/* Header Action Buttons (Minimize, Expand, Close) */}
        <div className="flex items-center gap-1.5 shrink-0 ml-1.5">
          {/* Minimize into bottom chip */}
          <button
            onClick={minimizeDictionary}
            className="notepad-action-btn"
            title="Minimize to floating pill"
            aria-label="Minimize dictionary"
          >
            <ChevronDown size={14} strokeWidth={2.5} />
          </button>

          {/* Expand / Collapse Width */}
          <button
            onClick={toggleExpanded}
            className="notepad-action-btn btn-expand"
            title={isExpanded ? "Standard width" : "Expand width"}
            aria-label={isExpanded ? "Standard width" : "Expand width"}
          >
            {isExpanded ? (
              <Minimize2 size={13} strokeWidth={2.5} />
            ) : (
              <Maximize2 size={13} strokeWidth={2.5} />
            )}
          </button>

          {/* Close */}
          <button
            onClick={closeDictionary}
            className="notepad-action-btn btn-close"
            title="Close Dictionary"
            aria-label="Close dictionary"
          >
            <X size={14} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* B. Global Search Bar */}
      <div className="p-2 sm:p-2.5 bg-slate-50 dark:bg-[#0c1422] border-b border-slate-200 dark:border-[#23344d] shrink-0">
        <WordMeaningSearch
          query={query}
          onQueryChange={setQuery}
          onSearch={handleSearch}
          isSearching={isSearching}
          autoFocus={false}
          hasResult={!!result}
        />
      </div>

      {/* C. Scrollable Results Area */}
      <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-4 scrollbar-thin bg-white dark:bg-[#0c1422] min-h-0">
        {error && (
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-[#102541] border border-amber-200 dark:border-[#183657] flex items-start gap-2.5 text-slate-800 dark:text-[#D2DEEC]">
            <span className="text-xl select-none">ℹ</span>
            <p className="body-base font-semibold m-0 text-xs sm:text-sm">{error}</p>
          </div>
        )}

        {result && (
          <WordMeaningResult
            result={result}
            currentStage={activeStage}
            currentLanguage={activeLanguage}
            onStageChange={handleStageChange}
            onLanguageChange={handleLanguageChange}
            onSearchSuggestion={handleSearch}
          />
        )}

        {!result && !isSearching && (
          <div className="py-6 sm:py-8 px-2 space-y-6">
            <div className="text-center px-4">
              <span className="text-4xl block mb-2 select-none">📖</span>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-1.5">
                Search ANY Python Word or Term
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-[#91A6BF] max-w-sm mx-auto leading-relaxed">
                Type any coding concept or select a suggestion below for instant, stage-tailored explanations in English or Telugu!
              </p>
            </div>

            {/* Popular Topics Grid in empty state */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span className="flex items-center gap-1.5 text-[#168BFF] uppercase tracking-wider">
                  <Sparkles size={13} /> Popular Concepts
                </span>
                <span className="text-slate-400 font-normal text-[11px]">Click to view meaning</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { term: 'Algorithm', desc: 'Step-by-step problem solving', icon: '⚡' },
                  { term: 'Variable', desc: 'Named storage for values', icon: '📦' },
                  { term: 'Function', desc: 'Reusable block of code', icon: '🔧' },
                  { term: 'Automation', desc: 'Running tasks automatically', icon: '🤖' },
                  { term: 'Syntax', desc: 'Rules of the language', icon: '📐' },
                  { term: 'Database', desc: 'Organized data storage', icon: '💾' }
                ].map(item => (
                  <button
                    key={item.term}
                    type="button"
                    onClick={() => handleSearch(item.term)}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-[#1E3A5F] bg-slate-50 dark:bg-[#0C1B30] hover:border-[#168BFF] dark:hover:border-[#168BFF] hover:bg-blue-50/50 dark:hover:bg-[#102541] transition text-left cursor-pointer group"
                  >
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-sm select-none">{item.icon}</span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#168BFF] transition">{item.term}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 m-0 line-clamp-1">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* D. Footer Status Bar */}
      <div className="px-3.5 py-1.5 bg-[#F3F7FC] dark:bg-[#102B50] border-t border-[#E2E8F0] dark:border-[#1E3A5F] flex items-center justify-between text-[10px] text-[#64748B] dark:text-slate-400 shrink-0">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0756A5]" />
          <span>Stage: <strong className="text-[#0756A5] dark:text-[#FFB800] capitalize">{activeStage}</strong></span>
        </span>
        <span className="font-semibold">
          Language: <strong className="text-[#0756A5] dark:text-[#FFB800] uppercase">{activeLanguage}</strong>
        </span>
      </div>
    </div>
  );
}
