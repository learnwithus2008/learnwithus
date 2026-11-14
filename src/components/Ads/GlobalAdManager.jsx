import React, { useEffect } from "react";
import BauvalSocialBar from "./BauvalSocialBar";
import AbscloudPopunder from "./AbscloudPopunder";
import { adScriptManager } from "../../services/adScriptManager";

/**
 * GlobalAdManager
 * Coordinates global background advertising scripts (Social Bar & Popunder)
 * with the active React Single Page Application route and student activity state.
 *
 * Guarantees that:
 * 1. Advertising scripts respect centralized enable/disable flags in adConfig.js.
 * 2. Advertisements are dynamically suppressed during quizzes, code execution, auth, and modals.
 * 3. Intrusive overlay layers are automatically pruned on route transitions.
 */
export default function GlobalAdManager({ page = "home", currentStep = null, isModalOpen = false }) {
  // Prune any dangling third-party layers when route transitions occur
  useEffect(() => {
    adScriptManager.cleanIntrusiveArtifacts();
  }, [page, currentStep]);

  return (
    <>
      <BauvalSocialBar page={page} currentStep={currentStep} isModalOpen={isModalOpen} />
      <AbscloudPopunder page={page} currentStep={currentStep} isModalOpen={isModalOpen} />
    </>
  );
}

