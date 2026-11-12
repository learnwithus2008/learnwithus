import React, { useState, useEffect } from "react";
import {
  X,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Flame,
  Award,
  BookOpen,
  Bookmark,
  CheckCircle,
  LogOut,
  Settings,
  HelpCircle,
  RefreshCw,
  Trash2,
  Smile
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { LEARNING_STAGES, getStageById } from "../../data/learningStages";
import { LEARNING_LANGUAGES, getLanguageById } from "../../data/learningLanguages";
import { AVATAR_OPTIONS } from "../../services/authService";
import { useBodyScrollLock } from "../../utils/scrollLock";
import CertificateModal from "../CertificateModal";

export default function AuthModal({ onSelectTopic }) {
  const {
    currentUser,
    isAuthModalOpen,
    authModalMode,
    authNotice,
    closeAuthModal,
    setAuthModalMode,
    login,
    signup,
    logout,
    updateProfile,
    resetPassword,
    deleteAccount
  } = useAuth();

  // Lock background page scrolling while AuthModal is open
  useBodyScrollLock(isAuthModalOpen);

  // Close modal on Escape key press
  useEffect(() => {
    if (!isAuthModalOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") closeAuthModal();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAuthModalOpen, closeAuthModal]);

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginRemember, setLoginRemember] = useState(true);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Signup form state
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");
  const [signupStage, setSignupStage] = useState("young");
  const [signupLanguage, setSignupLanguage] = useState("english");
  const [signupAvatar, setSignupAvatar] = useState("snake_blue");
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  // Profile Edit form state
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editStage, setEditStage] = useState("young");
  const [editLanguage, setEditLanguage] = useState("english");
  const [editAvatar, setEditAvatar] = useState("snake_blue");
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Forgot password form state
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // Feedback states
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);

  // Sync profile edit fields when user logs in
  useEffect(() => {
    if (currentUser) {
      setEditName(currentUser.name || "");
      setEditBio(currentUser.bio || "");
      setEditStage(currentUser.stage || "young");
      setEditLanguage(currentUser.language || "english");
      setEditAvatar(currentUser.avatar || "snake_blue");
    }
  }, [currentUser]);

  // Clear messages when mode or open state changes
  useEffect(() => {
    setErrorMsg("");
    setSuccessMsg("");
    setForgotSuccess(false);
  }, [authModalMode, isAuthModalOpen]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isAuthModalOpen) {
        closeAuthModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAuthModalOpen, closeAuthModal]);

  // AuthModal is strictly reserved for authenticated profile view/edit.
  // Sign In and Sign Up are presented as dedicated separate pages.
  if (!isAuthModalOpen || authModalMode !== "profile" || !currentUser) return null;

  // Password strength calculation
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: "", color: "bg-slate-200" };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass) && /[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 25, label: "Weak", color: "bg-blue-400/50", text: "text-[#93c5fd]" };
    if (score === 2) return { score: 50, label: "Fair", color: "bg-blue-500", text: "text-[#60a5fa]" };
    if (score === 3) return { score: 75, label: "Good", color: "bg-blue-600", text: "text-[#38bdf8]" };
    return { score: 100, label: "Strong", color: "bg-[#38bdf8]", text: "text-[#f8fafc]" };
  };

  const passwordStrength = getPasswordStrength(signupPassword);

  // Submit Login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setIsLoading(true);

    try {
      await login({
        emailOrUsername: loginEmail,
        password: loginPassword,
        rememberMe: loginRemember
      });
      setSuccessMsg("Welcome back!");
    } catch (err) {
      setErrorMsg(err.message || "Failed to sign in");
    } finally {
      setIsLoading(false);
    }
  };

  // Quick Demo Login
  const handleQuickDemo = async (demoEmail, demoPass) => {
    setErrorMsg("");
    setIsLoading(true);
    try {
      await login({
        emailOrUsername: demoEmail,
        password: demoPass,
        rememberMe: true
      });
    } catch (err) {
      setErrorMsg(err.message || "Demo login failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Sign Up
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (signupPassword !== signupConfirmPassword) {
      setErrorMsg("Passwords do not match. Please verify.");
      return;
    }

    setIsLoading(true);

    try {
      await signup({
        name: signupName,
        email: signupEmail,
        password: signupPassword,
        stage: signupStage,
        language: signupLanguage,
        avatar: signupAvatar,
        bio: `Python explorer in ${getStageById(signupStage).label} stage.`
      });
      setSuccessMsg("Account created successfully!");
    } catch (err) {
      setErrorMsg(err.message || "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Profile Update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setIsLoading(true);

    try {
      await updateProfile({
        name: editName,
        bio: editBio,
        stage: editStage,
        language: editLanguage,
        avatar: editAvatar
      });
      setIsEditingProfile(false);
      setSuccessMsg("Profile details updated successfully!");
    } catch (err) {
      setErrorMsg(err.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Forgot Password
  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setIsLoading(true);

    try {
      await resetPassword(forgotEmail, forgotNewPassword);
      setForgotSuccess(true);
      setSuccessMsg("Password reset successfully! You can now log in.");
    } catch (err) {
      setErrorMsg(err.message || "Password reset failed");
    } finally {
      setIsLoading(false);
    }
  };

  const selectedAvatarMeta =
    AVATAR_OPTIONS.find((a) => a.id === (currentUser?.avatar || signupAvatar)) ||
    AVATAR_OPTIONS[0];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/60 dark:bg-black/75 backdrop-blur-sm animate-in"
      onClick={closeAuthModal}
      onWheel={(e) => {
        if (e.target === e.currentTarget) e.preventDefault();
      }}
      onTouchMove={(e) => {
        if (e.target === e.currentTarget) e.preventDefault();
      }}
    >
      <div
        className="relative w-full max-w-lg bg-white dark:bg-[#101b2d] border border-slate-200 dark:border-[#23344d] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] transition-all overscroll-contain"
        onClick={(e) => e.stopPropagation()}
        onWheel={(e) => e.stopPropagation()}
      >
        {/* Header Ribbon / Banner */}
        <div className="relative px-4 sm:px-6 pt-5 sm:pt-6 pb-4 bg-gradient-to-r from-[#002D62] via-[#0056B3] to-[#00A3FF] text-white shrink-0 border-b border-amber-300/25">
          <button
            onClick={closeAuthModal}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer border-none"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-2xl shadow-inner border border-white/20">
              {authModalMode === "profile"
                ? selectedAvatarMeta.emoji
                : authModalMode === "signup"
                ? "✨"
                : authModalMode === "forgot"
                ? "🔑"
                : "🐍"}
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white tracking-tight leading-tight">
                {authModalMode === "login" && "Welcome Back!"}
                {authModalMode === "signup" && "Create Python Account"}
                {authModalMode === "profile" && "Your Learning Profile"}
                {authModalMode === "forgot" && "Reset Password"}
              </h2>
              <p className="text-xs text-blue-100 font-medium mt-0.5">
                {authModalMode === "login" && "Sign in to save your learning progress, XP & bookmarks."}
                {authModalMode === "signup" && "Join Python Adaptive to customize your personalized journey."}
                {authModalMode === "profile" && "Manage your learning stage, stats, and stored account details."}
                {authModalMode === "forgot" && "Enter your email to update your account password."}
              </p>
            </div>
          </div>

          {/* Tab Switcher if not on Profile mode */}
          {authModalMode !== "profile" && (
            <div className="flex bg-black/20 p-1 rounded-xl mt-4 border border-white/15">
              <button
                type="button"
                onClick={() => setAuthModalMode("login")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition text-center cursor-pointer border-none ${
                  authModalMode === "login"
                    ? "bg-white text-blue-950 shadow-sm"
                    : "text-white/80 hover:text-white bg-transparent"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setAuthModalMode("signup")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition text-center cursor-pointer border-none ${
                  authModalMode === "signup"
                    ? "bg-white text-blue-950 shadow-sm"
                    : "text-white/80 hover:text-white bg-transparent"
                }`}
              >
                Create Account
              </button>
            </div>
          )}
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto px-4 sm:px-6 py-4 sm:py-5 flex-1 space-y-4">
          {/* Action notice if triggered from a bookmark/progress button */}
          {authNotice && !currentUser && (
            <div className="p-3 rounded-2xl bg-blue-50 dark:bg-[#14233a] border border-blue-200 dark:border-[#23344d] flex items-start gap-2.5 text-blue-900 dark:text-[#93c5fd] text-xs">
              <Sparkles size={16} className="shrink-0 mt-0.5 text-[#38bdf8]" />
              <span>{authNotice}</span>
            </div>
          )}

          {/* Error & Success alerts */}
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-blue-50 dark:bg-[#14233a] border border-blue-200 dark:border-[#3b82f6] flex items-center gap-2.5 text-blue-900 dark:text-[#93c5fd] text-xs animate-shake">
              <AlertCircle size={16} className="shrink-0 text-[#60a5fa]" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-2xl bg-blue-50 dark:bg-[#14233a] border border-blue-200 dark:border-[#3b82f6] flex items-center gap-2.5 text-blue-900 dark:text-[#60a5fa] text-xs">
              <CheckCircle2 size={16} className="shrink-0 text-[#60a5fa]" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ============================================================ */}
          {/* MODE: SIGN IN FORM */}
          {/* ============================================================ */}
          {authModalMode === "login" && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Email or Username
                </label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="alex@example.com or Alex Johnson"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-[#183657] bg-slate-50 dark:bg-[#081426] text-slate-900 dark:text-[#FFFFFF] text-sm focus:outline-none focus:ring-2 focus:ring-[#00A3FF] transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setAuthModalMode("forgot")}
                    className="text-[11px] font-bold text-[#00A3FF] dark:text-[#60B7FF] hover:underline bg-transparent border-none cursor-pointer p-0"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-[#183657] bg-slate-50 dark:bg-[#081426] text-slate-900 dark:text-[#FFFFFF] text-sm focus:outline-none focus:ring-2 focus:ring-[#00A3FF] transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-transparent border-none cursor-pointer p-1"
                  >
                    {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={loginRemember}
                    onChange={(e) => setLoginRemember(e.target.checked)}
                    className="rounded text-[#00A3FF] focus:ring-[#00A3FF] w-4 h-4 cursor-pointer"
                  />
                  <span>Remember my session</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#00A3FF] to-[#0876E8] hover:from-[#0876E8] hover:to-[#0560c2] text-white font-bold text-sm shadow-md shadow-blue-500/25 transition cursor-pointer border-none flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <RefreshCw size={16} className="animate-spin" />
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              {/* Quick Demo Test Accounts Box */}
              <div className="pt-3 border-t border-slate-200 dark:border-[#23344d]">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-[#94a3b8] mb-2">
                  <Sparkles size={13} className="text-[#38bdf8]" />
                  <span>Quick 1-Click Demo Accounts</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickDemo("alex@example.com", "password123")}
                    className="p-2 rounded-xl bg-slate-50 dark:bg-[#14233a] hover:bg-slate-100 dark:hover:bg-[#1e3252] border border-slate-200 dark:border-[#23344d] text-left transition cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900 dark:text-slate-100">
                      <span>🐍</span>
                      <span>Alex (College)</span>
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                      alex@example.com
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemo("priya@example.com", "password123")}
                    className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-left transition cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900 dark:text-slate-100">
                      <span>✨</span>
                      <span>Priya (Graduate)</span>
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                      priya@example.com
                    </div>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* ============================================================ */}
          {/* MODE: SIGN UP FORM */}
          {/* ============================================================ */}
          {authModalMode === "signup" && (
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    required
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-[#183657] bg-slate-50 dark:bg-[#081426] text-slate-900 dark:text-[#FFFFFF] text-sm focus:outline-none focus:ring-2 focus:ring-[#00A3FF] transition"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="email"
                    required
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-[#183657] bg-slate-50 dark:bg-[#081426] text-slate-900 dark:text-[#FFFFFF] text-sm focus:outline-none focus:ring-2 focus:ring-[#00A3FF] transition"
                  />
                </div>
              </div>

              {/* Password & Strength Bar */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type={showSignupPassword ? "text" : "password"}
                    required
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-[#183657] bg-slate-50 dark:bg-[#081426] text-slate-900 dark:text-[#FFFFFF] text-sm focus:outline-none focus:ring-2 focus:ring-[#00A3FF] transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignupPassword(!showSignupPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-transparent border-none cursor-pointer p-1"
                  >
                    {showSignupPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {signupPassword && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">
                        Strength
                      </span>
                      <span className={`font-bold ${passwordStrength.text}`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-[#102541] h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                        style={{ width: `${passwordStrength.score}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type={showSignupPassword ? "text" : "password"}
                    required
                    value={signupConfirmPassword}
                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-[#183657] bg-slate-50 dark:bg-[#081426] text-slate-900 dark:text-[#FFFFFF] text-sm focus:outline-none focus:ring-2 focus:ring-[#00A3FF] transition"
                  />
                </div>
              </div>

              {/* Pick Learning Stage & Language */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Target Stage
                  </label>
                  <select
                    value={signupStage}
                    onChange={(e) => setSignupStage(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-[#183657] bg-slate-50 dark:bg-[#081426] text-slate-900 dark:text-[#FFFFFF] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#00A3FF] cursor-pointer"
                  >
                    {LEARNING_STAGES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.icon} {s.label} ({s.ageRange})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Preferred Language
                  </label>
                  <select
                    value={signupLanguage}
                    onChange={(e) => setSignupLanguage(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-[#183657] bg-slate-50 dark:bg-[#081426] text-slate-900 dark:text-[#FFFFFF] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#00A3FF] cursor-pointer"
                  >
                    {LEARNING_LANGUAGES.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.icon} {l.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Avatar Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Choose Avatar Icon
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVATAR_OPTIONS.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => setSignupAvatar(a.id)}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition cursor-pointer border ${
                        signupAvatar === a.id
                          ? "bg-[#00A3FF] border-[#60B7FF] text-white shadow-md scale-110"
                          : "bg-slate-100 dark:bg-[#102541] border-slate-200 dark:border-[#183657] text-[#D2DEEC] hover:scale-105"
                      }`}
                      title={a.label}
                    >
                      {a.emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Sign Up Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#00A3FF] to-[#0876E8] hover:from-[#0876E8] hover:to-[#0560c2] text-white font-bold text-sm shadow-md shadow-blue-500/25 transition cursor-pointer border-none flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <RefreshCw size={16} className="animate-spin" />
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>Create Account & Start Learning</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* ============================================================ */}
          {/* MODE: FORGOT PASSWORD */}
          {/* ============================================================ */}
          {authModalMode === "forgot" && (
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Registered Account Email
                </label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="Enter your registered email"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-[#183657] bg-slate-50 dark:bg-[#081426] text-slate-900 dark:text-[#FFFFFF] text-sm focus:outline-none focus:ring-2 focus:ring-[#00A3FF] transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Set New Password
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="password"
                    required
                    value={forgotNewPassword}
                    onChange={(e) => setForgotNewPassword(e.target.value)}
                    placeholder="Enter at least 6 characters"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-[#183657] bg-slate-50 dark:bg-[#081426] text-slate-900 dark:text-[#FFFFFF] text-sm focus:outline-none focus:ring-2 focus:ring-[#00A3FF] transition"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setAuthModalMode("login")}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-[#102541] hover:bg-slate-200 dark:hover:bg-[#183657] text-slate-700 dark:text-[#D2DEEC] font-bold text-xs transition cursor-pointer border-none"
                >
                  Back to Sign In
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#00A3FF] to-[#0876E8] hover:from-[#0876E8] hover:to-[#0560c2] text-white font-bold text-xs shadow-md transition cursor-pointer border-none flex items-center justify-center gap-1.5"
                >
                  {isLoading ? <RefreshCw size={14} className="animate-spin" /> : "Save New Password"}
                </button>
              </div>
            </form>
          )}

          {/* ============================================================ */}
          {/* MODE: USER PROFILE & LEARNING PROGRESS */}
          {/* ============================================================ */}
          {authModalMode === "profile" && currentUser && (
            <div className="space-y-4">
              {/* Profile Card Header (High-contrast, crystal-clear in Light & Dark modes) */}
              <div className="profile-hero-card">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#2563eb] to-[#3b82f6] flex items-center justify-center text-3xl shadow-md shadow-blue-500/25 shrink-0 border-2 border-white dark:border-[#23344d]">
                      {selectedAvatarMeta.emoji}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight truncate">
                        {currentUser.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-[#94a3b8] font-mono mt-0.5 truncate">
                        {currentUser.email}
                      </p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white dark:bg-[#101b2d] text-blue-700 dark:text-[#93c5fd] border border-blue-200 dark:border-[#23344d] shadow-2xs">
                          <span>{getStageById(currentUser.stage).icon}</span>
                          <span>{getStageById(currentUser.stage).label}</span>
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white dark:bg-[#101b2d] text-slate-700 dark:text-[#cbd5e1] border border-slate-200 dark:border-[#23344d] shadow-2xs">
                          <span>{getLanguageById(currentUser.language).icon}</span>
                          <span>{getLanguageById(currentUser.language).label}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    id="tour-profile-edit-btn"
                    onClick={() => setIsEditingProfile(!isEditingProfile)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-[#101b2d] border border-slate-200 dark:border-[#23344d] text-slate-700 dark:text-[#cbd5e1] hover:text-[#3b82f6] dark:hover:text-[#60a5fa] hover:bg-slate-50 dark:hover:bg-[#14233a] transition cursor-pointer shadow-xs shrink-0"
                    title={isEditingProfile ? "Cancel editing" : "Edit Profile (Change Name & Bio)"}
                    aria-label="Edit Profile & Change Name"
                  >
                    <Settings size={15} />
                    <span className="text-xs font-bold">{isEditingProfile ? "Done" : "Edit Name"}</span>
                  </button>
                </div>

                {currentUser.bio && (
                  <p className="text-xs text-slate-600 dark:text-[#cbd5e1] mt-3 pt-2.5 border-t border-slate-200/80 dark:border-[#23344d] italic font-medium">
                    "{currentUser.bio}"
                  </p>
                )}
              </div>

              {/* Learning Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="p-3 rounded-2xl bg-blue-50/60 dark:bg-[#14233a] border border-blue-200/80 dark:border-[#23344d] text-center shadow-2xs">
                  <div className="flex items-center justify-center gap-1 text-[#38bdf8] mb-0.5">
                    <Sparkles size={16} />
                    <span className="font-extrabold text-base text-slate-900 dark:text-white">{currentUser.stats?.xp || 0}</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-600 dark:text-[#94a3b8] uppercase tracking-wider">
                    Total XP
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-blue-50/60 dark:bg-[#14233a] border border-blue-200/80 dark:border-[#23344d] text-center shadow-2xs">
                  <div className="flex items-center justify-center gap-1 text-[#60a5fa] mb-0.5">
                    <Flame size={16} />
                    <span className="font-extrabold text-base text-slate-900 dark:text-white">{currentUser.stats?.streakDays || 1}d</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-600 dark:text-[#94a3b8] uppercase tracking-wider">
                    Streak
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-blue-50/60 dark:bg-[#14233a] border border-blue-200/80 dark:border-[#23344d] text-center shadow-2xs">
                  <div className="flex items-center justify-center gap-1 text-[#3b82f6] mb-0.5">
                    <CheckCircle size={16} />
                    <span className="font-extrabold text-base text-slate-900 dark:text-white">
                      {(currentUser.stats?.completedTopics || []).length}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-600 dark:text-[#94a3b8] uppercase tracking-wider">
                    Completed
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-blue-50/60 dark:bg-[#14233a] border border-blue-200/80 dark:border-[#23344d] text-center shadow-2xs">
                  <div className="flex items-center justify-center gap-1 text-[#93c5fd] mb-0.5">
                    <Bookmark size={16} />
                    <span className="font-extrabold text-base text-slate-900 dark:text-white">
                      {(currentUser.stats?.bookmarkedTopics || []).length}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-600 dark:text-[#94a3b8] uppercase tracking-wider">
                    Saved
                  </span>
                </div>
              </div>

              {/* Official Credential Certificate Trigger */}
              <button
                type="button"
                onClick={() => setShowCertificate(true)}
                className="w-full py-2.5 px-3 rounded-xl bg-[#0756A5] hover:bg-[#064681] text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-2 cursor-pointer border-none"
              >
                <Award size={15} className="text-[#FFB800]" />
                <span>View Official Certificate of Achievement</span>
              </button>

              {/* Edit Profile Form (Expanded on Settings toggle) */}
              {isEditingProfile ? (
                <form onSubmit={handleProfileUpdate} className="p-4 rounded-2xl bg-slate-50 dark:bg-[#14233a] border border-slate-200 dark:border-[#23344d] space-y-3.5">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Settings size={14} className="text-[#3b82f6]" />
                    <span>Edit Profile Details</span>
                  </h4>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-[#cbd5e1] mb-1">
                      Display Name
                    </label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-[#23344d] bg-white dark:bg-[#0c1422] text-xs font-semibold text-slate-900 dark:text-[#f8fafc]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-[#cbd5e1] mb-1">
                      Bio / Goal
                    </label>
                    <input
                      type="text"
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      placeholder="e.g. Learning Python for data science"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-[#23344d] bg-white dark:bg-[#0c1422] text-xs font-semibold text-slate-900 dark:text-[#f8fafc]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-[#cbd5e1] mb-1">
                        Learning Stage
                      </label>
                      <select
                        value={editStage}
                        onChange={(e) => setEditStage(e.target.value)}
                        className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-[#23344d] bg-white dark:bg-[#0c1422] text-xs text-slate-900 dark:text-[#f8fafc]"
                      >
                        {LEARNING_STAGES.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.icon} {s.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-[#cbd5e1] mb-1">
                        Language
                      </label>
                      <select
                        value={editLanguage}
                        onChange={(e) => setEditLanguage(e.target.value)}
                        className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-[#23344d] bg-white dark:bg-[#0c1422] text-xs text-slate-900 dark:text-[#f8fafc]"
                      >
                        {LEARNING_LANGUAGES.map((l) => (
                          <option key={l.id} value={l.id}>
                            {l.icon} {l.shortLabel}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Avatar Picker */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-[#cbd5e1] mb-1">
                      Change Avatar
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {AVATAR_OPTIONS.map((a) => (
                        <button
                          key={a.id}
                          type="button"
                          onClick={() => setEditAvatar(a.id)}
                          className={`w-8 h-8 rounded-xl flex items-center justify-center text-base transition cursor-pointer border ${
                            editAvatar === a.id
                              ? "bg-[#3b82f6] border-[#3b82f6] text-white shadow-sm scale-110"
                              : "bg-white dark:bg-[#0c1422] border-slate-200 dark:border-[#23344d] hover:scale-105"
                          }`}
                        >
                          {a.emoji}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                      className="flex-1 py-2 rounded-xl bg-slate-200 dark:bg-[#14233a] text-slate-700 dark:text-[#cbd5e1] font-bold text-xs transition cursor-pointer border-none"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 py-2 rounded-xl bg-gradient-to-r from-[#2563eb] to-[#3b82f6] text-white font-bold text-xs shadow-md transition cursor-pointer border-none flex items-center justify-center gap-1.5"
                    >
                      {isLoading ? <RefreshCw size={14} className="animate-spin" /> : "Save Changes"}
                    </button>
                  </div>
                </form>
              ) : null}

              {/* Bookmarked Lessons Quick Access */}
              {(currentUser.stats?.bookmarkedTopics || []).length > 0 && (
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#14233a] border border-slate-200 dark:border-[#23344d]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <Bookmark size={14} className="text-[#60a5fa]" />
                      <span>Bookmarked Lessons ({currentUser.stats.bookmarkedTopics.length})</span>
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
                    {currentUser.stats.bookmarkedTopics.map((topicId) => (
                      <button
                        key={topicId}
                        onClick={() => {
                          if (onSelectTopic) onSelectTopic(topicId);
                          closeAuthModal();
                        }}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-[#0c1422] border border-slate-200 dark:border-[#23344d] text-slate-800 dark:text-[#cbd5e1] hover:border-[#3b82f6] hover:text-[#60a5fa] transition cursor-pointer truncate max-w-[200px]"
                      >
                        {topicId.replace(/-/g, " ")}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Account Actions (Sign Out & Delete) */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-[#23344d]">
                <button
                  type="button"
                  onClick={logout}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-[#14233a] hover:bg-slate-200 dark:hover:bg-[#101b2d] text-slate-700 dark:text-[#cbd5e1] text-xs font-bold transition cursor-pointer border-none"
                >
                  <LogOut size={15} />
                  <span>Sign Out</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm("Are you sure you want to delete your account? All progress will be removed.")) {
                      deleteAccount();
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-[#f8fafc] hover:bg-slate-100 dark:hover:bg-[#14233a] text-xs font-bold transition cursor-pointer border-none"
                >
                  <Trash2 size={14} />
                  <span>Delete Account</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Official Certificate Modal */}
      {currentUser && (
        <CertificateModal
          isOpen={showCertificate}
          onClose={() => setShowCertificate(false)}
          studentName={currentUser.name}
          completedCount={(currentUser.stats?.completedTopics || []).length}
        />
      )}
    </div>
  );
}
