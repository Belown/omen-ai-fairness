import { useMemo, type CSSProperties } from "react";
import { REGIONS } from "../../chapterData";
import { ZONE_VISUALS } from "../../../../../assets/image/image";
import styles from "./VerdictPanel.module.css";
import shared from "../../../../../styles/shared.module.css";

type VerdictPanelProps = {
  overallAcc: number;
  otherCityOvr: number;
  regionAccs: number[];
  otherCityAccs: number[];
  sampledFlags: boolean[];
  zoneSamples?: number[];
  committedCount: number;
  usefulSignal?: number;
  noiseSignal?: number;
  biasSignal?: number;
  pct: (value: number) => string;
  onRestart: () => void;
  onNextChapter: () => void;
};

type ScoreTone = "good" | "mid" | "low";

const WEAKEST_LABEL_THRESHOLD = 0.85;
const SCORE_TIE_EPSILON = 0.001;

type ScoreRingProps = {
  label: string;
  value: number;
  tone: ScoreTone;
  pct: (value: number) => string;
};

type TransferPanelProps = {
  overallAcc: number;
  otherCityOvr: number;
  transferDeltaLabel: string;
  transferDeltaTone: ScoreTone;
  pct: (value: number) => string;
};

type DistrictCardProps = {
  index: number;
  localScore: number;
  transferScore: number;
  sampled: boolean;
  isWeakest: boolean;
  pct: (value: number) => string;
};

const scoreTone = (value: number): ScoreTone => {
  if (value >= 0.75) return "good";
  if (value >= 0.6) return "mid";
  return "low";
};

const scoreStatus = (value: number) => {
  if (value >= 0.75) return "Strong";
  if (value >= 0.6) return "Watch";
  return "At Risk";
};

const districtName = (label: string) => label.replace(/\s+/g, " ").trim();

function ScoreRing({ label, value, tone, pct }: ScoreRingProps) {
  return (
    <div
      className={`${styles.scoreRing} ${styles[`scoreRing_${tone}`]}`}
      style={{ "--score": `${Math.round(value * 100)}%` } as CSSProperties}
      aria-label={`${label}: ${pct(value)}, ${scoreStatus(value)}`}
    >
      <div className={styles.scoreRingInner}>
        <span className={styles.scoreRingLabel}>{label}</span>
        <strong className={styles.scoreRingValue}>{pct(value)}</strong>
        <span className={styles.scoreRingStatus}>{scoreStatus(value)}</span>
      </div>
    </div>
  );
}

function TransferPanel({ overallAcc, otherCityOvr, transferDeltaLabel, transferDeltaTone, pct }: TransferPanelProps) {
  return (
    <section className={`${styles.transferPanel} ${styles[`transferPanel_${transferDeltaTone}`]}`}>
      <div className={styles.transferCopy}>
        <p className={styles.panelEyebrow}>Neighbor City Deployment</p>
        <h3>Same model, new city</h3>
        <p className={styles.deploymentNotice}>
          The model trained in Novus is now being deployed unchanged in a neighboring city. This transfer test
          checks whether the pattern it learned still works beyond the city that supplied the training data.
        </p>
      </div>

      <div className={styles.transferScoreDeck}>
        <ScoreRing label="Novus" value={overallAcc} tone={scoreTone(overallAcc)} pct={pct} />
        <ScoreRing label="Neighbor" value={otherCityOvr} tone={scoreTone(otherCityOvr)} pct={pct} />
        <div className={`${styles.transferDelta} ${styles[`transferDelta_${transferDeltaTone}`]}`}>
          <span>Transfer shift</span>
          <strong>{transferDeltaLabel}</strong>
        </div>
      </div>
    </section>
  );
}

