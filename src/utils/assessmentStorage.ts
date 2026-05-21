export type AssessmentEntry = {
  mode: "pre" | "post";
  timestamp: string;
  answers: Record<string, string>;
  confidence: Record<string, number>;
  understanding: Record<string, number>;
  feedback?: Record<number, number>;
  openEnded?: Record<number, string>;
};

export type AssessmentDraft = {
  answers: Record<string, string>;
  confidence: Record<string, number>;
  understanding: Record<string, number>;
  feedback: Record<number, number>;
  openEnded: Record<number, string>;
};

const STORAGE_KEY = "diet_assessment_log";
const DRAFT_KEY_PREFIX = "diet_assessment_draft";

export const createEmptyAssessmentDraft = (): AssessmentDraft => ({
  answers: {},
  confidence: {},
  understanding: {},
  feedback: {},
  openEnded: {},
});

export function saveAssessment(entry: AssessmentEntry): void {
  const all = loadAllAssessments();
  all.push(entry);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    console.error("[DIET] Could not persist assessment result to localStorage");
  }
  console.log("[DIET] Assessment result logged:", entry);
}

export function loadAllAssessments(): AssessmentEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AssessmentEntry[]) : [];
  } catch {
    return [];
  }
}

export function hasCompleted(mode: "pre" | "post"): boolean {
  return loadAllAssessments().some((e) => e.mode === mode);
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
