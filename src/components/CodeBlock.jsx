import React, { useState } from "react";
import { Check, Copy } from "lucide-react";

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
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    let copiedSuccess = false;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(code);
        copiedSuccess = true;
      }
    } catch {
      copiedSuccess = false;
    }

    if (!copiedSuccess) {
      try {
        const ta = document.createElement("textarea");
        ta.value = code;
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

  const highlightedHtml = highlightPython(code);

  return (
    <div className="code-block-container my-4 rounded-xl overflow-hidden shadow-md">
      <div className="code-block-header flex items-center justify-between px-4 py-2.5">
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
        <button
          onClick={handleCopy}
          className="copy-btn flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#102B50] hover:bg-[#FFB800] hover:text-[#102B50] text-slate-200 transition text-xs cursor-pointer border border-[#1E3A5F] hover:border-[#FFB800]"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check size={13} className="text-[#16A34A]" />
              <span className="text-[#16A34A] font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={13} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <div className="code-block-body p-4 overflow-x-auto font-mono text-sm leading-relaxed">
        <pre className="m-0 font-mono">
          <code dangerouslySetInnerHTML={{ __html: highlightedHtml }} />
        </pre>
      </div>
    </div>
  );
}

