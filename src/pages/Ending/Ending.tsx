import Nav from "../../components/Nav/Nav";
import styles from "./Ending.module.css";
import goodImage from "../../assets/image/ending-good.jpg";
import badImage from "../../assets/image/ending-bad.jpg";

function EndingPage({ imageSrc, text }: { imageSrc: string; text: string }) {
  return (
    <div className={styles.shell}>
      <Nav investigation />
      <div className={styles.page}>
        <img className={styles.bg} src={imageSrc} alt="" aria-hidden />
        <div className={styles.overlay} />
        <div className={styles.content}>
          {text}
        </div>
      </div>
    </div>
  );
}

export function GoodEnding() {
  return (
    <EndingPage
      imageSrc={goodImage}
      text="I did it! As I stepped through the portal, a beautiful sunrise was illuminating the city. I didn't waste a single second and rushed home. To my relief, the lights were turned on. I stormed into the house and immediately called out for Ron. As soon as I saw him, I threw my arms around him. Everything is finally back to normal.."
    />
  );
}

export function BadEnding() {
  return (
    <EndingPage
      imageSrc={badImage}
      text="Unfortunately, my efforts were not enough to alter the course of events... After returning to the present, I ran to my house hoping to see Ron there, safe and sound. But when I arrived, no lights were on. I stepped to the entrance and found a box on the floor with a note stuck to it. They were Ron's personal belongings, returned to the immediate family as dictated by protocol. He will never return..."
    />
  );
}
