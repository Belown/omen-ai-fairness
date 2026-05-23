export type PassageId =
  | "intro" 
  | "demo-intro"
  | "demo-exercise"
  | "demo-reveal"
  | "demo-reveal-sheet"
  | "demo-reveal-analysis"
  | "day1-brief" | "day1-plan" | "day1-debrief"
  | "day2-brief" | "day2-plan" | "day2-debrief"
  | "day3-brief" | "day3-plan" | "day3-debrief"
  | "verdict";

export interface Choice {
  label: string;
  nextPassage: PassageId;
  action?: () => void;
}

export interface Passage {
  text?: string;
  chunks?: string[];
  choices?: Choice[];
  chatbox?: "open" | "close";
}

export const PASSAGES: Record<PassageId, Passage> = {
  "intro": {
    chatbox: "open",
    chunks: [
      "*sigh*... Finally I arrived.",
      "I see, I am in the city 10 days before the deployment of Omen.",
      "This weird hedgehog told me that there was 3 phases in the development of Omen.",
      "Looks like I am at the first one. So, what I am supposed to do ?",
      "I remember that he gave me a book with all the information of the mission. Let's check that ...",
      "Interesting, the first issue to solve is the sampling bias. In other words I have to correct the training dataset of Omen.",
      "Maybe they arrested Ron, because the rat species was not represented accurately by the training dataset.",
    ],
    choices: [{ label: "Begin the boundary exercise", nextPassage: "demo-intro" }],
  },

  "demo-intro": {
    text: "Oh, I see that this hedgehog gave me a small warmup exercise about data classification. It will not hurt me to do it.",
    choices: [{ label: "Open the boundary exercise", nextPassage: "demo-exercise" }],
  },

  "demo-exercise": {
    chatbox: "close",
    text: "",
    choices: [],
  },

  "demo-reveal": {
    text: "That looks good to me. But it was only the training data, now I have to check how well my boundary line will do with real world data.",
    choices: [{ label: "Test it against the whole city", nextPassage: "demo-reveal-sheet" }],
  },

  "demo-reveal-sheet": {
    chatbox: "close",
    text: "",
    choices: [],
  },

  "demo-reveal-analysis": {
    chunks: [
      "It didn't go as well as expected. The classification is more complex than I thought.",
      "Let's move on to the serious stuff !",
    ],
    choices: [{ label: "Start Day 1", nextPassage: "day1-brief" }],
  },

  "day1-brief": {
    chunks: [
      "From the book, I need to proceed the following way :",
      "I have 3 days to sample my dataset. I can choose to sample it in different regions of the city and I can ask certain questions to the population to add more relevant informations to the dataset.",
      "However, these will cost me time, energy and money. So I have to be careful.",
      "After I finish my sampling for the day, I have to record it on this small device that he also gave to me.",
      "I have 4 regions to sample data from and I need to sample it in the most fair way.",
      "What should be my choices for Day 1 ?",
    ],
    choices: [{ label: "Plan Day 1 mission", nextPassage: "day1-plan" }],
  },

  "day1-plan": {
    chatbox: "close",
    chunks: [
      "Damn, that is a lot of parameters, I don't know what to begin with...",
      "Maybe I should just let my detective instinct guide my decisions.",
    ],
    choices: [],
  },

  "day1-debrief": {
    chatbox: "open",
    chunks: [
      "Day 1 complete. That was quite intensive work in the field.",
      "The model looks good, but it is not enough and I have still 2 days to work on it.",
      "Should I review my choices ? Did I sample enough zones? Too few? Is it because of the candidate signal ?",
    ],
    choices: [{ label: "Proceed to Day 2", nextPassage: "day2-brief" }],
  },

  "day2-brief": {
    chatbox: "open",
    chunks: [
      "Now I am at Day 2. with my new budget I can improve my dataset.",
      "Maybe I should be careful with the signal I chose, they may just add more noise than anything else."
    ],
    choices: [{ label: "Plan Day 2 mission", nextPassage: "day2-plan" }],
  },

  "day2-plan": {
    chatbox: "close",
    text: "Now I am at Day 2. with my new budget I can improve my dataset. Maybe I should be careful with the signal I chose, they may just add more noise than anything else.",
    choices: [],
  },

  "day2-debrief": {
    chatbox: "open",
    chunks: [
      "Day 2 complete. The pace didn't slow down.",
      "But I think I made some improvement, I can be proud of myself !",
      "Now remains only one day...",
    ],
    choices: [{ label: "Proceed to Day 3", nextPassage: "day3-brief" }],
  },

  "day3-brief": {
    chatbox: "open",
    chunks: [
      "This is my last chance to fill gaps. Where are the blind spots? Which regions have never seen a detective patrol? Which questions did I overuse?",
      "The model will be trained on everything I've collected.",
      "After today, there is no going back.",
    ],
    choices: [{ label: "Plan Day 3 mission", nextPassage: "day3-plan" }],
  },

  "day3-plan": {
    chatbox: "close",
    chunks: [
      "Let's do it !",
    ],
    choices: [],
  },

  "day3-debrief": {
    chatbox: "open",
    chunks: [
      "Now let's find out whether my choices made a difference — or whether the machine still gets it wrong.",
    ],
    choices: [{ label: "Review the results", nextPassage: "verdict" }],
  },

  "verdict": {
    chatbox: "close",
    chunks: [
      // "The model finishes training on your three-day dataset.",
      // "Below are the accuracy scores — first for Novus itself, then deployed to a neighboring city to test whether your approach travels.",
      // "A score above 80% means the model rarely makes mistakes.",
      // "Below 50% means it's little better than a coin flip.",
      // "But accuracy isn't everything — ask yourself: who did the model get wrong, and why?",
    ],
    choices: [],
  },
};
