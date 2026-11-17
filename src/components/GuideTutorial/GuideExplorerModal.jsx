/**
 * GuideExplorerModal.jsx
 * Searchable, filterable Explore Pages directory modal.
 * Lists all actual pages, curriculum sections, study tools, and engine features.
 */

import React, { useState, useMemo, useEffect, useRef } from "react";
import { useGuideTutorial } from "../../context/GuideTutorialContext";
import { useAuth } from "../../context/AuthContext";
import { useDictionary } from "../../context/DictionaryContext";
import { useNotepad } from "../../context/NotepadContext";
import { useBodyScrollLock } from "../../utils/scrollLock";
import { PAGE_CATEGORIES, APP_PAGES_REGISTRY } from "../../data/appPagesRegistry";
import {
  Search,
  X,
  Compass,
  Sparkles,
  ArrowRight,
  Lock,
  CheckCircle,
  ExternalLink,
  BookOpen,
  Terminal,
  Code2,
  FolderGit2,
  Info,
  LogIn,
  UserPlus,
  BookMarked,
  StickyNote,
  Layers,
  Globe,
  LayoutGrid,
  Filter,
  Check
} from "lucide-react";

// Icon mapping helper
const ICON_MAP = {
  Terminal,
  BookOpen,
  Sparkles,
  Code2,
  FolderGit2,
  Info,
  LogIn,
  UserPlus,
  BookMarked,
  StickyNote,
  Layers,
  Globe,
  Compass,
  LayoutGrid
};

