import React, { useState } from "react";
import brandEmblemImg from "../assets/brand-book-emblem.png";

/**
 * BrandLogo Component
 * Features the signature Learn with us open-book emblem (sharp, clear, authentic)
 * Brand Title Lockup:
 *   - "Learn" on top in vibrant yellow (#F59E0B / #FBBF24)
 *   - "with us" directly underneath in brand blue (#002D62 / #38BDF8)
 *   - Dynamic golden smile curve accent
 */
export default function BrandLogo({
  variant = "nav", // "nav" | "full" | "mark" | "stacked"
  size = "md", // "xs" | "sm" | "md" | "lg" | "xl"
  className = "",
  showTagline = true,
  inverted = false
}) {
  const [imgError, setImgError] = useState(false);

  const sizeMap = {
    xs: {
      heightClass: "h-7",
      titleClass: "text-sm",
      subClass: "text-[9px]",
      swooshWidth: 34
    },
    sm: {
      heightClass: "h-8",
      titleClass: "text-sm sm:text-base",
      subClass: "text-[10px] sm:text-xs",
      swooshWidth: 44
    },
    md: {
      heightClass: "h-9",
      titleClass: "text-base sm:text-xl",
      subClass: "text-xs sm:text-sm",
      swooshWidth: 54
    },
    lg: {
      heightClass: "h-12",
      titleClass: "text-2xl sm:text-3xl",
      subClass: "text-sm sm:text-base",
      swooshWidth: 70
    },
    xl: {
      heightClass: "h-16",
      titleClass: "text-3xl sm:text-4xl",
      subClass: "text-base sm:text-lg",
      swooshWidth: 92
    }
  };

  const dim = sizeMap[size] || sizeMap.md;

  /**
   * Crisp SVG Fallback Emblem
   */
  const SvgBookFallback = ({ customHeightClass = null }) => (
    <svg
      viewBox="0 0 100 85"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${customHeightClass || dim.heightClass} w-auto shrink-0 select-none`}
      style={{ overflow: "visible", ...(variant === "nav" ? { height: "38px", maxHeight: "42px", width: "auto" } : {}) }}
      aria-label="Learn with us book emblem"
    >
      <defs>
        <linearGradient id="clearNavyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0756A5" />
          <stop offset="60%" stopColor="#0756A5" />
          <stop offset="100%" stopColor="#102B50" />
        </linearGradient>
      </defs>
      <polygon points="12,25 21,17 50,31 20,57" fill="#FFB800" />
      <polygon points="50,7 59,13 55,22 47,15" fill="#FFB800" />
      <polygon points="54,21 89,39 77,51 49,33" fill="#FFB800" />
      <path
        d="M20,21 C28,19 46,27 49,33 L26,59 C18,55 15,46 20,21 Z"
        fill="#FFFFFF"
        stroke="#E2E8F0"
        strokeWidth="1.2"
      />
      <path d="M22,28 C31,23 41,34 30,53 C25,46 21,38 22,28 Z" fill="#0756A5" />
      <path d="M33,25 C41,27 48,36 39,53 C34,46 30,38 33,25 Z" fill="url(#clearNavyGrad)" />
      <path d="M50,33 L70,14 C79,25 90,40 85,53 L63,35 Z" fill="#0756A5" />
      <path
        d="M52,34 C59,27 72,39 70,51 L53,35 Z"
        fill="#FFFFFF"
        stroke="#E2E8F0"
        strokeWidth="0.8"
      />
      <path d="M53,35 C61,25 73,39 67,51 C63,48 56,43 53,35 Z" fill="#102B50" />
      <path d="M65,33 C73,27 82,42 77,51 C73,46 67,41 65,33 Z" fill="url(#clearNavyGrad)" />
      <path d="M21,61 Q50,72 87,52 Q50,67 21,61 Z" fill="#FFB800" />
    </svg>
  );

  const EmblemGraphic = ({ customHeightClass = null }) => {
    const hClass = customHeightClass || (variant === "nav" ? "navbar-brand-emblem" : dim.heightClass);
    if (imgError) {
      return <SvgBookFallback customHeightClass={hClass} />;
    }
    return (
      <img
        src={brandEmblemImg}
        alt="Learn with us book logo"
        className={`${hClass} w-auto object-contain select-none shrink-0 drop-shadow-2xs transition-transform duration-200 group-hover:scale-105`}
        style={{
          imageRendering: "auto",
          ...(variant === "nav" ? { height: "38px", maxHeight: "42px", maxWidth: "68px", width: "auto", objectFit: "contain" } : {})
        }}
        loading="eager"
        decoding="async"
        onError={() => setImgError(true)}
      />
    );
  };

  // Mark only (standalone emblem)
  if (variant === "mark") {
    return (
      <div className={`inline-flex items-center justify-center shrink-0 ${className}`}>
        <EmblemGraphic />
      </div>
    );
  }

  // Stacked variant (for auth cards / hero / certificates)
  if (variant === "stacked") {
    return (
      <div className={`inline-flex flex-col items-center justify-center gap-1.5 text-center ${className}`}>
        <EmblemGraphic />
        <div className="flex flex-col items-center leading-none mt-1 select-none">
          <span className={`font-display font-black text-[#FFB800] tracking-tight leading-none ${dim.titleClass} drop-shadow-2xs`}>
            Learn
          </span>
          <div className="flex flex-col items-center mt-0.5">
            <span
              className={`font-sans font-bold ${inverted ? "brand-logo-inverted" : "text-[#0756A5] dark:text-[#60A5FA]"} tracking-wider uppercase ${dim.subClass} leading-tight`}
              style={{ color: inverted ? "#60B7FF" : undefined }}
            >
              with us
            </span>
            <svg
              width={dim.swooshWidth}
              height="5"
              viewBox="0 0 48 5"
              fill="none"
              className="mt-0.5"
            >
              <path d="M1 2 Q24 5 47 2" stroke="#FFB800" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </div>
    );
  }

  // Navbar / Brand Title variant: Only the authentic book logo emblem, without "Learn with us" text
  if (variant === "nav") {
    return (
      <div className={`inline-flex items-center justify-center text-center leading-none py-0.5 shrink-0 ${className}`}>
        <EmblemGraphic customHeightClass="navbar-brand-emblem" />
      </div>
    );
  }

  // Default & Full variant: Horizontal lockup (Emblem + "Learn" in Yellow + "with us" in Blue)
  return (
    <div className={`inline-flex items-center gap-1.5 sm:gap-2.5 min-w-0 ${className}`}>
      {/* Clear Authentic Emblem */}
      <div className="flex items-center justify-center shrink-0">
        <EmblemGraphic />
      </div>

      {/* Brand Title: Learn (Yellow) on top, with us (Blue) underneath */}
      <div className="flex flex-col justify-center leading-none min-w-0 text-left shrink-0">
        {/* Line 1: Learn in Yellow Color */}
        <span className={`font-display font-black text-[#FFB800] tracking-tight leading-none ${dim.titleClass} drop-shadow-2xs select-none whitespace-nowrap`}>
          Learn
        </span>

        {/* Line 2: with us in Blue Color + Golden Curve Accent */}
        <div className="flex flex-col items-start leading-none mt-0.5 select-none shrink-0">
          <span
            className={`font-sans font-extrabold ${inverted ? "brand-logo-inverted" : "text-[#0756A5] dark:text-[#60A5FA]"} tracking-wider ${dim.subClass} leading-tight whitespace-nowrap select-none`}
            style={{ color: inverted ? "#60B7FF" : undefined }}
          >
            with us
          </span>
          {/* Signature golden smile swoosh underneath */}
          <svg
            width={dim.swooshWidth}
            height="4"
            viewBox="0 0 48 4"
            fill="none"
            className="-mt-0.5"
          >
            <path d="M1 1.5 Q24 4 47 1.5" stroke="#FFB800" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}

/**
 * LearnWithUsTagline Component
 * Renders "Learn" (yellow) with "with us" (blue) and the golden smile curve
 */
export function LearnWithUsTagline({ className = "", size = "md" }) {
  const sizes = {
    sm: "text-base sm:text-lg",
    md: "text-lg sm:text-2xl",
    lg: "text-2xl sm:text-3xl",
    xl: "text-3xl sm:text-4xl"
  };

  return (
    <div className={`inline-flex flex-col items-center justify-center ${className}`}>
      <div className={`font-display font-black tracking-tight ${sizes[size]} flex items-center gap-2 leading-none`}>
        <span className="text-[#FFB800]">Learn</span>
        <span className="text-[#0756A5] dark:text-[#60A5FA]">with us</span>
      </div>
      {/* Curved golden smile swoosh underneath */}
      <svg width="76" height="8" viewBox="0 0 76 8" fill="none" className="mt-1">
        <path d="M2 3 Q38 8 74 3" stroke="#FFB800" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </div>
  );
}
