import React from "react";
import { useDoubt } from "../../context/DoubtContext";
import { CheckCircle2, AlertTriangle, AlertCircle, X } from "lucide-react";

export default function DoubtToast() {
  const { doubtToast } = useDoubt();

  if (!doubtToast) return null;

  const isSuccess = doubtToast.type === "success";
  const isWarning = doubtToast.type === "warning";

  return (
    <aside
      aria-label="Doubt Notification"
      className="fixed bottom-4 right-2 sm:right-5 left-2 sm:left-auto z-60 max-w-sm w-auto sm:w-full p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900 border shadow-xl flex items-start gap-2.5 sm:gap-3 animate-in slide-in-from-bottom-5 duration-300"
      style={{
        borderColor: isSuccess ? "#10B981" : isWarning ? "#F59E0B" : "#EF4444"
      }}
    >
      <div className="shrink-0 mt-0.5">
        {isSuccess && <CheckCircle2 size={18} className="text-emerald-500" />}
        {isWarning && <AlertTriangle size={18} className="text-amber-500" />}
        {!isSuccess && !isWarning && <AlertCircle size={18} className="text-red-500" />}
      </div>
      <div className="flex-1 text-xs sm:text-sm font-medium text-slate-900 dark:text-white leading-snug">
        {doubtToast.message}
      </div>
    </aside>
  );
}

