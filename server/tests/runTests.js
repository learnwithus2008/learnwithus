import { runMigrations } from "../migrations/migrate.js";
import { config } from "../src/config/env.js";
import { pool } from "../src/config/db.js";
import { testAuth } from "./auth.test.js";
import { testProgress } from "./progress.test.js";
import { testBookmarks } from "./bookmarks.test.js";
import { testSecurity } from "./security.test.js";
import { testAdmin } from "./admin.test.js";

async function runAllTests() {
  console.log("=================================================");
  console.log("🚀 STARTING AUTOMATED BACKEND INTEGRATION TESTS");
  console.log("=================================================\n");

  const results = [];

  // Ensure DB & migrations are current
  console.log("Initializing test database...");
  await runMigrations(config.databaseUrl);
  console.log("Database initialized.\n");

  try {
    console.log("--- SUITE 1: Authentication & Sessions ---");
    const authResults = await testAuth();
    results.push(...authResults);

    console.log("\n--- SUITE 2: Learning Progress & Rewards ---");
    const progressResults = await testProgress();
    results.push(...progressResults);

    console.log("\n--- SUITE 3: Bookmarks & Isolation ---");
    const bookmarkResults = await testBookmarks();
    results.push(...bookmarkResults);

    console.log("\n--- SUITE 4: Security & Parameterization ---");
    const securityResults = await testSecurity();
    results.push(...securityResults);

    console.log("\n--- SUITE 5: Admin Panel & User Status Management ---");
    const adminResults = await testAdmin();
    results.push(...adminResults);
  } finally {
    await pool.end();
  }

  console.log("\n=================================================");
  console.log("📊 TEST EXECUTION SUMMARY");
  console.log("=================================================");

  let passed = 0;
  let failed = 0;

  for (const r of results) {
    if (r.passed) {
      passed++;
      console.log(`  🟢 PASS: ${r.name}`);
    } else {
      failed++;
      console.error(`  🔴 FAIL: ${r.name} -> ${r.error}`);
    }
  }

  console.log("\n-------------------------------------------------");
  console.log(`Total: ${results.length} | Passed: ${passed} | Failed: ${failed}`);
  console.log("=================================================\n");

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runAllTests().catch((err) => {
  console.error("Test runner encountered a critical error:", err);
  process.exit(1);
});
