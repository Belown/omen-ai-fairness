/**
 * Adaptive Narrative System
 *
 * The detective's dialogue now reflects the player's actual performance.
 * No two playthroughs read the same — the story bends around the data
 * the player chose to collect.
 *
 * Integration:
 *   1. Import { getAdaptivePassage } from "./adaptivePassages"
 *   2. Replace PASSAGES[passage] calls with getAdaptivePassage(passage, strategy)
 *   3. The "intro", demo passages, and plan passages stay fixed
 *      (they are pre-gameplay or are purely instructional UI states).
 *
 * StrategyResult shape matches what summarizeStrategy() already returns.
 */

import type { Passage, PassageId } from "./staticPassages";
import { PASSAGES } from "./staticPassages";

export interface StrategyResult {
  regionAccs: number[]; // [uptown, downtown, factory, slums] 0-1
  otherCityAccs: number[];
  sampledFlags: boolean[]; // which regions had at least one sample
  committedCount: number;
  usefulSignal?: number;
  noiseSignal?: number;
  biasSignal?: number;
}

type Tier = {
  overallAcc: number; // 0-100
  otherCityOvr: number; // 0-100
  sampledCount: number;
};
type TierLabel = "outstanding" | "great" | "good" | "mediocre" | "poor" | "terrible";

function evalTier(s: StrategyResult): Tier {
  const overallAcc = s.regionAccs.reduce((sum, a) => sum + a, 0) / 4;
  const otherCityOvr = s.otherCityAccs.reduce((sum, a) => sum + a, 0) / 4;
  return {
    overallAcc: Math.round(overallAcc * 100),
    otherCityOvr: Math.round(otherCityOvr * 100),
    sampledCount: s.sampledFlags.filter(Boolean).length,
  };
}

function tierLabel(t: Tier): TierLabel {
  if (t.overallAcc >= 92) return "outstanding";
  if (t.overallAcc >= 78) return "great";
  if (t.overallAcc >= 63) return "good";
  if (t.overallAcc >= 48) return "mediocre";
  if (t.overallAcc >= 33) return "poor";
  return "terrible";
}

function strongestRegion(s: StrategyResult): string {
  let maxI = 0;
  for (let i = 1; i < 4; i++) {
    if ((s.regionAccs[i] ?? 0) > (s.regionAccs[maxI] ?? 0)) maxI = i;
  }
  return ["Uptown", "Downtown", "the Factory Zone", "the Slums"][maxI] ?? "Uptown";
}

function weakestRegion(s: StrategyResult): string {
  let minI = 0;
  for (let i = 1; i < 4; i++) {
    if ((s.regionAccs[i] ?? 0) < (s.regionAccs[minI] ?? 0)) minI = i;
  }
  return ["Uptown", "Downtown", "the Factory Zone", "the Slums"][minI] ?? "the Slums";
}

function unsampledList(s: StrategyResult): string {
  const names = ["Uptown", "Downtown", "the Factory Zone", "the Slums"];
  const missed = names.filter((_, i) => !s.sampledFlags[i]);
  if (!missed.length) return "";
  if (missed.length === 1) return missed[0]!;
  if (missed.length === 2) return `${missed[0]} and ${missed[1]}`;
  return `${missed.slice(0, -1).join(", ")}, and ${missed[missed.length - 1]}`;
}

function questionAnalysis(s: StrategyResult) {
  return {
    usedRoutine: (s.usefulSignal ?? 0) > 0,
    usedPhone:   (s.noiseSignal   ?? 0) > 0,
    usedPolice:  (s.biasSignal    ?? 0) > 0,
  };
}

// ─── ADAPTIVE PASSAGE VARIANTS ────────────────────────────────────────────────

