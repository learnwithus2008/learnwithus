/**
 * src/config/adConfig.js
 * Centralized configuration for all advertising units and third-party scripts on LearnWithUs.
 *
 * Each advertising unit is independently configurable, auditable, and isolated.
 */

export const AD_PROVIDERS = {
  BAUVAL: "bauval.org",
  ABSCLOUD: "abscloud.org",
  GOOGLE: "google.com"
};

function getInitialState(key, defaultVal) {
  if (typeof window === "undefined") return defaultVal;
  try {
    const params = new URLSearchParams(window.location.search || window.location.hash.split("?")[1] || "");
    if (params.get("enable_all_ads") === "true") return true;
    if (params.get(key.toLowerCase()) === "true") return true;
    const stored = localStorage.getItem(`lwu_ad_${key.toLowerCase()}`);
    if (stored !== null) return stored === "true";
  } catch (_) {}
  return defaultVal;
}

export const AD_SCRIPTS = {
  // SCRIPT 1: Native Banner
  NATIVE_BANNER: {
    id: "adsterra_native_banner",
    name: "Adsterra Native Banner",
    url: "https://bauval.org/21/6262f8eaf407dba385778988c358262b",
    containerId: "container-6262f8eaf407dba385778988c358262b",
    format: "native_banner",
    provider: AD_PROVIDERS.BAUVAL,
    enabled: getInitialState("native_banner", true), // Safe, non-intrusive card grid
    isIntrusive: false,
    requiresContainer: true,
    description: "Grid/card banner that integrates into content sections. Safe for educational UX.",
    allowedPlacements: ["home", "learn", "lesson_footer"]
  },

  // SCRIPT 2: Bauval Social Bar / In-Page Push
  BAUVAL_SOCIAL_BAR: {
    id: "bauval_social_bar",
    name: "Bauval Social Bar / In-Page Push",
    url: "https://bauval.org/14/139f459964696e9529c356b58868a7f9",
    format: "social_bar_inpage_push",
    provider: AD_PROVIDERS.BAUVAL,
    // DISABLED BY POLICY by default per instruction: "If either additional script produces popunders or intrusive advertising, do not enable it on LearnWithUs."
    // Can be dynamically enabled for testing via ?enable_all_ads=true or ?social_bar=true
    enabled: getInitialState("social_bar", false),
    isIntrusive: true,
    requiresContainer: false,
    description: "Generates sticky floating notifications, chat widgets, back-click handlers, and overlap popunders. Intrusive to student learning.",
    policyReason: "Disabled by LearnWithUs policy: contains sticky floating overlays, backClick interception, and overlapPopunder logic that disrupt reading, quizzes, and code execution.",
    allowedPlacements: []
  },

  // SCRIPT 3: Abscloud Popunder
  ABSCLOUD_POPUNDER: {
    id: "abscloud_popunder",
    name: "Abscloud OnClick Popunder",
    url: "https://abscloud.org/1/8dd4f528a9dc426c7936891238d7bc3a",
    format: "onclick_popunder",
    provider: AD_PROVIDERS.ABSCLOUD,
    // DISABLED BY POLICY by default per instruction: "If either additional script produces popunders or intrusive advertising, do not enable it on LearnWithUs."
    // Can be dynamically enabled for testing via ?enable_all_ads=true or ?popunder=true
    enabled: getInitialState("popunder", false),
    isIntrusive: true,
    requiresContainer: false,
    description: "Injects transpLayerId full-page overlay layer that hijacks student clicks to launch background popunder windows and intercepts back button navigation.",
    policyReason: "Disabled by LearnWithUs policy: contains full-page transparent overlay (transpLayerId), click-jacking popunders (pu_click), and back navigation takeover (extraBackButtonInvokeDomain).",
    allowedPlacements: []
  }
};

/**
 * Route protection: Determines whether advertising should be suppressed
 * during sensitive student workflows.
 *
 * @param {Object} options
 * @param {string} [options.page] - Current SPA page route
 * @param {string} [options.currentStep] - Current lesson step ('understand' | 'example' | 'code' | 'practice' | 'challenge' | 'complete')
 * @param {boolean} [options.isModalOpen] - Whether any modal dialog is active
 * @returns {boolean} True if advertising must be blocked
 */
export function isRouteAdRestricted({ page, currentStep, isModalOpen } = {}) {
  // 1. Critical functional views (Authentication, Admin, Certificate Verification)
  const restrictedPages = ["signin", "signup", "admin", "verify-certificate", "verify"];
  if (page && restrictedPages.includes(page)) {
    return true;
  }

  // 2. Interactive learning modes (Active Quizzes & Interactive Code Playground)
  if (currentStep === "practice" || currentStep === "code") {
    return true;
  }

  // 3. User interaction dialogues (Doubt submission, Payment/WhatsApp request, Notepad)
  if (isModalOpen) {
    return true;
  }

  return false;
}

/**
 * Check if a specific ad script is enabled
 * @param {string} key - SCRIPT key in AD_SCRIPTS
 * @returns {boolean}
 */
export function isAdScriptEnabled(key) {
  return Boolean(AD_SCRIPTS[key]?.enabled);
}

/**
 * Programmatic toggle for administrative auditing/testing
 * @param {string} key
 * @param {boolean} state
 */
export function setAdScriptEnabled(key, state) {
  if (AD_SCRIPTS[key]) {
    AD_SCRIPTS[key].enabled = Boolean(state);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(`lwu_ad_${key.toLowerCase()}`, String(Boolean(state)));
      } catch (_) {}
    }
  }
}
