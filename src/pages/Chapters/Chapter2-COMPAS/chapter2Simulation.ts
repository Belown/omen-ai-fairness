import type { FairnessDefinitionId, StudyMetricId } from "./chapter2Data";

export type StudyOutcome = "win" | "warn" | "neutral";

export type StudyResult = {
  metricId: StudyMetricId;
  black: number;
  white: number;
  blackSecondary?: number;
  whiteSecondary?: number;
  secondaryLabel?: string;
  outcome: StudyOutcome;
  interpretation: string;
};

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

const METRIC_INDEX: Record<FairnessDefinitionId, number> = {
  equal_rates: 0,
  predictive_parity: 1,
  max_accuracy: 2,
};

/** Day 1 baseline accuracy (%). */
const BASE_ACCURACY: Record<FairnessDefinitionId, number> = {
  max_accuracy: 84,
  predictive_parity: 74,
  equal_rates: 69,
};

/** Drift by work night index (0 = Day 1, 1 = Day 2, 2 = Day 3). */
const DAY_DRIFT: Record<FairnessDefinitionId, [number, number, number]> = {
  max_accuracy: [0, 1.5, 2.5],
  predictive_parity: [0, -1.5, -2.5],
  equal_rates: [0, -2.5, -4.0],
};

export const FINAL_CONFIRMATION_MODIFIER: Record<FairnessDefinitionId, number> = {
  max_accuracy: 2,
  predictive_parity: -1,
  equal_rates: -3,
};

const SWITCH_PENALTY = 3;

/** Deterministic jitter ±1.5% max (percentage points). */
export function seedNoise(dayIndex: number, metric: FairnessDefinitionId): number {
  const metricIndex = METRIC_INDEX[metric];
  return ((dayIndex * 31 + metricIndex * 7) % 13) / 10 - 0.65;
}

/** Deterministic 0–1 from session inputs (stable re-reads). */
export function studySeed(dayIndex: number, metricId: StudyMetricId, launchIndex: number, fairness: FairnessDefinitionId) {
  let h = dayIndex * 997 + launchIndex * 131;
  for (const c of metricId) h = (h * 31 + c.charCodeAt(0)) | 0;
  for (const c of fairness) h = (h * 31 + c.charCodeAt(0)) | 0;
  h = (h ^ (h >>> 16)) * 0x45d9f3b;
  h = (h ^ (h >>> 16)) >>> 0;
  return (h % 10000) / 10000;
}

export function formatPct(x: number) {
  return `${Math.round(x * 100)}%`;
}

export function roundAccuracy(value: number) {
  return Math.round(Math.max(0, Math.min(100, value)) * 10) / 10;
}

/** Operational daily accuracy for a completed work night (Days 1–3 on HUD). */
export function computeDailyAccuracy(
  fairness: FairnessDefinitionId,
  workNightIndex: number,
  options?: { applySwitchPenalty?: boolean },
): number {
  const base = BASE_ACCURACY[fairness];
  const drift = DAY_DRIFT[fairness][workNightIndex] ?? 0;
  const noise = seedNoise(workNightIndex, fairness);
  let acc = base + drift + noise;
  if (options?.applySwitchPenalty) acc -= SWITCH_PENALTY;
  return roundAccuracy(acc);
}

export function aggregatedAccuracy(dayScores: number[]) {
  if (!dayScores.length) return 0;
  return roundAccuracy(dayScores.reduce((a, b) => a + b, 0) / dayScores.length);
}

export function computeFinalSystemAccuracy(operationalAverage: number, finalFairness: FairnessDefinitionId) {
  const modifier = FINAL_CONFIRMATION_MODIFIER[finalFairness];
  return roundAccuracy(operationalAverage + modifier);
}

