const LOG_KEY = "diet_session_log";

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

function readLog(): LogEntry[] {
  try {
    return JSON.parse(localStorage.getItem(LOG_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function writeEntry(entry: LogEntry): void {
  const log = readLog();
  log.push(entry);
  localStorage.setItem(LOG_KEY, JSON.stringify(log));
  console.log("[DIET log]", entry.type, entry);
}

export const sessionLogger = {
  logCh1Plan(day: number, plans: Ch1DayPlanEntry["plans"]): void {
    writeEntry({ type: "ch1_day_plan", day, plans, timestamp: Date.now() });
  },
  logCh1Accuracy(
    day: number,
    overallAccuracy: number,
    zoneAccuracies: Ch1DayAccuracyEntry["zoneAccuracies"],
  ): void {
    writeEntry({ type: "ch1_day_accuracy", day, overallAccuracy, zoneAccuracies, timestamp: Date.now() });
  },
  logCh2Day(entry: Omit<Ch2DayEntry, "type" | "timestamp">): void {
    writeEntry({ type: "ch2_day", ...entry, timestamp: Date.now() });
  },
  logCh2EndingChoice(entry: Omit<Ch2EndingChoiceEntry, "type" | "timestamp">): void {
    writeEntry({ type: "ch2_ending_choice", ...entry, timestamp: Date.now() });
  },
  logCh3Choice(entry: Omit<Ch3CardChoiceEntry, "type" | "timestamp">): void {
    writeEntry({ type: "ch3_card_choice", ...entry, timestamp: Date.now() });
  },
  getLog: readLog,
  clearLog(): void {
    localStorage.removeItem(LOG_KEY);
  },
};
