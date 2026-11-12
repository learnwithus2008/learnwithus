import React, { useState, useRef, useEffect } from "react";
import {
  BookOpen,
  Code,
  Terminal,
  FolderGit2,
  Info,
  ChevronDown,
  Sun,
  Moon,
  User,
  LogIn,
  Sparkles,
  Bookmark,
  CheckCircle,
  LogOut,
  Flame,
  Settings,
  ArrowLeft,
  Check,
  Globe,
  ChevronRight,
  Compass,
  ShieldCheck,
  Eye,
  Mail
} from "lucide-react";
import { LEARNING_STAGES, getStageById } from "../data/learningStages";
import { LEARNING_LANGUAGES, getLanguageById } from "../data/learningLanguages";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useDoubt } from "../context/DoubtContext";
import { useGuideTutorial } from "../context/GuideTutorialContext";
import { AVATAR_OPTIONS } from "../services/authService";
import { WhatsAppIcon } from "./AskDoubtButton";
import FontSizeControl from "./FontSizeControl";
import BrandLogo from "./BrandLogo";

export default function Navbar({
  currentPage,
  setCurrentPage,
  onSelectTopic,
  selectedStage,
  onSelectStage,
  onOpenStageModal,
  selectedLanguage = "english",
  onSelectLanguage,
  onOpenLanguageModal,
  onBack,
  canGoBack,
  appPreviewMode = false,
  onToggleAppPreview,
  onReturnToAdmin
}) {
  const { theme, toggleTheme, isDark } = useTheme();
  const { currentUser, isAuthenticated, openAuthModal, logout } = useAuth();
  const { doubtCredits, freeDoubtsTotal, openDoubtModal } = useDoubt();
  const { startTour, openWelcomeModal, openExplorer } = useGuideTutorial();

  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [stageDropdownOpen, setStageDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const userMenuRef = useRef(null);
  const stageMenuRef = useRef(null);
  const langMenuRef = useRef(null);

  const stageMeta = getStageById(selectedStage);
  const langMeta = getLanguageById(selectedLanguage);
  const stageShortLabel = stageMeta.id === "professional" ? "Job" : stageMeta.label;
  const langShortLabel = langMeta.id === "english-telugu" ? "Telugu" : langMeta.shortLabel;

  const navItems = [
    {
      id: "home",
      label: "Home",
      icon: Terminal,
      desc: "Home: Learning headquarters, stage/language settings & featured lessons"
    },
    {
      id: "learn",
      label: "Learn",
      icon: BookOpen,
      desc: "Learn: 19 curriculum sections with 120 interactive topics & keyword search"
    },
    {
      id: "practice",
      label: "Practice",
      icon: Code,
      desc: "Practice: Interactive quizzes, output predictions & coding challenges"
    },
    {
      id: "projects",
      label: "Projects",
      icon: FolderGit2,
      desc: "Projects: Real-world Python applications with full source code"
    },
    {
      id: "about",
      label: "About",
      icon: Info,
      desc: "About: Learning philosophy and age-adaptive education guides"
    },
    {
      id: "contact",
      label: "Contact",
      icon: Mail,
      desc: "Contact: Student support, doubt assistance, and direct inquiries"
    },
    ...(currentUser?.role === "admin"
      ? [
          {
            id: "admin",
            label: "Admin",
            icon: ShieldCheck,
            desc: "Admin Console: Monitor platform metrics, telemetry & user status"
          }
        ]
      : [])
  ];

  const handleNavClick = (pageId) => {
    setCurrentPage(pageId);
    setUserDropdownOpen(false);
    setStageDropdownOpen(false);
    setLangDropdownOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
      if (stageMenuRef.current && !stageMenuRef.current.contains(e.target)) {
        setStageDropdownOpen(false);
      }
      if (langMenuRef.current && !langMenuRef.current.contains(e.target)) {
        setLangDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const userAvatarMeta = AVATAR_OPTIONS.find(
    (a) => a.id === currentUser?.avatar
  ) || AVATAR_OPTIONS[0];

  const isAdmin = currentUser?.role === "admin";
  const showAdminOnlyMode = false; // Admin panel has dedicated standalone AdminTopNav & AdminSidebar

  return (
    <header className="app-header">
      <div className="app-navbar-container">
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 min-w-0">
          <button
            id="tour-nav-brand"
            onClick={() => handleNavClick(showAdminOnlyMode ? "admin" : "home")}
            className="navbar-brand-btn group p-0.5 sm:p-1"
            title="Learn with us"
            aria-label="Learn with us Home"
          >
            <BrandLogo variant="nav" size="md" showTagline={false} />
          </button>
        </div>

        {/* Center: Segmented Navigation Dock (Desktop >= 1024px) */}
        <div className="navbar-desktop-menu items-center justify-center shrink-0">
          {showAdminOnlyMode ? (
            <div className="flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-100 dark:bg-[#0c182a] border border-slate-200 dark:border-[#1e3452] shadow-xs text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-slate-500 dark:text-slate-400 font-medium">Database:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">PostgreSQL Live</span>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <span className="text-slate-500 dark:text-slate-400 font-medium">Telemetry:</span>
              <span className="text-blue-600 dark:text-blue-400 font-mono font-bold">Connected</span>
            </div>
          ) : (
            <nav id="tour-nav-dock" className="navbar-nav-dock">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  currentPage === item.id ||
                  (item.id === "learn" && currentPage === "lesson");
                const isSecondary = item.id === "about" || item.id === "contact";
                return (
                  <button
                    key={item.id}
                    id={`tour-nav-item-${item.id}`}
                    onClick={() => handleNavClick(item.id)}
                    className={`navbar-nav-item ${isActive ? "active" : ""}`}
                    title={item.desc}
                  >
                    {isActive && <span className="navbar-nav-active-dot" />}
                    <Icon size={15} strokeWidth={isActive ? 2.4 : 2.1} className={isActive ? "text-[#0756A5] dark:text-[#FFB800]" : "text-[#0756A5] dark:text-white group-hover:text-[#064681] dark:group-hover:text-[#FFB800]"} />
                    <span className={isSecondary ? "hidden min-[1340px]:inline" : ""}>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          )}
        </div>

        {/* Right: Controls & Preferences (Desktop >= 1024px) */}
        <div className="navbar-desktop-menu items-center gap-1.5 xl:gap-2 shrink-0">
          {/* Admin Mode Controls: App Preview Toggle or Return to Admin */}
          {showAdminOnlyMode && (
            <button
              id="admin-btn-app-preview"
              onClick={onToggleAppPreview}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-md shadow-blue-500/25 border border-blue-400/30 transition-all duration-200 active:scale-95 cursor-pointer group"
              title="Preview the full application as a learner"
            >
              <Eye size={15} className="group-hover:scale-110 transition-transform text-white" />
              <span>App Preview</span>
              <span className="px-1.5 py-0.5 rounded bg-blue-800/60 text-[10px] font-mono tracking-tight text-blue-100">Test</span>
            </button>
          )}

          {isAdmin && appPreviewMode && (
            <button
              id="admin-return-from-preview"
              onClick={onReturnToAdmin}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-sm transition cursor-pointer border border-indigo-400/40 active:scale-95 shrink-0"
              title="Exit App Preview & Return to Admin Console"
            >
              <ShieldCheck size={14} />
              <span className="hidden xl:inline">Return to Admin</span>
            </button>
          )}

          {!showAdminOnlyMode && (
            <>
              {/* 1. Context Capsule (Stage + Language Switcher) */}
              <div id="tour-nav-capsule" className="navbar-context-capsule">
                {/* Learning Stage Dropdown Trigger */}
                <div className="relative shrink-0" ref={stageMenuRef}>
                  <button
                    id="tour-nav-stage"
                    onClick={() => {
                      setStageDropdownOpen(!stageDropdownOpen);
                      setLangDropdownOpen(false);
                      setUserDropdownOpen(false);
                    }}
                    className={`navbar-capsule-btn ${stageDropdownOpen ? "open-stage" : ""}`}
                    title={`Learning Stage: ${stageMeta.label}`}
                    aria-expanded={stageDropdownOpen}
                    aria-haspopup="true"
                  >
                    <span className="text-sm select-none shrink-0">{stageMeta.icon}</span>
                    <span className="navbar-capsule-text truncate hidden min-[1380px]:inline max-w-[70px] xxl:max-w-[125px]">
                      {stageShortLabel}
                    </span>
                    <ChevronDown
                      size={12}
                      className={`text-[#0756A5] dark:text-white transition-transform shrink-0 ${
                        stageDropdownOpen ? "rotate-180 text-[#0756A5]" : ""
                      }`}
                    />
                  </button>

                  {/* Stage Quick Switch Dropdown */}
                  {stageDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white dark:bg-[#101b2d] border border-slate-200 dark:border-[#23344d] shadow-2xl p-2 z-50 animate-in">
                      <div className="px-2.5 py-1.5 mb-1.5 border-b border-slate-100 dark:border-[#23344d] flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Learning Stage (Age)
                        </span>
                        <span className="text-[11px] font-bold text-blue-600 dark:text-[#60a5fa]">
                          {stageMeta.label}
                        </span>
                      </div>

                      <div className="space-y-1">
                        {LEARNING_STAGES.map((stg) => {
                          const isSelected = selectedStage === stg.id;
                          return (
                            <button
                              key={stg.id}
                              onClick={() => {
                                if (onSelectStage) onSelectStage(stg.id);
                                setStageDropdownOpen(false);
                              }}
                              className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition cursor-pointer border ${
                                isSelected
                                  ? "bg-[#FFFBEB] dark:bg-[#153560] border-[#FFB800] text-[#102B50] dark:text-white font-bold"
                                  : "bg-transparent hover:bg-[#FFB800] border-transparent hover:border-[#FFB800] text-[#102B50] dark:text-slate-200 hover:text-[#102B50] dark:hover:text-[#102B50]"
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="text-xl shrink-0 select-none">{stg.icon}</span>
                                <div className="min-w-0">
                                  <div className="text-xs font-bold leading-tight truncate">
                                    {stg.label}
                                  </div>
                                  <div className="text-[10px] text-[#64748B] dark:text-slate-400 leading-tight truncate">
                                    {stg.ageRange} • {stg.shortDesc.slice(0, 30)}...
                                  </div>
                                </div>
                              </div>
                              {isSelected && (
                                <div className="w-5 h-5 rounded-full bg-[#FFB800] text-[#102B50] flex items-center justify-center shrink-0 ml-1.5 font-bold">
                                  <Check size={12} strokeWidth={3} />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      <div className="pt-1.5 mt-1 border-t border-[#E2E8F0] dark:border-[#1E3A5F]">
                        <button
                          onClick={() => {
                            setStageDropdownOpen(false);
                            if (onOpenStageModal) onOpenStageModal();
                          }}
                          className="w-full py-1.5 px-2 text-[11px] font-bold text-center text-[#0756A5] dark:text-[#FFB800] hover:underline cursor-pointer bg-transparent border-none"
                        >
                          View All Stage Details & Cards →
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="navbar-capsule-divider" />

                {/* Language Dropdown Trigger */}
                <div className="relative shrink-0" ref={langMenuRef}>
                  <button
                    id="tour-nav-lang"
                    onClick={() => {
                      setLangDropdownOpen(!langDropdownOpen);
                      setStageDropdownOpen(false);
                      setUserDropdownOpen(false);
                    }}
                    className={`navbar-capsule-btn ${langDropdownOpen ? "open-lang" : ""}`}
                    title={`Language: ${langMeta.label}`}
                    aria-expanded={langDropdownOpen}
                    aria-haspopup="true"
                  >
                    <span className="text-sm select-none shrink-0">{langMeta.icon}</span>
                    <span className="navbar-capsule-text truncate hidden min-[1380px]:inline max-w-[65px] xxl:max-w-[110px]">
                      {langShortLabel}
                    </span>
                    <ChevronDown
                      size={12}
                      className={`text-[#0756A5] dark:text-white transition-transform shrink-0 ${
                        langDropdownOpen ? "rotate-180 text-[#0756A5]" : ""
                      }`}
                    />
                  </button>

                  {/* Language Quick Switch Dropdown */}
                  {langDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white dark:bg-[#101b2d] border border-slate-200 dark:border-[#23344d] shadow-2xl p-2 z-50 animate-in">
                      <div className="px-2.5 py-1.5 mb-1.5 border-b border-slate-100 dark:border-[#23344d] flex items-center justify-between">
                        <div className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#102B50] dark:text-slate-300">
                          <Globe size={13} className="text-[#0756A5] dark:text-[#38bdf8]" />
                          <span>Learning Language</span>
                        </div>
                        <span className="text-[11px] font-bold text-blue-600 dark:text-[#38bdf8]">
                          {langMeta.shortLabel}
                        </span>
                      </div>

                      <div className="space-y-1">
                        {LEARNING_LANGUAGES.map((lang) => {
                          const isSelected = selectedLanguage === lang.id;
                          return (
                            <button
                              key={lang.id}
                              onClick={() => {
                                if (onSelectLanguage) onSelectLanguage(lang.id);
                                setLangDropdownOpen(false);
                              }}
                              className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition cursor-pointer border ${
                                isSelected
                                  ? "bg-[#FFFBEB] dark:bg-[#153560] border-[#FFB800] text-[#102B50] dark:text-white font-bold"
                                  : "bg-transparent hover:bg-[#FFB800] border-transparent hover:border-[#FFB800] text-[#102B50] dark:text-slate-200 hover:text-[#102B50] dark:hover:text-[#102B50]"
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="text-xl shrink-0 select-none">{lang.icon}</span>
                                <div className="min-w-0">
                                  <div className="text-xs font-bold leading-tight truncate">
                                    {lang.label}
                                  </div>
                                  <div className="text-[10px] text-[#64748B] dark:text-slate-400 leading-tight truncate">
                                    {lang.shortLabel} • {lang.description.slice(0, 36)}...
                                  </div>
                                </div>
                              </div>
                              {isSelected && (
                                <div className="w-5 h-5 rounded-full bg-[#FFB800] text-[#102B50] flex items-center justify-center shrink-0 ml-1.5 font-bold">
                                  <Check size={12} strokeWidth={3} />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      <div className="pt-1.5 mt-1 border-t border-[#E2E8F0] dark:border-[#1E3A5F]">
                        <button
                          onClick={() => {
                            setLangDropdownOpen(false);
                            if (onOpenLanguageModal) onOpenLanguageModal();
                          }}
                          className="w-full py-1.5 px-2 text-[11px] font-bold text-center text-[#0756A5] dark:text-[#FFB800] hover:underline cursor-pointer bg-transparent border-none"
                        >
                          View Full Multi-Language Guide →
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 2. Quick Tools: Explore App (Search all pages & guided tour) */}
              <div id="tour-nav-tools" className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                <button
                  id="tour-btn-explore-app"
                  onClick={() => openExplorer("all")}
                  className="navbar-tool-btn navbar-btn-explore group relative"
                  title="Explore App: Search all pages, features & take interactive tour"
                  aria-label="Explore App"
                >
                  <Compass size={15} className="text-[#0756A5] dark:text-[#FFB800] shrink-0 group-hover:rotate-45 transition-transform" />
                  <span className="font-extrabold text-[#0756A5] dark:text-[#FFB800] navbar-btn-explore-label">
                    <span className="navbar-btn-explore-text-short hidden min-[1380px]:inline xxl:hidden">Explore</span>
                    <span className="navbar-btn-explore-text-full hidden xxl:inline">Explore App</span>
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse inline-block" />
                </button>
              </div>
            </>
          )}

          {/* 3. Font Size Controls (Increase / Decrease & Darker Text) */}
          <FontSizeControl variant="navbar" />

          {/* 4. Theme Toggle */}
          <button
            id="tour-nav-theme"
            onClick={toggleTheme}
            className="navbar-icon-btn"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle Theme"
          >
            {isDark ? <Sun size={17} className="text-[#FFB800]" /> : <Moon size={17} className="text-[#102B50]" />}
          </button>

          {/* 5. User Profile or Auth Buttons */}
          <div id="tour-nav-auth" className="relative shrink-0" ref={userMenuRef}>
            {isAuthenticated && currentUser ? (
              <>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="navbar-user-btn shrink-0"
                  title="Your Learning Profile & Settings"
                  aria-expanded={userDropdownOpen}
                >
                  <div className="navbar-user-avatar">
                    {userAvatarMeta.emoji}
                  </div>
                  <span className="navbar-user-name truncate max-w-[65px] lg:max-w-[85px] xxl:max-w-[120px]">
                    {currentUser.name.split(" ")[0]}
                  </span>
                  <div className="navbar-user-xp hidden sm:flex">
                    <Sparkles size={9} className="text-[#0756A5] dark:text-cyan-400 shrink-0" />
                    <span>{currentUser.stats?.xp || 0}</span>
                  </div>
                  <ChevronDown
                    size={12}
                    className={`text-[#0756A5] dark:text-white transition-transform ${
                      userDropdownOpen ? "rotate-180 text-[#0756A5]" : ""
                    }`}
                  />
                </button>

                {/* Ultra-Premium Redesigned Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="user-menu-popover">
                    {/* User Profile Header Card */}
                    <div className="user-menu-card-header">
                      <div className="flex items-center gap-3 relative z-10">
                        {/* Avatar */}
                        <div className="user-menu-avatar-badge">
                          {userAvatarMeta.emoji}
                        </div>

                        {/* Name & Email */}
                        <div className="min-w-0 flex-1">
                          <h4 className="user-menu-name">
                            {currentUser.name}
                          </h4>
                          <p className="user-menu-email">
                            {currentUser.email}
                          </p>
                        </div>
                      </div>

                      {/* User Badges: Stage & XP */}
                      <div className="user-menu-badges-row">
                        {showAdminOnlyMode ? (
                          <div className="user-badge-stage bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">
                            <ShieldCheck size={13} className="text-indigo-600 dark:text-indigo-400" />
                            <span>Administrator</span>
                          </div>
                        ) : (
                          <div className="user-badge-stage">
                            <span>{stageMeta.icon}</span>
                            <span className="truncate max-w-[120px]">{stageMeta.label}</span>
                          </div>
                        )}

                        <div className="user-badge-xp">
                          <Sparkles size={11} className="text-[#38bdf8] shrink-0" />
                          <span>{currentUser.stats?.xp || 0} XP</span>
                        </div>
                      </div>
                    </div>

                    {/* Progress Summary Cards (Learner only) */}
                    {!showAdminOnlyMode && (
                      <div className="user-menu-stats-grid">
                        <div className="user-menu-stat-tile">
                          <div className="user-menu-stat-icon-blue">
                            <CheckCircle size={16} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="user-menu-stat-val">
                              {(currentUser.stats?.completedTopics || []).length}
                            </div>
                            <div className="user-menu-stat-lbl">
                              Lessons Done
                            </div>
                          </div>
                        </div>

                        <div className="user-menu-stat-tile">
                          <div className="user-menu-stat-icon-blue">
                            <Bookmark size={15} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="user-menu-stat-val">
                              {(currentUser.stats?.bookmarkedTopics || []).length}
                            </div>
                            <div className="user-menu-stat-lbl">
                              Bookmarks
                            </div>
                          </div>
                        </div>

                        <div
                          className="user-menu-stat-tile cursor-pointer hover:border-emerald-300 dark:hover:border-emerald-700 transition"
                          onClick={() => {
                            setUserDropdownOpen(false);
                            openDoubtModal({ sectionTitle: "General Python Inquiry" });
                          }}
                          title="Click to view Doubt Credits & Support"
                        >
                          <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-[#25D366] flex items-center justify-center shrink-0">
                            <WhatsAppIcon size={16} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="user-menu-stat-val text-emerald-600 dark:text-emerald-400">
                              {doubtCredits} left
                            </div>
                            <div className="user-menu-stat-lbl">
                              Doubts
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Menu Actions */}
                    <div className="space-y-1">
                      {showAdminOnlyMode ? (
                        <>
                          <button
                            onClick={() => {
                              setUserDropdownOpen(false);
                              if (onToggleAppPreview) onToggleAppPreview();
                            }}
                            className="user-menu-action bg-blue-50/50 dark:bg-blue-950/30 hover:bg-blue-100/70 dark:hover:bg-blue-950/60 border border-blue-200/50 dark:border-blue-800/40"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                                <Eye size={14} />
                              </div>
                              <div className="min-w-0">
                                <div className="user-menu-action-title text-blue-700 dark:text-blue-300 font-bold">App Preview</div>
                                <div className="user-menu-action-sub text-blue-600/80 dark:text-blue-400/80">View & test app as learner</div>
                              </div>
                            </div>
                            <ChevronRight size={14} className="text-blue-500 shrink-0 ml-1" />
                          </button>

                          <button
                            onClick={() => {
                              setUserDropdownOpen(false);
                              handleNavClick("admin");
                            }}
                            className="user-menu-action bg-indigo-50/40 dark:bg-indigo-950/20 hover:bg-indigo-100/60 dark:hover:bg-indigo-950/50 border border-indigo-200/50 dark:border-indigo-800/40"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                                <ShieldCheck size={14} />
                              </div>
                              <div className="min-w-0">
                                <div className="user-menu-action-title text-indigo-700 dark:text-indigo-300 font-bold">Admin Console</div>
                                <div className="user-menu-action-sub text-indigo-600/80 dark:text-indigo-400/80">User management center</div>
                              </div>
                            </div>
                            <ChevronRight size={14} className="text-indigo-500 shrink-0 ml-1" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setUserDropdownOpen(false);
                              handleNavClick("profile");
                            }}
                            className="user-menu-action"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="user-menu-action-icon-blue">
                                <User size={15} />
                              </div>
                              <div className="min-w-0">
                                <div className="user-menu-action-title">My Profile & Stats</div>
                                <div className="user-menu-action-sub">Avatar, stats & achievements</div>
                              </div>
                            </div>
                            <ChevronRight size={14} className="text-[#0756A5] dark:text-slate-400 shrink-0 ml-1" />
                          </button>

                          <button
                            onClick={() => {
                              setUserDropdownOpen(false);
                              onOpenStageModal();
                            }}
                            className="user-menu-action"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="user-menu-action-icon-blue">
                                <Settings size={15} />
                              </div>
                              <div className="min-w-0">
                                <div className="user-menu-action-title">Learning Stage</div>
                                <div className="user-menu-action-sub">Current: {stageMeta.label}</div>
                              </div>
                            </div>
                            <ChevronRight size={14} className="text-[#0756A5] dark:text-slate-400 shrink-0 ml-1" />
                          </button>

                          <button
                            onClick={() => {
                              setUserDropdownOpen(false);
                              handleNavClick("contact");
                            }}
                            className="user-menu-action"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="user-menu-action-icon-blue">
                                <Mail size={15} />
                              </div>
                              <div className="min-w-0">
                                <div className="user-menu-action-title">Contact Support</div>
                                <div className="user-menu-action-sub">Get student help & send feedback</div>
                              </div>
                            </div>
                            <ChevronRight size={14} className="text-[#0756A5] dark:text-slate-400 shrink-0 ml-1" />
                          </button>

                          <button
                            onClick={() => {
                              setUserDropdownOpen(false);
                              openExplorer("all");
                            }}
                            className="user-menu-action"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="user-menu-action-icon-blue">
                                <Compass size={15} />
                              </div>
                              <div className="min-w-0">
                                <div className="user-menu-action-title">Explore App</div>
                                <div className="user-menu-action-sub">Search pages, features & guided tour</div>
                              </div>
                            </div>
                            <ChevronRight size={14} className="text-[#0756A5] dark:text-slate-400 shrink-0 ml-1" />
                          </button>

                          {currentUser?.role === "admin" && (
                            <button
                              onClick={() => {
                                setUserDropdownOpen(false);
                                if (onReturnToAdmin) {
                                  onReturnToAdmin();
                                } else {
                                  handleNavClick("admin");
                                }
                              }}
                              className="user-menu-action bg-indigo-50/40 dark:bg-indigo-950/20 hover:bg-indigo-100/60 dark:hover:bg-indigo-950/50 border border-indigo-200/50 dark:border-indigo-800/40"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                                  <ShieldCheck size={14} />
                                </div>
                                <div className="min-w-0">
                                  <div className="user-menu-action-title text-indigo-700 dark:text-indigo-300 font-bold">Admin Console</div>
                                  <div className="user-menu-action-sub text-indigo-600/80 dark:text-indigo-400/80">Exit preview & manage users</div>
                                </div>
                              </div>
                              <ChevronRight size={14} className="text-indigo-500 shrink-0 ml-1" />
                            </button>
                          )}
                        </>
                      )}

                      <div className="my-1.5 border-t border-slate-100 dark:border-slate-800"></div>

                      <button
                        onClick={async () => {
                          setUserDropdownOpen(false);
                          await logout();
                          setCurrentPage("signin");
                        }}
                        className="user-menu-signout"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="user-menu-signout-icon">
                            <LogOut size={14} />
                          </div>
                          <span className="font-bold text-xs">Sign Out</span>
                        </div>
                        <ChevronRight size={14} className="shrink-0 ml-1 opacity-70" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                <button
                  onClick={() => setCurrentPage("signin")}
                  className="navbar-auth-btn-signin flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-[13px] font-bold text-[#102B50] dark:text-white hover:text-[#102B50] hover:bg-[#FFB800] dark:hover:text-[#102B50] dark:hover:bg-[#FFB800] transition cursor-pointer border border-[#E2E8F0] dark:border-[#1E3A5F] hover:border-[#FFB800] shrink-0"
                >
                  <LogIn size={14} className="shrink-0 text-[#0756A5] dark:text-[#FFB800]" />
                  <span>Sign In</span>
                </button>
                <button
                  onClick={() => setCurrentPage("signup")}
                  className="navbar-auth-btn-signup flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-[13px] font-bold bg-[#0756A5] hover:bg-[#064681] text-white shadow-xs transition cursor-pointer border border-[#0756A5] shrink-0"
                  style={{ backgroundColor: "#0756A5", color: "#FFFFFF" }}
                >
                  <Sparkles size={13} className="shrink-0 text-[#FFB800]" style={{ color: "#FFB800" }} />
                  <span className="text-white font-bold" style={{ color: "#FFFFFF" }}>Sign Up</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile / Compact Controls (<1024px, optimized for 280px-1023px) */}
        <div className="navbar-mobile-menu items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Admin Mode Mobile Actions */}
          {showAdminOnlyMode ? (
            <button
              onClick={onToggleAppPreview}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-xs cursor-pointer border-none active:scale-95 shrink-0"
              title="Preview App as Learner"
            >
              <Eye size={14} />
              <span>Preview</span>
            </button>
          ) : isAdmin && appPreviewMode ? (
            <button
              onClick={onReturnToAdmin}
              className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-xs cursor-pointer border border-indigo-400/40 shrink-0"
              title="Return to Admin Console"
            >
              <ShieldCheck size={13} />
              <span className="text-[11px]">Admin</span>
            </button>
          ) : (
            /* Tablet Explore App shortcut (visible on tablet 640px - 1023px for learners) */
            <button
              onClick={() => openExplorer("all")}
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-[#F3F7FC] hover:bg-[#FFB800] text-[#0756A5] hover:text-[#102B50] dark:bg-[#102B50] dark:hover:bg-[#FFB800] dark:text-[#FFB800] dark:hover:text-[#102B50] border border-[#E2E8F0] dark:border-[#1E3A5F] hover:border-[#FFB800] transition cursor-pointer shrink-0"
              title="Explore App: Search pages & features"
            >
              <Compass size={14} className="shrink-0" />
              <span>Explore</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </button>
          )}

          {/* Mobile Font Size Control */}
          <FontSizeControl variant="mobile" />

          <button
            id="tour-nav-mobile-theme"
            onClick={toggleTheme}
            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-[#101b2d] text-[#102B50] dark:text-[#60a5fa] border border-slate-200 dark:border-[#23344d] cursor-pointer shadow-2xs shrink-0"
            title="Toggle theme"
            aria-label="Toggle Theme"
          >
            {isDark ? <Sun size={15} className="text-[#FFB800]" /> : <Moon size={15} className="text-[#0756A5]" />}
          </button>

          {/* User Profile Avatar / Login Icon on Mobile */}
          {isAuthenticated && currentUser ? (
            <button
              id="tour-nav-mobile-auth"
              onClick={() => {
                if (showAdminOnlyMode) {
                  setUserDropdownOpen(!userDropdownOpen);
                } else {
                  handleNavClick("profile");
                }
              }}
              className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl bg-blue-50 dark:bg-[#101b2d] text-[#0756A5] dark:text-[#93c5fd] border border-blue-200 dark:border-[#23344d] cursor-pointer shadow-2xs text-base shrink-0"
              title={showAdminOnlyMode ? "Admin Menu" : "Profile & Stats"}
            >
              {userAvatarMeta.emoji}
            </button>
          ) : (
            <button
              id="tour-nav-mobile-auth"
              onClick={() => setCurrentPage("signin")}
              className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl bg-blue-50 dark:bg-[#101b2d] text-[#0756A5] dark:text-[#93c5fd] border border-blue-200 dark:border-[#23344d] cursor-pointer shadow-2xs shrink-0"
              title="Sign In"
            >
              <LogIn size={15} className="text-[#0756A5] dark:text-[#93c5fd]" />
            </button>
          )}

          {/* Learner only: Language and Stage quick pills */}
          {!showAdminOnlyMode && (
            <>
              <button
                id="tour-nav-mobile-lang"
                onClick={onOpenLanguageModal}
                className="h-8 sm:h-9 px-1.5 sm:px-2.5 hidden xs:flex items-center gap-1 rounded-xl text-xs font-bold bg-slate-100 dark:bg-[#101b2d] border border-slate-200 dark:border-[#23344d] text-slate-800 dark:text-slate-200 cursor-pointer shadow-2xs shrink-0"
                title="Switch Language"
              >
                <span className="text-sm">{langMeta.icon}</span>
                <span className="hidden sm:inline">{langShortLabel}</span>
              </button>

              <button
                id="tour-nav-mobile-stage"
                onClick={onOpenStageModal}
                className="h-8 sm:h-9 px-1.5 sm:px-2.5 hidden xs:flex items-center gap-1 rounded-xl text-xs font-bold bg-slate-100 dark:bg-[#101b2d] border border-slate-200 dark:border-[#23344d] text-slate-800 dark:text-slate-200 cursor-pointer shadow-2xs shrink-0"
                title="Switch Learning Stage"
              >
                <span className="text-sm">{stageMeta.icon}</span>
                <span className="hidden sm:inline">{stageMeta.label}</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
