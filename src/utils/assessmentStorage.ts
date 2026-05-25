export type AssessmentDraft = {
  participantName: string;
  answers: Record<string, string>;
  confidence: Record<string, number>;
  understanding: Record<string, number>;
  feedback: Record<number, number>;
  openEnded: Record<number, string>;
  submittedAt?: string;
};

const STORAGE_KEY_PREFIX = "diet_assessment";

const getStorageKey = (mode: "pre" | "post") =>
  `${STORAGE_KEY_PREFIX}_${mode}`;

export const createEmptyAssessmentDraft = (): AssessmentDraft => ({
  participantName: "",
  answers: {},
  confidence: {},
  understanding: {},
  feedback: {},
  openEnded: {},
});

export function hasCompleted(mode: "pre" | "post"): boolean {
  return Boolean(loadAssessmentDraft(mode).submittedAt);
}

export function clearAssessmentStorage(): void {
  sessionStorage.removeItem(getStorageKey("pre"));
  sessionStorage.removeItem(getStorageKey("post"));
}

export function saveAssessmentDraft(mode: "pre" | "post", draft: AssessmentDraft): void {
  try {
    sessionStorage.setItem(getStorageKey(mode), JSON.stringify(draft));
    window.dispatchEvent(new CustomEvent("diet:assessment-updated", { detail: { mode } }));
  } catch {
    console.error("[DIET] Could not persist assessment draft to sessionStorage");
  }
}

export function loadAssessmentDraft(mode: "pre" | "post"): AssessmentDraft {
  try {
    const raw = sessionStorage.getItem(getStorageKey(mode));
    return raw ? { ...createEmptyAssessmentDraft(), ...JSON.parse(raw) } : createEmptyAssessmentDraft();
  } catch {
    return createEmptyAssessmentDraft();
  }
}

// ---------------------------------------------------------------------------
// Chapter results — persisted so that the ending page works after navigating
// away to /post-assessment and back to /chapters?ending=final
// ---------------------------------------------------------------------------

export type PersistedChapterResult = {
  completed: boolean;
  passed: boolean;
  scoreLabel?: string;
  attempts?: number;
};

const CHAPTER_RESULTS_KEY = "diet_chapter_results";

export function saveChapterResults(
  results: Record<string, PersistedChapterResult | null>
): void {
  try {
    sessionStorage.setItem(CHAPTER_RESULTS_KEY, JSON.stringify(results));
  } catch {
    console.error("[DIET] Could not persist chapter results to sessionStorage");
  }
}

export function loadChapterResults(): Record<string, PersistedChapterResult | null> {
  try {
    const raw = sessionStorage.getItem(CHAPTER_RESULTS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}
