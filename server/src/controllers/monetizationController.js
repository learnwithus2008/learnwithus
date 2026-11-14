import { paymentRepository } from "../repositories/paymentRepository.js";

export const monetizationController = {
  /**
   * GET /api/monetization/summary (Admin)
   * Returns financial overview & breakdown
   */
  async getSummary(req, res, next) {
    try {
      const summary = await paymentRepository.getFinancialSummary();
      res.status(200).json({
        success: true,
        data: summary
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/monetization/payments (Admin)
   * Lists all recorded payments with filters
   */
  async getPayments(req, res, next) {
    try {
      const { status = "all", paymentType = "all", limit = 50, page = 1 } = req.query;
      const offset = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
      const payments = await paymentRepository.getAllPayments({
        status,
        paymentType,
        limit: parseInt(limit, 10),
        offset
      });

      res.status(200).json({
        success: true,
        data: payments
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/monetization/payments/:id/verify (Admin)
   */
  async verifyPayment(req, res, next) {
    try {
      const { id } = req.params;
      const { transactionReference, notes } = req.body || {};

      const updated = await paymentRepository.verifyPayment(id, {
        verifiedBy: req.user.id,
        transactionReference,
        notes
      });

      if (!updated) {
        return res.status(404).json({ success: false, error: "Payment record not found" });
      }

      res.status(200).json({
        success: true,
        data: updated,
        message: "Payment successfully verified."
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/monetization/payments/:id/reject (Admin)
   */
  async rejectPayment(req, res, next) {
    try {
      const { id } = req.params;
      const { notes } = req.body || {};

      const updated = await paymentRepository.rejectPayment(id, {
        verifiedBy: req.user.id,
        notes
      });

      if (!updated) {
        return res.status(404).json({ success: false, error: "Payment record not found" });
      }

      res.status(200).json({
        success: true,
        data: updated,
        message: "Payment marked as rejected."
      });
    } catch (err) {
      next(err);
    }
  }
};

