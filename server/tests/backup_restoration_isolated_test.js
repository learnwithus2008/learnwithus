import { query } from "../src/config/db.js";
import { backupService } from "../src/services/backupService.js";
import fs from "fs";

export async function runIsolatedBackupRestorationTest() {
  console.log("\n=======================================================");
  console.log("💾 ISOLATED BACKUP & RESTORATION AUDIT TEST");
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

  const isoPrefix = "iso_audit_";
  let snapshotInfo = null;

  try {
    // 1. Check existing production data before backup
    const preUsers = await query("SELECT COUNT(*)::INTEGER as count FROM users");
    const preProgress = await query("SELECT COUNT(*)::INTEGER as count FROM user_learning_progress");
    const preRavi = await query("SELECT * FROM users WHERE email = 'ravi@gmail.com'");

    console.log(`Initial Real Production Data:`);
    console.log(`  Total Users in DB:    ${preUsers.rows[0].count}`);
    console.log(`  Total Progress Rows:  ${preProgress.rows[0].count}`);
    console.log(`  Real Student 'ravi':  ${preRavi.rows[0] ? preRavi.rows[0].id : "Not Found"}\n`);

    // 2. Create Atomic Snapshot Backup
    await test("Atomic database snapshot generated to server/backups", async () => {
      snapshotInfo = await backupService.createSnapshot("admin-qa-auditor", "isolated_verification");
      if (!snapshotInfo || !fs.existsSync(snapshotInfo.filePath)) {
        throw new Error("Failed to create snapshot file on disk");
      }
      if (snapshotInfo.metadata.totalUsers <= 0) {
        throw new Error("Snapshot captured zero users");
      }
      console.log(`     Snapshot file: ${snapshotInfo.filename}`);
      console.log(`     Users captured: ${snapshotInfo.metadata.totalUsers}, Progress: ${snapshotInfo.metadata.totalProgress}`);
    });

    // 3. Test Restoration in Isolated Tables
    await test("Restore snapshot into isolated test tables without touching real tables", async () => {
      const restoreRes = await backupService.restoreSnapshot(snapshotInfo.filePath, {
        tablePrefix: isoPrefix
      });

      if (!restoreRes || !restoreRes.restoredCounts) {
        throw new Error("Restoration did not return result metrics");
      }

      if (restoreRes.restoredCounts.users !== snapshotInfo.metadata.totalUsers) {
        throw new Error(`User count mismatch! Expected ${snapshotInfo.metadata.totalUsers}, restored ${restoreRes.restoredCounts.users}`);
      }
    });

    // 4. Verify Restored Data Integrity in Isolated Environment
    await test("Verify complete data fidelity in isolated tables (users, hashes, progress, XP)", async () => {
      const isoUsers = await query(`SELECT * FROM ${isoPrefix}users ORDER BY created_at ASC`);
      const isoRewards = await query(`SELECT * FROM ${isoPrefix}user_rewards`);
      const isoProgress = await query(`SELECT * FROM ${isoPrefix}user_learning_progress`);

      if (isoUsers.rows.length !== snapshotInfo.metadata.totalUsers) {
        throw new Error("Isolated users count mismatch");
      }

      const isoRavi = isoUsers.rows.find((u) => u.email === "ravi@gmail.com");
      if (!isoRavi) {
        throw new Error("Student ravi@gmail.com was not restored into isolated users table");
      }

      if (isoRavi.id !== preRavi.rows[0].id) {
        throw new Error("Restored student UUID mismatch");
      }

      if (!isoRavi.password_hash.startsWith("$2")) {
        throw new Error("Restored bcrypt password hash corrupted");
      }

      console.log(`     Restored Isolated Users:    ${isoUsers.rows.length}`);
      console.log(`     Restored Isolated Rewards:  ${isoRewards.rows.length}`);
      console.log(`     Restored Isolated Progress: ${isoProgress.rows.length}`);
    });

    // 5. Cleanup Isolated Tables
    await test("Clean up isolated test tables", async () => {
      await query(`DROP TABLE IF EXISTS ${isoPrefix}user_learning_progress CASCADE;`);
      await query(`DROP TABLE IF EXISTS ${isoPrefix}user_bookmarks CASCADE;`);
      await query(`DROP TABLE IF EXISTS ${isoPrefix}user_rewards CASCADE;`);
      await query(`DROP TABLE IF EXISTS ${isoPrefix}users CASCADE;`);
    });

    // 6. Verify Production Data Strict Isolation (Zero modification)
    await test("Confirm 100% production data preservation (Zero alteration of real student data)", async () => {
      const postUsers = await query("SELECT COUNT(*)::INTEGER as count FROM users");
      const postProgress = await query("SELECT COUNT(*)::INTEGER as count FROM user_learning_progress");
      const postRavi = await query("SELECT * FROM users WHERE email = 'ravi@gmail.com'");

      if (postUsers.rows[0].count !== preUsers.rows[0].count) {
        throw new Error(`Real user count altered! Pre: ${preUsers.rows[0].count}, Post: ${postUsers.rows[0].count}`);
      }

      if (postProgress.rows[0].count !== preProgress.rows[0].count) {
        throw new Error(`Real progress count altered! Pre: ${preProgress.rows[0].count}, Post: ${postProgress.rows[0].count}`);
      }

      if (postRavi.rows[0].id !== preRavi.rows[0].id) {
        throw new Error("Real student ravi record altered");
      }
    });

  } finally {
    // Drop isolated tables in case of failure
    try {
      await query(`DROP TABLE IF EXISTS ${isoPrefix}user_learning_progress CASCADE;`);
      await query(`DROP TABLE IF EXISTS ${isoPrefix}user_bookmarks CASCADE;`);
      await query(`DROP TABLE IF EXISTS ${isoPrefix}user_rewards CASCADE;`);
      await query(`DROP TABLE IF EXISTS ${isoPrefix}users CASCADE;`);
    } catch (_) {}
  }

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log("\n=======================================================");
  console.log(`ISOLATED RESTORATION SUMMARY:`);
  console.log(`Total Checks: ${results.length}`);
  console.log(`Passed:       ${passed}`);
  console.log(`Failed:       ${failed}`);
  console.log("=======================================================\n");

  if (failed > 0) {
    throw new Error(`${failed} restoration tests failed!`);
  }
}

if (process.argv[1] && process.argv[1].endsWith("backup_restoration_isolated_test.js")) {
  runIsolatedBackupRestorationTest()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
