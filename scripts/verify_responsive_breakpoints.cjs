/**
 * verify_responsive_breakpoints.cjs
 * Comprehensive verification audit for full responsiveness:
 * From 280px (Galaxy Fold / ultra-compact) to 4K Full Screens (3840px).
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
console.log("  RESPONSIVENESS AUDIT: 280px TO FULL SCREENS      ");
console.log("==================================================\n");

// Read stylesheets and components
const cssPath = path.join(ROOT, "src/index.css");
const navbarPath = path.join(ROOT, "src/components/Navbar.jsx");
const fontControlPath = path.join(ROOT, "src/components/FontSizeControl.jsx");
const brandLogoPath = path.join(ROOT, "src/components/BrandLogo.jsx");

assert(fs.existsSync(cssPath), "index.css exists");
assert(fs.existsSync(navbarPath), "Navbar.jsx exists");
assert(fs.existsSync(fontControlPath), "FontSizeControl.jsx exists");

const css = fs.readFileSync(cssPath, "utf8");
const navbar = fs.readFileSync(navbarPath, "utf8");
const fontControl = fs.readFileSync(fontControlPath, "utf8");
const brandLogo = fs.readFileSync(brandLogoPath, "utf8");

// SECTION 1: Base & Ultra-Narrow Viewport Constraints (280px - 320px)
console.log("\n[SECTION 1: 280px - 320px Ultra-Narrow Mobile Support]");
assert(css.includes("overflow-x: hidden;"), "Root layout enforces overflow-x: hidden to prevent horizontal page scrolling");
assert(css.includes("min-width: 280px;"), "Root layout sets minimum viewport boundary at 280px");
assert(css.includes("@media (max-width: 320px)"), "CSS defines dedicated @media (max-width: 320px) ultra-narrow breakpoint rules");
assert(!css.includes(".navbar-context-capsule {\n    display: none !important;"), "Context capsule is NOT hidden on ultra-narrow screens");
assert(css.includes(".navbar-context-capsule {\n    display: flex !important;"), "Context capsule is explicitly flex visible on ultra-narrow screens");
assert(css.includes("height: 32px !important;"), "Brand emblem scales to 32px height on ultra-narrow screens");
assert(css.includes("font-size: 0.75rem !important;"), "Capsule buttons scale font size to 0.75rem on ultra-narrow screens");
assert(css.includes("height: 30px !important;"), "Font size pill scales height to 30px on ultra-narrow screens");
assert(css.includes("width: 1.875rem !important;"), "Theme and Auth buttons scale to 30px (1.875rem) on ultra-narrow screens");
assert(css.includes(".floating-notepad-window,") && css.includes("width: calc(100vw - 1rem) !important;"), "Floating tools scale to calc(100vw - 1rem) on mobile");

// SECTION 2: Compact Mobile Viewports (320px - 480px)
console.log("\n[SECTION 2: 320px - 480px Compact Mobile Devices]");
assert(css.includes("@media (max-width: 360px)"), "CSS defines rules for 360px compact screens (e.g. Galaxy A series)");
assert(css.includes("@media (max-width: 400px)"), "CSS defines font scaling adaptation for screens <= 400px");
assert(navbar.includes("id=\"tour-nav-mobile-capsule\""), "Navbar mounts context capsule in mobile menu");
assert(navbar.includes("fixed sm:absolute left-2 right-2 sm:left-auto sm:right-0"), "Mobile capsule dropdown uses safe margin positioning (left-2 right-2)");
assert(navbar.includes("max-w-[calc(100vw-1rem)]"), "Mobile capsule dropdown restricts max-width to viewport minus margins");
assert(fontControl.includes("max-w-[calc(100vw-1.5rem)]"), "FontSizeControl popover respects small mobile viewports");

// SECTION 3: Phablet & Tablet Viewports (480px - 1023px)
console.log("\n[SECTION 3: 480px - 1023px Phablets & Tablets]");
assert(css.includes("@media (min-width: 480px)"), "CSS includes 480px xs breakpoint");
assert(css.includes("@media (min-width: 640px)"), "CSS includes 640px sm breakpoint");
assert(css.includes("@media (min-width: 768px)"), "CSS includes 768px md breakpoint");
assert(navbar.includes("hidden sm:inline-flex") && navbar.includes("Explore"), "Tablet shows Explore button in navbar for 640px - 1023px");
assert(css.includes(".footer-main-grid {\n    grid-template-columns: repeat(2, 1fr) !important;"), "Footer transitions to 2 columns on tablet screens");

// SECTION 4: Desktop Transition & Layout (1024px - 1439px)
console.log("\n[SECTION 4: 1024px - 1439px Standard Desktop]");
assert(css.includes("@media (min-width: 1024px) {\n  .navbar-desktop-menu {\n    display: flex !important;"), "Desktop menu activates at 1024px");
assert(css.includes("@media (min-width: 1024px) {\n  .navbar-desktop-menu {\n    display: flex !important;\n  }\n\n  .navbar-mobile-menu {\n    display: none !important;"), "Mobile menu cleanly hides at 1024px");
assert(navbar.includes("navbar-nav-dock"), "Desktop renders segmented dock navigation");
assert(css.includes("@media (max-width: 1365px) {\n  .navbar-capsule-text {\n    display: none !important;"), "Capsule hides text below 1366px to preserve navbar space");
assert(css.includes("@media (min-width: 1024px) {\n  .footer-main-grid {\n    grid-template-columns: 2fr 1fr 1fr 1fr !important;"), "Footer transitions to 4 columns on desktop");

// SECTION 5: Large & Ultra-Wide Screens (1440px - 3840px / 4K)
console.log("\n[SECTION 5: 1440px - 3840px Large Desktop & 4K Ultra-Wide]");
assert(css.includes("@media (min-width: 1440px)"), "CSS includes 1440px 2K breakpoint");
assert(css.includes("@media (min-width: 1920px)"), "CSS includes 1920px Full HD / Widescreen breakpoint");
assert(css.includes("@media (min-width: 2560px)"), "CSS includes 2560px QHD / 4K breakpoint");
assert(css.includes(".app-navbar-container {\n    max-width: 1720px !important;"), "Navbar container smoothly expands to 1720px on 1920px screens");
assert(css.includes(".app-navbar-container {\n    max-width: 1920px !important;"), "Navbar container expands to 1920px on 2560px+ screens");

// SECTION 6: Component Specific Overflow Defenses
console.log("\n[SECTION 6: Code Blocks & Modal Overflow Protections]");
const codeBlockContent = fs.readFileSync(path.join(ROOT, "src/components/CodeBlock.jsx"), "utf8");
assert(codeBlockContent.includes("overflow-x-auto"), "CodeBlock has overflow-x-auto to contain code snippets within viewport");
const runnerContent = fs.readFileSync(path.join(ROOT, "src/components/LivePythonRunner.jsx"), "utf8");
assert(runnerContent.includes("overflow-x-auto"), "LivePythonRunner has overflow-x-auto for runner terminals");
assert(runnerContent.includes("whitespace-pre-wrap"), "LivePythonRunner uses whitespace-pre-wrap to wrap code");

console.log("\n--------------------------------------------------");
console.log(`Results: ${passCount} Passed, ${failCount} Failed.`);
console.log("--------------------------------------------------\n");

if (failCount > 0) {
  process.exit(1);
} else {
  console.log("ALL RESPONSIVENESS AUDIT CHECKS PASSED!\n");
  process.exit(0);
}
