import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { useSearchParams } from "react-router-dom";
import Chatbox from "../../../components/Chatbox/Chatbox";
import { portraits } from "../../../assets/detective/portraits";
import { CHAPTER1_BACKGROUNDS } from "../../../assets/image/image";
import styles from "./Chapter2COMPAS.module.css";
import { buildScenarioDialogue } from "./chapter2Dialogue";
import {
  FAIRNESS_DEFINITIONS,
  INTRO_CHUNKS,
  MAX_CURRENT_DAY,
  STARTING_BUDGET,
  STUDY_METRICS,
  type FairnessDefinitionId,
  type StudyMetricId,
} from "./chapter2Data";
import { sessionLogger } from "../../../utils/sessionLogger";
import { getScenario, type AggregateSatisfaction } from "./chapter2Scenarios";
import { TUTORIAL_REOPEN_START, TUTORIAL_STEPS, type Chapter2TutorialTarget } from "./chapter2Tutorial";
import type { DayRecord, MetricUsageCounts } from "./chapter2Types";
import { INITIAL_GAME_STATE } from "./chapter2Types";
import { useTutorial } from "../Chapter1-SamplingBias/hooks/useTutorial";
import TutorialPopover from "../Chapter1-SamplingBias/components/Tutorial/TutorialPopover";
import EndingSequence from "./components/EndingSequence";
import LeftPanel from "./components/LeftPanel";
import RightPanel from "./components/RightPanel";

type Phase = "intro" | "tutorial" | "game" | "ending";
type EndingPhase = "narrative" | "outcome-best" | "outcome-keep";

export type ChapterResult = {
  completed: boolean;
  passed: boolean;
  scoreLabel?: string;
};

type Chapter2COMPASProps = {
  isActive: boolean;
  onChapterComplete: (result: ChapterResult) => void;
};

const CENTERED_TUTORIAL_STYLE: CSSProperties = {
  width: "min(440px, calc(100vw - 32px))",
  maxWidth: "calc(100vw - 32px)",
  maxHeight: "calc(100vh - 32px)",
  overflowY: "auto",
  boxSizing: "border-box",
  pointerEvents: "auto",
  top: "50%",
  left: "50%",
  right: "auto",
  visibility: "visible",
  transform: "translate(-50%, -50%)",
  animation: "none",
};

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

