import styles from "../Chapter2COMPAS.module.css";
import { FAIRNESS_DEFINITIONS } from "../chapter2Data";
import type { FairnessDefinitionId } from "../chapter2Data";

type FairnessMetricSelectorProps = {
  active: FairnessDefinitionId;
  onSelect: (id: FairnessDefinitionId) => void;
  compact?: boolean;
};

export default function FairnessMetricSelector({ active, onSelect, compact }: FairnessMetricSelectorProps) {
  return (
    <section className={styles.metricSection} aria-label="Fairness metric">
      <h2 className={styles.metricHeading}>{compact ? "Confirm fairness framework" : "Fairness metric"}</h2>
      <div className={styles.choiceGrid}>
        {FAIRNESS_DEFINITIONS.map((f) => (
          <button
            key={f.id}
            type="button"
            className={`${styles.choice} ${active === f.id ? styles.choiceActive : ""}`}
            onClick={() => onSelect(f.id)}
            aria-pressed={active === f.id}
          >
            <span className={styles.choiceTitle}>{f.title}</span>
            <span className={styles.choiceBody}>{f.blurb}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
