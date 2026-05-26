import { type MouseEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Nav from "../../components/Nav/Nav";
import Footer from "../../components/Footer/Footer";
import styles from "./About.module.css";

const NAV_OFFSET = 88;

const SECTIONS = [
  { id: "about-tool", label: "Tool" },
  { id: "audience", label: "Audience" },
  { id: "objectives", label: "Objectives" },
  { id: "rationale", label: "Design" },
  { id: "related-work", label: "Grounding" },
  { id: "team", label: "Team" },
  { id: "faq", label: "FAQ" },
];

const TEAM_MEMBERS = [
  { name: "Wanglei Shen",   caseId: "NVS-001", contributions: ["Chapter 1", "UI"] },
  { name: "Zihan Li",       caseId: "NVS-002", contributions: ["Chapter 1", "Eval"] },
  { name: "Ines Araujo",    caseId: "NVS-003", contributions: ["Chapter 2", "Assets"] },
  { name: "Sophia Kacem",   caseId: "NVS-004", contributions: ["Chapter 2", "Assets"] },
  { name: "Rui Wang",       caseId: "NVS-005", contributions: ["Chapter 3"] },
];

const OBJECTIVES = [
  "Explain how sampling bias can make a model look accurate on a narrow dataset while failing the wider population.",
  "Compare competing definitions of algorithmic fairness and recognize why they can conflict in recidivism prediction.",
  "Identify how human feedback and majority preference can shape LLM behavior, including whose values are amplified or ignored.",
  "Practice auditing an AI system as a chain of design decisions instead of treating bias as a single technical bug.",
];

type ChapterTag = "ch1" | "ch2" | "ch3" | "design";

type RelatedWork = {
  chapter: ChapterTag;
  title: string;
  authors: string;
  venue: string;
  url?: string;
  body: string;
  grounds: string;
};

const RELATED_WORKS: RelatedWork[] = [
  // Chapter 1 — Sampling Bias
  {
    chapter: "ch1",
    title: "Gender Shades: Intersectional Accuracy Disparities in Commercial Gender Classification",
    authors: "Buolamwini, J. & Gebru, T.",
    venue: "FAccT 2018",
    url: "https://proceedings.mlr.press/v81/buolamwini18a.html",
    body: "Audits commercial face classifiers and shows error rates spike on darker-skinned women, demonstrating that benchmark accuracy can hide subgroup failure.",
    grounds: "Chapter 1's core claim: a narrow training distribution can look accurate overall while silently failing minority groups.",
  },
  {
    chapter: "ch1",
    title: "A Framework for Understanding Sources of Harm throughout the Machine Learning Life Cycle",
    authors: "Suresh, H. & Guttag, J.",
    venue: "EAAMO 2021",
    url: "https://arxiv.org/abs/1901.10002",
    body: "Names six distinct sources of harm — including historical, representation, and measurement bias — that arise at different stages of the ML pipeline.",
    grounds: "Chapter 1's framing of bias as a chain of design choices rather than one technical bug.",
  },

  // Chapter 2 — COMPAS / fairness trade-offs
  {
    chapter: "ch2",
    title: "Machine Bias",
    authors: "Angwin, J., Larson, J., Mattu, S. & Kirchner, L.",
    venue: "ProPublica, 2016",
    url: "https://www.propublica.org/article/machine-bias-risk-assessments-in-criminal-sentencing",
    body: "The investigation that surfaced disparate false-positive rates in COMPAS recidivism risk scores between Black and white defendants.",
    grounds: "Chapter 2's central case study and the source of its recidivism scenario.",
  },
  {
    chapter: "ch2",
    title: "Fair Prediction with Disparate Impact: A Study of Bias in Recidivism Prediction Instruments",
    authors: "Chouldechova, A.",
    venue: "Big Data, 2017",
    url: "https://arxiv.org/abs/1610.07524",
    body: "Formal proof that calibration and equal false-positive/negative rates cannot all hold simultaneously when base rates differ.",
    grounds: "Chapter 2's lesson that competing fairness definitions can be mathematically incompatible.",
  },
  {
    chapter: "ch2",
    title: "Inherent Trade-Offs in the Fair Determination of Risk Scores",
    authors: "Kleinberg, J., Mullainathan, S. & Raghavan, M.",
    venue: "ITCS 2017",
    url: "https://arxiv.org/abs/1609.05807",
    body: "Independent impossibility result showing three natural fairness criteria can only coexist in degenerate cases.",
    grounds: "Reinforces Chapter 2's framing that fairness choices are value choices, not optimisation choices.",
  },

  // Chapter 3 — LLM alignment
  {
    chapter: "ch3",
    title: "Operationalizing Pluralistic Values in Large Language Model Alignment",
    authors: "Ali, D., Zhao, D., Koenecke, A. & Papakyriakopoulos, O.",
    venue: "AAAI 2025",
    url: "https://arxiv.org/abs/2511.14476",
    body: "Argues alignment pipelines should represent multiple value systems rather than collapsing to a single rater majority.",
    grounds: "Chapter 3's three-rater card-game frame (mainstream / overlooked / truth).",
  },
  {
    chapter: "ch3",
    title: "Towards Understanding Sycophancy in Language Models",
    authors: "Sharma, M. et al.",
    venue: "ICLR 2024",
    url: "https://arxiv.org/abs/2310.13548",
    body: "Shows RLHF-trained models drift toward agreeing with users even when the user is wrong.",
    grounds: "Chapter 3's sycophancy card bucket and the Approval-vs-Truth tension.",
  },
  {
    chapter: "ch3",
    title: "Robust Reinforcement Learning from Corrupted Human Feedback",
    authors: "Bukharin, A. et al.",
    venue: "NeurIPS 2024",
    url: "https://arxiv.org/abs/2406.15568",
    body: "Demonstrates that a small fraction of noisy or adversarial labels can steer the policy and proposes robust RLHF.",
    grounds: "Chapter 3's takeaway that human feedback is brittle and the rater pool matters.",
  },
  {
    chapter: "ch3",
    title: "Evaluating Large Language Model Biases in Persona-Steered Generation",
    authors: "Liu, A., Diab, M. & Fried, D.",
    venue: "ACL 2024 Findings",
    url: "https://aclanthology.org/2024.findings-acl.586/",
    body: "Persona prompts amplify stereotypes even when the underlying request is neutral.",
    grounds: "Chapter 3's cultural / stereotype card bucket.",
  },
  {
    chapter: "ch3",
    title: "Biased LLMs Can Influence Political Decision-Making",
    authors: "Fisher, J. et al.",
    venue: "ACL 2025",
    url: "https://aclanthology.org/2025.acl-long.328.pdf",
    body: "Exposure to politically-skewed model outputs measurably shifts user opinions.",
    grounds: "Chapter 3's political / persona card bucket and the real-world stakes of the Approval meter.",
  },
  {
    chapter: "ch3",
    title: "Human and LLM Biases in Hate Speech Annotations: A Socio-Demographic Analysis",
    authors: "Giorgi, S. et al.",
    venue: "AAAI ICWSM 2025",
    url: "https://ojs.aaai.org/index.php/ICWSM/article/view/35837",
    body: "Annotator demographics shape both the labels and the models trained on them.",
    grounds: "Chapter 3's Compassion meter: whose feedback ends up in the training signal.",
  },

  // Design precedents
  {
    chapter: "design",
    title: "Reigns",
    authors: "Nerial / Devolver Digital",
    venue: "Game, 2016",
    url: "https://www.nerial.co.uk/",
    body: "Swipe-based decision card game where every choice nudges four meters and any extreme triggers an ending.",
    grounds: "Direct mechanical reference for Chapter 3's card stack and meter cliffs.",
  },
  {
    chapter: "design",
    title: "Survival of the Best Fit",
    authors: "Park, J., Tu, J., Hu, J. & Subramonyam, H.",
    venue: "Web playable, 2019",
    url: "https://www.survivalofthebestfit.com/",
    body: "Browser game where the player hires by feel and watches a model amplify the resulting bias.",
    grounds: "Precedent for the no-code, situated, story-led format used across all three chapters.",
  },
];

const FAQS = [
  {
    question: "Do learners need to know how to code?",
    answer: "No. The prototype is designed as a no-code investigation where learners make choices, inspect outcomes, and reflect on trade-offs.",
  },
  {
    question: "How long does the activity take?",
    answer: "Placeholder: add the tested session length after classroom or user testing is complete.",
    placeholder: true,
  },
  {
    question: "Can this be used in class?",
    answer: "Yes, it is intended for guided AI fairness teaching. Placeholder: add facilitator notes, timing, and reflection prompts.",
    placeholder: true,
  },
  {
    question: "What data does the tool collect?",
    answer: "The tool can generate a local activity log after the post-test is finished, including examples such as chapter choices, assessment responses, and completion results. This log is downloaded to the user's device for review and is not uploaded to any server.",
  },
];

const CHAPTER_FILTERS: { id: ChapterTag | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "ch1", label: "Ch 1 · Sampling" },
  { id: "ch2", label: "Ch 2 · COMPAS" },
  { id: "ch3", label: "Ch 3 · Alignment" },
  { id: "design", label: "Design precedents" },
];

