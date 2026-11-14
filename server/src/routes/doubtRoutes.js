import { Router } from "express";
import { doubtController } from "../controllers/doubtController.js";
import { requireAuth, requireAdmin } from "../middleware/authMiddleware.js";

const router = Router();

router.use(requireAuth);

// Student endpoints
router.get("/balance", doubtController.getBalance);
router.get("/my-tickets", doubtController.getMyTickets);
router.post("/request", doubtController.createRequest); // Creates pending ticket, count NOT reduced
router.post("/purchase", doubtController.purchaseCredits);

// Admin endpoints
router.get("/tickets", requireAdmin, doubtController.getAllTickets);
router.post("/tickets/:id/verify-payment", requireAdmin, doubtController.verifyPayment);
router.post("/tickets/:id/solve", requireAdmin, doubtController.solveTicket); // Answers and resolves ticket
router.post("/tickets/:id/dismiss", requireAdmin, doubtController.dismissTicket);

export default router;
