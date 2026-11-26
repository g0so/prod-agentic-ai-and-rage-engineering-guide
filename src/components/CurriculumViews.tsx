import React, { useState, useMemo } from 'react';
import {
  CapstoneMilestone,
  CurriculumPhase,
  CurriculumTopic,
  DifficultyLevel,
  GlossaryEntry,
  TopicNote,
  TopicStatus,
} from '../types/curriculum';
import {
  ALL_PHASES,
  ALL_TECHNOLOGIES,
  ALL_TOPICS,
  CAPSTONE_MILESTONES,
  GLOSSARY_ENTRIES,
  PHASE_BY_ID,
  TOPIC_BY_ID,
} from '../data/curriculumIndex';
import { InteractiveDiagram } from './InteractiveDiagrams';
import {
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Download,
  ExternalLink,
  FileJson,
  FileText,
  Filter,
  RotateCcw,
  Search,
  Upload,
} from 'lucide-react';

/* ============================================================================
 * 1. LEARNING PATH VIEW (All 14 Phases + Expandable Topic Lists)
 * ========================================================================== */
interface LearningPathViewProps {
  statusByTopicId: Record<string, TopicStatus>;
  phaseStats: Array<{
    phaseId: string;
    phaseNumber: string;
    title: string;
    shortTitle: string;
    total: number;
    completed: number;
    inProgress: number;
    percentage: number;
  }>;
  focusedPhaseId: string | null;
  onSelectTopic: (topicId: string) => void;
}

