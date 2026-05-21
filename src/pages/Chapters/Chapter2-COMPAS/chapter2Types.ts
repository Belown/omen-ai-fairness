import type { FairnessDefinitionId, StudyMetricId } from "./chapter2Data";
import type { SatisfactionScores, StudyResult } from "./chapter2Simulation";

export type DayRecord = {
  day: number;
  metricActive: FairnessDefinitionId;
  studiesQueued: StudyMetricId[];
  costDeducted: number;
  results: StudyResult[];
  dailySatisfaction?: SatisfactionScores;
};

export type Chapter2GameState = {
  currentDay: number;
  fairnessMetric: FairnessDefinitionId;
  metricChangedToday: boolean;
  /** Calendar day when the player last switched metric (penalty on the night after). */
  switchedMetricOnDay: number | null;
  budget: number;
  aggregateSatisfaction: SatisfactionScores[];
  days: DayRecord[];
  pendingQueue: StudyMetricId[];
};

export const INITIAL_GAME_STATE: Chapter2GameState = {
  currentDay: 0,
  fairnessMetric: "equal_rates",
  metricChangedToday: false,
  switchedMetricOnDay: null,
  budget: 1000,
  aggregateSatisfaction: [],
  days: [],
  pendingQueue: [],
};
