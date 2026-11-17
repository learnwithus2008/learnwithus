import React, { useRef, useEffect } from "react";
import { Award, CheckCircle2, Download, Printer, Sparkles, X, ExternalLink, ShieldCheck, Check } from "lucide-react";

/**
 * CertificateModal Component
 * Official White & Blue Professional Educational Credential.
 *
 * Palette & Specifications:
 * - Background: Pure Crisp White (#FFFFFF)
 * - Frame & Borders: Deep Academic Navy (#0A2540) & Royal Blue (#0756A5, #3B82F6)
 * - Corner Ornaments: Classic Academic Geometric Brackets (#0756A5)
 * - Typography: Deep Navy (#0A2540), Royal Blue (#0756A5), and Muted Slate (#475569)
 * - Official Seal: Handcrafted Circular Academic Seal in Royal Blue (#0756A5) & White (#FFFFFF)
 * - Crest: Academic Laurel & Open-Book Code Crest in Sapphire & Navy
 * - Print / PDF Support: Flawless landscape rendering for printing or export to PDF
 */
export default function CertificateModal({
  isOpen = false,
  onClose,
  studentName = "Python Learner",
  courseName = "Python Programming & Adaptive Core Curriculum",
  completedCount = 198,
  totalTopics = 198,
  certificateId = "LWU-PY-2026-CERT01",
  issueDate = null,
  completionDate = null,
  verificationUrl = null,
  isApproved = true
}) {
  const certificateRef = useRef(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  // Close modal when pressing the Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (onClose) onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Safe date formatting helper that gracefully handles any input without throwing
  const formatDateSafe = (dateVal) => {
    if (!dateVal) return null;
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return null;
      return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    } catch {
      return null;
    }
  };

  const todayFormatted = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const formattedIssueDate = formatDateSafe(issueDate) || todayFormatted;
  const formattedCompletionDate = formatDateSafe(completionDate) || formattedIssueDate;

  const safeCertificateId = typeof certificateId === "string" && certificateId.trim()
    ? certificateId
    : "LWU-PY-2026-CERT01";

  const safeStudentName = typeof studentName === "string" && studentName.trim()
    ? studentName
    : "Python Learner";

  const safeCourseName = typeof courseName === "string" && courseName.trim()
    ? courseName
    : "Python Programming & Adaptive Core Curriculum";

  const safeCompletedCount = typeof completedCount === "number" && !isNaN(completedCount)
    ? completedCount
    : 198;

  const resolvedVerificationUrl = verificationUrl || (
    typeof window !== "undefined"
      ? `${window.location.origin}/#/verify-certificate/${safeCertificateId}`
      : `/#/verify-certificate/${safeCertificateId}`
  );

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-[#0A1A2F]/80 backdrop-blur-md overflow-y-auto animate-in"
      role="dialog"
      aria-modal="true"
      aria-label="Learn With Us Official Python Certificate"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl my-auto rounded-3xl shadow-2xl overflow-hidden border border-[#CBD5E1] print:border-none print:shadow-none print:rounded-none cursor-default"
        style={{ backgroundColor: "#FFFFFF" }}
      >
        
        {/* =========================================================================
            MODAL ACTION CONTROLS BAR (Hidden during printing / PDF save)
            ========================================================================= */}
        <div
          className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-[#DBEAFE] print:hidden"
          style={{ backgroundColor: "#F0F7FF" }}
        >
          <div className="flex items-center gap-2">
            <Award size={18} className="text-[#0756A5]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#0A2540]">
              Official Academic Credential
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0756A5] hover:bg-[#004085] text-white font-bold text-xs shadow-xs transition cursor-pointer border-none"
              title="Print or Save as PDF"
            >
              <Printer size={14} />
              <span>Print / Save as PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-[#0A2540] hover:bg-slate-100 transition cursor-pointer border-none bg-transparent"
              title="Close (Esc)"
              aria-label="Close Certificate Modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* =========================================================================
            CERTIFICATE DOCUMENT SHEET
            Professional White & Blue Format Only:
            - Crisp white background (#FFFFFF) strictly constant in all themes
            - Deep academic navy (#0A2540)
            - Regal cobalt / sapphire blue (#0756A5, #2563EB)
            - Handcrafted Academic Seal & Heraldic Laurel Crest
            ========================================================================= */}
        <div
          ref={certificateRef}
          className="certificate-pure-white-sheet p-4 sm:p-8 md:p-10 text-[#0A2540] relative select-none print:p-6 print:m-0"
          style={{ minHeight: "560px", backgroundColor: "#FFFFFF", color: "#0A2540" }}
        >
          {/* Outer Academic Frame: Solid Deep Navy (3.5px) */}
          <div className="border-[3.5px] border-[#0756A5] p-2 rounded-2xl relative print:border-4">
            
            {/* Inner Framing Border: Royal Blue (1.5px) */}
            <div
              className="border border-[#3B82F6] p-5 sm:p-8 md:p-10 rounded-xl relative overflow-hidden"
              style={{ backgroundColor: "#FFFFFF" }}
            >
              
              {/* Corner Academic Brackets in Royal Blue */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-[3px] border-l-[3px] border-[#0756A5]" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-[3px] border-r-[3px] border-[#0756A5]" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-[3px] border-l-[3px] border-[#0756A5]" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-[3px] border-r-[3px] border-[#0756A5]" />

              {/* Top Bar: Verification ID Badge & Trust Indicator */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-2.5 border-b border-[#E2E8F0]">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#0756A5]">
                  <ShieldCheck size={14} className="text-[#0756A5]" />
                  <span>Verified Educational Credential</span>
                </div>
                <div className="font-mono text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-md bg-[#F0F7FF] text-[#0A2540] border border-[#BFDBFE]">
                  CERTIFICATE ID: <span className="text-[#0756A5] font-black">{safeCertificateId}</span>
                </div>
              </div>

              {/* Header: Academic Heraldic Crest & Institute Title in Blue & White */}
              <div className="flex flex-col items-center justify-center text-center mb-5">
                <div className="relative flex items-center justify-center mb-2">
                  <svg width="60" height="60" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Outer concentric rings */}
                    <circle cx="40" cy="40" r="38" stroke="#0756A5" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.4" />
                    <circle cx="40" cy="40" r="34" stroke="#0756A5" strokeWidth="2" />
                    {/* Laurel Leaves Left */}
                    <path d="M22 46 C20 40 22 34 26 30 C27 34 26 39 24 44 Z" fill="#0756A5" />
                    <path d="M19 36 C18 30 22 25 27 22 C27 27 25 31 21 34 Z" fill="#004085" />
                    <path d="M22 26 C23 20 28 17 34 16 C33 21 30 25 25 25 Z" fill="#0756A5" />
                    {/* Laurel Leaves Right */}
                    <path d="M58 46 C60 40 58 34 54 30 C53 34 54 39 56 44 Z" fill="#0756A5" />
                    <path d="M61 36 C62 30 58 25 53 22 C53 27 55 31 59 34 Z" fill="#004085" />
                    <path d="M58 26 C57 20 52 17 46 16 C47 21 50 25 55 25 Z" fill="#0756A5" />
                    {/* Center Open Book */}
                    <path d="M40 33 C34 29 26 30 23 32 L23 54 C26 52 34 51 40 55 C46 51 54 52 57 54 L57 32 C54 30 46 29 40 33 Z" fill="#FFFFFF" stroke="#0756A5" strokeWidth="2.5" strokeLinejoin="round" />
                    <path d="M40 34 L40 55" stroke="#004085" strokeWidth="2" />
                    {/* Code bracket symbol inside book */}
                    <path d="M28 41 L25 43 L28 45" stroke="#0756A5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M52 41 L55 43 L52 45" stroke="#0756A5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M38 39 L42 47" stroke="#0756A5" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
                <h3 className="text-base sm:text-lg font-black tracking-widest uppercase text-[#0A2540]">
                  LEARN WITH US
                </h3>
                <span className="text-[10px] sm:text-[11px] font-bold tracking-widest uppercase text-[#0756A5] mt-0.5">
                  ACADEMY OF COMPUTING & SOFTWARE EDUCATION
                </span>
              </div>

              {/* Certificate Title */}
              <div className="text-center mb-5">
                <span className="text-[11px] sm:text-xs font-black uppercase tracking-[0.25em] text-[#0756A5] block mb-1">
                  Certificate of Achievement
                </span>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-12 h-0.5 bg-[#3B82F6]" />
                  <div className="w-2.5 h-2.5 rounded-full border border-[#0756A5] bg-[#F0F7FF]" />
                  <div className="w-12 h-0.5 bg-[#3B82F6]" />
                </div>
                <p className="text-xs text-[#475569] font-medium tracking-wide">
                  This official academic document certifies that
                </p>
              </div>

              {/* Recipient Student Name */}
              <div className="text-center mb-5">
                <h1 className="text-2xl sm:text-4xl font-extrabold text-[#0A2540] font-serif tracking-tight border-b-2 border-[#0756A5]/25 inline-block px-8 pb-1.5">
                  {safeStudentName}
                </h1>
              </div>

              {/* Completion Statement */}
              <div className="text-center max-w-xl mx-auto mb-6 space-y-2">
                <p className="text-xs sm:text-sm text-[#334155] leading-relaxed">
                  has demonstrated exceptional competence, academic rigor, and dedication by successfully completing the curriculum and mastery evaluations in
                </p>
                <p className="text-base sm:text-xl font-black text-[#0756A5]">
                  {safeCourseName}
                </p>
                <p className="text-[11px] text-[#475569]">
                  Verified across {safeCompletedCount} structured learning modules, live coding challenges, and milestone practical assessments.
                </p>
              </div>

              {/* Certificate Signatures, Date & Official Seal */}
              <div className="pt-6 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-5 text-center sm:text-left">
                
                {/* Issuance & Completion Dates */}
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-[#0A2540]">{formattedIssueDate}</div>
                  <div className="text-[10px] text-[#475569] uppercase tracking-wider font-semibold">Date of Issuance</div>
                  {completionDate && (
                    <div className="text-[9px] text-[#64748B]">Completed: {formattedCompletionDate}</div>
                  )}
                </div>

                {/* Official Academic Seal (Royal Blue & Crisp White) */}
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xs select-none">
                    {/* Outer circular frame */}
                    <circle cx="50" cy="50" r="48" fill="#F0F7FF" stroke="#0756A5" strokeWidth="2" />
                    <circle cx="50" cy="50" r="44" fill="#FFFFFF" stroke="#004085" strokeWidth="1.5" strokeDasharray="3 2" />
                    <circle cx="50" cy="50" r="37" fill="#F0F7FF" stroke="#0756A5" strokeWidth="1.5" />
                    {/* Circular Verified Text */}
                    <path id="sealTextPath" d="M 50,50 m -29,0 a 29,29 0 1,1 58,0 a 29,29 0 1,1 -58,0" fill="none" />
                    <text className="text-[6.5px] font-black uppercase tracking-wider fill-[#0756A5]">
                      <textPath href="#sealTextPath" startOffset="50%" textAnchor="middle">
                        ★ OFFICIAL VERIFIED CREDENTIAL ★
                      </textPath>
                    </text>
                    {/* Inner Emblem Core */}
                    <circle cx="50" cy="50" r="16" fill="#0756A5" />
                    {/* Star in Center */}
                    <path d="M50 40 L52.5 45.5 L58 46.5 L54 50.5 L55 56 L50 53 L45 56 L46 50.5 L42 46.5 L47.5 45.5 Z" fill="#FFFFFF" />
                  </svg>
                </div>

                {/* Academic Board Signatures */}
                <div className="text-center sm:text-right space-y-0.5">
                  <div className="font-serif italic font-bold text-sm sm:text-base text-[#0756A5] tracking-wide">
                    Learn With Us Academic Board
                  </div>
                  <div className="w-36 h-0.5 bg-[#CBD5E1] mx-auto sm:ml-auto sm:mr-0 mb-1" />
                  <div className="text-[10px] text-[#475569] uppercase tracking-wider font-semibold">
                    Curriculum Director & Academic Lead
                  </div>
                </div>
              </div>

              {/* Online Verification Link & Academic Disclosure */}
              <div className="mt-5 pt-3 border-t border-[#F1F5F9] text-center space-y-1">
                <div className="text-[10px] text-[#0756A5] font-mono break-all">
                  Online Credential Verification: <a href={resolvedVerificationUrl} target="_blank" rel="noopener noreferrer" className="underline font-bold text-[#0756A5] hover:text-[#004085]">{resolvedVerificationUrl}</a>
                </div>
                <p className="text-[9px] text-[#64748B] max-w-lg mx-auto leading-normal">
                  Disclaimer: This credential verifies successful completion of self-paced coursework on the LearnWithUs digital learning platform. It does not confer formal university degree credit or external government accreditation.
                </p>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
