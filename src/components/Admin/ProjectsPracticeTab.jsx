import React, { useState } from "react";
import {
  FolderGit2,
  Code2,
  CheckCircle2,
  Play,
  Edit3,
  Trash2,
  PlusCircle,
  Eye,
  Award,
  Sparkles,
  Search,
  Filter,
  Check,
  X
} from "lucide-react";
import { practiceData } from "../../data/practiceData";
import { projectsData } from "../../data/projectsData";
import { LEARNING_STAGES } from "../../data/learningStages";

export default function ProjectsPracticeTab() {
  const [activeSubTab, setActiveSubTab] = useState("practice"); // "practice" | "projects" | "rewards"
  const [selectedStage, setSelectedStage] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Simulated Test Run Preview Modal
  const [testRunItem, setTestRunItem] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [testResult, setTestResult] = useState(null);

  // Filtered practice problems
  const filteredPractice = practiceData.filter((p) => {
    if (selectedStage !== "all" && p.stage !== selectedStage) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        p.question?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.id?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Filtered guided projects
  const filteredProjects = projectsData.filter((proj) => {
    if (selectedStage !== "all" && proj.stage !== selectedStage) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        proj.name?.toLowerCase().includes(q) ||
        proj.description?.toLowerCase().includes(q) ||
        proj.id?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Handle test run simulation
  const handleStartTestRun = (item) => {
    setTestRunItem(item);
    setSelectedAnswer(null);
    setTestResult(null);
  };

  const handleVerifyAnswer = (option) => {
    setSelectedAnswer(option);
    if (option === testRunItem.correctAnswer) {
      setTestResult({ pass: true, msg: "Verified: Correct Answer Key matched!" });
    } else {
      setTestResult({ pass: false, msg: `Incorrect: Expected '${testRunItem.correctAnswer}'` });
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Sub-Tab Switcher */}
      <div className="bg-white dark:bg-[#0c182a] border border-slate-200/80 dark:border-[#182c47] rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white flex items-center justify-center shadow-md">
              <FolderGit2 size={20} />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Projects, Practice Sandbox & Rewards
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage practice problems ({practiceData.length}), guided projects ({projectsData.length}), and milestones
              </p>
            </div>
          </div>

          {/* Subtabs */}
          <div className="inline-flex p-1 rounded-2xl bg-slate-100 dark:bg-[#081220] border border-slate-200/80 dark:border-[#142338] shadow-inner gap-1">
            <button
              onClick={() => setActiveSubTab("practice")}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer border-none ${
                activeSubTab === "practice"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Practice Sandbox ({practiceData.length})
            </button>
            <button
              onClick={() => setActiveSubTab("projects")}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer border-none ${
                activeSubTab === "projects"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Guided Projects ({projectsData.length})
            </button>
            <button
              onClick={() => setActiveSubTab("rewards")}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer border-none ${
                activeSubTab === "rewards"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Milestones & XP
            </button>
          </div>
        </div>

        {/* Filter bar */}
        {activeSubTab !== "rewards" && (
          <div className="pt-3 border-t border-slate-100 dark:border-[#142338] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1">
                Stage:
              </span>
              <button
                onClick={() => setSelectedStage("all")}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer border ${
                  selectedStage === "all"
                    ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                    : "bg-slate-50 dark:bg-[#081220] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-[#142338]"
                }`}
              >
                All Stages
              </button>
              {LEARNING_STAGES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedStage(s.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer border flex items-center gap-1 ${
                    selectedStage === s.id
                      ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                      : "bg-slate-50 dark:bg-[#081220] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-[#142338]"
                  }`}
                >
                  <span>{s.icon}</span> <span>{s.label}</span>
                </button>
              ))}
            </div>

            <div className="relative w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search exercises..."
                className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-[#081220] border border-slate-200 dark:border-[#142338] text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* 2. Sub-Tab 1: Practice Problems */}
      {activeSubTab === "practice" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPractice.map((prob) => (
              <div
                key={prob.id}
                className="bg-white dark:bg-[#0c182a] border border-slate-200/80 dark:border-[#182c47] rounded-3xl p-5 shadow-sm space-y-3 hover:border-slate-300 dark:hover:border-[#223d63] transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                      {prob.id}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-[#142338] text-slate-600 dark:text-slate-300">
                      {prob.category || prob.stage}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-relaxed">
                    {prob.question}
                  </h4>

                  {prob.code && (
                    <div className="mt-2.5 p-2.5 rounded-xl bg-slate-900 font-mono text-xs text-emerald-400 border border-slate-800">
                      <pre>{prob.code}</pre>
                    </div>
                  )}

                  <div className="mt-3 space-y-1.5">
                    {(prob.options || []).map((opt, oIdx) => {
                      const isCorrect = opt === prob.correctAnswer;
                      return (
                        <div
                          key={oIdx}
                          className={`p-2 rounded-xl text-xs flex items-center justify-between border ${
                            isCorrect
                              ? "bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-400 text-emerald-900 dark:text-emerald-200 font-bold"
                              : "bg-slate-50/50 dark:bg-[#081220] border-slate-200/60 dark:border-[#142338] text-slate-600 dark:text-slate-300"
                          }`}
                        >
                          <span className="truncate">{opt}</span>
                          {isCorrect && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-emerald-500 text-white">
                              Key
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-[#142338] flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">
                    Difficulty: {prob.difficulty || "Easy"}
                  </span>

                  <button
                    onClick={() => handleStartTestRun(prob)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 font-bold text-xs transition cursor-pointer border border-blue-200 dark:border-blue-800/80"
                  >
                    <Play size={12} />
                    <span>Simulate Test Run</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Sub-Tab 2: Guided Projects Portfolio */}
      {activeSubTab === "projects" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProjects.map((proj) => (
              <div
                key={proj.id}
                className="bg-white dark:bg-[#0c182a] border border-slate-200/80 dark:border-[#182c47] rounded-3xl p-5 shadow-sm space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                      {proj.id}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-[#142338] text-slate-600 dark:text-slate-300">
                      {proj.difficulty} • {proj.stage}
                    </span>
                  </div>

                  <h4 className="text-base font-black text-slate-900 dark:text-white">
                    {proj.name}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    {proj.description}
                  </p>

                  {/* Requirements List */}
                  <div className="mt-3">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                      Project Requirements:
                    </span>
                    <ul className="mt-1 space-y-1 text-xs text-slate-700 dark:text-slate-300 pl-4 list-disc">
                      {(proj.requirements || []).slice(0, 3).map((req, rIdx) => (
                        <li key={rIdx}>{req}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Expected Output */}
                  {proj.expectedResult && (
                    <div className="mt-3">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                        Expected Terminal Output:
                      </span>
                      <div className="mt-1 p-2.5 rounded-xl bg-slate-900 font-mono text-[11px] text-slate-200 border border-slate-800">
                        <pre>{proj.expectedResult}</pre>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-[#142338] flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {(proj.skillsUsed || []).map((sk, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-[#102036] text-slate-600 dark:text-slate-300"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>

                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 size={13} />
                    <span>Verified</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Sub-Tab 3: Gamification & Rewards Configurator */}
      {activeSubTab === "rewards" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Level Tier Milestones */}
            <div className="bg-white dark:bg-[#0c182a] border border-slate-200/80 dark:border-[#182c47] rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <Award size={18} className="text-amber-500" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Learner Level & XP Progression
                </h4>
              </div>
              <p className="text-xs text-slate-500">
                Gamification tiers automatically calculated from user XP balances in PostgreSQL
              </p>

              <div className="space-y-2.5">
                {[
                  { level: 1, title: "Level 1: Python Novice", xp: "0–99 XP", badge: "🌱", color: "text-emerald-500" },
                  { level: 2, title: "Level 2: Script Builder", xp: "100–299 XP", badge: "⚡", color: "text-blue-500" },
                  { level: 3, title: "Level 3: Algorithm Crafter", xp: "300–749 XP", badge: "🔥", color: "text-indigo-500" },
                  { level: 4, title: "Level 4: Systems Architect", xp: "750–1499 XP", badge: "💎", color: "text-purple-500" },
                  { level: 5, title: "Level 5: Python Master", xp: "1500+ XP", badge: "👑", color: "text-amber-500" }
                ].map((tier) => (
                  <div
                    key={tier.level}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-[#081220] border border-slate-200/60 dark:border-[#142338] text-xs flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">{tier.badge}</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{tier.title}</span>
                    </div>
                    <span className="font-mono font-bold text-slate-500">{tier.xp}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Streak Bonus Multipliers */}
            <div className="bg-white dark:bg-[#0c182a] border border-slate-200/80 dark:border-[#182c47] rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-blue-500" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Daily Streak & Mastery Rewards
                </h4>
              </div>
              <p className="text-xs text-slate-500">
                Automatic reward allocation triggered upon lesson mastery and daily activity
              </p>

              <div className="space-y-2.5">
                {[
                  { action: "First Account Sign Up", reward: "+50 Welcome XP", trigger: "One-time registration" },
                  { action: "Lesson Completed", reward: "+30 Mastery XP", trigger: "Per completed lesson" },
                  { action: "Quiz Passed (Score ≥ 70%)", reward: "+20 Evaluation XP", trigger: "Per successful quiz" },
                  { action: "3-Day Streak Maintained", reward: "+25 Consistency Bonus", trigger: "Active 3 days" },
                  { action: "7-Day Streak Maintained", reward: "+75 Super Streak Bonus", trigger: "Active 7 days" }
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-[#081220] border border-slate-200/60 dark:border-[#142338] text-xs flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-200">{item.action}</div>
                      <div className="text-[10px] text-slate-400">{item.trigger}</div>
                    </div>
                    <span className="font-mono font-bold text-amber-500">{item.reward}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Simulated Test Run Preview Modal */}
      {testRunItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0c182a] border border-slate-200 dark:border-[#1a3152] rounded-3xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-[#182c47]">
              <div className="flex items-center gap-2">
                <Play size={18} className="text-blue-500" />
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Simulate Exercise Test Run
                </h3>
              </div>
              <button
                onClick={() => setTestRunItem(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
              {testRunItem.question}
            </div>

            {testRunItem.code && (
              <div className="p-3 rounded-xl bg-slate-900 font-mono text-xs text-emerald-400 border border-slate-800">
                <pre>{testRunItem.code}</pre>
              </div>
            )}

            <div className="space-y-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                Click an Option to Verify Expected Outcome:
              </span>
              {(testRunItem.options || []).map((opt, oIdx) => (
                <button
                  key={oIdx}
                  onClick={() => handleVerifyAnswer(opt)}
                  className={`w-full p-2.5 rounded-xl text-left text-xs font-semibold transition cursor-pointer border ${
                    selectedAnswer === opt
                      ? opt === testRunItem.correctAnswer
                        ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-800 dark:text-emerald-200 font-bold"
                        : "bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-800 dark:text-rose-200 font-bold"
                      : "bg-slate-50 dark:bg-[#081220] border-slate-200 dark:border-[#142338] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#102038]"
                  }`}
                >
                  <span>{String.fromCharCode(65 + oIdx)}. {opt}</span>
                </button>
              ))}
            </div>

            {testResult && (
              <div
                className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                  testResult.pass
                    ? "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
                    : "bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-500/30"
                }`}
              >
                {testResult.pass ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                <span>{testResult.msg}</span>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setTestRunItem(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#102036] dark:hover:bg-[#183050] text-slate-700 dark:text-slate-200 font-bold text-xs cursor-pointer border-none"
              >
                Close Simulator
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
