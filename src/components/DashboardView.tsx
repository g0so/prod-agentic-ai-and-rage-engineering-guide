import React from 'react';
import {
  ActivityEntry,
  CurriculumPhase,
  CurriculumTopic,
  TopicStatus,
} from '../types/curriculum';
import { ALL_PHASES, CAPSTONE_MILESTONES, TOPIC_BY_ID } from '../data/curriculumIndex';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  Compass,
  FileText,
  Layers,
  Terminal,
} from 'lucide-react';

interface DashboardViewProps {
  stats: {
    totalTopics: number;
    completedCount: number;
    inProgressCount: number;
    remainingCount: number;
    notStartedCount: number;
    overallPercentage: number;
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
    currentPhase: CurriculumPhase;
    recommendedTopic: CurriculumTopic;
    nextSequentialTopic: CurriculumTopic;
    capstonePercentage: number;
    milestonesCompleted: number;
    totalMilestones: number;
    notesCount: number;
  };
  recentActivity: ActivityEntry[];
  completedCapstoneMilestones: string[];
  onSelectTopic: (topicId: string) => void;
  onSelectPhase: (phaseId: string) => void;
  onNavigateTab: (tab: 'roadmap' | 'search' | 'glossary' | 'capstone' | 'saved' | 'backup') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  recentActivity,
  completedCapstoneMilestones,
  onSelectTopic,
  onSelectPhase,
  onNavigateTab,
}) => {
  const recTopic = stats.recommendedTopic;
  const recStatus = stats.statusByTopicId[recTopic.id];

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-16">
      {/* Hero / Continue Learning Banner */}
      <section className="p-6 sm:p-8 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-7 flex flex-col justify-between space-y-5">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400">
                <span className="text-sky-600 dark:text-sky-400 font-semibold">
                  PERSONAL ENGINEERING CURRICULUM
                </span>
                <span aria-hidden="true">·</span>
                <span>Tailored to: Python / C / C++ / Algorithms / Basic ML</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 text-balance">
                Production Agentic AI & Retrieval-Augmented Generation
              </h1>
              <p className="text-sm sm:text-[15px] text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                A first-principles engineering roadmap from zero RAG experience to designing, evaluating, securing, and deploying production-grade retrieval and autonomous agent systems.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={() => onSelectTopic(recTopic.id)}
                className="px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-md bg-sky-600 hover:bg-sky-500 text-white transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>
                  {stats.completedCount === 0 && stats.inProgressCount === 0
                    ? 'Start Phase 00: Topic 01'
                    : 'Continue Learning'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigateTab('roadmap')}
                className="px-4 py-2.5 text-xs sm:text-sm font-medium rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                View Full 14-Phase Roadmap
              </button>
            </div>
          </div>

          {/* Right Column: Recommended Next Topic Card */}
          <div className="lg:col-span-5 flex flex-col justify-between p-5 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/90 space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400">
                <span>RECOMMENDED NEXT TOPIC</span>
                <span className="text-sky-600 dark:text-sky-400">
                  Phase {recTopic.phaseNumber} · Topic {String(recTopic.order).padStart(2, '0')}
                </span>
              </div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                {recTopic.title}
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {recTopic.subtitle}
              </p>
            </div>

            <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                <span>Difficulty: {recTopic.difficulty}</span>
                <span aria-hidden="true">·</span>
                <span>Effort: {recTopic.estimatedEffort}</span>
                <span aria-hidden="true">·</span>
                <span>
                  Status:{' '}
                  {recStatus === 'in_progress'
                    ? 'In Progress'
                    : recStatus === 'completed'
                    ? 'Completed'
                    : 'Not Started'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={() => onSelectPhase(stats.currentPhase.id)}
                  className="text-xs font-mono text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 transition-colors cursor-pointer"
                >
                  Active Phase: {stats.currentPhase.number} ({stats.currentPhase.shortTitle})
                </button>
                <button
                  onClick={() => onSelectTopic(recTopic.id)}
                  className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>Open Topic Page</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Full-Width 5-Column Real Telemetry Strip Below Hero Split */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div>
            <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
              OVERALL COMPLETION
            </div>
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-50 mt-1">
              {stats.overallPercentage}%
            </div>
            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-sky-500 transition-all duration-200"
                style={{ width: `${stats.overallPercentage}%` }}
              />
            </div>
          </div>

          <div>
            <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
              COMPLETED TOPICS
            </div>
            <div className="text-2xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400 mt-1">
              {stats.completedCount}{' '}
              <span className="text-sm font-normal text-slate-400">/ {stats.totalTopics}</span>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Mastery checklist verified
            </div>
          </div>

          <div>
            <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
              IN PROGRESS
            </div>
            <div className="text-2xl font-bold font-mono tabular-nums text-sky-600 dark:text-sky-400 mt-1">
              {stats.inProgressCount}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Active study or partial checklist
            </div>
          </div>

          <div>
            <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
              REMAINING TOPICS
            </div>
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100 mt-1">
              {stats.remainingCount}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {stats.notStartedCount} not started · {stats.notesCount} notes saved
            </div>
          </div>

          <div>
            <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
              CAPSTONE PROGRESS
            </div>
            <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100 mt-1">
              {stats.capstonePercentage}%
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {stats.milestonesCompleted} / {stats.totalMilestones} milestones complete
            </div>
          </div>
        </div>
      </section>

      {/* Main Two-Column Workspace: 14-Phase Curriculum Matrix + Activity & Capstone */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 8 Columns: Ordered Phase Progression Table */}
        <section className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Sequential Curriculum Phases (00 — 13)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Click any phase to inspect its topics, architecture diagrams, and milestone objectives.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('roadmap')}
              className="text-xs font-medium text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
            >
              Expand All Phases →
            </button>
          </div>

          <div className="border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900/50 divide-y divide-slate-200 dark:divide-slate-800">
            {stats.phaseStats.map((ps) => {
              const isCurrent = ps.phaseId === stats.currentPhase.id;
              return (
                <div
                  key={ps.phaseId}
                  onClick={() => onSelectPhase(ps.phaseId)}
                  className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer ${
                    isCurrent ? 'bg-sky-500/[0.03]' : ''
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-mono">
                      <span className="text-sky-600 dark:text-sky-400 font-semibold tabular-nums">
                        PHASE {ps.phaseNumber}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="text-slate-500 dark:text-slate-400 tabular-nums">
                        {ps.total} Topics
                      </span>
                      {isCurrent && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-sky-600 dark:text-sky-400 font-medium">
                            Current Active Phase
                          </span>
                        </>
                      )}
                    </div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {ps.title}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 sm:w-52 justify-end">
                    <div className="w-28">
                      <div className="flex justify-between text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400 mb-1">
                        <span>
                          {ps.completed}/{ps.total}
                        </span>
                        <span>{ps.percentage}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-200 ${
                            ps.percentage === 100 ? 'bg-emerald-500' : 'bg-sky-500'
                          }`}
                          style={{ width: `${ps.percentage}%` }}
                        />
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Right 4 Columns: Capstone Milestones & Real Recent Learning Activity */}
        <div className="lg:col-span-4 space-y-8">
          {/* Capstone Project Tracker Card */}
          <section className="p-5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-mono text-sky-600 dark:text-sky-400">
                  PHASE 13 · CAPSTONE ROADMAP
                </div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                  Production Agentic Knowledge Assistant
                </h3>
              </div>
              <span className="text-xs font-mono tabular-nums text-slate-500">
                {stats.milestonesCompleted}/{stats.totalMilestones}
              </span>
            </div>

            <div className="space-y-2.5">
              {CAPSTONE_MILESTONES.map((ms) => {
                const done = completedCapstoneMilestones.includes(ms.id);
                return (
                  <div
                    key={ms.id}
                    onClick={() => onNavigateTab('capstone')}
                    className="flex items-start gap-2.5 text-xs cursor-pointer group"
                  >
                    <span
                      className={`font-mono tabular-nums mt-0.5 ${
                        done
                          ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                          : 'text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      {done ? '✓' : '○'} {ms.number}
                    </span>
                    <div className="flex-1">
                      <div
                        className={`font-medium group-hover:text-sky-500 transition-colors ${
                          done
                            ? 'line-through text-slate-400 dark:text-slate-500'
                            : 'text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        {ms.title}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                        {ms.phaseAlignment}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => onNavigateTab('capstone')}
              className="w-full py-2 text-xs font-medium rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 hover:border-sky-500/50 transition-colors cursor-pointer"
            >
              Open Capstone Specifications & Milestones
            </button>
          </section>

          {/* Recent Activity Log */}
          <section className="p-5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Recent Learning Activity
              </h3>
              <span className="text-xs font-mono text-slate-400 dark:text-slate-500">
                Real browser state
              </span>
            </div>

            {recentActivity.length === 0 ? (
              <div className="py-6 text-center space-y-2">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  No activity recorded yet. Check off mastery criteria or save personal notes on any topic to build your learning log.
                </p>
                <button
                  onClick={() => onSelectTopic(recTopic.id)}
                  className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
                >
                  Begin with {recTopic.title} →
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-200 dark:divide-slate-800">
                {recentActivity.slice(0, 8).map((act) => (
                  <div key={act.id} className="py-2.5 first:pt-0 last:pb-0 space-y-0.5">
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 dark:text-slate-500 tabular-nums">
                      <span>{act.type.replace('_', ' ').toUpperCase()}</span>
                      <span>
                        {new Date(act.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    {act.topicId ? (
                      <button
                        onClick={() => act.topicId && onSelectTopic(act.topicId)}
                        className="text-xs font-medium text-slate-800 dark:text-slate-200 hover:text-sky-500 text-left block cursor-pointer"
                      >
                        {act.title}
                      </button>
                    ) : (
                      <div className="text-xs font-medium text-slate-800 dark:text-slate-200">
                        {act.title}
                      </div>
                    )}
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {act.detail}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};
