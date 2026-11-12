/**
 * doubtService.js
 * Client-side doubt management service with ticket lifecycle:
 * - Pending: Student asked on WhatsApp. Count is NOT reduced!
 * - Solved: Admin solves the issue. Count IS reduced by 1!
 * - Dismissed: Issue cancelled. Count is NOT reduced!
 */

import { apiClient } from "./apiClient.js";

const DEFAULT_FREE_DOUBTS = 10;
const DOUBT_COST_INR = 50;

function getStorageKeys(userId) {
  const safeId = userId || "guest";
  return {
    creditsKey: `py_doubt_credits_${safeId}`,
    purchasedKey: `py_doubt_purchased_${safeId}`,
    ticketsKey: `py_doubt_tickets`
  };
}

/**
 * Get all tickets from localStorage
 */
export function getLocalTickets(userId = null) {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("py_doubt_tickets");
    const tickets = raw ? JSON.parse(raw) : [];
    if (userId) {
      return tickets.filter((t) => t.user_id === userId);
    }
    return tickets;
  } catch {
    return [];
  }
}

/**
 * Save tickets to localStorage
 */
export function saveLocalTickets(tickets) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("py_doubt_tickets", JSON.stringify(tickets));
  } catch {}
}

/**
 * Calculate user balance based on: 10 free + purchased - solved
 * NOTE: PENDING TICKETS DO NOT REDUCE BALANCE!
 */
export function getLocalDoubtBalance(userId) {
  if (typeof window === "undefined") {
    return { doubtCredits: DEFAULT_FREE_DOUBTS, freeDoubtsTotal: DEFAULT_FREE_DOUBTS, doubtsUsed: 0, pendingCount: 0 };
  }
  const { purchasedKey } = getStorageKeys(userId);
  const purchased = parseInt(localStorage.getItem(purchasedKey) || "0", 10) || 0;

  const userTickets = getLocalTickets(userId);
  const solvedCount = userTickets.filter((t) => t.status === "solved").length;
  const pendingCount = userTickets.filter((t) => t.status === "pending").length;

  const totalAllowed = DEFAULT_FREE_DOUBTS + purchased;
  const doubtCredits = Math.max(0, totalAllowed - solvedCount);

  return {
    doubtCredits,
    freeDoubtsTotal: DEFAULT_FREE_DOUBTS,
    doubtsUsed: solvedCount,
    pendingCount
  };
}

/**
 * Fetch doubt balance from backend, falling back to local calculation
 */
export async function fetchDoubtBalance(userId) {
  const local = getLocalDoubtBalance(userId);
  try {
    const res = await apiClient.get("/doubts/balance");
    if (res.data?.doubtCredits !== undefined) {
      return res.data;
    }
  } catch {
    // offline/fallback
  }
  return local;
}

/**
 * Fetch user's tickets
 */
export async function fetchMyTickets(userId) {
  const local = getLocalTickets(userId);
  try {
    const res = await apiClient.get("/doubts/my-tickets");
    if (Array.isArray(res.data) && res.data.length > 0) {
      return res.data;
    }
  } catch {}
  return local;
}

/**
 * Submit a doubt request when user clicks WhatsApp.
 * CRITICAL RULE: Count is NOT reduced! Only creates a pending ticket.
 */
