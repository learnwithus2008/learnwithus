import { certificateRepository } from "../repositories/certificateRepository.js";
import { query } from "../config/db.js";
import { config } from "../config/env.js";

const TOTAL_CURRICULUM_TOPICS = 198;

export const certificateController = {
  /**
   * GET /api/certificates/eligibility
   * Returns current user's course progress and certificate eligibility
   */
  async getEligibility(req, res, next) {
    try {
      const progressRes = await query(
        "SELECT COUNT(*)::INTEGER as count FROM user_learning_progress WHERE user_id = $1 AND completed = TRUE",
        [req.user.id]
      );
      const completedCount = progressRes.rows[0]?.count || 0;

      // Check existing requests & issued certificates
      const requests = await certificateRepository.getRequestsByUserId(req.user.id);
      const issued = await certificateRepository.getIssuedCertificatesByUserId(req.user.id);

      // Student is eligible if they have completed topics (or full course)
      const isEligible = completedCount > 0;
      const isFullyCompleted = completedCount >= TOTAL_CURRICULUM_TOPICS;

      res.status(200).json({
        success: true,
        data: {
          isEligible,
          isFullyCompleted,
          completedCount,
          totalRequired: TOTAL_CURRICULUM_TOPICS,
          completionPercentage: Math.min(100, Math.round((completedCount / TOTAL_CURRICULUM_TOPICS) * 100)),
          priceInr: 99,
          requests,
          issuedCertificates: issued
        }
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/certificates/request
   * Student initiates certificate request (₹99)
   */
  async createRequest(req, res, next) {
    try {
      const progressRes = await query(
        "SELECT COUNT(*)::INTEGER as count FROM user_learning_progress WHERE user_id = $1 AND completed = TRUE",
        [req.user.id]
      );
      const completedCount = progressRes.rows[0]?.count || 0;

      const studentName = req.user.name || req.user.full_name || "Python Learner";
      const studentEmail = req.user.email;

      // Prevent duplicate pending requests if one is already active
      const existing = await certificateRepository.getRequestsByUserId(req.user.id);
      const activePending = existing.find(r => r.status === "pending");
      if (activePending) {
        return res.status(200).json({
          success: true,
          data: {
            request: activePending,
            message: "You already have a pending certificate request under review."
          }
        });
      }

      const request = await certificateRepository.createRequest({
        userId: req.user.id,
        studentName,
        studentEmail,
        courseId: "python-mastery",
        courseName: "Python Programming & Adaptive Core Curriculum",
        completedTopicsCount: completedCount,
        amountInr: 99.00
      });

      res.status(201).json({
        success: true,
        data: {
          request,
          priceInr: 99,
          message: "Certificate request created. Please complete WhatsApp verification with transaction details."
        }
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/certificates/my-requests
   */
  async getMyRequests(req, res, next) {
    try {
      const requests = await certificateRepository.getRequestsByUserId(req.user.id);
      res.status(200).json({
        success: true,
        data: requests
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/certificates/my-certificates
   */
  async getMyCertificates(req, res, next) {
    try {
      const certificates = await certificateRepository.getIssuedCertificatesByUserId(req.user.id);
      res.status(200).json({
        success: true,
        data: certificates
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/certificates/verify/:certificateId (PUBLIC)
   */
  async verifyCertificatePublic(req, res, next) {
    try {
      const { certificateId } = req.params;
      if (!certificateId) {
        return res.status(400).json({ success: false, error: "Certificate ID is required" });
      }

      const cert = await certificateRepository.getByCertificateId(certificateId);
      if (!cert) {
        return res.status(404).json({
          success: false,
          error: "Certificate not found or invalid certificate ID"
        });
      }

      res.status(200).json({
        success: true,
        data: {
          certificateId: cert.certificate_id,
          studentName: cert.student_name,
          courseName: cert.course_name,
          completionDate: cert.completion_date,
          issueDate: cert.issue_date,
          isValid: !cert.is_revoked,
          revocationReason: cert.is_revoked ? cert.revoked_reason : null,
          issuer: "Learn With Us Academic Directorate",
          disclaimer: "Official educational certificate of course achievement from Learn With Us. Non-accredited self-paced credential."
        }
      });
    } catch (err) {
      next(err);
    }
  },

  // ---------------------------------------------------------------------------
  // Admin Endpoints
  // ---------------------------------------------------------------------------

  /**
   * GET /api/certificates/admin/requests (Admin)
   */
  async adminGetAllRequests(req, res, next) {
    try {
      const { status = "all", paymentStatus = "all", search = "", limit = 50, page = 1 } = req.query;
      const offset = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
      const requests = await certificateRepository.getAllRequests({
        status,
        paymentStatus,
        search,
        limit: parseInt(limit, 10),
        offset
      });

      res.status(200).json({
        success: true,
        data: requests
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/certificates/admin/requests/:id/verify-payment (Admin)
   */
  async adminVerifyPayment(req, res, next) {
    try {
      const { id } = req.params;
      const { transactionReference, notes } = req.body || {};

      const updated = await certificateRepository.verifyPayment(id, {
        verifiedBy: req.user.id,
        transactionReference,
        notes
      });

      if (!updated) {
        return res.status(404).json({ success: false, error: "Request not found" });
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
   * POST /api/certificates/admin/requests/:id/approve (Admin)
   */
  async adminApproveRequest(req, res, next) {
    try {
      const { id } = req.params;
      const frontendBaseUrl = config.frontendUrl || "https://learnwithus.learnwithus2008.workers.dev";

      const issuedCert = await certificateRepository.approveAndIssue(id, {
        issuedBy: req.user.id,
        frontendBaseUrl
      });

      res.status(200).json({
        success: true,
        data: issuedCert,
        message: `Certificate ${issuedCert.certificate_id} approved and issued successfully!`
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/certificates/admin/requests/:id/reject (Admin)
   */
  async adminRejectRequest(req, res, next) {
    try {
      const { id } = req.params;
      const { reason = "Payment or completion criteria could not be verified" } = req.body || {};

      const rejected = await certificateRepository.rejectRequest(id, {
        rejectedBy: req.user.id,
        reason
      });

      if (!rejected) {
        return res.status(404).json({ success: false, error: "Request not found" });
      }

      res.status(200).json({
        success: true,
        data: rejected,
        message: "Request rejected."
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/certificates/admin/issued (Admin)
   */
  async adminGetAllIssued(req, res, next) {
    try {
      const { search = "", limit = 50, page = 1 } = req.query;
      const offset = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
      const issued = await certificateRepository.getAllIssued({
        search,
        limit: parseInt(limit, 10),
        offset
      });

      res.status(200).json({
        success: true,
        data: issued
      });
    } catch (err) {
      next(err);
    }
  }
};

