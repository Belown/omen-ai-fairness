import type { RefObject } from "react";
import styles from "./LeftPanel.module.css";
import chapterStyles from "../Chapter2COMPAS.module.css";
import { MAX_CURRENT_DAY } from "../chapter2Data";
import type { FairnessDefinitionId, StudyMetricId } from "../chapter2Data";
import FairnessMetricSelector from "./FairnessMetricSelector";
import StudyQueuePanel from "./StudyQueuePanel";

type LeftPanelProps = {
  currentDay: number;
  budget: number;
  fairnessMetric: FairnessDefinitionId;
  pendingQueue: StudyMetricId[];
  canAdvance: boolean;
  onMetricSelect: (id: FairnessDefinitionId) => void;
  onToggleStudy: (id: StudyMetricId) => void;
  onAdvance: () => void;
  onConfirmEnding: () => void;
  onOpenTutorial: () => void;
  metricSelectorRef?: RefObject<HTMLElement | null>;
  studyQueueRef?: RefObject<HTMLElement | null>;
};

export default function LeftPanel({
  currentDay,
  budget,
  fairnessMetric,
  pendingQueue,
  canAdvance,
  onMetricSelect,
  onToggleStudy,
  onAdvance,
  onConfirmEnding,
  onOpenTutorial,
  metricSelectorRef,
  studyQueueRef,
}: LeftPanelProps) {
  const isFinalDay = currentDay === MAX_CURRENT_DAY;

  return (
    <section className={styles.panel} aria-label="Today's choices">
      <button
        type="button"
        className={styles.helpBtn}
        onClick={onOpenTutorial}
        aria-label="Open tutorial"
        title="Help"
      >
        ?
      </button>

      <header className={styles.header}>
        <h2 className={styles.title}>Today&apos;s Choices</h2>
        <div className={styles.statusRow}>
          <span>
            Day <strong>{currentDay}</strong> / {MAX_CURRENT_DAY}
          </span>
          <span>
            Budget: <strong>{Math.round(budget)}</strong> credits
          </span>
        </div>
      </header>

      <div className={styles.scroll}>
        {isFinalDay && (
          <p className={styles.finalHeader}>
            This is your final decision. The fairness framework you confirm will determine the system&apos;s lasting
            legacy.
          </p>
        )}

        <div ref={metricSelectorRef as RefObject<HTMLDivElement>}>
          <FairnessMetricSelector active={fairnessMetric} onSelect={onMetricSelect} compact={isFinalDay} />
        </div>

        {!isFinalDay && (
          <div ref={studyQueueRef as RefObject<HTMLDivElement>}>
            <StudyQueuePanel
              pendingQueue={pendingQueue}
              budget={budget}
              disabled={false}
              onToggle={onToggleStudy}
            />
          </div>
        )}
      </div>

      <footer className={styles.footer}>
        {!canAdvance && !isFinalDay && (
          <p className={styles.warn}>Not enough budget for this queue — remove a study or adjust your selection.</p>
        )}
        {!isFinalDay ? (
          <button
            type="button"
            className={`${chapterStyles.primaryBtn} ${styles.primaryBtn}`}
            onClick={onAdvance}
            disabled={!canAdvance}
          >
            Advance to Day {currentDay + 1} →
          </button>
        ) : (
          <button type="button" className={`${chapterStyles.primaryBtn} ${styles.primaryBtn}`} onClick={onConfirmEnding}>
            Confirm &amp; See Outcome →
          </button>
        )}
      </footer>
    </section>
  );
}