export default function Chapter2COMPAS({ isActive, onChapterComplete }: Chapter2COMPASProps) {
  const [, setSearchParams] = useSearchParams();

  const [phase, setPhase] = useState<Phase>("intro");
  const [introChunkIndex, setIntroChunkIndex] = useState(0);
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
  const [isNarrativeCollapsed, setIsNarrativeCollapsed] = useState(false);
  const [chatboxReopenSignal, setChatboxReopenSignal] = useState(0);

  const lastDialogueKeyRef = useRef<string>("");

  const pendingCost = queueCost(pendingQueue);
  const canAdvance = budget - pendingCost >= 0;

  const resultsDayRecord = currentDay >= 1 ? days[currentDay - 1] : null;
  const displayedScenario = resultsDayRecord?.scenario ?? null;
  const commissionedStudies = resultsDayRecord?.studiesQueued ?? [];
  const satisfactionHistory = useMemo(() => satisfactionFromDays(days), [days]);

  const dialogueText = useMemo(() => {
    if (!resultsDayRecord) return "";
    const { metric, usageCount } = resultsDayRecord.scenario;
    return buildScenarioDialogue(metric, usageCount, resultsDayRecord.studiesQueued) ?? "";
  }, [resultsDayRecord]);

  const showGameChatbox = phase === "game" && currentDay >= 1 && dialogueText.length > 0;

  useEffect(() => {
    if (!isActive) return;
    if (!showGameChatbox) return;
    const key = `${currentDay}-${dialogueText}`;
    if (key === lastDialogueKeyRef.current) return;
    lastDialogueKeyRef.current = key;
    setIsNarrativeCollapsed(false);
    setChatboxReopenSignal((s) => s + 1);
  }, [showGameChatbox, currentDay, dialogueText]);

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

    const metricDef = FAIRNESS_DEFINITIONS.find((d) => d.id === metric);
    sessionLogger.logCh2Day({
      day: currentDay + 1,
      fairnessMetricId: metric,
      fairnessMetricLabel: metricDef?.title ?? metric,
      studiesCommissioned: pendingQueue.map((id) => {
        const s = STUDY_METRICS.find((m) => m.id === id);
        return { id, label: s?.label ?? id, cost: s?.cost ?? 0 };
      }),
      totalCost: pendingCost,
    });

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

    onChapterComplete({
      completed: true,
      passed: true,
      scoreLabel: "COMPAS complete",
    });
  };

  const confirmEnding = () => {
    setPhase("ending");
    setEndingPanelIndex(0);
    setEndingPhase("narrative");
  };

  const finishTutorial = useCallback(() => {
    setPhase("game");
  }, []);

  const tutorial = useTutorial(TUTORIAL_STEPS, {
    enabled: phase === "tutorial",
    onDismiss: finishTutorial,
  });

  const resetGame = useCallback(() => {
    setPhase("tutorial");
    tutorial.restartAt(0);
    setCurrentDay(0);
    setFairnessMetric("equal_rates");
    setBudget(STARTING_BUDGET);
    setMetricUsageCounts({ equal_rates: 0, predictive_parity: 0, max_accuracy: 0 });
    setDays([]);
    setPendingQueue([]);
    setEndingPanelIndex(0);
    setEndingPhase("narrative");
    setIsNarrativeCollapsed(false);
    setChatboxReopenSignal(0);
    lastDialogueKeyRef.current = "";
  }, [tutorial]);

  const openTutorialFromHelp = () => {
    setPhase("tutorial");
    tutorial.restartAt(TUTORIAL_REOPEN_START);
  };

  const advanceIntro = useCallback(() => {
    if (introChunkIndex < INTRO_CHUNKS.length - 1) {
      setIntroChunkIndex((i) => i + 1);
    } else {
      setPhase("tutorial");
    }
  }, [introChunkIndex]);

  const getTutorialTargetClass = (target: Chapter2TutorialTarget, className = "") => {
    if (tutorial.open && tutorial.step?.target === "frame" && target !== "frame") {
      return className;
    }
    return tutorial.getTargetClass(target, className);
  };

  const chapterBackground = CHAPTER1_BACKGROUNDS.caseRoom;
  const phaseStyle = { "--chapter-bg": `url(${chapterBackground})` } as CSSProperties;

  const gameShellClass = [
    styles.gameShell,
    tutorial.open ? styles.gameShellTutorialActive : "",
    showGameChatbox && !isNarrativeCollapsed ? styles.gameShellChatboxOpen : "",
    showGameChatbox && isNarrativeCollapsed ? styles.gameShellChatboxCollapsed : "",
  ]
    .filter(Boolean)
    .join(" ");

  if (phase === "intro") {
    return (
      <div className={`${styles.phase} ${styles.phaseWithBackground}`} style={phaseStyle}>
        <Chatbox
          text={INTRO_CHUNKS[introChunkIndex]}
          portraitSrc={portraits.thoughtful}
          onAdvance={advanceIntro}
          speakerName="Whiskers Holmes"
          disablePreviousNavigation
        />
      </div>
    );
  }

  if (phase === "ending") {
    return (
      <div className={`${styles.phase} ${styles.phaseWithBackground}`} style={phaseStyle}>
        <EndingSequence
          panelIndex={endingPanelIndex}
          phase={endingPhase}
          onAdvance={() => setEndingPanelIndex((i) => Math.min(i + 1, 9))}
          onChooseBest={() => {
            const metricDef = FAIRNESS_DEFINITIONS.find((d) => d.id === fairnessMetric);
            sessionLogger.logCh2EndingChoice({
              choice: "apply-best-practices",
              finalFairnessMetricId: fairnessMetric,
              finalFairnessMetricLabel: metricDef?.title ?? fairnessMetric,
            });
            setEndingPhase("outcome-best");
          }}
          onChooseKeep={() => {
            const metricDef = FAIRNESS_DEFINITIONS.find((d) => d.id === fairnessMetric);
            sessionLogger.logCh2EndingChoice({
              choice: "keep-current-system",
              finalFairnessMetricId: fairnessMetric,
              finalFairnessMetricLabel: metricDef?.title ?? fairnessMetric,
            });
            setEndingPhase("outcome-keep");
          }}
          onReplay={resetGame}
          onNextChapter={() => setSearchParams({ chapter: "ch3" })}
        />
      </div>
    );
  }

  return (
    <div className={`${styles.phase} ${styles.phaseWithBackground}`} style={phaseStyle}>
      <div className={gameShellClass}>
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
          metricSelectorClassName={getTutorialTargetClass("metricSelector")}
          studyQueueClassName={getTutorialTargetClass("studyQueue")}
        />

        <RightPanel
          currentDay={currentDay}
          scenario={displayedScenario}
          commissionedStudies={commissionedStudies}
          satisfactionHistory={satisfactionHistory}
          showTutorialPlaceholders={tutorial.open}
          metricsDashboardClassName={getTutorialTargetClass("metricsDashboard")}
          satisfactionMetersClassName={getTutorialTargetClass("satisfactionMeters")}
        />
      </div>

      {tutorial.step && (
        <TutorialPopover
          open={tutorial.open}
          title={tutorial.step.title}
          body={tutorial.step.body}
          stepIndex={tutorial.stepIndex}
          totalSteps={tutorial.totalSteps}
          style={tutorial.step.target === "frame" ? CENTERED_TUTORIAL_STYLE : tutorial.popoverStyle}
          onSkip={tutorial.close}
          onBack={tutorial.goPrev}
          onNext={tutorial.goNext}
          titleId="chapter2-tutorial-title"
          popoverRef={tutorial.registerPopover}
        />
      )}

      {showGameChatbox && (
        <Chatbox
          text={dialogueText}
          portraitSrc={portraits.thoughtful}
          history={[
            {
              text: dialogueText,
              passageId: `day-${currentDay}-results`,
              current: true,
            },
          ]}
          onCollapsedChange={setIsNarrativeCollapsed}
          reopenSignal={chatboxReopenSignal}
          speakerName="Whiskers Holmes"
          disablePreviousNavigation
        />
      )}
    </div>
  );
}
