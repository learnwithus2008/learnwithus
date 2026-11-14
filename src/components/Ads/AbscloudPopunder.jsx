import React, { useEffect } from "react";
import { AD_SCRIPTS, isRouteAdRestricted } from "../../config/adConfig";
import { adScriptManager } from "../../services/adScriptManager";

/**
 * AbscloudPopunder
 * Controller component for Advertisement 3: Abscloud Script
 * Exact Script URL: https://abscloud.org/1/8dd4f528a9dc426c7936891238d7bc3a
 *
 * Identified Format: Adsterra OnClick Popunder / Full-Page Transparent Overlay
 *
 * Policy & Safety Rules:
 * - Disabled by default per LearnWithUs Educational Policy:
 *   "If either additional script produces popunders or intrusive advertising, do not enable it on LearnWithUs."
 * - When inspected, this script creates a full-viewport transparent layer (transpLayerId / pu_click)
 *   that intercepts clicks to spawn background popunder windows and takes over back navigation.
 * - If enabled in config for verification/auditing, it is strictly suppressed on:
 *   - Active Quizzes (currentStep === 'practice')
 *   - Code Practice / Playground (currentStep === 'code')
 *   - Login / Registration ('signin', 'signup')
 *   - Certificate Request & Verification ('verify-certificate')
 * - Full unmount cleanup guarantees all transparent click layers are immediately stripped.
 */
export default function AbscloudPopunder({ page, currentStep, isModalOpen }) {
  const config = AD_SCRIPTS.ABSCLOUD_POPUNDER;

  // Check centralized toggle
  const isEnabled = Boolean(config && config.enabled);
  const isRestricted = isRouteAdRestricted({ page, currentStep, isModalOpen });

  useEffect(() => {
    // If disabled by policy or restricted on the active screen, strip any layer
    if (!isEnabled || isRestricted) {
      adScriptManager.cleanIntrusiveArtifacts();
      return;
    }

    let isMounted = true;

    // Load script via deduplicating singleton manager
    adScriptManager.loadScript({
      url: config.url,
      async: true,
      dataCfasync: false,
      scriptId: "abscloud-popunder-script"
    }).then((loaded) => {
      if (!isMounted && loaded) {
        adScriptManager.unloadScript({ url: config.url });
        adScriptManager.cleanIntrusiveArtifacts();
      }
    });

    return () => {
      isMounted = false;
      adScriptManager.unloadScript({ url: config.url });
      adScriptManager.cleanIntrusiveArtifacts();
    };
  }, [isEnabled, isRestricted, config.url]);

  // Popunder intercepts viewport clicks via generated DOM layers and requires no static page container
  return null;
}

