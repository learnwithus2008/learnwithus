import React, { useState } from "react";
import {
  Users,
  Search,
  Filter,
  ShieldCheck,
  ShieldAlert,
  Award,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Zap,
  Lock,
  UserCheck,
  UserX,
  Trash2,
  Clock,
  BookOpen,
  Bookmark,
  Activity,
  X,
  PlusCircle,
  ExternalLink
} from "lucide-react";
import { adminService } from "../../services/adminService";
import { LEARNING_STAGES } from "../../data/learningStages";
import { LEARNING_LANGUAGES } from "../../data/learningLanguages";
import { allTopics } from "../../data/allTopics";

export default function StudentsManagerTab({
  users = [],
  totalUsers = 0,
  usersLoading = false,
  searchTerm,
  setSearchTerm,
  stageFilter,
  setStageFilter,
  roleFilter,
  setRoleFilter,
  statusFilter,
  setStatusFilter,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  page,
  setPage,
  limit = 25,
  onReloadUsers,
  showToast
}) {
  // Deep Dive Modal State
  const [inspectUserId, setInspectUserId] = useState(null);
  const [deepDiveData, setDeepDiveData] = useState(null);
  const [deepDiveLoading, setDeepDiveLoading] = useState(false);
  const [deepDiveTab, setDeepDiveTab] = useState("progress"); // "progress" | "activities" | "bookmarks" | "sessions"

  // Action Modals State
  const [bonusXpUser, setBonusXpUser] = useState(null);
  const [bonusAmount, setBonusAmount] = useState(50);
  const [bonusReason, setBonusReason] = useState("Outstanding lesson completion");
  const [actionLoading, setActionLoading] = useState(false);

  // Bulk & Purge All Users State
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [deleteAllScope, setDeleteAllScope] = useState("all"); // "all" | "students_only"
  const [confirmDeleteText, setConfirmDeleteText] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Load deep dive data
  const handleInspectUser = async (user) => {
    setInspectUserId(user.id);
    setDeepDiveData(null);
    setDeepDiveTab("progress");
    setDeepDiveLoading(true);

    try {
      const data = await adminService.getUserById(user.id);
      setDeepDiveData(data);
    } catch (err) {
      if (showToast) showToast(err.message || "Failed to load learner details", "error");
    } finally {
      setDeepDiveLoading(false);
    }
  };

  // Toggle user account status
  const handleToggleStatus = async (user) => {
    const newStatus = user.status === "active" ? "suspended" : "active";
    const confirmMsg =
      newStatus === "suspended"
        ? `Are you sure you want to suspend "${user.name}" (${user.email})? Active sessions will be revoked.`
        : `Reactivate account for "${user.name}"?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      await adminService.updateUserStatus(user.id, newStatus);
      if (showToast) showToast(`User status updated to ${newStatus}`, "success");
      onReloadUsers();
      if (inspectUserId === user.id) {
        handleInspectUser(user);
      }
    } catch (err) {
      if (showToast) showToast(err.message || "Status update failed", "error");
    }
  };

  // Toggle role (Student ↔ Admin)
  const handleToggleRole = async (user) => {
    const newRole = user.role === "admin" ? "student" : "admin";
    const confirmMsg =
      newRole === "admin"
        ? `Promote "${user.name}" to Administrator? They will have full administrative rights.`
        : `Revoke administrator access for "${user.name}"?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      await adminService.updateUserRole(user.id, newRole);
      if (showToast) showToast(`User role updated to ${newRole}`, "success");
      onReloadUsers();
    } catch (err) {
      if (showToast) showToast(err.message || "Role update failed", "error");
    }
  };

  // Award bonus XP
  const handleAwardBonusXp = async (e) => {
    e.preventDefault();
    if (!bonusXpUser) return;

    setActionLoading(true);
    try {
      await adminService.awardBonusXp(bonusXpUser.id, bonusAmount, bonusReason);
      if (showToast) showToast(`Awarded +${bonusAmount} XP to ${bonusXpUser.name}!`, "success");
      setBonusXpUser(null);
      onReloadUsers();
      if (inspectUserId === bonusXpUser.id) {
        handleInspectUser(bonusXpUser);
      }
    } catch (err) {
      if (showToast) showToast(err.message || "Bonus XP grant failed", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Delete User
  const handleDeleteUser = async (user) => {
    const confirmation = window.prompt(
      `Type the user's email (${user.email}) to confirm permanent deletion of their account and progress:`
    );
    if (confirmation !== user.email) {
      if (confirmation !== null) alert("Email mismatch. Deletion cancelled.");
      return;
    }

    try {
      await adminService.deleteUser(user.id);
      if (showToast) showToast(`User ${user.name} successfully deleted`, "success");
      setSelectedUserIds((prev) => prev.filter((id) => id !== user.id));
      onReloadUsers();
      if (inspectUserId === user.id) {
        setInspectUserId(null);
        setDeepDiveData(null);
      }
    } catch (err) {
      if (showToast) showToast(err.message || "Deletion failed", "error");
    }
  };

  // Delete All Users at One Time (Purge with Strong Authorization & Recovery Snapshot)
  const handleDeleteAllUsers = async (e) => {
    e.preventDefault();
    if (confirmDeleteText.trim() !== "DELETE ALL USERS") {
      alert('Please type "DELETE ALL USERS" exactly to confirm.');
      return;
    }

    if (!adminPassword.trim()) {
      alert("Administrator account password is required for verification.");
      return;
    }

    setIsDeletingAll(true);
    try {
      const res = await adminService.deleteAllUsers(deleteAllScope, confirmDeleteText.trim(), adminPassword);
      if (showToast) {
        showToast(res.message || `Deleted ${res.count || 0} user accounts. Recovery snapshot created.`, "success");
      }
      setShowDeleteAllModal(false);
      setConfirmDeleteText("");
      setAdminPassword("");
      setSelectedUserIds([]);
      onReloadUsers();
      if (inspectUserId) {
        setInspectUserId(null);
        setDeepDiveData(null);
      }
    } catch (err) {
      if (showToast) showToast(err.message || "Failed to delete users", "error");
    } finally {
      setIsDeletingAll(false);
    }
  };

  // Bulk Delete Selected Users
  const handleBulkDeleteSelected = async () => {
    if (selectedUserIds.length === 0) return;
    const confirmMsg = `Are you sure you want to permanently delete the ${selectedUserIds.length} selected user account(s)? All their progress and session data will be permanently removed.`;
    if (!window.confirm(confirmMsg)) return;

    setIsBulkDeleting(true);
    try {
      const res = await adminService.bulkDeleteUsers(selectedUserIds);
      if (showToast) {
        showToast(res.message || `Deleted ${res.count || 0} users.`, "success");
      }
      setSelectedUserIds([]);
      onReloadUsers();
      if (selectedUserIds.includes(inspectUserId)) {
        setInspectUserId(null);
        setDeepDiveData(null);
      }
    } catch (err) {
      if (showToast) showToast(err.message || "Bulk deletion failed", "error");
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const visibleUserIds = users.map((u) => u.id);
  const isAllVisibleSelected =
    visibleUserIds.length > 0 && visibleUserIds.every((id) => selectedUserIds.includes(id));

  const handleToggleSelectAll = () => {
    if (isAllVisibleSelected) {
      setSelectedUserIds((prev) => prev.filter((id) => !visibleUserIds.includes(id)));
    } else {
      setSelectedUserIds((prev) => Array.from(new Set([...prev, ...visibleUserIds])));
    }
  };

  const handleToggleSelectUser = (userId) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const totalPages = Math.ceil(totalUsers / limit) || 1;

  return (
    <div className="space-y-6">
      {/* 1. Filter and Search Controls */}
      <div className="bg-white dark:bg-[#0c182a] border border-slate-200/80 dark:border-[#182c47] rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search size={16} />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              placeholder="Search by student name or email..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#081220] border border-slate-200 dark:border-[#142338] text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Stage */}
            <select
              value={stageFilter}
              onChange={(e) => {
                setStageFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#081220] border border-slate-200 dark:border-[#142338] text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              <option value="all">All Stages</option>
              {LEARNING_STAGES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>

            {/* Role */}
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#081220] border border-slate-200 dark:border-[#142338] text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              <option value="all">All Roles</option>
              <option value="student">Students</option>
              <option value="admin">Administrators</option>
            </select>

            {/* Status */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#081220] border border-slate-200 dark:border-[#142338] text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>

            {/* Sort by */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#081220] border border-slate-200 dark:border-[#142338] text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              <option value="created_at">Joined Date</option>
              <option value="xp">Total XP</option>
              <option value="completed">Topics Completed</option>
              <option value="streak">Current Streak</option>
              <option value="name">Name</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. Students Table */}
      <div className="bg-white dark:bg-[#0c182a] border border-slate-200/80 dark:border-[#182c47] rounded-3xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200/80 dark:border-[#182c47] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-700 dark:text-slate-300">
              Registered Learners Directory ({totalUsers} total)
            </span>
            <span className="text-slate-400 font-mono">
              Page {page} of {totalPages}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {selectedUserIds.length > 0 && (
              <button
                onClick={handleBulkDeleteSelected}
                disabled={isBulkDeleting}
                style={{ backgroundColor: "#e11d48", color: "#ffffff" }}
                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer border-none disabled:opacity-50"
                title="Delete only checked users"
              >
                <Trash2 size={13} />
                <span>Delete Selected ({selectedUserIds.length})</span>
              </button>
            )}

            <button
              onClick={() => {
                setShowDeleteAllModal(true);
                setConfirmDeleteText("");
              }}
              className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-900/60 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
              title="Delete all users at once with one click"
            >
              <Trash2 size={13} />
              <span>Delete All Users (One-Time)</span>
            </button>
          </div>
        </div>

        {usersLoading ? (
          <div className="py-16 text-center text-xs text-slate-500 font-semibold animate-pulse">
            Querying PostgreSQL user repository...
          </div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500">
            No registered users match the applied search and filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200/80 dark:border-[#182c47] bg-slate-50/50 dark:bg-[#060e18]/40 text-slate-400 font-extrabold uppercase tracking-wider">
                  <th className="py-3 px-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={isAllVisibleSelected}
                      onChange={handleToggleSelectAll}
                      className="rounded border-slate-300 dark:border-[#1e3456] text-blue-600 focus:ring-blue-500 cursor-pointer"
                      title="Select / deselect all users on this page"
                    />
                  </th>
                  <th className="py-3 px-4">Learner</th>
                  <th className="py-3 px-3">Stage & Language</th>
                  <th className="py-3 px-3 text-center">Role</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3">Progress</th>
                  <th className="py-3 px-3 text-right">XP & Streak</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#142338]">
                {users.map((u) => {
                  const isChecked = selectedUserIds.includes(u.id);
                  const progressPct = Math.min(100, Math.round(((u.completed_topics_count || 0) / 198) * 100));

                  return (
                    <tr
                      key={u.id}
                      className={`hover:bg-slate-50/60 dark:hover:bg-[#102036] transition ${
                        isChecked ? "bg-rose-50/30 dark:bg-rose-950/20" : ""
                      }`}
                    >
                      {/* Selection Checkbox */}
                      <td className="py-3 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleSelectUser(u.id)}
                          className="rounded border-slate-300 dark:border-[#1e3456] text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>

                      {/* Name & Email (Privacy protected, NO passwords/tokens) */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs shrink-0">
                            {u.name?.charAt(0) || "U"}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 dark:text-white truncate">
                              {u.name}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono truncate">
                              {u.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Stage & Lang */}
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-700 dark:text-slate-300 capitalize">
                          {u.stage || "young"}
                        </div>
                        <div className="text-[10px] text-slate-400 capitalize">
                          {u.language || "english"}
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            u.role === "admin"
                              ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30"
                              : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30"
                          }`}
                        >
                          {u.role || "student"}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            u.status === "suspended"
                              ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                              : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                          }`}
                        >
                          {u.status || "active"}
                        </span>
                      </td>

                      {/* Progress */}
                      <td className="py-3 px-3">
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="font-bold font-mono text-slate-800 dark:text-slate-200">
                            {u.completed_topics_count || 0}/198
                          </span>
                          <span className="text-slate-400 font-mono text-[10px]">{progressPct}%</span>
                        </div>
                        <div className="w-24 h-1.5 rounded-full bg-slate-100 dark:bg-[#142338] overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600"
                            style={{ width: `${Math.max(4, progressPct)}%` }}
                          />
                        </div>
                      </td>

                      {/* XP & Streak */}
                      <td className="py-3 px-3 text-right">
                        <div className="font-black font-mono text-xs text-blue-600 dark:text-blue-400">
                          {u.total_xp || 0} XP
                        </div>
                        <div className="text-[10px] text-amber-500 font-semibold flex items-center justify-end gap-1">
                          <Flame size={11} />
                          <span>{u.current_streak || 0}d</span>
                        </div>
                      </td>

                      {/* Action buttons */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Inspect Deep Dive */}
                          <button
                            onClick={() => handleInspectUser(u)}
                            className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 transition cursor-pointer border border-blue-200 dark:border-blue-800/80"
                            title="Inspect learner progress records"
                          >
                            <Eye size={14} />
                          </button>

                          {/* Award XP */}
                          <button
                            onClick={() => {
                              setBonusXpUser(u);
                              setBonusAmount(50);
                              setBonusReason("Outstanding learning engagement");
                            }}
                            className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 text-amber-600 dark:text-amber-400 transition cursor-pointer border border-amber-200 dark:border-amber-800/80"
                            title="Award bonus XP"
                          >
                            <Zap size={14} />
                          </button>

                          {/* Suspend / Reactivate */}
                          <button
                            onClick={() => handleToggleStatus(u)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#102036] dark:hover:bg-[#162c4a] text-slate-600 dark:text-slate-300 transition cursor-pointer"
                            title={u.status === "active" ? "Suspend user account" : "Reactivate account"}
                          >
                            {u.status === "active" ? <UserX size={14} /> : <UserCheck size={14} />}
                          </button>

                          {/* Toggle Role */}
                          <button
                            onClick={() => handleToggleRole(u)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#102036] dark:hover:bg-[#162c4a] text-slate-600 dark:text-slate-300 transition cursor-pointer"
                            title={u.role === "admin" ? "Demote to student" : "Promote to administrator"}
                          >
                            {u.role === "admin" ? <ShieldAlert size={14} /> : <ShieldCheck size={14} />}
                          </button>

                          {/* Delete Account */}
                          <button
                            onClick={() => handleDeleteUser(u)}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 transition cursor-pointer border border-rose-200 dark:border-rose-900/60"
                            title="Delete student account permanently"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
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

      {/* 3. User Deep-Dive Modal */}
      {inspectUserId && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#0c182a] border border-slate-200 dark:border-[#1a3152] rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            {/* Header */}
            <div className="p-5 border-b border-slate-200/80 dark:border-[#182c47] flex items-center justify-between bg-slate-50/50 dark:bg-[#081220]/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm uppercase shadow-sm">
                  {deepDiveData?.user?.name?.charAt(0) || "U"}
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {deepDiveData?.user?.name || "Learner Profile"}
                  </h3>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                    {deepDiveData?.user?.email} • ID: {deepDiveData?.user?.id}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setInspectUserId(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Sub-tabs */}
            <div className="px-5 py-2.5 border-b border-slate-200/80 dark:border-[#182c47] bg-slate-100/60 dark:bg-[#060e18]/60 flex items-center gap-2">
              <button
                onClick={() => setDeepDiveTab("progress")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                  deepDiveTab === "progress"
                    ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                    : "bg-white dark:bg-[#0c182a] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-[#182c47]"
                }`}
              >
                Learning Progress ({deepDiveData?.learningProgress?.length || 0})
              </button>
              <button
                onClick={() => setDeepDiveTab("activities")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                  deepDiveTab === "activities"
                    ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                    : "bg-white dark:bg-[#0c182a] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-[#182c47]"
                }`}
              >
                Activity Timeline ({deepDiveData?.activities?.length || 0})
              </button>
              <button
                onClick={() => setDeepDiveTab("bookmarks")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                  deepDiveTab === "bookmarks"
                    ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                    : "bg-white dark:bg-[#0c182a] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-[#182c47]"
                }`}
              >
                Bookmarks ({deepDiveData?.bookmarks?.length || 0})
              </button>
              <button
                onClick={() => setDeepDiveTab("sessions")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                  deepDiveTab === "sessions"
                    ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                    : "bg-white dark:bg-[#0c182a] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-[#182c47]"
                }`}
              >
                Active Sessions ({deepDiveData?.sessions?.length || 0})
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {deepDiveLoading ? (
                <div className="py-12 text-center text-xs text-slate-500 font-semibold animate-pulse">
                  Loading PostgreSQL records...
                </div>
              ) : deepDiveTab === "progress" ? (
                <div className="space-y-2">
                  {(deepDiveData?.learningProgress || []).length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-500">
                      No topics completed yet.
                    </div>
                  ) : (
                    (deepDiveData?.learningProgress || []).map((prog, pIdx) => {
                      const topicObj = allTopics.find((t) => t.id === prog.topic_id);
                      return (
                        <div
                          key={pIdx}
                          className="p-3 rounded-2xl bg-slate-50 dark:bg-[#081220] border border-slate-200/60 dark:border-[#142338] text-xs flex items-center justify-between"
                        >
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">
                              {topicObj?.title || prog.topic_id}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                              Completed: {prog.completed_at ? new Date(prog.completed_at).toLocaleDateString() : "--"}
                            </div>
                          </div>
                          {prog.quiz_score !== null && (
                            <span className="px-2 py-1 rounded-lg font-mono font-bold text-xs bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              Quiz: {prog.quiz_score}%
                            </span>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              ) : deepDiveTab === "activities" ? (
                <div className="space-y-2">
                  {(deepDiveData?.activities || []).map((act) => (
                    <div
                      key={act.id}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-[#081220] border border-slate-200/60 dark:border-[#142338] text-xs flex items-center justify-between"
                    >
                      <div>
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {act.activity_type} • <span className="font-mono text-slate-400">{act.topic_id || "Platform"}</span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(act.created_at).toLocaleString()}
                        </div>
                      </div>
                      {act.xp_earned > 0 && (
                        <span className="font-mono font-bold text-amber-500">
                          +{act.xp_earned} XP
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : deepDiveTab === "bookmarks" ? (
                <div className="space-y-2">
                  {(deepDiveData?.bookmarks || []).map((b, bIdx) => (
                    <div
                      key={bIdx}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-[#081220] border border-slate-200/60 dark:border-[#142338] text-xs flex items-center justify-between"
                    >
                      <span className="font-bold font-mono text-slate-800 dark:text-slate-200">
                        {b.topic_id}
                      </span>
                      <span className="text-slate-400 text-[10px]">
                        Saved {new Date(b.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {(deepDiveData?.sessions || []).map((s) => (
                    <div
                      key={s.id}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-[#081220] border border-slate-200/60 dark:border-[#142338] text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[11px] font-bold text-slate-700 dark:text-slate-300">
                          IP: {s.ip_address || "127.0.0.1"}
                        </span>
                        <span
                          className={`px-2 py-0.2 rounded text-[10px] font-bold ${
                            s.revoked_at ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                          }`}
                        >
                          {s.revoked_at ? "Revoked" : "Active"}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {s.user_agent || "Browser session"}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200/80 dark:border-[#182c47] bg-slate-50/50 dark:bg-[#081220]/50 flex justify-end">
              <button
                onClick={() => setInspectUserId(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#102036] dark:hover:bg-[#183050] text-slate-700 dark:text-slate-200 font-bold text-xs cursor-pointer border-none"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Bonus XP Modal */}
      {bonusXpUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0c182a] border border-slate-200 dark:border-[#1a3152] rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
                <Zap size={20} />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Award Bonus XP
                </h3>
                <p className="text-xs text-slate-500">
                  Grant reward points to {bonusXpUser.name}
                </p>
              </div>
            </div>

            <form onSubmit={handleAwardBonusXp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  XP Amount
                </label>
                <input
                  type="number"
                  min="5"
                  max="1000"
                  step="5"
                  value={bonusAmount}
                  onChange={(e) => setBonusAmount(parseInt(e.target.value, 10) || 50)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#102036] border border-slate-200 dark:border-[#1a3152] text-xs font-mono font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Grant Reason (Logged in Audit History)
                </label>
                <input
                  type="text"
                  value={bonusReason}
                  onChange={(e) => setBonusReason(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#102036] border border-slate-200 dark:border-[#1a3152] text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setBonusXpUser(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md transition cursor-pointer border-none disabled:opacity-50"
                >
                  {actionLoading ? "Awarding..." : `Grant +${bonusAmount} XP`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Delete All Users One Time Modal */}
      {showDeleteAllModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0c182a] border border-rose-300 dark:border-rose-900/60 rounded-3xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-300 dark:border-rose-800/60 shrink-0">
                  <Trash2 size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      Delete All Users One Time
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                      Irreversible
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Purge user accounts and student progress data from PostgreSQL
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowDeleteAllModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#102038] cursor-pointer border-none bg-transparent"
              >
                <X size={18} />
              </button>
            </div>

            {/* Warning Callout */}
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-xs space-y-2 text-rose-900 dark:text-rose-200">
              <div className="flex items-center gap-2 font-bold text-rose-700 dark:text-rose-300">
                <AlertTriangle size={16} className="shrink-0" />
                <span>Careful: This operation deletes users in bulk</span>
              </div>
              <ul className="list-disc pl-5 space-y-1 text-[11px] text-rose-800 dark:text-rose-300/90">
                <li>Permanently removes learner accounts, password hashes, and profiles.</li>
                <li>Cascades and clears learning progress, quiz attempts, bookmarks, and sessions.</li>
                <li>
                  <strong>Safe Admin Protection:</strong> Your active administrator account is automatically preserved so you will not be locked out.
                </li>
              </ul>
            </div>

            {/* Scope selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Choose Deletion Scope
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <label
                  className={`p-3 rounded-2xl border cursor-pointer flex flex-col gap-1 transition ${
                    deleteAllScope === "all"
                      ? "border-rose-500 bg-rose-500/5 text-rose-900 dark:text-rose-100 font-bold"
                      : "border-slate-200 dark:border-[#182c47] text-slate-600 dark:text-slate-400"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="deleteAllScope"
                      value="all"
                      checked={deleteAllScope === "all"}
                      onChange={(e) => setDeleteAllScope(e.target.value)}
                      className="text-rose-600"
                    />
                    <span>All Users</span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-normal">
                    Deletes all users (preserves your active admin)
                  </span>
                </label>

                <label
                  className={`p-3 rounded-2xl border cursor-pointer flex flex-col gap-1 transition ${
                    deleteAllScope === "students_only"
                      ? "border-rose-500 bg-rose-500/5 text-rose-900 dark:text-rose-100 font-bold"
                      : "border-slate-200 dark:border-[#182c47] text-slate-600 dark:text-slate-400"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="deleteAllScope"
                      value="students_only"
                      checked={deleteAllScope === "students_only"}
                      onChange={(e) => setDeleteAllScope(e.target.value)}
                      className="text-rose-600"
                    />
                    <span>Students Only</span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-normal">
                    Deletes student accounts only (preserves all admins)
                  </span>
                </label>
              </div>
            </div>

            {/* Safety Notice & Recovery Strategy */}
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-xs space-y-1 text-amber-900 dark:text-amber-200">
              <div className="flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-300">
                <Lock size={14} className="shrink-0" />
                <span>Security Safeguards & Recovery Strategy</span>
              </div>
              <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-amber-800 dark:text-amber-300/90">
                <li><strong>Disabled by Default:</strong> Server environment requires <code className="font-mono">ENABLE_BULK_USER_PURGE=true</code>.</li>
                <li><strong>Strong Authorization:</strong> Re-verifies your administrator password against bcrypt hash.</li>
                <li><strong>Verified Recovery:</strong> Automatically creates a pre-purge snapshot in <code className="font-mono">server/backups/</code> prior to deletion.</li>
              </ul>
            </div>

            {/* Confirm Text and Password Form */}
            <form onSubmit={handleDeleteAllUsers} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  1. Type <span className="font-mono text-rose-600 dark:text-rose-400">DELETE ALL USERS</span> to confirm:
                </label>
                <input
                  type="text"
                  value={confirmDeleteText}
                  onChange={(e) => setConfirmDeleteText(e.target.value)}
                  placeholder="DELETE ALL USERS"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#102036] border border-slate-200 dark:border-[#182c47] text-xs font-mono font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  2. Administrator Account Password (Re-authentication required):
                </label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Enter administrator password..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#102036] border border-slate-200 dark:border-[#182c47] text-xs font-mono font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteAllModal(false);
                    setConfirmDeleteText("");
                    setAdminPassword("");
                  }}
                  disabled={isDeletingAll}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#102038] cursor-pointer border-none bg-transparent"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={confirmDeleteText.trim() !== "DELETE ALL USERS" || !adminPassword.trim() || isDeletingAll}
                  style={{
                    backgroundColor: confirmDeleteText.trim() === "DELETE ALL USERS" && adminPassword.trim() && !isDeletingAll ? "#dc2626" : "#fca5a5",
                    color: "#ffffff"
                  }}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white font-bold text-xs shadow-md transition cursor-pointer border-none flex items-center gap-2"
                >
                  {isDeletingAll ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Deleting All Users...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 size={14} />
                      <span>Authorize & Purge Users</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
