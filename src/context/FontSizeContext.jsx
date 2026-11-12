import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export const FONT_SCALES = [
  { scale: 0.80, percent: 80, label: 'Small' },
  { scale: 0.90, percent: 90, label: 'Compact' },
  { scale: 1.00, percent: 100, label: 'Default' },
  { scale: 1.20, percent: 120, label: 'Medium' },
  { scale: 1.40, percent: 140, label: 'Large' },
  { scale: 1.60, percent: 160, label: 'Extra Large' },
  { scale: 1.80, percent: 180, label: 'Huge' }
];

export const DEFAULT_SCALE_INDEX = 2; // 100%

const FontSizeContext = createContext(null);

export function FontSizeProvider({ children }) {
  const [scaleIndex, setScaleIndex] = useState(() => {
    if (typeof window === 'undefined') return DEFAULT_SCALE_INDEX;
    try {
      const saved = localStorage.getItem('python_app_font_scale');
      if (saved) {
        const parsed = parseFloat(saved);
        const idx = FONT_SCALES.findIndex((s) => Math.abs(s.scale - parsed) < 0.03);
        if (idx !== -1) return idx;
      }
      return DEFAULT_SCALE_INDEX;
    } catch {
      return DEFAULT_SCALE_INDEX;
    }
  });

  const [isDarkerText, setIsDarkerText] = useState(() => {
    if (typeof window === 'undefined') return true;
    try {
      const saved = localStorage.getItem('python_app_darker_text');
      if (saved !== null) return saved === 'true';
      return true; // default to true for high-contrast darker text
    } catch {
      return true;
    }
  });

  const [isDarkInkMode, setIsDarkInkMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      const saved = localStorage.getItem('python_app_dark_ink');
      if (saved !== null) return saved === 'true';
      return false;
    } catch {
      return false;
    }
  });

  const currentScaleObj = FONT_SCALES[scaleIndex] || FONT_SCALES[DEFAULT_SCALE_INDEX];
  const fontScale = currentScaleObj.scale;
  const scalePercent = currentScaleObj.percent;
  const scaleLabel = currentScaleObj.label;

  // Apply font-size to root document element
  useEffect(() => {
    try {
      const basePx = 17; // Enhanced comfortable, readable typography baseline at 100%
      const pxValue = Math.round(basePx * fontScale * 10) / 10;
      document.documentElement.style.setProperty('--app-font-size', `${pxValue}px`);
      document.documentElement.style.setProperty('--app-font-scale', `${fontScale}`);
      document.documentElement.style.fontSize = `${pxValue}px`;
      document.documentElement.setAttribute('data-font-scale', fontScale >= 1.4 ? 'large' : fontScale >= 1.2 ? 'medium' : 'normal');
      localStorage.setItem('python_app_font_scale', fontScale.toString());
    } catch {
      // ignore
    }
  }, [fontScale]);

  // Apply darker text high-contrast class to root document element
  useEffect(() => {
    try {
      if (isDarkerText) {
        document.documentElement.classList.add('darker-text');
      } else {
        document.documentElement.classList.remove('darker-text');
      }
      localStorage.setItem('python_app_darker_text', isDarkerText.toString());
    } catch {
      // ignore
    }
  }, [isDarkerText]);

  // Apply dark ink mode class to root document element
  useEffect(() => {
    try {
      if (isDarkInkMode) {
        document.documentElement.classList.add('dark-ink-mode');
      } else {
        document.documentElement.classList.remove('dark-ink-mode');
      }
      localStorage.setItem('python_app_dark_ink', isDarkInkMode.toString());
    } catch {
      // ignore
    }
  }, [isDarkInkMode]);

  const increaseFontSize = useCallback(() => {
    setScaleIndex((prev) => Math.min(FONT_SCALES.length - 1, prev + 1));
  }, []);

  const decreaseFontSize = useCallback(() => {
    setScaleIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const resetFontSize = useCallback(() => {
    setScaleIndex(DEFAULT_SCALE_INDEX);
  }, []);

  const setFontSizeByPercent = useCallback((percent) => {
    const idx = FONT_SCALES.findIndex((s) => s.percent === percent);
    if (idx !== -1) {
      setScaleIndex(idx);
    }
  }, []);

  const toggleDarkerText = useCallback(() => {
    setIsDarkerText((prev) => !prev);
  }, []);

  const toggleDarkInkMode = useCallback(() => {
    setIsDarkInkMode((prev) => !prev);
  }, []);

  // Global Keyboard shortcuts: Alt + + / = to increase, Alt + - to decrease, Alt + 0 to reset
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target?.tagName) || e.target?.isContentEditable) {
        return;
      }

      if (e.altKey && (e.key === '=' || e.key === '+')) {
        e.preventDefault();
        increaseFontSize();
      } else if (e.altKey && (e.key === '-' || e.key === '_')) {
        e.preventDefault();
        decreaseFontSize();
      } else if (e.altKey && e.key === '0') {
        e.preventDefault();
        resetFontSize();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [increaseFontSize, decreaseFontSize, resetFontSize]);

  return (
    <FontSizeContext.Provider
      value={{
        fontScale,
        scalePercent,
        scaleLabel,
        fontScales: FONT_SCALES,
        canIncrease: scaleIndex < FONT_SCALES.length - 1,
        canDecrease: scaleIndex > 0,
        increaseFontSize,
        decreaseFontSize,
        resetFontSize,
        setFontSizeByPercent,
        isDarkerText,
        setIsDarkerText,
        toggleDarkerText,
        isDarkInkMode,
        setIsDarkInkMode,
        toggleDarkInkMode
      }}
    >
      {children}
    </FontSizeContext.Provider>
  );
}

export function useFontSize() {
  const context = useContext(FontSizeContext);
  if (!context) {
    return {
      fontScale: 1.0,
      scalePercent: 100,
      scaleLabel: 'Default',
      fontScales: FONT_SCALES,
      canIncrease: true,
      canDecrease: true,
      increaseFontSize: () => {},
      decreaseFontSize: () => {},
      resetFontSize: () => {},
      setFontSizeByPercent: () => {},
      isDarkerText: true,
      setIsDarkerText: () => {},
      toggleDarkerText: () => {},
      isDarkInkMode: false,
      setIsDarkInkMode: () => {},
      toggleDarkInkMode: () => {}
    };
  }
  return context;
}

