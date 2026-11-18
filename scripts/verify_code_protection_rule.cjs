/**
 * verify_code_protection_rule.cjs
 * Comprehensive verification audit for the rule:
 * "From this I dont want anyone to be able to copy or get the code. Make that restriction"
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
console.log("  CODE ANTI-COPY & EXTRACTION PROTECTION AUDIT     ");
console.log("==================================================\n");

// 1. codeProtection.js validation
const protectionUtilPath = path.join(ROOT, "src/utils/codeProtection.js");
assert(fs.existsSync(protectionUtilPath), "codeProtection.js utility exists");

const utilCode = fs.readFileSync(protectionUtilPath, "utf8");
assert(utilCode.includes("export function initCodeProtection"), "Exports initCodeProtection function");
assert(utilCode.includes("export function showCodeProtectionToast"), "Exports showCodeProtectionToast function");
assert(utilCode.includes("export function isCodeElement"), "Exports isCodeElement function");
assert(utilCode.includes("export function isSelectionInCode"), "Exports isSelectionInCode function");
assert(utilCode.includes("e.clipboardData.setData(\"text/plain\", \"\")"), "Clears clipboard content on attempted copy");
assert(utilCode.includes("addEventListener(\"copy\""), "Listens for copy event");
assert(utilCode.includes("addEventListener(\"contextmenu\""), "Listens for contextmenu (right-click) event");
assert(utilCode.includes("addEventListener(\"dragstart\""), "Listens for dragstart event");
assert(utilCode.includes("F12"), "Blocks F12 DevTools shortcut");
assert(utilCode.includes("key === \"U\""), "Blocks Ctrl+U / Cmd+U View Source shortcut");
assert(utilCode.includes("key === \"S\""), "Blocks Ctrl+S / Cmd+S Webpage Save shortcut");
assert(utilCode.includes("key === \"I\""), "Blocks Ctrl+Shift+I Inspect shortcut");

// 2. CodeBlock.jsx validation
const codeBlockPath = path.join(ROOT, "src/components/CodeBlock.jsx");
const codeBlockContent = fs.readFileSync(codeBlockPath, "utf8");
assert(!codeBlockContent.includes("navigator.clipboard.writeText"), "CodeBlock does NOT write code to clipboard");
assert(!codeBlockContent.includes("handleCopy ="), "CodeBlock has removed handleCopy");
assert(codeBlockContent.includes("data-code-protected=\"true\""), "CodeBlock marks container with data-code-protected");
assert(codeBlockContent.includes("Protected"), "CodeBlock renders Protected lock badge");
assert(codeBlockContent.includes("onCopy="), "CodeBlock attaches onCopy handler to block copy");
assert(codeBlockContent.includes("onContextMenu="), "CodeBlock attaches onContextMenu handler to block right click");
assert(codeBlockContent.includes("select-none"), "CodeBlock applies select-none class");

// 3. LivePythonRunner.jsx validation
const runnerPath = path.join(ROOT, "src/components/LivePythonRunner.jsx");
const runnerContent = fs.readFileSync(runnerPath, "utf8");
assert(!runnerContent.includes("navigator.clipboard.writeText"), "LivePythonRunner does NOT write code to clipboard");
assert(!runnerContent.includes("title=\"Copy Code\""), "LivePythonRunner has removed Copy Code button");
assert(runnerContent.includes("data-code-protected=\"true\""), "LivePythonRunner marks container with data-code-protected");
assert(runnerContent.includes("Protected"), "LivePythonRunner renders Protected lock badge");
assert(runnerContent.includes("onCopy="), "LivePythonRunner textarea has onCopy copy interception");
assert(runnerContent.includes("onContextMenu="), "LivePythonRunner has onContextMenu right-click protection");

// 4. WordMeaningResult.jsx validation
const wordMeaningPath = path.join(ROOT, "src/components/WordMeaning/WordMeaningResult.jsx");
const wordMeaningContent = fs.readFileSync(wordMeaningPath, "utf8");
assert(!wordMeaningContent.includes("navigator.clipboard.writeText"), "WordMeaningResult does NOT write code to clipboard");
assert(!wordMeaningContent.includes("handleCopyCode"), "WordMeaningResult has removed handleCopyCode");
assert(wordMeaningContent.includes("data-code-protected=\"true\""), "WordMeaningResult marks code container as protected");
assert(wordMeaningContent.includes("Protected"), "WordMeaningResult renders Protected badge");
assert(wordMeaningContent.includes("onCopy="), "WordMeaningResult attaches onCopy restriction handler");

// 5. index.css rules validation
const cssPath = path.join(ROOT, "src/index.css");
const cssContent = fs.readFileSync(cssPath, "utf8");
assert(cssContent.includes("user-select: none !important"), "index.css enforces user-select: none !important on code elements");
assert(cssContent.includes("-webkit-user-select: none !important"), "index.css enforces webkit-user-select: none !important");
assert(cssContent.includes("-webkit-user-drag: none !important") || cssContent.includes("user-drag: none !important"), "index.css prevents dragging code elements");
assert(cssContent.includes("@media print") && cssContent.includes("display: none !important"), "index.css hides code in print view to prevent PDF code extraction");

// 6. App.jsx initialization validation
const appPath = path.join(ROOT, "src/App.jsx");
const appContent = fs.readFileSync(appPath, "utf8");
assert(appContent.includes("initCodeProtection"), "App.jsx imports initCodeProtection");
assert(appContent.includes("initCodeProtection()"), "App.jsx mounts initCodeProtection in lifecycle hook");

// 7. index.html inline protection validation
const htmlPath = path.join(ROOT, "index.html");
const htmlContent = fs.readFileSync(htmlPath, "utf8");
assert(htmlContent.includes("Anti-Inspection & Page Source Protection Shield"), "index.html has pre-hydration anti-inspection shield");
assert(htmlContent.includes("oncontextmenu=\"return false;\""), "index.html body has oncontextmenu=return false;");
assert(htmlContent.includes("ondragstart=\"return false;\""), "index.html body has ondragstart=return false;");
assert(htmlContent.includes("k === 'U'"), "index.html blocks Ctrl+U View Source shortcut");
assert(htmlContent.includes("k === 'I'"), "index.html blocks Ctrl+Shift+I Inspect shortcut");

// 8. Silent warning suppression validation ("Dont give the warning here")
assert(!utilCode.includes("code-protection-toast-visible"), "Toast DOM popup is suppressed for silent protection");
const viteConfigPath = path.join(ROOT, "vite.config.js");
const viteConfigContent = fs.readFileSync(viteConfigPath, "utf8");
assert(viteConfigContent.includes("chunkSizeWarningLimit: 10000"), "vite.config.js silences build chunk size warnings");

console.log("\n--------------------------------------------------");
console.log(`Results: ${passCount} Passed, ${failCount} Failed.`);
console.log("--------------------------------------------------\n");

if (failCount > 0) {
  process.exit(1);
} else {
  console.log("ALL CODE ANTI-COPY & EXTRACTION PROTECTION TESTS PASSED!\n");
  process.exit(0);
}

