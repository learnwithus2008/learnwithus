import React from "react";
import { ArrowRight, BookOpen, FileText, Lock, Sparkles, CheckCircle2, Check, Clock, Play } from "lucide-react";
import { getStageById } from "../data/learningStages";
import { getLanguageById } from "../data/learningLanguages";
import { isFreeTopic, isTopicCompleted } from "../data/allTopics";
import { useAuth } from "../context/AuthContext";
import AskDoubtButton from "./AskDoubtButton";

export default function TopicCard({
  topic,
  onSelect,
  onSelectTopic,
  selectedStage = "young",
  selectedLanguage = "english"
}) {
  const { isAuthenticated } = useAuth();
  const selectHandler = onSelectTopic || onSelect;
  const stageData = topic.stages?.[selectedStage] || topic.stages?.young || topic;
  const langData = stageData.languages?.[selectedLanguage] || stageData.languages?.english || stageData;
  const stageMeta = getStageById(selectedStage);
  const langMeta = getLanguageById(selectedLanguage);
  const isFree = isFreeTopic(topic.id);
  const isLocked = !isAuthenticated && !isFree;
  const isCompleted = isTopicCompleted(topic.id);

  const previewText =
    langData.intro ||
    stageData.intro ||
    topic.shortDescription ||
    "Learn and master this core Python concept through interactive explanations and live code exercises.";

  const completionPercent = isCompleted ? 100 : 0;

  return (
    <div
      onClick={() => selectHandler && selectHandler(topic.id)}
      className="premium-card group p-5 cursor-pointer flex flex-col justify-between relative overflow-hidden"
    >
      {/* Top Completion Strip if mastered */}
      {isCompleted && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#16A34A] to-[#10B981]" />
      )}

      <div>
        {/* Header row with Chapter badge, Status pills, and Section */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-mono font-bold text-[#0756A5] dark:text-[#60A5FA] bg-[#F3F7FC] dark:bg-[#0A1E38] border border-[#E2E8F0] dark:border-[#1B3B66] px-2.5 py-0.5 rounded-full">
              Ch #{topic.topicNumber}
            </span>

            {isCompleted ? (
              <span className="flex items-center gap-1 text-[11px] font-bold text-[#16A34A] bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 rounded-full">
                <CheckCircle2 size={11} className="text-[#16A34A]" />
                <span>Completed</span>
              </span>
            ) : isFree ? (
              <span className="flex items-center gap-1 text-[11px] font-bold text-[#16A34A] bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 rounded-full">
                <Sparkles size={11} className="text-[#16A34A]" />
                <span>Free Preview</span>
              </span>
            ) : isLocked ? (
              <span className="flex items-center gap-1 text-[11px] font-bold text-[#0756A5] dark:text-[#FFB800] bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 px-2 py-0.5 rounded-full">
                <Lock size={11} className="text-[#0756A5] dark:text-[#FFB800]" />
                <span>Locked</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[11px] font-bold text-[#0756A5] dark:text-[#60A5FA] bg-blue-50 dark:bg-[#0A1E38] border border-blue-200 dark:border-[#1B3B66] px-2 py-0.5 rounded-full">
                <span>Available</span>
              </span>
            )}
          </div>

          <span className="text-xs font-semibold text-[#64748B] dark:text-slate-400 truncate max-w-[120px]">
            {topic.sectionTitle?.split("—")[1]?.trim() || topic.sectionId}
          </span>
        </div>

        {/* Chapter Title */}
        <h3 className="text-base font-bold text-[#102B50] dark:text-white group-hover:text-[#FFB800] dark:group-hover:text-[#FFB800] transition-colors leading-snug mb-2 flex items-start justify-between gap-2">
          <span>{topic.title}</span>
        </h3>

        {/* Short Description */}
        <p className="text-[#64748B] dark:text-[#CBD5E1] text-xs sm:text-sm line-clamp-2 leading-relaxed mb-3">
          {previewText}
        </p>

        {/* Progress Bar & Steps Count */}
        <div className="space-y-1.5 my-3">
          <div className="flex items-center justify-between text-[11px] text-[#64748B] dark:text-slate-400 font-semibold">
            <span>6 Interactive Steps</span>
            <span className={isCompleted ? "text-[#16A34A] font-bold" : ""}>
              {completionPercent}%
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-[#0c1422] h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isCompleted
                  ? "bg-[#16A34A] w-full"
                  : "bg-gradient-to-r from-[#0756A5] to-[#FFB800] w-1/12 opacity-60"
              }`}
            />
          </div>
        </div>
      </div>

      {/* Footer Row with Stage Badge & Action Button */}
      <div className="mt-2 pt-3 border-t border-[#E2E8F0] dark:border-[#1B3B66] flex items-center justify-between gap-2 text-xs sm:text-sm font-bold text-[#0756A5] dark:text-[#60A5FA]">
        <span className="flex items-center gap-1.5 text-[#102B50] dark:text-slate-300 font-semibold truncate min-w-0">
          <FileText size={13} className="text-[#0756A5] dark:text-[#60A5FA] shrink-0" />
          <span className="truncate">{stageMeta.label.split(" ")[0]} • {langMeta.shortLabel}</span>
        </span>

        <div className="flex items-center gap-2 shrink-0">
          <AskDoubtButton
            variant="card"
            sectionTitle={topic.sectionTitle}
            lessonName={topic.title}
            topicNumber={topic.topicNumber}
            label="Doubt"
          />

          <div className="flex items-center gap-1">
            <span
              className={
                isLocked
                  ? "text-[#0756A5] dark:text-amber-400 font-bold"
                  : isCompleted
                  ? "text-[#16A34A] font-bold group-hover:text-[#15803D]"
                  : "text-[#0756A5] dark:text-[#60A5FA] group-hover:text-[#064681] dark:group-hover:text-[#FFB800] font-bold transition-colors"
              }
            >
              {isLocked ? "Sign In" : isCompleted ? "Review" : "Learn"}
            </span>
            {isLocked ? (
              <Lock size={13} className="text-[#0756A5] dark:text-amber-400 shrink-0" />
            ) : (
              <ArrowRight size={14} className="text-[#0756A5] dark:text-[#60A5FA] group-hover:translate-x-1 transition-transform group-hover:text-[#064681] dark:group-hover:text-[#FFB800]" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
