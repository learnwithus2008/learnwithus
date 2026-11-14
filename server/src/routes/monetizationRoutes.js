import { Router } from "express";
import { monetizationController } from "../controllers/monetizationController.js";
import { requireAuth, requireAdmin } from "../middleware/authMiddleware.js";

const router = Router();

router.use(requireAuth, requireAdmin);

router.get("/summary", monetizationController.getSummary);
router.get("/payments", monetizationController.getPayments);
router.post("/payments/:id/verify", monetizationController.verifyPayment);
router.post("/payments/:id/reject", monetizationController.rejectPayment);

export default router;

