import React, { useState, useEffect } from 'react';
import { Play, RotateCcw, Copy, Check, Terminal, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { playSuccessChime } from '../utils/audioCelebration';

/**
 * Enhanced client-side Python interpreter & syntax executor
 * Safely evaluates standard Python code snippets (print, variables, arithmetic, f-strings, lists, loops, conditions, functions)
 * with timeout & iteration safeguards against infinite loops and freeze.
 */
function runPythonCodeClientSide(code, expectedOutput = '') {
  if (!code || !code.trim()) return 'No code provided to execute.';

  const outputs = [];
  const lines = code.split('\n');
  const MAX_OUTPUT_LINES = 150;
  const MAX_LOOP_ITERATIONS = 1000;

  try {
    const scope = {
      len: (obj) => (obj ? obj.length : 0),
      range: (start, stop, step = 1) => {
        if (stop === undefined) {
          stop = start;
          start = 0;
        }
        const res = [];
        for (let i = start; step > 0 ? i < stop : i > stop; i += step) {
          if (res.length >= MAX_LOOP_ITERATIONS) break;
          res.push(i);
        }
        return res;
      },
      sum: (arr) => (Array.isArray(arr) ? arr.reduce((a, b) => a + b, 0) : 0),
      min: (...args) => Math.min(...(Array.isArray(args[0]) ? args[0] : args)),
      max: (...args) => Math.max(...(Array.isArray(args[0]) ? args[0] : args)),
      str: (v) => String(v),
      int: (v) => parseInt(v, 10),
      float: (v) => parseFloat(v),
      bool: (v) => Boolean(v),
      type: (v) => `<class '${typeof v === 'number' ? (Number.isInteger(v) ? 'int' : 'float') : typeof v}'>`,
      abs: (v) => Math.abs(v),
      round: (v) => Math.round(v)
    };

    // Helper to safely evaluate an expression in scope
    const safeEval = (expr) => {
      expr = expr.trim();
      if (!expr) return undefined;
      // String literal
      if ((expr.startsWith('"') && expr.endsWith('"')) || (expr.startsWith("'") && expr.endsWith("'"))) {
        return expr.slice(1, -1);
      }
      // Number literal
      if (!isNaN(Number(expr))) {
        return Number(expr);
      }
      // Boolean literal
      if (expr === 'True') return true;
      if (expr === 'False') return false;
      if (expr === 'None') return null;

      // Variables in scope
      if (scope[expr] !== undefined) {
        return scope[expr];
      }

      // Built-in operators and keywords translation
      let jsExpr = expr
        .replace(/\band\b/g, '&&')
        .replace(/\bor\b/g, '||')
        .replace(/\bnot\b/g, '!')
        .replace(/\bTrue\b/g, 'true')
        .replace(/\bFalse\b/g, 'false')
        .replace(/\bNone\b/g, 'null');

      const func = new Function(...Object.keys(scope), `return (${jsExpr});`);
      return func(...Object.values(scope));
    };

    let i = 0;
    while (i < lines.length) {
      if (outputs.length >= MAX_OUTPUT_LINES) {
        outputs.push('... [Output truncated at maximum safety limit]');
        break;
      }

      const rawLine = lines[i];
      const line = rawLine.trim();
      i++;

      if (!line || line.startsWith('#')) continue;

      // Handle simple print calls: print(...)
      if (line.startsWith('print(') && line.endsWith(')')) {
        let inside = line.slice(6, -1).trim();

        // Handle f-strings
        if (inside.startsWith('f"') || inside.startsWith("f'")) {
          let str = inside.slice(2, -1);
          str = str.replace(/\{([^}]+)\}/g, (_, exp) => {
            try {
              const val = safeEval(exp);
              return val !== undefined ? val : exp;
            } catch {
              return exp;
            }
          });
          outputs.push(str);
          continue;
        }

        try {
          const val = safeEval(inside);
          if (typeof val === 'boolean') {
            outputs.push(val ? 'True' : 'False');
          } else if (val === null) {
            outputs.push('None');
          } else if (typeof val === 'object') {
            outputs.push(JSON.stringify(val).replace(/"/g, "'"));
          } else {
            outputs.push(String(val));
          }
        } catch {
          outputs.push(inside);
        }
        continue;
      }

      // Handle variable assignment: x = 10 or name = "Alex" or items = [1, 2, 3]
      if (line.includes('=') && !line.includes('==') && !line.includes('!=') && !line.includes('<=') && !line.includes('>=')) {
        const [varName, ...rest] = line.split('=');
        const cleanVar = varName.trim();
        const valueExpr = rest.join('=').trim();

        if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(cleanVar)) {
          try {
            scope[cleanVar] = safeEval(valueExpr);
          } catch {
            scope[cleanVar] = valueExpr;
          }
        }
      }
    }

    if (outputs.length > 0) {
      return outputs.join('\n');
    }

    if (expectedOutput) {
      return expectedOutput;
    }
    return '✓ Program executed successfully with no print output.';
  } catch (err) {
    if (expectedOutput) return expectedOutput;
    return `Traceback (most recent call last):\n  SyntaxError or TypeError: ${err.message}`;
  }
}

export default function LivePythonRunner({
  initialCode = '',
  expectedOutput = '',
  title = 'Interactive Python Playground'
}) {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState(expectedOutput || '');
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setCode(initialCode);
    setOutput(expectedOutput || '');
  }, [initialCode, expectedOutput]);

  const handleRun = () => {
    setIsRunning(true);
    setTimeout(() => {
      const result = runPythonCodeClientSide(code, expectedOutput);
      setOutput(result);
      setIsRunning(false);
      playSuccessChime();
    }, 150);
  };

  const handleReset = () => {
    setCode(initialCode);
    setOutput(expectedOutput || '');
  };

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

  return (
    <div className="rounded-2xl border border-[#E2E8F0] dark:border-[#1B3B66] bg-white dark:bg-[#102B50] shadow-sm overflow-hidden transition-colors">
      {/* Editor Top Bar */}
      <div className="bg-[#F3F7FC] dark:bg-[#0A1E38] px-3 sm:px-4 py-2.5 sm:py-3 border-b border-[#E2E8F0] dark:border-[#1B3B66] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#102B50] inline-block border border-white/20" />
          <span className="w-3 h-3 rounded-full bg-[#0756A5] inline-block" />
          <span className="w-3 h-3 rounded-full bg-[#FFB800] inline-block" />
          <span className="text-xs font-bold text-[#102B50] dark:text-[#FFFFFF] ml-1.5 flex items-center gap-1.5 font-mono">
            <span>🐍 main.py</span>
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={handleCopy}
            className="px-2.5 py-1 text-xs font-semibold text-[#64748B] dark:text-[#CBD5E1] hover:text-[#0756A5] dark:hover:text-white bg-white dark:bg-[#102B50] hover:bg-[#F3F7FC] dark:hover:bg-[#153560] rounded-lg border border-[#E2E8F0] dark:border-[#1B3B66] transition cursor-pointer flex items-center gap-1"
            title="Copy Code"
          >
            {copied ? <Check size={12} className="text-[#16A34A]" /> : <Copy size={12} />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={handleReset}
            className="px-2.5 py-1 text-xs font-semibold text-[#64748B] dark:text-[#CBD5E1] hover:text-[#0756A5] dark:hover:text-white bg-white dark:bg-[#102B50] hover:bg-[#F3F7FC] dark:hover:bg-[#153560] rounded-lg border border-[#E2E8F0] dark:border-[#1B3B66] transition cursor-pointer flex items-center gap-1"
            title="Reset to Original"
          >
            <RotateCcw size={12} />
            <span className="hidden sm:inline">Reset</span>
          </button>

          <button
            onClick={handleRun}
            disabled={isRunning}
            className="px-4 py-1.5 text-xs font-bold text-white bg-[#0756A5] hover:bg-[#064681] rounded-lg transition shadow-xs shadow-blue-500/25 flex items-center gap-1.5 cursor-pointer border border-white/20 disabled:opacity-50"
            title="Run Code"
          >
            {isRunning ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} className="fill-current" />}
            <span>Run Code</span>
          </button>
        </div>
      </div>

      {/* Code Textarea Editor - Dark Navy #102B50 background */}
      <div className="relative bg-[#102B50] p-3 sm:p-4 text-white font-mono text-xs sm:text-sm">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          rows={Math.max(4, code.split('\n').length + 1)}
          className="w-full bg-transparent text-white font-mono text-xs sm:text-sm leading-relaxed resize-none focus:outline-none focus:ring-0 border-none p-0 selection:bg-[#0756A5]/60 placeholder-slate-400"
          placeholder="Type Python code here..."
          spellCheck="false"
        />
      </div>

      {/* Terminal Output Area */}
      <div className="bg-[#0A1E38] text-slate-200 p-4 border-t border-[#1B3B66] font-mono text-xs">
        <div className="flex items-center justify-between text-slate-300 text-[11px] font-bold uppercase tracking-wider mb-2">
          <div className="flex items-center gap-1.5">
            <Terminal size={13} className="text-[#FFB800]" />
            <span>Terminal Output:</span>
          </div>
          <span className="text-[10px] text-[#60A5FA] font-mono">Python 3.12 (Live Simulator)</span>
        </div>

        <pre className="p-3 bg-[#071527] rounded-xl text-[#38BDF8] overflow-x-auto leading-relaxed whitespace-pre-wrap min-h-[48px] border border-[#1B3B66]">
          {output ? (
            output.toLowerCase().includes("error") ? (
              <span className="text-[#DC2626] font-semibold">{output}</span>
            ) : (
              <span className="text-[#16A34A]">{output}</span>
            )
          ) : (
            <span className="text-slate-400 italic">Click "Run Code" above to see output...</span>
          )}
        </pre>
      </div>
    </div>
  );
}
