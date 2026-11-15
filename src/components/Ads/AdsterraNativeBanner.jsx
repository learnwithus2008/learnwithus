import React, { useState, useEffect, useRef } from "react";
import { AD_UNITS, isAdUnitEnabled, isAdPlacementAllowed } from "../../config/adConfig";
import { useTheme } from "../../context/ThemeContext";

/**
 * AdsterraNativeBanner
 * Component for SCRIPT 1: Native Banner Ad
 *
 * Exact Script & Container:
 * <script async="async" data-cfasync="false" src="https://bauval.org/21/6262f8eaf407dba385778988c358262b"></script>
 * <div id="container-6262f8eaf407dba385778988c358262b"></div>
 *
 * Placement:
 * - Homepage Sponsored Showcase section
 * - Isolated within a friendly iframe to ensure unique container ID, zero React virtual DOM conflict,
 *   clean teardown on unmount, and 0 horizontal overflow on mobile devices.
 * - Dynamic theme adaptation: in dark mode, ad titles, descriptions, and labels are enforced
 *   to crisp pure white (#FFFFFF) for high contrast and crystal-clear readability.
 */
export default function AdsterraNativeBanner({ page = "home", className = "" }) {
  const [iframeHeight, setIframeHeight] = useState(160);
  const [, setTick] = useState(0);
  const iframeRef = useRef(null);
  const { isDark } = useTheme();

  // Sync with global ad state changes & killswitch
  useEffect(() => {
    const handleStateChange = () => setTick((t) => t + 1);
    window.addEventListener("hashchange", handleStateChange);
    window.addEventListener("popstate", handleStateChange);
    window.addEventListener("lwu_ads_state_change", handleStateChange);
    return () => {
      window.removeEventListener("hashchange", handleStateChange);
      window.removeEventListener("popstate", handleStateChange);
      window.removeEventListener("lwu_ads_state_change", handleStateChange);
    };
  }, []);

  const isEnabled = isAdUnitEnabled("NATIVE_BANNER");
  const isAllowed = isAdPlacementAllowed({ page });

  // Listen for iframe resize messages if sent, or adjust height safely
  useEffect(() => {
    const handleMessage = (e) => {
      if (e.data && e.data.type === "adsterra_native_resize" && typeof e.data.height === "number") {
        setIframeHeight(Math.max(120, Math.min(e.data.height, 420)));
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  // Post dynamic theme updates to iframe when theme toggles
  useEffect(() => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage({ type: "update_theme", isDark }, "*");
      } catch (_) {}
    }
  }, [isDark]);

  if (!isEnabled || !isAllowed) {
    return null;
  }

  const iframeSrcDoc = `<!DOCTYPE html>
<html lang="en" class="${isDark ? "dark" : "light"}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      background: transparent;
      overflow-x: hidden;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    #container-6262f8eaf407dba385778988c358262b {
      width: 100%;
      min-height: 100px;
      display: flex;
      justify-content: center;
      align-items: center;
      overflow: hidden;
    }
    #container-6262f8eaf407dba385778988c358262b img {
      max-width: 100% !important;
      height: auto !important;
      border-radius: 8px !important;
    }

    /* ========================================================
       DARK THEME: PURE CRISP WHITE TEXT & HIGH CONTRAST (#FFFFFF)
       Guarantees 100% contrast against dark navy #0c1b30 card
       ======================================================== */
    body.dark,
    body.dark #container-6262f8eaf407dba385778988c358262b,
    body.dark #container-6262f8eaf407dba385778988c358262b * {
      color: #FFFFFF !important;
    }
    body.dark a,
    body.dark a *,
    body.dark span,
    body.dark p,
    body.dark div,
    body.dark font,
    body.dark b,
    body.dark strong,
    body.dark h1,
    body.dark h2,
    body.dark h3,
    body.dark h4,
    body.dark h5 {
      color: #FFFFFF !important;
      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.7) !important;
      font-weight: 600 !important;
    }
    body.dark a:hover,
    body.dark a:hover * {
      color: #FFB800 !important;
      text-decoration: underline !important;
    }

    /* ========================================================
       LIGHT THEME: CRISP DEEP NAVY TEXT (#102B50)
       ======================================================== */
    body.light,
    body.light #container-6262f8eaf407dba385778988c358262b,
    body.light #container-6262f8eaf407dba385778988c358262b * {
      color: #102B50 !important;
    }
    body.light a:hover,
    body.light a:hover * {
      color: #0756A5 !important;
    }
  </style>
</head>
<body class="${isDark ? "dark" : "light"}">
  <div id="container-6262f8eaf407dba385778988c358262b"></div>
  <script async="async" data-cfasync="false" src="https://bauval.org/21/6262f8eaf407dba385778988c358262b"></script>
  <script>
    function applyTextContrast(dark) {
      document.documentElement.className = dark ? 'dark' : 'light';
      document.body.className = dark ? 'dark' : 'light';
      try {
        var host = document.getElementById('container-6262f8eaf407dba385778988c358262b');
        if (!host) return;
        var nodes = host.querySelectorAll('*:not(img):not(svg):not(path)');
        for (var i = 0; i < nodes.length; i++) {
          nodes[i].style.setProperty('color', dark ? '#FFFFFF' : '#102B50', 'important');
          if (dark) {
            nodes[i].style.setProperty('text-shadow', '0 1px 2px rgba(0,0,0,0.6)', 'important');
          } else {
            nodes[i].style.removeProperty('text-shadow');
          }
        }
      } catch(e) {}
    }

    // Dynamic message listener for real-time theme toggles from parent
    window.addEventListener('message', function(e) {
      if (e.data && e.data.type === 'update_theme') {
        applyTextContrast(Boolean(e.data.isDark));
      }
    });

    // Continuous observer: enforces crisp readable text as ad nodes dynamically load
    try {
      var currentIsDark = ${isDark ? "true" : "false"};
      var mo = new MutationObserver(function() {
        applyTextContrast(currentIsDark);
      });
      var target = document.getElementById('container-6262f8eaf407dba385778988c358262b');
      if (target) {
        mo.observe(target, { childList: true, subtree: true });
      }

      // Resize observer to adapt parent iframe height seamlessly
      var ro = new ResizeObserver(function(entries) {
        for (var i = 0; i < entries.length; i++) {
          var h = entries[i].contentRect.height;
          if (h > 50) {
            window.parent.postMessage({ type: 'adsterra_native_resize', height: h + 20 }, '*');
          }
        }
      });
      if (target) ro.observe(target);
    } catch(e) {}
  </script>
</body>
</html>`;

  return (
    <div
      className={`adsterra-native-wrapper my-8 mx-auto w-full max-w-5xl px-4 sm:px-6 ${className}`}
      data-ad-unit="adsterra_native_banner"
    >
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0c1b30] p-4 sm:p-5 shadow-xs transition-all">
        {/* Ad disclosure header */}
        <div className="mb-3 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500"></span>
            <span className="font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400 text-[10px]">
              Sponsored Partner
            </span>
          </div>
          <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
            Advertisement
          </span>
        </div>

        {/* Responsive friendly iframe */}
        <div className="flex w-full justify-center overflow-hidden">
          <iframe
            ref={iframeRef}
            key={`adsterra-native-${isDark ? "dark" : "light"}`}
            title="Adsterra Native Sponsored Banner"
            srcDoc={iframeSrcDoc}
            className="w-full border-0 overflow-hidden"
            style={{
              height: `${iframeHeight}px`,
              minHeight: "100px",
              maxHeight: "420px",
              display: "block"
            }}
            loading="lazy"
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          />
        </div>
      </div>
    </div>
  );
}
