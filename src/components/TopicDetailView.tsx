import React, { useState, useEffect } from 'react';
import { CurriculumTopic, TopicNote, TopicStatus } from '../types/curriculum';
import { getAdjacentTopics, PHASE_BY_ID, TOPIC_BY_ID } from '../data/curriculumIndex';
import { InteractiveDiagram } from './InteractiveDiagrams';
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  Check,
  CheckCircle2,
  Circle,
  Clock,
  ExternalLink,
  FileCode2,
  GitBranch,
  Layers,
  Save,
  Sparkles
} from 'lucide-react';

interface TopicDetailViewProps {
  topic: CurriculumTopic;
  status: TopicStatus;
  checklistState: boolean[];
  note?: TopicNote;
  isBookmarked: boolean;
  bookmarkedResources: string[];
  onSelectTopic: (topicId: string) => void;
  onSelectPhase: (phaseId: string) => void;
  onToggleChecklist: (topicId: string, idx: number) => void;
  onSetExplicitStatus: (topicId: string, status: TopicStatus) => void;
  onSaveNote: (
    topicId: string,
    fields: Pick<
      TopicNote,
      'personalExplanation' | 'importantObservations' | 'difficultConcepts' | 'questionsToInvestigate'
    >
  ) => void;
  onToggleBookmarkTopic: (topicId: string) => void;
  onToggleBookmarkResource: (topicId: string, resourceId: string) => void;
}

