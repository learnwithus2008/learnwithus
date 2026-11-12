import React, { useState, useMemo } from "react";
import {
  BookOpen,
  Search,
  Filter,
  PlusCircle,
  Edit3,
  Eye,
  Archive,
  RotateCcw,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  X,
  Save,
  Code2,
  Globe,
  Layers,
  ChevronRight,
  ExternalLink,
  ShieldAlert
} from "lucide-react";
import { SECTIONS, allTopics } from "../../data/allTopics";
import { LEARNING_STAGES } from "../../data/learningStages";
import { LEARNING_LANGUAGES } from "../../data/learningLanguages";
import { adminService } from "../../services/adminService";

export default function CurriculumManagerTab({
  curriculumOverrides = [],
  onRefreshOverrides,
  onOpenAppPreview,
  onNavigateTopic
}) {
  const [selectedSectionId, setSelectedSectionId] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'published' | 'archived'

  // Topic Editor Modal State
  const [editingTopic, setEditingTopic] = useState(null);
  const [editStage, setEditStage] = useState("young");
  const [editLanguage, setEditLanguage] = useState("english");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Lesson Preview Modal State
  const [previewingTopic, setPreviewingTopic] = useState(null);
  const [previewStage, setPreviewStage] = useState("young");
  const [previewLanguage, setPreviewLanguage] = useState("english");

  // Deletion Safety Warning Modal State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteChecking, setDeleteChecking] = useState(false);
  const [deleteUsageStats, setDeleteUsageStats] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  // Merge base topics with saved overrides
  const mergedTopics = useMemo(() => {
    return allTopics.map((baseTopic) => {
      const override = curriculumOverrides.find(
        (o) => o.entity_type === "topic" && o.entity_id === baseTopic.id
      );
      if (override && override.data) {
        return {
          ...baseTopic,
          ...override.data,
          is_archived: override.is_archived
        };
      }
      return {
        ...baseTopic,
        is_archived: false
      };
    });
  }, [curriculumOverrides]);

  // Filtered topics
  const filteredTopics = useMemo(() => {
    return mergedTopics.filter((t) => {
      // Section filter
      if (selectedSectionId !== "all" && t.sectionId !== selectedSectionId) {
        return false;
      }
      // Status filter
      if (statusFilter === "published" && t.is_archived) return false;
      if (statusFilter === "archived" && !t.is_archived) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const titleMatch = t.title?.toLowerCase().includes(q);
        const idMatch = t.id?.toLowerCase().includes(q);
        const secMatch = t.sectionTitle?.toLowerCase().includes(q);
        return titleMatch || idMatch || secMatch;
      }
      return true;
    });
  }, [mergedTopics, selectedSectionId, statusFilter, searchQuery]);

  // Open editor for a topic
  const handleOpenEdit = (topic) => {
    // Deep clone topic object so edits are isolated until saved
    setEditingTopic(JSON.parse(JSON.stringify(topic)));
    setEditStage("young");
    setEditLanguage("english");
    setSaveSuccess(false);
  };

  // Close editor
  const handleCloseEdit = () => {
    setEditingTopic(null);
    setSaveSuccess(false);
  };

  // Save topic edits
  const handleSaveTopic = async (e) => {
    e.preventDefault();
    if (!editingTopic) return;

    setSaving(true);
    setSaveSuccess(false);
    try {
      await adminService.saveCurriculumOverride({
        entityType: "topic",
        entityId: editingTopic.id,
        data: editingTopic,
        isArchived: !!editingTopic.is_archived
      });
      setSaveSuccess(true);
      if (onRefreshOverrides) onRefreshOverrides();
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (err) {
      alert(err.message || "Failed to save topic changes.");
    } finally {
      setSaving(false);
    }
  };

  // Toggle archive status
  const handleToggleArchive = async (topic) => {
    const newArchived = !topic.is_archived;
    const confirmMsg = newArchived
      ? `Archive lesson '${topic.title}'? It will be hidden from learners but will preserve student progress.`
      : `Restore lesson '${topic.title}' to published curriculum?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      await adminService.saveCurriculumOverride({
        entityType: "topic",
        entityId: topic.id,
        data: topic,
        isArchived: newArchived
      });
      if (onRefreshOverrides) onRefreshOverrides();
    } catch (err) {
      alert(err.message || "Failed to update archive status.");
    }
  };

  // Check usage before deletion
  const handleInitiateDelete = async (topic) => {
    setDeleteTarget(topic);
    setDeleteChecking(true);
    setDeleteUsageStats(null);
    setDeleteError(null);

    try {
      const usage = await adminService.checkTopicUsage(topic.id);
      setDeleteUsageStats(usage);
    } catch (err) {
      setDeleteError(err.message || "Failed to verify topic student progress.");
    } finally {
      setDeleteChecking(false);
    }
  };

  // Confirm delete if no student progress
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      await adminService.deleteCurriculumOverride("topic", deleteTarget.id);
      setDeleteTarget(null);
      if (onRefreshOverrides) onRefreshOverrides();
    } catch (err) {
      alert(err.message || "Deletion failed.");
    }
  };

  // Safe accessor for current editing topic stage and language package
  const currentLangPackage = editingTopic?.stages?.[editStage]?.languages?.[editLanguage] || {};

  const handleUpdateLangField = (fieldName, value) => {
    if (!editingTopic) return;
    const updated = { ...editingTopic };
    if (!updated.stages) updated.stages = {};
    if (!updated.stages[editStage]) updated.stages[editStage] = {};
    if (!updated.stages[editStage].languages) updated.stages[editStage].languages = {};
    if (!updated.stages[editStage].languages[editLanguage]) {
      updated.stages[editStage].languages[editLanguage] = {};
    }

    updated.stages[editStage].languages[editLanguage][fieldName] = value;
    setEditingTopic(updated);
  };

  const handleUpdateExplanation = (explKey, value) => {
    if (!editingTopic) return;
    const updated = { ...editingTopic };
    if (!updated.stages) updated.stages = {};
    if (!updated.stages[editStage]) updated.stages[editStage] = {};
    if (!updated.stages[editStage].languages) updated.stages[editStage].languages = {};
    if (!updated.stages[editStage].languages[editLanguage]) {
      updated.stages[editStage].languages[editLanguage] = {};
    }
    if (!updated.stages[editStage].languages[editLanguage].explanations) {
      updated.stages[editStage].languages[editLanguage].explanations = {};
    }

    updated.stages[editStage].languages[editLanguage].explanations[explKey] = value;
    setEditingTopic(updated);
  };

  const handleUpdatePracticeField = (field, value) => {
    if (!editingTopic) return;
    const updated = { ...editingTopic };
    if (!updated.stages) updated.stages = {};
    if (!updated.stages[editStage]) updated.stages[editStage] = {};
    if (!updated.stages[editStage].languages) updated.stages[editStage].languages = {};
    if (!updated.stages[editStage].languages[editLanguage]) {
      updated.stages[editStage].languages[editLanguage] = {};
    }
    if (!updated.stages[editStage].languages[editLanguage].tryItYourself) {
      updated.stages[editStage].languages[editLanguage].tryItYourself = {};
    }

    updated.stages[editStage].languages[editLanguage].tryItYourself[field] = value;
    setEditingTopic(updated);
  };

  return (
    <div className="space-y-6">
      {/* 1. Top Section Filter Dock */}
      <div className="bg-white dark:bg-[#0c182a] border border-slate-200/80 dark:border-[#182c47] rounded-3xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20">
              <Layers size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Curriculum Structure (19 Sections • 198 Lessons)
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Filter by section or select a section to review pedagogical coverage
              </p>
            </div>
          </div>

          <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
            Showing {filteredTopics.length} of {allTopics.length} Lessons
          </span>
        </div>

        {/* Section Pill Carousel */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          <button
            onClick={() => setSelectedSectionId("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer border ${
              selectedSectionId === "all"
                ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                : "bg-slate-50 dark:bg-[#081220] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-[#142338] hover:bg-slate-100 dark:hover:bg-[#102038]"
            }`}
          >
            All Sections ({allTopics.length})
          </button>

          {SECTIONS.map((sec) => (
            <button
              key={sec.id}
              onClick={() => setSelectedSectionId(sec.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer border flex items-center gap-1.5 ${
                selectedSectionId === sec.id
                  ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                  : "bg-slate-50 dark:bg-[#081220] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-[#142338] hover:bg-slate-100 dark:hover:bg-[#102038]"
              }`}
            >
              <span>Sec {sec.number}</span>
              <span className="opacity-70 font-normal">({sec.topics.length})</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Controls: Search, Status, and Action */}
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
              placeholder="Search by topic title, topic ID, or section..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-[#0c182a] border border-slate-200 dark:border-[#182c47] text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white dark:bg-[#0c182a] border border-slate-200 dark:border-[#182c47] text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="published">Published Only</option>
            <option value="archived">Archived Only</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              // Create empty custom topic template
              const newId = `custom-topic-${Date.now().toString().slice(-4)}`;
              handleOpenEdit({
                id: newId,
                topicNumber: allTopics.length + 1,
                sectionId: selectedSectionId !== "all" ? selectedSectionId : "python-basics",
                sectionTitle: "Custom Curriculum Topic",
                title: "New Custom Lesson",
                stages: {
                  young: {
                    languages: {
                      english: {
                        whatIsIt: "",
                        whyDoWeNeedIt: "",
                        intro: "",
                        code: "# Write sample Python code here\nprint('Hello, Python!')",
                        output: "Hello, Python!",
                        explanations: {
                          simple: "Simple explanation for students"
                        },
                        questions: []
                      }
                    }
                  }
                }
              });
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-blue-500/25 transition cursor-pointer border-none"
          >
            <PlusCircle size={15} />
            <span>Create Custom Lesson</span>
          </button>
        </div>
      </div>

      {/* 3. Topics Table View */}
      <div className="bg-white dark:bg-[#0c182a] border border-slate-200/80 dark:border-[#182c47] rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-[#182c47] bg-slate-50/50 dark:bg-[#060e18]/40 text-slate-400 font-extrabold uppercase tracking-wider">
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4">Topic Title & ID</th>
                <th className="py-3 px-4">Curriculum Section</th>
                <th className="py-3 px-4 text-center">Stages</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#142338]">
              {filteredTopics.map((topic, idx) => (
                <tr
                  key={topic.id}
                  className={`hover:bg-slate-50/60 dark:hover:bg-[#102036] transition ${
                    topic.is_archived ? "opacity-60 bg-slate-50/30 dark:bg-slate-900/30" : ""
                  }`}
                >
                  <td className="py-3 px-4 text-center font-mono text-slate-400 font-bold">
                    {topic.topicNumber || idx + 1}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>{topic.title}</span>
                      {topic.is_archived && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800">
                          Archived
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                      {topic.id}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300 font-semibold">
                    {topic.sectionTitle || topic.sectionId}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center gap-1 font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-900">
                      5 Stages • 4 Langs
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        topic.is_archived
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                          : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${topic.is_archived ? "bg-amber-500" : "bg-emerald-500"}`} />
                      {topic.is_archived ? "Archived" : "Published"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Preview Button */}
                      <button
                        onClick={() => {
                          setPreviewingTopic(topic);
                          setPreviewStage("young");
                          setPreviewLanguage("english");
                        }}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#102036] dark:hover:bg-[#162c4a] text-slate-600 dark:text-slate-300 transition cursor-pointer"
                        title="Preview Lesson exact student format"
                      >
                        <Eye size={14} />
                      </button>

                      {/* Edit Button */}
                      <button
                        onClick={() => handleOpenEdit(topic)}
                        className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 transition cursor-pointer border border-blue-200 dark:border-blue-800/80"
                        title="Edit Lesson content across all stages & languages"
                      >
                        <Edit3 size={14} />
                      </button>

                      {/* Archive/Restore */}
                      <button
                        onClick={() => handleToggleArchive(topic)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#102036] dark:hover:bg-[#162c4a] text-slate-600 dark:text-slate-300 transition cursor-pointer"
                        title={topic.is_archived ? "Restore to published" : "Archive topic"}
                      >
                        {topic.is_archived ? <RotateCcw size={14} /> : <Archive size={14} />}
                      </button>

                      {/* Delete with Protection */}
                      <button
                        onClick={() => handleInitiateDelete(topic)}
                        className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 transition cursor-pointer border border-rose-200 dark:border-rose-900/60"
                        title="Delete topic with student progress protection"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Topic Editor Modal */}
      {editingTopic && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#0c182a] border border-slate-200 dark:border-[#1a3152] rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200/80 dark:border-[#182c47] flex items-center justify-between bg-slate-50/50 dark:bg-[#081220]/50">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Curriculum Editor • {editingTopic.id}
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Edit Lesson: {editingTopic.title}
                </h3>
              </div>
              <button
                onClick={handleCloseEdit}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#102038] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Stage & Language Tabs */}
            <div className="px-5 py-3 border-b border-slate-200/80 dark:border-[#182c47] bg-slate-100/60 dark:bg-[#060e18]/60 flex flex-wrap items-center justify-between gap-3">
              {/* Stages */}
              <div className="flex items-center gap-1.5 overflow-x-auto">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1">
                  Stage:
                </span>
                {LEARNING_STAGES.map((stg) => (
                  <button
                    key={stg.id}
                    type="button"
                    onClick={() => setEditStage(stg.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer border ${
                      editStage === stg.id
                        ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                        : "bg-white dark:bg-[#0c182a] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-[#182c47]"
                    }`}
                  >
                    <span>{stg.icon}</span> <span>{stg.label}</span>
                  </button>
                ))}
              </div>

              {/* Languages */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1">
                  Language:
                </span>
                {LEARNING_LANGUAGES.map((lang) => (
                  <button
                    key={lang.id}
                    type="button"
                    onClick={() => setEditLanguage(lang.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer border ${
                      editLanguage === lang.id
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                        : "bg-white dark:bg-[#0c182a] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-[#182c47]"
                    }`}
                  >
                    <span>{lang.flag}</span> <span>{lang.shortLabel}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSaveTopic} className="p-6 overflow-y-auto space-y-5 flex-1">
              {/* Basic Meta */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Lesson Title
                  </label>
                  <input
                    type="text"
                    value={editingTopic.title || ""}
                    onChange={(e) => setEditingTopic({ ...editingTopic, title: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#102036] border border-slate-200 dark:border-[#1a3152] text-xs text-slate-900 dark:text-white font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Section Association
                  </label>
                  <select
                    value={editingTopic.sectionId || ""}
                    onChange={(e) => {
                      const foundSec = SECTIONS.find((s) => s.id === e.target.value);
                      setEditingTopic({
                        ...editingTopic,
                        sectionId: e.target.value,
                        sectionTitle: foundSec ? foundSec.title : editingTopic.sectionTitle
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#102036] border border-slate-200 dark:border-[#1a3152] text-xs text-slate-900 dark:text-white font-medium cursor-pointer"
                  >
                    {SECTIONS.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Core Concept Strings */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    What is it? ({editStage} • {editLanguage})
                  </label>
                  <textarea
                    rows={2}
                    value={currentLangPackage.whatIsIt || ""}
                    onChange={(e) => handleUpdateLangField("whatIsIt", e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#102036] border border-slate-200 dark:border-[#1a3152] text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Why do we need it?
                  </label>
                  <textarea
                    rows={2}
                    value={currentLangPackage.whyDoWeNeedIt || ""}
                    onChange={(e) => handleUpdateLangField("whyDoWeNeedIt", e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#102036] border border-slate-200 dark:border-[#1a3152] text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Explanations Formats */}
              <div className="pt-2 border-t border-slate-200/80 dark:border-[#182c47]">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-3">
                  Multi-Format Pedagogical Explanations
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Simple Everyday Analogy
                    </label>
                    <textarea
                      rows={3}
                      value={currentLangPackage.explanations?.simple || ""}
                      onChange={(e) => handleUpdateExplanation("simple", e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#102036] border border-slate-200 dark:border-[#1a3152] text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Friend-to-Friend Explanation
                    </label>
                    <textarea
                      rows={3}
                      value={currentLangPackage.explanations?.friend || ""}
                      onChange={(e) => handleUpdateExplanation("friend", e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#102036] border border-slate-200 dark:border-[#1a3152] text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Story Metaphor
                    </label>
                    <textarea
                      rows={3}
                      value={currentLangPackage.explanations?.story || ""}
                      onChange={(e) => handleUpdateExplanation("story", e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#102036] border border-slate-200 dark:border-[#1a3152] text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Step-by-Step Logic
                    </label>
                    <textarea
                      rows={3}
                      value={currentLangPackage.explanations?.stepByStep || ""}
                      onChange={(e) => handleUpdateExplanation("stepByStep", e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#102036] border border-slate-200 dark:border-[#1a3152] text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Code Example and Output */}
              <div className="pt-2 border-t border-slate-200/80 dark:border-[#182c47] grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                    <Code2 size={14} className="text-blue-500" />
                    <span>Python Code Example</span>
                  </label>
                  <textarea
                    rows={5}
                    value={currentLangPackage.code || ""}
                    onChange={(e) => handleUpdateLangField("code", e.target.value)}
                    className="w-full p-3 font-mono text-xs rounded-xl bg-slate-900 text-emerald-400 border border-slate-700 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Expected Terminal Output
                  </label>
                  <textarea
                    rows={5}
                    value={currentLangPackage.output || ""}
                    onChange={(e) => handleUpdateLangField("output", e.target.value)}
                    className="w-full p-3 font-mono text-xs rounded-xl bg-slate-900 text-slate-200 border border-slate-700 focus:outline-none"
                  />
                </div>
              </div>

              {/* Practice Task (Try it Yourself) */}
              <div className="pt-2 border-t border-slate-200/80 dark:border-[#182c47]">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">
                  Interactive Practice Sandbox (Try It Yourself)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Task Instructions
                    </label>
                    <textarea
                      rows={2}
                      value={currentLangPackage.tryItYourself?.task || ""}
                      onChange={(e) => handleUpdatePracticeField("task", e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#102036] border border-slate-200 dark:border-[#1a3152] text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Practice Expected Output
                    </label>
                    <textarea
                      rows={2}
                      value={currentLangPackage.tryItYourself?.expectedOutput || ""}
                      onChange={(e) => handleUpdatePracticeField("expectedOutput", e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-[#102036] border border-slate-200 dark:border-[#1a3152] text-xs text-slate-900 dark:text-white font-mono"
                    />
                  </div>
                </div>
              </div>
            </form>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200/80 dark:border-[#182c47] bg-slate-50/50 dark:bg-[#081220]/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {saveSuccess && (
                  <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold animate-in fade-in">
                    <CheckCircle2 size={16} />
                    <span>Saved to PostgreSQL & Live Cache!</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCloseEdit}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#14233a] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveTopic}
                  disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/25 transition cursor-pointer border-none disabled:opacity-50"
                >
                  <Save size={15} />
                  <span>{saving ? "Saving Changes..." : "Save Lesson Changes"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Lesson Preview Modal (Student View Simulation) */}
      {previewingTopic && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#070f1d] border border-slate-200 dark:border-[#1a3152] rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-slate-200 dark:border-[#162740] flex items-center justify-between bg-slate-50 dark:bg-[#060c18]">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  Exact Student Experience Preview
                </span>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  {previewingTopic.title}
                </span>
              </div>
              <button
                onClick={() => setPreviewingTopic(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {/* Concept Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-tr from-blue-500/10 via-indigo-500/10 to-transparent border border-blue-500/20">
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  {previewingTopic.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                  {previewingTopic.stages?.[previewStage]?.languages?.[previewLanguage]?.whatIsIt ||
                    previewingTopic.stages?.young?.languages?.english?.whatIsIt ||
                    "Lesson definition"}
                </p>
              </div>

              {/* Code Snippet Box */}
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">
                  Python Code Demonstration
                </h4>
                <div className="rounded-2xl bg-[#030712] border border-slate-800 p-4 font-mono text-xs text-emerald-400 overflow-x-auto">
                  <pre>
                    {previewingTopic.stages?.[previewStage]?.languages?.[previewLanguage]?.code ||
                      previewingTopic.stages?.young?.languages?.english?.code ||
                      "# Code example"}
                  </pre>
                </div>
              </div>

              {/* Output Box */}
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">
                  Standard Output
                </h4>
                <div className="rounded-2xl bg-slate-900 border border-slate-800 p-3 font-mono text-xs text-slate-200">
                  <pre>
                    {previewingTopic.stages?.[previewStage]?.languages?.[previewLanguage]?.output ||
                      previewingTopic.stages?.young?.languages?.english?.output ||
                      "Output"}
                  </pre>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-[#162740] bg-slate-50 dark:bg-[#060c18] flex justify-between items-center">
              <span className="text-xs text-slate-500">
                Stage: {previewStage} • Language: {previewLanguage}
              </span>
              <button
                onClick={() => setPreviewingTopic(null)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer border-none"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Deletion Safety Guard Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0c182a] border border-slate-200 dark:border-[#1a3152] rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4 border border-rose-500/20">
              <ShieldAlert size={28} />
            </div>

            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              Curriculum Deletion Safety Check
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Verifying whether topic <code className="font-mono font-bold text-blue-500">{deleteTarget.id}</code> is referenced by active student progress records...
            </p>

            {deleteChecking ? (
              <div className="py-6 text-center text-xs text-slate-500 font-semibold animate-pulse">
                Auditing learner records in PostgreSQL...
              </div>
            ) : deleteUsageStats?.hasStudentData ? (
              <div className="mt-4 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-200 space-y-2">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertTriangle size={16} />
                  <span>Deletion Blocked by Data Integrity Shield</span>
                </div>
                <p className="leading-relaxed">
                  This topic cannot be permanently deleted because <strong>{deleteUsageStats.studentCount} student(s)</strong> have completed lessons or submitted quiz attempts ({deleteUsageStats.completedCount} completions, {deleteUsageStats.quizAttemptsCount} quiz attempts).
                </p>
                <p className="text-[11px] text-rose-600 dark:text-rose-300 font-semibold">
                  Recommendation: Click <strong>Archive</strong> instead. Archiving hides the topic from students while preserving their completed history and XP.
                </p>
              </div>
            ) : (
              <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-[#081220] border border-slate-200 dark:border-[#142338] text-xs text-slate-700 dark:text-slate-300">
                <div className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mb-1">
                  <CheckCircle2 size={16} />
                  <span>No Student Progress References Found</span>
                </div>
                <span>This topic is not currently referenced by student completions. Permanent deletion is safe.</span>
              </div>
            )}

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#14233a] cursor-pointer"
              >
                Cancel
              </button>
              {deleteUsageStats?.hasStudentData ? (
                <button
                  onClick={() => {
                    handleToggleArchive(deleteTarget);
                    setDeleteTarget(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition cursor-pointer border-none"
                >
                  Archive Lesson Instead
                </button>
              ) : (
                <button
                  onClick={handleConfirmDelete}
                  disabled={deleteChecking}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition cursor-pointer border-none disabled:opacity-50"
                >
                  Confirm Delete
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
