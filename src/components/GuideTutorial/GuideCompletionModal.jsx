/**
 * GuideCompletionModal.jsx
 * Tour completion celebration modal shown at the end of the 12-step guided walkthrough.
 * Offers options to Explore All Pages, Restart Tour, or Finish & Continue learning.
 */

import React, { useEffect, useRef } from "react";
import { useGuideTutorial } from "../../context/GuideTutorialContext";
import { useBodyScrollLock } from "../../utils/scrollLock";
import {
  Trophy,
  Sparkles,
  LayoutGrid,
  RotateCcw,
  CheckCircle2,
  X,
  ArrowRight,
  BookOpen
} from "lucide-react";

export default function GuideCompletionModal() {
  const {
    isCompletionOpen,
    closeCompletion,
    restartTour,
    openExplorer,
    navigateToPage
  } = useGuideTutorial();

  useBodyScrollLock(isCompletionOpen);

  const modalRef = useRef(null);

  // Keyboard navigation: Escape key closes completion modal
  useEffect(() => {
    if (!isCompletionOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        closeCompletion();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCompletionOpen, closeCompletion]);

  if (!isCompletionOpen) return null;

  return (
    <div
      className="guide-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="completion-modal-title"
      onWheel={(e) => {
        if (e.target === e.currentTarget) e.preventDefault();
      }}
      onTouchMove={(e) => {
        if (e.target === e.currentTarget) e.preventDefault();
      }}
    >
      <div
        ref={modalRef}
        className="guide-modal-completion-card"
        onWheel={(e) => e.stopPropagation()}
      >
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={closeCompletion}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#14233a] transition cursor-pointer border-none bg-transparent z-10"
          title="Close (Esc)"
          aria-label="Close Completion Modal"
        >
          <X size={18} />
        </button>

        {/* Trophy Celebration Icon */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-[#168BFF] to-[#0876E8] text-white flex items-center justify-center mx-auto mb-4 shadow-xl shadow-blue-500/35 relative z-10">
          <Trophy size={36} className="text-yellow-300 drop-shadow-sm" />
        </div>

        {/* Tag & Heading */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold mb-2">
          <CheckCircle2 size={13} />
          <span>Tour Completed Successfully!</span>
        </div>

        <h2 id="completion-modal-title" className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
          You're All Set to Master Python! 🐍✨
        </h2>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-[#D2DEEC] leading-relaxed max-w-md mx-auto mb-6">
          You've explored the navigation menu, age-adaptive engine, multi-language switcher, study tools, live code runner, and curriculum. What would you like to do next?
        </p>

        {/* Quick Accomplishments Summary Box */}
        <div className="grid grid-cols-2 gap-2.5 mb-6 text-left">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#102541]/80 border border-slate-200 dark:border-[#183657]">
            <div className="text-[10px] uppercase font-bold text-slate-400">Adaptive Engine</div>
            <div className="text-xs font-extrabold text-slate-800 dark:text-white mt-0.5">5 Age Stages Ready</div>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#102541]/80 border border-slate-200 dark:border-[#183657]">
            <div className="text-[10px] uppercase font-bold text-slate-400">Curriculum</div>
            <div className="text-xs font-extrabold text-slate-800 dark:text-white mt-0.5">198 Lessons Available</div>
          </div>
        </div>

        {/* Action Controls: Explore All Pages, Start Lesson 1, Restart Tour */}
        <div className="space-y-2.5 relative z-10">
          <button
            onClick={() => {
              closeCompletion();
              navigateToPage("lesson", "what-is-python");
            }}
            className="btn-vibrant-primary w-full py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-500/25"
          >
            <BookOpen size={16} />
            <span>Start Free Lesson 1: What is Python?</span>
            <ArrowRight size={15} />
          </button>

          <button
            onClick={() => {
              closeCompletion();
              openExplorer("all");
            }}
            className="btn-vibrant-secondary w-full py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer border border-slate-200 dark:border-[#183657] text-slate-800 dark:text-white"
          >
            <LayoutGrid size={16} className="text-[#168BFF]" />
            <span>Explore App Directory</span>
          </button>

          <div className="pt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <button
              onClick={restartTour}
              className="inline-flex items-center gap-1.5 font-bold text-[#168BFF] hover:underline cursor-pointer bg-transparent border-none p-0"
            >
              <RotateCcw size={13} />
              <span>Restart Tour</span>
            </button>

            <button
              onClick={closeCompletion}
              className="font-semibold hover:text-slate-900 dark:hover:text-white cursor-pointer bg-transparent border-none p-0"
            >
              Continue to Dashboard →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
