/**
 * src/config/adConfig.js
 * Centralized Configuration for LearnWithUs Three-Ad Script Integration.
 *
 * Ad Units:
 * 1. Native Banner Ad (bauval.org/21/...) with #container-6262f8eaf407dba385778988c358262b
 * 2. Second Ad Script (bauval.org/14/...)
 * 3. Third Mid-Content Ad Script (abscloud.org/1/...)
 *
 * Student Protection Rules:
 * - Never show ads on: Login/Register, Quizzes, Coding Practice, Payment, Certificate Verification
 * - Load scripts only once (deduplication)
 * - Safe static handling for Script 3 (provider does not support periodic re-injection)
 * - Emergency Kill-Switch for instant site-wide or per-ad disabling
 */

export const AD_UNITS = {
  // SCRIPT 1: Native Banner Ad
  NATIVE_BANNER: {
    id: "adsterra_native_banner",
    name: "Adsterra Native Banner",
    url: "https://bauval.org/21/6262f8eaf407dba385778988c358262b",
    containerId: "container-6262f8eaf407dba385778988c358262b",
    placement: "Homepage Sponsored Showcase",
    enabled: true,
    storageKey: "lwu_ad_native_banner"
  },

  // SCRIPT 2: Second Ad Script
  SECOND_AD: {
    id: "bauval_second_ad",
    name: "Bauval Secondary Ad Unit",
    url: "https://bauval.org/14/139f459964696e9529c356b58868a7f9",
    placement: "Secondary Non-Learning Area",
    enabled: true,
    storageKey: "lwu_ad_second"
  },

  // SCRIPT 3: Third Mid-Content Ad Script
  MID_CONTENT: {
    id: "abscloud_mid_content",
    name: "Abscloud Mid-Content Ad Placement",
    url: "https://abscloud.org/1/8dd4f528a9dc426c7936891238d7bc3a",
    scriptUrl: "https://abscloud.org/1/8dd4f528a9dc426c7936891238d7bc3a",
    scriptId: "adsterra-abscloud-ad-script",
    placement: "Mid-Content (Between Learning Modules)",
    enabled: true,
    storageKey: "lwu_ad_mid_content",
    // Timing / Refresh: Adsterra does not support client-side periodic refresh without re-injecting scripts,
    // which violates ad network anti-fraud policies. Kept static per user instructions.
    supportsRefresh: false,
    refreshIntervalMs: 120000 // 2 minutes documented
  }
};

// Backwards compatibility alias
export const AD_CONFIG = AD_UNITS.MID_CONTENT;

export const RESTRICTED_PAGES = [
  "signin",
  "signup",
  "admin",
  "verify-certificate",
  "verify",
  "practice",
  "lesson"
];

/**
 * Checks whether advertising is globally allowed or if an emergency killswitch is active.
 */
export function areAdsGloballyEnabled() {
  if (typeof window === "undefined") return true;

  try {
    const fullHref = window.location.href || "";

    // 1. URL emergency override (?disable_ads=true)
    if (fullHref.includes("disable_ads=true")) {
      return false;
    }

    // 2. localStorage emergency killswitch
    if (localStorage.getItem("lwu_disable_ads") === "true") {
      return false;
    }
  } catch (_) {}

  return true;
}

/**
 * Check if a specific ad unit is enabled by configuration or storage override.
 * @param {string} unitKey - Key in AD_UNITS ('NATIVE_BANNER' | 'SECOND_AD' | 'MID_CONTENT')
 * @returns {boolean}
 */
export function isAdUnitEnabled(unitKey) {
  if (!areAdsGloballyEnabled()) return false;
  const unit = AD_UNITS[unitKey];
  if (!unit) return false;

  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(unit.storageKey);
      if (stored !== null) return stored === "true";
    } catch (_) {}
  }

  return Boolean(unit.enabled);
}

/**
 * Evaluates whether an advertisement can be displayed on the current screen/state.
 * Enforces strict educational safeguards:
 * - NO ads during active quizzes ('practice')
 * - NO ads during code runner / playground ('code')
 * - NO ads on signin/signup/admin/verify/practice/lesson
 * - NO ads while modal dialogues are active
 */
export function isAdPlacementAllowed({ page, currentStep, isModalOpen } = {}) {
  // 1. Global killswitch check
  if (!areAdsGloballyEnabled()) return false;

  // 2. Check sensitive routes
  if (page && RESTRICTED_PAGES.includes(page)) {
    return false;
  }

  // 3. Strict Learning Safeguard: Active Quiz
  if (currentStep === "practice") {
    return false;
  }

  // 4. Strict Learning Safeguard: Active Code Runner
  if (currentStep === "code") {
    return false;
  }

  // 5. Active Modals (Doubt, WhatsApp, Certificate Request, Auth)
  if (isModalOpen) {
    return false;
  }

  return true;
}

/**
 * Instant Emergency Kill-Switch: Disables all advertising placements immediately.
 */
export function disableAllAds() {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem("lwu_disable_ads", "true");
    } catch (_) {}
    window.dispatchEvent(new Event("lwu_ads_state_change"));
  }
}

export const disableAdsImmediately = disableAllAds;

/**
 * Re-enables advertising placements.
 */
export function enableAllAds() {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem("lwu_disable_ads");
    } catch (_) {}
    window.dispatchEvent(new Event("lwu_ads_state_change"));
  }
}

export const enableAds = enableAllAds;
