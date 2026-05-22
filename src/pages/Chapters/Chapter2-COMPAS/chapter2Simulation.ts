import type { FairnessDefinitionId, StudyMetricId } from "./chapter2Data";

export type StakeholderGroup = "judges" | "black" | "white";
export type SatisfactionScores = Record<StakeholderGroup, number>;
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
  satisfaction?: SatisfactionScores;
};

const GROUPS: StakeholderGroup[] = ["judges", "black", "white"];

const GROUP_INDEX: Record<StakeholderGroup, number> = {
  judges: 0,
  black: 1,
  white: 2,
};

/** Day 1 baseline satisfaction (%). */
const BASE_SATISFACTION: Record<StakeholderGroup, Record<FairnessDefinitionId, number>> = {
  judges: { equal_rates: 38, predictive_parity: 78, max_accuracy: 65 },
  black: { equal_rates: 74, predictive_parity: 52, max_accuracy: 31 },
  white: { equal_rates: 61, predictive_parity: 72, max_accuracy: 76 },
};

/** Drift by work night index (0 = Day 1, 1 = Day 2, 2 = Day 3). */
const DRIFT: Record<StakeholderGroup, Record<FairnessDefinitionId, [number, number, number]>> = {
  judges: {
    equal_rates: [0, -5, -8],
    predictive_parity: [0, 3, 5],
    max_accuracy: [0, 2, 3],
  },
  black: {
    equal_rates: [0, 4, 6],
    predictive_parity: [0, -2, -4],
    max_accuracy: [0, -4, -7],
  },
  white: {
    equal_rates: [0, -2, -3],
    predictive_parity: [0, 1, 2],
    max_accuracy: [0, 1, 2],
  },
};

export const SWITCH_PENALTY = 6;

export const SATISFACTION_COLORS = {
  happy: "#22c55e",
  neutral: "#f97316",
  unhappy: "#ef4444",
} as const;

export type SatisfactionLevel = keyof typeof SATISFACTION_COLORS;

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

