export type AssessmentEntry = {
  mode: "pre" | "post";
  timestamp: string;
  participantName?: string;
  answers: Record<string, string>;
  confidence: Record<string, number>;
  understanding: Record<string, number>;
  feedback?: Record<number, number>;
  openEnded?: Record<number, string>;
};

export type AssessmentDraft = {
  participantName: string;
  answers: Record<string, string>;
  confidence: Record<string, number>;
  understanding: Record<string, number>;
  feedback: Record<number, number>;
  openEnded: Record<number, string>;
};

const STORAGE_KEY_PREFIX = "diet_assessment_log";
const DRAFT_KEY_PREFIX = "diet_assessment_draft";

export const createEmptyAssessmentDraft = (): AssessmentDraft => ({
  participantName: "",
  answers: {},
  confidence: {},
  understanding: {},
  feedback: {},
  openEnded: {},
});

export function saveAssessment(entry: AssessmentEntry): void {
  const all = loadAssessments(entry.mode);
  all.push(entry);
  try {
    sessionStorage.setItem(`${STORAGE_KEY_PREFIX}_${entry.mode}`, JSON.stringify(all));
  } catch {
    console.error("[DIET] Could not persist assessment result to sessionStorage");
  }
  console.log("[DIET] Assessment result logged:", entry);
}

export function loadAssessments(mode: "pre" | "post"): AssessmentEntry[] {
  try {
    const raw = sessionStorage.getItem(`${STORAGE_KEY_PREFIX}_${mode}`);
    return raw ? (JSON.parse(raw) as AssessmentEntry[]) : [];
  } catch {
    return [];
  }
}

export function loadAllAssessments(): AssessmentEntry[] {
  return [...loadAssessments("pre"), ...loadAssessments("post")];
}

export function hasCompleted(mode: "pre" | "post"): boolean {
  return loadAssessments(mode).some((e) => e.mode === mode);
}

export function clearAssessmentLogs(): void {
  sessionStorage.removeItem(`${STORAGE_KEY_PREFIX}_pre`);
  sessionStorage.removeItem(`${STORAGE_KEY_PREFIX}_post`);
}

export function saveAssessmentDraft(mode: "pre" | "post", draft: AssessmentDraft): void {
  try {
    sessionStorage.setItem(`${DRAFT_KEY_PREFIX}_${mode}`, JSON.stringify(draft));
  } catch {
    console.error("[DIET] Could not persist assessment draft to sessionStorage");
  }
}

export function loadAssessmentDraft(mode: "pre" | "post"): AssessmentDraft {
  try {
    const raw = sessionStorage.getItem(`${DRAFT_KEY_PREFIX}_${mode}`);
    return raw ? { ...createEmptyAssessmentDraft(), ...JSON.parse(raw) } : createEmptyAssessmentDraft();
  } catch {
    return createEmptyAssessmentDraft();
  }
}
