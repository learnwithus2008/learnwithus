import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  LogOut
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { adminService } from "../services/adminService";

// Admin Sub-components
import AdminLogin from "../components/Admin/AdminLogin";
import AdminSidebar, { ADMIN_NAV_ITEMS } from "../components/Admin/AdminSidebar";
import AdminTopNav from "../components/Admin/AdminTopNav";
import AdminDashboardTab from "../components/Admin/AdminDashboardTab";
import DoubtsManagerTab from "../components/Admin/DoubtsManagerTab";
import CurriculumManagerTab from "../components/Admin/CurriculumManagerTab";
import QuizManagerTab from "../components/Admin/QuizManagerTab";
import ValidationReportsTab from "../components/Admin/ValidationReportsTab";
import StudentsManagerTab from "../components/Admin/StudentsManagerTab";
import ProjectsPracticeTab from "../components/Admin/ProjectsPracticeTab";
import LanguagesStagesTab from "../components/Admin/LanguagesStagesTab";
import ReportsExportsTab from "../components/Admin/ReportsExportsTab";
import AuditLogsTab from "../components/Admin/AuditLogsTab";

export default function Admin({ onNavigateHome, onNavigateTopic, onOpenAppPreview }) {
  const { currentUser, logout } = useAuth();

  // Active navigation tab
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Platform Overview State
  const [overview, setOverview] = useState(null);
  const [overviewLoading, setOverviewLoading] = useState(true);

  // Curriculum Overrides State
  const [curriculumOverrides, setCurriculumOverrides] = useState([]);

  // Students Directory State
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [usersLoading, setUsersLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("DESC");
  const [page, setPage] = useState(1);
  const limit = 25;

  // Toast Notification
  const [notification, setNotification] = useState(null);
  const showToast = useCallback((msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  }, []);

  // Fetch overview metrics
  const loadOverview = useCallback(async () => {
    setOverviewLoading(true);
    try {
      const data = await adminService.getOverview();
      setOverview(data);
    } catch (err) {
      showToast(err.message || "Failed to load platform overview", "error");
    } finally {
      setOverviewLoading(false);
    }
  }, [showToast]);

  // Fetch curriculum overrides
  const loadOverrides = useCallback(async () => {
    try {
      const list = await adminService.getCurriculumOverrides();
      setCurriculumOverrides(list);
    } catch {
      // ignore
    }
  }, []);

  // Fetch users list
  const loadUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const res = await adminService.getUsers({
        search: searchTerm,
        stage: stageFilter,
        role: roleFilter,
        status: statusFilter,
        sortBy,
        sortOrder,
        page,
        limit
      });
      setUsers(res.users);
      setTotalUsers(res.pagination.total || 0);
    } catch (err) {
      showToast(err.message || "Failed to load users", "error");
    } finally {
      setUsersLoading(false);
    }
  }, [searchTerm, stageFilter, roleFilter, statusFilter, sortBy, sortOrder, page, limit, showToast]);

  // Initial load
  useEffect(() => {
    if (currentUser?.role === "admin") {
      loadOverview();
      loadUsers();
      loadOverrides();
    }
  }, [currentUser?.role, loadOverview, loadUsers, loadOverrides]);

  // Active Tab Metadata
  const currentNav = useMemo(() => {
    return (
      ADMIN_NAV_ITEMS.find((item) => item.id === activeTab) || {
        id: "dashboard",
        label: "Admin Dashboard",
        description: "Real-time pedagogical metrics and platform health"
      }
    );
  }, [activeTab]);

  const activeTabDescriptions = {
    dashboard: "Platform KPI metrics, pass rates, student progress, weak topics, and live telemetry",
    curriculum: "Explore, edit, reorder, preview, and archive all 19 curriculum sections and 198 lessons",
    quizzes: "Inspect question bank, options, correct answer keys, hints, and explanations",
    validation: "Automated integrity audit across all 19 sections, 198 topics, 3,960 quizzes, and 23,760 questions",
    students: "Manage registered student accounts, inspect lesson history, award XP, and manage roles",
    projects: "Practice questions bank, guided projects portfolio, and XP milestone configuration",
    languages: "5 learning stages × 4 multilingual modes coverage matrix and side-by-side translation editor",
    reports: "Generate compliance reports, quiz audits, progress cohorts, and export to CSV or JSON",
    audit: "Security audit trail logging all administrative actions, timestamps, and target records"
  };

  // 1. Unauthenticated: Render dedicated Admin Portal Login
  if (!currentUser) {
    return (
      <AdminLogin
        onBackToHome={onNavigateHome}
        onSuccess={() => {
          loadOverview();
          loadUsers();
        }}
      />
    );
  }

  // 2. Authenticated as non-admin: Access Denied Guard
  if (currentUser.role !== "admin") {
    return (
      <div className="min-h-screen py-20 px-4 flex flex-col items-center justify-center bg-slate-50 dark:bg-[#070e17] text-slate-800 dark:text-slate-100">
        <div className="max-w-md w-full bg-white dark:bg-[#0d1829] border border-slate-200 dark:border-[#1e3452] rounded-3xl p-8 shadow-xl text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto border border-amber-200 dark:border-amber-800/50">
            <ShieldAlert size={36} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            Administrator Access Required
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            The Administrative Console is strictly restricted to authorized platform administrators. You are currently signed in as a student account (
            <span className="font-semibold text-slate-800 dark:text-slate-200">{currentUser.email}</span>).
          </p>

          <div className="pt-2 flex flex-col gap-2.5">
            <button
              onClick={onNavigateHome}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer border-none"
            >
              <ArrowLeft size={16} /> Return to Learning Home
            </button>
            <button
              onClick={async () => {
                await logout();
                if (typeof window !== "undefined") {
                  window.location.hash = "#/signin";
                }
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#102036] dark:hover:bg-[#162c4a] text-slate-700 dark:text-slate-300 font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut size={14} /> Sign Out & Switch Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. Authorized Admin: Render Responsive Operations Console
  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-[#070f1d] text-slate-900 dark:text-slate-100 transition-colors flex">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl border text-xs font-bold transition-all transform animate-in fade-in slide-in-from-top-4 ${
            notification.type === "error"
              ? "bg-rose-50 dark:bg-rose-950 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200"
              : "bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200"
          }`}
        >
          {notification.type === "error" ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
          <span>{notification.msg}</span>
        </div>
      )}

      {/* Responsive Left Navigation Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenAppPreview={onOpenAppPreview}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        totalUsers={overview?.metrics?.totalUsers || totalUsers}
        failedAuditCount={0}
      />

      {/* Main Content Area (Offset for Desktop Sidebar) */}
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0">
        {/* Top Command Navigation Header */}
        <AdminTopNav
          activeTabTitle={currentNav.label}
          activeTabDescription={activeTabDescriptions[activeTab]}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onRefresh={() => {
            loadOverview();
            loadUsers();
            loadOverrides();
          }}
          loading={overviewLoading || usersLoading}
          onOpenAppPreview={onOpenAppPreview}
          onQuickAudit={() => setActiveTab("validation")}
        />

        {/* Tab Page Container */}
        <main className="flex-1 p-3.5 sm:p-5 lg:p-6 max-w-7xl w-full mx-auto pb-20 sm:pb-24">
          {activeTab === "dashboard" && (
            <AdminDashboardTab
              overview={overview}
              overviewLoading={overviewLoading}
              onNavigateTab={setActiveTab}
              onInspectTopic={(topicId) => {
                setActiveTab("curriculum");
              }}
            />
          )}

          {activeTab === "doubts" && (
            <DoubtsManagerTab />
          )}

          {activeTab === "curriculum" && (
            <CurriculumManagerTab
              curriculumOverrides={curriculumOverrides}
              onRefreshOverrides={loadOverrides}
              onOpenAppPreview={onOpenAppPreview}
              onNavigateTopic={onNavigateTopic}
            />
          )}

          {activeTab === "quizzes" && (
            <QuizManagerTab
              curriculumOverrides={curriculumOverrides}
              onRefreshOverrides={loadOverrides}
              onNavigateValidation={() => setActiveTab("validation")}
            />
          )}

          {activeTab === "validation" && (
            <ValidationReportsTab
              curriculumOverrides={curriculumOverrides}
              onNavigateQuiz={() => setActiveTab("quizzes")}
            />
          )}

          {activeTab === "students" && (
            <StudentsManagerTab
              users={users}
              totalUsers={totalUsers}
              usersLoading={usersLoading}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              stageFilter={stageFilter}
              setStageFilter={setStageFilter}
              roleFilter={roleFilter}
              setRoleFilter={setRoleFilter}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              sortBy={sortBy}
              setSortBy={setSortBy}
              sortOrder={sortOrder}
              setSortOrder={setSortOrder}
              page={page}
              setPage={setPage}
              limit={limit}
              onReloadUsers={loadUsers}
              showToast={showToast}
            />
          )}

          {activeTab === "projects" && <ProjectsPracticeTab />}

          {activeTab === "languages" && (
            <LanguagesStagesTab
              curriculumOverrides={curriculumOverrides}
              onRefreshOverrides={loadOverrides}
            />
          )}

          {activeTab === "reports" && (
            <ReportsExportsTab
              overview={overview}
              users={users}
            />
          )}

          {activeTab === "audit" && <AuditLogsTab />}
        </main>
      </div>
    </div>
  );
}
