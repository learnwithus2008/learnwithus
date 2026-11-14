import { query } from "../config/db.js";

export const userRepository = {
  async findByEmail(email, dbClient = null) {
    const q = dbClient ? dbClient.query.bind(dbClient) : query;
    const res = await q(
      "SELECT * FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1",
      [email]
    );
    return res.rows[0] || null;
  },

  async findByName(name, dbClient = null) {
    const q = dbClient ? dbClient.query.bind(dbClient) : query;
    const res = await q(
      "SELECT * FROM users WHERE LOWER(full_name) = LOWER($1) LIMIT 1",
      [name]
    );
    return res.rows[0] || null;
  },

  async findById(id, dbClient = null) {
    const q = dbClient ? dbClient.query.bind(dbClient) : query;
    const res = await q(
      "SELECT * FROM users WHERE id = $1 LIMIT 1",
      [id]
    );
    return res.rows[0] || null;
  },

  async create(userData, dbClient = null) {
    const q = dbClient ? dbClient.query.bind(dbClient) : query;
    const { name, email, passwordHash, stage, language, avatar, bio, role, accountStatus } = userData;
    const res = await q(
      `
      INSERT INTO users (full_name, email, password_hash, learning_stage, preferred_language, avatar, bio, role, account_status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *;
      `,
      [
        name,
        email.toLowerCase(),
        passwordHash,
        stage || "young",
        language || "english",
        avatar || "snake_blue",
        bio || "",
        role || "student",
        accountStatus || "active"
      ]
    );
    return res.rows[0];
  },

  async update(id, updates, dbClient = null) {
    const q = dbClient ? dbClient.query.bind(dbClient) : query;
    const fields = [];
    const values = [];
    let idx = 1;

    if (updates.name !== undefined) {
      fields.push(`full_name = $${idx++}`);
      values.push(updates.name);
    }
    if (updates.bio !== undefined) {
      fields.push(`bio = $${idx++}`);
      values.push(updates.bio);
    }
    if (updates.stage !== undefined) {
      fields.push(`learning_stage = $${idx++}`);
      values.push(updates.stage);
    }
    if (updates.language !== undefined) {
      fields.push(`preferred_language = $${idx++}`);
      values.push(updates.language);
    }
    if (updates.avatar !== undefined) {
      fields.push(`avatar = $${idx++}`);
      values.push(updates.avatar);
    }
    if (updates.role !== undefined) {
      fields.push(`role = $${idx++}`);
      values.push(updates.role);
    }
    if (updates.accountStatus !== undefined || updates.status !== undefined) {
      fields.push(`account_status = $${idx++}`);
      values.push(updates.accountStatus || updates.status);
    }
    if (updates.passwordHash !== undefined) {
      fields.push(`password_hash = $${idx++}`);
      values.push(updates.passwordHash);
    }

    if (fields.length === 0) return await this.findById(id, dbClient);

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const res = await q(
      `
      UPDATE users
      SET ${fields.join(", ")}
      WHERE id = $${idx}
      RETURNING *;
      `,
      values
    );
    return res.rows[0] || null;
  },

  async delete(id, dbClient = null) {
    const q = dbClient ? dbClient.query.bind(dbClient) : query;
    await q("DELETE FROM users WHERE id = $1", [id]);
    return true;
  },

  /**
   * Bulk delete all users at one time
   * Safely excludes the active administrator if excludeAdminId is provided
   */
  async deleteAll({ excludeAdminId = null, role = null, preserveDemoAccounts = true } = {}, dbClient = null) {
    const q = dbClient ? dbClient.query.bind(dbClient) : query;
    let sql = "DELETE FROM users WHERE 1=1";
    const params = [];

    if (excludeAdminId) {
      params.push(excludeAdminId);
      sql += ` AND id != $${params.length}`;
    }

    if (preserveDemoAccounts) {
      sql += ` AND LOWER(email) NOT IN ('alex@example.com', 'priya@example.com', 'admin@learnwithus.com', 'admin@example.com')`;
    }

    if (role && role !== "all") {
      params.push(role);
      sql += ` AND role = $${params.length}`;
    }

    sql += " RETURNING id, full_name, email, role;";
    const res = await q(sql, params);
    return {
      deletedCount: res.rowCount || res.rows.length,
      deletedUsers: res.rows
    };
  },

  /**
   * Bulk delete a specified list of user IDs
   */
  async bulkDelete(userIds = [], excludeAdminId = null, dbClient = null) {
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return { deletedCount: 0, deletedUsers: [] };
    }
    const q = dbClient ? dbClient.query.bind(dbClient) : query;
    let sql = "DELETE FROM users WHERE id = ANY($1::uuid[])";
    const params = [userIds];

    if (excludeAdminId) {
      params.push(excludeAdminId);
      sql += ` AND id != $${params.length}`;
    }

    sql += " RETURNING id, full_name, email, role;";
    const res = await q(sql, params);
    return {
      deletedCount: res.rowCount || res.rows.length,
      deletedUsers: res.rows
    };
  }
};
