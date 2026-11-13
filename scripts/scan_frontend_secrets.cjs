const fs = require("fs");
const path = require("path");

const sensitiveKeywords = [
  "postgresql://",
  "postgres://",
  "ep-holy-dew",
  "SESSION_SECRET",
  "ADMIN_SECRET"
];

function scanDir(dir) {
  let issues = [];
  if (!fs.existsSync(dir)) return issues;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== "node_modules" && entry.name !== ".git") {
        issues = issues.concat(scanDir(fullPath));
      }
    } else if (/\.(js|jsx|ts|tsx|html|css|json)$/.test(entry.name)) {
      const content = fs.readFileSync(fullPath, "utf-8");
      for (const kw of sensitiveKeywords) {
        if (content.includes(kw)) {
          if (!fullPath.includes("server") && !fullPath.includes("scripts")) {
            issues.push({ file: fullPath, keyword: kw });
          }
        }
      }
    }
  }
  return issues;
}

console.log("Scanning src/ and dist/ for leaked backend secrets...");
const srcIssues = scanDir(path.resolve("src"));
const distIssues = scanDir(path.resolve("dist"));

console.log("src leaked secrets count:", srcIssues.length);
if (srcIssues.length > 0) console.log("src issues:", srcIssues);

console.log("dist leaked secrets count:", distIssues.length);
if (distIssues.length > 0) console.log("dist issues:", distIssues);

if (srcIssues.length === 0 && distIssues.length === 0) {
  console.log("PASSED: Zero backend secrets, database connection strings, or private credentials leaked in frontend files.");
}

