import express from "express";
import { adminController } from "../controllers/adminController.js";
import { requireAuth, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// All admin routes require valid session authentication and admin role
router.use(requireAuth);
router.use(requireAdmin);

// Overview metrics & platform health
router.get("/overview", adminController.getOverview);

// User directory with search, filter, pagination
router.get("/users", adminController.getUsers);

// Single user deep-dive status
router.get("/users/:id", adminController.getUserById);

// Account status toggle (active ↔ suspended)
router.patch("/users/:id/status", adminController.updateUserStatus);

// Role assignment (student ↔ admin)
router.patch("/users/:id/role", adminController.updateUserRole);

// Award bonus XP to learner
router.post("/users/:id/bonus-xp", adminController.awardBonusXp);

// Audit trail logs
router.get("/audit-logs", adminController.getAuditLogs);

// Curriculum overrides & customizations
router.get("/curriculum/overrides", adminController.getCurriculumOverrides);
router.post("/curriculum/overrides", adminController.saveCurriculumOverride);
router.delete("/curriculum/overrides/:type/:id", adminController.deleteCurriculumOverride);
router.get("/curriculum/topics/:id/usage", adminController.checkTopicUsage);

// Quiz validation audit record
router.post("/quizzes/validate", adminController.recordQuizAuditRun);

// Delete user accounts
router.delete("/users", adminController.deleteAllUsers);
router.post("/users/bulk-delete", adminController.bulkDeleteUsers);
router.delete("/users/:id", adminController.deleteUser);

export default router;

