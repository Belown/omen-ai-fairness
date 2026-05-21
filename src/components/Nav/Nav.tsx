import { type MouseEvent, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Button from "../Button/Button";
import Logo from "../Logo/Logo";
import styles from "./Nav.module.css";

const getCenteredSectionTop = (target: HTMLElement) => {
  const targetTop = target.getBoundingClientRect().top + window.scrollY;
  const navHeight = document.querySelector<HTMLElement>("header")?.getBoundingClientRect().height ?? 76;

  return Math.max(0, targetTop - navHeight);
};

export default function Nav() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const showLandingLinks = location.pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSectionClick = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    const target = document.getElementById(id);
    if (!target) return;

    event.preventDefault();
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const top = getCenteredSectionTop(target);

    window.history.pushState(null, "", `#${id}`);
    window.scrollTo({
      top,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  };

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
        <Button variant="ghost-dark" to="/about">
          About
        </Button>
        <Button variant="primary" to="/assessment">
          Start investigation
        </Button>
      </div>
    </header>
  );
}
