import React, { useState, useEffect, useRef } from "react";
import CodeBlock from "./CodeBlock";
import VisualExplanation from "./VisualExplanation";
import LivePythonRunner from "./LivePythonRunner";
import ProgressRing from "./ProgressRing";
import ConfettiCelebration from "./ConfettiCelebration";
import TopicNotes from "./TopicNotes";
import FontSizeControl from "./FontSizeControl";
import AskDoubtButton from "./AskDoubtButton";
import { PageHelpButton } from "./GuideTutorial/ContextualPageGuidance";
import { playCelebrationChime, playSuccessChime, playPageFlipSound } from "../utils/audioCelebration";
import { LEARNING_STAGES, getStageById } from "../data/learningStages";
import { LEARNING_LANGUAGES, getLanguageById } from "../data/learningLanguages";
import { EXPLANATION_FORMATS, getFormatById } from "../data/explanationFormats";
import {
  getSectionForTopic,
  getNextSection,
  markTopicCompleted,
  isTopicCompleted,
  getCompletedTopics,
  isFreeTopic
} from "../data/allTopics";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Check,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  BookOpen,
  RotateCw,
  Layers,
  Code2,
  Brain,
  Zap,
  Terminal,
  ChevronRight,
  ChevronDown,
  Trophy,
  HelpCircle,
  Play,
  RotateCcw,
  Bookmark,
  BookmarkCheck,
  StickyNote,
  Lock,
  Volume2,
  VolumeX,
  Compass,
  Award
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNotepad } from "../context/NotepadContext";
import CertificateModal from "./CertificateModal";

