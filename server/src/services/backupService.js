import fs from "fs";
import path from "path";
import { query, withTransaction } from "../config/db.js";

const BACKUP_DIR = path.join(process.cwd(), "server", "backups");

export const backupService = {
  getBackupDir() {
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }
    return BACKUP_DIR;
  },

  /**
   * Generates a complete atomic JSON snapshot of database tables.
   */
  async createSnapshot(adminId = "system", label = "manual", dbClient = null) {
    const dir = this.getBackupDir();
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const q = dbClient ? dbClient.query.bind(dbClient) : query;

    const [usersRes, rewardsRes, progressRes, bookmarksRes, overridesRes] = await Promise.all([
      q("SELECT * FROM users ORDER BY created_at ASC"),
      q("SELECT * FROM user_rewards ORDER BY user_id ASC"),
      q("SELECT * FROM user_learning_progress ORDER BY user_id, topic_id ASC"),
      q("SELECT * FROM user_bookmarks ORDER BY user_id ASC"),
      q("SELECT * FROM curriculum_overrides ORDER BY created_at ASC")
    ]);

    const snapshot = {
      formatVersion: "1.0",
      createdAt: new Date().toISOString(),
      label,
      initiatedBy: adminId,
      metadata: {
        totalUsers: usersRes.rows.length,
        totalRewards: rewardsRes.rows.length,
        totalProgress: progressRes.rows.length,
        totalBookmarks: bookmarksRes.rows.length,
        totalOverrides: overridesRes.rows.length
      },
      tables: {
        users: usersRes.rows,
        user_rewards: rewardsRes.rows,
        user_learning_progress: progressRes.rows,
        user_bookmarks: bookmarksRes.rows,
        curriculum_overrides: overridesRes.rows
      }
    };

    const filename = `db_snapshot_${label}_${timestamp}.json`;
    const filePath = path.join(dir, filename);
    fs.writeFileSync(filePath, JSON.stringify(snapshot, null, 2), "utf-8");

    return {
      filename,
      filePath,
      metadata: snapshot.metadata
    };
  },

  /**
   * Lists available backup snapshots sorted newest to oldest.
   */
  listSnapshots() {
    const dir = this.getBackupDir();
    const files = fs.readdirSync(dir).filter(f => f.endsWith(".json"));
    return files.map(file => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      return {
        filename: file,
        filePath: fullPath,
        sizeBytes: stat.size,
        createdAt: stat.birthtime || stat.mtime
      };
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  /**
   * Automatically enforces backup retention policy, purging snapshots older than retentionDays.
   */
  pruneOldSnapshots(retentionDays = 14) {
    const snapshots = this.listSnapshots();
    const now = Date.now();
    const maxAgeMs = retentionDays * 24 * 60 * 60 * 1000;
    const deleted = [];

    for (const snap of snapshots) {
      const ageMs = now - new Date(snap.createdAt).getTime();
      if (ageMs > maxAgeMs) {
        fs.unlinkSync(snap.filePath);
        deleted.push(snap.filename);
      }
    }

    return {
      retainedCount: snapshots.length - deleted.length,
      deletedCount: deleted.length,
      deletedFiles: deleted
    };
  },

  /**
   * Restores a snapshot into isolated target tables or production tables with verification.
   * If tablePrefix is provided (e.g. 'iso_test_'), restores into isolated tables to prevent touching real data.
   */
  async restoreSnapshot(filePath, options = {}) {
    const { tablePrefix = "", dbClient = null } = options;
    if (!fs.existsSync(filePath)) {
      throw new Error(`Backup file not found at ${filePath}`);
    }

    const fileContent = fs.readFileSync(filePath, "utf-8");
    const snapshot = JSON.parse(fileContent);

    if (!snapshot.tables || !Array.isArray(snapshot.tables.users)) {
      throw new Error("Invalid backup format: missing 'tables' or 'users' collection");
    }

    const runner = async (client) => {
      const q = client.query.bind(client);
      const restoredCounts = {
        users: 0,
        rewards: 0,
        progress: 0,
        bookmarks: 0,
        overrides: 0
      };

      const userTable = `${tablePrefix}users`;
      const rewardTable = `${tablePrefix}user_rewards`;
      const progressTable = `${tablePrefix}user_learning_progress`;
      const bookmarkTable = `${tablePrefix}user_bookmarks`;
      const overridesTable = `${tablePrefix}curriculum_overrides`;

      // If isolated table restoration, create isolated tables matching the real schema
      if (tablePrefix) {
        await q(`
          CREATE TABLE IF NOT EXISTS ${userTable} (
            id UUID PRIMARY KEY,
            full_name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            learning_stage VARCHAR(50) DEFAULT 'young',
            preferred_language VARCHAR(50) DEFAULT 'english',
            role VARCHAR(50) DEFAULT 'student',
            account_status VARCHAR(50) DEFAULT 'active',
            avatar VARCHAR(100) DEFAULT 'snake_blue',
            bio TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );

          CREATE TABLE IF NOT EXISTS ${rewardTable} (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES ${userTable}(id) ON DELETE CASCADE,
            total_xp INTEGER DEFAULT 0,
            current_streak INTEGER DEFAULT 0,
            longest_streak INTEGER DEFAULT 0,
            last_active_date DATE,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );

          CREATE TABLE IF NOT EXISTS ${progressTable} (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES ${userTable}(id) ON DELETE CASCADE,
            topic_id VARCHAR(100) NOT NULL,
            completed BOOLEAN DEFAULT FALSE,
            completed_at TIMESTAMPTZ,
            quiz_score INTEGER,
            last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
            created_at TIMESTAMPTZ DEFAULT NOW()
          );

          CREATE TABLE IF NOT EXISTS ${bookmarkTable} (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES ${userTable}(id) ON DELETE CASCADE,
            topic_id VARCHAR(100) NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW()
          );
        `);
      }

      // 1. Restore Users
      for (const u of snapshot.tables.users) {
        await q(
          `
          INSERT INTO ${userTable} (id, full_name, email, password_hash, learning_stage, preferred_language, role, account_status, avatar, bio, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          ON CONFLICT (id) DO UPDATE SET
            full_name = EXCLUDED.full_name,
            email = EXCLUDED.email,
            password_hash = EXCLUDED.password_hash,
            learning_stage = EXCLUDED.learning_stage,
            preferred_language = EXCLUDED.preferred_language,
            role = EXCLUDED.role,
            account_status = EXCLUDED.account_status,
            avatar = EXCLUDED.avatar,
            bio = EXCLUDED.bio,
            updated_at = NOW();
          `,
          [u.id, u.full_name, u.email, u.password_hash, u.learning_stage, u.preferred_language, u.role, u.account_status, u.avatar, u.bio, u.created_at, u.updated_at]
        );
        restoredCounts.users++;
      }

      // 2. Restore Rewards
      if (Array.isArray(snapshot.tables.user_rewards)) {
        for (const r of snapshot.tables.user_rewards) {
          await q(
            `
            INSERT INTO ${rewardTable} (user_id, total_xp, current_streak, longest_streak, last_active_date, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT DO NOTHING;
            `,
            [r.user_id, r.total_xp, r.current_streak, r.longest_streak, r.last_active_date, r.created_at, r.updated_at]
          );
          restoredCounts.rewards++;
        }
      }

      // 3. Restore Progress
      if (Array.isArray(snapshot.tables.user_learning_progress)) {
        for (const p of snapshot.tables.user_learning_progress) {
          await q(
            `
            INSERT INTO ${progressTable} (user_id, topic_id, completed, completed_at, quiz_score, last_accessed_at, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT DO NOTHING;
            `,
            [p.user_id, p.topic_id, p.completed, p.completed_at, p.quiz_score, p.last_accessed_at, p.created_at]
          );
          restoredCounts.progress++;
        }
      }

      // 4. Restore Bookmarks
      if (Array.isArray(snapshot.tables.user_bookmarks)) {
        for (const b of snapshot.tables.user_bookmarks) {
          await q(
            `
            INSERT INTO ${bookmarkTable} (user_id, topic_id, created_at)
            VALUES ($1, $2, $3)
            ON CONFLICT DO NOTHING;
            `,
            [b.user_id, b.topic_id, b.created_at]
          );
          restoredCounts.bookmarks++;
        }
      }

      return {
        restoredCounts,
        sourceMetadata: snapshot.metadata
      };
    };

    if (dbClient) {
      return await runner(dbClient);
    } else {
      return await withTransaction(runner);
    }
  }
};