const CHAPTER_LABELS: Record<ChapterTag, string> = {
  ch1: "Ch 1",
  ch2: "Ch 2",
  ch3: "Ch 3",
  design: "Design",
};

export default function About() {
  const [activeSection, setActiveSection] = useState(SECTIONS[0].id);
  const [openFaqs, setOpenFaqs] = useState<Record<string, boolean>>({
    [FAQS[0].question]: true,
  });
  const [chapterFilter, setChapterFilter] = useState<ChapterTag | "all">("all");
  const [openCitations, setOpenCitations] = useState<Record<string, boolean>>({});

  useEffect(() => {
    document.documentElement.classList.add("aboutHideScrollbar");
    return () => document.documentElement.classList.remove("aboutHideScrollbar");
  }, []);

  useEffect(() => {
    const updateActiveSection = () => {
      const current = SECTIONS.reduce((best, section) => {
        const target = document.getElementById(section.id);
        if (!target) return best;

        const distance = Math.abs(target.getBoundingClientRect().top - NAV_OFFSET);
        return distance < best.distance ? { id: section.id, distance } : best;
      }, { id: SECTIONS[0].id, distance: Number.POSITIVE_INFINITY });

      setActiveSection(current.id);
    };

    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", updateActiveSection);
    return () => {
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", updateActiveSection);
    };
  }, []);

  const scrollToSection = (event: MouseEvent<HTMLButtonElement>, id: string) => {
    event.preventDefault();

    const target = document.getElementById(id);
    if (!target) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const top = Math.max(0, target.getBoundingClientRect().top + window.scrollY - NAV_OFFSET);
    window.scrollTo({ top, behavior: reduceMotion ? "auto" : "smooth" });
    window.history.pushState(null, "", `#${id}`);
    setActiveSection(id);
  };

  const expandAllFaqs = (open: boolean) => {
    setOpenFaqs(
      FAQS.reduce<Record<string, boolean>>((next, faq) => {
        next[faq.question] = open;
        return next;
      }, {}),
    );
  };

  return (
    <>
      <Nav />
      <main className={styles.page}>
        <nav className={styles.progressDots} aria-label="About page sections">
          {SECTIONS.map((section) => (
            <button
              key={section.id}
              type="button"
              className={`${styles.progressDot} ${activeSection === section.id ? styles.progressDotActive : ""}`}
              onClick={(event) => scrollToSection(event, section.id)}
              aria-label={`Go to ${section.label}`}
              aria-current={activeSection === section.id ? "step" : undefined}
            >
              <span>{section.label}</span>
            </button>
          ))}
        </nav>

        <section id="about-tool" className={`${styles.hero} ${styles.pageSection}`}>
          <p className="eyebrow">About the project</p>
          <h1 className={styles.title}>A time-travel case file for AI fairness.</h1>
          <p className={styles.lede}>
            Θmen is an interactive teaching prototype about how AI bias enters a system before anyone sees
            the final verdict. Players investigate the fictional city of Novus by tracing bias through data
            collection, algorithmic fairness choices, and human feedback used to guide AI behavior.
          </p>
          <div className={styles.summaryGrid}>
            <InfoCard label="Format" value="Three-chapter interactive investigation" />
            <InfoCard label="Core Topic" value="AI fairness, bias, and accountable model design" />
            <InfoCard label="Current Status" value="In-development, running evaluations" />
          </div>
          <Link to="/chapters" className={styles.back}>
            Open the chapters
          </Link>
        </section>

        <section id="audience" className={`${styles.section} ${styles.pageSection}`}>
          <SectionHeader
            eyebrow="Who it is for"
            title="Built for first encounters with AI fairness."
            body="The tool is intended for non-CS students and mixed-background learners who are meeting AI fairness concepts for the first time. It can also support educators who want a discussion starter for ethics, data literacy, or introductory AI courses."
          />
          <div className={styles.callout}>
            <strong>Placeholder:</strong> add the exact course, age range, deployment context, and accessibility requirements for the final version.
          </div>
        </section>

        <section id="objectives" className={`${styles.section} ${styles.pageSection}`}>
          <SectionHeader
            eyebrow="Learning objectives"
            title="Learners should leave with a working mental model, not just vocabulary."
          />
          <ol className={styles.objectiveList}>
            {OBJECTIVES.map((objective) => (
              <li key={objective}>{objective}</li>
            ))}
          </ol>
        </section>

        <section id="rationale" className={`${styles.section} ${styles.pageSection}`}>
          <SectionHeader
            eyebrow="Design rationale"
            title="The design turns abstract fairness failures into decisions learners can feel."
          />
          <div className={styles.rationaleGrid}>
            <InfoCard
              label="Narrative Frame"
              value="The time-travel case structure makes each chapter feel like an investigation into a prior design decision."
            />
            <InfoCard
              label="Interactive Trade-offs"
              value="Learners choose samples, fairness definitions, and model responses so the consequences emerge from their own actions."
            />
            <InfoCard
              label="No-Code Access"
              value="The activities avoid programming prerequisites and foreground conceptual reasoning, evidence, and reflection."
            />
            <InfoCard
              label="Visual System"
              value="Case-file materials, chapter states, and audit-like feedback make invisible model assumptions more inspectable."
            />
          </div>
        </section>

        <section id="related-work" className={`${styles.section} ${styles.pageSection}`}>
          <SectionHeader
            eyebrow="Related works"
            title="Grounded in fairness research and playable AI literacy precedents."
            body="Filter by chapter to see which papers and design precedents shaped each part of the case. Tap any entry to see what idea it grounds and follow the link to the source."
          />

          <div className={styles.citationFilter} role="tablist" aria-label="Filter citations by chapter">
            {CHAPTER_FILTERS.map((filter) => {
              const count = filter.id === "all"
                ? RELATED_WORKS.length
                : RELATED_WORKS.filter((work) => work.chapter === filter.id).length;
              const isActive = chapterFilter === filter.id;
              return (
                <button
                  key={filter.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`${styles.citationFilterBtn} ${isActive ? styles.citationFilterBtnActive : ""}`}
                  onClick={() => setChapterFilter(filter.id)}
                >
                  {filter.label}
                  <span className={styles.citationFilterCount}>{count}</span>
                </button>
              );
            })}
          </div>

          <ul className={styles.citationList}>
            {RELATED_WORKS
              .filter((work) => chapterFilter === "all" || work.chapter === chapterFilter)
              .map((work) => {
                const key = `${work.chapter}-${work.title}`;
                const isOpen = Boolean(openCitations[key]);
                return (
                  <li key={key} className={styles.citationItem}>
                    <button
                      type="button"
                      className={styles.citationHeader}
                      aria-expanded={isOpen}
                      onClick={() =>
                        setOpenCitations((prev) => ({ ...prev, [key]: !prev[key] }))
                      }
                    >
                      <span className={`${styles.citationTag} ${styles[`citationTag_${work.chapter}`]}`}>
                        {CHAPTER_LABELS[work.chapter]}
                      </span>
                      <span className={styles.citationHeaderText}>
                        <span className={styles.citationTitle}>{work.title}</span>
                        <span className={styles.citationMeta}>
                          {work.authors} · <em>{work.venue}</em>
                        </span>
                      </span>
                      <span
                        className={`${styles.citationCaret} ${isOpen ? styles.citationCaretOpen : ""}`}
                        aria-hidden
                      />
                    </button>
                    {isOpen && (
                      <div className={styles.citationBody}>
                        <p>{work.body}</p>
                        <p className={styles.citationGrounds}>
                          <strong>Grounds in this tool:</strong> {work.grounds}
                        </p>
                        {work.url && (
                          <a
                            href={work.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.citationLink}
                          >
                            Open source ↗
                          </a>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
          </ul>
        </section>

        <section id="team" className={`${styles.section} ${styles.pageSection}`}>
          <SectionHeader eyebrow="Team" title="Project team members" />
          <div className={styles.teamGrid}>
            {TEAM_MEMBERS.map((member) => (
              <article key={member.name} className={styles.teamCard}>
                {/* Coloured band + pushpin */}
                <div className={styles.teamCardBand} aria-hidden="true" />

                {/* Passport-style photo frame */}
                <div className={styles.teamCardBody}>
                  <div className={styles.teamCardPhoto} aria-hidden="true">
                    <span className={styles.teamCardInitials}>
                      {member.name.split(" ").map((n) => n[0]).join("")}
                    </span>
                  </div>

                  <p className={styles.teamCardName}>{member.name}</p>

                  <div
                    className={styles.contributionWidget}
                    aria-label={`${member.name} contributions`}
                  >
                    {member.contributions.map((contribution) => (
                      <small key={contribution}>{contribution}</small>
                    ))}
                  </div>
                </div>

                {/* Case-file footer */}
                <footer className={styles.teamCardFooter}>
                  <span className={styles.teamCaseId}>{member.caseId}</span>
                  <div className={styles.teamBarcode} aria-hidden="true" />
                </footer>
              </article>
            ))}
          </div>
        </section>

        <section id="faq" className={`${styles.section} ${styles.pageSection}`}>
          <div className={styles.faqHeader}>
            <SectionHeader eyebrow="Optional FAQ" title="Frequently asked questions" />
            <div className={styles.faqControls}>
              <button type="button" onClick={() => expandAllFaqs(true)}>Expand All</button>
              <button type="button" onClick={() => expandAllFaqs(false)}>Collapse</button>
            </div>
          </div>
          <div className={styles.faqList}>
            {FAQS.map((faq) => {
              const isOpen = Boolean(openFaqs[faq.question]);
              const answerId = `faq-answer-${faq.question.replace(/\s+/g, "-").toLowerCase()}`;
              return (
                <article key={faq.question} className={`${styles.faqItem} ${faq.placeholder ? styles.placeholder : ""}`}>
                  <button
                    type="button"
                    className={styles.faqQuestion}
                    onClick={() => setOpenFaqs((prev) => ({ ...prev, [faq.question]: !prev[faq.question] }))}
                    aria-expanded={isOpen}
                    aria-controls={answerId}
                  >
                    <span className={styles.faqQuestionText}>{faq.question}</span>
                    <span
                      className={`${styles.faqToggleIcon} ${isOpen ? styles.faqToggleIconOpen : ""}`}
                      aria-hidden
                    />
                  </button>
                  <div
                    id={answerId}
                    className={`${styles.faqAnswerWrapper} ${isOpen ? styles.faqAnswerWrapperOpen : ""}`}
                    role="region"
                    aria-hidden={!isOpen}
                  >
                    <div className={styles.faqAnswerInner}>
                      <p className={styles.faqAnswer}>{faq.answer}</p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function SectionHeader({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body?: string;
}) {
  return (
    <div className={styles.sectionHeader}>
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      {body ? <p>{body}</p> : null}
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <article className={styles.infoCard}>
      <span>{label}</span>
      <p>{value}</p>
    </article>
  );
}
