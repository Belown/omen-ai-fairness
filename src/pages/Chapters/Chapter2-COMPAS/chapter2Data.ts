/**
 * COMPAS / ProPublica-style baselines for educational simulation.
 * @see https://www.propublica.org/article/how-we-analyzed-the-compas-recidivism-algorithm
 */

export type StudyMetricId = "study_error_rates" | "study_predictive_parity" | "study_accuracy";

export type FairnessDefinitionId = "equal_rates" | "predictive_parity" | "max_accuracy";

/** Player-facing days: 0 (setup) through 3 (final confirmation). */
export const MAX_CURRENT_DAY = 3;

export const STARTING_BUDGET = 1000;

export const STUDY_METRICS: Array<{
  id: StudyMetricId;
  label: string;
  shortLabel: string;
  cost: number;
  description: string;
}> = [
  {
    id: "study_error_rates",
    label: "Error Rates by Species",
    shortLabel: "Error rates by species",
    cost: 120,
    description:
      "Per-species TPR, TNR, FPR, FNR, and % flagged high-risk for predators and prey.",
  },
  {
    id: "study_predictive_parity",
    label: "Predictive Parity Analysis",
    shortLabel: "Predictive parity",
    cost: 90,
    description:
      "Among defendants flagged high risk, reoffend rates by species and calibration status.",
  },
  {
    id: "study_accuracy",
    label: "Overall Model Accuracy",
    shortLabel: "Overall accuracy",
    cost: 75,
    description: "Aggregate correct-prediction rate for the instrument overnight.",
  },
];

export const FAIRNESS_DEFINITIONS: Array<{
  id: FairnessDefinitionId;
  title: string;
  blurb: string;
}> = [
  {
    id: "equal_rates",
    title: "Equal Error Rates",
    blurb: "Equalise True Positive Rate (TPR) and True Negative Rate (TNR) across species.",
  },
  {
    id: "predictive_parity",
    title: "Predictive Parity",
    blurb: "Ensure recidivism rates among high‑risk flags are equal across groups (equal PPV).",
  },
  {
    id: "max_accuracy",
    title: "Maximise Overall Accuracy",
    blurb: "Optimise aggregate accuracy without species‑based constraints.",
  },
];

export const METRIC_USAGE_INITIAL: Record<FairnessDefinitionId, number> = {
  equal_rates: 0,
  predictive_parity: 0,
  max_accuracy: 0,
};

export function studyDisplayName(id: StudyMetricId): string {
  return STUDY_METRICS.find((m) => m.id === id)?.label ?? id;
}
