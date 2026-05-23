import { useEffect, useRef, useState, type RefObject } from "react";
import { portraits } from "../../../../assets/detective/portraits";
import { TUTORIAL_STEPS, type TutorialSpotlight, type TutorialStep } from "../chapter2Tutorial";
import styles from "./TutorialOverlay.module.css";

type TutorialOverlayProps = {
  stepIndex: number;
  onNext: () => void;
  onComplete: () => void;
  onSkip?: () => void;
  spotlightRefs: Record<TutorialSpotlight, RefObject<HTMLElement | null>>;
};

export default function TutorialOverlay({
  stepIndex,
  onNext,
  onComplete,
  onSkip,
  spotlightRefs,
}: TutorialOverlayProps) {
  const step = TUTORIAL_STEPS[stepIndex];
  const [spotRect, setSpotRect] = useState<DOMRect | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => {
      if (!step || step.spotlight === "none" || step.spotlight === "frame") {
        setSpotRect(null);
        return;
      }
      const el = spotlightRefs[step.spotlight]?.current;
      if (el) {
        setSpotRect(el.getBoundingClientRect());
      } else {
        setSpotRect(null);
      }
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [step, spotlightRefs, stepIndex]);

  if (!step) return null;

  const isLast = stepIndex === TUTORIAL_STEPS.length - 1;

  const handlePrimary = () => {
    if (isLast) onComplete();
    else onNext();
  };

  return (
    <div className={styles.overlay} ref={overlayRef} role="dialog" aria-modal aria-label="Tutorial">
      {step.spotlight === "frame" || step.spotlight === "none" ? (
        <div className={styles.backdrop} />
      ) : spotRect ? (
        <div
          className={styles.spotlight}
          style={{
            top: spotRect.top - 6,
            left: spotRect.left - 6,
            width: spotRect.width + 12,
            height: spotRect.height + 12,
          }}
        />
      ) : (
        <div className={styles.backdrop} />
      )}

      <div className={styles.bubble}>
        <p className={styles.stepIndicator}>
          Step {stepIndex + 1} of {TUTORIAL_STEPS.length}
        </p>
        {step.whiskersText && (
          <div className={styles.whiskersRow}>
            <img src={portraits.thoughtful} alt="" className={styles.portrait} />
            <div>
              <p className={styles.whiskersName}>Whiskers Holmes</p>
              <p className={styles.whiskersText}>{step.whiskersText}</p>
            </div>
          </div>
        )}

        {step.infoCards?.map((card) => (
          <div key={card.title} className={styles.infoCard}>
            <p className={styles.infoTitle}>{card.title}</p>
            <p className={styles.infoBody}>{card.body}</p>
            {card.bullets && (
              <ul className={styles.infoList}>
                {card.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            )}
          </div>
        ))}

        <div className={styles.actions}>
          {onSkip && (
            <button type="button" className={styles.skipBtn} onClick={onSkip}>
              {stepIndex === 0 ? "Skip tutorial" : "Skip"}
            </button>
          )}
          <button type="button" className={styles.nextBtn} onClick={handlePrimary}>
            {step.buttonLabel ?? (isLast ? "Start Day 0 →" : "Next →")}
          </button>
        </div>
      </div>
    </div>
  );
}
