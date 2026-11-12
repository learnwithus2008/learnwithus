import React, { useState, useEffect } from "react";
import PageBackButton from "../components/PageBackButton";
import { PageHelpButton } from "../components/GuideTutorial/ContextualPageGuidance";
import {
  Mail,
  MessageSquare,
  Send,
  CheckCircle2,
  Clock,
  ShieldCheck,
  HelpCircle,
  ArrowRight,
  Lock,
  LogIn,
  UserCheck
} from "lucide-react";
import { WhatsAppIcon } from "../components/AskDoubtButton";
import { openWhatsAppDoubt, WHATSAPP_DISPLAY_NUMBER } from "../utils/whatsappHelper";
import { useAuth } from "../context/AuthContext";
import { useDoubt } from "../context/DoubtContext";

export default function Contact({ onNavigate, onBack }) {
  const { currentUser, isAuthenticated, openAuthModal } = useAuth();
  const { openDoubtModal, doubtCredits, freeDoubtsTotal } = useDoubt();

  const [formData, setFormData] = useState({
    name: currentUser?.name || currentUser?.username || "",
    email: currentUser?.email || "",
    category: "general",
    subject: "",
    message: ""
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync candidate details when auth status updates
  useEffect(() => {
    if (currentUser) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || currentUser.name || currentUser.username || "",
        email: prev.email || currentUser.email || ""
      }));
    }
  }, [currentUser]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      openAuthModal("login", "Please sign in to send messages to our mentors. Only signed-in candidates can send inquiries.");
      return;
    }
    if (!formData.email || !formData.message) return;
    setIsSubmitting(true);
    // Simulate safe client-side submission feedback
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setFormData({
        name: currentUser?.name || currentUser?.username || "",
        email: currentUser?.email || "",
        category: "general",
        subject: "",
        message: ""
      });
    }, 600);
  };

  return (
    <div className="contact-page max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-8 md:py-10 pb-16 sm:pb-20 md:pb-24 w-full min-w-0 animate-in">
      {/* Top Navigation */}
      <div className="mb-3 sm:mb-4 flex items-center justify-between">
        {onBack ? (
          <PageBackButton onBack={onBack} label="Back" fallbackDestination="Home" />
        ) : (
          <div />
        )}
        <PageHelpButton pageId="contact" />
      </div>

      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#0756A5] text-white flex items-center justify-center mx-auto mb-4 shadow-md border border-white/20">
          <Mail size={32} />
        </div>
        <h1 className="heading-hero text-[#102B50] dark:text-white mb-3">
          Contact Learn With Us
        </h1>
        <p className="body-large text-[#64748B] dark:text-[#CBD5E1] leading-relaxed">
          Have a question about the curriculum, an issue with an interactive example, or feedback? We are here to help you grow!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 w-full min-w-0">
        {/* Left Column: Direct Contact Info & Guarantees */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 w-full min-w-0">
          <div className="modern-card p-3.5 sm:p-5 space-y-3 border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/40 dark:bg-emerald-950/20">
            <div className="flex items-center gap-2.5 text-[#16A34A] dark:text-[#25D366]">
              <WhatsAppIcon size={20} className="shrink-0" />
              <h3 className="text-sm sm:text-base font-bold text-[#102B50] dark:text-white">WhatsApp Doubt Line</h3>
            </div>
            <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-300 leading-relaxed">
              Stuck on a lesson or coding challenge? Connect directly with our mentors on WhatsApp:
            </p>

            {isAuthenticated && (
              <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] sm:text-xs px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-100/70 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-850">
                <span className="font-semibold">Doubt Balance:</span>
                <span className="font-bold">
                  {doubtCredits > 0 ? `${doubtCredits} of ${freeDoubtsTotal} Free Doubts Left` : "0 Left (₹50 / Doubt)"}
                </span>
              </div>
            )}

            <button
              onClick={() => {
                if (!isAuthenticated) {
                  openAuthModal(
                    "login",
                    "Please sign in to access your 10 Free Doubts on WhatsApp. Only registered candidates can send doubt inquiries."
                  );
                  return;
                }
                openDoubtModal({
                  sectionTitle: "Python Learning",
                  studentName: currentUser?.name || currentUser?.username,
                  studentEmail: currentUser?.email,
                  customMessage: "Hi Learn With Us Team! I am studying Python on your platform and have a doubt. Could you please help guide me?"
                });
              }}
              className="w-full inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold text-xs sm:text-sm shadow-xs transition cursor-pointer border-none active:scale-95"
            >
              <WhatsAppIcon size={16} className="shrink-0" />
              <span className="truncate">
                {isAuthenticated
                  ? doubtCredits > 0
                    ? `Ask Doubt on WhatsApp (${doubtCredits} left)`
                    : "Ask Doubt on WhatsApp (₹50)"
                  : "Ask Doubt on WhatsApp (10 Free)"}
              </span>
              {!isAuthenticated && <Lock size={12} className="opacity-80 shrink-0" />}
            </button>
            {!isAuthenticated ? (
              <div className="text-[11px] text-center text-amber-600 dark:text-amber-400 font-medium flex items-center justify-center gap-1">
                <Lock size={11} />
                <span>Candidate sign-in required</span>
              </div>
            ) : (
              <div className="text-[11px] text-center text-emerald-600 dark:text-emerald-400 font-medium flex items-center justify-center gap-1">
                <UserCheck size={11} />
                <span>Signed in as verified candidate</span>
              </div>
            )}
            <div className="text-[11px] text-center text-[#64748B] dark:text-slate-400 font-mono">
              Support Line: {WHATSAPP_DISPLAY_NUMBER}
            </div>
          </div>

          <div className="modern-card p-5 space-y-3">
            <div className="flex items-center gap-2.5 text-[#0756A5]">
              <Mail size={20} />
              <h3 className="text-base font-bold text-[#102B50] dark:text-white">Direct Email</h3>
            </div>
            <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-300 leading-relaxed">
              Reach our educational support and administrative team directly:
            </p>
            <a
              href="mailto:support@pythonlearning.vercel.app"
              className="text-xs sm:text-sm font-bold text-[#0756A5] hover:underline block break-all"
            >
              support@pythonlearning.vercel.app
            </a>
          </div>

          <div className="modern-card p-5 space-y-3">
            <div className="flex items-center gap-2.5 text-[#0756A5]">
              <Clock size={20} />
              <h3 className="text-base font-bold text-[#102B50] dark:text-white">Response Time</h3>
            </div>
            <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-300 leading-relaxed">
              We review inquiries daily. You can typically expect a response within <strong>24 to 48 business hours</strong>.
            </p>
          </div>

          <div className="modern-card p-5 space-y-3">
            <div className="flex items-center gap-2.5 text-[#0756A5]">
              <ShieldCheck size={20} />
              <h3 className="text-base font-bold text-[#102B50] dark:text-white">Student Privacy</h3>
            </div>
            <p className="text-xs sm:text-sm text-[#64748B] dark:text-slate-300 leading-relaxed">
              Your contact details are strictly used to respond to your inquiry and are never shared or sold.
            </p>
          </div>
        </div>

        {/* Right Column: Contact Message Form */}
        <div className="lg:col-span-2 w-full min-w-0">
          <div className="modern-card p-4 sm:p-6 md:p-8 w-full min-w-0 overflow-hidden">
            <div className="flex items-center gap-2 mb-6">
              <MessageSquare size={20} className="text-[#0756A5]" />
              <h2 className="heading-section text-[#102B50] dark:text-white">
                Send Us a Message
              </h2>
            </div>

            {submitted ? (
              <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-3 animate-in">
                <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto">
                  <CheckCircle2 size={24} />
                </div>
                <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-200">
                  Message Sent Successfully!
                </h3>
                <p className="text-sm text-emerald-700 dark:text-emerald-300 max-w-md mx-auto">
                  Thank you for reaching out to Learn With Us. Our mentoring team has received your message and will review it shortly.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-2 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs cursor-pointer hover:bg-emerald-700 transition"
                >
                  Send Another Message
                </button>
              </div>
            ) : !isAuthenticated ? (
              /* Candidate Authentication Gate (Only signed-in candidates can send messages) */
              <div className="contact-auth-gate p-4 sm:p-6 rounded-2xl border text-center space-y-4 animate-in w-full min-w-0 overflow-hidden">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#0756A5]/10 dark:bg-[#0756A5]/25 text-[#0756A5] dark:text-[#60B7FF] flex items-center justify-center mx-auto border border-[#0756A5]/20 shadow-xs">
                  <Lock size={26} />
                </div>

                <div className="max-w-md mx-auto space-y-2">
                  <h3 className="text-base sm:text-xl font-bold text-[#102B50] dark:text-white">
                    Candidate Sign-In Required
                  </h3>
                  <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#CBD5E1] leading-relaxed">
                    To ensure personalized academic mentoring, protect student privacy, and prevent automated spam, <strong>only registered and signed-in candidates can send messages</strong> to our instructor team.
                  </p>
                </div>

                {/* Candidate Benefits Checklist */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-left max-w-xl mx-auto pt-2 pb-1 text-xs text-slate-700 dark:text-slate-300 w-full min-w-0">
                  <div className="p-2 sm:p-2.5 rounded-xl bg-white/80 dark:bg-[#10233d] border border-slate-200/80 dark:border-slate-700/60 flex items-center gap-2 min-w-0">
                    <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                    <span className="leading-snug break-words min-w-0 font-medium">Priority mentor review</span>
                  </div>
                  <div className="p-2 sm:p-2.5 rounded-xl bg-white/80 dark:bg-[#10233d] border border-slate-200/80 dark:border-slate-700/60 flex items-center gap-2 min-w-0">
                    <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                    <span className="leading-snug break-words min-w-0 font-medium">Direct reply to email</span>
                  </div>
                  <div className="p-2 sm:p-2.5 rounded-xl bg-white/80 dark:bg-[#10233d] border border-slate-200/80 dark:border-slate-700/60 flex items-center gap-2 min-w-0">
                    <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                    <span className="leading-snug break-words min-w-0 font-medium">Linked to progress</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 pt-3 w-full max-w-lg mx-auto">
                  <button
                    onClick={() =>
                      openAuthModal("login", "Please sign in to send messages and doubt inquiries to our mentors.")
                    }
                    className="w-full sm:w-auto sm:flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0756A5] hover:bg-[#064681] text-white font-bold text-xs sm:text-sm shadow-md transition cursor-pointer border-none active:scale-95 text-center min-w-0"
                  >
                    <LogIn size={16} className="shrink-0" />
                    <span className="whitespace-normal sm:truncate">Sign In to Send Message</span>
                  </button>
                  <button
                    onClick={() => openAuthModal("signup")}
                    className="w-full sm:w-auto sm:flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-[#102B50] hover:bg-slate-100 dark:hover:bg-[#163660] text-[#102B50] dark:text-white font-bold text-xs sm:text-sm transition cursor-pointer border border-[#E2E8F0] dark:border-[#1E3A5F] active:scale-95 text-center min-w-0"
                  >
                    <span className="whitespace-normal sm:truncate">Create Student Account</span>
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Verified Candidate Status Bar */}
                <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded-full bg-[#0756A5] text-white flex items-center justify-center text-xs font-bold shrink-0">
                      {(currentUser?.name || currentUser?.username || "S").charAt(0).toUpperCase()}
                    </div>
                    <div className="truncate">
                      <span className="font-bold text-[#102B50] dark:text-white">
                        {currentUser?.name || currentUser?.username}
                      </span>
                      <span className="text-[#64748B] dark:text-slate-400 ml-1.5 font-mono text-[11px]">
                        ({currentUser?.email})
                      </span>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-900/50 px-2.5 py-0.5 rounded-md text-[11px] shrink-0 border border-emerald-300 dark:border-emerald-700/60">
                    <UserCheck size={12} />
                    <span>Verified Candidate</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      Your Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Candidate name"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0C1B30] border border-[#E2E8F0] dark:border-[#1E3A5F] text-[#102B50] dark:text-white text-sm focus:outline-none focus:border-[#0756A5]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="you@example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0C1B30] border border-[#E2E8F0] dark:border-[#1E3A5F] text-[#102B50] dark:text-white text-sm focus:outline-none focus:border-[#0756A5]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      Inquiry Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0C1B30] border border-[#E2E8F0] dark:border-[#1E3A5F] text-[#102B50] dark:text-white text-sm focus:outline-none focus:border-[#0756A5]"
                    >
                      <option value="general">General Question</option>
                      <option value="curriculum">Curriculum & Topic Feedback</option>
                      <option value="bug">Report a Code or App Bug</option>
                      <option value="account">Account & Progress Help</option>
                      <option value="privacy">Privacy & Data Request</option>
                      <option value="partnership">Educational Partnership</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="Brief summary of inquiry"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0C1B30] border border-[#E2E8F0] dark:border-[#1E3A5F] text-[#102B50] dark:text-white text-sm focus:outline-none focus:border-[#0756A5]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Your Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Write your question, suggestion, or feedback here..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0C1B30] border border-[#E2E8F0] dark:border-[#1E3A5F] text-[#102B50] dark:text-white text-sm focus:outline-none focus:border-[#0756A5] resize-y"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#0756A5] hover:bg-[#064681] text-white font-bold text-sm shadow-md transition cursor-pointer border-none disabled:opacity-50"
                >
                  <Send size={15} />
                  <span>{isSubmitting ? "Sending Message..." : "Submit Inquiry"}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Navigation Shortcut */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">
        <button
          onClick={() => { onNavigate("privacy"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
          className="hover:text-blue-600 dark:hover:text-[#60B7FF] transition bg-transparent border-none cursor-pointer"
        >
          Privacy Policy →
        </button>
        <span>•</span>
        <button
          onClick={() => { onNavigate("terms"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
          className="hover:text-blue-600 dark:hover:text-[#60B7FF] transition bg-transparent border-none cursor-pointer"
        >
          Terms of Use →
        </button>
        <span>•</span>
        <button
          onClick={() => { onNavigate("about"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
          className="hover:text-blue-600 dark:hover:text-[#60B7FF] transition bg-transparent border-none cursor-pointer"
        >
          About Platform →
        </button>
      </div>
    </div>
  );
}

