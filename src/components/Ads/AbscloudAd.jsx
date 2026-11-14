import React, { useState, useEffect } from "react";
import { AD_CONFIG, isAdPlacementAllowed, areAdsGloballyEnabled } from "../../config/adConfig";
import { adScriptManager } from "../../services/adScriptManager";

/**
 * AbscloudAd
 * Official Approved Advertising Controller for LearnWithUs.
 *
 * Exact Script URL:
 * <script data-cfasync="false" src="https://abscloud.org/1/8dd4f528a9dc426c7936891238d7bc3a"></script>
 *
 * Placement Rules & Educational Protections:
 * 1. Active ONLY on approved sections (Homepage and informational pages: About, Terms, Privacy, Contact, Projects).
 * 2. STRICTLY SUPPRESSED during:
 *    - Active Quizzes (currentStep === 'practice')
 *    - Code Practice / Playground (currentStep === 'code')
 *    - Login / Registration ('signin', 'signup')
 *    - Certificate verification & requests ('verify-certificate')
 *    - Modals (Doubt submission, WhatsApp portal, Authentication)
 * 3. Script is injected only once (singleton deduplication) preventing duplicate tags on route changes.
 * 4. Automatic cleanup on route transitions ensures no lingering overlays or memory leaks.
 * 5. Emergency kill-switch support (via ?disable_ads=true or localStorage 'lwu_disable_ads').
 */
export default function AbscloudAd({ page = "home", currentStep = null, isModalOpen = false }) {
  const [, setTick] = useState(0);

  // Re-evaluate on URL changes, hash changes, or emergency killswitch events
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

  const isAllowed = isAdPlacementAllowed({ page, currentStep, isModalOpen });
  const isGlobalEnabled = areAdsGloballyEnabled();

  useEffect(() => {
    // If ads are disabled or current screen is restricted (quiz, code, auth, modal), cleanup immediately
    if (!isAllowed || !isGlobalEnabled) {
      adScriptManager.unloadScript({ url: AD_CONFIG.scriptUrl, force: true });
      adScriptManager.cleanIntrusiveArtifacts();
      return;
    }

    let isMounted = true;

    // Load the single approved script via singleton manager
    adScriptManager
      .loadScript({
        url: AD_CONFIG.scriptUrl,
        async: true,
        dataCfasync: false,
        scriptId: AD_CONFIG.scriptId
      })
      .then((success) => {
        if (!isMounted && success) {
          adScriptManager.unloadScript({ url: AD_CONFIG.scriptUrl });
          adScriptManager.cleanIntrusiveArtifacts();
        }
      });

    return () => {
      isMounted = false;
      // On unmount (e.g. navigating to restricted route), clean up
      adScriptManager.unloadScript({ url: AD_CONFIG.scriptUrl });
      adScriptManager.cleanIntrusiveArtifacts();
    };
  }, [isAllowed, isGlobalEnabled, page, currentStep, isModalOpen]);

  // Non-intrusive controller; DOM interactions and scripts are managed cleanly
  return null;
}
