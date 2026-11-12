import React, { useState, useMemo } from "react";
import {
  HelpCircle,
  Search,
  Filter,
  PlusCircle,
  Copy,
  Edit3,
  Trash2,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  X,
  Save,
  Check,
  Sparkles
} from "lucide-react";
import { SECTIONS, allTopics } from "../../data/allTopics";
import { STAGES, LANGUAGES } from "../../utils/quizValidator";
import { LEARNING_STAGES } from "../../data/learningStages";
import { LEARNING_LANGUAGES } from "../../data/learningLanguages";
import { adminService } from "../../services/adminService";

export default function QuizManagerTab({
  curriculumOverrides = [],
  onRefreshOverrides,
  onNavigateValidation
}) {
  const [selectedSectionId, setSelectedSectionId] = useState("python-basics");
  const [selectedTopicId, setSelectedTopicId] = useState("what-is-python");
  const [selectedStage, setSelectedStage] = useState("young");
  const [selectedLanguage, setSelectedLanguage] = useState("english");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Question Editor Modal State
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [isNewQuestion, setIsNewQuestion] = useState(false);
  const [editorQIdx, setEditorQIdx] = useState(-1);
  const [saving, setSaving] = useState(false);

  // Available topics for currently selected section
  const sectionTopics = useMemo(() => {
    const sec = SECTIONS.find((s) => s.id === selectedSectionId);
    return sec ? sec.topics : [];
  }, [selectedSectionId]);

  // Current active topic (checking overrides first)
  const currentTopic = useMemo(() => {
    const override = curriculumOverrides.find(
      (o) => o.entity_type === "topic" && o.entity_id === selectedTopicId
    );
    if (override && override.data) return override.data;
    return allTopics.find((t) => t.id === selectedTopicId) || allTopics[0];
  }, [selectedTopicId, curriculumOverrides]);

  // Current questions list for selected topic, stage, and language
  const questionsList = useMemo(() => {
    const langPkg = currentTopic?.stages?.[selectedStage]?.languages?.[selectedLanguage];
    const qArray = langPkg?.questions;
    return Array.isArray(qArray) ? qArray : [];
  }, [currentTopic, selectedStage, selectedLanguage]);

  // Filtered questions based on search & difficulty
  const filteredQuestions = useMemo(() => {
    return questionsList.filter((q, idx) => {
      if (difficultyFilter !== "all" && q.difficulty?.toLowerCase() !== difficultyFilter.toLowerCase()) {
        return false;
      }
      if (searchQuery.trim()) {
        const qText = (q.question || "").toLowerCase();
        const explText = (q.explanation || "").toLowerCase();
        const optText = (q.options || []).join(" ").toLowerCase();
        const query = searchQuery.toLowerCase().trim();
        return qText.includes(query) || explText.includes(query) || optText.includes(query);
      }
      return true;
    });
  }, [questionsList, difficultyFilter, searchQuery]);

  // Save modified questions array back to topic
  const persistQuestionsArray = async (newQuestionsArray) => {
    setSaving(true);
    try {
      // Clone current topic
      const updatedTopic = JSON.parse(JSON.stringify(currentTopic));
      if (!updatedTopic.stages) updatedTopic.stages = {};
      if (!updatedTopic.stages[selectedStage]) updatedTopic.stages[selectedStage] = {};
      if (!updatedTopic.stages[selectedStage].languages) updatedTopic.stages[selectedStage].languages = {};
      if (!updatedTopic.stages[selectedStage].languages[selectedLanguage]) {
        updatedTopic.stages[selectedStage].languages[selectedLanguage] = {};
      }

      updatedTopic.stages[selectedStage].languages[selectedLanguage].questions = newQuestionsArray;

      await adminService.saveCurriculumOverride({
        entityType: "topic",
        entityId: updatedTopic.id,
        data: updatedTopic,
        isArchived: !!updatedTopic.is_archived
      });

      if (onRefreshOverrides) onRefreshOverrides();
    } catch (err) {
      alert(err.message || "Failed to save questions array.");
    } finally {
      setSaving(false);
    }
  };

  // Open modal to add a new question
  const handleAddNewQuestion = () => {
    setEditingQuestion({
      type: "Multiple Choice",
      difficulty: "Easy",
      question: "",
      options: ["", "", "", ""],
      correctAnswer: "",
      explanation: ""
    });
    setIsNewQuestion(true);
    setEditorQIdx(-1);
  };

  // Open modal to edit existing question
  const handleEditQuestion = (q, idx) => {
    setEditingQuestion(JSON.parse(JSON.stringify(q)));
    setIsNewQuestion(false);
    setEditorQIdx(idx);
  };

  // Duplicate question
  const handleDuplicateQuestion = async (q) => {
    if (!window.confirm("Duplicate this question in the current question bank?")) return;
    const duplicated = {
      ...JSON.parse(JSON.stringify(q)),
      question: `${q.question} (Copy)`
    };
    const updated = [...questionsList, duplicated];
    await persistQuestionsArray(updated);
  };

  // Reorder question Up / Down
  const handleMoveQuestion = async (index, direction) => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= questionsList.length) return;

    const copy = [...questionsList];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;

    await persistQuestionsArray(copy);
  };

  // Delete question
  const handleDeleteQuestion = async (index) => {
    if (!window.confirm(`Delete Question #${index + 1}? This cannot be undone.`)) return;
    const copy = [...questionsList];
    copy.splice(index, 1);
    await persistQuestionsArray(copy);
  };

  // Save question from editor modal
  const handleSaveModalQuestion = async (e) => {
    e.preventDefault();
    if (!editingQuestion) return;

    // Validation checks
    if (!editingQuestion.question.trim()) {
      alert("Please provide the question text.");
      return;
    }
    const cleanOpts = editingQuestion.options.map((o) => String(o).trim());
    if (cleanOpts.some((o) => !o)) {
      alert("All 4 options must contain non-empty answer choices.");
      return;
    }
    const optSet = new Set(cleanOpts);
    if (optSet.size !== cleanOpts.length) {
      alert("Options contain duplicate choices. Please provide 4 distinct answers.");
      return;
    }
    if (!cleanOpts.includes(editingQuestion.correctAnswer?.trim())) {
      alert("Please select one of the 4 options as the designated correct answer.");
      return;
    }

    const cleanedQuestion = {
      ...editingQuestion,
      question: editingQuestion.question.trim(),
      options: cleanOpts,
      correctAnswer: editingQuestion.correctAnswer.trim(),
      explanation: editingQuestion.explanation.trim()
    };

    let updatedList;
    if (isNewQuestion) {
      updatedList = [...questionsList, cleanedQuestion];
    } else {
      updatedList = [...questionsList];
      updatedList[editorQIdx] = cleanedQuestion;
    }

    await persistQuestionsArray(updatedList);
    setEditingQuestion(null);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Stage/Language Selector Card */}
      <div className="bg-white dark:bg-[#0c182a] border border-slate-200/80 dark:border-[#182c47] rounded-3xl p-5 shadow-sm space-y-4">
        {/* Section and Topic Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Curriculum Section (1 of 19)
            </label>
            <select
              value={selectedSectionId}
              onChange={(e) => {
                setSelectedSectionId(e.target.value);
                const firstTopic = SECTIONS.find((s) => s.id === e.target.value)?.topics[0];
                if (firstTopic) setSelectedTopicId(firstTopic.id);
              }}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-[#081220] border border-slate-200 dark:border-[#142338] text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              {SECTIONS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title} ({s.topics.length} topics)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Topic / Lesson
            </label>
            <select
              value={selectedTopicId}
              onChange={(e) => setSelectedTopicId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-[#081220] border border-slate-200 dark:border-[#142338] text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              {sectionTopics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.topicNumber ? `${t.topicNumber}. ` : ""}{t.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Stage and Language Selector Ribbons */}
        <div className="pt-3 border-t border-slate-100 dark:border-[#142338] flex flex-wrap items-center justify-between gap-3">
          {/* Stage pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1">
              Stage:
            </span>
            {LEARNING_STAGES.map((stg) => (
              <button
                key={stg.id}
                onClick={() => setSelectedStage(stg.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border flex items-center gap-1 ${
                  selectedStage === stg.id
                    ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                    : "bg-slate-50 dark:bg-[#081220] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-[#142338] hover:bg-slate-100 dark:hover:bg-[#102038]"
                }`}
              >
                <span>{stg.icon}</span> <span>{stg.label}</span>
              </button>
            ))}
          </div>

          {/* Language pills */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1">
              Language:
            </span>
            {LEARNING_LANGUAGES.map((lang) => (
              <button
                key={lang.id}
                onClick={() => setSelectedLanguage(lang.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border flex items-center gap-1 ${
                  selectedLanguage === lang.id
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                    : "bg-slate-50 dark:bg-[#081220] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-[#142338] hover:bg-slate-100 dark:hover:bg-[#102038]"
                }`}
              >
                <span>{lang.flag}</span> <span>{lang.shortLabel}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Controls & Question List Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2 max-w-md">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search size={15} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search questions, options, or explanations..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-[#0c182a] border border-slate-200 dark:border-[#182c47] text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>

          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white dark:bg-[#0c182a] border border-slate-200 dark:border-[#182c47] text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="all">All Difficulties</option>
            <option value="easy">Easy Only</option>
            <option value="medium">Medium Only</option>
            <option value="hard">Hard Only</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          {onNavigateValidation && (
            <button
              onClick={onNavigateValidation}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#102036] dark:hover:bg-[#162c4a] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-[#1a3152] text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <FileCheck2 size={15} className="text-blue-500" />
              <span>Full Audit Report</span>
            </button>
          )}

          <button
            onClick={handleAddNewQuestion}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-blue-500/25 transition cursor-pointer border-none"
          >
            <PlusCircle size={15} />
            <span>Add Question</span>
          </button>
        </div>
      </div>

      {/* 3. Question Cards Feed */}
      {filteredQuestions.length === 0 ? (
        <div className="py-16 text-center rounded-3xl bg-white dark:bg-[#0c182a] border border-slate-200/80 dark:border-[#182c47] p-8 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-3 border border-amber-500/20">
            <HelpCircle size={24} />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            No Questions Found for this Combination
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Topic '{currentTopic.title}' has no questions matching your filters for {selectedStage} stage in {selectedLanguage}.
          </p>
          <button
            onClick={handleAddNewQuestion}
            className="mt-4 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition cursor-pointer border-none"
          >
            Create Question #1
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQuestions.map((q, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-[#0c182a] border border-slate-200/80 dark:border-[#182c47] rounded-3xl p-5 shadow-sm space-y-4 hover:border-slate-300 dark:hover:border-[#223d63] transition"
            >
              {/* Question Card Top Bar */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <span className="w-7 h-7 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-mono text-xs font-black flex items-center justify-center border border-blue-500/20 shrink-0">
                    Q{idx + 1}
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-relaxed">
                      {q.question}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.2 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-[#142338] text-slate-600 dark:text-slate-300">
                        {q.difficulty || "Easy"}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {q.type || "Multiple Choice"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Action Controls */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleMoveQuestion(idx, "up")}
                    disabled={idx === 0}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-30 cursor-pointer"
                    title="Move Up"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    onClick={() => handleMoveQuestion(idx, "down")}
                    disabled={idx === filteredQuestions.length - 1}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-30 cursor-pointer"
                    title="Move Down"
                  >
                    <ArrowDown size={14} />
                  </button>
                  <button
                    onClick={() => handleDuplicateQuestion(q)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
                    title="Duplicate Question"
                  >
                    <Copy size={14} />
                  </button>
                  <button
                    onClick={() => handleEditQuestion(q, idx)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
                    title="Edit Question"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    onClick={() => handleDeleteQuestion(idx)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 cursor-pointer"
                    title="Delete Question"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* 4 Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {(q.options || []).map((opt, oIdx) => {
                  const isCorrect = opt === q.correctAnswer;
                  return (
                    <div
                      key={oIdx}
                      className={`p-2.5 rounded-xl border text-xs font-medium flex items-center justify-between gap-2 ${
                        isCorrect
                          ? "bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-700/80 text-emerald-900 dark:text-emerald-200 font-bold"
                          : "bg-slate-50/60 dark:bg-[#081220] border-slate-200/80 dark:border-[#142338] text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-5 h-5 rounded-md bg-white dark:bg-[#0c182a] border border-slate-200 dark:border-[#182c47] font-mono text-[10px] font-bold text-slate-500 flex items-center justify-center shrink-0">
                          {String.fromCharCode(65 + oIdx)}
                        </span>
                        <span className="truncate">{opt}</span>
                      </div>

                      {isCorrect && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500 text-white flex items-center gap-1 shrink-0">
                          <Check size={11} strokeWidth={3} />
                          <span>Key</span>
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Explanation Callout */}
              {q.explanation && (
                <div className="p-3 rounded-xl bg-blue-50/50 dark:bg-[#081528] border border-blue-200/60 dark:border-[#122842] text-xs text-blue-900 dark:text-blue-200 flex items-start gap-2">
                  <Sparkles size={14} className="text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-blue-700 dark:text-blue-300">Explanation & Remediation: </span>
                    <span className="text-slate-600 dark:text-slate-300">{q.explanation}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 4. Question Editor Modal */}
      {editingQuestion && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#0c182a] border border-slate-200 dark:border-[#1a3152] rounded-3xl max-w-2xl w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-[#182c47]">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Question Bank Editor • {selectedTopicId} ({selectedStage} • {selectedLanguage})
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {isNewQuestion ? "Add New Quiz Question" : `Edit Question #${editorQIdx + 1}`}
                </h3>
              </div>
              <button
                onClick={() => setEditingQuestion(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveModalQuestion} className="space-y-4">
              {/* Question Text */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Question Prompt Text
                </label>
                <textarea
                  rows={3}
                  value={editingQuestion.question || ""}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, question: e.target.value })
                  }
                  required
                  placeholder="e.g. Which keyword is used to define a function in Python?"
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-[#102036] border border-slate-200 dark:border-[#1a3152] text-xs text-slate-900 dark:text-white font-medium"
                />
              </div>

              {/* Difficulty & Type */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Difficulty Level
                  </label>
                  <select
                    value={editingQuestion.difficulty || "Easy"}
                    onChange={(e) =>
                      setEditingQuestion({ ...editingQuestion, difficulty: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#102036] border border-slate-200 dark:border-[#1a3152] text-xs font-semibold text-slate-800 dark:text-slate-200"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Question Type
                  </label>
                  <input
                    type="text"
                    value={editingQuestion.type || "Multiple Choice"}
                    onChange={(e) =>
                      setEditingQuestion({ ...editingQuestion, type: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#102036] border border-slate-200 dark:border-[#1a3152] text-xs text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              {/* 4 Answer Options */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Answer Options (Select the Radio Button for the Correct Answer Key)
                  </label>
                </div>
                <div className="space-y-2">
                  {(editingQuestion.options || ["", "", "", ""]).map((opt, oIdx) => {
                    const isKey = editingQuestion.correctAnswer === opt && opt !== "";
                    return (
                      <div key={oIdx} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="correctAnswerKey"
                          checked={isKey}
                          onChange={() =>
                            setEditingQuestion({ ...editingQuestion, correctAnswer: opt })
                          }
                          className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                          title="Set as correct answer"
                        />
                        <div className="relative flex-1">
                          <span className="absolute inset-y-0 left-0 pl-3 flex items-center font-mono text-xs font-bold text-slate-400">
                            {String.fromCharCode(65 + oIdx)}.
                          </span>
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => {
                              const newOpts = [...editingQuestion.options];
                              newOpts[oIdx] = e.target.value;
                              // If this option was selected as the key, update correctAnswer as well
                              const wasSelected = editingQuestion.correctAnswer === opt;
                              setEditingQuestion({
                                ...editingQuestion,
                                options: newOpts,
                                correctAnswer: wasSelected ? e.target.value : editingQuestion.correctAnswer
                              });
                            }}
                            required
                            placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                            className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-[#102036] border border-slate-200 dark:border-[#1a3152] text-xs text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Remediation Explanation */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Explanation & Feedback
                </label>
                <textarea
                  rows={2}
                  value={editingQuestion.explanation || ""}
                  onChange={(e) =>
                    setEditingQuestion({ ...editingQuestion, explanation: e.target.value })
                  }
                  required
                  placeholder="Explain why the answer is correct to reinforce learner mastery..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#102036] border border-slate-200 dark:border-[#1a3152] text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-200/80 dark:border-[#182c47] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingQuestion(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#14233a] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/25 transition cursor-pointer border-none disabled:opacity-50"
                >
                  {saving ? "Saving Question..." : "Save Question to Bank"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
