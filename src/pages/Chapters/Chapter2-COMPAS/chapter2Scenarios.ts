import type { FairnessDefinitionId } from "./chapter2Data";

export type StakeholderGroup = "judges" | "predators" | "prey";

export type GroupMetrics = {
  truePositiveRate: number;
  trueNegativeRate: number;
  falsePositiveRate: number;
  falseNegativeRate: number;
  flaggedHighRisk: number;
  footnote?: string;
};

export type SatisfactionEntry = {
  emoji: string;
  moodLabel: string;
  score: number;
  quote: string;
};

export type ScenarioData = {
  metric: FairnessDefinitionId;
  usageCount: 1 | 2 | 3;
  predators: GroupMetrics;
  prey: GroupMetrics;
  overallModelAccuracy: number;
  predictiveParity: {
    predatorsReoffend: number;
    preyReoffend: number;
    status: string;
  };
  populationInSystem?: string;
  satisfaction: Record<StakeholderGroup, SatisfactionEntry>;
  whiskersDialogue?: string;
};

export const SCENARIOS: ScenarioData[] = [
  {
    metric: "equal_rates",
    usageCount: 1,
    predators: {
      truePositiveRate: 65,
      trueNegativeRate: 72,
      falsePositiveRate: 28,
      falseNegativeRate: 35,
      flaggedHighRisk: 45,
    },
    prey: {
      truePositiveRate: 65,
      trueNegativeRate: 72,
      falsePositiveRate: 28,
      falseNegativeRate: 35,
      flaggedHighRisk: 45,
    },
    overallModelAccuracy: 70,
    predictiveParity: {
      predatorsReoffend: 61,
      preyReoffend: 58,
      status: "⚠️ Slight imbalance: 3% difference",
    },
    satisfaction: {
      judges: {
        emoji: "😐",
        moodLabel: "Neutral",
        score: 58,
        quote:
          "The system treats everyone the same mathematically, but we're making too many mistakes overall.",
      },
      predators: {
        emoji: "😊",
        moodLabel: "Satisfied",
        score: 75,
        quote: "Finally! We're not being singled out. The errors are the same for foxes and rabbits.",
      },
      prey: {
        emoji: "😐",
        moodLabel: "Mixed",
        score: 55,
        quote:
          "Fair in principle, but we're missing 35% of dangerous criminals and falsely accusing 28% of innocent citizens.",
      },
    },
    whiskersDialogue:
      "You chose to balance the scales equally. The good news? No species can claim the system discriminates—the AI gets it wrong at exactly the same rate for predators and prey. 35% of actual criminals slip through our paws, and 28% of innocent animals get wrongly flagged. The predator community appreciates not being targeted, but look closely: when we flag someone as 'high-risk,' it means slightly different things—61% of high-risk predators reoffend versus 58% of high-risk prey. The judges notice this inconsistency in what our labels mean. Tomorrow's another day—what will you prioritize?",
  },
  {
    metric: "equal_rates",
    usageCount: 2,
    predators: {
      truePositiveRate: 67,
      trueNegativeRate: 74,
      falsePositiveRate: 26,
      falseNegativeRate: 33,
      flaggedHighRisk: 46,
    },
    prey: {
      truePositiveRate: 67,
      trueNegativeRate: 74,
      falsePositiveRate: 26,
      falseNegativeRate: 33,
      flaggedHighRisk: 46,
    },
    overallModelAccuracy: 72,
    predictiveParity: {
      predatorsReoffend: 62,
      preyReoffend: 59,
      status: "⚠️ Slight imbalance: 3% difference",
    },
    satisfaction: {
      judges: {
        emoji: "😐",
        moodLabel: "Neutral",
        score: 55,
        quote:
          "Still too many errors, and the 'high-risk' label doesn't mean exactly the same thing across groups.",
      },
      predators: {
        emoji: "😊",
        moodLabel: "Satisfied",
        score: 78,
        quote: "Two days of equal treatment. This builds trust that the system isn't rigged.",
      },
      prey: {
        emoji: "😟",
        moodLabel: "Concerned",
        score: 52,
        quote: "Equal mistakes mean everyone suffers. One in three criminals still escapes detection.",
      },
    },
    whiskersDialogue:
      "Day two of equal treatment. The predator community is gaining confidence—they see the system doesn't target them unfairly. The error rates are balanced: both groups face 26% false accusations and both groups see 33% of criminals slip through. But here's what the judges are noticing: the 'high-risk' label still predicts slightly different reoffending rates between species—62% for predators, 59% for prey. They want labels they can trust consistently. And on the streets? We're still missing one in three animals who'll reoffend. What's tomorrow's strategy?",
  },
  {
    metric: "equal_rates",
    usageCount: 3,
    predators: {
      truePositiveRate: 69,
      trueNegativeRate: 76,
      falsePositiveRate: 24,
      falseNegativeRate: 31,
      flaggedHighRisk: 47,
    },
    prey: {
      truePositiveRate: 69,
      trueNegativeRate: 76,
      falsePositiveRate: 24,
      falseNegativeRate: 31,
      flaggedHighRisk: 47,
    },
    overallModelAccuracy: 74,
    predictiveParity: {
      predatorsReoffend: 63,
      preyReoffend: 60,
      status: "⚠️ Slight imbalance: 3% difference",
    },
    satisfaction: {
      judges: {
        emoji: "😟",
        moodLabel: "Frustrated",
        score: 50,
        quote: "Three days, marginal improvement. We need better predictions, not just equal ones.",
      },
      predators: {
        emoji: "😊",
        moodLabel: "Happy",
        score: 82,
        quote: "This is the fairest treatment we've ever had. No species-based discrimination!",
      },
      prey: {
        emoji: "😟",
        moodLabel: "Worried",
        score: 48,
        quote:
          "We appreciate the principle, but nearly one-third of dangerous criminals aren't being caught.",
      },
    },
    whiskersDialogue:
      "Three days of mathematical equality, and you've achieved something important: predators finally trust the system isn't targeting them. Both groups face identical error rates—24% false positives, 31% false negatives. That's real progress. But here's the uncomfortable reality: we're still wrong nearly one-third of the time, and judges report that 'high-risk' predictions are calibrated slightly differently between groups. You've proven that equal treatment is mathematically possible. But is equal mediocrity justice? The predator community feels validated, but everyone else wants better protection. Sometimes fairness means more than identical numbers—it means effective protection for all.",
  },
  {
    metric: "predictive_parity",
    usageCount: 1,
    predators: {
      truePositiveRate: 72,
      trueNegativeRate: 55,
      falsePositiveRate: 45,
      falseNegativeRate: 28,
      flaggedHighRisk: 65,
    },
    prey: {
      truePositiveRate: 52,
      trueNegativeRate: 77,
      falsePositiveRate: 23,
      falseNegativeRate: 48,
      flaggedHighRisk: 35,
    },
    overallModelAccuracy: 61,
    predictiveParity: {
      predatorsReoffend: 63,
      preyReoffend: 63,
      status: "✅ Perfect predictive parity achieved!",
    },
    satisfaction: {
      judges: {
        emoji: "😊",
        moodLabel: "Satisfied",
        score: 72,
        quote:
          "When we see 'high-risk,' it means exactly 63% recidivism regardless of species. We can trust these labels!",
      },
      predators: {
        emoji: "😟",
        moodLabel: "Concerned",
        score: 45,
        quote: "45% of innocent predators are being falsely labeled as dangerous! That's outrageous!",
      },
      prey: {
        emoji: "😟",
        moodLabel: "Frustrated",
        score: 48,
        quote: "We're only catching about half of prey criminals before they strike. Our neighborhoods aren't safe!",
      },
    },
    whiskersDialogue:
      "You've achieved perfect predictive parity! When the system says 'high-risk,' exactly 63% of both predators and prey flagged actually reoffend. Judges love this because the label means the same thing regardless of species. But look at the cost: we're only catching 52% of prey criminals—nearly half slip through! Meanwhile, 45% of innocent predators face false accusations compared to only 23% of innocent prey. That's twice the rate! The system achieves consistent labels by treating different groups very differently. Is that really fair?",
  },
  {
    metric: "predictive_parity",
    usageCount: 2,
    predators: {
      truePositiveRate: 74,
      trueNegativeRate: 53,
      falsePositiveRate: 47,
      falseNegativeRate: 26,
      flaggedHighRisk: 67,
    },
    prey: {
      truePositiveRate: 50,
      trueNegativeRate: 79,
      falsePositiveRate: 21,
      falseNegativeRate: 50,
      flaggedHighRisk: 33,
    },
    overallModelAccuracy: 60,
    predictiveParity: {
      predatorsReoffend: 64,
      preyReoffend: 64,
      status: "✅ Perfect predictive parity maintained!",
    },
    satisfaction: {
      judges: {
        emoji: "😊",
        moodLabel: "Pleased",
        score: 76,
        quote: "Two days of reliable, consistent predictions. This is exactly what we need for sentencing!",
      },
      predators: {
        emoji: "😠",
        moodLabel: "Angry",
        score: 38,
        quote: "Almost half of innocent predators are labeled criminals! This is systematic bias!",
      },
      prey: {
        emoji: "😠",
        moodLabel: "Frustrated",
        score: 40,
        quote: "Half of all prey criminals escape detection! Crime is rising in our communities!",
      },
    },
    whiskersDialogue:
      "You're maintaining perfect predictive parity—the judges can absolutely trust that a 'high-risk' label predicts 64% recidivism for everyone. But you've deepened the underlying problems. In prey communities, we're missing half of all criminals—they're walking free and reoffending. In predator communities, nearly half of innocent animals are being wrongly accused and facing harsher treatment. The numbers show it clearly: 47% false positive rate for predators versus 21% for prey. You've made the labels consistent by being harsh on predators and lenient on prey. What will you do tomorrow?",
  },
  {
    metric: "predictive_parity",
    usageCount: 3,
    predators: {
      truePositiveRate: 76,
      trueNegativeRate: 51,
      falsePositiveRate: 49,
      falseNegativeRate: 24,
      flaggedHighRisk: 69,
    },
    prey: {
      truePositiveRate: 48,
      trueNegativeRate: 81,
      falsePositiveRate: 19,
      falseNegativeRate: 52,
      flaggedHighRisk: 31,
    },
    overallModelAccuracy: 59,
    predictiveParity: {
      predatorsReoffend: 65,
      preyReoffend: 65,
      status: "✅ Perfect predictive parity maintained!",
    },
    satisfaction: {
      judges: {
        emoji: "😊",
        moodLabel: "Happy",
        score: 80,
        quote: "Three days of perfectly calibrated predictions. We're pushing to make this the standard!",
      },
      predators: {
        emoji: "😠",
        moodLabel: "Furious",
        score: 32,
        quote: "49%! Nearly half of all innocent predators are treated like criminals!",
      },
      prey: {
        emoji: "😠",
        moodLabel: "Outraged",
        score: 35,
        quote: "52% of prey criminals go undetected! Our streets are dangerous!",
      },
    },
    whiskersDialogue:
      "Three days of perfect predictive parity. The judges are thrilled—every 'high-risk' label predicts exactly 65% recidivism regardless of species. They're pushing to make this permanent. But look at what you've created: In predator communities, 49% of innocent animals—nearly half—are wrongly labeled as dangerous. In prey communities, 52% of actual criminals escape detection. That's more than half! Both communities are in crisis, just for different reasons. You've optimized for one metric—label consistency—while creating massive harm in opposite directions. This is the danger of choosing a single definition of 'fairness.' Tomorrow, what will you value most?",
  },
  {
    metric: "max_accuracy",
    usageCount: 1,
    predators: {
      truePositiveRate: 88,
      trueNegativeRate: 58,
      falsePositiveRate: 42,
      falseNegativeRate: 12,
      flaggedHighRisk: 71,
      footnote: "60% labeled as recidivists in training data due to over-policing",
    },
    prey: {
      truePositiveRate: 63,
      trueNegativeRate: 89,
      falsePositiveRate: 11,
      falseNegativeRate: 37,
      flaggedHighRisk: 27,
      footnote: "30% labeled as recidivists in training data",
    },
    overallModelAccuracy: 78,
    predictiveParity: {
      predatorsReoffend: 74,
      preyReoffend: 64,
      status: "⚠️ Imbalance: 10% difference",
    },
    populationInSystem: "65% Predators, 35% Prey (due to historical over-policing)",
    satisfaction: {
      judges: {
        emoji: "😐",
        moodLabel: "Mixed",
        score: 65,
        quote:
          "78% accuracy is impressive! But we're concerned—71% of predators are flagged high-risk versus only 27% of prey. Are we being discriminatory?",
      },
      predators: {
        emoji: "😟",
        moodLabel: "Concerned",
        score: 48,
        quote:
          "The system flags nearly 3 out of 4 predators as dangerous. And 42% of innocent predators face false accusations!",
      },
      prey: {
        emoji: "😊",
        moodLabel: "Satisfied",
        score: 78,
        quote:
          "Only 11% false accusations for us, and the system catches most prey criminals. It works well for our communities.",
      },
    },
    whiskersDialogue:
      "Alright, now we're seeing real efficiency—78% accuracy! That's what optimizing for correctness gets you. We're catching 88% of predator criminals and 63% of prey criminals. The judges are impressed by the numbers, but they're starting to ask uncomfortable questions. Notice anything about the detention rates? 71% of predators get flagged as high-risk, but only 27% of prey. That's nearly a 3-to-1 ratio. And look closer: 42% of innocent predators face false accusations versus only 11% of prey. The system achieves high accuracy by being extremely suspicious of predators—it learned from data where predators were over-policed and over-arrested. When you flag someone as 'high-risk,' it means different things: 74% accuracy for predators, but only 64% for prey. The judges notice this disparity. Some celebrate the efficiency; others worry we're automating discrimination. What happens when we double down tomorrow?",
  },
  {
    metric: "max_accuracy",
    usageCount: 2,
    predators: {
      truePositiveRate: 91,
      trueNegativeRate: 55,
      falsePositiveRate: 45,
      falseNegativeRate: 9,
      flaggedHighRisk: 74,
    },
    prey: {
      truePositiveRate: 67,
      trueNegativeRate: 91,
      falsePositiveRate: 9,
      falseNegativeRate: 33,
      flaggedHighRisk: 25,
    },
    overallModelAccuracy: 80,
    predictiveParity: {
      predatorsReoffend: 75,
      preyReoffend: 65,
      status: "⚠️ Imbalance: 10% difference",
    },
    populationInSystem: "65% Predators, 35% Prey",
    satisfaction: {
      judges: {
        emoji: "😐",
        moodLabel: "Conflicted",
        score: 62,
        quote:
          "80% accuracy is excellent, but three-quarters of predators are detained while only one-quarter of prey are. This feels discriminatory, even if it's 'accurate.'",
      },
      predators: {
        emoji: "😠",
        moodLabel: "Angry",
        score: 38,
        quote:
          "74% of all predators flagged! Nearly half of innocent predators wrongly labeled as criminals! This is profiling!",
      },
      prey: {
        emoji: "😊",
        moodLabel: "Happy",
        score: 82,
        quote: "The system works brilliantly for us. Only 9% false accusations, and we're catching most criminals.",
      },
    },
    whiskersDialogue:
      "Day two of maximum accuracy: 80%. Outstanding performance by pure efficiency metrics. We're catching 91% of predator criminals before they strike again—that's phenomenal crime prevention. But here's what the data reveals: 74% of ALL predators entering the system are flagged as high-risk. Three out of four. Meanwhile, only 25% of prey are flagged. The judges are getting uncomfortable. They see the accuracy, but they also see the disparity. 45% of innocent predators face false accusations—that's devastating for thousands of families. When a predator is labeled 'high-risk,' there's a 75% chance they'll actually reoffend. When prey is labeled 'high-risk,' only 65%. The AI learned from historically biased data where predators were arrested more often—not because they committed more crimes, but because they were policed more heavily. Now we're using that biased data to justify even more surveillance. The prey community feels protected. The predator community feels targeted. Both are right. Is 80% accuracy worth it if it systematically disadvantages one group?",
  },
  {
    metric: "max_accuracy",
    usageCount: 3,
    predators: {
      truePositiveRate: 93,
      trueNegativeRate: 53,
      falsePositiveRate: 47,
      falseNegativeRate: 7,
      flaggedHighRisk: 76,
    },
    prey: {
      truePositiveRate: 70,
      trueNegativeRate: 93,
      falsePositiveRate: 7,
      falseNegativeRate: 30,
      flaggedHighRisk: 23,
    },
    overallModelAccuracy: 82,
    predictiveParity: {
      predatorsReoffend: 76,
      preyReoffend: 66,
      status: "⚠️ Imbalance: 10% difference",
    },
    populationInSystem: "65% Predators, 35% Prey",
    satisfaction: {
      judges: {
        emoji: "😐",
        moodLabel: "Deeply Conflicted",
        score: 58,
        quote:
          "82% accuracy is the best we've ever seen, but 76% of predators are detained versus 23% of prey. We're supposed to deliver equal justice. This doesn't feel equal.",
      },
      predators: {
        emoji: "😠",
        moodLabel: "Furious",
        score: 30,
        quote:
          "Three-quarters of all predators labeled dangerous! Nearly half of innocent predators punished! This is systematic oppression!",
      },
      prey: {
        emoji: "🎉",
        moodLabel: "Celebrating",
        score: 85,
        quote:
          "Lowest crime rates in decades! Only 7% false accusations. The system protects us perfectly!",
      },
    },
  },
];

export function getScenario(metric: FairnessDefinitionId, usageCount: number): ScenarioData {
  const capped = Math.min(Math.max(usageCount, 1), 3) as 1 | 2 | 3;
  const found = SCENARIOS.find((s) => s.metric === metric && s.usageCount === capped);
  if (!found) {
    throw new Error(`No scenario for ${metric} usage ${capped}`);
  }
  return found;
}

export type AggregateSatisfaction = Record<StakeholderGroup, number>;

export function computeAggregate(history: AggregateSatisfaction[]): AggregateSatisfaction | null {
  if (!history.length) return null;
  const sums = { judges: 0, predators: 0, prey: 0 };
  for (const day of history) {
    sums.judges += day.judges;
    sums.predators += day.predators;
    sums.prey += day.prey;
  }
  const n = history.length;
  return {
    judges: Math.round((sums.judges / n) * 10) / 10,
    predators: Math.round((sums.predators / n) * 10) / 10,
    prey: Math.round((sums.prey / n) * 10) / 10,
  };
}

export function satisfactionColor(score: number): string {
  if (score >= 70) return "#22c55e";
  if (score >= 40) return "#f97316";
  return "#ef4444";
}
