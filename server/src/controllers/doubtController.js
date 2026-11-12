import { rewardRepository } from "../repositories/rewardRepository.js";
import { query } from "../config/db.js";

export const doubtController = {
  /**
   * GET /api/doubts/balance
   * Returns current user's doubt balance and pending tickets count
   */
  async getBalance(req, res, next) {
    try {
      const rewards = await rewardRepository.getByUserId(req.user.id);
      const doubtCredits = rewards?.doubt_credits !== undefined && rewards?.doubt_credits !== null ? rewards.doubt_credits : 10;
      const freeDoubtsTotal = rewards?.free_doubts_total !== undefined && rewards?.free_doubts_total !== null ? rewards.free_doubts_total : 10;
      const doubtsUsed = rewards?.doubts_used || 0;

      let pendingCount = 0;
      try {
        const pendingRes = await query(
          "SELECT COUNT(*) FROM doubt_tickets WHERE user_id = $1 AND status = 'pending'",
          [req.user.id]
        );
        pendingCount = parseInt(pendingRes.rows[0]?.count || 0, 10);
      } catch {
        // Table may not exist yet
      }

      res.status(200).json({
        success: true,
        data: {
          doubtCredits,
          freeDoubtsTotal,
          doubtsUsed,
          pendingCount
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
        "SELECT * FROM doubt_tickets WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50",
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
   * Creates a doubt request when user clicks WhatsApp.
   * CRITICAL: Does NOT reduce user doubt count! Doubt count stays intact until solved by admin.
   */
  async createRequest(req, res, next) {
    try {
      const {
        sectionNumber,
        sectionTitle,
        lessonName,
        topicNumber,
        stepName,
        question
      } = req.body || {};

      const rewards = await rewardRepository.getByUserId(req.user.id);
      const currentCredits = rewards?.doubt_credits !== undefined && rewards?.doubt_credits !== null ? rewards.doubt_credits : 10;

      // If user has zero credits, they must recharge first
      if (currentCredits <= 0) {
        return res.status(402).json({
          success: false,
          error: "Free doubts exhausted. Please recharge for ₹50 to submit a doubt.",
          doubtCredits: 0
        });
      }

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
        question: question || "",
        status: "pending",
        created_at: new Date().toISOString()
      };

      try {
        const insertRes = await query(
          `
          INSERT INTO doubt_tickets (
            ticket_number, user_id, student_name, student_email,
            section_number, section_title, lesson_name, topic_number, step_name,
            question, status
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending')
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
            question || null
          ]
        );
        if (insertRes.rows[0]) ticket = insertRes.rows[0];
      } catch (dbErr) {
        // Table not created yet - non-blocking
      }

      res.status(201).json({
        success: true,
        data: {
          ticket,
          doubtCredits: currentCredits, // Unchanged!
          message: "Doubt request submitted. Count will NOT be reduced until solved by admin."
        }
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/doubts/tickets (Admin)
   * Lists all tickets with status filter
   */
  async getAllTickets(req, res, next) {
    try {
      const { status = "all" } = req.query;
      let sql = "SELECT * FROM doubt_tickets";
      const params = [];
      if (status && status !== "all") {
        sql += " WHERE status = $1";
        params.push(status);
      }
      sql += " ORDER BY created_at DESC LIMIT 100";

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
   * POST /api/doubts/tickets/:id/solve (Admin)
   * Admin solves the issue -> THIS IS WHEN THE DOUBT COUNT IS ACTUALLY REDUCED!
   */
  async solveTicket(req, res, next) {
    try {
      const { id } = req.params;
      const { resolutionNotes = "" } = req.body || {};

      let ticket = null;
      try {
        const ticketRes = await query("SELECT * FROM doubt_tickets WHERE id::text = $1 OR ticket_number = $1 LIMIT 1", [id]);
        ticket = ticketRes.rows[0];
      } catch {}

      if (!ticket) {
        return res.status(404).json({ success: false, error: "Doubt ticket not found" });
      }

      if (ticket.status === "solved") {
        return res.status(400).json({ success: false, error: "Ticket is already marked as solved" });
      }

      // 1. Mark ticket as solved
      await query(
        `
        UPDATE doubt_tickets
        SET status = 'solved',
            resolution_notes = $2,
            resolved_by = $3,
            resolved_at = NOW(),
            updated_at = NOW()
        WHERE id = $1
        RETURNING *;
        `,
        [ticket.id, resolutionNotes, req.user.id]
      );

      // 2. NOW officially deduct 1 doubt count from user rewards!
      const updatedRewards = await rewardRepository.useDoubtCredit(ticket.user_id);
      const remainingCredits = updatedRewards?.doubt_credits ?? 9;

      // 3. Record transaction
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

      res.status(200).json({
        success: true,
        data: {
          ticketId: ticket.id,
          status: "solved",
          userRemainingCredits: remainingCredits,
          message: `Doubt marked as solved. 1 doubt count deducted from student (Remaining: ${remainingCredits}).`
        }
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/doubts/tickets/:id/dismiss (Admin)
   * Dismiss/cancel ticket -> Count is NOT reduced!
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
      const { credits = 1, amount = 50, paymentMethod = "mock", paymentReference } = req.body || {};
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
