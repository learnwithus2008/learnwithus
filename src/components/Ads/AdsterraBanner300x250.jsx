import React, { useEffect, useRef } from "react";
import { Sparkles } from "lucide-react";

/**
 * AdsterraBanner300x250
 * Reusable 300x250 Display Advertisement component for LearnWithUs.
 *
 * Adsterra Placement Code:
 * <script type="text/javascript">
 *   atOptions = {
 *     'key' : '4efe467098fc10e387a7353b46f1deed',
 *     'format' : 'iframe',
 *     'height' : 250,
 *     'width' : 300,
 *     'params' : {}
 *   };
 * </script>
 * <script type="text/javascript" src="https://bauval.org/22/4efe467098fc10e387a7353b46f1deed"></script>
 *
 * React & Cloudflare SPA Features:
 * - Scoped inside an isolated friendly iframe container to prevent window.atOptions collisions
 * - Perfectly centered on mobile devices with zero horizontal overflow (max-w-[300px])
 * - Non-blocking lazy loading (loading="lazy")
 * - Handles route transitions and React re-renders cleanly
 * - Clean visual frame with subtle sponsored disclosure
 */
export default function AdsterraBanner300x250({
  className = "",
  label = "Sponsored",
  align = "center" // 'center' | 'left' | 'right'
}) {
  const iframeRef = useRef(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    // Friendly iframe document HTML with Adsterra 300x250 configuration and invoke script
    const docHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=300, initial-scale=1.0" />
          <base target="_blank" />
          <style>
            *, *::before, *::after { box-sizing: border-box; }
            html, body {
              margin: 0;
              padding: 0;
              width: 300px;
              height: 250px;
              overflow: hidden;
              background: transparent;
              display: flex;
              justify-content: center;
              align-items: center;
            }
          </style>
        </head>
        <body>
          <script type="text/javascript">
            atOptions = {
              'key' : '4efe467098fc10e387a7353b46f1deed',
              'format' : 'iframe',
              'height' : 250,
              'width' : 300,
              'params' : {}
            };
          <\/script>
          <script type="text/javascript" src="https://bauval.org/22/4efe467098fc10e387a7353b46f1deed"><\/script>
        </body>
      </html>
    `;

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
        console.warn("Banner 300x250 iframe initialization:", err.message);
      }
    }
  }, []);

  const alignmentClass =
    align === "left"
      ? "justify-start"
      : align === "right"
      ? "justify-end"
      : "justify-center";

  return (
    <div
      className={`adsterra-banner-wrapper my-6 flex ${alignmentClass} w-full overflow-hidden ${className}`}
      aria-label="Advertisement"
    >
      <div className="w-[300px] max-w-full rounded-2xl p-2.5 bg-slate-50/80 dark:bg-[#0c182a]/80 border border-slate-200/80 dark:border-[#182c47] shadow-xs flex flex-col items-center">
        {/* Subtle Sponsor Disclosure */}
        <div className="w-full flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-200/60 dark:border-[#182c47]/60 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          <span className="flex items-center gap-1">
            <Sparkles size={10} className="text-amber-500" />
            <span>{label}</span>
          </span>
          <span className="text-[9px] lowercase tracking-normal text-slate-400 dark:text-slate-500">
            300×250
          </span>
        </div>

        {/* 300x250 Ad Frame */}
        <div className="w-[300px] h-[250px] overflow-hidden flex justify-center items-center bg-slate-100/50 dark:bg-[#081426]/50 rounded-xl">
          <iframe
            ref={iframeRef}
            title="Sponsored Advertisement 300x250"
            width="300"
            height="250"
            className="w-[300px] h-[250px] border-none overflow-hidden"
            style={{
              width: "300px",
              height: "250px",
              border: "none",
              overflow: "hidden"
            }}
            scrolling="no"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
}

