import React, { useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";

/**
 * AdsterraNativeBanner
 * Reusable Native Banner component for LearnWithUs.
 *
 * Adsterra Placement Code:
 * <script async="async" data-cfasync="false" src="https://bauval.org/21/6262f8eaf407dba385778988c358262b"></script>
 * <div id="container-6262f8eaf407dba385778988c358262b"></div>
 *
 * React & Cloudflare SPA Features:
 * - Scoped inside an isolated friendly iframe container to guarantee zero global pollution
 * - Prevents container ID collisions on route transitions across Home, Lesson, and Learn
 * - Safe mount and unmount lifecycle management (no memory leaks)
 * - Non-blocking lazy loading
 * - Fully responsive with auto-height adjustment and zero layout shift
 */
export default function AdsterraNativeBanner({
  className = "",
  label = "Sponsored Resource",
  minHeight = 140
}) {
  const iframeRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    // Friendly iframe document HTML with Adsterra Native Banner script and container
    const docHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <base target="_blank" />
          <style>
            *, *::before, *::after { box-sizing: border-box; }
            html, body {
              margin: 0;
              padding: 0;
              background: transparent;
              width: 100%;
              overflow: hidden;
              font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            #container-6262f8eaf407dba385778988c358262b {
              width: 100% !important;
              min-height: ${minHeight}px;
              display: flex;
              justify-content: center;
              align-items: center;
              margin: 0 auto;
            }
          </style>
        </head>
        <body>
          <script async="async" data-cfasync="false" src="https://bauval.org/21/6262f8eaf407dba385778988c358262b"><\/script>
          <div id="container-6262f8eaf407dba385778988c358262b"></div>
          <script>
            // Monitor content height to dynamically resize iframe
            function updateHeight() {
              const body = document.body;
              const html = document.documentElement;
              const h = Math.max(
                body.scrollHeight, body.offsetHeight,
                html.clientHeight, html.scrollHeight, html.offsetHeight
              );
              if (h > 40 && window.parent) {
                window.parent.postMessage({ type: 'ADSTERRA_NATIVE_RESIZE', height: h }, '*');
              }
            }
            window.addEventListener('load', updateHeight);
            setInterval(updateHeight, 1500);
          <\/script>
        </body>
      </html>
    `;

    // Listen for resize messages from child iframe
    const handleMessage = (e) => {
      if (e.data && e.data.type === "ADSTERRA_NATIVE_RESIZE" && e.data.height) {
        if (iframe && typeof e.data.height === "number" && e.data.height > 60) {
          iframe.style.height = `${Math.min(e.data.height + 10, 600)}px`;
        }
      }
    };
    window.addEventListener("message", handleMessage);

    // Write content to iframe
    try {
      iframe.srcdoc = docHtml;
      setIsLoaded(true);
    } catch (_) {
      // Fallback: document.write inside iframe if srcdoc is restricted
      try {
        const doc = iframe.contentWindow?.document || iframe.contentDocument;
        if (doc) {
          doc.open();
          doc.write(docHtml);
          doc.close();
          setIsLoaded(true);
        }
      } catch (err) {
        console.warn("Native Banner iframe initialization:", err.message);
      }
    }

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [minHeight]);

  return (
    <div
      className={`adsterra-native-wrapper w-full max-w-5xl mx-auto my-6 px-3 sm:px-4 ${className}`}
      aria-label="Advertisement"
    >
      <div className="rounded-2xl sm:rounded-3xl p-3 sm:p-5 bg-slate-50/80 dark:bg-[#0c182a]/80 border border-slate-200/80 dark:border-[#182c47] shadow-xs relative overflow-hidden transition-all">
        {/* Subtle Sponsor Header */}
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/60 dark:border-[#182c47]/60 text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <Sparkles size={11} className="text-amber-500" />
            <span>{label}</span>
          </span>
          <span className="text-[9px] lowercase tracking-normal text-slate-400 dark:text-slate-500">
            adsterra partner
          </span>
        </div>

        {/* Native Ad Container */}
        <div className="w-full flex justify-center items-center min-h-[120px] overflow-hidden">
          <iframe
            ref={iframeRef}
            title="Sponsored Educational Partner"
            className="w-full border-none overflow-hidden transition-all duration-300"
            style={{
              minHeight: `${minHeight}px`,
              height: `${minHeight}px`,
              border: "none",
              background: "transparent"
            }}
            scrolling="no"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
}

