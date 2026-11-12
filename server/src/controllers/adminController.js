import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { query } from "../config/db.js";
import { adminRepository } from "../repositories/adminRepository.js";
import { userRepository } from "../repositories/userRepository.js";

export const adminController = {
  /**
   * GET /api/admin/overview
   */
  async getOverview(req, res, next) {
    try {
      const data = await adminRepository.getPlatformOverview();
      res.json({
        success: true,
        data
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/admin/users
   */
  async getUsers(req, res, next) {
    try {
      const {
        search = "",
        stage = "",
        role = "",
        status = "",
        sortBy = "created_at",
        sortOrder = "DESC",
        page = 1,
        limit = 50
      } = req.query;

      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
      const offset = (pageNum - 1) * limitNum;

      const result = await adminRepository.listUsers({
        search,
        stage,
        role,
        status,
        sortBy,
        sortOrder,
        limit: limitNum,
        offset
      });

      res.json({
        success: true,
        data: result.users,
        pagination: {
          total: result.totalCount,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(result.totalCount / limitNum)
        }
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/admin/users/:id
   */
  async getUserById(req, res, next) {
    try {
      const { id } = req.params;
      const details = await adminRepository.getUserDeepDive(id);

      if (!details) {
        return res.status(404).json({
          success: false,
          error: "User not found"
        });
      }

      res.json({
        success: true,
        data: details
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * PATCH /api/admin/users/:id/status
   */
  async updateUserStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status || !["active", "suspended"].includes(status)) {
        return res.status(400).json({
          success: false,
          error: "Invalid status. Allowed values: 'active', 'suspended'."
        });
      }

      // Prevent admin from suspending their own active account
      if (req.user.id === id && status === "suspended") {
        return res.status(400).json({
          success: false,
          error: "Administrators cannot suspend their own active account."
        });
      }

      const updated = await adminRepository.updateStatus(id, status);
      if (!updated) {
        return res.status(404).json({
          success: false,
          error: "User not found"
        });
      }

      // Log administrative audit action
      await adminRepository.logAction({
        adminId: req.user.id,
        adminEmail: req.user.email,
        adminName: req.user.name || req.user.full_name,
        action: status === "suspended" ? "SUSPEND_USER" : "REACTIVATE_USER",
        targetType: "USER",
        targetId: id,
        details: { status, userEmail: updated.email },
        ipAddress: req.ip
      });

      res.json({
        success: true,
        data: updated,
        message: `User status changed to ${status}`
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * PATCH /api/admin/users/:id/role
   */
  async updateUserRole(req, res, next) {
    try {
      const { id } = req.params;
      const { role } = req.body;

      if (!role || !["student", "admin"].includes(role)) {
        return res.status(400).json({
          success: false,
          error: "Invalid role. Allowed values: 'student', 'admin'."
        });
      }

      // Prevent admin from revoking their own admin role
      if (req.user.id === id && role !== "admin") {
        return res.status(400).json({
          success: false,
          error: "Administrators cannot revoke their own admin role."
        });
      }

      const updated = await adminRepository.updateRole(id, role);
      if (!updated) {
        return res.status(404).json({
          success: false,
          error: "User not found"
        });
      }

      // Log administrative audit action
      await adminRepository.logAction({
        adminId: req.user.id,
        adminEmail: req.user.email,
        adminName: req.user.name || req.user.full_name,
        action: "UPDATE_USER_ROLE",
        targetType: "USER",
        targetId: id,
        details: { newRole: role, userEmail: updated.email },
        ipAddress: req.ip
      });

      res.json({
        success: true,
        data: updated,
        message: `User role updated to ${role}`
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/admin/users/:id/bonus-xp
   */
  async awardBonusXp(req, res, next) {
    try {
      const { id } = req.params;
      const { amount, reason } = req.body;

      const xpAmount = parseInt(amount, 10);
      if (isNaN(xpAmount) || xpAmount <= 0) {
        return res.status(400).json({
          success: false,
          error: "Bonus XP amount must be a positive number."
        });
      }

      const updatedRewards = await adminRepository.awardBonusXP(
        id,
        xpAmount,
        reason || "Admin granted reward bonus"
      );

      // Log administrative audit action
      await adminRepository.logAction({
        adminId: req.user.id,
        adminEmail: req.user.email,
        adminName: req.user.name || req.user.full_name,
        action: "AWARD_BONUS_XP",
        targetType: "USER",
        targetId: id,
        details: { amount: xpAmount, reason },
        ipAddress: req.ip
      });

      res.json({
        success: true,
        data: updatedRewards,
        message: `Awarded +${xpAmount} XP to learner.`
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * DELETE /api/admin/users
   * Delete all users at one time (DISABLED BY DEFAULT FOR SYSTEM SAFETY)
   * Strict safeguards:
   * 1. Requires ENABLE_BULK_USER_PURGE=true in server environment.
   * 2. Requires explicit confirmation: confirmPhrase === "DELETE ALL USERS".
   * 3. Requires strong authorization: adminPassword re-verification against bcrypt hash.
   * 4. Automatic pre-purge recovery snapshot generated to server/backups prior to execution.
   */
  async deleteAllUsers(req, res, next) {
    try {
      // 1. Guard: Feature disabled by default
      const isPurgeEnabled = process.env.ENABLE_BULK_USER_PURGE === "true";
      if (!isPurgeEnabled) {
        return res.status(403).json({
          success: false,
          error: "Dangerous operation disabled: Bulk user purge is disabled by default for data safety. Enable ENABLE_BULK_USER_PURGE=true in server environment only with verified backups."
        });
      }

      const { adminPassword, confirmPhrase, scope = "all" } = req.body || {};
      const actualScope = req.query.scope || scope;
      const role = actualScope === "students_only" ? "student" : null;

      // 2. Explicit confirmation phrase check
      if (confirmPhrase !== "DELETE ALL USERS") {
        return res.status(400).json({
          success: false,
          error: 'Explicit confirmation required. You must provide confirmPhrase: "DELETE ALL USERS".'
        });
      }

      // 3. Strong authorization: re-verify admin password
      if (!adminPassword || typeof adminPassword !== "string") {
        return res.status(401).json({
          success: false,
          error: "Strong authorization required: Administrator account password must be provided to authorize bulk purge."
        });
      }

      const adminUser = await userRepository.findById(req.user.id);
      if (!adminUser || !adminUser.password_hash) {
        return res.status(401).json({
          success: false,
          error: "Administrator account credentials could not be verified."
        });
      }

      const isPasswordValid = await bcrypt.compare(adminPassword, adminUser.password_hash);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          error: "Invalid administrator password. Bulk purge authorization rejected."
        });
      }

      // 4. Verified Recovery Strategy: Pre-purge snapshot of target accounts
      const targetQuery = role === "student"
        ? "SELECT id, full_name, email, role, learning_stage, preferred_language, created_at FROM users WHERE id != $1 AND role = 'student'"
        : "SELECT id, full_name, email, role, learning_stage, preferred_language, created_at FROM users WHERE id != $1";
      const targetUsersRes = await query(targetQuery, [req.user.id]);
      
      const backupDir = path.resolve(process.cwd(), "server", "backups");
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }
      const snapshotFileName = `user_purge_snapshot_${Date.now()}.json`;
      const snapshotFilePath = path.join(backupDir, snapshotFileName);
      fs.writeFileSync(snapshotFilePath, JSON.stringify({
        createdAt: new Date().toISOString(),
        executedBy: { id: req.user.id, email: req.user.email },
        scope: actualScope,
        userCount: targetUsersRes.rows.length,
        users: targetUsersRes.rows
      }, null, 2));

      // 5. Execute safe deletion excluding active admin
      const result = await userRepository.deleteAll({
        excludeAdminId: req.user.id,
        role
      });

      // 6. Log administrative audit action
      await adminRepository.logAction({
        adminId: req.user.id,
        adminEmail: req.user.email,
        adminName: req.user.name || req.user.full_name,
        action: "DELETE_ALL_USERS",
        targetType: "USERS",
        targetId: "ALL",
        details: {
          scope: actualScope,
          deletedCount: result.deletedCount,
          preservedAdminId: req.user.id,
          preservedAdminEmail: req.user.email,
          recoverySnapshot: snapshotFileName
        },
        ipAddress: req.ip
      });

      res.json({
        success: true,
        count: result.deletedCount,
        recoverySnapshot: snapshotFileName,
        message: `Successfully deleted ${result.deletedCount} user accounts at once. Verified recovery snapshot saved to ${snapshotFileName}. (Your administrator account was safely preserved).`
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/admin/users/bulk-delete
   * Bulk delete selected user IDs
   */
  async bulkDeleteUsers(req, res, next) {
    try {
      const { userIds } = req.body;
      if (!Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({
          success: false,
          error: "No user IDs provided for deletion."
        });
      }

      const result = await userRepository.bulkDelete(userIds, req.user.id);

      // Log administrative audit action
      await adminRepository.logAction({
        adminId: req.user.id,
        adminEmail: req.user.email,
        adminName: req.user.name || req.user.full_name,
        action: "BULK_DELETE_USERS",
        targetType: "USERS",
        targetId: "SELECTION",
        details: {
          deletedCount: result.deletedCount,
          requestedCount: userIds.length,
          preservedAdminId: req.user.id
        },
        ipAddress: req.ip
      });

      res.json({
        success: true,
        count: result.deletedCount,
        message: `Successfully deleted ${result.deletedCount} selected user accounts.`
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * DELETE /api/admin/users/:id
   */
  async deleteUser(req, res, next) {
    try {
      const { id } = req.params;

      if (req.user.id === id) {
        return res.status(400).json({
          success: false,
          error: "Administrators cannot delete their own account from the admin panel."
        });
      }

      const user = await userRepository.findById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: "User not found"
        });
      }

      await userRepository.delete(id);

      // Log administrative audit action
      await adminRepository.logAction({
        adminId: req.user.id,
        adminEmail: req.user.email,
        adminName: req.user.name || req.user.full_name,
        action: "DELETE_USER",
        targetType: "USER",
        targetId: id,
        details: { deletedEmail: user.email, deletedName: user.full_name },
        ipAddress: req.ip
      });

      res.json({
        success: true,
        message: `User ${user.full_name} (${user.email}) successfully deleted.`
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/admin/audit-logs
   */
  async getAuditLogs(req, res, next) {
    try {
      const { page = 1, limit = 50, action = "", search = "" } = req.query;
      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
      const offset = (pageNum - 1) * limitNum;

      const result = await adminRepository.getAuditLogs({
        limit: limitNum,
        offset,
        action,
        search
      });

      res.json({
        success: true,
        data: result.logs,
        pagination: {
          total: result.totalCount,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(result.totalCount / limitNum)
        }
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/admin/curriculum/overrides
   */
  async getCurriculumOverrides(req, res, next) {
    try {
      const overrides = await adminRepository.getCurriculumOverrides();
      res.json({
        success: true,
        data: overrides
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/admin/curriculum/overrides
   */
  async saveCurriculumOverride(req, res, next) {
    try {
      const { entityType, entityId, data, isArchived = false } = req.body;

      if (!entityType || !entityId || !data) {
        return res.status(400).json({
          success: false,
          error: "entityType, entityId, and data are required fields."
        });
      }

      const saved = await adminRepository.saveCurriculumOverride({
        entityType,
        entityId,
        data,
        isArchived: !!isArchived,
        createdBy: req.user.id
      });

      await adminRepository.logAction({
        adminId: req.user.id,
        adminEmail: req.user.email,
        adminName: req.user.name || req.user.full_name,
        action: isArchived ? "ARCHIVE_CURRICULUM_ITEM" : "SAVE_CURRICULUM_ITEM",
        targetType: entityType.toUpperCase(),
        targetId: entityId,
        details: { title: data.title || entityId, isArchived: !!isArchived },
        ipAddress: req.ip
      });

      res.json({
        success: true,
        data: saved,
        message: `Successfully saved override for ${entityType} '${entityId}'`
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * DELETE /api/admin/curriculum/overrides/:type/:id
   */
  async deleteCurriculumOverride(req, res, next) {
    try {
      const { type, id } = req.params;

      // Protection check: Ensure student progress records are protected!
      if (type === "topic") {
        const usage = await adminRepository.checkTopicUsage(id);
        if (usage.hasStudentData) {
          return res.status(409).json({
            success: false,
            error: `Cannot delete topic '${id}': Referenced by ${usage.studentCount} student(s) with active progress records (${usage.completedCount} completions, ${usage.quizAttemptsCount} quiz attempts). Please archive the topic instead to preserve student learning records.`,
            usage
          });
        }
      }

      const deleted = await adminRepository.deleteCurriculumOverride(type, id);

      await adminRepository.logAction({
        adminId: req.user.id,
        adminEmail: req.user.email,
        adminName: req.user.name || req.user.full_name,
        action: "DELETE_CURRICULUM_ITEM",
        targetType: type.toUpperCase(),
        targetId: id,
        details: { deleted: !!deleted },
        ipAddress: req.ip
      });

      res.json({
        success: true,
        data: deleted,
        message: `Successfully deleted custom ${type} '${id}'`
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/admin/curriculum/topics/:id/usage
   */
  async checkTopicUsage(req, res, next) {
    try {
      const { id } = req.params;
      const usage = await adminRepository.checkTopicUsage(id);
      res.json({
        success: true,
        data: usage
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/admin/quizzes/validate
   */
  async recordQuizAuditRun(req, res, next) {
    try {
      const auditSummary = req.body || {};

      await adminRepository.logAction({
        adminId: req.user.id,
        adminEmail: req.user.email,
        adminName: req.user.name || req.user.full_name,
        action: "RUN_QUIZ_AUDIT",
        targetType: "QUIZ_AUDIT",
        targetId: "ALL_QUIZZES",
        details: {
          totalQuestions: auditSummary.totalQuestionsChecked,
          passedChecks: auditSummary.passedChecksCount,
          failedChecks: auditSummary.failedChecksCount,
          unverified: auditSummary.unverifiedCount,
          durationMs: auditSummary.durationMs
        },
        ipAddress: req.ip
      });

      res.json({
        success: true,
        message: "Quiz audit record logged to administrator audit history."
      });
    } catch (err) {
      next(err);
    }
  }
};
