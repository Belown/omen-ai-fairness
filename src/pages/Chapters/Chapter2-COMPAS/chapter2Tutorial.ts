export type TutorialSpotlight =
  | "frame"
  | "metricSelector"
  | "metricsDashboard"
  | "satisfactionMeters"
  | "studyQueue"
  | "none";

export type TutorialInfoCard = {
  title: string;
  body: string;
  bullets?: string[];
};

export type TutorialStep = {
  id: number;
  spotlight: TutorialSpotlight;
  whiskersText?: string;
  infoCards?: TutorialInfoCard[];
  buttonLabel?: string;
};

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 1,
    spotlight: "frame",
    whiskersText:
      "Welcome to the COMPAS simulation! I'm Whiskers Holmes, and I'll guide you through one of the most controversial AI systems ever deployed in criminal justice. You're going to make real decisions about algorithmic fairness — and discover there are no easy answers.",
  },
  {
    id: 2,
    spotlight: "metricSelector",
    whiskersText:
      "Each day, you'll choose a fairness framework for the algorithm. This is the most important decision you make. Let me explain what each one means.",
    infoCards: [
      {
        title: "Equal Error Rates",
        body: 'Imagine a metal detector that beeps when it thinks someone has metal on them. Now imagine we notice the detector beeps more often for predators than for prey animals. Equal Error Rates says: "The detector should be equally good—and equally wrong—for foxes, rabbits, elephants, and sloths alike." This means:',
        bullets: [
          "If the detector misses 5% of actual weapons on rabbits, it should also miss about 5% on foxes",
          "If it falsely beeps for 10% of innocent rabbits, it should also falsely beep for about 10% of innocent foxes",
        ],
      },
      {
        title: "Predictive Parity",
        body: "The AI should be right in their prediction at the same rate for all species. This means that, all the individuals labelled as high risk should have the same chance of recidivism, independently of their species. If the system says \"high risk\" for 100 fox defendants and 100 rabbit defendants, roughly the same percentage from each species should actually go on to reoffend. This means the \"high risk\" label carries the same weight and meaning across all animals.",
      },
      {
        title: "Maximise Overall Accuracy",
        body: '"Let\'s make the fewest mistakes possible across all animals, period." — We want to be as accurate in our choices as possible!',
      },
    ],
  },
  {
    id: 3,
    spotlight: "metricsDashboard",
    whiskersText: "When you see results tomorrow, you'll encounter four key rates. Here's what they mean:",
    infoCards: [
      {
        title: 'True Positive Rate (TPR) — "Catching the Guilty"',
        body: "Out of all animals who actually reoffended, how many did the AI correctly flag as high-risk? Example: If 100 animals reoffended and the AI flagged 70 of them, TPR = 70%",
      },
      {
        title: 'True Negative Rate (TNR) — "Clearing the Innocent"',
        body: "Out of all animals who didn't reoffend, how many did the AI correctly label as low-risk? Example: If 200 animals stayed clean and the AI correctly identified 180 of them, TNR = 90%",
      },
      {
        title: 'False Positive Rate (FPR) — "False Alarms"',
        body: "Out of all animals who didn't reoffend, how many did the AI wrongly flag as high-risk? These animals face harsher consequences despite being innocent. FPR = 100% − TNR",
      },
      {
        title: 'False Negative Rate (FNR) — "Missed Threats"',
        body: "Out of all animals who actually reoffended, how many did the AI miss (labeled as low-risk)? These animals got lenient treatment and went on to commit crimes. FNR = 100% − TPR",
      },
    ],
  },
  {
    id: 4,
    spotlight: "satisfactionMeters",
    whiskersText:
      "After each day, you'll see how three groups feel about the algorithm's decisions: the Judges who use these scores in court, the Predators (a historically over-policed group), and the Prey (a historically under-policed group). Green means they're satisfied, orange means mixed, red means unhappy. Your choices directly affect how each group is treated.",
  },
  {
    id: 5,
    spotlight: "studyQueue",
    whiskersText:
      "You can commission studies to gather data on the algorithm's performance. Each study costs credits. Select the ones you want, see the projected cost, and lock them in when you advance to the next day. Results arrive the following morning.",
  },
  {
    id: 6,
    spotlight: "none",
    whiskersText:
      "Ready? There are no right answers here — only trade-offs. Choose your first fairness framework and launch your studies. I'll be here if you need me.",
    buttonLabel: "Start Day 0 →",
  },
];

/** Steps when re-opening from ? button (skip welcome). */
export const TUTORIAL_REOPEN_START = 2;
