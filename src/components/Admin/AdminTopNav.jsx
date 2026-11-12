import React from "react";
import {
  Menu,
  RefreshCw,
  Eye,
  CheckCircle2,
  ShieldCheck,
  Search,
  Sparkles
} from "lucide-react";

export default function AdminTopNav({
  activeTabTitle,
  activeTabDescription,
  onOpenMobileSidebar,
  onRefresh,
  loading = false,
  onOpenAppPreview,
  onQuickAudit
}) {
  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-[#07111e]/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-[#142338] px-3 sm:px-6 py-2.5 sm:py-3.5 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2.5 sm:gap-4">
        {/* Left: Mobile hamburger & Tab Header */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <button
            onClick={onOpenMobileSidebar}
            className="lg:hidden p-2 rounded-xl bg-slate-100 dark:bg-[#102036] text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-[#162c4a] transition cursor-pointer border-none shrink-0"
            aria-label="Open Navigation Sidebar"
          >
            <Menu size={19} />
          </button>

          <div className="min-w-0">
            <h1 className="text-base sm:text-lg lg:text-xl font-black text-slate-900 dark:text-white tracking-tight truncate">
              {activeTabTitle}
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 hidden sm:block truncate">
              {activeTabDescription}
            </p>
          </div>
        </div>

        {/* Right: Quick Command Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Quick Quiz Audit Trigger */}
          {onQuickAudit && (
            <button
              onClick={onQuickAudit}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/80 text-xs font-bold transition shadow-xs cursor-pointer"
              title="Run instant validation across all 23,760 questions"
            >
              <CheckCircle2 size={14} className="text-blue-500" />
              <span>Audit Quizzes</span>
            </button>
          )}

          {/* Learner Preview */}
          {onOpenAppPreview && (
            <button
              onClick={onOpenAppPreview}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80 text-xs font-bold transition shadow-xs cursor-pointer"
              title="Preview learning experience exactly as students see it"
            >
              <Eye size={14} className="text-indigo-500" />
              <span>Student View</span>
            </button>
          )}

          {/* Refresh Telemetry */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={loading}
              className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#102036] dark:hover:bg-[#183050] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-[#1a3152] text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
              title="Reload live database metrics and student records"
              aria-label="Refresh telemetry"
            >
              <RefreshCw size={13} className={loading ? "animate-spin text-blue-500" : "text-slate-400"} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
