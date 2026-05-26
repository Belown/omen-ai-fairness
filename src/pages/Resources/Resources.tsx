import { useState } from "react";
import Nav from "../../components/Nav/Nav";
import Footer from "../../components/Footer/Footer";
import styles from "./Resources.module.css";

const PDF_RESOURCES = [
  {
    title: "Lesson plan",
    label: "Classroom flow",
    body: "A structured plan for timing, activity flow, discussion moments, and learning objectives.",
    file: `${import.meta.env.BASE_URL}Lesson%20Plan.pdf`,
  },
  {
    title: "Facilitation guide",
    label: "Instructor notes",
    body: "Guidance for setup, prompts, reflection questions, and supporting learners during the session.",
    file: `${import.meta.env.BASE_URL}Facilitator%20Notes.pdf`,
  },
];

export default function Resources() {
  const [activeResource, setActiveResource] = useState(PDF_RESOURCES[0]);

  return (
    <>
      <Nav />
      <main className={styles.page}>
        <section className={styles.hero}>
          <p className="eyebrow">Resources</p>
          <h1 className={styles.title}>Teaching materials and practical setup.</h1>
        </section>

        <section className={styles.resources} aria-label="Teaching resources">
          <div className={styles.sectionHeader}>
            <p className="eyebrow">Teaching documents</p>
            <h2>Preview one document at a time.</h2>
            <p>
              Select the lesson plan or facilitation guide to inspect the material before a session.
            </p>
          </div>

          <div className={styles.resourcePicker} role="tablist" aria-label="PDF resource selector">
            {PDF_RESOURCES.map((resource) => (
              <button
                key={resource.title}
                type="button"
                role="tab"
                aria-selected={activeResource.title === resource.title}
                className={`${styles.resourceTab} ${
                  activeResource.title === resource.title ? styles.resourceTabActive : ""
                }`}
                onClick={() => setActiveResource(resource)}
              >
                {resource.title}
              </button>
            ))}
          </div>

          <article className={styles.pdfCard}>
            <div className={styles.pdfHeader}>
              <span>{activeResource.label}</span>
              <h3>{activeResource.title}</h3>
              <p>{activeResource.body}</p>
            </div>
            {activeResource.file ? (
              <iframe
                className={styles.pdfFrame}
                src={activeResource.file}
                title={`${activeResource.title} PDF`}
              />
            ) : (
              <div className={styles.pdfSlot}>
                <span>{activeResource.title} pending</span>
              </div>
            )}
          </article>
        </section>
      </main>
      <Footer />
    </>
  );
}
