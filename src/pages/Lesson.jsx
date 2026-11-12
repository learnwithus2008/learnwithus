import React, { useEffect } from "react";
import { getTopicById, getAdjacentTopics, isFreeTopic, allTopics } from "../data/allTopics";
import LessonContent from "../components/LessonContent";
import { ArrowLeft, Lock, Sparkles, LogIn, UserPlus, BookOpen, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Lesson({
  topicId,
  onSelectTopic,
  onBackToLearn,
  onBack,
  selectedStage,
  onSelectStage,
  onOpenStageModal,
  selectedLanguage,
  onSelectLanguage,
  onOpenLanguageModal
}) {
  const { isAuthenticated, openAuthModal } = useAuth();
  const topic = getTopicById(topicId);
  const adjacent = getAdjacentTopics(topicId);
  const isFree = isFreeTopic(topicId);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [topicId]);

  if (!topic) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Topic Not Found</h2>
        <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
          The requested Python lesson could not be located.
        </p>
        <button
          onClick={onBack || onBackToLearn}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0756A5] hover:bg-[#064681] text-white font-semibold text-sm cursor-pointer border-none"
        >
          <ArrowLeft size={16} />
          Return to Learn Page
        </button>
      </div>
    );
  }

  // If user is not authenticated and lesson is not one of the first 2 free preview lessons
  if (!isAuthenticated && !isFree) {
    const freeLesson1 = allTopics[0] || { id: "what-is-python", title: "What is Python?" };
    const freeLesson2 = allTopics[1] || { id: "why-learn-python", title: "Why Learn Python?" };

    return (
      <div className="min-h-[80vh] max-w-4xl mx-auto px-4 py-8 sm:py-16 flex flex-col items-center justify-center animate-in">
        <div className="w-full bg-white dark:bg-[#101b2d] rounded-3xl border border-slate-200 dark:border-[#23344d] p-6 sm:p-10 shadow-xl text-center space-y-6 relative overflow-hidden">
          {/* Subtle Ambient Background Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-b from-blue-500/10 via-indigo-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

          {/* Top Return Button */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-[#1e3252] relative z-10">
            <button
              onClick={onBack || onBackToLearn}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-[#14233a] hover:bg-slate-200 dark:hover:bg-[#1e3252] border border-slate-200 dark:border-[#23344d] transition cursor-pointer"
            >
              <ArrowLeft size={15} />
              <span>Back to Curriculum</span>
            </button>
            <span className="notion-tag text-xs font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1.5">
              <Lock size={12} />
              <span>Account Required</span>
            </span>
          </div>

          {/* Lock Icon */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-3xl bg-[#0756A5] text-white flex items-center justify-center shadow-lg relative z-10">
            <Lock size={34} />
          </div>

          {/* Title & Topic Details */}
          <div className="space-y-2 max-w-xl mx-auto relative z-10">
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#0756A5] dark:text-[#FFB800]">
              {topic.sectionTitle} • Topic #{topic.topicNumber}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-[#102B50] dark:text-white tracking-tight">
              "{topic.title}"
            </h1>
            <p className="text-sm sm:text-base text-[#64748B] dark:text-slate-300 leading-relaxed pt-1">
              Except for the first 2 free preview lessons, all other Python lessons can only be read once you log in or have an account.
            </p>
          </div>

          {/* Value Proposition Pills */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto text-left pt-2 relative z-10">
            <div className="p-3.5 rounded-2xl bg-white dark:bg-[#102B50] border border-[#E2E8F0] dark:border-[#1E3A5F]">
              <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-[#102B50] dark:text-white mb-1">
                <BookOpen size={16} className="text-[#0756A5] dark:text-[#FFB800]" />
                <span>Full Access</span>
              </div>
              <p className="text-xs text-[#64748B] dark:text-slate-400">
                Unlock all 120 lessons across 19 curriculum sections.
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white dark:bg-[#102B50] border border-[#E2E8F0] dark:border-[#1E3A5F]">
              <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-[#102B50] dark:text-white mb-1">
                <Sparkles size={16} className="text-[#FFB800]" />
                <span>Interactive Runner</span>
              </div>
              <p className="text-xs text-[#64748B] dark:text-slate-400">
                Run live Python code in-browser with instant outputs.
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white dark:bg-[#102B50] border border-[#E2E8F0] dark:border-[#1E3A5F]">
              <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-[#102B50] dark:text-white mb-1">
                <ShieldCheck size={16} className="text-[#16A34A]" />
                <span>Free Forever</span>
              </div>
              <p className="text-xs text-[#64748B] dark:text-slate-400">
                Accounts are completely free with zero subscription fees.
              </p>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 max-w-md mx-auto relative z-10">
            <button
              onClick={() =>
                openAuthModal(
                  "login",
                  `Sign in to read "${topic.title}" and continue your Python learning journey!`
                )
              }
              className="btn-vibrant-primary w-full sm:w-auto px-6 py-3"
            >
              <LogIn size={18} />
              <span>Sign In to Read Lesson</span>
            </button>

            <button
              onClick={() =>
                openAuthModal(
                  "signup",
                  `Create a free account to read "${topic.title}" and unlock the entire curriculum!`
                )
              }
              className="btn-vibrant-secondary w-full sm:w-auto px-6 py-3"
            >
              <UserPlus size={18} />
              <span>Create Free Account</span>
            </button>
          </div>

          {/* Free Lessons Available Banner */}
          <div className="pt-4 border-t border-[#E2E8F0] dark:border-[#1E3A5F] max-w-lg mx-auto relative z-10">
            <p className="text-xs text-[#64748B] dark:text-slate-400 mb-2">
              Want to preview first? The first 2 lessons are free to read without signing in:
            </p>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <button
                onClick={() => onSelectTopic(freeLesson1.id)}
                className="text-xs font-bold text-[#0756A5] dark:text-[#FFB800] hover:text-[#FFB800] bg-[#F3F7FC] dark:bg-[#102B50] px-3 py-1.5 rounded-xl border border-[#E2E8F0] dark:border-[#1E3A5F] hover:border-[#FFB800] cursor-pointer"
              >
                1. {freeLesson1.title} →
              </button>
              <button
                onClick={() => onSelectTopic(freeLesson2.id)}
                className="text-xs font-bold text-[#0756A5] dark:text-[#FFB800] hover:text-[#FFB800] bg-[#F3F7FC] dark:bg-[#102B50] px-3 py-1.5 rounded-xl border border-[#E2E8F0] dark:border-[#1E3A5F] hover:border-[#FFB800] cursor-pointer"
              >
                2. {freeLesson2.title} →
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <LessonContent
      topic={topic}
      adjacent={adjacent}
      onSelectTopic={onSelectTopic}
      onBackToLearn={onBackToLearn}
      onBack={onBack || onBackToLearn}
      selectedStage={selectedStage}
      onSelectStage={onSelectStage}
      onOpenStageModal={onOpenStageModal}
      selectedLanguage={selectedLanguage}
      onSelectLanguage={onSelectLanguage}
      onOpenLanguageModal={onOpenLanguageModal}
    />
  );
}
