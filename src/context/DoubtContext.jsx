import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";
import {
  fetchDoubtBalance,
  getLocalDoubtBalance,
  submitDoubtRequest,
  markDoubtAsSolved,
  dismissDoubtTicket,
  purchaseDoubtCredits,
  getLocalTickets,
  fetchMyTickets,
  DEFAULT_FREE_DOUBTS,
  DOUBT_COST_INR
} from "../services/doubtService";
import { openWhatsAppDoubt, WHATSAPP_DISPLAY_NUMBER } from "../utils/whatsappHelper";

const DoubtContext = createContext(null);

export function DoubtProvider({ children }) {
  const { currentUser, isAuthenticated, openAuthModal } = useAuth();

  const [doubtCredits, setDoubtCredits] = useState(DEFAULT_FREE_DOUBTS);
  const [doubtsUsed, setDoubtsUsed] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [freeDoubtsTotal] = useState(DEFAULT_FREE_DOUBTS);
  const [myTickets, setMyTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Modal State
  const [isDoubtModalOpen, setIsDoubtModalOpen] = useState(false);
  const [activeDoubtContext, setActiveDoubtContext] = useState(null);
  const [doubtToast, setDoubtToast] = useState(null);

  const refreshBalanceAndTickets = useCallback(() => {
    if (!isAuthenticated || !currentUser?.id) {
      setDoubtCredits(DEFAULT_FREE_DOUBTS);
      setDoubtsUsed(0);
      setPendingCount(0);
      setMyTickets([]);
      return;
    }

    const localBalance = getLocalDoubtBalance(currentUser.id);
    setDoubtCredits(localBalance.doubtCredits);
    setDoubtsUsed(localBalance.doubtsUsed);
    setPendingCount(localBalance.pendingCount);

    const userTickets = getLocalTickets(currentUser.id);
    setMyTickets(userTickets);

    // Sync from server in background
    fetchDoubtBalance(currentUser.id)
      .then((data) => {
        if (data?.doubtCredits !== undefined) {
          setDoubtCredits(data.doubtCredits);
          if (data.doubtsUsed !== undefined) setDoubtsUsed(data.doubtsUsed);
          if (data.pendingCount !== undefined) setPendingCount(data.pendingCount);
        }
      })
      .catch(() => {});

    fetchMyTickets(currentUser.id)
      .then((tickets) => {
        if (Array.isArray(tickets) && tickets.length > 0) {
          setMyTickets(tickets);
        }
      })
      .catch(() => {});
  }, [currentUser, isAuthenticated]);

  // Sync on mount or auth change
  useEffect(() => {
    refreshBalanceAndTickets();
  }, [refreshBalanceAndTickets]);

  const showToast = useCallback((message, type = "success") => {
    setDoubtToast({ message, type });
    setTimeout(() => {
      setDoubtToast((prev) => (prev?.message === message ? null : prev));
    }, 5500);
  }, []);

  // Open modal with context
  const openDoubtModal = useCallback(
    (context = {}) => {
      if (!isAuthenticated) {
        const topicContext = context.lessonName
          ? `"${context.lessonName}"`
          : context.sectionTitle
          ? `"${context.sectionTitle}"`
          : context.sectionNumber
          ? `Section ${context.sectionNumber}`
          : "this lesson";

        openAuthModal(
          "login",
          `Sign in to access your 10 Free Doubts on WhatsApp for ${topicContext}! Our expert mentors are ready to assist you.`
        );
        return;
      }

      setActiveDoubtContext(context);
      setIsDoubtModalOpen(true);
      refreshBalanceAndTickets();
    },
    [isAuthenticated, openAuthModal, refreshBalanceAndTickets]
  );

  const closeDoubtModal = useCallback(() => {
    setIsDoubtModalOpen(false);
    setActiveDoubtContext(null);
  }, []);

  /**
   * Submit Doubt Request and Launch WhatsApp
   * CRITICAL: Doubt count DOES NOT REDUCE!
   * Count is only reduced once admin marks the issue as solved.
   */
  const submitAndLaunchWhatsApp = useCallback(
    async (optionalCustomMessage = null) => {
      if (!isAuthenticated || !currentUser?.id) {
        openAuthModal("login", "Please sign in to ask doubts.");
        return;
      }

      if (doubtCredits <= 0) {
        throw new Error("No doubts remaining. Please recharge for ₹50.");
      }

      setIsLoading(true);
      try {
        const doubtQuestion = optionalCustomMessage || activeDoubtContext?.customMessage || "";

        // 1. Submit pending ticket (count is NOT reduced)
        const result = await submitDoubtRequest(
          currentUser.id,
          currentUser,
          {
            ...activeDoubtContext,
            question: doubtQuestion
          }
        );

        // 2. Open WhatsApp with prefilled message including ticket number
        const prefilledMessage = [
          `*Python Adaptive — Doubt Ticket #${result.ticket.ticket_number}* 🐍`,
          ``,
          `📚 *Section:* ${activeDoubtContext?.sectionNumber ? `Section ${activeDoubtContext.sectionNumber} — ` : ""}${activeDoubtContext?.sectionTitle || "Curriculum"}`,
          `📖 *Lesson:* ${activeDoubtContext?.lessonName || "Lesson"}${activeDoubtContext?.topicNumber ? ` (Ch #${activeDoubtContext.topicNumber})` : ""}`,
          activeDoubtContext?.stepName ? `📍 *Step:* ${activeDoubtContext.stepName}` : "",
          `👤 *Student:* ${currentUser.name || currentUser.username} (${currentUser.email})`,
          ``,
          `💬 *My Question:*`,
          doubtQuestion || "Hi Learn With Us Team! I need help understanding this concept. Could you please guide me and resolve my doubt?"
        ].filter(Boolean).join("\n");

        openWhatsAppDoubt({
          customMessage: prefilledMessage
        });

        // 3. Refresh tickets and pending status
        refreshBalanceAndTickets();
        closeDoubtModal();

        // 4. Notify student that count is safe until solved!
        showToast(
          `📬 WhatsApp opened! Doubt Ticket #${result.ticket.ticket_number} is registered. Your doubt count will NOT be reduced until the mentor solves your issue!`,
          "success"
        );
      } catch (err) {
        showToast(err.message || "Failed to process doubt request", "error");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [isAuthenticated, currentUser, doubtCredits, activeDoubtContext, openAuthModal, closeDoubtModal, refreshBalanceAndTickets, showToast]
  );

  /**
   * Admin: Solve the issue -> THIS REDUCES 1 COUNT FROM THE STUDENT!
   */
  const resolveTicketAsAdmin = useCallback(
    async (ticketId, adminDetails = {}) => {
      setIsLoading(true);
      try {
        const res = await markDoubtAsSolved(ticketId, adminDetails);
        refreshBalanceAndTickets();
        showToast(
          `✅ Ticket #${ticketId} marked as solved! 1 doubt count has been deducted from the student.`,
          "success"
        );
        return res;
      } catch (err) {
        showToast(err.message || "Failed to mark as solved", "error");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [refreshBalanceAndTickets, showToast]
  );

  /**
   * Admin: Dismiss ticket -> Count is NOT reduced!
   */
  const dismissTicketAsAdmin = useCallback(
    async (ticketId, reason = "") => {
      setIsLoading(true);
      try {
        const res = await dismissDoubtTicket(ticketId, reason);
        refreshBalanceAndTickets();
        showToast(`Ticket #${ticketId} dismissed. Student count was NOT reduced.`, "warning");
        return res;
      } catch (err) {
        showToast(err.message || "Failed to dismiss ticket", "error");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [refreshBalanceAndTickets, showToast]
  );

  // Recharge doubt credits (₹50 per doubt)
  const rechargeAndLaunch = useCallback(
    async ({ credits = 1, amount = DOUBT_COST_INR, paymentMethod = "upi", paymentReference = null } = {}) => {
      if (!isAuthenticated || !currentUser?.id) {
        openAuthModal("login", "Please sign in to recharge doubts.");
        return;
      }

      setIsLoading(true);
      try {
        const result = await purchaseDoubtCredits(currentUser.id, {
          credits,
          amount,
          paymentMethod,
          paymentReference
        });

        refreshBalanceAndTickets();
        showToast(`🎉 Payment of ₹${amount} received! ${credits} doubt credit(s) added. Balance: ${result.doubtCredits} doubts.`, "success");

        // Immediately launch WhatsApp doubt request
        await submitAndLaunchWhatsApp();
      } catch (err) {
        showToast(err.message || "Payment processing failed", "error");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [isAuthenticated, currentUser, openAuthModal, refreshBalanceAndTickets, submitAndLaunchWhatsApp, showToast]
  );

  const value = {
    doubtCredits,
    doubtsUsed,
    pendingCount,
    freeDoubtsTotal,
    myTickets,
    isLoading,
    isDoubtModalOpen,
    activeDoubtContext,
    doubtToast,
    openDoubtModal,
    closeDoubtModal,
    submitAndLaunchWhatsApp,
    resolveTicketAsAdmin,
    dismissTicketAsAdmin,
    rechargeAndLaunch,
    refreshBalanceAndTickets,
    costPerDoubt: DOUBT_COST_INR,
    displayNumber: WHATSAPP_DISPLAY_NUMBER
  };

  return <DoubtContext.Provider value={value}>{children}</DoubtContext.Provider>;
}

export function useDoubt() {
  const context = useContext(DoubtContext);
  if (!context) {
    throw new Error("useDoubt must be used within a DoubtProvider");
  }
  return context;
}
