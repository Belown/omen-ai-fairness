/**
 * COMPAS / ProPublica-style baselines for educational simulation.
 * @see https://www.propublica.org/article/how-we-analyzed-the-compas-recidivism-algorithm
 */

export type StudyMetricId = "fpr-fnr-by-race" | "tpr-tnr-by-race" | "ppv-high-risk";

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
    id: "fpr-fnr-by-race",
    label: "False positive & false negative rates by species",
    shortLabel: "FPR / FNR by species",
    cost: 120,
    description:
      "Compares how often non‑recidivists are flagged (FPR) and recidivists are missed (FNR) across predators and prey.",
  },
  {
    id: "tpr-tnr-by-race",
    label: "True positive & true negative rates by species",
    shortLabel: "TPR / TNR by species",
    cost: 100,
    description:
      "Measures correct detention and correct release rates by group — the mirror of error‑rate parity tests.",
  },
  {
    id: "ppv-high-risk",
    label: "Predictive parity among high‑risk scores (PPV)",
    shortLabel: "PPV / predictive parity",
    cost: 90,
    description:
      "Among defendants flagged high risk, what share actually reoffended? Equal PPV across groups is a calibration‑style fairness test.",
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
