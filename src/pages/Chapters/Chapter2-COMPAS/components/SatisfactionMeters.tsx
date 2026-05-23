import { useState } from "react";
import styles from "./SatisfactionMeters.module.css";
import {
  satisfactionColor,
  type AggregateSatisfaction,
  type ScenarioData,
  type StakeholderGroup,
} from "../chapter2Scenarios";

const GROUPS: Array<{ id: StakeholderGroup; label: string }> = [
  { id: "judges", label: "Judges" },
  { id: "predators", label: "Predators" },
  { id: "prey", label: "Prey" },
];

type SatisfactionMetersProps = {
  scenario: ScenarioData;
  aggregate: AggregateSatisfaction | null;
};

function MeterCircle({
  emoji,
  score,
  quote,
  onToggle,
  open,
}: {
  emoji: string;
  score: number;
  quote: string;
  onToggle: () => void;
  open: boolean;
}) {
  return (
    <>
      <button
        type="button"
        className={styles.circle}
        style={{ background: satisfactionColor(score) }}
        onClick={onToggle}
        aria-expanded={open}
        aria-label={`Satisfaction ${score} percent. Click for quote.`}
      >
        <span className={styles.emoji} aria-hidden>
          {emoji}
        </span>
        <span className={styles.pct}>{score}%</span>
      </button>
      {open && <div className={styles.popover} role="tooltip">{quote}</div>}
    </>
  );
}

export default function SatisfactionMeters({ scenario, aggregate }: SatisfactionMetersProps) {
  const [openGroup, setOpenGroup] = useState<StakeholderGroup | null>(null);

  return (
    <section className={styles.section} aria-label="Stakeholder satisfaction">
      <h3 className={styles.heading}>Stakeholder Satisfaction</h3>
      <div className={styles.row}>
        {GROUPS.map(({ id, label }) => {
          const entry = scenario.satisfaction[id];
          const aggScore = aggregate?.[id];
          return (
            <div key={id} className={styles.item}>
              <MeterCircle
                emoji={entry.emoji}
                score={entry.score}
                quote={entry.quote}
                open={openGroup === id}
                onToggle={() => setOpenGroup((g) => (g === id ? null : id))}
              />
              <span className={styles.label}>{label}</span>
              {aggregate && (
                <div className={styles.aggregateWrap}>
                  <span className={styles.aggregateLabel}>Overall</span>
                  <div
                    className={styles.aggregateCircle}
                    style={{ background: satisfactionColor(aggScore!) }}
                  >
                    {Math.round(aggScore!)}%
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
