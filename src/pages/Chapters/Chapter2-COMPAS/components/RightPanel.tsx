import styles from "./RightPanel.module.css";
import { FAIRNESS_DEFINITIONS, type StudyMetricId } from "../chapter2Data";
import {
  computeAggregate,
  getScenario,
  satisfactionColor,
  type AggregateSatisfaction,
  type ScenarioData,
} from "../chapter2Scenarios";
import MetricsDashboard from "./MetricsDashboard";
import SatisfactionMeters from "./SatisfactionMeters";

type RightPanelProps = {
  currentDay: number;
  scenario: ScenarioData | null;
  commissionedStudies: StudyMetricId[];
  satisfactionHistory: AggregateSatisfaction[];
  showTutorialPlaceholders?: boolean;
  metricsDashboardClassName?: string;
  satisfactionMetersClassName?: string;
};

const SATISFACTION_PREVIEW = [
  { label: "Judges", score: 72 },
  { label: "Predators", score: 38 },
  { label: "Prey", score: 56 },
];

const PREVIEW_STUDIES: StudyMetricId[] = ["study_accuracy", "study_error_rates", "study_predictive_parity"];
const PREVIEW_SCENARIO = getScenario("equal_rates", 1);

function MetricsPreview() {
  return (
    <section className={styles.previewMetrics} aria-label="Example overnight results">
      <div className={styles.previewHeader}>
        <h3 className={styles.previewTitle}>Example Overnight Results</h3>
        <span className={styles.previewBadge}>Tutorial sample</span>
      </div>
      <MetricsDashboard scenario={PREVIEW_SCENARIO} commissionedStudies={PREVIEW_STUDIES} />
    </section>
  );
}

function SatisfactionPreview() {
  return (
    <section className={styles.previewMeters} aria-label="Example stakeholder satisfaction">
      <h3 className={styles.previewHeading}>Stakeholder Satisfaction</h3>
      <div className={styles.previewRow}>
        {SATISFACTION_PREVIEW.map(({ label, score }) => (
          <div key={label} className={styles.previewItem}>
            <div className={styles.previewCircle} style={{ background: satisfactionColor(score) }}>
              {score}%
            </div>
            <span className={styles.previewLabel}>{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function RightPanel({
  currentDay,
  scenario,
  commissionedStudies,
  satisfactionHistory,
  showTutorialPlaceholders = false,
  metricsDashboardClassName,
  satisfactionMetersClassName,
}: RightPanelProps) {
  const aggregate = computeAggregate(satisfactionHistory);

  return (
    <section className={styles.panel} aria-label="Yesterday's results">
      <header className={styles.header}>
        <h2 className={styles.title}>Yesterday&apos;s Results</h2>
        <p className={styles.sub}>
          {currentDay === 0
            ? "Your first overnight run has not completed yet."
            : `Outcomes from Night ${currentDay - 1}`}
        </p>
      </header>

      <div className={styles.scroll}>
        {scenario ? (
          <>
            <span className={styles.metricTag}>
              {FAIRNESS_DEFINITIONS.find((f) => f.id === scenario.metric)?.title ?? scenario.metric}
            </span>
            <div className={metricsDashboardClassName}>
              <MetricsDashboard scenario={scenario} commissionedStudies={commissionedStudies} />
            </div>
            <div className={satisfactionMetersClassName}>
              <SatisfactionMeters scenario={scenario} aggregate={aggregate} />
            </div>
          </>
        ) : showTutorialPlaceholders ? (
          <div className={styles.dayZeroWrap}>
            <div className={metricsDashboardClassName}>
              <MetricsPreview />
            </div>
            <div className={satisfactionMetersClassName}>
              <SatisfactionPreview />
            </div>
          </div>
        ) : (
          <div className={styles.empty}>
            <span className={styles.emptyIcon} aria-hidden>
              📋
            </span>
            <p className={styles.emptyText}>Results will appear here tomorrow.</p>
          </div>
        )}
      </div>
    </section>
  );
}