/** Seeded disparity in percentage points (delta between groups). */
function disparityFor(
  fairness: FairnessDefinitionId,
  kind: "fpr" | "fnr" | "ppv",
  workNightIndex: number,
): number {
  const s = studySeed(workNightIndex, "fpr-fnr-by-race", kind === "fpr" ? 0 : kind === "fnr" ? 1 : 2, fairness);
  const ranges: Record<FairnessDefinitionId, Record<"fpr" | "fnr" | "ppv", [number, number]>> = {
    equal_rates: { fpr: [2, 4], fnr: [2, 4], ppv: [15, 20] },
    predictive_parity: { fpr: [12, 18], fnr: [10, 15], ppv: [2, 4] },
    max_accuracy: { fpr: [20, 28], fnr: [18, 24], ppv: [8, 12] },
  };
  const [lo, hi] = ranges[fairness][kind];
  return lo + s * (hi - lo);
}

/** Split a rate around a midpoint so |black − white| ≈ disparity (0–1 scale). */
function pairFromDisparity(mid: number, disparity: number, seed: number): { black: number; white: number } {
  const half = disparity / 2;
  const n = (seed - 0.5) * 0.02;
  return {
    black: clamp01(mid + half + n),
    white: clamp01(mid - half - n * 0.5),
  };
}

function accuracyStudyValues(dailyAccuracyPct: number, seed: number): { black: number; white: number } {
  const overall = dailyAccuracyPct / 100;
  const spread = (seed - 0.5) * 0.008;
  return {
    black: clamp01(overall + spread),
    white: clamp01(overall - spread),
  };
}

type MetricProfile = {
  outcome: StudyOutcome;
  black: number;
  white: number;
  blackSecondary?: number;
  whiteSecondary?: number;
  secondaryLabel?: string;
  interpretation: string;
};

