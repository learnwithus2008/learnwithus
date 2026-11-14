import path from "path";
import bcrypt from "bcryptjs";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(process.cwd(), "server/.env") });
dotenv.config();

const { Pool } = pg;

export async function runSeeds(dbUrl = process.env.DATABASE_URL) {
  if (!dbUrl) {
    throw new Error("DATABASE_URL is required for seeding.");
  }

  const isLocal = dbUrl.includes("localhost") || dbUrl.includes("127.0.0.1");
  const pool = new Pool({
    connectionString: dbUrl,
    ssl: isLocal ? false : { rejectUnauthorized: false }
  });
  const client = await pool.connect();

  try {
    console.log("Starting PostgreSQL development and demo account seeding...");
    await client.query("BEGIN");

    // Standard dev password: "password123"
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash("password123", salt);

    // 1. Seed Alex Johnson (College stage - Student)
    const alexRes = await client.query(
      `
      INSERT INTO users (full_name, email, password_hash, role, account_status, avatar, bio, learning_stage, preferred_language)
      VALUES ($1, $2, $3, 'student', 'active', $4, $5, $6, $7)
      ON CONFLICT ((LOWER(email))) DO UPDATE
        SET full_name = EXCLUDED.full_name,
            password_hash = EXCLUDED.password_hash,
            role = EXCLUDED.role,
            account_status = 'active',
            avatar = EXCLUDED.avatar,
            learning_stage = EXCLUDED.learning_stage,
            preferred_language = EXCLUDED.preferred_language
      RETURNING id;
      `,
      [
        "Alex Johnson",
        "alex@example.com",
        passwordHash,
        "snake_blue",
        "Computer Science undergrad learning Python data structures & web apps.",
        "college",
        "english"
      ]
    );

    const alexId = alexRes.rows[0].id;

    // Alex Rewards & Doubt Credits
    await client.query(
      `
      INSERT INTO user_rewards (user_id, total_xp, current_streak, longest_streak, doubt_credits, free_doubts_total, doubts_used)
      VALUES ($1, 420, 5, 7, 10, 10, 0)
      ON CONFLICT (user_id) DO UPDATE
        SET total_xp = EXCLUDED.total_xp,
            current_streak = EXCLUDED.current_streak,
            longest_streak = EXCLUDED.longest_streak,
            doubt_credits = COALESCE(user_rewards.doubt_credits, 10),
            free_doubts_total = COALESCE(user_rewards.free_doubts_total, 10);
      `,
      [alexId]
    );

    // Alex Progress
    const alexTopics = ["what-is-python", "installing-python", "variables-data-types"];
    for (const t of alexTopics) {
      await client.query(
        `
        INSERT INTO user_learning_progress (user_id, topic_id, completed, completed_at, quiz_score)
        VALUES ($1, $2, TRUE, NOW(), 95)
        ON CONFLICT (user_id, topic_id) DO NOTHING;
        `,
        [alexId, t]
      );
    }

    // Alex Bookmarks
    const alexBookmarks = ["functions-modules", "lists-tuples-dictionaries"];
    for (const b of alexBookmarks) {
      await client.query(
        `
        INSERT INTO user_bookmarks (user_id, topic_id)
        VALUES ($1, $2)
        ON CONFLICT (user_id, topic_id) DO NOTHING;
        `,
        [alexId, b]
      );
    }

    // 2. Seed Priya Sharma (Graduate stage - Student)
    const priyaRes = await client.query(
      `
      INSERT INTO users (full_name, email, password_hash, role, account_status, avatar, bio, learning_stage, preferred_language)
      VALUES ($1, $2, $3, 'student', 'active', $4, $5, $6, $7)
      ON CONFLICT ((LOWER(email))) DO UPDATE
        SET full_name = EXCLUDED.full_name,
            password_hash = EXCLUDED.password_hash,
            role = EXCLUDED.role,
            account_status = 'active',
            avatar = EXCLUDED.avatar,
            learning_stage = EXCLUDED.learning_stage,
            preferred_language = EXCLUDED.preferred_language
      RETURNING id;
      `,
      [
        "Priya Sharma",
        "priya@example.com",
        passwordHash,
        "sparkles",
        "Software developer exploring Python for automation and backend services.",
        "graduate",
        "english-telugu"
      ]
    );

    const priyaId = priyaRes.rows[0].id;

    // Priya Rewards & Doubt Credits
    await client.query(
      `
      INSERT INTO user_rewards (user_id, total_xp, current_streak, longest_streak, doubt_credits, free_doubts_total, doubts_used)
      VALUES ($1, 850, 12, 14, 10, 10, 0)
      ON CONFLICT (user_id) DO UPDATE
        SET total_xp = EXCLUDED.total_xp,
            current_streak = EXCLUDED.current_streak,
            longest_streak = EXCLUDED.longest_streak,
            doubt_credits = COALESCE(user_rewards.doubt_credits, 10),
            free_doubts_total = COALESCE(user_rewards.free_doubts_total, 10);
      `,
      [priyaId]
    );

    // Priya Progress
    const priyaTopics = ["what-is-python", "installing-python", "control-flow-loops", "functions-modules"];
    for (const t of priyaTopics) {
      await client.query(
        `
        INSERT INTO user_learning_progress (user_id, topic_id, completed, completed_at, quiz_score)
        VALUES ($1, $2, TRUE, NOW(), 100)
        ON CONFLICT (user_id, topic_id) DO NOTHING;
        `,
        [priyaId, t]
      );
    }

    // Priya Bookmarks
    const priyaBookmarks = ["oop-classes-objects", "file-handling-exceptions"];
    for (const b of priyaBookmarks) {
      await client.query(
        `
        INSERT INTO user_bookmarks (user_id, topic_id)
        VALUES ($1, $2)
        ON CONFLICT (user_id, topic_id) DO NOTHING;
        `,
        [priyaId, b]
      );
    }

    // 3. Seed LearnWithUs Administrator (admin@learnwithus.com)
    const admin1Res = await client.query(
      `
      INSERT INTO users (full_name, email, password_hash, role, account_status, avatar, bio, learning_stage, preferred_language)
      VALUES ($1, $2, $3, 'admin', 'active', $4, $5, $6, $7)
      ON CONFLICT ((LOWER(email))) DO UPDATE
        SET full_name = EXCLUDED.full_name,
            password_hash = EXCLUDED.password_hash,
            role = 'admin',
            account_status = 'active',
            avatar = EXCLUDED.avatar,
            learning_stage = EXCLUDED.learning_stage,
            preferred_language = EXCLUDED.preferred_language
      RETURNING id;
      `,
      [
        "LearnWithUs Administrator",
        "admin@learnwithus.com",
        passwordHash,
        "sparkles",
        "Head Administrator & Platform Supervisor.",
        "pro",
        "english"
      ]
    );
    const admin1Id = admin1Res.rows[0].id;

    await client.query(
      `
      INSERT INTO user_rewards (user_id, total_xp, current_streak, longest_streak, doubt_credits, free_doubts_total, doubts_used)
      VALUES ($1, 2500, 30, 30, 999, 999, 0)
      ON CONFLICT (user_id) DO UPDATE
        SET total_xp = EXCLUDED.total_xp,
            current_streak = EXCLUDED.current_streak,
            longest_streak = EXCLUDED.longest_streak;
      `,
      [admin1Id]
    );

    // 4. Seed Demo Admin (admin@example.com)
    const admin2Res = await client.query(
      `
      INSERT INTO users (full_name, email, password_hash, role, account_status, avatar, bio, learning_stage, preferred_language)
      VALUES ($1, $2, $3, 'admin', 'active', $4, $5, $6, $7)
      ON CONFLICT ((LOWER(email))) DO UPDATE
        SET full_name = EXCLUDED.full_name,
            password_hash = EXCLUDED.password_hash,
            role = 'admin',
            account_status = 'active',
            avatar = EXCLUDED.avatar,
            learning_stage = EXCLUDED.learning_stage,
            preferred_language = EXCLUDED.preferred_language
      RETURNING id;
      `,
      [
        "Demo Admin",
        "admin@example.com",
        passwordHash,
        "sparkles",
        "Demo System Administrator.",
        "pro",
        "english"
      ]
    );
    const admin2Id = admin2Res.rows[0].id;

    await client.query(
      `
      INSERT INTO user_rewards (user_id, total_xp, current_streak, longest_streak, doubt_credits, free_doubts_total, doubts_used)
      VALUES ($1, 2000, 20, 20, 999, 999, 0)
      ON CONFLICT (user_id) DO UPDATE
        SET total_xp = EXCLUDED.total_xp,
            current_streak = EXCLUDED.current_streak,
            longest_streak = EXCLUDED.longest_streak;
      `,
      [admin2Id]
    );

    await client.query("COMMIT");
    console.log("PostgreSQL seed data created/verified successfully!");
    console.log("Verified Accounts:");
    console.log("  1) alex@example.com / password123 (Student, College, 420 XP)");
    console.log("  2) priya@example.com / password123 (Student, Graduate, 850 XP)");
    console.log("  3) admin@learnwithus.com / password123 (Admin, 2500 XP)");
    console.log("  4) admin@example.com / password123 (Admin, 2000 XP)");
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

if (process.argv[1] && process.argv[1].endsWith("seed.js")) {
  runSeeds()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Seed error:", err);
      process.exit(1);
    });
}
