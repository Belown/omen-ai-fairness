import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Nav from "../../components/Nav/Nav";
import {
  BIAS_SECTIONS,
  FEEDBACK_STATEMENTS,
  LIKERT_OPTIONS,
  OPEN_ENDED_QUESTIONS,
} from "./assessmentData";
import {
  loadAssessmentDraft,
  saveAssessmentDraft,
} from "../../utils/assessmentStorage";
import styles from "./Assessment.module.css";

type Answers = Record<string, string>;
type Scale = Record<string, number>;
type Feedback = Record<number, number>;
type OpenEnded = Record<number, string>;

const downloadJson = (filename: string, data: unknown) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  window.setTimeout(() => {
    link.remove();
    URL.revokeObjectURL(url);
  }, 1000);
};

const createFilenamePart = (value: string) =>
  value
    .trim()
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-") || "unknown";

const createAssessmentExport = (
  mode: "pre" | "post",
  participantName: string,
  answers: Answers,
  confidence: Scale,
  understanding: Scale,
  feedback: Feedback,
  openEnded: OpenEnded
) => {
  const submittedAt = new Date().toISOString();
  const sections = BIAS_SECTIONS.map((section) => ({
    id: section.id,
    label: section.label,
    understanding: understanding[section.id],
    questions: section.questions.map((question) => {
      const selectedAnswer = answers[question.id];

      return {
        id: question.id,
        number: question.number,
        text: question.text,
        selectedAnswer,
        selectedAnswerText:
          question.options.find((option) => option.key === selectedAnswer)?.text ?? null,
        correctAnswer: question.correct,
        isCorrect: selectedAnswer === question.correct,
        confidence: confidence[question.id],
      };
    }),
  }));
  const allQuestions = sections.flatMap((section) => section.questions);
  const correctCount = allQuestions.filter((question) => question.isCorrect).length;

  return {
    version: 1,
    assessment: "DIET AI Bias Assessment",
    mode,
    submittedAt,
    ...(participantName && { participantName }),
    summary: {
      totalQuestions: allQuestions.length,
      correctCount,
      scorePercent: Math.round((correctCount / allQuestions.length) * 100),
    },
    sections,
    ...(mode === "post" && {
      feedback: FEEDBACK_STATEMENTS.map((statement, index) => ({
        statement,
        rating: feedback[index],
      })),
      openEnded: OPEN_ENDED_QUESTIONS.map((question, index) => ({
        question,
        response: openEnded[index] ?? "",
      })),
    }),
  };
};