function DistrictCard({ index, localScore, transferScore, sampled, isWeakest, pct }: DistrictCardProps) {
  const region = REGIONS[index];
  const visual = ZONE_VISUALS[index];
  const localTone = scoreTone(localScore);
  const transferTone = scoreTone(transferScore);
  const transferDrop = localScore - transferScore;
  const hasTransferDrop = transferDrop >= 0.08;
  const name = districtName(region.label);

  return (
    <article
      className={`${styles.districtCard} ${isWeakest ? styles.districtCardWeak : ""}`}
      style={{ "--district-color": region.color } as CSSProperties}
    >
      <div className={styles.districtVisual}>
        <img className={styles.districtImage} src={visual.image} alt="" aria-hidden="true" />
        <div className={styles.districtShade} />
        <img className={styles.districtIcon} src={visual.icon} alt="" aria-hidden="true" />
      </div>

      <div className={styles.districtInfo}>
        <div>
          <h3 className={styles.districtName}>{name}</h3>
          <p className={styles.districtDesc}>{region.desc}</p>
        </div>

        <div className={styles.badgeRow} aria-label={`${name} status`}>
          <span className={`${styles.badge} ${sampled ? styles.badgeGood : styles.badgeWarn}`}>
            {sampled ? "Sampled" : "Unsampled"}
          </span>
          {isWeakest ? <span className={`${styles.badge} ${styles.badgeDanger}`}>Weakest</span> : null}
          {hasTransferDrop ? <span className={`${styles.badge} ${styles.badgeWarn}`}>Transfer drop</span> : null}
        </div>

        <div className={styles.scorePair}>
          <div className={styles.scoreColumn}>
            <div className={styles.scoreMeta}>
              <span>Novus</span>
              <strong className={styles[`tone_${localTone}`]}>{pct(localScore)}</strong>
            </div>
            <div className={styles.miniTrack} aria-hidden="true">
              <div className={styles.miniFill} style={{ "--bar-width": `${Math.round(localScore * 100)}%` } as CSSProperties} />
            </div>
          </div>

          <div className={styles.scoreColumn}>
            <div className={styles.scoreMeta}>
              <span>Neighbor</span>
              <strong className={styles[`tone_${transferTone}`]}>{pct(transferScore)}</strong>
            </div>
            <div className={styles.miniTrack} aria-hidden="true">
              <div className={styles.miniFill} style={{ "--bar-width": `${Math.round(transferScore * 100)}%` } as CSSProperties} />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function VerdictPanel({
  overallAcc,
  otherCityOvr,
  regionAccs,
  otherCityAccs,
  sampledFlags,
  zoneSamples = [0, 0, 0, 0],
  usefulSignal = 0,
  noiseSignal = 0,
  biasSignal = 0,
  pct,
  onRestart,
  onNextChapter,
}: VerdictPanelProps) {
  const riskLevel = overallAcc >= 0.8 ? "Low Risk" : overallAcc >= 0.6 ? "Medium Risk" : "High Risk";
  const riskTone: ScoreTone = overallAcc >= 0.8 ? "good" : overallAcc >= 0.6 ? "mid" : "low";
  const showCelebration = riskTone === "good";

  const weakestRegionIndex = useMemo(
    () => regionAccs.reduce((minI, acc, i, arr) => (acc < arr[minI] ? i : minI), 0),
    [regionAccs],
  );
  const weakestScore = regionAccs[weakestRegionIndex] ?? 0;
  const showWeakestLabel = weakestScore < WEAKEST_LABEL_THRESHOLD;
  const weakestRegionIndices = useMemo(
    () =>
      showWeakestLabel
        ? regionAccs.flatMap((acc, index) =>
            Math.abs(acc - weakestScore) <= SCORE_TIE_EPSILON ? [index] : [],
          )
        : [],
    [regionAccs, showWeakestLabel, weakestScore],
  );
  const weakestRegionNames = weakestRegionIndices.map((index) => districtName(REGIONS[index].label));
  const sampledCount = sampledFlags.filter(Boolean).length;
  const unsampledRegions = REGIONS.filter((_, i) => !sampledFlags[i]);
  const transferDelta = otherCityOvr - overallAcc;
  const transferDeltaTone: ScoreTone = transferDelta >= -0.03 ? "good" : transferDelta >= -0.12 ? "mid" : "low";
  const transferDeltaLabel = `${transferDelta >= 0 ? "+" : ""}${Math.round(transferDelta * 100)} pts`;

  const conclusion =
    riskTone === "good"
      ? "Dataset held up well, deploy with monitoring."
      : riskTone === "mid"
        ? "Model improved, but review weak districts before rollout."
        : "Deployment should stop until coverage and transfer gaps are fixed.";

  const suggestedActions = useMemo(() => {
    const actions: string[] = [];
    if (sampledFlags.filter(Boolean).length < 4) actions.push("Run another investigation with full 4-district coverage.");
    if (otherCityOvr < 0.7) actions.push("Add transfer validation before deployment to a new city.");
    if (overallAcc < 0.75) actions.push("Review which collected signals strengthened the dataset and which ones distorted it.");
    if (!actions.length) actions.push("Keep this strategy as baseline and monitor drift each retraining cycle.");
    actions.push("Audit who gets misclassified, not just the average score.");
    return actions;
  }, [otherCityOvr, overallAcc, sampledFlags]);

  const primaryRecommendation = suggestedActions[0];
  const secondaryActions = suggestedActions.slice(1, 3);

  // ── Metric dimension cards ────────────────────────────────────────────────
  type DimStatus = "pass" | "partial" | "fail";
  const dimIcon = (s: DimStatus) => s === "pass" ? "✓" : s === "partial" ? "~" : "✗";

  const coverageDimStatus: DimStatus =
    sampledCount === 4 ? "pass" : sampledCount >= 2 ? "partial" : "fail";

  const sampledZoneSamples = zoneSamples.filter((_, i) => sampledFlags[i]);
  const avgZoneSamples = sampledZoneSamples.length
    ? sampledZoneSamples.reduce((s, n) => s + n, 0) / sampledZoneSamples.length
    : 0;
  const populationDimStatus: DimStatus =
    avgZoneSamples > 700 ? "pass" : avgZoneSamples >= 300 ? "partial" : "fail";

  const usedRoutine = usefulSignal > 0;
  const usedPhone   = noiseSignal  > 0;
  const usedPolice  = biasSignal   > 0;
  const signalDimStatus: DimStatus =
    usedRoutine && !usedPhone && !usedPolice ? "pass"
    : usedRoutine || usedPhone || usedPolice ? "partial"
    : "fail";

  return (
    <>
      {showCelebration && (
        <div className={styles.celebration} role="status" aria-live="polite">
          <div className={styles.celebrationRings} aria-hidden="true" />
          <div className={styles.celebrationBurst} aria-hidden="true">
            {Array.from({ length: 36 }).map((_, index) => (
              <span
                key={index}
                className={styles.celebrationParticle}
                style={{
                  "--particle-index": index,
                  "--particle-distance": `${140 + (index % 7) * 32}px`,
                  "--particle-hue": 138 + index * 13,
                  "--particle-delay": `${(index % 6) * 0.035}s`,
                } as CSSProperties}
              />
            ))}
          </div>
          <div className={styles.celebrationCard}>
            <span className={styles.celebrationSeal} aria-hidden="true">LOW RISK</span>
            <span className={styles.celebrationKicker}>Timeline stabilized</span>
            <strong>Congratulations</strong>
          </div>
        </div>
      )}

      <section className={`${styles.verdictHero} ${styles[`verdictHero_${riskTone}`]}`}>
        <div className={styles.heroCopy}>
          <p className={styles.panelEyebrow}>Case Closure · Day 3 Final Report</p>
          <h2 className={styles.verdictLabel}>{riskLevel}</h2>
          <p className={styles.heroSummary}>{conclusion}</p>

          <div className={styles.heroStats} aria-label="Verdict summary">
            <span className={styles.heroStat}>
              <strong>{pct(overallAcc)}</strong>
              Novus accuracy
            </span>
            <span className={styles.heroStat}>
              <strong>{sampledCount}/4</strong>
              districts sampled
            </span>
            {showWeakestLabel ? (
              <span className={styles.heroStat}>
                <strong>{weakestRegionNames.join(", ")}</strong>
                weakest {weakestRegionNames.length > 1 ? "districts" : "district"}
              </span>
            ) : (
              <span className={styles.heroStat}>
                <strong>All above 85%</strong>
                district floor
              </span>
            )}
          </div>
        </div>

      </section>

      <section className={styles.districtBoard}>
        <div className={styles.boardHeader}>
          <p className={styles.panelEyebrow}>District Comparison Board</p>
          <h3>Where the model holds, and where it breaks</h3>
        </div>

        <div className={styles.districtGrid}>
          {REGIONS.map((region, index) => (
            <DistrictCard
              key={region.id}
              index={index}
              localScore={regionAccs[index]}
              transferScore={otherCityAccs[index]}
              sampled={sampledFlags[index]}
              isWeakest={weakestRegionIndices.includes(index)}
              pct={pct}
            />
          ))}
        </div>
      </section>

      <TransferPanel
        overallAcc={overallAcc}
        otherCityOvr={otherCityOvr}
        transferDeltaLabel={transferDeltaLabel}
        transferDeltaTone={transferDeltaTone}
        pct={pct}
      />

      <section className={styles.insightBoard}>
        <div className={styles.statChipGrid} aria-label="What changed the verdict">
          <div className={styles.statChip}>
            <span className={styles.statIcon}>01</span>
            <span className={styles.statLabel}>Coverage</span>
            <strong className={styles.statValue}>{sampledCount}/4 districts</strong>
          </div>
          <div className={styles.statChip}>
            <span className={styles.statIcon}>02</span>
            <span className={styles.statLabel}>Transfer</span>
            <strong className={`${styles.statValue} ${styles[`tone_${transferDeltaTone}`]}`}>{transferDeltaLabel}</strong>
          </div>
          <div className={styles.statChip}>
            <span className={styles.statIcon}>03</span>
            <span className={styles.statLabel}>{showWeakestLabel ? "Weak point" : "District floor"}</span>
            <strong className={styles.statValue}>
              {showWeakestLabel
                ? `${weakestRegionNames.join(", ")} · ${pct(weakestScore)}`
                : "None · all above 85%"}
            </strong>
          </div>
          <div className={styles.statChip}>
            <span className={styles.statIcon}>04</span>
            <span className={styles.statLabel}>Unvisited</span>
            <strong className={styles.statValue}>
              {unsampledRegions.length ? unsampledRegions.map((region) => districtName(region.label)).join(", ") : "None"}
            </strong>
          </div>
        </div>

        <div className={`${styles.recommendation} ${styles[`recommendation_${riskTone}`]}`}>
          <span className={styles.recommendationKicker}>
            {riskTone === "good" ? "Recommended action" : riskTone === "mid" ? "Review before deploy" : "Stop deployment"}
          </span>
          <h3 className={styles.recommendationTitle}>{primaryRecommendation}</h3>
          <div className={styles.secondaryActions}>
            {secondaryActions.map((action) => (
              <span key={action} className={styles.secondaryAction}>{action}</span>
            ))}
          </div>
        </div>
      </section>

            <section className={styles.metricDimSection}>
        <div className={styles.boardHeader}>
          <p className={styles.panelEyebrow}>Strategy Dimensions</p>
          <h3>What each choice meant for sampling bias</h3>
        </div>
        <div className={styles.metricDimGrid}>

          <div className={`${styles.metricDimCard} ${styles[`metricDimCard_${coverageDimStatus}`]}`}>
            <div className={styles.metricDimTop}>
              <span className={styles.metricDimNum}>01</span>
              <span className={`${styles.metricDimBadge} ${styles[`metricDimBadge_${coverageDimStatus}`]}`}>
                {dimIcon(coverageDimStatus)}
              </span>
            </div>
            <p className={styles.metricDimIdea}>Completeness</p>
            <h4 className={styles.metricDimName}>Coverage</h4>
            <p className={styles.metricDimDesc}>
              A model trained only on certain districts learns patterns specific to those areas.
              Skipping a district means the model never sees that population — it misclassifies them by default, encoding geographic bias into every future prediction.
            </p>
          </div>

          <div className={`${styles.metricDimCard} ${styles[`metricDimCard_${populationDimStatus}`]}`}>
            <div className={styles.metricDimTop}>
              <span className={styles.metricDimNum}>02</span>
              <span className={`${styles.metricDimBadge} ${styles[`metricDimBadge_${populationDimStatus}`]}`}>
                {dimIcon(populationDimStatus)}
              </span>
            </div>
            <p className={styles.metricDimIdea}>Amount</p>
            <h4 className={styles.metricDimName}>Population</h4>
            <p className={styles.metricDimDesc}>
              Small samples are noisy — a handful of outliers can shift the learned boundary.
              Larger samples give the model a more representative view of each zone&apos;s true distribution, reducing the chance that rare edge cases dominate the pattern.
            </p>
          </div>

          <div className={`${styles.metricDimCard} ${styles[`metricDimCard_${signalDimStatus}`]}`}>
            <div className={styles.metricDimTop}>
              <span className={styles.metricDimNum}>03</span>
              <span className={`${styles.metricDimBadge} ${styles[`metricDimBadge_${signalDimStatus}`]}`}>
                {dimIcon(signalDimStatus)}
              </span>
            </div>
            <p className={styles.metricDimIdea}>Variety</p>
            <h4 className={styles.metricDimName}>Signal</h4>
            <p className={styles.metricDimDesc}>
              Features carry their own historical bias. Past Police Stops reflects prior enforcement patterns, not actual behaviour — including it teaches the model to replicate systemic inequity.
              Daily Routine is a more neutral signal that gives the model relevant, uncontaminated evidence.
            </p>
          </div>

        </div>
      </section>

      <div className={styles.continueRow}>
        <p className={shared.continueHint}>Case closed for this timeline. Reopen with a different strategy?</p>
        <div className={styles.actionRow}>
          <button type="button" className={shared.continueBtn} onClick={onRestart}>
            Restart from Day 1
          </button>
          <button type="button" className={shared.continueBtn} onClick={onNextChapter}>
            Go to Chapter 2
          </button>
        </div>
      </div>
    </>
  );
}