export default function LessonContent({
  topic,
  adjacent,
  onSelectTopic,
  onBackToLearn,
  onBack,
  selectedStage = "young",
  onSelectStage,
  onOpenStageModal,
  selectedLanguage = "english",
  onSelectLanguage,
  onOpenLanguageModal
}) {
  // Lesson steps: 'understand' | 'example' | 'code' | 'practice' | 'challenge' | 'complete'
  const [currentStep, setCurrentStep] = useState("understand");
  const [pageTurnKey, setPageTurnKey] = useState(0);
  const [selectedFormat, setSelectedFormat] = useState("simple");
  const [formatMenuOpen, setFormatMenuOpen] = useState(false);
  const [completedTopicIds, setCompletedTopicIds] = useState(getCompletedTopics());
  const [showConfetti, setShowConfetti] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);

  // Audio preference for book page-turn flutter sound
  const [soundEnabled, setSoundEnabled] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("lwu_book_sound") !== "muted";
    }
    return true;
  });

  const toggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        localStorage.setItem("lwu_book_sound", next ? "enabled" : "muted");
      }
      if (next) playPageFlipSound();
      return next;
    });
  };

  const { isAuthenticated, openAuthModal, toggleBookmark, isTopicBookmarked, toggleComplete, recordQuiz } = useAuth();
  const isBookmarked = isTopicBookmarked(topic.id);
  const { openNotepad, setTopicContext } = useNotepad();

  // Practice state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answerChecked, setAnswerChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // Challenge & Auto-Next state
  const [showHint, setShowHint] = useState(false);
  const [challengeCompleted, setChallengeCompleted] = useState(false);
  const [autoNextCountdown, setAutoNextCountdown] = useState(null);
  const [autoNextPaused, setAutoNextPaused] = useState(false);

  const containerRef = useRef(null);

  // Load section context
  const sectionMeta = getSectionForTopic(topic.id);
  const { section, topicIndex, totalTopics, isLastInSection } = sectionMeta;
  const nextSection = isLastInSection ? getNextSection(section.id) : null;

  // Reset or initialize state when topic changes
  useEffect(() => {
    setCurrentStep("understand");
    setPageTurnKey((k) => k + 1);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setAnswerChecked(false);
    setShowHint(false);
    setChallengeCompleted(false);
    setShowConfetti(false);
    setAutoNextCountdown(null);
    setAutoNextPaused(false);
    setCompletedTopicIds(getCompletedTopics());
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [topic.id]);

  const isFree = isFreeTopic(topic.id);
  const canReadLesson = isAuthenticated || isFree;

  // Ensure unauthenticated users on non-free lessons are kept on 'understand'
  useEffect(() => {
    if (!canReadLesson && currentStep !== "understand") {
      setCurrentStep("understand");
    }
  }, [canReadLesson, currentStep]);

  // Resolve stage-specific content
  const stageObj =
    topic.stages?.[selectedStage] ||
    topic.stages?.young ||
    topic.stages?.college ||
    Object.values(topic.stages || {})[0] ||
    {};
  const currentStageMeta = getStageById(selectedStage);

  // Resolve language-specific content
  const langPkg =
    stageObj.languages?.[selectedLanguage] ||
    stageObj.languages?.english ||
    stageObj.languages?.["english-telugu"] ||
    Object.values(stageObj.languages || {})[0] ||
    stageObj;
  const currentLangMeta = getLanguageById(selectedLanguage);

  // Resolve narrative explanations
  const explanations = langPkg.explanations || {};
  const currentFormatMeta = getFormatById(selectedFormat);
  const activeNarrative =
    explanations[selectedFormat] ||
    explanations.simple ||
    langPkg.theory ||
    langPkg.explanation ||
    "Python makes this concept simple, clean, and reliable to understand.";

  const questions = langPkg.questions || [];
  const currentQuestion = questions[currentQuestionIndex];
  const tryIt = langPkg.tryItYourself || {};

  // Extract key takeaways to offer as 1-click note additions (memoized)
  const defaultKeyPoints = React.useMemo(() => [
    langPkg.quickSummary,
    langPkg.realLifeExample,
    langPkg.theory ? `${topic.title}: ${langPkg.theory.slice(0, 90)}...` : null
  ].filter(Boolean), [langPkg.quickSummary, langPkg.realLifeExample, langPkg.theory, topic.title]);

  // Keep notepad context in sync with current lesson
  useEffect(() => {
    setTopicContext({
      topicId: topic.id,
      topicTitle: topic.title,
      defaultKeyPoints
    });
  }, [topic.id, topic.title, defaultKeyPoints, setTopicContext]);

  // Step transition helper with page-flip animation and optional sound
  const goToStep = (stepName) => {
    if (!canReadLesson && stepName !== "understand") {
      openAuthModal(
        "login",
        `Sign in or create an account to unlock interactive examples, code runner, quizzes & challenges for "${topic.title}"!`
      );
      return;
    }
    if (soundEnabled) {
      playPageFlipSound();
    }
    setPageTurnKey((k) => k + 1);
    setCurrentStep(stepName);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Practice handlers
  const handleCheckAnswer = () => {
    if (!selectedOption || !currentQuestion) return;
    const correct = selectedOption === currentQuestion.correctAnswer;
    setIsCorrect(correct);
    setAnswerChecked(true);
    if (correct) {
      playSuccessChime();
    }
  };

  const handleNextQuestion = () => {
    if (!canReadLesson) {
      openAuthModal("login", "Sign in required to proceed to the next question!");
      return;
    }
    if (soundEnabled) {
      playPageFlipSound();
    }
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
      setAnswerChecked(false);
      setIsCorrect(false);
    } else {
      goToStep("challenge");
    }
  };

  const handleOpenNextChapter = () => {
    setAutoNextCountdown(null);
    const nextTopicId = adjacent.next
      ? adjacent.next.id
      : nextSection && nextSection.topics[0]
      ? nextSection.topics[0].id
      : null;
    const nextTitle = adjacent.next
      ? adjacent.next.title
      : nextSection && nextSection.topics[0]
      ? nextSection.topics[0].title
      : "";

    if (!isAuthenticated && nextTopicId && !isFreeTopic(nextTopicId)) {
      openAuthModal(
        "login",
        `Except for the first 2 free preview lessons, other lessons require you to sign in or have an account. Sign in to read "${nextTitle}"!`
      );
      return;
    }

    if (soundEnabled) {
      playPageFlipSound();
    }

    if (adjacent.next) {
      onSelectTopic(adjacent.next.id);
    } else if (nextSection && nextSection.topics[0]) {
      onSelectTopic(nextSection.topics[0].id);
    } else {
      onBackToLearn();
    }
  };

  const handleCompleteChallenge = () => {
    setChallengeCompleted(true);
    markTopicCompleted(topic.id);
    setCompletedTopicIds(getCompletedTopics());
    toggleComplete(topic.id, true);
    playCelebrationChime();
    setShowConfetti(true);
    goToStep("complete");

    if (adjacent.next || (nextSection && nextSection.topics[0])) {
      setAutoNextCountdown(8);
      setAutoNextPaused(false);
    }
  };

  // Auto-next countdown timer
  useEffect(() => {
    if (autoNextCountdown === null || autoNextPaused) return;

    if (autoNextCountdown <= 0) {
      handleOpenNextChapter();
      return;
    }

    const timer = setTimeout(() => {
      setAutoNextCountdown((prev) => (prev !== null && prev > 0 ? prev - 1 : null));
    }, 1000);

    return () => clearTimeout(timer);
  }, [autoNextCountdown, autoNextPaused, currentStep, adjacent.next, nextSection, isAuthenticated]);

  // Step definition mapping
  const steps = [
    { id: "understand", label: "1. Concept & Theory", pageNum: 1, icon: BookOpen },
    { id: "example", label: "2. Visual Example", pageNum: 2, icon: Lightbulb },
    { id: "code", label: "3. Live Code Runner", pageNum: 3, icon: Code2 },
    { id: "practice", label: "4. Practice Quiz", pageNum: 4, icon: CheckCircle2 },
    { id: "challenge", label: "5. Coding Challenge", pageNum: 5, icon: Zap },
    { id: "complete", label: "6. Mastery Review", pageNum: 6, icon: Trophy }
  ];

  const currentStepMeta = steps.find((s) => s.id === currentStep) || steps[0];
  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);
  const progressPercent = Math.round(((topicIndex - 1 + (currentStepIndex + 1) / 6) / totalTopics) * 100);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 md:py-8 pb-20 sm:pb-24 w-full min-w-0 animate-in space-y-6" ref={containerRef}>
      {showConfetti && <ConfettiCelebration active={showConfetti} onComplete={() => setShowConfetti(false)} />}

      {/* ========================================================
          BOOK HEADER & NAVIGATION CONTROLS BAR
          ======================================================== */}
      <div className="bg-white dark:bg-[#102B50] rounded-2xl border border-[#E2E8F0] dark:border-[#1B3B66] p-3.5 sm:p-5 shadow-xs transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3.5">
          {/* Breadcrumb Left Controls */}
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <button
              onClick={onBack || onBackToLearn}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold text-[#102B50] dark:text-slate-200 bg-[#F3F7FC] dark:bg-[#0A1E38] hover:bg-[#E2E8F0] dark:hover:bg-[#153560] border border-[#E2E8F0] dark:border-[#1B3B66] transition cursor-pointer shrink-0 active:scale-95"
              title="Return to curriculum"
            >
              <ArrowLeft size={15} className="text-[#0756A5] dark:text-[#FFB800]" />
              <span>Back</span>
            </button>

            <span className="text-slate-300 dark:text-slate-600">•</span>

            <button
              onClick={onBackToLearn}
              className="text-xs sm:text-sm font-bold text-[#64748B] dark:text-slate-300 hover:text-[#0756A5] dark:hover:text-[#FFB800] transition flex items-center gap-1 cursor-pointer bg-transparent border-none p-0 max-w-[130px] sm:max-w-[220px] truncate"
              title="Return to curriculum module"
            >
              <span>{section.title}</span>
            </button>

            <span className="text-slate-300 dark:text-slate-600 hidden sm:inline">•</span>

            <span className="text-xs sm:text-sm font-extrabold text-[#102B50] dark:text-white hidden sm:inline font-mono">
              Chapter {topicIndex} of {totalTopics}
            </span>

            {/* Quick Prev Topic Button */}
            {adjacent.prev && (
              <button
                onClick={() => {
                  if (soundEnabled) playPageFlipSound();
                  onSelectTopic(adjacent.prev.id);
                }}
                className="ml-1 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-[#0756A5] dark:text-[#60A5FA] bg-[#F3F7FC] dark:bg-[#0A1E38] hover:bg-[#FFB800] hover:text-[#102B50] border border-[#E2E8F0] dark:border-[#1B3B66] transition cursor-pointer shrink-0"
                title={`Previous Chapter: ${adjacent.prev.title}`}
              >
                <ArrowLeft size={12} className="text-[#0756A5] dark:text-[#60A5FA]" />
                <span>Prev Ch</span>
              </button>
            )}

            {/* Quick Next Topic Button */}
            {adjacent.next && (
              <button
                onClick={() => {
                  if (soundEnabled) playPageFlipSound();
                  onSelectTopic(adjacent.next.id);
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-[#0756A5] dark:text-[#60A5FA] bg-[#F3F7FC] dark:bg-[#0A1E38] hover:bg-[#FFB800] hover:text-[#102B50] border border-[#E2E8F0] dark:border-[#1B3B66] transition cursor-pointer shrink-0"
                title={`Next Chapter: ${adjacent.next.title}`}
              >
                <span>Next Ch</span>
                <ArrowRight size={12} className="text-[#0756A5] dark:text-[#60A5FA]" />
              </button>
            )}
          </div>

          {/* Interactive Tool Badges (Stage, Language, Sound, Notepad, Save) */}
          <div className="flex items-center gap-1.5 flex-wrap shrink-0">
            {/* Audio Toggle (Subtle Book Page-Flip Flutter Sound) */}
            <button
              onClick={toggleSound}
              className={`notion-tag text-xs font-bold cursor-pointer transition flex items-center gap-1.5 py-1 px-2.5 ${
                soundEnabled
                  ? "bg-[#FFFBEB] dark:bg-[#153560] text-[#102B50] dark:text-[#FFB800] border-[#FFB800]"
                  : "bg-slate-100 dark:bg-[#0A1E38] text-[#102B50] dark:text-slate-300 border-slate-200 dark:border-[#1B3B66]"
              }`}
              title={soundEnabled ? "Book Sound is ON (Click to Mute)" : "Book Sound is MUTED (Click to Enable)"}
            >
              {soundEnabled ? (
                <>
                  <Volume2 size={13} className="text-[#0756A5] dark:text-[#FFB800]" />
                  <span>Sound ON</span>
                </>
              ) : (
                <>
                  <VolumeX size={13} className="text-[#64748B] dark:text-slate-400" />
                  <span>Muted</span>
                </>
              )}
            </button>

            {/* Stage Badge */}
            <button
              onClick={onOpenStageModal}
              className="notion-tag text-xs font-bold cursor-pointer hover:border-[#FFB800] transition flex items-center gap-1 py-1 px-2.5"
              title="Change Learning Stage"
            >
              <span>{currentStageMeta.icon}</span>
              <span>{currentStageMeta.label.split(" ")[0]}</span>
            </button>

            {/* Language Badge */}
            <button
              onClick={onOpenLanguageModal}
              className="notion-tag text-xs font-bold cursor-pointer hover:border-[#FFB800] transition flex items-center gap-1 py-1 px-2.5"
              title="Change Language"
            >
              <span>{currentLangMeta.icon}</span>
              <span>{currentLangMeta.shortLabel}</span>
            </button>

            {/* Font Size Control */}
            <FontSizeControl variant="badge" />

            {/* Study Notepad */}
            <button
              onClick={() =>
                openNotepad({
                  topicId: topic.id,
                  topicTitle: topic.title,
                  defaultKeyPoints,
                  tab: "topic"
                })
              }
              className="notion-tag text-xs font-bold cursor-pointer transition flex items-center gap-1.5 py-1 px-2.5 bg-[#F3F7FC] dark:bg-[#0A1E38] text-[#0756A5] dark:text-[#60A5FA] border-[#E2E8F0] dark:border-[#1B3B66] hover:border-[#FFB800]"
              title="Open Study Notepad (Alt+N)"
            >
              <StickyNote size={13} className="text-[#0756A5] dark:text-[#FFB800]" />
              <span>Notes</span>
            </button>

            {/* Bookmark / Save */}
            <button
              onClick={() => toggleBookmark(topic.id)}
              className={`notion-tag text-xs font-bold cursor-pointer transition flex items-center gap-1.5 py-1 px-2.5 ${
                isBookmarked
                  ? "bg-[#FFFBEB] dark:bg-[#153560] text-[#102B50] dark:text-[#FFB800] border-[#FFB800]"
                  : "hover:border-[#FFB800]"
              }`}
              title={isBookmarked ? "Remove Bookmark" : "Save Lesson to Bookmarks"}
            >
              {isBookmarked ? (
                <BookmarkCheck size={13} className="text-[#0756A5] dark:text-[#FFB800]" />
              ) : (
                <Bookmark size={13} className="text-[#0756A5] dark:text-slate-300" />
              )}
              <span>{isBookmarked ? "Saved" : "Save"}</span>
            </button>

            {/* WhatsApp Doubt Button in Toolbar */}
            <AskDoubtButton
              variant="lesson-header"
              sectionTitle={section.title}
              lessonName={topic.title}
              topicNumber={topic.topicNumber}
              stepName={currentStepMeta.label}
              label="Ask Doubt"
            />

            <PageHelpButton pageId="lesson" />
          </div>
        </div>

        {/* Title & Overall Progress */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl select-none">📖</span>
            <div>
              <h1 className="text-lg sm:text-2xl font-black text-[#102B50] dark:text-white tracking-tight">
                {topic.title}
              </h1>
              <span className="text-xs text-[#64748B] dark:text-[#CBD5E1] font-semibold">
                Section: {section.title} • Topic #{topic.topicNumber}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            <AskDoubtButton
              variant="section"
              sectionTitle={section.title}
              lessonName={topic.title}
              topicNumber={topic.topicNumber}
              stepName={currentStepMeta.label}
              label="Ask Doubt"
            />
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-[#F3F7FC] dark:bg-[#0A1E38] text-[#0756A5] dark:text-[#FFB800] border border-[#E2E8F0] dark:border-[#1B3B66] shadow-2xs font-mono">
              Page {currentStepMeta.pageNum} of 6 • {progressPercent}% Done
            </span>
          </div>
        </div>

        {/* Book Progress Ribbon Line */}
        <div className="w-full bg-slate-100 dark:bg-[#0c1422] h-2 rounded-full overflow-hidden mb-3">
          <div
            className="bg-gradient-to-r from-[#0756A5] via-[#FFB800] to-[#16A34A] h-full transition-all duration-300 rounded-full"
            style={{ width: `${Math.max(8, progressPercent)}%` }}
          />
        </div>

        {/* Book Page/Step Ribbon Navigation Buttons */}
        <div id="tour-lesson-steps" className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {steps.map((st, idx) => {
            const Icon = st.icon;
            const isCurrent = st.id === currentStep;
            const isPassed = idx < currentStepIndex;
            const isLocked = !canReadLesson && idx > 0;

            return (
              <button
                key={st.id}
                onClick={() => goToStep(st.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition cursor-pointer border ${
                  isCurrent
                    ? "bg-[#0756A5] text-white border-[#0756A5] shadow-xs"
                    : isPassed
                    ? "bg-[#F3F7FC] dark:bg-[#153560] text-[#0756A5] dark:text-[#FFB800] border-[#E2E8F0] dark:border-[#1B3B66]"
                    : "bg-white dark:bg-[#102B50] text-[#64748B] dark:text-slate-300 border-[#E2E8F0] dark:border-[#1B3B66] hover:border-[#FFB800]"
                }`}
                title={isLocked ? "Sign in required to access this step" : `Go to Page ${st.pageNum}: ${st.label}`}
              >
                {isPassed ? (
                  <Check size={14} className="text-[#16A34A] shrink-0" />
                ) : isLocked ? (
                  <Lock size={12} className="text-[#0756A5] dark:text-[#FFB800] shrink-0" />
                ) : (
                  <Icon size={14} strokeWidth={2.2} className={isCurrent ? "text-white" : "text-[#0756A5] dark:text-[#FFB800]"} />
                )}
                <span>{st.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================
          INTERACTIVE DIGITAL BOOK SPREAD (2-PAGE DESKTOP / 1-PAGE MOBILE)
          ======================================================== */}
      <div key={pageTurnKey} className="book-stage animate-page-flip">
        <div className="book-spread">
          {/* Decorative Golden Ribbon Bookmark on Top Right */}
          <div className="book-ribbon" title="Book Ribbon" />

          {/* =====================================================
              PAGE STEP 1: CONCEPT & EXPLANATION (Understand)
              ===================================================== */}
          {currentStep === "understand" && (
            <div className="book-spread-split">
              {/* Left Page (Page 1): What is it, Why do we need it, Core Theory */}
              <div className="book-page-left space-y-6">
                <div>
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E2E8F0] dark:border-[#1B3B66]">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#0756A5] dark:text-[#FFB800]">
                      Page 1 • Concept Breakdown
                    </span>
                    <span className="text-xs font-mono text-slate-400">Chapter {topicIndex}</span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black text-[#102B50] dark:text-white tracking-tight mb-2">
                    {topic.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-300 leading-relaxed font-medium">
                    {langPkg.quickSummary || "Master the foundational idea behind this Python feature."}
                  </p>
                </div>

                {/* What is it? Callout */}
                {langPkg.whatIsIt && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-[#F3F7FC] dark:bg-[#0A1E38] border border-[#E2E8F0] dark:border-[#1B3B66] flex items-start gap-3">
                    <span className="text-2xl select-none">💡</span>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-[#0756A5] dark:text-[#FFB800] block mb-1">
                        What is it?
                      </span>
                      <p className="text-xs sm:text-sm text-[#102B50] dark:text-slate-100 leading-relaxed m-0 font-medium">
                        {langPkg.whatIsIt}
                      </p>
                    </div>
                  </div>
                )}

                {/* Why do we need it? Callout */}
                {langPkg.whyDoWeNeedIt && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-[#F3F7FC] dark:bg-[#0A1E38] border border-[#E2E8F0] dark:border-[#1B3B66] flex items-start gap-3">
                    <span className="text-2xl select-none">🎯</span>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-[#0756A5] dark:text-[#FFB800] block mb-1">
                        Why do we need it?
                      </span>
                      <p className="text-xs sm:text-sm text-[#102B50] dark:text-slate-100 leading-relaxed m-0 font-medium">
                        {langPkg.whyDoWeNeedIt}
                      </p>
                    </div>
                  </div>
                )}

                {/* Left Page Turn Button (Bottom on mobile) */}
                <div className="pt-4 border-t border-[#E2E8F0] dark:border-[#1B3B66] flex items-center justify-between text-xs font-bold text-[#64748B]">
                  <span>Turn to Page 2 for Visuals & Explanations →</span>
                </div>
              </div>

              {/* Book Spine Center Line */}
              <div className="book-spine" />

              {/* Right Page (Page 2): Explanation Style, Narrative, Key Points, Next Button */}
              <div className="book-page-right space-y-6 flex flex-col justify-between">
                <div className="space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-[#1B3B66]">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#0756A5] dark:text-[#FFB800]">
                      Page 2 • Interactive Explanations
                    </span>

                    {/* Another Explanation Format Dropdown */}
                    <div className="relative">
                      <button
                        onClick={() => setFormatMenuOpen(!formatMenuOpen)}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-white dark:bg-[#102B50] hover:bg-[#F3F7FC] text-[#102B50] dark:text-white border border-[#E2E8F0] dark:border-[#1B3B66] shadow-2xs cursor-pointer"
                      >
                        <RotateCw size={13} className="text-[#0756A5] dark:text-[#FFB800]" />
                        <span>{currentFormatMeta?.label || "Another Explanation"}</span>
                        <ChevronDown size={13} className="text-[#0756A5] dark:text-[#FFB800]" />
                      </button>

                      {formatMenuOpen && (
                        <div className="absolute right-0 mt-1.5 w-56 bg-white dark:bg-[#102B50] rounded-2xl shadow-xl border border-[#E2E8F0] dark:border-[#1B3B66] p-2 z-30 animate-in">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1 block">
                            Choose Style:
                          </span>
                          {EXPLANATION_FORMATS.map((fmt) => (
                            <button
                              key={fmt.id}
                              onClick={() => {
                                setSelectedFormat(fmt.id);
                                setFormatMenuOpen(false);
                              }}
                              className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer border-none ${
                                selectedFormat === fmt.id
                                  ? "bg-[#F3F7FC] dark:bg-[#153560] text-[#0756A5] dark:text-[#FFB800]"
                                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#14233a]"
                              }`}
                            >
                              <span>{fmt.icon}</span>
                              <span>{fmt.label}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Active Narrative Explanation Text */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#102B50] border border-[#E2E8F0] dark:border-[#1B3B66] shadow-2xs">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#0756A5] dark:text-[#FFB800] block mb-2">
                      {currentFormatMeta?.label || "Simple"} Breakdown:
                    </span>
                    <p className="text-xs sm:text-sm text-[#102B50] dark:text-slate-100 leading-relaxed whitespace-pre-line m-0 font-medium">
                      {activeNarrative}
                    </p>
                  </div>

                  {/* Important Points to Remember */}
                  {langPkg.importantPoints && langPkg.importantPoints.length > 0 && (
                    <div className="p-4 rounded-2xl bg-[#F3F7FC] dark:bg-[#0A1E38] border border-[#E2E8F0] dark:border-[#1B3B66]">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#0756A5] dark:text-[#FFB800] block mb-2 flex items-center gap-1">
                        <Sparkles size={14} className="text-[#0756A5] dark:text-[#FFB800]" />
                        <span>Key Points to Remember:</span>
                      </span>
                      <ul className="space-y-1.5 text-xs sm:text-sm text-[#102B50] dark:text-slate-100 m-0 p-0 list-none font-medium">
                        {langPkg.importantPoints.map((pt, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <Check size={14} className="text-[#16A34A] shrink-0 mt-0.5" />
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Right Page Navigation: Turn to Next Page Button */}
                <div className="pt-4 border-t border-[#E2E8F0] dark:border-[#1B3B66] flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs text-slate-400 font-semibold">Page 2 of 6</span>
                    <AskDoubtButton
                      variant="card"
                      sectionTitle={section.title}
                      lessonName={topic.title}
                      topicNumber={topic.topicNumber}
                      stepName="1. Concept & Theory"
                      label="Ask Doubt"
                    />
                  </div>
                  <button
                    onClick={() => goToStep("example")}
                    className="btn-vibrant-primary px-5 py-2.5 text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer shadow-sm active:scale-95"
                  >
                    <span>Turn Page: See Example</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* =====================================================
              PAGE STEP 2: VISUAL EXAMPLE & REAL-LIFE ANALOGY
              ===================================================== */}
          {currentStep === "example" && (
            <div className="book-spread-split">
              {/* Left Page (Page 3): Real Life Metaphor & Common Mistakes */}
              <div className="book-page-left space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-[#1B3B66]">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#0756A5] dark:text-[#FFB800]">
                    Page 3 • Real-World Context
                  </span>
                  <span className="text-xs font-mono text-slate-400">Chapter {topicIndex}</span>
                </div>

                {langPkg.realLifeExample && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-[#F3F7FC] dark:bg-[#0A1E38] border border-[#E2E8F0] dark:border-[#1B3B66]">
                    <span className="text-2xl select-none block mb-2">🌍</span>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#0756A5] dark:text-[#FFB800] block mb-1">
                      Real-Life Situation:
                    </span>
                    <p className="text-xs sm:text-sm text-[#102B50] dark:text-slate-100 leading-relaxed font-medium m-0">
                      {langPkg.realLifeExample}
                    </p>
                  </div>
                )}

                {langPkg.commonMistakes && (
                  <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 block mb-1.5 flex items-center gap-1.5">
                      <AlertTriangle size={15} className="text-[#D97706] dark:text-[#FFB800]" />
                      <span>Common Mistake to Avoid:</span>
                    </span>
                    <p className="text-xs sm:text-sm font-bold text-amber-950 dark:text-amber-100 mb-1">
                      {langPkg.commonMistakes.mistake}
                    </p>
                    <p className="text-xs text-amber-800 dark:text-amber-200 m-0">
                      💡 <strong>Fix:</strong> {langPkg.commonMistakes.fix}
                    </p>
                  </div>
                )}

                <div className="pt-4 border-t border-[#E2E8F0] dark:border-[#1B3B66]">
                  <button
                    onClick={() => goToStep("understand")}
                    className="btn-vibrant-secondary px-4 py-2 text-xs font-bold flex items-center gap-1.5"
                  >
                    <ArrowLeft size={14} />
                    <span>Turn Back to Page 1</span>
                  </button>
                </div>
              </div>

              {/* Book Spine */}
              <div className="book-spine" />

              {/* Right Page (Page 4): Visual Concept Diagram */}
              <div className="book-page-right space-y-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-[#1B3B66]">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#0756A5] dark:text-[#FFB800]">
                      Page 4 • Visual Concept Diagram
                    </span>
                    <span className="text-xs font-mono text-slate-400">Step 2 of 6</span>
                  </div>

                  {stageObj.visual ? (
                    <div className="p-3 bg-white dark:bg-[#102B50] rounded-2xl border border-[#E2E8F0] dark:border-[#1B3B66] shadow-xs">
                      <VisualExplanation visual={stageObj.visual} selectedStage={selectedStage} />
                    </div>
                  ) : (
                    <div className="p-6 text-center bg-white dark:bg-[#102B50] rounded-2xl border border-[#E2E8F0] dark:border-[#1B3B66]">
                      <span className="text-3xl mb-2 block">✨</span>
                      <p className="text-xs sm:text-sm text-[#102B50] dark:text-white font-bold">
                        Concept model verified for {currentStageMeta.label}.
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-[#E2E8F0] dark:border-[#1B3B66] flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs text-slate-400 font-semibold">Page 4 of 6</span>
                    <AskDoubtButton
                      variant="card"
                      sectionTitle={section.title}
                      lessonName={topic.title}
                      topicNumber={topic.topicNumber}
                      stepName="2. Visual Example"
                      label="Ask Doubt"
                    />
                  </div>
                  <button
                    onClick={() => goToStep("code")}
                    className="btn-vibrant-primary px-5 py-2.5 text-xs sm:text-sm font-bold flex items-center gap-2"
                  >
                    <span>Turn Page: Live Code Runner</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* =====================================================
              PAGE STEP 3: LIVE PYTHON CODE RUNNER
              ===================================================== */}
          {currentStep === "code" && (
            <div className="book-spread-split">
              {/* Left Page: Code Breakdown & Logic */}
              <div className="book-page-left space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-[#1B3B66]">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#0756A5] dark:text-[#FFB800]">
                    Page 5 • Python Syntax & Logic
                  </span>
                  <span className="text-xs font-mono text-slate-400">Step 3 of 6</span>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-black text-[#102B50] dark:text-white mb-2">
                    How it Works under the Hood:
                  </h3>
                  <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-300 leading-relaxed font-medium">
                    {langPkg.howItWorks || "Python executes code sequentially from top to bottom, resolving variables, functions, and control flow expressions cleanly."}
                  </p>
                </div>

                {/* Static Code Preview */}
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#0756A5] dark:text-[#FFB800] block">
                    Code Reference:
                  </span>
                  <CodeBlock
                    code={langPkg.code || 'print("Hello, Learn With Us!")'}
                    language="python"
                    title="Python Reference"
                  />
                </div>

                <div className="pt-4 border-t border-[#E2E8F0] dark:border-[#1B3B66]">
                  <button
                    onClick={() => goToStep("example")}
                    className="btn-vibrant-secondary px-4 py-2 text-xs font-bold flex items-center gap-1.5"
                  >
                    <ArrowLeft size={14} />
                    <span>Previous: Example</span>
                  </button>
                </div>
              </div>

              {/* Book Spine */}
              <div className="book-spine" />

              {/* Right Page: Live In-Browser Code Playground */}
              <div className="book-page-right space-y-5 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-[#1B3B66]">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#0756A5] dark:text-[#FFB800]">
                      Page 6 • Live Interactive Playground
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-[#16A34A] text-[10px] font-bold">
                      Zero Install
                    </span>
                  </div>

                  <LivePythonRunner
                    initialCode={langPkg.code || 'print("Hello Python!")'}
                    expectedOutput={langPkg.output || 'Hello Python!'}
                    title="Live Python Code Editor"
                  />
                </div>

                <div className="pt-4 border-t border-[#E2E8F0] dark:border-[#1B3B66] flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs text-slate-400 font-semibold">Ready for Quiz?</span>
                    <AskDoubtButton
                      variant="card"
                      sectionTitle={section.title}
                      lessonName={topic.title}
                      topicNumber={topic.topicNumber}
                      stepName="3. Live Python Runner"
                      label="Ask Doubt"
                    />
                  </div>
                  <button
                    onClick={() => goToStep("practice")}
                    className="btn-vibrant-primary px-5 py-2.5 text-xs sm:text-sm font-bold flex items-center gap-2"
                  >
                    <span>Turn Page: Practice Quiz</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* =====================================================
              PAGE STEP 4: PRACTICE QUIZ
              ===================================================== */}
          {currentStep === "practice" && (
            <div className="p-5 sm:p-8 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0] dark:border-[#1B3B66]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-[#0A1E38] text-[#0756A5] dark:text-[#FFB800] border border-blue-200 dark:border-[#1B3B66] flex items-center justify-center shadow-xs">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#0756A5] dark:text-[#FFB800]">
                      Step 4 of 6 • Interactive Quiz
                    </span>
                    <h2 className="text-lg sm:text-xl font-black text-[#102B50] dark:text-white">
                      Test Your Understanding
                    </h2>
                  </div>
                </div>

                {questions.length > 0 && (
                  <span className="font-mono text-xs font-bold text-[#0756A5] dark:text-[#FFB800] bg-[#F3F7FC] dark:bg-[#0A1E38] border border-[#E2E8F0] dark:border-[#1B3B66] px-3 py-1 rounded-full">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </span>
                )}
              </div>

              {currentQuestion ? (
                <div className="space-y-5 max-w-2xl mx-auto">
                  <div className="p-5 rounded-2xl bg-[#F3F7FC] dark:bg-[#0A1E38] border border-[#E2E8F0] dark:border-[#1B3B66]">
                    <h3 className="text-base sm:text-lg font-bold text-[#102B50] dark:text-white leading-snug m-0">
                      {currentQuestion.question}
                    </h3>
                  </div>

                  {/* Options List with Selection States */}
                  <div className="space-y-2.5">
                    {currentQuestion.options?.map((opt, i) => {
                      const isSelected = selectedOption === opt;
                      return (
                        <button
                          key={i}
                          onClick={() => {
                            if (!answerChecked) {
                              setSelectedOption(opt);
                            }
                          }}
                          className={`w-full text-left p-4 rounded-xl text-sm sm:text-base font-semibold flex items-center gap-3 transition cursor-pointer border ${
                            isSelected
                              ? "bg-blue-50 dark:bg-[#153560] border-[#0756A5] text-[#0756A5] dark:text-white shadow-xs"
                              : "bg-white dark:bg-[#102B50] border-[#E2E8F0] dark:border-[#1B3B66] text-[#102B50] dark:text-slate-100 hover:border-[#FFB800]"
                          }`}
                        >
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border ${
                              isSelected
                                ? "bg-[#0756A5] text-white border-[#0756A5]"
                                : "border-slate-300 dark:border-slate-600 text-slate-500"
                            }`}
                          >
                            {String.fromCharCode(65 + i)}
                          </span>
                          <span className="flex-1 break-words">{opt}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Immediate Answer Feedback Banner */}
                  {answerChecked && (
                    <div
                      className={`p-4 rounded-2xl border flex items-start gap-3 ${
                        isCorrect
                          ? "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-700 text-emerald-950 dark:text-emerald-100"
                          : "bg-rose-50 dark:bg-rose-950/50 border-rose-300 dark:border-rose-700 text-rose-950 dark:text-rose-100"
                      }`}
                    >
                      <span className="text-xl select-none">{isCorrect ? "✓" : "✗"}</span>
                      <div className="space-y-1">
                        <span className="text-sm font-bold block">
                          {isCorrect ? "Correct! Outstanding job." : "Not quite. Here is the explanation:"}
                        </span>
                        <p className="text-xs sm:text-sm leading-relaxed m-0 font-medium">
                          {currentQuestion.explanation}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="pt-4 border-t border-[#E2E8F0] dark:border-[#1B3B66] flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => goToStep("code")}
                        className="btn-vibrant-secondary px-4 py-2.5 text-xs font-bold flex items-center gap-1.5"
                      >
                        <ArrowLeft size={14} />
                        <span>Back to Code</span>
                      </button>
                      <AskDoubtButton
                        variant="card"
                        sectionTitle={section.title}
                        lessonName={topic.title}
                        topicNumber={topic.topicNumber}
                        stepName="4. Practice Quiz"
                        label="Ask Doubt"
                      />
                    </div>

                    {!answerChecked ? (
                      <button
                        onClick={handleCheckAnswer}
                        disabled={!selectedOption}
                        className="btn-vibrant-primary px-6 py-2.5 text-xs sm:text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Check Answer
                      </button>
                    ) : (
                      <button
                        onClick={handleNextQuestion}
                        className="btn-vibrant-primary px-6 py-2.5 text-xs sm:text-sm font-bold flex items-center gap-2"
                      >
                        <span>
                          {currentQuestionIndex < questions.length - 1
                            ? "Next Question →"
                            : "Proceed to Challenge →"}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center space-y-4">
                  <p className="text-[#64748B] text-base">All practice quiz questions completed for this topic!</p>
                  <button
                    onClick={() => goToStep("challenge")}
                    className="btn-vibrant-primary px-6 py-2.5 text-sm font-bold"
                  >
                    Go to Hands-On Challenge →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* =====================================================
              PAGE STEP 5: HANDS-ON CHALLENGE
              ===================================================== */}
          {currentStep === "challenge" && (
            <div className="p-5 sm:p-8 space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-[#E2E8F0] dark:border-[#1B3B66]">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-[#0A1E38] text-[#0756A5] dark:text-[#FFB800] border border-blue-200 dark:border-[#1B3B66] flex items-center justify-center shadow-xs">
                  <Zap size={20} />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#0756A5] dark:text-[#FFB800]">
                    Step 5 of 6 • Coding Exercise
                  </span>
                  <h2 className="text-lg sm:text-xl font-black text-[#102B50] dark:text-white">
                    Hands-On Challenge
                  </h2>
                </div>
              </div>

              {/* Challenge Goal & Task */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#F3F7FC] dark:bg-[#0A1E38] border border-[#E2E8F0] dark:border-[#1B3B66] flex items-start gap-3">
                <span className="text-2xl select-none">🎯</span>
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#0756A5] dark:text-[#FFB800] block">
                    Challenge Objective:
                  </span>
                  <p className="text-sm sm:text-base font-bold text-[#102B50] dark:text-white m-0">
                    {tryIt.goal || `Write code to put ${topic.title} into practice.`}
                  </p>
                  <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#CBD5E1] leading-relaxed m-0">
                    {tryIt.task || "Run your solution in the interactive playground below and verify output."}
                  </p>
                </div>
              </div>

              {/* Interactive Code Playground */}
              <LivePythonRunner
                initialCode={tryIt.solution || tryIt.starterCode || langPkg.code}
                expectedOutput={tryIt.expectedOutput || langPkg.output}
                title="Challenge Playground"
              />

              {/* Optional Hint Toggle */}
              <div>
                <button
                  onClick={() => setShowHint(!showHint)}
                  className="px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold bg-[#F3F7FC] dark:bg-[#102B50] text-[#0756A5] dark:text-[#FFB800] border border-[#E2E8F0] dark:border-[#1B3B66] hover:border-[#FFB800] transition cursor-pointer flex items-center gap-1.5"
                >
                  <Lightbulb size={14} className="text-[#0756A5] dark:text-[#FFB800]" />
                  <span>{showHint ? "Hide Hint" : "💡 Show Hint"}</span>
                </button>

                {showHint && (
                  <div className="mt-3 p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 animate-in flex items-start gap-2.5">
                    <span className="text-xl select-none">💡</span>
                    <p className="text-xs sm:text-sm text-[#102B50] dark:text-white m-0 font-medium">
                      {tryIt.hint || "Make sure your syntax has matching parentheses and quotes."}
                    </p>
                  </div>
                )}
              </div>

              {/* Navigation Action Buttons */}
              <div className="pt-4 border-t border-[#E2E8F0] dark:border-[#1B3B66] flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => goToStep("practice")}
                    className="btn-vibrant-secondary px-4 py-2.5 text-xs font-bold flex items-center gap-1.5"
                  >
                    <ArrowLeft size={14} />
                    <span>Back to Practice</span>
                  </button>
                  <AskDoubtButton
                    variant="card"
                    sectionTitle={section.title}
                    lessonName={topic.title}
                    topicNumber={topic.topicNumber}
                    stepName="5. Coding Challenge"
                    label="Ask Doubt"
                  />
                </div>

                <button
                  onClick={handleCompleteChallenge}
                  className="btn-vibrant-primary px-6 py-2.5 text-xs sm:text-sm font-bold flex items-center gap-2"
                >
                  <span>Complete Challenge & Master Lesson</span>
                  <CheckCircle2 size={16} />
                </button>
              </div>
            </div>
          )}

          {/* =====================================================
              PAGE STEP 6: MASTERY REVIEW & SECTION TRANSITION
              ===================================================== */}
          {currentStep === "complete" && (
            <div className="p-6 sm:p-10 text-center space-y-6">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-[#0756A5] to-[#FFB800] text-white flex items-center justify-center shadow-lg border border-white/20 animate-badge-reveal">
                <Trophy size={32} />
              </div>

              <div>
                <span className="notion-tag text-[#16A34A] bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/50 font-bold mb-2 inline-block">
                  ✓ Chapter Mastered
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#102B50] dark:text-white mt-2">
                  "{topic.title}" Complete!
                </h2>
                <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#CBD5E1] max-w-md mx-auto mt-2 leading-relaxed font-medium">
                  You successfully understood the core concepts, studied real-world examples, verified live Python code, answered practice questions, and completed the hands-on challenge.
                </p>
              </div>

              {/* Automatic Next Chapter Countdown Indicator */}
              {(adjacent.next || (nextSection && nextSection.topics[0])) && autoNextCountdown !== null && (
                <div className="max-w-md mx-auto p-3.5 rounded-2xl bg-blue-50 dark:bg-[#102B50] border border-[#0756A5]/30 flex items-center justify-between gap-3 animate-pulse">
                  <div className="flex items-center gap-2.5 text-left min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-[#0756A5] text-white font-extrabold flex items-center justify-center text-xs shrink-0 shadow-sm">
                      {autoNextCountdown}s
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-[#102B50] dark:text-white truncate block">
                        Opening next: "{adjacent.next ? adjacent.next.title : nextSection.topics[0].title}"
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                        Auto-advancing to next chapter...
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => setAutoNextPaused(!autoNextPaused)}
                      className="text-xs font-bold text-[#102B50] dark:text-slate-200 px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#0A1E38] border border-[#E2E8F0] dark:border-[#1B3B66] cursor-pointer"
                    >
                      {autoNextPaused ? "Resume" : "Pause"}
                    </button>
                    <button
                      onClick={() => setAutoNextCountdown(null)}
                      className="text-xs font-bold text-slate-600 dark:text-slate-200 px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#0A1E38] border border-[#E2E8F0] dark:border-[#1B3B66] cursor-pointer"
                    >
                      Stay Here
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                <button
                  onClick={() => setShowCertificate(true)}
                  className="px-5 py-2.5 rounded-xl bg-[#FFB800] hover:bg-[#E0A200] text-[#102B50] font-black text-xs sm:text-sm flex items-center gap-2 shadow-sm cursor-pointer border-none"
                >
                  <Award size={16} />
                  <span>View Official Certificate</span>
                </button>

                <button
                  onClick={handleOpenNextChapter}
                  className="btn-vibrant-primary px-6 py-2.5 text-xs sm:text-sm font-bold flex items-center gap-2"
                >
                  <span>Open Next Chapter</span>
                  <ArrowRight size={16} />
                </button>

                <button
                  onClick={onBackToLearn}
                  className="btn-vibrant-secondary px-5 py-2.5 text-xs sm:text-sm font-bold"
                >
                  Back to All Chapters
                </button>

                <AskDoubtButton
                  variant="card"
                  sectionTitle={section.title}
                  lessonName={topic.title}
                  topicNumber={topic.topicNumber}
                  stepName="6. Mastery Review"
                  label="Ask Doubt on WhatsApp"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Official Certificate Modal */}
      {showCertificate && (
        <CertificateModal
          isOpen={showCertificate}
          onClose={() => setShowCertificate(false)}
          topicTitle={topic.title}
          sectionTitle={section.title}
        />
      )}
    </div>
  );
}
