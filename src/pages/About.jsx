import React from "react";
import { LEARNING_STAGES } from "../data/learningStages";
import PageBackButton from "../components/PageBackButton";
import { PageHelpButton } from "../components/GuideTutorial/ContextualPageGuidance";
import BrandLogo, { LearnWithUsTagline } from "../components/BrandLogo";
import { BookOpen, CheckCircle, ShieldCheck, Zap, Sparkles, Heart, ArrowRight } from "lucide-react";

export default function About({ onNavigate, onBack }) {
  return (
    <div className="about-page max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-8 md:py-10 pb-16 sm:pb-20 md:pb-24 w-full min-w-0 animate-in">
      {/* Back Navigation & Page Help Button */}
      <div className="mb-3 sm:mb-4 flex items-center justify-between">
        {onBack ? (
          <PageBackButton onBack={onBack} label="Back" fallbackDestination="Home" />
        ) : (
          <div />
        )}
        <PageHelpButton pageId="about" />
      </div>

      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="flex flex-col items-center justify-center mb-4">
          <BrandLogo variant="mark" size="xl" />
          <LearnWithUsTagline size="md" className="mt-3" />
        </div>
        <h1 className="heading-hero text-[#102B50] dark:text-white mb-3">
          About Learn With Us
        </h1>
        <p className="body-large text-[#64748B] dark:text-[#CBD5E1] leading-relaxed">
          <span className="text-[#0756A5] font-bold">Learn. Practice. Grow.</span> — A beginner-friendly Python learning platform where students learn programming through simple explanations, examples, quizzes, coding exercises, projects and progress tracking.
        </p>
      </div>

      {/* Philosophy Card */}
      <div className="modern-card p-6 sm:p-10 mb-10 space-y-6">
        <h2 className="heading-section text-slate-900 dark:text-white mb-2">
          One Curriculum, Five Pedagogical Perspectives
        </h2>
        <p className="body-base text-slate-600 dark:text-[#D2DEEC] leading-relaxed">
          Traditional programming tutorials assume one generic audience. But a 6-year-old child learns through toy boxes and stories, a 12-year-old learns through game mechanics and Minecraft, a college student learns through memory diagrams and algorithms, a graduate learns through business payrolls and APIs, and a professional learns through production performance and system architecture.
        </p>

        {/* 5 Stages Summary Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 pt-2">
          {LEARNING_STAGES.map((s) => (
            <div key={s.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-[#102541] border border-slate-200 dark:border-[#183657] text-center">
              <span className="text-3xl block mb-2">{s.icon}</span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{s.label}</h3>
              <p className="text-xs text-slate-500 dark:text-[#91A6BF] mt-1 font-semibold">{s.ageRange}</p>
            </div>
          ))}
        </div>

        <div className="p-5 bg-[#F3F7FC] dark:bg-[#102B50] rounded-2xl border border-[#E2E8F0] dark:border-[#1E3A5F] text-[#102B50] dark:text-white font-bold text-center text-sm sm:text-base shadow-2xs">
          "The learner's age determines the teaching approach, not their coding potential."
        </div>

        <div className="grid sm:grid-cols-2 gap-4 pt-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#102B50] border border-[#E2E8F0] dark:border-[#1E3A5F] hover:border-[#FFB800] transition">
            <h3 className="text-base font-bold text-[#102B50] dark:text-white flex items-center gap-2 mb-1.5">
              <CheckCircle size={18} className="text-[#16A34A]" />
              Free Access & Zero Paywalls
            </h3>
            <p className="text-sm text-[#64748B] dark:text-slate-300 m-0 leading-relaxed">
              Start reading preview lessons immediately; create a free learner account to save bookmarks, submit quizzes, and track XP with zero paywalls.
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#102B50] border border-[#E2E8F0] dark:border-[#1E3A5F] hover:border-[#FFB800] transition">
            <h3 className="text-base font-bold text-[#102B50] dark:text-white flex items-center gap-2 mb-1.5">
              <CheckCircle size={18} className="text-[#16A34A]" />
              Complete 19-Section Curriculum
            </h3>
            <p className="text-sm text-[#64748B] dark:text-slate-300 m-0 leading-relaxed">
              198 comprehensive topics from syntax to OOP, APIs, databases, data analysis, machine learning, and AI.
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#102B50] border border-[#E2E8F0] dark:border-[#1E3A5F] hover:border-[#FFB800] transition">
            <h3 className="text-base font-bold text-[#102B50] dark:text-white flex items-center gap-2 mb-1.5">
              <CheckCircle size={18} className="text-[#16A34A]" />
              Hands-On Practice Sandbox
            </h3>
            <p className="text-sm text-[#64748B] dark:text-slate-300 m-0 leading-relaxed">
              Interactive code editor with model solutions and output verification.
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#102B50] border border-[#E2E8F0] dark:border-[#1E3A5F] hover:border-[#FFB800] transition">
            <h3 className="text-base font-bold text-[#102B50] dark:text-white flex items-center gap-2 mb-1.5">
              <CheckCircle size={18} className="text-[#16A34A]" />
              Real-World Projects
            </h3>
            <p className="text-sm text-[#64748B] dark:text-slate-300 m-0 leading-relaxed">
              25 projects spanning fun games to production-grade microservices.
            </p>
          </div>
        </div>
      </div>

      {/* CTA & Policies */}
      <div className="text-center py-6 space-y-4">
        <div>
          <button
            onClick={() => onNavigate("learn")}
            className="btn-vibrant-primary"
          >
            <span>Start Exploring Topics Now</span>
            <ArrowRight size={18} />
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 pt-4">
          <button
            onClick={() => { onNavigate("contact"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            className="hover:text-blue-600 dark:hover:text-[#60B7FF] transition bg-transparent border-none cursor-pointer"
          >
            Contact Support & Team
          </button>
          <span>•</span>
          <button
            onClick={() => { onNavigate("privacy"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            className="hover:text-blue-600 dark:hover:text-[#60B7FF] transition bg-transparent border-none cursor-pointer"
          >
            Privacy Policy
          </button>
          <span>•</span>
          <button
            onClick={() => { onNavigate("terms"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            className="hover:text-blue-600 dark:hover:text-[#60B7FF] transition bg-transparent border-none cursor-pointer"
          >
            Terms of Service
          </button>
        </div>
      </div>
    </div>
  );
}
