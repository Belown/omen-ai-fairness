import styles from "./EndgamePanel.module.css";
import type { SatisfactionScores } from "../chapter2Simulation";
import SatisfactionCircles from "./SatisfactionCircles";

type DaySummaryPanelProps = {
  currentDay: number;
  dailySatisfaction: SatisfactionScores | null;
  aggregateSatisfaction: SatisfactionScores | null;
  queuedTonight: number;
  queueCost: number;
};

export default function DaySummaryPanel({
  currentDay,
  dailySatisfaction,
  aggregateSatisfaction,
  queuedTonight,
  queueCost,
}: DaySummaryPanelProps) {
  if (currentDay === 0) return null;

  return (
    <section className={styles.panel} aria-label="Session summary">
      <h2 className={styles.title}>Session summary</h2>
      <div className={styles.scoreRow}>
        <SatisfactionCircles
          variant="summary"
          daily={dailySatisfaction}
          aggregate={aggregateSatisfaction}
        />
      </div>
      {currentDay < 3 && (
        <p className={styles.scoreNote}>
          Tonight&apos;s queue: {queuedTonight} studies ({queueCost} credits) — charged when you advance.
        </p>
      )}
    </section>
  );
}
