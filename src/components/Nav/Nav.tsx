import { type MouseEvent, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Button from "../Button/Button";
import Logo from "../Logo/Logo";
import { hasCompleted, loadChapterResults } from "../../utils/assessmentStorage";
import styles from "./Nav.module.css";

const STEPS = [
  { id: "pre",  num: "Assessment", title: "Pre-Test",          hint: "Test your intuitions",           url: "/pre-assessment" },
  { id: "ch1",  num: "Chapter 01", title: "Sampling Bias",     hint: "Data collection shapes outcomes", url: "/chapters?chapter=ch1" },
  { id: "ch2",  num: "Chapter 02", title: "COMPAS Trade-offs", hint: "Fairness definitions collide",    url: "/chapters?chapter=ch2" },
  { id: "ch3",  num: "Chapter 03", title: "LLM Alignment",     hint: "Who teaches the model what's 'good'?", url: "/chapters?chapter=ch3" },
  { id: "post", num: "Assessment", title: "Post-Test",         hint: "Reflect on what you learned",    url: "/post-assessment" },
];

const getCenteredSectionTop = (target: HTMLElement) => {
  const targetTop = target.getBoundingClientRect().top + window.scrollY;
  const navHeight = document.querySelector<HTMLElement>("header")?.getBoundingClientRect().height ?? 76;

  return Math.max(0, targetTop - navHeight);
};

type NavProps = {
  investigation?: boolean;
  headerAction?: {
    label: string;
    to: string;
  };
};

export default function Nav({ investigation = false, headerAction }: NavProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [, setCompletionTick] = useState(0);
  const chromeRef = useRef<HTMLDivElement>(null);
  const showLandingLinks = location.pathname === "/";
  const isPost = location.search.includes("mode=post");
  const preComplete = investigation && hasCompleted("pre");
  const postComplete = investigation && hasCompleted("post");
  const chapterResults = investigation ? loadChapterResults() : {};
  const ch1Complete = Boolean(chapterResults.ch1?.completed);
  const ch2Complete = Boolean(chapterResults.ch2?.completed);
  const ch3Complete = Boolean(chapterResults.ch3?.completed);
  const activeStepIndex = isPost ? STEPS.length - 1 : 0;
  const progress = ((activeStepIndex + 0.5) / STEPS.length) * 100;
  const isActivePath = (path: string) => location.pathname === path;

  useEffect(() => {
    if (investigation) return;
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [investigation]);

  useEffect(() => {
    if (!investigation) return;

    const refreshCompletion = () => setCompletionTick((value) => value + 1);
    window.addEventListener("focus", refreshCompletion);
    window.addEventListener("diet:assessment-updated", refreshCompletion);

    return () => {
      window.removeEventListener("focus", refreshCompletion);
      window.removeEventListener("diet:assessment-updated", refreshCompletion);
    };
  }, [investigation]);

  useEffect(() => {
    if (!open) return;
    const closeOutside = (e: PointerEvent) => {
      if (!chromeRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const closeEsc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeEsc);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeEsc);
    };
  }, [open]);

  const handleSectionClick = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    const target = document.getElementById(id);
    if (!target) return;

    event.preventDefault();
    const handledByLanding = !window.dispatchEvent(
      new CustomEvent("landing:scroll-to-section", {
        cancelable: true,
        detail: { id },
      })
    );

    if (handledByLanding) {
      setOpen(false);
      return;
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const top = getCenteredSectionTop(target);
    window.history.pushState(null, "", `#${id}`);
    window.scrollTo({
      top,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  };

  if (investigation) {
    return (
      <div className={styles.chrome} ref={chromeRef}>
        <header className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <Logo />
            <button
              type="button"
              className={styles.chaptersBtn}
              onClick={() => setOpen(o => !o)}
              aria-expanded={open}
            >
              <span className={`${styles.chaptersIcon} ${open ? styles.chaptersIconOpen : ""}`} aria-hidden />
              Chapters
            </button>
          </div>
          <div className={styles.topbarRight}>
            {headerAction && (
              <Link to={headerAction.to} className={styles.headerAction}>
                {headerAction.label}
              </Link>
            )}
            <Link to="/" className={styles.backLink}>
              Back to case board
            </Link>
          </div>
        </header>

        <div className={`${styles.timelineWrapper} ${open ? styles.timelineWrapperOpen : ""}`}>
          <nav className={styles.timeline} aria-label="Chapters">
            <div className={styles.timelineTrack} aria-hidden>
              <div className={styles.timelineTrackFill} style={{ ["--progress" as string]: `${progress}%` }} />
            </div>
            <ol className={styles.timelineList}>
              {STEPS.map((step) => {
                const isDone =
                  (step.id === "pre" && preComplete) ||
                  (step.id === "ch1" && ch1Complete) ||
                  (step.id === "ch2" && ch2Complete) ||
                  (step.id === "ch3" && ch3Complete) ||
                  (step.id === "post" && postComplete);
                const isActive = (step.id === "pre" && !isPost) || (step.id === "post" && isPost);
                return (
                  <li key={step.id} className={styles.timelineItem}>
                    <button
                      type="button"
                      className={[
                        styles.timelineNode,
                        isDone   ? styles.timelineNodePast   : "",
                        isActive ? styles.timelineNodeActive : "",
                      ].filter(Boolean).join(" ")}
                      onClick={() => {
                        navigate(step.url);
                        setOpen(false);
                      }}
                      aria-current={isActive ? "step" : undefined}
                    >
                      <span className={styles.timelineDot} aria-hidden />
                      <span className={styles.timelineMeta}>
                        <span className={styles.timelineNum}>{step.num}</span>
                        <span className={styles.timelineTitle}>{step.title}</span>
                        <span className={styles.timelineHint}>{step.hint}</span>
                      </span>
                      {isDone && <span className={styles.timelineBadgeComplete}>Finished</span>}
                    </button>
                  </li>
                );
              })}
            </ol>
          </nav>
        </div>
      </div>
    );
  }

  return (
    <header className={`${styles.nav} ${scrolled ? styles.scrolled : ""}`}>
      <Logo />
      {showLandingLinks && (
        <nav className={styles.links}>
          <a href="#concept" onClick={(event) => handleSectionClick(event, "concept")}>What's this?</a>
          <a href="#chapters" onClick={(event) => handleSectionClick(event, "chapters")}>Chapters</a>
          <a href="#audience" onClick={(event) => handleSectionClick(event, "audience")}>Why it matters</a>
        </nav>
      )}
      <div className={styles.cta}>
        <Button
          variant="ghost-dark"
          to="/about"
          className={isActivePath("/about") ? styles.activeNavItem : ""}
          aria-current={isActivePath("/about") ? "page" : undefined}
        >
          About
        </Button>
        <Button
          variant="ghost-dark"
          to="/resources"
          className={isActivePath("/resources") ? styles.activeNavItem : ""}
          aria-current={isActivePath("/resources") ? "page" : undefined}
        >
          Resources
        </Button>
        <Button
          variant="ghost-dark"
          to="/tool"
          className={isActivePath("/tool") ? styles.activeNavItem : ""}
          aria-current={isActivePath("/tool") ? "page" : undefined}
        >
          Tool
        </Button>
        <Button variant="primary" to="/pre-assessment">
          Start investigation
        </Button>
      </div>
    </header>
  );
}