function day1Debrief(s: StrategyResult): Passage {
  const t = evalTier(s);
  const label = tierLabel(t);
  const unsampled = unsampledList(s);
  const q = questionAnalysis(s);
  const chunks: string[] = [];

  // Opening: overall read
  if (label === "outstanding") {
    chunks.push("Day 1 complete. I covered all four districts today — that's the most thorough opening sweep I could have done. I'm already ahead of where the original team ever got.");
  } else if (label === "great") {
    chunks.push("Day 1 complete. I managed three districts in one day. Accuracy is starting to take shape.");
  } else if (label === "good") {
    chunks.push("Day 1 complete. Two districts covered — it's a start. Most of Novus is still outside my dataset, but there's still time.");
  } else if (label === "mediocre") {
    chunks.push("Day 1 complete. I didn't move far enough from familiar ground. The coverage is thin.");
  } else if (label === "poor") {
    chunks.push("Day 1 complete. I spent almost the whole day in a single district — the same narrow sweep that got Ron convicted in the first place.");
  } else {
    chunks.push("Day 1 complete. I barely left Uptown. There's no other way to put it.");
  }

  // Coverage pillar
  if (t.sampledCount === 4) {
    chunks.push("I hit every district. That's the foundation the original team never bothered to lay.");
  } else if (t.sampledCount === 3) {
    chunks.push(`Three out of four districts. ${unsampled} is still a blind spot — and the model is already forming opinions about people it's never seen.`);
  } else if (t.sampledCount === 2) {
    chunks.push(`${unsampled} don't exist in the model's world yet. Two days remain — that gap is absolutely recoverable.`);
  } else {
    chunks.push(`One district, barely. ${unsampled || "Three full districts"} are invisible to the algorithm. Same narrow slice that shattered the original verdict.`);
  }

  // Depth pillar (inferred from tier vs. coverage)
  if (t.sampledCount >= 3 && (label === "outstanding" || label === "great")) {
    chunks.push("I spread the budget across zones rather than pouring it into one familiar neighborhood. The depth looks balanced.");
  } else if (t.sampledCount >= 3 && (label === "mediocre" || label === "poor" || label === "terrible")) {
    chunks.push("Even visiting all four zones, my sample depth is low across the board. Light coverage everywhere still leaves the model guessing.");
  } else if (t.sampledCount <= 2 && (label === "mediocre" || label === "poor" || label === "terrible")) {
    chunks.push(`On top of the coverage problem, the samples I did collect are thin. A small dataset from ${t.sampledCount <= 1 ? "one district" : "two districts"} gives the model anecdotes, not patterns.`);
  }

  // Signal / question variety pillar
  if (q.usedRoutine && !q.usedPhone && !q.usedPolice) {
    chunks.push("Asking about daily routines was the right call. It anchors the model to behavioral patterns — work schedules, shift timings, actual daily life — instead of demographic proxies.");
  } else if (q.usedRoutine && q.usedPhone && !q.usedPolice) {
    chunks.push("Daily routine was useful — it gives real behavioral signal. But the phone model check is noise: it correlates device ownership with suspicion, which really just tracks wealth. I should drop it tomorrow and redirect that 10cr toward more samples.");
  } else if (q.usedRoutine && q.usedPolice) {
    chunks.push("Daily routine is giving me the useful signal. Past police stops, though, brings in historical bias — the model will start replicating old enforcement patterns instead of identifying actual behavior. I need to avoid it tomorrow.");
  } else if (!q.usedRoutine && q.usedPhone && !q.usedPolice) {
    chunks.push("The phone model check records device models, not behaviors. It's noise — I'm teaching the model to sort by income proxy. Tomorrow I should drop it and ask about daily routines instead. That's the question that actually earns its 10cr.");
  } else if (!q.usedRoutine && q.usedPolice) {
    chunks.push("Past police stops introduces bias instead of insight. Historical arrest patterns encode decades of uneven enforcement — the model learns to replicate that, not correct it. I need to replace it with daily routine tomorrow.");
  } else if (q.usedPhone && q.usedPolice) {
    chunks.push("The question mix is working against me. Phone model is noise; past police stops is bias. Neither teaches real behavior. Daily routine is the question worth paying for — I need to include it tomorrow and cut the other two.");
  } else {
    chunks.push("I didn't ask any extra questions this round. Daily routine is worth the 10cr — it gives the model actual work patterns from each district, far more predictive than demographic proxies. I should add it tomorrow.");
  }

  // Next-day suggestion
  if (label === "outstanding") {
    chunks.push("Two days remain. The strategy is working — I just need to keep the breadth and resist the temptation to pile samples into districts I already know well.");
  } else if (label === "great") {
    chunks.push(`Tomorrow: close ${unsampled ? `the gap in ${unsampled} first` : "the depth gap in the weaker zones"}, then deepen where accuracy still lags.`);
  } else {
    chunks.push("Two days remain — this is genuinely recoverable. Tomorrow, I need to spread wider before going deeper. Visiting a new district matters more right now than a fifth patrol in one I've already covered.");
  }

  return {
    chatbox: "open",
    chunks,
    choices: [{ label: "Proceed to Day 2", nextPassage: "day2-brief" }],
  };
}

