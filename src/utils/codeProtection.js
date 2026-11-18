/**
 * codeProtection.js
 * Advanced Intellectual Property & Curriculum Protection Utility
 *
 * Implements strict restrictions preventing anyone from copying or extracting code:
 * 1. Disables direct clipboard copying of code snippets, solutions, and runner code.
 * 2. Blocks `copy` and `cut` events when selection intersects with code or pre/code elements.
 * 3. Disables right-click context menu across the website and on code blocks/pre/code.
 * 4. Prevents drag-and-drop extraction of code text.
 * 5. Intercepts developer shortcuts: View Source (Ctrl+U), Inspect/DevTools (F12, Ctrl+Shift+I/J/C), and Save Page (Ctrl+S).
 * 6. SILENT ENFORCEMENT: No intrusive warnings or toast alerts displayed to the user ("Dont give the warning here").
 */

let toastTimeout = null;
let toastElement = null;

/**
 * Checks whether an element or any of its ancestors is a protected code container.
 * @param {EventTarget|null} target
 * @returns {boolean}
 */
export function isCodeElement(target) {
  if (!target || !(target instanceof Element)) return false;
  return Boolean(
    target.closest(
      ".code-block-container, .code-block-body, pre, code, .live-python-runner, [data-code-protected='true'], .curriculum-code-snippet, .code-editor-box"
    )
  );
}

/**
 * Checks whether the current text selection intersects with protected code elements.
 * @returns {boolean}
 */
export function isSelectionInCode() {
  if (typeof window === "undefined") return false;
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return false;

  const range = selection.getRangeAt(0);
  const container = range.commonAncestorContainer;
  const element = container instanceof Element ? container : container.parentElement;

  return isCodeElement(element);
}

/**
 * Non-intrusive notification handler.
 * Per user instruction ("Dont give the warning here"), warnings are suppressed
 * and restrictions are enforced silently without displaying a toast alert.
 * @param {string} _message
 */
export function showCodeProtectionToast(_message) {
  // Silent enforcement: Do not display any warning toast on the user interface.
  if (typeof document !== "undefined") {
    const existing = document.getElementById("code-protection-toast");
    if (existing && existing.parentElement) {
      existing.parentElement.removeChild(existing);
    }
  }
}

/**
 * Initializes code protection listeners across the document.
 * Returns an unregister function for cleanup.
 */
export function initCodeProtection() {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return () => {};
  }

  // 1. Intercept clipboard 'copy' event silently
  const handleCopy = (e) => {
    const isTargetCode = isCodeElement(e.target);
    const isSelCode = isSelectionInCode();

    if (isTargetCode || isSelCode) {
      e.preventDefault();
      e.stopPropagation();
      if (e.clipboardData) {
        e.clipboardData.setData("text/plain", "");
      }
      // Silent block - no warning popup
    }
  };

  // 2. Intercept clipboard 'cut' event silently
  const handleCut = (e) => {
    if (isCodeElement(e.target) || isSelectionInCode()) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  // 3. Intercept Right-Click context menu globally across the entire website silently
  const handleContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Silent block - no warning popup
    return false;
  };

  // 4. Intercept drag-and-drop of code snippets silently
  const handleDragStart = (e) => {
    if (isCodeElement(e.target) || isSelectionInCode()) {
      e.preventDefault();
      return false;
    }
  };

  // 5. Intercept developer inspection & source-view keyboard shortcuts silently
  const handleKeyDown = (e) => {
    const isMac = typeof navigator !== "undefined" && navigator.platform && navigator.platform.toUpperCase().indexOf("MAC") >= 0;
    const modifierKey = isMac ? e.metaKey : e.ctrlKey;
    const key = e.key ? e.key.toUpperCase() : "";

    // Ctrl+U / Cmd+U / Cmd+Option+U: View Page Source (Silent Block)
    if ((modifierKey && key === "U") || (e.metaKey && e.altKey && key === "U")) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl+S / Cmd+S: Save Web Page (Silent Block)
    if (modifierKey && key === "S") {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // F12: Developer Tools (Silent Block)
    if (e.key === "F12") {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl+Shift+I / Cmd+Option+I: Inspect
    // Ctrl+Shift+J / Cmd+Option+J: Console
    // Ctrl+Shift+C / Cmd+Option+C: Inspect Element
    if (
      (modifierKey && e.shiftKey && (key === "I" || key === "J" || key === "C")) ||
      (e.metaKey && e.altKey && (key === "I" || key === "J" || key === "C"))
    ) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl+C / Cmd+C when selecting code (Silent Block)
    if (modifierKey && key === "C") {
      if (isCodeElement(e.target) || isSelectionInCode()) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    }
  };

  document.addEventListener("copy", handleCopy, true);
  document.addEventListener("cut", handleCut, true);
  document.addEventListener("contextmenu", handleContextMenu, true);
  window.addEventListener("contextmenu", handleContextMenu, true);
  document.addEventListener("dragstart", handleDragStart, true);
  window.addEventListener("keydown", handleKeyDown, true);

  return () => {
    document.removeEventListener("copy", handleCopy, true);
    document.removeEventListener("cut", handleCut, true);
    document.removeEventListener("contextmenu", handleContextMenu, true);
    window.removeEventListener("contextmenu", handleContextMenu, true);
    document.removeEventListener("dragstart", handleDragStart, true);
    window.removeEventListener("keydown", handleKeyDown, true);
  };
}

