import React from "react";
import { LEARNING_STAGES } from "../data/learningStages";
import { Check, ArrowRight } from "lucide-react";

export default function LearningStageSelector({
  selectedStage,
  onSelectStage,
  showTitle = true,
  layout = "grid" // "grid" | "compact" | "modal"
}) {
  return (
    <div className="learning-stage-selector w-full">
      {showTitle && (
        <div className="text-center mb-8">
          <h2 className="heading-section text-slate-900 dark:text-white mb-2">
            Choose Your Learning Stage
          </h2>
          <p className="body-base text-slate-600 dark:text-[#D2DEEC] max-w-xl mx-auto">
            The same Python concepts, explained through examples that make sense to your age and background.
          </p>
        </div>
      )}

      <div className={`grid gap-4 ${
        layout === "compact" 
          ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5" 
          : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-5"
      }`}>
        {LEARNING_STAGES.map((stage) => {
          const isSelected = selectedStage === stage.id;

          const borderStyle = isSelected
            ? "border-2 border-[#0756A5] ring-4 ring-[#0756A5]/20 shadow-lg bg-[#F3F7FC] dark:bg-[#102B50] scale-[1.02]"
            : "border border-[#E2E8F0] dark:border-[#1E3A5F] bg-white dark:bg-[#102B50] hover:border-[#FFB800] dark:hover:border-[#FFB800] hover:shadow-md hover:shadow-[#FFB800]/15";

          return (
            <div
              key={stage.id}
              onClick={() => onSelectStage(stage.id)}
              className={`stage-card p-5 rounded-2xl cursor-pointer transition-all duration-200 flex flex-col justify-between relative group ${borderStyle}`}
            >
              {isSelected && (
                <div className="absolute top-3.5 right-3.5 w-6 h-6 rounded-full bg-[#0756A5] text-white flex items-center justify-center text-xs shadow-sm border border-[#FFB800]">
                  <Check size={14} strokeWidth={3} />
                </div>
              )}

              <div>
                {/* Icon & Age Badge */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-3xl group-hover:scale-110 transition-transform select-none">
                    {stage.icon}
                  </span>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full border border-[#E2E8F0] bg-[#F3F7FC] text-[#0756A5] dark:bg-[#1E3A5F] dark:text-[#FFB800] dark:border-[#1E3A5F]">
                    {stage.ageRange}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-base font-bold text-[#102B50] dark:text-white mb-1.5 flex items-center gap-1.5">
                  <span>{stage.label}</span>
                </h3>

                {/* Description */}
                <p className="text-sm text-[#64748B] dark:text-slate-300 leading-relaxed mb-3">
                  {stage.shortDesc}
                </p>

                {/* Example Concept */}
                <div className="p-3 rounded-xl bg-[#F3F7FC] dark:bg-[#0C1B30] border border-[#E2E8F0] dark:border-[#1E3A5F] text-xs sm:text-sm text-[#64748B] dark:text-slate-300 mb-4">
                  <span className="font-bold text-[#102B50] dark:text-white block mb-0.5">Focus:</span>
                  {stage.exampleConcept}
                </div>
              </div>

              {/* Select Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectStage(stage.id);
                }}
                className={`w-full py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5 cursor-pointer border ${
                  isSelected
                    ? "bg-[#0756A5] text-white shadow-sm border-transparent"
                    : "bg-[#F3F7FC] hover:bg-[#FFB800] hover:text-[#102B50] hover:border-[#FFB800] dark:bg-[#0C1B30] dark:hover:bg-[#FFB800] dark:hover:text-[#102B50] text-[#102B50] dark:text-white border-[#E2E8F0] dark:border-[#1E3A5F]"
                }`}
              >
                {isSelected ? (
                  <>
                    <Check size={16} />
                    <span>Selected</span>
                  </>
                ) : (
                  <>
                    <span>Select Stage</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
