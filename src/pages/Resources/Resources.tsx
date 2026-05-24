import Nav from "../../components/Nav/Nav";
import Footer from "../../components/Footer/Footer";
import styles from "./Resources.module.css";

const RESOURCE_ITEMS = [
  "Lesson plan",
  "Worksheets",
  "Facilitation guide",
  "Setup instructions",
  "Source code repository link",
];

export default function Resources() {
  return (
    <>
      <Nav />
      <main className={styles.page}>
        <section className={styles.hero}>
          <p className="eyebrow">Resources</p>
          <h1 className={styles.title}>Teaching materials and practical setup.</h1>
          <p className={styles.lede}>
            Placeholder page for the lesson plan, worksheets, facilitation guide, setup instructions,
            and repository link. This section will document how to run a classroom or workshop session.
          </p>
        </section>

        <section className={styles.layout} aria-label="Resource placeholders">
          <div className={styles.panel}>
            <div className={styles.sectionHeader}>
              <p className="eyebrow">PDF slot</p>
              <h2>Resource packet preview</h2>
              <p>
                Add the final PDF file or hosted PDF URL here when the teaching packet is ready.
              </p>
            </div>
            <div className={styles.pdfSlot}>
              <span>PDF placeholder</span>
            </div>
          </div>

          <aside className={styles.panel}>
            <div className={styles.sectionHeader}>
              <p className="eyebrow">To add</p>
              <h2>Submission materials</h2>
            </div>
            <ul className={styles.resourceList}>
              {RESOURCE_ITEMS.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </aside>
        </section>
      </main>
      <Footer />
    </>
  );
}
