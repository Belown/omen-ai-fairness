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

export const INTRO_CHUNKS = [
  "I solved the sampling bias, but it is not enough to save Ron because biases can be somewhere else than in training data.",
  "For example, we can have biases in the algorithm design or the proxy data or even the evaluation. It means that the model will recognize patterns that will be harmful for certain groups of population because of the biased design decisions of the creators.",
  "To mitigate this issue, we can use fairness definitions, which will tell the model some rule to apply in its decision making.",
  "similarly to the sampling of training data, we are going to test different fairness definitions on different group samples.",
  ];

export const ENDINGS: Record<FairnessDefinitionId, { headline: string; body: string }> = {
  equal_rates: {
    headline: "Legacy: “We equalised error rates.”",
    body: "Audits show tighter TPR/TNR alignment across groups. Predictive parity and headline accuracy often look worse — the textbook tradeoff when base rates differ. Your term makes that tension visible rather than hiding it behind one aggregate number.",
  },
  predictive_parity: {
    headline: "Legacy: “We held calibration to the light.”",
    body: "High‑risk scores mean more similar things across groups. Error‑rate parity slides — mathematically expected when recidivism base rates diverge. Stakeholders argue whether “fair calibration” is enough if burdens still fall unevenly.",
  },
  max_accuracy: {
    headline: "Legacy: “We maximised the score.”",
    body: "Overall accuracy peaks, but group‑wise error gaps widen. The courthouse gets a clean spreadsheet and messier politics. Your ending documents the oldest temptation: optimise what is easy to count.",
  },
}
export const METRIC_USAGE_INITIAL: Record<FairnessDefinitionId, number> = {
  equal_rates: 0,
  predictive_parity: 0,
  max_accuracy: 0,
};

export function studyDisplayName(id: StudyMetricId): string {
  return STUDY_METRICS.find((m) => m.id === id)?.label ?? id;
}