function day2Brief(s: StrategyResult): Passage {
  const t = evalTier(s);
  const label = tierLabel(t);
  const best = strongestRegion(s);
  const worst = weakestRegion(s);
  const unsampled = unsampledList(s);
  const q = questionAnalysis(s);
  const chunks: string[] = [];

  // Opening: reference yesterday
  if (label === "outstanding") {
    chunks.push("Day 2. Yesterday went better than I expected — all districts covered, accuracy building across the board. I need to make the most of today.");
  } else if (label === "great") {
    chunks.push(`Day 2. Yesterday was solid. ${best} is my strongest district; ${worst} is where I'm still behind. That gap between them is where bias still lives.`);
  } else if (label === "good") {
    chunks.push("Day 2. Yesterday I covered the basics. I have data, but it's not evenly distributed across the city yet.");
  } else if (label === "mediocre") {
    chunks.push("Day 2. I didn't move far enough yesterday. The dataset only shows the parts of the city where I actually walked.");
  } else if (label === "poor") {
    chunks.push("Day 2. I have to be honest with myself — yesterday barely improved on what the original team produced. One district, maybe two. The same narrow sample that built a broken model.");
  } else {
    chunks.push("Day 2. Yesterday was a disaster. One district, almost nothing outside Uptown. The model is essentially still blind.");
  }

  // Coverage status going into day 2
  if (t.sampledCount === 4) {
    chunks.push("I've touched every district already. Today the question is depth — are my sample counts high enough for the model to trust what it's learned?");
  } else if (t.sampledCount === 3) {
    chunks.push(`${unsampled} is still unvisited. That's my highest priority today — a model that has never seen those residents cannot be fair to them.`);
  } else {
    chunks.push(`${unsampled || "Most of the city"} is still invisible to the algorithm. I need to fix the coverage problem before I do anything else today.`);
  }

  // Signal advice going into day 2
  if (q.usedPhone && !q.usedRoutine) {
    chunks.push("The phone model check yesterday added noise without adding clarity. Today I'm swapping it for daily routine — that's the behavioral signal the model actually needs.");
  } else if (q.usedPolice) {
    chunks.push("Past police stops brought historical bias into the dataset yesterday. I'm dropping it today — it teaches the model to replicate old enforcement patterns, not identify real behavior.");
  } else if (!q.usedRoutine) {
    chunks.push("I didn't include daily routine yesterday. I'm adding it today — it's 10cr for actual work-pattern data instead of demographic proxies.");
  } else if (q.usedRoutine && !q.usedPhone && !q.usedPolice) {
    chunks.push("Daily routine was the right call yesterday — I'll keep it in the mix. Clean signal compounds over multiple days.");
  }

  // Goal for today
  if (label === "outstanding") {
    chunks.push("100 credits today. I need to refine the distribution — make sure no single district dominates the training data. Breadth got me here; precision takes me further.");
  } else if (label === "great") {
    chunks.push(`100 credits. ${unsampled ? `I need to visit ${unsampled} first, then deepen.` : "I need to deepen the districts where accuracy still lags."} I want to end today with the coverage gap closed.`);
  } else {
    chunks.push("100 credits. Breadth before depth — closing a coverage gap produces more accuracy gain than adding more samples to a district I already know.");
  }

  return {
    chatbox: "open",
    chunks,
    choices: [{ label: "Plan Day 2 mission", nextPassage: "day2-plan" }],
  };
}

