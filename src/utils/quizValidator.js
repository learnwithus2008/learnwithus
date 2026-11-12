import { SECTIONS, allTopics } from "../data/allTopics.js";
import { practiceData } from "../data/practiceData.js";
import { projectsData } from "../data/projectsData.js";

export const STAGES = ["kid", "young", "college", "graduate", "professional"];
export const LANGUAGES = ["english", "english-telugu", "telugu", "hindi"];

/**
 * Execute comprehensive audit across all curriculum topics, practice questions, and projects.
 * Supports optional runtime overrides to validate modified questions before saving.
 */
export function runCurriculumQuizAudit(customOverrides = {}) {
  const startTime = Date.now();
  let totalLessons = 0;
  let totalQuizzes = 0;
  let totalQuestionsChecked = 0;
  let passedChecksCount = 0;
  let unverifiedCount = 0;
  const issues = [];

  const sectionsToAudit = customOverrides.sections || SECTIONS;
  const practiceToAudit = customOverrides.practiceData || practiceData;
  const projectsToAudit = customOverrides.projectsData || projectsData;

  // 1. Audit Curriculum Topics
  for (const section of sectionsToAudit) {
    if (!section.topics || !Array.isArray(section.topics)) {
      issues.push({
        id: `sec-${section.id}-no-topics`,
        severity: "error",
        type: "SECTION_EMPTY",
        section: section.title,
        err: "Section has no topics array or is empty",
        reference: `SECTIONS[${section.id}]`
      });
      continue;
    }

    for (const topic of section.topics) {
      totalLessons++;

      if (!topic.stages) {
        issues.push({
          id: `topic-${topic.id}-no-stages`,
          severity: "error",
          type: "MISSING_STAGES",
          section: section.title,
          topicId: topic.id,
          topicTitle: topic.title,
          err: "Missing 'stages' container object",
          reference: `Topic: ${topic.id}`
        });
        continue;
      }

      for (const stg of STAGES) {
        const stageData = topic.stages[stg];
        if (!stageData) {
          issues.push({
            id: `topic-${topic.id}-${stg}-missing`,
            severity: "error",
            type: "MISSING_STAGE",
            section: section.title,
            topicId: topic.id,
            topicTitle: topic.title,
            stage: stg,
            err: `Missing stage configuration for '${stg}'`,
            reference: `Topic: ${topic.id} -> stages.${stg}`
          });
          continue;
        }

        if (!stageData.languages) {
          issues.push({
            id: `topic-${topic.id}-${stg}-no-languages`,
            severity: "error",
            type: "MISSING_LANGUAGES",
            section: section.title,
            topicId: topic.id,
            topicTitle: topic.title,
            stage: stg,
            err: "Missing 'languages' object in stage data",
            reference: `Topic: ${topic.id} -> stages.${stg}.languages`
          });
          continue;
        }

        for (const lang of LANGUAGES) {
          totalQuizzes++;
          const langPkg = stageData.languages[lang];
          if (!langPkg) {
            issues.push({
              id: `topic-${topic.id}-${stg}-${lang}-missing`,
              severity: "error",
              type: "MISSING_TRANSLATION",
              section: section.title,
              topicId: topic.id,
              topicTitle: topic.title,
              stage: stg,
              language: lang,
              err: `Missing language package for '${lang}'`,
              reference: `Topic: ${topic.id} -> ${stg} -> ${lang}`
            });
            continue;
          }

          const questions = langPkg.questions;
          if (!Array.isArray(questions) || questions.length === 0) {
            issues.push({
              id: `topic-${topic.id}-${stg}-${lang}-empty-questions`,
              severity: "error",
              type: "EMPTY_QUESTIONS",
              section: section.title,
              topicId: topic.id,
              topicTitle: topic.title,
              stage: stg,
              language: lang,
              err: "Questions array is empty or not an array",
              reference: `Topic: ${topic.id} -> ${stg} -> ${lang}.questions`
            });
            continue;
          }

          // Validate individual questions
          questions.forEach((q, qIdx) => {
            totalQuestionsChecked++;
            const qPrefix = `[Sec: ${section.number || "?"} | ${topic.title} | ${stg} | ${lang} | Q#${qIdx + 1}]`;

            let hasQuestionError = false;

            // 1. Text check
            if (!q.question || typeof q.question !== "string" || q.question.trim().length === 0) {
              issues.push({
                id: `q-${topic.id}-${stg}-${lang}-${qIdx}-empty-text`,
                severity: "error",
                type: "EMPTY_TEXT",
                prefix: qPrefix,
                section: section.title,
                topicId: topic.id,
                topicTitle: topic.title,
                stage: stg,
                language: lang,
                questionIndex: qIdx,
                err: "Question prompt text is empty",
                reference: `Topic ${topic.id} Q#${qIdx + 1}`
              });
              hasQuestionError = true;
            }

            // 2. Options check
            if (!Array.isArray(q.options) || q.options.length < 2) {
              issues.push({
                id: `q-${topic.id}-${stg}-${lang}-${qIdx}-invalid-options`,
                severity: "error",
                type: "INSUFFICIENT_OPTIONS",
                prefix: qPrefix,
                section: section.title,
                topicId: topic.id,
                topicTitle: topic.title,
                stage: stg,
                language: lang,
                questionIndex: qIdx,
                err: `Options missing or less than 2 (found: ${q.options?.length || 0})`,
                reference: `Topic ${topic.id} Q#${qIdx + 1}`
              });
              hasQuestionError = true;
            } else {
              // Empty option checks
              const emptyOpts = q.options.filter(o => o === null || o === undefined || String(o).trim().length === 0);
              if (emptyOpts.length > 0) {
                issues.push({
                  id: `q-${topic.id}-${stg}-${lang}-${qIdx}-empty-option`,
                  severity: "error",
                  type: "EMPTY_OPTION",
                  prefix: qPrefix,
                  section: section.title,
                  topicId: topic.id,
                  topicTitle: topic.title,
                  stage: stg,
                  language: lang,
                  questionIndex: qIdx,
                  err: "One or more options are empty strings",
                  reference: `Topic ${topic.id} Q#${qIdx + 1}`
                });
                hasQuestionError = true;
              }

              // Duplicate options check
              const optSet = new Set(q.options.map((o) => String(o).trim()));
              if (optSet.size !== q.options.length) {
                issues.push({
                  id: `q-${topic.id}-${stg}-${lang}-${qIdx}-duplicate-options`,
                  severity: "error",
                  type: "DUPLICATE_OPTIONS",
                  prefix: qPrefix,
                  section: section.title,
                  topicId: topic.id,
                  topicTitle: topic.title,
                  stage: stg,
                  language: lang,
                  questionIndex: qIdx,
                  err: `Duplicate options detected: ${JSON.stringify(q.options)}`,
                  reference: `Topic ${topic.id} Q#${qIdx + 1}`
                });
                hasQuestionError = true;
              }

              // Answer key in options check
              if (!q.options.includes(q.correctAnswer)) {
                issues.push({
                  id: `q-${topic.id}-${stg}-${lang}-${qIdx}-key-mismatch`,
                  severity: "error",
                  type: "ANSWER_KEY_MISMATCH",
                  prefix: qPrefix,
                  section: section.title,
                  topicId: topic.id,
                  topicTitle: topic.title,
                  stage: stg,
                  language: lang,
                  questionIndex: qIdx,
                  err: `correctAnswer '${q.correctAnswer}' is NOT in options: ${JSON.stringify(q.options)}`,
                  reference: `Topic ${topic.id} Q#${qIdx + 1}`
                });
                hasQuestionError = true;
              }
            }

            // 3. Explanation check
            if (!q.explanation || typeof q.explanation !== "string" || q.explanation.trim().length === 0) {
              issues.push({
                id: `q-${topic.id}-${stg}-${lang}-${qIdx}-missing-explanation`,
                severity: "warning",
                type: "MISSING_EXPLANATION",
                prefix: qPrefix,
                section: section.title,
                topicId: topic.id,
                topicTitle: topic.title,
                stage: stg,
                language: lang,
                questionIndex: qIdx,
                err: "Missing explanation feedback for learner remediation",
                reference: `Topic ${topic.id} Q#${qIdx + 1}`
              });
            }

            // Factual verification note:
            // Structural integrity passed, but semantic factual accuracy requires human domain review.
            if (!hasQuestionError) {
              passedChecksCount++;
              unverifiedCount++; // Marked as unverified for factual correctness beyond schema/key existence
            }
          });
        }
      }
    }
  }

  // 2. Audit Practice Problems
  for (const prob of practiceToAudit) {
    if (!prob.question || !prob.options || !prob.correctAnswer) {
      issues.push({
        id: `practice-${prob.id}-incomplete`,
        severity: "error",
        type: "INCOMPLETE_PRACTICE",
        section: "Practice Sandbox",
        err: `Practice problem '${prob.id}' missing question, options, or correctAnswer`,
        reference: `practiceData[${prob.id}]`
      });
    } else if (!prob.options.includes(prob.correctAnswer)) {
      issues.push({
        id: `practice-${prob.id}-key-mismatch`,
        severity: "error",
        type: "ANSWER_KEY_MISMATCH",
        section: "Practice Sandbox",
        err: `Practice problem '${prob.id}' correctAnswer '${prob.correctAnswer}' NOT found in options`,
        reference: `practiceData[${prob.id}]`
      });
    } else {
      passedChecksCount++;
    }
  }

  // 3. Audit Guided Projects
  for (const proj of projectsToAudit) {
    if (!proj.name || !proj.requirements || !proj.expectedResult) {
      issues.push({
        id: `project-${proj.id}-incomplete`,
        severity: "error",
        type: "INCOMPLETE_PROJECT",
        section: "Guided Projects",
        err: `Project '${proj.id}' missing name, requirements, or expectedResult`,
        reference: `projectsData[${proj.id}]`
      });
    } else {
      passedChecksCount++;
    }
  }

  const durationMs = Date.now() - startTime;
  const failedChecksCount = issues.filter(i => i.severity === "error").length;
  const warningCount = issues.filter(i => i.severity === "warning").length;

  return {
    timestamp: new Date().toISOString(),
    durationMs,
    totalSections: sectionsToAudit.length,
    totalLessons,
    totalQuizzes,
    totalQuestionsChecked,
    practiceCount: practiceToAudit.length,
    projectsCount: projectsToAudit.length,
    passedChecksCount,
    failedChecksCount,
    warningCount,
    unverifiedCount, // Structural validity confirmed; factual/pedagogical correctness unverified without manual review
    status: failedChecksCount === 0 ? "PASSED" : "FAILED",
    issues
  };
}