export async function submitDoubtRequest(userId, userDetails, contextData = {}) {
  const balance = getLocalDoubtBalance(userId);
  if (balance.doubtCredits <= 0) {
    throw new Error("No free doubts remaining. Recharge for ₹50 to ask a doubt.");
  }

  const ticketNumber = `DBT-${Math.floor(100000 + Math.random() * 900000)}`;
  const newTicket = {
    id: ticketNumber,
    ticket_number: ticketNumber,
    user_id: userId,
    student_name: userDetails?.name || userDetails?.username || "Student",
    student_email: userDetails?.email || "",
    section_number: contextData.sectionNumber || "",
    section_title: contextData.sectionTitle || "",
    lesson_name: contextData.lessonName || "",
    topic_number: contextData.topicNumber || "",
    step_name: contextData.stepName || "",
    question: contextData.question || contextData.customMessage || "",
    status: "pending",
    created_at: new Date().toISOString()
  };

  // Add to local tickets
  const allTickets = getLocalTickets();
  allTickets.unshift(newTicket);
  saveLocalTickets(allTickets);

  // Sync to backend if online
  try {
    await apiClient.post("/doubts/request", {
      ...contextData,
      ticketNumber
    });
  } catch {
    // Non-blocking
  }

  // Count remains the same!
  return {
    ticket: newTicket,
    doubtCredits: balance.doubtCredits,
    pendingCount: balance.pendingCount + 1
  };
}

/**
 * Admin solves the issue -> THIS IS WHEN COUNT REDUCES BY 1!
 */
export async function markDoubtAsSolved(ticketId, adminDetails = {}) {
  const allTickets = getLocalTickets();
  const ticketIndex = allTickets.findIndex((t) => t.id === ticketId || t.ticket_number === ticketId);
  let updatedTicket = null;

  if (ticketIndex !== -1) {
    if (allTickets[ticketIndex].status === "solved") {
      return { success: false, error: "Ticket is already solved" };
    }
    allTickets[ticketIndex] = {
      ...allTickets[ticketIndex],
      status: "solved",
      resolved_at: new Date().toISOString(),
      resolved_by: adminDetails.email || "Admin",
      resolution_notes: adminDetails.notes || "Solved on WhatsApp"
    };
    updatedTicket = allTickets[ticketIndex];
    saveLocalTickets(allTickets);
  }

  try {
    await apiClient.post(`/doubts/tickets/${ticketId}/solve`, {
      resolutionNotes: adminDetails.notes || "Solved on WhatsApp"
    });
  } catch {}

  const userBalance = updatedTicket ? getLocalDoubtBalance(updatedTicket.user_id) : null;
  return {
    success: true,
    ticket: updatedTicket,
    userRemainingCredits: userBalance?.doubtCredits
  };
}

/**
 * Admin dismisses / cancels ticket -> Count is NOT reduced!
 */
export async function dismissDoubtTicket(ticketId, reason = "") {
  const allTickets = getLocalTickets();
  const ticketIndex = allTickets.findIndex((t) => t.id === ticketId || t.ticket_number === ticketId);

  if (ticketIndex !== -1) {
    allTickets[ticketIndex] = {
      ...allTickets[ticketIndex],
      status: "dismissed",
      resolution_notes: reason || "Cancelled by admin without count reduction",
      updated_at: new Date().toISOString()
    };
    saveLocalTickets(allTickets);
  }

  try {
    await apiClient.post(`/doubts/tickets/${ticketId}/dismiss`, { reason });
  } catch {}

  return { success: true };
}

/**
 * Purchase doubt credits (₹50 per doubt)
 */
export async function purchaseDoubtCredits(userId, { credits = 1, amount = DOUBT_COST_INR, paymentMethod = "mock", paymentReference = null } = {}) {
  const { purchasedKey } = getStorageKeys(userId);
  const currentPurchased = parseInt(localStorage.getItem(purchasedKey) || "0", 10) || 0;
  const count = Math.max(1, parseInt(credits, 10) || 1);
  const newPurchased = currentPurchased + count;
  localStorage.setItem(purchasedKey, String(newPurchased));

  try {
    await apiClient.post("/doubts/purchase", {
      credits: count,
      amount,
      paymentMethod,
      paymentReference: paymentReference || `PAY_${Date.now()}`
    });
  } catch {}

  const balance = getLocalDoubtBalance(userId);
  return {
    ...balance,
    purchasedCredits: count
  };
}

export { DEFAULT_FREE_DOUBTS, DOUBT_COST_INR };