function day2Debrief(s: StrategyResult): Passage {
  const t = evalTier(s);
  const label = tierLabel(t);
  const worst = weakestRegion(s);
  const unsampled = unsampledList(s);
  const q = questionAnalysis(s);
  const chunks: string[] = [];

  // Opening: two-day stock-take
  if (label === "outstanding") {
    chunks.push("Day 2 complete. Two solid days in the field — my dataset is in strong shape across every district.");
  } else if (label === "great") {
    chunks.push("Day 2 complete. Two days of solid work. The gaps are mostly closed, but my precision still varies across zones.");
  } else if (label === "good") {
    chunks.push("Day 2 complete. I made progress across the board — but some districts are still dragging the average down.");
  } else if (label === "mediocre") {
    chunks.push("Day 2 complete. Better than yesterday, but still not where it needs to be.");
  } else if (label === "poor") {
    chunks.push("Day 2 complete. Two days in, and my dataset is still thin. The numbers are grim.");
  } else {
    chunks.push("Day 2 complete. Two days, and the model has barely seen the city it's supposed to serve. That's on me.");
  }

  // Coverage pillar — accumulated over two days
  if (t.sampledCount === 4) {
    chunks.push("Every district has been sampled across both days. That's the essential foundation — the model knows the full city exists.");
  } else if (t.sampledCount === 3) {
    chunks.push(`${unsampled} is still unvisited after two days. The model is forming verdicts about people it has never seen. Tomorrow is my last chance to fix that.`);
  } else {
    chunks.push(`${unsampled || "Most of the city"} is still outside my dataset after two days. With one day left, every credit tomorrow needs to go toward those unsampled districts first.`);
  }

  // Depth pillar
  if (label === "outstanding" || label === "great") {
    chunks.push("My sample depth is holding up — enough examples in visited zones for the model to see real patterns, not just noise.");
  } else {
    chunks.push(`Even where I did sample, the depth is thin. The model is working from small batches that may not represent the full distribution — especially in ${worst}.`);
  }

  // Signal pillar
  if (q.usedRoutine && !q.usedPhone && !q.usedPolice) {
    chunks.push("My signal has been clean across two days — daily routine kept the model anchored to behavioral truth.");
  } else if (q.usedPhone && q.usedRoutine) {
    chunks.push("Daily routine is still the useful signal; the phone model check is still adding noise. The last day is my chance to run clean — drop the phone check and put that budget toward more samples.");
  } else if (q.usedPolice) {
    chunks.push("I've been including past police stops, and it's introducing bias the model will carry into the verdict. Tomorrow I need to leave it out and run on clean behavioral signal only.");
  } else if (!q.usedRoutine) {
    chunks.push("I still haven't added daily routine after two days. That's the most useful behavioral signal I have access to — tomorrow is my last chance to include it.");
  }

  // Final-day suggestion
  if (label === "outstanding") {
    chunks.push("One day left. I need to make sure no district gets shortchanged in the final round — the neighboring city test will expose any region that's still underrepresented.");
  } else if (label === "great") {
    chunks.push(`Final day priority: ${unsampled ? `visit ${unsampled} and close the last coverage gap` : `lift ${worst} — a model is only as fair as its weakest region`}.`);
  } else {
    chunks.push("Tomorrow is the last day. Maximum coverage first — I need to visit every district the model hasn't seen. Then deepen. The final verdict lands on whatever I collect, and there's no appeal.");
  }

  return {
    chatbox: "open",
    chunks,
    choices: [{ label: "Proceed to Day 3", nextPassage: "day3-brief" }],
  };
}

