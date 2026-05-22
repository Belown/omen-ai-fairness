import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useSearchParams } from "react-router-dom";
import Chatbox from "../../../components/Chatbox/Chatbox";
import { portraits } from "../../../assets/detective/portraits";
import { CHAPTER1_BACKGROUNDS } from "../../../assets/image/image";
import styles from "./Chapter2COMPAS.module.css";
import { INTRO_CHUNKS, MAX_CURRENT_DAY, STARTING_BUDGET, STUDY_METRICS, type FairnessDefinitionId, type StudyMetricId } from "./chapter2Data";
import {
  aggregatedSatisfaction,
  computeDailySatisfaction,
  resolveDayStudies,
} from "./chapter2Simulation";
import type { DayRecord } from "./chapter2Types";
import { INITIAL_GAME_STATE } from "./chapter2Types";
import DaySummaryPanel from "./components/DaySummaryPanel";
import EndgamePanel from "./components/EndgamePanel";
import FairnessMetricSelector from "./components/FairnessMetricSelector";
import GameHud from "./components/GameHud";
import StudyQueuePanel from "./components/StudyQueuePanel";
import StudyResultsPanel from "./components/StudyResultsPanel";

type Phase = "intro" | "game" | "end";

const getPortrait = (text: string) => {
  const t = text.toLowerCase();
  if (t.includes("budget") || t.includes("insufficient")) return portraits.worried;
  if (t.includes("trade") || t.includes("locked")) return portraits.thoughtful;
  if (t.includes("satisfaction") || t.includes("community") || t.includes("study")) return portraits.suspicious;
  if (t.includes("final") || t.includes("confirm")) return portraits.serious;
  if (t.includes("queue") || t.includes("advance")) return portraits.encouraging;
  return portraits.neutral;
};

function queueCost(queue: StudyMetricId[]) {
  return queue.reduce((sum, id) => sum + (STUDY_METRICS.find((m) => m.id === id)?.cost ?? 0), 0);
}

type Chapter2COMPASProps = {
  isActive?: boolean;
  onChapterComplete?: (result: { completed: boolean; passed: boolean; scoreLabel?: string }) => void;
};

