import React, { useState } from "react";
import CodeBlock from "./CodeBlock";
import { CheckCircle2, XCircle, ChevronDown, ChevronUp, HelpCircle, Lock, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { playSuccessChime } from "../utils/audioCelebration";

export default function QuestionCard({ item, index }) {
  const { isAuthenticated, openAuthModal } = useAuth();
  const [selectedOption, setSelectedOption] = useState(null);
  const [revealed, setRevealed] = useState(false);

  const isCorrect = selectedOption && selectedOption === item.correctAnswer;

  const handleOptionClick = (opt) => {
    if (!isAuthenticated) {
      openAuthModal("login", "Sign in required to answer practice questions and check answers!");
      return;
    }
    setSelectedOption(opt);
    if (opt === item.correctAnswer) {
      playSuccessChime();
    }
  };

  const handleRevealClick = () => {
    if (!isAuthenticated) {
      openAuthModal("login", "Sign in required to view question explanations!");
      return;
    }
    setRevealed(!revealed);
  };

  return (
    <div className="premium-card p-5 sm:p-7 transition-all space-y-4">
      {/* Question Header Badge */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-[#0756A5] text-white flex items-center justify-center text-xs font-black font-mono shadow-xs border border-white/20">
            {index + 1}
          </span>
          <span className="notion-tag text-xs uppercase font-extrabold text-[#102B50] dark:text-[#FFB800] bg-[#FFFBEB] dark:bg-[#153560] border border-[#FFB800]/40">
            {item.type}
          </span>
        </div>
        <span className="notion-tag text-xs font-bold text-[#64748B] dark:text-slate-300 bg-[#F3F7FC] dark:bg-[#0A1E38] border border-[#E2E8F0] dark:border-[#1B3B66]">
          {item.category}
        </span>
      </div>

      {/* Question Statement */}
      <h3 className="text-base sm:text-lg font-black text-[#102B50] dark:text-white leading-snug">
        {item.question}
      </h3>

      {/* Code Snippet if applicable */}
      {item.code && (
        <div className="my-2">
          <CodeBlock code={item.code} language="python" title="Code Snippet" />
        </div>
      )}

      {/* Options List */}
      {item.options && (
        <div className="space-y-2.5 my-3">
          {item.options.map((opt, optIdx) => {
            const isSelected = selectedOption === opt;
            const isActualAnswer = opt === item.correctAnswer;

            let optionClass = "border-[#E2E8F0] dark:border-[#1B3B66] bg-white dark:bg-[#102B50] text-[#102B50] dark:text-white hover:border-[#FFB800] hover:bg-[#F3F7FC] dark:hover:bg-[#153560]";
            if (revealed) {
              if (isActualAnswer) {
                optionClass = "border-[#16A34A] bg-emerald-50 dark:bg-emerald-950/60 text-emerald-950 dark:text-emerald-100 font-bold shadow-xs ring-2 ring-[#16A34A]/40";
              } else if (isSelected && !isActualAnswer) {
                optionClass = "border-[#DC2626] bg-rose-50 dark:bg-rose-950/60 text-rose-950 dark:text-rose-100 font-bold shadow-xs ring-2 ring-[#DC2626]/40";
              } else {
                optionClass = "border-[#E2E8F0] dark:border-[#1B3B66] bg-slate-50 dark:bg-[#0A1E38] text-slate-400 dark:text-slate-500 font-medium opacity-60";
              }
            } else if (isSelected) {
              optionClass = "border-[#0756A5] bg-[#F3F7FC] dark:bg-[#153560] text-[#0756A5] dark:text-white font-bold shadow-xs ring-2 ring-[#0756A5]/40";
            }

            return (
              <button
                key={optIdx}
                onClick={() => handleOptionClick(opt)}
                className={`w-full text-left p-3.5 sm:p-4 rounded-xl border text-xs sm:text-sm font-semibold transition flex items-center justify-between cursor-pointer ${optionClass}`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border shrink-0 ${
                    isSelected ? "bg-[#0756A5] text-white border-[#0756A5]" : "border-slate-300 dark:border-slate-600 text-slate-500"
                  }`}>
                    {String.fromCharCode(65 + optIdx)}
                  </span>
                  <span>{opt}</span>
                </div>
                {revealed && isActualAnswer && (
                  <CheckCircle2 size={18} className="text-[#16A34A] flex-shrink-0 ml-2" />
                )}
                {revealed && isSelected && !isActualAnswer && (
                  <XCircle size={18} className="text-[#DC2626] flex-shrink-0 ml-2" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-3 border-t border-[#E2E8F0] dark:border-[#1B3B66]">
        <button
          onClick={handleRevealClick}
          className="btn-vibrant-primary px-4 py-2 text-xs sm:text-sm font-bold flex items-center gap-2"
        >
          {!isAuthenticated && <Lock size={14} className="text-white/80" />}
          {revealed ? (
            <>
              <ChevronUp size={15} /> <span>Hide Explanation</span>
            </>
          ) : (
            <>
              <ChevronDown size={15} /> <span>Show Explanation</span>
            </>
          )}
        </button>

        {selectedOption && !revealed && (
          <span className="text-xs text-[#0756A5] dark:text-[#FFB800] font-bold flex items-center gap-1">
            <Sparkles size={13} />
            <span>Option chosen • Click Show Explanation to verify!</span>
          </span>
        )}
      </div>

      {/* Answer & Explanation Box */}
      {revealed && (
        <div className="mt-3 p-4 sm:p-5 rounded-2xl bg-[#F3F7FC] dark:bg-[#0A1E38] border border-[#E2E8F0] dark:border-[#1B3B66] animate-in">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#102B50] dark:text-white mb-2">
            <span className="text-[#0756A5] dark:text-[#60A5FA]">Correct Answer:</span>
            <span className="text-[#16A34A]">{item.correctAnswer}</span>
          </div>
          <p className="body-base text-xs sm:text-sm text-[#64748B] dark:text-[#CBD5E1] leading-relaxed pt-2 border-t border-[#E2E8F0] dark:border-[#1B3B66] m-0">
            <strong className="text-[#102B50] dark:text-white block mb-1">Explanation:</strong>
            {item.explanation}
          </p>
        </div>
      )}
    </div>
  );
}
