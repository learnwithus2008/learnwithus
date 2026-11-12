import React, { useRef } from "react";
import { Award, CheckCircle2, Download, Printer, Sparkles, X } from "lucide-react";
import BrandLogo from "./BrandLogo";

/**
 * CertificateModal Component
 * Implements the official Learn With Us educational certificate:
 * - Professional white certificate background (#FFFFFF)
 * - Deep navy typography (#102B50)
 * - Blue borders and headings (#0756A5)
 * - Subtle golden decorative elements (#FFB800)
 * - Premium educational appearance & print support
 */
export default function CertificateModal({ isOpen, onClose, studentName = "Learner", completedCount = 198 }) {
  const certificateRef = useRef(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#102B50]/70 backdrop-blur-md overflow-y-auto animate-in"
      role="dialog"
      aria-modal="true"
      aria-label="Learn With Us Python Certificate"
    >
      <div className="relative w-full max-w-3xl my-auto bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#E2E8F0]">
        {/* Modal Controls Bar */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-[#F3F7FC] border-b border-[#E2E8F0] print:hidden">
          <div className="flex items-center gap-2">
            <Award size={18} className="text-[#0756A5]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#102B50]">
              Official Certificate of Achievement
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0756A5] hover:bg-[#064681] text-white font-bold text-xs shadow-xs transition cursor-pointer border-none"
              title="Print or Save as PDF"
            >
              <Printer size={14} />
              <span>Print Certificate</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-[#102B50] hover:bg-white transition cursor-pointer border-none bg-transparent"
              title="Close (Esc)"
              aria-label="Close Certificate Modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* =========================================================================
            CERTIFICATE DOCUMENT SHEET
            Pure white background, deep navy text, primary blue accents, golden yellow elements
            ========================================================================= */}
        <div
          ref={certificateRef}
          className="p-6 sm:p-12 bg-white text-[#102B50] relative select-none"
          style={{ minHeight: "520px" }}
        >
          {/* Subtle Outer Blue & Gold Double Border */}
          <div className="border-4 border-[#0756A5] p-2 rounded-2xl relative">
            <div className="border border-[#FFB800] p-6 sm:p-10 rounded-xl relative overflow-hidden bg-white">
              
              {/* Corner Golden Accents */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#FFB800]" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#FFB800]" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#FFB800]" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#FFB800]" />

              {/* Header: Brand Logo & Watermark */}
              <div className="flex flex-col items-center justify-center text-center mb-6">
                <BrandLogo variant="stacked" size="lg" />
                <span className="text-[11px] font-extrabold tracking-widest uppercase text-[#64748B] mt-2">
                  Learn. Practice. Grow.
                </span>
              </div>

              {/* Certificate Title */}
              <div className="text-center mb-6">
                <h2 className="text-xs sm:text-sm font-black uppercase tracking-widest text-[#0756A5] mb-1">
                  Certificate of Achievement
                </h2>
                <div className="w-24 h-0.5 bg-[#FFB800] mx-auto rounded-full mb-3" />
                <p className="text-xs text-[#64748B] font-medium">
                  This official credential verifies that
                </p>
              </div>

              {/* Recipient Student Name */}
              <div className="text-center mb-6">
                <h1 className="text-2xl sm:text-4xl font-extrabold text-[#102B50] font-display tracking-tight border-b-2 border-[#0756A5]/20 inline-block px-6 pb-1">
                  {studentName || "Python Learner"}
                </h1>
              </div>

              {/* Completion Statement */}
              <div className="text-center max-w-xl mx-auto mb-8 space-y-2">
                <p className="text-xs sm:text-sm text-[#102B50] leading-relaxed">
                  has demonstrated exceptional dedication and proficiency by successfully completing the curriculum and practice exercises in
                </p>
                <p className="text-base sm:text-lg font-black text-[#0756A5]">
                  Python Programming & Adaptive Core Curriculum
                </p>
                <p className="text-[11px] text-[#64748B]">
                  Verified across age-adapted explanation modules, live execution testing, and milestone challenges.
                </p>
              </div>

              {/* Certificate Signatures & Date Footer */}
              <div className="pt-6 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
                {/* Date */}
                <div>
                  <div className="text-xs font-bold text-[#102B50]">{currentDate}</div>
                  <div className="text-[10px] text-[#64748B] uppercase tracking-wider font-semibold">Date Issued</div>
                </div>

                {/* Golden Official Emblem Badge */}
                <div className="w-14 h-14 rounded-full border-2 border-[#FFB800] bg-[#FFFBEB] flex flex-col items-center justify-center text-center shadow-xs">
                  <Sparkles size={16} className="text-[#0756A5]" />
                  <span className="text-[8px] font-black uppercase tracking-tight text-[#102B50]">
                    Verified
                  </span>
                </div>

                {/* Signatures */}
                <div className="text-center sm:text-right">
                  <div className="font-serif italic font-bold text-sm text-[#0756A5]">Learn With Us Academic Board</div>
                  <div className="text-[10px] text-[#64748B] uppercase tracking-wider font-semibold">Platform Lead & Curriculum Director</div>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

