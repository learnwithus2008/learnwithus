import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Award,
  Calendar,
  User,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Search,
  ExternalLink,
  ArrowLeft,
  Sparkles,
  Printer
} from "lucide-react";
import BrandLogo from "../components/BrandLogo";
import { certificateService } from "../services/monetizationService";
import CertificateModal from "../components/CertificateModal";

export default function CertificateVerification({ initialCertificateId, onNavigate, onBack }) {
  const [certIdInput, setCertIdInput] = useState(initialCertificateId || "");
  const [searchedId, setSearchedId] = useState(initialCertificateId || "");
  const [loading, setLoading] = useState(false);
  const [certificateData, setCertificateData] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [showCertificateModal, setShowCertificateModal] = useState(false);

  const fetchVerification = async (idToVerify) => {
    if (!idToVerify || !idToVerify.trim()) {
      setErrorMessage("Please enter a valid Certificate ID.");
      setCertificateData(null);
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setCertificateData(null);

    try {
      const data = await certificateService.verifyCertificate(idToVerify.trim());
      setCertificateData(data);
    } catch (err) {
      setErrorMessage(
        err.message ||
        `No verified certificate found for "${idToVerify}". Please double check the Certificate ID.`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialCertificateId) {
      setCertIdInput(initialCertificateId);
      setSearchedId(initialCertificateId);
      fetchVerification(initialCertificateId);
    }
  }, [initialCertificateId]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (certIdInput.trim()) {
      setSearchedId(certIdInput.trim());
      fetchVerification(certIdInput.trim());
    }
  };

  return (
    <div className="min-h-[85vh] py-8 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-[#071324] text-slate-800 dark:text-slate-100 flex flex-col justify-center items-center">
      <div className="w-full max-w-3xl space-y-6">

        {/* Back navigation & Brand */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              if (onBack) onBack();
              else if (onNavigate) onNavigate("home");
              else if (typeof window !== "undefined") window.location.hash = "#/home";
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Back</span>
          </button>

          <BrandLogo variant="horizontal" size="sm" />
        </div>

        {/* Verification Portal Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-[#0756A5] dark:text-[#38bdf8] text-xs font-bold border border-blue-500/20">
            <ShieldCheck size={14} />
            <span>Official Credential Registry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#102B50] dark:text-white tracking-tight">
            Certificate Verification Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Verify the authenticity of a student's LearnWithUs Certificate of Achievement using their unique certificate ID.
          </p>
        </div>

        {/* Search Input Box */}
        <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-[#0B1E3B] border border-slate-200 dark:border-slate-800 shadow-lg">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={certIdInput}
                onChange={(e) => setCertIdInput(e.target.value)}
                placeholder="Enter Certificate ID (e.g. LWU-PY-2026-849201)"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#0756A5] uppercase font-mono tracking-wider"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="py-2.5 px-6 rounded-xl bg-[#0756A5] hover:bg-[#064681] text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
            >
              {loading ? "Verifying..." : "Verify Credential"}
            </button>
          </form>
        </div>

        {/* Verification Result Card */}
        {certificateData && (
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0B1E3B] border-2 border-emerald-500/50 shadow-xl space-y-6 animate-in fade-in duration-300">
            {/* Status Header */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800 text-center sm:text-left">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={26} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      ✓ Valid Credential
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300">
                      Active
                    </span>
                  </div>
                  <h2 className="text-base sm:text-lg font-black text-[#102B50] dark:text-white">
                    Verified LearnWithUs Certificate
                  </h2>
                </div>
              </div>

              <div className="text-center sm:text-right">
                <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                  Certificate ID
                </div>
                <div className="font-mono text-sm sm:text-base font-black text-[#0756A5] dark:text-[#38bdf8]">
                  {certificateData.certificateId}
                </div>
              </div>
            </div>

            {/* Credential Attributes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center gap-2 text-xs text-slate-400 font-bold mb-1">
                  <User size={14} className="text-[#0756A5]" />
                  <span>STUDENT RECIPIENT</span>
                </div>
                <div className="text-base sm:text-lg font-black text-[#102B50] dark:text-white">
                  {certificateData.studentName}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center gap-2 text-xs text-slate-400 font-bold mb-1">
                  <BookOpen size={14} className="text-[#0756A5]" />
                  <span>COURSE PROGRAM</span>
                </div>
                <div className="text-base sm:text-lg font-black text-[#102B50] dark:text-white">
                  {certificateData.courseName}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center gap-2 text-xs text-slate-400 font-bold mb-1">
                  <Calendar size={14} className="text-[#0756A5]" />
                  <span>COMPLETION DATE</span>
                </div>
                <div className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200">
                  {new Date(certificateData.completionDate || certificateData.issuedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                  })}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center gap-2 text-xs text-slate-400 font-bold mb-1">
                  <Award size={14} className="text-[#0756A5]" />
                  <span>OFFICIAL ISSUER</span>
                </div>
                <div className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200">
                  Learn With Us Academic Board
                </div>
              </div>
            </div>

            {/* Actions: View / Download Certificate */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setShowCertificateModal(true)}
                className="w-full sm:w-auto py-2.5 px-5 rounded-xl bg-[#0756A5] hover:bg-[#064681] text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer border-none"
              >
                <Award size={15} />
                <span>View Official Certificate Document</span>
              </button>

              <div className="text-[11px] text-slate-400 text-center sm:text-right">
                Verified against secure database records
              </div>
            </div>

            {/* Disclaimer */}
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed text-center">
              Disclaimer: This certificate verifies coursework completed on the LearnWithUs digital learning platform. It does not confer formal university degree credit or external government accreditation.
            </div>
          </div>
        )}

        {/* Error / Not Found Message */}
        {errorMessage && (
          <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-center space-y-2">
            <div className="w-10 h-10 mx-auto rounded-xl bg-rose-500/20 text-rose-500 flex items-center justify-center">
              <AlertCircle size={20} />
            </div>
            <h3 className="text-sm font-bold text-rose-700 dark:text-rose-400">
              Certificate Not Found
            </h3>
            <p className="text-xs text-rose-600 dark:text-rose-300 max-w-md mx-auto">
              {errorMessage}
            </p>
          </div>
        )}

      </div>

      {/* Render Certificate Modal if student/employer clicks "View Official Certificate Document" */}
      {certificateData && (
        <CertificateModal
          isOpen={showCertificateModal}
          onClose={() => setShowCertificateModal(false)}
          studentName={certificateData.studentName}
          courseName={certificateData.courseName}
          certificateId={certificateData.certificateId}
          issueDate={certificateData.issuedAt}
          completionDate={certificateData.completionDate}
          verificationUrl={certificateData.verificationUrl}
          isApproved={true}
        />
      )}
    </div>
  );
}

