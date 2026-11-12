import React, { useState } from "react";
import {
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  QrCode,
  CreditCard,
  ArrowRight,
  ShieldCheck,
  Clock,
  MessageCircle,
  HelpCircle,
  Lock,
  Hourglass,
  ExternalLink
} from "lucide-react";
import { useDoubt } from "../../context/DoubtContext";
import { useAuth } from "../../context/AuthContext";
import { WhatsAppIcon } from "../AskDoubtButton";
import { WHATSAPP_DISPLAY_NUMBER, WHATSAPP_SUPPORT_NUMBER } from "../../utils/whatsappHelper";

export default function AskDoubtModal() {
  const {
    isDoubtModalOpen,
    closeDoubtModal,
    activeDoubtContext,
    doubtCredits,
    freeDoubtsTotal,
    pendingCount,
    myTickets,
    submitAndLaunchWhatsApp,
    rechargeAndLaunch,
    isLoading,
    costPerDoubt
  } = useDoubt();

  const { currentUser } = useAuth();

  const [paymentTab, setPaymentTab] = useState("instant"); // 'instant' | 'upi'
  const [selectedPack, setSelectedPack] = useState(1);
  const [utrNumber, setUtrNumber] = useState("");
  const [customQuery, setCustomQuery] = useState("");
  const [showTicketsList, setShowTicketsList] = useState(false);

  if (!isDoubtModalOpen) return null;

  const sectionTitle = activeDoubtContext?.sectionTitle;
  const sectionNumber = activeDoubtContext?.sectionNumber;
  const lessonName = activeDoubtContext?.lessonName;
  const topicNumber = activeDoubtContext?.topicNumber;
  const stepName = activeDoubtContext?.stepName;

  const hasCredits = doubtCredits > 0;
  const progressPercent = Math.min(100, Math.max(0, (doubtCredits / freeDoubtsTotal) * 100));

  const PACKS = [
    { credits: 1, amount: 50, perDoubt: 50, popular: false, badge: null },
    { credits: 3, amount: 120, perDoubt: 40, popular: true, badge: "Save 20%" },
    { credits: 5, amount: 200, perDoubt: 40, popular: false, badge: "Best Value" }
  ];

  const currentPack = PACKS.find((p) => p.credits === selectedPack) || PACKS[0];

  const handleLaunch = async () => {
    try {
      await submitAndLaunchWhatsApp(customQuery.trim() ? customQuery.trim() : null);
    } catch {
      // Handled in context
    }
  };

  const handlePayAndLaunch = async () => {
    try {
      await rechargeAndLaunch({
        credits: currentPack.credits,
        amount: currentPack.amount,
        paymentMethod: paymentTab,
        paymentReference: utrNumber.trim() || `PAY_${Date.now()}`
      });
    } catch {}
  };

  const upiId = `${WHATSAPP_SUPPORT_NUMBER}@upi`;
  const upiLink = `upi://pay?pa=${upiId}&pn=LearnWithUs&am=${currentPack.amount}&cu=INR&tn=DoubtTicket_${selectedPack}Credits`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(upiLink)}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="doubt-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-1.5 sm:p-4 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) closeDoubtModal();
      }}
    >
      <div className="relative w-full max-w-lg bg-white dark:bg-[#0E1E38] rounded-xl sm:rounded-3xl shadow-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden flex flex-col max-h-[96vh] sm:max-h-[92vh] animate-in zoom-in-95 duration-200">
        
        {/* ================================================================= */}
        {/* Header (Fluid from 280px) */}
        {/* ================================================================= */}
        <div className="relative px-3 py-2.5 sm:px-6 sm:pt-5 sm:pb-4 bg-linear-to-r from-emerald-50 via-teal-50 to-sky-50 dark:from-[#0D2818] dark:via-[#0F2A38] dark:to-[#0D223A] border-b border-emerald-100 dark:border-slate-800">
          <div className="flex items-center justify-between gap-1.5 sm:gap-2">
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
              <div
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-2xl flex items-center justify-center shadow-md shrink-0 text-white"
                style={{ backgroundColor: "#25D366" }}
              >
                <WhatsAppIcon size={18} className="text-white" />
              </div>
              <div className="min-w-0">
                <h3 id="doubt-modal-title" className="text-xs sm:text-lg font-black text-slate-900 dark:text-white tracking-tight truncate">
                  Ask Mentor on WhatsApp
                </h3>
                <p className="text-[9px] sm:text-xs text-slate-600 dark:text-slate-300 truncate">
                  Dedicated 1-on-1 coding mentorship
                </p>
              </div>
            </div>

            <button
              onClick={closeDoubtModal}
              disabled={isLoading}
              className="p-1 sm:p-1.5 rounded-lg sm:rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition cursor-pointer shrink-0"
              aria-label="Close modal"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* ================================================================= */}
        {/* Modal Body (Fluid from 280px) */}
        {/* ================================================================= */}
        <div className="p-2.5 sm:p-5 sm:px-6 overflow-y-auto space-y-2.5 sm:space-y-4">

          {/* =============================================================== */}
          {/* 1. Context Information (Bright, High-Contrast & Vibrant) */}
          {/* =============================================================== */}
          <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-linear-to-br from-blue-50/90 via-sky-50/70 to-indigo-50/80 dark:from-[#132A4D] dark:via-[#16335C] dark:to-[#0F2342] border-2 border-blue-200/90 dark:border-sky-400/50 shadow-md shadow-blue-500/10 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-1.5">
              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-blue-700 dark:text-[#38BDF8] flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-blue-500 dark:bg-[#38BDF8] animate-pulse"></span>
                <span>DOUBT CONTEXT</span>
              </span>
              <span className="font-bold text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-800 dark:text-[#4ADE80] border border-emerald-400/50 dark:border-emerald-400/60 shadow-xs">
                ● 1-on-1 Mentor Support
              </span>
            </div>
            
            {sectionTitle && (
              <div className="flex items-center gap-2 text-slate-800 dark:text-[#E2E8F0] font-semibold text-xs sm:text-sm">
                <span className="text-base shrink-0">📚</span>
                <span className="truncate">
                  <span className="text-blue-600 dark:text-[#60A5FA] font-bold">
                    {sectionNumber ? `Section ${sectionNumber} — ` : ""}
                  </span>
                  <span className="text-slate-900 dark:text-white font-bold">{sectionTitle}</span>
                </span>
              </div>
            )}

            {lessonName && (
              <div className="flex items-center gap-2 text-slate-950 dark:text-white font-black text-sm sm:text-base tracking-tight">
                <span className="text-base shrink-0">📖</span>
                <span className="truncate">
                  {topicNumber ? `#${topicNumber} ` : ""}{lessonName}
                </span>
              </div>
            )}

            {stepName && (
              <div className="pt-0.5">
                <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg sm:rounded-xl bg-white/95 dark:bg-[#1E3A8A]/60 border border-blue-200 dark:border-sky-400/50 text-[11px] sm:text-xs font-bold text-slate-800 dark:text-[#F8FAFC] shadow-xs max-w-full">
                  <span>📍 Step:</span>
                  <span className="text-blue-700 dark:text-[#38BDF8] font-black truncate">{stepName}</span>
                </span>
              </div>
            )}
          </div>

          {/* =============================================================== */}
          {/* 2. PROTECTED DOUBT BALANCE (Count only reduces once solved!) */}
          {/* =============================================================== */}
          {hasCredits ? (
            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-linear-to-br from-emerald-50 via-teal-50/60 to-emerald-100/40 dark:from-[#092B1C] dark:via-[#0E3524] dark:to-[#072417] border-2 border-emerald-400 dark:border-[#10B981] shadow-md shadow-emerald-500/10 space-y-2.5 sm:space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-1.5">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl bg-emerald-500/25 text-emerald-800 dark:text-[#34D399]">
                    <Sparkles size={14} className="sm:w-4 sm:h-4" />
                  </span>
                  <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-emerald-800 dark:text-[#34D399]">
                    Your Doubt Balance
                  </span>
                </div>
                <div className="text-[11px] sm:text-xs font-black px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-emerald-500/25 text-emerald-950 dark:text-[#E6FFFA] border-2 border-emerald-400 dark:border-[#34D399] shadow-xs">
                  {doubtCredits} of {freeDoubtsTotal} Left
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="w-full bg-emerald-200/60 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-700 h-2 sm:h-2.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-linear-to-r from-emerald-500 to-teal-300 transition-all duration-500 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-1 text-[10px] sm:text-[11px] text-slate-800 dark:text-slate-100 font-bold">
                  <span>{doubtCredits} free doubts remaining</span>
                  <span className="text-emerald-700 dark:text-[#34D399]">100% Free Mentorship</span>
                </div>
              </div>

              {/* Protection Guarantee Notice */}
              <div className="p-2.5 sm:p-3 rounded-xl bg-emerald-100/90 dark:bg-[#073820] border-2 border-emerald-300 dark:border-emerald-500/80 flex items-start gap-2 sm:gap-2.5 shadow-xs">
                <ShieldCheck size={16} className="text-emerald-700 dark:text-[#34D399] shrink-0 mt-0.5" />
                <div className="text-[11px] sm:text-xs text-emerald-950 dark:text-[#ECFDF5] leading-relaxed font-semibold">
                  <strong>Protected Doubt Count:</strong> Opening WhatsApp or sending a message does <u>NOT</u> reduce your count! Your count will only be reduced <strong>after our mentor/admin successfully solves your issue.</strong>
                </div>
              </div>

              {/* Pending count banner if any */}
              {pendingCount > 0 && (
                <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-1 text-[11px] sm:text-xs px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-amber-500/20 border-2 border-amber-500/40 text-amber-950 dark:text-amber-100 font-bold shadow-xs">
                  <span className="flex items-center gap-1.5 font-black text-amber-900 dark:text-amber-200">
                    <Hourglass size={13} className="text-amber-600 dark:text-amber-300 animate-spin" />
                    <span>{pendingCount} Doubt(s) in progress</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowTicketsList(!showTicketsList)}
                    className="text-[11px] sm:text-xs font-black underline cursor-pointer text-amber-800 dark:text-amber-300 hover:text-amber-950 dark:hover:text-white"
                  >
                    {showTicketsList ? "Hide History" : "View Tickets"}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-linear-to-br from-amber-500/10 via-orange-500/5 to-transparent dark:from-amber-500/15 dark:via-orange-500/10 border-2 border-amber-400/50 dark:border-amber-500/40 space-y-2.5 sm:space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-1.5">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
                    <AlertCircle size={15} />
                  </span>
                  <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-amber-700 dark:text-amber-300">
                    Free Doubts Exhausted
                  </span>
                </div>
                <div className="text-[10px] sm:text-xs font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300/60 dark:border-amber-800">
                  0 Left • ₹50 / Doubt
                </div>
              </div>

              <p className="text-[11px] sm:text-sm text-slate-900 dark:text-slate-100 leading-relaxed font-bold">
                You have used all <strong>10 free solved doubts</strong>. To connect directly with our expert Python mentors on WhatsApp, recharge doubt credits for just <strong>₹50 per doubt</strong>!
              </p>
            </div>
          )}

          {/* Student Ticket History Dropdown if requested */}
          {showTicketsList && myTickets.length > 0 && (
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                <span>Your Doubt Requests History</span>
                <span className="text-[11px] text-slate-400">{myTickets.length} total</span>
              </div>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {myTickets.map((t) => (
                  <div
                    key={t.id || t.ticket_number}
                    className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-slate-900 dark:text-white truncate">
                        #{t.ticket_number}: {t.lesson_name || t.section_title || "Python Doubt"}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(t.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      {t.status === "solved" ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
                          ✅ Solved (-1)
                        </span>
                      ) : t.status === "dismissed" ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                          ⚪ Dismissed (0)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-300">
                          ⏳ Pending (0 deducted)
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Optional: Student custom note */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
              <span>Your Specific Question (Optional)</span>
              <span className="text-[11px] text-blue-600 dark:text-[#38BDF8] font-bold">Prefills WhatsApp message</span>
            </label>
            <textarea
              value={customQuery}
              onChange={(e) => setCustomQuery(e.target.value)}
              placeholder="e.g. Can you explain why the loop index starts at 0 or how this function returns?"
              rows={2}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-white dark:bg-[#12243D] border-2 border-slate-300 dark:border-sky-500/40 text-slate-950 dark:text-white placeholder-slate-400 dark:placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/50 resize-none transition font-medium"
            />
          </div>

          {/* Recharge Section (If 0 credits) */}
          {!hasCredits && (
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Select Doubt Credits Pack:
                </span>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  Instant Activation
                </span>
              </div>

              <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                {PACKS.map((pack) => {
                  const isSelected = selectedPack === pack.credits;
                  return (
                    <button
                      key={pack.credits}
                      type="button"
                      onClick={() => setSelectedPack(pack.credits)}
                      className={`relative p-2 sm:p-3 rounded-xl sm:rounded-2xl border text-center transition cursor-pointer min-w-0 ${
                        isSelected
                          ? "border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 shadow-xs"
                          : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900"
                      }`}
                    >
                      {pack.badge && (
                        <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-1 sm:px-1.5 py-0.2 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-wider bg-emerald-600 text-white shadow-xs whitespace-nowrap">
                          {pack.badge}
                        </span>
                      )}
                      <div className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
                        {pack.credits} {pack.credits === 1 ? "Doubt" : "Doubts"}
                      </div>
                      <div className="text-[11px] sm:text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                        ₹{pack.amount}
                      </div>
                      <div className="text-[9px] sm:text-[10px] text-slate-400 mt-0.5 truncate">
                        ₹{pack.perDoubt}/doubt
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Payment Method Selector */}
              <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2.5 sm:space-y-3">
                <div className="flex rounded-xl bg-slate-200/70 dark:bg-slate-800 p-1 gap-1">
                  <button
                    type="button"
                    onClick={() => setPaymentTab("instant")}
                    className={`flex-1 py-1.5 px-1 text-[11px] sm:text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-1 sm:gap-1.5 min-w-0 ${
                      paymentTab === "instant"
                        ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <CreditCard size={13} className="shrink-0" />
                    <span className="truncate">Instant Pay</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentTab("upi")}
                    className={`flex-1 py-1.5 px-1 text-[11px] sm:text-xs font-bold rounded-lg transition cursor-pointer flex items-center justify-center gap-1 sm:gap-1.5 min-w-0 ${
                      paymentTab === "upi"
                        ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <QrCode size={13} className="shrink-0" />
                    <span className="truncate">UPI QR</span>
                  </button>
                </div>

                {paymentTab === "instant" ? (
                  <div className="space-y-1.5 text-center py-1 sm:py-2">
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      Total Payable: <strong className="text-sm sm:text-base text-slate-900 dark:text-white">₹{currentPack.amount}</strong> for {currentPack.credits} doubt credit(s).
                    </p>
                    <div className="flex items-center justify-center gap-1.5 text-[10px] sm:text-[11px] text-slate-400">
                      <ShieldCheck size={13} className="text-emerald-500 shrink-0" />
                      <span>Instant Verification & Auto-Launch to WhatsApp</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5 text-center py-1">
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-4">
                      <div className="p-2 bg-white rounded-xl shadow-xs border border-slate-200 shrink-0">
                        <img
                          src={qrUrl}
                          alt="UPI QR Code"
                          className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg"
                        />
                      </div>
                      <div className="text-left space-y-1 text-xs min-w-0">
                        <div className="font-bold text-slate-800 dark:text-slate-200">
                          Scan & Pay ₹{currentPack.amount}
                        </div>
                        <div className="font-mono text-[10px] sm:text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-1 rounded-md break-all">
                          UPI ID: {upiId}
                        </div>
                        <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400">
                          Open GPay, PhonePe, Paytm, or any UPI app to pay ₹{currentPack.amount}.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1 text-left">
                      <label className="text-[10px] sm:text-[11px] font-medium text-slate-600 dark:text-slate-400">
                        UPI Reference / UTR Number (Optional):
                      </label>
                      <input
                        type="text"
                        value={utrNumber}
                        onChange={(e) => setUtrNumber(e.target.value)}
                        placeholder="e.g. 432198765432"
                        className="w-full px-2.5 sm:px-3 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* ================================================================= */}
        {/* Bottom Action Footer with HIGH CONTRAST SOLID BUTTONS */}
        {/* ================================================================= */}
        <div className="p-3 sm:p-5 bg-slate-100/90 dark:bg-[#0B1B30] border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <div className="text-[11px] sm:text-xs text-slate-800 dark:text-slate-100 font-bold flex items-center justify-center sm:justify-start gap-1.5">
            <Clock size={13} className="text-emerald-500 shrink-0" />
            <span>Mentor reply time: <strong className="text-emerald-600 dark:text-[#34D399] font-black">&lt; 5 mins</strong></span>
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={closeDoubtModal}
              disabled={isLoading}
              className="w-full sm:w-auto py-2 sm:py-2.5 px-3 sm:px-4 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-200/80 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 transition cursor-pointer border border-slate-300 dark:border-slate-700 text-center"
            >
              Cancel
            </button>

            {hasCredits ? (
              <button
                type="button"
                onClick={handleLaunch}
                disabled={isLoading}
                style={{
                  backgroundColor: "#25D366",
                  color: "#FFFFFF",
                  border: "none",
                  boxShadow: "0 4px 16px rgba(37, 211, 102, 0.4)"
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-black text-xs sm:text-sm active:scale-95 transition cursor-pointer hover:opacity-95 disabled:opacity-50"
              >
                <WhatsAppIcon size={16} className="text-white shrink-0" />
                <span className="text-white font-black text-xs sm:text-sm tracking-wide truncate">
                  {isLoading ? "Opening WhatsApp..." : `Ask on WhatsApp (${doubtCredits} left)`}
                </span>
                <ArrowRight size={14} className="text-white shrink-0" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePayAndLaunch}
                disabled={isLoading}
                style={{
                  backgroundColor: "#059669",
                  color: "#FFFFFF",
                  border: "none"
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-black text-xs sm:text-sm shadow-md active:scale-95 transition cursor-pointer hover:opacity-90 disabled:opacity-50"
              >
                <WhatsAppIcon size={16} className="text-white shrink-0" />
                <span className="text-white font-bold text-xs sm:text-sm truncate">
                  {isLoading ? "Processing..." : `Pay ₹${currentPack.amount} & Ask`}
                </span>
                <ArrowRight size={14} className="text-white shrink-0" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
