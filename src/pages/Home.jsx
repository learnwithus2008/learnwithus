import React from "react";
import LearningStageSelector from "../components/LearningStageSelector";
import LanguageSelector from "../components/LanguageSelector";
import PageBackButton from "../components/PageBackButton";
import HeroBookIllustration from "../components/HeroBookIllustration";
import { PageHelpButton } from "../components/GuideTutorial/ContextualPageGuidance";
import { LEARNING_STAGES, getStageById } from "../data/learningStages";
import { getLanguageById } from "../data/learningLanguages";
import { useAuth } from "../context/AuthContext";
import { AdsterraNativeBanner } from "../components/Ads";
import {
  Code2,
  Terminal,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Zap,
  Layers,
  Cpu,
  Globe,
  Bot,
  Compass,
  Repeat,
  Boxes,
  RotateCw,
  Search,
  BookMarked,
  Flame,
  ShieldCheck,
  Lock,
  Trophy,
  Award,
  Users,
  Star,
  Check,
  ChevronRight,
  GraduationCap
} from "lucide-react";

export default function Home({
  onNavigate,
  onSelectTopic,
  selectedStage,
  onSelectStage,
  selectedLanguage,
  onSelectLanguage,
  onOpenStageModal,
  onOpenLanguageModal,
  onBack,
  canGoBack
}) {
  const { isAuthenticated, openAuthModal } = useAuth();
  const currentStageMeta = getStageById(selectedStage);
  const currentLangMeta = getLanguageById(selectedLanguage);

  const isFreeTopic = (id) => id === "what-is-python" || id === "why-learn-python";

  // Featured Python Topics
  const featuredTopics = [
    {
      id: "what-is-python",
      title: "What is Python?",
      section: "Python Basics",
      icon: Code2,
      duration: "5 mins",
      desc: "Get started with Python syntax, beginner fundamentals, and friendly design philosophy."
    },
    {
      id: "why-learn-python",
      title: "Why Learn Python?",
      section: "Python Basics",
      icon: Zap,
      duration: "6 mins",
      desc: "Discover real-world applications in web apps, artificial intelligence, automation, and data."
    },
    {
      id: "variables",
      title: "Variables & Memory Binding",
      section: "Python Basics",
      icon: Boxes,
      duration: "8 mins",
      desc: "How Python names, binds, and stores information in memory with dynamic typing."
    },
    {
      id: "for-loop",
      title: "Loops & Iterations",
      section: "Control Flow",
      icon: Repeat,
      duration: "10 mins",
      desc: "Automate repetitive tasks and traverse sequence collections effortlessly."
    },
    {
      id: "what-is-a-function",
      title: "Functions & Parameters",
      section: "Modular Logic",
      icon: Terminal,
      duration: "12 mins",
      desc: "Build reusable blocks of code, pass arguments, and encapsulate clean programming logic."
    },
    {
      id: "what-is-ai",
      title: "AI & Large Language Models",
      section: "Modern AI & LLMs",
      icon: Bot,
      duration: "15 mins",
      desc: "Explore neural concepts, generative AI prompts, embeddings, and intelligent agents."
    }
  ];

  // Learning Benefits ("Why Learn With Us?")
  const benefits = [
    {
      icon: "📖",
      title: "Interactive Digital Book",
      desc: "Turn pages like a real book with two-page desktop reading, smooth page transitions, and zero clutter.",
      tag: "Experience"
    },
    {
      icon: "⚡",
      title: "Live In-Browser Code Runner",
      desc: "Write and execute authentic Python code immediately in your browser with zero installations or setup required.",
      tag: "Practice"
    },
    {
      icon: "🗣️",
      title: "4 Regional Languages",
      desc: "Learn in Professional English, friendly English+Telugu blend, Pure Telugu, or Simple Hindi.",
      tag: "Accessible"
    },
    {
      icon: "🔄",
      title: "Another Explanation Modes",
      desc: "Don't understand a topic? Switch instantly to Story, Visual Diagram, Real-Life Analogy, or Step-by-Step formats.",
      tag: "Adaptive"
    },
    {
      icon: "🧩",
      title: "Quizzes & Puzzles",
      desc: "Reinforce every lesson with interactive questions, output prediction challenges, and bug-hunting exercises.",
      tag: "Gamified"
    },
    {
      icon: "🚀",
      title: "Real-World Projects",
      desc: "From interactive toy bots for kids to production FastAPI microservices for software engineers.",
      tag: "Portfolio"
    }
  ];

  // Learning Journey Pipeline
  const learningPipeline = [
    {
      step: "01",
      title: "Learn Concept",
      icon: BookOpen,
      desc: "Read simple, friendly explanations tailored to your age and background."
    },
    {
      step: "02",
      title: "Understand",
      icon: Sparkles,
      desc: "Explore visual diagrams, stories, real-world analogies, and multi-format breakdowns."
    },
    {
      step: "03",
      title: "Practice",
      icon: Code2,
      desc: "Inspect live code snippets and run Python scripts right inside the browser."
    },
    {
      step: "04",
      title: "Test Skills",
      icon: CheckCircle2,
      desc: "Solve instant-feedback quizzes, output prediction puzzles, and coding challenges."
    },
    {
      step: "05",
      title: "Build Projects",
      icon: Trophy,
      desc: "Create full-stack applications and earn verified completion certificates."
    }
  ];

  // Gamified Badges Showcase
  const sampleBadges = [
    {
      name: "Python Novice",
      icon: "🐍",
      level: "Bronze",
      desc: "Completed first Python basics lesson",
      color: "from-blue-600 to-indigo-800"
    },
    {
      name: "Loop Master",
      icon: "🔄",
      level: "Silver",
      desc: "Mastered while & for iterations",
      color: "from-sky-500 to-blue-700"
    },
    {
      name: "Logic Wizard",
      icon: "⚡",
      level: "Gold",
      desc: "100% score on conditional quizzes",
      color: "from-[#FFB800] to-amber-600"
    },
    {
      name: "Project Architect",
      icon: "🏆",
      level: "Platinum",
      desc: "Built a complete Python project",
      color: "from-emerald-500 to-teal-700"
    }
  ];

  return (
    <div className="home-page-container max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-8 md:py-10 pb-20 sm:pb-24 w-full min-w-0 animate-in space-y-16 sm:space-y-20">
      {/* Back Navigation Button if navigated from elsewhere */}
      {canGoBack && onBack && (
        <div className="flex items-center justify-start">
          <PageBackButton onBack={onBack} label="Back to Previous Page" />
        </div>
      )}

      {/* ========================================================
          1. HERO SECTION (Visual, Dynamic, Animated Digital Book)
          ======================================================== */}
      <section id="tour-home-hero" className="home-section relative pt-2 sm:pt-4">
        <div className="home-hero-grid grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Hero Content: Balanced 50% split */}
          <div className="home-hero-left lg:col-span-6 space-y-6 text-left">
            {/* Tagline Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F3F7FC] dark:bg-[#102B50] border border-[#E2E8F0] dark:border-[#1B3B66] text-xs sm:text-sm font-bold shadow-2xs">
              <Sparkles size={16} className="text-[#0756A5] dark:text-[#FFB800] shrink-0" />
              <span className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[#FFB800] font-black">Learn</span>
                <span className="text-[#0756A5] dark:text-[#60A5FA] font-black">With Us</span>
                <span className="text-slate-400 dark:text-slate-500">•</span>
                <span className="text-[#102B50] dark:text-slate-200 font-extrabold">Learn. Practice. Grow.</span>
              </span>
            </div>

            {/* Main Attractive Hero Heading */}
            <h1 className="heading-hero text-[#102B50] dark:text-white tracking-tight leading-[1.12]">
              Your Python Learning <br className="hidden sm:inline" />
              <span className="text-[#0756A5] dark:text-[#60A5FA] font-black">
                Journey Starts Here.
              </span>
            </h1>

            {/* Supporting Paragraph */}
            <p className="body-large text-[#102B50] dark:text-[#CBD5E1] max-w-xl leading-relaxed font-semibold">
              A beginner-friendly Python learning platform where students can learn programming through simple explanations, interactive book pages, examples, quizzes, coding exercises, real-world projects, and gamified progress tracking.
            </p>

            {/* Selected Learning Configuration Summary Bar */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#102B50] border border-[#E2E8F0] dark:border-[#1B3B66] shadow-xs flex flex-wrap items-center justify-between gap-3 max-w-xl">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#102B50] dark:text-white">
                <span className="text-lg">🎯</span>
                <span>Stage:</span>
                <button
                  onClick={onOpenStageModal}
                  className="px-2 py-0.5 rounded-lg bg-[#F3F7FC] dark:bg-[#0A1E38] text-[#0756A5] dark:text-[#FFB800] border border-[#E2E8F0] dark:border-[#1B3B66] hover:border-[#FFB800] cursor-pointer transition font-bold"
                >
                  {currentStageMeta.icon} {currentStageMeta.label.split(" ")[0]}
                </button>
              </div>

              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#102B50] dark:text-white">
                <span className="text-lg">🗣️</span>
                <span>Language:</span>
                <button
                  onClick={onOpenLanguageModal}
                  className="px-2 py-0.5 rounded-lg bg-[#F3F7FC] dark:bg-[#0A1E38] text-[#0756A5] dark:text-[#FFB800] border border-[#E2E8F0] dark:border-[#1B3B66] hover:border-[#FFB800] cursor-pointer transition font-bold"
                >
                  {currentLangMeta.icon} {currentLangMeta.shortLabel}
                </button>
              </div>
            </div>

            {/* Primary & Secondary Call-to-Action Buttons */}
            <div className="hero-cta-group flex flex-wrap items-center gap-2.5 sm:gap-3.5 pt-2">
              <button
                onClick={() => onSelectTopic("what-is-python")}
                className="btn-vibrant-primary px-5 sm:px-6 py-3 sm:py-3.5 text-sm sm:text-base font-bold shadow-md shadow-blue-600/20 active:scale-95 transition-transform shrink-0 flex items-center justify-center gap-2"
              >
                <Sparkles size={18} className="text-[#FFB800] shrink-0" />
                <span>Start Learning</span>
                <ArrowRight size={18} className="shrink-0" />
              </button>

              <button
                onClick={() => onNavigate("learn")}
                className="btn-vibrant-secondary px-4 sm:px-5 py-3 sm:py-3.5 text-sm sm:text-base font-bold active:scale-95 transition-transform shrink-0 flex items-center justify-center gap-2"
              >
                <BookOpen size={18} className="text-[#0756A5] dark:text-[#FFB800] shrink-0" />
                <span>Explore Courses</span>
              </button>

              <button
                onClick={() => onNavigate("practice")}
                className="hero-cta-quiz-link px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold text-[#0756A5] hover:text-[#064681] dark:text-[#60A5FA] dark:hover:text-[#FFB800] hover:underline cursor-pointer bg-transparent border-none shrink-0 flex items-center justify-center gap-1"
              >
                <span>Try Practice Quizzes</span>
                <span className="text-base leading-none">→</span>
              </button>
            </div>
          </div>

          {/* Right Hero Graphic: Real-Time Interactive Open Book (Balanced 50% split) */}
          <div className="home-hero-right lg:col-span-6 w-full min-w-0 flex items-center justify-center pt-4 lg:pt-0">
            <HeroBookIllustration className="w-full max-w-[620px]" />
          </div>
        </div>
      </section>

      {/* ========================================================
          SECTION A: EXPLORE YOUR LEARNING JOURNEY (Adaptive Stages)
          ======================================================== */}
      <section id="tour-home-stages" className="home-section space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-[#0756A5] dark:text-[#FFB800] flex items-center gap-1.5 mb-1">
              <Sparkles size={15} className="text-[#0756A5] dark:text-[#FFB800]" />
              <span>Section A</span>
            </span>
            <h2 className="heading-section text-[#102B50] dark:text-white">
              Explore Your Learning Journey
            </h2>
            <p className="text-sm sm:text-base text-[#102B50] dark:text-[#CBD5E1] mt-1 max-w-xl font-medium">
              Python taught with explanations crafted specifically for your age group and thinking style.
            </p>
          </div>

          <button
            onClick={onOpenStageModal}
            className="text-xs sm:text-sm font-bold text-[#0756A5] dark:text-[#60A5FA] hover:text-[#064681] dark:hover:text-[#FFB800] hover:underline cursor-pointer bg-transparent border-none p-0 flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Change Stage</span>
            <ChevronRight size={15} className="text-[#0756A5] dark:text-[#60A5FA]" />
          </button>
        </div>

        {/* Learning Stage Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {LEARNING_STAGES.map((stg) => {
            const isSelected = selectedStage === stg.id;
            return (
              <div
                key={stg.id}
                onClick={() => onSelectStage(stg.id)}
                className={`premium-card p-4 rounded-2xl cursor-pointer flex flex-col justify-between transition-all relative ${
                  isSelected
                    ? "ring-2 ring-[#0756A5] bg-[#F3F7FC] dark:bg-[#153560] border-[#0756A5]"
                    : "bg-white dark:bg-[#102B50] hover:border-[#FFB800]"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-3xl select-none">{stg.icon}</span>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-[#0756A5] text-white flex items-center justify-center font-bold">
                        <Check size={12} strokeWidth={3} />
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-[#102B50] dark:text-white mb-1">
                    {stg.label}
                  </h3>
                  <span className="inline-block text-[11px] font-extrabold text-[#0756A5] dark:text-[#FFB800] bg-blue-50 dark:bg-[#0A1E38] px-2 py-0.5 rounded-md mb-2">
                    {stg.ageRange}
                  </span>
                  <p className="text-xs text-[#102B50] dark:text-[#CBD5E1] line-clamp-2 leading-relaxed font-medium">
                    {stg.shortDesc}
                  </p>
                </div>

                <div className="pt-3 mt-2 border-t border-[#E2E8F0] dark:border-[#1B3B66] text-[11px] font-bold text-[#0756A5] dark:text-[#60A5FA]">
                  {isSelected ? "Active Stage ✓" : "Select Stage →"}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================
          SECTION B: WHY LEARN WITH US? (Illustrated Feature Cards)
          ======================================================== */}
      <section id="tour-home-why-us" className="home-section space-y-6">
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-[#0756A5] dark:text-[#FFB800] flex items-center gap-1.5 mb-1">
            <Sparkles size={15} className="text-[#0756A5] dark:text-[#FFB800]" />
            <span>Section B</span>
          </span>
          <h2 className="heading-section text-[#102B50] dark:text-white">
            Why Learn With Us?
          </h2>
          <p className="text-sm sm:text-base text-[#102B50] dark:text-[#CBD5E1] mt-1 max-w-xl font-medium">
            Designed from the ground up for maximum comprehension, joy, and practical programming fluency.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {benefits.map((b, idx) => (
            <div
              key={idx}
              className="premium-card p-5 sm:p-6 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl select-none group-hover:scale-110 transition-transform">
                    {b.icon}
                  </span>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#F3F7FC] dark:bg-[#0A1E38] text-[#0756A5] dark:text-[#FFB800] border border-[#E2E8F0] dark:border-[#1B3B66]">
                    {b.tag}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-[#102B50] dark:text-white mb-2 group-hover:text-[#0756A5] dark:group-hover:text-[#FFB800] transition-colors">
                  {b.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#102B50] dark:text-[#CBD5E1] leading-relaxed font-medium">
                  {b.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#E2E8F0] dark:border-[#1B3B66] flex items-center justify-between text-xs font-bold text-[#0756A5] dark:text-[#60A5FA]">
                <span>Built for Students</span>
                <CheckCircle2 size={15} className="text-[#16A34A]" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================
          SECTION C: HOW LEARNING WORKS (Visual Learning Journey Pipeline)
          ======================================================== */}
      <section id="tour-home-pipeline" className="home-section space-y-6">
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-[#0756A5] dark:text-[#FFB800] flex items-center gap-1.5 mb-1">
            <Sparkles size={15} className="text-[#0756A5] dark:text-[#FFB800]" />
            <span>Section C</span>
          </span>
          <h2 className="heading-section text-[#102B50] dark:text-white">
            How Learning Works
          </h2>
          <p className="text-sm sm:text-base text-[#102B50] dark:text-[#CBD5E1] mt-1 max-w-xl font-medium">
            A proven 5-step mastery cycle that turns abstract programming concepts into practical coding superpowers.
          </p>
        </div>

        {/* Visual Pipeline Container */}
        <div className="p-5 sm:p-8 rounded-3xl bg-white dark:bg-[#102B50] border border-[#E2E8F0] dark:border-[#1B3B66] shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 relative">
            {learningPipeline.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={idx} className="pipeline-step flex flex-col justify-between p-4 rounded-2xl bg-[#F3F7FC] dark:bg-[#0A1E38] border border-[#E2E8F0] dark:border-[#1B3B66]">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-mono font-black text-[#0756A5] dark:text-[#FFB800] bg-white dark:bg-[#102B50] px-2 py-0.5 rounded-md border border-[#E2E8F0] dark:border-[#1B3B66]">
                        {step.step}
                      </span>
                      <div className="w-8 h-8 rounded-xl bg-[#0756A5] text-white flex items-center justify-center shadow-xs">
                        <Icon size={16} />
                      </div>
                    </div>
                    <h4 className="text-sm sm:text-base font-bold text-[#102B50] dark:text-white mb-1.5">
                      {step.title}
                    </h4>
                    <p className="text-xs text-[#102B50] dark:text-[#CBD5E1] leading-relaxed font-medium">
                      {step.desc}
                    </p>
                  </div>

                  <div className="mt-4 pt-2 border-t border-[#E2E8F0]/80 dark:border-[#1B3B66]/80 flex items-center justify-end text-[11px] font-bold text-[#0756A5] dark:text-[#60A5FA]">
                    {idx < 4 ? "Next Step →" : "Mastery ★"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================
          SECTION D: POPULAR LEARNING TOPICS (Curriculum Cards)
          ======================================================== */}
      <section id="tour-home-highlights" className="home-section space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-[#0756A5] dark:text-[#FFB800] flex items-center gap-1.5 mb-1">
              <Sparkles size={15} className="text-[#0756A5] dark:text-[#FFB800]" />
              <span>Section D</span>
            </span>
            <h2 className="heading-section text-[#102B50] dark:text-white">
              Popular Learning Topics
            </h2>
            <p className="text-sm sm:text-base text-[#102B50] dark:text-[#CBD5E1] mt-1 max-w-xl font-medium">
              198 topics across 19 modules. Dive into the most popular beginner & intermediate lessons.
            </p>
          </div>

          <button
            onClick={() => onNavigate("learn")}
            className="btn-vibrant-secondary px-4 py-2 text-xs sm:text-sm font-bold flex items-center gap-1.5 self-start sm:self-auto"
          >
            <span>View All 19 Sections</span>
            <ArrowRight size={15} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {featuredTopics.map((item, idx) => {
            const Icon = item.icon;
            const isFree = isFreeTopic(item.id);
            const isLocked = !isAuthenticated && !isFree;

            return (
              <div
                key={idx}
                onClick={() => onSelectTopic(item.id)}
                className="premium-card p-5 cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="notion-tag text-xs font-bold text-[#0756A5] dark:text-[#60A5FA] bg-[#F3F7FC] dark:bg-[#0A1E38] border border-[#E2E8F0] dark:border-[#1B3B66]">
                        {item.section}
                      </span>
                      {isFree && (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-[#16A34A] bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 rounded-full">
                          <Sparkles size={11} className="text-[#16A34A]" />
                          <span>Free Preview</span>
                        </span>
                      )}
                      {isLocked && (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-[#0756A5] dark:text-[#FFB800] bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 px-2 py-0.5 rounded-full">
                          <Lock size={11} className="text-[#0756A5] dark:text-[#FFB800]" />
                          <span>Account Required</span>
                        </span>
                      )}
                    </div>
                    <div className="w-8 h-8 rounded-xl bg-[#0756A5] text-white flex items-center justify-center shadow-xs">
                      <Icon size={16} />
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-[#102B50] dark:text-white group-hover:text-[#0756A5] dark:group-hover:text-[#FFB800] transition-colors mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#102B50] dark:text-[#CBD5E1] leading-relaxed mb-4 font-medium">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#E2E8F0] dark:border-[#1B3B66] flex items-center justify-between text-xs sm:text-sm font-bold text-[#0756A5] dark:text-[#60A5FA]">
                  <span className="text-slate-400 font-semibold">{item.duration}</span>
                  <div className="flex items-center gap-1">
                    <span className={isLocked ? "text-[#0756A5] dark:text-amber-400 font-semibold" : ""}>
                      {isLocked ? "Sign In to Read" : "Read Lesson"}
                    </span>
                    {isLocked ? (
                      <Lock size={14} className="text-[#0756A5] dark:text-amber-500 shrink-0" />
                    ) : (
                      <ArrowRight size={16} className="text-[#0756A5] dark:text-[#60A5FA] group-hover:translate-x-1 transition-transform group-hover:text-[#064681] dark:group-hover:text-[#FFB800]" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================
          SECTION E: YOUR ACHIEVEMENTS (Gamification & Badges)
          ======================================================== */}
      <section id="tour-home-achievements" className="home-section space-y-6">
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-[#0756A5] dark:text-[#FFB800] flex items-center gap-1.5 mb-1">
            <Sparkles size={15} className="text-[#0756A5] dark:text-[#FFB800]" />
            <span>Section E</span>
          </span>
          <h2 className="heading-section text-[#102B50] dark:text-white">
            Your Achievements & Gamification
          </h2>
          <p className="text-sm sm:text-base text-[#102B50] dark:text-[#CBD5E1] mt-1 max-w-xl font-medium">
            Stay motivated with learning streaks, XP milestones, unlockable achievement badges, and academic certificates.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {sampleBadges.map((badge, idx) => (
            <div
              key={idx}
              className="premium-card p-5 rounded-2xl flex flex-col justify-between text-center relative overflow-hidden group"
            >
              <div>
                <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-[#0756A5] to-[#102B50] text-white flex items-center justify-center text-3xl shadow-md border border-white/20 group-hover:scale-105 transition-transform">
                  <span>{badge.icon}</span>
                </div>
                <h4 className="text-sm sm:text-base font-bold text-[#102B50] dark:text-white mb-1">
                  {badge.name}
                </h4>
                <span className="inline-block text-[10px] font-black uppercase tracking-wider text-[#FFB800] bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-full border border-[#FFB800]/30 mb-2">
                  {badge.level} Badge
                </span>
                <p className="text-xs text-[#102B50] dark:text-[#CBD5E1] leading-relaxed font-medium">
                  {badge.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#E2E8F0] dark:border-[#1B3B66] flex items-center justify-center gap-1 text-xs font-bold text-[#16A34A]">
                <CheckCircle2 size={13} />
                <span>Earnable Milestone</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Sponsored Partner Showcase (Native Banner) */}
      <AdsterraNativeBanner label="Sponsored Learning Partner" />

      {/* ========================================================
          SECTION F: LEARNING COMMUNITY (Stats & Motivation)
          ======================================================== */}
      <section id="tour-home-community" className="home-section home-stats-banner p-6 sm:p-10 rounded-3xl">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          <div>
            <div className="home-stat-number text-2xl sm:text-4xl font-black mb-1">
              198+
            </div>
            <div className="home-stat-label text-xs sm:text-sm font-bold">
              Interactive Topics
            </div>
            <div className="home-stat-desc text-[11px] font-semibold">Across 19 Sections</div>
          </div>

          <div>
            <div className="home-stat-number text-2xl sm:text-4xl font-black mb-1">
              5
            </div>
            <div className="home-stat-label text-xs sm:text-sm font-bold">
              Adaptive Age Stages
            </div>
            <div className="home-stat-desc text-[11px] font-semibold">From Kids to Pros</div>
          </div>

          <div>
            <div className="home-stat-number text-2xl sm:text-4xl font-black mb-1">
              4
            </div>
            <div className="home-stat-label text-xs sm:text-sm font-bold">
              Regional Languages
            </div>
            <div className="home-stat-desc text-[11px] font-semibold">English, Telugu, Hindi</div>
          </div>

          <div>
            <div className="home-stat-accent text-2xl sm:text-4xl font-black mb-1">
              100%
            </div>
            <div className="home-stat-label text-xs sm:text-sm font-bold">
              Free Access
            </div>
            <div className="home-stat-desc text-[11px] font-semibold">Zero Subscription Fees</div>
          </div>
        </div>
      </section>

      {/* ========================================================
          SECTION G: FINAL CALL TO ACTION (Attractive Invitation)
          ======================================================== */}
      <section id="tour-home-cta" className="home-section relative p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-[#0756A5] via-[#064681] to-[#102B50] text-white shadow-xl overflow-hidden text-center space-y-6">
        {/* Ambient Decorative Shapes */}
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-64 h-64 rounded-full bg-[#FFB800]/15 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-12 -mb-12 w-64 h-64 rounded-full bg-blue-400/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[#FFB800] text-xs font-bold border border-white/20">
            <Sparkles size={14} />
            <span>Begin Your Learning Journey Today</span>
          </span>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            Ready to Master Python with Us?
          </h2>
          <p className="text-sm sm:text-base text-blue-100 max-w-xl mx-auto leading-relaxed">
            Join students of all ages learning Python through simple explanations, live code runners, and interactive digital books.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center justify-center gap-3.5 pt-2">
          <button
            onClick={() => onSelectTopic("what-is-python")}
            className="px-6 py-3.5 rounded-xl bg-[#FFB800] hover:bg-[#E0A200] text-[#102B50] font-black text-sm sm:text-base shadow-lg shadow-black/20 cursor-pointer border-none active:scale-95 transition-transform flex items-center gap-2"
          >
            <span>Start Learning for Free</span>
            <ArrowRight size={18} />
          </button>

          <button
            onClick={() => onNavigate("learn")}
            className="px-5 py-3.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-sm sm:text-base cursor-pointer border border-white/25 transition active:scale-95"
          >
            Browse All Curriculum
          </button>
        </div>
      </section>
    </div>
  );
}
