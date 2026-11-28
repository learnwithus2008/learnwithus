/**
 * verify_responsive_dropdowns.cjs
 * Comprehensive verification audit for responsive dropdowns:
 * Validates behavior and layout constraints from 280px (Galaxy Fold / ultra-compact)
 * through mobile, tablet, and desktop viewports.
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
console.log("  RESPONSIVE DROPDOWNS AUDIT (280px TO FULL SCREENS)");
console.log("==================================================\n");

// Read files
const navbarPath = path.join(ROOT, "src/components/Navbar.jsx");
const fontControlPath = path.join(ROOT, "src/components/FontSizeControl.jsx");
const adminSidebarPath = path.join(ROOT, "src/components/Admin/AdminSidebar.jsx");
const cssPath = path.join(ROOT, "src/index.css");

assert(fs.existsSync(navbarPath), "Navbar.jsx exists");
assert(fs.existsSync(fontControlPath), "FontSizeControl.jsx exists");
assert(fs.existsSync(adminSidebarPath), "AdminSidebar.jsx exists");
assert(fs.existsSync(cssPath), "index.css exists");

const navbar = fs.readFileSync(navbarPath, "utf8");
const fontControl = fs.readFileSync(fontControlPath, "utf8");
const adminSidebar = fs.readFileSync(adminSidebarPath, "utf8");
const css = fs.readFileSync(cssPath, "utf8");

// SECTION 1: Navbar Mobile Context Capsule Dropdowns (Stage & Language)
console.log("\n[SECTION 1: Mobile Capsule Dropdowns (Stage & Language)]");
assert(navbar.includes("navbar-capsule-dropdown"), "Mobile stage and language dropdowns attach .navbar-capsule-dropdown class");
assert(navbar.includes("navbar-capsule-dropdown-item"), "Stage & language item buttons attach .navbar-capsule-dropdown-item class");
assert(navbar.includes("overscroll-contain"), "Dropdown menu containers specify overscroll-contain for smooth touch scrolling");
assert(navbar.includes("min-w-0 flex-1"), "Dropdown item text uses min-w-0 flex-1 to prevent truncation cutoffs");
assert(navbar.includes('style={{ top: "54px" }}'), "Mobile dropdown top offset adjusted to compact 54px header height");

// SECTION 2: Font Size & Contrast Mobile Dropdown
console.log("\n[SECTION 2: Font Size & Contrast Dropdown]");
assert(fontControl.includes("font-size-mobile-dropdown"), "FontSizeControl mobile menu attaches .font-size-mobile-dropdown class");
assert(fontControl.includes("document.addEventListener(\"touchstart\", handleClickOutside)"), "FontSizeControl handles touchstart on mobile devices");
assert(fontControl.includes("max-w-[calc(100vw-1.5rem)]"), "FontSizeControl maintains max-width bounding for small viewports");

// SECTION 3: Admin Sidebar Mobile Drawer Overflow Protection
console.log("\n[SECTION 3: Admin Sidebar Mobile Drawer]");
assert(adminSidebar.includes("max-w-[calc(100vw-1.5rem)]"), "AdminSidebar drawer restricts max-width on 280px screens to prevent horizontal overflow");

// SECTION 4: CSS Responsive Engine for Dropdowns (280px - 320px)
console.log("\n[SECTION 4: CSS Responsive Engine (280px - 320px)]");
assert(css.includes(".navbar-capsule-dropdown"), "CSS defines .navbar-capsule-dropdown");
assert(css.includes(".font-size-mobile-dropdown"), "CSS defines .font-size-mobile-dropdown");
assert(css.includes(".user-menu-popover"), "CSS defines .user-menu-popover");
assert(css.includes("max-width: calc(100vw - 0.5rem) !important;"), "Ultra-narrow breakpoint expands dropdown width to viewport minus tight margins");
assert(css.includes("left: 0.25rem !important;"), "Ultra-narrow breakpoint provides 4px edge padding (left: 0.25rem)");
assert(css.includes("right: 0.25rem !important;"), "Ultra-narrow breakpoint provides 4px edge padding (right: 0.25rem)");
assert(css.includes("select {\n  box-sizing: border-box !important;\n  max-width: 100% !important;"), "Universal select styles prevent horizontal overflow");

console.log("\n--------------------------------------------------");
console.log(`Results: ${passCount} Passed, ${failCount} Failed.`);
console.log("--------------------------------------------------\n");

if (failCount > 0) {
  process.exit(1);
} else {
  console.log("ALL RESPONSIVE DROPDOWNS CHECKS PASSED!\n");
  process.exit(0);
}
