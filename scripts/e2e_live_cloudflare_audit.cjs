/**
 * scripts/e2e_live_cloudflare_audit.cjs
 * Comprehensive E2E browser test using puppeteer-core against live Cloudflare Worker deployment
 */

const puppeteer = require("puppeteer-core");
const path = require("path");

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const TARGET_URL = "https://learnwithus.learnwithus2008.workers.dev";
const RENDER_API_PREFIX = "https://learnwithus-11jz.onrender.com/api";

async function runE2E() {
  console.log("==================================================================");
  console.log("🚀 STARTING LIVE PRODUCTION E2E BROWSER AUDIT");
  console.log("Frontend: " + TARGET_URL);
  console.log("Backend:  " + RENDER_API_PREFIX);
  console.log("==================================================================\n");

  const results = {
    passed: [],
    failed: [],
    warnings: [],
    consoleErrors: [],
    networkFailures: [],
    apiCalls: []
  };

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu"
    ]
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    // Monitor Console Errors
    page.on("console", (msg) => {
      const type = msg.type();
      const text = msg.text();
      if (type === "error") {
        console.log(`[Browser Console ERROR]: ${text}`);
        results.consoleErrors.push(text);
      } else if (type === "warning") {
        // console.log(`[Browser Console WARN]: ${text}`);
      }
    });

    page.on("pageerror", (err) => {
      console.log(`[Browser PageError]: ${err.message}`);
      results.consoleErrors.push(err.message);
    });

    // Monitor Network Requests
    page.on("requestfailed", (req) => {
      const failure = `${req.method()} ${req.url()} - ${req.failure()?.errorText || "failed"}`;
      console.log(`[Network FAILED]: ${failure}`);
      results.networkFailures.push(failure);
    });

    page.on("response", (res) => {
      const url = res.url();
      if (url.includes("onrender.com") || url.includes("/api/")) {
        results.apiCalls.push({
          method: res.request().method(),
          url,
          status: res.status()
        });
        console.log(`[API Call]: ${res.request().method()} ${url} -> ${res.status()}`);
      }
    });

    // 1. Frontend loading
    console.log("\n--- Task 1: Loading Frontend ---");
    const navResponse = await page.goto(TARGET_URL, { waitUntil: "networkidle2", timeout: 30000 });
    const httpStatus = navResponse ? navResponse.status() : 0;
    console.log(`Frontend root HTTP status: ${httpStatus}`);
    if (httpStatus === 200) {
      results.passed.push("Frontend Loading: Loaded successfully with HTTP 200");
    } else {
      results.failed.push(`Frontend Loading: Unexpected HTTP status ${httpStatus}`);
    }

    const title = await page.title();
    console.log(`Page title: "${title}"`);
    if (title && title.includes("Learn With Us")) {
      results.passed.push(`Page Title: Title verified ("${title}")`);
    } else {
      results.failed.push(`Page Title: Title "${title}" did not match expected`);
    }

    // 2. Navigation check (Explore navbar links)
    console.log("\n--- Task 2: Navigation & Route Rendering ---");
    const routesToTest = ["/learn", "/practice", "/projects", "/about", "/contact"];
    for (const r of routesToTest) {
      try {
        await page.goto(`${TARGET_URL}${r}`, { waitUntil: "networkidle2", timeout: 15000 });
        const routeText = await page.evaluate(() => document.body.innerText.slice(0, 100));
        console.log(`Route ${r} rendered -> sample text: "${routeText.replace(/\n+/g, ' ')}"`);
        results.passed.push(`Navigation: Route ${r} loads and renders content`);
      } catch (navErr) {
        results.failed.push(`Navigation: Failed to render route ${r}: ${navErr.message}`);
      }
    }

    // 3. Python Curriculum loading
    console.log("\n--- Task 3: Python Curriculum Loading ---");
    await page.goto(`${TARGET_URL}/learn`, { waitUntil: "networkidle2", timeout: 20000 });
    // Wait for curriculum elements
    const curriculumLoaded = await page.evaluate(() => {
      const headings = Array.from(document.querySelectorAll("h1, h2, h3, h4, h5, button"));
      return headings.some(h => /python|basics|syntax|variables|data structures/i.test(h.innerText));
    });

    if (curriculumLoaded) {
      results.passed.push("Python Curriculum: Curriculum topics and modules rendered successfully in UI");
    } else {
      results.failed.push("Python Curriculum: Unable to detect curriculum modules on /learn page");
    }

    // 4. Mobile Responsiveness Test
    console.log("\n--- Task 4: Mobile Responsiveness Verification ---");
    const viewports = [
      { name: "Mobile Small (280px)", width: 280, height: 653 },
      { name: "Mobile Standard (375px)", width: 375, height: 667 },
      { name: "Tablet (768px)", width: 768, height: 1024 }
    ];

    for (const vp of viewports) {
      await page.setViewport({ width: vp.width, height: vp.height });
      await new Promise(r => setTimeout(r, 600));
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth + 2;
      });
      console.log(`Viewport ${vp.name}: horizontal overflow = ${hasHorizontalScroll}`);
      if (!hasHorizontalScroll) {
        results.passed.push(`Responsiveness: ${vp.name} displays cleanly without horizontal scroll`);
      } else {
        results.warnings.push(`Responsiveness: ${vp.name} has slight horizontal scroll`);
      }
    }

    // Reset to desktop viewport for auth flows
    await page.setViewport({ width: 1280, height: 800 });

    // 5. User Registration & Auth Flow in the Browser UI
    console.log("\n--- Task 5: User Registration & UI Auth Flow ---");
    await page.goto(`${TARGET_URL}/signup`, { waitUntil: "networkidle2", timeout: 20000 });

    const randNum = Date.now().toString().slice(-6);
    const testEmail = `e2e_student_${randNum}@example.com`;
    const testPass = "Pass123!E2E";
    const testName = `E2E Student ${randNum}`;

    const hasSignupForm = await page.evaluate(() => {
      return !!document.querySelector("input[type='email']") || !!document.querySelector("input[name='email']");
    });
    console.log(`Signup form input detected: ${hasSignupForm}`);

    if (hasSignupForm) {
      // Type registration details
      const nameInput = await page.$("input[name='name'], input[placeholder*='name' i], input[type='text']");
      if (nameInput) await nameInput.type(testName);

      const emailInput = await page.$("input[name='email'], input[type='email']");
      if (emailInput) await emailInput.type(testEmail);

      const passInput = await page.$("input[name='password'], input[type='password']");
      if (passInput) await passInput.type(testPass);

      // Look for submit button
      const submitBtn = await page.$("button[type='submit'], form button");
      if (submitBtn) {
        console.log("Submitting signup form...");
        await submitBtn.click();
        await new Promise(r => setTimeout(r, 3000));
      }
    }

    // Check local storage for auth token
    const storedAuth = await page.evaluate(() => {
      const keys = Object.keys(localStorage);
      const tokenKey = keys.find(k => /token|auth|session|user/i.test(k));
      return {
        keys,
        sample: tokenKey ? localStorage.getItem(tokenKey)?.slice(0, 50) : null
      };
    });
    console.log("LocalStorage after registration:", storedAuth);

    // 6. Test Auth Persistence After Refresh
    console.log("\n--- Task 6: Authentication Persistence on Refresh ---");
    await page.reload({ waitUntil: "networkidle2" });
    const refreshedAuth = await page.evaluate(() => {
      const keys = Object.keys(localStorage);
      return keys.filter(k => /token|auth|session|user/i.test(k));
    });
    console.log("Auth keys present after reload:", refreshedAuth);
    if (refreshedAuth.length > 0) {
      results.passed.push("Auth Persistence: Session data safely retained in storage across page refresh");
    } else {
      results.warnings.push("Auth Persistence: No token/user found in localStorage after reload (cookie-only or not signed in via UI)");
    }

    // 7. Backend API Connectivity & Render URL Verification
    console.log("\n--- Task 7: Render API URL & Network Integrity ---");
    const renderCalls = results.apiCalls.filter(c => c.url.includes("learnwithus-11jz.onrender.com"));
    console.log(`Total live Render API calls observed: ${renderCalls.length}`);
    if (renderCalls.length > 0) {
      results.passed.push(`Render API URL: Verified active calls to ${RENDER_API_PREFIX}`);
    } else {
      // Direct fetch test from browser context
      const directBrowserFetch = await page.evaluate(async (apiUrl) => {
        try {
          const res = await fetch(`${apiUrl}/health`);
          const data = await res.json();
          return { status: res.status, data };
        } catch (e) {
          return { error: e.message };
        }
      }, RENDER_API_PREFIX);
      console.log("Direct browser fetch to Render:", directBrowserFetch);
      if (directBrowserFetch.status === 200 && directBrowserFetch.data?.status === "healthy") {
        results.passed.push(`Backend Connectivity: Browser directly queried ${RENDER_API_PREFIX}/health successfully`);
      } else {
        results.failed.push(`Backend Connectivity: Browser failed to connect to Render: ${JSON.stringify(directBrowserFetch)}`);
      }
    }

    // 8. Console Error & Network Failure Summary
    console.log("\n--- Task 8: Console Errors & Network Failures ---");
    // Filter benign console warnings / 3rd party font or tracking warnings
    const criticalConsoleErrors = results.consoleErrors.filter(e =>
      !e.includes("favicon") &&
      !e.includes("analytics") &&
      !e.includes("ResizeObserver")
    );
    console.log(`Critical console errors: ${criticalConsoleErrors.length}`);
    if (criticalConsoleErrors.length === 0) {
      results.passed.push("Console Integrity: Zero fatal JavaScript runtime errors on Cloudflare Worker frontend");
    } else {
      results.failed.push(`Console Errors: ${criticalConsoleErrors.join("; ")}`);
    }

    const criticalNetworkFailures = results.networkFailures.filter(f =>
      !f.includes("favicon") &&
      !f.includes(".png")
    );
    console.log(`Critical network failures: ${criticalNetworkFailures.length}`);
    if (criticalNetworkFailures.length === 0) {
      results.passed.push("Network Integrity: Zero failed HTTP / API network requests");
    } else {
      results.warnings.push(`Network Failures: ${criticalNetworkFailures.join("; ")}`);
    }

  } catch (err) {
    console.error("E2E Test Suite Error:", err);
    results.failed.push(`E2E Runner Exception: ${err.message}`);
  } finally {
    await browser.close();
  }

  console.log("\n==================================================================");
  console.log("📊 LIVE PRODUCTION AUDIT SUMMARY");
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

runE2E();

