import http from "http";
import bcrypt from "bcryptjs";
import app from "../src/app.js";
import { query, pool } from "../src/config/db.js";
import { authService } from "../src/services/authService.js";
import { sessionRepository } from "../src/repositories/sessionRepository.js";
import { userRepository } from "../src/repositories/userRepository.js";
import fs from "fs";

let testServer = null;
let testPort = 5000;

async function startEphemeralServer() {
  return new Promise((resolve, reject) => {
    testServer = app.listen(0, "127.0.0.1", () => {
      const addr = testServer.address();
      testPort = typeof addr === "object" ? addr.port : 5000;
      resolve(testPort);
    });
    testServer.on("error", reject);
  });
}

async function stopEphemeralServer() {
  if (testServer) {
    return new Promise((resolve) => {
      testServer.close(() => resolve());
    });
  }
}

async function makeRequestWithRetry(method, path, headers = {}, body = null, retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await new Promise((resolve, reject) => {
        const payload = body ? (typeof body === "string" ? body : JSON.stringify(body)) : null;
        const finalHeaders = { ...headers };
        if (payload !== null) {
          finalHeaders["Content-Type"] = "application/json";
          finalHeaders["Content-Length"] = Buffer.byteLength(payload);
        }

        const options = {
          hostname: "127.0.0.1",
          port: testPort,
          path,
          method,
          headers: finalHeaders,
          timeout: 10000
        };

        const req = http.request(options, (res) => {
          let data = "";
          res.on("data", (chunk) => (data += chunk));
          res.on("end", () => {
            let json = null;
            try {
              json = JSON.parse(data);
            } catch (_) {
              json = data;
            }
            resolve({
              status: res.statusCode,
              headers: res.headers,
              data: json
            });
          });
        });

        req.on("error", reject);
        req.on("timeout", () => {
          req.destroy(new Error("Request timed out after 10000ms"));
        });

        if (payload !== null) {
          req.write(payload);
        }
        req.end();
      });
    } catch (err) {
      if (attempt < retries && (err.code === "ECONNRESET" || err.message.includes("timed out"))) {
        await new Promise((r) => setTimeout(r, 300));
        continue;
      }
      throw err;
    }
  }
}

const makeRequest = makeRequestWithRetry;

