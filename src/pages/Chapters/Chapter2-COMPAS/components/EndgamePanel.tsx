import styles from "./EndgamePanel.module.css";
import type { FairnessDefinitionId } from "../chapter2Data";
import { ENDINGS, FAIRNESS_DEFINITIONS } from "../chapter2Data";
import { aggregatedSatisfaction, pickSatisfactionSummary, type SatisfactionScores } from "../chapter2Simulation";
import SatisfactionCircles from "./SatisfactionCircles";

type EndgamePanelProps = {
  dailyHistory: SatisfactionScores[];
  finalFairness: FairnessDefinitionId;
  finalBudget: number;
  onReplay: () => void;
  onNextChapter: () => void;
};

export default function EndgamePanel({
  dailyHistory,
  finalFairness,
  finalBudget,
  onReplay,
  onNextChapter,
}: EndgamePanelProps) {
  const ending = ENDINGS[finalFairness];
  const def = FAIRNESS_DEFINITIONS.find((d) => d.id === finalFairness);
  const aggregate = aggregatedSatisfaction(dailyHistory);
  const latestDaily = dailyHistory.length > 0 ? dailyHistory[dailyHistory.length - 1] : null;
  const patternSummary = pickSatisfactionSummary(aggregate);

  return (
    <section className={styles.panel} aria-label="Term summary">
      <h2 className={styles.title}>Three‑day term complete</h2>
      {latestDaily && (
        <>
          <h3 className={styles.subhead}>Stakeholder satisfaction</h3>
          <SatisfactionCircles variant="endgame" daily={latestDaily} aggregate={aggregate} />
          <p className={styles.patternSummary}>{patternSummary}</p>
        </>
      )}
      <p className={styles.body}>
        Final budget: <strong>{Math.round(finalBudget)}</strong> credits.
      </p>
      <div className={styles.legacyBlock}>
        <h3 className={styles.subhead}>Fairness metric confirmed</h3>
        <p className={styles.stance}>{def?.title}</p>
        <h3 className={styles.subhead}>{ending.headline}</h3>
        <p className={styles.body}>{ending.body}</p>
      </div>
      <div className={styles.actions}>
        <button type="button" className={styles.primary} onClick={onReplay}>
          Replay chapter
        </button>
        <button type="button" className={styles.secondary} onClick={onNextChapter}>
          Continue timeline
        </button>
      </div>
    </section>
  );
}
