import React, { useState } from "react";
import { ShieldCheck, Lock, Mail, AlertTriangle, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function AdminLogin({ onBackToHome, onSuccess }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password.trim()) {
      setError("Please enter your administrator email and password.");
      return;
    }

    setLoading(true);
    try {
      const user = await login({ emailOrUsername: email.trim(), password });
      if (user.role !== "admin") {
        setError(`Access Denied: Account '${user.email}' is a Student account, not an authorized Administrator.`);
        return;
      }
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || "Invalid credentials. Please verify your email and password.");
    } finally {
      setLoading(false);
    }
  };

  const handleUseDemoAdmin = () => {
    setEmail("ravi@gmail.com");
    setPassword("Ravi@123");
    setError(null);
  };

  return (
    <div className="min-h-screen py-10 sm:py-16 px-3 sm:px-4 flex flex-col items-center justify-center bg-slate-50 dark:bg-[#060c18] text-slate-800 dark:text-slate-100 transition-colors">
      <div className="max-w-md w-full bg-white dark:bg-[#0c182a] border border-slate-200/90 dark:border-[#1a3152] rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        {/* Top ambient glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Icon & Title */}
        <div className="text-center mb-8 relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-white flex items-center justify-center mx-auto mb-4 shadow-xl shadow-blue-500/30 border border-white/20">
            <ShieldCheck size={36} strokeWidth={2.3} />
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            Protected Administrator Area
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Administrator Sign In
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
            Authorized portal for curriculum control, quiz auditing, student supervision, and telemetry.
          </p>
        </div>

        {/* Error notification */}
        {error && (
          <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/80 text-rose-700 dark:text-rose-200 text-xs font-semibold flex items-start gap-2.5">
            <AlertTriangle size={18} className="shrink-0 text-rose-500 mt-0.5" />
            <div className="leading-relaxed">{error}</div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Admin Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail size={16} />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="administrator@domain.com"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-[#102038] border border-slate-200 dark:border-[#1e3960] text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition font-medium"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer bg-transparent border-none p-0"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock size={16} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-[#102038] border border-slate-200 dark:border-[#1e3960] text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-sm shadow-lg shadow-blue-500/30 transition-all cursor-pointer border-none flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            {loading ? (
              <span>Authenticating Session...</span>
            ) : (
              <>
                <span>Access Admin Console</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Demo Admin Quick Shortcut */}
        <div className="mt-6 pt-5 border-t border-slate-200/80 dark:border-[#182c47] text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
            Default platform administrator account configured in database:
          </p>
          <button
            type="button"
            onClick={handleUseDemoAdmin}
            className="w-full py-2 px-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Sparkles size={14} className="text-blue-500" />
            <span>Fill Credentials: <code className="font-mono font-bold">ravi@gmail.com</code></span>
          </button>
        </div>

        {/* Return to website */}
        {onBackToHome && (
          <div className="mt-4 text-center">
            <button
              onClick={onBackToHome}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition cursor-pointer bg-transparent border-none"
            >
              ← Return to Student Learning Area
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
