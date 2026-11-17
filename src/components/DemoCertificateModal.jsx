import React, { useRef, useEffect, useState } from "react";
import {
  Award,
  Download,
  Printer,
  Sparkles,
  X,
  ShieldCheck,
  Check,
  Image as ImageIcon,
  QrCode
} from "lucide-react";
import {
  DEMO_CERTIFICATE_DATA,
  downloadDemoCertificatePdf,
  downloadDemoCertificatePng
} from "../utils/demoCertificatePdf";

/**
 * DemoCertificateModal.jsx
 * Interactive Demonstration Certificate Modal.
 *
 * Fixed Certificate Design Guarantees:
 * - Pure crisp white background (#FFFFFF) strictly enforced in both light and dark modes
 * - Dark, high-contrast readable text (#0A2540, #0756A5, #334155)
 * - Professional educational A4 landscape layout with elegant framing
 * - Prominent diagonal "DEMO" watermark across the certificate body
 * - "SAMPLE CERTIFICATE – NOT VALID FOR OFFICIAL USE" notice
 * - Vector placeholder verification QR code
 * - High-quality A4 landscape PDF download
 * - Dismisses on outside click and Escape key
 */
export default function DemoCertificateModal({
  isOpen = false,
  onClose,
  initialData = {}
}) {
  const modalContainerRef = useRef(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isDownloadingPng, setIsDownloadingPng] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const certData = { ...DEMO_CERTIFICATE_DATA, ...initialData };

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

  if (!isOpen) return null;

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const handleDownloadPdf = async () => {
    try {
      setIsDownloadingPdf(true);
      await downloadDemoCertificatePdf(certData);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to download PDF certificate:", err);
      window.print();
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleDownloadPng = async () => {
    try {
      setIsDownloadingPng(true);
      await downloadDemoCertificatePng(certData);
    } catch (err) {
      console.error("Failed to download PNG certificate:", err);
    } finally {
      setIsDownloadingPng(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-[#0A1A2F]/85 backdrop-blur-md overflow-y-auto animate-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="demo-certificate-title"
    >
      <div
        ref={modalContainerRef}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl my-auto rounded-3xl shadow-2xl overflow-hidden border border-[#CBD5E1] print:border-none print:shadow-none print:rounded-none cursor-default"
        style={{ backgroundColor: "#FFFFFF" }}
      >
        {/* =========================================================================
            1. MODAL TOP CONTROL BAR (Hidden during printing)
            ========================================================================= */}
        <div
          className="flex flex-wrap items-center justify-between gap-2 px-4 sm:px-6 py-3.5 border-b border-[#DBEAFE] print:hidden"
          style={{ backgroundColor: "#F0F7FF" }}
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#0756A5] text-white flex items-center justify-center shadow-xs">
              <Award size={16} />
            </div>
            <div>
              <h3 id="demo-certificate-title" className="text-xs sm:text-sm font-extrabold text-[#0A2540] flex items-center gap-1.5 leading-tight">
                <span>Course Completion Certificate Preview</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold border border-amber-300">
                  DEMO ONLY
                </span>
              </h3>
              <p className="text-[10px] sm:text-[11px] text-[#475569] font-medium">
                Always pure white background • A4 Landscape • Verification QR Code placeholder
              </p>
            </div>
          </div>

          {/* Action Buttons: Download PDF, Print, Close */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0756A5] hover:bg-[#064681] text-white font-bold text-xs shadow-xs transition cursor-pointer border-none disabled:opacity-50"
              title="Download high-quality A4 landscape PDF"
            >
              {isDownloadingPdf ? (
                <>
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Generating PDF...</span>
                </>
              ) : downloadSuccess ? (
                <>
                  <Check size={14} className="text-[#38BDF8]" />
                  <span>Downloaded!</span>
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
              onClick={handlePrint}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-[#0A2540] font-bold text-xs border border-[#CBD5E1] shadow-2xs transition cursor-pointer"
              title="Print or Save using Browser Print Dialog"
            >
              <Printer size={14} className="text-[#0756A5]" />
              <span>Print / Save</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPng}
              disabled={isDownloadingPng}
              className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-[#0A2540] font-bold text-xs border border-[#CBD5E1] shadow-2xs transition cursor-pointer disabled:opacity-50"
              title="Download Certificate as PNG image"
            >
              <ImageIcon size={14} className="text-[#0756A5]" />
              <span>PNG</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-[#0A2540] hover:bg-white transition cursor-pointer border-none bg-transparent"
              title="Close Preview (Esc)"
              aria-label="Close Certificate Preview Modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* =========================================================================
            2. TOP NOTICE: DEMO IDENTIFICATION WARNING BANNER
            ========================================================================= */}
        <div className="px-4 py-2 bg-amber-500/10 border-b border-amber-500/20 text-center flex items-center justify-center gap-2 print:hidden">
          <span className="text-amber-600 font-black text-xs">⚠️ NOTICE:</span>
          <span className="text-[11px] sm:text-xs font-bold text-amber-900 tracking-wide">
            SAMPLE CERTIFICATE – NOT VALID FOR OFFICIAL USE • FOR DEMONSTRATION PURPOSES ONLY
          </span>
        </div>

        {/* =========================================================================
            3. CERTIFICATE DOCUMENT SHEET (High-Quality A4 Landscape Layout)
            Fixed White Background: ALWAYS #FFFFFF regardless of website theme
            ========================================================================= */}
        <div className="p-3 sm:p-6 md:p-8 bg-slate-100 overflow-x-auto">
          <div
            className="certificate-pure-white-sheet w-full relative select-none rounded-xl shadow-lg overflow-hidden mx-auto print:border-none print:shadow-none print:rounded-none"
            style={{
              backgroundColor: "#FFFFFF",
              color: "#0A2540",
              aspectRatio: "297 / 210",
              minHeight: "440px",
              maxWidth: "860px",
              border: "1px solid #CBD5E1"
            }}
          >
            {/* -------------------------------------------------------------
                DIAGONAL "DEMO" WATERMARK (Centered Across Document)
                ------------------------------------------------------------- */}
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-10 overflow-hidden"
              aria-hidden="true"
            >
              <div
                className="transform -rotate-[25deg] text-center"
                style={{
                  color: "rgba(7, 86, 165, 0.08)",
                  lineHeight: 1
                }}
              >
                <div className="text-6xl sm:text-8xl md:text-9xl font-black tracking-widest font-mono">
                  DEMO
                </div>
                <div className="text-[10px] sm:text-xs md:text-sm font-bold tracking-[0.3em] uppercase mt-2 text-[#0756A5]/25">
                  SAMPLE CERTIFICATE • NOT VALID FOR OFFICIAL USE
                </div>
              </div>
            </div>

            {/* -------------------------------------------------------------
                OUTER ELEGANT ACADEMIC FRAME
                ------------------------------------------------------------- */}
            <div className="p-2 sm:p-3 h-full flex flex-col justify-between box-border">
              <div
                className="p-1.5 sm:p-2 rounded-xl h-full flex flex-col justify-between box-border"
                style={{ border: "3.5px solid #0A2540" }}
              >
                <div
                  className="p-3 sm:p-6 md:p-8 rounded-lg h-full flex flex-col justify-between relative box-border"
                  style={{ backgroundColor: "#FFFFFF", border: "1.5px solid #3B82F6" }}
                >

                  {/* Corner Ornaments */}
                  <div className="absolute top-0 left-0 w-6 h-6 sm:w-8 sm:h-8 border-t-[3px] border-l-[3px]" style={{ borderColor: "#0756A5" }} />
                  <div className="absolute top-0 right-0 w-6 h-6 sm:w-8 sm:h-8 border-t-[3px] border-r-[3px]" style={{ borderColor: "#0756A5" }} />
                  <div className="absolute bottom-0 left-0 w-6 h-6 sm:w-8 sm:h-8 border-b-[3px] border-l-[3px]" style={{ borderColor: "#0756A5" }} />
                  <div className="absolute bottom-0 right-0 w-6 h-6 sm:w-8 sm:h-8 border-b-[3px] border-r-[3px]" style={{ borderColor: "#0756A5" }} />

                  {/* ---------------------------------------------------------
                      A. TOP BAR (Format verification & Certificate ID)
                      --------------------------------------------------------- */}
                  <div
                    className="flex items-center justify-between gap-2 pb-2 text-[9px] sm:text-xs"
                    style={{ borderBottom: "1px solid #E2E8F0" }}
                  >
                    <div className="flex items-center gap-1.5 font-bold" style={{ color: "#0756A5" }}>
                      <ShieldCheck size={14} style={{ color: "#0756A5" }} className="shrink-0" />
                      <span className="hidden xs:inline">Verified Educational Credential Preview</span>
                      <span className="xs:hidden">Credential Preview</span>
                    </div>

                    <div
                      className="px-2 py-0.5 rounded-full font-black text-[9px] sm:text-[10px] tracking-wide"
                      style={{ backgroundColor: "#F0F7FF", border: "1px solid #BFDBFE", color: "#0756A5" }}
                    >
                      SAMPLE CERTIFICATE – NOT VALID FOR OFFICIAL USE
                    </div>

                    <div
                      className="font-mono font-bold px-2 py-0.5 rounded shrink-0 text-[9px] sm:text-[11px]"
                      style={{ backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0", color: "#0A2540" }}
                    >
                      ID: <span className="font-black" style={{ color: "#0756A5" }}>{certData.certificateId}</span>
                    </div>
                  </div>

                  {/* ---------------------------------------------------------
                      B. CREST & INSTITUTION BRANDING
                      --------------------------------------------------------- */}
                  <div className="text-center my-1 sm:my-2">
                    <div className="flex items-center justify-center mb-1">
                      <svg width="44" height="44" viewBox="0 0 80 80" fill="none" className="shrink-0 sm:w-[50px] sm:h-[50px]">
                        <circle cx="40" cy="40" r="37" stroke="#0756A5" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.4" />
                        <circle cx="40" cy="40" r="33" stroke="#0756A5" strokeWidth="2" />
                        <path d="M22 46 C20 40 22 34 26 30 C27 34 26 39 24 44 Z" fill="#0756A5" />
                        <path d="M19 36 C18 30 22 25 27 22 C27 27 25 31 21 34 Z" fill="#004085" />
                        <path d="M22 26 C23 20 28 17 34 16 C33 21 30 25 25 25 Z" fill="#0756A5" />
                        <path d="M58 46 C60 40 58 34 54 30 C53 34 54 39 56 44 Z" fill="#0756A5" />
                        <path d="M61 36 C62 30 58 25 53 22 C53 27 55 31 59 34 Z" fill="#004085" />
                        <path d="M58 26 C57 20 52 17 46 16 C47 21 50 25 55 25 Z" fill="#0756A5" />
                        <path d="M40 33 C34 29 26 30 23 32 L23 54 C26 52 34 51 40 55 C46 51 54 52 57 54 L57 32 C54 30 46 29 40 33 Z" fill="#FFFFFF" stroke="#0756A5" strokeWidth="2.5" strokeLinejoin="round" />
                        <path d="M40 34 L40 55" stroke="#004085" strokeWidth="2" />
                        <path d="M28 41 L25 43 L28 45" stroke="#0756A5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M52 41 L55 43 L52 45" stroke="#0756A5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>

                    <h2
                      className="text-sm sm:text-lg md:text-xl font-black tracking-widest uppercase leading-none"
                      style={{ color: "#0A2540" }}
                    >
                      {certData.academyTitle}
                    </h2>
                    <span
                      className="text-[9px] sm:text-[10px] font-bold tracking-widest uppercase block mt-0.5"
                      style={{ color: "#0756A5" }}
                    >
                      {certData.academySubtitle}
                    </span>
                  </div>

                  {/* ---------------------------------------------------------
                      C. TITLE: CERTIFICATE OF COMPLETION
                      --------------------------------------------------------- */}
                  <div className="text-center my-1 sm:my-2">
                    <h1
                      className="text-sm sm:text-xl md:text-2xl font-black uppercase tracking-[0.2em] leading-tight"
                      style={{ color: "#0756A5" }}
                    >
                      CERTIFICATE OF COMPLETION
                    </h1>
                    <div className="flex items-center justify-center gap-2 my-1">
                      <div className="w-8 sm:w-16 h-0.5" style={{ backgroundColor: "#3B82F6" }} />
                      <div className="w-2 h-2 rounded-full border" style={{ borderColor: "#0756A5", backgroundColor: "#F0F7FF" }} />
                      <div className="w-8 sm:w-16 h-0.5" style={{ backgroundColor: "#3B82F6" }} />
                    </div>
                    <p
                      className="text-[10px] sm:text-xs font-serif italic"
                      style={{ color: "#475569" }}
                    >
                      This certificate is proudly presented to
                    </p>
                  </div>

                  {/* ---------------------------------------------------------
                      D. STUDENT NAME (Elegant Serif Display)
                      --------------------------------------------------------- */}
                  <div className="text-center my-1 sm:my-2">
                    <h3
                      className="text-xl sm:text-3xl md:text-4xl font-extrabold font-serif tracking-tight inline-block px-4 sm:px-8 pb-0.5 sm:pb-1"
                      style={{ color: "#0A2540", borderBottom: "2px solid rgba(7, 86, 165, 0.3)" }}
                    >
                      {certData.studentName}
                    </h3>
                  </div>

                  {/* ---------------------------------------------------------
                      E. COURSE NAME & STATEMENT
                      --------------------------------------------------------- */}
                  <div className="text-center max-w-lg mx-auto my-1 space-y-1">
                    <p
                      className="text-[10px] sm:text-xs leading-tight"
                      style={{ color: "#334155" }}
                    >
                      For successfully completing
                    </p>
                    <p
                      className="text-xs sm:text-base md:text-lg font-black leading-snug"
                      style={{ color: "#0756A5" }}
                    >
                      {certData.fullCourseTitle}
                    </p>
                  </div>

                  {/* ---------------------------------------------------------
                      F. KEY ATTRIBUTES GRID
                      --------------------------------------------------------- */}
                  <div
                    className="grid grid-cols-4 gap-1 sm:gap-2 my-1 sm:my-2 p-1.5 sm:p-2 rounded-lg text-center"
                    style={{ backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0" }}
                  >
                    <div>
                      <div className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider" style={{ color: "#64748B" }}>Student Name</div>
                      <div className="text-[9px] sm:text-xs font-bold truncate" style={{ color: "#0A2540" }}>{certData.studentName}</div>
                    </div>
                    <div style={{ borderLeft: "1px solid #E2E8F0" }}>
                      <div className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider" style={{ color: "#64748B" }}>Course Name</div>
                      <div className="text-[9px] sm:text-xs font-bold truncate" style={{ color: "#0A2540" }}>{certData.courseName}</div>
                    </div>
                    <div style={{ borderLeft: "1px solid #E2E8F0" }}>
                      <div className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider" style={{ color: "#64748B" }}>Duration</div>
                      <div className="text-[9px] sm:text-xs font-bold truncate" style={{ color: "#0A2540" }}>{certData.duration}</div>
                    </div>
                    <div style={{ borderLeft: "1px solid #E2E8F0" }}>
                      <div className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider" style={{ color: "#64748B" }}>Issued By</div>
                      <div className="text-[9px] sm:text-xs font-bold truncate" style={{ color: "#0A2540" }}>{certData.issuedBy}</div>
                    </div>
                  </div>

                  {/* ---------------------------------------------------------
                      G. FOOTER: DATE, SEAL, QR CODE, & SIGNATURE
                      --------------------------------------------------------- */}
                  <div
                    className="pt-2 sm:pt-3 flex items-center justify-between text-left gap-2"
                    style={{ borderTop: "1px solid #E2E8F0" }}
                  >
                    {/* Date */}
                    <div className="space-y-0.5 min-w-0">
                      <div className="text-[10px] sm:text-xs font-bold" style={{ color: "#0A2540" }}>{certData.completionDate}</div>
                      <div className="w-20 sm:w-28 h-0.5" style={{ backgroundColor: "#CBD5E1" }} />
                      <div className="text-[8px] sm:text-[9px] uppercase font-bold tracking-wider" style={{ color: "#475569" }}>Completion Date</div>
                    </div>

                    {/* Handcrafted Seal */}
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center shrink-0">
                      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xs select-none">
                        <circle cx="50" cy="50" r="48" fill="#F0F7FF" stroke="#0756A5" strokeWidth="2.5" />
                        <circle cx="50" cy="50" r="44" fill="#FFFFFF" stroke="#004085" strokeWidth="1.5" strokeDasharray="3 2" />
                        <circle cx="50" cy="50" r="37" fill="#F0F7FF" stroke="#0756A5" strokeWidth="1.5" />
                        <path id="demoSealTextPath" d="M 50,50 m -29,0 a 29,29 0 1,1 58,0 a 29,29 0 1,1 -58,0" fill="none" />
                        <text className="text-[6.5px] font-black uppercase tracking-wider fill-[#0756A5]">
                          <textPath href="#demoSealTextPath" startOffset="50%" textAnchor="middle">
                            ★ OFFICIAL VERIFIED CREDENTIAL ★
                          </textPath>
                        </text>
                        <circle cx="50" cy="50" r="16" fill="#0756A5" />
                        <path d="M50 40 L52.5 45.5 L58 46.5 L54 50.5 L55 56 L50 53 L45 56 L46 50.5 L42 46.5 L47.5 45.5 Z" fill="#FFFFFF" />
                      </svg>
                    </div>

                    {/* Placeholder QR Code Area */}
                    <div
                      className="flex flex-col items-center justify-center p-1 sm:p-1.5 rounded-lg shrink-0"
                      style={{ backgroundColor: "#FFFFFF", border: "1px solid #CBD5E1" }}
                    >
                      <svg width="44" height="44" viewBox="0 0 100 100" className="w-10 h-10 sm:w-12 sm:h-12 select-none">
                        {/* 3 Corner Finder Patterns */}
                        {/* Top-Left */}
                        <rect x="5" y="5" width="28" height="28" fill="#0A2540" />
                        <rect x="9" y="9" width="20" height="20" fill="#FFFFFF" />
                        <rect x="13" y="13" width="12" height="12" fill="#0A2540" />

                        {/* Top-Right */}
                        <rect x="67" y="5" width="28" height="28" fill="#0A2540" />
                        <rect x="71" y="9" width="20" height="20" fill="#FFFFFF" />
                        <rect x="75" y="13" width="12" height="12" fill="#0A2540" />

                        {/* Bottom-Left */}
                        <rect x="5" y="67" width="28" height="28" fill="#0A2540" />
                        <rect x="9" y="71" width="20" height="20" fill="#FFFFFF" />
                        <rect x="13" y="75" width="12" height="12" fill="#0A2540" />

                        {/* Timing Lines */}
                        <line x1="37" y1="19" x2="63" y2="19" stroke="#0A2540" strokeWidth="3" strokeDasharray="4 4" />
                        <line x1="19" y1="37" x2="19" y2="63" stroke="#0A2540" strokeWidth="3" strokeDasharray="4 4" />

                        {/* Data Pixels Matrix */}
                        <rect x="40" y="40" width="6" height="6" fill="#0A2540" />
                        <rect x="50" y="40" width="6" height="6" fill="#0A2540" />
                        <rect x="60" y="45" width="6" height="6" fill="#0A2540" />
                        <rect x="42" y="52" width="6" height="6" fill="#0A2540" />
                        <rect x="55" y="55" width="6" height="6" fill="#0A2540" />
                        <rect x="70" y="42" width="6" height="6" fill="#0A2540" />
                        <rect x="80" y="50" width="6" height="6" fill="#0A2540" />
                        <rect x="45" y="70" width="6" height="6" fill="#0A2540" />
                        <rect x="55" y="75" width="6" height="6" fill="#0A2540" />
                        <rect x="70" y="72" width="6" height="6" fill="#0A2540" />
                        <rect x="82" y="80" width="6" height="6" fill="#0A2540" />
                      </svg>
                      <span className="text-[7px] sm:text-[8px] font-mono font-bold" style={{ color: "#0756A5" }}>
                        DEMO QR CODE
                      </span>
                    </div>

                    {/* Signature Area */}
                    <div className="text-right space-y-0.5 min-w-0">
                      <div
                        className="font-serif italic font-bold text-xs sm:text-sm tracking-wide"
                        style={{ color: "#0756A5" }}
                      >
                        LearnWithUs Academic Team
                      </div>
                      <div className="w-24 sm:w-36 h-0.5 ml-auto" style={{ backgroundColor: "#CBD5E1" }} />
                      <div className="text-[8px] sm:text-[9px] uppercase font-bold tracking-wider" style={{ color: "#475569" }}>
                        {certData.authorizedBy}
                      </div>
                      <div className="text-[8px] sm:text-[9px] font-semibold" style={{ color: "#0756A5" }}>
                        {certData.academicTeam}
                      </div>
                    </div>
                  </div>

                  {/* ---------------------------------------------------------
                      H. BOTTOM DISCLAIMER
                      --------------------------------------------------------- */}
                  <div
                    className="mt-2 pt-1 text-center"
                    style={{ borderTop: "1px solid #F1F5F9" }}
                  >
                    <p className="text-[8px] sm:text-[9px] leading-none" style={{ color: "#64748B" }}>
                      SAMPLE CERTIFICATE – NOT VALID FOR OFFICIAL USE • FOR DEMONSTRATION PURPOSES ONLY • NO OFFICIAL ACCREDITATION CONFERRED
                    </p>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            4. MODAL FOOTER ACTIONS & DOWNLOAD CTA (Hidden during printing)
            ========================================================================= */}
        <div className="px-4 sm:px-6 py-3.5 bg-slate-50 border-t border-[#E2E8F0] flex flex-wrap items-center justify-between gap-3 text-xs print:hidden">
          <div className="text-slate-500 font-medium">
            Format: <strong className="text-[#0A2540]">A4 Landscape (297 × 210 mm)</strong> • 300 DPI High-Resolution Output
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0756A5] hover:bg-[#064681] text-white font-bold shadow-xs transition cursor-pointer border-none disabled:opacity-50"
            >
              <Download size={14} />
              <span>Download Demo Certificate (PDF)</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold border border-slate-300 transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
