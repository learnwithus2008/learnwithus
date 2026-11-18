import React from "react";
import { Lock } from "lucide-react";

// Safe Python syntax highlighter
function highlightPython(code) {
  if (!code) return "";
  
  // Escape HTML
  const escaped = code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Regex patterns
  const tokenRegex = /(#[^\n]*)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(\b(?:def|class|if|elif|else|for|while|try|except|finally|with|as|import|from|return|yield|break|continue|pass|lambda|raise|in|is|not|and|or|global|nonlocal|async|await)\b)|(\b(?:True|False|None)\b)|(\b(?:print|len|range|int|str|float|list|dict|set|tuple|bool|type|open|input|sum|min|max|enumerate|zip|map|filter|sorted|isinstance|super|abs|round)\b)|(\b\d+(?:\.\d+)?\b)/g;

  return escaped.replace(tokenRegex, (match, comment, str, kw, boolConst, builtin, num) => {
    if (comment) return `<span class="code-token-comment">${comment}</span>`;
    if (str) return `<span class="code-token-string">${str}</span>`;
    if (kw) return `<span class="code-token-keyword">${kw}</span>`;
    if (boolConst) return `<span class="code-token-boolean">${boolConst}</span>`;
    if (builtin) return `<span class="code-token-builtin">${builtin}</span>`;
    if (num) return `<span class="code-token-number">${num}</span>`;
    return match;
  });
}

export default function CodeBlock({ code, language = "python", title }) {
  const highlightedHtml = highlightPython(code);

  const handleProtectedAction = (e) => {
    e.preventDefault();
    if (e.clipboardData) {
      e.clipboardData.setData("text/plain", "");
    }
  };

  return (
    <div
      className="code-block-container my-4 rounded-xl overflow-hidden shadow-md select-none"
      data-code-protected="true"
      onCopy={handleProtectedAction}
      onCut={(e) => e.preventDefault()}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onDragStart={(e) => e.preventDefault()}
    >
      <div className="code-block-header flex items-center justify-between px-4 py-2.5 select-none">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#102B50] inline-block border border-white/20"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#0756A5] inline-block"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFB800] inline-block"></span>
          </div>
          <span className="ml-2 font-semibold text-slate-200 text-xs font-mono">
            {title || language.toUpperCase()}
          </span>
        </div>
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#102B50] text-slate-300 text-xs border border-[#1E3A5F] select-none"
          title="Code copying is restricted"
        >
          <Lock size={12} className="text-[#FFB800]" />
          <span className="font-semibold text-[11px] tracking-wide text-slate-300">Protected</span>
        </div>
      </div>
      <div className="code-block-body p-4 overflow-x-auto font-mono text-sm leading-relaxed select-none">
        <pre className="m-0 font-mono select-none">
          <code dangerouslySetInnerHTML={{ __html: highlightedHtml }} className="select-none" />
        </pre>
      </div>
    </div>
  );
}

