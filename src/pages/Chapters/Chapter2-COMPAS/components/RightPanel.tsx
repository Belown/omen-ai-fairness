import type { RefObject } from "react";
import styles from "./RightPanel.module.css";
import { FAIRNESS_DEFINITIONS } from "../chapter2Data";
import { computeAggregate, type AggregateSatisfaction, type ScenarioData } from "../chapter2Scenarios";
import MetricsDashboard from "./MetricsDashboard";
import SatisfactionMeters from "./SatisfactionMeters";
import WhiskersDialogue from "./WhiskersDialogue";

type RightPanelProps = {
  currentDay: number;
  scenario: ScenarioData | null;
  satisfactionHistory: AggregateSatisfaction[];
  metricsDashboardRef?: RefObject<HTMLElement | null>;
  satisfactionMetersRef?: RefObject<HTMLElement | null>;
};

export default function RightPanel({
  currentDay,
  scenario,
  satisfactionHistory,
  metricsDashboardRef,
  satisfactionMetersRef,
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
            <div ref={metricsDashboardRef as RefObject<HTMLDivElement>}>
              <MetricsDashboard scenario={scenario} />
            </div>
            <div ref={satisfactionMetersRef as RefObject<HTMLDivElement>}>
              <SatisfactionMeters scenario={scenario} aggregate={aggregate} />
            </div>
            {scenario.whiskersDialogue && <WhiskersDialogue text={scenario.whiskersDialogue} />}
          </>
        ) : (
          <div ref={metricsDashboardRef as RefObject<HTMLDivElement>} className={styles.emptyWrap}>
            <div className={styles.empty}>
              <span className={styles.emptyIcon} aria-hidden>
                📋
              </span>
              <p className={styles.emptyText}>Results will appear here tomorrow.</p>
            </div>
            <div ref={satisfactionMetersRef as RefObject<HTMLDivElement>} className={styles.satisfactionTutorialTarget} />
          </div>
        )}
      </div>
    </section>
  );
}
