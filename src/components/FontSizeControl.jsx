import React, { useState, useRef, useEffect } from "react";
import { useFontSize } from "../context/FontSizeContext";
import { RotateCcw, ChevronDown, Type } from "lucide-react";

export default function FontSizeControl({ variant = "navbar", className = "" }) {
  const {
    scalePercent,
    scaleLabel,
    fontScales,
    canIncrease,
    canDecrease,
    increaseFontSize,
    decreaseFontSize,
    resetFontSize,
    setFontSizeByPercent,
    isDarkerText,
    toggleDarkerText,
    isDarkInkMode,
    toggleDarkInkMode
  } = useFontSize();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  // =========================================================================
  // 1. Variant: Lesson Header Tag / Badge
  // =========================================================================
  if (variant === "badge") {
    return (
      <div
        className={`font-size-control-pill inline-flex items-center h-[1.875rem] px-1 rounded-xl select-none ${className}`}
        title="Adjust text size (Alt + / Alt -)"
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            decreaseFontSize();
          }}
          disabled={!canDecrease}
          className="font-size-btn-step h-6 px-1.5 flex items-center justify-center rounded-lg disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer font-bold text-xs border-none bg-transparent active:scale-95"
          title="Decrease font size (Alt + -)"
          aria-label="Decrease font size"
        >
          A-
        </button>

        <span className="font-size-divider w-[1px] h-3 my-auto mx-0.5" />

        <button
          onClick={(e) => {
            e.stopPropagation();
            resetFontSize();
          }}
          className="font-size-btn-value h-6 px-1.5 flex items-center justify-center rounded-lg text-xs font-bold transition cursor-pointer border-none bg-transparent"
          title="Current font size. Click to reset to 100% (Alt + 0)"
        >
          {scalePercent}%
        </button>

        <span className="font-size-divider w-[1px] h-3 my-auto mx-0.5" />

        <button
          onClick={(e) => {
            e.stopPropagation();
            increaseFontSize();
          }}
          disabled={!canIncrease}
          className="font-size-btn-step h-6 px-1.5 flex items-center justify-center rounded-lg disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer font-bold text-xs border-none bg-transparent active:scale-95"
          title="Increase font size (Alt + +)"
          aria-label="Increase font size"
        >
          A+
        </button>
      </div>
    );
  }

  // =========================================================================
  // 2. Variant: Mobile Compact Control
  // =========================================================================
  if (variant === "mobile") {
    return (
      <div className={`relative shrink-0 ${className}`} ref={menuRef}>
        <div className="font-size-control-pill flex items-center h-[32px] sm:h-[34px] px-1 rounded-xl select-none">
          <button
            onClick={decreaseFontSize}
            disabled={!canDecrease}
            className="font-size-btn-step hidden min-[360px]:flex h-6 sm:h-7 px-2 items-center justify-center rounded-lg disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer font-bold text-xs border-none bg-transparent active:scale-95"
            title="Decrease font size"
            aria-label="Decrease font size"
          >
            A-
          </button>

          <span className="font-size-divider hidden min-[360px]:block w-[1px] h-3.5 my-auto mx-0.5" />

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="font-size-btn-value h-6 sm:h-7 px-1.5 sm:px-2 flex items-center gap-0.5 sm:gap-1 rounded-lg text-xs font-bold transition cursor-pointer border-none bg-transparent"
            title="Font size options & presets"
            aria-expanded={menuOpen}
          >
            <span>{scalePercent}%</span>
            <ChevronDown
              size={11}
              className={`transition-transform duration-200 ${
                menuOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          <span className="font-size-divider hidden min-[360px]:block w-[1px] h-3.5 my-auto mx-0.5" />

          <button
            onClick={increaseFontSize}
            disabled={!canIncrease}
            className="font-size-btn-step hidden min-[360px]:flex h-6 sm:h-7 px-2 items-center justify-center rounded-lg disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer font-bold text-xs border-none bg-transparent active:scale-95"
            title="Increase font size"
            aria-label="Increase font size"
          >
            A+
          </button>
        </div>

        {menuOpen && (
          <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white dark:bg-[#102B50] border border-[#E2E8F0] dark:border-[#1E3A5F] shadow-2xl p-3 z-50 animate-in text-[#102B50] dark:text-white">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#E2E8F0] dark:border-[#1E3A5F]">
              <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-[#102B50] dark:text-white">
                <Type size={14} className="text-[#0756A5] dark:text-[#FFB800] shrink-0" strokeWidth={2.5} />
                <span>Text Size & Contrast</span>
              </div>
              <span className="text-xs font-bold text-[#0756A5] dark:text-[#FFB800] px-2 py-0.5 rounded-full bg-[#F3F7FC] dark:bg-[#1E3A5F] border border-[#E2E8F0] dark:border-[#1E3A5F]">
                {scalePercent}%
              </span>
            </div>

            {/* Presets grid: Solid Yellow when Active, Yellow on Hover */}
            <div className="grid grid-cols-4 gap-1.5 mb-2.5">
              {fontScales.map((s) => {
                const active = s.percent === scalePercent;
                return (
                  <button
                    key={s.percent}
                    onClick={() => setFontSizeByPercent(s.percent)}
                    className={`py-1.5 px-1 rounded-xl text-xs font-bold transition-all duration-150 border cursor-pointer select-none ${
                      active
                        ? "typography-preset-active bg-[#FFB800] text-[#102B50] border-[#FFB800] shadow-sm font-black"
                        : "bg-white dark:bg-[#0C1B30] text-[#102B50] dark:text-slate-200 border-[#E2E8F0] dark:border-[#1E3A5F] hover:bg-[#FFB800] hover:text-[#102B50] hover:border-[#FFB800] dark:hover:bg-[#FFB800] dark:hover:text-[#102B50] dark:hover:border-[#FFB800] active:scale-95"
                    }`}
                    style={{
                      backgroundColor: active ? "#FFB800" : undefined,
                      color: active ? "#102B50" : undefined,
                      borderColor: active ? "#FFB800" : undefined,
                      fontWeight: active ? 900 : 700
                    }}
                  >
                    <div className="truncate font-bold" style={{ color: active ? "#102B50" : undefined }}>
                      {s.percent}%
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Reset button: Turns to Yellow on Hover */}
            <button
              onClick={resetFontSize}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 mb-2 rounded-xl bg-[#F3F7FC] dark:bg-[#0C1B30] hover:bg-[#FFB800] hover:text-[#102B50] dark:hover:bg-[#FFB800] dark:hover:text-[#102B50] text-xs font-bold text-[#102B50] dark:text-slate-200 border border-[#E2E8F0] dark:border-[#1E3A5F] hover:border-[#FFB800] dark:hover:border-[#FFB800] cursor-pointer transition-all duration-150 active:scale-95"
            >
              <RotateCcw size={12} className="text-[#0756A5] dark:text-[#FFB800] shrink-0" strokeWidth={2.3} />
              <span>Reset to 100%</span>
            </button>

            {/* Darker Text & Dark Ink Mode Toggles */}
            <div className="pt-2 border-t border-[#E2E8F0] dark:border-[#1E3A5F] space-y-1">
              <button
                onClick={toggleDarkerText}
                className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-[#FFFBEB] dark:hover:bg-[#1E3A5F] hover:border-[#FFB800] cursor-pointer border border-transparent transition"
              >
                <div className="flex items-center gap-2 text-left">
                  <span className="text-base select-none">🖤</span>
                  <div>
                    <div className="text-xs font-bold text-[#102B50] dark:text-white">Darker Text</div>
                    <div className="text-[10px] text-[#64748B] dark:text-slate-400">High contrast dark text</div>
                  </div>
                </div>
                <div
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                    isDarkerText ? "bg-[#FFB800]" : "bg-slate-300 dark:bg-slate-700"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      isDarkerText ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </div>
              </button>

              <button
                onClick={toggleDarkInkMode}
                className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-[#FFFBEB] dark:hover:bg-[#1E3A5F] hover:border-[#FFB800] cursor-pointer border border-transparent transition"
              >
                <div className="flex items-center gap-2 text-left">
                  <span className="text-base select-none">📖</span>
                  <div>
                    <div className="text-xs font-bold text-[#102B50] dark:text-white">Paper Reading Mode</div>
                    <div className="text-[10px] text-[#64748B] dark:text-slate-400">Warm book paper with deep ink</div>
                  </div>
                </div>
                <div
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                    isDarkInkMode ? "bg-[#FFB800]" : "bg-slate-300 dark:bg-slate-700"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      isDarkInkMode ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // 3. Variant: Default Desktop Navbar Segmented Control
  // =========================================================================
  return (
    <div className={`relative shrink-0 ${className}`} ref={menuRef}>
      <div className="font-size-control-pill flex items-center h-[34px] sm:h-[36px] xl:h-[38px] px-1 rounded-xl select-none">
        {/* Decrease A- (Hidden on compact desktop 1024px-1419px to prevent navbar overflow) */}
        <button
          onClick={decreaseFontSize}
          disabled={!canDecrease}
          className="font-size-btn-step hidden min-[1420px]:flex h-7.5 sm:h-8 px-2 sm:px-2.5 items-center justify-center rounded-lg font-bold text-xs sm:text-sm border-none bg-transparent active:scale-95 shadow-none transition cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
          title="Decrease font size (Alt + -)"
          aria-label="Decrease font size"
        >
          A-
        </button>

        {/* Subtle Divider */}
        <span className="font-size-divider hidden min-[1420px]:block w-[1px] h-4 my-auto mx-0.5" />

        {/* Current Size Indicator & Popover Trigger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="font-size-btn-value h-7 sm:h-7.5 xl:h-8 px-1.5 sm:px-2 xl:px-2.5 flex items-center gap-1 rounded-lg text-xs sm:text-sm font-bold transition cursor-pointer border-none bg-transparent shadow-none"
          title="Font size presets & options (Alt + 0 to reset)"
          aria-expanded={menuOpen}
        >
          <Type size={13} className="text-[#0756A5] dark:text-[#FFB800] min-[1420px]:hidden shrink-0" strokeWidth={2.5} />
          <span>{scalePercent}%</span>
          <ChevronDown
            size={13}
            className={`transition-transform duration-200 ${
              menuOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Subtle Divider */}
        <span className="font-size-divider hidden min-[1420px]:block w-[1px] h-4 my-auto mx-0.5" />

        {/* Increase A+ (Hidden on compact desktop 1024px-1419px to prevent navbar overflow) */}
        <button
          onClick={increaseFontSize}
          disabled={!canIncrease}
          className="font-size-btn-step hidden min-[1420px]:flex h-7.5 sm:h-8 px-2 sm:px-2.5 items-center justify-center rounded-lg font-bold text-xs sm:text-sm border-none bg-transparent active:scale-95 shadow-none transition cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
          title="Increase font size (Alt + +)"
          aria-label="Increase font size"
        >
          A+
        </button>
      </div>

      {/* Popover Settings Dropdown Menu */}
      {menuOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white dark:bg-[#102B50] border border-[#E2E8F0] dark:border-[#1E3A5F] shadow-2xl p-3 z-50 animate-in text-[#102B50] dark:text-white">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#E2E8F0] dark:border-[#1E3A5F]">
            <div className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-[#102B50] dark:text-white">
              <Type size={14} className="text-[#0756A5] dark:text-[#FFB800] shrink-0" strokeWidth={2.5} />
              <span>Reading Typography</span>
            </div>
            <span className="text-xs font-bold text-[#0756A5] dark:text-[#FFB800] px-2.5 py-0.5 rounded-full bg-[#F3F7FC] dark:bg-[#1E3A5F] border border-[#E2E8F0] dark:border-[#1E3A5F]">
              {scaleLabel} ({scalePercent}%)
            </span>
          </div>

          <div className="text-[11px] text-[#64748B] dark:text-slate-400 mb-2">
            Select size or use <kbd className="px-1 py-0.5 rounded bg-[#F3F7FC] dark:bg-[#1E3A5F] text-[#102B50] dark:text-slate-200 font-mono text-[10px] border border-[#E2E8F0] dark:border-[#1E3A5F]">Alt +</kbd> / <kbd className="px-1 py-0.5 rounded bg-[#F3F7FC] dark:bg-[#1E3A5F] text-[#102B50] dark:text-slate-200 font-mono text-[10px] border border-[#E2E8F0] dark:border-[#1E3A5F]">Alt -</kbd>
          </div>

          {/* Quick Presets Grid: Solid Yellow when Active, Yellow on Hover */}
          <div className="grid grid-cols-4 gap-1.5 mb-2.5">
            {fontScales.map((s) => {
              const active = s.percent === scalePercent;
              return (
                <button
                  key={s.percent}
                  onClick={() => {
                    setFontSizeByPercent(s.percent);
                  }}
                  className={`py-1.5 px-1 rounded-xl text-xs font-bold transition-all duration-150 border cursor-pointer select-none ${
                    active
                      ? "typography-preset-active bg-[#FFB800] text-[#102B50] border-[#FFB800] shadow-sm font-black"
                      : "bg-white dark:bg-[#0C1B30] text-[#102B50] dark:text-slate-200 border-[#E2E8F0] dark:border-[#1E3A5F] hover:bg-[#FFB800] hover:text-[#102B50] hover:border-[#FFB800] dark:hover:bg-[#FFB800] dark:hover:text-[#102B50] dark:hover:border-[#FFB800] active:scale-95"
                  }`}
                  style={{
                    backgroundColor: active ? "#FFB800" : undefined,
                    color: active ? "#102B50" : undefined,
                    borderColor: active ? "#FFB800" : undefined,
                    fontWeight: active ? 900 : 700
                  }}
                  title={`Set to ${s.percent}% (${s.label})`}
                >
                  <div className="truncate font-bold" style={{ color: active ? "#102B50" : undefined }}>
                    {s.percent}%
                  </div>
                </button>
              );
            })}
          </div>

          {/* Reset Button: Turns to Yellow on Hover */}
          <button
            onClick={resetFontSize}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 mb-2 rounded-xl bg-[#F3F7FC] dark:bg-[#0C1B30] hover:bg-[#FFB800] hover:text-[#102B50] dark:hover:bg-[#FFB800] dark:hover:text-[#102B50] text-xs font-bold text-[#102B50] dark:text-slate-200 border border-[#E2E8F0] dark:border-[#1E3A5F] hover:border-[#FFB800] dark:hover:border-[#FFB800] cursor-pointer transition-all duration-150 active:scale-95"
          >
            <RotateCcw size={12} className="text-[#0756A5] dark:text-[#FFB800] shrink-0" strokeWidth={2.3} />
            <span>Reset to 100% Default</span>
          </button>

          {/* Darker Text & Dark Ink Mode Toggles */}
          <div className="pt-2 border-t border-[#E2E8F0] dark:border-[#1E3A5F] space-y-1">
            <button
              onClick={toggleDarkerText}
              className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-[#FFFBEB] dark:hover:bg-[#1E3A5F] hover:border-[#FFB800] cursor-pointer border border-transparent transition"
            >
              <div className="flex items-center gap-2 text-left">
                <span className="text-base select-none">🖤</span>
                <div>
                  <div className="text-xs font-bold text-[#102B50] dark:text-white">Darker Text</div>
                  <div className="text-[10px] text-[#64748B] dark:text-slate-400">High contrast dark text</div>
                </div>
              </div>
              <div
                className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                  isDarkerText ? "bg-[#FFB800]" : "bg-slate-300 dark:bg-slate-700"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    isDarkerText ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </div>
            </button>

            <button
              onClick={toggleDarkInkMode}
              className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-[#FFFBEB] dark:hover:bg-[#1E3A5F] hover:border-[#FFB800] cursor-pointer border border-transparent transition"
            >
              <div className="flex items-center gap-2 text-left">
                <span className="text-base select-none">📖</span>
                <div>
                  <div className="text-xs font-bold text-[#102B50] dark:text-white">Paper Reading Mode</div>
                  <div className="text-[10px] text-[#64748B] dark:text-slate-400">Warm book paper with deep ink</div>
                </div>
              </div>
              <div
                className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                  isDarkInkMode ? "bg-[#FFB800]" : "bg-slate-300 dark:bg-slate-700"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    isDarkInkMode ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
