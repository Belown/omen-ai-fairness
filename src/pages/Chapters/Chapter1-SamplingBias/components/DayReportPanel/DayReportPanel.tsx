import { useEffect, useMemo, useState } from "react";
import { ZONE_VISUALS } from "../../../../../assets/image/image";
import shared from "../../../../../styles/shared.module.css";
import { REGIONS } from "../../chapterData";
import styles from "./DayReportPanel.module.css";
import { useTutorial, type TutorialStep } from "../../hooks/useTutorial";
import TutorialPopover from "../Tutorial/TutorialPopover";
import TutorialDebugOverlay from "../Tutorial/TutorialDebugOverlay";

type DayReportPanelProps = {
  dayNumber: 1 | 2 | 3;
  overallAcc: number;
  previousAcc?: number;
  regionAccs: number[];
  sampledFlags: boolean[];
  zoneSamples?: number[];
  usefulSignal?: number;
  noiseSignal?: number;
  biasSignal?: number;
  todaySampledFlags?: boolean[];
  todayZoneSamples?: number[];
  todayUsefulSignal?: number;
  todayNoiseSignal?: number;
  todayBiasSignal?: number;
  continueLabel?: string;
  onContinue?: () => void;
  tutorialEnabled?: boolean;
  tutorialDebugEnabled?: boolean;
  onTutorialOpenChange?: (open: boolean) => void;
  onTutorialDismiss?: () => void;
};

const districtCode = (index: number) => ["UP", "DT", "FZ", "SL"][index] ?? "RG";
const districtName = (label: string) => label.replace(/\s+/g, " ").trim();

type TutorialTarget = "overall" | "districts" | "narrative" | "continue" | "help";

const TUTORIAL_STEPS: TutorialStep<TutorialTarget>[] = [
  {
    target: "overall",
    title: "Overall checkpoint",
    body: "This is the model's current accuracy after today's committed patrols. Low scores mean the dataset still has blind spots.",
    placement: "right",
  },
  {
    target: "districts",
    title: "District breakdown",
    body: "Each district shows its own confidence score. Compare sampled and unsampled districts before planning the next day.",
    placement: "right",
  },
  {
    target: "narrative",
    title: "Audit receipt",
    body: "This receipt shows the totals, the districts needing attention, and the next action to take.",
    placement: "left",
  },
  {
    target: "continue",
    title: "Proceed to the next day",
    body: "Use this button to move from the report into the next briefing.",
    placement: "top",
  },
  {
    target: "help",
    title: "Replay the guide",
    body: "Use this help button any time you want to reopen the day report walkthrough from the beginning.",
    placement: "bottom",
  },
];