export const TopicDetailView: React.FC<TopicDetailViewProps> = ({
  topic,
  status,
  checklistState,
  note,
  isBookmarked,
  bookmarkedResources,
  onSelectTopic,
  onSelectPhase,
  onToggleChecklist,
  onSetExplicitStatus,
  onSaveNote,
  onToggleBookmarkTopic,
  onToggleBookmarkResource,
}) => {
  const phase = PHASE_BY_ID[topic.phaseId];
  const { prev, next } = getAdjacentTopics(topic.id);

  const [personalExplanation, setPersonalExplanation] = useState(note?.personalExplanation || '');
  const [importantObservations, setImportantObservations] = useState(note?.importantObservations || '');
  const [difficultConcepts, setDifficultConcepts] = useState(note?.difficultConcepts || '');
  const [questionsToInvestigate, setQuestionsToInvestigate] = useState(note?.questionsToInvestigate || '');
  const [noteSaveFeedback, setNoteSaveFeedback] = useState(false);

  useEffect(() => {
    setPersonalExplanation(note?.personalExplanation || '');
    setImportantObservations(note?.importantObservations || '');
    setDifficultConcepts(note?.difficultConcepts || '');
    setQuestionsToInvestigate(note?.questionsToInvestigate || '');
    setNoteSaveFeedback(false);
  }, [topic.id, note]);

  const handleSaveNotes = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveNote(topic.id, {
      personalExplanation,
      importantObservations,
      difficultConcepts,
      questionsToInvestigate,
    });
    setNoteSaveFeedback(true);
    setTimeout(() => setNoteSaveFeedback(false), 2500);
  };

  const completedCriteriaCount = checklistState.filter(Boolean).length;
  const totalCriteriaCount = topic.checklist.length;
  const checklistPct =
    totalCriteriaCount > 0 ? Math.round((completedCriteriaCount / totalCriteriaCount) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-16">
      {/* Breadcrumb & Quick Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <button
            onClick={() => onSelectPhase(topic.phaseId)}
            className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors font-mono cursor-pointer"
          >
            Phase {topic.phaseNumber}: {phase?.shortTitle}
          </button>
          <span aria-hidden="true">/</span>
          <span className="font-mono tabular-nums">
            Topic {topic.phaseNumber}.{String(topic.order).padStart(2, '0')}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Status Segmented Control */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md">
            {(
              [
                { id: 'not_started', label: 'Not Started' },
                { id: 'in_progress', label: 'In Progress' },
                { id: 'completed', label: 'Completed' }
              ] as const
            ).map((st) => (
              <button
                key={st.id}
                onClick={() => onSetExplicitStatus(topic.id, st.id)}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  status === st.id
                    ? st.id === 'completed'
                      ? 'bg-emerald-600 text-white'
                      : st.id === 'in_progress'
                      ? 'bg-sky-600 text-white'
                      : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => onToggleBookmarkTopic(topic.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              isBookmarked
                ? 'border-sky-500/50 bg-sky-500/10 text-sky-600 dark:text-sky-400'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            {isBookmarked ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
            <span>{isBookmarked ? 'Bookmarked' : 'Bookmark Topic'}</span>
          </button>
        </div>
      </div>

      {/* SECTION A: OVERVIEW */}
      <header className="space-y-4">
        {/* Clean Unboxed Metadata Line (Zero-Pill Discipline) */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400 tabular-nums">
          <span className="text-sky-600 dark:text-sky-400 font-semibold">
            PHASE {topic.phaseNumber} · TOPIC {String(topic.order).padStart(2, '0')}
          </span>
          <span aria-hidden="true">·</span>
          <span>Difficulty: {topic.difficulty}</span>
          <span aria-hidden="true">·</span>
          <span>Estimated Effort: {topic.estimatedEffort}</span>
          <span aria-hidden="true">·</span>
          <span>
            Status:{' '}
            <strong
              className={
                status === 'completed'
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : status === 'in_progress'
                  ? 'text-sky-600 dark:text-sky-400'
                  : 'text-slate-600 dark:text-slate-400'
              }
            >
              {status === 'completed'
                ? '● Completed'
                : status === 'in_progress'
                ? '◐ In Progress'
                : '○ Not Started'}
            </strong>
          </span>
          {topic.isOptionalOrAdvanced && (
            <>
              <span aria-hidden="true">·</span>
              <span className="text-amber-600 dark:text-amber-400">Advanced / Optional Deep-Dive</span>
            </>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 text-balance">
          {topic.title}
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
          {topic.subtitle}
        </p>

        {/* Technologies & Prerequisites Unboxed Metadata */}
        <div className="pt-2 space-y-2 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-mono text-slate-400 dark:text-slate-500">Core Concepts & Stack:</span>
            {topic.technologies.map((tech, idx) => (
              <React.Fragment key={tech}>
                {idx > 0 && <span aria-hidden="true">·</span>}
                <span className="font-mono text-slate-800 dark:text-slate-200">{tech}</span>
              </React.Fragment>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-mono text-slate-400 dark:text-slate-500">Prerequisites:</span>
            {topic.prerequisites.length === 0 ? (
              <span className="font-mono text-slate-500">None (Entry Foundation Topic)</span>
            ) : (
              topic.prerequisites.map((preId, idx) => {
                const preTopic = TOPIC_BY_ID[preId];
                if (!preTopic) return null;
                return (
                  <React.Fragment key={preId}>
                    {idx > 0 && <span aria-hidden="true">·</span>}
                    <button
                      onClick={() => onSelectTopic(preId)}
                      className="text-sky-600 dark:text-sky-400 hover:underline font-medium cursor-pointer"
                    >
                      {preTopic.phaseNumber}.{String(preTopic.order).padStart(2, '0')} {preTopic.title}
                    </button>
                  </React.Fragment>
                );
              })
            )}
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="space-y-8 border-t border-slate-200 dark:border-slate-800 pt-8">
        {/* SECTION B: WHAT IS IT? */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            01. What is it?
          </h2>
          <div className="space-y-3 text-[15px] text-slate-700 dark:text-slate-300 leading-relaxed max-w-[75ch]">
            {topic.whatIsIt.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </section>

        {/* SECTION C: WHY DOES IT EXIST? */}
        <section className="space-y-3 pt-4 border-t border-slate-200/70 dark:border-slate-800/70">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            02. Why does it exist & what problem does it solve?
          </h2>
          <div className="space-y-3 text-[15px] text-slate-700 dark:text-slate-300 leading-relaxed max-w-[75ch]">
            {topic.whyItExists.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </section>

        {/* SECTION D: HOW DOES IT WORK? */}
        <section className="space-y-4 pt-4 border-t border-slate-200/70 dark:border-slate-800/70">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            03. How does it work under the hood?
          </h2>
          <div className="space-y-3 text-[15px] text-slate-700 dark:text-slate-300 leading-relaxed max-w-[75ch]">
            {topic.howItWorks.explanation.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>

          {topic.howItWorks.codeOrFormula && (
            <div className="my-4">
              <div className="text-xs font-mono text-slate-500 dark:text-slate-400 mb-1.5">
                Engineering Implementation / Mathematical Formulation
              </div>
              <pre className="text-xs sm:text-[13px] font-mono bg-slate-900 text-slate-100 p-4 rounded-lg border border-slate-800 overflow-x-auto leading-relaxed">
                <code>{topic.howItWorks.codeOrFormula}</code>
              </pre>
            </div>
          )}

          {topic.howItWorks.diagram && <InteractiveDiagram spec={topic.howItWorks.diagram} />}
        </section>

        {/* SECTION E: PRACTICAL RELEVANCE */}
        <section className="space-y-3 pt-4 border-t border-slate-200/70 dark:border-slate-800/70">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            04. Practical relevance in production AI systems
          </h2>
          <p className="text-[15px] font-medium text-slate-800 dark:text-slate-200 max-w-[75ch] leading-relaxed">
            {topic.practicalRelevance.summary}
          </p>
          <div className="space-y-2 pt-1 max-w-[75ch]">
            <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
              Concrete Engineering Scenarios:
            </div>
            <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300 list-disc pl-5">
              {topic.practicalRelevance.examples.map((ex, i) => (
                <li key={i} className="leading-relaxed">
                  {ex}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* SECTION F: WHAT SHOULD I LEARN? */}
        <section className="space-y-3 pt-4 border-t border-slate-200/70 dark:border-slate-800/70">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            05. Learning Objectives: What you should be able to implement or explain
          </h2>
          <ul className="space-y-2 text-[15px] text-slate-700 dark:text-slate-300 max-w-[75ch]">
            {topic.whatToLearn.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 leading-relaxed">
                <span className="font-mono text-xs text-sky-600 dark:text-sky-400 mt-1 tabular-nums">
                  0{i + 1}.
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* SECTION G: CURATED LEARNING RESOURCES */}
        <section className="space-y-4 pt-4 border-t border-slate-200/70 dark:border-slate-800/70">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              06. Curated Learning Resources
            </h2>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
              Official documentation & primary research
            </span>
          </div>

          <div className="divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900/50">
            {topic.resources.map((res) => {
              const resKey = `${topic.id}::${res.id}`;
              const isResSaved = bookmarkedResources.includes(resKey);
              return (
                <div
                  key={res.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400">
                      <span
                        className={
                          res.priority === 'Essential'
                            ? 'text-sky-600 dark:text-sky-400 font-semibold'
                            : 'text-slate-600 dark:text-slate-400'
                        }
                      >
                        Priority: {res.priority}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>Type: {res.type}</span>
                    </div>
                    <a
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-900 dark:text-slate-100 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
                    >
                      <span>{res.title}</span>
                      <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-70" />
                    </a>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {res.whyStudy}
                    </p>
                    <div className="text-[11px] font-mono text-slate-400 dark:text-slate-500 truncate">
                      {res.url}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onToggleBookmarkResource(topic.id, res.id)}
                      className={`px-3 py-1.5 text-xs font-medium rounded border transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 ${
                        isResSaved
                          ? 'border-sky-500/50 bg-sky-500/10 text-sky-600 dark:text-sky-400'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                    >
                      {isResSaved ? (
                        <BookmarkCheck className="w-3.5 h-3.5" />
                      ) : (
                        <Bookmark className="w-3.5 h-3.5" />
                      )}
                      <span>{isResSaved ? 'Saved' : 'Save Resource'}</span>
                    </button>
                    <a
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 text-xs font-medium rounded bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:opacity-90 transition-opacity whitespace-nowrap shrink-0 inline-flex items-center gap-1"
                    >
                      <span>Open Source</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* SECTION H: COMPLETION CHECKLIST */}
        <section className="space-y-4 pt-4 border-t border-slate-200/70 dark:border-slate-800/70">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                07. Mastery Verification Checklist
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                A topic is mastered only when you can explain its mechanism and apply it—not merely open its link.
              </p>
            </div>
            <div className="text-xs font-mono tabular-nums text-slate-600 dark:text-slate-300">
              {completedCriteriaCount} / {totalCriteriaCount} Verified ({checklistPct}%)
            </div>
          </div>

          <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-200"
              style={{ width: `${checklistPct}%` }}
            />
          </div>

          <div className="divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900/50">
            {topic.checklist.map((itemText, idx) => {
              const checked = Boolean(checklistState[idx]);
              return (
                <label
                  key={idx}
                  className="flex items-center gap-3 p-3.5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors select-none"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggleChecklist(topic.id, idx)}
                    className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-emerald-600 focus:ring-sky-500 cursor-pointer"
                  />
                  <span
                    className={`text-sm ${
                      checked
                        ? 'line-through text-slate-400 dark:text-slate-500'
                        : 'text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {itemText}
                  </span>
                </label>
              );
            })}
          </div>
        </section>

        {/* SECTION I: MY PERSONAL LEARNING NOTES */}
        <section className="space-y-4 pt-4 border-t border-slate-200/70 dark:border-slate-800/70">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                08. My Personal Engineering Notes
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Write explanations in your own words. Persisted locally in your browser and included in JSON backups.
              </p>
            </div>
            {note?.updatedAt && (
              <span className="text-xs font-mono text-slate-400 dark:text-slate-500 tabular-nums">
                Last saved: {new Date(note.updatedAt).toLocaleString()}
              </span>
            )}
          </div>

          <form
            onSubmit={handleSaveNotes}
            className="space-y-4 p-5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-mono text-slate-600 dark:text-slate-300">
                  1. My First-Principles Explanation (Feynman Technique)
                </label>
                <textarea
                  rows={4}
                  value={personalExplanation}
                  onChange={(e) => setPersonalExplanation(e.target.value)}
                  placeholder="Explain how this works under the hood in your own words without copying documentation..."
                  className="w-full rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-mono text-slate-600 dark:text-slate-300">
                  2. Important Architectural Observations & Trade-offs
                </label>
                <textarea
                  rows={4}
                  value={importantObservations}
                  onChange={(e) => setImportantObservations(e.target.value)}
                  placeholder="Key engineering trade-offs, latency/memory implications, or code patterns noticed..."
                  className="w-full rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-mono text-slate-600 dark:text-slate-300">
                  3. Difficult Concepts or Edge Cases
                </label>
                <textarea
                  rows={3}
                  value={difficultConcepts}
                  onChange={(e) => setDifficultConcepts(e.target.value)}
                  placeholder="Subtle mechanics, edge cases, or mathematical formulas to review again..."
                  className="w-full rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-mono text-slate-600 dark:text-slate-300">
                  4. Open Questions to Investigate Later
                </label>
                <textarea
                  rows={3}
                  value={questionsToInvestigate}
                  onChange={(e) => setQuestionsToInvestigate(e.target.value)}
                  placeholder="Questions to test in a benchmark script or verify during the Capstone project..."
                  className="w-full rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="text-xs font-mono text-emerald-600 dark:text-emerald-400">
                {noteSaveFeedback && '✓ Notes saved to browser persistent storage'}
              </div>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-medium rounded-md bg-sky-600 hover:bg-sky-500 text-white transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Notes</span>
              </button>
            </div>
          </form>
        </section>

        {/* Related Topics & Sequential Navigation Footer */}
        {topic.relatedTopics.length > 0 && (
          <section className="space-y-2 pt-4 border-t border-slate-200/70 dark:border-slate-800/70">
            <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
              Connected Topics in the Curriculum Graph:
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs">
              {topic.relatedTopics.map((relId) => {
                const rel = TOPIC_BY_ID[relId];
                if (!rel) return null;
                return (
                  <button
                    key={relId}
                    onClick={() => onSelectTopic(relId)}
                    className="text-sky-600 dark:text-sky-400 hover:underline font-medium cursor-pointer"
                  >
                    → {rel.phaseNumber}.{String(rel.order).padStart(2, '0')} {rel.title}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Prev / Next Sequential Topic Navigation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-slate-200 dark:border-slate-800">
          {prev ? (
            <button
              onClick={() => onSelectTopic(prev.id)}
              className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 hover:border-sky-500/50 text-left transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400 group-hover:text-sky-500">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous Topic · Phase {prev.phaseNumber}</span>
              </div>
              <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-1">
                {prev.title}
              </div>
            </button>
          ) : (
            <div />
          )}

          {next && (
            <button
              onClick={() => onSelectTopic(next.id)}
              className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 hover:border-sky-500/50 text-right transition-colors cursor-pointer group"
            >
              <div className="flex items-center justify-end gap-1.5 text-xs font-mono text-slate-400 group-hover:text-sky-500">
                <span>Next Topic · Phase {next.phaseNumber}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
              <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-1">
                {next.title}
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
