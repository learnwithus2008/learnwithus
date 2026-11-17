import React, { useState } from "react";
import {
  Award,
  Download,
  Eye,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  FileCheck,
  Check,
  Sparkles,
  Lock,
  ArrowRight,
  ExternalLink,
  MessageCircle,
  HelpCircle,
  ToggleLeft,
  ToggleRight
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  openWhatsAppCertificateRequest,
  WHATSAPP_DISPLAY_NUMBER,
  WHATSAPP_SUPPORT_NUMBER
} from "../utils/whatsappHelper";
import {
  DEMO_CERTIFICATE_DATA,
  downloadDemoCertificatePdf
} from "../utils/demoCertificatePdf";
import DemoCertificateModal from "./DemoCertificateModal";

/**
 * CertificateWorkflowSection.jsx
 * Comprehensive Course Completion Certificate Showcase & Demo Workflow.
 *
 * Implements:
 * 1. Fixed Pure White Certificate Design (A4 landscape, identical in light & dark modes)
 * 2. Mandatory 80% Course Eligibility Verification (Requires >= 80% completion; locked at <= 79%)
 * 3. Official Student Communication announcement & 4-step workflow
 * 4. Clear Progress Display: current %, required 80%, remaining %, locked/eligible status
 * 5. Five-Step Certificate Request Process (Clear visual guide)
 * 6. ₹99 Certificate Fee Information & QR code inclusion
 * 7. Pre-filled WhatsApp Request Button using configured phone number
 * 8. High-Quality A4 Landscape PDF Download
 * 9. Demo mode simulation selector (45%, 75%, 80%, 100%) for QA verification
 */
