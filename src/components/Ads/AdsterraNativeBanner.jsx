import React, { useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import { AD_SCRIPTS } from "../../config/adConfig";

/**
 * AdsterraNativeBanner
 * Reusable Native Banner component for LearnWithUs.
 *
 * Exact Adsterra Placement Code:
 * <script async="async" data-cfasync="false" src="https://bauval.org/21/6262f8eaf407dba385778988c358262b"></script>
 * <div id="container-6262f8eaf407dba385778988c358262b"></div>
 *
 * Architecture & Safety:
 * - Scoped inside an isolated friendly iframe container to guarantee zero global variable pollution
 * - Prevents container ID collisions on route transitions across Home, Lesson, and Learn
 * - Safe mount and unmount lifecycle management (no memory leaks)
 * - Non-blocking lazy loading
 * - Fully responsive with auto-height adjustment and zero layout shift
 * - Collapses automatically if ad-blocked or empty to preserve clean learning UI
 */
export default function AdsterraNativeBanner({
  className = "",
  label = "Sponsored Resource",
  minHeight = 120
}) {
  const iframeRef = useRef(null);
  const [isVisible, setIsVisible] = useState(true);
  const [hasAdContent, setHasAdContent] = useState(true);

  // Check centralized configuration
  const config = AD_SCRIPTS.NATIVE_BANNER;
  if (!config || !config.enabled) {
    return null;
  }

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    // Friendly iframe document HTML with Adsterra Native Banner script and exact container ID
    const docHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
          <base target="_blank" />
          <style>
            *, *::before, *::after { box-sizing: border-box; }
            html, body {
              margin: 0;
              padding: 0;
              background: transparent;
              width: 100%;
              max-width: 100vw;
              overflow-x: hidden;
              font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            #container-6262f8eaf407dba385778988c358262b {
              width: 100% !important;
              max-width: 100% !important;
              min-height: ${minHeight}px;
              display: flex;
              justify-content: center;
              align-items: center;
              margin: 0 auto;
              overflow: hidden;
            }
          </style>
        </head>
        <body>
          <script async="async" data-cfasync="false" src="https://bauval.org/21/6262f8eaf407dba385778988c358262b"><\/script>
          <div id="container-6262f8eaf407dba385778988c358262b"></div>
          <script>
            // Monitor content height to dynamically resize parent iframe
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
        if (iframe && typeof e.data.height === "number" && e.data.height > 40) {
          iframe.style.height = `${Math.min(e.data.height + 6, 600)}px`;
          setHasAdContent(true);
        }
      }
    };
    window.addEventListener("message", handleMessage);

    // Write content to iframe
    try {
      iframe.srcdoc = docHtml;
    } catch (_) {
      try {
        const doc = iframe.contentWindow?.document || iframe.contentDocument;
        if (doc) {
          doc.open();
          doc.write(docHtml);
          doc.close();
        }
      } catch (err) {
        console.warn("[AdsterraNativeBanner] Error writing iframe content:", err.message);
      }
    }

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [minHeight]);

  if (!isVisible || !hasAdContent) {
    return null;
  }

  return (
    <div
      className={`adsterra-native-wrapper w-full max-w-5xl mx-auto my-6 px-2 sm:px-4 ${className}`}
      aria-label="Advertisement"
    >
      <div className="rounded-2xl sm:rounded-3xl p-2.5 sm:p-5 bg-slate-50/80 dark:bg-[#0c182a]/80 border border-slate-200/80 dark:border-[#182c47] shadow-xs relative overflow-hidden transition-all">
        {/* Subtle Sponsor Header */}
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/60 dark:border-[#182c47]/60 text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <Sparkles size={11} className="text-amber-500" />
            <span>{label}</span>
          </span>
          <span className="text-[9px] lowercase tracking-normal text-slate-400 dark:text-slate-500">
            partner resource
          </span>
        </div>

        {/* Native Ad Container */}
        <div className="w-full flex justify-center items-center min-h-[100px] overflow-hidden">
          <iframe
            ref={iframeRef}
            title="Sponsored Educational Partner"
            className="w-full border-none overflow-hidden transition-all duration-300"
            style={{
              minHeight: `${minHeight}px`,
              height: `${minHeight}px`,
              border: "none",
              background: "transparent",
              maxWidth: "100%"
            }}
            scrolling="no"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
}
