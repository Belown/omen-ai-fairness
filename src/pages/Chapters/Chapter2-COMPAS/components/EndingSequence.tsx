import { useEffect } from "react";
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

function parseContent(content: string) {
  const paragraphs: string[] = [];
  const bullets: string[] = [];

  content.split("\n").forEach((rawLine) => {
    const line = rawLine.trim();
    if (!line) return;
    if (line.startsWith("- ")) {
      bullets.push(line.slice(2));
    } else {
      paragraphs.push(line);
    }
  });

  return { paragraphs, bullets };
}

function renderPanel(panel: EndingPanel) {
  if (panel.type === "text") {
    return (
      <>
        {panel.header && <h2 className={styles.sectionHead}>{panel.header}</h2>}
        <p className={styles.statementCard}>{panel.content}</p>
      </>
    );
  }
  if (panel.type === "section") {
    const { paragraphs, bullets } = parseContent(panel.content);
    return (
      <>
        <h2 className={styles.sectionHead}>{panel.header}</h2>
        <div className={styles.sectionStack}>
          {paragraphs.map((paragraph) => (
            <p key={paragraph} className={styles.body}>
              {paragraph}
            </p>
          ))}
          {bullets.length > 0 && (
            <ul className={styles.pointGrid}>
              {bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          )}
        </div>
      </>
    );
  }
  if (panel.type === "list") {
    return (
      <>
        {panel.header && <h2 className={styles.sectionHead}>{panel.header}</h2>}
        {panel.intro && <p className={styles.body}>{panel.intro}</p>}
        <ol className={styles.reasonGrid}>
          {panel.items.map((item, index) => (
            <li key={item}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              {item}
            </li>
          ))}
        </ol>
        {panel.content && <p className={styles.callout}>{panel.content}</p>}
      </>
    );
  }
  if (panel.type === "recommendations") {
    return (
      <>
        <h2 className={styles.sectionHead}>{panel.header}</h2>
        <p className={styles.body}>{panel.intro}</p>
        <div className={styles.recommendationGrid}>
          {panel.items.map((item, index) => (
            <article key={item.title} className={styles.recommendationCard}>
              <span className={styles.recommendationNum}>{String(index + 1).padStart(2, "0")}</span>
              <h3 className={styles.recommendationTitle}>{item.title}</h3>
              <ul className={styles.recommendationList}>
                {item.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
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
  useEffect(() => {
    const htmlOverflow = document.documentElement.style.overflow;
    const bodyOverflow = document.body.style.overflow;

    window.scrollTo(0, 0);
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    return () => {
      document.documentElement.style.overflow = htmlOverflow;
      document.body.style.overflow = bodyOverflow;
    };
  }, []);

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
  const isWidePanel =
    displayPanel?.type === "recommendations" ||
    displayPanel?.type === "list" ||
    displayPanel?.type === "section";

  return (
    <div className={styles.sequence}>
      <article className={`${styles.card} ${isWidePanel ? styles.cardWide : ""}`}>
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