export default function Chapter2COMPAS({ isActive: _isActive = true, onChapterComplete }: Chapter2COMPASProps = {}) {
  const [, setSearchParams] = useSearchParams();
  const [phase, setPhase] = useState<Phase>("intro");
  const [introIndex, setIntroIndex] = useState(0);
  const [currentDay, setCurrentDay] = useState(INITIAL_GAME_STATE.currentDay);
  const [fairnessMetric, setFairnessMetric] = useState<FairnessDefinitionId>(INITIAL_GAME_STATE.fairnessMetric);
  const [metricChangedToday, setMetricChangedToday] = useState(false);
  const [switchedMetricOnDay, setSwitchedMetricOnDay] = useState<number | null>(
    INITIAL_GAME_STATE.switchedMetricOnDay,
  );
  const [budget, setBudget] = useState(STARTING_BUDGET);
  const [aggregateSatisfaction, setAggregateSatisfaction] = useState<typeof INITIAL_GAME_STATE.aggregateSatisfaction>(
    [],
  );
  const [days, setDays] = useState<DayRecord[]>([]);
  const [pendingQueue, setPendingQueue] = useState<StudyMetricId[]>([]);

  const pendingCost = queueCost(pendingQueue);
  const canAdvance = budget - pendingCost >= 0;
  const isFinalDay = currentDay === MAX_CURRENT_DAY;

  const overnightResults = currentDay >= 1 ? (days[currentDay - 1]?.results ?? []) : [];
  const overnightFromNight = currentDay >= 1 ? days[currentDay - 1]?.day ?? null : null;

  const latestDaily =
    aggregateSatisfaction.length > 0
      ? aggregateSatisfaction[aggregateSatisfaction.length - 1]
      : null;
  const aggregateScore =
    aggregateSatisfaction.length > 0 ? aggregatedSatisfaction(aggregateSatisfaction) : null;

  const toggleQueue = (metricId: StudyMetricId) => {
    if (currentDay >= MAX_CURRENT_DAY || budget <= 0) return;
    setPendingQueue((prev) => {
      if (prev.includes(metricId)) return prev.filter((id) => id !== metricId);
      const next = [...prev, metricId];
      const cost = queueCost(next);
      if (cost > budget) return prev;
      return next;
    });
  };

  const handleMetricSelect = (id: FairnessDefinitionId) => {
    if (id === fairnessMetric) return;
    if (isFinalDay) {
      setFairnessMetric(id);
      return;
    }
    if (metricChangedToday) return;
    setFairnessMetric(id);
    setMetricChangedToday(true);
    setSwitchedMetricOnDay(currentDay);
  };

  const advanceDay = () => {
    if (currentDay >= MAX_CURRENT_DAY || !canAdvance) return;

    const record: DayRecord = {
      day: currentDay,
      metricActive: fairnessMetric,
      studiesQueued: [...pendingQueue],
      costDeducted: pendingCost,
      results: [],
    };

    const applySwitchPenalty =
      switchedMetricOnDay !== null && record.day === switchedMetricOnDay + 1;

    const dailySat = computeDailySatisfaction(record.metricActive, record.day, {
      applySwitchPenalty,
    });

    const resolvedResults = resolveDayStudies(
      record.studiesQueued,
      record.metricActive,
      record.day,
      dailySat,
      { applySwitchPenalty },
    );

    const completedRecord: DayRecord = {
      ...record,
      results: resolvedResults,
      dailySatisfaction: dailySat,
    };

    setDays((prev) => [...prev, completedRecord]);
    setBudget((b) => b - pendingCost);
    setAggregateSatisfaction((prev) => [...prev, dailySat]);
    setCurrentDay((d) => d + 1);
    setPendingQueue([]);
    setMetricChangedToday(false);
    if (applySwitchPenalty) setSwitchedMetricOnDay(null);
  };

  const confirmEnding = () => {
    setPhase("end");
  };

  const hasReportedCompletionRef = useRef(false);
  useEffect(() => {
    if (phase !== "end" || hasReportedCompletionRef.current) return;
    hasReportedCompletionRef.current = true;
    onChapterComplete?.({ completed: true, passed: true, scoreLabel: fairnessMetric });
  }, [phase, fairnessMetric, onChapterComplete]);

  const resetGame = () => {
    setPhase("intro");
    setIntroIndex(0);
    setCurrentDay(0);
    setFairnessMetric("equal_rates");
    setMetricChangedToday(false);
    setSwitchedMetricOnDay(null);
    setBudget(STARTING_BUDGET);
    setAggregateSatisfaction([]);
    setDays([]);
    setPendingQueue([]);
  };

  const narrativeText = useMemo(() => {
    if (phase === "intro") return INTRO_CHUNKS[introIndex] ?? "";
    if (phase === "end") return "Term complete. The fairness metric you confirmed determines how the courthouse remembers this deployment.";
    if (isFinalDay) {
      return "Final night: review last night’s studies, then confirm the fairness metric that will define the system’s deployment outcome.";
    }
    if (currentDay === 0) {
      return "Day 0 — planning night. Choose your fairness metric and queue studies. No results yet; advance when your queue is ready.";
    }
    return `Day ${currentDay}. Review overnight findings, adjust your metric if you have not already today, then queue studies for tomorrow.`;
  }, [phase, introIndex, currentDay, isFinalDay]);

  const portraitSrc = useMemo(() => getPortrait(narrativeText), [narrativeText]);

  const chapterBackground = useMemo(() => {
    if (phase === "game") return CHAPTER1_BACKGROUNDS.cityMapTable;
    if (phase === "end") return CHAPTER1_BACKGROUNDS.modelTraining;
    return CHAPTER1_BACKGROUNDS.caseRoom;
  }, [phase]);

  const phaseStyle = { "--chapter-bg": `url(${chapterBackground})` } as CSSProperties;

  const dialogueHistory = useMemo(
    () => [{ text: narrativeText, passageId: `${phase}-${currentDay}`, current: true }],
    [narrativeText, phase, currentDay],
  );

  const handleIntroAdvance = () => {
    if (introIndex < INTRO_CHUNKS.length - 1) {
      setIntroIndex((i) => i + 1);
    } else {
      setPhase("game");
    }
  };

  const metricLocked = !isFinalDay && metricChangedToday;

  const gamePanel =
    phase === "game" ? (
      <>
        <GameHud currentDay={currentDay} budget={budget} dailySatisfaction={latestDaily} />
        <StudyResultsPanel results={overnightResults} fromNight={overnightFromNight} />
        <DaySummaryPanel
          currentDay={currentDay}
          dailySatisfaction={latestDaily}
          aggregateSatisfaction={aggregateScore}
          queuedTonight={pendingQueue.length}
          queueCost={pendingCost}
        />
        <FairnessMetricSelector
          active={fairnessMetric}
          locked={metricLocked}
          showLockNotice={!isFinalDay}
          onSelect={handleMetricSelect}
        />
        {!isFinalDay && (
          <StudyQueuePanel
            pendingQueue={pendingQueue}
            budget={budget}
            disabled={false}
            onToggle={toggleQueue}
          />
        )}
        {isFinalDay && (
          <p className={styles.day3Copy}>
            This is your final decision. The fairness metric you confirm will determine the system&apos;s deployment
            outcome.
          </p>
        )}
        <div className={styles.dayActions}>
          {!isFinalDay ? (
            <button
              type="button"
              className={styles.primaryBtn}
              onClick={advanceDay}
              disabled={!canAdvance}
            >
              Advance to Day {currentDay + 1} →
            </button>
          ) : (
            <button type="button" className={styles.primaryBtn} onClick={confirmEnding}>
              Confirm & see outcome →
            </button>
          )}
        </div>
      </>
    ) : null;

  const endPanel =
    phase === "end" ? (
      <EndgamePanel
        dailyHistory={aggregateSatisfaction}
        finalFairness={fairnessMetric}
        finalBudget={budget}
        onReplay={resetGame}
        onNextChapter={() => setSearchParams({ chapter: "ch3" })}
      />
    ) : null;

  return (
    <div className={`${styles.phase} ${styles.phaseWithBackground}`} style={phaseStyle}>
      <div className={styles.scene}>
        <div className={styles.sceneInner}>
          {gamePanel}
          {endPanel}
        </div>
      </div>

      <Chatbox
        text={narrativeText}
        portraitSrc={portraitSrc}
        history={dialogueHistory}
        onAdvance={phase === "intro" ? handleIntroAdvance : undefined}
        speakerName="Pretrial clerk"
        disableKeyboardAdvance={phase !== "intro"}
        disablePreviousNavigation
      />
    </div>
  );
}
