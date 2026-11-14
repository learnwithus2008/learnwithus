import React, { useEffect } from "react";
import { AD_SCRIPTS, isRouteAdRestricted } from "../../config/adConfig";
import { adScriptManager } from "../../services/adScriptManager";

/**
 * BauvalSocialBar
 * Controller component for Advertisement 2: Bauval Script
 * Exact Script URL: https://bauval.org/14/139f459964696e9529c356b58868a7f9
 *
 * Identified Format: Adsterra Social Bar / In-Page Push / Overlap Popunder
 *
 * Policy & Safety Rules:
 * - Disabled by default per LearnWithUs Educational Policy:
 *   "If either additional script produces popunders or intrusive advertising, do not enable it on LearnWithUs."
 * - If enabled in config for auditing/monetization, strictly suppressed on:
 *   - Active Quizzes (currentStep === 'practice')
 *   - Code Practice / Playground (currentStep === 'code')
 *   - Login / Registration ('signin', 'signup')
 *   - Certificate Request & Verification ('verify-certificate')
 * - Full unmount cleanup guarantees no persistent sticky widgets or memory leaks.
 */
export default function BauvalSocialBar({ page, currentStep, isModalOpen }) {
  const config = AD_SCRIPTS.BAUVAL_SOCIAL_BAR;

  // Check centralized toggle
  const isEnabled = Boolean(config && config.enabled);
  const isRestricted = isRouteAdRestricted({ page, currentStep, isModalOpen });

  useEffect(() => {
    // If disabled by policy or restricted on the active screen, ensure cleanup
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
      scriptId: "bauval-social-bar-script"
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

  // Social Bar creates floating widgets dynamically and requires no static page container
  return null;
}

