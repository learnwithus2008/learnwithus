import React from "react";
import {
  Award,
  Lock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  MessageCircle,
  Eye,
  ArrowRight
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  openWhatsAppCertificateRequest,
  WHATSAPP_SUPPORT_NUMBER,
  WHATSAPP_DISPLAY_NUMBER
} from "../utils/whatsappHelper";

/**
 * CertificateEligibilityCard
 * Reusable component presenting:
 * 1. Mandatory 80% course completion business rule
 * 2. Official Student Communication announcement & 4-step workflow
 * 3. Accurate progress metrics: current %, required 80%, remaining %
 * 4. Locked status (< 80%) vs. Eligible status (>= 80%)
 * 5. Direct WhatsApp request trigger when eligible
 */
export default function CertificateEligibilityCard({
  completedCount: propCompletedCount,
  totalTopics = 198,
  compact = false,
  showActions = true,
  onOpenPreview,
  onNavigate,
  className = ""
}) {
  const { currentUser } = useAuth();

  // Actual student progress from user stats
  const actualCompletedTopics = currentUser?.stats?.completedTopics || [];
  const completedCount =
    typeof propCompletedCount === "number"
      ? propCompletedCount
      : actualCompletedTopics.length;

  // Exact 80% eligibility calculation
  const completionPercentage = Math.min(
    100,
    Math.round((completedCount / totalTopics) * 100)
  );
  const REQUIRED_PERCENTAGE = 80;
  const isEligible = completionPercentage >= REQUIRED_PERCENTAGE;
  const remainingPercentage = Math.max(0, REQUIRED_PERCENTAGE - completionPercentage);
  const requiredTopicsCount = Math.ceil(totalTopics * 0.8); // 159 topics
  const remainingTopicsCount = Math.max(0, requiredTopicsCount - completedCount);

  // Dynamic progress guidance message
  const progressGuidanceMessage = isEligible
    ? "Congratulations! You are eligible to request your certificate."
    : remainingPercentage <= 10
    ? `You're almost there! Complete ${remainingPercentage}% more to unlock your certificate request.`
    : `Complete ${remainingPercentage}% more to unlock your certificate request.`;

  const studentName = currentUser?.name || currentUser?.full_name || "Demo Student";
  const studentEmail = currentUser?.email || "student@example.com";
  const courseName = "Python Programming – Beginner to Advanced";

  const handleWhatsAppRequest = () => {
    if (!isEligible) return;
    openWhatsAppCertificateRequest({
      studentName,
      studentEmail,
      courseName,
      completedCount,
      totalTopics,
      phone: WHATSAPP_SUPPORT_NUMBER
    });
  };

  return (
    <div
      className={`certificate-eligibility-card rounded-3xl border transition-all ${
        isEligible
          ? "bg-emerald-50/80 dark:bg-[#08221c] border-emerald-300 dark:border-emerald-800 shadow-md"
          : "bg-white dark:bg-[#0c1b30] border-slate-200 dark:border-[#1E3A5F] shadow-lg"
      } ${compact ? "p-5 sm:p-6" : "p-6 sm:p-8"} ${className}`}
      data-eligibility-status={isEligible ? "eligible" : "locked"}
      data-completion-percent={completionPercentage}
    >
      {/* ========================================================
          1. HEADER & STATUS BADGE
          ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
              isEligible
                ? "bg-emerald-500 text-white"
                : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
            }`}
          >
            {isEligible ? <CheckCircle2 size={22} /> : <Lock size={20} />}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#0756A5] dark:text-[#60A5FA]">
                Official Credential Eligibility
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  isEligible
                    ? "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300"
                    : "bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300"
                }`}
              >
                {isEligible ? "✓ Eligible (80%+ Reached)" : "Locked (80% Required)"}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-[#102B50] dark:text-white leading-tight">
              🎓 Earn Your Course Certificate!
            </h3>
          </div>
        </div>

        {/* Quick Percentage Pill */}
        <div className="flex items-center gap-2 self-start sm:self-auto bg-slate-100 dark:bg-[#102541] px-3.5 py-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">
              Current Progress
            </div>
            <div className="font-mono text-sm font-black text-[#0756A5] dark:text-[#38BDF8]">
              {completionPercentage}% <span className="text-slate-400 font-normal text-xs">/ 80%</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          2. OFFICIAL STUDENT COMMUNICATION
          ======================================================== */}
      <div className="my-4 space-y-3">
        <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 leading-relaxed m-0">
          Complete at least 80% of your course to become eligible for a LearnWithUs certificate.
        </p>

        {/* 4-Step Explanation Box */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#102541]/70 border border-slate-200/80 dark:border-slate-800 space-y-2">
          <span className="text-xs font-bold text-[#0756A5] dark:text-[#60A5FA] block">
            Once you reach 80% completion:
          </span>
          <ol className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 space-y-1.5 pl-4 m-0 font-medium list-decimal">
            <li>Contact us through WhatsApp.</li>
            <li>Pay ₹99 for your certificate with QR code.</li>
            <li>We will verify your payment.</li>
            <li>Your certificate PDF will be issued after approval.</li>
          </ol>
        </div>
      </div>

      {/* ========================================================
          3. PROGRESS METRICS & 80% THRESHOLD BAR
          ======================================================== */}
      <div className="space-y-2.5 my-4 p-4 rounded-2xl bg-[#F8FAFC] dark:bg-[#0A1E38]/50 border border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-slate-600 dark:text-slate-300">
            Progress: <strong className="font-mono text-[#0A2540] dark:text-white">{completedCount}</strong> of {totalTopics} topics ({completionPercentage}%)
          </span>
          <span className="font-mono text-[#0756A5] dark:text-[#38BDF8]">
            Required: 80% ({requiredTopicsCount} topics)
          </span>
        </div>

        {/* Visual Progress Bar with 80% Goal Notch */}
        <div className="relative pt-1">
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-3 rounded-full overflow-hidden relative">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isEligible
                  ? "bg-emerald-500"
                  : "bg-gradient-to-r from-amber-500 via-[#0756A5] to-blue-500"
              }`}
              style={{ width: `${Math.min(100, completionPercentage)}%` }}
            />
          </div>

          {/* 80% Threshold Marker */}
          <div
            className="absolute top-0 bottom-0 flex flex-col items-center pointer-events-none"
            style={{ left: "80%" }}
            title="80% Eligibility Threshold"
          >
            <div className="w-0.5 h-5 bg-amber-600 dark:bg-[#FFB800] -mt-1 shadow-xs" />
            <span className="text-[9px] font-black text-amber-700 dark:text-[#FFB800] -mt-0.5 tracking-tighter">
              80%
            </span>
          </div>
        </div>

        {/* Dynamic Status Guidance Notice */}
        <div
          className={`p-3 rounded-xl flex items-center gap-2 text-xs font-bold ${
            isEligible
              ? "bg-emerald-100/80 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800"
              : remainingPercentage <= 10
              ? "bg-amber-100/90 dark:bg-amber-950/60 text-amber-950 dark:text-amber-200 border border-amber-300 dark:border-amber-800"
              : "bg-blue-50 dark:bg-blue-950/40 text-blue-950 dark:text-blue-200 border border-blue-200 dark:border-blue-900"
          }`}
        >
          {isEligible ? (
            <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle size={16} className="text-amber-600 dark:text-amber-400 shrink-0" />
          )}
          <span className="leading-snug">{progressGuidanceMessage}</span>
        </div>
      </div>

      {/* ========================================================
          4. ACTION BUTTONS
          ======================================================== */}
      {showActions && (
        <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 text-center sm:text-left">
            Fee: <strong>₹99</strong> (Includes QR verification code & A4 landscape PDF)
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {/* WhatsApp Request Button (Disabled before 80%) */}
            <button
              type="button"
              onClick={handleWhatsAppRequest}
              disabled={!isEligible}
              className={`flex-1 sm:flex-none py-2.5 px-5 rounded-xl font-bold text-xs sm:text-sm shadow-sm transition flex items-center justify-center gap-2 border-none ${
                isEligible
                  ? "bg-[#25D366] hover:bg-[#1EBE5D] text-white cursor-pointer active:scale-95"
                  : "bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed"
              }`}
              title={
                isEligible
                  ? "Request Certificate on WhatsApp"
                  : "Locked • Complete 80% of course to unlock"
              }
            >
              {isEligible ? (
                <MessageCircle size={16} className="text-white" />
              ) : (
                <Lock size={15} className="text-slate-400" />
              )}
              <span>
                {isEligible
                  ? "Request Certificate on WhatsApp"
                  : "Locked (80% Required)"}
              </span>
            </button>

            {/* View Preview Button */}
            {onOpenPreview && (
              <button
                type="button"
                onClick={onOpenPreview}
                className="py-2.5 px-4 rounded-xl bg-[#0756A5] hover:bg-[#064681] text-white font-bold text-xs sm:text-sm shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer border-none"
                title="Preview Pure White Demo Certificate"
              >
                <Eye size={15} />
                <span>Preview Demo</span>
              </button>
            )}

            {/* Resume Course Button if not eligible */}
            {!isEligible && onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate("learn")}
                className="py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-[#102541] hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm border border-slate-300 dark:border-slate-700 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Continue Course</span>
                <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
