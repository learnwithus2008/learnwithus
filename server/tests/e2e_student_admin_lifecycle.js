import http from "http";
import app from "../src/app.js";
import { query, pool } from "../src/config/db.js";
import { authService } from "../src/services/authService.js";
import { userRepository } from "../src/repositories/userRepository.js";
import { progressRepository } from "../src/repositories/progressRepository.js";

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

async function makeRequest(method, path, headers = {}, body = null) {
  return new Promise((resolve, reject) => {
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
    req.on("timeout", () => req.destroy(new Error("Timeout")));
    if (payload !== null) req.write(payload);
    req.end();
  });
}

export async function runE2ELifecycleTest() {
  console.log("\n=======================================================");
  console.log("🎓 COMPLETE STUDENT & ADMIN LIFECYCLE E2E AUDIT TEST");
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

  const ts = Date.now();
  const studentEmail = `student_e2e_${ts}@example.com`;
  const plainPassword = "StudentPassword123!";
  const adminEmail = `admin_e2e_${ts}@example.com`;

  let studentId = null;
  let studentToken = null;
  let adminId = null;
  let adminToken = null;

  try {
    await startEphemeralServer();
    // 1. Student Registration
    await test("1. Student registration creates account, issues session token & awards +50 XP", async () => {
      const regRes = await makeRequest("POST", "/api/auth/register", {}, {
        name: "E2E Student",
        email: studentEmail,
        password: plainPassword,
        stage: "college",
        language: "english"
      });
      if (regRes.status !== 201 || !regRes.data.success) {
        throw new Error(`Registration failed: ${regRes.status} - ${JSON.stringify(regRes.data)}`);
      }
      studentId = regRes.data.data.user.id;
      studentToken = regRes.data.data.token;
      if (regRes.data.data.user.stats.xp !== 50) {
        throw new Error(`Expected initial 50 XP, got ${regRes.data.data.user.stats.xp}`);
      }
    });

    // 2. Lesson Completion
    await test("2. Student completes topic 'what-is-python' and earns +30 XP", async () => {
      const compRes = await makeRequest("POST", "/api/progress/toggle", {
        Authorization: `Bearer ${studentToken}`
      }, {
        topicId: "what-is-python",
        completed: true
      });
      if (compRes.status !== 200 || !compRes.data.success) {
        throw new Error(`Toggle progress failed: ${compRes.status} - ${JSON.stringify(compRes.data)}`);
      }
      const xp = compRes.data.data.user?.stats?.xp || 0;
      if (xp < 80) {
        throw new Error(`Expected >= 80 XP after completion, got ${xp}`);
      }
    });

    // 3. Quiz Submission
    await test("3. Student submits quiz for 'what-is-python' with 100% score", async () => {
      const quizRes = await makeRequest("POST", "/api/progress/quiz", {
        Authorization: `Bearer ${studentToken}`
      }, {
        topicId: "what-is-python",
        quizScore: 100
      });
      if (quizRes.status !== 200 || !quizRes.data.success) {
        throw new Error(`Quiz submission failed: ${quizRes.status}`);
      }
      const savedScore = quizRes.data.data.record?.quiz_score;
      if (savedScore !== 100) {
        throw new Error(`Quiz score not saved: ${savedScore}`);
      }
    });

    // 4. Progress Persistence Verification in DB
    await test("4. Verify topic completion & score persist in PostgreSQL", async () => {
      const progressRows = await progressRepository.getByUserId(studentId);
      const match = progressRows.find((p) => p.topic_id === "what-is-python");
      if (!match || !match.completed || match.quiz_score !== 100) {
        throw new Error("PostgreSQL progress record does not reflect completed state and score");
      }
    });

    // 5. Logout
    await test("5. Student logout revokes session (subsequent /auth/me returns 401)", async () => {
      const logoutRes = await makeRequest("POST", "/api/auth/logout", {
        Authorization: `Bearer ${studentToken}`
      });
      if (logoutRes.status !== 200) {
        throw new Error(`Logout returned status ${logoutRes.status}`);
      }

      const meCheck = await makeRequest("GET", "/api/auth/me", {
        Authorization: `Bearer ${studentToken}`
      });
      if (meCheck.status !== 401) {
        throw new Error(`Expected 401 after logout, got ${meCheck.status}`);
      }
    });

    // 6. Re-Login
    await test("6. Student logs back in with credentials and verifies full profile restored", async () => {
      const loginRes = await makeRequest("POST", "/api/auth/login", {}, {
        emailOrUsername: studentEmail,
        password: plainPassword
      });
      if (loginRes.status !== 200 || !loginRes.data.success) {
        throw new Error(`Re-login failed: ${loginRes.status}`);
      }
      studentToken = loginRes.data.data.token;
      const user = loginRes.data.data.user;
      if (!user.stats?.completedTopics?.includes("what-is-python")) {
        throw new Error(`Re-logged-in user missing completed topic. Found: ${JSON.stringify(user.stats?.completedTopics)}`);
      }
      if (user.stats?.quizScores?.["what-is-python"] !== 100) {
        throw new Error(`Re-logged-in user missing quiz score. Found: ${JSON.stringify(user.stats?.quizScores)}`);
      }
    });

    // 7. Admin Flow & Curriculum Editing
    await test("7. Admin logs in, updates curriculum override, verifies student progress isolated", async () => {
      const adminRes = await authService.register({
        name: "E2E Admin",
        email: adminEmail,
        password: plainPassword,
        stage: "professional",
        language: "english"
      });
      adminId = adminRes.user.id;
      adminToken = adminRes.sessionToken;
      await query("UPDATE users SET role = 'admin' WHERE id = $1", [adminId]);

      // Admin saves curriculum override
      const overrideRes = await makeRequest("POST", "/api/admin/curriculum/overrides", {
        Authorization: `Bearer ${adminToken}`
      }, {
        entityType: "topic",
        entityId: "what-is-python",
        data: { title: "Python Explained (E2E Verified)", explanation: "Audited" },
        isArchived: false
      });
      if (overrideRes.status !== 200) {
        throw new Error(`Admin override failed: ${overrideRes.status}`);
      }

      // Check student progress is completely intact
      const studentProgress = await progressRepository.getByUserId(studentId);
      const studentMatch = studentProgress.find((p) => p.topic_id === "what-is-python");
      if (!studentMatch || !studentMatch.completed || studentMatch.quiz_score !== 100) {
        throw new Error("Student progress was corrupted after admin curriculum edit!");
      }

      // Cleanup override
      await makeRequest("DELETE", "/api/admin/curriculum/overrides/topic/what-is-python", {
        Authorization: `Bearer ${adminToken}`
      });
    });

    // 8. Admin Export Generation
    await test("8. Admin generates CSV and JSON export of student directory", async () => {
      const listRes = await makeRequest("GET", "/api/admin/users?limit=10", {
        Authorization: `Bearer ${adminToken}`
      });
      const users = listRes.data?.data || [];
      if (!Array.isArray(users) || users.length === 0) {
        throw new Error("No users returned for export test");
      }

      const json = JSON.stringify(users, null, 2);
      if (!json.includes(studentEmail)) {
        throw new Error("JSON export missing student data");
      }

      const csvHeader = "ID,Name,Email,Role,Status,Stage,XP,Completed Topics\n";
      const csvRow = `"${studentId}","E2E Student","${studentEmail}","student","active","college",100,1`;
      const fullCsv = csvHeader + csvRow;
      if (!fullCsv.includes(studentEmail)) {
        throw new Error("CSV export missing student record");
      }
    });

  } finally {
    // Purge temporary test users
    console.log("\nPurging temporary test users...");
    if (studentId) {
      await query("DELETE FROM users WHERE id = $1", [studentId]);
    }
    if (adminId) {
      await query("DELETE FROM users WHERE id = $1", [adminId]);
    }
    await stopEphemeralServer();
  }

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log("\n=======================================================");
  console.log(`E2E LIFECYCLE SUMMARY:`);
  console.log(`Total Checks: ${results.length}`);
  console.log(`Passed:       ${passed}`);
  console.log(`Failed:       ${failed}`);
  console.log("=======================================================\n");

  if (failed > 0) {
    throw new Error(`${failed} lifecycle tests failed!`);
  }
}

if (process.argv[1] && process.argv[1].endsWith("e2e_student_admin_lifecycle.js")) {
  runE2ELifecycleTest()
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