function PreTest() {
  const mode = "pre" as "pre" | "post";
  const isPost = mode === "post";
  const initialDraft = useRef(loadAssessmentDraft(mode));
  const skipNextDraftSave = useRef(false);

  const [participantName, setParticipantName] = useState(initialDraft.current.participantName);
  const [answers, setAnswers] = useState<Answers>(initialDraft.current.answers);
  const [confidence, setConfidence] = useState<Scale>(initialDraft.current.confidence);
  const [understanding, setUnderstanding] = useState<Scale>(initialDraft.current.understanding);
  const [feedback, setFeedback] = useState<Feedback>(initialDraft.current.feedback);
  const [openEnded, setOpenEnded] = useState<OpenEnded>(initialDraft.current.openEnded);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [invalidFields, setInvalidFields] = useState<Set<string>>(new Set());
  const [scrollToError, setScrollToError] = useState(false);

  useEffect(() => {
    const draft = loadAssessmentDraft(mode);
    const preParticipantName = mode === "post" ? loadAssessmentDraft("pre").participantName : "";
    skipNextDraftSave.current = true;
    setParticipantName(mode === "post" ? draft.participantName || preParticipantName : draft.participantName);
    setAnswers(draft.answers);
    setConfidence(draft.confidence);
    setUnderstanding(draft.understanding);
    setFeedback(draft.feedback);
    setOpenEnded(draft.openEnded);
    setSubmitted(false);
    setError("");
    setInvalidFields(new Set());
    setScrollToError(false);
    window.scrollTo({ top: 0, left: 0 });
  }, [mode]);

  useEffect(() => {
    if (skipNextDraftSave.current) {
      skipNextDraftSave.current = false;
      return;
    }

    saveAssessmentDraft(mode, {
      participantName,
      answers,
      confidence,
      understanding,
      feedback,
      openEnded,
    });
  }, [participantName, answers, confidence, feedback, mode, openEnded, understanding]);

  useEffect(() => {
    if (!scrollToError) return;
    setScrollToError(false);
    requestAnimationFrame(() => {
      const el = document.querySelector("[data-invalid='true']");
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }, [scrollToError]);

  useEffect(() => {
    if (!submitted || isPost) return;

    const htmlOverflow = document.documentElement.style.overflow;
    const bodyOverflow = document.body.style.overflow;

    window.scrollTo({ top: 0, left: 0 });
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    return () => {
      document.documentElement.style.overflow = htmlOverflow;
      document.body.style.overflow = bodyOverflow;
    };
  }, [isPost, submitted]);

  const removeInvalid = (key: string) =>
    setInvalidFields((prev) => { const s = new Set(prev); s.delete(key); return s; });

  const handleRandomize = () => {
    const newAnswers: Answers = {};
    const newConfidence: Scale = {};
    const newUnderstanding: Scale = {};
    const newFeedback: Feedback = {};

    BIAS_SECTIONS.forEach((section) => {
      section.questions.forEach((q) => {
        newAnswers[q.id] = q.options[Math.floor(Math.random() * q.options.length)].key;
        newConfidence[q.id] = Math.floor(Math.random() * 5) + 1;
      });
      newUnderstanding[section.id] = Math.floor(Math.random() * 5) + 1;
    });

    if (isPost) {
      FEEDBACK_STATEMENTS.forEach((_, i) => {
        newFeedback[i] = LIKERT_OPTIONS[Math.floor(Math.random() * LIKERT_OPTIONS.length)].value;
      });
    }

    setAnswers(newAnswers);
    setConfidence(newConfidence);
    setUnderstanding(newUnderstanding);
    if (isPost) setFeedback(newFeedback);
    if (!isPost) setParticipantName("test");
    setInvalidFields(new Set());
    setError("");
  };

  const handleSubmit = () => {
    const invalid = new Set<string>();

    BIAS_SECTIONS.forEach((section) => {
      section.questions.forEach((q) => {
        if (!answers[q.id]) invalid.add(`a-${q.id}`);
        if (!confidence[q.id]) invalid.add(`c-${q.id}`);
      });
      if (!understanding[section.id]) invalid.add(`u-${section.id}`);
    });

    if (isPost) {
      FEEDBACK_STATEMENTS.forEach((_, i) => {
        if (!feedback[i]) invalid.add(`f-${i}`);
      });
    }

    if (!isPost && !participantName.trim()) invalid.add("name");

    if (invalid.size > 0) {
      setInvalidFields(invalid);
      setError("Please complete all highlighted fields before submitting.");
      setScrollToError(true);
      return;
    }

    setInvalidFields(new Set());
    setError("");
    const preParticipantName = loadAssessmentDraft("pre").participantName.trim();
    const exportParticipantName = isPost
      ? participantName.trim() || preParticipantName
      : participantName.trim();
    const exportData = createAssessmentExport(
      mode,
      exportParticipantName,
      answers,
      confidence,
      understanding,
      feedback,
      openEnded
    );
    const timestamp = exportData.submittedAt.replace(/[:.]/g, "-");
    const filenameName = createFilenamePart(exportParticipantName || "unknown");

    const filename = `diet-assessment-${filenameName}-${mode}-${timestamp}.json`;

    downloadJson(filename, exportData);

    window.setTimeout(() => setSubmitted(true), 100);

    saveAssessmentDraft(mode, {
      participantName: exportParticipantName,
      answers,
      confidence,
      understanding,
      feedback,
      openEnded,
      submittedAt: exportData.submittedAt,
    });
  };

  if (submitted) {
    return <CompletionState isPost={isPost} />;
  }

  return (
    <>
      <Nav investigation />
      <main className={`${styles.page} ${isPost ? styles.pagePost : styles.pagePre}`}>
        <div className={styles.sceneWash} />
        <div className={styles.hero}>
          {!isPost && (
            <Link to="/chapters?intro=story" className={styles.heroChapterLink}>
              Skip
            </Link>
          )}
          <div className={styles.heroCopy}>
            <div className={styles.caseTagRow}>
              <span className={`${styles.caseTag} ${isPost ? styles.postBadge : styles.preBadge}`}>
                {isPost ? "Post-Game Assessment" : "Pre-Game Assessment"}
              </span>
              <span className={styles.caseId}>AI Bias Knowledge Check</span>
            </div>
            <h1 className={styles.title}>
              {isPost ? "Reflect on what you learned." : "Test your intuitions."}
            </h1>
            <p className={styles.lede}>
              {isPost
                ? "Now that you have completed the investigation, answer the same questions again. For each question, select the answer you believe is correct and rate how confident you are."
                : "Before you begin the investigation, answer each question as best you can. For each question, select the answer you believe is correct and rate your confidence."}
            </p>
            {!isPost && (
              <div
                className={styles.nameField}
                data-invalid={invalidFields.has("name") || undefined}
              >
                <label className={styles.nameLabel} htmlFor="participant-name">
                  Your name
                </label>
                <input
                  id="participant-name"
                  type="text"
                  className={`${styles.nameInput} ${invalidFields.has("name") ? styles.nameInputError : ""}`}
                  aria-invalid={invalidFields.has("name") || undefined}
                  value={participantName}
                  onChange={(e) => {
                    setParticipantName(e.target.value);
                    if (e.target.value.trim()) removeInvalid("name");
                  }}
                  placeholder="Enter your name…"
                  autoComplete="name"
                />
              </div>
            )}
          </div>
        </div>

        <div className={styles.sections}>
          {BIAS_SECTIONS.map((section, sectionIdx) => (
            <section key={section.id} className={styles.biasSection}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionIndex}>
                  {String(sectionIdx + 1).padStart(2, "0")}
                </div>
                <div className={styles.sectionMeta}>
                  <p className={styles.sectionLabel}>{section.label}</p>
                  <p className={styles.definition}>{section.definition}</p>
                </div>
              </div>
              <div className={styles.scenario}>
                <span className={styles.scenarioLabel}>Scenario</span>
                {section.scenario}
              </div>

              <div className={styles.questions}>
                {section.questions.map((question) => {
                  const answerInvalid = invalidFields.has(`a-${question.id}`);
                  const confidenceInvalid = invalidFields.has(`c-${question.id}`);
                  const cardInvalid = answerInvalid || confidenceInvalid;
                  return (
                  <div
                    key={question.id}
                    className={`${styles.questionCard} ${cardInvalid ? styles.questionCardError : ""}`}
                    data-invalid={cardInvalid || undefined}
                  >
                    <div className={styles.questionHeader}>
                      <span className={styles.questionNumber}>{question.number}.</span>
                      <p className={styles.questionText}>{question.text}</p>
                    </div>

                    <fieldset className={`${styles.optionsFieldset} ${answerInvalid ? styles.optionsFieldsetError : ""}`}>
                      <legend className={styles.srOnly}>Answer for {question.number}</legend>
                      {question.options.map((option) => (
                        <label
                          key={option.key}
                          className={`${styles.option} ${answers[question.id] === option.key ? styles.optionSelected : ""}`}
                        >
                          <input
                            type="radio"
                            name={`answer-${question.id}`}
                            value={option.key}
                            checked={answers[question.id] === option.key}
                            onChange={() => {
                              setAnswers((prev) => ({ ...prev, [question.id]: option.key }));
                              removeInvalid(`a-${question.id}`);
                            }}
                            className={styles.srOnly}
                          />
                          <span className={styles.optionKey}>{option.key}</span>
                          <span className={styles.optionText}>{option.text}</span>
                        </label>
                      ))}
                    </fieldset>

                    <div className={`${styles.scaleRow} ${confidenceInvalid ? styles.scaleRowError : ""}`}>
                      <span className={styles.scaleRowLabel}>Confidence in answer:</span>
                      <fieldset className={styles.scaleFieldset}>
                        <legend className={styles.srOnly}>Confidence for {question.number}</legend>
                        <div className={styles.scaleButtons}>
                          {[1, 2, 3, 4, 5].map((val) => (
                            <label
                              key={val}
                              className={`${styles.scaleBtn} ${confidence[question.id] === val ? styles.scaleBtnSelected : ""}`}
                            >
                              <input
                                type="radio"
                                name={`confidence-${question.id}`}
                                value={val}
                                checked={confidence[question.id] === val}
                                onChange={() => {
                                  setConfidence((prev) => ({ ...prev, [question.id]: val }));
                                  removeInvalid(`c-${question.id}`);
                                }}
                                className={styles.srOnly}
                              />
                              {val}
                            </label>
                          ))}
                        </div>
                        <div className={styles.scaleEndLabels}>
                          <span>Not confident</span>
                          <span>Very confident</span>
                        </div>
                      </fieldset>
                    </div>
                  </div>
                  );
                })}
              </div>

              <div
                className={`${styles.understandingRow} ${invalidFields.has(`u-${section.id}`) ? styles.understandingRowError : ""}`}
                data-invalid={invalidFields.has(`u-${section.id}`) || undefined}
              >
                <span className={styles.understandingLabel}>
                  Rate your understanding of {section.label}:
                </span>
                <fieldset className={styles.scaleFieldset}>
                  <legend className={styles.srOnly}>Understanding of {section.label}</legend>
                  <div className={styles.scaleButtons}>
                    {[1, 2, 3, 4, 5].map((val) => (
                      <label
                        key={val}
                        className={`${styles.scaleBtn} ${styles.scaleBtnUnderstanding} ${understanding[section.id] === val ? styles.scaleBtnSelected : ""}`}
                      >
                        <input
                          type="radio"
                          name={`understanding-${section.id}`}
                          value={val}
                          checked={understanding[section.id] === val}
                          onChange={() => {
                            setUnderstanding((prev) => ({ ...prev, [section.id]: val }));
                            removeInvalid(`u-${section.id}`);
                          }}
                          className={styles.srOnly}
                        />
                        {val}
                      </label>
                    ))}
                  </div>
                  <div className={styles.scaleEndLabels}>
                    <span>No understanding</span>
                    <span>Full understanding</span>
                  </div>
                </fieldset>
              </div>
            </section>
          ))}

          {isPost && (
            <section className={styles.feedbackSection}>
              <div className={styles.feedbackHeader}>
                <span className="eyebrow">Your Feedback</span>
                <h2 className={styles.feedbackTitle}>Help us improve the game.</h2>
              </div>

              <div className={styles.likertList}>
                {FEEDBACK_STATEMENTS.map((statement, i) => (
                  <div
                    key={i}
                    className={`${styles.likertRow} ${invalidFields.has(`f-${i}`) ? styles.likertRowError : ""}`}
                    data-invalid={invalidFields.has(`f-${i}`) || undefined}
                  >
                    <p className={styles.statementText}>{statement}</p>
                    <fieldset className={styles.likertFieldset}>
                      <legend className={styles.srOnly}>{statement}</legend>
                      <div className={styles.likertButtons}>
                        {LIKERT_OPTIONS.map((opt) => (
                          <label
                            key={opt.value}
                            className={`${styles.likertBtn} ${feedback[i] === opt.value ? styles.likertBtnSelected : ""}`}
                            title={opt.label}
                          >
                            <input
                              type="radio"
                              name={`feedback-${i}`}
                              value={opt.value}
                              checked={feedback[i] === opt.value}
                              onChange={() => {
                                setFeedback((prev) => ({ ...prev, [i]: opt.value }));
                                removeInvalid(`f-${i}`);
                              }}
                              className={styles.srOnly}
                            />
                            <span className={styles.likertNum}>{opt.value}</span>
                            <span className={styles.likertLabel}>{opt.label}</span>
                          </label>
                        ))}
                      </div>
                    </fieldset>
                  </div>
                ))}
              </div>

              <div className={styles.openEndedList}>
                {OPEN_ENDED_QUESTIONS.map((question, i) => (
                  <div key={i} className={styles.openEndedRow}>
                    <label className={styles.openEndedLabel} htmlFor={`open-${i}`}>
                      {question}
                    </label>
                    <textarea
                      id={`open-${i}`}
                      className={styles.openEndedInput}
                      value={openEnded[i] ?? ""}
                      onChange={(e) =>
                        setOpenEnded((prev) => ({ ...prev, [i]: e.target.value }))
                      }
                      rows={4}
                      placeholder="Write your thoughts here… (Optional)"
                    />
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className={styles.submitArea}>
          {error && <p className={styles.errorMsg}>{error}</p>}
          <p className={styles.submitHint}>
            {isPost
              ? "Submitting saves the final case record as a local JSON file."
              : "Submitting saves the baseline case record as a local JSON file."}
          </p>
          <div className={styles.submitRow}>
            <button className={styles.randomizeBtn} onClick={handleRandomize} type="button">
              Randomize
            </button>
            <button className={styles.submitBtn} onClick={handleSubmit} type="button">
              Submit {isPost ? "Post-Game" : "Pre-Game"} Assessment
            </button>
          </div>
        </div>
      </main>

    </>
  );
}


function CompletionState({ isPost }: { isPost: boolean }) {
  return (
    <>
      <Nav investigation />
      <main className={`${styles.page} ${styles.completionPage} ${isPost ? styles.pagePost : styles.pagePre}`}>
        <div className={styles.sceneWash} />
        <div className={styles.completion}>
          <span className={styles.caseTag}>Assessment complete</span>
          <h1 className={styles.title}>
            {isPost ? "Thank you for your feedback." : "Intuitions recorded."}
          </h1>
          <p className={styles.lede}>
            {isPost
              ? "Your responses help us improve the investigation. The case file is now closed."
              : "Your initial answers have been noted. Begin the investigation when you are ready."}
          </p>
          {!isPost && (
            <Link to="/chapters?intro=story" className={styles.ctaLink}>
              Begin the investigation →
            </Link>
          )}
          {isPost && (
            <Link to="/" className={styles.ctaLink}>
              Return to home →
            </Link>
          )}
        </div>
      </main>

    </>
  );
}

export default PreTest;
