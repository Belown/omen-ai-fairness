import Nav from "../../components/Nav/Nav";
import Footer from "../../components/Footer/Footer";
import styles from "./Tool.module.css";

export default function Tool() {
  return (
    <>
      <Nav />
      <main className={styles.page}>
        <section className={styles.hero}>
          <p className="eyebrow">Tool</p>
          <h1 className={styles.title}>Access, demo, and AI disclosure.</h1>
          <p className={styles.lede}>
            Placeholder page for the launch link, Recordly demo video, and notes about whether AI
            was used in the creation or operation of the tool.
          </p>
        </section>

        <section className={styles.layout} aria-label="Tool placeholders">
          <div className={styles.videoPanel}>
            <div className={styles.sectionHeader}>
              <p className="eyebrow">Demo video</p>
              <h2>YouTube embed slot</h2>
              <p>Add the final YouTube embed link here for the short demo video.</p>
            </div>
            <div className={styles.videoSlot}>
              <span>YouTube video placeholder</span>
            </div>
          </div>

          <aside className={styles.infoPanel}>
            <article>
              <span>Access and setup</span>
              <p>Placeholder for a launch button or link to the web-based game.</p>
            </article>
            <article>
              <span>App</span>
              <p>Recordly. Placeholder for the GitHub repository reference.</p>
            </article>
            <article>
              <span>AI disclosure</span>
              <p>Placeholder for Ines and Sophia to explain AI use in creation or operation.</p>
            </article>
          </aside>
        </section>
      </main>
      <Footer />
    </>
  );
}
