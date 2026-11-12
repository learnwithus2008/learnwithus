import React from "react";
import { ArrowLeft } from "lucide-react";

export default function PageBackButton({
  onBack,
  label = "Back",
  fallbackDestination = "",
  className = ""
}) {
  if (!onBack) return null;

  return (
    <button
      onClick={onBack}
      className={`inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold text-[#102B50] dark:text-white hover:text-[#102B50] bg-white dark:bg-[#102B50] hover:bg-[#FFB800] dark:hover:bg-[#FFB800] dark:hover:text-[#102B50] border border-[#E2E8F0] dark:border-[#1E3A5F] hover:border-[#FFB800] dark:hover:border-[#FFB800] transition-all cursor-pointer shadow-xs hover:shadow-sm active:scale-95 group shrink-0 ${className}`}
      title={fallbackDestination ? `Back to ${fallbackDestination}` : "Go back to previous page"}
      aria-label="Go back"
    >
      <ArrowLeft
        size={15}
        className="text-[#0756A5] dark:text-[#FFB800] group-hover:text-[#102B50] group-hover:-translate-x-0.5 transition-all shrink-0"
      />
      <span>{label}</span>
      {fallbackDestination && (
        <span className="text-[11px] font-medium text-slate-400 dark:text-[#91A6BF] hidden sm:inline">
          ({fallbackDestination})
        </span>
      )}
    </button>
  );
}