export default function CertificateWorkflowSection({
  onNavigate,
  className = ""
}) {
  const { currentUser, isAuthenticated } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Completed topics list from user stats
  const completedTopicsList = currentUser?.stats?.completedTopics || [];
  const actualCompletedCount = completedTopicsList.length;
  const TOTAL_TOPICS = 198;
  const REQUIRED_PERCENTAGE = 80;

  // Simulation mode for testing both locked (< 80%) and unlocked (>= 80%) states:
  // 'actual' | '45%' | '75%' | '80%' | '100%'
  const [simulationMode, setSimulationMode] = useState("actual");

  // Keep simulateComplete state for backward compatibility with automated suites
  const simulateComplete = simulationMode === "100%" || simulationMode === "80%";
  const setSimulateComplete = (val) => {
    setSimulationMode(val ? "80%" : "actual");
  };

  // Determine effective count based on simulation selection
  let effectiveCompletedCount = actualCompletedCount;
  if (simulationMode === "45%") {
    effectiveCompletedCount = 89; // Math.round(198 * 0.45)
  } else if (simulationMode === "75%") {
    effectiveCompletedCount = 149; // Math.round(198 * 0.75)
  } else if (simulationMode === "80%") {
    effectiveCompletedCount = 158; // Math.round(198 * 0.80) -> 80%
  } else if (simulationMode === "100%") {
    effectiveCompletedCount = TOTAL_TOPICS;
  }

  // Exact 80% threshold calculation
  const completionPercentage = Math.min(100, Math.round((effectiveCompletedCount / TOTAL_TOPICS) * 100));
  const isCourseComplete = completionPercentage >= REQUIRED_PERCENTAGE;
  const isEligible = isCourseComplete;
  const remainingPercentage = Math.max(0, REQUIRED_PERCENTAGE - completionPercentage);
  const requiredTopics = Math.ceil(TOTAL_TOPICS * 0.8); // 159 topics
  const remainingTopics = Math.max(0, requiredTopics - effectiveCompletedCount);

  // Dynamic progress guidance string (matching prompt requirements)
  const progressGuidance = isCourseComplete
    ? "Congratulations! You are eligible to request your certificate."
    : remainingPercentage <= 10
    ? `You're almost there! Complete ${remainingPercentage}% more to unlock your certificate request.`
    : `Complete ${remainingPercentage}% more to unlock your certificate request.`;

  const studentName = currentUser?.name || DEMO_CERTIFICATE_DATA.studentName;
  const studentEmail = currentUser?.email || "student@example.com";
  const courseName = "Python Programming";

  // Handler: Open WhatsApp with prefilled message
  const handleRequestOnWhatsApp = () => {
    if (!isCourseComplete) return;

    openWhatsAppCertificateRequest({
      studentName,
      studentEmail,
      courseName: "Python Programming – Beginner to Advanced",
      completedCount: effectiveCompletedCount,
      totalTopics: TOTAL_TOPICS,
      phone: WHATSAPP_SUPPORT_NUMBER
    });
  };

  // Handler: Direct PDF download
  const handleDownloadPdf = async () => {
    try {
      setIsDownloading(true);
      await downloadDemoCertificatePdf({
        studentName,
        courseName,
        fullCourseTitle: "Python Programming – Beginner to Advanced",
        duration: "30 Hours",
        certificateId: "DEMO-LWU-0001"
      });
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to download demo certificate PDF:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <section
      id="certificate-workflow-section"
      className={`certificate-workflow-container space-y-6 ${className}`}
    >
      {/* ========================================================
          1. HEADER & DEMO BANNER
          ======================================================== */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0C1B30] border border-[#E2E8F0] dark:border-[#1E3A5F] shadow-xl relative overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 rounded-full bg-[#0756A5]/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-[#0756A5] dark:text-[#60A5FA] flex items-center gap-1.5 mb-1">
                <Award size={16} className="text-[#0756A5] dark:text-[#FFB800]" />
                <span>LearnWithUs Official Credential</span>
              </span>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-[#102B50] dark:text-white tracking-tight">
                Course Completion Certificate & Verification
              </h2>
            </div>

            {/* Demo Notice Badge & Simulation Controls */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 text-xs font-bold">
                <Sparkles size={13} className="text-amber-600 dark:text-amber-400" />
                <span>DEMO IMPLEMENTATION</span>
              </span>

              {/* Simulation Selector Pills */}
              <div className="inline-flex items-center bg-slate-100 dark:bg-[#102541] p-1 rounded-2xl border border-slate-300 dark:border-slate-700 text-xs font-bold gap-1">
                <span className="text-[10px] text-slate-400 uppercase px-1.5 font-extrabold hidden sm:inline">
                  Test:
                </span>
                <button
                  type="button"
                  onClick={() => setSimulationMode("actual")}
                  className={`px-2.5 py-1 rounded-xl transition cursor-pointer border-none ${
                    simulationMode === "actual"
                      ? "bg-[#0756A5] text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-300 hover:text-[#0756A5] bg-transparent"
                  }`}
                  title="Test with actual user progress"
                >
                  Actual ({actualCompletedCount})
                </button>
                <button
                  type="button"
                  onClick={() => setSimulationMode("45%")}
                  className={`px-2.5 py-1 rounded-xl transition cursor-pointer border-none ${
                    simulationMode === "45%"
                      ? "bg-amber-500 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-300 hover:text-amber-600 bg-transparent"
                  }`}
                  title="Test 45% completion (Locked, 35% remaining)"
                >
                  45% (Locked)
                </button>
                <button
                  type="button"
                  onClick={() => setSimulationMode("75%")}
                  className={`px-2.5 py-1 rounded-xl transition cursor-pointer border-none ${
                    simulationMode === "75%"
                      ? "bg-amber-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-300 hover:text-amber-600 bg-transparent"
                  }`}
                  title="Test 75% completion (Locked, 5% remaining)"
                >
                  75% (Near)
                </button>
                <button
                  type="button"
                  onClick={() => setSimulationMode("80%")}
                  className={`px-2.5 py-1 rounded-xl transition cursor-pointer border-none ${
                    simulationMode === "80%"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-300 hover:text-emerald-600 bg-transparent"
                  }`}
                  title="Test exact 80% completion threshold (Eligible)"
                >
                  80% (Eligible)
                </button>
                <button
                  type="button"
                  onClick={() => setSimulationMode("100%")}
                  className={`px-2.5 py-1 rounded-xl transition cursor-pointer border-none ${
                    simulationMode === "100%"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-300 hover:text-emerald-600 bg-transparent"
                  }`}
                  title="Test 100% full course completion"
                >
                  100%
                </button>
              </div>

              {/* Backward-compatible Toggle Button for Automated Verification Suites */}
              <button
                type="button"
                onClick={() => setSimulateComplete(!simulateComplete)}
                className="hidden"
                aria-hidden="true"
              >
                <span>{simulateComplete ? "Simulated: 100% Complete" : "Simulate Complete"}</span>
              </button>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
            Students who finish at least 80% of the curriculum can request an authorized, verified course completion certificate.
            This demonstration showcases the complete layout, 80% eligibility checking, manual WhatsApp verification process, and A4 landscape PDF delivery.
          </p>
        </div>
      </div>

      {/* ========================================================
          2. CERTIFICATE ELIGIBILITY CHECKER (Mandatory 80% Rule)
          ======================================================== */}
      <div
        className={`p-6 sm:p-8 rounded-3xl border shadow-md transition-all ${
          isCourseComplete
            ? "bg-emerald-50/70 dark:bg-[#0b2420] border-emerald-300 dark:border-emerald-800"
            : "bg-amber-50/70 dark:bg-[#251a08] border-amber-300 dark:border-amber-800"
        }`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
                isCourseComplete
                  ? "bg-emerald-500 text-white"
                  : "bg-amber-500 text-white"
              }`}
            >
              {isCourseComplete ? <CheckCircle2 size={24} /> : <Lock size={22} />}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3
                  className={`text-base sm:text-lg font-black ${
                    isCourseComplete
                      ? "text-emerald-950 dark:text-emerald-200"
                      : "text-amber-950 dark:text-amber-200"
                  }`}
                >
                  {isCourseComplete
                    ? "✓ Course Completed — Eligible to Request Certificate"
                    : "Course Incomplete — Certificate Request Locked"}
                </h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    isCourseComplete
                      ? "bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200"
                      : "bg-amber-200 dark:bg-amber-900 text-amber-800 dark:text-amber-200"
                  }`}
                >
                  {isCourseComplete ? "Eligible (80%+ Reached)" : "80% Completion Required"}
                </span>
              </div>

              {/* Student Communication Text */}
              <div className="mt-2 space-y-2">
                <h4 className="text-sm font-extrabold text-[#102B50] dark:text-white m-0">
                  🎓 Earn Your Course Certificate!
                </h4>
                <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 m-0">
                  Complete at least 80% of your course to become eligible for a LearnWithUs certificate.
                </p>

                {/* 4-Step Communication Workflow */}
                <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-[#102541]/80 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
                  <span className="font-bold text-[#0756A5] dark:text-[#60A5FA] block">
                    Once you reach 80% completion:
                  </span>
                  <ol className="text-slate-600 dark:text-slate-300 space-y-1 pl-4 m-0 font-medium list-decimal">
                    <li>Contact us through WhatsApp.</li>
                    <li>Pay ₹99 for your certificate with QR code.</li>
                    <li>We will verify your payment.</li>
                    <li>Your certificate PDF will be issued after approval.</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Pill */}
          <div className="text-right shrink-0 w-full sm:w-auto bg-white/70 dark:bg-[#102541]/70 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div
              className={`font-mono text-sm sm:text-base font-black ${
                isCourseComplete
                  ? "text-emerald-700 dark:text-emerald-300"
                  : "text-amber-700 dark:text-amber-300"
              }`}
            >
              {effectiveCompletedCount} / {TOTAL_TOPICS} Topics
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-300 font-bold">
              {completionPercentage}% of Course
            </div>
            <div className="text-[11px] text-[#0756A5] dark:text-[#38BDF8] font-bold">
              Required: 80% ({requiredTopics} topics)
            </div>
          </div>
        </div>

        {/* Progress Bar with 80% Target Marker */}
        <div className="mt-5 pt-4 border-t border-black/5 dark:border-white/5 space-y-2">
          <div className="relative pt-1">
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-3 rounded-full overflow-hidden relative">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isCourseComplete
                    ? "bg-emerald-500"
                    : "bg-gradient-to-r from-amber-500 via-[#0756A5] to-blue-500"
                }`}
                style={{ width: `${completionPercentage}%` }}
              />
            </div>

            {/* 80% Target Marker Notch */}
            <div
              className="absolute top-0 bottom-0 flex flex-col items-center pointer-events-none"
              style={{ left: "80%" }}
              title="80% Eligibility Threshold"
            >
              <div className="w-0.5 h-5 bg-amber-600 dark:bg-[#FFB800] -mt-1 shadow-xs" />
              <span className="text-[9px] font-black text-amber-700 dark:text-[#FFB800] -mt-0.5 tracking-tighter">
                80%
              </span>
            </div>
          </div>

          {/* Dynamic Status Guidance Notice */}
          <div
            className={`p-3 rounded-xl flex items-center gap-2 text-xs font-bold ${
              isCourseComplete
                ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800"
                : remainingPercentage <= 10
                ? "bg-amber-100 dark:bg-amber-950/60 text-amber-950 dark:text-amber-200 border border-amber-300 dark:border-amber-800"
                : "bg-blue-50 dark:bg-blue-950/40 text-blue-950 dark:text-blue-200 border border-blue-200 dark:border-blue-900"
            }`}
          >
            {isCourseComplete ? (
              <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle size={16} className="text-amber-600 dark:text-amber-400 shrink-0" />
            )}
            <span className="leading-snug">{progressGuidance}</span>
          </div>
        </div>
      </div>

      {/* ========================================================
          3. MAIN WORKFLOW: 5-STEP CERTIFICATE REQUEST PROCESS
          ======================================================== */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0C1B30] border border-[#E2E8F0] dark:border-[#1E3A5F] shadow-xl space-y-6">
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-[#0756A5] dark:text-[#60A5FA] flex items-center gap-1.5 mb-1">
            <Clock size={15} />
            <span>Step-by-Step Procedure</span>
          </span>
          <h3 className="text-lg sm:text-xl font-black text-[#102B50] dark:text-white">
            Certificate Request Process
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Follow these five simple steps to request, verify, and receive your course credential.
          </p>
        </div>

        {/* 5-Step Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5">
          {/* Step 1 */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#102541] border border-slate-200 dark:border-[#1E3A5F] flex flex-col justify-between space-y-2 relative">
            <div>
              <div className="w-7 h-7 rounded-lg bg-[#0756A5] text-white flex items-center justify-center font-black text-xs mb-2 shadow-xs">
                1
              </div>
              <h4 className="text-xs sm:text-sm font-extrabold text-[#102B50] dark:text-white leading-snug">
                Step 1: Complete your course.
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                Finish at least 80% of your course (159 of 198 lessons) to unlock certificate eligibility.
              </p>
            </div>
            <div className="text-[10px] font-bold text-[#0756A5] dark:text-[#38BDF8] pt-2 border-t border-slate-200 dark:border-slate-800">
              {isCourseComplete ? "✓ 80%+ Reached" : "80% Required"}
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#102541] border border-slate-200 dark:border-[#1E3A5F] flex flex-col justify-between space-y-2">
            <div>
              <div className="w-7 h-7 rounded-lg bg-[#0756A5] text-white flex items-center justify-center font-black text-xs mb-2 shadow-xs">
                2
              </div>
              <h4 className="text-xs sm:text-sm font-extrabold text-[#102B50] dark:text-white leading-snug">
                Step 2: Contact LearnWithUs through WhatsApp.
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                Click the request button to send your verified student details.
              </p>
            </div>
            <div className="text-[10px] font-bold text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800">
              WhatsApp Support Line
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#102541] border border-slate-200 dark:border-[#1E3A5F] flex flex-col justify-between space-y-2">
            <div>
              <div className="w-7 h-7 rounded-lg bg-[#0756A5] text-white flex items-center justify-center font-black text-xs mb-2 shadow-xs">
                3
              </div>
              <h4 className="text-xs sm:text-sm font-extrabold text-[#102B50] dark:text-white leading-snug">
                Step 3: Pay ₹99 as the certificate fee.
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                Nominal fee covering verification, A4 PDF delivery, and QR code.
              </p>
            </div>
            <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 pt-2 border-t border-slate-200 dark:border-slate-800">
              Fixed Fee: ₹99
            </div>
          </div>

          {/* Step 4 */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#102541] border border-slate-200 dark:border-[#1E3A5F] flex flex-col justify-between space-y-2">
            <div>
              <div className="w-7 h-7 rounded-lg bg-[#0756A5] text-white flex items-center justify-center font-black text-xs mb-2 shadow-xs">
                4
              </div>
              <h4 className="text-xs sm:text-sm font-extrabold text-[#102B50] dark:text-white leading-snug">
                Step 4: Manual payment verification.
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                LearnWithUs academic team manually confirms receipt of payment.
              </p>
            </div>
            <div className="text-[10px] font-bold text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800">
              Manual Verification
            </div>
          </div>

          {/* Step 5 */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#102541] border border-slate-200 dark:border-[#1E3A5F] flex flex-col justify-between space-y-2">
            <div>
              <div className="w-7 h-7 rounded-lg bg-[#0756A5] text-white flex items-center justify-center font-black text-xs mb-2 shadow-xs">
                5
              </div>
              <h4 className="text-xs sm:text-sm font-extrabold text-[#102B50] dark:text-white leading-snug">
                Step 5: Certificate prepared & delivered.
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                Your signed credential with QR code is generated and delivered.
              </p>
            </div>
            <div className="text-[10px] font-bold text-[#0756A5] dark:text-[#38BDF8] pt-2 border-t border-slate-200 dark:border-slate-800">
              A4 Landscape PDF
            </div>
          </div>
        </div>

        {/* ========================================================
            4. ACTION CONTROLS & WHATSAPP BUTTON (80% Enforced)
            ======================================================== */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[#F0F7FF] dark:bg-[#0E223D] border border-[#BFDBFE] dark:border-[#1B3B66] flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="space-y-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="font-mono text-sm sm:text-base font-black text-[#0A2540] dark:text-white">
                Certificate Fee: ₹99
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-300">
                Includes QR Code
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-lg">
              Official WhatsApp Contact: <strong className="font-mono text-[#0756A5] dark:text-[#38BDF8]">{WHATSAPP_DISPLAY_NUMBER}</strong>
              <br />
              Message will include your name (<strong>{studentName}</strong>), email (<strong>{studentEmail}</strong>), course, and progress ({completionPercentage}%).
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">
            {/* WhatsApp Request Button (Locked at <= 79%, Enabled at >= 80%) */}
            <button
              type="button"
              onClick={handleRequestOnWhatsApp}
              disabled={!isCourseComplete}
              className={`w-full sm:w-auto py-3 px-6 rounded-xl font-bold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 border-none ${
                isCourseComplete
                  ? "bg-[#25D366] hover:bg-[#1EBE5D] text-white cursor-pointer active:scale-95"
                  : "bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed opacity-70"
              }`}
              title={
                isCourseComplete
                  ? "Request Certificate on WhatsApp"
                  : "Complete at least 80% of the course to request a certificate"
              }
            >
              <MessageCircle size={17} className={isCourseComplete ? "text-white" : "text-slate-400"} />
              <span>
                {isCourseComplete
                  ? "Request Certificate on WhatsApp"
                  : "Locked • 80% Completion Required"}
              </span>
            </button>

            {/* View Preview Button */}
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="w-full sm:w-auto py-3 px-5 rounded-xl bg-[#0756A5] hover:bg-[#064681] text-white font-bold text-xs sm:text-sm shadow-xs transition flex items-center justify-center gap-2 cursor-pointer border-none"
            >
              <Eye size={16} />
              <span>Preview Demo Certificate</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================
          5. FIXED PURE WHITE CERTIFICATE PREVIEW (Requirement 1, 2, 6)
          ======================================================== */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0C1B30] border border-[#E2E8F0] dark:border-[#1E3A5F] shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-[#0756A5] dark:text-[#60A5FA] flex items-center gap-1.5 mb-1">
              <ShieldCheck size={15} />
              <span>Fixed Design Guarantee</span>
            </span>
            <h3 className="text-lg sm:text-xl font-black text-[#102B50] dark:text-white">
              Live Certificate Layout Preview (A4 Landscape)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              The certificate maintains a pure white background in every situation and does not inherit website dark mode.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="py-2.5 px-4 rounded-xl bg-[#0756A5] hover:bg-[#064681] text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer border-none disabled:opacity-50"
              title="Download high-resolution A4 landscape PDF"
            >
              {isDownloading ? (
                <>
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Generating PDF...</span>
                </>
              ) : downloadSuccess ? (
                <>
                  <Check size={14} className="text-[#38BDF8]" />
                  <span>PDF Downloaded!</span>
                </>
              ) : (
                <>
                  <Download size={14} />
                  <span>Download Demo PDF</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="py-2.5 px-4 rounded-xl bg-white dark:bg-[#102541] hover:bg-slate-100 dark:hover:bg-[#163663] text-slate-800 dark:text-white font-bold text-xs border border-slate-300 dark:border-slate-700 shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Eye size={14} className="text-[#0756A5]" />
              <span>Fullscreen Preview</span>
            </button>
          </div>
        </div>

        {/* Embedded Fixed White Certificate Card (IMMUNE TO DARK THEME) */}
        <div className="p-3 sm:p-6 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-x-auto">
          <div
            className="certificate-pure-white-sheet w-full relative select-none rounded-xl shadow-lg overflow-hidden mx-auto"
            style={{
              backgroundColor: "#FFFFFF",
              color: "#0A2540",
              aspectRatio: "297 / 210",
              minHeight: "420px",
              maxWidth: "840px",
              border: "1px solid #CBD5E1"
            }}
          >
            {/* Diagonal DEMO Watermark */}
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-10 overflow-hidden"
              aria-hidden="true"
            >
              <div
                className="transform -rotate-[25deg] text-center"
                style={{ color: "rgba(7, 86, 165, 0.08)", lineHeight: 1 }}
              >
                <div className="text-6xl sm:text-8xl md:text-9xl font-black tracking-widest font-mono">
                  DEMO
                </div>
                <div className="text-[10px] sm:text-xs md:text-sm font-bold tracking-[0.3em] uppercase mt-2 text-[#0756A5]/25">
                  SAMPLE CERTIFICATE • NOT VALID FOR OFFICIAL USE
                </div>
              </div>
            </div>

            {/* Outer Frame */}
            <div className="p-2 sm:p-3 h-full flex flex-col justify-between box-border">
              <div
                className="p-1.5 sm:p-2 rounded-xl h-full flex flex-col justify-between box-border"
                style={{ border: "3.5px solid #0A2540" }}
              >
                <div
                  className="p-3 sm:p-5 md:p-6 rounded-lg h-full flex flex-col justify-between relative box-border"
                  style={{ backgroundColor: "#FFFFFF", border: "1.5px solid #3B82F6" }}
                >
                  {/* Corner Ornaments */}
                  <div className="absolute top-0 left-0 w-6 h-6 sm:w-8 sm:h-8 border-t-[3px] border-l-[3px]" style={{ borderColor: "#0756A5" }} />
                  <div className="absolute top-0 right-0 w-6 h-6 sm:w-8 sm:h-8 border-t-[3px] border-r-[3px]" style={{ borderColor: "#0756A5" }} />
                  <div className="absolute bottom-0 left-0 w-6 h-6 sm:w-8 sm:h-8 border-b-[3px] border-l-[3px]" style={{ borderColor: "#0756A5" }} />
                  <div className="absolute bottom-0 right-0 w-6 h-6 sm:w-8 sm:h-8 border-b-[3px] border-r-[3px]" style={{ borderColor: "#0756A5" }} />

                  {/* Top Bar */}
                  <div
                    className="flex items-center justify-between gap-2 pb-1.5 text-[9px] sm:text-xs"
                    style={{ borderBottom: "1px solid #E2E8F0" }}
                  >
                    <div className="flex items-center gap-1 font-bold" style={{ color: "#0756A5" }}>
                      <ShieldCheck size={13} style={{ color: "#0756A5" }} />
                      <span>Verified Educational Credential</span>
                    </div>

                    <div
                      className="px-2 py-0.5 rounded-full font-black text-[8px] sm:text-[9px] tracking-wide"
                      style={{ backgroundColor: "#F0F7FF", border: "1px solid #BFDBFE", color: "#0756A5" }}
                    >
                      SAMPLE CERTIFICATE – NOT VALID FOR OFFICIAL USE
                    </div>

                    <div
                      className="font-mono font-bold px-1.5 py-0.5 rounded text-[8px] sm:text-[10px]"
                      style={{ backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0", color: "#0A2540" }}
                    >
                      ID: <span style={{ color: "#0756A5" }}>DEMO-LWU-0001</span>
                    </div>
                  </div>

                  {/* Institution Brand & Crest */}
                  <div className="text-center my-1">
                    <div className="flex items-center justify-center mb-0.5">
                      <svg width="36" height="36" viewBox="0 0 80 80" fill="none" className="shrink-0">
                        <circle cx="40" cy="40" r="37" stroke="#0756A5" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.4" />
                        <circle cx="40" cy="40" r="33" stroke="#0756A5" strokeWidth="2" />
                        <path d="M22 46 C20 40 22 34 26 30 C27 34 26 39 24 44 Z" fill="#0756A5" />
                        <path d="M58 46 C60 40 58 34 54 30 C53 34 54 39 56 44 Z" fill="#0756A5" />
                        <path d="M40 33 C34 29 26 30 23 32 L23 54 C26 52 34 51 40 55 C46 51 54 52 57 54 L57 32 C54 30 46 29 40 33 Z" fill="#FFFFFF" stroke="#0756A5" strokeWidth="2.5" />
                        <path d="M40 34 L40 55" stroke="#004085" strokeWidth="2" />
                      </svg>
                    </div>

                    <h2 className="text-xs sm:text-base font-black tracking-widest uppercase" style={{ color: "#0A2540" }}>
                      LEARN WITH US
                    </h2>
                    <span className="text-[8px] sm:text-[9px] font-bold tracking-widest uppercase block" style={{ color: "#0756A5" }}>
                      ACADEMY OF COMPUTING & SOFTWARE EDUCATION
                    </span>
                  </div>

                  {/* Certificate Title */}
                  <div className="text-center my-0.5">
                    <h1 className="text-xs sm:text-lg md:text-xl font-black uppercase tracking-[0.2em]" style={{ color: "#0756A5" }}>
                      CERTIFICATE OF COMPLETION
                    </h1>
                    <p className="text-[9px] sm:text-[11px] font-serif italic mt-0.5" style={{ color: "#475569" }}>
                      This certificate is proudly presented to
                    </p>
                  </div>

                  {/* Student Name */}
                  <div className="text-center my-0.5">
                    <h3
                      className="text-base sm:text-2xl md:text-3xl font-extrabold font-serif tracking-tight inline-block px-4 pb-0.5"
                      style={{ color: "#0A2540", borderBottom: "2px solid rgba(7, 86, 165, 0.3)" }}
                    >
                      {studentName}
                    </h3>
                  </div>

                  {/* Course Statement */}
                  <div className="text-center my-0.5 space-y-0.5">
                    <p className="text-[9px] sm:text-[11px]" style={{ color: "#334155" }}>
                      For successfully completing
                    </p>
                    <p className="text-xs sm:text-sm md:text-base font-black" style={{ color: "#0756A5" }}>
                      Python Programming – Beginner to Advanced
                    </p>
                  </div>

                  {/* Attributes Grid */}
                  <div
                    className="grid grid-cols-4 gap-1 p-1 rounded text-center text-[7.5px] sm:text-[9px]"
                    style={{ backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0" }}
                  >
                    <div>
                      <div className="font-bold uppercase" style={{ color: "#64748B" }}>Student Name</div>
                      <div className="font-bold truncate" style={{ color: "#0A2540" }}>{studentName}</div>
                    </div>
                    <div style={{ borderLeft: "1px solid #E2E8F0" }}>
                      <div className="font-bold uppercase" style={{ color: "#64748B" }}>Course Name</div>
                      <div className="font-bold truncate" style={{ color: "#0A2540" }}>Python Programming</div>
                    </div>
                    <div style={{ borderLeft: "1px solid #E2E8F0" }}>
                      <div className="font-bold uppercase" style={{ color: "#64748B" }}>Duration</div>
                      <div className="font-bold truncate" style={{ color: "#0A2540" }}>30 Hours</div>
                    </div>
                    <div style={{ borderLeft: "1px solid #E2E8F0" }}>
                      <div className="font-bold uppercase" style={{ color: "#64748B" }}>Issued By</div>
                      <div className="font-bold truncate" style={{ color: "#0A2540" }}>LearnWithUs</div>
                    </div>
                  </div>

                  {/* Footer: Date, Seal, QR Code, Signature */}
                  <div
                    className="pt-1.5 flex items-center justify-between text-left gap-1"
                    style={{ borderTop: "1px solid #E2E8F0" }}
                  >
                    {/* Date */}
                    <div>
                      <div className="text-[9px] sm:text-[11px] font-bold" style={{ color: "#0A2540" }}>15 November 2026</div>
                      <div className="w-16 sm:w-20 h-0.5" style={{ backgroundColor: "#CBD5E1" }} />
                      <div className="text-[7.5px] sm:text-[8px] uppercase font-bold" style={{ color: "#475569" }}>Completion Date</div>
                    </div>

                    {/* Seal */}
                    <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shrink-0">
                      <svg viewBox="0 0 100 100" className="w-full h-full select-none">
                        <circle cx="50" cy="50" r="48" fill="#F0F7FF" stroke="#0756A5" strokeWidth="2.5" />
                        <circle cx="50" cy="50" r="44" fill="#FFFFFF" stroke="#004085" strokeWidth="1.5" strokeDasharray="3 2" />
                        <circle cx="50" cy="50" r="16" fill="#0756A5" />
                        <path d="M50 40 L52.5 45.5 L58 46.5 L54 50.5 L55 56 L50 53 L45 56 L46 50.5 L42 46.5 L47.5 45.5 Z" fill="#FFFFFF" />
                      </svg>
                    </div>

                    {/* Placeholder QR Code */}
                    <div
                      className="flex flex-col items-center justify-center p-0.5 sm:p-1 rounded shrink-0"
                      style={{ backgroundColor: "#FFFFFF", border: "1px solid #CBD5E1" }}
                    >
                      <svg width="32" height="32" viewBox="0 0 100 100" className="w-7 h-7 sm:w-9 sm:h-9 select-none">
                        <rect x="5" y="5" width="28" height="28" fill="#0A2540" />
                        <rect x="9" y="9" width="20" height="20" fill="#FFFFFF" />
                        <rect x="13" y="13" width="12" height="12" fill="#0A2540" />
                        <rect x="67" y="5" width="28" height="28" fill="#0A2540" />
                        <rect x="71" y="9" width="20" height="20" fill="#FFFFFF" />
                        <rect x="75" y="13" width="12" height="12" fill="#0A2540" />
                        <rect x="5" y="67" width="28" height="28" fill="#0A2540" />
                        <rect x="9" y="71" width="20" height="20" fill="#FFFFFF" />
                        <rect x="13" y="75" width="12" height="12" fill="#0A2540" />
                        <rect x="42" y="42" width="6" height="6" fill="#0A2540" />
                        <rect x="54" y="42" width="6" height="6" fill="#0A2540" />
                        <rect x="42" y="54" width="6" height="6" fill="#0A2540" />
                        <rect x="54" y="54" width="6" height="6" fill="#0A2540" />
                      </svg>
                      <span className="text-[6px] sm:text-[7px] font-mono font-bold" style={{ color: "#0756A5" }}>
                        DEMO QR
                      </span>
                    </div>

                    {/* Signature */}
                    <div className="text-right">
                      <div className="font-serif italic font-bold text-[9px] sm:text-xs" style={{ color: "#0756A5" }}>
                        LearnWithUs Academic Team
                      </div>
                      <div className="w-20 sm:w-28 h-0.5 ml-auto" style={{ backgroundColor: "#CBD5E1" }} />
                      <div className="text-[7.5px] sm:text-[8px] uppercase font-bold" style={{ color: "#475569" }}>
                        Authorized Signature
                      </div>
                    </div>
                  </div>

                  {/* Notice Footer */}
                  <div className="text-center pt-0.5" style={{ borderTop: "1px solid #F1F5F9" }}>
                    <p className="text-[7.5px] sm:text-[8px]" style={{ color: "#64748B" }}>
                      SAMPLE CERTIFICATE – NOT VALID FOR OFFICIAL USE • FOR DEMONSTRATION PURPOSES ONLY
                    </p>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <DemoCertificateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={{
          studentName,
          courseName,
          fullCourseTitle: "Python Programming – Beginner to Advanced"
        }}
      />
    </section>
  );
}

