import { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Landing from "./pages/Landing/Landing";
import About from "./pages/About/About";
import Chapters from "./pages/Chapters/Chapters";
import Demo from "./pages/Demo/Demo";
import Resources from "./pages/Resources/Resources";
import Tool from "./pages/Tool/Tool";
import PreTest from "./pages/Assessment/PreTest";
import PostTest from "./pages/Assessment/PostTest";
import { GoodEnding, BadEnding } from "./pages/Ending/Ending";

const SMOOTH_SCROLL_PAGES = new Set(["/", "/about", "/resources", "/tool"]);

export default function App() {
  const { pathname } = useLocation();

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: SMOOTH_SCROLL_PAGES.has(pathname) && !reduceMotion ? "smooth" : "auto",
    });
  }, [pathname]);

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/about" element={<About />} />
      <Route path="/resources" element={<Resources />} />
      <Route path="/tool" element={<Tool />} />
      <Route path="/chapters" element={<Chapters />} />
      <Route path="/demo" element={<Demo />} />
      <Route path="/pre-assessment" element={<PreTest />} />
      <Route path="/post-assessment" element={<PostTest />} />
      <Route path="/ending/good" element={<GoodEnding />} />
      <Route path="/ending/bad" element={<BadEnding />} />
      {/* legacy redirect */}
      <Route path="/assessment" element={<Navigate to="/pre-assessment" replace />} />
      <Route path="/simulator" element={<Navigate to="/chapters" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
