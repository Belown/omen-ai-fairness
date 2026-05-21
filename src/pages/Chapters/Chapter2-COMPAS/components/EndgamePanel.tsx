import styles from "./EndgamePanel.module.css";
import type { FairnessDefinitionId } from "../chapter2Data";
import { ENDINGS, FAIRNESS_DEFINITIONS } from "../chapter2Data";
import { FINAL_CONFIRMATION_MODIFIER } from "../chapter2Simulation";

type EndgamePanelProps = {
  dailyScores: number[];
  operationalAccuracy: number;
  finalModifier: number;
  finalSystemAccuracy: number;
  finalFairness: FairnessDefinitionId;
  finalBudget: number;
  onReplay: () => void;
  onNextChapter: () => void;
};

export default function EndgamePanel({
  dailyScores,
  operationalAccuracy,
  finalModifier,
  finalSystemAccuracy,
  finalFairness,
  finalBudget,
  onReplay,
  onNextChapter,
}: EndgamePanelProps) {
  const ending = ENDINGS[finalFairness];
  const def = FAIRNESS_DEFINITIONS.find((d) => d.id === finalFairness);
  const modifierLabel = finalModifier >= 0 ? `+${finalModifier.toFixed(1)}%` : `${finalModifier.toFixed(1)}%`;

  return (
    <section className={styles.panel} aria-label="Term summary">
      <h2 className={styles.title}>Three‑day term complete</h2>
      <div className={styles.scoreRow}>
        {dailyScores.map((score, i) => (
          <div key={i} className={styles.scoreBlock}>
            <h3 className={styles.subhead}>Day {i + 1} accuracy</h3>
            <p className={styles.score}>{score.toFixed(1)}%</p>
          </div>
        ))}
      </div>
      <div className={styles.finalAccuracyBlock}>
        <p className={styles.finalLine}>
          <span className={styles.finalLabel}>Operational accuracy (Days 1–3):</span>{" "}
          <strong>{operationalAccuracy.toFixed(1)}%</strong>
        </p>
        <p className={styles.finalLine}>
          <span className={styles.finalLabel}>Long-term deployment adjustment:</span>{" "}
          <strong>{modifierLabel}</strong>
          <span className={styles.finalHint}> ({def?.title ?? finalFairness} policy)</span>
        </p>
        <p className={styles.finalLine}>
          <span className={styles.finalLabel}>Final system accuracy:</span>{" "}
          <strong className={styles.finalScore}>{finalSystemAccuracy.toFixed(1)}%</strong>
        </p>
      </div>
      <p className={styles.scoreNote}>
        Operational accuracy is the average of each night&apos;s score while the instrument ran. The deployment
        adjustment reflects the long-term cost of committing to{" "}
        {FINAL_CONFIRMATION_MODIFIER[finalFairness] >= 0 ? "an unconstrained" : "a fairness-constrained"} policy.
      </p>
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
