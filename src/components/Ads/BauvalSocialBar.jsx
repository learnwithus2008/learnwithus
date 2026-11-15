import React, { useState, useEffect } from "react";
import { AD_UNITS, isAdUnitEnabled, isAdPlacementAllowed } from "../../config/adConfig";
import { adScriptManager } from "../../services/adScriptManager";

/**
 * BauvalSocialBar
 * Component for SCRIPT 2: Secondary Ad Unit
 *
 * Exact Script URL:
 * <script data-cfasync="false" src="https://bauval.org/14/139f459964696e9529c356b58868a7f9"></script>
 *
 * Behavioral Safeguards:
 * 1. Loaded as a singleton via adScriptManager (no duplicate script tags).
 * 2. Active ONLY on non-learning and approved informational pages.
 * 3. STRICTLY SUPPRESSED during:
 *    - Quizzes ('practice')
 *    - Code playground ('code')
 *    - Lesson viewer ('lesson')
 *    - Authentication ('signin', 'signup')
 *    - Certificate verification ('verify-certificate')
 *    - Open modal dialogues
 * 4. Automatic cleanup of injected floating elements on unmount or navigation.
 * 5. Emergency kill-switch support (via ?disable_ads=true or localStorage).
 */
export default function BauvalSocialBar({ page = "home", currentStep = null, isModalOpen = false }) {
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

  const isEnabled = isAdUnitEnabled("SECOND_AD");
  const isAllowed = isAdPlacementAllowed({ page, currentStep, isModalOpen });
  const scriptUrl = AD_UNITS.SECOND_AD.url;

  useEffect(() => {
    // If not allowed or disabled, teardown immediately
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
        scriptId: "adsterra-bauval-second-script"
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
  }, [isEnabled, isAllowed, page, currentStep, isModalOpen, scriptUrl]);

  return null;
}

