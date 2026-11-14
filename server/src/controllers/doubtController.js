import { rewardRepository } from "../repositories/rewardRepository.js";
import { paymentRepository } from "../repositories/paymentRepository.js";
import { query } from "../config/db.js";

export const doubtController = {
  /**
   * GET /api/doubts/balance
   * Returns current user's doubt balance, free doubts used, and pending tickets count
   */
  async getBalance(req, res, next) {
    try {
      const rewards = await rewardRepository.getByUserId(req.user.id);
      const doubtCredits = rewards?.doubt_credits !== undefined && rewards?.doubt_credits !== null ? rewards.doubt_credits : 10;
      const freeDoubtsTotal = rewards?.free_doubts_total !== undefined && rewards?.free_doubts_total !== null ? rewards.free_doubts_total : 10;
      const doubtsUsed = rewards?.doubts_used || 0;

      let pendingCount = 0;
      let paidDoubtsCount = 0;
      try {
        const countRes = await query(
          `
          SELECT
            COUNT(*) FILTER (WHERE status = 'pending')::INTEGER AS pending_count,
            COUNT(*) FILTER (WHERE is_paid = TRUE)::INTEGER AS paid_count
          FROM doubt_tickets
          WHERE user_id = $1
          `,
          [req.user.id]
        );
        pendingCount = countRes.rows[0]?.pending_count || 0;
        paidDoubtsCount = countRes.rows[0]?.paid_count || 0;
      } catch {
        // Fallback
      }

      res.status(200).json({
        success: true,
        data: {
          doubtCredits,
          freeDoubtsTotal,
          doubtsUsed,
          freeDoubtsRemaining: Math.max(0, doubtCredits),
          paidDoubtsCount,
          pendingCount,
          pricePerPaidDoubtInr: 49
        }
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/doubts/my-tickets
   * Returns tickets submitted by current user
   */
  async getMyTickets(req, res, next) {
    try {
      const resQuery = await query(
        `
        SELECT
          t.*,
          admin.full_name AS answered_by_name
        FROM doubt_tickets t
        LEFT JOIN users admin ON admin.id = t.answered_by
        WHERE t.user_id = $1
        ORDER BY t.created_at DESC
        LIMIT 50
        `,
        [req.user.id]
      );
      res.status(200).json({
        success: true,
        data: resQuery.rows
      });
    } catch (err) {
      res.status(200).json({
        success: true,
        data: []
      });
    }
  },

  /**
   * POST /api/doubts/request
   * Creates a doubt request.
   * If student has free doubts (1-10): is_paid = false, payment_status = 'free'.
   * If student has exhausted 10 free doubts (11th onwards): is_paid = true, amount_inr = 49.00, payment_status = 'pending'.
   */
  async createRequest(req, res, next) {
    try {
      const {
        sectionNumber,
        sectionTitle,
        lessonName,
        topicNumber,
        stepName,
        question,
        codeSnippet,
        screenshotUrl
      } = req.body || {};

      if (!question || !question.trim()) {
        return res.status(400).json({
          success: false,
          error: "Please enter your doubt question or description"
        });
      }

      const rewards = await rewardRepository.getByUserId(req.user.id);
      const currentCredits = rewards?.doubt_credits !== undefined && rewards?.doubt_credits !== null ? rewards.doubt_credits : 10;
      const doubtsUsed = rewards?.doubts_used || 0;

      // 10 Free doubts rule:
      const isFreeDoubt = currentCredits > 0;
      const isPaid = !isFreeDoubt;
      const amountInr = isPaid ? 49.00 : 0.00;
      const paymentStatus = isPaid ? "pending" : "free";

      const ticketNumber = `DBT-${Date.now().toString().slice(-6)}`;
      let ticket = {
        id: ticketNumber,
        ticket_number: ticketNumber,
        user_id: req.user.id,
        student_name: req.user.name || req.user.full_name,
        student_email: req.user.email,
        section_number: sectionNumber || "",
        section_title: sectionTitle || "",
        lesson_name: lessonName || "",
        topic_number: topicNumber || "",
        step_name: stepName || "",
        question: question.trim(),
        code_snippet: codeSnippet ? codeSnippet.trim() : null,
        screenshot_url: screenshotUrl ? screenshotUrl.trim() : null,
        is_paid: isPaid,
        amount_inr: amountInr,
        payment_status: paymentStatus,
        status: "pending",
        created_at: new Date().toISOString()
      };

      try {
        const insertRes = await query(
          `
          INSERT INTO doubt_tickets (
            ticket_number, user_id, student_name, student_email,
            section_number, section_title, lesson_name, topic_number, step_name,
            question, code_snippet, screenshot_url, is_paid, amount_inr, payment_status, status
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 'pending')
          RETURNING *;
          `,
          [
            ticketNumber,
            req.user.id,
            req.user.name || req.user.full_name,
            req.user.email,
            sectionNumber || null,
            sectionTitle || null,
            lessonName || null,
            topicNumber || null,
            stepName || null,
            question.trim(),
            codeSnippet ? codeSnippet.trim() : null,
            screenshotUrl ? screenshotUrl.trim() : null,
            isPaid,
            amountInr,
            paymentStatus
          ]
        );
        if (insertRes.rows[0]) ticket = insertRes.rows[0];

        // If paid doubt, record in payment_records as pending
        if (isPaid) {
          await paymentRepository.createPayment({
            paymentType: "paid_doubt",
            userId: req.user.id,
            referenceId: ticket.id,
            amountInr: 49.00,
            paymentMethod: "whatsapp_manual"
          }).catch(() => {});
        }
      } catch (dbErr) {
        console.warn("Doubt ticket DB insert warning:", dbErr.message);
      }

      res.status(201).json({
        success: true,
        data: {
          ticket,
          isPaid,
          amountInr,
          paymentStatus,
          freeDoubtsRemaining: Math.max(0, currentCredits),
          message: isPaid
            ? "Your 10 free doubts are used. This paid doubt (₹49) has been recorded. Please complete WhatsApp verification to receive your mentor answer."
            : "Free doubt request submitted. Count will NOT be reduced until answered by admin."
        }
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/doubts/tickets (Admin)
   * Lists all tickets with status and payment filter
   */
  async getAllTickets(req, res, next) {
    try {
      const { status = "all", isPaid = "all", search = "", limit = 50, page = 1 } = req.query;
      const offset = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);

      let sql = `
        SELECT
          t.*,
          admin.full_name AS answered_by_name
        FROM doubt_tickets t
        LEFT JOIN users admin ON admin.id = t.answered_by
      `;
      const conditions = [];
      const params = [];

      if (status && status !== "all") {
        params.push(status);
        conditions.push(`t.status = $${params.length}`);
      }

      if (isPaid !== "all") {
        params.push(isPaid === "true");
        conditions.push(`t.is_paid = $${params.length}`);
      }

      if (search && search.trim()) {
        params.push(`%${search.trim().toLowerCase()}%`);
        conditions.push(
          `(LOWER(t.student_name) LIKE $${params.length} OR LOWER(t.student_email) LIKE $${params.length} OR LOWER(t.question) LIKE $${params.length} OR LOWER(t.ticket_number) LIKE $${params.length})`
        );
      }

      if (conditions.length > 0) {
        sql += " WHERE " + conditions.join(" AND ");
      }

      sql += ` ORDER BY t.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(limit, offset);

      const queryRes = await query(sql, params);
      res.status(200).json({
        success: true,
        data: queryRes.rows
      });
    } catch (err) {
      res.status(200).json({
        success: true,
        data: []
      });
    }
  },

  /**
   * POST /api/doubts/tickets/:id/verify-payment (Admin)
   * Manually verifies ₹49 payment for a paid doubt ticket
   */
  async verifyPayment(req, res, next) {
    try {
      const { id } = req.params;
      const { transactionReference, notes } = req.body || {};

      const updateRes = await query(
        `
        UPDATE doubt_tickets
        SET payment_status = 'verified',
            payment_reference = COALESCE($2, payment_reference),
            resolution_notes = COALESCE($3, resolution_notes),
            updated_at = NOW()
        WHERE id::text = $1 OR ticket_number = $1
        RETURNING *;
        `,
        [id, transactionReference, notes]
      );

      const ticket = updateRes.rows[0];
      if (!ticket) {
        return res.status(404).json({ success: false, error: "Doubt ticket not found" });
      }

      await paymentRepository.verifyPayment(ticket.id, {
        verifiedBy: req.user.id,
        transactionReference,
        notes
      }).catch(() => {});

      res.status(200).json({
        success: true,
        data: ticket,
        message: "Payment of ₹49 verified. Ticket is now unlocked for answering."
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/doubts/tickets/:id/solve (Admin)
   * Admin submits mentor answer & marks ticket as solved
   */
  async solveTicket(req, res, next) {
    try {
      const { id } = req.params;
      const { resolutionNotes = "", answer = "" } = req.body || {};
      const solutionText = answer || resolutionNotes;

      if (!solutionText || !solutionText.trim()) {
        return res.status(400).json({
          success: false,
          error: "Please enter the mentor solution or answer before marking as solved"
        });
      }

      let ticket = null;
      try {
        const ticketRes = await query(
          "SELECT * FROM doubt_tickets WHERE id::text = $1 OR ticket_number = $1 LIMIT 1",
          [id]
        );
        ticket = ticketRes.rows[0];
      } catch {}

      if (!ticket) {
        return res.status(404).json({ success: false, error: "Doubt ticket not found" });
      }

      if (ticket.status === "solved") {
        return res.status(400).json({ success: false, error: "Ticket is already marked as solved" });
      }

      // Paid doubt rule: Unpaid paid-doubt requests cannot receive answers
      if (ticket.is_paid && ticket.payment_status !== "verified") {
        return res.status(403).json({
          success: false,
          error: "Cannot answer an unpaid paid doubt. Please verify the ₹49 payment first."
        });
      }

      // 1. Mark ticket as solved and store answer
      const updatedRes = await query(
        `
        UPDATE doubt_tickets
        SET status = 'solved',
            answer = $2,
            resolution_notes = $2,
            answered_by = $3,
            answered_at = NOW(),
            resolved_by = $3,
            resolved_at = NOW(),
            updated_at = NOW()
        WHERE id = $1
        RETURNING *;
        `,
        [ticket.id, solutionText.trim(), req.user.id]
      );

      let remainingCredits = 0;
      // 2. Only deduct from 10 free doubts balance if this was a FREE doubt!
      if (!ticket.is_paid) {
        const updatedRewards = await rewardRepository.useDoubtCredit(ticket.user_id);
        remainingCredits = updatedRewards?.doubt_credits ?? 9;

        // Record usage audit transaction
        try {
          await query(
            `
            INSERT INTO doubt_transactions (
              user_id, ticket_id, action, amount_inr, credits_change, credits_after, payment_method, context
            )
            VALUES ($1, $2, 'resolved_use', 0, -1, $3, 'free', $4)
            `,
            [
              ticket.user_id,
              ticket.id,
              remainingCredits,
              JSON.stringify({ solvedBy: req.user.email, resolvedAt: new Date().toISOString() })
            ]
          );
        } catch {}
      } else {
        const rewards = await rewardRepository.getByUserId(ticket.user_id);
        remainingCredits = rewards?.doubt_credits ?? 0;
      }

      res.status(200).json({
        success: true,
        data: {
          ticket: updatedRes.rows[0],
          status: "solved",
          userRemainingCredits: remainingCredits,
          message: ticket.is_paid
            ? "Paid doubt answered successfully!"
            : `Free doubt answered. 1 credit deducted (Remaining: ${remainingCredits}).`
        }
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/doubts/tickets/:id/dismiss (Admin)
   */
  async dismissTicket(req, res, next) {
    try {
      const { id } = req.params;
      const { reason = "" } = req.body || {};

      await query(
        `
        UPDATE doubt_tickets
        SET status = 'dismissed',
            resolution_notes = $2,
            updated_at = NOW()
        WHERE id::text = $1 OR ticket_number = $1
        `,
        [id, reason]
      );

      res.status(200).json({
        success: true,
        message: "Ticket dismissed. Student doubt count was NOT reduced."
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/doubts/purchase
   */
  async purchaseCredits(req, res, next) {
    try {
      const { credits = 1, amount = 49, paymentMethod = "whatsapp_manual", paymentReference } = req.body || {};
      const count = Math.max(1, parseInt(credits, 10) || 1);
      const updated = await rewardRepository.addDoubtCredits(req.user.id, count);
      const creditsAfter = updated?.doubt_credits ?? (10 + count);

      try {
        await query(
          `
          INSERT INTO doubt_transactions (user_id, action, amount_inr, credits_change, credits_after, payment_method, payment_reference, context)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          `,
          [
            req.user.id,
            count === 1 ? "purchase_single" : "purchase_pack",
            amount,
            count,
            creditsAfter,
            paymentMethod,
            paymentReference || `PAY-${Date.now()}`,
            JSON.stringify({ purchasedAt: new Date().toISOString() })
          ]
        );
      } catch {}

      res.status(200).json({
        success: true,
        data: {
          doubtCredits: creditsAfter,
          purchasedCredits: count,
          message: `Successfully added ${count} doubt credit(s)!`
        }
      });
    } catch (err) {
      next(err);
    }
  }
};
