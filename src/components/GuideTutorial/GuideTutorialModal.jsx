/**
 * GuideTutorialModal.jsx
 * Compact, lightweight interactive tooltip with spotlight cutout overlay.
 * Points directly to highlighted elements and explains each feature in 2-3 sentences.
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useGuideTutorial } from "../../context/GuideTutorialContext";
import { useAuth } from "../../context/AuthContext";
import { ChevronRight, ChevronLeft, X } from "lucide-react";

export default function GuideTutorialModal() {
  const {
    isTourActive,
    currentStep,
    currentStepIndex,
    totalSteps,
    allSteps,
    nextStep,
    prevStep,
    skipTour,
    finishTour
  } = useGuideTutorial();
  const { isAuthenticated, currentUser } = useAuth();
  const isUserLoggedIn = Boolean(isAuthenticated && currentUser);

  const [targetRect, setTargetRect] = useState(null);
  const [cardPosition, setCardPosition] = useState({ top: 100, left: 20 });
  const [chosenPlacement, setChosenPlacement] = useState("bottom");
  const [arrowOffset, setArrowOffset] = useState(30);
  const [isSmallScreen, setIsSmallScreen] = useState(
    typeof window !== "undefined" ? window.innerWidth < 1024 : false
  );
  const cardRef = useRef(null);

  // Measure target DOM element and compute optimal tooltip position
  const updateTargetRect = useCallback(() => {
    if (!isTourActive || !currentStep) return;

    const windowWidth = typeof window !== "undefined" ? window.innerWidth : 1024;
    const windowHeight = typeof window !== "undefined" ? window.innerHeight : 768;
    const isMobile = windowWidth < 1024;
    setIsSmallScreen(isMobile);

    const isElementVisible = (el) => {
      if (!el) return false;
      const rect = el.getBoundingClientRect();
      if (rect.width <= 2 || rect.height <= 2) return false;
      const style = window.getComputedStyle(el);
      if (
        style.display === "none" ||
        style.visibility === "hidden" ||
        style.opacity === "0"
      ) {
        return false;
      }
      return el.offsetParent !== null || style.position === "fixed";
    };

    let targetEl = null;

    // 1. If small screen, try mobileSelector first
    if (isMobile && currentStep.mobileSelector) {
      const mEl = document.querySelector(currentStep.mobileSelector);
      if (isElementVisible(mEl)) targetEl = mEl;
    }

    // 2. Try primary selector
    if (!targetEl && currentStep.selector) {
      const pEl = document.querySelector(currentStep.selector);
      if (isElementVisible(pEl)) targetEl = pEl;
    }

    // 3. Try fallbackSelector
    if (!targetEl && currentStep.fallbackSelector) {
      const fEl = document.querySelector(currentStep.fallbackSelector);
      if (isElementVisible(fEl)) targetEl = fEl;
    }

    // 4. Try mobileFallbackSelector if still on mobile
    if (!targetEl && isMobile && currentStep.mobileFallbackSelector) {
      const mfEl = document.querySelector(currentStep.mobileFallbackSelector);
      if (isElementVisible(mfEl)) targetEl = mfEl;
    }

    const screenMargin = windowWidth <= 360 ? 8 : 12;
    const cardWidth = Math.min(380, windowWidth - screenMargin * 2);
    const cardEstimatedHeight = cardRef.current
      ? Math.min(cardRef.current.offsetHeight, 280)
      : 190;

    if (targetEl && isElementVisible(targetEl)) {
      const rect = targetEl.getBoundingClientRect();
      const padding = 6;
      const computedRect = {
        top: Math.max(0, rect.top - padding),
        left: Math.max(0, rect.left - padding),
        width: rect.width + padding * 2,
        height: rect.height + padding * 2,
        bottom: rect.bottom + padding,
        right: rect.right + padding
      };
      setTargetRect(computedRect);

      // Auto-scroll target into view if outside comfortable margins
      if (rect.top < 70 || rect.bottom > windowHeight - 70) {
        targetEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }

      const doesOverlap = (cx, cy, cw, ch, tr) => {
        return !(
          cx + cw <= tr.left ||
          cx >= tr.right ||
          cy + ch <= tr.top ||
          cy >= tr.bottom
        );
      };

      // Candidate placements relative to target
      const candidatePlacements = {
        bottom: {
          top: computedRect.bottom + 10,
          left: windowWidth <= 360
            ? screenMargin
            : Math.max(
                screenMargin,
                Math.min(
                  computedRect.left + computedRect.width / 2 - cardWidth / 2,
                  windowWidth - cardWidth - screenMargin
                )
              ),
          feasible: computedRect.bottom + 10 + cardEstimatedHeight <= windowHeight - screenMargin
        },
        top: {
          top: computedRect.top - 10 - cardEstimatedHeight,
          left: windowWidth <= 360
            ? screenMargin
            : Math.max(
                screenMargin,
                Math.min(
                  computedRect.left + computedRect.width / 2 - cardWidth / 2,
                  windowWidth - cardWidth - screenMargin
                )
              ),
          feasible: computedRect.top - 10 - cardEstimatedHeight >= screenMargin
        },
        left: {
          top: Math.max(
            screenMargin,
            Math.min(
              computedRect.top + (computedRect.height - cardEstimatedHeight) / 2,
              windowHeight - cardEstimatedHeight - screenMargin
            )
          ),
          left: computedRect.left - 10 - cardWidth,
          feasible: computedRect.left - 10 - cardWidth >= screenMargin
        },
        right: {
          top: Math.max(
            screenMargin,
            Math.min(
              computedRect.top + (computedRect.height - cardEstimatedHeight) / 2,
              windowHeight - cardEstimatedHeight - screenMargin
            )
          ),
          left: computedRect.right + 10,
          feasible: computedRect.right + 10 + cardWidth <= windowWidth - screenMargin
        }
      };

      // Priority based on screen size and step suggestion
      // On mobile / screens < 768px, restrict to top/bottom to prevent horizontal collision
      let preferredOrder = ["bottom", "top"];
      if (currentStep.placement === "top") {
        preferredOrder = ["top", "bottom"];
      }

      if (windowWidth >= 768) {
        if (currentStep.placement === "left") {
          preferredOrder = ["left", "top", "bottom", "right"];
        } else if (currentStep.placement === "right") {
          preferredOrder = ["right", "top", "bottom", "left"];
        } else if (currentStep.placement === "top") {
          preferredOrder = ["top", "bottom", "left", "right"];
        } else {
          preferredOrder = ["bottom", "top", "left", "right"];
        }
      }

      let chosen = null;
      let placementKey = "bottom";

      for (const p of preferredOrder) {
        const cand = candidatePlacements[p];
        if (cand && cand.feasible) {
          if (!doesOverlap(cand.left, cand.top, cardWidth, cardEstimatedHeight, computedRect)) {
            chosen = { top: cand.top, left: cand.left };
            placementKey = p;
            break;
          }
        }
      }

      if (!chosen) {
        for (const p of preferredOrder) {
          const cand = candidatePlacements[p];
          if (cand && cand.feasible) {
            chosen = { top: cand.top, left: cand.left };
            placementKey = p;
            break;
          }
        }
      }

      // Fallback for tight viewport / mobile
      if (!chosen) {
        if (computedRect.top > windowHeight * 0.5) {
          chosen = {
            top: screenMargin,
            left: windowWidth <= 360 ? screenMargin : Math.max(screenMargin, (windowWidth - cardWidth) / 2)
          };
          placementKey = "none";
        } else {
          chosen = {
            top: Math.max(screenMargin, windowHeight - cardEstimatedHeight - screenMargin),
            left: windowWidth <= 360 ? screenMargin : Math.max(screenMargin, (windowWidth - cardWidth) / 2)
          };
          placementKey = "none";
        }
      }

      const finalTop = Math.max(screenMargin, Math.min(chosen.top, windowHeight - cardEstimatedHeight - screenMargin));
      const finalLeft = windowWidth <= 360
        ? screenMargin
        : Math.max(screenMargin, Math.min(chosen.left, windowWidth - cardWidth - screenMargin));

      // Calculate arrow offset relative to card
      let computedArrowOffset = 24;
      if (placementKey === "bottom" || placementKey === "top") {
        const targetCenterX = computedRect.left + computedRect.width / 2;
        computedArrowOffset = Math.max(16, Math.min(targetCenterX - finalLeft - 8, cardWidth - 28));
      } else if (placementKey === "left" || placementKey === "right") {
        const targetCenterY = computedRect.top + computedRect.height / 2;
        computedArrowOffset = Math.max(16, Math.min(targetCenterY - finalTop - 8, cardEstimatedHeight - 28));
      }

      setChosenPlacement(placementKey);
      setArrowOffset(computedArrowOffset);
      setCardPosition({ top: finalTop, left: finalLeft });
    } else {
      // Graceful fallback if target element is not mounted yet
      setTargetRect(null);
      setChosenPlacement("none");
      setCardPosition({
        top: Math.max(60, (windowHeight - cardEstimatedHeight) / 2),
        left: Math.max(14, (windowWidth - cardWidth) / 2)
      });
    }
  }, [isTourActive, currentStep]);

  useEffect(() => {
    if (!isTourActive) return;

    const timer1 = setTimeout(updateTargetRect, 60);
    const timer2 = setTimeout(updateTargetRect, 260);

    window.addEventListener("resize", updateTargetRect);
    window.addEventListener("scroll", updateTargetRect, true);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      window.removeEventListener("resize", updateTargetRect);
      window.removeEventListener("scroll", updateTargetRect, true);
    };
  }, [isTourActive, currentStep, updateTargetRect]);

  // Keyboard navigation
  useEffect(() => {
    if (!isTourActive) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        skipTour();
      } else if (e.key === "ArrowRight") {
        nextStep();
      } else if (e.key === "ArrowLeft") {
        prevStep();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isTourActive, nextStep, prevStep, skipTour]);

  if (!isTourActive || !currentStep) return null;

  const isLastStep = currentStepIndex === totalSteps - 1;

  return (
    <div
      className="guide-tour-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tour-step-title"
    >
      {/* 1. Backdrop Overlay with SVG Cutout Mask */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none transition-all duration-300">
        <defs>
          <mask id="guide-spotlight-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {targetRect && targetRect.width > 12 && targetRect.height > 12 && (
              <rect
                x={targetRect.left}
                y={targetRect.top}
                width={targetRect.width}
                height={targetRect.height}
                rx="12"
                ry="12"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(5, 11, 20, 0.78)"
          mask="url(#guide-spotlight-mask)"
        />
      </svg>

      {/* 2. Pulsing Glow Spotlight Ring around active element */}
      {targetRect && targetRect.width > 12 && targetRect.height > 12 && (
        <div
          className="guide-tour-spotlight-ring"
          style={{
            top: `${targetRect.top}px`,
            left: `${targetRect.left}px`,
            width: `${targetRect.width}px`,
            height: `${targetRect.height}px`
          }}
        />
      )}

      {/* 3. Sleek Floating Tooltip */}
      <div
        ref={cardRef}
        style={{
          top: `${cardPosition.top}px`,
          left: `${cardPosition.left}px`
        }}
        className="guide-tour-tooltip"
      >
        {/* Tooltip SVG Carets pointing directly towards target element */}
        {chosenPlacement === "bottom" && (
          <svg
            width="16"
            height="8"
            viewBox="0 0 16 8"
            style={{
              position: "absolute",
              top: "-7px",
              left: `${arrowOffset}px`,
              width: "16px",
              height: "8px",
              pointerEvents: "none",
              zIndex: 100001
            }}
          >
            <path
              d="M0 8 L8 1 L16 8 Z"
              fill="var(--bg-card, #FFFFFF)"
              stroke="var(--border-default, #CBD5E1)"
              strokeWidth="1"
            />
          </svg>
        )}
        {chosenPlacement === "top" && (
          <svg
            width="16"
            height="8"
            viewBox="0 0 16 8"
            style={{
              position: "absolute",
              bottom: "-7px",
              left: `${arrowOffset}px`,
              width: "16px",
              height: "8px",
              pointerEvents: "none",
              zIndex: 100001
            }}
          >
            <path
              d="M0 0 L8 7 L16 0 Z"
              fill="var(--bg-card, #FFFFFF)"
              stroke="var(--border-default, #CBD5E1)"
              strokeWidth="1"
            />
          </svg>
        )}
        {chosenPlacement === "left" && (
          <svg
            width="8"
            height="16"
            viewBox="0 0 8 16"
            style={{
              position: "absolute",
              right: "-7px",
              top: `${arrowOffset}px`,
              width: "8px",
              height: "16px",
              pointerEvents: "none",
              zIndex: 100001
            }}
          >
            <path
              d="M0 0 L7 8 L0 16 Z"
              fill="var(--bg-card, #FFFFFF)"
              stroke="var(--border-default, #CBD5E1)"
              strokeWidth="1"
            />
          </svg>
        )}
        {chosenPlacement === "right" && (
          <svg
            width="8"
            height="16"
            viewBox="0 0 8 16"
            style={{
              position: "absolute",
              left: "-7px",
              top: `${arrowOffset}px`,
              width: "8px",
              height: "16px",
              pointerEvents: "none",
              zIndex: 100001
            }}
          >
            <path
              d="M8 0 L1 8 L8 16 Z"
              fill="var(--bg-card, #FFFFFF)"
              stroke="var(--border-default, #CBD5E1)"
              strokeWidth="1"
            />
          </svg>
        )}

        {/* Header: Step Pill & Close Button */}
        <div className="guide-tour-header">
          <span className="guide-tour-badge">
            Step {currentStepIndex + 1} of {totalSteps}
          </span>
          <button
            onClick={skipTour}
            className="guide-tour-close-btn"
            title="Close Guide (Esc)"
            aria-label="Close Guide"
          >
            <X size={14} />
          </button>
        </div>

        {/* Title */}
        <h4 id="tour-step-title" className="guide-tour-title">
          {!isUserLoggedIn && currentStep.loggedOutTitle
            ? currentStep.loggedOutTitle
            : currentStep.title}
        </h4>

        {/* Description (2-3 Sentences) */}
        <p className="guide-tour-description">
          {!isUserLoggedIn && currentStep.loggedOutDescription
            ? (isSmallScreen && currentStep.loggedOutMobileDescription
                ? currentStep.loggedOutMobileDescription
                : currentStep.loggedOutDescription)
            : (isSmallScreen && currentStep.mobileDescription
                ? currentStep.mobileDescription
                : currentStep.description)}
        </p>

        {/* Footer: Skip, Dot Indicators, Prev & Next */}
        <div className="guide-tour-footer">
          <button
            onClick={skipTour}
            className="guide-tour-skip-btn"
            title="Skip Tour"
          >
            Skip
          </button>

          {/* Dots Indicator */}
          <div className="guide-tour-dots" aria-hidden="true">
            {allSteps.map((_, i) => (
              <span
                key={i}
                className={`guide-tour-dot ${i === currentStepIndex ? "active" : ""}`}
              />
            ))}
          </div>

          {/* Compact Step Counter for mobile */}
          <span className="guide-tour-compact-counter" aria-hidden="true">
            {currentStepIndex + 1}/{totalSteps}
          </span>

          {/* Action Buttons */}
          <div className="guide-tour-btn-group">
            <button
              onClick={prevStep}
              disabled={currentStepIndex === 0}
              className="guide-tour-btn-prev"
              title="Previous Step"
            >
              <ChevronLeft size={12} />
              <span>Prev</span>
            </button>

            <button
              onClick={isLastStep ? finishTour : nextStep}
              className="guide-tour-btn-next"
              title={isLastStep ? "Finish Tour" : "Next Step"}
            >
              <span>{isLastStep ? "Finish" : "Next"}</span>
              {!isLastStep && <ChevronRight size={12} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
