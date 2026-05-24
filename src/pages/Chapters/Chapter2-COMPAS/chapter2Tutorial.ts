import type { TutorialStep } from "../Chapter1-SamplingBias/hooks/useTutorial";

export type Chapter2TutorialTarget =
  | "frame"
  | "metricSelector"
  | "metricsDashboard"
  | "satisfactionMeters"
  | "studyQueue";

export const TUTORIAL_STEPS: TutorialStep<Chapter2TutorialTarget>[] = [
  {
    target: "frame",
    title: "Welcome to COMPAS",
    body:
      "You are testing a criminal-justice risk system. Each day you choose what fairness rule the algorithm should follow, then review who benefits and who is harmed by that choice.",
    placement: "auto",
  },
  {
    target: "metricSelector",
    title: "Choose a Fairness Rule",
    body:
      "Equal Error Rates tries to equalise mistakes across species. Predictive Parity tries to make a high-risk label mean the same thing across species. Maximise Overall Accuracy tries to make the fewest total mistakes, even if one group carries more of the burden.",
    placement: "right",
  },
  {
    target: "metricsDashboard",
    title: "Read the Overnight Results",
    body:
      "After each run, this panel reports TPR, TNR, FPR, and FNR. Together they show who the algorithm catches, who it clears, who it falsely alarms, and who it misses.",
    placement: "left",
  },
  {
    target: "satisfactionMeters",
    title: "Compare Stakeholder Reactions",
    body:
      "Judges, predators, and prey judge the same system differently. Green means satisfied, orange means mixed, and red means unhappy. A rule can look fair to one group while still feeling unfair to another.",
    placement: "left",
  },
  {
    target: "studyQueue",
    title: "Commission Studies",
    body:
      "Studies spend credits to reveal more about the algorithm. Pick the evidence you want before advancing the day; the results arrive the next morning.",
    placement: "right",
  },
  {
    target: "frame",
    title: "Start Day 0",
    body:
      "There is no perfect answer here, only trade-offs. Choose your first fairness rule, queue any studies you want, and advance to see what the system does overnight.",
    placement: "auto",
  },
];

/** Steps when re-opening from ? button: skip the welcome frame. */
export const TUTORIAL_REOPEN_START = 1;
