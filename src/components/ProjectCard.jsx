import React, { useState } from "react";
import CodeBlock from "./CodeBlock";
import { FolderGit2, Check, ChevronDown, ChevronUp, Layers, ListChecks, PlayCircle, Lock } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function ProjectCard({ project }) {
  const { isAuthenticated, openAuthModal } = useAuth();
  const [expanded, setExpanded] = useState(false);

  const handleToggle = () => {
    if (!isAuthenticated) {
      openAuthModal("login", "Sign in required to view project specifications, test steps, and solution code!");
      return;
    }
    setExpanded(!expanded);
  };

  const difficultyColors = {
    Beginner: "bg-emerald-50 dark:bg-emerald-950/60 text-[#16A34A] border-emerald-200 dark:border-emerald-800",
    Intermediate: "bg-[#F3F7FC] dark:bg-[#102B50] text-[#0756A5] dark:text-[#60A5FA] border-[#E2E8F0] dark:border-[#1B3B66]",
    Advanced: "bg-amber-50 dark:bg-amber-950/60 text-[#FFB800] border-amber-300 dark:border-amber-700"
  };

  return (
    <div className="premium-card overflow-hidden transition-all duration-200">
      <div className="p-5 sm:p-7">
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3.5">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold border ${
              difficultyColors[project.difficulty] || "bg-slate-100 dark:bg-[#102541] text-slate-700 dark:text-[#D2DEEC] border-slate-200 dark:border-[#183657]"
            }`}
          >
            {project.difficulty}
          </span>
          <div className="flex items-center gap-1.5 text-xs text-[#0756A5] dark:text-[#60A5FA] font-bold font-mono">
            <FolderGit2 size={16} />
            <span>Interactive Project</span>
          </div>
        </div>

        {/* Project Name */}
        <h3 className="text-lg sm:text-xl font-bold text-[#102B50] dark:text-white mb-2 leading-snug">
          {project.name}
        </h3>

        {/* Description */}
        <p className="body-base text-[#64748B] dark:text-[#CBD5E1] leading-relaxed mb-4">
          {project.description}
        </p>

        {/* Skills Used */}
        <div className="mb-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#0756A5] dark:text-[#60A5FA] mb-2 flex items-center gap-1.5">
            <Layers size={14} />
            Skills Used
          </h4>
          <div className="flex flex-wrap gap-2">
            {project.skillsUsed.map((skill, idx) => (
              <span
                key={idx}
                className="px-3 py-1 rounded-lg bg-[#F3F7FC] dark:bg-[#102B50] text-[#102B50] dark:text-white text-xs sm:text-sm font-semibold border border-[#E2E8F0] dark:border-[#1B3B66]"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Toggle Details Button */}
        <button
          onClick={handleToggle}
          className="btn-vibrant-secondary w-full text-xs sm:text-sm"
        >
          {!isAuthenticated && <Lock size={15} className="text-[#0756A5] dark:text-[#FFB800] shrink-0" />}
          {expanded ? (
            <>
              <ChevronUp size={18} /> <span>Hide Specifications & Code</span>
            </>
          ) : (
            <>
              <ChevronDown size={18} /> <span>View Requirements, Steps & Code</span>
            </>
          )}
        </button>
      </div>

      {/* Expanded Details Section */}
      {expanded && (
        <div className="border-t border-[#E2E8F0] dark:border-[#1B3B66] bg-[#F3F7FC] dark:bg-[#0A1E38] p-5 sm:p-7 space-y-6 animate-in">
          {/* Requirements */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#102B50] dark:text-white mb-2.5 flex items-center gap-2">
              <ListChecks size={16} className="text-[#0756A5]" />
              Project Requirements
            </h4>
            <ul className="space-y-2 list-none m-0 p-0">
              {project.requirements.map((req, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-sm sm:text-base text-[#102B50] dark:text-[#CBD5E1] leading-relaxed">
                  <Check size={18} className="text-[#16A34A] mt-0.5 flex-shrink-0" />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Expected Result */}
          {project.expectedResult && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <PlayCircle size={16} className="text-[#0756A5] dark:text-[#FFB800]" />
                Expected Result / Console Output
              </h4>
              <div className="p-4 bg-slate-900 dark:bg-[#040913] text-blue-400 dark:text-[#60B7FF] rounded-xl font-mono text-xs sm:text-sm overflow-x-auto border border-slate-800 dark:border-[#183657] shadow-md">
                <pre className="m-0">{project.expectedResult}</pre>
              </div>
            </div>
          )}

          {/* Basic Implementation Steps */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-2.5">
              Basic Implementation Steps
            </h4>
            <ol className="space-y-2.5 list-none m-0 p-0">
              {project.basicImplementationSteps.map((step, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm sm:text-base text-slate-700 dark:text-[#D2DEEC] leading-relaxed">
                  <span className="w-6 h-6 rounded-full bg-blue-50 dark:bg-[#102541] text-blue-600 dark:text-[#8CC8FF] flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 border border-blue-200 dark:border-[#183657]">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Starter Code Snippet */}
          {project.codeSnippet && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-2">
                Starter Implementation Code
              </h4>
              <CodeBlock code={project.codeSnippet} language="python" title={`${project.name}.py`} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
