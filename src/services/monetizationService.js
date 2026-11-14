/**
 * monetizationService.js
 * Frontend service for Certificates, Paid Doubts, and Financial Management
 */

import { apiClient } from "./apiClient";

export const certificateService = {
  /**
   * Checks course completion and certificate eligibility
   */
  async getEligibility() {
    const res = await apiClient.get("/certificates/eligibility");
    return res.data;
  },

  /**
   * Submits a certificate request (₹99)
   */
  async requestCertificate() {
    const res = await apiClient.post("/certificates/request", {});
    return res.data;
  },

  /**
   * Gets student's certificate requests
   */
  async getMyRequests() {
    const res = await apiClient.get("/certificates/my-requests");
    return res.data || [];
  },

  /**
   * Gets student's issued certificates
   */
  async getMyCertificates() {
    const res = await apiClient.get("/certificates/my-certificates");
    return res.data || [];
  },

  /**
   * Public verification lookup of a certificate by ID (no auth required)
   */
  async verifyCertificate(certificateId) {
    const res = await apiClient.get(`/certificates/verify/${encodeURIComponent(certificateId)}`);
    return res.data;
  },

  // -------------------------------------------------------------
  // Admin APIs
  // -------------------------------------------------------------

  async adminGetRequests(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await apiClient.get(`/certificates/admin/requests${query ? `?${query}` : ""}`);
    return res.data || [];
  },

  async adminVerifyPayment(id, { transactionReference, notes } = {}) {
    const res = await apiClient.post(`/certificates/admin/requests/${id}/verify-payment`, {
      transactionReference,
      notes
    });
    return res.data;
  },

  async adminApproveRequest(id) {
    const res = await apiClient.post(`/certificates/admin/requests/${id}/approve`, {});
    return res.data;
  },

  async adminRejectRequest(id, reason = "") {
    const res = await apiClient.post(`/certificates/admin/requests/${id}/reject`, { reason });
    return res.data;
  },

  async adminGetIssued(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await apiClient.get(`/certificates/admin/issued${query ? `?${query}` : ""}`);
    return res.data || [];
  }
};

export const doubtService = {
  /**
   * Gets current user's doubt balance & usage counts
   */
  async getBalance() {
    const res = await apiClient.get("/doubts/balance");
    return res.data;
  },

  /**
   * Gets tickets submitted by current user
   */
  async getMyTickets() {
    const res = await apiClient.get("/doubts/my-tickets");
    return res.data || [];
  },

  /**
   * Submits a doubt request (Free if credits available, or Paid ₹49 if 10 free used)
   */
  async submitDoubt(payload) {
    const res = await apiClient.post("/doubts/request", payload);
    return res.data;
  },

  // -------------------------------------------------------------
  // Admin APIs
  // -------------------------------------------------------------

  async adminGetTickets(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await apiClient.get(`/doubts/tickets${query ? `?${query}` : ""}`);
    return res.data || [];
  },

  async adminVerifyPayment(id, { transactionReference, notes } = {}) {
    const res = await apiClient.post(`/doubts/tickets/${id}/verify-payment`, {
      transactionReference,
      notes
    });
    return res.data;
  },

  async adminSolveTicket(id, { answer, resolutionNotes } = {}) {
    const res = await apiClient.post(`/doubts/tickets/${id}/solve`, {
      answer,
      resolutionNotes
    });
    return res.data;
  },

  async adminDismissTicket(id, reason = "") {
    const res = await apiClient.post(`/doubts/tickets/${id}/dismiss`, { reason });
    return res.data;
  }
};

export const monetizationService = {
  /**
   * Gets financial summary (revenue, verified, pending) for Admin
   */
  async getSummary() {
    const res = await apiClient.get("/monetization/summary");
    return res.data;
  },

  /**
   * Gets payments list with filters for Admin
   */
  async getPayments(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await apiClient.get(`/monetization/payments${query ? `?${query}` : ""}`);
    return res.data || [];
  },

  /**
   * Manually verifies a payment
   */
  async verifyPayment(id, { transactionReference, notes } = {}) {
    const res = await apiClient.post(`/monetization/payments/${id}/verify`, {
      transactionReference,
      notes
    });
    return res.data;
  },

  /**
   * Rejects a payment
   */
  async rejectPayment(id, notes = "") {
    const res = await apiClient.post(`/monetization/payments/${id}/reject`, { notes });
    return res.data;
  }
};

