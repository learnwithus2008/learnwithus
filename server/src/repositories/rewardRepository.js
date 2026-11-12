import { query } from "../config/db.js";

export const rewardRepository = {
  async getByUserId(userId, dbClient = null) {
    const q = dbClient ? dbClient.query.bind(dbClient) : query;
    const res = await q(
      "SELECT * FROM user_rewards WHERE user_id = $1 LIMIT 1",
      [userId]
    );
    return res.rows[0] || null;
  },

  async initialize(userId, initialXp = 50, dbClient = null) {
    const q = dbClient ? dbClient.query.bind(dbClient) : query;
    const res = await q(
      `
      INSERT INTO user_rewards (user_id, total_xp, current_streak, longest_streak, last_active_date)
      VALUES ($1, $2, 1, 1, CURRENT_DATE)
      ON CONFLICT (user_id) DO NOTHING
      RETURNING *;
      `,
      [userId, initialXp]
    );
    return res.rows[0] || await this.getByUserId(userId, dbClient);
  },

  async addXP(userId, xpDelta, dbClient = null) {
    const q = dbClient ? dbClient.query.bind(dbClient) : query;
    const res = await q(
      `
      UPDATE user_rewards
      SET total_xp = GREATEST(0, total_xp + $2),
          updated_at = NOW()
      WHERE user_id = $1
      RETURNING *;
      `,
      [userId, xpDelta]
    );
    return res.rows[0] || null;
  },

  async updateStreak(userId, dbClient = null) {
    const q = dbClient ? dbClient.query.bind(dbClient) : query;
    const current = await this.getByUserId(userId, dbClient);
    if (!current) return await this.initialize(userId, 50, dbClient);

    const today = new Date().toISOString().split("T")[0];
    const lastActive = current.last_active_date ? new Date(current.last_active_date).toISOString().split("T")[0] : null;

    let newStreak = current.current_streak;
    let longestStreak = current.longest_streak;

    if (lastActive !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
      if (lastActive === yesterday) {
        newStreak += 1;
        if (newStreak > longestStreak) longestStreak = newStreak;
      } else if (lastActive) {
        newStreak = 1;
      }

      const res = await q(
        `
        UPDATE user_rewards
        SET current_streak = $2,
            longest_streak = $3,
            last_active_date = CURRENT_DATE,
            updated_at = NOW()
        WHERE user_id = $1
        RETURNING *;
        `,
        [userId, newStreak, longestStreak]
      );
      return res.rows[0];
    }
    return current;
  },

  async useDoubtCredit(userId, dbClient = null) {
    const q = dbClient ? dbClient.query.bind(dbClient) : query;
    const res = await q(
      `
      UPDATE user_rewards
      SET doubt_credits = GREATEST(0, COALESCE(doubt_credits, 10) - 1),
          doubts_used = COALESCE(doubts_used, 0) + 1,
          updated_at = NOW()
      WHERE user_id = $1
      RETURNING *;
      `,
      [userId]
    );
    return res.rows[0] || null;
  },

  async addDoubtCredits(userId, count = 1, dbClient = null) {
    const q = dbClient ? dbClient.query.bind(dbClient) : query;
    const res = await q(
      `
      UPDATE user_rewards
      SET doubt_credits = COALESCE(doubt_credits, 10) + $2,
          updated_at = NOW()
      WHERE user_id = $1
      RETURNING *;
      `,
      [userId, count]
    );
    return res.rows[0] || null;
  }
};
