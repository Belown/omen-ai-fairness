import styles from "./GameHud.module.css";
import { MAX_CURRENT_DAY } from "../chapter2Data";
import type { SatisfactionScores } from "../chapter2Simulation";
import SatisfactionCircles from "./SatisfactionCircles";

type GameHudProps = {
  currentDay: number;
  budget: number;
  dailySatisfaction: SatisfactionScores | null;
};

export default function GameHud({ currentDay, budget, dailySatisfaction }: GameHudProps) {
  return (
    <header className={styles.hud} aria-label="Court status">
      <div className={styles.hudBlock}>
        <span className={styles.kicker}>Session</span>
        <span className={styles.value}>
          Day {currentDay} / {MAX_CURRENT_DAY}
        </span>
      </div>
      <div className={styles.hudBlock}>
        <span className={styles.kicker}>Budget</span>
        <span className={styles.value}>{Math.round(budget)} credits</span>
      </div>
      <div className={`${styles.hudBlock} ${styles.hudGrow}`}>
        <span className={styles.kicker}>Stakeholder satisfaction</span>
        <SatisfactionCircles variant="hud" daily={dailySatisfaction} />
        <span className={styles.sub}>Last completed night</span>
      </div>
    </header>
  );
}