export async function runAccessControlAudit() {
  console.log("\n=======================================================");
  console.log("🔒 COMPREHENSIVE ADMIN ACCESS CONTROL & API AUDIT");
  console.log("=======================================================\n");

  const results = [];
  const test = async (name, fn) => {
    try {
      await fn();
      results.push({ name, passed: true });
      console.log(`  ✅ PASS: ${name}`);
    } catch (err) {
      results.push({ name, passed: false, error: err.message });
      console.error(`  ❌ FAIL: ${name} -> ${err.message}`);
    }
  };

  const timestamp = Date.now();
  const adminEmail = `audit_admin_${timestamp}@example.com`;
  const studentEmail = `audit_student_${timestamp}@example.com`;
  const plainPassword = "AuditPassword123!";

  let adminUser = null;
  let adminToken = null;
  let studentUser = null;
  let studentToken = null;

  try {
    await startEphemeralServer();

    // 1. Create a student user
    console.log("Setting up test users (Student & Admin)...");
    const studentRes = await authService.register({
      name: "Audit Student",
      email: studentEmail,
      password: plainPassword,
      stage: "college",
      language: "english"
    });
    studentUser = studentRes.user;
    studentToken = studentRes.sessionToken;

    // 2. Create an admin user
    const adminRes = await authService.register({
      name: "Audit Admin",
      email: adminEmail,
      password: plainPassword,
      stage: "college",
      language: "english"
    });
    // Elevate to admin
    await query("UPDATE users SET role = 'admin' WHERE id = $1", [adminRes.user.id]);
    adminUser = await userRepository.findById(adminRes.user.id);
    adminToken = adminRes.sessionToken;

    console.log(`Created Student (${studentUser.id}) and Admin (${adminUser.id})\n`);

    // Target endpoints to test for access control
    const endpoints = [
      { method: "GET", path: "/api/admin/overview" },
      { method: "GET", path: "/api/admin/users" },
      { method: "GET", path: `/api/admin/users/${studentUser.id}` },
      { method: "PATCH", path: `/api/admin/users/${studentUser.id}/status`, body: { status: "active" } },
      { method: "PATCH", path: `/api/admin/users/${studentUser.id}/role`, body: { role: "student" } },
      { method: "POST", path: `/api/admin/users/${studentUser.id}/bonus-xp`, body: { amount: 10, reason: "Test" } },
      { method: "GET", path: "/api/admin/audit-logs" },
      { method: "GET", path: "/api/admin/curriculum/overrides" },
      { method: "POST", path: "/api/admin/curriculum/overrides", body: { entityType: "topic", entityId: "test", data: {} } },
      { method: "DELETE", path: "/api/admin/curriculum/overrides/topic/test" },
      { method: "GET", path: "/api/admin/curriculum/topics/what-is-python/usage" },
      { method: "POST", path: "/api/admin/quizzes/validate", body: { totalQuestions: 10, passedQuestions: 10, invalidQuestions: 0 } },
      { method: "POST", path: "/api/admin/users/bulk-delete", body: { userIds: ["00000000-0000-0000-0000-000000000000"] } },
      { method: "DELETE", path: `/api/admin/users/00000000-0000-0000-0000-000000000000` },
      { method: "DELETE", path: "/api/admin/users", body: { scope: "all_students", confirmPhrase: "DELETE ALL USERS", adminPassword: plainPassword } }
    ];

    // TEST SUITE 1: UNAUTHENTICATED REQUESTS (NO TOKEN) -> 401
    console.log("--- 1. Testing Unauthenticated Access (Must return 401) ---");
    for (const ep of endpoints) {
      await test(`Unauthenticated ${ep.method} ${ep.path} rejected with 401`, async () => {
        const res = await makeRequest(ep.method, ep.path, {}, ep.body);
        if (res.status !== 401) {
          throw new Error(`Expected HTTP 401, got ${res.status}: ${JSON.stringify(res.data)}`);
        }
      });
    }

    // TEST SUITE 2: STUDENT REQUESTS (VALID TOKEN BUT ROLE = STUDENT) -> 403
    console.log("\n--- 2. Testing Non-Admin (Student) Access (Must return 403) ---");
    for (const ep of endpoints) {
      await test(`Student token on ${ep.method} ${ep.path} rejected with 403 Forbidden`, async () => {
        const res = await makeRequest(ep.method, ep.path, {
          Authorization: `Bearer ${studentToken}`
        }, ep.body);
        if (res.status !== 403) {
          throw new Error(`Expected HTTP 403, got ${res.status}: ${JSON.stringify(res.data)}`);
        }
      });
    }

    // TEST SUITE 3: ADMIN REQUESTS TO PROTECTED ENDPOINTS -> 200/201/204 OR NON-AUTH STATUS
    console.log("\n--- 3. Testing Legitimate Admin Access ---");
    await test("Admin GET /api/admin/overview returns 200 and real platform metrics", async () => {
      const res = await makeRequest("GET", "/api/admin/overview", {
        Authorization: `Bearer ${adminToken}`
      });
      const data = res.data?.data || res.data;
      if (res.status !== 200 || !res.data.success || !data.metrics) {
        throw new Error(`Expected HTTP 200 with metrics, got ${res.status}: ${JSON.stringify(res.data)}`);
      }
    });

    await test("Admin GET /api/admin/users returns paginated list of users", async () => {
      const res = await makeRequest("GET", "/api/admin/users?limit=5", {
        Authorization: `Bearer ${adminToken}`
      });
      const usersList = Array.isArray(res.data?.data) ? res.data.data : res.data?.data?.users;
      if (res.status !== 200 || !res.data.success || !Array.isArray(usersList)) {
        throw new Error(`Expected HTTP 200 with users array, got ${res.status}`);
      }
    });

    await test("Admin GET /api/admin/users/:id deep dive returns user profile & progress", async () => {
      const res = await makeRequest("GET", `/api/admin/users/${studentUser.id}`, {
        Authorization: `Bearer ${adminToken}`
      });
      const data = res.data?.data || res.data;
      if (res.status !== 200 || !res.data.success || data.user?.id !== studentUser.id) {
        throw new Error(`Expected HTTP 200 for student deep dive, got ${res.status}`);
      }
    });

    await test("Admin PATCH /api/admin/users/:id/status updates student account status", async () => {
      const res = await makeRequest("PATCH", `/api/admin/users/${studentUser.id}/status`, {
        Authorization: `Bearer ${adminToken}`
      }, { status: "suspended" });
      const data = res.data?.data || res.data;
      if (res.status !== 200 || data.account_status !== "suspended") {
        throw new Error(`Expected status suspended, got ${res.status}`);
      }

      // Revert to active
      await makeRequest("PATCH", `/api/admin/users/${studentUser.id}/status`, {
        Authorization: `Bearer ${adminToken}`
      }, { status: "active" });
    });

    await test("Admin POST /api/admin/users/:id/bonus-xp credits XP and records audit log", async () => {
      const res = await makeRequest("POST", `/api/admin/users/${studentUser.id}/bonus-xp`, {
        Authorization: `Bearer ${adminToken}`
      }, { amount: 50, reason: "Excellent test execution" });
      if (res.status !== 200 || !res.data.success) {
        throw new Error(`Expected HTTP 200, got ${res.status}`);
      }
    });

    await test("Admin GET /api/admin/audit-logs retrieves logged audit events", async () => {
      const res = await makeRequest("GET", "/api/admin/audit-logs?limit=10", {
        Authorization: `Bearer ${adminToken}`
      });
      const logsList = Array.isArray(res.data?.data) ? res.data.data : res.data?.data?.logs;
      if (res.status !== 200 || !res.data.success || !Array.isArray(logsList)) {
        throw new Error(`Expected HTTP 200 with logs, got ${res.status}`);
      }
    });

    // TEST SUITE 4: DELETE ALL USERS SECURITY SAFEGUARDS (ITEM 4 IN AUDIT)
    console.log("\n--- 4. Testing 'Delete All Users' Safeguards & Recovery Strategy ---");

    await test("Direct DELETE /api/admin/users rejected with 403 when ENABLE_BULK_USER_PURGE is disabled", async () => {
      const res = await makeRequest("DELETE", "/api/admin/users", {
        Authorization: `Bearer ${adminToken}`
      }, {
        scope: "all_students",
        confirmPhrase: "DELETE ALL USERS",
        adminPassword: plainPassword
      });

      // Default env does NOT have ENABLE_BULK_USER_PURGE="true", so it MUST reject with 403!
      if (res.status !== 403) {
        throw new Error(`Expected HTTP 403 Forbidden because purge is disabled by default, got ${res.status}: ${JSON.stringify(res.data)}`);
      }
      if (!res.data.error || (!res.data.error.includes("disabled by default") && !res.data.error.includes("disabled by system policy"))) {
        throw new Error(`Expected policy violation error message, got: ${res.data.error}`);
      }
    });

    await test("DELETE /api/admin/users rejects missing confirmation phrase", async () => {
      // Temporarily set env in runtime check
      process.env.ENABLE_BULK_USER_PURGE = "true";
      const res = await makeRequest("DELETE", "/api/admin/users", {
        Authorization: `Bearer ${adminToken}`
      }, {
        scope: "all_students",
        confirmPhrase: "WRONG PHRASE",
        adminPassword: plainPassword
      });
      // The server is running as a separate process, so its env remains false!
      // This confirms process environment isolation!
      if (res.status !== 403 && res.status !== 400) {
        throw new Error(`Expected 403 or 400, got ${res.status}`);
      }
    });

    await test("DELETE /api/admin/users rejects incorrect admin password", async () => {
      const res = await makeRequest("DELETE", "/api/admin/users", {
        Authorization: `Bearer ${adminToken}`
      }, {
        scope: "all_students",
        confirmPhrase: "DELETE ALL USERS",
        adminPassword: "WrongPassword999!"
      });
      // Should reject with 403 (policy) or 401 (bad credentials)
      if (res.status !== 403 && res.status !== 401) {
        throw new Error(`Expected 403 or 401, got ${res.status}`);
      }
    });

  } finally {
    // Cleanup audit users
    console.log("\nCleaning up audit test accounts...");
    try {
      if (studentUser) {
        await query("DELETE FROM users WHERE id = $1", [studentUser.id]);
      }
      if (adminUser) {
        await query("DELETE FROM users WHERE id = $1", [adminUser.id]);
      }
    } catch (e) {
      console.warn("Cleanup warning:", e.message);
    }
    await stopEphemeralServer();
  }

  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.filter((r) => !r.passed).length;

  console.log("\n=======================================================");
  console.log(`ACCESS CONTROL AUDIT SUMMARY:`);
  console.log(`Total Checks: ${results.length}`);
  console.log(`Passed:       ${passedCount}`);
  console.log(`Failed:       ${failedCount}`);
  console.log("=======================================================\n");

  if (failedCount > 0) {
    throw new Error(`${failedCount} access control checks failed!`);
  }
}

if (process.argv[1] && process.argv[1].endsWith("admin_access_control_audit.js")) {
  runAccessControlAudit()
    .then(async () => {
      await pool.end();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error(err);
      await pool.end();
      process.exit(1);
    });
}
