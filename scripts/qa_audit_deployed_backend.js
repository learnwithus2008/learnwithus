import dotenv from "dotenv";

const DEPLOYED_URL = "https://learnwithus-11jz.onrender.com";

console.log("=================================================================");
console.log(`🔍 STARTING PRODUCTION BACKEND QA AUDIT ON: ${DEPLOYED_URL}`);
console.log("=================================================================\n");

const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  tests: []
};

function recordTest(name, category, status, details = "") {
  results.tests.push({ name, category, status, details });
  if (status === "PASS") {
    results.passed++;
    console.log(`  🟢 PASS: [${category}] ${name} ${details ? `(${details})` : ""}`);
  } else if (status === "FAIL") {
    results.failed++;
    console.log(`  🔴 FAIL: [${category}] ${name} - ${details}`);
  } else if (status === "WARNING") {
    results.warnings++;
    console.log(`  🟡 WARNING: [${category}] ${name} - ${details}`);
  } else {
    console.log(`  ⚪ NOT TESTED: [${category}] ${name}`);
  }
}

async function runAudit() {
  const testEmail = `qa_audit_${Date.now()}@example.com`;
  const testPassword = "QaAuditPassword123!";
  let authToken = null;
  let authCookie = null;

  // -----------------------------------------------------------------
  // 1. HEALTH & CONNECTIVITY CHECK
  // -----------------------------------------------------------------
  console.log("--- TEST SUITE 1: Server Availability & Health Endpoint ---");
  try {
    const res = await fetch(`${DEPLOYED_URL}/api/health`);
    const data = await res.json().catch(() => null);

    if (res.status === 200 && data && data.status === "healthy") {
      recordTest("Health endpoint responds 200 OK", "Availability", "PASS", `Uptime: ${Math.round(data.uptime)}s`);
    } else {
      recordTest("Health endpoint responds 200 OK", "Availability", "FAIL", `Status: ${res.status}, Body: ${JSON.stringify(data)}`);
    }

    if (data?.services?.database === "connected") {
      recordTest("Neon Database connectivity reports connected", "Database", "PASS", "Service state: connected");
    } else {
      recordTest("Neon Database connectivity reports connected", "Database", "FAIL", `Service state: ${data?.services?.database}`);
    }
  } catch (err) {
    recordTest("Health endpoint responds 200 OK", "Availability", "FAIL", err.message);
  }

  // -----------------------------------------------------------------
  // 2. HTTP STATUS & 404 ROUTING CHECKS
  // -----------------------------------------------------------------
  console.log("\n--- TEST SUITE 2: HTTP Status Codes & 404 Handling ---");
  try {
    const res404 = await fetch(`${DEPLOYED_URL}/api/non_existent_route_${Date.now()}`);
    const data404 = await res404.json().catch(() => null);

    if (res404.status === 404 && data404 && data404.success === false) {
      recordTest("Undefined API route returns JSON 404 (not HTML)", "Routing", "PASS", "Returned JSON with success: false");
    } else {
      recordTest("Undefined API route returns JSON 404 (not HTML)", "Routing", "FAIL", `Status: ${res404.status}, Content-Type: ${res404.headers.get("content-type")}`);
    }
  } catch (err) {
    recordTest("Undefined API route returns JSON 404", "Routing", "FAIL", err.message);
  }

  // -----------------------------------------------------------------
  // 3. CORS & PREFLIGHT CHECKS (Cloudflare Pages, Vercel, Localhost)
  // -----------------------------------------------------------------
  console.log("\n--- TEST SUITE 3: CORS Configuration & Preflight (Cloudflare Pages) ---");
  const originsToTest = [
    { origin: "https://learnwithus.pages.dev", label: "Cloudflare Pages default domain" },
    { origin: "https://preview-123.learnwithus.pages.dev", label: "Cloudflare Pages branch preview" },
    { origin: "https://pythonlearning.vercel.app", label: "Production Vercel frontend" },
    { origin: "http://localhost:5173", label: "Local Vite Dev Server" },
    { origin: "https://malicious-phishing-site.com", label: "Untrusted 3rd party domain" }
  ];

  for (const item of originsToTest) {
    try {
      const res = await fetch(`${DEPLOYED_URL}/api/health`, {
        method: "OPTIONS",
        headers: {
          Origin: item.origin,
          "Access-Control-Request-Method": "POST",
          "Access-Control-Request-Headers": "Content-Type,Authorization"
        }
      });

      const allowOrigin = res.headers.get("access-control-allow-origin");
      const allowCreds = res.headers.get("access-control-allow-credentials");

      if (item.origin.includes("malicious")) {
        if (allowOrigin === item.origin && allowCreds === "true") {
          recordTest(`CORS policy on ${item.label}`, "Security/CORS", "WARNING", `Reflects arbitrary origin (${allowOrigin}) with credentials=true`);
        } else {
          recordTest(`CORS policy on ${item.label}`, "Security/CORS", "PASS", "Untrusted origin restricted");
        }
      } else {
        if (allowOrigin === item.origin && allowCreds === "true") {
          recordTest(`CORS preflight for ${item.label}`, "CORS", "PASS", `Origin reflected with credentials=true`);
        } else {
          recordTest(`CORS preflight for ${item.label}`, "CORS", "FAIL", `Allow-Origin: ${allowOrigin}, Allow-Creds: ${allowCreds}`);
        }
      }
    } catch (err) {
      recordTest(`CORS preflight for ${item.label}`, "CORS", "FAIL", err.message);
    }
  }

  // -----------------------------------------------------------------
  // 4. SECURITY HEADERS AUDIT
  // -----------------------------------------------------------------
  console.log("\n--- TEST SUITE 4: Security Headers & Information Exposure ---");
  try {
    const res = await fetch(`${DEPLOYED_URL}/api/health`);
    const xPoweredBy = res.headers.get("x-powered-by");
    const nosniff = res.headers.get("x-content-type-options");
    const frameOptions = res.headers.get("x-frame-options");

    if (xPoweredBy) {
      recordTest("X-Powered-By header suppression", "Security", "WARNING", `Leaking technology signature: ${xPoweredBy}`);
    } else {
      recordTest("X-Powered-By header suppression", "Security", "PASS", "Header suppressed");
    }

    if (nosniff) {
      recordTest("X-Content-Type-Options: nosniff header", "Security", "PASS", nosniff);
    } else {
      recordTest("X-Content-Type-Options: nosniff header", "Security", "WARNING", "Missing nosniff header");
    }
  } catch (err) {
    recordTest("Security headers check", "Security", "FAIL", err.message);
  }

  // -----------------------------------------------------------------
  // 5. AUTHENTICATION LIFECYCLE (REGISTER, LOGIN, ME, COOKIE, TOKEN)
  // -----------------------------------------------------------------
  console.log("\n--- TEST SUITE 5: Authentication & Session Management ---");
  try {
    // A. Registration
    const regRes = await fetch(`${DEPLOYED_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "QA Audit User",
        email: testEmail,
        password: testPassword,
        stage: "college",
        language: "english"
      })
    });
    const regData = await regRes.json();
    const setCookie = regRes.headers.get("set-cookie");

    if (regRes.status === 201 && regData.success && regData.data?.token) {
      authToken = regData.data.token;
      recordTest("User registration creates account and session token", "Auth", "PASS", `User ID: ${regData.data.user?.id}`);
    } else {
      recordTest("User registration creates account and session token", "Auth", "FAIL", `Status: ${regRes.status}, Error: ${regData.error || JSON.stringify(regData)}`);
    }

    // Cookie audit
    if (setCookie) {
      authCookie = setCookie.split(";")[0];
      const isHttpOnly = setCookie.toLowerCase().includes("httponly");
      const isSecure = setCookie.toLowerCase().includes("secure");
      const isSameSiteNone = setCookie.toLowerCase().includes("samesite=none");

      if (isHttpOnly && isSecure) {
        recordTest("Session cookie security flags (HttpOnly & Secure)", "Security/Cookies", "PASS", `Flags: HttpOnly=${isHttpOnly}, Secure=${isSecure}, SameSite=None=${isSameSiteNone}`);
      } else {
        recordTest("Session cookie security flags (HttpOnly & Secure)", "Security/Cookies", "WARNING", `Cookie: ${setCookie}`);
      }
    } else {
      recordTest("Session cookie emitted in Set-Cookie header", "Security/Cookies", "WARNING", "No Set-Cookie header received; Bearer token fallback available");
    }

    // Password hash exposure check
    if (regData.data?.user && !regData.data.user.password && !regData.data.user.password_hash) {
      recordTest("Password hash not exposed in API response", "Security", "PASS", "Response contains no password fields");
    } else {
      recordTest("Password hash not exposed in API response", "Security", "FAIL", "Password hash was leaked in user object!");
    }

    // B. Duplicate registration check
    const dupRes = await fetch(`${DEPLOYED_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "QA Audit Duplicate",
        email: testEmail,
        password: testPassword,
        stage: "college"
      })
    });
    if (dupRes.status === 409) {
      recordTest("Duplicate email registration rejection (409 Conflict)", "Auth", "PASS", "Proper conflict status returned");
    } else {
      recordTest("Duplicate email registration rejection (409 Conflict)", "Auth", "FAIL", `Expected 409, got ${dupRes.status}`);
    }

    // C. Get Current User with Bearer token header
    if (authToken) {
      const meRes = await fetch(`${DEPLOYED_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const meData = await meRes.json();
      if (meRes.status === 200 && meData.data?.user?.email?.toLowerCase() === testEmail.toLowerCase()) {
        recordTest("Bearer token authorization header (/api/auth/me)", "Auth", "PASS", `User: ${meData.data.user.email}`);
      } else {
        recordTest("Bearer token authorization header (/api/auth/me)", "Auth", "FAIL", `Status: ${meRes.status}`);
      }
    }

    // D. Login with valid credentials
    const loginRes = await fetch(`${DEPLOYED_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        emailOrUsername: testEmail,
        password: testPassword
      })
    });
    const loginData = await loginRes.json();
    if (loginRes.status === 200 && loginData.success && loginData.data?.token) {
      recordTest("Login with valid credentials", "Auth", "PASS", `Session renewed`);
    } else {
      recordTest("Login with valid credentials", "Auth", "FAIL", `Status: ${loginRes.status}, Error: ${loginData.error}`);
    }

    // E. Login with invalid password
    const badLoginRes = await fetch(`${DEPLOYED_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        emailOrUsername: testEmail,
        password: "WrongPassword999!"
      })
    });
    if (badLoginRes.status === 401) {
      recordTest("Login rejection on invalid credentials (401 Unauthorized)", "Auth", "PASS", "Proper 401 code");
    } else {
      recordTest("Login rejection on invalid credentials (401 Unauthorized)", "Auth", "FAIL", `Expected 401, got ${badLoginRes.status}`);
    }

  } catch (err) {
    recordTest("Authentication Lifecycle", "Auth", "FAIL", err.message);
  }

  // -----------------------------------------------------------------
  // 6. FUNCTIONAL API CHECKS (PROGRESS, REWARDS, DOUBTS)
  // -----------------------------------------------------------------
  console.log("\n--- TEST SUITE 6: Functional APIs (Progress, Rewards, Doubt Credits) ---");
  if (authToken) {
    try {
      // User Profile
      const profRes = await fetch(`${DEPLOYED_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const profData = await profRes.json();
      if (profRes.status === 200 && profData.success) {
        recordTest("GET /api/users/me profile", "Functional", "PASS", `Stage: ${profData.data?.user?.learning_stage}`);
      } else {
        recordTest("GET /api/users/me profile", "Functional", "FAIL", `Status: ${profRes.status}`);
      }

      // Progress API
      const progRes = await fetch(`${DEPLOYED_URL}/api/progress`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const progData = await progRes.json();
      if (progRes.status === 200 && progData.success) {
        recordTest("GET /api/progress", "Functional", "PASS", `Completed count: ${progData.data?.completedTopics?.length ?? 0}`);
      } else {
        recordTest("GET /api/progress", "Functional", "FAIL", `Status: ${progRes.status}`);
      }

      // Rewards API
      const rewRes = await fetch(`${DEPLOYED_URL}/api/rewards`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const rewData = await rewRes.json();
      if (rewRes.status === 200 && rewData.success) {
        recordTest("GET /api/rewards", "Functional", "PASS", `Total XP: ${rewData.data?.totalXp}`);
      } else {
        recordTest("GET /api/rewards", "Functional", "FAIL", `Status: ${rewRes.status}`);
      }

      // Doubt Credits API
      const doubtRes = await fetch(`${DEPLOYED_URL}/api/doubts/balance`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const doubtData = await doubtRes.json();
      if (doubtRes.status === 200 && doubtData.success && doubtData.data?.doubtCredits === 10) {
        recordTest("GET /api/doubts/balance (Initial 10 Free Doubts)", "Functional/Doubts", "PASS", `Credits: ${doubtData.data?.doubtCredits}, Free: ${doubtData.data?.freeDoubtsTotal}`);
      } else {
        recordTest("GET /api/doubts/balance", "Functional/Doubts", "FAIL", `Status: ${doubtRes.status}, Data: ${JSON.stringify(doubtData)}`);
      }

      // Doubt Tickets API
      const tickRes = await fetch(`${DEPLOYED_URL}/api/doubts/my-tickets`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      const tickData = await tickRes.json();
      if (tickRes.status === 200 && tickData.success && Array.isArray(tickData.data)) {
        recordTest("GET /api/doubts/my-tickets", "Functional/Doubts", "PASS", `Tickets: ${tickData.data.length}`);
      } else {
        recordTest("GET /api/doubts/my-tickets", "Functional/Doubts", "FAIL", `Status: ${tickRes.status}`);
      }

      // Admin access control (Student should get 403 Forbidden on /api/admin/overview)
      const adminRes = await fetch(`${DEPLOYED_URL}/api/admin/overview`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (adminRes.status === 403) {
        recordTest("Admin role authorization guard (403 Forbidden for students)", "Security/RBAC", "PASS", "Non-admin blocked from admin endpoints");
      } else {
        recordTest("Admin role authorization guard (403 Forbidden for students)", "Security/RBAC", "FAIL", `Expected 403, got ${adminRes.status}`);
      }

      // Clean up: delete QA test account via DELETE /api/users/me
      const delRes = await fetch(`${DEPLOYED_URL}/api/users/me`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (delRes.status === 200) {
        recordTest("Clean up QA test account via DELETE /api/users/me", "Cleanup", "PASS", "Test record removed cleanly");
      } else {
        recordTest("Clean up QA test account via DELETE /api/users/me", "Cleanup", "WARNING", `Status: ${delRes.status}`);
      }

    } catch (err) {
      recordTest("Functional API tests", "Functional", "FAIL", err.message);
    }
  } else {
    recordTest("Functional API tests skipped due to auth failure", "Functional", "FAIL", "No auth token");
  }

  // -----------------------------------------------------------------
  // 7. INPUT VALIDATION & SQL INJECTION ROBUSTNESS
  // -----------------------------------------------------------------
  console.log("\n--- TEST SUITE 7: SQL Injection & Input Validation ---");
  try {
    const sqliPayload = "' OR '1'='1' --";
    const sqliRes = await fetch(`${DEPLOYED_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: `admin${sqliPayload}@example.com`,
        password: "password123"
      })
    });
    // Zod validator or parameterized query should reject without DB error
    if (sqliRes.status === 400 || sqliRes.status === 401) {
      recordTest("SQL injection payload in login is safely rejected", "Security/SQLi", "PASS", `Safely rejected with HTTP ${sqliRes.status}`);
    } else {
      recordTest("SQL injection payload in login is safely rejected", "Security/SQLi", "FAIL", `Unexpected status ${sqliRes.status}`);
    }
  } catch (err) {
    recordTest("SQL injection test", "Security/SQLi", "FAIL", err.message);
  }

  // -----------------------------------------------------------------
  // SUMMARY REPORT
  // -----------------------------------------------------------------
  console.log("\n=================================================================");
  console.log("📊 PRODUCTION BACKEND QA AUDIT SUMMARY");
  console.log("=================================================================");
  console.log(`Total Tests Run : ${results.passed + results.failed + results.warnings}`);
  console.log(`Passed          : ${results.passed}`);
  console.log(`Failed          : ${results.failed}`);
  console.log(`Warnings        : ${results.warnings}`);
  const passRate = Math.round((results.passed / (results.passed + results.failed)) * 100);
  console.log(`Pass Rate       : ${passRate}% (excluding non-blocking warnings)`);
  console.log("=================================================================\n");
}

runAudit().catch(console.error);
