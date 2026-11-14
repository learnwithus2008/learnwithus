import { query } from "../config/db.js";
import { paymentRepository } from "./paymentRepository.js";

export const certificateRepository = {
  /**
   * Creates a student certificate request (₹99)
   */
  async createRequest({
    userId,
    studentName,
    studentEmail,
    courseId = "python-mastery",
    courseName = "Python Programming & Adaptive Core Curriculum",
    completedTopicsCount = 0,
    amountInr = 99.00
  }) {
    const requestNumber = `REQ-${Date.now().toString().slice(-6)}`;
    const res = await query(
      `
      INSERT INTO certificate_requests (
        request_number, user_id, student_name, student_email,
        course_id, course_name, completed_topics_count,
        amount_inr, payment_status, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending', 'pending')
      RETURNING *;
      `,
      [
        requestNumber,
        userId,
        studentName,
        studentEmail,
        courseId,
        courseName,
        completedTopicsCount,
        amountInr
      ]
    );

    const created = res.rows[0];

    // Log pending payment record
    try {
      await paymentRepository.createPayment({
        paymentType: "certificate",
        userId,
        referenceId: created.id,
        amountInr,
        paymentMethod: "whatsapp_manual"
      });
    } catch (e) {
      console.warn("Payment log warning:", e.message);
    }

    return created;
  },

  /**
   * Returns all requests made by a specific student
   */
  async getRequestsByUserId(userId) {
    const res = await query(
      `
      SELECT
        cr.*,
        ic.certificate_id,
        ic.issue_date,
        ic.verification_url,
        ic.is_revoked
      FROM certificate_requests cr
      LEFT JOIN issued_certificates ic ON ic.request_id = cr.id
      WHERE cr.user_id = $1
      ORDER BY cr.created_at DESC;
      `,
      [userId]
    );
    return res.rows;
  },

  /**
   * Returns a request by ID
   */
  async getRequestById(requestId) {
    const res = await query(
      "SELECT * FROM certificate_requests WHERE id::text = $1 OR request_number = $1 LIMIT 1",
      [requestId]
    );
    return res.rows[0] || null;
  },

  /**
   * Returns all certificate requests for Admin
   */
  async getAllRequests({ status = "all", paymentStatus = "all", search = "", limit = 50, offset = 0 }) {
    let sql = `
      SELECT
        cr.*,
        ic.certificate_id,
        ic.issue_date,
        admin.full_name AS verified_by_name
      FROM certificate_requests cr
      LEFT JOIN issued_certificates ic ON ic.request_id = cr.id
      LEFT JOIN users admin ON admin.id = cr.verified_by
    `;
    const conditions = [];
    const params = [];

    if (status && status !== "all") {
      params.push(status);
      conditions.push(`cr.status = $${params.length}`);
    }

    if (paymentStatus && paymentStatus !== "all") {
      params.push(paymentStatus);
      conditions.push(`cr.payment_status = $${params.length}`);
    }

    if (search && search.trim()) {
      params.push(`%${search.trim().toLowerCase()}%`);
      conditions.push(
        `(LOWER(cr.student_name) LIKE $${params.length} OR LOWER(cr.student_email) LIKE $${params.length} OR LOWER(cr.course_name) LIKE $${params.length} OR LOWER(cr.request_number) LIKE $${params.length})`
      );
    }

    if (conditions.length > 0) {
      sql += " WHERE " + conditions.join(" AND ");
    }

    sql += ` ORDER BY cr.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const res = await query(sql, params);
    return res.rows;
  },

  /**
   * Verifies payment for a certificate request (Admin only)
   */
  async verifyPayment(requestId, { verifiedBy, transactionReference = null, notes = null }) {
    const res = await query(
      `
      UPDATE certificate_requests
      SET payment_status = 'verified',
          verified_by = $2,
          verified_at = NOW(),
          payment_reference = COALESCE($3, payment_reference),
          admin_notes = COALESCE($4, admin_notes),
          updated_at = NOW()
      WHERE id::text = $1 OR request_number = $1
      RETURNING *;
      `,
      [requestId, verifiedBy, transactionReference, notes]
    );

    const updated = res.rows[0];
    if (updated) {
      await paymentRepository.verifyPayment(updated.id, {
        verifiedBy,
        transactionReference,
        notes
      }).catch(() => {});
    }
    return updated;
  },

  /**
   * Approves certificate request and generates unique certificate credential (Admin only)
   */
  async approveAndIssue(requestId, { issuedBy, frontendBaseUrl = "https://learnwithus.learnwithus2008.workers.dev" }) {
    const request = await this.getRequestById(requestId);
    if (!request) {
      throw new Error("Certificate request not found");
    }

    // Generate unique Certificate ID e.g. LWU-PY-2026-A1B2C3
    const year = new Date().getFullYear();
    const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
    const certId = `LWU-PY-${year}-${randomHex}`;
    const verificationUrl = `${frontendBaseUrl}/#/verify-certificate/${certId}`;

    // Update request to approved
    await query(
      `
      UPDATE certificate_requests
      SET status = 'approved',
          payment_status = 'verified',
          verified_by = COALESCE(verified_by, $2),
          verified_at = COALESCE(verified_at, NOW()),
          updated_at = NOW()
      WHERE id = $1;
      `,
      [request.id, issuedBy]
    );

    // Insert issued certificate
    const res = await query(
      `
      INSERT INTO issued_certificates (
        certificate_id, request_id, user_id, student_name, student_email,
        course_id, course_name, completion_date, issue_date,
        verification_url, issued_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW(), $8, $9)
      RETURNING *;
      `,
      [
        certId,
        request.id,
        request.user_id,
        request.student_name,
        request.student_email,
        request.course_id,
        request.course_name,
        verificationUrl,
        issuedBy
      ]
    );

    // Verify payment in payment_records if not already done
    await paymentRepository.verifyPayment(request.id, {
      verifiedBy: issuedBy,
      notes: `Certificate ${certId} issued`
    }).catch(() => {});

    return res.rows[0];
  },

  /**
   * Rejects certificate request (Admin only)
   */
  async rejectRequest(requestId, { rejectedBy, reason = "Payment or completion criteria not verified" }) {
    const res = await query(
      `
      UPDATE certificate_requests
      SET status = 'rejected',
          payment_status = 'rejected',
          admin_notes = $2,
          verified_by = $3,
          verified_at = NOW(),
          updated_at = NOW()
      WHERE id::text = $1 OR request_number = $1
      RETURNING *;
      `,
      [requestId, reason, rejectedBy]
    );

    const updated = res.rows[0];
    if (updated) {
      await paymentRepository.rejectPayment(updated.id, {
        verifiedBy: rejectedBy,
        notes: reason
      }).catch(() => {});
    }
    return updated;
  },

  /**
   * Returns all issued certificates for a specific user
   */
  async getIssuedCertificatesByUserId(userId) {
    const res = await query(
      `
      SELECT *
      FROM issued_certificates
      WHERE user_id = $1 AND is_revoked = FALSE
      ORDER BY issue_date DESC;
      `,
      [userId]
    );
    return res.rows;
  },

  /**
   * Public lookup of certificate by Certificate ID (no auth required)
   */
  async getByCertificateId(certificateId) {
    const res = await query(
      `
      SELECT
        ic.certificate_id,
        ic.student_name,
        ic.course_name,
        ic.completion_date,
        ic.issue_date,
        ic.verification_url,
        ic.is_revoked,
        ic.revoked_reason,
        admin.full_name AS issued_by_name
      FROM issued_certificates ic
      LEFT JOIN users admin ON admin.id = ic.issued_by
      WHERE UPPER(ic.certificate_id) = UPPER($1)
      LIMIT 1;
      `,
      [certificateId.trim()]
    );
    return res.rows[0] || null;
  },

  /**
   * Returns all issued certificates for Admin management
   */
  async getAllIssued({ search = "", limit = 50, offset = 0 }) {
    let sql = `
      SELECT
        ic.*,
        admin.full_name AS issued_by_name
      FROM issued_certificates ic
      LEFT JOIN users admin ON admin.id = ic.issued_by
    `;
    const params = [];
    if (search && search.trim()) {
      params.push(`%${search.trim().toLowerCase()}%`);
      sql += ` WHERE (LOWER(ic.student_name) LIKE $1 OR LOWER(ic.student_email) LIKE $1 OR LOWER(ic.certificate_id) LIKE $1)`;
    }
    sql += ` ORDER BY ic.issue_date DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const res = await query(sql, params);
    return res.rows;
  }
};

