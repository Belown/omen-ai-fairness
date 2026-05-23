import { portraits } from "../../../../assets/detective/portraits";
import {
  ENDING_PANELS,
  FINAL_LINE,
  OUTCOME_BEST,
  OUTCOME_KEEP,
  type EndingPanel,
} from "../chapter2Ending";
import styles from "./EndingSequence.module.css";

type EndingPhase = "narrative" | "outcome-best" | "outcome-keep";

type EndingSequenceProps = {
  panelIndex: number;
  phase: EndingPhase;
  onAdvance: () => void;
  onChooseBest: () => void;
  onChooseKeep: () => void;
  onReplay: () => void;
  onNextChapter: () => void;
};

function renderPanel(panel: EndingPanel) {
  if (panel.type === "text") {
    return <p className={styles.body}>{panel.content}</p>;
  }
  if (panel.type === "section") {
    return (
      <>
        <h2 className={styles.sectionHead}>{panel.header}</h2>
        <p className={styles.body}>{panel.content}</p>
      </>
    );
  }
  if (panel.type === "list") {
    return (
      <>
        {panel.header && <h2 className={styles.sectionHead}>{panel.header}</h2>}
        {panel.intro && <p className={styles.body}>{panel.intro}</p>}
        <ol className={styles.list}>
          {panel.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
        {panel.content && <p className={styles.body}>{panel.content}</p>}
      </>
    );
  }
  return null;
}

export default function EndingSequence({
  panelIndex,
  phase,
  onAdvance,
  onChooseBest,
  onChooseKeep,
  onReplay,
  onNextChapter,
}: EndingSequenceProps) {
  if (phase === "outcome-best" || phase === "outcome-keep") {
    const outcome = phase === "outcome-best" ? OUTCOME_BEST : OUTCOME_KEEP;
    return (
      <div className={styles.sequence}>
        <article className={styles.card}>
          <div className={styles.whiskersRow}>
            <img src={portraits.neutral} alt="" className={styles.portrait} />
            <div>
              <p className={styles.speaker}>Whiskers Holmes</p>
              <h2 className={styles.outcomeTitle}>{outcome.title}</h2>
              <p className={styles.body}>{outcome.body}</p>
            </div>
          </div>
          <p className={styles.finalLine}>{FINAL_LINE}</p>
          <div className={styles.actions}>
            <button type="button" className={styles.secondary} onClick={onReplay}>
              Replay chapter
            </button>
            <button type="button" className={styles.primary} onClick={onNextChapter}>
              Continue timeline
            </button>
          </div>
        </article>
      </div>
    );
  }

  const panel = ENDING_PANELS[panelIndex];
  const isDecision = panel?.type === "decision";
  const displayPanel = isDecision ? null : panel;

  return (
    <div className={styles.sequence}>
      <article className={styles.card}>
        <p className={styles.progress}>
          {isDecision ? "Your decision" : `${panelIndex + 1} / ${ENDING_PANELS.length}`}
        </p>
        <div className={styles.whiskersRow}>
          <img src={portraits.serious} alt="" className={styles.portrait} />
          <div>
            <p className={styles.speaker}>Whiskers Holmes</p>
            {isDecision ? (
              <>
                <p className={styles.body}>What will you do with what you&apos;ve learned?</p>
                <div className={styles.actions}>
                  <button type="button" className={styles.primary} onClick={onChooseBest}>
                    Apply Best Practices →
                  </button>
                  <button type="button" className={styles.secondary} onClick={onChooseKeep}>
                    Keep My Current System →
                  </button>
                </div>
              </>
            ) : (
              displayPanel && renderPanel(displayPanel)
            )}
          </div>
        </div>
        {!isDecision && (
          <div className={styles.actions}>
            <button type="button" className={styles.primary} onClick={onAdvance}>
              Continue →
            </button>
          </div>
        )}
      </article>
    </div>
  );
}
