import { type MouseEvent, useEffect, useState } from "react";
import styles from "./PageProgressDots.module.css";

const NAV_OFFSET = 88;

export type PageProgressSection = {
  id: string;
  label: string;
};

type Props = {
  sections: PageProgressSection[];
  ariaLabel: string;
};

export default function PageProgressDots({ sections, ariaLabel }: Props) {
  const [activeSection, setActiveSection] = useState(sections[0]?.id ?? "");

  useEffect(() => {
    if (sections.length === 0) return;

    const updateActiveSection = () => {
      const current = sections.reduce(
        (best, section) => {
          const target = document.getElementById(section.id);
          if (!target) return best;

          const distance = Math.abs(target.getBoundingClientRect().top - NAV_OFFSET);
          return distance < best.distance ? { id: section.id, distance } : best;
        },
        { id: sections[0].id, distance: Number.POSITIVE_INFINITY },
      );

      setActiveSection(current.id);
    };

    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", updateActiveSection);
    return () => {
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", updateActiveSection);
    };
  }, [sections]);

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

  return (
    <nav className={styles.progressDots} aria-label={ariaLabel}>
      {sections.map((section) => (
        <button
          key={section.id}
          type="button"
          className={`${styles.progressDot} ${
            activeSection === section.id ? styles.progressDotActive : ""
          }`}
          onClick={(event) => scrollToSection(event, section.id)}
          aria-label={`Go to ${section.label}`}
          aria-current={activeSection === section.id ? "step" : undefined}
        >
          <span>{section.label}</span>
        </button>
      ))}
    </nav>
  );
}
