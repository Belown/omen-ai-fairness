import { useCallback, useMemo, useRef, useState, type CSSProperties, type RefObject } from "react";
import { useSearchParams } from "react-router-dom";
import { CHAPTER1_BACKGROUNDS } from "../../../assets/image/image";
import styles from "./Chapter2COMPAS.module.css";
import {
  MAX_CURRENT_DAY,
  STARTING_BUDGET,
  STUDY_METRICS,
  type FairnessDefinitionId,
  type StudyMetricId,
} from "./chapter2Data";
import { getScenario, type AggregateSatisfaction } from "./chapter2Scenarios";
import { TUTORIAL_REOPEN_START, type TutorialSpotlight } from "./chapter2Tutorial";
import type { DayRecord, MetricUsageCounts } from "./chapter2Types";
import { INITIAL_GAME_STATE } from "./chapter2Types";
import EndingSequence from "./components/EndingSequence";
import LeftPanel from "./components/LeftPanel";
import RightPanel from "./components/RightPanel";
import TutorialOverlay from "./components/TutorialOverlay";

type Phase = "tutorial" | "game" | "ending";
type EndingPhase = "narrative" | "outcome-best" | "outcome-keep";

function queueCost(queue: StudyMetricId[]) {
  return queue.reduce((sum, id) => sum + (STUDY_METRICS.find((m) => m.id === id)?.cost ?? 0), 0);
}

function satisfactionFromDays(days: DayRecord[]): AggregateSatisfaction[] {
  return days.map((d) => ({
    judges: d.scenario.satisfaction.judges.score,
    predators: d.scenario.satisfaction.predators.score,
    prey: d.scenario.satisfaction.prey.score,
  }));
}

