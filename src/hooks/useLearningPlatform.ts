import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ActivityEntry,
  CurriculumTopic,
  TopicNote,
  TopicStatus,
  UserLearningState,
} from '../types/curriculum';
import { ALL_PHASES, ALL_TOPICS, CAPSTONE_MILESTONES, TOPIC_BY_ID } from '../data/curriculumIndex';

const STORAGE_KEY = 'deepagentic_learning_state_v1';
const EXPORT_SCHEMA_VERSION = '1.0.0';

function createInitialState(): UserLearningState {
  return {
    version: EXPORT_SCHEMA_VERSION,
    lastUpdated: new Date().toISOString(),
    topicChecklists: {},
    topicStatusOverrides: {},
    notes: {},
    bookmarkedTopics: [],
    bookmarkedResources: [],
    completedCapstoneMilestones: [],
    recentActivity: [],
  };
}

function validateImportedState(raw: unknown): { valid: boolean; error?: string; state?: UserLearningState } {
  if (!raw || typeof raw !== 'object') {
    return { valid: false, error: 'Backup file must contain a valid JSON object.' };
  }
  const obj = raw as Record<string, unknown>;
  if (typeof obj.version !== 'string') {
    return { valid: false, error: 'Missing or invalid backup format version field.' };
  }
  if (!obj.topicChecklists || typeof obj.topicChecklists !== 'object') {
    return { valid: false, error: 'Missing topicChecklists dictionary in backup.' };
  }
  if (!obj.notes || typeof obj.notes !== 'object') {
    return { valid: false, error: 'Missing notes dictionary in backup.' };
  }
  if (!Array.isArray(obj.bookmarkedTopics) || !Array.isArray(obj.bookmarkedResources)) {
    return { valid: false, error: 'Invalid bookmarks arrays in backup.' };
  }

  const sanitized: UserLearningState = {
    version: EXPORT_SCHEMA_VERSION,
    lastUpdated: new Date().toISOString(),
    topicChecklists: (obj.topicChecklists as Record<string, boolean[]>) || {},
    topicStatusOverrides: (obj.topicStatusOverrides as Record<string, TopicStatus>) || {},
    notes: (obj.notes as Record<string, TopicNote>) || {},
    bookmarkedTopics: (obj.bookmarkedTopics as string[]).filter((id) => typeof id === 'string'),
    bookmarkedResources: (obj.bookmarkedResources as string[]).filter((id) => typeof id === 'string'),
    completedCapstoneMilestones: Array.isArray(obj.completedCapstoneMilestones)
      ? (obj.completedCapstoneMilestones as string[]).filter((id) => typeof id === 'string')
      : [],
    recentActivity: Array.isArray(obj.recentActivity)
      ? (obj.recentActivity as ActivityEntry[]).slice(0, 50)
      : [],
  };

  return { valid: true, state: sanitized };
}

