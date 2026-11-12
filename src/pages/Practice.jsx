import React, { useState, useMemo } from "react";
import { practiceData } from "../data/practiceData";
import { LEARNING_STAGES, getStageById } from "../data/learningStages";
import { getLanguageById } from "../data/learningLanguages";
import QuestionCard from "../components/QuestionCard";
import PageBackButton from "../components/PageBackButton";
import { PageHelpButton } from "../components/GuideTutorial/ContextualPageGuidance";
import { Code2, CheckCircle2, HelpCircle, Sparkles, Terminal, Lock } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Practice({
  selectedStage = "young",
  onOpenStageModal,
  selectedLanguage = "english",
  onOpenLanguageModal,
  onBack
}) {
  const { isAuthenticated, openAuthModal } = useAuth();
  const [activeStageFilter, setActiveStageFilter] = useState(selectedStage);
  const currentStageMeta = getStageById(selectedStage);
  const currentLangMeta = getLanguageById(selectedLanguage);

  // Filter questions based on stage
  const filteredQuestions = useMemo(() => {
    if (activeStageFilter === "all") return practiceData;
    return practiceData.filter((q) => q.stage === activeStageFilter);
  }, [activeStageFilter]);

  return (
    <div className="practice-page max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-8 md:py-10 pb-16 sm:pb-20 md:pb-24 w-full min-w-0 animate-in">
      {/* Back Navigation Button */}
      {onBack && (
        <div className="mb-3 sm:mb-4 flex items-center justify-start">
          <PageBackButton onBack={onBack} label="Back" />
        </div>
      )}

      {/* Page Header */}
      <div className="mb-8 pb-8 border-b border-[#E2E8F0] dark:border-[#1B3B66]">
        <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
          <div className="flex items-center gap-3">
            <span className="text-3xl sm:text-4xl select-none">⚡</span>
            <h1 className="heading-section text-[#102B50] dark:text-white">
              Interactive Practice
            </h1>
          </div>
          <PageHelpButton pageId="practice" />
        </div>

        <p className="body-base text-[#64748B] dark:text-[#CBD5E1] max-w-2xl leading-relaxed mb-5">
          Solve interactive quizzes, output predictions, bug-finding puzzles, and coding challenges tailored for <strong>{currentStageMeta.label} ({currentStageMeta.ageRange})</strong> in <strong>{currentLangMeta.label}</strong>.
        </p>

        {/* Stage & Language Pill Indicators */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="notion-tag text-xs sm:text-sm bg-[#F3F7FC] dark:bg-[#102B50] border border-[#E2E8F0] dark:border-[#1B3B66]">
            <span className="text-[#64748B] dark:text-[#94A3B8]">Stage:</span>
            <button
              onClick={onOpenStageModal}
              className="font-bold text-[#0756A5] dark:text-[#60A5FA] hover:underline cursor-pointer bg-transparent border-none p-0 ml-1"
            >
              {currentStageMeta.icon} {currentStageMeta.label}
            </button>
          </div>

          <div className="notion-tag text-xs sm:text-sm bg-[#F3F7FC] dark:bg-[#102B50] border border-[#E2E8F0] dark:border-[#1B3B66]">
            <span className="text-[#64748B] dark:text-[#94A3B8]">Language:</span>
            <button
              onClick={onOpenLanguageModal}
              className="font-bold text-[#0756A5] dark:text-[#60A5FA] hover:underline cursor-pointer bg-transparent border-none p-0 ml-1"
            >
              {currentLangMeta.icon} {currentLangMeta.shortLabel}
            </button>
          </div>
        </div>
      </div>

      {/* Sign In Required Notice if visitor */}
      {!isAuthenticated && (
        <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-[#F3F7FC] dark:bg-[#102B50] border border-[#E2E8F0] dark:border-[#1B3B66] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0756A5] text-white flex items-center justify-center shrink-0 shadow-sm border border-white/20">
              <Lock size={18} />
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-bold text-[#102B50] dark:text-white">
                Sign In Required for Interactive Practice
              </h4>
              <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#94A3B8]">
                Sign in or register to submit answers, test Python outputs, and track your practice scores.
              </p>
            </div>
          </div>
          <button
            onClick={() =>
              openAuthModal("login", "Sign in required to access interactive practice exercises and check answers!")
            }
            className="btn-vibrant-primary px-4 py-2 text-xs sm:text-sm shrink-0 whitespace-nowrap"
          >
            <Lock size={14} />
            <span>Sign In to Practice</span>
          </button>
        </div>
      )}

      {/* Stage Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-thin">
        <button
          onClick={() => setActiveStageFilter("all")}
          className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition cursor-pointer border ${
            activeStageFilter === "all"
              ? "bg-[#0756A5] text-white border-[#0756A5] shadow-sm shadow-blue-500/25"
              : "bg-white dark:bg-[#102B50] text-[#102B50] dark:text-[#CBD5E1] hover:bg-[#F3F7FC] dark:hover:bg-[#153560] border-[#E2E8F0] dark:border-[#1B3B66] hover:border-[#FFB800]"
          }`}
        >
          All Stages ({practiceData.length})
        </button>

        {LEARNING_STAGES.map((st) => {
          const count = practiceData.filter((q) => q.stage === st.id).length;
          return (
            <button
              key={st.id}
              onClick={() => setActiveStageFilter(st.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition cursor-pointer border ${
                activeStageFilter === st.id
                  ? "bg-[#0756A5] text-white border-[#0756A5] shadow-sm shadow-blue-500/25"
                  : "bg-white dark:bg-[#102B50] text-[#102B50] dark:text-[#CBD5E1] hover:bg-[#F3F7FC] dark:hover:bg-[#153560] border-[#E2E8F0] dark:border-[#1B3B66] hover:border-[#FFB800]"
              }`}
            >
              <span>{st.icon}</span>
              <span>{st.label} ({count})</span>
            </button>
          );
        })}
      </div>

      {/* Questions List */}
      <div className="space-y-6">
        {filteredQuestions.length > 0 ? (
          filteredQuestions.map((item, index) => (
            <QuestionCard key={item.id || index} item={item} index={index} />
          ))
        ) : (
          <div className="text-center py-12 bg-white dark:bg-[#0C1B30] rounded-2xl border border-slate-200 dark:border-[#183657] p-6 shadow-sm">
            <HelpCircle size={36} className="mx-auto text-slate-400 dark:text-[#91A6BF] mb-3" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              No questions found for this stage
            </h3>
            <p className="text-sm text-slate-600 dark:text-[#D2DEEC] max-w-sm mx-auto mb-4">
              Select 'All Stages' to view exercises across all levels.
            </p>
            <button
              onClick={() => setActiveStageFilter("all")}
              className="btn-vibrant-secondary"
            >
              View All Questions
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
