import { adminRepository } from "../src/repositories/adminRepository.js";
import { userRepository } from "../src/repositories/userRepository.js";
import { authService } from "../src/services/authService.js";

export async function testAdmin() {
  const results = [];
  const runTest = async (name, fn) => {
    try {
      await fn();
      results.push({ name, passed: true });
    } catch (err) {
      results.push({ name, passed: false, error: err.message });
    }
  };

  const studentEmail = `student_${Date.now()}@example.com`;
  let studentUser = null;

  await runTest("Platform overview returns aggregate metrics and distributions", async () => {
    const overview = await adminRepository.getPlatformOverview();
    if (!overview.metrics || typeof overview.metrics.totalUsers !== "number") {
      throw new Error("Missing or invalid metrics in overview");
    }
    if (!Array.isArray(overview.stageDistribution)) {
      throw new Error("Stage distribution is not an array");
    }
    if (!Array.isArray(overview.topLearners)) {
      throw new Error("Top learners is not an array");
    }
  });

  await runTest("List users returns paginated users with learning progress aggregates", async () => {
    const res = await adminRepository.listUsers({ limit: 10, offset: 0 });
    if (!Array.isArray(res.users)) {
      throw new Error("Users is not an array");
    }
    if (typeof res.totalCount !== "number") {
      throw new Error("Total count is not a number");
    }
  });

  await runTest("Register student and verify default student role and active status", async () => {
    const res = await authService.register({
      name: "Normal Student",
      email: studentEmail,
      password: "Password123!",
      stage: "college",
      language: "english"
    });
    studentUser = res.user;

    if (studentUser.role !== "student") {
      throw new Error(`Expected role 'student', got '${studentUser.role}'`);
    }
    if (studentUser.accountStatus !== "active") {
      throw new Error(`Expected accountStatus 'active', got '${studentUser.accountStatus}'`);
    }
  });

  await runTest("Admin can inspect student deep-dive details", async () => {
    const deepDive = await adminRepository.getUserDeepDive(studentUser.id);
    if (!deepDive || !deepDive.user) {
      throw new Error("Deep dive user not found");
    }
    if (!Array.isArray(deepDive.learningProgress)) {
      throw new Error("learningProgress must be an array");
    }
  });

  await runTest("Admin can update user status to suspended and toggle back to active", async () => {
    const suspended = await adminRepository.updateStatus(studentUser.id, "suspended");
    if (suspended.account_status !== "suspended") {
      throw new Error("Account status failed to update to suspended");
    }

    // Try login while suspended
    try {
      await authService.login({
        emailOrUsername: studentEmail,
        password: "Password123!"
      });
      throw new Error("Suspended user should have been blocked from logging in");
    } catch (err) {
      if (!err.message.includes("suspended")) {
        throw err;
      }
    }

    // Reactivate
    const active = await adminRepository.updateStatus(studentUser.id, "active");
    if (active.account_status !== "active") {
      throw new Error("Account status failed to reactivate");
    }
  });

  await runTest("Admin can award bonus XP to learner", async () => {
    const updatedRewards = await adminRepository.awardBonusXP(studentUser.id, 100, "Great test run");
    if (updatedRewards.total_xp < 150) {
      throw new Error(`Expected at least 150 XP, got ${updatedRewards.total_xp}`);
    }
  });

  await runTest("Admin audit log records actions with actor, timestamp and details", async () => {
    const log = await adminRepository.logAction({
      adminId: studentUser.id,
      adminEmail: studentEmail,
      adminName: "Test Admin",
      action: "TEST_AUDIT_ACTION",
      targetType: "CURRICULUM",
      targetId: "what-is-python",
      details: { test: true },
      ipAddress: "127.0.0.1"
    });
    if (!log || log.action !== "TEST_AUDIT_ACTION") {
      throw new Error("Failed to insert admin audit log");
    }

    const res = await adminRepository.getAuditLogs({ action: "TEST_AUDIT_ACTION" });
    if (!Array.isArray(res.logs) || res.logs.length === 0) {
      throw new Error("Failed to retrieve audit logs");
    }
  });

  await runTest("Curriculum override saves and retrieves custom topic overrides", async () => {
    const override = await adminRepository.saveCurriculumOverride({
      entityType: "topic",
      entityId: "test-override-topic",
      data: { title: "Custom Overridden Title", customField: 123 },
      isArchived: false,
      createdBy: studentUser.id
    });
    if (!override || override.entity_id !== "test-override-topic") {
      throw new Error("Failed to save curriculum override");
    }

    const list = await adminRepository.getCurriculumOverrides();
    const found = list.find((o) => o.entity_id === "test-override-topic");
    if (!found) {
      throw new Error("Saved curriculum override not found in overrides list");
    }

    // Cleanup override
    await adminRepository.deleteCurriculumOverride("topic", "test-override-topic");
  });

  await runTest("Topic usage check returns progress metrics to protect student data", async () => {
    const usage = await adminRepository.checkTopicUsage("what-is-python");
    if (typeof usage.studentCount !== "number" || typeof usage.hasStudentData !== "boolean") {
      throw new Error("Invalid topic usage check response");
    }
  });

  await runTest("Admin can bulk delete specific user accounts", async () => {
    const dummy1 = await authService.register({
      name: "Bulk Target 1",
      email: `bulk1_${Date.now()}@example.com`,
      password: "Password123!",
      stage: "young",
      language: "english"
    });
    const dummy2 = await authService.register({
      name: "Bulk Target 2",
      email: `bulk2_${Date.now()}@example.com`,
      password: "Password123!",
      stage: "young",
      language: "english"
    });

    const bulkRes = await userRepository.bulkDelete([dummy1.user.id, dummy2.user.id], studentUser.id);
    if (bulkRes.deletedCount !== 2) {
      throw new Error(`Expected deletedCount 2, got ${bulkRes.deletedCount}`);
    }

    const check1 = await userRepository.findById(dummy1.user.id);
    const check2 = await userRepository.findById(dummy2.user.id);
    if (check1 || check2) {
      throw new Error("Bulk deleted users still exist in database");
    }
  });

  await runTest("Admin can delete users at one time preserving active administrator account", async () => {
    const dummy = await authService.register({
      name: "Purge Target",
      email: `purge_${Date.now()}@example.com`,
      password: "Password123!",
      stage: "college",
      language: "english"
    });

    const purgeRes = await userRepository.deleteAll({
      excludeAdminId: studentUser.id,
      role: "student"
    });

    if (purgeRes.deletedCount < 1) {
      throw new Error(`Expected at least 1 deleted user, got ${purgeRes.deletedCount}`);
    }

    const purgedUser = await userRepository.findById(dummy.user.id);
    if (purgedUser) {
      throw new Error("Purged user still exists in database");
    }

    const adminCheck = await userRepository.findById(studentUser.id);
    if (!adminCheck) {
      throw new Error("Active user was mistakenly deleted during bulk purge");
    }
  });

  // Cleanup test user
  try {
    if (studentUser) {
      await userRepository.delete(studentUser.id);
    }
  } catch (_) {}

  return results;
}