function day3Brief(s: StrategyResult): Passage {
  const t = evalTier(s);
  const label = tierLabel(t);
  const unsampled = unsampledList(s);
  const worst = weakestRegion(s);
  const q = questionAnalysis(s);
  const chunks: string[] = [];

  // Opening: final-day framing
  if (label === "outstanding") {
    chunks.push("Day 3. The final day. Two days of thorough field work built a strong dataset — the model knows the whole city.");
  } else if (label === "great") {
    chunks.push("Day 3. Last chance to sharpen the picture. Two days of solid work, with one or two gaps still to close.");
  } else if (label === "good") {
    chunks.push("Day 3. My last 100 credits. The model is improving but still vulnerable — decent isn't enough when a person's freedom is at stake.");
  } else if (label === "mediocre") {
    chunks.push("Day 3. This is it. My dataset is shaky after two days — narrow coverage, thin samples. The final test is coming and I'm not ready.");
  } else if (label === "poor") {
    chunks.push("Day 3. Final day, and the situation is serious. Two days in and the model has seen almost nothing of the city it's supposed to serve.");
  } else {
    chunks.push("Day 3. Last chance to build a dataset worth trusting. Two days of narrow collection — I have to fix that today.");
  }

  // Coverage gap — what still needs to happen
  if (t.sampledCount === 4) {
    chunks.push(`I've covered every district. Today my priority is refining depth, especially in ${worst} where the model is still shaky.`);
  } else if (unsampled) {
    chunks.push(`The most urgent thing: ${unsampled} ${t.sampledCount <= 1 ? "have" : "has"} never been visited. I'm forming verdicts about people I've never seen — I need to fix this before anything else today.`);
  }

  // Signal advice for the final day
  if (q.usedPhone || q.usedPolice) {
    const issues = [
      q.usedPhone ? "phone model (noise)" : null,
      q.usedPolice ? "past police stops (bias)" : null,
    ].filter(Boolean).join(" and ");
    chunks.push(`Today is my last chance to run clean. ${issues} ${q.usedPhone && q.usedPolice ? "have been" : "has been"} hurting the model — I'm dropping ${q.usedPhone && q.usedPolice ? "them" : "it"} today and putting the budget toward daily routine and more samples.`);
  } else if (!q.usedRoutine) {
    chunks.push("I haven't used daily routine at all across these days. I'm adding it today — it's the one question that gives the model behavioral truth instead of a proxy.");
  } else {
    chunks.push("My signal strategy from earlier days was solid. I'll keep daily routine in the mix and stay away from the noisy questions.");
  }

  // Stakes
  if (label === "outstanding" || label === "great") {
    chunks.push("After today, the model faces its real test — deployment to a neighboring city it has never seen. If my approach generalized and wasn't just tuned to Novus's specifics, it will hold. Let's find out.");
  } else {
    chunks.push("After today, the verdict lands on whatever is in my dataset. It cannot be appealed. I need to make this day count.");
  }

  return {
    chatbox: "open",
    chunks,
    choices: [{ label: "Plan Day 3 mission", nextPassage: "day3-plan" }],
  };
}