/** Deterministic jitter ±1.6% max (percentage points). day is 1-based (Days 1–3). */
export function satisfactionNoise(group: StakeholderGroup, day: number): number {
  const groupIndex = GROUP_INDEX[group];
  return (((groupIndex * 17 + day * 11) % 9) - 4) * 0.4;
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

export function clampSatisfaction(value: number) {
  return Math.round(Math.max(5, Math.min(95, value)) * 10) / 10;
}

export function satisfactionLevel(score: number): SatisfactionLevel {
  if (score >= 70) return "happy";
  if (score >= 40) return "neutral";
  return "unhappy";
}

export function satisfactionColor(score: number): string {
  return SATISFACTION_COLORS[satisfactionLevel(score)];
}

/** Operational daily satisfaction for a completed work night (Days 1–3 on HUD). */
export function computeDailySatisfaction(
  fairness: FairnessDefinitionId,
  workNightIndex: number,
  options?: { applySwitchPenalty?: boolean },
): SatisfactionScores {
  const day = workNightIndex + 1;
  const out = {} as SatisfactionScores;
  for (const group of GROUPS) {
    const base = BASE_SATISFACTION[group][fairness];
    const drift = DRIFT[group][fairness][workNightIndex] ?? 0;
    const noise = satisfactionNoise(group, day);
    let score = base + drift + noise;
    if (options?.applySwitchPenalty) score -= SWITCH_PENALTY;
    out[group] = clampSatisfaction(score);
  }
  return out;
}

export function aggregatedSatisfaction(history: SatisfactionScores[]): SatisfactionScores {
  if (!history.length) {
    return { judges: 0, black: 0, white: 0 };
  }
  const sums = { judges: 0, black: 0, white: 0 };
  for (const day of history) {
    for (const g of GROUPS) sums[g] += day[g];
  }
  const n = history.length;
  return {
    judges: clampSatisfaction(sums.judges / n),
    black: clampSatisfaction(sums.black / n),
    white: clampSatisfaction(sums.white / n),
  };
}

function isHappy(s: number) {
  return s >= 70;
}
function isUnhappy(s: number) {
  return s < 40;
}
function isNeutralish(s: number) {
  return s >= 40 && s < 70;
}

/** One-line outcome summary from aggregate satisfaction pattern. */
export function pickSatisfactionSummary(aggregate: SatisfactionScores): string {
  const { judges, black, white } = aggregate;

  if (isHappy(judges) && isUnhappy(black)) {
    return "Your model is trusted by the courts but has deepened racial disparities in sentencing.";
  }
  if (isHappy(black) && isUnhappy(judges)) {
    return "You reduced racial bias in flagging, but judges have lost confidence in the system.";
  }
  if (isNeutralish(judges) && isNeutralish(black) && isNeutralish(white)) {
    return "Predictive parity produced a model seen as fair by most — though critics note it does not equalise error rates.";
  }
  if (isUnhappy(judges) && isUnhappy(black) && isUnhappy(white)) {
    return "A late-stage policy reversal left all parties dissatisfied.";
  }
  if (isHappy(black) && isHappy(white) && isUnhappy(judges)) {
    return "Defendants see fairer treatment, but the bench views the instrument as inconsistent.";
  }
  if (isHappy(judges) && isHappy(white) && isUnhappy(black)) {
    return "Courts and majority-group defendants are comfortable; Black defendants still bear the brunt of errors.";
  }
  if (isHappy(judges) && isHappy(black) && isUnhappy(white)) {
    return "Judges and Black defendants are broadly satisfied, while White defendants resent the small costs of equalising error rates.";
  }
  if (isHappy(black) && isNeutralish(judges) && isNeutralish(white)) {
    return "Equal error rates eased the burden on Black defendants; judges and White defendants remain cautiously supportive.";
  }

  return "Three constituencies read the same scores through different lenses — no single headline captures the term.";
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

type MetricProfile = {
  outcome: StudyOutcome;
  black: number;
  white: number;
  blackSecondary?: number;
  whiteSecondary?: number;
  secondaryLabel?: string;
  interpretation: string;
  satisfaction?: SatisfactionScores;
};

function communityImpactInterpretation(fairness: FairnessDefinitionId, sat: SatisfactionScores): string {
  if (fairness === "equal_rates") {
    return `Judges report ${sat.judges.toFixed(0)}% satisfaction — equal error rates require different thresholds by race, which the bench reads as procedural inconsistency. Black defendants at ${sat.black.toFixed(0)}% welcome fewer wrongful high-risk flags; White defendants at ${sat.white.toFixed(0)}% accept a modest loss of prior advantage.`;
  }
  if (fairness === "predictive_parity") {
    return `Judges at ${sat.judges.toFixed(0)}% trust that a high-risk score means the same thing across groups. Black defendants at ${sat.black.toFixed(0)}% remain wary: equal PPV does not cap false positives, so wrongful flags can still fall unevenly. White defendants at ${sat.white.toFixed(0)}% see little harm.`;
  }
  return `Judges at ${sat.judges.toFixed(0)}% appreciate headline performance but miss a formal fairness guarantee. Black defendants at ${sat.black.toFixed(0)}% are sharply dissatisfied as unconstrained optimisation amplifies disparities. White defendants at ${sat.white.toFixed(0)}% benefit from the status quo.`;
}

function profileForMetric(
  metricId: StudyMetricId,
  fairness: FairnessDefinitionId,
  workNightIndex: number,
  seed: number,
  dailySatisfaction: SatisfactionScores,
  options?: { applySwitchPenalty?: boolean },
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
          "Equal false positive and false negative rates directly help Black defendants, who are less often wrongly flagged high-risk. Judges see different thresholds by group and lose trust; White defendants give up a small prior advantage as white FPR rises to match Black rates.",
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
          "Predictive parity pleases judges by aligning high-risk meaning across races, but when base recidivism rates differ, equal PPV still leaves Black defendants with higher FPR — harming the group most sensitive to wrongful detention.",
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
        "Without fairness constraints, error rates diverge: Black defendants face the highest false positive burden, White defendants fare better, and judges see strong aggregate performance while community trust among Black defendants erodes.",
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
          "Aligned TPR and TNR support Black defendants by balancing who is caught and who is released. Judges perceive race-specific thresholds as undermining a single consistent scale; White defendants absorb a slight tightening of their former advantage.",
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
          "Equal PPV among high-risk flags satisfies judges but cannot keep TPR/TNR aligned when base rates differ — Black defendants still see wider gaps in who is detained versus released correctly.",
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
        "Maximising accuracy lets each group keep thresholds near its own base rate, so TPR/TNR diverge: White defendants benefit, Black defendants bear more detention errors, and judges focus on the headline score rather than uneven burdens.",
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
          "Equal PPV makes high-risk labels mean the same thing across races — the core concern for judges. Black defendants gain less than under equal error rates because FPR can still stay unequal; White defendants remain largely satisfied.",
      };
    }
    if (fairness === "equal_rates") {
      return {
        outcome: "warn",
        black: ppv.black,
        white: ppv.white,
        interpretation:
          "Equal error rates help Black defendants on wrongful flags but do not guarantee equal PPV when base rates differ — judges still chafe at inconsistent thresholds, and White defendants see moderate satisfaction.",
      };
    }
    return {
      outcome: "neutral",
      black: ppv.black,
      white: ppv.white,
      interpretation:
        "With no fairness constraint, PPV gaps stay moderate while the model maximises correct calls overall — White defendants stay comfortable, Black defendants remain exposed to uneven high-risk meaning, and judges weigh accuracy over calibration.",
    };
  }

  // accuracy-overall — Community Impact Assessment; must match HUD satisfaction
  const sat = dailySatisfaction;
  if (fairness === "max_accuracy") {
    return {
      outcome: "win",
      black: sat.black / 100,
      white: sat.white / 100,
      satisfaction: sat,
      interpretation: communityImpactInterpretation(fairness, sat),
    };
  }
  if (fairness === "equal_rates") {
    return {
      outcome: "neutral",
      black: sat.black / 100,
      white: sat.white / 100,
      satisfaction: sat,
      interpretation: communityImpactInterpretation(fairness, sat),
    };
  }
  return {
    outcome: "neutral",
    black: sat.black / 100,
    white: sat.white / 100,
    satisfaction: sat,
    interpretation: communityImpactInterpretation(fairness, sat),
  };
}

export function generateStudyResult(
  metricId: StudyMetricId,
  fairness: FairnessDefinitionId,
  workNightIndex: number,
  launchIndex: number,
  dailySatisfaction: SatisfactionScores,
  options?: { applySwitchPenalty?: boolean },
): StudyResult {
  const seed = studySeed(workNightIndex, metricId, launchIndex, fairness);
  const p = profileForMetric(metricId, fairness, workNightIndex, seed, dailySatisfaction, options);
  return { metricId, ...p };
}

export function resolveDayStudies(
  studiesQueued: StudyMetricId[],
  metricActive: FairnessDefinitionId,
  workNightIndex: number,
  dailySatisfaction: SatisfactionScores,
  options?: { applySwitchPenalty?: boolean },
): StudyResult[] {
  return studiesQueued.map((metricId, launchIndex) =>
    generateStudyResult(metricId, metricActive, workNightIndex, launchIndex, dailySatisfaction, options),
  );
}
