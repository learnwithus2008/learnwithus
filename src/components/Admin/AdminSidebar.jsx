import React from "react";
import {
  LayoutDashboard,
  MessageCircle,
  BookOpen,
  HelpCircle,
  CheckCircle2,
  Users,
  FolderGit2,
  Globe,
  FileSpreadsheet,
  ShieldAlert,
  ShieldCheck,
  Eye,
  LogOut,
  ChevronRight,
  Sparkles,
  Server,
  X,
  IndianRupee
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export const ADMIN_NAV_ITEMS = [
  { id: "dashboard", label: "Admin Dashboard", icon: LayoutDashboard, badge: "Live" },
  { id: "monetization", label: "Monetization & Payments", icon: IndianRupee, badge: "₹99/₹49" },
  { id: "doubts", label: "Doubts & WhatsApp", icon: MessageCircle, badge: "Mentorship" },
  { id: "curriculum", label: "Curriculum Manager", icon: BookOpen, count: 19 },
  { id: "quizzes", label: "Quiz Manager", icon: HelpCircle, count: 3960 },
  { id: "validation", label: "Validation Reports", icon: CheckCircle2, badge: "Audit" },
  { id: "students", label: "Student Management", icon: Users },
  { id: "projects", label: "Projects & Practice", icon: FolderGit2 },
  { id: "languages", label: "Languages & Stages", icon: Globe, count: "5×4" },
  { id: "reports", label: "Reports & Exports", icon: FileSpreadsheet, badge: "CSV/JSON" },
  { id: "audit", label: "Security & Audit Logs", icon: ShieldAlert }
];

export default function AdminSidebar({
  activeTab,
  onSelectTab,
  onOpenAppPreview,
  isOpenMobile,
  onCloseMobile,
  totalUsers = 0,
  failedAuditCount = 0
}) {
  const { currentUser, logout } = useAuth();

  // Lock body scroll when mobile sidebar drawer is open
  React.useEffect(() => {
    if (isOpenMobile) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpenMobile]);

  // Close drawer on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpenMobile && onCloseMobile) {
        onCloseMobile();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpenMobile, onCloseMobile]);

  const handleSignOut = async () => {
    if (window.confirm("Sign out of Administrator Session?")) {
      await logout();
      if (typeof window !== "undefined") {
        window.location.hash = "#/signin";
      }
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          aria-hidden="true"
        />
      )}
      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-72 bg-white dark:bg-[#081220] border-r border-slate-200/90 dark:border-[#142338] z-50 flex flex-col overflow-y-auto overscroll-contain scrollbar-thin transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
        style={{
          height: "100%",
          maxHeight: "100dvh",
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
          overscrollBehavior: "contain"
        }}
        aria-label="Admin Navigation Sidebar"
      >
        {/* Top Header & Branding */}
        <div className="p-5 border-b border-slate-200/80 dark:border-[#142338] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0756A5] text-white flex items-center justify-center shadow-md shadow-blue-500/25 border border-white/20 shrink-0">
              <ShieldCheck size={22} strokeWidth={2.4} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display text-sm font-black tracking-tight">
                  <span className="text-[#FFB800]">Learn</span> <span className="text-[#0756A5] dark:text-[#60A5FA]">With Us</span>
                </span>
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Operations Console
              </span>
            </div>
          </div>

          {/* Mobile close button */}
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#102038] cursor-pointer shrink-0"
            aria-label="Close Navigation Sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Telemetry pill */}
        <div className="px-5 py-3 border-b border-slate-100 dark:border-[#101e30] bg-slate-50/50 dark:bg-[#060e18]/40 flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-400 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>PostgreSQL Live</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold">
            v1.0 • Verified
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1 shrink-0">
          {ADMIN_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer border-none text-left ${
                  isActive
                    ? "bg-[#0756A5] text-white shadow-md shadow-blue-500/25"
                    : "text-slate-600 dark:text-slate-400 hover:text-[#0756A5] dark:hover:text-white hover:bg-[#F3F7FC] dark:hover:bg-[#102036]"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon size={17} className={isActive ? "text-white" : "text-slate-400 dark:text-slate-500"} />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-[#F3F7FC] dark:bg-blue-950/60 text-[#0756A5] dark:text-blue-400 border border-[#E2E8F0] dark:border-blue-900"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}

                {item.id === "students" && totalUsers > 0 && (
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 dark:bg-[#14233a] text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    {totalUsers}
                  </span>
                )}

                {item.id === "validation" && failedAuditCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500 text-white">
                    {failedAuditCount} err
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer Area: Learner Preview & User Profile */}
        <div className="p-3 border-t border-slate-200/80 dark:border-[#142338] bg-slate-50/50 dark:bg-[#07111e]/50 space-y-2 mt-auto shrink-0 pb-6">
          {/* Preview as Learner */}
          <button
            onClick={onOpenAppPreview}
            className="w-full py-2.5 px-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 text-xs font-bold transition flex items-center justify-between cursor-pointer"
            title="Switch to student-facing view while retaining admin session"
          >
            <div className="flex items-center gap-2">
              <Eye size={15} className="text-indigo-500" />
              <span>Preview as Student</span>
            </div>
            <ChevronRight size={14} className="opacity-70" />
          </button>

          {/* Current Admin Account Profile */}
          <div className="p-2.5 rounded-xl bg-white dark:bg-[#0c182a] border border-slate-200/80 dark:border-[#182c47] flex items-center justify-between gap-2 shadow-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs shrink-0">
                {currentUser?.name?.charAt(0) || "A"}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {currentUser?.name || "Administrator"}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  {currentUser?.email || "admin@example.com"}
                </div>
              </div>
            </div>

            <button
              onClick={handleSignOut}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
              title="Sign Out of Administrator Console"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
