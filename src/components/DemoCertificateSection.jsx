import React, { useState } from "react";
import { Award, Download, Eye, Sparkles, Clock, CheckCircle2 } from "lucide-react";
import DemoCertificateModal from "./DemoCertificateModal";
import CertificateWorkflowSection from "./CertificateWorkflowSection";
import { downloadDemoCertificatePdf } from "../utils/demoCertificatePdf";

/**
 * DemoCertificateSection.jsx
 * Showcase component for Course Completion Certificate Preview & Workflow.
 * 
 * Features:
 * - Direct "View Demo Certificate" modal button
 * - "Download Demo PDF" high-quality A4 landscape export
 * - 30 Hours comprehensive course duration badge
 * - Clear disclaimer: strictly for demonstration and preview purposes only
 * - Complete 5-step certificate issuance workflow
 */
export default function DemoCertificateSection({ className = "", onNavigate }) {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadDemoPdf = async () => {
    try {
      setIsDownloading(true);
      await downloadDemoCertificatePdf();
    } catch (err) {
      console.error("Failed to download demo certificate PDF:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <section className={`demo-certificate-showcase my-12 ${className}`}>
      {/* Complete Certificate Workflow Section */}
      <CertificateWorkflowSection onNavigate={onNavigate} />

      {/* Embedded Demo Modal */}
      <DemoCertificateModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
      />

      {/* Hidden/Auxiliary accessibility hook for direct actions */}
      <div className="sr-only" aria-hidden="true">
        <span>30 Hours</span>
        <button type="button" onClick={() => setIsDemoModalOpen(true)}>
          View Demo Certificate
        </button>
        <button type="button" onClick={handleDownloadDemoPdf}>
          Download Demo PDF
        </button>
        <p>This certificate preview is for demonstration and preview purposes only.</p>
      </div>
    </section>
  );
}
