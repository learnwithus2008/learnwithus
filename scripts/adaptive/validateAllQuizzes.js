import { SECTIONS, allTopics } from '../../src/data/allTopics.js';
import { practiceData } from '../../src/data/practiceData.js';
import { projectsData } from '../../src/data/projectsData.js';

console.log("=================================================");
console.log("🔍 RUNNING COMPREHENSIVE QUIZ AUDIT & VALIDATION");
console.log("=================================================\n");

const stages = ["kid", "young", "college", "graduate", "professional"];
const languages = ["english", "english-telugu", "telugu", "hindi"];

let totalLessons = 0;
let totalQuizzes = 0;
let totalQuestionsChecked = 0;
let issues = [];

// 1. Audit Curriculum Topics (All 19 Sections, 198 Topics)
console.log(`Auditing ${allTopics.length} Curriculum Topics across 19 Sections...`);

for (const section of SECTIONS) {
  for (const topic of section.topics) {
    totalLessons++;
    
    if (!topic.stages) {
      issues.push({ sec: section.title, topic: topic.title, err: "Missing 'stages' object" });
      continue;
    }

    for (const stg of stages) {
      const stageData = topic.stages[stg];
      if (!stageData) {
        issues.push({ sec: section.title, topic: topic.title, stage: stg, err: `Missing stage data for ${stg}` });
        continue;
      }

      if (!stageData.languages) {
        issues.push({ sec: section.title, topic: topic.title, stage: stg, err: "Missing languages object" });
        continue;
      }

      for (const lang of languages) {
        totalQuizzes++;
        const langPkg = stageData.languages[lang];
        if (!langPkg) {
          issues.push({ sec: section.title, topic: topic.title, stage: stg, lang, err: "Missing language package" });
          continue;
        }

        const questions = langPkg.questions;
        if (!Array.isArray(questions) || questions.length === 0) {
          issues.push({ sec: section.title, topic: topic.title, stage: stg, lang, err: "Empty questions array" });
          continue;
        }

        // Validate individual questions
        questions.forEach((q, qIdx) => {
          totalQuestionsChecked++;
          const qPrefix = `[Sec: ${section.number} | ${topic.title} | ${stg} | ${lang} | Q#${qIdx + 1}]`;

          if (!q.question || typeof q.question !== 'string' || q.question.trim().length === 0) {
            issues.push({ prefix: qPrefix, err: "Empty question text" });
          }

          if (!Array.isArray(q.options) || q.options.length < 2) {
            issues.push({ prefix: qPrefix, err: `Options missing or less than 2 (found: ${q.options?.length})` });
          } else {
            // Check for duplicate options
            const optSet = new Set(q.options.map(o => String(o).trim()));
            if (optSet.size !== q.options.length) {
              issues.push({ prefix: qPrefix, err: `Duplicate options detected: ${JSON.stringify(q.options)}` });
            }

            // Check if correctAnswer is inside options
            if (!q.options.includes(q.correctAnswer)) {
              issues.push({ prefix: qPrefix, err: `correctAnswer '${q.correctAnswer}' NOT found in options: ${JSON.stringify(q.options)}` });
            }
          }

          if (!q.explanation || typeof q.explanation !== 'string' || q.explanation.trim().length === 0) {
            issues.push({ prefix: qPrefix, err: "Missing explanation feedback" });
          }
        });
      }
    }
  }
}

// 2. Audit Practice Problems
console.log(`\nAuditing ${practiceData.length} Practice Sandbox Problems...`);
for (const prob of practiceData) {
  if (!prob.question || !prob.options || !prob.correctAnswer) {
    issues.push({ context: "Practice Problems", id: prob.id, err: "Missing question, options, or correctAnswer" });
  }
}

// 3. Audit Guided Projects
console.log(`Auditing ${projectsData.length} Guided Projects...`);
for (const proj of projectsData) {
  if (!proj.name || !proj.requirements || !proj.expectedResult) {
    issues.push({ context: "Guided Projects", id: proj.id, err: "Missing project name, requirements, or expectedResult" });
  }
}

console.log("\n=================================================");
console.log("📊 COMPREHENSIVE AUDIT METRICS");
console.log("=================================================");
console.log(`Total Curriculum Sections Audited: ${SECTIONS.length}`);
console.log(`Total Lessons / Topics Audited:    ${totalLessons}`);
console.log(`Total Quizzes Evaluated:           ${totalQuizzes} (198 topics × 5 stages × 4 languages)`);
console.log(`Total Questions Inspected:         ${totalQuestionsChecked}`);
console.log(`Practice Problems Audited:         ${practiceData.length}`);
console.log(`Projects Audited:                  ${projectsData.length}`);
console.log(`Total Validation Errors / Issues:  ${issues.length}`);
console.log("=================================================\n");

if (issues.length > 0) {
  console.log(`❌ Found ${issues.length} issues. Sample top 10 issues:`);
  console.log(issues.slice(0, 10));
} else {
  console.log("✅ ALL QUIZZES, QUESTIONS, OPTIONS, AND KEYS VALIDATED WITH 100% INTEGRITY!");
}
