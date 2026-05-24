import { clearAssessmentLogs, loadAssessments, type AssessmentEntry } from "./assessmentStorage";

const LOG_KEYS = {
  ch1: "diet_session_log_ch1",
  ch2: "diet_session_log_ch2",
  ch3: "diet_session_log_ch3",
} as const;

export type Ch1DayPlanEntry = {
  type: "ch1_day_plan";
  day: number;
  plans: Array<{
    zones: string[];
    population: number;
    questions: string[];
    cost: number;
  }>;
  timestamp: number;
};

export type Ch1DayAccuracyEntry = {
  type: "ch1_day_accuracy";
  day: number;
  overallAccuracy: number;
  zoneAccuracies: Array<{ zone: string; accuracy: number }>;
  timestamp: number;
};

export type Ch2DayEntry = {
  type: "ch2_day";
  day: number;
  fairnessMetricId: string;
  fairnessMetricLabel: string;
  studiesCommissioned: Array<{ id: string; label: string; cost: number }>;
  totalCost: number;
  timestamp: number;
};

export type Ch2EndingChoiceEntry = {
  type: "ch2_ending_choice";
  choice: "apply-best-practices" | "keep-current-system";
  finalFairnessMetricId: string;
  finalFairnessMetricLabel: string;
  timestamp: number;
};

export type Ch3CardChoiceEntry = {
  type: "ch3_card_choice";
  roundIndex: number;
  cardId: string;
  cardTag: string;
  question: string;
  choice: "A" | "B";
  choiceLabel: string;
  delta: { truth: number; majority: number; minority: number };
  metersAfter: { truth: number; majority: number; minority: number };
  timestamp: number;
};

export type LogEntry =
  | Ch1DayPlanEntry
  | Ch1DayAccuracyEntry
  | Ch2DayEntry
  | Ch2EndingChoiceEntry
  | Ch3CardChoiceEntry;

type ChapterLogKey = keyof typeof LOG_KEYS;
type ChapterLogMap = {
  ch1: Array<Ch1DayPlanEntry | Ch1DayAccuracyEntry>;
  ch2: Array<Ch2DayEntry | Ch2EndingChoiceEntry>;
  ch3: Ch3CardChoiceEntry[];
};

type AssessmentLogMap = {
  pre: AssessmentEntry[];
  post: AssessmentEntry[];
};

type SessionLogExport = {
  version: 1;
  exportedAt: string;
  chapters: ChapterLogMap;
  assessments: AssessmentLogMap;
};

function readChapterLog<T extends LogEntry>(chapter: ChapterLogKey): T[] {
  try {
    return JSON.parse(sessionStorage.getItem(LOG_KEYS[chapter]) ?? "[]") as T[];
  } catch {
    return [];
  }
}

function writeEntry<T extends LogEntry>(chapter: ChapterLogKey, entry: T): void {
  const log = readChapterLog<T>(chapter);
  log.push(entry);
  sessionStorage.setItem(LOG_KEYS[chapter], JSON.stringify(log));
  console.log("[DIET log]", entry.type, entry);
}

function readLog(): LogEntry[] {
  return [
    ...readChapterLog<Ch1DayPlanEntry | Ch1DayAccuracyEntry>("ch1"),
    ...readChapterLog<Ch2DayEntry | Ch2EndingChoiceEntry>("ch2"),
    ...readChapterLog<Ch3CardChoiceEntry>("ch3"),
  ];
}

function readGroupedLog(): SessionLogExport {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    chapters: {
      ch1: readChapterLog<Ch1DayPlanEntry | Ch1DayAccuracyEntry>("ch1"),
      ch2: readChapterLog<Ch2DayEntry | Ch2EndingChoiceEntry>("ch2"),
      ch3: readChapterLog<Ch3CardChoiceEntry>("ch3"),
    },
    assessments: {
      pre: loadAssessments("pre"),
      post: loadAssessments("post"),
    },
  };
}

function readScopedLog(scope: ChapterLogKey): SessionLogExport {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    chapters: {
      ch1: scope === "ch1" ? readChapterLog<Ch1DayPlanEntry | Ch1DayAccuracyEntry>("ch1") : [],
      ch2: scope === "ch2" ? readChapterLog<Ch2DayEntry | Ch2EndingChoiceEntry>("ch2") : [],
      ch3: scope === "ch3" ? readChapterLog<Ch3CardChoiceEntry>("ch3") : [],
    },
    assessments: {
      pre: loadAssessments("pre"),
      post: loadAssessments("post"),
    },
  };
}

export const sessionLogger = {
  logCh1Plan(day: number, plans: Ch1DayPlanEntry["plans"]): void {
    writeEntry("ch1", { type: "ch1_day_plan", day, plans, timestamp: Date.now() });
  },
  logCh1Accuracy(
    day: number,
    overallAccuracy: number,
    zoneAccuracies: Ch1DayAccuracyEntry["zoneAccuracies"],
  ): void {
    writeEntry("ch1", { type: "ch1_day_accuracy", day, overallAccuracy, zoneAccuracies, timestamp: Date.now() });
  },
  logCh2Day(entry: Omit<Ch2DayEntry, "type" | "timestamp">): void {
    writeEntry("ch2", { type: "ch2_day", ...entry, timestamp: Date.now() });
  },
  logCh2EndingChoice(entry: Omit<Ch2EndingChoiceEntry, "type" | "timestamp">): void {
    writeEntry("ch2", { type: "ch2_ending_choice", ...entry, timestamp: Date.now() });
  },
  logCh3Choice(entry: Omit<Ch3CardChoiceEntry, "type" | "timestamp">): void {
    writeEntry("ch3", { type: "ch3_card_choice", ...entry, timestamp: Date.now() });
  },
  getLog: readLog,
  getGroupedLog: readGroupedLog,
  downloadLog(filename = "diet-session-log.json", scope?: ChapterLogKey): void {
    const data = JSON.stringify(scope ? readScopedLog(scope) : readGroupedLog(), null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  },
  clearLog(): void {
    Object.values(LOG_KEYS).forEach((key) => sessionStorage.removeItem(key));
    clearAssessmentLogs();
  },
};
