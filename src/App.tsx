import React, { useState, useEffect, useMemo } from 'react';
import {
  Terminal,
  LayoutDashboard,
  Map,
  Search,
  BookOpen,
  Rocket,
  Bookmark,
  Database,
  Play,
  Sun,
  Moon,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  Clock,
  Circle,
  Menu,
  X,
  Compass,
  Award,
  Layers
} from 'lucide-react';
import {
  ALL_PHASES,
  ALL_TOPICS,
  TOPIC_BY_ID
} from './data/curriculumIndex';
import { useLearningPlatform } from './hooks/useLearningPlatform';
import { DashboardView } from './components/DashboardView';
import { TopicDetailView } from './components/TopicDetailView';
import {
  LearningPathView,
  SearchExplorerView,
  GlossaryView,
  CapstoneView,
  SavedAndNotesView,
  BackupView
} from './components/CurriculumViews';

type ActiveView =
  | 'dashboard'
  | 'roadmap'
  | 'topic'
  | 'search'
  | 'glossary'
  | 'capstone'
  | 'saved'
  | 'backup';

export default function App() {
  const {
    state,
    stats,
    getTopicChecklist,
    getTopicStatus,
    toggleChecklistItem,
    setTopicExplicitStatus,
    saveTopicNote,
    toggleBookmarkTopic,
    toggleBookmarkResource,
    toggleCapstoneMilestone,
    exportBackupJson,
    importBackupJson,
    resetAllProgress
  } = useLearningPlatform();

  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [activeTopicId, setActiveTopicId] = useState<string>(
    ALL_TOPICS[0]?.id || 'p00-ml-to-llm'
  );
  const [focusedPhaseId, setFocusedPhaseId] = useState<string | null>(null);
  const [sidebarOpenPhases, setSidebarOpenPhases] = useState<Record<string, boolean>>({
    'phase-00': true,
    'phase-01': true
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarFilter, setSidebarFilter] = useState('');

  // Theme management (Dark mode default, Light mode alternative)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = window.localStorage.getItem('deepagentic_theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {
      // ignore storage error
    }
    return 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      window.localStorage.setItem('deepagentic_theme', theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const handleOpenTopic = (topicId: string) => {
    const topic = TOPIC_BY_ID[topicId];
    if (!topic) return;
    setActiveTopicId(topicId);
    setActiveView('topic');
    setSidebarOpenPhases(prev => ({ ...prev, [topic.phaseId]: true }));
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectPhase = (phaseId: string) => {
    setFocusedPhaseId(phaseId);
    setSidebarOpenPhases(prev => ({ ...prev, [phaseId]: true }));
    setActiveView('roadmap');
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateView = (view: ActiveView) => {
    setActiveView(view);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentTopic = useMemo(() => {
    return TOPIC_BY_ID[activeTopicId] || ALL_TOPICS[0];
  }, [activeTopicId]);

  const continueTopicId = useMemo(() => {
    return stats.recommendedTopic?.id || ALL_TOPICS[0].id;
  }, [stats.recommendedTopic]);

  const filteredSidebarPhases = useMemo(() => {
    const q = sidebarFilter.trim().toLowerCase();
    if (!q) return ALL_PHASES;
    return ALL_PHASES.map(phase => ({
      ...phase,
      topics: phase.topics.filter(
        t =>
          t.title.toLowerCase().includes(q) ||
          t.id.toLowerCase().includes(q) ||
          `phase ${phase.number}`.toLowerCase().includes(q)
      )
    })).filter(p => p.topics.length > 0);
  }, [sidebarFilter]);

  const navItems: {
    id: ActiveView;
    label: string;
    icon: React.ReactNode;
    badge?: number;
  }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />
    },
    {
      id: 'roadmap',
      label: 'Learning Path',
      icon: <Map className="w-4 h-4" />
    },
    {
      id: 'search',
      label: 'Search & Filter',
      icon: <Search className="w-4 h-4" />
    },
    {
      id: 'glossary',
      label: 'Glossary',
      icon: <BookOpen className="w-4 h-4" />
    },
    {
      id: 'capstone',
      label: 'Capstone',
      icon: <Rocket className="w-4 h-4" />
    },
    {
      id: 'saved',
      label: 'Saved & Notes',
      icon: <Bookmark className="w-4 h-4" />,
      badge:
        state.bookmarkedTopics.length +
        state.bookmarkedResources.length +
        stats.notesCount
    },
    {
      id: 'backup',
      label: 'Backup JSON',
      icon: <Database className="w-4 h-4" />
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Bar: 3-Zone Navigation Contract */}
      <header className="sticky top-0 z-40 h-14 border-b border-slate-200 dark:border-slate-800/90 bg-white/95 dark:bg-[#0B0F17]/95 backdrop-blur-md">
        <div className="h-full max-w-[1600px] mx-auto px-4 flex items-center justify-between gap-4">
          {/* Zone 1: Brand Wordmark + Mobile Menu Trigger */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setMobileMenuOpen(prev => !prev)}
              className="lg:hidden p-1.5 rounded-md border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <button
              onClick={() => handleNavigateView('dashboard')}
              className="flex items-center gap-2.5 text-left group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-md bg-sky-600 flex items-center justify-center text-white shadow-xs group-hover:bg-sky-500 transition-colors">
                <Terminal className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white">
                    DeepAgentic
                  </span>
                  <span className="hidden sm:inline-block font-mono text-[10px] uppercase tracking-wider text-sky-600 dark:text-sky-400">
                    RAG &amp; Agentic AI
                  </span>
                </div>
                <p className="hidden xl:block text-[11px] text-slate-500 dark:text-slate-400">
                  14 Phases · {ALL_TOPICS.length} Engineering Topics
                </p>
              </div>
            </button>
          </div>

          {/* Zone 2: Primary View Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 overflow-x-auto">
            {navItems.map(item => {
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigateView(item.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-sky-600/10 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300 border border-sky-500/30'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {typeof item.badge === 'number' && item.badge > 0 && (
                    <span className="ml-0.5 font-mono text-[10px] tabular-nums px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Continue Learning CTA + Theme Toggle */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono tabular-nums text-slate-600 dark:text-slate-400">
              <Award className="w-3.5 h-3.5 text-emerald-500" />
              <span>
                {stats.completedCount}/{stats.totalTopics} ({stats.overallPercentage}%)
              </span>
            </div>

            <button
              onClick={() => handleOpenTopic(continueTopicId)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold whitespace-nowrap shrink-0 shadow-xs transition-colors cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Continue Learning</span>
            </button>

            <button
              onClick={() => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'))}
              className="p-2 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-14 z-30 bg-slate-950/60 backdrop-blur-xs flex">
          <div className="w-80 max-w-[85vw] h-full bg-white dark:bg-[#111622] border-r border-slate-200 dark:border-slate-800 overflow-y-auto p-4 space-y-5">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                Views
              </div>
              <div className="grid grid-cols-1 gap-1">
                {navItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => handleNavigateView(item.id)}
                    className={`flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium ${
                      activeView === item.id
                        ? 'bg-sky-600 text-white'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {item.icon}
                      {item.label}
                    </span>
                    {typeof item.badge === 'number' && item.badge > 0 && (
                      <span className="font-mono text-[10px] tabular-nums px-1.5 py-0.5 rounded bg-black/20">
                        {item.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                Jump to Phase / Topic
              </div>
              <div className="space-y-1.5">
                {ALL_PHASES.map(phase => {
                  const isOpen = !!sidebarOpenPhases[phase.id];
                  return (
                    <div
                      key={phase.id}
                      className="rounded-md border border-slate-200 dark:border-slate-800/80 overflow-hidden"
                    >
                      <button
                        onClick={() =>
                          setSidebarOpenPhases(prev => ({
                            ...prev,
                            [phase.id]: !prev[phase.id]
                          }))
                        }
                        className="w-full px-2.5 py-2 flex items-center justify-between text-left bg-slate-50 dark:bg-slate-900/60 text-xs font-medium text-slate-800 dark:text-slate-200"
                      >
                        <span className="truncate">
                          <span className="font-mono text-sky-500 mr-1.5">
                            P{phase.number}
                          </span>
                          {phase.shortTitle}
                        </span>
                        {isOpen ? (
                          <ChevronDown className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                        )}
                      </button>
                      {isOpen && (
                        <div className="divide-y divide-slate-100 dark:divide-slate-800/40 bg-white dark:bg-[#111622]">
                          {phase.topics.map(topic => {
                            const status = getTopicStatus(topic.id);
                            const isCurrent =
                              activeView === 'topic' && activeTopicId === topic.id;
                            return (
                              <button
                                key={topic.id}
                                onClick={() => handleOpenTopic(topic.id)}
                                className={`w-full px-3 py-1.5 text-left text-xs flex items-center gap-2 ${
                                  isCurrent
                                    ? 'bg-sky-500/15 text-sky-600 dark:text-sky-300 font-semibold'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                                }`}
                              >
                                {status === 'completed' ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                ) : status === 'in_progress' ? (
                                  <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                ) : (
                                  <Circle className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 shrink-0" />
                                )}
                                <span className="truncate">
                                  {topic.order}. {topic.title}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div
            className="flex-1"
            onClick={() => setMobileMenuOpen(false)}
          />
        </div>
      )}

      {/* Main Workspace Container: Left Curriculum Sidebar + Content Canvas */}
      <div className="flex-1 max-w-[1600px] w-full mx-auto flex">
        {/* Desktop Persistent Curriculum Sidebar */}
        <aside className="hidden lg:flex lg:w-76 xl:w-80 shrink-0 flex-col border-r border-slate-200 dark:border-slate-800/90 bg-white dark:bg-[#0E131D] h-[calc(100vh-3.5rem)] sticky top-14">
          {/* Sidebar Progress & Quick Filter Header */}
          <div className="p-3.5 border-b border-slate-200 dark:border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-sky-500" />
                Curriculum Index
              </span>
              <span className="font-mono font-semibold tabular-nums text-sky-600 dark:text-sky-400">
                {stats.completedCount} / {stats.totalTopics}
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-sky-500 transition-all duration-300"
                style={{ width: `${stats.overallPercentage}%` }}
              />
            </div>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={sidebarFilter}
                onChange={e => setSidebarFilter(e.target.value)}
                placeholder="Quick filter 228 topics..."
                className="w-full pl-8 pr-6 py-1.5 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-sky-500"
              />
              {sidebarFilter && (
                <button
                  onClick={() => setSidebarFilter('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Phase & Topic Tree */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
            {filteredSidebarPhases.map(phase => {
              const isOpen =
                sidebarFilter.trim().length > 0 || !!sidebarOpenPhases[phase.id];
              const phaseStat = stats.phaseStats.find(
                ps => ps.phaseId === phase.id
              );

              return (
                <div
                  key={phase.id}
                  className="rounded-md border border-slate-200/80 dark:border-slate-800/80 overflow-hidden bg-slate-50/50 dark:bg-slate-900/30"
                >
                  <button
                    onClick={() =>
                      setSidebarOpenPhases(prev => ({
                        ...prev,
                        [phase.id]: !prev[phase.id]
                      }))
                    }
                    className="w-full px-2.5 py-2 flex items-center justify-between gap-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                  >
                    <div className="min-w-0 flex items-center gap-2">
                      <span className="font-mono text-[11px] font-semibold text-sky-600 dark:text-sky-400 shrink-0">
                        {phase.number}
                      </span>
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {phase.shortTitle}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="font-mono text-[10px] tabular-nums text-slate-500 dark:text-slate-400">
                        {phaseStat?.completed || 0}/{phase.topics.length}
                      </span>
                      {isOpen ? (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="border-t border-slate-200/70 dark:border-slate-800/70 bg-white dark:bg-[#111622] py-1">
                      {phase.topics.map(topic => {
                        const status = getTopicStatus(topic.id);
                        const isSelected =
                          activeView === 'topic' && activeTopicId === topic.id;
                        return (
                          <button
                            key={topic.id}
                            onClick={() => handleOpenTopic(topic.id)}
                            className={`w-full px-2.5 py-1.5 text-left flex items-start gap-2 text-xs transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-sky-600/10 dark:bg-sky-500/15 text-sky-600 dark:text-sky-300 font-semibold border-l-2 border-sky-500'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
                            }`}
                          >
                            <span className="mt-0.5 shrink-0">
                              {status === 'completed' ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                              ) : status === 'in_progress' ? (
                                <Clock className="w-3.5 h-3.5 text-amber-500" />
                              ) : (
                                <Circle className="w-3.5 h-3.5 text-slate-300 dark:text-slate-700" />
                              )}
                            </span>
                            <span className="leading-snug line-clamp-2">
                              <span className="font-mono text-[10px] opacity-65 mr-1">
                                {String(topic.order).padStart(2, '0')}.
                              </span>
                              {topic.title}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Sidebar Footer Shortcut */}
          <div className="p-3 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/40 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <button
              onClick={() => handleNavigateView('glossary')}
              className="hover:text-sky-500 flex items-center gap-1 cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>24 Core Terms</span>
            </button>
            <button
              onClick={() => handleNavigateView('backup')}
              className="hover:text-sky-500 font-mono cursor-pointer"
            >
              Export / Restore JSON
            </button>
          </div>
        </aside>

        {/* Primary Viewport Content */}
        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 py-6">
          {activeView === 'dashboard' && (
            <DashboardView
              stats={stats}
              recentActivity={state.recentActivity}
              completedCapstoneMilestones={state.completedCapstoneMilestones}
              onSelectTopic={handleOpenTopic}
              onSelectPhase={handleSelectPhase}
              onNavigateTab={handleNavigateView}
            />
          )}

          {activeView === 'roadmap' && (
            <LearningPathView
              statusByTopicId={stats.statusByTopicId}
              phaseStats={stats.phaseStats}
              focusedPhaseId={focusedPhaseId}
              onSelectTopic={handleOpenTopic}
            />
          )}

          {activeView === 'topic' && currentTopic && (
            <TopicDetailView
              topic={currentTopic}
              status={getTopicStatus(currentTopic.id)}
              checklistState={getTopicChecklist(currentTopic.id)}
              note={state.notes[currentTopic.id]}
              isBookmarked={state.bookmarkedTopics.includes(currentTopic.id)}
              bookmarkedResources={state.bookmarkedResources}
              onSelectTopic={handleOpenTopic}
              onSelectPhase={handleSelectPhase}
              onToggleChecklist={toggleChecklistItem}
              onSetExplicitStatus={setTopicExplicitStatus}
              onSaveNote={saveTopicNote}
              onToggleBookmarkTopic={toggleBookmarkTopic}
              onToggleBookmarkResource={toggleBookmarkResource}
            />
          )}

          {activeView === 'search' && (
            <SearchExplorerView
              statusByTopicId={stats.statusByTopicId}
              onSelectTopic={handleOpenTopic}
            />
          )}

          {activeView === 'glossary' && (
            <GlossaryView onSelectTopic={handleOpenTopic} />
          )}

          {activeView === 'capstone' && (
            <CapstoneView
              completedMilestones={state.completedCapstoneMilestones}
              statusByTopicId={stats.statusByTopicId}
              onToggleMilestone={toggleCapstoneMilestone}
              onSelectTopic={handleOpenTopic}
            />
          )}

          {activeView === 'saved' && (
            <SavedAndNotesView
              bookmarkedTopics={state.bookmarkedTopics}
              bookmarkedResources={state.bookmarkedResources}
              notes={state.notes}
              onSelectTopic={handleOpenTopic}
              onToggleBookmarkTopic={toggleBookmarkTopic}
              onToggleBookmarkResource={toggleBookmarkResource}
            />
          )}

          {activeView === 'backup' && (
            <BackupView
              onExportJson={exportBackupJson}
              onImportJson={importBackupJson}
              onResetAll={resetAllProgress}
            />
          )}
        </main>
      </div>
    </div>
  );
}
