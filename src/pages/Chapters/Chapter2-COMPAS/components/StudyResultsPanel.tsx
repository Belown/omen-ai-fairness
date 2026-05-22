import styles from "./StudyMailPanel.module.css";
import circleStyles from "./SatisfactionCircles.module.css";
import { STUDY_METRICS } from "../chapter2Data";
import { formatPct, satisfactionColor, type StudyResult } from "../chapter2Simulation";

type StudyResultsPanelProps = {
  results: StudyResult[];
  fromNight: number | null;
};

function outcomeLabel(outcome: StudyResult["outcome"]) {
  if (outcome === "win") return "Aligns with queued metric";
  if (outcome === "neutral") return "Mixed / neutral";
  return "Tradeoff visible";
}

function outcomeClass(outcome: StudyResult["outcome"]) {
  if (outcome === "win") return styles.badgeWin;
  if (outcome === "neutral") return styles.badgeNeutral;
  return styles.badgeWarn;
}

function CommunityImpactScores({ satisfaction }: { satisfaction: NonNullable<StudyResult["satisfaction"]> }) {
  const groups = [
    { key: "judges" as const, label: "Judges" },
    { key: "black" as const, label: "Black defendants" },
    { key: "white" as const, label: "White defendants" },
  ];
  return (
    <div className={circleStyles.row}>
      {groups.map(({ key, label }) => (
        <div key={key} className={circleStyles.item}>
          <div
            className={circleStyles.circle}
            style={{ background: satisfactionColor(satisfaction[key]) }}
          >
            {Math.round(satisfaction[key])}%
          </div>
          <span className={circleStyles.label}>{label}</span>
        </div>
      ))}
    </div>
  );
}

export default function StudyResultsPanel({ results, fromNight }: StudyResultsPanelProps) {
  if (!results.length) {
    return (
      <section className={styles.panel} aria-label="Study results">
        <h2 className={styles.title}>Overnight results</h2>
        <p className={styles.empty}>
          {fromNight == null
            ? "No results yet — queue studies tonight and advance to receive findings tomorrow."
            : "No studies were queued last night."}
        </p>
      </section>
    );
  }

  return (
    <section className={styles.panel} aria-label="Study results">
      <h2 className={styles.title}>
        Overnight results{fromNight != null ? ` (from Night ${fromNight})` : ""}
      </h2>
      <ul className={styles.list}>
        {results.map((row, i) => {
          const meta = STUDY_METRICS.find((m) => m.id === row.metricId);
          const isCommunityImpact = row.metricId === "accuracy-overall" && row.satisfaction;

          return (
            <li key={`${row.metricId}-${i}`} className={styles.card}>
              <div className={styles.cardTop}>
                <span className={styles.metricName}>{meta?.label ?? row.metricId}</span>
                <span className={outcomeClass(row.outcome)}>{outcomeLabel(row.outcome)}</span>
              </div>
              {isCommunityImpact ? (
                <CommunityImpactScores satisfaction={row.satisfaction!} />
              ) : (
                <div className={styles.grid}>
                  <div>
                    <span className={styles.colLabel}>Black defendants (cohort)</span>
                    <span className={styles.number}>{formatPct(row.black)}</span>
                    {row.blackSecondary != null && row.secondaryLabel && (
                      <span className={styles.secondary}>
                        {row.secondaryLabel} {formatPct(row.blackSecondary)}
                      </span>
                    )}
                  </div>
                  <div>
                    <span className={styles.colLabel}>White defendants (cohort)</span>
                    <span className={styles.number}>{formatPct(row.white)}</span>
                    {row.whiteSecondary != null && row.secondaryLabel && (
                      <span className={styles.secondary}>
                        {row.secondaryLabel} {formatPct(row.whiteSecondary)}
                      </span>
                    )}
                  </div>
                </div>
              )}
              <p className={styles.interpretation}>{row.interpretation}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
