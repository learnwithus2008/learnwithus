import React, { useState, useEffect } from "react";
import { AD_UNITS, isAdUnitEnabled, isAdPlacementAllowed } from "../../config/adConfig";
import { adScriptManager } from "../../services/adScriptManager";

/**
 * AbscloudMidContent
 * Component for SCRIPT 3: Mid-Content Ad Placement
 *
 * Exact Script URL:
 * <script data-cfasync="false" src="https://abscloud.org/1/8dd4f528a9dc426c7936891238d7bc3a"></script>
 *
 * Placement Requirements:
 * - Positioned between curriculum modules on the Learning Dashboard (Learn.jsx).
 * - NOT inside code examples, quizzes, exercises, or lesson text.
 * - Generous spacing around the ad (margin & padding).
 * - Full responsive layout (mobile, tablet, desktop).
 *
 * Timing / Refresh Specification:
 * - The script is an obfuscated singleton without any exposed client refresh API.
 * - Adsterra strictly prohibits simulating ad refresh via repeated script re-injection
 *   (triggers invalid traffic flags).
 * - Per requirements, loaded safely once and maintained statically.
 */
export default function AbscloudMidContent({ page = "learn", className = "" }) {
  const [, setTick] = useState(0);

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

  const isEnabled = isAdUnitEnabled("MID_CONTENT");
  const isAllowed = isAdPlacementAllowed({ page });
  const scriptUrl = AD_UNITS.MID_CONTENT.url;

  useEffect(() => {
    if (!isEnabled || !isAllowed) {
      adScriptManager.unloadScript({ url: scriptUrl, force: true });
      adScriptManager.cleanIntrusiveArtifacts();
      return;
    }

    let isMounted = true;

    adScriptManager
      .loadScript({
        url: scriptUrl,
        async: true,
        dataCfasync: false,
        scriptId: AD_UNITS.MID_CONTENT.scriptId
      })
      .then((success) => {
        if (!isMounted && success) {
          adScriptManager.unloadScript({ url: scriptUrl });
          adScriptManager.cleanIntrusiveArtifacts();
        }
      });

    return () => {
      isMounted = false;
      adScriptManager.unloadScript({ url: scriptUrl });
      adScriptManager.cleanIntrusiveArtifacts();
    };
  }, [isEnabled, isAllowed, page, scriptUrl]);

  if (!isEnabled || !isAllowed) {
    return null;
  }

  return (
    <div
      className={`abscloud-midcontent-container my-8 mx-auto w-full max-w-4xl px-2 sm:px-4 ${className}`}
      data-ad-unit="abscloud_mid_content"
    >
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 dark:border-[#1E3A5F] bg-white dark:bg-[#0c1b30] p-4 sm:p-6 shadow-xs transition-colors">
        {/* Ad disclosure header */}
        <div className="mb-3 flex items-center justify-between border-b border-slate-100 dark:border-[#1B3B66] pb-2 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-[#0756A5] dark:bg-[#FFB800]"></span>
            <span className="font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400 text-[10px]">
              Sponsored Learning Partner
            </span>
          </div>
          <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
            Advertisement
          </span>
        </div>

        {/* Content placement host */}
        <div
          id="abscloud-midcontent-host"
          className="flex min-h-[90px] w-full items-center justify-center text-center text-xs text-slate-400 dark:text-slate-500 overflow-hidden"
        >
          {/* Third ad script injects its dynamic elements here */}
        </div>
      </div>
    </div>
  );
}

