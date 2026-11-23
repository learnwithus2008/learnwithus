/**
 * verify_responsive_all_pages.cjs
 * Comprehensive test suite to verify platform-wide responsiveness and text contrast:
 * 1. LessonContent.jsx: Clean separation of breadcrumbs and toolbar badges below xl: breakpoint.
 * 2. LessonContent.jsx: whitespace-nowrap and shrink-0 on "Chapter X of Y" to prevent vertical multi-line wrap.
 * 3. High-contrast text for badges/pills in dark mode (white #FFFFFF / #E2E8F0, not dim #6B8097).
 * 4. Responsive grids on Learn, Projects, About, Profile, and Home pages.
 * 5. Mobile navbar capsule integrity and 280px minimum width layout safety.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

let passedTests = 0;
let totalTests = 0;

function test(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ ${name}: ${err.message}`);
  }
}

console.log("\n=======================================================");
console.log("  PLATFORM-WIDE RESPONSIVENESS & CONTRAST AUDIT");
console.log("=======================================================\n");

// 1. Audit LessonContent.jsx
const lessonContentPath = path.resolve(__dirname, '../src/components/LessonContent.jsx');
const lessonContent = fs.readFileSync(lessonContentPath, 'utf8');

test("LessonContent: Breadcrumbs and tool badges separate below xl: breakpoint", () => {
  assert(
    lessonContent.includes('flex flex-col xl:flex-row xl:items-center justify-between'),
    "LessonContent should use xl:flex-row to give breadcrumb and 7 tool badges their own rows on mobile/tablet"
  );
});

test("LessonContent: Chapter indicator has whitespace-nowrap and shrink-0", () => {
  assert(
    lessonContent.includes('whitespace-nowrap shrink-0 font-mono tracking-tight') &&
    lessonContent.includes('Chapter {topicIndex} of {totalTopics}'),
    "Chapter X of Y indicator must have whitespace-nowrap and shrink-0 so it never wraps into multiple lines"
  );
});

test("LessonContent: Prev Ch & Next Ch buttons are responsive with compact labels on small screens", () => {
  assert(
    lessonContent.includes('Prev Ch') &&
    lessonContent.includes('Next Ch') &&
    lessonContent.includes('xs:hidden'),
    "Chapter navigation buttons should adapt cleanly across small mobile viewports"
  );
});

test("LessonContent: Interactive Tool Badges row has proper responsive padding and separator", () => {
  assert(
    lessonContent.includes('pt-2.5 xl:pt-0 border-t border-slate-100 dark:border-[#1B3B66]/60 xl:border-t-0'),
    "Tool badges must have clean top separation on screens below xl:"
  );
});

test("LessonContent: Page X of 6 progress badge has whitespace-nowrap shrink-0", () => {
  assert(
    lessonContent.includes('whitespace-nowrap shrink-0') &&
    lessonContent.includes('Page {currentStepMeta.pageNum} of 6'),
    "Page progress badge must not wrap awkwardly"
  );
});

// 2. Audit src/index.css for High-Contrast Text
const cssPath = path.resolve(__dirname, '../src/index.css');
const cssContent = fs.readFileSync(cssPath, 'utf8');

test("index.css: Dark mode .notion-tag text is crisp white (#FFFFFF)", () => {
  assert(
    cssContent.includes('html.dark .notion-tag') &&
    cssContent.includes('color: #FFFFFF !important;'),
    ".notion-tag in dark mode must enforce #FFFFFF !important for text readability"
  );
});

test("index.css: Dark mode .nav-mobile-pill-btn text is crisp white (#FFFFFF)", () => {
  assert(
    cssContent.includes('html.dark .nav-mobile-pill-btn') &&
    cssContent.includes('color: #FFFFFF !important;'),
    "Mobile quick pills must enforce #FFFFFF !important in dark mode"
  );
});

test("index.css: dark:text-[#D2DEEC] and dark:text-[#cbd5e1] are NOT dimmed to #6B8097", () => {
  const dimmedD2 = /html\.dark \.dark\\:text-\[\\#D2DEEC\][\s\S]*?color:\s*#6B8097/m.test(cssContent);
  const dimmedCbd = /html\.dark \.dark\\:text-\[\\#cbd5e1\][\s\S]*?color:\s*#6B8097/m.test(cssContent);
  assert(!dimmedD2 && !dimmedCbd, "Light slate utility classes must not be overridden to dim #6B8097");
});

test("index.css: .book-page-right has responsive top border on mobile and left border on >= 1024px", () => {
  assert(
    cssContent.includes('.book-page-right') &&
    cssContent.includes('border-top: 1px solid #E2E8F0;') &&
    cssContent.includes('@media (min-width: 1024px)'),
    "Book page divider must be horizontal on mobile stacked view and vertical on desktop"
  );
});

test("index.css: Ultra-small screen padding rules (max-width: 480px) for book pages", () => {
  assert(
    cssContent.includes('@media (max-width: 480px)') &&
    cssContent.includes('.book-page-left,\n  .book-page-right'),
    "Book pages should have compact padding on screens <= 480px"
  );
});

// 3. Audit Responsive Grids across Pages
const learnPath = path.resolve(__dirname, '../src/pages/Learn.jsx');
const learnContent = fs.readFileSync(learnPath, 'utf8');
test("Learn.jsx: Stats bar uses xs: responsive grid to protect 280px-320px screens", () => {
  assert(
    learnContent.includes('grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4'),
    "Learn stats bar must use grid-cols-1 on ultra-narrow screens"
  );
});

const projectsPath = path.resolve(__dirname, '../src/pages/Projects.jsx');
const projectsContent = fs.readFileSync(projectsPath, 'utf8');
test("Projects.jsx: Project grid explicitly declares grid-cols-1 md:grid-cols-2", () => {
  assert(
    projectsContent.includes('grid grid-cols-1 md:grid-cols-2'),
    "Projects grid must declare grid-cols-1 for single column mobile display"
  );
});

const aboutPath = path.resolve(__dirname, '../src/pages/About.jsx');
const aboutContent = fs.readFileSync(aboutPath, 'utf8');
test("About.jsx: Value props grid explicitly declares grid-cols-1 sm:grid-cols-2", () => {
  assert(
    aboutContent.includes('grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4'),
    "About page value cards must use grid-cols-1 on mobile"
  );
});

const profilePath = path.resolve(__dirname, '../src/pages/Profile.jsx');
const profileContent = fs.readFileSync(profilePath, 'utf8');
test("Profile.jsx: Doubts balance cards use xs: responsive grid", () => {
  assert(
    profileContent.includes('grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-3'),
    "Profile doubts cards must not squeeze on narrow mobile viewports"
  );
});

const homePath = path.resolve(__dirname, '../src/pages/Home.jsx');
const homeContent = fs.readFileSync(homePath, 'utf8');
test("Home.jsx: Community stats banner uses xs: responsive grid", () => {
  assert(
    homeContent.includes('grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4'),
    "Home statistics grid must adapt gracefully down to 280px"
  );
});

// 4. Audit Floating Action Dock (Notepad & Word Meaning) Responsive Hover Tooltips
const notepadBtnPath = path.resolve(__dirname, '../src/components/FloatingNotepadButton.jsx');
const notepadBtnContent = fs.readFileSync(notepadBtnPath, 'utf8');
test("FloatingNotepadButton: Icon-only on small screens with hover tooltip", () => {
  assert(
    notepadBtnContent.includes('role="tooltip"') &&
    notepadBtnContent.includes('floating-dock-tooltip') &&
    notepadBtnContent.includes('Notepad') &&
    notepadBtnContent.includes('Alt+N') &&
    notepadBtnContent.includes('floating-dock-text'),
    "Floating notepad button must be icon-only on small screens (< 1024px) and show tooltip on hover"
  );
});

const dictBtnPath = path.resolve(__dirname, '../src/components/FloatingDictionaryButton.jsx');
const dictBtnContent = fs.readFileSync(dictBtnPath, 'utf8');
test("FloatingDictionaryButton: Icon-only on small screens with hover tooltip", () => {
  assert(
    dictBtnContent.includes('role="tooltip"') &&
    dictBtnContent.includes('floating-dock-tooltip') &&
    dictBtnContent.includes('Word Meaning') &&
    dictBtnContent.includes('⌘K') &&
    dictBtnContent.includes('floating-dock-text'),
    "Floating dictionary button must be icon-only on small screens (< 1024px) and show tooltip on hover"
  );
});

test("index.css: Floating dock hides text on <1024px and positions tooltip to the left", () => {
  assert(
    cssContent.includes('.floating-dock-tooltip') &&
    cssContent.includes('right: calc(100% + 0.65rem);') &&
    cssContent.includes('@media (max-width: 1023px)') &&
    cssContent.includes('.floating-dock-notepad .floating-dock-text') &&
    cssContent.includes('display: none !important;'),
    "index.css must enforce icon-only buttons on small screens and display full tooltip to the left on hover"
  );
});

// Summary
console.log(`\nResults: ${passedTests} / ${totalTests} tests passed.\n`);
if (passedTests === totalTests) {
  console.log("All platform-wide responsiveness & contrast checks PASSED successfully! 🚀\n");
  process.exit(0);
} else {
  console.error("Some tests failed.");
  process.exit(1);
}
