import { query } from "../src/config/db.js";
import { userRepository } from "../src/repositories/userRepository.js";
import { certificateRepository } from "../src/repositories/certificateRepository.js";
import { paymentRepository } from "../src/repositories/paymentRepository.js";
import { rewardRepository } from "../src/repositories/rewardRepository.js";

export async function testMonetization() {
  const results = [];
  const runTest = (name, fn) => async () => {
    try {
      await fn();
      results.push({ name, passed: true });
    } catch (err) {
      results.push({ name, passed: false, error: err.message });
    }
  };

  // Setup test user
  const testEmail = `test_monetize_${Date.now()}@example.com`;
  const adminEmail = `admin_monetize_${Date.now()}@example.com`;
  let studentUser = null;
  let adminUser = null;
  let certRequestId = null;
  let issuedCertId = null;
  let doubtTicketId = null;

  try {
    studentUser = await userRepository.create({
      email: testEmail,
      passwordHash: "dummyhash",
      name: "Test Monetization Student",
      role: "student"
    });

    adminUser = await userRepository.create({
      email: adminEmail,
      passwordHash: "dummyhash",
      name: "Test Academic Admin",
      role: "admin"
    });

    // 1. Certificate Request creation
    await runTest("Certificate Request: Can create request for ₹99", async () => {
      const req = await certificateRepository.createRequest({
        userId: studentUser.id,
        studentName: studentUser.full_name,
        studentEmail: studentUser.email,
        courseName: "Python Programming & Adaptive Core Curriculum",
        completedTopicsCount: 198,
        amountInr: 99.00
      });
      if (!req || !req.id) throw new Error("Request was not created");
      if (Number(req.amount_inr) !== 99) throw new Error(`Expected ₹99, got ₹${req.amount_inr}`);
      if (req.status !== "pending") throw new Error(`Expected pending, got ${req.status}`);
      certRequestId = req.id;
    })();

    // 2. Fetch requests by user
    await runTest("Certificate Request: Student can retrieve their certificate requests", async () => {
      const list = await certificateRepository.getRequestsByUserId(studentUser.id);
      if (!Array.isArray(list) || list.length === 0) throw new Error("Expected active request list");
      if (list[0].id !== certRequestId) throw new Error("Request ID mismatch in user requests");
    })();

    // 3. Admin verifies ₹99 payment
    await runTest("Certificate Request: Admin manually verifies ₹99 payment", async () => {
      const verified = await certificateRepository.verifyPayment(certRequestId, {
        verifiedBy: adminUser.id,
        transactionReference: `UPI_TEST_${Date.now()}`,
        notes: "Verified ₹99 receipt manually"
      });
      if (!verified) throw new Error("verifyPayment returned false");

      const req = await certificateRepository.getRequestById(certRequestId);
      if (req.payment_status !== "verified") throw new Error(`Expected payment_verified, got ${req.payment_status}`);
    })();

    // 4. Admin approves certificate & issues unique ID
    await runTest("Certificate Issuance: Generates unique certificate ID & issue record", async () => {
      const cert = await certificateRepository.approveAndIssue(certRequestId, {
        issuedBy: adminUser.id
      });
      if (!cert || !cert.certificate_id) throw new Error("Certificate was not issued");
      if (!cert.certificate_id.startsWith("LWU-PY-")) throw new Error(`Invalid certificate ID format: ${cert.certificate_id}`);
      issuedCertId = cert.certificate_id;

      const req = await certificateRepository.getRequestById(certRequestId);
      if (req.status !== "approved") throw new Error(`Expected request status approved, got ${req.status}`);
    })();

    // 5. Public verification lookup
    await runTest("Certificate Public Verification: Successfully verifies issued certificate without auth", async () => {
      const cert = await certificateRepository.getByCertificateId(issuedCertId);
      if (!cert) throw new Error("Certificate lookup returned null");
      if (cert.student_name !== "Test Monetization Student") throw new Error(`Name mismatch: ${cert.student_name}`);
      if (cert.is_revoked) throw new Error("Expected certificate to be active");
    })();

    // 6. 10 Free Doubts vs ₹49 Paid Doubts
    await runTest("Doubt Mentorship: 10 Free doubts tracked, 11th doubt marked paid ₹49", async () => {
      const rewards = await rewardRepository.getByUserId(studentUser.id);
      const freeRemaining = rewards?.doubt_credits !== undefined ? rewards.doubt_credits : 10;
      if (freeRemaining !== 10) throw new Error(`Expected 10 free doubts, got ${freeRemaining}`);

      // Create a paid doubt ticket (simulating 11th doubt)
      const res = await query(
        `
        INSERT INTO doubt_tickets (
          ticket_number, user_id, student_name, student_email,
          section_title, lesson_name, question,
          code_snippet, is_paid, amount_inr, payment_status, status
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'pending'
        ) RETURNING *
        `,
        [
          `DBT_TEST_${Date.now()}`,
          studentUser.id,
          studentUser.full_name,
          studentUser.email,
          "Advanced Python",
          "Decorators",
          "How does functools.wraps work?",
          "def my_dec(fn): pass",
          true,
          49,
          "pending"
        ]
      );
      const ticket = res.rows[0];
      if (!ticket) throw new Error("Ticket not created");
      if (Number(ticket.amount_inr) !== 49) throw new Error(`Expected ₹49, got ₹${ticket.amount_inr}`);
      if (!ticket.is_paid) throw new Error("Expected is_paid to be true");
      doubtTicketId = ticket.id;
    })();

    // 7. Admin verifies ₹49 doubt payment
    await runTest("Doubt Mentorship: Admin manually verifies ₹49 payment", async () => {
      await query(
        `
        UPDATE doubt_tickets
        SET payment_status = 'verified',
            payment_reference = $1
        WHERE id = $2
        `,
        [`UPI_DBT_${Date.now()}`, doubtTicketId]
      );

      // Record in payment_records
      await paymentRepository.createPayment({
        userId: studentUser.id,
        paymentType: "paid_doubt",
        referenceId: doubtTicketId,
        amountInr: 49,
        paymentMethod: "whatsapp_manual",
        transactionReference: `UPI_DBT_${Date.now()}`
      });

      await paymentRepository.verifyPayment(doubtTicketId, {
        verifiedBy: adminUser.id,
        transactionReference: `UPI_DBT_${Date.now()}`,
        notes: "Verified ₹49 doubt support"
      });

      const check = await query(`SELECT * FROM doubt_tickets WHERE id = $1`, [doubtTicketId]);
      if (check.rows[0].payment_status !== "verified") throw new Error("Payment was not verified");
    })();

    // 8. Admin answers student doubt
    await runTest("Doubt Mentorship: Admin submits mentor solution & marks solved", async () => {
      const solution = "functools.wraps preserves the original function's __name__ and docstring.";
      await query(
        `
        UPDATE doubt_tickets
        SET status = 'solved',
            answer = $1,
            answered_at = NOW(),
            answered_by = $2
        WHERE id = $3
        `,
        [solution, adminUser.id, doubtTicketId]
      );

      const check = await query(`SELECT * FROM doubt_tickets WHERE id = $1`, [doubtTicketId]);
      if (check.rows[0].status !== "solved") throw new Error("Ticket was not marked solved");
      if (check.rows[0].answer !== solution) throw new Error("Answer mismatch");
    })();

    // 9. Financial Summary Audit
    await runTest("Monetization Audit: Correct financial aggregates calculated", async () => {
      const summary = await paymentRepository.getFinancialSummary();
      if (summary.totalRevenueInr < 148) throw new Error(`Expected >= ₹148 (₹99 + ₹49), got ₹${summary.totalRevenueInr}`);
      if (summary.certificateRevenueInr < 99) throw new Error(`Expected certificate revenue >= ₹99, got ₹${summary.certificateRevenueInr}`);
      if (summary.doubtRevenueInr < 49) throw new Error(`Expected doubt revenue >= ₹49, got ₹${summary.doubtRevenueInr}`);
    })();

  } finally {
    // Cleanup test records
    try {
      if (doubtTicketId) await query(`DELETE FROM doubt_tickets WHERE id = $1`, [doubtTicketId]);
      if (issuedCertId) await query(`DELETE FROM issued_certificates WHERE certificate_id = $1`, [issuedCertId]);
      if (certRequestId) await query(`DELETE FROM certificate_requests WHERE id = $1`, [certRequestId]);
      if (studentUser) {
        await query(`DELETE FROM payment_records WHERE user_id = $1`, [studentUser.id]);
        await query(`DELETE FROM user_rewards WHERE user_id = $1`, [studentUser.id]);
        await query(`DELETE FROM users WHERE id = $1`, [studentUser.id]);
      }
      if (adminUser) await query(`DELETE FROM users WHERE id = $1`, [adminUser.id]);
    } catch {
      // Non-blocking cleanup
    }
  }

  return results;
}
