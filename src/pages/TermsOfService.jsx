import React from "react";
import PageBackButton from "../components/PageBackButton";
import { PageHelpButton } from "../components/GuideTutorial/ContextualPageGuidance";
import { FileText, ShieldAlert, Code2, CheckCircle, Scale, AlertCircle, ArrowRight } from "lucide-react";

export default function TermsOfService({ onNavigate, onBack }) {
  return (
    <div className="terms-page max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-8 md:py-10 pb-16 sm:pb-20 md:pb-24 w-full min-w-0 animate-in">
      {/* Top Navigation */}
      <div className="mb-3 sm:mb-4 flex items-center justify-between">
        {onBack ? (
          <PageBackButton onBack={onBack} label="Back" fallbackDestination="Home" />
        ) : (
          <div />
        )}
        <PageHelpButton pageId="terms" />
      </div>

      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-[#0091EA] via-[#0056B3] to-[#002D62] text-white flex items-center justify-center mx-auto mb-4 shadow-md border border-amber-300/30">
          <FileText size={32} />
        </div>
        <h1 className="heading-hero text-slate-900 dark:text-white mb-3">
          Terms of Service
        </h1>
        <p className="body-large text-slate-600 dark:text-[#D2DEEC] leading-relaxed">
          Please review the terms, rules, and acceptable use guidelines governing your use of Python Adaptive Guide.
        </p>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-2">
          Last Updated: October 30, 2026 • Effective Date: January 1, 2026
        </p>
      </div>

      {/* Main Terms Content */}
      <div className="modern-card p-6 sm:p-10 mb-8 space-y-8">
        {/* Section 1: Agreement to Terms */}
        <section className="space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#F3F7FC] dark:bg-[#102B50] flex items-center justify-center text-[#0756A5] dark:text-[#FFB800] border border-[#E2E8F0] dark:border-[#1E3A5F]">
              <Scale size={18} />
            </div>
            <h2 className="heading-section text-slate-900 dark:text-white">
              1. Agreement to Terms
            </h2>
          </div>
          <p className="body-base text-slate-600 dark:text-[#D2DEEC] leading-relaxed">
            By accessing or using Learn With Us ("the Service", "the Platform"), you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, please do not use the Platform.
          </p>
        </section>

        {/* Section 2: Educational Nature of the Service */}
        <section className="space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#F3F7FC] dark:bg-[#102B50] flex items-center justify-center text-[#0756A5] dark:text-[#FFB800] border border-[#E2E8F0] dark:border-[#1E3A5F]">
              <CheckCircle size={18} />
            </div>
            <h2 className="heading-section text-slate-900 dark:text-white">
              2. Educational Service & Access
            </h2>
          </div>
          <p className="body-base text-slate-600 dark:text-[#D2DEEC] leading-relaxed">
            Learn With Us is an educational platform providing 198 programming topics, 5 age-adapted explanation styles, multi-language guides, quizzes, and project walkthroughs. We offer free preview access to foundational lessons, with full progress tracking, quiz submissions, study notes, and bookmarking available to registered student accounts at no financial cost.
          </p>
        </section>

        {/* Section 3: Interactive Code Runner & Sandbox Disclaimer */}
        <section className="space-y-3 p-5 sm:p-6 rounded-2xl bg-blue-50/60 dark:bg-[#102541]/70 border border-blue-200/80 dark:border-[#183657]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0756A5] text-white flex items-center justify-center">
              <Code2 size={18} />
            </div>
            <h2 className="heading-section text-slate-900 dark:text-white">
              3. Interactive Code Execution Sandbox Disclaimer
            </h2>
          </div>
          <p className="body-base text-slate-700 dark:text-[#D2DEEC] leading-relaxed">
            The platform provides an in-browser code editor and runner for educational demonstrations:
          </p>
          <ul className="list-disc pl-6 space-y-2 text-sm sm:text-base text-slate-700 dark:text-[#D2DEEC]">
            <li>All Python code snippets and live exercises are provided strictly for educational and instructional demonstration purposes.</li>
            <li>Code is executed within a secure, isolated client-side environment. You must not attempt to execute malicious code, infinite resource exhaustion loops, or exploits against the client or server.</li>
            <li>Learn With Us makes no guarantee that code examples are suitable for production, financial, or mission-critical software systems without independent review.</li>
          </ul>
        </section>

        {/* Section 4: Intellectual Property */}
        <section className="space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#F3F7FC] dark:bg-[#102B50] flex items-center justify-center text-[#0756A5] dark:text-[#FFB800] border border-[#E2E8F0] dark:border-[#1E3A5F]">
              <FileText size={18} />
            </div>
            <h2 className="heading-section text-slate-900 dark:text-white">
              4. Intellectual Property Rights
            </h2>
          </div>
          <p className="body-base text-slate-600 dark:text-[#D2DEEC] leading-relaxed">
            All written curricula, adaptive explanations, illustrations, quizzes, visual metaphors, and platform code are the intellectual property of Learn With Us and protected by copyright and intellectual property laws. You may read, print, and use the material for your personal, non-commercial educational study. Re-hosting, bulk scraping, or commercial resale of the curriculum without express written consent is prohibited.
          </p>
        </section>

        {/* Section 5: Acceptable Use */}
        <section className="space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#F3F7FC] dark:bg-[#102B50] flex items-center justify-center text-[#0756A5] dark:text-[#FFB800] border border-[#E2E8F0] dark:border-[#1E3A5F]">
              <ShieldAlert size={18} />
            </div>
            <h2 className="heading-section text-slate-900 dark:text-white">
              5. Acceptable Use Policy
            </h2>
          </div>
          <p className="body-base text-slate-600 dark:text-[#D2DEEC] leading-relaxed">
            When using the Platform, you agree not to:
          </p>
          <ul className="list-disc pl-6 space-y-1.5 text-sm sm:text-base text-slate-600 dark:text-[#D2DEEC]">
            <li>Engage in automated scraping, data extraction, or denial-of-service attempts against our endpoints.</li>
            <li>Attempt to bypass authentication, session authorization, or student progress controls.</li>
            <li>Use the interactive comments, profile bios, or community features to distribute offensive, spam, or unlawful material.</li>
            <li>Impersonate any administrator, teacher, or other learner.</li>
          </ul>
        </section>

        {/* Section 6: Limitation of Liability */}
        <section className="space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#F3F7FC] dark:bg-[#102B50] flex items-center justify-center text-[#0756A5] dark:text-[#FFB800] border border-[#E2E8F0] dark:border-[#1E3A5F]">
              <AlertCircle size={18} />
            </div>
            <h2 className="heading-section text-slate-900 dark:text-white">
              6. Disclaimer of Warranties & Limitation of Liability
            </h2>
          </div>
          <p className="body-base text-slate-600 dark:text-[#D2DEEC] leading-relaxed">
            The platform is provided on an "as is" and "as available" basis without warranties of any kind, either express or implied. To the maximum extent permitted by applicable law, Learn With Us and its contributors disclaim liability for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use this educational service.
          </p>
        </section>

        {/* Section 7: Inquiries */}
        <section className="space-y-3 pt-2 border-t border-slate-100 dark:border-[#183657]">
          <h2 className="heading-section text-slate-900 dark:text-white">
            7. Contact & Inquiries
          </h2>
          <p className="body-base text-slate-600 dark:text-[#D2DEEC] leading-relaxed">
            For legal inquiries or questions regarding these terms, please contact:
          </p>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#102541] border border-slate-200 dark:border-[#183657] text-sm text-slate-700 dark:text-slate-300">
            <p className="font-semibold text-slate-900 dark:text-white mb-1">Learn With Us Legal & Operations</p>
            <p>Email: <a href="mailto:support@pythonlearning.vercel.app" className="text-[#0756A5] font-semibold underline">support@pythonlearning.vercel.app</a></p>
            <p>Website: <a href="https://pythonlearning.vercel.app" className="text-[#0756A5] font-semibold underline">https://pythonlearning.vercel.app</a></p>
          </div>
        </section>
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

