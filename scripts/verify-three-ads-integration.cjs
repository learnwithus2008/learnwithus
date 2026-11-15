/**
 * scripts/verify-three-ads-integration.cjs
 * Comprehensive test & verification script for LearnWithUs Three Ad Integration.
 */

const fs = require("fs");
const path = require("path");
const assert = require("assert");

console.log("=================================================");
console.log("  LEARNWITHUS THREE AD SCRIPT INTEGRATION AUDIT  ");
console.log("=================================================\n");

let passedCount = 0;
let totalCount = 0;

function check(desc, fn) {
  totalCount++;
  try {
    fn();
    console.log(`  ✓ PASS: ${desc}`);
    passedCount++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${desc}`);
    console.error(`    Error: ${err.message}`);
  }
}

// 1. Config Verification
console.log("[SECTION 1: Configuration & Ad Units]");
const adConfigPath = path.resolve(__dirname, "../src/config/adConfig.js");
const adConfigContent = fs.readFileSync(adConfigPath, "utf-8");

check("adConfig.js defines AD_UNITS with all 3 advertising specifications", () => {
  assert(adConfigContent.includes("NATIVE_BANNER"), "Missing NATIVE_BANNER");
  assert(adConfigContent.includes("SECOND_AD"), "Missing SECOND_AD");
  assert(adConfigContent.includes("MID_CONTENT"), "Missing MID_CONTENT");
});

check("Script 1 exact URL & container ID are defined in config", () => {
  assert(adConfigContent.includes("https://bauval.org/21/6262f8eaf407dba385778988c358262b"), "Wrong Script 1 URL");
  assert(adConfigContent.includes("container-6262f8eaf407dba385778988c358262b"), "Wrong Container ID");
});

check("Script 2 exact URL is defined in config", () => {
  assert(adConfigContent.includes("https://bauval.org/14/139f459964696e9529c356b58868a7f9"), "Wrong Script 2 URL");
});

check("Script 3 exact URL is defined in config with refresh documentation", () => {
  assert(adConfigContent.includes("https://abscloud.org/1/8dd4f528a9dc426c7936891238d7bc3a"), "Wrong Script 3 URL");
  assert(adConfigContent.includes("supportsRefresh: false"), "supportsRefresh should be false per policy");
  assert(adConfigContent.includes("120000"), "2-minute interval documented");
});

check("Restricted pages include signin, signup, admin, verify-certificate, practice, lesson", () => {
  assert(adConfigContent.includes('"signin"'), "signin should be restricted");
  assert(adConfigContent.includes('"signup"'), "signup should be restricted");
  assert(adConfigContent.includes('"admin"'), "admin should be restricted");
  assert(adConfigContent.includes('"verify-certificate"'), "verify-certificate should be restricted");
  assert(adConfigContent.includes('"practice"'), "practice should be restricted");
  assert(adConfigContent.includes('"lesson"'), "lesson should be restricted");
});

// 2. Component Files Existence & Verification
console.log("\n[SECTION 2: Component Architecture & Safeguards]");
const nativeBannerPath = path.resolve(__dirname, "../src/components/Ads/AdsterraNativeBanner.jsx");
const secondAdPath = path.resolve(__dirname, "../src/components/Ads/BauvalSocialBar.jsx");
const midContentPath = path.resolve(__dirname, "../src/components/Ads/AbscloudMidContent.jsx");
const globalAdMgrPath = path.resolve(__dirname, "../src/components/Ads/GlobalAdManager.jsx");
const adsIndexPath = path.resolve(__dirname, "../src/components/Ads/index.js");

check("AdsterraNativeBanner component exists and embeds exact script & container in friendly iframe", () => {
  assert(fs.existsSync(nativeBannerPath), "AdsterraNativeBanner.jsx does not exist");
  const content = fs.readFileSync(nativeBannerPath, "utf-8");
  assert(content.includes("https://bauval.org/21/6262f8eaf407dba385778988c358262b"), "Missing Script 1 URL in AdsterraNativeBanner");
  assert(content.includes("container-6262f8eaf407dba385778988c358262b"), "Missing container ID in AdsterraNativeBanner");
  assert(content.includes("<iframe"), "AdsterraNativeBanner should isolate container in iframe");
  assert(content.includes("Sponsored Partner"), "Missing disclosure badge");
});

check("BauvalSocialBar component exists with singleton manager and route suppression", () => {
  assert(fs.existsSync(secondAdPath), "BauvalSocialBar.jsx does not exist");
  const content = fs.readFileSync(secondAdPath, "utf-8");
  assert(content.includes("adScriptManager"), "Missing adScriptManager in BauvalSocialBar");
  assert(content.includes("cleanIntrusiveArtifacts"), "Missing cleanIntrusiveArtifacts in BauvalSocialBar");
});

check("AbscloudMidContent component exists with mid-content card and clear labeling", () => {
  assert(fs.existsSync(midContentPath), "AbscloudMidContent.jsx does not exist");
  const content = fs.readFileSync(midContentPath, "utf-8");
  assert(content.includes("adScriptManager"), "Missing adScriptManager in AbscloudMidContent");
  assert(content.includes("abscloud-midcontent-container"), "Missing container class in AbscloudMidContent");
  assert(content.includes("Sponsored Learning Partner"), "Missing disclosure header in AbscloudMidContent");
});

check("GlobalAdManager coordinates ad lifecycles and prunes intrusive layers", () => {
  assert(fs.existsSync(globalAdMgrPath), "GlobalAdManager.jsx does not exist");
  const content = fs.readFileSync(globalAdMgrPath, "utf-8");
  assert(content.includes("cleanIntrusiveArtifacts"), "GlobalAdManager must prune intrusive artifacts");
  assert(content.includes("BauvalSocialBar"), "GlobalAdManager must wire BauvalSocialBar");
});

check("Ads index.js exports all components and configuration helpers", () => {
  assert(fs.existsSync(adsIndexPath), "index.js does not exist");
  const content = fs.readFileSync(adsIndexPath, "utf-8");
  assert(content.includes("AdsterraNativeBanner"), "Missing export AdsterraNativeBanner");
  assert(content.includes("BauvalSocialBar"), "Missing export BauvalSocialBar");
  assert(content.includes("AbscloudMidContent"), "Missing export AbscloudMidContent");
  assert(content.includes("GlobalAdManager"), "Missing export GlobalAdManager");
});

// 3. Page Placements Verification
console.log("\n[SECTION 3: Page Integration & Placements]");
const homePath = path.resolve(__dirname, "../src/pages/Home.jsx");
const learnPath = path.resolve(__dirname, "../src/pages/Learn.jsx");
const appPath = path.resolve(__dirname, "../src/App.jsx");
const privacyPath = path.resolve(__dirname, "../src/pages/PrivacyPolicy.jsx");

check("Home.jsx imports and mounts AdsterraNativeBanner between sections", () => {
  const content = fs.readFileSync(homePath, "utf-8");
  assert(content.includes("AdsterraNativeBanner"), "Home.jsx does not import AdsterraNativeBanner");
  assert(content.includes('<AdsterraNativeBanner page="home" />'), "Home.jsx does not render <AdsterraNativeBanner />");
});

check("Learn.jsx imports and mounts AbscloudMidContent in mid-content position", () => {
  const content = fs.readFileSync(learnPath, "utf-8");
  assert(content.includes("AbscloudMidContent"), "Learn.jsx does not import AbscloudMidContent");
  assert(content.includes('<AbscloudMidContent page="learn" />'), "Learn.jsx does not render <AbscloudMidContent />");
});

check("App.jsx mounts GlobalAdManager with route state and modal tracking", () => {
  const content = fs.readFileSync(appPath, "utf-8");
  assert(content.includes("GlobalAdManager"), "App.jsx does not import GlobalAdManager");
  assert(content.includes("<GlobalAdManager page={currentPage}"), "App.jsx does not wire page to GlobalAdManager");
});

check("PrivacyPolicy.jsx discloses Adsterra, bauval.org, and abscloud.org", () => {
  const content = fs.readFileSync(privacyPath, "utf-8");
  assert(content.includes("bauval.org"), "PrivacyPolicy missing bauval.org");
  assert(content.includes("abscloud.org"), "PrivacyPolicy missing abscloud.org");
  assert(content.includes("Adsterra"), "PrivacyPolicy missing Adsterra");
});

// 4. Production Build Files Verification
console.log("\n[SECTION 4: Compiled Production Bundle]");
const distDir = path.resolve(__dirname, "../dist/assets");
const distFiles = fs.readdirSync(distDir);

check("Production build assets exist", () => {
  assert(distFiles.length > 5, "Dist folder has insufficient assets");
});

check("All 3 ad URLs and container ID are compiled into production bundles", () => {
  let foundScript1 = false;
  let foundContainer1 = false;
  let foundScript2 = false;
  let foundScript3 = false;

  for (const file of distFiles) {
    if (file.endsWith(".js")) {
      const bundleContent = fs.readFileSync(path.join(distDir, file), "utf-8");
      if (bundleContent.includes("6262f8eaf407dba385778988c358262b")) foundScript1 = true;
      if (bundleContent.includes("container-6262f8eaf407dba385778988c358262b")) foundContainer1 = true;
      if (bundleContent.includes("139f459964696e9529c356b58868a7f9")) foundScript2 = true;
      if (bundleContent.includes("8dd4f528a9dc426c7936891238d7bc3a")) foundScript3 = true;
    }
  }

  assert(foundScript1, "Script 1 hash missing in bundle");
  assert(foundContainer1, "Container ID missing in bundle");
  assert(foundScript2, "Script 2 hash missing in bundle");
  assert(foundScript3, "Script 3 hash missing in bundle");
});

// Clean up test file
try {
  fs.unlinkSync(path.resolve(__dirname, "../test-three-ads.cjs"));
} catch (_) {}

console.log(`\n=================================================`);
console.log(`AUDIT COMPLETE: ${passedCount} / ${totalCount} checks PASSED!`);
console.log(`=================================================`);

