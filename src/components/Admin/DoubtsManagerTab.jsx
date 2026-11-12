import React, { useState, useEffect, useMemo } from "react";
import {
  MessageCircle,
  CheckCircle2,
  Hourglass,
  XCircle,
  Search,
  Filter,
  ExternalLink,
  ShieldCheck,
  User,
  BookOpen,
  Clock,
  Sparkles,
  AlertCircle
} from "lucide-react";
import { useDoubt } from "../../context/DoubtContext";
import { useAuth } from "../../context/AuthContext";
import { getLocalTickets, getLocalDoubtBalance } from "../../services/doubtService";
import { WhatsAppIcon } from "../AskDoubtButton";

export default function DoubtsManagerTab() {
  const { resolveTicketAsAdmin, dismissTicketAsAdmin, isLoading } = useDoubt();
  const { currentUser } = useAuth();

  const [tickets, setTickets] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all"); // 'all' | 'pending' | 'solved' | 'dismissed'
  const [searchTerm, setSearchTerm] = useState("");
  const [resolutionNotes, setResolutionNotes] = useState({});

  // Reload tickets
  const loadTickets = () => {
    const list = getLocalTickets();
    setTickets(list);
  };

  useEffect(() => {
    loadTickets();
  }, []);

  // Filtered & Searched Tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const matchStatus = filterStatus === "all" || t.status === filterStatus;
      const term = searchTerm.toLowerCase();
      const matchSearch =
        !term ||
        t.student_name?.toLowerCase().includes(term) ||
        t.student_email?.toLowerCase().includes(term) ||
        t.lesson_name?.toLowerCase().includes(term) ||
        t.section_title?.toLowerCase().includes(term) ||
        t.ticket_number?.toLowerCase().includes(term) ||
        t.question?.toLowerCase().includes(term);
      return matchStatus && matchSearch;
    });
  }, [tickets, filterStatus, searchTerm]);

  // Counts
  const totalCount = tickets.length;
  const pendingCount = tickets.filter((t) => t.status === "pending").length;
  const solvedCount = tickets.filter((t) => t.status === "solved").length;
  const dismissedCount = tickets.filter((t) => t.status === "dismissed").length;

  const handleSolve = async (ticket) => {
    const notes = resolutionNotes[ticket.id] || "Mentor resolved student doubt on WhatsApp";
    const confirmed = window.confirm(
      `Mark Doubt #${ticket.ticket_number} for ${ticket.student_name} as SOLVED?\n\nThis will officially deduct 1 doubt count from the student's balance.`
    );
    if (!confirmed) return;

    await resolveTicketAsAdmin(ticket.id, {
      email: currentUser?.email || "admin@example.com",
      notes
    });
    loadTickets();
  };

  const handleDismiss = async (ticket) => {
    const reason = window.prompt("Reason for dismissing ticket without count deduction:", "Issue invalid or cancelled by student");
    if (reason === null) return;

    await dismissTicketAsAdmin(ticket.id, reason);
    loadTickets();
  };

  return (
    <div className="space-y-6">
      {/* =================================================================== */}
      {/* 1. Header & Quick Summary Cards */}
      {/* =================================================================== */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <span
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white"
              style={{ backgroundColor: "#25D366" }}
            >
              <WhatsAppIcon size={18} />
            </span>
            <span>WhatsApp Doubt Mentorship</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Review incoming doubts, chat with learners, and solve issues to deduct doubt credits.
          </p>
        </div>

        <button
          onClick={loadTickets}
          className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition cursor-pointer border-none"
        >
          Refresh List
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Doubts</span>
            <MessageCircle size={16} className="text-blue-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
            {totalCount}
          </div>
          <div className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">Submitted by learners</div>
        </div>

        <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 shadow-xs">
          <div className="flex items-center justify-between text-amber-700 dark:text-amber-400 text-xs font-semibold">
            <span>Pending Mentorship</span>
            <Hourglass size={16} className="text-amber-500 animate-spin" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {pendingCount}
          </div>
          <div className="text-[10px] sm:text-[11px] text-amber-600/80 dark:text-amber-400/80 mt-0.5 font-medium">
            Count NOT deducted yet
          </div>
        </div>

        <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 shadow-xs">
          <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
            <span>Solved Issues</span>
            <CheckCircle2 size={16} className="text-emerald-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {solvedCount}
          </div>
          <div className="text-[10px] sm:text-[11px] text-emerald-600/80 dark:text-emerald-400/80 mt-0.5 font-medium">
            Count deducted from student
          </div>
        </div>

        <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Dismissed / Cancelled</span>
            <XCircle size={16} className="text-slate-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-700 dark:text-slate-300 mt-1">
            {dismissedCount}
          </div>
          <div className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">Zero deduction</div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 2. Filters & Search Bar */}
      {/* =================================================================== */}
      <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Status Filter Tabs */}
        <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 w-full sm:w-auto overflow-x-auto no-scrollbar">
          {[
            { id: "all", label: `All (${totalCount})` },
            { id: "pending", label: `Pending (${pendingCount})` },
            { id: "solved", label: `Solved (${solvedCount})` },
            { id: "dismissed", label: `Dismissed (${dismissedCount})` }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border-none shrink-0 whitespace-nowrap ${
                filterStatus === tab.id
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search student, topic, ticket..."
            className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* =================================================================== */}
      {/* 3. Doubt Tickets List */}
      {/* =================================================================== */}
      {filteredTickets.length === 0 ? (
        <div className="p-10 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <MessageCircle size={24} />
          </div>
          <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
            No Doubt Requests Found
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchTerm
              ? "No tickets match your search query."
              : "Whenever students click 'Ask Doubt on WhatsApp', their requests appear here."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTickets.map((ticket) => {
            const isPending = ticket.status === "pending";
            const isSolved = ticket.status === "solved";
            const isDismissed = ticket.status === "dismissed";
            const studentBalance = getLocalDoubtBalance(ticket.user_id);

            return (
              <div
                key={ticket.id || ticket.ticket_number}
                className="p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 hover:border-slate-300 dark:hover:border-slate-700 transition"
              >
                {/* Top Row: Ticket ID, Student, Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-2.5 sm:pb-3">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2.5 min-w-0">
                    <span className="font-mono text-xs font-black px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      #{ticket.ticket_number}
                    </span>
                    <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                      {ticket.student_name}
                    </span>
                    <span className="text-[11px] sm:text-xs text-slate-400 font-mono truncate">
                      ({ticket.student_email})
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500">
                      Balance: <strong className="text-emerald-600 dark:text-emerald-400">{studentBalance.doubtCredits} doubts left</strong>
                    </span>

                    {isPending && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-700 flex items-center gap-1">
                        <Hourglass size={11} className="animate-spin" />
                        <span>Pending Mentor Solution</span>
                      </span>
                    )}
                    {isSolved && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 flex items-center gap-1">
                        <CheckCircle2 size={11} />
                        <span>Solved (-1 Count Applied)</span>
                      </span>
                    )}
                    {isDismissed && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-300 dark:border-slate-700 flex items-center gap-1">
                        <XCircle size={11} />
                        <span>Dismissed (0 Deducted)</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Middle: Doubt Context & Question */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3 text-xs">
                  <div className="space-y-1 p-2.5 sm:p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <div className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Curriculum Location
                    </div>
                    <div className="font-bold text-slate-800 dark:text-slate-200">
                      {ticket.section_title ? `Section: ${ticket.section_title}` : "General Curriculum"}
                    </div>
                    <div className="text-slate-600 dark:text-slate-300">
                      Lesson: <strong>{ticket.lesson_name || "General Topic"}</strong>
                    </div>
                    {ticket.step_name && (
                      <div className="text-slate-500">
                        Step: {ticket.step_name}
                      </div>
                    )}
                    <div className="text-[10px] sm:text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                      <Clock size={11} />
                      <span>Submitted: {new Date(ticket.created_at).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="space-y-1 p-2.5 sm:p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <div className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Student's Specific Doubt / Inquiry
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed font-mono">
                      {ticket.question || "No extra question typed by student. Prefilled standard lesson inquiry was sent."}
                    </p>
                    {ticket.resolution_notes && (
                      <div className="pt-2 mt-2 border-t border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-medium">
                        Resolution: {ticket.resolution_notes}
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Actions Row */}
                {isPending && (
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2">
                    <div className="text-[11px] sm:text-xs text-slate-500 flex items-center gap-1.5">
                      <ShieldCheck size={14} className="text-amber-500 shrink-0" />
                      <span>
                        Student count is <strong>NOT</strong> reduced until you solve this issue!
                      </span>
                    </div>

                    <div className="flex flex-col xs:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => handleDismiss(ticket)}
                        disabled={isLoading}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer border border-slate-200 dark:border-slate-700 text-center"
                      >
                        Dismiss (0 Deducted)
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSolve(ticket)}
                        disabled={isLoading}
                        style={{ backgroundColor: "#25D366", color: "#FFFFFF", border: "none" }}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold shadow-xs hover:opacity-90 active:scale-95 transition cursor-pointer text-center"
                      >
                        <CheckCircle2 size={14} />
                        <span>Solve Issue & Deduct 1 Count</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

