import React from "react";
import { Lock } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useDoubt } from "../context/DoubtContext";

/**
 * High-fidelity WhatsApp SVG Icon
 */
export function WhatsAppIcon({ size = 16, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`shrink-0 ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

/**
 * AskDoubtButton Component
 * Renders a one-click WhatsApp doubt button with live doubt credit balance indicators.
 * Clicking opens the interactive AskDoubtModal displaying remaining doubts and recharge if needed.
 */
export default function AskDoubtButton({
  sectionNumber,
  sectionTitle,
  lessonName,
  topicNumber,
  stepName,
  variant = "card",
  className = "",
  label = "Ask Doubt",
  title
}) {
  const { isAuthenticated, openAuthModal } = useAuth();
  const { openDoubtModal, doubtCredits, freeDoubtsTotal } = useDoubt();

  const handleClick = (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      const topicContext = lessonName
        ? `"${lessonName}"`
        : sectionTitle
        ? `"${sectionTitle}"`
        : sectionNumber
        ? `Section ${sectionNumber}`
        : "this topic";
      openAuthModal(
        "login",
        `Please sign in to access your 10 Free Doubts on WhatsApp for ${topicContext}! Only registered candidates can send doubt inquiries.`
      );
      return;
    }

    openDoubtModal({
      sectionNumber,
      sectionTitle,
      lessonName,
      topicNumber,
      stepName
    });
  };

  const remainingLabel = isAuthenticated
    ? doubtCredits > 0
      ? `${doubtCredits} left`
      : "₹50 / doubt"
    : "10 Free";

  const tooltip =
    title ||
    (!isAuthenticated
      ? `Sign in for 10 Free Doubts on WhatsApp`
      : doubtCredits > 0
      ? `You have ${doubtCredits} of ${freeDoubtsTotal} free doubts left • Click to ask`
      : `Free doubts exhausted • Click to ask on WhatsApp for ₹50`);

  // =========================================================================
  // 1. Variant: Section Header (Pill in section title bar)
  // =========================================================================
  if (variant === "section") {
    return (
      <button
        onClick={handleClick}
        title={tooltip}
        aria-label={tooltip}
        className={`ask-doubt-btn ask-doubt-btn-section inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-all duration-200 cursor-pointer border select-none shrink-0 active:scale-95 shadow-xs max-w-full min-w-0 ${className}`}
      >
        <WhatsAppIcon size={14} className="text-[#25D366] shrink-0" />
        <span className="truncate">{label}</span>
        <span className={`text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-md font-extrabold shrink-0 ${
          !isAuthenticated
            ? "bg-slate-200/60 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
            : doubtCredits > 0
            ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
            : "bg-amber-500/20 text-amber-700 dark:text-amber-300"
        }`}>
          {remainingLabel}
        </span>
        {!isAuthenticated && <Lock size={11} className="opacity-75 text-amber-500 shrink-0" />}
      </button>
    );
  }

  // =========================================================================
  // 2. Variant: Lesson Card (In TopicCard footer or header)
  // =========================================================================
  if (variant === "card") {
    return (
      <button
        onClick={handleClick}
        title={tooltip}
        aria-label={tooltip}
        className={`ask-doubt-btn ask-doubt-btn-card inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all duration-150 cursor-pointer border select-none shrink-0 active:scale-95 max-w-full min-w-0 ${className}`}
      >
        <WhatsAppIcon size={12} className="text-[#25D366] shrink-0" />
        <span className="truncate">{label}</span>
        <span className={`text-[8px] sm:text-[9px] px-1 py-0.2 rounded-sm font-black shrink-0 ${
          !isAuthenticated
            ? "bg-slate-200/50 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
            : doubtCredits > 0
            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
            : "bg-amber-500/20 text-amber-700 dark:text-amber-300"
        }`}>
          {remainingLabel}
        </span>
        {!isAuthenticated && <Lock size={10} className="opacity-75 text-amber-500 shrink-0" />}
      </button>
    );
  }

  // =========================================================================
  // 3. Variant: Lesson Header (Top reading toolbar in LessonContent)
  // =========================================================================
  if (variant === "lesson-header") {
    return (
      <button
        onClick={handleClick}
        title={tooltip}
        aria-label={tooltip}
        className={`ask-doubt-btn ask-doubt-btn-header notion-tag text-[11px] sm:text-xs font-bold cursor-pointer transition-all duration-150 flex items-center gap-1 sm:gap-1.5 py-0.5 sm:py-1 px-2 sm:px-2.5 select-none active:scale-95 max-w-full min-w-0 ${className}`}
      >
        <WhatsAppIcon size={13} className="text-[#25D366] shrink-0" />
        <span className="truncate">{label}</span>
        <span className={`text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.2 sm:py-0.5 rounded-md font-extrabold shrink-0 ${
          !isAuthenticated
            ? "bg-slate-200/60 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
            : doubtCredits > 0
            ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
            : "bg-amber-500/20 text-amber-700 dark:text-amber-300"
        }`}>
          {remainingLabel}
        </span>
        {!isAuthenticated && <Lock size={11} className="opacity-75 text-amber-500 shrink-0" />}
      </button>
    );
  }

  // =========================================================================
  // 4. Variant: Lesson Step Action (Prominent button at step completion/footer)
  // =========================================================================
  if (variant === "lesson-step") {
    return (
      <button
        onClick={handleClick}
        title={tooltip}
        aria-label={tooltip}
        className={`ask-doubt-btn ask-doubt-btn-step inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer border select-none active:scale-95 shadow-xs w-full sm:w-auto max-w-full min-w-0 ${className}`}
      >
        <WhatsAppIcon size={16} className="text-[#25D366] shrink-0" />
        <span className="truncate">{label || "Ask Doubt on WhatsApp"}</span>
        <span className={`text-[10px] sm:text-[11px] px-1.5 sm:px-2 py-0.5 rounded-md font-black shrink-0 ${
          !isAuthenticated
            ? "bg-slate-200/60 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
            : doubtCredits > 0
            ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
            : "bg-amber-500/20 text-amber-700 dark:text-amber-300"
        }`}>
          {remainingLabel}
        </span>
        {!isAuthenticated && (
          <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-medium bg-amber-500/15 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded-md shrink-0">
            <Lock size={10} />
            <span>Sign In</span>
          </span>
        )}
      </button>
    );
  }

  // =========================================================================
  // 5. Default Fallback
  // =========================================================================
  return (
    <button
      onClick={handleClick}
      title={tooltip}
      aria-label={tooltip}
      className={`ask-doubt-btn inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-bold cursor-pointer transition select-none active:scale-95 max-w-full min-w-0 ${className}`}
    >
      <WhatsAppIcon size={14} className="text-[#25D366] shrink-0" />
      <span className="truncate">{label}</span>
      <span className={`text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-md font-extrabold shrink-0 ${
        !isAuthenticated
          ? "bg-slate-200/60 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
        : doubtCredits > 0
        ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
        : "bg-amber-500/20 text-amber-700 dark:text-amber-300"
      }`}>
        {remainingLabel}
      </span>
      {!isAuthenticated && <Lock size={11} className="opacity-75 text-amber-500 shrink-0" />}
    </button>
  );
}
