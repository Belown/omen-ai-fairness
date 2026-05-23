import { portraits } from "../../../../assets/detective/portraits";
import styles from "./WhiskersDialogue.module.css";

type WhiskersDialogueProps = {
  text: string;
};

export default function WhiskersDialogue({ text }: WhiskersDialogueProps) {
  return (
    <div className={styles.block}>
      <img src={portraits.thoughtful} alt="" className={styles.portrait} />
      <div className={styles.body}>
        <p className={styles.speaker}>Whiskers Holmes</p>
        <p className={styles.text}>{text}</p>
      </div>
    </div>
  );
}
