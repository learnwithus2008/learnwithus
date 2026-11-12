import React from "react";
import { StickyNote } from "lucide-react";
import { useNotepad } from "../context/NotepadContext";

export default function FloatingNotepadButton() {
  const { toggleNotepad, isOpen, isMinimized } = useNotepad();

  // Hide button when floating notepad is already open and not minimized
  if (isOpen && !isMinimized) return null;

  return (
    <div id="tour-floating-notepad" className="floating-dock-notepad animate-in">
      <button
        onClick={toggleNotepad}
        className="flex items-center gap-2 sm:gap-2.5 p-2 sm:px-4 sm:py-2.5 bg-white/95 dark:bg-[#102B50]/95 hover:bg-white text-[#102B50] dark:text-white rounded-2xl shadow-lg hover:shadow-xl border border-[#E2E8F0] dark:border-[#1E3A5F] hover:border-[#FFB800] transition-all transform hover:-translate-y-0.5 cursor-pointer group backdrop-blur-md"
        title="Open Study Notepad to write important points (Alt+N)"
      >
        <div
          className="w-7 h-7 rounded-xl bg-[#0756A5] text-white flex items-center justify-center shadow-xs shrink-0 group-hover:bg-[#FFB800] group-hover:text-[#102B50] transition-colors"
          style={{ backgroundColor: "#0756A5", color: "#FFFFFF" }}
        >
          <StickyNote size={16} className="text-white group-hover:text-[#102B50] transition-colors" style={{ color: "#FFFFFF" }} />
        </div>
        <span className="font-bold text-xs sm:text-sm hidden sm:inline group-hover:text-[#FFB800]">Notepad</span>
        <span className="text-xs text-[#0756A5] dark:text-[#FFB800] font-mono font-bold border border-[#E2E8F0] dark:border-[#1E3A5F] px-1.5 py-0.5 rounded-lg bg-[#F3F7FC] dark:bg-[#0C1B30] hidden sm:inline">
          Alt+N
        </span>
      </button>
    </div>
  );
}
