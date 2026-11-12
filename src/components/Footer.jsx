import React from "react";
import {
  Terminal,
  BookOpen,
  Code2,
  FolderGit2,
  Info,
  Mail,
  ShieldCheck,
  FileText,
  User,
  Sparkles,
  Compass,
  Search,
  ChevronRight
} from "lucide-react";
import BrandLogo from "./BrandLogo";
import { useGuideTutorial } from "../context/GuideTutorialContext";

export default function Footer({ onNavigate }) {
  const { startTour, openExplorer } = useGuideTutorial();

  const handleLinkClick = (pageId) => {
    if (onNavigate) onNavigate(pageId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="app-footer mt-auto w-full transition-colors">
      <div className="footer-inner-container">
        {/* Main 4-Column Grid Architecture with generous spacing */}
        <div className="footer-main-grid">
          {/* Brand & Platform Mission Column */}
          <div className="footer-brand-col">
            <div
              onClick={() => handleLinkClick("home")}
              className="cursor-pointer transition-transform hover:scale-[1.02] inline-block"
              title="Learn With Us — Return to Home"
            >
              <BrandLogo variant="full" size="md" showTagline={true} inverted={true} />
            </div>

            <p className="footer-brand-desc">
              An interactive, age-adaptive Python learning platform designed to take students from foundational logic to production-grade software development.
            </p>

            {/* Platform Feature Badges */}
            <div className="footer-badges-wrap">
              <span className="footer-badge-pill">
                <span>🐍</span>
                <span>198 Curriculum Topics</span>
              </span>
              <span className="footer-badge-pill">
                <span>🎯</span>
                <span>5 Adaptive Age Stages</span>
              </span>
              <span className="footer-badge-pill">
                <span>⚡</span>
                <span>Live Browser Python Runner</span>
              </span>
            </div>
          </div>

          {/* Column 1: Curriculum */}
          <div className="footer-nav-col">
            <h4 className="footer-nav-heading" style={{ color: "#FFB800" }}>
              <BookOpen size={14} className="text-[#FFB800]" style={{ color: "#FFB800" }} />
              <span style={{ color: "#FFB800" }}>Curriculum</span>
            </h4>
            <ul className="footer-nav-list">
              <li>
                <button
                  type="button"
                  onClick={() => handleLinkClick("home")}
                  className="footer-nav-item"
                >
                  <Terminal size={15} />
                  <span>Home Dashboard</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleLinkClick("learn")}
                  className="footer-nav-item"
                >
                  <BookOpen size={15} />
                  <span>Curriculum (198 Lessons)</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleLinkClick("practice")}
                  className="footer-nav-item"
                >
                  <Code2 size={15} />
                  <span>Practice & Quizzes</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleLinkClick("projects")}
                  className="footer-nav-item"
                >
                  <FolderGit2 size={15} />
                  <span>Guided Projects</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 2: Platform & Guidance */}
          <div className="footer-nav-col">
            <h4 className="footer-nav-heading" style={{ color: "#FFB800" }}>
              <Compass size={14} className="text-[#FFB800]" style={{ color: "#FFB800" }} />
              <span style={{ color: "#FFB800" }}>Platform</span>
            </h4>
            <ul className="footer-nav-list">
              <li>
                <button
                  type="button"
                  onClick={() => handleLinkClick("about")}
                  className="footer-nav-item"
                >
                  <Info size={15} />
                  <span>About Adaptive Engine</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    if (startTour) startTour(0);
                  }}
                  className="footer-nav-item"
                >
                  <Sparkles size={15} />
                  <span>Guided App Tour</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    if (openExplorer) openExplorer("all");
                  }}
                  className="footer-nav-item"
                >
                  <Search size={15} />
                  <span>Search All Pages</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleLinkClick("contact")}
                  className="footer-nav-item"
                >
                  <Mail size={15} />
                  <span>Contact & Support</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Account & Trust */}
          <div className="footer-nav-col">
            <h4 className="footer-nav-heading" style={{ color: "#FFB800" }}>
              <ShieldCheck size={14} className="text-[#FFB800]" style={{ color: "#FFB800" }} />
              <span style={{ color: "#FFB800" }}>Account & Trust</span>
            </h4>
            <ul className="footer-nav-list">
              <li>
                <button
                  type="button"
                  onClick={() => handleLinkClick("profile")}
                  className="footer-nav-item"
                >
                  <User size={15} />
                  <span>My Profile & Stats</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleLinkClick("signin")}
                  className="footer-nav-item"
                >
                  <ChevronRight size={15} />
                  <span>Sign In / Register</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleLinkClick("privacy")}
                  className="footer-nav-item"
                >
                  <ShieldCheck size={15} />
                  <span>Privacy Policy</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleLinkClick("terms")}
                  className="footer-nav-item"
                >
                  <FileText size={15} />
                  <span>Terms of Service</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Platform Status */}
        <div className="footer-bottom-bar">
          <p className="footer-copyright">
            <span>© {new Date().getFullYear()}</span>{" "}
            <strong className="font-bold text-white">Learn With Us</strong>.{" "}
            <span>All rights reserved.</span>
          </p>

          <div className="footer-bottom-badge">
            <Sparkles size={14} className="text-[#FFB800]" />
            <span className="text-slate-300">
              Interactive Python Learning • <span className="text-[#FFB800] font-bold">23,760 Questions</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