export default function Chapter2COMPAS() {
  const [, setSearchParams] = useSearchParams();

  const [phase, setPhase] = useState<Phase>("tutorial");
  const [tutorialStep, setTutorialStep] = useState(0);
  const [currentDay, setCurrentDay] = useState(INITIAL_GAME_STATE.currentDay);
  const [fairnessMetric, setFairnessMetric] = useState<FairnessDefinitionId>(INITIAL_GAME_STATE.fairnessMetric);
  const [budget, setBudget] = useState(STARTING_BUDGET);
  const [metricUsageCounts, setMetricUsageCounts] = useState<MetricUsageCounts>({
    ...INITIAL_GAME_STATE.metricUsageCounts,
  });
  const [days, setDays] = useState<DayRecord[]>([]);
  const [pendingQueue, setPendingQueue] = useState<StudyMetricId[]>([]);
  const [endingPanelIndex, setEndingPanelIndex] = useState(0);
  const [endingPhase, setEndingPhase] = useState<EndingPhase>("narrative");

  const gameShellRef = useRef<HTMLDivElement>(null);
  const metricSelectorRef = useRef<HTMLElement>(null);
  const studyQueueRef = useRef<HTMLElement>(null);
  const metricsDashboardRef = useRef<HTMLElement>(null);
  const satisfactionMetersRef = useRef<HTMLElement>(null);

  const spotlightRefs: Record<TutorialSpotlight, RefObject<HTMLElement | null>> = useMemo(
    () => ({
      frame: gameShellRef,
      metricSelector: metricSelectorRef,
      metricsDashboard: metricsDashboardRef,
      satisfactionMeters: satisfactionMetersRef,
      studyQueue: studyQueueRef,
      none: { current: null },
    }),
    [],
  );

  const pendingCost = queueCost(pendingQueue);
  const canAdvance = budget - pendingCost >= 0;

  const displayedScenario = currentDay >= 1 ? (days[currentDay - 1]?.scenario ?? null) : null;
  const satisfactionHistory = useMemo(() => satisfactionFromDays(days), [days]);

  const toggleQueue = (metricId: StudyMetricId) => {
    if (currentDay >= MAX_CURRENT_DAY || budget <= 0) return;
    setPendingQueue((prev) => {
      if (prev.includes(metricId)) return prev.filter((id) => id !== metricId);
      const next = [...prev, metricId];
      if (queueCost(next) > budget) return prev;
      return next;
    });
  };

  const handleMetricSelect = (id: FairnessDefinitionId) => {
    setFairnessMetric(id);
  };

  const advanceDay = () => {
    if (currentDay >= MAX_CURRENT_DAY || !canAdvance) return;

    const metric = fairnessMetric;
    const usageCount = Math.min(metricUsageCounts[metric] + 1, 3);
    const scenario = getScenario(metric, usageCount);

    const record: DayRecord = {
      day: currentDay,
      metricActive: metric,
      studiesQueued: [...pendingQueue],
      costDeducted: pendingCost,
      scenario,
    };

    setDays((prev) => [...prev, record]);
    setBudget((b) => b - pendingCost);
    setMetricUsageCounts((c) => ({
      ...c,
      [metric]: Math.min(c[metric] + 1, 3),
    }));
    setCurrentDay((d) => d + 1);
    setPendingQueue([]);
  };

  const confirmEnding = () => {
    setPhase("ending");
    setEndingPanelIndex(0);
    setEndingPhase("narrative");
  };

  const resetGame = useCallback(() => {
    setPhase("tutorial");
    setTutorialStep(0);
    setCurrentDay(0);
    setFairnessMetric("equal_rates");
    setBudget(STARTING_BUDGET);
    setMetricUsageCounts({ equal_rates: 0, predictive_parity: 0, max_accuracy: 0 });
    setDays([]);
    setPendingQueue([]);
    setEndingPanelIndex(0);
    setEndingPhase("narrative");
  }, []);

  const openTutorialFromHelp = () => {
    setTutorialStep(TUTORIAL_REOPEN_START - 1);
    setPhase("tutorial");
  };

  const finishTutorial = () => {
    setPhase("game");
    setTutorialStep(0);
  };

  const chapterBackground = CHAPTER1_BACKGROUNDS.cityMapTable;
  const phaseStyle = { "--chapter-bg": `url(${chapterBackground})` } as CSSProperties;

  if (phase === "ending") {
    return (
      <div className={`${styles.phase} ${styles.phaseWithBackground}`} style={phaseStyle}>
        <EndingSequence
          panelIndex={endingPanelIndex}
          phase={endingPhase}
          onAdvance={() => setEndingPanelIndex((i) => Math.min(i + 1, 9))}
          onChooseBest={() => setEndingPhase("outcome-best")}
          onChooseKeep={() => setEndingPhase("outcome-keep")}
          onReplay={resetGame}
          onNextChapter={() => setSearchParams({ chapter: "ch3" })}
        />
      </div>
    );
  }

  const showTutorial = phase === "tutorial";

  return (
    <div className={`${styles.phase} ${styles.phaseWithBackground}`} style={phaseStyle}>
      <div ref={gameShellRef} className={styles.gameShell} data-tutorial-dim={showTutorial ? true : undefined}>
        <LeftPanel
          currentDay={currentDay}
          budget={budget}
          fairnessMetric={fairnessMetric}
          pendingQueue={pendingQueue}
          canAdvance={canAdvance}
          onMetricSelect={handleMetricSelect}
          onToggleStudy={toggleQueue}
          onAdvance={advanceDay}
          onConfirmEnding={confirmEnding}
          onOpenTutorial={openTutorialFromHelp}
          metricSelectorRef={metricSelectorRef}
          studyQueueRef={studyQueueRef}
        />

        <RightPanel
          currentDay={currentDay}
          scenario={displayedScenario}
          satisfactionHistory={satisfactionHistory}
          metricsDashboardRef={metricsDashboardRef}
          satisfactionMetersRef={satisfactionMetersRef}
        />
      </div>

      {showTutorial && (
        <TutorialOverlay
          stepIndex={tutorialStep}
          onNext={() => setTutorialStep((s) => s + 1)}
          onComplete={finishTutorial}
          onSkip={finishTutorial}
          spotlightRefs={spotlightRefs}
        />
      )}
    </div>
  );
}
