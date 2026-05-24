export type EndingPanel =
  | { type: "text"; header?: string; content: string }
  | { type: "section"; header: string; content: string }
  | { type: "list"; header?: string; intro?: string; content?: string; items: string[] }
  | {
      type: "recommendations";
      header: string;
      intro: string;
      items: Array<{ title: string; bullets: string[] }>;
    }
  | { type: "decision" };

export const ENDING_PANELS: EndingPanel[] = [
  {
    type: "text",
    header: "Why fairness still failed",
    content:
      "You've seen three different approaches to fairness, and you've probably noticed something troubling: no matter which metric you chose, someone suffered. That's not a problem with your choices—it's a fundamental mathematical reality.",
  },
  {
    type: "text",
    header: "The data problem",
    content:
      "Let me explain what's really happening here. This AI system you've been testing? It learned from historical crime data. And here's the problem: that data doesn't show us who actually committed crimes. It shows us who got caught.",
  },
  {
    type: "section",
    header: "The Cycle of Biased Data",
    content: `Think about how crime data gets created. Imagine two neighborhoods:

- Meadowlands (mostly prey): Police patrol occasionally, residents feel comfortable reporting crimes, officers give warnings for minor offenses
- Savannah Central (mostly predators): Police patrol heavily due to historical 'high crime' labels, residents distrust police and don't report, officers arrest for minor offenses

What happens next?`,
  },
  {
    type: "list",
    intro: "Savannah Central's arrest records pile up—not necessarily because more crime happens there, but because:",
    items: [
      "More police presence = more crimes detected (even minor ones)",
      "Harsher enforcement = more arrests instead of warnings",
      "Lower trust = witnesses don't report, so police rely on stop-and-searches",
      "Historical reputation = officers are more vigilant, interpreting ambiguous situations as suspicious",
    ],
    content:
      "Meanwhile, Meadowlands has fewer recorded crimes—not because crime doesn't happen, but because less is detected and more is handled informally.",
  },
  {
    type: "section",
    header: "The Self-Fulfilling Prophecy",
    content: "Now you feed this biased historical data into an AI. What does the AI learn?",
  },
  {
    type: "list",
    intro: "'Predators in Savannah Central are high-risk.' So the AI recommends:",
    items: [
      "Harsher sentences for predators",
      "More surveillance in Savannah Central",
      "Stricter conditions for predators on parole",
    ],
    content:
      "And what happens? More predators get caught for violations, more arrests pile up, and next year's data 'confirms' the AI was right. The cycle continues.",
  },
  {
    type: "text",
    content:
      "This is called a feedback loop. The AI's predictions change how we police, which changes what crimes we detect, which changes the data we feed back into the AI. We're not measuring truth—we're measuring the consequences of our own biases.",
  },
  {
    type: "section",
    header: "What This Means for Justice",
    content: `So when someone tells you AI is 'objective' or 'unbiased,' remember:

- The AI learned from biased human decisions
- The AI optimizes patterns that reflect historical injustice
- 'Accuracy' on biased data just means 'accurately reproducing bias'

You can't fix a systemic problem with better math. The math isn't the problem—the world the math learned from is.`,
  },
  {
    type: "recommendations",
    header: "The Path Forward",
    intro: "There is no easy answer, but experts usually return to four habits:",
    items: [
      {
        title: "Question the data",
        bullets: [
          "Where did it come from?",
          "What biases does it encode?",
          "Does it measure reality or police behavior?",
        ],
      },
      {
        title: "Name the trade-offs",
        bullets: [
          "Fairness metrics help some groups and harm others.",
          "Show who benefits and who suffers.",
          "Make value judgments explicit.",
        ],
      },
      {
        title: "Ask whether AI belongs",
        bullets: [
          "Sometimes the fairest system is no algorithmic system.",
          "Human judgment can be questioned, explained, and appealed.",
          "AI can make bias look objective.",
        ],
      },
      {
        title: "Address root causes",
        bullets: [
          "Fix over-policing, not just algorithms.",
          "Invest in communities instead of surveillance.",
          "Break the policing-to-data feedback loop.",
        ],
      },
    ],
  },
  { type: "decision" },
];

export const FINAL_LINE =
  "Thanks for playing, and remember: Anyone can be anything, but algorithms can only be as fair as the world they learned from.";

export const OUTCOME_BEST = {
  title: "Best practices applied",
  body: "You chose to question the data, make trade-offs explicit, and invest in communities—not just tune the algorithm. The courthouse begins auditing how predictions shape policing, not only how accurate they look on paper.",
};

export const OUTCOME_KEEP = {
  title: "Status quo maintained",
  body: "The instrument stays deployed as-is. Efficiency metrics still look strong on spreadsheets, while the feedback loop between biased arrests and biased predictions continues quietly in the background.",
};
