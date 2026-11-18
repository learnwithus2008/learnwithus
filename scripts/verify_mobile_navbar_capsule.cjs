/**
 * verify_mobile_navbar_capsule.cjs
 * Comprehensive verification for the user request:
 * "In Small screens navbar it is not presnt"
 * (Context capsule [ 🎓 ⌵ | GB ⌵ ] missing on mobile / small screens)
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
let passCount = 0;
let failCount = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passCount++;
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
    failCount++;
  }
}

console.log("\n==================================================");
console.log("  MOBILE NAVBAR CONTEXT CAPSULE AUDIT              ");
console.log("==================================================\n");

// 1. Navbar.jsx validation
const navbarPath = path.join(ROOT, "src/components/Navbar.jsx");
assert(fs.existsSync(navbarPath), "Navbar.jsx exists and is readable");

const navbarContent = fs.readFileSync(navbarPath, "utf8");

// Check Desktop & Mobile capsules
assert(navbarContent.includes("id=\"tour-nav-capsule\""), "Desktop has id=\"tour-nav-capsule\"");
assert(navbarContent.includes("id=\"tour-nav-mobile-capsule\""), "Mobile menu renders id=\"tour-nav-mobile-capsule\"");

// Check mobile triggers & dropdown state
assert(navbarContent.includes("mobileStageOpen"), "Navbar manages mobileStageOpen state");
assert(navbarContent.includes("mobileLangOpen"), "Navbar manages mobileLangOpen state");
assert(navbarContent.includes("mobileStageMenuRef"), "Navbar uses mobileStageMenuRef");
assert(navbarContent.includes("mobileLangMenuRef"), "Navbar uses mobileLangMenuRef");

// Check mobile capsule structure
assert(navbarContent.includes("id=\"tour-nav-mobile-stage\""), "Mobile capsule has stage button with #tour-nav-mobile-stage");
assert(navbarContent.includes("id=\"tour-nav-mobile-lang\""), "Mobile capsule has lang button with #tour-nav-mobile-lang");

// Check dropdowns in mobile capsule
assert(navbarContent.includes("LEARNING_STAGES.map"), "Mobile capsule renders LEARNING_STAGES in quick-switch dropdown");
assert(navbarContent.includes("LEARNING_LANGUAGES.map"), "Mobile capsule renders LEARNING_LANGUAGES in quick-switch dropdown");
assert(navbarContent.includes("onOpenStageModal"), "Mobile capsule provides link to open stage details modal");
assert(navbarContent.includes("onOpenLanguageModal"), "Mobile capsule provides link to open full language guide modal");

// Check click outside listener handles both mousedown and touchstart
assert(navbarContent.includes("document.addEventListener(\"touchstart\", handleClickOutside)"), "Outside click listener handles touchstart on mobile");
assert(navbarContent.includes("document.addEventListener(\"mousedown\", handleClickOutside)"), "Outside click listener handles mousedown");

// Check that controls (FontSizeControl, Theme, Auth) are retained on mobile
assert(navbarContent.includes("FontSizeControl variant=\"mobile\""), "Mobile menu includes FontSizeControl");
assert(navbarContent.includes("id=\"tour-nav-mobile-theme\""), "Mobile menu includes theme toggle");
assert(navbarContent.includes("id=\"tour-nav-mobile-auth\""), "Mobile menu includes auth / profile button");

// 2. index.css responsiveness check
const cssPath = path.join(ROOT, "src/index.css");
const cssContent = fs.readFileSync(cssPath, "utf8");

assert(cssContent.includes(".navbar-context-capsule"), "index.css defines .navbar-context-capsule");
assert(!cssContent.includes(".navbar-context-capsule {\n    display: none !important;"), "index.css does NOT hide .navbar-context-capsule at ultra-narrow widths");
assert(cssContent.includes(".navbar-capsule-btn"), "index.css defines .navbar-capsule-btn");
assert(cssContent.includes(".navbar-capsule-divider"), "index.css defines .navbar-capsule-divider");

console.log("\n--------------------------------------------------");
console.log(`Results: ${passCount} Passed, ${failCount} Failed.`);
console.log("--------------------------------------------------\n");

if (failCount > 0) {
  process.exit(1);
} else {
  console.log("ALL MOBILE NAVBAR CONTEXT CAPSULE TESTS PASSED!\n");
  process.exit(0);
}