export default function GuideExplorerModal() {
  const {
    isExplorerOpen,
    closeExplorer,
    explorerCategory,
    setExplorerCategory,
    startTour,
    navigateToPage
  } = useGuideTutorial();

  useBodyScrollLock(isExplorerOpen);

  const { isAuthenticated, openAuthModal } = useAuth();
  const { openDictionary } = useDictionary();
  const { toggleNotepad } = useNotepad();

  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef(null);
  const modalContainerRef = useRef(null);

  // Focus search input when modal opens
  useEffect(() => {
    if (isExplorerOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isExplorerOpen]);

  // Keyboard navigation: Escape key closes explorer
  useEffect(() => {
    if (!isExplorerOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        closeExplorer();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isExplorerOpen, closeExplorer]);

  // Filtered pages based on search query and category
  const filteredPages = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return APP_PAGES_REGISTRY.filter((page) => {
      // Category filter
      if (explorerCategory !== "all" && page.category !== explorerCategory) {
        return false;
      }
      // Search query filter
      if (!q) return true;
      const titleMatch = page.title.toLowerCase().includes(q);
      const taglineMatch = page.tagline.toLowerCase().includes(q);
      const descMatch = page.description.toLowerCase().includes(q);
      const catMatch = page.categoryLabel.toLowerCase().includes(q);
      const navMatch = page.navLocation.toLowerCase().includes(q);
      const featureMatch = page.features.some((f) => f.toLowerCase().includes(q));
      return titleMatch || taglineMatch || descMatch || catMatch || navMatch || featureMatch;
    });
  }, [searchQuery, explorerCategory]);

  const handleVisitPage = (page) => {
    // If it's a tool modal action
    if (page.id === "dictionary-tool") {
      closeExplorer();
      openDictionary();
      return;
    }
    if (page.id === "notepad-tool") {
      closeExplorer();
      toggleNotepad();
      return;
    }

    // Check authentication for protected routes
    if (page.authRequired && !isAuthenticated) {
      closeExplorer();
      openAuthModal(
        "login",
        `Sign in required to access ${page.title}. Please log in or create a free account!`
      );
      navigateToPage("signin");
      return;
    }

    // Normal navigation
    navigateToPage(page.pageKey, page.topicId);
  };

  if (!isExplorerOpen) return null;

  return (
    <div
      className="guide-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="explorer-modal-title"
      onClick={closeExplorer}
      onWheel={(e) => {
        if (e.target === e.currentTarget) e.preventDefault();
      }}
      onTouchMove={(e) => {
        if (e.target === e.currentTarget) e.preventDefault();
      }}
    >
      <div
        ref={modalContainerRef}
        className="guide-modal-explorer-card"
        onClick={(e) => e.stopPropagation()}
        onWheel={(e) => e.stopPropagation()}
      >
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Top Header Bar */}
        <div className="p-4 sm:p-6 pb-4 border-b border-slate-100 dark:border-[#183657] relative z-10 shrink-0">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-[#168BFF] to-[#0876E8] text-white flex items-center justify-center shadow-md shadow-blue-500/25 shrink-0">
                <LayoutGrid size={24} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 id="explorer-modal-title" className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    Explore App — Pages & Features
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-blue-500/15 text-[#168BFF] dark:text-[#60B7FF] border border-blue-500/20">
                    {filteredPages.length} {filteredPages.length === 1 ? "Item" : "Items"}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-[#91A6BF] truncate mt-0.5">
                  Complete directory of real application pages, curriculum sections, study tools & shortcuts
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  closeExplorer();
                  startTour(0);
                }}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-500/10 hover:bg-blue-500/20 text-[#168BFF] dark:text-[#60B7FF] border border-blue-500/20 transition cursor-pointer"
                title="Launch guided walkthrough"
              >
                <Sparkles size={14} />
                <span>Take Guided Tour</span>
              </button>

              <button
                onClick={closeExplorer}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#14233a] transition cursor-pointer border-none bg-transparent"
                type="button"
                onClick={(e) => {
                  if (e) e.stopPropagation();
                  closeExplorer();
                }}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#14233a] transition cursor-pointer border-none bg-transparent active:scale-95"
                title="Close (Esc)"
                aria-label="Close Explorer"
              >
                <X size={20} />
                <X size={20} className="pointer-events-none" />
              </button>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative flex items-center mb-3">
            <Search
              size={18}
              className="absolute left-3.5 text-slate-400 dark:text-[#91A6BF] pointer-events-none"
            />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by page name, feature, or keyword (e.g. loops, runner, quiz, dictionary, profile)..."
              className="w-full pl-11 pr-10 py-2.5 sm:py-3 rounded-2xl border border-slate-200 dark:border-[#1e3a63] focus:border-[#168BFF] bg-slate-50 dark:bg-[#102541]/90 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-[#91A6BF] outline-none transition shadow-2xs focus:shadow-md focus:shadow-blue-500/10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer bg-transparent border-none"
                title="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            {PAGE_CATEGORIES.map((cat) => {
              const isSelected = explorerCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setExplorerCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer border flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-[#168BFF] text-white border-[#168BFF] shadow-sm shadow-blue-500/30"
                      : "bg-slate-100 dark:bg-[#102541] hover:bg-slate-200 dark:hover:bg-[#183657] text-slate-600 dark:text-[#91A6BF] border-slate-200 dark:border-[#1e3a63]"
                  }`}
                >
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Scrollable Directory Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 scrollbar-thin relative z-10">
          {filteredPages.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-16 text-center max-w-md mx-auto">
              <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-[#102541] border border-slate-200 dark:border-[#1e3a63] flex items-center justify-center text-slate-400 mb-4">
                <Search size={28} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                No matching pages or features found
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-[#91A6BF] mb-5 leading-relaxed">
                We couldn't find any page matching "<strong>{searchQuery}</strong>" in the selected category.
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setExplorerCategory("all");
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#168BFF] text-white cursor-pointer hover:bg-blue-600 transition border-none"
                >
                  Clear Search & Filters
                </button>
              </div>
            </div>
          ) : (
            /* Responsive Grid of Page Cards */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPages.map((page) => {
                const IconComponent = ICON_MAP[page.icon] || Terminal;
                const isProtected = page.authRequired;
                const isLocked = isProtected && !isAuthenticated;

                return (
                  <div
                    key={page.id}
                    className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-[#102541]/70 border border-slate-200 dark:border-[#183657] hover:border-blue-400 dark:hover:border-[#168BFF]/60 transition-all flex flex-col justify-between group shadow-2xs hover:shadow-md"
                  >
                    <div>
                      {/* Top Card Row */}
                      <div className="flex items-start justify-between gap-3 mb-2.5">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${page.color} text-white flex items-center justify-center shadow-xs shrink-0`}>
                            <IconComponent size={20} />
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-tight truncate">
                              {page.title}
                            </h3>
                            <span className="text-[11px] font-bold text-blue-600 dark:text-[#60B7FF]">
                              {page.categoryLabel}
                            </span>
                          </div>
                        </div>

                        {/* Status / Auth Badge */}
                        <div className="shrink-0">
                          {isLocked ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                              <Lock size={10} />
                              <span>Sign In Required</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                              <CheckCircle size={10} />
                              <span>{page.badge || "Accessible"}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Tagline & Description */}
                      <p className="text-xs text-slate-600 dark:text-[#D2DEEC] leading-relaxed mb-3">
                        {page.description}
                      </p>

                      {/* Where to find it in navigation */}
                      <div className="p-2.5 rounded-xl bg-white dark:bg-[#0C1B30] border border-slate-200/80 dark:border-[#183657] mb-3 text-[11px] text-slate-600 dark:text-[#91A6BF] flex items-center gap-2">
                        <span className="text-xs font-bold text-[#168BFF]">📍 Find it:</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {page.navLocation}
                        </span>
                      </div>

                      {/* Key features bullet points */}
                      <div className="space-y-1 mb-4">
                        {page.features.slice(0, 3).map((feat, fIdx) => (
                          <div key={fIdx} className="flex items-start gap-1.5 text-[11px] text-slate-500 dark:text-[#91A6BF]">
                            <span className="text-emerald-500 font-bold shrink-0">✓</span>
                            <span className="leading-tight">{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Action Button */}
                    <div className="pt-3 border-t border-slate-200 dark:border-[#183657] flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 truncate max-w-[150px]">
                        {page.route}
                      </span>

                      <button
                        onClick={() => handleVisitPage(page)}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                          isLocked
                            ? "bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30"
                            : "btn-vibrant-primary text-white border-transparent shadow-xs"
                        }`}
                      >
                        <span>{page.isTool ? "Open Tool" : isLocked ? "Sign In to Visit" : "Visit Page"}</span>
                        <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Bottom Banner / Guided Tour Callout */}
        <div className="p-3 sm:p-4 px-6 bg-slate-50 dark:bg-[#102541] border-t border-slate-200 dark:border-[#183657] flex flex-col sm:flex-row items-center justify-between gap-3 relative z-10 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-[#D2DEEC]">
            <Sparkles size={15} className="text-[#168BFF] shrink-0" />
            <span>Prefer a visual walk-through? Try our 12-step guided tour!</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                closeExplorer();
                startTour(0);
              }}
              className="px-4 py-1.5 rounded-xl text-xs font-bold bg-[#168BFF] text-white hover:bg-blue-600 transition cursor-pointer border-none shadow-xs"
            >
              Start Guided Tour ✨
            </button>
            <button
              onClick={closeExplorer}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-white transition cursor-pointer border-none bg-transparent"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
