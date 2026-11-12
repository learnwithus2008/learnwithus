/**
 * reportExporter.js
 * Generates structured compliance and analytics reports and handles CSV/JSON downloads.
 */

import { SECTIONS, allTopics } from "../data/allTopics";
import { practiceData } from "../data/practiceData";
import { projectsData } from "../data/projectsData";
import { LEARNING_STAGES } from "../data/learningStages";
import { LEARNING_LANGUAGES } from "../data/learningLanguages";

/**
 * Trigger client-side file download for CSV content
 */
export function downloadCsv(filename, rows) {
  if (!rows || rows.length === 0) return;
  const keys = Object.keys(rows[0]);
  
  const escapeCell = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const csvContent = [
    keys.map(escapeCell).join(","),
    ...rows.map(row => keys.map(k => escapeCell(row[k])).join(","))
  ].join("\r\n");

  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename.endsWith(".csv") ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Trigger client-side file download for JSON content
 */
export function downloadJson(filename, data) {
  const jsonStr = typeof data === "string" ? data : JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename.endsWith(".json") ? filename : `${filename}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 1. Generate Curriculum Coverage Report
 */
export function generateCurriculumCoverageReport() {
  const generatedAt = new Date().toISOString();
  const rows = [];

  for (const sec of SECTIONS) {
    for (const top of sec.topics) {
      let stagesCount = 0;
      let totalQuestions = 0;
      const languagesPresent = new Set();

      if (top.stages) {
        for (const stg of ["kid", "young", "college", "graduate", "professional"]) {
          const stgObj = top.stages[stg];
          if (stgObj) {
            stagesCount++;
            if (stgObj.languages) {
              for (const lang of ["english", "english-telugu", "telugu", "hindi"]) {
                const pkg = stgObj.languages[lang];
                if (pkg) {
                  languagesPresent.add(lang);
                  if (Array.isArray(pkg.questions)) {
                    totalQuestions += pkg.questions.length;
                  }
                }
              }
            }
          }
        }
      }

      rows.push({
        section_number: sec.number,
        section_title: sec.title,
        topic_id: top.id,
        topic_title: top.title,
        stages_covered: `${stagesCount}/5`,
        languages_count: `${languagesPresent.size}/4`,
        languages_list: Array.from(languagesPresent).join("; "),
        total_questions: totalQuestions,
        coverage_status: stagesCount === 5 && languagesPresent.size === 4 ? "Full (100%)" : "Partial"
      });
    }
  }

  return {
    reportType: "CURRICULUM_COVERAGE",
    title: "Curriculum Coverage and Completeness Report",
    generatedAt,
    summary: {
      totalSections: SECTIONS.length,
      totalTopics: allTopics.length,
      fullCoverageTopics: rows.filter(r => r.coverage_status === "Full (100%)").length,
      partialCoverageTopics: rows.filter(r => r.coverage_status !== "Full (100%)").length
    },
    rows
  };
}

/**
 * 2. Generate Translation Completeness Report
 */
export function generateTranslationReport() {
  const generatedAt = new Date().toISOString();
  const rows = [];

  for (const sec of SECTIONS) {
    for (const top of sec.topics) {
      const row = {
        section: sec.title,
        topic_id: top.id,
        topic_title: top.title,
        english: "Missing",
        english_telugu: "Missing",
        telugu: "Missing",
        hindi: "Missing",
        completeness_pct: 0
      };

      let count = 0;
      // Check young/professional stage for representative language package presence
      const sampleStage = top.stages?.young || top.stages?.college || top.stages?.kid;
      if (sampleStage?.languages) {
        if (sampleStage.languages["english"]) { row.english = "Complete"; count++; }
        if (sampleStage.languages["english-telugu"]) { row.english_telugu = "Complete"; count++; }
        if (sampleStage.languages["telugu"]) { row.telugu = "Complete"; count++; }
        if (sampleStage.languages["hindi"]) { row.hindi = "Complete"; count++; }
      }
      row.completeness_pct = Math.round((count / 4) * 100);
      rows.push(row);
    }
  }

  return {
    reportType: "TRANSLATION_COMPLETENESS",
    title: "Multilingual Curriculum Translation Completeness Report",
    generatedAt,
    summary: {
      totalTopics: rows.length,
      fullyTranslatedTopics: rows.filter(r => r.completeness_pct === 100).length,
      languagesSupported: ["Professional English", "English + Telugu", "Telugu", "Hindi"]
    },
    rows
  };
}

/**
 * 3. Generate Student Progress Cohort Report
 */
export function generateStudentProgressReport(usersList = []) {
  const generatedAt = new Date().toISOString();
  const rows = usersList.map(u => ({
    user_id: u.id,
    name: u.name,
    email: u.email,
    stage: u.stage,
    preferred_language: u.language,
    role: u.role,
    account_status: u.status,
    total_xp: u.total_xp || 0,
    current_streak: u.current_streak || 0,
    completed_topics_count: u.completed_topics_count || 0,
    progress_pct: Math.min(100, Math.round(((u.completed_topics_count || 0) / 198) * 100)),
    registered_at: u.created_at ? new Date(u.created_at).toLocaleDateString() : "--"
  }));

  const totalUsers = rows.length;
  const avgXp = totalUsers > 0 ? Math.round(rows.reduce((acc, r) => acc + r.total_xp, 0) / totalUsers) : 0;
  const avgCompleted = totalUsers > 0 ? (rows.reduce((acc, r) => acc + r.completed_topics_count, 0) / totalUsers).toFixed(1) : 0;

  return {
    reportType: "STUDENT_PROGRESS",
    title: "Registered Learner Progress & Cohort Analytics Report",
    generatedAt,
    summary: {
      totalStudents: totalUsers,
      averageXp: avgXp,
      averageCompletedTopics: avgCompleted,
      activeAccounts: rows.filter(r => r.account_status === "active").length
    },
    rows
  };
}

/**
 * 4. Generate Quiz Performance & Weak Topics Report
 */
export function generateQuizPerformanceReport(overviewData = {}) {
  const generatedAt = new Date().toISOString();
  const weakTopics = overviewData.weakTopics || [];

  const rows = weakTopics.map((w, idx) => ({
    rank: idx + 1,
    topic_id: w.topic_id,
    topic_title: allTopics.find(t => t.id === w.topic_id)?.title || w.topic_id,
    total_quiz_attempts: w.attempts,
    avg_score_pct: `${w.avg_score}%`,
    failed_attempts_count: w.fail_count,
    pass_rate: w.attempts > 0 ? `${Math.round(((w.attempts - w.fail_count) / w.attempts) * 100)}%` : "0%",
    status: w.avg_score >= 80 ? "Proficient" : w.avg_score >= 65 ? "Moderate" : "Needs Review"
  }));

  return {
    reportType: "QUIZ_PERFORMANCE",
    title: "Quiz Performance & Pedagogical Remediation Report",
    generatedAt,
    summary: {
      totalAttemptsLogged: overviewData.metrics?.totalQuizAttempts || 0,
      platformPassRate: `${overviewData.metrics?.quizPassRate || 0}%`,
      topicsIdentifiedForRemediation: rows.filter(r => r.status === "Needs Review").length
    },
    rows
  };
}