export default function DayReportPanel({
  dayNumber,
  overallAcc,
  previousAcc = 0.5,
  regionAccs,
  sampledFlags,
  zoneSamples = [0, 0, 0, 0],
  usefulSignal = 0,
  noiseSignal = 0,
  biasSignal = 0,
  todaySampledFlags,
  todayZoneSamples,
  todayUsefulSignal,
  todayNoiseSignal,
  todayBiasSignal,
  continueLabel,
  onContinue,
  tutorialEnabled = true,
  tutorialDebugEnabled = false,
  onTutorialOpenChange,
  onTutorialDismiss,
}: DayReportPanelProps) {
  const [barValues, setBarValues] = useState([0, 0, 0, 0]);

  const tutorial = useTutorial(TUTORIAL_STEPS, {
    enabled: tutorialEnabled && dayNumber === 1,
    debugEnabled: tutorialDebugEnabled,
    onOpenChange: onTutorialOpenChange,
    onDismiss: onTutorialDismiss,
  });

  useEffect(() => {
    setBarValues([0, 0, 0, 0]);
    const timers = REGIONS.map((_, i) =>
      setTimeout(() => {
        setBarValues((prev) => {
          const next = [...prev];
          next[i] = Math.round((regionAccs[i] ?? 0) * 100);
          return next;
        });
      }, i * 120),
    );
    return () => timers.forEach(clearTimeout);
  }, [dayNumber, regionAccs]);

  const overallPct = Math.round(overallAcc * 100);
  const previousPct = Math.round(previousAcc * 100);
  const deltaPct = overallPct - previousPct;
  const deltaSign = deltaPct > 0 ? "+" : "";
  const deltaTone = deltaPct > 0 ? "up" : deltaPct < 0 ? "down" : "flat";
  const sampledCount = sampledFlags.filter(Boolean).length;
  const overallTone = overallPct >= 75 ? "good" : overallPct >= 60 ? "mid" : "low";
  const strongZones = useMemo(
    () => REGIONS.filter((_, i) => (regionAccs[i] ?? 0) >= 0.75).map((r) => districtName(r.label)),
    [regionAccs],
  );
  const lowZones = useMemo(
    () => REGIONS.filter((_, i) => (regionAccs[i] ?? 0) < 0.6).map((r) => districtName(r.label)),
    [regionAccs],
  );

  // ── Three-pillar check ───────────────────────────────────────────────────────
  type PillarStatus = "pass" | "partial" | "fail";

  // Pillar 1 — Coverage: 1 zone = fail, 2-3 = partial, 4 = pass
  const coverageStatus: PillarStatus =
    sampledCount === 4 ? "pass" : sampledCount >= 2 ? "partial" : "fail";
  const coverageValue = `${sampledCount} / 4`;

  // Pillar 2 — Sample size: based on average samples per sampled zone
  //   < 300 → 100-tier (fail), 300–700 → 500-tier (partial), > 700 → 1000-tier (pass)
  const sampledAccs = regionAccs.filter((_, i) => sampledFlags[i]);
  const sampledAvgPct = sampledAccs.length
    ? Math.round((sampledAccs.reduce((s, a) => s + a, 0) / sampledAccs.length) * 100)
    : 0;
  const sampledZoneSamples = zoneSamples.filter((_, i) => sampledFlags[i]);
  const avgZoneSamples = sampledZoneSamples.length
    ? sampledZoneSamples.reduce((s, n) => s + n, 0) / sampledZoneSamples.length
    : 0;
  const sampleStatus: PillarStatus =
    avgZoneSamples > 700 ? "pass" : avgZoneSamples >= 300 ? "partial" : "fail";
  const sampleValue = sampledCount > 0 ? `${sampledAvgPct}% avg` : "—";

  // Pillar 3 — Signal quality: no signals = fail, wrong only = partial, routine = pass
  const usedRoutine = usefulSignal > 0;
  const usedPhone   = noiseSignal  > 0;
  const usedPolice  = biasSignal   > 0;
  const varietyStatus: PillarStatus =
    usedRoutine && !usedPhone && !usedPolice ? "pass"
    : usedRoutine || usedPhone || usedPolice ? "partial"
    : "fail";
  const varietyValue = usedRoutine
    ? (usedPhone || usedPolice ? "Routine + noise" : "Routine only")
    : usedPhone || usedPolice
      ? "Noise / bias"
      : "None asked";

  const pillarIcon = (s: PillarStatus) => s === "pass" ? "✓" : s === "partial" ? "~" : "✗";

  // ── Hint stack — scoped to today's missions only ─────────────────────────────
  const hintSampledFlags  = todaySampledFlags  ?? sampledFlags;
  const hintZoneSamples   = todayZoneSamples   ?? zoneSamples;
  const hintUsefulSignal  = todayUsefulSignal  ?? usefulSignal;
  const hintNoiseSignal   = todayNoiseSignal   ?? noiseSignal;
  const hintBiasSignal    = todayBiasSignal    ?? biasSignal;

  const hintSampledCount  = hintSampledFlags.filter(Boolean).length;
  const hintUnseenZones   = REGIONS.filter((_, i) => !hintSampledFlags[i]).map((r) => districtName(r.label));
  const hintZoneSamplesFiltered = hintZoneSamples.filter((_, i) => hintSampledFlags[i]);
  const hintAvgZoneSamples = hintZoneSamplesFiltered.length
    ? hintZoneSamplesFiltered.reduce((s, n) => s + n, 0) / hintZoneSamplesFiltered.length
    : 0;
  const hintUsedRoutine   = hintUsefulSignal > 0;
  const hintUsedPhone     = hintNoiseSignal  > 0;
  const hintUsedPolice    = hintBiasSignal   > 0;

  const hintCoverageStatus: PillarStatus =
    hintSampledCount === 4 ? "pass" : hintSampledCount >= 2 ? "partial" : "fail";
  const hintSampleStatus: PillarStatus =
    hintAvgZoneSamples > 700 ? "pass" : hintAvgZoneSamples >= 300 ? "partial" : "fail";
  const hintSignalStatus: PillarStatus =
    hintUsedRoutine && !hintUsedPhone && !hintUsedPolice ? "pass"
    : hintUsedRoutine || hintUsedPhone || hintUsedPolice ? "partial"
    : "fail";

  const coverageHint =
    hintSampledCount === 4
      ? "All 4 districts sampled — full city coverage."
      : hintSampledCount >= 2
        ? `${hintUnseenZones.join(", ")} unsampled. Adding more zones helps the model generalise across the city.`
        : "Only 1 district sampled — the model sees a single slice of the city. Expand to at least 2 zones.";

  const sampleHint =
    hintSampleStatus === "pass"
      ? "High sample volume — 1000-tier reached. Strongest possible evidence base."
      : hintSampleStatus === "partial"
        ? "500-tier samples — solid, but 1000 per zone is optimal if IP allows."
        : "Only 100-tier samples detected. Increase to 500 or 1000 per zone for reliable evidence.";

  const signalHint = (() => {
    if (hintUsedRoutine && !hintUsedPhone && !hintUsedPolice)
      return "Daily Routine selected — the most useful signal for this model. Keep it.";
    if (hintUsedRoutine && (hintUsedPhone || hintUsedPolice))
      return "Daily Routine helps, but Phone Model and Police Stops add noise or bias. Drop them for more budget.";
    if (!hintUsedRoutine && (hintUsedPhone || hintUsedPolice))
      return "Phone Model / Police Stops add noise without the right signal. Swap for Daily Routine instead.";
    return "No optional signals added. Daily Routine is the strongest available feature — include it next day.";
  })();

  const suggestedActions = useMemo(() => {
    if (dayNumber === 3) {
      if (overallPct >= 80) return ["Proceed to final verdict and deployment stress test.", "Document why this strategy worked for future retraining cycles."];
      return ["Proceed to final verdict and inspect transfer risk carefully.", "In future runs, expand coverage before increasing sample volume."];
    }

    const actions: string[] = [];
    if (sampledCount < 4) actions.push("Add at least one unsampled district tomorrow.");
    if (overallPct < 65) actions.push("Revisit which candidate signals deserve space in tomorrow's dataset.");
    if (actions.length === 0) actions.push("Keep broad coverage and avoid overfitting one district.");
    actions.push(`Prepare Day ${dayNumber + 1} mission with balanced distribution.`);
    return actions;
  }, [dayNumber, overallPct, sampledCount]);

  const confidenceLabel = (score: number) => {
    if (score >= 75) return "Strong confidence";
    if (score >= 60) return "Moderate confidence";
    return "Weak confidence";
  };

  return (
    <section className={`${styles.reportRoot} ${tutorial.open ? styles.reportRootTutorialActive : ""}`}>
      <div className={styles.helpButtonSlot}>
        <div className={tutorial.getTargetClass("help", styles.helpButtonTarget)}>
          <button
            type="button"
            className={styles.helpButton}
            onClick={tutorial.restart}
            aria-label="Replay day report intro"
            data-tooltip="Replay intro tutorial"
          >
            ?
          </button>
        </div>
      </div>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Case File · Temporal Bias Unit</p>
          <h2 className={styles.title}>Day {dayNumber} Investigation Report</h2>
          <p className={styles.subtitle}>
            {dayNumber < 3
              ? "End-of-day model checkpoint before next patrol deployment."
              : "Final field-day report before full city verdict review."}
          </p>
        </div>
      </header>

      <div className={styles.overallPillSlot}>
        <div className={tutorial.getTargetClass("overall", styles.overallPillTarget)}>
          <div className={`${styles.overallPill} ${styles[`overallPill_${overallTone}`]}`}>
            <span className={styles.overallLabel}>Overall Accuracy</span>
            <strong className={styles.overallValue}>{overallPct}%</strong>
            <span className={`${styles.overallDelta} ${styles[`overallDelta_${deltaTone}`]}`}>
              {deltaSign}{deltaPct}% vs. {dayNumber === 1 ? "baseline (50%)" : `Day ${dayNumber - 1}`}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.grid}>
        <article
          className={tutorial.getTargetClass("districts", styles.sectionCard)}
        >
          <p className={styles.sectionEyebrow}>District Breakdown</p>
          <div className={styles.zoneGrid}>
            {REGIONS.map((region, i) => (
              <div key={region.id} className={styles.zoneCard}>
                <img className={styles.zonePhoto} src={ZONE_VISUALS[i].image} alt={region.label} />
                <div className={styles.zoneInfo}>
                  <div className={styles.zoneTop}>
                    <img className={styles.zoneIcon} src={ZONE_VISUALS[i].icon} alt="" aria-hidden="true" />
                    <span className={styles.zoneLabel} style={{ color: region.color }}>
                      {i === 3 ? (
                        <>
                          <span className={styles.zoneCode}>{districtCode(i)} ·</span>
                          <span className={styles.zoneLabelBreak}>{region.label}</span>
                        </>
                      ) : (
                        `${districtCode(i)} · ${region.label}`
                      )}
                    </span>
                  </div>
                  <p className={styles.zoneScore} style={{ color: region.color }}>{barValues[i]}%</p>
                  <div className={styles.zoneTrack}>
                    <div
                      className={styles.zoneFill}
                      style={{ "--bar-width": `${barValues[i]}%`, background: region.color } as React.CSSProperties}
                    />
                  </div>
                  <p className={styles.zoneState} style={{ color: region.color }}>
                    {confidenceLabel(barValues[i])}
                  </p>
                  {!sampledFlags[i] && <p className={styles.zoneMeta}>Unsampled in committed plan</p>}
                </div>
              </div>
            ))}
          </div>
        </article>

        <article
          className={tutorial.getTargetClass("narrative", styles.sectionCard)}
        >
          <p className={styles.sectionEyebrow}>Audit Receipt</p>
          <div className={styles.receiptPaper}>
            <div className={styles.receiptHeader}>
              <span>Day {dayNumber} closed</span>
              <strong className={styles.receiptStamp}>Filed</strong>
            </div>

            <div className={styles.receiptRows} aria-label="Report totals">
              <div className={styles.receiptRow}>
                <span>Coverage</span>
                <span className={styles.pillarRight}>
                  <strong>{coverageValue}</strong>
                  <span className={`${styles.pillarBadge} ${styles[`pillarBadge_${coverageStatus}`]}`}>
                    {pillarIcon(coverageStatus)}
                  </span>
                </span>
              </div>
              <div className={styles.receiptRow}>
                <span>Sample size</span>
                <span className={styles.pillarRight}>
                  <strong>{sampleValue}</strong>
                  <span className={`${styles.pillarBadge} ${styles[`pillarBadge_${sampleStatus}`]}`}>
                    {pillarIcon(sampleStatus)}
                  </span>
                </span>
              </div>
              <div className={styles.receiptRow}>
                <span>Question variety</span>
                <span className={styles.pillarRight}>
                  <strong>{varietyValue}</strong>
                  <span className={`${styles.pillarBadge} ${styles[`pillarBadge_${varietyStatus}`]}`}>
                    {pillarIcon(varietyStatus)}
                  </span>
                </span>
              </div>
            </div>

            <div className={styles.hintStack}>
              <div className={`${styles.hintRow} ${styles[`hintRow_${hintCoverageStatus}`]}`}>
                <span className={`${styles.pillarBadge} ${styles[`pillarBadge_${hintCoverageStatus}`]}`}>
                  {pillarIcon(hintCoverageStatus)}
                </span>
                <div>
                  <strong>Coverage</strong>
                  <p>{coverageHint}</p>
                </div>
              </div>
              <div className={`${styles.hintRow} ${styles[`hintRow_${hintSampleStatus}`]}`}>
                <span className={`${styles.pillarBadge} ${styles[`pillarBadge_${hintSampleStatus}`]}`}>
                  {pillarIcon(hintSampleStatus)}
                </span>
                <div>
                  <strong>Sample size</strong>
                  <p>{sampleHint}</p>
                </div>
              </div>
              <div className={`${styles.hintRow} ${styles[`hintRow_${hintSignalStatus}`]}`}>
                <span className={`${styles.pillarBadge} ${styles[`pillarBadge_${hintSignalStatus}`]}`}>
                  {pillarIcon(hintSignalStatus)}
                </span>
                <div>
                  <strong>Signals</strong>
                  {!hintUsedRoutine && !hintUsedPhone && !hintUsedPolice ? (
                    <p>{signalHint}</p>
                  ) : (
                    <>
                      <div className={styles.signalTagRow}>
                        {hintUsedRoutine && (
                          <span className={styles.signalTagCorrect}>✓ Daily Routine</span>
                        )}
                        {hintUsedPhone && (
                          <span className={styles.signalTagNoise}>⚡ Phone Model — noise</span>
                        )}
                        {hintUsedPolice && (
                          <span className={styles.signalTagBias}>⚠ Past Police Stops — bias</span>
                        )}
                      </div>
                      <p className={styles.signalSubHint}>{signalHint}</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className={styles.receiptSection}>
              <span className={styles.receiptSectionLabel}>Next action</span>
              <p>{suggestedActions[0]}</p>
              {suggestedActions[1] && <small>{suggestedActions[1]}</small>}
            </div>
          </div>
        </article>
      </div>

      {onContinue && continueLabel && (
        <div className={styles.continueRow}>
          <p className={shared.continueHint}>
            {dayNumber < 3 ? "Report filed. Move to the next patrol day when ready." : "Final field report filed. Review the closing verdict."}
          </p>
        </div>
      )}

      {onContinue && continueLabel && (
        <div className={styles.continueActionSlot}>
          <div className={tutorial.getTargetClass("continue", styles.continueTarget)}>
            <button
              type="button"
              className={shared.continueBtn}
              onClick={onContinue}
            >
              {continueLabel}
            </button>
          </div>
        </div>
      )}

      {tutorial.step && (
        <TutorialPopover
          open={tutorial.open}
          title={tutorial.step.title}
          body={tutorial.step.body}
          stepIndex={tutorial.stepIndex}
          totalSteps={tutorial.totalSteps}
          style={tutorial.popoverStyle}
          onSkip={tutorial.close}
          onBack={tutorial.goPrev}
          onNext={tutorial.goNext}
          titleId="day-report-tutorial-title"
          popoverRef={tutorial.registerPopover}
        />
      )}
      {tutorialDebugEnabled && tutorial.open && <TutorialDebugOverlay info={tutorial.debugInfo} />}
    </section>
  );
}
