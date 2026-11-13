import React, { useState } from 'react';
import {
  BookOpen,
  Volume2,
  Lightbulb,
  Brain,
  Code2,
  Copy,
  Check,
  ChevronRight,
  Sparkles,
  Layers,
  Globe
} from 'lucide-react';
import { LEARNING_STAGES } from '../../data/learningStages';
import { LEARNING_LANGUAGES } from '../../data/learningLanguages';

export default function WordMeaningResult({
  result,
  currentStage = 'young',
  currentLanguage = 'english',
  onStageChange,
  onLanguageChange,
  onSearchSuggestion
}) {
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  if (!result) return null;

  // If word not found
  if (result.notFound) {
    return (
      <div className="word-meaning-card space-y-3">
        <span className="text-2xl select-none">ℹ️</span>
        <div className="space-y-2 w-full">
          <h4 className="font-bold text-base m-0 text-slate-900 dark:text-white">Word Not Found</h4>
          <p className="body-base leading-relaxed m-0 text-slate-600 dark:text-[#D2DEEC]">{result.message}</p>

          {result.suggestion && (
            <div className="bg-slate-100 dark:bg-[#0C1B30] p-4 rounded-xl border border-slate-200 dark:border-[#183657] flex items-center justify-between gap-3 mt-3 shadow-xs">
              <span className="text-sm text-slate-700 dark:text-[#D2DEEC]">
                Did you mean: <strong className="text-slate-900 dark:text-white capitalize">{result.suggestion}</strong>?
              </span>
              <button
                onClick={() => onSearchSuggestion && onSearchSuggestion(result.suggestion)}
                className="btn-vibrant-primary py-1.5 px-3 text-xs"
              >
                View Meaning
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  const handleSpeak = () => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const textToSpeak = `${result.term}. ${result.simpleMeaning}. ${result.explanation || ''}`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 0.9;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const handleCopyCode = (code) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4 animate-in">
      {/* Word Header & Pronunciation */}
      <div className="word-meaning-card p-3 sm:p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap min-w-0">
            <span className="text-xl sm:text-2xl select-none shrink-0">📖</span>
            <h3 className="heading-card capitalize m-0 text-slate-900 dark:text-white truncate">
              {result.term}
            </h3>
            {result.category === 'python' ? (
              <span className="text-[11px] sm:text-xs font-bold text-[#168BFF] dark:text-[#8CC8FF] bg-blue-50 dark:bg-[#102541] border border-blue-200 dark:border-[#183657] px-2.5 py-0.5 rounded-full shrink-0">
                🐍 Python Term
              </span>
            ) : result.category === 'computer' ? (
              <span className="text-[11px] sm:text-xs font-bold text-[#168BFF] dark:text-[#8CC8FF] bg-blue-50 dark:bg-[#102541] border border-blue-200 dark:border-[#183657] px-2.5 py-0.5 rounded-full shrink-0">
                💻 Tech & Computing
              </span>
            ) : (
              <span className="text-[11px] sm:text-xs font-bold text-slate-600 dark:text-[#D2DEEC] bg-slate-100 dark:bg-[#102541] border border-slate-200 dark:border-[#183657] px-2.5 py-0.5 rounded-full shrink-0">
                📚 Vocabulary
              </span>
            )}
          </div>

          <button
            onClick={handleSpeak}
            className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition cursor-pointer border shrink-0 ${
              isSpeaking
                ? 'bg-blue-50 dark:bg-[#102B4A] text-[#168BFF] dark:text-[#8CC8FF] border-[#168BFF] font-extrabold shadow-xs'
                : 'bg-slate-100 dark:bg-[#102541] text-slate-700 dark:text-[#D2DEEC] border-slate-200 dark:border-[#183657] hover:border-[#168BFF] hover:text-[#168BFF] dark:hover:text-white'
            }`}
            title="Listen to pronunciation"
          >
            <Volume2 size={15} />
            <span>Pronounce</span>
          </button>
        </div>
      </div>

      {/* 1. Simple Meaning */}
      <div className="word-meaning-card flex items-start gap-3 border-l-4 border-l-[#168BFF]">
        <span className="text-2xl select-none">✨</span>
        <div>
          <h4 className="text-xs font-bold text-[#168BFF] uppercase tracking-wider mb-1">
            Simple Meaning
          </h4>
          <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed m-0">
            {result.simpleMeaning}
          </p>
        </div>
      </div>

      {/* 2. Explanation */}
      {result.explanation && (
        <div className="word-meaning-card">
          <h4 className="text-xs font-bold text-[#168BFF] uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Layers size={14} /> Detailed Explanation
          </h4>
          <p className="body-base text-slate-700 dark:text-[#D2DEEC] leading-relaxed font-normal whitespace-pre-line m-0">
            {result.explanation}
          </p>
        </div>
      )}

      {/* 3. Example */}
      {result.example && (
        <div className="word-meaning-card flex items-start gap-3">
          <span className="text-2xl select-none">💡</span>
          <div>
            <h4 className="text-xs font-bold text-[#168BFF] uppercase tracking-wider mb-1">
              Example Context
            </h4>
            <p className="body-base text-slate-700 dark:text-[#D2DEEC] leading-relaxed m-0">
              {result.example}
            </p>
          </div>
        </div>
      )}

      {/* 4. Python Example & How It Is Used */}
      {result.pythonExample && (
        <div className="rounded-2xl border border-slate-200 dark:border-[#183657] overflow-hidden bg-slate-900 dark:bg-[#040913]">
          <div className="px-4 py-2.5 bg-slate-800 dark:bg-[#07101F] border-b border-slate-700 dark:border-[#183657] flex items-center justify-between">
            <span className="text-xs font-bold text-blue-400 dark:text-[#8CC8FF] uppercase tracking-wider flex items-center gap-1.5 font-mono">
              <Code2 size={16} /> 🐍 Python Code
            </span>
            <button
              onClick={() => handleCopyCode(result.pythonExample)}
              className="text-xs bg-slate-700 dark:bg-[#102541] hover:bg-slate-600 dark:hover:bg-[#183657] text-slate-200 dark:text-[#D2DEEC] hover:text-white px-3 py-1 rounded-lg flex items-center gap-1.5 border border-slate-600 dark:border-[#183657] cursor-pointer transition font-semibold"
            >
              {copied ? (
                <>
                  <Check size={13} className="text-[#168BFF]" />
                  <span className="text-[#168BFF] font-bold">Copied</span>
                </>
              ) : (
                <>
                  <Copy size={13} />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          <div className="p-4 bg-slate-900 dark:bg-[#040913] text-blue-300 dark:text-[#8CC8FF] font-mono text-sm overflow-x-auto leading-relaxed border-b border-slate-800 dark:border-[#183657]">
            <pre className="m-0"><code>{result.pythonExample}</code></pre>
          </div>

          {result.howUsed && (
            <div className="p-4 bg-slate-50 dark:bg-[#081426] text-slate-700 dark:text-[#D2DEEC] border-t border-slate-200 dark:border-[#183657]">
              <span className="text-xs font-bold text-[#168BFF] uppercase tracking-wider block mb-1">
                How It Is Used:
              </span>
              <p className="body-base text-slate-700 dark:text-[#D2DEEC] leading-relaxed m-0">
                {result.howUsed}
              </p>
            </div>
          )}
        </div>
      )}

      {/* 5. Remember This */}
      {result.remember && (
        <div className="word-meaning-card flex items-start gap-3 border-l-4 border-l-[#2196FF]">
          <span className="text-2xl select-none">🧠</span>
          <div>
            <h4 className="text-xs font-bold text-[#168BFF] uppercase tracking-wider mb-1">
              Key Takeaway Rule
            </h4>
            <p className="body-base font-bold text-slate-900 dark:text-white leading-relaxed m-0">
              {result.remember}
            </p>
          </div>
        </div>
      )}

      {/* Interactive Switchers at bottom */}
      <div className="pt-3 border-t border-slate-200 dark:border-[#183657] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-slate-500 dark:text-[#91A6BF] text-xs font-bold uppercase">Stage:</span>
          {LEARNING_STAGES.map((st) => (
            <button
              key={st.id}
              onClick={() => onStageChange && onStageChange(st.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer border transition ${
                currentStage === st.id
                  ? 'bg-gradient-to-r from-[#168BFF] to-[#0876E8] text-white border-transparent shadow-xs'
                  : 'bg-slate-100 dark:bg-[#102541] text-slate-700 dark:text-[#D2DEEC] border-slate-200 dark:border-[#183657] hover:border-[#168BFF]'
              }`}
            >
              <span>{st.icon}</span> <span className="hidden sm:inline">{st.label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-slate-500 dark:text-[#91A6BF] text-xs font-bold uppercase">Lang:</span>
          {LEARNING_LANGUAGES.map((lg) => (
            <button
              key={lg.id}
              onClick={() => onLanguageChange && onLanguageChange(lg.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer border transition ${
                currentLanguage === lg.id
                  ? 'bg-gradient-to-r from-[#168BFF] to-[#0876E8] text-white border-transparent shadow-xs'
                  : 'bg-slate-100 dark:bg-[#102541] text-slate-700 dark:text-[#D2DEEC] border-slate-200 dark:border-[#183657] hover:border-[#168BFF]'
              }`}
            >
              <span>{lg.shortLabel}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
