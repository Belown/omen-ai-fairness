import styles from "./SatisfactionCircles.module.css";
import {
  satisfactionColor,
  type SatisfactionScores,
  type StakeholderGroup,
} from "../chapter2Simulation";

const GROUP_META: Array<{
  id: StakeholderGroup;
  label: string;
  endgameLabel: string;
  emoji: string;
}> = [
  { id: "judges", label: "Judges", endgameLabel: "Judges", emoji: "👨‍⚖️" },
  { id: "black", label: "Black", endgameLabel: "Black defendants", emoji: "🧑🏿" },
  { id: "white", label: "White", endgameLabel: "White defendants", emoji: "🧑🏻" },
];

type SatisfactionCirclesProps = {
  daily: SatisfactionScores | null;
  aggregate?: SatisfactionScores | null;
  variant: "hud" | "summary" | "endgame";
};

function Circle({ score, colorScore }: { score: number | null; colorScore?: number }) {
  if (score == null) {
    return (
      <div className={styles.circle} style={{ background: "rgba(25, 28, 31, 0.25)" }}>
        —
      </div>
    );
  }
  const fill = colorScore ?? score;
  return (
    <div className={styles.circle} style={{ background: satisfactionColor(fill) }}>
      {Math.round(score)}%
    </div>
  );
}

export default function SatisfactionCircles({ daily, aggregate, variant }: SatisfactionCirclesProps) {
  if (variant === "endgame" && daily && aggregate) {
    return (
      <div className={styles.endgameBlock}>
        {GROUP_META.map(({ id, endgameLabel, emoji }) => (
          <div key={id} className={styles.endgameRow}>
            <div className={styles.item}>
              <span className={styles.emoji} aria-hidden>
                {emoji}
              </span>
              <Circle score={daily[id]} colorScore={aggregate[id]} />
              <span className={styles.label}>{endgameLabel}</span>
            </div>
            <p className={styles.endgameText}>
              <strong>{endgameLabel}:</strong> Daily {daily[id].toFixed(0)}% | Overall{" "}
              {aggregate[id].toFixed(0)}%
            </p>
          </div>
        ))}
      </div>
    );
  }

  if (variant === "summary") {
    return (
      <div className={styles.row}>
        {GROUP_META.map(({ id, label }) => (
          <div key={id} className={styles.item}>
            <Circle score={daily?.[id] ?? null} />
            <span className={styles.label}>{label}</span>
            {daily && aggregate && (
              <span className={styles.detail}>
                Daily {daily[id].toFixed(0)}%
                <br />
                Overall {aggregate[id].toFixed(0)}%
              </span>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={styles.row}>
      {GROUP_META.map(({ id, label }) => (
        <div key={id} className={styles.item}>
          <Circle score={daily?.[id] ?? null} />
          <span className={styles.label}>{label}</span>
        </div>
      ))}
    </div>
  );
}
