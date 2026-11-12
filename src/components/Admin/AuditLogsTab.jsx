import React, { useState, useEffect, useCallback } from "react";
import {
  ShieldAlert,
  Search,
  Filter,
  RefreshCw,
  Clock,
  User,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Zap,
  BookOpen,
  HelpCircle,
  Trash2,
  Lock
} from "lucide-react";
import { adminService } from "../../services/adminService";

export default function AuditLogsTab() {
  const [logs, setLogs] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const limit = 25;

  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminService.getAuditLogs({
        page,
        limit,
        action: actionFilter,
        search: searchQuery
      });
      setLogs(res.logs || []);
      setTotalCount(res.pagination?.total || 0);
    } catch (err) {
      console.error("Failed to load audit logs:", err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, actionFilter, searchQuery]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const totalPages = Math.ceil(totalCount / limit) || 1;

  const getActionColor = (act) => {
    if (act.includes("DELETE")) return "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400 border-rose-200 dark:border-rose-900";
    if (act.includes("SUSPEND")) return "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 border-amber-200 dark:border-amber-900";
    if (act.includes("AWARD")) return "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 border-amber-200 dark:border-amber-900";
    if (act.includes("ROLE")) return "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400 border-purple-200 dark:border-purple-900";
    if (act.includes("CURRICULUM") || act.includes("SAVE")) return "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400 border-blue-200 dark:border-blue-900";
    return "bg-slate-100 text-slate-700 dark:bg-[#142338] dark:text-slate-300 border-slate-200 dark:border-[#182c47]";
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Search Dock */}
      <div className="bg-white dark:bg-[#0c182a] border border-slate-200/80 dark:border-[#182c47] rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-500/20">
              <ShieldAlert size={20} />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Administrator Audit Trail & Security Logs
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Immutable records of sensitive administrative actions, user changes, and content mutations
              </p>
            </div>
          </div>

          <button
            onClick={loadLogs}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#102036] dark:hover:bg-[#183050] text-slate-700 dark:text-slate-200 text-xs font-bold transition cursor-pointer"
          >
            <RefreshCw size={13} className={loading ? "animate-spin text-blue-500" : ""} />
            <span>Refresh Logs</span>
          </button>
        </div>

        {/* Filter row */}
        <div className="pt-3 border-t border-slate-100 dark:border-[#142338] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search size={15} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search by admin name, email, target ID, action..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-[#081220] border border-slate-200 dark:border-[#142338] text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
            />
          </div>

          <select
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-[#081220] border border-slate-200 dark:border-[#142338] text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer"
          >
            <option value="all">All Action Types</option>
            <option value="UPDATE_USER_STATUS">User Status (Suspend/Active)</option>
            <option value="UPDATE_USER_ROLE">User Role Changes</option>
            <option value="AWARD_BONUS_XP">Bonus XP Awards</option>
            <option value="DELETE_USER">User Deletion</option>
            <option value="SAVE_CURRICULUM_ITEM">Curriculum Overrides</option>
            <option value="RUN_QUIZ_AUDIT">Quiz Audits Run</option>
          </select>
        </div>
      </div>

      {/* 2. Audit Logs Table */}
      <div className="bg-white dark:bg-[#0c182a] border border-slate-200/80 dark:border-[#182c47] rounded-3xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200/80 dark:border-[#182c47] flex items-center justify-between text-xs">
          <span className="font-bold text-slate-700 dark:text-slate-300">
            Recorded Audit Events ({totalCount} total)
          </span>
          <span className="text-slate-400 font-mono">
            Page {page} of {totalPages}
          </span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-xs text-slate-500 font-semibold animate-pulse">
            Loading PostgreSQL audit logs...
          </div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500">
            No administrative audit events recorded matching your query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200/80 dark:border-[#182c47] bg-slate-50/50 dark:bg-[#060e18]/40 text-slate-400 font-extrabold uppercase tracking-wider">
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Administrator</th>
                  <th className="py-2.5 px-3">Action</th>
                  <th className="py-2.5 px-3">Target</th>
                  <th className="py-2.5 px-3">Event Details</th>
                  <th className="py-2.5 px-3 text-right">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#142338]">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 dark:hover:bg-[#102036] transition">
                    <td className="py-2.5 px-3 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                      <div>{log.admin_name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{log.admin_email}</div>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider border ${getActionColor(
                          log.action
                        )}`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      <span className="font-bold">{log.target_type}</span>: {log.target_id || "--"}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[10px] text-slate-500 max-w-xs truncate">
                      {typeof log.details === "object" ? JSON.stringify(log.details) : String(log.details || "{}")}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-[10px] text-slate-400">
                      {log.ip_address || "127.0.0.1"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="p-4 border-t border-slate-200/80 dark:border-[#182c47] flex items-center justify-between text-xs">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#102036] text-slate-700 dark:text-slate-200 disabled:opacity-40 cursor-pointer"
          >
            Previous
          </button>
          <span className="font-semibold text-slate-500">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#102036] text-slate-700 dark:text-slate-200 disabled:opacity-40 cursor-pointer"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
