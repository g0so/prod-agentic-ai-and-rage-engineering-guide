export type DifficultyLevel = 'Foundational' | 'Intermediate' | 'Advanced' | 'Production';

export type TopicStatus = 'not_started' | 'in_progress' | 'completed';

export type ResourceType =
  | 'Official Documentation'
  | 'Research Paper'
  | 'Architecture Guide'
  | 'Implementation Guide'
  | 'Specification';

export type ReadingPriority = 'Essential' | 'Recommended' | 'Deep Dive';

export interface LearningResource {
  id: string;
  title: string;
  url: string;
  type: ResourceType;
  whyStudy: string;
  priority: ReadingPriority;
}

export interface TopicDiagramSpec {
  type: 'rag-pipeline' | 'agent-loop' | 'hybrid-retrieval' | 'chunking-strategies' | 'hnsw-index' | 'rag-evaluation' | 'mcp-architecture';
  caption: string;
}

export interface CurriculumTopic {
  id: string;
  phaseId: string;
  phaseNumber: string;
  order: number;
  title: string;
  subtitle: string;
  difficulty: DifficultyLevel;
  estimatedEffort: string;
  prerequisites: string[]; // array of topic IDs
  technologies: string[];
  isOptionalOrAdvanced?: boolean;
  whatIsIt: string[];
  whyItExists: string[];
  howItWorks: {
    explanation: string[];
    codeOrFormula?: string;
    diagram?: TopicDiagramSpec;
  };
  practicalRelevance: {
    summary: string;
    examples: string[];
  };
  whatToLearn: string[];
  resources: LearningResource[];
  checklist: string[];
  relatedTopics: string[];
}

export interface CurriculumPhase {
  id: string;
  number: string;
  title: string;
  shortTitle: string;
  objective: string;
  description: string;
  milestone: string;
  keyDistinctions?: string[];
  architecturePipeline?: string[];
  topics: CurriculumTopic[];
}

export interface TopicNote {
  topicId: string;
  personalExplanation: string;
  importantObservations: string;
  difficultConcepts: string;
  questionsToInvestigate: string;
  updatedAt: string;
}

export interface ActivityEntry {
  id: string;
  type: 'topic_completed' | 'topic_started' | 'checklist_updated' | 'note_updated' | 'milestone_completed';
  topicId?: string;
  phaseId?: string;
  title: string;
  detail: string;
  timestamp: string;
}

export interface CapstoneMilestone {
  id: string;
  number: string;
  title: string;
  phaseAlignment: string;
  objective: string;
  deliverables: string[];
  verificationCriteria: string[];
}

export interface GlossaryEntry {
  id: string;
  term: string;
  category: 'Foundations' | 'RAG & Retrieval' | 'Vector Databases' | 'Evaluation' | 'Agentic AI' | 'Security & Ops';
  shortDefinition: string;
  underTheHood: string;
  relatedTopicIds: string[];
}

export interface UserLearningState {
  version: string;
  lastUpdated: string;
  // Map of topicId -> boolean array of checklist items completed
  topicChecklists: Record<string, boolean[]>;
  // Map of topicId -> explicit status override ('not_started' | 'in_progress' | 'completed')
  topicStatusOverrides: Record<string, TopicStatus>;
  // Map of topicId -> TopicNote
  notes: Record<string, TopicNote>;
  // Array of bookmarked topic IDs
  bookmarkedTopics: string[];
  // Array of bookmarked resource IDs (format: `${topicId}::${resource.id}`)
  bookmarkedResources: string[];
  // Array of completed capstone milestone IDs
  completedCapstoneMilestones: string[];
  // Activity history (most recent first)
  recentActivity: ActivityEntry[];
}
