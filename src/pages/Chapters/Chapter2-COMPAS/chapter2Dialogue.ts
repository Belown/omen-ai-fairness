import type { FairnessDefinitionId, StudyMetricId } from "./chapter2Data";

export type DialogueFragment =
  | { always: true; text: string }
  | { requires: StudyMetricId; text: string };

function key(metric: FairnessDefinitionId, usageCount: 1 | 2 | 3): string {
  return `${metric}-${usageCount}`;
}

const DIALOGUE_BY_SCENARIO: Record<string, DialogueFragment[]> = {
  [key("equal_rates", 1)]: [
    { always: true, text: "I chose to balance the scales equally." },
    {
      always: true,
      text: "The good news? No species can claim the system discriminates—I get it wrong at exactly the same rate for predators and prey.",
    },
    {
      requires: "study_error_rates",
      text: "35% of actual criminals slip through my paws, and 28% of innocent animals get wrongly flagged.",
    },
    { always: true, text: "The predator community appreciates not being targeted, but looking closely:" },
    {
      requires: "study_predictive_parity",
      text: "when I flag someone as 'high-risk,' it means slightly different things—61% of high-risk predators reoffend versus 58% of high-risk prey.",
    },
    {
      requires: "study_predictive_parity",
      text: "The judges notice this inconsistency in what my labels mean.",
    },
    { always: true, text: "Tomorrow's another day—what will I prioritize?" },
  ],
  [key("equal_rates", 2)]: [
    { always: true, text: "Day two of my equal treatment approach." },
    {
      always: true,
      text: "The predator community is gaining confidence—they see my system doesn't target them unfairly.",
    },
    {
      requires: "study_error_rates",
      text: "My error rates are balanced: both groups face 26% false accusations and both groups see 33% of criminals slip through.",
    },
    {
      requires: "study_predictive_parity",
      text: "But here's what the judges are noticing: my 'high-risk' label still predicts slightly different reoffending rates between species—62% for predators, 59% for prey.",
    },
    {
      requires: "study_predictive_parity",
      text: "They want labels they can trust consistently.",
    },
    {
      requires: "study_error_rates",
      text: "And on the streets? I'm still missing one in three animals who'll reoffend.",
    },
    { always: true, text: "What's my strategy for tomorrow?" },
  ],
  [key("equal_rates", 3)]: [
    {
      always: true,
      text: "Three days of mathematical equality, and I've achieved something important: predators finally trust the system isn't targeting them.",
    },
    {
      requires: "study_error_rates",
      text: "Both groups face identical error rates—24% false positives, 31% false negatives. That's real progress.",
    },
    { always: true, text: "But here's the uncomfortable reality:" },
    {
      requires: "study_error_rates",
      text: "I'm still wrong nearly one-third of the time,",
    },
    {
      requires: "study_predictive_parity",
      text: "and judges report that my 'high-risk' predictions are calibrated slightly differently between groups.",
    },
    {
      always: true,
      text: "I've proven that equal treatment is mathematically possible. But is equal mediocrity justice? The predator community feels validated, but everyone else wants better protection. Sometimes fairness means more than identical numbers—it means effective protection for all.",
    },
  ],
  [key("predictive_parity", 1)]: [
    { always: true, text: "I've achieved perfect predictive parity!" },
    {
      requires: "study_predictive_parity",
      text: "When I say 'high-risk,' exactly 63% of both predators and prey flagged actually reoffend.",
    },
    {
      always: true,
      text: "Judges love this because my label means the same thing regardless of species.",
    },
    { always: true, text: "But look at the cost:" },
    {
      requires: "study_error_rates",
      text: "I'm only catching 52% of prey criminals—nearly half slip through!",
    },
    {
      requires: "study_error_rates",
      text: "Meanwhile, 45% of innocent predators face false accusations compared to only 23% of innocent prey. That's twice the rate!",
    },
    {
      always: true,
      text: "I achieve consistent labels by treating different groups very differently. Is that really fair?",
    },
  ],
  [key("predictive_parity", 2)]: [
    { always: true, text: "I'm maintaining perfect predictive parity—" },
    {
      requires: "study_predictive_parity",
      text: "the judges can absolutely trust that my 'high-risk' label predicts 64% recidivism for everyone.",
    },
    { always: true, text: "But I've deepened the underlying problems." },
    {
      requires: "study_error_rates",
      text: "In prey communities, I'm missing half of all criminals—they're walking free and reoffending.",
    },
    {
      requires: "study_error_rates",
      text: "In predator communities, nearly half of innocent animals are being wrongly accused and facing harsher treatment.",
    },
    {
      requires: "study_error_rates",
      text: "The numbers show it clearly: 47% false positive rate for predators versus 21% for prey.",
    },
    {
      always: true,
      text: "I've made my labels consistent by being harsh on predators and lenient on prey. What will I do tomorrow?",
    },
  ],
  [key("predictive_parity", 3)]: [
    { always: true, text: "Three days of perfect predictive parity." },
    {
      requires: "study_predictive_parity",
      text: "The judges are thrilled—every 'high-risk' label I give predicts exactly 65% recidivism regardless of species. They're pushing to make this permanent.",
    },
    { always: true, text: "But look at what I've created:" },
    {
      requires: "study_error_rates",
      text: "In predator communities, 49% of innocent animals—nearly half—are wrongly labeled as dangerous.",
    },
    {
      requires: "study_error_rates",
      text: "In prey communities, 52% of actual criminals escape my detection. That's more than half!",
    },
    {
      always: true,
      text: "Both communities are in crisis, just for different reasons. I've optimized for one metric—label consistency—while creating massive harm in opposite directions. This is the danger of choosing a single definition of 'fairness.' Tomorrow, what will I value most?",
    },
  ],
  [key("max_accuracy", 1)]: [
    {
      requires: "study_accuracy",
      text: "Alright, now I'm seeing real efficiency—78% accuracy! That's what optimizing for correctness gets me.",
    },
    {
      requires: "study_error_rates",
      text: "I'm catching 88% of predator criminals and 63% of prey criminals.",
    },
    {
      always: true,
      text: "The judges are impressed by the numbers, but they're starting to ask uncomfortable questions.",
    },
    {
      requires: "study_error_rates",
      text: "Notice anything about the detention rates? 71% of predators get flagged as high-risk, but only 27% of prey. That's nearly a 3-to-1 ratio.",
    },
    {
      requires: "study_error_rates",
      text: "And look closer: 42% of innocent predators face false accusations versus only 11% of prey.",
    },
    {
      always: true,
      text: "I achieve high accuracy by being extremely suspicious of predators—I learned from data where predators were over-policed and over-arrested.",
    },
    {
      requires: "study_predictive_parity",
      text: "When I flag someone as 'high-risk,' it means different things: 74% accuracy for predators, but only 64% for prey. The judges notice this disparity.",
    },
    {
      always: true,
      text: "Some celebrate my efficiency; others worry I'm automating discrimination. What happens when I double down tomorrow?",
    },
  ],
  [key("max_accuracy", 2)]: [
    {
      requires: "study_accuracy",
      text: "Day two of maximum accuracy: 80%. Outstanding performance by pure efficiency metrics.",
    },
    {
      requires: "study_error_rates",
      text: "I'm catching 91% of predator criminals before they strike again—that's phenomenal crime prevention.",
    },
    { always: true, text: "But here's what the data reveals:" },
    {
      requires: "study_error_rates",
      text: "74% of ALL predators entering the system are flagged as high-risk. Three out of four. Meanwhile, only 25% of prey are flagged.",
    },
    {
      always: true,
      text: "The judges are getting uncomfortable. They see my accuracy, but they also see the disparity.",
    },
    {
      requires: "study_error_rates",
      text: "45% of innocent predators face false accusations—that's devastating for thousands of families.",
    },
    {
      requires: "study_predictive_parity",
      text: "When I label a predator 'high-risk,' there's a 75% chance they'll actually reoffend. When I label prey 'high-risk,' only 65%.",
    },
    {
      always: true,
      text: "I learned from historically biased data where predators were arrested more often—not because they committed more crimes, but because they were policed more heavily. Now I'm using that biased data to justify even more surveillance. The prey community feels protected. The predator community feels targeted. Both are right. Is 80% accuracy worth it if it systematically disadvantages one group?",
    },
  ],
};

/** Scenario 9 (max_accuracy, 3rd use) has no dialogue — returns null. */
export function buildScenarioDialogue(
  metric: FairnessDefinitionId,
  usageCount: number,
  studiesQueued: StudyMetricId[],
): string | null {
  if (metric === "max_accuracy" && usageCount >= 3) {
    return null;
  }

  const capped = Math.min(Math.max(usageCount, 1), 3) as 1 | 2 | 3;
  const fragments = DIALOGUE_BY_SCENARIO[key(metric, capped)];
  if (!fragments) return null;

  const commissioned = new Set(studiesQueued);
  const visible = fragments.filter(
    (f) => ("always" in f && f.always) || ("requires" in f && commissioned.has(f.requires)),
  );

  if (!visible.length) return null;
  return visible.map((f) => f.text).join(" ");
}