function day3Debrief(s: StrategyResult): Passage {
  const t = evalTier(s);
  const label = tierLabel(t);
  const best = strongestRegion(s);
  const unsampled = unsampledList(s);
  const q = questionAnalysis(s);
  const chunks: string[] = [];

  // Opening: three-day retrospective
  if (label === "outstanding") {
    chunks.push("Three days. Three missions. And a dataset that looks nothing like what the original team ever collected. I think I actually did this right.");
  } else if (label === "great") {
    chunks.push(`Three days complete. The dataset is strong — a real improvement over where I started. ${best} shows what thoughtful collection looks like.`);
  } else if (label === "good") {
    chunks.push("Three days complete. The data is better than what caused the original failure, though it's not without gaps.");
  } else if (label === "mediocre") {
    chunks.push("Three days... and the gaps remain. The model is going into the final test with uneven coverage across the city. I'm not confident.");
  } else if (label === "poor") {
    chunks.push("Three days. Three missions. And I'm not sure it was enough. The dataset is thin in too many places.");
  } else {
    chunks.push("Three days. And the dataset is barely better than the one that convicted Ron in the first place.");
  }

  // Coverage retrospective
  if (t.sampledCount === 4) {
    chunks.push("Every district was sampled across the three days. The model knows the whole city exists — that was the one thing the original team never did.");
  } else if (unsampled) {
    chunks.push(`${unsampled} was never visited across three full days. The algorithm will render verdicts about those residents in complete darkness. I let that happen.`);
  }

  // Depth retrospective
  if (label === "outstanding" || label === "great") {
    chunks.push("My sample depth built up over three days — the model has enough examples to see real patterns, not just fit to noise.");
  } else {
    chunks.push("My sample depth remained thin in too many zones. The model is working from small, potentially unrepresentative batches — exactly the kind of dataset that produces confident mistakes.");
  }

  // Signal retrospective
  if (q.usedRoutine && !q.usedPhone && !q.usedPolice) {
    chunks.push("My signal was clean throughout — daily routine kept the model anchored to behavioral truth instead of demographic proxies. That was the right call every time.");
  } else if (q.usedPhone && !q.usedPolice) {
    chunks.push("The phone model check ran through the whole investigation and added noise the model had to work around. Behavioral signal — daily routine — is what predicts behavior; device ownership just tracks income.");
  } else if (q.usedPolice) {
    chunks.push("I included past police stops in my signal mix, and it brought historical bias into the model. The algorithm learned to reflect old enforcement patterns alongside whatever real behavior the data showed.");
  } else if (!q.usedRoutine) {
    chunks.push("Daily routine never made it into my question mix across three days. That's the cleanest behavioral signal I had access to — its absence is a gap the model will carry into the verdict.");
  }

  // Bridge to verdict
  if (label === "outstanding") {
    chunks.push("Now for the real test — the neighboring city. If my approach generalized and wasn't just tuned to Novus's specifics, the model will hold. Let's find out.");
  } else if (label === "great") {
    chunks.push("The neighboring city transfer is the honest judge. A strong local dataset doesn't always travel. Let's see the verdict.");
  } else {
    chunks.push("The verdict is about to land. Whatever the model learned — or didn't — from three days of collection is all it has now. Let's see what it says.");
  }

  return {
    chatbox: "open",
    chunks,
    choices: [{ label: "Review the results", nextPassage: "verdict" }],
  };
}