function profileForMetric(
  metricId: StudyMetricId,
  fairness: FairnessDefinitionId,
  workNightIndex: number,
  seed: number,
  dailyAccuracyPct: number,
): MetricProfile {
  const s = seed;

  if (metricId === "fpr-fnr-by-race") {
    const fprGap = disparityFor(fairness, "fpr", workNightIndex);
    const fnrGap = disparityFor(fairness, "fnr", workNightIndex);
    const fpr = pairFromDisparity(0.25, fprGap / 100, s);
    const fnr = pairFromDisparity(0.35, fnrGap / 100, s + 0.2);

    if (fairness === "equal_rates") {
      return {
        outcome: "win",
        black: fpr.black,
        white: fpr.white,
        blackSecondary: fnr.black,
        whiteSecondary: fnr.white,
        secondaryLabel: "FNR",
        interpretation:
          "By forcing equal false positive and false negative rates across groups, the model must use a different decision threshold per group. This directly reduces overall accuracy because the threshold is no longer optimal for either group individually.",
      };
    }
    if (fairness === "predictive_parity") {
      return {
        outcome: "warn",
        black: fpr.black,
        white: fpr.white,
        blackSecondary: fnr.black,
        whiteSecondary: fnr.white,
        secondaryLabel: "FNR",
        interpretation:
          "Predictive parity constrains the model to equalise positive predictive value, but when base recidivism rates differ between groups, this mathematically requires unequal error rates — a consequence of Chouldechova's impossibility theorem.",
      };
    }
    return {
      outcome: "warn",
      black: fpr.black,
      white: fpr.white,
      blackSecondary: fnr.black,
      whiteSecondary: fnr.white,
      secondaryLabel: "FNR",
      interpretation:
        "Without fairness constraints, the model sets a single optimal decision threshold across all groups. This maximises accuracy but allows disparate error rates to emerge wherever base rates differ between groups.",
    };
  }

  if (metricId === "tpr-tnr-by-race") {
    const tprGap = disparityFor(fairness, "fpr", workNightIndex) * 0.9;
    const tnrGap = disparityFor(fairness, "fnr", workNightIndex) * 0.9;
    const tpr = pairFromDisparity(0.68, tprGap / 100, s);
    const tnr = pairFromDisparity(0.65, tnrGap / 100, s + 0.15);

    if (fairness === "equal_rates") {
      return {
        outcome: "win",
        black: tpr.black,
        white: tpr.white,
        blackSecondary: tnr.black,
        whiteSecondary: tnr.white,
        secondaryLabel: "TNR",
        interpretation:
          "Equalising true positive and true negative rates forces the classifier to treat groups with different base rates as if they were identical. That alignment is your goal — but it is purchased with lower overall accuracy than an unconstrained model.",
      };
    }
    if (fairness === "predictive_parity") {
      return {
        outcome: "warn",
        black: tpr.black,
        white: tpr.white,
        blackSecondary: tnr.black,
        whiteSecondary: tnr.white,
        secondaryLabel: "TNR",
        interpretation:
          "When you prioritise equal PPV among high‑risk flags, TPR and TNR cannot stay aligned across groups if recidivism base rates differ. The impossibility result shows up here as widening TPR/TNR gaps, not as a software bug.",
      };
    }
    return {
      outcome: "warn",
      black: tpr.black,
      white: tpr.white,
      blackSecondary: tnr.black,
      whiteSecondary: tnr.white,
      secondaryLabel: "TNR",
      interpretation:
        "Maximising aggregate accuracy lets each group keep thresholds closer to their own base rates, so TPR/TNR diverge. The system scores well on the headline number while who receives which kind of error stays uneven.",
    };
  }

  if (metricId === "ppv-high-risk") {
    const ppvGap = disparityFor(fairness, "ppv", workNightIndex);
    const ppv = pairFromDisparity(0.6, ppvGap / 100, s);

    if (fairness === "predictive_parity") {
      return {
        outcome: "win",
        black: ppv.black,
        white: ppv.white,
        interpretation:
          "Constraining equal PPV among high‑risk scores is a lighter distortion than equalising full error rates, so accuracy stays higher than under equal error rates — but you still accept unequal FPR/FNR as the price of calibration.",
      };
    }
    if (fairness === "equal_rates") {
      return {
        outcome: "warn",
        black: ppv.black,
        white: ppv.white,
        interpretation:
          "Equal error rates do not guarantee equal PPV when base rates differ — high‑risk flags can mean different things by group. That is the other half of the fairness impossibility story, visible once you look past TPR/TNR.",
      };
    }
    return {
      outcome: "neutral",
      black: ppv.black,
      white: ppv.white,
      interpretation:
        "With no fairness constraint, PPV gaps are moderate: the model is not trying to equalise calibration, only to maximise correct calls. Accuracy looks strong while high‑risk slices still diverge somewhat.",
    };
  }

  // accuracy-overall — must match HUD daily accuracy (±0.5%)
  const acc = accuracyStudyValues(dailyAccuracyPct, s);
  if (fairness === "max_accuracy") {
    return {
      outcome: "win",
      black: acc.black,
      white: acc.white,
      interpretation:
        "With no fairness constraint, the model freely optimises its decision boundary for overall accuracy. That is why this figure is highest — and why error‑rate studies still show large group gaps.",
    };
  }
  if (fairness === "equal_rates") {
    return {
      outcome: "neutral",
      black: acc.black,
      white: acc.white,
      interpretation:
        "Equalising TPR and TNR across groups with different base rates forces systematically suboptimal thresholds — the harshest accuracy cost of the three metrics, consistent with Chouldechova's impossibility theorem.",
    };
  }
  return {
    outcome: "neutral",
    black: acc.black,
    white: acc.white,
    interpretation:
      "Predictive parity constrains only PPV equality, which distorts the boundary less than full error‑rate parity. Accuracy sits between max‑accuracy and equal‑rates — a real tradeoff, not a tie.",
  };
}

export function generateStudyResult(
  metricId: StudyMetricId,
  fairness: FairnessDefinitionId,
  workNightIndex: number,
  launchIndex: number,
  dailyAccuracyPct: number,
): StudyResult {
  const seed = studySeed(workNightIndex, metricId, launchIndex, fairness);
  const p = profileForMetric(metricId, fairness, workNightIndex, seed, dailyAccuracyPct);
  return { metricId, ...p };
}

export function resolveDayStudies(
  studiesQueued: StudyMetricId[],
  metricActive: FairnessDefinitionId,
  workNightIndex: number,
  dailyAccuracyPct: number,
): StudyResult[] {
  return studiesQueued.map((metricId, launchIndex) =>
    generateStudyResult(metricId, metricActive, workNightIndex, launchIndex, dailyAccuracyPct),
  );
}
