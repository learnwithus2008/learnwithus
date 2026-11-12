import React, { useState } from "react";
import {
  FileSpreadsheet,
  Download,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  BookOpen,
  HelpCircle,
  Globe,
  Users,
  TrendingUp
} from "lucide-react";
import {
  generateCurriculumCoverageReport,
  generateTranslationReport,
  generateStudentProgressReport,
  generateQuizPerformanceReport,
  downloadCsv,
  downloadJson
} from "../../utils/reportExporter";
import { runCurriculumQuizAudit } from "../../utils/quizValidator";

export default function ReportsExportsTab({ overview, users = [] }) {
  const [activeReportKey, setActiveReportKey] = useState("coverage");
  const [reportData, setReportData] = useState(() => generateCurriculumCoverageReport());
  const [generating, setGenerating] = useState(false);

  // Switch report type and generate fresh data
  const handleSelectReport = (key) => {
    setActiveReportKey(key);
    setGenerating(true);

    setTimeout(() => {
      let data;
      if (key === "coverage") {
        data = generateCurriculumCoverageReport();
      } else if (key === "validation") {
        const audit = runCurriculumQuizAudit();
        data = {
          reportType: "QUIZ_VALIDATION",
          title: "Comprehensive Curriculum & Quiz Validation Audit Report",
          generatedAt: audit.timestamp,
          summary: {
            totalSections: audit.totalSections,
            totalLessons: audit.totalLessons,
            totalQuizzes: audit.totalQuizzes,
            totalQuestionsChecked: audit.totalQuestionsChecked,
            passedChecksCount: audit.passedChecksCount,
            failedChecksCount: audit.failedChecksCount,
            unverifiedCount: audit.unverifiedCount,
            durationMs: audit.durationMs
          },
          rows: audit.issues.length > 0 ? audit.issues : [
            {
              status: "Passed 100% Structural Integrity",
              total_questions: audit.totalQuestionsChecked,
              passed_checks: audit.passedChecksCount,
              failed_checks: audit.failedChecksCount,
              unverified_count: audit.unverifiedCount,
              note: "Structural constraints verified across all questions. Semantic factual truth requires domain review."
            }
          ]
        };
      } else if (key === "translation") {
        data = generateTranslationReport();
      } else if (key === "students") {
        data = generateStudentProgressReport(users);
      } else if (key === "quiz_performance") {
        data = generateQuizPerformanceReport(overview || {});
      }

      setReportData(data);
      setGenerating(false);
    }, 150);
  };

  // Export CSV
  const handleExportCsv = () => {
    if (!reportData || !reportData.rows) return;
    const filename = `${reportData.reportType.toLowerCase()}_report_${new Date().toISOString().slice(0, 10)}`;
    downloadCsv(filename, reportData.rows);
  };

  // Export JSON
  const handleExportJson = () => {
    if (!reportData) return;
    const filename = `${reportData.reportType.toLowerCase()}_report_${new Date().toISOString().slice(0, 10)}`;
    downloadJson(filename, reportData);
  };

  const reportButtons = [
    { key: "coverage", label: "Curriculum Coverage", icon: BookOpen },
    { key: "validation", label: "Quiz Validation & Audit", icon: HelpCircle },
    { key: "translation", label: "Translation Completeness", icon: Globe },
    { key: "students", label: "Student Progress & Cohorts", icon: Users },
    { key: "quiz_performance", label: "Quiz Performance & Remediation", icon: TrendingUp }
  ];

  const rows = reportData?.rows || [];
  const previewRows = rows.slice(0, 20);

  return (
    <div className="space-y-6">
      {/* 1. Report Selector Carousel */}
      <div className="bg-white dark:bg-[#0c182a] border border-slate-200/80 dark:border-[#182c47] rounded-3xl p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <FileSpreadsheet size={18} className="text-blue-500" />
          <h3 className="text-base font-black text-slate-900 dark:text-white">
            Platform Analytics, Integrity Reports & Data Exports
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 pt-1">
          {reportButtons.map((btn) => {
            const Icon = btn.icon;
            const isSelected = activeReportKey === btn.key;
            return (
              <button
                key={btn.key}
                onClick={() => handleSelectReport(btn.key)}
                className={`p-3 rounded-2xl border text-xs font-bold transition flex items-center gap-2.5 cursor-pointer text-left ${
                  isSelected
                    ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20"
                    : "bg-slate-50 dark:bg-[#081220] text-slate-600 dark:text-slate-300 border-slate-200/80 dark:border-[#142338] hover:bg-slate-100 dark:hover:bg-[#102038]"
                }`}
              >
                <Icon size={16} className={isSelected ? "text-white" : "text-slate-400"} />
                <span className="truncate">{btn.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Active Report Display & Export Toolbar */}
      {reportData && (
        <div className="bg-white dark:bg-[#0c182a] border border-slate-200/80 dark:border-[#182c47] rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80 dark:border-[#182c47]">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-500">
                {reportData.reportType}
              </span>
              <h4 className="text-base font-black text-slate-900 dark:text-white">
                {reportData.title}
              </h4>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleSelectReport(activeReportKey)}
                disabled={generating}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#102036] dark:hover:bg-[#162c4a] text-slate-700 dark:text-slate-200 text-xs font-bold transition cursor-pointer"
              >
                <RefreshCw size={13} className={generating ? "animate-spin text-blue-500" : ""} />
                <span>Re-generate</span>
              </button>
              <button
                onClick={handleExportCsv}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition cursor-pointer border-none shadow-xs"
              >
                <Download size={13} />
                <span>Export to CSV</span>
              </button>
              <button
                onClick={handleExportJson}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition cursor-pointer border-none shadow-xs"
              >
                <Download size={13} />
                <span>Export to JSON</span>
              </button>
            </div>
          </div>

          {/* Report Metadata Ribbon */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#081220] border border-slate-200/60 dark:border-[#142338] text-xs flex flex-wrap items-center justify-between gap-3 font-semibold text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-blue-500" />
              <span>Generation Timestamp: {new Date(reportData.generatedAt).toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2 font-mono">
              <span>Total Records: {rows.length}</span>
              <span>•</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">Execution Confirmed</span>
            </div>
          </div>

          {/* Table Preview */}
          <div className="overflow-x-auto max-h-[420px] rounded-2xl border border-slate-200/60 dark:border-[#142338]">
            {rows.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No rows generated for this report.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-slate-100 dark:bg-[#091527] z-10 border-b border-slate-200/80 dark:border-[#182c47]">
                  <tr className="text-slate-400 font-extrabold uppercase tracking-wider">
                    {Object.keys(rows[0]).map((col) => (
                      <th key={col} className="py-2.5 px-3 whitespace-nowrap">
                        {col.replace(/_/g, " ")}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#142338]">
                  {previewRows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-50/60 dark:hover:bg-[#102036] transition">
                      {Object.keys(row).map((k) => (
                        <td key={k} className="py-2.5 px-3 font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap">
                          {String(row[k] ?? "")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {rows.length > 20 && (
            <div className="text-[11px] text-slate-400 text-center font-medium">
              Showing preview of first 20 rows of {rows.length}. Full dataset will be exported when clicking "Export to CSV" or "Export to JSON".
            </div>
          )}
        </div>
      )}
    </div>
  );
}
