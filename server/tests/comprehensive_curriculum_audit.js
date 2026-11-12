// server/tests/comprehensive_curriculum_audit.js
// Deep automated audit for every functionality, page, section, and lesson.

import { SECTIONS, allTopics } from "../../src/data/allTopics.js";
import { practiceData } from "../../src/data/practiceData.js";
import { projectsData } from "../../src/data/projectsData.js";
import { APP_PAGES_REGISTRY } from "../../src/data/appPagesRegistry.js";
import { runCurriculumQuizAudit } from "../../src/utils/quizValidator.js";

const STAGES = ["kid", "young", "college", "graduate", "professional"];
const LANGUAGES = ["english", "english-telugu", "telugu", "hindi"];

async function runDeepAudit() {
  console.log("==================================================================");
  console.log("🔍 COMPREHENSIVE PLATFORM, SECTION & LESSON AUDIT");
  console.log("==================================================================\n");

  const auditReport = {
    timestamp: new Date().toISOString(),
    sections: {
      total: SECTIONS.length,
      expected: 19,
      passed: 0,
      errors: []
    },
    topics: {
      total: allTopics.length,
      passed: 0,
      errors: [],
      warnings: []
    },
    quizzes: {
      totalQuestions: 0,
      passedQuestions: 0,
      failedQuestions: 0,
      errors: []
    },
    practice: {
      total: practiceData?.length || 0,
      errors: []
    },
    projects: {
      total: projectsData?.length || 0,
      errors: []
    },
    pages: {
      total: APP_PAGES_REGISTRY.length,
      errors: []
    }
  };

  // 1. SECTION AUDIT (19 Sections)
  console.log(`Auditing ${SECTIONS.length} Curriculum Sections...`);
  const seenSectionIds = new Set();
  const seenTopicIds = new Set();

  SECTIONS.forEach((sec, idx) => {
    const secPrefix = `Section ${sec.number || idx + 1} (${sec.id})`;
    if (!sec.id) {
      auditReport.sections.errors.push(`${secPrefix}: Missing section 'id'`);
    } else if (seenSectionIds.has(sec.id)) {
      auditReport.sections.errors.push(`${secPrefix}: Duplicate section id '${sec.id}'`);
    } else {
      seenSectionIds.add(sec.id);
    }

    if (!sec.title) {
      auditReport.sections.errors.push(`${secPrefix}: Missing 'title'`);
    }
    if (!Array.isArray(sec.topics) || sec.topics.length === 0) {
      auditReport.sections.errors.push(`${secPrefix}: Has 0 topics or invalid 'topics' array`);
    } else {
      auditReport.sections.passed++;
    }
  });

  // 2. LESSON AUDIT (All Topics)
  console.log(`Auditing ${allTopics.length} Individual Lessons & Topics...`);
  allTopics.forEach((t, idx) => {
    const topicPrefix = `Topic #${t.topicNumber || idx + 1} [${t.id}]`;
    let hasTopicError = false;

    if (!t.id) {
      auditReport.topics.errors.push(`${topicPrefix}: Missing topic 'id'`);
      hasTopicError = true;
    } else if (seenTopicIds.has(t.id)) {
      auditReport.topics.errors.push(`${topicPrefix}: Duplicate topic id '${t.id}'`);
      hasTopicError = true;
    } else {
      seenTopicIds.add(t.id);
    }

    if (!t.title) {
      auditReport.topics.errors.push(`${topicPrefix}: Missing 'title'`);
      hasTopicError = true;
    }

    if (!t.stages || typeof t.stages !== "object") {
      auditReport.topics.errors.push(`${topicPrefix}: Missing 'stages' object`);
      hasTopicError = true;
    } else {
      // Check each stage
      for (const stg of STAGES) {
        const stageData = t.stages[stg];
        if (!stageData) {
          auditReport.topics.warnings.push(`${topicPrefix}: Missing stage '${stg}'`);
          continue;
        }

        if (!stageData.languages || typeof stageData.languages !== "object") {
          auditReport.topics.warnings.push(`${topicPrefix}: Stage '${stg}' missing 'languages' object`);
          continue;
        }

        for (const lang of LANGUAGES) {
          const langData = stageData.languages[lang];
          if (!langData) {
            auditReport.topics.warnings.push(`${topicPrefix}: Stage '${stg}' missing language '${lang}'`);
            continue;
          }

          // Check explanations
          if (!langData.explanations || typeof langData.explanations !== "object") {
            auditReport.topics.warnings.push(`${topicPrefix}: Stage '${stg}' Lang '${lang}' missing 'explanations' object`);
          }

          // Check code and output
          if (!langData.code) {
            auditReport.topics.warnings.push(`${topicPrefix}: Stage '${stg}' Lang '${lang}' missing 'code' snippet`);
          }

          // Check quiz questions
          if (Array.isArray(langData.questions)) {
            langData.questions.forEach((q, qIdx) => {
              auditReport.quizzes.totalQuestions++;
              const qPrefix = `${topicPrefix} [${stg}/${lang} Q#${qIdx + 1}]`;

              if (!q.question || typeof q.question !== "string" || q.question.trim().length === 0) {
                auditReport.quizzes.errors.push(`${qPrefix}: Empty question prompt`);
                auditReport.quizzes.failedQuestions++;
              } else if (!Array.isArray(q.options) || q.options.length < 2) {
                auditReport.quizzes.errors.push(`${qPrefix}: Options count < 2`);
                auditReport.quizzes.failedQuestions++;
              } else if (!q.options.includes(q.correctAnswer)) {
                auditReport.quizzes.errors.push(`${qPrefix}: correctAnswer '${q.correctAnswer}' is NOT in options: ${JSON.stringify(q.options)}`);
                auditReport.quizzes.failedQuestions++;
              } else {
                auditReport.quizzes.passedQuestions++;
              }
            });
          }
        }
      }
    }

    if (!hasTopicError) {
      auditReport.topics.passed++;
    }
  });

  // 3. RUN BUILT-IN QUIZ AUDITOR
  console.log("Running Built-in Curriculum Quiz Audit Engine...");
  const quizAuditResult = runCurriculumQuizAudit();

  // 4. PRACTICE TASKS AUDIT
  console.log(`Auditing Practice Tasks (${practiceData?.length || 0} items)...`);
  if (Array.isArray(practiceData)) {
    practiceData.forEach((p, idx) => {
      const pPrefix = `Practice Task #${idx + 1} (${p.id || "unnamed"})`;
      if (!p.id) auditReport.practice.errors.push(`${pPrefix}: Missing 'id'`);
      if (!p.question) auditReport.practice.errors.push(`${pPrefix}: Missing 'question'`);
      if (!Array.isArray(p.options) || p.options.length < 2) {
        auditReport.practice.errors.push(`${pPrefix}: Options < 2`);
      } else if (!p.options.includes(p.correctAnswer)) {
        auditReport.practice.errors.push(`${pPrefix}: correctAnswer '${p.correctAnswer}' is NOT in options`);
      }
    });
  }

  // 5. PROJECTS AUDIT
  console.log(`Auditing Projects (${projectsData?.length || 0} items)...`);
  if (Array.isArray(projectsData)) {
    projectsData.forEach((prj, idx) => {
      const prjPrefix = `Project #${idx + 1} (${prj.id || "unnamed"})`;
      if (!prj.id) auditReport.projects.errors.push(`${prjPrefix}: Missing 'id'`);
      if (!prj.name) auditReport.projects.errors.push(`${prjPrefix}: Missing 'name'`);
      if (!prj.description) auditReport.projects.errors.push(`${prjPrefix}: Missing 'description'`);
      if (!prj.codeSnippet) auditReport.projects.errors.push(`${prjPrefix}: Missing 'codeSnippet'`);
    });
  }

  // 6. APPLICATION PAGES REGISTRY AUDIT
  console.log(`Auditing Application Pages Registry (${APP_PAGES_REGISTRY.length} registered pages)...`);
  APP_PAGES_REGISTRY.forEach((pg) => {
    const pgPrefix = `Page '${pg.id}' (${pg.route})`;
    if (!pg.route) auditReport.pages.errors.push(`${pgPrefix}: Missing 'route'`);
    if (!pg.title) auditReport.pages.errors.push(`${pgPrefix}: Missing 'title'`);
    if (!pg.category) auditReport.pages.errors.push(`${pgPrefix}: Missing 'category'`);
  });

  // Print Summary
  console.log("\n==================================================================");
  console.log("📊 AUDIT RESULTS SUMMARY");
  console.log("==================================================================");
  console.log(`  Sections:  ${auditReport.sections.passed} / ${auditReport.sections.total} PASSED (Errors: ${auditReport.sections.errors.length})`);
  console.log(`  Topics:    ${auditReport.topics.passed} / ${auditReport.topics.total} PASSED (Errors: ${auditReport.topics.errors.length}, Warnings: ${auditReport.topics.warnings.length})`);
  console.log(`  Quizzes:   ${auditReport.quizzes.passedQuestions} / ${auditReport.quizzes.totalQuestions} Passed Questions (Errors: ${auditReport.quizzes.errors.length})`);
  console.log(`  Built-in Quiz Validator Issues: ${quizAuditResult.issues.length} issues`);
  console.log(`  Practice:  ${auditReport.practice.total} tasks checked (Errors: ${auditReport.practice.errors.length})`);
  console.log(`  Projects:  ${auditReport.projects.total} projects checked (Errors: ${auditReport.projects.errors.length})`);
  console.log(`  Pages:     ${auditReport.pages.total} registered pages (Errors: ${auditReport.pages.errors.length})`);
  console.log("==================================================================\n");

  if (auditReport.sections.errors.length > 0) {
    console.log("🔴 Section Errors:");
    auditReport.sections.errors.slice(0, 20).forEach((e) => console.log(`   - ${e}`));
  }

  if (auditReport.topics.errors.length > 0) {
    console.log("🔴 Topic Errors:");
    auditReport.topics.errors.slice(0, 20).forEach((e) => console.log(`   - ${e}`));
  }

  if (auditReport.quizzes.errors.length > 0) {
    console.log("🔴 Quiz Errors:");
    auditReport.quizzes.errors.slice(0, 20).forEach((e) => console.log(`   - ${e}`));
  }

  if (quizAuditResult.issues.length > 0) {
    console.log(`🔴 Built-in Quiz Validator Issues (Showing first 25 of ${quizAuditResult.issues.length}):`);
    quizAuditResult.issues.slice(0, 25).forEach((iss) => {
      console.log(`   - [${iss.severity}] ${iss.prefix || iss.topicId}: ${iss.err}`);
    });
  }

  return { auditReport, quizAuditResult };
}

runDeepAudit().catch((err) => {
  console.error("Audit encountered critical error:", err);
  process.exit(1);
});
