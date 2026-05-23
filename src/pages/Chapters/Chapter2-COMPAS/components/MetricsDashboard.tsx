import styles from "./MetricsDashboard.module.css";
import type { GroupMetrics, ScenarioData } from "../chapter2Scenarios";

function GroupCard({ title, stats }: { title: string; stats: GroupMetrics }) {
  const rows: Array<{ label: string; value: number; highlight?: boolean }> = [
    { label: "TPR", value: stats.truePositiveRate },
    { label: "TNR", value: stats.trueNegativeRate },
    { label: "FPR", value: stats.falsePositiveRate, highlight: true },
    { label: "FNR", value: stats.falseNegativeRate, highlight: true },
    { label: "% Flagged High-Risk", value: stats.flaggedHighRisk },
  ];

  return (
    <div className={styles.groupCard}>
      <h4 className={styles.groupTitle}>{title}</h4>
      {stats.footnote && <p className={styles.footnote}>({stats.footnote})</p>}
      <table className={styles.statTable}>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className={row.highlight ? styles.highlightRow : undefined}>
              <td className={styles.statLabel}>{row.label}</td>
              <td className={styles.statValue}>{row.value}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

type MetricsDashboardProps = {
  scenario: ScenarioData;
};

export default function MetricsDashboard({ scenario }: MetricsDashboardProps) {
  const { predictiveParity } = scenario;

  return (
    <div className={styles.wrap}>
      <div className={styles.accuracyHero}>
        <p className={styles.accuracyValue}>{scenario.overallModelAccuracy}%</p>
        <p className={styles.accuracyLabel}>Overall Model Accuracy</p>
      </div>

      <div className={styles.groupRow}>
        <GroupCard title="Predators" stats={scenario.predators} />
        <GroupCard title="Prey" stats={scenario.prey} />
      </div>

      <div className={styles.parityCard}>
        <h4 className={styles.parityTitle}>Predictive Parity</h4>
        <div className={styles.parityBars}>
          <div className={styles.parityRow}>
            <span>Predators</span>
            <div className={styles.parityBarTrack}>
              <div
                className={styles.parityBarFill}
                style={{ width: `${predictiveParity.predatorsReoffend}%` }}
              />
            </div>
            <strong>{predictiveParity.predatorsReoffend}%</strong>
          </div>
          <div className={styles.parityRow}>
            <span>Prey</span>
            <div className={styles.parityBarTrack}>
              <div
                className={styles.parityBarFill}
                style={{ width: `${predictiveParity.preyReoffend}%` }}
              />
            </div>
            <strong>{predictiveParity.preyReoffend}%</strong>
          </div>
        </div>
        <p className={styles.parityStatus}>{predictiveParity.status}</p>
        {scenario.populationInSystem && (
          <p className={styles.population}>
            <strong>Population in System:</strong> {scenario.populationInSystem}
          </p>
        )}
      </div>
    </div>
  );
}
