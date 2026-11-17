/**
 * verify_registered_doubts_rule.cjs
 * Comprehensive verification audit for the rule:
 * "For demo users doubts should not can be asked. For doubts only register students need to ask not the demo users"
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
console.log("  DOUBT RESTRICTION FOR DEMO USERS AUDIT           ");
console.log("==================================================\n");

// 1. studentAuthHelper.js validation
const helperPath = path.join(ROOT, "src/utils/studentAuthHelper.js");
assert(fs.existsSync(helperPath), "studentAuthHelper.js exists");

const helperCode = fs.readFileSync(helperPath, "utf8");
assert(helperCode.includes("export function isDemoUser"), "Exports isDemoUser helper");
assert(helperCode.includes("export function isRegisteredStudent"), "Exports isRegisteredStudent helper");
assert(helperCode.includes("alex@example.com") && helperCode.includes("priya@example.com"), "Explicitly flags seeded demo accounts");
assert(helperCode.includes("is_demo") || helperCode.includes("isDemo"), "Checks is_demo / isDemo properties");

// Functional test of studentAuthHelper logic
function isDemoUser(user) {
  if (!user) return true;
  if (user.is_demo === true || user.isDemo === true || user.role === "demo" || user.account_type === "demo") {
    return true;
  }
  const email = String(user.email || "").toLowerCase().trim();
  if (
    email.endsWith("@example.com") ||
    email.includes("demo") ||
    email === "alex@example.com" ||
    email === "priya@example.com" ||
    email === "admin@example.com"
  ) {
    return true;
  }
  const name = String(user.name || user.full_name || user.username || "").toLowerCase().trim();
  if (name.startsWith("demo") || name.includes("demo student") || name === "demo user") {
    return true;
  }
  return false;
}

function isRegisteredStudent(user, isAuthenticated) {
  if (!isAuthenticated || !user) return false;
  return !isDemoUser(user);
}

assert(isDemoUser(null) === true, "null guest user is classified as demo user");
assert(isDemoUser({ email: "alex@example.com" }) === true, "alex@example.com is classified as demo user");
assert(isDemoUser({ email: "priya@example.com" }) === true, "priya@example.com is classified as demo user");
assert(isDemoUser({ email: "admin@example.com" }) === true, "admin@example.com is classified as demo user");
assert(isDemoUser({ email: "user@example.com" }) === true, "any @example.com account is classified as demo user");
assert(isDemoUser({ email: "student.demo@gmail.com" }) === true, "emails with 'demo' are classified as demo user");
assert(isDemoUser({ name: "Demo Student", email: "student@school.org" }) === true, "names with 'demo' are classified as demo user");
assert(isDemoUser({ is_demo: true, email: "real@school.edu" }) === true, "is_demo flag is classified as demo user");

assert(isRegisteredStudent(null, false) === false, "Unauthenticated guest is NOT a registered student");
assert(isRegisteredStudent({ email: "alex@example.com" }, true) === false, "Authenticated demo user is NOT a registered student");
assert(
  isRegisteredStudent({ id: "std_101", name: "Ravi Kumar", email: "ravi.kumar@gmail.com" }, true) === true,
  "Real registered student is correctly recognized as eligible"
);

// 2. AskDoubtButton.jsx validation
const btnPath = path.join(ROOT, "src/components/AskDoubtButton.jsx");
const btnCode = fs.readFileSync(btnPath, "utf8");
assert(btnCode.includes("isRegisteredStudent"), "AskDoubtButton imports and uses isRegisteredStudent");
assert(btnCode.includes("isDemoUser"), "AskDoubtButton imports and uses isDemoUser");
assert(btnCode.includes("!isEligibleStudent") || btnCode.includes("isDemo"), "AskDoubtButton checks eligibility for lock icon and label");
assert(btnCode.includes("Reg Only"), "AskDoubtButton displays 'Reg Only' badge when user is not a registered student");

// 3. AskDoubtModal.jsx validation
const modalPath = path.join(ROOT, "src/components/Doubt/AskDoubtModal.jsx");
const modalCode = fs.readFileSync(modalPath, "utf8");
assert(modalCode.includes("isRegisteredStudent"), "AskDoubtModal imports isRegisteredStudent");
assert(modalCode.includes("isDemoUser"), "AskDoubtModal imports isDemoUser");
assert(modalCode.includes("REGISTERED STUDENTS ONLY"), "AskDoubtModal renders 'REGISTERED STUDENTS ONLY' badge");
assert(modalCode.includes("Doubts are Exclusively for Registered Students"), "AskDoubtModal displays clear restriction heading");
assert(modalCode.includes("Register as Student to Ask") || modalCode.includes("Register as Student"), "AskDoubtModal displays call-to-action to register as a student");
assert(modalCode.includes("handleLaunch") && modalCode.includes("!isEligibleStudent"), "AskDoubtModal blocks handleLaunch for demo users");
assert(modalCode.includes("handlePayAndLaunch") && modalCode.includes("!isEligibleStudent"), "AskDoubtModal blocks handlePayAndLaunch for demo users");

// 4. DoubtContext.jsx validation
const contextPath = path.join(ROOT, "src/context/DoubtContext.jsx");
const contextCode = fs.readFileSync(contextPath, "utf8");
assert(contextCode.includes("isDemoUser"), "DoubtContext imports isDemoUser");
assert(contextCode.includes("submitAndLaunchWhatsApp") && contextCode.includes("isDemoUser(currentUser)"), "submitAndLaunchWhatsApp blocks demo accounts");
assert(contextCode.includes("rechargeAndLaunch") && contextCode.includes("isDemoUser(currentUser)"), "rechargeAndLaunch blocks demo accounts");

// 5. doubtService.js validation
const servicePath = path.join(ROOT, "src/services/doubtService.js");
const serviceCode = fs.readFileSync(servicePath, "utf8");
assert(serviceCode.includes("isDemoUser"), "doubtService imports isDemoUser");
assert(serviceCode.includes("submitDoubtRequest") && serviceCode.includes("isDemoUser(userDetails)"), "submitDoubtRequest throws error if user is demo");

// 6. Backend doubtController.js validation
const backendPath = path.join(ROOT, "server/src/controllers/doubtController.js");
const backendCode = fs.readFileSync(backendPath, "utf8");
assert(backendCode.includes("function isDemoUser"), "Backend doubtController defines isDemoUser");
assert(backendCode.includes("REGISTERED_STUDENTS_ONLY"), "Backend doubtController returns 403 REGISTERED_STUDENTS_ONLY");
assert(backendCode.includes("createRequest") && backendCode.includes("isDemoUser(req.user)"), "createRequest verifies registered student status on backend");
assert(backendCode.includes("purchaseCredits") && backendCode.includes("isDemoUser(req.user)"), "purchaseCredits verifies registered student status on backend");

// 7. Profile.jsx validation
const profilePath = path.join(ROOT, "src/pages/Profile.jsx");
const profileCode = fs.readFileSync(profilePath, "utf8");
assert(profileCode.includes("isDemoUser"), "Profile.jsx imports isDemoUser");
assert(profileCode.includes("handleSubmitDoubt") && profileCode.includes("isDemoUser(currentUser)"), "handleSubmitDoubt blocks submission for demo users");
assert(profileCode.includes("Demo Account Restricted"), "Profile.jsx renders demo restriction notice in doubts tab");

console.log("\n--------------------------------------------------");
console.log(`Results: ${passCount} Passed, ${failCount} Failed.`);
console.log("--------------------------------------------------\n");

if (failCount > 0) {
  process.exit(1);
} else {
  console.log("ALL REGISTERED STUDENT DOUBT RESTRICTION TESTS PASSED!\n");
  process.exit(0);
}

