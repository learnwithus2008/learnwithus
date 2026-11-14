import React, { useState, useMemo } from "react";
import { SECTIONS, allTopics, getCompletedTopics } from "../data/allTopics";
import TopicCard from "../components/TopicCard";
import AskDoubtButton from "../components/AskDoubtButton";
import PageBackButton from "../components/PageBackButton";
import { PageHelpButton } from "../components/GuideTutorial/ContextualPageGuidance";
import { getStageById } from "../data/learningStages";
import { getLanguageById } from "../data/learningLanguages";
import { useAuth } from "../context/AuthContext";
import {
  Search,
  BookOpen,
  Layers,
  X,
  Sparkles,
  Folder,
  Flame,
  Trophy,
  Zap,
  ArrowRight,
  Play,
  CheckCircle2,
  Clock,
  Compass,
  FolderGit2
} from "lucide-react";

export default function Learn({
  onSelectTopic,
  selectedStage = "young",
  onOpenStageModal,
  selectedLanguage = "english",
  onSelectLanguage,
  onOpenLanguageModal,
  onBack,
  onNavigate
}) {
  const { currentUser, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSection, setSelectedSection] = useState("all");
  const stageMeta = getStageById(selectedStage);
  const langMeta = getLanguageById(selectedLanguage);

  const completedTopics = useMemo(() => getCompletedTopics(), []);
  const completedCount = completedTopics.length;
  const totalTopicsCount = allTopics.length;
  const overallPercent = Math.round((completedCount / totalTopicsCount) * 100);

  // Determine active or next recommended lesson
  const resumeTopic = useMemo(() => {
    const firstUncompleted = allTopics.find((t) => !completedTopics.includes(t.id));
    return firstUncompleted || allTopics[0];
  }, [completedTopics]);

  // Filtered topics based on search query or selected section
  const filteredTopics = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      if (selectedSection === "all") return null; // Show standard section groups
      const sec = SECTIONS.find((s) => s.id === selectedSection);
      return sec ? sec.topics : [];
    }

    return allTopics.filter((topic) => {
      const titleMatch = topic.title.toLowerCase().includes(query);
      const stageData = topic.stages?.[selectedStage] || {};
      const langData = stageData.languages?.[selectedLanguage] || stageData.languages?.english || {};
      const stageIntro = (langData.intro || stageData.intro || "").toLowerCase().includes(query);
      const sectionMatch = topic.sectionTitle?.toLowerCase().includes(query);
      const idMatch = topic.id.toLowerCase().includes(query);
      return titleMatch || stageIntro || sectionMatch || idMatch;
    });
  }, [searchQuery, selectedSection, selectedStage, selectedLanguage]);

  return (
    <div className="learn-page max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-8 md:py-10 pb-20 sm:pb-24 w-full min-w-0 animate-in space-y-10">
      {/* Back Navigation Button */}
      {onBack && (
        <div className="flex items-center justify-start">
          <PageBackButton onBack={onBack} label="Back" fallbackDestination="Home" />
        </div>
      )}

      {/* ========================================================
          9. MODERN LEARNING DASHBOARD HEADER
          ======================================================== */}
      <div id="tour-learn-header" className="space-y-6">
        {/* Welcome Banner Card */}
        <div className="learn-welcome-banner p-6 sm:p-8 rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-[#FFB800]/15 blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="learn-welcome-badge inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold">
                <Sparkles size={14} className="text-[#FFB800]" />
                <span>Student Learning Dashboard</span>
              </div>
              <h1
                className="learn-welcome-title text-2xl sm:text-3xl font-black tracking-tight text-white"
                style={{ color: "#FFFFFF" }}
              >
                {isAuthenticated && currentUser ? (
                  <>
                    Welcome back,{" "}
                    <span style={{ color: "#FFB800" }}>
                      {currentUser.name.split(" ")[0]}
                    </span>
                    !
                  </>
                ) : (
                  "Welcome to Learn With Us!"
                )}
              </h1>
              <p className="learn-welcome-desc text-sm sm:text-base leading-relaxed font-normal">
                Curriculum of {SECTIONS.length} sections and {totalTopicsCount} interactive topics, adapted for <strong>{stageMeta.label} ({stageMeta.ageRange})</strong> in <strong>{langMeta.label}</strong>.
              </p>

              {/* Stage & Language Pill Switchers */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <button
                  onClick={onOpenStageModal}
                  className="learn-welcome-pill px-3 py-1.5 rounded-xl font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
                  title="Switch Learning Stage"
                >
                  <span>{stageMeta.icon} Stage: {stageMeta.label}</span>
                </button>
                <button
                  onClick={onOpenLanguageModal}
                  className="learn-welcome-pill px-3 py-1.5 rounded-xl font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
                  title="Switch Language"
                >
                  <span>{langMeta.icon} Language: {langMeta.label}</span>
                </button>
              </div>
            </div>

            {/* Prominent Continue Learning Action Card */}
            {resumeTopic && (
              <div className="learn-resume-card p-4 sm:p-5 rounded-2xl max-w-xs shrink-0 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs font-bold mb-2">
                    <span className="learn-resume-tag flex items-center gap-1">
                      <Play size={13} className="learn-resume-play-icon" />
                      <span>Resume Chapter</span>
                    </span>
                    <span className="learn-resume-badge px-2 py-0.5 rounded-full font-mono text-xs">
                      #{resumeTopic.topicNumber}
                    </span>
                  </div>
                  <h4 className="learn-resume-title text-sm sm:text-base font-bold line-clamp-1 mb-1">
                    {resumeTopic.title}
                  </h4>
                  <div className="learn-resume-subtitle text-xs line-clamp-1 mb-3">
                    {resumeTopic.sectionTitle}
                  </div>
                </div>

                <button
                  onClick={() => onSelectTopic(resumeTopic.id)}
                  className="learn-resume-btn w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-sm transition active:scale-95 border-none"
                >
                  <span>Continue Learning</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Learning Statistics Bar (Gamification & Progress) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-[#102B50] border border-[#E2E8F0] dark:border-[#1B3B66] shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-amber-950/60 text-[#0756A5] dark:text-[#FFB800] flex items-center justify-center shrink-0">
              <Flame size={20} />
            </div>
            <div>
              <div className="text-base sm:text-lg font-black text-[#102B50] dark:text-white">
                {currentUser?.stats?.streak || 3} Days
              </div>
              <div className="text-xs text-[#64748B] dark:text-[#94A3B8] font-semibold">Daily Streak</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#102B50] border border-[#E2E8F0] dark:border-[#1B3B66] shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-[#0A1E38] text-[#0756A5] dark:text-[#60A5FA] flex items-center justify-center shrink-0">
              <BookOpen size={20} />
            </div>
            <div>
              <div className="text-base sm:text-lg font-black text-[#102B50] dark:text-white">
                {completedCount} / {totalTopicsCount}
              </div>
              <div className="text-xs text-[#64748B] dark:text-[#94A3B8] font-semibold">Lessons Mastered</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#102B50] border border-[#E2E8F0] dark:border-[#1B3B66] shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#16A34A] flex items-center justify-center shrink-0">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <div className="text-base sm:text-lg font-black text-[#102B50] dark:text-white">
                {overallPercent}%
              </div>
              <div className="text-xs text-[#64748B] dark:text-[#94A3B8] font-semibold">Curriculum Done</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#102B50] border border-[#E2E8F0] dark:border-[#1B3B66] shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Zap size={20} />
            </div>
            <div>
              <div className="text-base sm:text-lg font-black text-[#102B50] dark:text-white">
                {currentUser?.stats?.xp || 150} XP
              </div>
              <div className="text-xs text-[#64748B] dark:text-[#94A3B8] font-semibold">Learning Points</div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          SEARCH BAR & QUICK SECTION TABS
          ======================================================== */}
      <div className="space-y-4">
        <div id="tour-learn-search" className="max-w-xl relative">
          <div className="relative flex items-center">
            <Search
              size={18}
              className="absolute left-3.5 text-[#0756A5] dark:text-[#60A5FA] pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Python lessons (e.g. loops, functions, lists, dicts, oop)..."
              className="w-full pl-11 pr-10 py-3 rounded-2xl border border-[#E2E8F0] dark:border-[#1B3B66] focus:border-[#0756A5] outline-none transition bg-white dark:bg-[#102B50] text-sm sm:text-base text-[#102B50] dark:text-white placeholder-[#64748B] dark:placeholder-[#94A3B8] shadow-2xs focus:shadow-md focus:shadow-blue-500/10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 p-1.5 rounded-lg text-[#0756A5] dark:text-slate-400 hover:text-[#064681] dark:hover:text-white cursor-pointer bg-transparent border-none"
                title="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Section Quick Filter Chips */}
        {!searchQuery && (
          <div id="tour-learn-sections" className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            <button
              onClick={() => setSelectedSection("all")}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition cursor-pointer border ${
                selectedSection === "all"
                  ? "bg-[#0756A5] text-white border-[#0756A5] shadow-xs"
                  : "bg-white dark:bg-[#102B50] text-[#102B50] dark:text-[#CBD5E1] hover:bg-[#F3F7FC] dark:hover:bg-[#153560] border-[#E2E8F0] dark:border-[#1B3B66] hover:border-[#FFB800]"
              }`}
            >
              All 19 Modules ({allTopics.length})
            </button>
            {SECTIONS.map((sec) => (
              <button
                key={sec.id}
                onClick={() => setSelectedSection(sec.id)}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition cursor-pointer border ${
                  selectedSection === sec.id
                    ? "bg-[#0756A5] text-white border-[#0756A5] shadow-xs"
                    : "bg-white dark:bg-[#102B50] text-[#102B50] dark:text-[#CBD5E1] hover:bg-[#F3F7FC] dark:hover:bg-[#153560] border-[#E2E8F0] dark:border-[#1B3B66] hover:border-[#FFB800]"
                }`}
              >
                {sec.title.split("—")[1] || sec.title} ({sec.topics.length})
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================
          CHAPTER AND LESSON CARDS
          ======================================================== */}
      {filteredTopics ? (
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold text-slate-500 dark:text-[#91A6BF]">
              Found {filteredTopics.length} topic{filteredTopics.length === 1 ? "" : "s"}
            </span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-sm text-[#0756A5] dark:text-[#60A5FA] font-bold hover:underline bg-transparent border-none cursor-pointer"
              >
                Clear filter
              </button>
            )}
          </div>

          {filteredTopics.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-[#102B50] rounded-2xl border border-[#E2E8F0] dark:border-[#1B3B66] p-6 shadow-sm">
              <BookOpen size={36} className="mx-auto text-slate-400 dark:text-[#91A6BF] mb-3" />
              <h3 className="text-base font-bold text-[#102B50] dark:text-white mb-1">
                No matching topics found
              </h3>
              <p className="text-sm text-[#64748B] dark:text-[#D2DEEC] max-w-sm mx-auto mb-4">
                Try searching for keywords like 'variable', 'loop', 'list', or 'function'.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedSection("all");
                }}
                className="btn-vibrant-secondary"
              >
                Reset Search
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTopics.map((topic) => (
                <TopicCard
                  key={topic.id}
                  topic={topic}
                  selectedStage={selectedStage}
                  selectedLanguage={selectedLanguage}
                  onSelectTopic={onSelectTopic}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div id="tour-learn-cards" className="space-y-12">
          {SECTIONS.map((section) => (
            <section key={section.id} className="space-y-4">
              {/* Module Header Bar */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 pb-3 border-b border-[#E2E8F0] dark:border-[#1B3B66]">
                <span className="font-mono text-xs sm:text-sm font-bold text-[#0756A5] dark:text-[#FFB800] bg-[#F3F7FC] dark:bg-[#0A1E38] px-2.5 py-1 rounded-lg border border-[#E2E8F0] dark:border-[#1B3B66] shrink-0">
                  {section.number}
                </span>
                <h2 className="text-base sm:text-xl font-black text-[#102B50] dark:text-white min-w-0">
                  {section.title}
                </h2>
                <div className="flex items-center gap-2 sm:ml-auto shrink-0 flex-wrap">
                  <span className="text-xs sm:text-sm text-[#64748B] dark:text-[#91A6BF] font-bold">
                    {section.topics.length} Interactive Lessons
                  </span>
                  <AskDoubtButton
                    variant="section"
                    sectionNumber={section.number}
                    sectionTitle={section.title}
                    label="Ask Doubt"
                  />
                </div>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {section.topics.map((topic) => (
                  <TopicCard
                    key={topic.id}
                    topic={topic}
                    selectedStage={selectedStage}
                    selectedLanguage={selectedLanguage}
                    onSelectTopic={onSelectTopic}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
