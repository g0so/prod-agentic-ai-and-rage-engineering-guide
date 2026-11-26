import { CurriculumPhase, CurriculumTopic } from '../types/curriculum';
import { PHASES_00_TO_03 } from './phases00to03';
import { PHASES_04_TO_06 } from './phases04to06';
import { PHASES_07_TO_09 } from './phases07to09';
import { CAPSTONE_MILESTONES, PHASES_10_TO_13 } from './phases10to13';
import { GLOSSARY_ENTRIES } from './glossaryData';

export const ALL_PHASES: CurriculumPhase[] = [
  ...PHASES_00_TO_03,
  ...PHASES_04_TO_06,
  ...PHASES_07_TO_09,
  ...PHASES_10_TO_13,
];

export const ALL_TOPICS: CurriculumTopic[] = ALL_PHASES.flatMap((phase) => phase.topics);

export const TOPIC_BY_ID: Record<string, CurriculumTopic> = Object.fromEntries(
  ALL_TOPICS.map((topic) => [topic.id, topic])
);

export const PHASE_BY_ID: Record<string, CurriculumPhase> = Object.fromEntries(
  ALL_PHASES.map((phase) => [phase.id, phase])
);

export const ALL_TECHNOLOGIES: string[] = Array.from(
  new Set(ALL_TOPICS.flatMap((t) => t.technologies))
).sort();

export function getAdjacentTopics(topicId: string): {
  prev: CurriculumTopic | null;
  next: CurriculumTopic | null;
} {
  const idx = ALL_TOPICS.findIndex((t) => t.id === topicId);
  if (idx === -1) return { prev: null, next: null };
  return {
    prev: idx > 0 ? ALL_TOPICS[idx - 1] : null,
    next: idx < ALL_TOPICS.length - 1 ? ALL_TOPICS[idx + 1] : null,
  };
}

export { CAPSTONE_MILESTONES, GLOSSARY_ENTRIES };
