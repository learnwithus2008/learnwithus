/**
 * studentAuthHelper.js
 * Centralized authorization rules for LearnWithUs students and demo accounts.
 *
 * Mandatory Business Rule:
 * Only REGISTERED students can ask doubts.
 * Demo users (demo accounts, sample logins, unauthenticated visitors) CANNOT ask doubts.
 */

/**
 * Checks whether a given user object represents a demo account or unregistered visitor.
 * @param {Object|null} user - The user object from session/auth context
 * @returns {boolean} True if the user is a demo user or null
 */
export function isDemoUser(user) {
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

/**
 * Checks whether a user is an authenticated registered student eligible to ask doubts.
 * @param {Object|null} user
 * @param {boolean} isAuthenticated
 * @returns {boolean} True only if user is logged in with a real, registered non-demo account
 */
export function isRegisteredStudent(user, isAuthenticated) {
  if (!isAuthenticated || !user) return false;
  return !isDemoUser(user);
}

/**
 * Standard user-facing message explaining the registered-students-only doubt policy.
 */
export const DOUBT_DEMO_RESTRICTION_MESSAGE =
  "Doubt clearing with 1-on-1 mentor support is exclusively reserved for registered students. Demo users cannot ask doubts. Please register or sign in with your student account.";

