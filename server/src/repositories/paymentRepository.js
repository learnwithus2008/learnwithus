import { query } from "../config/db.js";

export const paymentRepository = {
  /**
   * Records a new pending payment entry
   */
  async createPayment({
    paymentType,
    userId,
    referenceId,
    amountInr,
    paymentMethod = "whatsapp_manual",
    transactionReference = null
  }) {
    const res = await query(
      `
      INSERT INTO payment_records (
        payment_type, user_id, reference_id, amount_inr,
        payment_method, transaction_reference, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, 'pending')
      RETURNING *;
      `,
      [paymentType, userId, referenceId, amountInr, paymentMethod, transactionReference]
    );
    return res.rows[0];
  },

  /**
   * Verifies a payment manually by administrator
   */
  async verifyPayment(referenceId, { verifiedBy, transactionReference = null, notes = null }) {
    const res = await query(
      `
      UPDATE payment_records
      SET status = 'verified',
          verified_by = $2,
          verified_at = NOW(),
          transaction_reference = COALESCE($3, transaction_reference),
          notes = COALESCE($4, notes),
          updated_at = NOW()
      WHERE reference_id = $1
      RETURNING *;
      `,
      [referenceId, verifiedBy, transactionReference, notes]
    );
    return res.rows[0];
  },

  /**
   * Rejects a payment manually by administrator
   */
  async rejectPayment(referenceId, { verifiedBy, notes = null }) {
    const res = await query(
      `
      UPDATE payment_records
      SET status = 'rejected',
          verified_by = $2,
          verified_at = NOW(),
          notes = COALESCE($3, notes),
          updated_at = NOW()
      WHERE reference_id = $1
      RETURNING *;
      `,
      [referenceId, verifiedBy, notes]
    );
    return res.rows[0];
  },

  /**
   * Returns financial overview summary (Total verified, Certificates ₹99, Doubts ₹49)
   */
  async getFinancialSummary() {
    const statsRes = await query(`
      SELECT
        COALESCE(SUM(CASE WHEN status = 'verified' THEN amount_inr ELSE 0 END), 0) AS total_verified_revenue,
        COALESCE(SUM(CASE WHEN status = 'verified' AND payment_type = 'certificate' THEN amount_inr ELSE 0 END), 0) AS certificate_revenue,
        COALESCE(SUM(CASE WHEN status = 'verified' AND payment_type = 'paid_doubt' THEN amount_inr ELSE 0 END), 0) AS doubt_revenue,
        COUNT(CASE WHEN status = 'verified' THEN 1 END) AS verified_payments_count,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) AS pending_payments_count,
        COALESCE(SUM(CASE WHEN status = 'pending' THEN amount_inr ELSE 0 END), 0) AS pending_payments_amount,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END) AS rejected_payments_count
      FROM payment_records;
    `);

    const recentRes = await query(`
      SELECT
        p.*,
        u.full_name AS student_name,
        u.email AS student_email,
        admin.full_name AS verified_by_name
      FROM payment_records p
      LEFT JOIN users u ON u.id = p.user_id
      LEFT JOIN users admin ON admin.id = p.verified_by
      ORDER BY p.created_at DESC
      LIMIT 50;
    `);

    return {
      stats: statsRes.rows[0] || {
        total_verified_revenue: 0,
        certificate_revenue: 0,
        doubt_revenue: 0,
        verified_payments_count: 0,
        pending_payments_count: 0,
        pending_payments_amount: 0,
        rejected_payments_count: 0
      },
      recentTransactions: recentRes.rows
    };
  },

  /**
   * Lists payments with pagination & filter
   */
  async getAllPayments({ status = "all", paymentType = "all", limit = 50, offset = 0 }) {
    let sql = `
      SELECT
        p.*,
        u.full_name AS student_name,
        u.email AS student_email,
        admin.full_name AS verified_by_name
      FROM payment_records p
      LEFT JOIN users u ON u.id = p.user_id
      LEFT JOIN users admin ON admin.id = p.verified_by
    `;
    const conditions = [];
    const params = [];

    if (status && status !== "all") {
      params.push(status);
      conditions.push(`p.status = $${params.length}`);
    }

    if (paymentType && paymentType !== "all") {
      params.push(paymentType);
      conditions.push(`p.payment_type = $${params.length}`);
    }

    if (conditions.length > 0) {
      sql += " WHERE " + conditions.join(" AND ");
    }

    sql += ` ORDER BY p.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const res = await query(sql, params);
    return res.rows;
  }
};

