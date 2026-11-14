import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  IndianRupee,
  Award,
  MessageCircle,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  ExternalLink,
  Clock,
  Send,
  Check,
  X,
  RefreshCw,
  FileText,
  DollarSign,
  TrendingUp,
  User,
  BookOpen,
  Code
} from "lucide-react";
import { certificateService, doubtService, monetizationService } from "../../services/monetizationService";
import CertificateModal from "../CertificateModal";

export default function MonetizationManagerTab() {
  // Sub-tab selection: 'overview' | 'certificates' | 'doubts' | 'payments'
  const [subTab, setSubTab] = useState("overview");

  // Summary State
  const [summary, setSummary] = useState({
    totalRevenueInr: 0,
    certificateRevenueInr: 0,
    doubtRevenueInr: 0,
    pendingPaymentsCount: 0,
    pendingPaymentsAmountInr: 0,
    verifiedPaymentsCount: 0
  });
  const [summaryLoading, setSummaryLoading] = useState(false);

  // Certificate Requests State
  const [certRequests, setCertRequests] = useState([]);
  const [certSearch, setCertSearch] = useState("");
  const [certFilterStatus, setCertFilterStatus] = useState("all");
  const [certLoading, setCertLoading] = useState(false);

  // Doubts State
  const [doubts, setDoubts] = useState([]);
  const [doubtSearch, setDoubtSearch] = useState("");
  const [doubtFilterStatus, setDoubtFilterStatus] = useState("all");
  const [doubtFilterPaid, setDoubtFilterPaid] = useState("all");
  const [doubtsLoading, setDoubtsLoading] = useState(false);

  // Payment Records State
  const [payments, setPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);

  // Active Modals & Dialogs
  const [verifyModal, setVerifyModal] = useState(null); // { type: 'cert' | 'doubt', item }
  const [txnRefInput, setTxnRefInput] = useState("");
  const [adminNotesInput, setAdminNotesInput] = useState("");

  const [answerModal, setAnswerModal] = useState(null); // { ticket }
  const [answerText, setAnswerText] = useState("");
  const [answerNotes, setAnswerNotes] = useState("");

  const [activePreviewCert, setActivePreviewCert] = useState(null);

  // Action status feedback
  const [actionMsg, setActionMsg] = useState({ text: "", type: "success" });
  const showFeedback = (text, type = "success") => {
    setActionMsg({ text, type });
    setTimeout(() => setActionMsg({ text: "", type: "success" }), 4500);
  };

  // 1. Load Financial Summary
  const loadSummary = useCallback(async () => {
    setSummaryLoading(true);
    try {
      const data = await monetizationService.getSummary();
      if (data) setSummary(data);
    } catch (err) {
      // Fallback
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  // 2. Load Certificate Requests
  const loadCertRequests = useCallback(async () => {
    setCertLoading(true);
    try {
      const list = await certificateService.adminGetRequests({
        search: certSearch,
        status: certFilterStatus !== "all" ? certFilterStatus : undefined
      });
      setCertRequests(Array.isArray(list) ? list : []);
    } catch (err) {
      // Fallback
    } finally {
      setCertLoading(false);
    }
  }, [certSearch, certFilterStatus]);

  // 3. Load Doubts
  const loadDoubts = useCallback(async () => {
    setDoubtsLoading(true);
    try {
      const list = await doubtService.adminGetTickets({
        search: doubtSearch,
        status: doubtFilterStatus !== "all" ? doubtFilterStatus : undefined,
        isPaid: doubtFilterPaid === "paid" ? "true" : doubtFilterPaid === "free" ? "false" : undefined
      });
      setDoubts(Array.isArray(list) ? list : []);
    } catch (err) {
      // Fallback
    } finally {
      setDoubtsLoading(false);
    }
  }, [doubtSearch, doubtFilterStatus, doubtFilterPaid]);

  // 4. Load Payment Records
  const loadPayments = useCallback(async () => {
    setPaymentsLoading(true);
    try {
      const list = await monetizationService.getPayments();
      setPayments(Array.isArray(list) ? list : []);
    } catch (err) {
      // Fallback
    } finally {
      setPaymentsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadSummary();
    loadCertRequests();
    loadDoubts();
    loadPayments();
  }, [loadSummary, loadCertRequests, loadDoubts, loadPayments]);

  // -------------------------------------------------------------------------
  // CERTIFICATE ACTIONS
  // -------------------------------------------------------------------------
  const handleVerifyCertPayment = async () => {
    if (!verifyModal?.item?.id) return;
    try {
      await certificateService.adminVerifyPayment(verifyModal.item.id, {
        transactionReference: txnRefInput.trim() || `TXN_${Date.now()}`,
        notes: adminNotesInput.trim() || "Verified manual WhatsApp payment"
      });
      showFeedback(`✓ Verified ₹99 payment for Certificate Request #${verifyModal.item.request_number}`);
      setVerifyModal(null);
      setTxnRefInput("");
      setAdminNotesInput("");
      loadSummary();
      loadCertRequests();
    } catch (err) {
      showFeedback(err.message || "Failed to verify payment", "error");
    }
  };

  const handleApproveCertRequest = async (request) => {
    const confirmed = window.confirm(
      `Approve Certificate Request #${request.request_number} for ${request.student_name}?\n\nThis will generate an official Certificate ID and make it downloadable for the student.`
    );
    if (!confirmed) return;

    try {
      const res = await certificateService.adminApproveRequest(request.id);
      showFeedback(`✓ Certificate Approved! Issued ID: ${res.certificateId}`);
      loadSummary();
      loadCertRequests();
    } catch (err) {
      showFeedback(err.message || "Failed to approve request", "error");
    }
  };

  const handleRejectCertRequest = async (request) => {
    const reason = window.prompt("Reason for rejecting certificate request:", "Incomplete coursework or unverified payment");
    if (reason === null) return;

    try {
      await certificateService.adminRejectRequest(request.id, reason);
      showFeedback(`Certificate Request #${request.request_number} has been rejected.`);
      loadCertRequests();
    } catch (err) {
      showFeedback(err.message || "Failed to reject request", "error");
    }
  };

  // -------------------------------------------------------------------------
  // DOUBT ACTIONS
  // -------------------------------------------------------------------------
  const handleVerifyDoubtPayment = async () => {
    if (!verifyModal?.item?.id) return;
    try {
      await doubtService.adminVerifyPayment(verifyModal.item.id, {
        transactionReference: txnRefInput.trim() || `TXN_${Date.now()}`,
        notes: adminNotesInput.trim() || "Verified ₹49 payment on WhatsApp"
      });
      showFeedback(`✓ Verified ₹49 payment for Doubt Ticket #${verifyModal.item.ticket_number}`);
      setVerifyModal(null);
      setTxnRefInput("");
      setAdminNotesInput("");
      loadSummary();
      loadDoubts();
    } catch (err) {
      showFeedback(err.message || "Failed to verify payment", "error");
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answerModal?.ticket?.id) return;
    if (!answerText.trim()) {
      alert("Please write the mentor answer.");
      return;
    }

    try {
      await doubtService.adminSolveTicket(answerModal.ticket.id, {
        answer: answerText.trim(),
        resolutionNotes: answerNotes.trim() || "Resolved with code solution"
      });
      showFeedback(`✓ Answer submitted! Doubt #${answerModal.ticket.ticket_number} marked as solved.`);
      setAnswerModal(null);
      setAnswerText("");
      setAnswerNotes("");
      loadSummary();
      loadDoubts();
    } catch (err) {
      showFeedback(err.message || "Failed to submit answer", "error");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <IndianRupee size={20} />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Monetization & Payment Management
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manual verification for ₹99 Certificates, ₹49 Doubt Resolution, and Financial Audit Log.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            loadSummary();
            loadCertRequests();
            loadDoubts();
            loadPayments();
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 cursor-pointer shadow-xs"
        >
          <RefreshCw size={13} className={summaryLoading ? "animate-spin" : ""} />
          <span>Refresh All</span>
        </button>
      </div>

      {/* Feedback Toast Banner */}
      {actionMsg.text && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in ${
            actionMsg.type === "error"
              ? "bg-rose-500/15 border border-rose-500/30 text-rose-800 dark:text-rose-300"
              : "bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300"
          }`}
        >
          {actionMsg.type === "error" ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
          <span>{actionMsg.text}</span>
        </div>
      )}

      {/* =====================================================================
          1. FINANCIAL SUMMARY KPI CARDS
          ===================================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Verified Revenue */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0E1E38] border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Verified Revenue
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              ₹
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
            ₹{summary.totalRevenueInr.toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-slate-400 font-semibold mt-1">
            {summary.verifiedPaymentsCount} verified transaction(s)
          </div>
        </div>

        {/* Certificate Revenue (₹99) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0E1E38] border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Certificate Revenue (₹99)
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-[#0756A5] dark:text-[#38bdf8] flex items-center justify-center">
              <Award size={16} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#102B50] dark:text-white">
            ₹{summary.certificateRevenueInr.toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-slate-400 font-semibold mt-1">
            {Math.round(summary.certificateRevenueInr / 99)} issued certificate(s)
          </div>
        </div>

        {/* Doubt Revenue (₹49) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0E1E38] border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Doubt Revenue (₹49)
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <MessageCircle size={16} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#102B50] dark:text-white">
            ₹{summary.doubtRevenueInr.toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-slate-400 font-semibold mt-1">
            {Math.round(summary.doubtRevenueInr / 49)} paid doubt session(s)
          </div>
        </div>

        {/* Pending Payments */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0E1E38] border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Pending Manual Verifications
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Clock size={16} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-500">
            {summary.pendingPaymentsCount} <span className="text-xs text-slate-400 font-bold">Pending</span>
          </div>
          <div className="text-[11px] text-slate-400 font-semibold mt-1">
            Totaling ₹{summary.pendingPaymentsAmountInr.toLocaleString("en-IN")}
          </div>
        </div>
      </div>

      {/* Navigation Sub-tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setSubTab("overview")}
          className={`py-2 px-4 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
            subTab === "overview"
              ? "bg-[#0756A5] text-white shadow-xs"
              : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <TrendingUp size={14} />
          <span>Dashboard Overview</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab("certificates")}
          className={`py-2 px-4 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
            subTab === "certificates"
              ? "bg-[#0756A5] text-white shadow-xs"
              : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <Award size={14} />
          <span>Certificate Requests (₹99)</span>
          {certRequests.filter((r) => r.status === "pending_payment").length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-amber-500 text-white">
              {certRequests.filter((r) => r.status === "pending_payment").length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setSubTab("doubts")}
          className={`py-2 px-4 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
            subTab === "doubts"
              ? "bg-[#0756A5] text-white shadow-xs"
              : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <MessageCircle size={14} />
          <span>Doubts Mentorship (10 Free / ₹49)</span>
          {doubts.filter((d) => d.status === "pending").length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-amber-500 text-white">
              {doubts.filter((d) => d.status === "pending").length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setSubTab("payments")}
          className={`py-2 px-4 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
            subTab === "payments"
              ? "bg-[#0756A5] text-white shadow-xs"
              : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          <FileText size={14} />
          <span>Financial Audit Log</span>
        </button>
      </div>

      {/* =====================================================================
          SUB-TAB: OVERVIEW
          ===================================================================== */}
      {subTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Quick Action: Pending Certificates */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0E1E38] border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Award size={16} className="text-[#0756A5]" />
                  <span>Pending Certificate Approvals</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setSubTab("certificates")}
                  className="text-xs font-bold text-[#0756A5] dark:text-[#38bdf8] hover:underline"
                >
                  View All
                </button>
              </div>

              {certRequests.filter((r) => r.status === "pending_payment" || r.status === "payment_verified").length > 0 ? (
                <div className="space-y-2">
                  {certRequests
                    .filter((r) => r.status === "pending_payment" || r.status === "payment_verified")
                    .slice(0, 4)
                    .map((r) => (
                      <div
                        key={r.id}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                            {r.student_name}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate">
                            {r.student_email} • {r.completed_topics_count}/198 completed
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {r.status === "pending_payment" ? (
                            <button
                              type="button"
                              onClick={() => setVerifyModal({ type: "cert", item: r })}
                              className="py-1 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] cursor-pointer"
                            >
                              Verify ₹99
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleApproveCertRequest(r)}
                              className="py-1 px-2.5 rounded-lg bg-[#0756A5] hover:bg-[#064681] text-white font-bold text-[11px] cursor-pointer"
                            >
                              Approve
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 py-3 text-center">
                  No pending certificate requests at this time.
                </p>
              )}
            </div>

            {/* Quick Action: Pending Doubts */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0E1E38] border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <MessageCircle size={16} className="text-purple-500" />
                  <span>Unanswered Doubts</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setSubTab("doubts")}
                  className="text-xs font-bold text-[#0756A5] dark:text-[#38bdf8] hover:underline"
                >
                  View All
                </button>
              </div>

              {doubts.filter((d) => d.status === "pending").length > 0 ? (
                <div className="space-y-2">
                  {doubts
                    .filter((d) => d.status === "pending")
                    .slice(0, 4)
                    .map((d) => (
                      <div
                        key={d.id || d.ticket_number}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                            {d.student_name}: {d.question || d.custom_message}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate">
                            {d.is_paid ? "Paid (₹49)" : "Free Doubt"} • #{d.ticket_number}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {d.is_paid && d.payment_status !== "verified" ? (
                            <button
                              type="button"
                              onClick={() => setVerifyModal({ type: "doubt", item: d })}
                              className="py-1 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] cursor-pointer"
                            >
                              Verify ₹49
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setAnswerModal({ ticket: d })}
                              className="py-1 px-2.5 rounded-lg bg-[#0756A5] hover:bg-[#064681] text-white font-bold text-[11px] cursor-pointer"
                            >
                              Answer
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 py-3 text-center">
                  All student doubts have been answered.
                </p>
              )}
            </div>
          </div>

          {/* Monetization Rules & Guidelines */}
          <div className="p-5 rounded-2xl bg-blue-50/60 dark:bg-slate-900/50 border border-blue-200 dark:border-blue-900 text-xs text-slate-700 dark:text-slate-300 space-y-2 leading-relaxed">
            <div className="font-bold text-sm text-[#0756A5] dark:text-[#38bdf8] flex items-center gap-2">
              <ShieldCheck size={16} />
              <span>Monetization Operating Principles</span>
            </div>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Free Learning:</strong> Core Python learning, lesson content, quizzes, and live interpreter remain 100% free forever.</li>
              <li><strong>₹99 Certificates:</strong> Students pay ₹99 for verified digital certificate generation. Only approved after course completion and manual payment confirmation.</li>
              <li><strong>10 Free Doubts:</strong> Every student receives 10 free doubts. 11th doubt onwards costs ₹49 each.</li>
              <li><strong>Strict Manual Verification:</strong> Admin must manually confirm receipt of ₹99 or ₹49 via WhatsApp/UPI before approving certificate generation or answering paid doubts.</li>
            </ul>
          </div>
        </div>
      )}

      {/* =====================================================================
          SUB-TAB: CERTIFICATE REQUESTS (₹99)
          ===================================================================== */}
      {subTab === "certificates" && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={certSearch}
                onChange={(e) => setCertSearch(e.target.value)}
                placeholder="Search by student name, email, or request #..."
                className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={certFilterStatus}
                onChange={(e) => setCertFilterStatus(e.target.value)}
                className="py-2 px-3 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
              >
                <option value="all">All Statuses</option>
                <option value="pending_payment">Pending Payment (₹99)</option>
                <option value="payment_verified">Payment Verified</option>
                <option value="approved">Approved & Issued</option>
                <option value="rejected">Rejected</option>
              </select>

              <button
                type="button"
                onClick={loadCertRequests}
                className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                Filter
              </button>
            </div>
          </div>

          {/* Table / List */}
          <div className="bg-white dark:bg-[#0E1E38] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3.5">Request #</th>
                    <th className="p-3.5">Student</th>
                    <th className="p-3.5">Course & Progress</th>
                    <th className="p-3.5">Fee</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {certRequests.length > 0 ? (
                    certRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition">
                        <td className="p-3.5 font-mono font-bold text-slate-900 dark:text-white">
                          #{req.request_number}
                          <div className="text-[10px] font-normal text-slate-400">
                            {new Date(req.created_at).toLocaleDateString()}
                          </div>
                        </td>

                        <td className="p-3.5">
                          <div className="font-bold text-slate-900 dark:text-white">
                            {req.student_name}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {req.student_email}
                          </div>
                        </td>

                        <td className="p-3.5">
                          <div className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-xs">
                            {req.course_name}
                          </div>
                          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                            {req.completed_topics_count} of {req.total_topics_count || 198} topics completed
                          </div>
                        </td>

                        <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                          ₹{req.amount_inr || 99}
                        </td>

                        <td className="p-3.5">
                          {req.status === "approved" ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
                              Approved & Issued
                            </span>
                          ) : req.status === "payment_verified" ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-300">
                              Payment Verified (₹99)
                            </span>
                          ) : req.status === "rejected" ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300">
                              Rejected
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300">
                              ⏳ Payment Pending
                            </span>
                          )}
                        </td>

                        <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                          {req.status === "pending_payment" && (
                            <button
                              type="button"
                              onClick={() => setVerifyModal({ type: "cert", item: req })}
                              className="py-1 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer border-none"
                            >
                              Verify ₹99
                            </button>
                          )}

                          {req.status === "payment_verified" && (
                            <button
                              type="button"
                              onClick={() => handleApproveCertRequest(req)}
                              className="py-1 px-2.5 rounded-lg bg-[#0756A5] hover:bg-[#064681] text-white font-bold text-xs cursor-pointer border-none"
                            >
                              Approve & Issue
                            </button>
                          )}

                          {req.status !== "approved" && req.status !== "rejected" && (
                            <button
                              type="button"
                              onClick={() => handleRejectCertRequest(req)}
                              className="py-1 px-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-rose-600 font-bold text-xs cursor-pointer"
                            >
                              Reject
                            </button>
                          )}

                          {req.status === "approved" && (
                            <a
                              href={`#/verify-certificate/${req.certificate_id || ""}`}
                              className="py-1 px-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[#0756A5] dark:text-[#38bdf8] font-bold text-xs inline-flex items-center gap-1 no-underline border border-slate-200 dark:border-slate-700"
                            >
                              <ExternalLink size={12} />
                              <span>Verify</span>
                            </a>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">
                        {certLoading ? "Loading certificate requests..." : "No certificate requests matching filters."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          SUB-TAB: DOUBTS MANAGEMENT (10 Free / ₹49)
          ===================================================================== */}
      {subTab === "doubts" && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={doubtSearch}
                onChange={(e) => setDoubtSearch(e.target.value)}
                placeholder="Search doubt question, student name, email, or ticket #..."
                className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={doubtFilterPaid}
                onChange={(e) => setDoubtFilterPaid(e.target.value)}
                className="py-2 px-3 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
              >
                <option value="all">All Types</option>
                <option value="free">Free Doubts (1-10)</option>
                <option value="paid">Paid Doubts (₹49)</option>
              </select>

              <select
                value={doubtFilterStatus}
                onChange={(e) => setDoubtFilterStatus(e.target.value)}
                className="py-2 px-3 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="solved">Solved</option>
                <option value="dismissed">Dismissed</option>
              </select>
            </div>
          </div>

          {/* Doubts Grid / Cards */}
          <div className="space-y-3">
            {doubts.length > 0 ? (
              doubts.map((ticket) => (
                <div
                  key={ticket.id || ticket.ticket_number}
                  className="p-5 rounded-2xl bg-white dark:bg-[#0E1E38] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                        #{ticket.ticket_number}
                      </span>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {ticket.student_name} ({ticket.student_email})
                      </span>
                      {ticket.lesson_name && (
                        <span className="text-[11px] text-slate-400">
                          • {ticket.lesson_name}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {ticket.is_paid ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-400/40">
                          Paid Doubt (₹49)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-800 dark:text-blue-300 border border-blue-400/40">
                          Free Doubt
                        </span>
                      )}

                      {ticket.status === "solved" ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
                          Solved
                        </span>
                      ) : ticket.is_paid && ticket.payment_status !== "verified" ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300">
                          ⏳ ₹49 Payment Pending
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-300">
                          Awaiting Answer
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Question description */}
                  <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                    {ticket.question || ticket.custom_message}
                  </p>

                  {/* Code snippet if attached */}
                  {ticket.code_snippet && (
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto">
                      <pre className="m-0">{ticket.code_snippet}</pre>
                    </div>
                  )}

                  {/* Answer display if answered */}
                  {(ticket.answer || ticket.resolution_notes) && (
                    <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-400/50 dark:border-emerald-500/30 space-y-1">
                      <div className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                        Mentor's Answer:
                      </div>
                      <p className="text-xs text-slate-900 dark:text-white leading-relaxed whitespace-pre-wrap">
                        {ticket.answer || ticket.resolution_notes}
                      </p>
                    </div>
                  )}

                  {/* Footer actions */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400">
                      Submitted on {new Date(ticket.created_at).toLocaleString()}
                    </span>

                    <div className="flex items-center gap-2">
                      {ticket.is_paid && ticket.payment_status !== "verified" && (
                        <button
                          type="button"
                          onClick={() => setVerifyModal({ type: "doubt", item: ticket })}
                          className="py-1 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer border-none"
                        >
                          Verify ₹49 Payment
                        </button>
                      )}

                      {ticket.status !== "solved" && (!ticket.is_paid || ticket.payment_status === "verified") && (
                        <button
                          type="button"
                          onClick={() => setAnswerModal({ ticket })}
                          className="py-1 px-3 rounded-xl bg-[#0756A5] hover:bg-[#064681] text-white font-bold text-xs cursor-pointer border-none flex items-center gap-1"
                        >
                          <Send size={12} />
                          <span>Submit Mentor Answer</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center bg-white dark:bg-[#0E1E38] rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
                {doubtsLoading ? "Loading doubt tickets..." : "No doubt tickets found matching filters."}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          SUB-TAB: FINANCIAL AUDIT LOG
          ===================================================================== */}
      {subTab === "payments" && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#0E1E38] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-3.5">Payment ID</th>
                    <th className="p-3.5">Student</th>
                    <th className="p-3.5">Item & Type</th>
                    <th className="p-3.5">Amount</th>
                    <th className="p-3.5">Txn Ref</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Verified By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {payments.length > 0 ? (
                    payments.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition">
                        <td className="p-3.5 font-mono text-[11px] text-slate-500">
                          {p.id ? String(p.id).slice(0, 8) : "—"}
                          <div className="text-[10px]">
                            {new Date(p.created_at).toLocaleDateString()}
                          </div>
                        </td>

                        <td className="p-3.5">
                          <div className="font-bold text-slate-900 dark:text-white">
                            {p.student_name || "Student"}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {p.student_email || "—"}
                          </div>
                        </td>

                        <td className="p-3.5">
                          <span className="font-bold text-slate-800 dark:text-slate-200 capitalize">
                            {p.payment_type}
                          </span>
                        </td>

                        <td className="p-3.5 font-black text-slate-900 dark:text-white">
                          ₹{p.amount_inr}
                        </td>

                        <td className="p-3.5 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                          {p.transaction_reference || "—"}
                        </td>

                        <td className="p-3.5">
                          {p.status === "verified" ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                              Verified
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                              Pending
                            </span>
                          )}
                        </td>

                        <td className="p-3.5 text-[11px] text-slate-400">
                          {p.verified_by || "Pending"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">
                        {paymentsLoading ? "Loading payment records..." : "No payment records found."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          VERIFY PAYMENT MODAL
          ===================================================================== */}
      {verifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-[#0E1E38] rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-600" />
                <span>
                  Confirm Manual Payment: {verifyModal.type === "cert" ? "₹99 Certificate" : "₹49 Doubt"}
                </span>
              </h3>
              <button
                type="button"
                onClick={() => setVerifyModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
              <p>
                Student: <strong>{verifyModal.item.student_name}</strong> ({verifyModal.item.student_email})
              </p>
              <p>
                Item: <strong>{verifyModal.type === "cert" ? "Certificate Request" : "Doubt Mentorship Ticket"}</strong>
              </p>
              <p className="text-emerald-600 dark:text-emerald-400 font-bold">
                Amount to Verify: ₹{verifyModal.type === "cert" ? 99 : 49}
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  UPI / Bank Transaction Reference (Optional)
                </label>
                <input
                  type="text"
                  value={txnRefInput}
                  onChange={(e) => setTxnRefInput(e.target.value)}
                  placeholder="e.g. UTR438920194820"
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Admin Verification Notes
                </label>
                <input
                  type="text"
                  value={adminNotesInput}
                  onChange={(e) => setAdminNotesInput(e.target.value)}
                  placeholder="e.g. Verified payment screenshot on WhatsApp"
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setVerifyModal(null)}
                className="py-2 px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={verifyModal.type === "cert" ? handleVerifyCertPayment : handleVerifyDoubtPayment}
                className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black cursor-pointer border-none shadow-xs"
              >
                Confirm Payment Verification
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          SUBMIT MENTOR ANSWER MODAL
          ===================================================================== */}
      {answerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-[#0E1E38] rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MessageCircle size={16} className="text-[#0756A5]" />
                <span>
                  Submit Mentor Answer for #{answerModal.ticket.ticket_number}
                </span>
              </h3>
              <button
                type="button"
                onClick={() => setAnswerModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs space-y-1">
              <div className="font-bold text-slate-900 dark:text-white">
                Student Question ({answerModal.ticket.student_name}):
              </div>
              <p className="text-slate-600 dark:text-slate-300 italic">
                "{answerModal.ticket.question || answerModal.ticket.custom_message}"
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Mentor Solution / Explanation <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  rows={4}
                  required
                  placeholder="Write clear explanation, step-by-step guidance, or Python code solution..."
                  className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#0756A5]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Internal Resolution Notes (Optional)
                </label>
                <input
                  type="text"
                  value={answerNotes}
                  onChange={(e) => setAnswerNotes(e.target.value)}
                  placeholder="e.g. Explained via WhatsApp & attached code snippet"
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAnswerModal(null)}
                className="py-2 px-3.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitAnswer}
                className="py-2 px-4 rounded-xl bg-[#0756A5] hover:bg-[#064681] text-white text-xs font-black cursor-pointer border-none shadow-xs"
              >
                Send Answer & Solve Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

