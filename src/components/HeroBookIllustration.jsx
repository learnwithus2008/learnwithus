import React, { useState, useEffect, useCallback } from "react";
import {
  Sparkles,
  Terminal,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  Volume2,
  VolumeX,
  Code2,
  Zap,
  Flame,
  Check
} from "lucide-react";
import { playPageFlipSound } from "../utils/audioCelebration";

/**
 * HeroBookIllustration
 * Real-Time Interactive Digital Open Book with 3D Page Turning
 * Features:
 *   - Real-time page turn: Click right page / corner curl or Next button to turn forward
 *   - Click left page or Prev button to turn backward
 *   - Realistic paper flutter sound on flip (with mute/unmute toggle)
 *   - 3D CSS perspective page tilt & shadow transitions
 *   - 4 Authentic educational spreads (8 total pages) teaching real Python concepts
 *   - Golden ribbon bookmark with natural depth
 *   - Fully unobstructed view with clean, enlarged typography and spacious code editor
 */
export default function HeroBookIllustration({ className = "" }) {
  // 4 two-page spreads (8 pages total)
  const [spreadIndex, setSpreadIndex] = useState(0);
  const [flipDirection, setFlipDirection] = useState(null); // 'forward' | 'backward' | null
  const [isFlipping, setIsFlipping] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Spreads educational content
  const SPREADS = [
    {
      chapter: "Chapter 1",
      topic: "Introduction",
      leftPage: {
        num: 1,
        tag: "CHAPTER 1 • GETTING STARTED",
        title: "Why Learn Python?",
        desc: "Python reads naturally like plain English. Simple, clean, and beginner-friendly from day one.",
        diagram: {
          step1: "1. Think Idea",
          step2: "2. Write Code",
          step3: "3. Run Instantly"
        },
        badge: "100% Beginner Friendly"
      },
      rightPage: {
        num: 2,
        title: "Your First Program",
        filename: "hello.py",
        codeLines: [
          { text: "# Welcome to Python!", color: "text-[#FFB800] font-bold" },
          { text: 'learner = "Future Coder"', color: "text-slate-200" },
          { text: 'print(f"Welcome, {learner}! ★")', color: "text-emerald-400 font-bold" }
        ],
        output: "Welcome, Future Coder! ★",
        nextHint: "Turn page to explore Variables ↷"
      }
    },
    {
      chapter: "Chapter 2",
      topic: "Variables",
      leftPage: {
        num: 3,
        tag: "CHAPTER 2 • VARIABLES & MEMORY",
        title: "Variables Are Name Tags",
        desc: "Variables safely hold data in memory. Python detects types automatically without confusing boilerplate.",
        diagram: {
          step1: 'name = "Ravi"',
          step2: "level = 10",
          step3: "ready = True"
        },
        badge: "Dynamic Memory Binding"
      },
      rightPage: {
        num: 4,
        title: "Try Calculations",
        filename: "variables.py",
        codeLines: [
          { text: "score = 95", color: "text-slate-200" },
          { text: "streak_days = 5", color: "text-slate-200" },
          { text: "total_xp = score * streak_days", color: "text-[#60A5FA] font-bold" },
          { text: 'print(f"Total: {total_xp} XP")', color: "text-emerald-400 font-bold" }
        ],
        output: "Total: 475 XP Earned! ★",
        nextHint: "Turn page to explore Loops ↷"
      }
    },
    {
      chapter: "Chapter 3",
      topic: "Loops",
      leftPage: {
        num: 5,
        tag: "CHAPTER 3 • AUTOMATION",
        title: "The Power of Loops",
        desc: "Why repeat work 100 times? A Python for-loop automates repetitive tasks in just 2 lines of code.",
        diagram: {
          step1: "Input List",
          step2: "for item in list",
          step3: "Done in 0.01s"
        },
        badge: "Zero Repetitive Work"
      },
      rightPage: {
        num: 6,
        title: "Automate in 3 Lines",
        filename: "loops.py",
        codeLines: [
          { text: 'steps = ["Learn", "Practice", "Grow"]', color: "text-[#FFB800]" },
          { text: "for s in steps:", color: "text-[#60A5FA] font-bold" },
          { text: '    print(f"{s} ✓")', color: "text-emerald-400 font-bold pl-3" }
        ],
        output: "Learn ✓ | Practice ✓ | Grow ✓",
        nextHint: "Turn page to test Quiz ↷"
      }
    },
    {
      chapter: "Chapter 4",
      topic: "Practice Quiz",
      leftPage: {
        num: 7,
        tag: "CHAPTER 4 • PRACTICE CHECKPOINT",
        title: "Gamified Learning",
        desc: "Test your skills immediately. Earn XP, maintain study streaks, and unlock real accomplishment badges.",
        stats: [
          { label: "Study Streak", val: "🔥 3 Days Active" },
          { label: "Earned XP", val: "⭐ 350 Total XP" },
          { label: "Milestone", val: "🏆 Python Explorer" }
        ],
        badge: "Instant Active Feedback"
      },
      rightPage: {
        num: 8,
        title: "Quick Checkpoint",
        isQuiz: true,
        question: "Q: Which keyword defines a function?",
        options: [
          { label: "A) function", correct: false },
          { label: "B) def  ✓ (Correct!)", correct: true },
          { label: "C) func", correct: false }
        ],
        reward: "🎉 +20 XP Awarded! Ready for full lessons!",
        nextHint: "Turn to restart at Chapter 1 ↷"
      }
    }
  ];

  const currentSpread = SPREADS[spreadIndex];

  // Turn page forward
  const turnNext = useCallback(() => {
    if (isFlipping) return;
    if (soundEnabled) playPageFlipSound();
    setFlipDirection("forward");
    setIsFlipping(true);
    setTimeout(() => {
      setSpreadIndex((prev) => (prev + 1) % SPREADS.length);
      setIsFlipping(false);
    }, 380);
  }, [isFlipping, soundEnabled, SPREADS.length]);

  // Turn page backward
  const turnPrev = useCallback(() => {
    if (isFlipping) return;
    if (soundEnabled) playPageFlipSound();
    setFlipDirection("backward");
    setIsFlipping(true);
    setTimeout(() => {
      setSpreadIndex((prev) => (prev - 1 + SPREADS.length) % SPREADS.length);
      setIsFlipping(false);
    }, 380);
  }, [isFlipping, soundEnabled, SPREADS.length]);

  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (["INPUT", "TEXTAREA"].includes(e.target?.tagName)) return;
      if (e.key === "ArrowRight") {
        turnNext();
      } else if (e.key === "ArrowLeft") {
        turnPrev();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [turnNext, turnPrev]);

  return (
    <div
      className={`hero-book-wrapper ${className}`}
      style={{ width: "100%", maxWidth: "620px" }}
    >
      {/* Ambient background glow aura */}
      <div className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-gradient-to-tr from-[#0756A5]/20 via-[#FFB800]/15 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* ========================================================
          REAL-TIME 3D DIGITAL OPEN BOOK (Enlarged & Unobstructed)
          ======================================================== */}
      <div
        className="hero-book-frame"
        style={{ width: "100%", maxWidth: "620px", minHeight: "390px" }}
      >
        {/* Book Outer Hardcover Binding */}
        <div
          className="hero-book-cover"
          style={{ width: "100%", minHeight: "360px" }}
        >
          {/* Subtle Page Edge Stack Illusion */}
          <div
            className="hero-book-stack"
            style={{ width: "100%", minHeight: "340px" }}
          >
            {/* The Open Two-Page Spread */}
            <div
              className={`hero-book-spread ${
                isFlipping
                  ? flipDirection === "forward"
                    ? "hero-page-flipping-forward"
                    : "hero-page-flipping-backward"
                  : ""
              }`}
              style={{ width: "100%", minHeight: "325px", display: "grid", gridTemplateColumns: "1fr 1fr" }}
            >
              {/* Golden Ribbon Bookmark (Top Center) */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3.5 sm:w-4 h-8 sm:h-10 bg-[#FFB800] shadow-md z-30 flex items-end justify-center pointer-events-none">
                <div className="w-0 h-0 border-l-[7px] sm:border-l-[8px] border-l-transparent border-r-[7px] sm:border-r-[8px] border-r-transparent border-b-[6px] sm:border-b-[7px] border-b-white dark:border-b-[#0E2442]" />
              </div>

              {/* Center Spine Seam Divider (Desktop) */}
              <div className="hidden sm:block absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[2px] bg-gradient-to-b from-[#CBD5E1] via-[#E2E8F0] to-[#CBD5E1] dark:from-[#1B3B66] dark:via-[#244778] dark:to-[#1B3B66] z-20 pointer-events-none shadow-xs" />

              {/* ----------------------------------------------------
                  LEFT PAGE: Concept Explanations & Visuals
                  Clicking left page turns backward
                  ---------------------------------------------------- */}
              <div
                onClick={turnPrev}
                className="relative p-2.5 sm:p-4 md:p-6 flex flex-col justify-between cursor-pointer group hover:bg-[#F8FAFC] dark:hover:bg-[#11294A] transition-colors border-r border-[#E2E8F0] dark:border-[#1E3A5F] w-full min-w-0"
                title="Click left page to turn back ↶"
              >
                {/* Subtle Inner Spine Shadow */}
                <div className="hidden sm:block absolute top-0 bottom-0 right-0 w-4 bg-gradient-to-l from-black/5 to-transparent pointer-events-none" />

                <div>
                  {/* Chapter Tag */}
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-[#0756A5] dark:text-[#FFB800] line-clamp-1">
                      {currentSpread.leftPage.tag}
                    </span>
                    <span className="text-[10px] text-[#64748B] dark:text-slate-400 font-bold hidden sm:inline">
                      ↶ Prev
                    </span>
                  </div>

                  {/* Page Title */}
                  <h3 className="text-sm sm:text-base md:text-lg font-black text-[#102B50] dark:text-white leading-tight mb-2">
                    {currentSpread.leftPage.title}
                  </h3>

                  {/* Paragraph explanation */}
                  <p className="text-xs sm:text-[13px] text-[#102B50] dark:text-[#CBD5E1] font-medium leading-relaxed mb-3">
                    {currentSpread.leftPage.desc}
                  </p>

                  {/* Visual Diagram Box */}
                  {currentSpread.leftPage.diagram && (
                    <div className="hero-book-diagram-box">
                      <div className="hero-book-diagram-step">
                        {currentSpread.leftPage.diagram.step1}
                      </div>
                      <span className="text-[11px] text-[#FFB800] font-black">➔</span>
                      <div className="hero-book-diagram-step accent">
                        {currentSpread.leftPage.diagram.step2}
                      </div>
                      <span className="text-[11px] text-[#FFB800] font-black">➔</span>
                      <div className="hero-book-diagram-step success">
                        {currentSpread.leftPage.diagram.step3}
                      </div>
                    </div>
                  )}

                  {/* Stats list for Quiz spread */}
                  {currentSpread.leftPage.stats && (
                    <div className="space-y-1.5 my-2">
                      {currentSpread.leftPage.stats.map((st, i) => (
                        <div
                          key={i}
                          className="hero-book-stat-pill"
                        >
                          <span className="hero-book-stat-label">{st.label}</span>
                          <span className="hero-book-stat-value">{st.val}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Left Page Footer */}
                <div className="pt-2 mt-2 border-t border-[#E2E8F0] dark:border-[#1E3A5F] flex items-center justify-between text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-300">
                  <span>Page {currentSpread.leftPage.num}</span>
                  <span className="text-[#0756A5] dark:text-[#FFB800] font-extrabold flex items-center gap-1 group-hover:-translate-x-1 transition-transform">
                    ◀ <span>Flip Back</span>
                  </span>
                </div>
              </div>

              {/* ----------------------------------------------------
                  RIGHT PAGE: Interactive Code Terminal & Quizzes
                  Clicking right page turns forward
                  ---------------------------------------------------- */}
              <div
                onClick={turnNext}
                className="relative p-2.5 sm:p-4 md:p-6 flex flex-col justify-between cursor-pointer group hover:bg-[#F8FAFC] dark:hover:bg-[#11294A] transition-colors w-full min-w-0"
                title="Click right page to turn next ↷"
              >
                {/* Subtle Inner Spine Shadow */}
                <div className="hidden sm:block absolute top-0 bottom-0 left-0 w-4 bg-gradient-to-r from-black/5 to-transparent pointer-events-none" />

                {/* Interactive Corner Dog-Ear / Page Curl (Top Right) */}
                <div
                  className="absolute top-0 right-0 w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-bl from-[#FFB800] via-[#FFE082] to-transparent shadow-md rounded-bl-xl z-20 group-hover:scale-110 group-hover:from-[#0756A5] transition-all flex items-start justify-end p-0.5 pointer-events-none"
                  title="Click to turn page"
                >
                  <span className="text-[8px] font-black text-[#102B50] group-hover:text-white pr-1 pt-0.5">
                    ↷
                  </span>
                </div>

                <div>
                  {/* Right Page Header */}
                  <div className="flex items-center justify-between gap-1 mb-2 pr-6">
                    <span className="text-xs sm:text-sm font-black text-[#102B50] dark:text-white line-clamp-1">
                      {currentSpread.rightPage.title}
                    </span>
                    <span className="text-[10px] text-[#0756A5] dark:text-[#FFB800] font-black animate-pulse">
                      Live
                    </span>
                  </div>

                  {/* Standard Code Block Mockup */}
                  {!currentSpread.rightPage.isQuiz && (
                    <div className="rounded-xl bg-[#102B50] p-2.5 sm:p-3 font-mono text-[10px] sm:text-xs shadow-sm mb-2 border border-[#1E3A5F]">
                      <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-white/10 text-[9px] text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-red-400" />
                          <span className="w-2 h-2 rounded-full bg-amber-400" />
                          <span className="w-2 h-2 rounded-full bg-emerald-400" />
                          <span className="ml-1 text-slate-300 font-bold">
                            {currentSpread.rightPage.filename}
                          </span>
                        </div>
                        <span className="text-emerald-400 font-bold text-[9px]">RUN ▶</span>
                      </div>
                      <div className="space-y-1 leading-relaxed">
                        {currentSpread.rightPage.codeLines.map((line, idx) => (
                          <div key={idx} className={line.color}>
                            {line.text}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Code Output Capsule */}
                  {!currentSpread.rightPage.isQuiz && (
                    <div className="hero-book-output-capsule">
                      <span className="hero-book-output-text">
                        {currentSpread.rightPage.output}
                      </span>
                      <span className="hero-book-output-badge">
                        Success ✓
                      </span>
                    </div>
                  )}

                  {/* Interactive Quiz Page Content */}
                  {currentSpread.rightPage.isQuiz && (
                    <div className="space-y-1.5 my-1">
                      <div className="text-xs sm:text-sm font-bold text-[#102B50] dark:text-white leading-snug">
                        {currentSpread.rightPage.question}
                      </div>
                      {currentSpread.rightPage.options.map((opt, idx) => (
                        <div
                          key={idx}
                          className={`hero-book-quiz-option ${opt.correct ? "correct" : "default"}`}
                        >
                          <span>{opt.label}</span>
                          {opt.correct && <Check size={13} className="text-emerald-600 dark:text-emerald-400 shrink-0" />}
                        </div>
                      ))}
                      <div className="text-[10px] sm:text-xs font-black text-emerald-600 dark:text-emerald-400 text-center pt-1">
                        {currentSpread.rightPage.reward}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Page Footer */}
                <div className="pt-2 mt-2 border-t border-[#E2E8F0] dark:border-[#1E3A5F] flex items-center justify-between text-[10px] sm:text-[11px] font-bold text-slate-500 dark:text-slate-300">
                  <span className="text-[#0756A5] dark:text-[#FFB800] font-extrabold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Turn Page</span> ↷
                  </span>
                  <span>Page {currentSpread.rightPage.num} of 8</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================
            INTERACTIVE REAL-TIME PAGE TURN CONTROLS BAR (Bottom)
            ======================================================== */}
        <div className="hero-book-controls">
          {/* Turn Previous Button */}
          <button
            type="button"
            onClick={turnPrev}
            className="flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl bg-white dark:bg-[#102B50] text-[#102B50] dark:text-white border border-[#E2E8F0] dark:border-[#1E3A5F] hover:border-[#FFB800] text-xs sm:text-sm font-bold shadow-xs cursor-pointer active:scale-95 transition-all select-none"
            title="Turn to previous spread (Left Arrow)"
          >
            <ArrowLeft size={14} className="text-[#0756A5] dark:text-[#FFB800]" />
            <span className="hidden xs:inline">Prev</span>
          </button>

          {/* Spread Dots Navigation & Center Page Turn Guidance Pill */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5">
              {SPREADS.map((sp, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    if (spreadIndex !== idx) {
                      if (soundEnabled) playPageFlipSound();
                      setFlipDirection(idx > spreadIndex ? "forward" : "backward");
                      setIsFlipping(true);
                      setTimeout(() => {
                        setSpreadIndex(idx);
                        setIsFlipping(false);
                      }, 350);
                    }
                  }}
                  className={`transition-all rounded-full cursor-pointer border-none p-0 ${
                    spreadIndex === idx
                      ? "w-6 h-2 bg-[#FFB800]"
                      : "w-2 h-2 bg-[#CBD5E1] dark:bg-[#1E3A5F] hover:bg-[#0756A5]"
                  }`}
                  title={`Go to ${sp.chapter}: ${sp.topic}`}
                />
              ))}
            </div>

            <span className="text-xs font-black text-[#102B50] dark:text-white">
              {currentSpread.chapter}
            </span>

            {/* Subtle, non-intrusive interactive page turn hint */}
            <div className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50/90 dark:bg-[#0A1E38] text-[#0756A5] dark:text-[#FFB800] border border-blue-100 dark:border-[#1E3A5F] text-[11px] font-bold select-none">
              <BookOpen size={12} strokeWidth={2.4} />
              <span>Click Page to Flip ↷</span>
            </div>
          </div>

          {/* Turn Next & Sound Toggle Controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-xl bg-white dark:bg-[#102B50] text-[#102B50] dark:text-white border border-[#E2E8F0] dark:border-[#1E3A5F] hover:border-[#FFB800] cursor-pointer shadow-xs active:scale-95 transition-all"
              title={soundEnabled ? "Mute page-turn sound" : "Enable paper flutter sound"}
            >
              {soundEnabled ? (
                <Volume2 size={15} className="text-[#0756A5] dark:text-[#FFB800]" />
              ) : (
                <VolumeX size={15} className="text-slate-400" />
              )}
            </button>

            <button
              type="button"
              onClick={turnNext}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-[#0756A5] hover:bg-[#064681] text-white border border-[#0756A5] text-xs sm:text-sm font-bold shadow-xs cursor-pointer active:scale-95 transition-all select-none"
              title="Turn to next spread (Right Arrow / Click Page)"
            >
              <span className="hidden xs:inline">Next</span>
              <ArrowRight size={14} className="text-[#FFB800]" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