function verdict(s: StrategyResult): Passage {
  const t = evalTier(s);
  const label = tierLabel(t);
  const worst = weakestRegion(s);
  const unsampled = unsampledList(s);

  const variants: Record<TierLabel, string[]> = {
    outstanding: [
      "Look at these numbers.",
      `Overall accuracy above ${t.overallAcc}%. Every district performing well. And the neighboring city? The transfer held — my model didn't just work for Novus, it traveled.`,
      "The Factory Zone night-shift workers? Classified correctly. The Slums? No longer an algorithmic blind spot. The model sees patterns without prejudice — because I gave it data that included everyone.",
      "The original AI sent an innocent person to prison because its dataset was narrow, privileged, and incomplete. My dataset is broad, representative, and fair.",
      "I didn't just fix a model. I proved that who collects the data, where they go, and what they ask... changes whose freedom is protected and whose is taken.",
      "This is what justice looks like when the data tells the whole story.",
    ],
    great: [
      `Overall accuracy at ${t.overallAcc}%. Solid — far better than the coin-flip the original system essentially was.`,
      `But the neighboring city transfer dropped to ${t.otherCityOvr}%. My model works well for Novus — but it stumbles when it crosses the city line.`,
      "That's the deeper lesson: a model trained in one context doesn't automatically travel to another. Fairness isn't a one-time achievement — it's a continuous commitment to checking, retraining, and questioning.",
      "I improved the system significantly. The apprentice would have a fighting chance. But the work isn't finished — it never is.",
    ],
    good: [
      `Overall accuracy at ${t.overallAcc}%. Better than random. Better than the original. But not good enough to trust with people's lives.`,
      `The neighboring city test dropped to ${t.otherCityOvr}% — a reminder that what works in one place may fail in another.`,
      `My weakest district is ${worst}. ${unsampled ? unsampled + " was never sampled — the algorithm literally judged people it had never seen." : "Coverage existed, but precision varied widely."}`,
      "I collected more data than the original team. But data volume isn't the same as data quality. The question is: whose data counted, and whose didn't?",
    ],
    mediocre: [
      `Overall accuracy at ${t.overallAcc}%. Some districts perform adequately. Others barely beat random guessing.`,
      `The neighboring city transfer is at ${t.otherCityOvr}% — the model is brittle outside its training bubble.`,
      `${unsampled ? "I never visited " + unsampled + ". The algorithm made decisions about people it had zero information about." : "Coverage existed everywhere, but it was too shallow to be reliable."}`,
      "The apprentice... the machine might still get it wrong. Not because the algorithm is evil, but because the data never showed it the full picture.",
      "Sampling bias isn't a bug in the code. It's a choice — a choice about whose data counts and whose doesn't. Today, I learned what that choice costs.",
    ],
    poor: [
      `Overall accuracy at ${t.overallAcc}%. Below the threshold of trust.`,
      `The neighboring city transfer is at ${t.otherCityOvr}% — the model is essentially useless outside the narrow slice it saw.`,
      `${unsampled ? unsampled + " was never visited. Those residents don't exist in the model's world. It cannot be fair to people it has never seen." : "Every district was touched, but the data was too noisy, too biased, or too shallow."}`,
      "The apprentice would likely still be convicted. The machine would still get it wrong. But here's what matters: I now understand why.",
      "The failure wasn't in the algorithm. It was in the choices about what data to collect, from whom, and what questions to ask. Next time — in the next timeline — I'll choose differently.",
    ],
    terrible: [
      `Overall accuracy at ${t.overallAcc}%. The model failed.`,
      `The neighboring city transfer collapsed to ${t.otherCityOvr}% — worse than a coin flip.`,
      `${unsampled ? "I never visited " + unsampled + ". The algorithm judged entire communities in complete darkness." : "The data covered ground but taught the model the wrong patterns."}`,
      "The apprentice would still go to prison. The machine would still make the same mistake — or a worse one.",
      "But I'm not the original data team. I now understand what they didn't: that data isn't neutral. That where I go, what I ask, who I sample — it all determines who the machine protects... and who it condemns.",
      "The investigation failed. But I won't forget why. And next time — when I step back into Day 1 — I'll build the dataset that should have been collected from the start.",
    ],
  };

  return {
    chatbox: "close",
    chunks: variants[label],
    choices: [],
  };
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────

/**
 * Returns the adapted passage for the given passageId.
 * Passages that don't adapt (intro, demo-*, plans) fall through to the static PASSAGES.
 * Pass `strategy` as null/undefined for passages that don't need it
 * (the function handles this gracefully).
 */
export function getAdaptivePassage(
  passageId: PassageId,
  strategy?: StrategyResult | null,
): Passage {
  if (!strategy) return PASSAGES[passageId];

  switch (passageId) {
    case "day1-debrief":
      return day1Debrief(strategy);
    case "day2-brief":
      return day2Brief(strategy);
    case "day2-debrief":
      return day2Debrief(strategy);
    case "day3-brief":
      return day3Brief(strategy);
    case "day3-debrief":
      return day3Debrief(strategy);
    case "verdict":
      return verdict(strategy);
    default:
      return PASSAGES[passageId];
  }
}
