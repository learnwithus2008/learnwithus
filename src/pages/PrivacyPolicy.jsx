import React from "react";
import PageBackButton from "../components/PageBackButton";
import { PageHelpButton } from "../components/GuideTutorial/ContextualPageGuidance";
import { ShieldCheck, Lock, Cookie, Eye, UserCheck, Bell, Globe, ArrowRight } from "lucide-react";

export default function PrivacyPolicy({ onNavigate, onBack }) {
  return (
    <div className="privacy-policy-page max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-8 md:py-10 pb-16 sm:pb-20 md:pb-24 w-full min-w-0 animate-in">
      {/* Top Navigation */}
      <div className="mb-3 sm:mb-4 flex items-center justify-between">
        {onBack ? (
          <PageBackButton onBack={onBack} label="Back" fallbackDestination="Home" />
        ) : (
          <div />
        )}
        <PageHelpButton pageId="privacy" />
      </div>

      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-[#0091EA] via-[#0056B3] to-[#002D62] text-white flex items-center justify-center mx-auto mb-4 shadow-md border border-amber-300/30">
          <ShieldCheck size={32} />
        </div>
        <h1 className="heading-hero text-slate-900 dark:text-white mb-3">
          Privacy Policy
        </h1>
        <p className="body-large text-slate-600 dark:text-[#D2DEEC] leading-relaxed">
          Your privacy matters to us. This policy details how Python Adaptive collects, protects, and handles your information, including third-party advertising cookies and cookie controls.
        </p>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-2">
          Last Updated: October 30, 2026 • Effective Date: January 1, 2026
        </p>
      </div>

      {/* Main Policy Content */}
      <div className="modern-card p-6 sm:p-10 mb-8 space-y-8">
        {/* Section 1: Introduction & Scope */}
        <section className="space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#F3F7FC] dark:bg-[#102B50] flex items-center justify-center text-[#0756A5] dark:text-[#FFB800] border border-[#E2E8F0] dark:border-[#1E3A5F]">
              <Eye size={18} />
            </div>
            <h2 className="heading-section text-slate-900 dark:text-white">
              1. Information We Collect
            </h2>
          </div>
          <p className="body-base text-slate-600 dark:text-[#D2DEEC] leading-relaxed">
            Python Adaptive Guide ("we", "our", or "the Platform") is an interactive educational service dedicated to teaching Python programming. We only collect the minimal personal information necessary to deliver educational tracking:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-sm sm:text-base text-slate-600 dark:text-[#D2DEEC]">
            <li>
              <strong>Account Information:</strong> When you register an account, we store your name (or chosen nickname), email address, encrypted password hash (via PBKDF2/bcrypt; plain-text passwords are never stored), avatar choice, and learning preferences (learning stage and language).
            </li>
            <li>
              <strong>Learning Progress & Activity:</strong> Completed curriculum topics, practice quiz scores, study notes, bookmarked topics, and experience points (XP) to maintain your learning streak.
            </li>
            <li>
              <strong>Technical & Device Data:</strong> Anonymized server logs, browser type, device type, IP address, and referrers for server security, performance monitoring, and anti-abuse safeguards.
            </li>
          </ul>
        </section>

        {/* Section 2: Google AdSense & Third-Party Cookies (Strict AdSense Requirement) */}
        <section className="space-y-3 p-5 sm:p-6 rounded-2xl bg-blue-50/60 dark:bg-[#102541]/70 border border-blue-200/80 dark:border-[#183657]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0756A5] text-white flex items-center justify-center">
              <Cookie size={18} />
            </div>
            <h2 className="heading-section text-slate-900 dark:text-white">
              2. Third-Party Advertising & Google AdSense Disclosures
            </h2>
          </div>
          <p className="body-base text-slate-700 dark:text-[#D2DEEC] leading-relaxed">
            In compliance with Google AdSense Publisher Policies, we disclose the following concerning third-party advertising partners:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-sm sm:text-base text-slate-700 dark:text-[#D2DEEC]">
            <li>
              <strong>Third-Party Vendors & Cookies:</strong> Third-party vendors, including Google, use cookies to serve ads based on a user's prior visits to this website or other websites across the Internet.
            </li>
            <li>
              <strong>Advertising Cookies:</strong> Google's use of advertising cookies enables it and its partners to serve ads to our users based on their visit to Learn With Us and/or other sites on the Internet.
            </li>
            <li>
              <strong>Personalized Advertising Opt-Out:</strong> Users may opt out of personalized advertising by visiting{" "}
              <a
                href="https://adssettings.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#0756A5] dark:text-[#FFB800] underline font-semibold hover:opacity-80"
              >
                Google Ads Settings (https://adssettings.google.com)
              </a>
              .
            </li>
            <li>
              <strong>Network Advertising Initiative (NAI):</strong> Alternatively, users can opt out of a third-party vendor's use of cookies for personalized advertising by visiting{" "}
              <a
                href="http://www.aboutads.info/choices/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#0756A5] dark:text-[#FFB800] underline font-semibold hover:opacity-80"
              >
                aboutads.info (http://www.aboutads.info/choices/)
              </a>
              .
            </li>
          </ul>
        </section>

        {/* Section 3: Cookie Usage & Local Storage */}
        <section className="space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#F3F7FC] dark:bg-[#102B50] flex items-center justify-center text-[#0756A5] dark:text-[#FFB800] border border-[#E2E8F0] dark:border-[#1E3A5F]">
              <Lock size={18} />
            </div>
            <h2 className="heading-section text-slate-900 dark:text-white">
              3. Cookies and Local Storage
            </h2>
          </div>
          <p className="body-base text-slate-600 dark:text-[#D2DEEC] leading-relaxed">
            Our application utilizes local browser storage (<code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#081426] text-xs font-mono">localStorage</code>) and secure HTTP session cookies:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-sm sm:text-base text-slate-600 dark:text-[#D2DEEC]">
            <li><strong>Essential Session Cookie:</strong> <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#081426] text-xs font-mono">py_adaptive_session_id</code> is an <code className="text-xs font-mono">HttpOnly</code>, <code className="text-xs font-mono">SameSite=Lax</code> cookie used solely to authenticate your logged-in session securely with our PostgreSQL database.</li>
            <li><strong>UI Preferences:</strong> We store your preferred learning stage (e.g. Young, Teen, College), explanation language (e.g. English, Telugu, Hindi), font scale, and theme (Dark/Light) locally in your browser so you do not have to reconfigure them on every reload.</li>
          </ul>
        </section>

        {/* Section 4: Children's Privacy (COPPA Compliance) */}
        <section className="space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#F3F7FC] dark:bg-[#102B50] flex items-center justify-center text-[#0756A5] dark:text-[#FFB800] border border-[#E2E8F0] dark:border-[#1E3A5F]">
              <UserCheck size={18} />
            </div>
            <h2 className="heading-section text-slate-900 dark:text-white">
              4. Children's Privacy Protection (COPPA / GDPR-K)
            </h2>
          </div>
          <p className="body-base text-slate-600 dark:text-[#D2DEEC] leading-relaxed">
            Learn With Us offers a "Young Explorers (Ages 6-11)" curriculum designed for young learners. We are committed to protecting the privacy of minors:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-sm sm:text-base text-slate-600 dark:text-[#D2DEEC]">
            <li>We do not require children to provide sensitive personal information beyond a basic nickname and email managed with parental or educator guidance.</li>
            <li>We never sell, rent, or trade student data with third parties.</li>
            <li>Parents and guardians can request the immediate inspection, correction, or deletion of their child's account and progress at any time by contacting our support team.</li>
          </ul>
        </section>

        {/* Section 5: Data Security & Retention */}
        <section className="space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#F3F7FC] dark:bg-[#102B50] flex items-center justify-center text-[#0756A5] dark:text-[#FFB800] border border-[#E2E8F0] dark:border-[#1E3A5F]">
              <Globe size={18} />
            </div>
            <h2 className="heading-section text-slate-900 dark:text-white">
              5. Data Security and Retention
            </h2>
          </div>
          <p className="body-base text-slate-600 dark:text-[#D2DEEC] leading-relaxed">
            All communications with Learn With Us are encrypted in transit using industry-standard TLS/SSL encryption. User passwords are one-way hashed before storage. We retain learning records only for as long as your account remains active. You may delete your account and all associated records directly from your profile settings at any time.
          </p>
        </section>

        {/* Section 6: Contact Information */}
        <section className="space-y-3 pt-2 border-t border-slate-100 dark:border-[#183657]">
          <h2 className="heading-section text-slate-900 dark:text-white">
            6. Contacting Us Regarding Privacy
          </h2>
          <p className="body-base text-slate-600 dark:text-[#D2DEEC] leading-relaxed">
            If you have questions, concerns, or requests regarding this Privacy Policy or your personal data, please reach out through our dedicated contact channel:
          </p>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#102541] border border-slate-200 dark:border-[#183657] text-sm text-slate-700 dark:text-slate-300">
            <p className="font-semibold text-slate-900 dark:text-white mb-1">Learn With Us Privacy & Support Office</p>
            <p>Email: <a href="mailto:support@pythonlearning.vercel.app" className="text-[#0756A5] font-semibold underline">support@pythonlearning.vercel.app</a></p>
            <p>Website: <a href="https://pythonlearning.vercel.app" className="text-[#0756A5] font-semibold underline">https://pythonlearning.vercel.app</a></p>
          </div>
        </section>
      </div>

      {/* Bottom Navigation Shortcut */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">
        <button
          onClick={() => { onNavigate("terms"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
          className="hover:text-blue-600 dark:hover:text-[#60B7FF] transition bg-transparent border-none cursor-pointer"
        >
          Terms of Use →
        </button>
        <span>•</span>
        <button
          onClick={() => { onNavigate("contact"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
          className="hover:text-blue-600 dark:hover:text-[#60B7FF] transition bg-transparent border-none cursor-pointer"
        >
          Contact Us →
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

