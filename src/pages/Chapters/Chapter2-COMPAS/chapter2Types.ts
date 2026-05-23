import type { FairnessDefinitionId, StudyMetricId } from "./chapter2Data";
import { METRIC_USAGE_INITIAL, STARTING_BUDGET } from "./chapter2Data";
import type { ScenarioData } from "./chapter2Scenarios";

export type MetricUsageCounts = Record<FairnessDefinitionId, number>;

export type DayRecord = {
  day: number;
  metricActive: FairnessDefinitionId;
  studiesQueued: StudyMetricId[];
  costDeducted: number;
  scenario: ScenarioData;
};

export type Chapter2GameState = {
  currentDay: number;
  fairnessMetric: FairnessDefinitionId;
  budget: number;
  metricUsageCounts: MetricUsageCounts;
  days: DayRecord[];
  pendingQueue: StudyMetricId[];
};

export const INITIAL_GAME_STATE: Chapter2GameState = {
  currentDay: 0,
  fairnessMetric: "equal_rates",
  budget: STARTING_BUDGET,
  metricUsageCounts: { ...METRIC_USAGE_INITIAL },
  days: [],
  pendingQueue: [],
};
