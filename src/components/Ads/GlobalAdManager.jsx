import React, { useEffect } from "react";
import AbscloudAd from "./AbscloudAd";
import { adScriptManager } from "../../services/adScriptManager";

/**
 * GlobalAdManager
 * Coordinates the single approved advertising script (abscloud.org)
 * with the active React Single Page Application route and student activity state.
 *
 * Guarantees that:
 * 1. ONLY the approved abscloud.org script is active.
 * 2. Advertisements are dynamically suppressed during quizzes, code execution, auth, and modals.
 * 3. Any dangling layers are automatically pruned on route transitions.
 */
export default function GlobalAdManager({ page = "home", currentStep = null, isModalOpen = false }) {
  // Prune any dangling layers when route transitions occur
  useEffect(() => {
    adScriptManager.cleanIntrusiveArtifacts();
  }, [page, currentStep]);

  return <AbscloudAd page={page} currentStep={currentStep} isModalOpen={isModalOpen} />;
}
