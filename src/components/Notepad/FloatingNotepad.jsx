import React, { useState, useEffect, useRef } from "react";
import {
  StickyNote,
  X,
  Minimize2,
  Maximize2,
  ChevronDown,
  ChevronUp,
  Save,
  Check,
  Copy,
  Download,
  Trash2,
  Sparkles,
  Bold,
  List,
  Code2,
  CheckSquare,
  BookOpen,
  FileText,
  Clock,
  ExternalLink
} from "lucide-react";
import { useNotepad } from "../../context/NotepadContext";

export default function FloatingNotepad() {
  const {
    isOpen,
    isMinimized,
    isExpanded,
    activeTab,
    currentTopicId,
    currentTopicTitle,
    defaultKeyPoints,
    closeNotepad,
    minimizeNotepad,
    restoreNotepad,
    toggleExpanded,
    setActiveTab
  } = useNotepad();

  // Storage keys for topic notes and global scratchpad
  const topicStorageKey = `py_notes_${currentTopicId || "general"}`;
  const scratchpadStorageKey = "py_scratchpad_notes";
  const activeStorageKey = activeTab === "topic" ? topicStorageKey : scratchpadStorageKey;

  const [noteContent, setNoteContent] = useState("");
  const [saveStatus, setSaveStatus] = useState("saved"); // 'saved' | 'saving'
  const [copied, setCopied] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState(null);
  const saveTimeoutRef = useRef(null);
  const textareaRef = useRef(null);

  // Load content whenever active storage key changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(activeStorageKey);
      if (saved !== null) {
        setNoteContent(saved);
      } else {
        setNoteContent("");
      }
      setSaveStatus("saved");
    } catch {
      setNoteContent("");
    }
  }, [activeStorageKey]);

  // Sync with cross-component note changes (e.g. TopicNotes) in real time
  useEffect(() => {
    const handleSync = (e) => {
      if (e.detail?.key === activeStorageKey && e.detail.val !== noteContent) {
        setNoteContent(e.detail.val);
        setSaveStatus("saved");
      }
    };
    window.addEventListener("py_notes_updated", handleSync);
    return () => window.removeEventListener("py_notes_updated", handleSync);
  }, [activeStorageKey, noteContent]);

  // Debounced auto-save
  const handleContentChange = (e) => {
    const val = e.target.value;
    setNoteContent(val);
    setSaveStatus("saving");

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem(activeStorageKey, val);
        window.dispatchEvent(
          new CustomEvent("py_notes_updated", {
            detail: { key: activeStorageKey, val }
          })
        );
        setSaveStatus("saved");
        setLastSavedTime(
          new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        );
      } catch {
        setSaveStatus("saved");
      }
    }, 500);
  };

  // Insert markdown snippets at cursor position
  const handleInsertSnippet = (type) => {
    let snippet = "";
    if (type === "bullet") snippet = "• ";
    if (type === "todo") snippet = "- [ ] ";
    if (type === "code") snippet = "```python\n# Code snippet\n\n```\n";
    if (type === "bold") snippet = "**Important**: ";

    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart || 0;
      const end = textareaRef.current.selectionEnd || 0;
      const before = noteContent.substring(0, start);
      const after = noteContent.substring(end);
      const updated = before + snippet + after;
      setNoteContent(updated);
      localStorage.setItem(activeStorageKey, updated);
      setSaveStatus("saved");
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(
            start + snippet.length,
            start + snippet.length
          );
        }
      }, 50);
    } else {
      const updated = noteContent + "\n" + snippet;
      setNoteContent(updated);
      localStorage.setItem(activeStorageKey, updated);
      setSaveStatus("saved");
    }
  };

  // Insert structured note template
  const handleInsertTemplate = () => {
    const title = activeTab === "topic" ? currentTopicTitle : "Python Concepts";
    const template = `📌 **${title} — Key Takeaways**:\n• Core Concept: \n• Important Syntax: \n• Real-World Use Case: \n• Watch Out For (Pitfalls): \n`;
    const updated = noteContent ? `${noteContent}\n\n${template}` : template;
    setNoteContent(updated);
    localStorage.setItem(activeStorageKey, updated);
    setSaveStatus("saved");
    setLastSavedTime(
      new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  // Insert key point from lesson
  const handleInsertKeyPoint = (point) => {
    const addition = `• ${point}\n`;
    const updated = noteContent ? `${noteContent}\n${addition}` : addition;
    setNoteContent(updated);
    localStorage.setItem(activeStorageKey, updated);
    setSaveStatus("saved");
  };

  // Copy notes to clipboard
  const handleCopyNotes = async () => {
    if (!noteContent) return;
    let copiedSuccess = false;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(noteContent);
        copiedSuccess = true;
      }
    } catch {
      copiedSuccess = false;
    }

    if (!copiedSuccess) {
      try {
        const ta = document.createElement("textarea");
        ta.value = noteContent;
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        ta.style.top = "-9999px";
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        copiedSuccess = document.execCommand("copy");
        document.body.removeChild(ta);
      } catch {
        copiedSuccess = false;
      }
    }

    if (copiedSuccess) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Download notes as markdown file
  const handleDownloadNotes = () => {
    if (!noteContent) return;
    try {
      const filename =
        activeTab === "topic"
          ? `python-${currentTopicId || "topic"}-notes.md`
          : "python-scratchpad-notes.md";
      const blob = new Blob([noteContent], { type: "text/markdown;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (err) {
      console.error("Failed to download note:", err);
    }
  };

  // Clear notes with confirmation
  const handleClearNotes = () => {
    if (!noteContent) return;
    const confirmText =
      activeTab === "topic"
        ? `Are you sure you want to clear your notes for "${currentTopicTitle}"?`
        : "Are you sure you want to clear your global scratchpad notes?";
    if (window.confirm(confirmText)) {
      setNoteContent("");
      try {
        localStorage.removeItem(activeStorageKey);
        window.dispatchEvent(
          new CustomEvent("py_notes_updated", {
            detail: { key: activeStorageKey, val: "" }
          })
        );
      } catch {
        // ignore
      }
      setSaveStatus("saved");
    }
  };

  if (!isOpen) return null;

  // -------------------------------------------------------------
  // MINIMIZED MODE: Sleek floating chip
  // -------------------------------------------------------------
  if (isMinimized) {
    return (
      <div className="floating-dock-notepad animate-in">
        <div className="flex items-center gap-2 p-1.5 pl-3 rounded-2xl bg-white dark:bg-[#102B50] text-[#102B50] dark:text-white shadow-xl hover:shadow-2xl transition cursor-pointer border border-[#E2E8F0] dark:border-[#1E3A5F] hover:border-[#FFB800]">
          <div
            onClick={restoreNotepad}
            className="flex items-center gap-2 text-xs font-bold select-none pr-1"
          >
            <StickyNote size={16} className="text-[#0756A5] dark:text-[#FFB800] shrink-0" />
            <span className="truncate max-w-[140px] sm:max-w-[200px]">
              {activeTab === "topic"
                ? `Notes: ${currentTopicTitle}`
                : "Python Scratchpad"}
            </span>
            {noteContent.trim() && (
              <span className="w-2 h-2 rounded-full bg-[#FFB800] animate-pulse shrink-0" />
            )}
          </div>
          <button
            onClick={restoreNotepad}
            className="notepad-action-btn"
            title="Expand Notepad"
            aria-label="Expand notepad"
          >
            <ChevronUp size={14} strokeWidth={2.5} />
          </button>
          <button
            onClick={closeNotepad}
            className="notepad-action-btn btn-close"
            title="Close Notepad"
            aria-label="Close notepad"
          >
            <X size={14} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // EXPANDED / DOCKED NOTEPAD WIDGET
  // -------------------------------------------------------------
  return (
    <div
      className={`floating-notepad-window animate-in ${isExpanded ? "is-expanded" : ""}`}
    >
      {/* ============================================================ */}
      {/* 1. NOTEPAD HEADER WITH TABS & CONTROLS */}
      {/* ============================================================ */}
      <div className="bg-[#F3F7FC] dark:bg-[#102B50] text-[#102B50] dark:text-white px-3 sm:px-4 py-2.5 sm:py-3 shrink-0 flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#1E3A5F]">
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-xl bg-white dark:bg-[#0C1B30] border border-[#E2E8F0] dark:border-[#1E3A5F] text-[#0756A5] dark:text-[#FFB800] flex items-center justify-center shrink-0">
            <StickyNote size={15} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs sm:text-sm font-extrabold leading-tight tracking-tight truncate max-w-[150px] xs:max-w-[200px] sm:max-w-none text-[#102B50] dark:text-white">
                Python Study Notepad
              </h3>
              <span className="text-[10px] text-[#0756A5] dark:text-[#FFB800] font-mono font-bold border border-[#E2E8F0] dark:border-[#1E3A5F] px-1.5 py-0.2 rounded bg-white dark:bg-[#0C1B30] hidden sm:inline-block">
                Alt+N
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-[#64748B] dark:text-slate-400 truncate font-medium mt-0.5">
              {activeTab === "topic"
                ? `Topic: ${currentTopicTitle}`
                : "Global Learning Scratchpad"}
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-1.5 shrink-0 ml-1.5">
          {saveStatus === "saving" ? (
            <span className="text-[10px] font-bold text-blue-600 dark:text-[#60a5fa] px-1.5 sm:px-2 py-0.5 rounded-md bg-blue-50 dark:bg-[#14233a] border border-blue-200 dark:border-[#23344d] animate-pulse font-mono">
              Saving...
            </span>
          ) : lastSavedTime ? (
            <span className="hidden sm:inline-block text-[10px] text-slate-500 dark:text-[#94a3b8] mr-1 font-mono">
              Saved {lastSavedTime}
            </span>
          ) : null}

          {/* Minimize into bottom chip */}
          <button
            onClick={minimizeNotepad}
            className="notepad-action-btn"
            title="Minimize to floating pill"
            aria-label="Minimize notepad"
          >
            <ChevronDown size={14} strokeWidth={2.5} />
          </button>

          {/* Expand / Collapse Width */}
          <button
            onClick={toggleExpanded}
            className="notepad-action-btn btn-expand"
            title={isExpanded ? "Standard width" : "Expand width"}
            aria-label={isExpanded ? "Standard width" : "Expand width"}
          >
            {isExpanded ? (
              <Minimize2 size={13} strokeWidth={2.5} />
            ) : (
              <Maximize2 size={13} strokeWidth={2.5} />
            )}
          </button>

          {/* Close */}
          <button
            onClick={closeNotepad}
            className="notepad-action-btn btn-close"
            title="Close Notepad"
            aria-label="Close notepad"
          >
            <X size={14} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. TAB SWITCHER (Topic Notes vs General Scratchpad) */}
      {/* ============================================================ */}
      <div className="flex bg-[#F3F7FC] dark:bg-[#0C1B30] p-1 sm:p-1.5 border-b border-[#E2E8F0] dark:border-[#1E3A5F] shrink-0 gap-1 sm:gap-1.5">
        <button
          onClick={() => setActiveTab("topic")}
          className={`flex-1 py-1.5 px-2 sm:px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer border ${
            activeTab === "topic"
              ? "bg-white dark:bg-[#102B50] text-[#102B50] dark:text-white shadow-xs border-[#0756A5]"
              : "text-[#64748B] dark:text-slate-400 hover:text-[#102B50] dark:hover:text-white bg-transparent border-transparent"
          }`}
        >
          <BookOpen size={13} className="shrink-0 text-[#0756A5] dark:text-[#FFB800]" />
          <span className="truncate">This Lesson Notes</span>
          {activeTab !== "topic" && (
            <span className="text-[10px] text-[#0756A5] dark:text-[#FFB800] font-mono shrink-0">
              •
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("scratchpad")}
          className={`flex-1 py-1.5 px-2 sm:px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer border ${
            activeTab === "scratchpad"
              ? "bg-white dark:bg-[#102B50] text-[#102B50] dark:text-white shadow-xs border-[#0756A5]"
              : "text-[#64748B] dark:text-slate-400 hover:text-[#102B50] dark:hover:text-white bg-transparent border-transparent"
          }`}
        >
          <FileText size={13} className="shrink-0 text-[#0756A5] dark:text-[#FFB800]" />
          <span className="truncate">General Scratchpad</span>
        </button>
      </div>

      {/* ============================================================ */}
      {/* 3. FORMATTING TOOLBAR (Responsive 1-line flex layout) */}
      {/* ============================================================ */}
      <div className="px-2.5 sm:px-3 py-1.5 sm:py-2 bg-[#F3F7FC] dark:bg-[#0C1B30] border-b border-[#E2E8F0] dark:border-[#1E3A5F] flex items-center justify-between gap-1 shrink-0">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5 min-w-0">
          <button
            onClick={() => handleInsertSnippet("bullet")}
            className="px-2 py-1 rounded-lg bg-white dark:bg-[#102B50] border border-[#E2E8F0] dark:border-[#1E3A5F] hover:border-[#FFB800] hover:bg-[#FFB800] text-[#102B50] hover:text-[#102B50] dark:text-white dark:hover:text-[#102B50] text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition shadow-2xs shrink-0"
            title="Add Bullet Point"
          >
            <List size={12} className="shrink-0 text-[#0756A5]" />
            <span className="hidden sm:inline">Bullet</span>
          </button>

          <button
            onClick={() => handleInsertSnippet("bold")}
            className="px-2 py-1 rounded-lg bg-white dark:bg-[#102B50] border border-[#E2E8F0] dark:border-[#1E3A5F] hover:border-[#FFB800] hover:bg-[#FFB800] text-[#102B50] hover:text-[#102B50] dark:text-white dark:hover:text-[#102B50] text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition shadow-2xs shrink-0"
            title="Add Bold Highlight"
          >
            <Bold size={12} className="shrink-0 text-[#0756A5]" />
            <span className="hidden sm:inline">Bold</span>
          </button>

          <button
            onClick={() => handleInsertSnippet("code")}
            className="px-2 py-1 rounded-lg bg-white dark:bg-[#102B50] border border-[#E2E8F0] dark:border-[#1E3A5F] hover:border-[#FFB800] hover:bg-[#FFB800] text-[#102B50] hover:text-[#102B50] dark:text-white dark:hover:text-[#102B50] text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition shadow-2xs shrink-0"
            title="Add Python Code Block"
          >
            <Code2 size={12} className="shrink-0 text-[#0756A5]" />
            <span className="hidden sm:inline">Code</span>
          </button>

          <button
            onClick={() => handleInsertSnippet("todo")}
            className="px-2 py-1 rounded-lg bg-white dark:bg-[#102B50] border border-[#E2E8F0] dark:border-[#1E3A5F] hover:border-[#FFB800] hover:bg-[#FFB800] text-[#102B50] hover:text-[#102B50] dark:text-white dark:hover:text-[#102B50] text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition shadow-2xs shrink-0"
            title="Add Checklist Item"
          >
            <CheckSquare size={12} className="shrink-0 text-[#0756A5]" />
            <span className="hidden sm:inline">Checklist</span>
          </button>

          <button
            onClick={handleInsertTemplate}
            className="px-2 py-1 rounded-lg bg-white dark:bg-[#102B50] hover:bg-[#FFB800] text-[#0756A5] hover:text-[#102B50] dark:text-[#FFB800] dark:hover:text-[#102B50] border border-[#E2E8F0] dark:border-[#1E3A5F] hover:border-[#FFB800] text-[11px] font-bold flex items-center gap-1 cursor-pointer transition shadow-2xs shrink-0"
            title="Insert Structured Study Template"
          >
            <Sparkles size={12} className="shrink-0 text-[#FFB800]" />
            <span className="hidden sm:inline">Template</span>
          </button>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-0.5 shrink-0 pl-1 border-l border-slate-200 dark:border-[#23344d]">
          <button
            onClick={handleCopyNotes}
            disabled={!noteContent.trim()}
            className="p-1.5 text-slate-500 hover:text-[#168BFF] dark:text-[#94a3b8] dark:hover:text-white rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer bg-transparent border-none shrink-0"
            title="Copy notes to clipboard"
          >
            {copied ? <Check size={14} className="text-[#168BFF]" /> : <Copy size={14} />}
          </button>

          <button
            onClick={handleDownloadNotes}
            disabled={!noteContent.trim()}
            className="p-1.5 text-slate-500 hover:text-[#168BFF] dark:text-[#94a3b8] dark:hover:text-white rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer bg-transparent border-none shrink-0"
            title="Download Notes as Markdown (.md)"
          >
            <Download size={14} />
          </button>

          <button
            onClick={handleClearNotes}
            disabled={!noteContent.trim()}
            className="p-1.5 text-slate-500 hover:text-red-500 dark:text-[#94a3b8] dark:hover:text-white rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer bg-transparent border-none shrink-0"
            title="Clear current notes"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4. NOTE WRITING AREA */}
      {/* ============================================================ */}
      <div className="flex-1 p-3 flex flex-col min-h-0 bg-white dark:bg-[#0c1422]">
        <textarea
          ref={textareaRef}
          value={noteContent}
          onChange={handleContentChange}
          placeholder={
            activeTab === "topic"
              ? `Write your key points, formulas, and reminders for "${currentTopicTitle}" here...\n\nExample:\n• Concept: print() displays output to stdout\n• Pitfall: Python is case-sensitive (Variable != variable)\n• Shortcut: Alt+N to open or close this notepad anytime`
              : "General Python Scratchpad...\n• Jot down interview tips, quick syntax reminders, library references, or thoughts while learning."
          }
          className="floating-notepad-textarea w-full flex-1 p-3 rounded-2xl bg-slate-50 dark:bg-[#101b2d] border border-slate-200 dark:border-[#23344d] text-slate-900 dark:text-[#f8fafc] text-xs sm:text-sm font-mono leading-relaxed focus:outline-hidden focus:ring-2 focus:ring-[#168BFF]/40 focus:border-[#168BFF] placeholder-slate-400 dark:placeholder-[#94a3b8] transition resize-none scrollbar-thin"
        />
      </div>

      {/* ============================================================ */}
      {/* 5. QUICK INSERT KEY POINTS (Topic Mode) */}
      {/* ============================================================ */}
      {activeTab === "topic" && defaultKeyPoints && defaultKeyPoints.length > 0 && (
        <div className="px-3 py-2 bg-slate-50 dark:bg-[#0c1422] border-t border-slate-200 dark:border-[#23344d] shrink-0">
          <span className="text-[10px] font-bold text-slate-500 dark:text-[#94a3b8] block mb-1">
            💡 Click to append key points from this lesson:
          </span>
          <div className="flex flex-wrap gap-1.5 max-h-16 overflow-y-auto scrollbar-thin">
            {defaultKeyPoints.slice(0, 4).map((pt, idx) => (
              <button
                key={idx}
                onClick={() => handleInsertKeyPoint(pt)}
                className="text-[10px] px-2 py-0.5 bg-white hover:bg-slate-100 dark:bg-[#14233a] dark:hover:bg-[#1e3252] text-blue-600 dark:text-[#93c5fd] rounded-md border border-slate-200 dark:border-[#23344d] transition cursor-pointer text-left shadow-2xs truncate max-w-[200px]"
                title={`Add: "${pt}"`}
              >
                + {pt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 6. FOOTER STATUS BAR */}
      {/* ============================================================ */}
      <div className="px-3.5 py-1.5 bg-[#F3F7FC] dark:bg-[#102B50] border-t border-[#E2E8F0] dark:border-[#1E3A5F] flex items-center justify-between text-[10px] text-[#64748B] dark:text-slate-400 shrink-0">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0756A5]" />
          <span>Auto-saved in browser</span>
        </span>
        <div className="flex items-center gap-3">
          <span>{noteContent.trim() ? noteContent.trim().split(/\s+/).length : 0} words</span>
          <span>{noteContent.length} chars</span>
        </div>
      </div>
    </div>
  );
}
