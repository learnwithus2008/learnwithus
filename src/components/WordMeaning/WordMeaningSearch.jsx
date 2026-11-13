import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2, History, Sparkles } from 'lucide-react';
import { getRecentSearches } from '../../services/wordMeaningService';

const QUICK_DISCOVERY_WORDS = [
  'Automation',
  'Variable',
  'Function',
  'Reliable',
  'Reusable',
  'Syntax',
  'Algorithm',
  'Database',
  'Application',
  'Parameter'
];

export default function WordMeaningSearch({
  query,
  onQueryChange,
  onSearch,
  isSearching,
  autoFocus = false,
  hasResult = false
}) {
  const [recentSearches, setRecentSearches] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    setRecentSearches(getRecentSearches());
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      setRecentSearches(getRecentSearches());
    }
  };

  const handleChipClick = (term) => {
    onQueryChange(term);
    onSearch(term);
    setRecentSearches(getRecentSearches());
  };

  return (
    <div className="w-full space-y-2">
      {/* Search Input Bar */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <div className="word-meaning-input-wrapper">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#168BFF]">
            <Search size={16} />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search word (e.g. algorithm, variable, loop)..."
            className="word-meaning-input"
            style={{ paddingLeft: "2.4rem", paddingRight: "2.2rem", paddingTop: "0.55rem", paddingBottom: "0.55rem", fontSize: "0.875rem" }}
          />
          {query && (
            <button
              type="button"
              onClick={() => onQueryChange('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-white border-none bg-transparent cursor-pointer"
              title="Clear input"
            >
              <X size={15} />
            </button>
          )}
        </div>

        <button
          type="submit"
          disabled={isSearching || !query.trim()}
          className="btn-vibrant-primary shrink-0 py-2 px-3.5 sm:px-4 text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-xs rounded-xl"
        >
          {isSearching ? <Loader2 size={14} className="animate-spin" /> : null}
          <span>{isSearching ? 'Searching...' : 'Search'}</span>
        </button>
      </form>

      {/* Sleek Single-Line Horizontal Scrollable Chips Scroller */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 whitespace-nowrap text-xs">
        <span className="text-[11px] font-bold text-[#168BFF] uppercase tracking-wider flex items-center gap-1 shrink-0 pr-0.5 select-none">
          <Sparkles size={12} className="text-[#168BFF]" /> Suggestions:
        </span>
        {QUICK_DISCOVERY_WORDS.map((term) => {
          const isMatch = query.toLowerCase().trim() === term.toLowerCase();
          return (
            <button
              key={term}
              type="button"
              onClick={() => handleChipClick(term)}
              className={`word-meaning-chip text-xs py-1 px-2.5 shrink-0 ${isMatch ? 'active' : ''}`}
            >
              {term}
            </button>
          );
        })}

        {recentSearches.length > 0 && (
          <>
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1 shrink-0 px-1 border-l border-slate-200 dark:border-slate-700 select-none">
              <History size={12} /> Recent:
            </span>
            {recentSearches.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => handleChipClick(term)}
                className="word-meaning-chip text-xs py-1 px-2.5 shrink-0 text-slate-600 dark:text-[#D2DEEC]"
              >
                • {term}
              </button>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
