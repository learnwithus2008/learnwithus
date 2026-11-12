/**
 * GuideWelcomeModal.jsx
 * Clean, interactive welcome start guide introducing Python Adaptive.
 * Highlights:
 * 1. Sign In & Sign Up
 * 2. Navigation Items (Home, Learn, Practice, Projects, About)
 * 3. Theme (Light & Dark Mode)
 * 4. Study Notes (Notepad)
 * 5. Word Meaning (Dictionary)
 */

import React, { useEffect, useRef } from "react";
import { useGuideTutorial } from "../../context/GuideTutorialContext";
import { useBodyScrollLock } from "../../utils/scrollLock";
import {
  Sparkles,
  Compass,
  LayoutGrid,
  X,
  BookOpen,
  StickyNote,
  Sun,
  Moon,
  LogIn,
  Layers,
  ArrowRight
} from "lucide-react";

export default function GuideWelcomeModal() {
  const { isWelcomeOpen, setIsWelcomeOpen, startTour, skipTour, openExplorer } = useGuideTutorial();
  useBodyScrollLock(isWelcomeOpen);
  const modalRef = useRef(null);

  // Keyboard navigation: Escape key closes modal
  useEffect(() => {
    if (!isWelcomeOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        skipTour();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isWelcomeOpen, skipTour]);

  if (!isWelcomeOpen) return null;

  const corePillars = [
    {
      icon: LogIn,
      iconColor: "text-blue-600 dark:text-[#60B7FF]",
      bgColor: "bg-blue-500/10",
      title: "Profile & Progress",
      desc: "Save your streak, earn XP, and track certificates across devices."
    },
    {
      icon: Compass,
      iconColor: "text-cyan-600 dark:text-[#38bdf8]",
      bgColor: "bg-cyan-500/10",
      title: "Navigation Tabs",
      desc: "Jump easily between Home, Learn, Practice, Projects, and About."
    },
    {
      icon: Sun,
      iconColor: "text-amber-500 dark:text-amber-400",
      bgColor: "bg-amber-500/10",
      title: "Light & Dark Mode",
      desc: "One click to toggle comfortable day or night reading."
    },
    {
      icon: StickyNote,
      iconColor: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-500/10",
      title: "Study Notepad",
      desc: "Jot down code snippets and takeaways with automatic saving."
    },
    {
      icon: BookOpen,
      iconColor: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-500/10",
      title: "Word Dictionary",
      desc: "Tap any term or press ⌘K for simple definitions in your language."
    }
  ];

  return (
    <div
      className="guide-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-modal-title"
      onWheel={(e) => {
        if (e.target === e.currentTarget) e.preventDefault();
      }}
      onTouchMove={(e) => {
        if (e.target === e.currentTarget) e.preventDefault();
      }}
    >
      <div
        ref={modalRef}
        className="guide-modal-welcome-card"
        onWheel={(e) => e.stopPropagation()}
      >
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={skipTour}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#14233a] transition cursor-pointer border-none bg-transparent z-10"
          title="Close (Esc)"
          aria-label="Close welcome modal"
        >
          <X size={18} />
        </button>

        {/* Top Header Badge */}
        <div className="flex items-center gap-3.5 mb-3 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#168BFF] to-[#0876E8] text-white flex items-center justify-center shadow-lg shadow-blue-500/30 shrink-0">
            <Compass size={24} />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[#168BFF] dark:text-[#60B7FF] text-xs font-bold mb-0.5">
              <Sparkles size={12} className="text-[#168BFF]" />
              <span>Platform Quick Start Guide</span>
            </div>
            <h2 id="welcome-modal-title" className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
              Welcome to Python Adaptive! 🐍
            </h2>
          </div>
        </div>

        {/* Welcome Message */}
        <p className="text-xs sm:text-sm text-slate-600 dark:text-[#D2DEEC] leading-relaxed mb-4 relative z-10">
          Here is everything you need to know to get started and master Python at your own pace:
        </p>

        {/* Feature Highlights: Sign In/Up, Navigation, Theme, Notes & Word Meaning */}
        <div className="space-y-2 mb-5 text-left relative z-10">
          {corePillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={idx}
                className="p-3 rounded-2xl bg-slate-50/90 dark:bg-[#102541]/80 border border-slate-200/90 dark:border-[#183657] flex items-start gap-3 hover:border-blue-500/40 transition"
              >
                <div className={`w-8 h-8 rounded-xl ${pillar.bgColor} ${pillar.iconColor} flex items-center justify-center shrink-0`}>
                  <Icon size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                    {pillar.title}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-[#91A6BF] leading-snug mt-0.5">
                    {pillar.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Controls: Start Tour, Explore Pages, Skip Tour */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1 relative z-10">
          <button
            onClick={() => startTour(0)}
            className="btn-vibrant-primary w-full sm:w-auto flex-1 py-2.5 text-xs sm:text-sm font-bold shadow-lg shadow-blue-500/25 cursor-pointer flex items-center justify-center gap-2"
          >
            <Sparkles size={15} />
            <span>Take Guided Tour</span>
          </button>

          <button
            onClick={() => openExplorer("all")}
            className="btn-vibrant-secondary w-full sm:w-auto flex-1 py-2.5 text-xs sm:text-sm font-bold text-slate-700 dark:text-white cursor-pointer flex items-center justify-center gap-2 border border-slate-200 dark:border-[#183657]"
          >
            <LayoutGrid size={15} className="text-[#168BFF]" />
            <span>Explore App</span>
          </button>
        </div>

        {/* Skip Tour Option */}
        <div className="mt-3.5 pt-2.5 border-t border-slate-100 dark:border-[#183657] flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Explore freely at your own pace</span>
          <button
            onClick={skipTour}
            className="font-bold text-slate-600 dark:text-[#8CC8FF] hover:underline cursor-pointer bg-transparent border-none p-0"
          >
            Skip for Now
          </button>
        </div>
      </div>
    </div>
  );
}
