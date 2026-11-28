import React, { useEffect } from "react";
import BauvalSocialBar from "./BauvalSocialBar";
import { adScriptManager } from "../../services/adScriptManager";
import { areAdsGloballyEnabled } from "../../config/adConfig";

/**
 * GlobalAdManager
 * Coordinates global advertisement lifecycles across React Single Page Application route transitions.
 *
 * Responsibilities:
 * 1. Hosts the secondary non-learning ad controller (BauvalSocialBar).
 * 2. Prunes any dangling or orphaned ad network artifacts on route changes.
 * 3. Enforces educational safety controls so ads are never active during quizzes, code runner, auth, or admin.
 */
export default function GlobalAdManager({ page = "home", currentStep = null, isModalOpen = false }) {
  // Prune any dangling layers when route transitions occur
  useEffect(() => {
    adScriptManager.cleanIntrusiveArtifacts();
  }, [page, currentStep]);

  if (!areAdsGloballyEnabled()) {
    return null;
  }

  return <BauvalSocialBar page={page} currentStep={currentStep} isModalOpen={isModalOpen} />;
}
