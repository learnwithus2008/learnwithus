import { query, withTransaction } from "../config/db.js";

export const adminRepository = {
  /**
   * Aggregate platform-wide analytics and user status overview
   */
  async getPlatformOverview() {
    // 1. Core aggregates
    const metricsRes = await query(`
      SELECT
        (SELECT COUNT(*) FROM users) AS total_users,
        (SELECT COUNT(*) FROM users WHERE account_status = 'active') AS active_accounts,
        (SELECT COUNT(*) FROM users WHERE account_status = 'suspended') AS suspended_accounts,
        (SELECT COUNT(*) FROM users WHERE role = 'admin') AS admin_count,
        (SELECT COUNT(*) FROM user_learning_progress WHERE completed = TRUE) AS total_topics_completed,
        (SELECT COUNT(*) FROM user_learning_progress WHERE quiz_score IS NOT NULL) AS total_quiz_attempts,
        (SELECT COUNT(*) FROM user_learning_progress WHERE quiz_score >= 70) AS total_quizzes_passed,
        (SELECT COALESCE(ROUND(AVG(quiz_score)), 0) FROM user_learning_progress WHERE quiz_score IS NOT NULL) AS avg_quiz_score,
        (SELECT COALESCE(SUM(total_xp), 0) FROM user_rewards) AS total_xp_accumulated,
        (SELECT COALESCE(ROUND(AVG(total_xp)), 0) FROM user_rewards) AS avg_xp_per_user,
        (SELECT COALESCE(ROUND(AVG(current_streak)), 0) FROM user_rewards) AS avg_streak,
        (SELECT COUNT(DISTINCT user_id) FROM user_rewards WHERE last_active_date >= CURRENT_DATE - INTERVAL '7 days') AS active_users_7d,
        (SELECT COUNT(DISTINCT user_id) FROM user_rewards WHERE last_active_date = CURRENT_DATE) AS active_users_today
    `);

    const metrics = metricsRes.rows[0];
    const totalQuizAttempts = parseInt(metrics.total_quiz_attempts, 10);
    const totalQuizzesPassed = parseInt(metrics.total_quizzes_passed, 10);
    const quizPassRate = totalQuizAttempts > 0 
      ? Math.round((totalQuizzesPassed / totalQuizAttempts) * 100) 
      : 0;

    // 2. Stage distribution
    const stageRes = await query(`
      SELECT learning_stage, COUNT(*)::INTEGER AS count
      FROM users
      GROUP BY learning_stage
      ORDER BY count DESC
    `);

    // 3. Language distribution
    const langRes = await query(`
      SELECT preferred_language, COUNT(*)::INTEGER AS count
      FROM users
      GROUP BY preferred_language
      ORDER BY count DESC
    `);

    // 4. Top learners leaderboard
    const leaderboardRes = await query(`
      SELECT 
        u.id,
        u.full_name AS name,
        u.email,
        u.avatar,
        u.learning_stage AS stage,
        u.role,
        r.total_xp,
        r.current_streak,
        COUNT(p.id) FILTER (WHERE p.completed = TRUE)::INTEGER AS completed_topics
      FROM users u
      LEFT JOIN user_rewards r ON r.user_id = u.id
      LEFT JOIN user_learning_progress p ON p.user_id = u.id
      GROUP BY u.id, r.total_xp, r.current_streak
      ORDER BY r.total_xp DESC NULLS LAST
      LIMIT 6
    `);

    // 5. Recent platform activities across all users
    const activitiesRes = await query(`
      SELECT 
        a.id,
        a.activity_type,
        a.topic_id,
        a.xp_earned,
        a.details,
        a.created_at,
        u.id AS user_id,
        u.full_name AS user_name,
        u.email AS user_email,
        u.avatar AS user_avatar
      FROM user_activity_logs a
      JOIN users u ON u.id = a.user_id
      ORDER BY a.created_at DESC
      LIMIT 20
    `);

    // 6. Weak topics from real quiz attempts
    const weakTopicsRes = await query(`
      SELECT 
        topic_id,
        COUNT(*)::INTEGER AS attempts,
        ROUND(AVG(quiz_score))::INTEGER AS avg_score,
        COUNT(*) FILTER (WHERE quiz_score < 70)::INTEGER AS fail_count
      FROM user_learning_progress
      WHERE quiz_score IS NOT NULL
      GROUP BY topic_id
      ORDER BY avg_score ASC, attempts DESC
      LIMIT 10
    `);

    // 7. Most completed topics
    const topicMasteryRes = await query(`
      SELECT 
        topic_id,
        COUNT(*)::INTEGER AS completed_count
      FROM user_learning_progress
      WHERE completed = TRUE
      GROUP BY topic_id
      ORDER BY completed_count DESC
      LIMIT 10
    `);

    return {
      metrics: {
        totalUsers: parseInt(metrics.total_users, 10),
        activeAccounts: parseInt(metrics.active_accounts, 10),
        suspendedAccounts: parseInt(metrics.suspended_accounts, 10),
        adminCount: parseInt(metrics.admin_count, 10),
        totalTopicsCompleted: parseInt(metrics.total_topics_completed, 10),
        totalQuizAttempts,
        totalQuizzesPassed,
        quizPassRate,
        avgQuizScore: parseInt(metrics.avg_quiz_score, 10),
        totalXpAccumulated: parseInt(metrics.total_xp_accumulated, 10),
        avgXpPerUser: parseInt(metrics.avg_xp_per_user, 10),
        avgStreak: parseInt(metrics.avg_streak, 10),
        activeUsers7d: parseInt(metrics.active_users_7d, 10),
        activeUsersToday: parseInt(metrics.active_users_today, 10)
      },
      stageDistribution: stageRes.rows,
      languageDistribution: langRes.rows,
      topLearners: leaderboardRes.rows,
      recentActivities: activitiesRes.rows,
      weakTopics: weakTopicsRes.rows,
      topCompletedTopics: topicMasteryRes.rows
    };
  },

  /**
   * Paginated and filterable user directory with aggregated learning progress
   */
  async listUsers({
    search = "",
    stage = "",
    role = "",
    status = "",
    sortBy = "created_at",
    sortOrder = "DESC",
    limit = 50,
    offset = 0
  } = {}) {
    const conditions = [];
    const params = [];
    let idx = 1;

    if (search.trim()) {
      conditions.push(`(u.full_name ILIKE $${idx} OR u.email ILIKE $${idx})`);
      params.push(`%${search.trim()}%`);
      idx++;
    }

    if (stage && stage !== "all") {
      conditions.push(`u.learning_stage = $${idx}`);
      params.push(stage);
      idx++;
    }

    if (role && role !== "all") {
      conditions.push(`u.role = $${idx}`);
      params.push(role);
      idx++;
    }

    if (status && status !== "all") {
      conditions.push(`u.account_status = $${idx}`);
      params.push(status);
      idx++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // Count query
    const countSql = `SELECT COUNT(*) FROM users u ${whereClause}`;
    const countRes = await query(countSql, params);
    const totalCount = parseInt(countRes.rows[0].count, 10);

    // Sorting column mapping for SQL safety
    const allowedSortCols = {
      created_at: "u.created_at",
      name: "u.full_name",
      xp: "total_xp",
      streak: "current_streak",
      completed: "completed_topics_count",
      last_active: "r.last_active_date"
    };

    const sortCol = allowedSortCols[sortBy] || "u.created_at";
    const direction = sortOrder.toUpperCase() === "ASC" ? "ASC" : "DESC";

    // Main directory query with joined reward & progress aggregates
    const queryParams = [...params, limit, offset];
    const dataSql = `
      SELECT
        u.id,
        u.full_name AS name,
        u.email,
        u.avatar,
        u.bio,
        u.learning_stage AS stage,
        u.preferred_language AS language,
        u.role,
        u.account_status AS status,
        u.created_at,
        u.updated_at,
        COALESCE(r.total_xp, 0) AS total_xp,
        COALESCE(r.current_streak, 0) AS current_streak,
        COALESCE(r.longest_streak, 0) AS longest_streak,
        r.last_active_date,
        COUNT(DISTINCT p.id) FILTER (WHERE p.completed = TRUE)::INTEGER AS completed_topics_count,
        COUNT(DISTINCT b.id)::INTEGER AS bookmarks_count,
        COUNT(DISTINCT s.id) FILTER (WHERE s.revoked_at IS NULL AND s.expires_at > NOW())::INTEGER AS active_sessions_count
      FROM users u
      LEFT JOIN user_rewards r ON r.user_id = u.id
      LEFT JOIN user_learning_progress p ON p.user_id = u.id
      LEFT JOIN user_bookmarks b ON b.user_id = u.id
      LEFT JOIN user_sessions s ON s.user_id = u.id
      ${whereClause}
      GROUP BY u.id, r.id
      ORDER BY ${sortCol} ${direction} NULLS LAST
      LIMIT $${idx++} OFFSET $${idx++};
    `;

    const dataRes = await query(dataSql, queryParams);

    return {
      users: dataRes.rows,
      totalCount,
      limit,
      offset
    };
  },

  /**
   * Deep-dive status for a specific user (progress records, quiz scores, bookmarks, activity logs, sessions)
   */
  async getUserDeepDive(userId) {
    const userRes = await query(
      `
      SELECT
        u.id,
        u.full_name AS name,
        u.email,
        u.avatar,
        u.bio,
        u.learning_stage AS stage,
        u.preferred_language AS language,
        u.role,
        u.account_status AS status,
        u.created_at,
        u.updated_at,
        COALESCE(r.total_xp, 0) AS total_xp,
        COALESCE(r.current_streak, 0) AS current_streak,
        COALESCE(r.longest_streak, 0) AS longest_streak,
        r.last_active_date
      FROM users u
      LEFT JOIN user_rewards r ON r.user_id = u.id
      WHERE u.id = $1;
      `,
      [userId]
    );

    if (userRes.rows.length === 0) return null;
    const user = userRes.rows[0];

    // Progress list
    const progressRes = await query(
      `
      SELECT 
        topic_id,
        completed,
        completed_at,
        quiz_score,
        last_accessed_at
      FROM user_learning_progress
      WHERE user_id = $1
      ORDER BY last_accessed_at DESC;
      `,
      [userId]
    );

    // Bookmarks list
    const bookmarksRes = await query(
      `
      SELECT topic_id, created_at
      FROM user_bookmarks
      WHERE user_id = $1
      ORDER BY created_at DESC;
      `,
      [userId]
    );

    // Recent activity logs
    const activitiesRes = await query(
      `
      SELECT id, activity_type, topic_id, xp_earned, details, created_at
      FROM user_activity_logs
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 30;
      `,
      [userId]
    );

    // Active sessions
    const sessionsRes = await query(
      `
      SELECT id, created_at, expires_at, revoked_at, ip_address, user_agent
      FROM user_sessions
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 10;
      `,
      [userId]
    );

    return {
      user,
      learningProgress: progressRes.rows,
      bookmarks: bookmarksRes.rows,
      activities: activitiesRes.rows,
      sessions: sessionsRes.rows
    };
  },

  /**
   * Change account status (active ↔ suspended)
   */
  async updateStatus(userId, status) {
    return await withTransaction(async (client) => {
      const res = await client.query(
        `
        UPDATE users
        SET account_status = $1, updated_at = NOW()
        WHERE id = $2
        RETURNING id, full_name, email, role, account_status;
        `,
        [status, userId]
      );

      // If suspending account, revoke all current active sessions
      if (status === "suspended") {
        await client.query(
          `
          UPDATE user_sessions
          SET revoked_at = NOW()
          WHERE user_id = $1 AND revoked_at IS NULL;
          `,
          [userId]
        );
      }

      return res.rows[0] || null;
    });
  },

  /**
   * Change user role (student ↔ admin)
   */
  async updateRole(userId, role) {
    const res = await query(
      `
      UPDATE users
      SET role = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING id, full_name, email, role, account_status;
      `,
      [role, userId]
    );
    return res.rows[0] || null;
  },

  /**
   * Grant bonus XP to a learner
   */
  async awardBonusXP(userId, xpAmount, reason = "Admin reward") {
    return await withTransaction(async (client) => {
      const res = await client.query(
        `
        UPDATE user_rewards
        SET total_xp = total_xp + $1, updated_at = NOW()
        WHERE user_id = $2
        RETURNING *;
        `,
        [xpAmount, userId]
      );

      await client.query(
        `
        INSERT INTO user_activity_logs (user_id, activity_type, xp_earned, details)
        VALUES ($1, 'XP_EARNED', $2, $3);
        `,
        [userId, xpAmount, JSON.stringify({ reason, grantedBy: "admin" })]
      );

      return res.rows[0];
    });
  },

  /**
   * Log an administrative action to admin_audit_logs
   */
  async logAction({
    adminId,
    adminEmail,
    adminName,
    action,
    targetType,
    targetId = null,
    details = {},
    ipAddress = null
  }) {
    const res = await query(
      `
      INSERT INTO admin_audit_logs (
        admin_id, admin_email, admin_name, action, target_type, target_id, details, ip_address
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
      `,
      [adminId, adminEmail, adminName, action, targetType, targetId, JSON.stringify(details), ipAddress]
    );
    return res.rows[0];
  },

  /**
   * List admin audit logs with pagination and search
   */
  async getAuditLogs({ limit = 50, offset = 0, action = "", search = "" } = {}) {
    const conditions = [];
    const params = [];
    let idx = 1;

    if (action && action !== "all") {
      conditions.push(`action = $${idx}`);
      params.push(action);
      idx++;
    }

    if (search.trim()) {
      conditions.push(`(admin_name ILIKE $${idx} OR admin_email ILIKE $${idx} OR action ILIKE $${idx} OR target_type ILIKE $${idx} OR target_id ILIKE $${idx})`);
      params.push(`%${search.trim()}%`);
      idx++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const countRes = await query(`SELECT COUNT(*) FROM admin_audit_logs ${whereClause}`, params);
    const totalCount = parseInt(countRes.rows[0].count, 10);

    const queryParams = [...params, limit, offset];
    const dataSql = `
      SELECT id, admin_id, admin_email, admin_name, action, target_type, target_id, details, ip_address, created_at
      FROM admin_audit_logs
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${idx++} OFFSET $${idx++};
    `;

    const dataRes = await query(dataSql, queryParams);

    return {
      logs: dataRes.rows,
      totalCount,
      limit,
      offset
    };
  },

  /**
   * Retrieve all active curriculum overrides
   */
  async getCurriculumOverrides() {
    const res = await query(
      `
      SELECT id, entity_type, entity_id, data, is_archived, created_by, created_at, updated_at
      FROM curriculum_overrides
      ORDER BY updated_at DESC;
      `
    );
    return res.rows;
  },

  /**
   * Save or update a curriculum override
   */
  async saveCurriculumOverride({ entityType, entityId, data, isArchived = false, createdBy = null }) {
    const res = await query(
      `
      INSERT INTO curriculum_overrides (entity_type, entity_id, data, is_archived, created_by, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      ON CONFLICT (entity_type, entity_id)
      DO UPDATE SET
        data = EXCLUDED.data,
        is_archived = EXCLUDED.is_archived,
        updated_at = NOW()
      RETURNING *;
      `,
      [entityType, entityId, JSON.stringify(data), isArchived, createdBy]
    );
    return res.rows[0];
  },

  /**
   * Delete or archive a curriculum override
   */
  async deleteCurriculumOverride(entityType, entityId) {
    const res = await query(
      `
      DELETE FROM curriculum_overrides
      WHERE entity_type = $1 AND entity_id = $2
      RETURNING *;
      `,
      [entityType, entityId]
    );
    return res.rows[0] || null;
  },

  /**
   * Safety check: Check if student progress references a topic
   */
  async checkTopicUsage(topicId) {
    const res = await query(
      `
      SELECT 
        COUNT(DISTINCT user_id)::INTEGER AS student_count,
        COUNT(id) FILTER (WHERE completed = TRUE)::INTEGER AS completed_count,
        COUNT(id) FILTER (WHERE quiz_score IS NOT NULL)::INTEGER AS quiz_attempts_count
      FROM user_learning_progress
      WHERE topic_id = $1;
      `,
      [topicId]
    );

    const stats = res.rows[0] || { student_count: 0, completed_count: 0, quiz_attempts_count: 0 };
    return {
      topicId,
      studentCount: stats.student_count,
      completedCount: stats.completed_count,
      quizAttemptsCount: stats.quiz_attempts_count,
      hasStudentData: stats.student_count > 0 || stats.completed_count > 0 || stats.quiz_attempts_count > 0
    };
  }
};
