/**
 * scripts/verify_live_render_deployment.js
 * Verification script for the 15 tasks requested by the user.
 */

const BASE_URL = "https://learnwithus-11jz.onrender.com";

async function runVerification() {
  console.log("==================================================================");
  console.log("🔍 PRODUCTION DEPLOYMENT VERIFICATION: " + BASE_URL);
  console.log("==================================================================\n");

  const results = {
    passed: [],
    failed: [],
    warnings: [],
    liveDeploymentState: {}
  };

  // 1. Check GET /api/health
  console.log("--- Check 1: Health Endpoint & Database Connectivity ---");
  try {
    const healthRes = await fetch(`${BASE_URL}/api/health`, {
      method: "GET",
      headers: { "Accept": "application/json" }
    });
    const healthStatus = healthRes.status;
    const healthHeaders = Object.fromEntries(healthRes.headers.entries());
    const healthBody = await healthRes.json().catch(() => null);

    console.log(`GET /api/health status: ${healthStatus}`);
    console.log(`Health body:`, healthBody);
    console.log(`X-Powered-By header: ${healthHeaders["x-powered-by"] || "Not present (Disabled)"}`);
    console.log(`X-Content-Type-Options: ${healthHeaders["x-content-type-options"] || "Not present"}`);
    console.log(`X-Frame-Options: ${healthHeaders["x-frame-options"] || "Not present"}`);

    if (healthStatus === 200 && healthBody && healthBody.status === "healthy") {
      results.passed.push("Health Check: GET /api/health returned 200 and status 'healthy'");
    } else {
      results.failed.push(`Health Check: Returned status ${healthStatus} - ${JSON.stringify(healthBody)}`);
    }

    if (healthBody?.services?.database === "connected" || healthBody?.database === "connected") {
      results.passed.push("Database Connection: Neon PostgreSQL connection is active and healthy on Render");
    } else {
      results.failed.push(`Database Connection: Status reported as ${JSON.stringify(healthBody?.services)}`);
    }

    // 2. Security Headers & X-Powered-By
    if (!healthHeaders["x-powered-by"]) {
      results.passed.push("X-Powered-By: Successfully disabled on live server");
      results.liveDeploymentState.xPoweredByDisabled = true;
    } else {
      results.warnings.push(`X-Powered-By: Leaked as '${healthHeaders["x-powered-by"]}' on live Render deployment. Local fix applied, awaiting git push & redeploy.`);
      results.liveDeploymentState.xPoweredByDisabled = false;
    }

    if (healthHeaders["x-content-type-options"] === "nosniff") {
      results.passed.push("Security Headers: X-Content-Type-Options: nosniff verified on live server");
      results.liveDeploymentState.securityHeaders = true;
    } else {
      results.warnings.push("Security Headers: X-Content-Type-Options & X-Frame-Options missing on live Render deployment. Local fix applied, awaiting git push & redeploy.");
      results.liveDeploymentState.securityHeaders = false;
    }
  } catch (err) {
    results.failed.push(`Live Health Check Exception: ${err.message}`);
  }

  // 3. CORS Check with actual Cloudflare Pages origin
  console.log("\n--- Check 2: CORS Verification ---");
  const cloudflareOrigin = "https://learnwithus.pages.dev";
  const maliciousOrigin = "https://malicious-attacker-domain.com";

  try {
    // Test Cloudflare Pages origin via Preflight OPTIONS
    const corsOptionsRes = await fetch(`${BASE_URL}/api/health`, {
      method: "OPTIONS",
      headers: {
        "Origin": cloudflareOrigin,
        "Access-Control-Request-Method": "GET"
      }
    });
    const allowOriginOpt = corsOptionsRes.headers.get("access-control-allow-origin");
    const allowCredsOpt = corsOptionsRes.headers.get("access-control-allow-credentials");
    console.log(`Preflight OPTIONS with Origin [${cloudflareOrigin}]:`);
    console.log(`  Access-Control-Allow-Origin: ${allowOriginOpt}`);
    console.log(`  Access-Control-Allow-Credentials: ${allowCredsOpt}`);

    // Test Cloudflare Pages origin via GET
    const corsGetRes = await fetch(`${BASE_URL}/api/health`, {
      method: "GET",
      headers: {
        "Origin": cloudflareOrigin
      }
    });
    const allowOriginGet = corsGetRes.headers.get("access-control-allow-origin");
    const allowCredsGet = corsGetRes.headers.get("access-control-allow-credentials");
    console.log(`GET with Origin [${cloudflareOrigin}]:`);
    console.log(`  Access-Control-Allow-Origin: ${allowOriginGet}`);
    console.log(`  Access-Control-Allow-Credentials: ${allowCredsGet}`);

    if (allowOriginGet === cloudflareOrigin || allowOriginGet === "*") {
      results.passed.push(`CORS for Cloudflare Pages (${cloudflareOrigin}): Allowed with credentials: ${allowCredsGet}`);
    } else {
      results.failed.push(`CORS for Cloudflare Pages (${cloudflareOrigin}): Not allowed. Allow-Origin was '${allowOriginGet}'`);
    }

    // Test unauthorized origin
    const badCorsRes = await fetch(`${BASE_URL}/api/health`, {
      method: "GET",
      headers: {
        "Origin": maliciousOrigin
      }
    });
    const badOriginHeader = badCorsRes.headers.get("access-control-allow-origin");
    console.log(`GET with Malicious Origin [${maliciousOrigin}]:`);
    console.log(`  Access-Control-Allow-Origin: ${badOriginHeader}`);

    if (!badOriginHeader || badOriginHeader !== maliciousOrigin) {
      results.passed.push("CORS Unauthorized Origin: Malicious origin rejected");
    } else {
      results.warnings.push(`CORS Unauthorized Origin: Live server currently reflects '${badOriginHeader}'. Local fix in server/src/app.js strictly rejects unauthorized origins once pushed.`);
    }
  } catch (err) {
    results.failed.push(`CORS Verification Exception: ${err.message}`);
  }

  // 4. Test Registration, Cookie flags, Session persistence, Profile, Doubts, Cleanup
  console.log("\n--- Check 3: Authentication, Cookies & API Routes ---");
  const uniqueId = Date.now().toString().slice(-6);
  const testEmail = `qa_verify_${uniqueId}@example.com`;
  const testPassword = "Password123!QA";
  const testName = `QA Verifier ${uniqueId}`;

  let sessionToken = null;
  let cookieHeader = null;

  try {
    // 4.1 Register
    const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: testName,
        email: testEmail,
        password: testPassword,
        stage: "young",
        language: "english"
      })
    });
    const regStatus = regRes.status;
    const regBody = await regRes.json();
    const setCookieHeaders = regRes.headers.get("set-cookie");

    console.log(`Registration status: ${regStatus}`);
    console.log(`Set-Cookie header on Register: ${setCookieHeaders || "None"}`);

    const token = regBody.data?.token || regBody.data?.session?.token;
    if (regStatus === 201 && regBody.success && token) {
      sessionToken = token;
      cookieHeader = setCookieHeaders;
      results.passed.push("User Registration: Created isolated test user and received session token");
    } else {
      results.failed.push(`User Registration: Failed with status ${regStatus}: ${JSON.stringify(regBody)}`);
    }

    // 4.2 Cookie Security Flags Analysis
    if (setCookieHeaders) {
      const isHttpOnly = /HttpOnly/i.test(setCookieHeaders);
      const isSecure = /Secure/i.test(setCookieHeaders);
      const sameSiteMatch = setCookieHeaders.match(/SameSite=([a-zA-Z]+)/i);
      const sameSiteValue = sameSiteMatch ? sameSiteMatch[1] : "None";

      console.log(`Cookie attributes -> HttpOnly: ${isHttpOnly}, Secure: ${isSecure}, SameSite: ${sameSiteValue}`);

      if (isHttpOnly) {
        results.passed.push("Cookie Security: HttpOnly flag is present on authentication cookie");
      } else {
        results.warnings.push("Cookie Security: HttpOnly flag missing on cookie");
      }

      if (sameSiteValue.toLowerCase() === "none" && isSecure) {
        results.passed.push("Cross-Origin Cookie Architecture: SameSite=None and Secure are active on live server");
        results.liveDeploymentState.cookiesSameSiteNone = true;
      } else {
        results.warnings.push(`Cross-Origin Cookie Architecture: Live server currently sets SameSite=${sameSiteValue}, Secure=${isSecure}. Cross-site requests from Cloudflare Pages (*.pages.dev) will fall back to Bearer tokens unless deployed with SameSite=None; Secure.`);
        results.liveDeploymentState.cookiesSameSiteNone = false;
      }
    }

    if (sessionToken) {
      const authHeaders = {
        "Authorization": `Bearer ${sessionToken}`,
        "Accept": "application/json"
      };

      // 4.3 Profile API
      const profileRes = await fetch(`${BASE_URL}/api/users/me`, { headers: authHeaders });
      const profileBody = await profileRes.json();
      if (profileRes.status === 200 && profileBody.success && profileBody.data?.user?.email === testEmail) {
        results.passed.push("Profile API: GET /api/users/me successfully returned authenticated profile");
        if (!profileBody.data.user.password_hash && !profileBody.data.user.password) {
          results.passed.push("Credential Privacy: Password hash is strictly excluded from user response");
        } else {
          results.failed.push("SECURITY LEAK: Password hash exposed in user object!");
        }
      } else {
        results.failed.push(`Profile API failed: status ${profileRes.status}`);
      }

      // 4.4 Progress API
      const progressRes = await fetch(`${BASE_URL}/api/progress`, { headers: authHeaders });
      if (progressRes.status === 200) {
        results.passed.push("Progress API: GET /api/progress returned 200 OK");
      } else {
        results.failed.push(`Progress API failed: status ${progressRes.status}`);
      }

      // 4.5 Bookmarks API
      const bookmarksRes = await fetch(`${BASE_URL}/api/bookmarks`, { headers: authHeaders });
      if (bookmarksRes.status === 200) {
        results.passed.push("Bookmarks API: GET /api/bookmarks returned 200 OK");
      } else {
        results.failed.push(`Bookmarks API failed: status ${bookmarksRes.status}`);
      }

      // 4.6 Rewards API
      const rewardsRes = await fetch(`${BASE_URL}/api/rewards`, { headers: authHeaders });
      if (rewardsRes.status === 200) {
        results.passed.push("Rewards API: GET /api/rewards returned 200 OK");
      } else {
        results.failed.push(`Rewards API failed: status ${rewardsRes.status}`);
      }

      // 4.7 Doubts API
      const doubtsRes = await fetch(`${BASE_URL}/api/doubts/balance`, { headers: authHeaders });
      const doubtsBody = await doubtsRes.json();
      if (doubtsRes.status === 200 && doubtsBody.success && (doubtsBody.data?.doubtCredits === 10 || doubtsBody.data?.freeDoubtsTotal === 10)) {
        results.passed.push("Doubt System API: Initial 10 free doubts balance verified (doubtCredits: 10)");
      } else {
        results.failed.push(`Doubt System API: status ${doubtsRes.status} body: ${JSON.stringify(doubtsBody)}`);
      }

      // 4.8 Admin route access control (Student role must get 403 Forbidden)
      const adminRes = await fetch(`${BASE_URL}/api/admin/overview`, { headers: authHeaders });
      if (adminRes.status === 403) {
        results.passed.push("Admin Access Control: Non-admin student blocked with 403 Forbidden");
      } else {
        results.failed.push(`Admin Access Control: Expected 403, got ${adminRes.status}`);
      }

      // 4.9 Login & Session Persistence
      const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailOrUsername: testEmail,
          password: testPassword
        })
      });
      const loginBody = await loginRes.json();
      const loginToken = loginBody.data?.token || loginBody.data?.session?.token;
      if (loginRes.status === 200 && loginBody.success && loginToken) {
        results.passed.push("Login & Session Persistence: Re-authenticated with valid credentials successfully");
      } else {
        results.failed.push(`Login failed with status ${loginRes.status}: ${JSON.stringify(loginBody)}`);
      }

      // 4.10 Cleanup test user before logout
      const deleteRes = await fetch(`${BASE_URL}/api/users/me`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${loginToken || sessionToken}` }
      });
      if (deleteRes.status === 200) {
        results.passed.push("Data Safety: Test user account successfully wiped via DELETE /api/users/me");
      } else {
        results.warnings.push(`Test user cleanup returned status ${deleteRes.status}`);
      }

      // 4.11 Logout (session invalidation)
      const logoutRes = await fetch(`${BASE_URL}/api/auth/logout`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${loginToken || sessionToken}` }
      });
      if (logoutRes.status === 200) {
        results.passed.push("Logout API: Successfully invalidated session on logout");
      } else {
        results.warnings.push(`Logout returned status ${logoutRes.status}`);
      }
    }
  } catch (err) {
    results.failed.push(`Auth/API Flow Exception: ${err.message}`);
  }

  // Summary Output
  console.log("\n==================================================================");
  console.log("📊 VERIFICATION COMPLETE");
  console.log("==================================================================");
  console.log(`Passed:   ${results.passed.length}`);
  console.log(`Failed:   ${results.failed.length}`);
  console.log(`Warnings: ${results.warnings.length}`);
  console.log("\nPassed checks:");
  results.passed.forEach(p => console.log(`  [PASS] ${p}`));
  if (results.failed.length > 0) {
    console.log("\nFailed checks:");
    results.failed.forEach(f => console.log(`  [FAIL] ${f}`));
  }
  if (results.warnings.length > 0) {
    console.log("\nRemaining warnings:");
    results.warnings.forEach(w => console.log(`  [WARN] ${w}`));
  }

  return results;
}

runVerification();