export const LearningPathView: React.FC<LearningPathViewProps> = ({
  statusByTopicId,
  phaseStats,
  focusedPhaseId,
  onSelectTopic,
}) => {
  const [expandedPhases, setExpandedPhases] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    ALL_PHASES.forEach((p, idx) => {
      initial[p.id] = focusedPhaseId ? p.id === focusedPhaseId : idx < 4;
    });
    return initial;
  });

  React.useEffect(() => {
    if (focusedPhaseId) {
      setExpandedPhases((prev) => ({ ...prev, [focusedPhaseId]: true }));
    }
  }, [focusedPhaseId]);

  const togglePhase = (phaseId: string) => {
    setExpandedPhases((prev) => ({ ...prev, [phaseId]: !prev[phaseId] }));
  };

  const setAllExpanded = (expanded: boolean) => {
    const next: Record<string, boolean> = {};
    ALL_PHASES.forEach((p) => {
      next[p.id] = expanded;
    });
    setExpandedPhases(next);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      <div className="flex flex-wrap items-end justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="text-xs font-mono text-sky-600 dark:text-sky-400">
            ORDERED ENGINEERING CURRICULUM · PHASES 00 TO 13
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mt-1">
            Complete Learning Path
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
            Fundamentals precede frameworks. Each phase builds the conceptual and mathematical prerequisites required by the next.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setAllExpanded(true)}
            className="px-3 py-1.5 text-xs font-medium rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300 cursor-pointer"
          >
            Expand All
          </button>
          <button
            onClick={() => setAllExpanded(false)}
            className="px-3 py-1.5 text-xs font-medium rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300 cursor-pointer"
          >
            Collapse All
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {ALL_PHASES.map((phase) => {
          const ps = phaseStats.find((s) => s.phaseId === phase.id)!;
          const isExpanded = Boolean(expandedPhases[phase.id]);

          return (
            <div
              key={phase.id}
              id={`phase-card-${phase.id}`}
              className="border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900/50 overflow-hidden"
            >
              {/* Phase Header Row */}
              <button
                onClick={() => togglePhase(phase.id)}
                className="w-full p-5 text-left flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/80 dark:hover:bg-slate-900 transition-colors cursor-pointer"
              >
                <div className="space-y-1.5 max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                    <span className="text-sky-600 dark:text-sky-400 font-bold">
                      PHASE {phase.number}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{ps.total} Topics</span>
                    <span aria-hidden="true">·</span>
                    <span>
                      {ps.completed} Completed / {ps.inProgress} In Progress
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                      Phase {phase.number} — {phase.title}
                    </h2>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 pl-6">
                    <strong className="font-medium text-slate-800 dark:text-slate-200">
                      Objective:
                    </strong>{' '}
                    {phase.objective}
                  </p>
                </div>

                {/* Progress Indicator */}
                <div className="md:w-48 shrink-0 pl-6 md:pl-0">
                  <div className="flex items-center justify-between text-xs font-mono tabular-nums text-slate-600 dark:text-slate-400 mb-1.5">
                    <span>Completion</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {ps.percentage}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-200 ${
                        ps.percentage === 100 ? 'bg-emerald-500' : 'bg-sky-500'
                      }`}
                      style={{ width: `${ps.percentage}%` }}
                    />
                  </div>
                </div>
              </button>

              {/* Expanded Phase Body */}
              {isExpanded && (
                <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/50 p-5 space-y-5">
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-4xl">
                    {phase.description}
                  </p>

                  {/* Phase Architecture Pipeline Strip if present (Phase 03 & Phase 08) */}
                  {phase.architecturePipeline && (
                    <div className="p-3.5 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
                      <div className="text-xs font-mono text-sky-600 dark:text-sky-400">
                        CANONICAL ARCHITECTURE PIPELINE
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono text-slate-800 dark:text-slate-200">
                        {phase.architecturePipeline.map((node, i) => (
                          <React.Fragment key={node}>
                            {i > 0 && (
                              <span className="text-sky-500 font-bold px-1" aria-hidden="true">
                                →
                              </span>
                            )}
                            <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                              {node}
                            </span>
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Key Architectural Distinctions if present */}
                  {phase.keyDistinctions && phase.keyDistinctions.length > 0 && (
                    <div className="p-3.5 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1.5">
                      <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
                        CORE ARCHITECTURAL DISTINCTIONS TO MASTER
                      </div>
                      <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300 list-disc pl-4">
                        {phase.keyDistinctions.map((dist, idx) => (
                          <li key={idx}>{dist}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Topic Table */}
                  <div className="border border-slate-200 dark:border-slate-800 rounded-md bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-800">
                    {phase.topics.map((topic) => {
                      const st = statusByTopicId[topic.id];
                      return (
                        <div
                          key={topic.id}
                          onClick={() => onSelectTopic(topic.id)}
                          className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer group"
                        >
                          <div className="flex items-start gap-3">
                            <span
                              className={`font-mono text-xs mt-0.5 tabular-nums ${
                                st === 'completed'
                                  ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                                  : st === 'in_progress'
                                  ? 'text-sky-600 dark:text-sky-400 font-bold'
                                  : 'text-slate-400 dark:text-slate-500'
                              }`}
                            >
                              {st === 'completed' ? '✓' : st === 'in_progress' ? '◐' : '○'}{' '}
                              {phase.number}.{String(topic.order).padStart(2, '0')}
                            </span>
                            <div>
                              <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                                {topic.title}
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                {topic.subtitle}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0 text-xs font-mono text-slate-500 dark:text-slate-400 tabular-nums pl-8 sm:pl-0">
                            <span>{topic.difficulty}</span>
                            <span aria-hidden="true">·</span>
                            <span>{topic.estimatedEffort}</span>
                            <span aria-hidden="true">·</span>
                            <span
                              className={
                                st === 'completed'
                                  ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                                  : st === 'in_progress'
                                  ? 'text-sky-600 dark:text-sky-400 font-medium'
                                  : 'text-slate-400'
                              }
                            >
                              {st === 'completed'
                                ? 'Completed'
                                : st === 'in_progress'
                                ? 'In Progress'
                                : 'Not Started'}
                            </span>
                            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Phase Milestone Footer */}
                  <div className="p-3.5 rounded border border-sky-500/30 bg-sky-500/5 text-xs text-slate-800 dark:text-slate-200 flex items-start gap-2">
                    <span className="font-mono font-semibold text-sky-600 dark:text-sky-400 shrink-0">
                      PHASE {phase.number} MILESTONE:
                    </span>
                    <span>{phase.milestone}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ============================================================================
 * 2. SEARCH AND FILTERING EXPLORER VIEW
 * ========================================================================== */
interface SearchExplorerViewProps {
  statusByTopicId: Record<string, TopicStatus>;
  onSelectTopic: (topicId: string) => void;
}

export const SearchExplorerView: React.FC<SearchExplorerViewProps> = ({
  statusByTopicId,
  onSelectTopic,
}) => {
  const [query, setQuery] = useState('');
  const [selectedPhase, setSelectedPhase] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedTech, setSelectedTech] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  const filteredTopics = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ALL_TOPICS.filter((topic) => {
      if (selectedPhase !== 'all' && topic.phaseId !== selectedPhase) return false;
      if (selectedStatus !== 'all' && statusByTopicId[topic.id] !== selectedStatus) return false;
      if (selectedDifficulty !== 'all' && topic.difficulty !== selectedDifficulty) return false;
      if (selectedTech !== 'all' && !topic.technologies.includes(selectedTech)) return false;

      if (!q) return true;
      const inTitle = topic.title.toLowerCase().includes(q);
      const inSubtitle = topic.subtitle.toLowerCase().includes(q);
      const inTech = topic.technologies.some((t) => t.toLowerCase().includes(q));
      const inBody =
        topic.whatIsIt.some((p) => p.toLowerCase().includes(q)) ||
        topic.howItWorks.explanation.some((p) => p.toLowerCase().includes(q));
      return inTitle || inSubtitle || inTech || inBody;
    });
  }, [query, selectedPhase, selectedStatus, selectedTech, selectedDifficulty, statusByTopicId]);

  const resetFilters = () => {
    setQuery('');
    setSelectedPhase('all');
    setSelectedStatus('all');
    setSelectedTech('all');
    setSelectedDifficulty('all');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="text-xs font-mono text-sky-600 dark:text-sky-400">
          CURRICULUM INDEX & MULTI-FACET SEARCH
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mt-1">
          Search & Filter Topics ({ALL_TOPICS.length} Total Topics)
        </h1>
      </div>

      {/* Search & Filter Controls */}
      <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by topic, concept, algorithm (e.g., HNSW, BM25, RRF, Ragas, MCP, Checkpoint, Prompt Injection)..."
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] font-mono text-slate-500 dark:text-slate-400 mb-1">
              FILTER BY PHASE
            </label>
            <select
              value={selectedPhase}
              onChange={(e) => setSelectedPhase(e.target.value)}
              className="w-full text-xs rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-2.5 py-2 text-slate-800 dark:text-slate-200"
            >
              <option value="all">All 14 Phases</option>
              {ALL_PHASES.map((p) => (
                <option key={p.id} value={p.id}>
                  Phase {p.number}: {p.shortTitle}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-slate-500 dark:text-slate-400 mb-1">
              LEARNING STATUS
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full text-xs rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-2.5 py-2 text-slate-800 dark:text-slate-200"
            >
              <option value="all">All Statuses</option>
              <option value="not_started">○ Not Started</option>
              <option value="in_progress">◐ In Progress</option>
              <option value="completed">● Completed</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-slate-500 dark:text-slate-400 mb-1">
              TECHNOLOGY / CONCEPT
            </label>
            <select
              value={selectedTech}
              onChange={(e) => setSelectedTech(e.target.value)}
              className="w-full text-xs rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-2.5 py-2 text-slate-800 dark:text-slate-200"
            >
              <option value="all">All Technologies ({ALL_TECHNOLOGIES.length})</option>
              {ALL_TECHNOLOGIES.map((tech) => (
                <option key={tech} value={tech}>
                  {tech}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-slate-500 dark:text-slate-400 mb-1">
              DIFFICULTY TIER
            </label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full text-xs rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-2.5 py-2 text-slate-800 dark:text-slate-200"
            >
              <option value="all">All Difficulties</option>
              <option value="Foundational">Foundational</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Production">Production</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400 pt-1">
          <span>
            Showing {filteredTopics.length} of {ALL_TOPICS.length} topics
          </span>
          {(query ||
            selectedPhase !== 'all' ||
            selectedStatus !== 'all' ||
            selectedTech !== 'all' ||
            selectedDifficulty !== 'all') && (
            <button
              onClick={resetFilters}
              className="text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
            >
              Reset all filters
            </button>
          )}
        </div>
      </div>

      {/* Results List */}
      {filteredTopics.length === 0 ? (
        <div className="p-12 text-center border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900/40 space-y-3">
          <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            No matching topics found
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Try clearing one of your active filters or broadening your search keyword.
          </p>
          <button
            onClick={resetFilters}
            className="px-3 py-1.5 text-xs font-medium rounded bg-sky-600 text-white cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900/50 divide-y divide-slate-200 dark:divide-slate-800">
          {filteredTopics.map((topic) => {
            const st = statusByTopicId[topic.id];
            return (
              <div
                key={topic.id}
                onClick={() => onSelectTopic(topic.id)}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer group"
              >
                <div className="space-y-1 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                    <span className="text-sky-600 dark:text-sky-400 font-semibold">
                      Phase {topic.phaseNumber}.{String(topic.order).padStart(2, '0')}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{topic.difficulty}</span>
                    <span aria-hidden="true">·</span>
                    <span>{topic.estimatedEffort}</span>
                    <span aria-hidden="true">·</span>
                    <span>{topic.technologies.join(' / ')}</span>
                  </div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-sky-600 dark:group-hover:text-sky-400">
                    {topic.title}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{topic.subtitle}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0 text-xs font-mono">
                  <span
                    className={
                      st === 'completed'
                        ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                        : st === 'in_progress'
                        ? 'text-sky-600 dark:text-sky-400 font-semibold'
                        : 'text-slate-400'
                    }
                  >
                    {st === 'completed'
                      ? '● Completed'
                      : st === 'in_progress'
                      ? '◐ In Progress'
                      : '○ Not Started'}
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* ============================================================================
 * 3. TECHNICAL GLOSSARY VIEW
 * ========================================================================== */
export const GlossaryView: React.FC<{ onSelectTopic: (topicId: string) => void }> = ({
  onSelectTopic,
}) => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('all');

  const categories = ['all', 'Foundations', 'RAG & Retrieval', 'Vector Databases', 'Evaluation', 'Agentic AI', 'Security & Ops'];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return GLOSSARY_ENTRIES.filter((entry) => {
      if (category !== 'all' && entry.category !== category) return false;
      if (!q) return true;
      return (
        entry.term.toLowerCase().includes(q) ||
        entry.shortDefinition.toLowerCase().includes(q) ||
        entry.underTheHood.toLowerCase().includes(q)
      );
    });
  }, [search, category]);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="text-xs font-mono text-sky-600 dark:text-sky-400">
          FIRST-PRINCIPLES TERMINOLOGY REFERENCE
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mt-1">
          Technical Glossary ({GLOSSARY_ENTRIES.length} Core Terms)
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Clear definitions and under-the-hood engineering mechanics for every term in RAG and Agentic AI, linked directly to their deep-dive topic pages.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter glossary terms (e.g., BM25, HNSW, RRF, Checkpoint, MCP, Groundedness)..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                category === cat
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {cat === 'all' ? 'All Terms' : cat}
            </button>
          ))}
        </div>
      </div>

      <div className="divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900/50">
        {filtered.map((entry) => (
          <div key={entry.id} className="p-5 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {entry.term}
              </h2>
              <span className="text-xs font-mono text-sky-600 dark:text-sky-400">
                {entry.category}
              </span>
            </div>

            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {entry.shortDefinition}
            </p>

            <div className="p-3 rounded bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              <strong className="font-mono text-slate-800 dark:text-slate-200">
                Under the Hood:{' '}
              </strong>
              {entry.underTheHood}
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="font-mono text-slate-400">Related Deep-Dive Topics:</span>
              {entry.relatedTopicIds.map((tid, idx) => {
                const top = TOPIC_BY_ID[tid];
                if (!top) return null;
                return (
                  <React.Fragment key={tid}>
                    {idx > 0 && <span aria-hidden="true">·</span>}
                    <button
                      onClick={() => onSelectTopic(tid)}
                      className="text-sky-600 dark:text-sky-400 hover:underline font-medium cursor-pointer"
                    >
                      Phase {top.phaseNumber}.{String(top.order).padStart(2, '0')} {top.title}
                    </button>
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ============================================================================
 * 4. CAPSTONE PROJECT ROADMAP VIEW (Phase 13 + 5 Engineering Milestones)
 * ========================================================================== */
interface CapstoneViewProps {
  completedMilestones: string[];
  statusByTopicId: Record<string, TopicStatus>;
  onToggleMilestone: (id: string) => void;
  onSelectTopic: (topicId: string) => void;
}

export const CapstoneView: React.FC<CapstoneViewProps> = ({
  completedMilestones,
  statusByTopicId,
  onToggleMilestone,
  onSelectTopic,
}) => {
  const phase13 = PHASE_BY_ID['phase-13'];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="text-xs font-mono text-sky-600 dark:text-sky-400">
          PHASE 13 · CAPSTONE ENGINEERING SPECIFICATION
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-50 mt-1">
          Production-Grade Agentic Knowledge Assistant
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300 mt-1.5 max-w-3xl leading-relaxed">
          Combine every module from Phases 00–12 into an end-to-end, containerized, evaluated, and observable system. Divided into 5 incremental milestones so you can build and verify each layer systematically without premature vendor lock-in.
        </p>
      </div>

      {/* Interactive End-to-End Architecture Reference */}
      <InteractiveDiagram
        spec={{
          type: 'rag-pipeline',
          caption: 'Reference Data Pipeline integrated inside the Capstone Knowledge Assistant'
        }}
      />

      {/* 5 Incremental Capstone Milestones */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Capstone Implementation Milestones (M1 — M5)
        </h2>

        {CAPSTONE_MILESTONES.map((ms) => {
          const isDone = completedMilestones.includes(ms.id);
          return (
            <div
              key={ms.id}
              className={`p-5 rounded-lg border transition-colors ${
                isDone
                  ? 'border-emerald-500/40 bg-emerald-500/[0.02]'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-4 pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="text-sky-600 dark:text-sky-400 font-bold">
                      MILESTONE {ms.number}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="text-slate-500">{ms.phaseAlignment}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {ms.title}
                  </h3>
                </div>

                <button
                  onClick={() => onToggleMilestone(ms.id)}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-md border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isDone
                      ? 'bg-emerald-600 text-white border-emerald-500'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:border-sky-500'
                  }`}
                >
                  {isDone ? '✓ Milestone Completed' : 'Mark Milestone Complete'}
                </button>
              </div>

              <p className="text-sm text-slate-700 dark:text-slate-300 mt-3 leading-relaxed">
                {ms.objective}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-xs">
                <div className="p-3.5 rounded bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <div className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                    REQUIRED DELIVERABLES
                  </div>
                  <ul className="space-y-1.5 text-slate-600 dark:text-slate-400 list-disc pl-4">
                    {ms.deliverables.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3.5 rounded bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <div className="font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                    ACCEPTANCE & VERIFICATION CRITERIA
                  </div>
                  <ul className="space-y-1.5 text-slate-600 dark:text-slate-400 list-disc pl-4">
                    {ms.verificationCriteria.map((v, i) => (
                      <li key={i}>{v}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Phase 13 Detailed Topic Pages */}
      {phase13 && (
        <div className="space-y-3 pt-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Phase 13 Implementation Guides & Specs
          </h2>
          <div className="border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900/50 divide-y divide-slate-200 dark:divide-slate-800">
            {phase13.topics.map((topic) => {
              const st = statusByTopicId[topic.id];
              return (
                <div
                  key={topic.id}
                  onClick={() => onSelectTopic(topic.id)}
                  className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer"
                >
                  <div>
                    <div className="text-xs font-mono text-sky-600 dark:text-sky-400">
                      Topic 13.0{topic.order} · {topic.estimatedEffort}
                    </div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {topic.title}
                    </div>
                    <div className="text-xs text-slate-500">{topic.subtitle}</div>
                  </div>
                  <div className="text-xs font-mono text-slate-500 shrink-0">
                    {st === 'completed' ? '● Completed' : st === 'in_progress' ? '◐ In Progress' : 'Open Guide →'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

/* ============================================================================
 * 5. SAVED BOOKMARKS & PERSONAL NOTES NOTEBOOK VIEW
 * ========================================================================== */
interface SavedAndNotesViewProps {
  bookmarkedTopics: string[];
  bookmarkedResources: string[];
  notes: Record<string, TopicNote>;
  onSelectTopic: (topicId: string) => void;
  onToggleBookmarkTopic: (topicId: string) => void;
  onToggleBookmarkResource: (topicId: string, resourceId: string) => void;
}

export const SavedAndNotesView: React.FC<SavedAndNotesViewProps> = ({
  bookmarkedTopics,
  bookmarkedResources,
  notes,
  onSelectTopic,
  onToggleBookmarkTopic,
  onToggleBookmarkResource,
}) => {
  const [subTab, setSubTab] = useState<'bookmarks' | 'notes'>('bookmarks');

  const populatedNotes = Object.values(notes).filter(
    (n) =>
      n.personalExplanation.trim() ||
      n.importantObservations.trim() ||
      n.difficultConcepts.trim() ||
      n.questionsToInvestigate.trim()
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="text-xs font-mono text-sky-600 dark:text-sky-400">
            PERSONAL KNOWLEDGE REPOSITORY
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mt-1">
            Saved Items & Personal Engineering Notebook
          </h1>
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md">
          <button
            onClick={() => setSubTab('bookmarks')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer ${
              subTab === 'bookmarks'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Bookmarks ({bookmarkedTopics.length + bookmarkedResources.length})
          </button>
          <button
            onClick={() => setSubTab('notes')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer ${
              subTab === 'notes'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            My Notes ({populatedNotes.length})
          </button>
        </div>
      </div>

      {subTab === 'bookmarks' ? (
        <div className="space-y-8">
          {/* Bookmarked Topics */}
          <section className="space-y-3">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Bookmarked Topics ({bookmarkedTopics.length})
            </h2>
            {bookmarkedTopics.length === 0 ? (
              <div className="p-6 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 text-xs text-slate-500">
                No topics bookmarked yet. Click "Bookmark Topic" at the top of any topic page to save it here for quick reference.
              </div>
            ) : (
              <div className="divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900/50">
                {bookmarkedTopics.map((tid) => {
                  const topic = TOPIC_BY_ID[tid];
                  if (!topic) return null;
                  return (
                    <div
                      key={tid}
                      className="p-4 flex items-center justify-between gap-4"
                    >
                      <div
                        onClick={() => onSelectTopic(tid)}
                        className="cursor-pointer group flex-1"
                      >
                        <div className="text-xs font-mono text-sky-600 dark:text-sky-400">
                          Phase {topic.phaseNumber}.{String(topic.order).padStart(2, '0')} · {topic.difficulty}
                        </div>
                        <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-sky-500">
                          {topic.title}
                        </div>
                        <div className="text-xs text-slate-500">{topic.subtitle}</div>
                      </div>
                      <button
                        onClick={() => onToggleBookmarkTopic(tid)}
                        className="px-2.5 py-1 text-xs font-mono text-slate-500 hover:text-rose-500 border border-slate-200 dark:border-slate-800 rounded cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Bookmarked External Resources */}
          <section className="space-y-3">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Saved External Documentation & Research Papers ({bookmarkedResources.length})
            </h2>
            {bookmarkedResources.length === 0 ? (
              <div className="p-6 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 text-xs text-slate-500">
                No external resources saved yet. Click "Save Resource" on any topic's learning resource list.
              </div>
            ) : (
              <div className="divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900/50">
                {bookmarkedResources.map((key) => {
                  const [topicId, resId] = key.split('::');
                  const topic = TOPIC_BY_ID[topicId];
                  const res = topic?.resources.find((r) => r.id === resId);
                  if (!topic || !res) return null;
                  return (
                    <div key={key} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="text-xs font-mono text-slate-500">
                          From Phase {topic.phaseNumber}:{' '}
                          <button
                            onClick={() => onSelectTopic(topic.id)}
                            className="text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
                          >
                            {topic.title}
                          </button>{' '}
                          · {res.type}
                        </div>
                        <a
                          href={res.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-semibold text-slate-900 dark:text-slate-100 hover:text-sky-500 inline-flex items-center gap-1.5"
                        >
                          <span>{res.title}</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <p className="text-xs text-slate-500">{res.whyStudy}</p>
                      </div>
                      <button
                        onClick={() => onToggleBookmarkResource(topicId, resId)}
                        className="px-2.5 py-1 text-xs font-mono text-slate-500 hover:text-rose-500 border border-slate-200 dark:border-slate-800 rounded self-start sm:self-center cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      ) : (
        <div className="space-y-4">
          {populatedNotes.length === 0 ? (
            <div className="p-10 text-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 text-xs text-slate-500">
              You have not written any personal topic notes yet. Open any topic page and scroll to Section 08 ("My Personal Engineering Notes") to record your synthesis and questions.
            </div>
          ) : (
            populatedNotes.map((note) => {
              const topic = TOPIC_BY_ID[note.topicId];
              if (!topic) return null;
              return (
                <div
                  key={note.topicId}
                  className="p-5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
                    <button
                      onClick={() => onSelectTopic(topic.id)}
                      className="text-sm font-bold text-sky-600 dark:text-sky-400 hover:underline text-left cursor-pointer"
                    >
                      Phase {topic.phaseNumber}.{String(topic.order).padStart(2, '0')} — {topic.title}
                    </button>
                    <span className="text-xs font-mono text-slate-400 tabular-nums">
                      Updated {new Date(note.updatedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {note.personalExplanation && (
                      <div>
                        <div className="font-mono text-slate-400 mb-1">MY EXPLANATION:</div>
                        <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                          {note.personalExplanation}
                        </p>
                      </div>
                    )}
                    {note.importantObservations && (
                      <div>
                        <div className="font-mono text-slate-400 mb-1">ARCHITECTURAL OBSERVATIONS:</div>
                        <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                          {note.importantObservations}
                        </p>
                      </div>
                    )}
                    {note.difficultConcepts && (
                      <div>
                        <div className="font-mono text-slate-400 mb-1">DIFFICULT CONCEPTS:</div>
                        <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                          {note.difficultConcepts}
                        </p>
                      </div>
                    )}
                    {note.questionsToInvestigate && (
                      <div>
                        <div className="font-mono text-slate-400 mb-1">QUESTIONS TO INVESTIGATE:</div>
                        <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                          {note.questionsToInvestigate}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

/* ============================================================================
 * 6. EXPORT, IMPORT & BACKUP VIEW
 * ========================================================================== */
interface BackupViewProps {
  onExportJson: () => string;
  onImportJson: (jsonString: string) => { success: boolean; message: string };
  onResetAll: () => void;
}

export const BackupView: React.FC<BackupViewProps> = ({
  onExportJson,
  onImportJson,
  onResetAll,
}) => {
  const [importText, setImportText] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const handleDownloadJson = () => {
    const json = onExportJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateStr = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `deepagentic-backup-${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setFeedback({
      type: 'success',
      text: `Downloaded versioned JSON backup (deepagentic-backup-${dateStr}.json).`,
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = String(event.target?.result || '');
      setImportText(content);
      const res = onImportJson(content);
      setFeedback({ type: res.success ? 'success' : 'error', text: res.message });
    };
    reader.readAsText(file);
  };

  const handleRestoreFromTextarea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importText.trim()) {
      setFeedback({ type: 'error', text: 'Paste a valid JSON backup payload before restoring.' });
      return;
    }
    const res = onImportJson(importText);
    setFeedback({ type: res.success ? 'success' : 'error', text: res.message });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="text-xs font-mono text-sky-600 dark:text-sky-400">
          LOCAL BROWSER STORAGE & PORTABLE DATA GOVERNANCE
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mt-1">
          Export, Import & Restore Progress Backup
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Your progress, mastery checklists, bookmarks, and personal engineering notes are persisted automatically in browser localStorage. Export periodic JSON backups to version-control your notes in Git or transfer state across machines.
        </p>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-md border text-xs font-mono ${
            feedback.type === 'success'
              ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
              : 'border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-300'
          }`}
        >
          {feedback.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export Card */}
        <div className="p-5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="text-xs font-mono text-sky-600 dark:text-sky-400">
              01 · EXPORT VERSIONED JSON
            </div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Download Complete Progress & Notes
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Produces a schema-versioned (`v1.0.0`) JSON file containing all topic checklist arrays, status overrides, personal notes, bookmarks, capstone milestones, and activity logs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handleDownloadJson}
              className="px-4 py-2 text-xs font-semibold rounded-md bg-sky-600 hover:bg-sky-500 text-white transition-colors inline-flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Backup to JSON</span>
            </button>

            <button
              onClick={() => {
                setImportText(onExportJson());
                setFeedback({
                  type: 'success',
                  text: 'Loaded current JSON snapshot into the inspector below.',
                });
              }}
              className="px-3 py-2 text-xs font-medium rounded-md border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-400 cursor-pointer"
            >
              Inspect Raw JSON
            </button>
          </div>
        </div>

        {/* Upload / Import File Card */}
        <div className="p-5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="text-xs font-mono text-sky-600 dark:text-sky-400">
              02 · IMPORT FROM BACKUP FILE
            </div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Restore from `.json` File
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Validates the backup schema version and field integrity before replacing current browser state.
            </p>
          </div>

          <div>
            <label className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-md border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:border-sky-500 cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>Select JSON Backup File</span>
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Direct JSON Inspector / Paste Restore */}
      <form
        onSubmit={handleRestoreFromTextarea}
        className="p-5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 space-y-3"
      >
        <div className="flex items-center justify-between">
          <label className="text-xs font-mono text-slate-600 dark:text-slate-300">
            JSON Backup Inspector / Manual Paste Restore
          </label>
          <span className="text-[11px] font-mono text-slate-400">Schema v1.0.0 Validated</span>
        </div>
        <textarea
          rows={8}
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
          placeholder='Paste an exported JSON backup here or click "Inspect Raw JSON" above...'
          className="w-full font-mono text-xs rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-sky-500"
        />
        <div className="flex items-center justify-between pt-1">
          <div>
            {!confirmReset ? (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="text-xs font-mono text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
              >
                Reset all local progress...
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                  Confirm full reset?
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onResetAll();
                    setConfirmReset(false);
                    setFeedback({ type: 'success', text: 'All local progress has been reset.' });
                  }}
                  className="px-2.5 py-1 text-xs font-semibold rounded bg-rose-600 text-white cursor-pointer"
                >
                  Yes, Erase
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="px-2.5 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="px-4 py-2 text-xs font-semibold rounded-md bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:opacity-90 cursor-pointer"
          >
            Validate & Restore Pasted JSON
          </button>
        </div>
      </form>
    </div>
  );
};
