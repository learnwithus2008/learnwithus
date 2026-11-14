import { Router } from "express";
import { certificateController } from "../controllers/certificateController.js";
import { requireAuth, requireAdmin } from "../middleware/authMiddleware.js";

const router = Router();

// Public verification route (no login required for verification)
router.get("/verify/:certificateId", certificateController.verifyCertificatePublic);

// Student authenticated routes
router.get("/eligibility", requireAuth, certificateController.getEligibility);
router.get("/my-requests", requireAuth, certificateController.getMyRequests);
router.get("/my-certificates", requireAuth, certificateController.getMyCertificates);
router.post("/request", requireAuth, certificateController.createRequest);

// Administrator routes
router.get("/admin/requests", requireAuth, requireAdmin, certificateController.adminGetAllRequests);
router.post("/admin/requests/:id/verify-payment", requireAuth, requireAdmin, certificateController.adminVerifyPayment);
router.post("/admin/requests/:id/approve", requireAuth, requireAdmin, certificateController.adminApproveRequest);
router.post("/admin/requests/:id/reject", requireAuth, requireAdmin, certificateController.adminRejectRequest);
router.get("/admin/issued", requireAuth, requireAdmin, certificateController.adminGetAllIssued);

export default router;