export function useLearningPlatform() {
  const [state, setState] = useState<UserLearningState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const check = validateImportedState(parsed);
        if (check.valid && check.state) {
          return check.state;
        }
      }
    } catch (e) {
      console.error('Failed to read learning state from localStorage:', e);
    }
    return createInitialState();
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to persist learning state to localStorage:', e);
    }
  }, [state]);

  const getTopicChecklist = useCallback(
    (topicId: string): boolean[] => {
      const topic = TOPIC_BY_ID[topicId];
      const count = topic ? topic.checklist.length : 5;
      const saved = state.topicChecklists[topicId];
      if (!saved || saved.length !== count) {
        return Array(count).fill(false);
      }
      return saved;
    },
    [state.topicChecklists]
  );

  const getTopicStatus = useCallback(
    (topicId: string): TopicStatus => {
      const override = state.topicStatusOverrides[topicId];
      const checklist = getTopicChecklist(topicId);
      const checkedCount = checklist.filter(Boolean).length;

      if (override === 'completed' || (checklist.length > 0 && checkedCount === checklist.length)) {
        return 'completed';
      }
      if (override === 'in_progress' || checkedCount > 0) {
        return 'in_progress';
      }
      const note = state.notes[topicId];
      if (
        note &&
        (note.personalExplanation.trim() ||
          note.importantObservations.trim() ||
          note.difficultConcepts.trim() ||
          note.questionsToInvestigate.trim())
      ) {
        return 'in_progress';
      }
      return 'not_started';
    },
    [state.topicStatusOverrides, state.notes, getTopicChecklist]
  );

  const toggleChecklistItem = useCallback((topicId: string, index: number) => {
    const topic = TOPIC_BY_ID[topicId];
    if (!topic) return;

    setState((prev) => {
      const len = topic.checklist.length;
      const current =
        prev.topicChecklists[topicId]?.length === len
          ? [...prev.topicChecklists[topicId]]
          : Array(len).fill(false);
      current[index] = !current[index];

      const checkedCount = current.filter(Boolean).length;
      const nextOverrides = { ...prev.topicStatusOverrides };
      let activityType: ActivityEntry['type'] = 'checklist_updated';
      let activityTitle = `Updated checklist: ${topic.title}`;
      let activityDetail = `${checkedCount}/${len} mastery criteria verified`;

      if (checkedCount === len) {
        nextOverrides[topicId] = 'completed';
        activityType = 'topic_completed';
        activityTitle = `Completed topic: ${topic.title}`;
        activityDetail = `Phase ${topic.phaseNumber} · All ${len} mastery criteria checked`;
      } else if (checkedCount > 0 && nextOverrides[topicId] === 'completed') {
        nextOverrides[topicId] = 'in_progress';
      } else if (checkedCount > 0 && !nextOverrides[topicId]) {
        nextOverrides[topicId] = 'in_progress';
      }

      const newEntry: ActivityEntry = {
        id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        type: activityType,
        topicId,
        phaseId: topic.phaseId,
        title: activityTitle,
        detail: activityDetail,
        timestamp: new Date().toISOString(),
      };

      return {
        ...prev,
        lastUpdated: new Date().toISOString(),
        topicChecklists: {
          ...prev.topicChecklists,
          [topicId]: current,
        },
        topicStatusOverrides: nextOverrides,
        recentActivity: [newEntry, ...prev.recentActivity].slice(0, 40),
      };
    });
  }, []);

  const setTopicExplicitStatus = useCallback((topicId: string, status: TopicStatus) => {
    const topic = TOPIC_BY_ID[topicId];
    if (!topic) return;

    setState((prev) => {
      const len = topic.checklist.length;
      const nextChecklists = { ...prev.topicChecklists };
      if (status === 'completed') {
        nextChecklists[topicId] = Array(len).fill(true);
      } else if (status === 'not_started') {
        nextChecklists[topicId] = Array(len).fill(false);
      }

      const newEntry: ActivityEntry = {
        id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        type: status === 'completed' ? 'topic_completed' : 'topic_started',
        topicId,
        phaseId: topic.phaseId,
        title:
          status === 'completed'
            ? `Marked completed: ${topic.title}`
            : status === 'in_progress'
            ? `Started studying: ${topic.title}`
            : `Reset progress: ${topic.title}`,
        detail: `Phase ${topic.phaseNumber} · Status set to ${status.replace('_', ' ')}`,
        timestamp: new Date().toISOString(),
      };

      return {
        ...prev,
        lastUpdated: new Date().toISOString(),
        topicChecklists: nextChecklists,
        topicStatusOverrides: {
          ...prev.topicStatusOverrides,
          [topicId]: status,
        },
        recentActivity: [newEntry, ...prev.recentActivity].slice(0, 40),
      };
    });
  }, []);

  const saveTopicNote = useCallback(
    (
      topicId: string,
      fields: Pick<
        TopicNote,
        'personalExplanation' | 'importantObservations' | 'difficultConcepts' | 'questionsToInvestigate'
      >
    ) => {
      const topic = TOPIC_BY_ID[topicId];
      if (!topic) return;

      setState((prev) => {
        const now = new Date().toISOString();
        const updatedNote: TopicNote = {
          topicId,
          ...fields,
          updatedAt: now,
        };

        const newEntry: ActivityEntry = {
          id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          type: 'note_updated',
          topicId,
          phaseId: topic.phaseId,
          title: `Saved personal notes: ${topic.title}`,
          detail: `Phase ${topic.phaseNumber} · Engineering synthesis notes updated`,
          timestamp: now,
        };

        return {
          ...prev,
          lastUpdated: now,
          notes: {
            ...prev.notes,
            [topicId]: updatedNote,
          },
          recentActivity: [newEntry, ...prev.recentActivity].slice(0, 40),
        };
      });
    },
    []
  );

  const toggleBookmarkTopic = useCallback((topicId: string) => {
    setState((prev) => {
      const exists = prev.bookmarkedTopics.includes(topicId);
      const next = exists
        ? prev.bookmarkedTopics.filter((id) => id !== topicId)
        : [topicId, ...prev.bookmarkedTopics];
      return {
        ...prev,
        lastUpdated: new Date().toISOString(),
        bookmarkedTopics: next,
      };
    });
  }, []);

  const toggleBookmarkResource = useCallback((topicId: string, resourceId: string) => {
    const key = `${topicId}::${resourceId}`;
    setState((prev) => {
      const exists = prev.bookmarkedResources.includes(key);
      const next = exists
        ? prev.bookmarkedResources.filter((k) => k !== key)
        : [key, ...prev.bookmarkedResources];
      return {
        ...prev,
        lastUpdated: new Date().toISOString(),
        bookmarkedResources: next,
      };
    });
  }, []);

  const toggleCapstoneMilestone = useCallback((milestoneId: string) => {
    const milestone = CAPSTONE_MILESTONES.find((m) => m.id === milestoneId);
    setState((prev) => {
      const exists = prev.completedCapstoneMilestones.includes(milestoneId);
      const next = exists
        ? prev.completedCapstoneMilestones.filter((id) => id !== milestoneId)
        : [...prev.completedCapstoneMilestones, milestoneId];

      const newEntry: ActivityEntry = {
        id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        type: 'milestone_completed',
        phaseId: 'phase-13',
        title: `${exists ? 'Reopened' : 'Completed'} Capstone ${milestone?.number || ''}: ${
          milestone?.title || milestoneId
        }`,
        detail: `Phase 13 Capstone Milestone`,
        timestamp: new Date().toISOString(),
      };

      return {
        ...prev,
        lastUpdated: new Date().toISOString(),
        completedCapstoneMilestones: next,
        recentActivity: [newEntry, ...prev.recentActivity].slice(0, 40),
      };
    });
  }, []);

  const exportBackupJson = useCallback((): string => {
    const payload: UserLearningState = {
      ...state,
      version: EXPORT_SCHEMA_VERSION,
      lastUpdated: new Date().toISOString(),
    };
    return JSON.stringify(payload, null, 2);
  }, [state]);

  const importBackupJson = useCallback((jsonString: string): { success: boolean; message: string } => {
    try {
      const parsed = JSON.parse(jsonString);
      const result = validateImportedState(parsed);
      if (!result.valid || !result.state) {
        return { success: false, message: result.error || 'Invalid backup file structure.' };
      }
      setState(result.state);
      return {
        success: true,
        message: `Backup restored (${Object.keys(result.state.topicChecklists).length} topic checklists, ${
          Object.keys(result.state.notes).length
        } notes, ${result.state.bookmarkedTopics.length} bookmarked topics).`,
      };
    } catch (e) {
      return {
        success: false,
        message: `Failed to parse JSON backup: ${e instanceof Error ? e.message : 'Syntax error'}`,
      };
    }
  }, []);

  const resetAllProgress = useCallback(() => {
    const fresh = createInitialState();
    setState(fresh);
  }, []);

  const stats = useMemo(() => {
    let completedCount = 0;
    let inProgressCount = 0;
    let notStartedCount = 0;

    const statusByTopicId: Record<string, TopicStatus> = {};

    for (const topic of ALL_TOPICS) {
      const st = getTopicStatus(topic.id);
      statusByTopicId[topic.id] = st;
      if (st === 'completed') completedCount++;
      else if (st === 'in_progress') inProgressCount++;
      else notStartedCount++;
    }

    const totalTopics = ALL_TOPICS.length;
    const overallPercentage = totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0;

    const phaseStats = ALL_PHASES.map((phase) => {
      const total = phase.topics.length;
      const completed = phase.topics.filter((t) => statusByTopicId[t.id] === 'completed').length;
      const inProgress = phase.topics.filter((t) => statusByTopicId[t.id] === 'in_progress').length;
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
      return {
        phaseId: phase.id,
        phaseNumber: phase.number,
        title: phase.title,
        shortTitle: phase.shortTitle,
        total,
        completed,
        inProgress,
        percentage,
      };
    });

    // Determine current active phase (first phase not 100% completed)
    const activePhaseStat =
      phaseStats.find((p) => p.completed < p.total) || phaseStats[phaseStats.length - 1];
    const currentPhase =
      ALL_PHASES.find((p) => p.id === activePhaseStat.phaseId) || ALL_PHASES[0];

    // Determine recommended next topic:
    // 1. Most recently active 'in_progress' topic from activity log, or first 'in_progress' topic in order
    // 2. Otherwise first 'not_started' topic in sequential curriculum order
    let recommendedTopic: CurriculumTopic = ALL_TOPICS[0];
    const recentInProgressActivity = state.recentActivity.find(
      (a) => a.topicId && statusByTopicId[a.topicId] === 'in_progress'
    );
    if (recentInProgressActivity?.topicId && TOPIC_BY_ID[recentInProgressActivity.topicId]) {
      recommendedTopic = TOPIC_BY_ID[recentInProgressActivity.topicId];
    } else {
      const firstInProgress = ALL_TOPICS.find((t) => statusByTopicId[t.id] === 'in_progress');
      const firstNotStarted = ALL_TOPICS.find((t) => statusByTopicId[t.id] === 'not_started');
      recommendedTopic = firstInProgress || firstNotStarted || ALL_TOPICS[ALL_TOPICS.length - 1];
    }

    // Also compute a second "up next" topic after recommendedTopic
    const recIndex = ALL_TOPICS.findIndex((t) => t.id === recommendedTopic.id);
    const nextSequentialTopic =
      ALL_TOPICS.slice(recIndex + 1).find((t) => statusByTopicId[t.id] !== 'completed') ||
      ALL_TOPICS[Math.min(recIndex + 1, ALL_TOPICS.length - 1)];

    // Capstone progress combines Phase 13 topics + 5 Capstone Milestones
    const phase13Topics = ALL_PHASES.find((p) => p.id === 'phase-13')?.topics || [];
    const phase13Completed = phase13Topics.filter((t) => statusByTopicId[t.id] === 'completed').length;
    const milestonesCompleted = state.completedCapstoneMilestones.length;
    const totalCapstoneUnits = phase13Topics.length + CAPSTONE_MILESTONES.length;
    const completedCapstoneUnits = phase13Completed + milestonesCompleted;
    const capstonePercentage =
      totalCapstoneUnits > 0 ? Math.round((completedCapstoneUnits / totalCapstoneUnits) * 100) : 0;

    const notesCount = Object.values(state.notes).filter(
      (n) =>
        n.personalExplanation.trim() ||
        n.importantObservations.trim() ||
        n.difficultConcepts.trim() ||
        n.questionsToInvestigate.trim()
    ).length;

    return {
      totalTopics,
      completedCount,
      inProgressCount,
      remainingCount: notStartedCount + inProgressCount,
      notStartedCount,
      overallPercentage,
      statusByTopicId,
      phaseStats,
      currentPhase,
      recommendedTopic,
      nextSequentialTopic,
      capstonePercentage,
      milestonesCompleted,
      totalMilestones: CAPSTONE_MILESTONES.length,
      notesCount,
    };
  }, [getTopicStatus, state.recentActivity, state.completedCapstoneMilestones, state.notes]);

  return {
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
    resetAllProgress,
  };
}
