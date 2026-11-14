/**
 * src/config/adConfig.js
 * Centralized Configuration for LearnWithUs Advertising Integration.
 *
 * Approved Ad Script:
 * <script data-cfasync="false" src="https://abscloud.org/1/8dd4f528a9dc426c7936891238d7bc3a"></script>
 *
 * Requirements & Educational Safeguards:
 * - Single verified script provider (abscloud.org)
 * - Display ONLY in suitable sections (Homepage and informational pages)
 * - STRICTLY KEPT AWAY from:
 *   - Quizzes (currentStep === 'practice')
 *   - Code Practice / Playground (currentStep === 'code')
 *   - Sign In / Registration ('signin', 'signup')
 *   - Certificate verification & requests ('verify-certificate')
 *   - Payment and doubt workflows
 * - Instant Emergency Kill-Switch provided if inappropriate content is ever detected
 */

export const AD_CONFIG = {
  scriptUrl: "https://abscloud.org/1/8dd4f528a9dc426c7936891238d7bc3a",
  provider: "abscloud.org",
  scriptId: "abscloud-ad-script",
  dataCfasync: false,

  // Allowed pages: Homepage and informational pages
  allowedPages: ["home", "about", "contact", "terms", "privacy", "projects"],

  // Strictly prohibited pages: Authentication, administration, certificate workflows
  restrictedPages: ["signin", "signup", "admin", "verify-certificate", "verify"]
};

/**
 * Checks whether ads are globally enabled or if an emergency disable kill-switch is active.
 * Allows instant shutdown via localStorage, window event, or query parameter (?disable_ads=true)
 * without requiring a redeployment.
 */
export function areAdsGloballyEnabled() {
  if (typeof window === "undefined") return true;

  try {
    const fullHref = window.location.href || "";

    // 1. Emergency URL parameter override (?disable_ads=true anywhere in URL or hash)
    if (fullHref.includes("disable_ads=true")) {
      return false;
    }

    // 2. Emergency localStorage kill-switch
    if (localStorage.getItem("lwu_disable_ads") === "true") {
      return false;
    }

    // 3. User / Admin preference toggle
    const stored = localStorage.getItem("lwu_abscloud_enabled");
    if (stored !== null) {
      return stored === "true";
    }
  } catch (_) {}

  return true;
}

/**
 * Evaluates whether an ad placement is permissible on the current screen/state.
 *
 * @param {Object} context
 * @param {string} [context.page] - Current SPA page route ('home' | 'about' | 'learn' | 'lesson' | etc.)
 * @param {string} [context.currentStep] - Lesson step ('understand' | 'example' | 'code' | 'practice' | 'challenge' | 'complete')
 * @param {boolean} [context.isModalOpen] - Whether any modal dialog is active
 * @returns {boolean} True if ads are permitted; False if suppressed
 */
export function isAdPlacementAllowed({ page, currentStep, isModalOpen } = {}) {
  // 1. Check emergency killswitch
  if (!areAdsGloballyEnabled()) {
    return false;
  }

  // 2. Suppress on authentication, admin, and certificate verification pages
  if (page && AD_CONFIG.restrictedPages.includes(page)) {
    return false;
  }

  // 3. Suppress during interactive quizzes
  if (currentStep === "practice") {
    return false;
  }

  // 4. Suppress during coding practice / playground
  if (currentStep === "code") {
    return false;
  }

  // 5. Suppress when user is interacting with modals (Ask Doubt, WhatsApp, Certificate Request, Auth)
  if (isModalOpen) {
    return false;
  }

  // 6. Placement allowed on approved pages
  if (page && AD_CONFIG.allowedPages.includes(page)) {
    return true;
  }

  // If in lesson, only allow during non-interactive reading/summary steps
  if (page === "lesson" && currentStep !== "practice" && currentStep !== "code") {
    return true;
  }

  return false;
}

/**
 * Emergency Kill-Switch: Disables the ad placement immediately across the site.
 */
export function disableAdsImmediately() {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("lwu_disable_ads", "true");
      localStorage.setItem("lwu_abscloud_enabled", "false");
    } catch (_) {}
    window.dispatchEvent(new Event("lwu_ads_state_change"));
  }
}

/**
 * Re-enables the approved ad placement.
 */
export function enableAds() {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem("lwu_disable_ads");
      localStorage.setItem("lwu_abscloud_enabled", "true");
    } catch (_) {}
    window.dispatchEvent(new Event("lwu_ads_state_change"));
  }
}
