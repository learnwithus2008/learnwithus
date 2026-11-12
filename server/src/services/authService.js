import bcrypt from "bcryptjs";
import { withTransaction } from "../config/db.js";
import { userRepository } from "../repositories/userRepository.js";
import { sessionRepository } from "../repositories/sessionRepository.js";
import { rewardRepository } from "../repositories/rewardRepository.js";
import { progressRepository } from "../repositories/progressRepository.js";
import { bookmarkRepository } from "../repositories/bookmarkRepository.js";
import { activityRepository } from "../repositories/activityRepository.js";
import { passwordResetRepository } from "../repositories/passwordResetRepository.js";

/**
 * Assemble sanitized user payload format expected by the frontend
 */
export async function buildFullUserProfile(userId, dbClient = null) {
  const user = await userRepository.findById(userId, dbClient);
  if (!user) return null;

  const rewards = (await rewardRepository.getByUserId(userId, dbClient)) || {
    total_xp: 50,
    current_streak: 1,
    longest_streak: 1
  };

  const progressRows = await progressRepository.getByUserId(userId, dbClient);
  const completedTopics = progressRows.filter((p) => p.completed).map((p) => p.topic_id);
  const quizScores = {};
  progressRows.forEach((p) => {
    if (p.quiz_score !== null && p.quiz_score !== undefined) {
      quizScores[p.topic_id] = p.quiz_score;
    }
  });

  const bookmarks = await bookmarkRepository.getByUserId(userId, dbClient);

  return {
    id: user.id,
    name: user.full_name,
    email: user.email,
    role: user.role || "student",
    accountStatus: user.account_status || "active",
    stage: user.learning_stage,
    language: user.preferred_language,
    avatar: user.avatar,
    bio: user.bio,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
    stats: {
      xp: rewards.total_xp,
      streakDays: rewards.current_streak,
      longestStreak: rewards.longest_streak,
      completedTopics,
      bookmarkedTopics: bookmarks,
      quizScores,
      doubtCredits: rewards.doubt_credits !== undefined && rewards.doubt_credits !== null ? rewards.doubt_credits : 10,
      freeDoubtsTotal: rewards.free_doubts_total !== undefined && rewards.free_doubts_total !== null ? rewards.free_doubts_total : 10,
      doubtsUsed: rewards.doubts_used || 0
    }
  };
}

export const authService = {
  async register({ name, email, password, stage, language, avatar, bio }, meta = {}) {
    const cleanEmail = email.trim().toLowerCase();

    // Check existing email
    const existing = await userRepository.findByEmail(cleanEmail);
    if (existing) {
      const err = new Error("An account with this email already exists. Please sign in.");
      err.statusCode = 409;
      throw err;
    }

    return await withTransaction(async (client) => {
      // 1. Hash password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      // 2. Create User
      const user = await userRepository.create(
        {
          name: name.trim(),
          email: cleanEmail,
          passwordHash,
          stage: stage || "young",
          language: language || "english",
          avatar: avatar || "snake_blue",
          bio: bio || ""
        },
        client
      );

      // 3. Initialize Rewards (+50 XP signup welcome bonus)
      await rewardRepository.initialize(user.id, 50, client);

      // 4. Log Activity
      await activityRepository.log(user.id, "SIGNUP", null, 50, { stage, language }, client);

      // 5. Create Session
      const session = await sessionRepository.createSession(
        user.id,
        meta.ipAddress,
        meta.userAgent,
        undefined,
        client
      );

      const profile = await buildFullUserProfile(user.id, client);

      return {
        user: profile,
        sessionToken: session.token,
        expiresAt: session.expiresAt
      };
    });
  },

  async login({ emailOrUsername, password }, meta = {}) {
    const queryStr = emailOrUsername.trim();

    // Check by email or display name
    let user = await userRepository.findByEmail(queryStr);
    if (!user) {
      user = await userRepository.findByName(queryStr);
    }

    if (!user) {
      const err = new Error("No account found with this email or username.");
      err.statusCode = 404;
      throw err;
    }

    // Check account status
    if (user.account_status === "suspended") {
      const err = new Error("Your account has been suspended by an administrator. Please contact support.");
      err.statusCode = 403;
      throw err;
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      const err = new Error("Incorrect password. Please try again.");
      err.statusCode = 401;
      throw err;
    }

    // Update daily streak
    await rewardRepository.updateStreak(user.id);

    // Create session
    const session = await sessionRepository.createSession(
      user.id,
      meta.ipAddress,
      meta.userAgent
    );

    await activityRepository.log(user.id, "LOGIN", null, 0, { ip: meta.ipAddress });

    const profile = await buildFullUserProfile(user.id);

    return {
      user: profile,
      sessionToken: session.token,
      expiresAt: session.expiresAt
    };
  },

  async logout(sessionToken) {
    if (sessionToken) {
      await sessionRepository.revokeSession(sessionToken);
    }
  },

  async getSessionUser(sessionToken) {
    if (!sessionToken) return null;
    const session = await sessionRepository.findValidSession(sessionToken);
    if (!session) return null;
    return await buildFullUserProfile(session.user_id);
  },

  async forgotPassword(email) {
    const cleanEmail = email.trim().toLowerCase();
    const user = await userRepository.findByEmail(cleanEmail);
    if (!user) {
      return { sent: true, message: "If an account with this email exists, password reset instructions have been prepared." };
    }

    const { rawToken, expiresAt } = await passwordResetRepository.createToken(user.id, 15);
    await activityRepository.log(user.id, "PASSWORD_RESET_REQUEST", null, 0, {});

    return {
      sent: true,
      resetToken: rawToken,
      expiresAt,
      message: "If an account with this email exists, password reset instructions have been prepared."
    };
  },

  async resetPassword({ email, newPassword, token }) {
    return await withTransaction(async (client) => {
      let targetUserId = null;

      if (token) {
        const tokenRecord = await passwordResetRepository.findValidToken(token, client);
        if (!tokenRecord) {
          const err = new Error("Invalid or expired password reset token.");
          err.statusCode = 400;
          throw err;
        }
        targetUserId = tokenRecord.user_id;
        await passwordResetRepository.markTokenUsed(token, client);
      } else {
        const cleanEmail = email.trim().toLowerCase();
        const user = await userRepository.findByEmail(cleanEmail, client);
        if (!user) {
          const err = new Error("No account found with this email address.");
          err.statusCode = 404;
          throw err;
        }
        targetUserId = user.id;
      }

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(newPassword, salt);

      await userRepository.update(targetUserId, { passwordHash }, client);
      await sessionRepository.revokeAllUserSessions(targetUserId, client);
      await activityRepository.log(targetUserId, "PASSWORD_RESET_SUCCESS", null, 0, {}, client);
      return true;
    });
  }
};
