import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Lock,
  Sparkles,
  Flame,
  Award,
  BookOpen,
  Bookmark,
  CheckCircle2,
  AlertCircle,
  Settings,
  LogOut,
  Calendar,
  Globe,
  GraduationCap,
  ShieldCheck,
  RefreshCw,
  Trash2,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Trophy,
  CheckCircle,
  Eye,
  EyeOff
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { LEARNING_STAGES, getStageById } from "../data/learningStages";
import { LEARNING_LANGUAGES, getLanguageById } from "../data/learningLanguages";
import { AVATAR_OPTIONS } from "../services/authService";
import { allTopics, getTopicById } from "../data/allTopics";
import CertificateModal from "../components/CertificateModal";
import PageBackButton from "../components/PageBackButton";

export default function Profile({ onNavigate, onSelectTopic, onBack }) {
  const {
    currentUser,
    isAuthenticated,
    updateProfile,
    resetPassword,
    deleteAccount,
    toggleBookmark,
    logout
  } = useAuth();
  const { isDark } = useTheme();

  // Active Tab: "completed" | "bookmarks" | "certificate" | "settings"
  const [activeTab, setActiveTab] = useState("completed");

  // Profile Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editStage, setEditStage] = useState("young");
  const [editLanguage, setEditLanguage] = useState("english");
  const [editAvatar, setEditAvatar] = useState("snake_blue");
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);

  // Security / Password State
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Delete Account Confirmation State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  // Feedback State
  const [statusMsg, setStatusMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);

  // Synchronize initial form values from currentUser
  useEffect(() => {
    if (currentUser) {
      setEditName(currentUser.name || currentUser.full_name || "");
      setEditBio(currentUser.bio || "");
      setEditStage(currentUser.stage || currentUser.learning_stage || "young");
      setEditLanguage(currentUser.language || currentUser.preferred_language || "english");
      setEditAvatar(currentUser.avatar || "snake_blue");
    }
  }, [currentUser]);

  // Selected Avatar Meta
  const avatarMeta =
    AVATAR_OPTIONS.find((a) => a.id === (isEditing ? editAvatar : currentUser?.avatar)) ||
    AVATAR_OPTIONS[0];

  const stageMeta = getStageById(currentUser?.stage || currentUser?.learning_stage || "young");
  const langMeta = getLanguageById(currentUser?.language || currentUser?.preferred_language || "english");

  // Stats Calculations
  const completedTopicsList = currentUser?.stats?.completedTopics || [];
  const bookmarkedTopicsList = currentUser?.stats?.bookmarkedTopics || [];
  const userXp = currentUser?.stats?.xp || currentUser?.stats?.total_xp || 0;
  const streakDays = currentUser?.stats?.streakDays || currentUser?.stats?.current_streak || 1;
  const longestStreak = currentUser?.stats?.longestStreak || streakDays;
  const userLevel = Math.max(1, Math.floor(userXp / 250) + 1);
  const xpInCurrentLevel = userXp % 250;
  const levelProgressPercent = Math.min(100, Math.round((xpInCurrentLevel / 250) * 100));

  // Handler: Save Profile Edits
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setStatusMsg("");
    setIsLoading(true);

    try {
      await updateProfile({
        name: editName.trim(),
        bio: editBio.trim(),
        stage: editStage,
        language: editLanguage,
        avatar: editAvatar
      });
      setStatusMsg("✓ Profile updated successfully!");
      setIsEditing(false);
      setAvatarPickerOpen(false);
    } catch (err) {
      setErrorMsg(err.message || "Failed to update profile details. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handler: Update Password
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setStatusMsg("");

    if (newPassword.length < 6) {
      setErrorMsg("New password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg("Password and confirmation do not match.");
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword(currentUser.email, newPassword);
      setStatusMsg("✓ Password updated successfully!");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setErrorMsg(err.message || "Failed to update password.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handler: Delete Account
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") {
      setErrorMsg("Please type 'DELETE' to confirm account removal.");
      return;
    }
    setIsLoading(true);
    try {
      await deleteAccount();
      if (onNavigate) onNavigate("signin");
    } catch (err) {
      setErrorMsg(err.message || "Failed to delete account. Please contact support.");
      setIsLoading(false);
    }
  };

  // Unauthenticated Fallback View
  if (!isAuthenticated || !currentUser) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <div
          className="w-full max-w-md p-6 sm:p-8 rounded-3xl text-center shadow-xl border"
          style={{
            background: isDark ? "rgba(16, 43, 80, 0.75)" : "#ffffff",
            borderColor: isDark ? "rgba(56, 189, 248, 0.2)" : "#e2e8f0"
          }}
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-blue-500/10 text-[#0756A5] dark:text-[#38bdf8] flex items-center justify-center text-3xl">
            👤
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#102B50] dark:text-white mb-2">
            Learner Profile
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
            Sign in to track your learning streak, save bookmarked lessons, monitor quiz scores, and view your official Python certificate!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => onNavigate && onNavigate("signin")}
              className="py-2.5 px-5 rounded-xl bg-[#0756A5] hover:bg-[#064681] text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer border-none"
            >
              <span>Sign In to Profile</span>
              <ArrowRight size={15} />
            </button>
            <button
              onClick={() => onNavigate && onNavigate("signup")}
              className="py-2.5 px-5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-[#102B50] dark:text-white font-bold text-xs sm:text-sm transition cursor-pointer"
            >
              Create Account Free
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-8 transition-colors duration-200">
      {/* 1. Sub-Navbar Navigation Bar */}
      <div className="flex items-center justify-between mb-4 sm:mb-6 flex-wrap gap-2">
        <PageBackButton
          onClick={onBack || (() => onNavigate && onNavigate("home"))}
          label="Back"
          className="shrink-0"
        />
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
            style={{
              background: currentUser.role === "admin" ? "rgba(99, 102, 241, 0.15)" : "rgba(7, 86, 165, 0.12)",
              color: currentUser.role === "admin" ? (isDark ? "#a5b4fc" : "#4f46e5") : (isDark ? "#38bdf8" : "#0756A5"),
              border: isDark ? "1px solid rgba(56, 189, 248, 0.25)" : "1px solid rgba(7, 86, 165, 0.2)"
            }}
          >
            {currentUser.role === "admin" ? <ShieldCheck size={13} /> : <GraduationCap size={13} />}
            <span>{currentUser.role === "admin" ? "System Administrator" : "Student Learner"}</span>
          </span>
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 hidden sm:inline">
            • SSL Session Protected
          </span>
        </div>
      </div>

      {/* Feedback Alerts */}
      {errorMsg ? (
        <div className="mb-4 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-300 text-xs sm:text-sm font-semibold flex items-center gap-2.5 animate-in">
          <AlertCircle size={16} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      ) : statusMsg ? (
        <div className="mb-4 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-300 text-xs sm:text-sm font-semibold flex items-center gap-2.5 animate-in">
          <CheckCircle2 size={16} className="shrink-0" />
          <span>{statusMsg}</span>
        </div>
      ) : null}

      {/* 2. Hero Profile Card */}
      <div
        className="p-4 sm:p-7 rounded-3xl mb-6 shadow-xl relative overflow-hidden transition-all duration-300 border"
        style={{
          background: isDark
            ? "linear-gradient(135deg, rgba(16, 43, 80, 0.85) 0%, rgba(10, 30, 56, 0.95) 100%)"
            : "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
          borderColor: isDark ? "rgba(56, 189, 248, 0.25)" : "#e2e8f0"
        }}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative z-10">
          {/* Avatar & User Details */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start md:items-center gap-4 sm:gap-5 w-full md:w-auto text-center sm:text-left">
            {/* Avatar Badge Container */}
            <div className="relative group shrink-0">
              <div
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl flex items-center justify-center text-4xl sm:text-5xl shadow-lg border-2"
                style={{
                  background: isDark ? "rgba(56, 189, 248, 0.15)" : "rgba(7, 86, 165, 0.1)",
                  borderColor: isDark ? "#38bdf8" : "#0756A5"
                }}
              >
                {avatarMeta.emoji}
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(true);
                  setAvatarPickerOpen(!avatarPickerOpen);
                }}
                title="Change Avatar Icon"
                className="absolute -bottom-1 -right-1 p-1.5 rounded-xl bg-[#0756A5] text-white hover:bg-[#064681] shadow-md transition cursor-pointer border-none"
              >
                <Sparkles size={13} />
              </button>
            </div>

            {/* Profile Info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap mb-1">
                <h1 className="text-xl sm:text-2xl font-black text-[#102B50] dark:text-white tracking-tight">
                  {currentUser.name || currentUser.full_name || "Python Learner"}
                </h1>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-[#0756A5] dark:text-[#38bdf8] border border-blue-500/20">
                  Level {userLevel}
                </span>
              </div>

              <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-slate-500 dark:text-slate-400 mb-2.5 font-mono">
                <Mail size={13} className="shrink-0" />
                <span className="truncate">{currentUser.email}</span>
              </div>

              {/* Badges for Stage & Language */}
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold"
                  style={{
                    background: isDark ? "rgba(56, 189, 248, 0.15)" : "#f1f5f9",
                    color: isDark ? "#38bdf8" : "#102B50"
                  }}
                >
                  <span>{stageMeta.icon}</span>
                  <span>{stageMeta.label}</span>
                </span>

                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold"
                  style={{
                    background: isDark ? "rgba(255, 184, 0, 0.15)" : "#fef3c7",
                    color: isDark ? "#FFB800" : "#b45309"
                  }}
                >
                  <span>{langMeta.icon}</span>
                  <span>{langMeta.label}</span>
                </span>
              </div>

              {/* Bio / Goal Quote */}
              {currentUser.bio ? (
                <p className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 italic border-l-2 border-[#0756A5] pl-3 py-0.5">
                  "{currentUser.bio}"
                </p>
              ) : (
                <p className="mt-3 text-xs text-slate-400 dark:text-slate-500 italic">
                  No learning goal bio set yet. Click "Edit Profile" below to add one!
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex sm:flex-col items-center justify-center sm:items-stretch gap-2 w-full md:w-auto shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                setIsEditing(!isEditing);
                setAvatarPickerOpen(false);
              }}
              className="flex-1 sm:flex-initial py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-xs border"
              style={{
                background: isEditing
                  ? (isDark ? "rgba(56, 189, 248, 0.2)" : "rgba(7, 86, 165, 0.15)")
                  : (isDark ? "rgba(16, 43, 80, 0.9)" : "#f1f5f9"),
                color: isDark ? "#ffffff" : "#102B50",
                borderColor: isDark ? "rgba(56, 189, 248, 0.3)" : "#cbd5e1"
              }}
            >
              <Settings size={15} />
              <span>{isEditing ? "Close Editor" : "Edit Profile"}</span>
            </button>

            <button
              type="button"
              onClick={async () => {
                await logout();
                if (onNavigate) onNavigate("signin");
              }}
              className="py-2.5 px-3.5 rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer border text-red-600 dark:text-red-400 bg-red-500/10 hover:bg-red-500/20 border-red-500/30"
              title="Sign out of your session"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>

        {/* 3. Inline Edit Profile Expansion */}
        {isEditing && (
          <form
            onSubmit={handleSaveProfile}
            className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800 space-y-4 animate-in"
          >
            <h3 className="text-sm font-bold text-[#102B50] dark:text-white flex items-center gap-2">
              <Settings size={15} className="text-[#0756A5] dark:text-[#38bdf8]" />
              <span>Edit Personal Details & Learning Preferences</span>
            </h3>

            {/* Avatar Selector Tray */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Choose Profile Avatar
              </label>
              <div className="flex flex-wrap gap-2">
                {AVATAR_OPTIONS.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setEditAvatar(a.id)}
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl transition cursor-pointer border ${
                      editAvatar === a.id
                        ? "bg-[#0756A5] border-[#38bdf8] text-white shadow-md scale-110"
                        : "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 hover:scale-105"
                    }`}
                    title={a.label}
                  >
                    {a.emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Display Name
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold text-[#102B50] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0756A5]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Bio / Learning Objective
                </label>
                <input
                  type="text"
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="e.g. Learning Python for backend APIs & data science"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold text-[#102B50] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0756A5]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Default Learning Stage
                </label>
                <select
                  value={editStage}
                  onChange={(e) => setEditStage(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm font-semibold text-[#102B50] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0756A5] cursor-pointer"
                >
                  {LEARNING_STAGES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.icon} {s.label} ({s.ageRange})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Default Learning Language
                </label>
                <select
                  value={editLanguage}
                  onChange={(e) => setEditLanguage(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs sm:text-sm font-semibold text-[#102B50] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0756A5] cursor-pointer"
                >
                  {LEARNING_LANGUAGES.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.icon} {l.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="py-2.5 px-5 rounded-xl bg-[#0756A5] hover:bg-[#064681] text-white font-bold text-xs sm:text-sm shadow-md transition cursor-pointer border-none flex items-center gap-2 disabled:opacity-50"
              >
                {isLoading ? <RefreshCw size={15} className="animate-spin" /> : <CheckCircle size={15} />}
                <span>Save Profile Changes</span>
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs sm:text-sm transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* 4. Gamified Learning Metrics Grid */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {/* Metric 1: Total XP */}
        <div
          className="p-3.5 sm:p-5 rounded-2xl border transition-all duration-200 shadow-sm"
          style={{
            background: isDark ? "rgba(16, 43, 80, 0.65)" : "#ffffff",
            borderColor: isDark ? "rgba(56, 189, 248, 0.2)" : "#e2e8f0"
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total XP
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-[#FFB800] flex items-center justify-center">
              <Sparkles size={16} />
            </div>
          </div>
          <div className="text-xl sm:text-3xl font-black text-[#102B50] dark:text-white mb-1.5">
            {userXp} <span className="text-xs sm:text-sm font-bold text-[#FFB800]">XP</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mb-1">
            <div
              className="bg-gradient-to-r from-[#FFB800] to-amber-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${levelProgressPercent}%` }}
            />
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
            {xpInCurrentLevel}/250 XP to Level {userLevel + 1}
          </div>
        </div>

        {/* Metric 2: Streak Days */}
        <div
          className="p-3.5 sm:p-5 rounded-2xl border transition-all duration-200 shadow-sm"
          style={{
            background: isDark ? "rgba(16, 43, 80, 0.65)" : "#ffffff",
            borderColor: isDark ? "rgba(56, 189, 248, 0.2)" : "#e2e8f0"
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Daily Streak
            </span>
            <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
              <Flame size={16} />
            </div>
          </div>
          <div className="text-xl sm:text-3xl font-black text-[#102B50] dark:text-white mb-1.5">
            {streakDays} <span className="text-xs sm:text-sm font-bold text-orange-500">Days</span>
          </div>
          <div className="text-[11px] text-slate-600 dark:text-slate-300 font-semibold flex items-center gap-1">
            <span>🔥 Longest Streak:</span>
            <span className="font-extrabold text-[#102B50] dark:text-white">{longestStreak}d</span>
          </div>
        </div>

        {/* Metric 3: Completed Lessons */}
        <div
          className="p-3.5 sm:p-5 rounded-2xl border transition-all duration-200 shadow-sm"
          style={{
            background: isDark ? "rgba(16, 43, 80, 0.65)" : "#ffffff",
            borderColor: isDark ? "rgba(56, 189, 248, 0.2)" : "#e2e8f0"
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Completed
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-[#0756A5] dark:text-[#38bdf8] flex items-center justify-center">
              <BookOpen size={16} />
            </div>
          </div>
          <div className="text-xl sm:text-3xl font-black text-[#102B50] dark:text-white mb-1.5">
            {completedTopicsList.length} <span className="text-xs sm:text-sm font-bold text-slate-400">/ 198</span>
          </div>
          <div className="text-[11px] text-slate-600 dark:text-slate-300 font-semibold">
            {Math.round((completedTopicsList.length / 198) * 100)}% of Curriculum
          </div>
        </div>

        {/* Metric 4: Bookmarked Topics */}
        <div
          className="p-3.5 sm:p-5 rounded-2xl border transition-all duration-200 shadow-sm"
          style={{
            background: isDark ? "rgba(16, 43, 80, 0.65)" : "#ffffff",
            borderColor: isDark ? "rgba(56, 189, 248, 0.2)" : "#e2e8f0"
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Saved Bookmarks
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Bookmark size={16} />
            </div>
          </div>
          <div className="text-xl sm:text-3xl font-black text-[#102B50] dark:text-white mb-1.5">
            {bookmarkedTopicsList.length} <span className="text-xs sm:text-sm font-bold text-emerald-500">Saved</span>
          </div>
          <div className="text-[11px] text-slate-600 dark:text-slate-300 font-semibold">
            Ready for quick revision
          </div>
        </div>
      </div>

      {/* 5. Interactive Tabs Header */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 mb-6 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab("completed")}
          className={`py-2 px-3.5 sm:px-5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === "completed"
              ? "bg-[#0756A5] text-white shadow-md shadow-blue-500/20"
              : "bg-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800"
          }`}
        >
          <CheckCircle size={15} />
          <span>Completed Lessons ({completedTopicsList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("bookmarks")}
          className={`py-2 px-3.5 sm:px-5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === "bookmarks"
              ? "bg-[#0756A5] text-white shadow-md shadow-blue-500/20"
              : "bg-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800"
          }`}
        >
          <Bookmark size={15} />
          <span>Saved Bookmarks ({bookmarkedTopicsList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("certificate")}
          className={`py-2 px-3.5 sm:px-5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === "certificate"
              ? "bg-[#0756A5] text-white shadow-md shadow-blue-500/20"
              : "bg-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800"
          }`}
        >
          <Award size={15} />
          <span>Certificate & Badges</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("settings")}
          className={`py-2 px-3.5 sm:px-5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === "settings"
              ? "bg-[#0756A5] text-white shadow-md shadow-blue-500/20"
              : "bg-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800"
          }`}
        >
          <Lock size={15} />
          <span>Security & Settings</span>
        </button>
      </div>

      {/* 6. Tab Content: Completed Lessons */}
      {activeTab === "completed" && (
        <div className="space-y-3">
          {completedTopicsList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {completedTopicsList.map((topicId) => {
                const topic = getTopicById(topicId) || allTopics.find((t) => t.id === topicId) || {
                  id: topicId,
                  title: topicId.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
                  sectionName: "Python Curriculum"
                };

                return (
                  <div
                    key={topicId}
                    className="p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-3 hover:shadow-md"
                    style={{
                      background: isDark ? "rgba(16, 43, 80, 0.6)" : "#ffffff",
                      borderColor: isDark ? "rgba(56, 189, 248, 0.2)" : "#e2e8f0"
                    }}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                        <CheckCircle2 size={13} />
                        <span>Completed (+30 XP)</span>
                      </div>
                      <h4 className="text-sm font-bold text-[#102B50] dark:text-white truncate">
                        {topic.title}
                      </h4>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {topic.sectionName || "Core Python"}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onSelectTopic && onSelectTopic(topicId)}
                      className="py-2 px-3 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-[#0756A5] dark:text-[#38bdf8] font-bold text-xs transition flex items-center gap-1 cursor-pointer shrink-0 border border-blue-500/20"
                    >
                      <span>Revise</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div
              className="p-8 sm:p-12 rounded-3xl text-center border"
              style={{
                background: isDark ? "rgba(16, 43, 80, 0.4)" : "#ffffff",
                borderColor: isDark ? "rgba(56, 189, 248, 0.15)" : "#e2e8f0"
              }}
            >
              <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-blue-500/10 text-[#0756A5] dark:text-[#38bdf8] flex items-center justify-center">
                <BookOpen size={24} />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#102B50] dark:text-white mb-1">
                No Completed Lessons Yet
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-5">
                Every topic you complete in the interactive lesson environment awards +30 XP and records your quiz results here.
              </p>
              <button
                type="button"
                onClick={() => onNavigate && onNavigate("learn")}
                className="py-2.5 px-5 rounded-xl bg-[#0756A5] hover:bg-[#064681] text-white font-bold text-xs sm:text-sm shadow-md transition inline-flex items-center gap-2 cursor-pointer border-none"
              >
                <span>Browse All 198 Lessons</span>
                <ArrowRight size={14} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* 7. Tab Content: Bookmarked Lessons */}
      {activeTab === "bookmarks" && (
        <div className="space-y-3">
          {bookmarkedTopicsList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {bookmarkedTopicsList.map((topicId) => {
                const topic = getTopicById(topicId) || allTopics.find((t) => t.id === topicId) || {
                  id: topicId,
                  title: topicId.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
                  sectionName: "Python Curriculum"
                };

                return (
                  <div
                    key={topicId}
                    className="p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-3 hover:shadow-md"
                    style={{
                      background: isDark ? "rgba(16, 43, 80, 0.6)" : "#ffffff",
                      borderColor: isDark ? "rgba(56, 189, 248, 0.2)" : "#e2e8f0"
                    }}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-500 mb-1">
                        <Bookmark size={13} />
                        <span>Saved Bookmark</span>
                      </div>
                      <h4 className="text-sm font-bold text-[#102B50] dark:text-white truncate">
                        {topic.title}
                      </h4>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {topic.sectionName || "Python Curriculum"}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => onSelectTopic && onSelectTopic(topicId)}
                        className="py-2 px-3 rounded-xl bg-[#0756A5] hover:bg-[#064681] text-white font-bold text-xs transition flex items-center gap-1 cursor-pointer border-none"
                      >
                        <span>Study</span>
                        <ArrowRight size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          await toggleBookmark(topicId);
                        }}
                        title="Remove bookmark"
                        className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition cursor-pointer border-none"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div
              className="p-8 sm:p-12 rounded-3xl text-center border"
              style={{
                background: isDark ? "rgba(16, 43, 80, 0.4)" : "#ffffff",
                borderColor: isDark ? "rgba(56, 189, 248, 0.15)" : "#e2e8f0"
              }}
            >
              <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Bookmark size={24} />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#102B50] dark:text-white mb-1">
                No Bookmarks Saved Yet
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-5">
                While studying any lesson, tap the bookmark icon at the top to save it here for quick access anytime!
              </p>
              <button
                type="button"
                onClick={() => onNavigate && onNavigate("learn")}
                className="py-2.5 px-5 rounded-xl bg-[#0756A5] hover:bg-[#064681] text-white font-bold text-xs sm:text-sm shadow-md transition inline-flex items-center gap-2 cursor-pointer border-none"
              >
                <span>Find Lessons to Bookmark</span>
                <ArrowRight size={14} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* 8. Tab Content: Certificate & Achievements */}
      {activeTab === "certificate" && (
        <div className="space-y-6">
          {/* Certificate Banner Card */}
          <div
            className="p-5 sm:p-7 rounded-3xl border shadow-lg relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-5"
            style={{
              background: isDark
                ? "linear-gradient(135deg, rgba(7, 86, 165, 0.3) 0%, rgba(16, 43, 80, 0.8) 100%)"
                : "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)",
              borderColor: isDark ? "rgba(56, 189, 248, 0.3)" : "#bfdbfe"
            }}
          >
            <div className="flex items-center gap-4 text-center sm:text-left flex-col sm:flex-row">
              <div className="w-16 h-16 rounded-2xl bg-[#FFB800] text-[#102B50] flex items-center justify-center shadow-lg shrink-0">
                <Trophy size={32} />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-[#102B50] dark:text-white">
                  Official Certificate of Achievement
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-lg mt-0.5">
                  Verify and showcase your completed Python mastery milestones with this printable, signed educational credential.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowCertificate(true)}
              className="py-3 px-6 rounded-xl bg-[#0756A5] hover:bg-[#064681] text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center gap-2 cursor-pointer border-none shrink-0"
            >
              <Award size={16} className="text-[#FFB800]" />
              <span>View Official Certificate</span>
            </button>
          </div>

          {/* Achievement Milestones Grid */}
          <div>
            <h4 className="text-sm font-bold text-[#102B50] dark:text-white mb-3 flex items-center gap-2">
              <Sparkles size={16} className="text-[#FFB800]" />
              <span>Unlocked Milestones & Badges</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* Badge 1 */}
              <div
                className="p-4 rounded-2xl border flex items-center gap-3"
                style={{
                  background: isDark ? "rgba(16, 43, 80, 0.5)" : "#ffffff",
                  borderColor: isDark ? "rgba(56, 189, 248, 0.15)" : "#e2e8f0"
                }}
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center text-2xl shrink-0">
                  🐍
                </div>
                <div>
                  <div className="text-xs font-black text-[#102B50] dark:text-white">
                    Python Apprentice
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Registered account (+50 XP bonus)
                  </div>
                </div>
              </div>

              {/* Badge 2 */}
              <div
                className="p-4 rounded-2xl border flex items-center gap-3"
                style={{
                  background: isDark ? "rgba(16, 43, 80, 0.5)" : "#ffffff",
                  borderColor: isDark ? "rgba(56, 189, 248, 0.15)" : "#e2e8f0"
                }}
              >
                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center text-2xl shrink-0">
                  🔥
                </div>
                <div>
                  <div className="text-xs font-black text-[#102B50] dark:text-white">
                    Daily Streak Starter
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Maintained daily learning momentum
                  </div>
                </div>
              </div>

              {/* Badge 3 */}
              <div
                className="p-4 rounded-2xl border flex items-center gap-3"
                style={{
                  background: isDark ? "rgba(16, 43, 80, 0.5)" : "#ffffff",
                  borderColor: isDark ? "rgba(56, 189, 248, 0.15)" : "#e2e8f0"
                }}
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center text-2xl shrink-0">
                  ✨
                </div>
                <div>
                  <div className="text-xs font-black text-[#102B50] dark:text-white">
                    Adaptive Scholar
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Customized stage & multilingual depth
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 9. Tab Content: Security & Settings */}
      {activeTab === "settings" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Security: Change Password */}
          <div
            className="p-5 sm:p-6 rounded-3xl border shadow-sm"
            style={{
              background: isDark ? "rgba(16, 43, 80, 0.65)" : "#ffffff",
              borderColor: isDark ? "rgba(56, 189, 248, 0.2)" : "#e2e8f0"
            }}
          >
            <h3 className="text-base font-bold text-[#102B50] dark:text-white mb-2 flex items-center gap-2">
              <Lock size={16} className="text-[#0756A5] dark:text-[#38bdf8]" />
              <span>Change Account Password</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Enter your desired new password below (minimum 6 characters).
            </p>

            <form onSubmit={handleUpdatePassword} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold text-[#102B50] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0756A5]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer bg-transparent border-none"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Confirm New Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type new password"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold text-[#102B50] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0756A5]"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl bg-[#0756A5] hover:bg-[#064681] text-white font-bold text-xs sm:text-sm shadow-md transition cursor-pointer border-none flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? <RefreshCw size={15} className="animate-spin" /> : <Lock size={15} />}
                <span>Save New Password</span>
              </button>
            </form>
          </div>

          {/* Account Details & Danger Zone */}
          <div className="space-y-4">
            {/* Account Details */}
            <div
              className="p-5 sm:p-6 rounded-3xl border shadow-sm"
              style={{
                background: isDark ? "rgba(16, 43, 80, 0.65)" : "#ffffff",
                borderColor: isDark ? "rgba(56, 189, 248, 0.2)" : "#e2e8f0"
              }}
            >
              <h3 className="text-base font-bold text-[#102B50] dark:text-white mb-3 flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-500" />
                <span>Account Security & Storage</span>
              </h3>

              <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center justify-between py-1.5 border-b border-slate-200 dark:border-slate-800">
                  <span className="font-semibold text-slate-500 dark:text-slate-400">Account ID</span>
                  <span className="font-mono text-[11px] truncate max-w-[180px]">{currentUser.id}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-200 dark:border-slate-800">
                  <span className="font-semibold text-slate-500 dark:text-slate-400">Database Role</span>
                  <span className="font-bold uppercase tracking-wider">{currentUser.role || "student"}</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-200 dark:border-slate-800">
                  <span className="font-semibold text-slate-500 dark:text-slate-400">Password Encryption</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">bcrypt (10 rounds)</span>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <span className="font-semibold text-slate-500 dark:text-slate-400">Cloud Storage Sync</span>
                  <span className="text-blue-600 dark:text-blue-400 font-bold">PostgreSQL Active</span>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="p-5 sm:p-6 rounded-3xl border border-red-500/30 bg-red-500/5 shadow-sm">
              <h3 className="text-base font-bold text-red-600 dark:text-red-400 mb-1 flex items-center gap-2">
                <Trash2 size={16} />
                <span>Danger Zone</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Deleting your account will permanently remove your progress, bookmarks, and quiz history.
              </p>

              {deleteModalOpen ? (
                <div className="space-y-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-red-500/30">
                  <p className="text-xs font-bold text-red-600 dark:text-red-400">
                    Are you sure? Type <span className="font-mono bg-red-100 dark:bg-red-950 px-1 py-0.5 rounded">DELETE</span> to confirm:
                  </p>
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="Type DELETE"
                    className="w-full px-3 py-2 rounded-xl border border-red-300 dark:border-red-900 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={deleteConfirmText !== "DELETE" || isLoading}
                      onClick={handleDeleteAccount}
                      className="py-2 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs disabled:opacity-50 cursor-pointer border-none"
                    >
                      Permanently Delete
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteModalOpen(false)}
                      className="py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setDeleteModalOpen(true)}
                  className="py-2.5 px-4 rounded-xl bg-red-600/10 hover:bg-red-600/20 text-red-600 dark:text-red-400 font-bold text-xs transition cursor-pointer border border-red-500/30 flex items-center gap-1.5"
                >
                  <Trash2 size={14} />
                  <span>Delete My Account</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 10. Official Certificate Modal */}
      {currentUser && (
        <CertificateModal
          isOpen={showCertificate}
          onClose={() => setShowCertificate(false)}
          studentName={currentUser.name || currentUser.full_name || "Python Learner"}
          completedCount={completedTopicsList.length}
        />
      )}
    </div>
  );
}

