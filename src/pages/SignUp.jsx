import React, { useState, useRef, useEffect } from "react";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Sun,
  Moon,
  RefreshCw,
  Globe,
  ChevronDown,
  Check,
  Zap,
  Flame,
  Compass,
  ShieldCheck,
  Terminal,
  Code2
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import BrandLogo from "../components/BrandLogo";
import PageBackButton from "../components/PageBackButton";
import { LEARNING_STAGES, getStageById } from "../data/learningStages";
import { LEARNING_LANGUAGES, getLanguageById, getStoredLanguage, saveLanguage } from "../data/learningLanguages";
import { AVATAR_OPTIONS } from "../services/authService";

// Multi-language UI Localization Dictionary for Dynamic Transitions
const SIGNUP_I18N = {
  english: {
    heroBadge: "Learn With Us • Learn. Practice. Grow.",
    heroTitle1: "Start Your Python",
    heroTitle2: "Mastery Journey",
    heroDesc: "Create your free student account to track streaks, save bookmarks, and execute Python code in your browser with stage-tailored depth.",
    outputBadge: "Session Ready • 23,760 Questions Available",
    cardTitle: "Create Free Student Account",
    cardDesc: "100% Free forever. No credit card required.",
    sslBadge: "256-bit SSL",
    nameLabel: "Full Name",
    namePlaceholder: "Alex Johnson",
    emailLabel: "Email Address",
    emailPlaceholder: "alex@example.com",
    passwordLabel: "Password",
    passwordPlaceholder: "At least 6 characters",
    confirmPasswordLabel: "Confirm Password",
    confirmPasswordPlaceholder: "Re-enter your password",
    stageLabel: "Select Your Learning Stage",
    langLabel: "Primary Learning Language",
    avatarLabel: "Choose Your Learning Avatar",
    submitBtn: "Create Student Account Free",
    alreadyAccount: "Already have an account?",
    signInLink: "Sign In Here →",
    footerText: "Python Adaptive Interactive Guide • 5 Age Stages & 4 Multilingual Modes"
  },
  "english-telugu": {
    heroBadge: "Learn With Us • Learn. Practice. Grow.",
    heroTitle1: "Start Your Python",
    heroTitle2: "Mastery Journey",
    heroDesc: "Mee daily streak track cheskodaniki, bookmarks save cheskodaniki and browser lo Python code run cheskodaniki free account create cheskondi.",
    outputBadge: "Session Ready • 23,760 Questions Ready",
    cardTitle: "Create Free Student Account",
    cardDesc: "100% Free forever. Simple ga 1 minute lo join avvandi.",
    sslBadge: "256-bit SSL",
    nameLabel: "Full Name (Mee Peru)",
    namePlaceholder: "Alex Johnson",
    emailLabel: "Email Address",
    emailPlaceholder: "alex@example.com",
    passwordLabel: "Password",
    passwordPlaceholder: "At least 6 characters",
    confirmPasswordLabel: "Confirm Password",
    confirmPasswordPlaceholder: "Malli password enter cheyandi",
    stageLabel: "Mee Learning Stage Choose Cheskondi",
    langLabel: "Primary Learning Language (Bhasha)",
    avatarLabel: "Mee Favorite Avatar Choose Cheskondi",
    submitBtn: "Create Free Student Account →",
    alreadyAccount: "Already account undha?",
    signInLink: "Sign In Avvandi →",
    footerText: "Python Adaptive Interactive Guide • 5 Age Stages & 4 Multilingual Modes"
  },
  telugu: {
    heroBadge: "లెర్న్ విత్ అస్ • నేర్చుకోండి. సాధన చేయండి. ఎదగండి.",
    heroTitle1: "మీ పైథాన్ అభ్యాస",
    heroTitle2: "ప్రయాణాన్ని ప్రారంభించండి",
    heroDesc: "స్ట్రీక్స్ ట్రాక్ చేయడానికి, బుక్‌మార్క్‌లను సేవ్ చేయడానికి మరియు బ్రౌజర్‌లో ఉచితంగా పైథాన్ కోడ్ అమలు చేయడానికి ఉచిత ఖాతా సృష్టించండి.",
    outputBadge: "సెషన్ సిద్ధంగా ఉంది • 23,760 ప్రశ్నలు అందుబాటులో ఉన్నాయి",
    cardTitle: "ఉచిత విద్యార్థి ఖాతాను సృష్టించండి",
    cardDesc: "100% ఉచితం. క్రెడిట్ కార్డ్ అవసరం లేదు.",
    sslBadge: "256-బిట్ SSL",
    nameLabel: "పూర్తి పేరు",
    namePlaceholder: "మీ పేరును నమోదు చేయండి",
    emailLabel: "ఈమెయిల్ చిరునామా",
    emailPlaceholder: "alex@example.com",
    passwordLabel: "పాస్‌వర్డ్",
    passwordPlaceholder: "కనీసం 6 అక్షరాలు",
    confirmPasswordLabel: "పాస్‌వర్డ్ నిర్ధారించండి",
    confirmPasswordPlaceholder: "పాస్‌వర్డ్‌ను మళ్లీ నమోదు చేయండి",
    stageLabel: "మీ అభ్యాస స్థాయిని ఎంచుకోండి",
    langLabel: "ప్రాథమిక అభ్యాస భాష",
    avatarLabel: "మీ లెర్నింగ్ అవతార్‌ను ఎంచుకోండి",
    submitBtn: "ఉచిత ఖాతాను సృష్టించండి →",
    alreadyAccount: "ఇప్పటికే ఖాతా ఉందా?",
    signInLink: "ఇక్కడ లాగిన్ అవ్వండి →",
    footerText: "పైథాన్ అడాప్టివ్ ఇంటరాక్టివ్ గైడ్ • 5 అభ్యాస దశలు & 4 భాషలు"
  },
  hindi: {
    heroBadge: "लर्न विद अस • सीखें। अभ्यास करें। आगे बढ़ें।",
    heroTitle1: "अपनी पायथन सीखने की",
    heroTitle2: "यात्रा शुरू करें",
    heroDesc: "दैनिक स्ट्रीक ट्रैक करने, बुकमार्क सहेजने और अपने ब्राउज़र में पायथन कोड चलाने के लिए अपना मुफ़्त छात्र खाता बनाएं।",
    outputBadge: "सत्र तैयार है • 23,760 प्रश्न उपलब्ध हैं",
    cardTitle: "मुफ़्त छात्र खाता बनाएं",
    cardDesc: "100% मुफ़्त। किसी क्रेडिट कार्ड की आवश्यकता नहीं।",
    sslBadge: "256-बिट SSL",
    nameLabel: "पूरा नाम",
    namePlaceholder: "अपना पूरा नाम दर्ज करें",
    emailLabel: "ईमेल पता",
    emailPlaceholder: "alex@example.com",
    passwordLabel: "पासवर्ड",
    passwordPlaceholder: "कम से कम 6 अक्षर",
    confirmPasswordLabel: "पासवर्ड की पुष्टि करें",
    confirmPasswordPlaceholder: "पासवर्ड दोबारा दर्ज करें",
    stageLabel: "अपना सीखने का स्तर चुनें",
    langLabel: "प्राथमिक सीखने की भाषा",
    avatarLabel: "अपना लर्निंग अवतार चुनें",
    submitBtn: "मुफ़्त छात्र खाता बनाएं →",
    alreadyAccount: "क्या आपके पास पहले से खाता है?",
    signInLink: "यहाँ साइन इन करें →",
    footerText: "पायथन अडेप्टिव इंटरएक्टिव गाइड • 5 सीखने के स्तर और 4 भाषाएँ"
  }
};

export default function SignUp({ onNavigate, onBack }) {
  const { signup, authNotice } = useAuth();
  const { toggleTheme, isDark } = useTheme();

  // Signup form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [stage, setStage] = useState("young");
  const [language, setLanguage] = useState(() => getStoredLanguage() || "english");
  const [avatar, setAvatar] = useState("snake_blue");
  const [showPassword, setShowPassword] = useState(false);

  // Navbar Language Dropdown menu state
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const langMenuRef = useRef(null);

  // Status feedback
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Close language dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target)) {
        setLangMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Handle language transition and persistent save
  const handleLanguageSelect = (langId) => {
    setLanguage(langId);
    saveLanguage(langId);
    setLangMenuOpen(false);
  };

  const currentLangMeta = getLanguageById(language);
  const currentStageMeta = getStageById(stage);
  const t = SIGNUP_I18N[language] || SIGNUP_I18N.english;

  // Password strength calculation
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: "", color: "#94a3b8" };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass) && /[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 25, label: "Weak", color: "#f43f5e" };
    if (score === 2) return { score: 50, label: "Fair", color: "#f59e0b" };
    if (score === 3) return { score: 75, label: "Good", color: "#38bdf8" };
    return { score: 100, label: "Strong", color: "#10b981" };
  };

  const passwordStrength = getPasswordStrength(password);

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match. Please verify.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);

    try {
      await signup({
        name,
        email,
        password,
        stage,
        language,
        avatar,
        bio: `Python explorer in ${currentStageMeta.label} stage.`
      });
      if (onNavigate) {
        onNavigate("home");
      }
    } catch (err) {
      setErrorMsg(err.message || "Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      {/* 1. Ambient Background Grid & Floating Aurora Orbs */}
      <div className="auth-ambient-grid" aria-hidden="true" />
      <div
        className="auth-ambient-orb"
        style={{
          top: "-6rem",
          left: "-6rem",
          width: "32rem",
          height: "32rem",
          background: isDark
            ? "radial-gradient(circle, rgba(7, 86, 165, 0.45) 0%, rgba(56, 189, 248, 0.2) 50%, transparent 75%)"
            : "radial-gradient(circle, rgba(147, 197, 253, 0.5) 0%, rgba(191, 219, 254, 0.3) 50%, transparent 75%)"
        }}
        aria-hidden="true"
      />
      <div
        className="auth-ambient-orb"
        style={{
          bottom: "-6rem",
          right: "-6rem",
          width: "30rem",
          height: "30rem",
          animationDelay: "-5s",
          background: isDark
            ? "radial-gradient(circle, rgba(37, 99, 235, 0.35) 0%, rgba(79, 70, 229, 0.2) 50%, transparent 75%)"
            : "radial-gradient(circle, rgba(191, 219, 254, 0.4) 0%, rgba(221, 214, 254, 0.25) 50%, transparent 75%)"
        }}
        aria-hidden="true"
      />
      <div
        className="auth-ambient-orb"
        style={{
          top: "40%",
          right: "20%",
          width: "22rem",
          height: "22rem",
          animationDelay: "-9s",
          background: isDark
            ? "radial-gradient(circle, rgba(255, 184, 0, 0.12) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(254, 240, 138, 0.3) 0%, transparent 70%)"
        }}
        aria-hidden="true"
      />

      {/* 2. Top Navigation Bar (Constrained to 1200px so Brand Logo is locked in place) */}
      <header className="auth-header">
        <div className="auth-navbar-inner">
          {/* Left: Brand Logo in exact site-wide alignment */}
          <div
            onClick={() => onNavigate && onNavigate("home")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
              cursor: "pointer",
              transition: "transform 0.2s ease"
            }}
          >
            <BrandLogo variant="full" size="sm" showTagline={true} />
          </div>

          {/* Right Controls: Interactive Language Transition Dropdown + Theme Toggle */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
            {/* Language Switcher Capsule */}
            <div className="relative" ref={langMenuRef}>
              <button
                type="button"
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.45rem",
                  padding: "0.45rem 0.85rem",
                  borderRadius: "0.875rem",
                  background: isDark ? "rgba(16, 43, 80, 0.6)" : "#ffffff",
                  color: isDark ? "#ffffff" : "#102B50",
                  border: isDark ? "1px solid rgba(56, 189, 248, 0.25)" : "1px solid #E2E8F0",
                  backdropFilter: "blur(12px)",
                  cursor: "pointer",
                  fontSize: "0.775rem",
                  fontWeight: "800",
                  boxShadow: isDark ? "0 4px 12px rgba(0, 0, 0, 0.3)" : "0 2px 6px rgba(0, 0, 0, 0.04)",
                  transition: "all 0.2s ease"
                }}
                title="Switch Language / భాషను మార్చండి / भाषा बदलें"
                aria-label="Language Transition Selector"
                aria-expanded={langMenuOpen}
              >
                <Globe size={15} style={{ color: isDark ? "#38bdf8" : "#0756A5" }} />
                <span>{currentLangMeta.flag}</span>
                <span className="hidden sm:inline">{currentLangMeta.shortLabel}</span>
                <ChevronDown
                  size={14}
                  style={{
                    color: isDark ? "#94a3b8" : "#64748b",
                    transform: langMenuOpen ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.2s ease"
                  }}
                />
              </button>

              {/* Language Dropdown Menu with Transition */}
              {langMenuOpen && (
                <div
                  style={{
                    position: "absolute",
                    right: 0,
                    top: "calc(100% + 0.5rem)",
                    width: "15rem",
                    borderRadius: "1rem",
                    background: isDark ? "rgba(11, 24, 43, 0.95)" : "#ffffff",
                    border: isDark ? "1px solid rgba(56, 189, 248, 0.3)" : "1px solid #E2E8F0",
                    boxShadow: isDark
                      ? "0 16px 36px -4px rgba(0, 0, 0, 0.7), 0 0 20px rgba(7, 86, 165, 0.25)"
                      : "0 16px 36px -4px rgba(7, 86, 165, 0.12)",
                    backdropFilter: "blur(20px)",
                    padding: "0.5rem",
                    zIndex: 50,
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.3rem"
                  }}
                  className="animate-in fade-in zoom-in-95"
                >
                  <div
                    style={{
                      padding: "0.35rem 0.6rem",
                      fontSize: "0.675rem",
                      fontWeight: "800",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      color: isDark ? "#94a3b8" : "#64748b",
                      borderBottom: isDark ? "1px solid rgba(56, 189, 248, 0.12)" : "1px solid #f1f5f9"
                    }}
                  >
                    Select Language Mode
                  </div>
                  {LEARNING_LANGUAGES.map((l) => {
                    const isSel = language === l.id;
                    return (
                      <button
                        key={l.id}
                        type="button"
                        onClick={() => handleLanguageSelect(l.id)}
                        style={{
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "0.55rem 0.75rem",
                          borderRadius: "0.75rem",
                          background: isSel
                            ? isDark
                              ? "rgba(56, 189, 248, 0.2)"
                              : "rgba(7, 86, 165, 0.1)"
                            : "transparent",
                          border: isSel
                            ? isDark
                              ? "1px solid rgba(56, 189, 248, 0.4)"
                              : "1px solid rgba(7, 86, 165, 0.3)"
                            : "1px solid transparent",
                          color: isSel
                            ? isDark
                              ? "#38bdf8"
                              : "#0756A5"
                            : isDark
                            ? "#f1f5f9"
                            : "#102B50",
                          fontSize: "0.775rem",
                          fontWeight: isSel ? "800" : "600",
                          cursor: "pointer",
                          textAlign: "left",
                          transition: "all 0.15s ease"
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "0.55rem" }}>
                          <span style={{ fontSize: "1rem" }}>{l.flag}</span>
                          <span>{l.label}</span>
                        </div>
                        {isSel && <Check size={14} style={{ color: isDark ? "#38bdf8" : "#0756A5" }} />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              style={{
                padding: "0.6rem",
                borderRadius: "0.875rem",
                background: isDark ? "rgba(16, 43, 80, 0.6)" : "#ffffff",
                color: isDark ? "#FFB800" : "#102B50",
                border: isDark ? "1px solid rgba(56, 189, 248, 0.25)" : "1px solid #E2E8F0",
                backdropFilter: "blur(12px)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: isDark ? "0 4px 12px rgba(0, 0, 0, 0.3)" : "0 2px 6px rgba(0, 0, 0, 0.04)",
                transition: "all 0.2s ease"
              }}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label="Toggle Theme"
            >
              {isDark ? <Sun size={17} style={{ color: "#FFB800" }} /> : <Moon size={17} style={{ color: "#0756A5" }} />}
            </button>
          </div>
        </div>
      </header>

      {/* 3. Back Navigation Bar (Positioned outside navbar, aligned with page content) */}
      {onBack && (
        <div
          style={{
            maxWidth: "1200px",
            width: "100%",
            margin: "0 auto",
            padding: "0.25rem 1.5rem 0.5rem 1.5rem",
            position: "relative",
            zIndex: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start"
          }}
        >
          <PageBackButton onBack={onBack} label="Back to Previous Page" fallbackDestination="Home" />
        </div>
      )}

      {/* 4. Main Responsive Grid Layout */}
      <main className="auth-main-layout">
        {/* Left Branding, Highlights & Code Teaser Column */}
        <div className="auth-hero-section">
          {/* Glowing Pill Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.55rem",
              padding: "0.45rem 0.95rem",
              borderRadius: "9999px",
              fontSize: "0.75rem",
              fontWeight: "800",
              background: isDark ? "rgba(7, 86, 165, 0.22)" : "rgba(7, 86, 165, 0.08)",
              border: isDark ? "1px solid rgba(56, 189, 248, 0.35)" : "1px solid rgba(7, 86, 165, 0.25)",
              color: isDark ? "#38bdf8" : "#0756A5",
              backdropFilter: "blur(12px)",
              boxShadow: isDark ? "0 0 20px rgba(7, 86, 165, 0.3)" : "0 2px 8px rgba(7, 86, 165, 0.06)",
              alignSelf: "flex-start",
              transition: "all 0.3s ease"
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "9999px",
                backgroundColor: "#22c55e",
                boxShadow: "0 0 10px #22c55e",
                display: "inline-block"
              }}
            />
            <span>{t.heroBadge}</span>
            <Sparkles size={13} style={{ color: "#FFB800" }} />
          </div>

          {/* Main Hero Heading with Dynamic Multi-Language Transition */}
          <div>
            <h1
              style={{
                fontSize: "clamp(2rem, 4.4vw, 3rem)",
                fontWeight: "900",
                letterSpacing: "-0.035em",
                lineHeight: 1.15,
                color: isDark ? "#FFFFFF" : "#102B50",
                margin: 0,
                transition: "color 0.3s ease"
              }}
            >
              {t.heroTitle1} <br />
              <span
                style={{
                  background: isDark
                    ? "linear-gradient(135deg, #60A5FA 0%, #38BDF8 50%, #FFB800 100%)"
                    : "linear-gradient(135deg, #0756A5 0%, #2563EB 55%, #FFB800 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  display: "inline-block"
                }}
              >
                {t.heroTitle2}
              </span>
            </h1>

            <p
              style={{
                fontSize: "0.95rem",
                color: isDark ? "#94a3b8" : "#475569",
                lineHeight: 1.65,
                maxWidth: "34rem",
                marginTop: "0.85rem",
                marginBottom: 0,
                transition: "color 0.3s ease"
              }}
            >
              {t.heroDesc}
            </p>
          </div>

          {/* Mini Interactive IDE & Enrollment Teaser */}
          <div className="auth-code-teaser">
            {/* Window Top Bar */}
            <div
              style={{
                padding: "0.6rem 0.9rem",
                background: isDark ? "rgba(11, 24, 43, 0.85)" : "rgba(241, 245, 249, 0.95)",
                borderBottom: isDark ? "1px solid rgba(56, 189, 248, 0.15)" : "1px solid #e2e8f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "9999px", background: "#ef4444" }} />
                <span style={{ width: "10px", height: "10px", borderRadius: "9999px", background: "#f59e0b" }} />
                <span style={{ width: "10px", height: "10px", borderRadius: "9999px", background: "#10b981" }} />
                <span
                  style={{
                    marginLeft: "0.5rem",
                    fontSize: "0.75rem",
                    fontFamily: "var(--font-mono, monospace)",
                    fontWeight: "600",
                    color: isDark ? "#94a3b8" : "#64748b"
                  }}
                >
                  student_register.py
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  fontSize: "0.7rem",
                  fontWeight: "700",
                  padding: "0.2rem 0.55rem",
                  borderRadius: "9999px",
                  background: isDark ? "rgba(56, 189, 248, 0.12)" : "rgba(7, 86, 165, 0.1)",
                  color: isDark ? "#38bdf8" : "#0756A5",
                  fontFamily: "var(--font-mono, monospace)"
                }}
              >
                <Terminal size={11} />
                <span>Language: {currentLangMeta.label}</span>
              </div>
            </div>

            {/* Code Body */}
            <div
              style={{
                padding: "0.85rem 1rem",
                fontFamily: "var(--font-mono, monospace)",
                fontSize: "0.8rem",
                lineHeight: 1.6,
                color: isDark ? "#f1f5f9" : "#1e293b",
                overflowX: "auto"
              }}
            >
              <div>
                <span style={{ color: "#64748b" }}># Initialize new adaptive student account</span>
              </div>
              <div>
                <span style={{ color: isDark ? "#f43f5e" : "#e11d48", fontWeight: "700" }}>learner</span>
                {" = "}
                <span style={{ color: isDark ? "#38bdf8" : "#0284c7" }}>Student</span>
                {"."}
                <span style={{ color: isDark ? "#a78bfa" : "#7c3aed" }}>create</span>
                {"("}
              </div>
              <div style={{ paddingLeft: "1.25rem" }}>
                <span>stage=</span>
                <span style={{ color: isDark ? "#34d399" : "#059669" }}>"{stage}"</span>
                <span>, language=</span>
                <span style={{ color: isDark ? "#fbbf24" : "#d97706", fontWeight: "700" }}>"{language}"</span>
              </div>
              <div>{")"}</div>
              <div>
                <span style={{ color: isDark ? "#f43f5e" : "#e11d48", fontWeight: "700" }}>learner</span>
                {"."}
                <span style={{ color: isDark ? "#a78bfa" : "#7c3aed" }}>award_welcome_bonus</span>
                {"(xp=50)"}
              </div>
            </div>

            {/* Output Bar */}
            <div
              style={{
                padding: "0.5rem 1rem",
                background: isDark ? "rgba(6, 14, 26, 0.85)" : "rgba(238, 242, 255, 0.75)",
                borderTop: isDark ? "1px solid rgba(56, 189, 248, 0.12)" : "1px solid #e0e7ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: "0.725rem",
                fontFamily: "var(--font-mono, monospace)",
                color: isDark ? "#34d399" : "#15803d",
                fontWeight: "600"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <CheckCircle2 size={13} style={{ color: "#22c55e" }} />
                <span>[Enrollment] {t.outputBadge}</span>
              </div>
              <span style={{ color: isDark ? "#94a3b8" : "#64748b", fontSize: "0.675rem" }}>0.02ms</span>
            </div>
          </div>

          {/* 4 Feature Highlights Grid */}
          <div className="auth-feature-grid">
            <div className="auth-feature-card-v2">
              <div
                style={{
                  width: "2.35rem",
                  height: "2.35rem",
                  borderRadius: "0.75rem",
                  background: isDark ? "rgba(56, 189, 248, 0.15)" : "rgba(7, 86, 165, 0.1)",
                  color: isDark ? "#38bdf8" : "#0756A5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0
                }}
              >
                <Zap size={18} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.25rem", marginBottom: "0.2rem" }}>
                  <h4 style={{ fontSize: "0.85rem", fontWeight: "800", color: isDark ? "#ffffff" : "#102B50", margin: 0 }}>
                    Live Python Runner
                  </h4>
                  <span
                    style={{
                      fontSize: "0.625rem",
                      fontWeight: "800",
                      padding: "0.15rem 0.45rem",
                      borderRadius: "9999px",
                      background: isDark ? "rgba(56, 189, 248, 0.15)" : "rgba(7, 86, 165, 0.1)",
                      color: isDark ? "#38bdf8" : "#0756A5"
                    }}
                  >
                    Pyodide
                  </span>
                </div>
                <p style={{ fontSize: "0.75rem", color: isDark ? "#94a3b8" : "#64748b", lineHeight: 1.45, margin: 0 }}>
                  Execute real Python code in your browser with instant visual outputs.
                </p>
              </div>
            </div>

            <div className="auth-feature-card-v2">
              <div
                style={{
                  width: "2.35rem",
                  height: "2.35rem",
                  borderRadius: "0.75rem",
                  background: isDark ? "rgba(255, 184, 0, 0.15)" : "rgba(255, 184, 0, 0.15)",
                  color: "#FFB800",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0
                }}
              >
                <Flame size={18} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.25rem", marginBottom: "0.2rem" }}>
                  <h4 style={{ fontSize: "0.85rem", fontWeight: "800", color: isDark ? "#ffffff" : "#102B50", margin: 0 }}>
                    Streak & Progress Sync
                  </h4>
                  <span
                    style={{
                      fontSize: "0.625rem",
                      fontWeight: "800",
                      padding: "0.15rem 0.45rem",
                      borderRadius: "9999px",
                      background: isDark ? "rgba(255, 184, 0, 0.18)" : "rgba(255, 184, 0, 0.15)",
                      color: isDark ? "#FFB800" : "#b45309"
                    }}
                  >
                    Cloud Sync
                  </span>
                </div>
                <p style={{ fontSize: "0.75rem", color: isDark ? "#94a3b8" : "#64748b", lineHeight: 1.45, margin: 0 }}>
                  Never lose completed topics, quiz scores, or bookmarks across devices.
                </p>
              </div>
            </div>

            <div className="auth-feature-card-v2">
              <div
                style={{
                  width: "2.35rem",
                  height: "2.35rem",
                  borderRadius: "0.75rem",
                  background: isDark ? "rgba(96, 165, 250, 0.15)" : "rgba(37, 99, 235, 0.1)",
                  color: isDark ? "#60a5fa" : "#2563eb",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0
                }}
              >
                <Compass size={18} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.25rem", marginBottom: "0.2rem" }}>
                  <h4 style={{ fontSize: "0.85rem", fontWeight: "800", color: isDark ? "#ffffff" : "#102B50", margin: 0 }}>
                    Stage-Tailored Depth
                  </h4>
                  <span
                    style={{
                      fontSize: "0.625rem",
                      fontWeight: "800",
                      padding: "0.15rem 0.45rem",
                      borderRadius: "9999px",
                      background: isDark ? "rgba(96, 165, 250, 0.15)" : "rgba(37, 99, 235, 0.1)",
                      color: isDark ? "#60a5fa" : "#2563eb"
                    }}
                  >
                    5 Stages
                  </span>
                </div>
                <p style={{ fontSize: "0.75rem", color: isDark ? "#94a3b8" : "#64748b", lineHeight: 1.45, margin: 0 }}>
                  Explanations automatically match your preferred learning level.
                </p>
              </div>
            </div>

            <div className="auth-feature-card-v2">
              <div
                style={{
                  width: "2.35rem",
                  height: "2.35rem",
                  borderRadius: "0.75rem",
                  background: isDark ? "rgba(52, 211, 153, 0.15)" : "rgba(16, 185, 129, 0.1)",
                  color: isDark ? "#34d399" : "#059669",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0
                }}
              >
                <Globe size={18} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.25rem", marginBottom: "0.2rem" }}>
                  <h4 style={{ fontSize: "0.85rem", fontWeight: "800", color: isDark ? "#ffffff" : "#102B50", margin: 0 }}>
                    Bilingual Dictionary
                  </h4>
                  <span
                    style={{
                      fontSize: "0.625rem",
                      fontWeight: "800",
                      padding: "0.15rem 0.45rem",
                      borderRadius: "9999px",
                      background: isDark ? "rgba(52, 211, 153, 0.15)" : "rgba(16, 185, 129, 0.1)",
                      color: isDark ? "#34d399" : "#059669"
                    }}
                  >
                    4 Languages
                  </span>
                </div>
                <p style={{ fontSize: "0.75rem", color: isDark ? "#94a3b8" : "#64748b", lineHeight: 1.45, margin: 0 }}>
                  Technical Python terms translated into your mother tongue on demand.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Authentication Card Column */}
        <div className="auth-card-section">
          <div className="auth-card-v2">
            {/* Top Glowing Shimmer Bar */}
            <div
              style={{
                height: "3px",
                width: "100%",
                background: "linear-gradient(90deg, #0756A5 0%, #38BDF8 50%, #FFB800 100%)"
              }}
            />

            {/* Card Header */}
            <div
              style={{
                padding: "1.75rem 1.75rem 1.25rem 1.75rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.85rem",
                borderBottom: isDark ? "1px solid rgba(56, 189, 248, 0.12)" : "1px solid #f1f5f9"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
                  <div
                    style={{
                      width: "2.5rem",
                      height: "2.5rem",
                      borderRadius: "0.85rem",
                      background: isDark
                        ? "linear-gradient(135deg, rgba(7, 86, 165, 0.4), rgba(56, 189, 248, 0.2))"
                        : "linear-gradient(135deg, rgba(7, 86, 165, 0.15), rgba(59, 130, 246, 0.1))",
                      border: isDark ? "1px solid rgba(56, 189, 248, 0.3)" : "1px solid rgba(7, 86, 165, 0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: isDark ? "#38bdf8" : "#0756A5",
                      boxShadow: isDark ? "0 0 16px rgba(7, 86, 165, 0.3)" : "none"
                    }}
                  >
                    <User size={20} />
                  </div>
                  <div>
                    <h2
                      style={{
                        fontSize: "1.35rem",
                        fontWeight: "900",
                        letterSpacing: "-0.02em",
                        color: isDark ? "#ffffff" : "#102B50",
                        margin: 0
                      }}
                    >
                      {t.cardTitle}
                    </h2>
                    <p style={{ fontSize: "0.78rem", color: isDark ? "#94a3b8" : "#64748b", margin: 0, marginTop: "0.15rem" }}>
                      {t.cardDesc}
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    display: "none",
                    alignItems: "center",
                    gap: "0.3rem",
                    padding: "0.25rem 0.6rem",
                    borderRadius: "9999px",
                    background: isDark ? "rgba(56, 189, 248, 0.1)" : "rgba(7, 86, 165, 0.06)",
                    color: isDark ? "#38bdf8" : "#0756A5",
                    fontSize: "0.68rem",
                    fontWeight: "700"
                  }}
                  className="sm:inline-flex"
                >
                  <ShieldCheck size={12} />
                  <span>{t.sslBadge}</span>
                </div>
              </div>
            </div>

            {/* Form Container */}
            <div
              style={{
                padding: "1.5rem 1.75rem",
                display: "flex",
                flexDirection: "column",
                gap: "1.1rem"
              }}
            >
              {/* Context Notice */}
              {authNotice && (
                <div
                  style={{
                    padding: "0.75rem 0.95rem",
                    borderRadius: "0.875rem",
                    background: isDark ? "rgba(7, 86, 165, 0.25)" : "rgba(7, 86, 165, 0.08)",
                    border: isDark ? "1px solid rgba(56, 189, 248, 0.35)" : "1px solid rgba(7, 86, 165, 0.25)",
                    color: isDark ? "#38bdf8" : "#0756A5",
                    fontSize: "0.8rem",
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem"
                  }}
                >
                  <Sparkles size={15} style={{ flexShrink: 0 }} />
                  <span>{authNotice}</span>
                </div>
              )}

              {/* Error Message */}
              {errorMsg && (
                <div
                  style={{
                    padding: "0.75rem 0.95rem",
                    borderRadius: "0.875rem",
                    background: isDark ? "rgba(220, 38, 38, 0.2)" : "rgba(254, 242, 242, 0.95)",
                    border: isDark ? "1px solid rgba(239, 68, 68, 0.4)" : "1px solid #fecaca",
                    color: isDark ? "#fca5a5" : "#b91c1c",
                    fontSize: "0.78rem",
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem"
                  }}
                >
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Success Message */}
              {successMsg && (
                <div
                  style={{
                    padding: "0.75rem 0.95rem",
                    borderRadius: "0.875rem",
                    background: isDark ? "rgba(16, 185, 129, 0.2)" : "rgba(240, 253, 244, 0.95)",
                    border: isDark ? "1px solid rgba(34, 197, 94, 0.4)" : "1px solid #bbf7d0",
                    color: isDark ? "#86efac" : "#15803d",
                    fontSize: "0.78rem",
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem"
                  }}
                >
                  <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
                  <span>{successMsg}</span>
                </div>
              )}

              <form onSubmit={handleSignUpSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.05rem" }}>
                {/* Full Name */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.775rem",
                      fontWeight: "800",
                      marginBottom: "0.45rem",
                      color: isDark ? "#e2e8f0" : "#102B50"
                    }}
                  >
                    {t.nameLabel}
                  </label>
                  <div style={{ position: "relative" }}>
                    <User
                      size={17}
                      style={{
                        position: "absolute",
                        left: "0.95rem",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: isDark ? "#38bdf8" : "#0756A5"
                      }}
                    />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t.namePlaceholder}
                      className="auth-form-input-v2"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.775rem",
                      fontWeight: "800",
                      marginBottom: "0.45rem",
                      color: isDark ? "#e2e8f0" : "#102B50"
                    }}
                  >
                    {t.emailLabel}
                  </label>
                  <div style={{ position: "relative" }}>
                    <Mail
                      size={17}
                      style={{
                        position: "absolute",
                        left: "0.95rem",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: isDark ? "#38bdf8" : "#0756A5"
                      }}
                    />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t.emailPlaceholder}
                      className="auth-form-input-v2"
                    />
                  </div>
                </div>

                {/* Password with Strength Meter */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.775rem",
                      fontWeight: "800",
                      marginBottom: "0.45rem",
                      color: isDark ? "#e2e8f0" : "#102B50"
                    }}
                  >
                    {t.passwordLabel}
                  </label>
                  <div style={{ position: "relative" }}>
                    <Lock
                      size={17}
                      style={{
                        position: "absolute",
                        left: "0.95rem",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: isDark ? "#38bdf8" : "#0756A5"
                      }}
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t.passwordPlaceholder}
                      className="auth-form-input-v2"
                      style={{ paddingRight: "2.75rem" }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: "absolute",
                        right: "0.85rem",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: isDark ? "#94a3b8" : "#64748b",
                        padding: "0.25rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {/* Password Strength Bar */}
                  {password && (
                    <div style={{ marginTop: "0.4rem" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.675rem", marginBottom: "0.2rem" }}>
                        <span style={{ color: isDark ? "#94a3b8" : "#64748b" }}>Strength:</span>
                        <span style={{ fontWeight: "800", color: passwordStrength.color }}>{passwordStrength.label}</span>
                      </div>
                      <div style={{ height: "4px", width: "100%", borderRadius: "9999px", background: isDark ? "rgba(255, 255, 255, 0.1)" : "#e2e8f0", overflow: "hidden" }}>
                        <div
                          style={{
                            height: "100%",
                            width: `${passwordStrength.score}%`,
                            backgroundColor: passwordStrength.color,
                            transition: "all 0.3s ease"
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.775rem",
                      fontWeight: "800",
                      marginBottom: "0.45rem",
                      color: isDark ? "#e2e8f0" : "#102B50"
                    }}
                  >
                    {t.confirmPasswordLabel}
                  </label>
                  <div style={{ position: "relative" }}>
                    <Lock
                      size={17}
                      style={{
                        position: "absolute",
                        left: "0.95rem",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: isDark ? "#38bdf8" : "#0756A5"
                      }}
                    />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder={t.confirmPasswordPlaceholder}
                      className="auth-form-input-v2"
                    />
                  </div>
                </div>

                {/* Learning Stage Chips Selector */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.775rem",
                      fontWeight: "800",
                      marginBottom: "0.45rem",
                      color: isDark ? "#e2e8f0" : "#102B50"
                    }}
                  >
                    {t.stageLabel}
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "0.45rem" }}>
                    {LEARNING_STAGES.map((s) => {
                      const isSel = stage === s.id;
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setStage(s.id)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.4rem",
                            padding: "0.55rem 0.65rem",
                            borderRadius: "0.75rem",
                            border: isSel
                              ? isDark ? "2px solid #38bdf8" : "2px solid #0756A5"
                              : isDark ? "1px solid rgba(27, 59, 102, 0.9)" : "1px solid #cbd5e1",
                            background: isSel
                              ? isDark ? "rgba(56, 189, 248, 0.2)" : "rgba(7, 86, 165, 0.1)"
                              : isDark ? "rgba(10, 30, 56, 0.6)" : "#ffffff",
                            color: isSel
                              ? isDark ? "#38bdf8" : "#0756A5"
                              : isDark ? "#cbd5e1" : "#102B50",
                            cursor: "pointer",
                            fontSize: "0.75rem",
                            fontWeight: isSel ? "800" : "600",
                            textAlign: "left",
                            transition: "all 0.2s ease"
                          }}
                        >
                          <span style={{ fontSize: "1rem" }}>{s.icon}</span>
                          <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            <div>{s.label}</div>
                            <div style={{ fontSize: "0.625rem", color: isDark ? "#94a3b8" : "#64748b" }}>{s.ageRange}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Primary Language Transition Selector Cards */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.45rem" }}>
                    <label
                      style={{
                        fontSize: "0.775rem",
                        fontWeight: "800",
                        color: isDark ? "#e2e8f0" : "#102B50"
                      }}
                    >
                      {t.langLabel}
                    </label>
                    <span
                      style={{
                        fontSize: "0.65rem",
                        fontWeight: "700",
                        color: isDark ? "#38bdf8" : "#0756A5"
                      }}
                    >
                      ⚡ Instant UI Transition
                    </span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.55rem" }}>
                    {LEARNING_LANGUAGES.map((l) => {
                      const isSel = language === l.id;
                      return (
                        <button
                          key={l.id}
                          type="button"
                          onClick={() => handleLanguageSelect(l.id)}
                          style={{
                            padding: "0.65rem 0.75rem",
                            borderRadius: "0.875rem",
                            border: isSel
                              ? isDark ? "2px solid #38bdf8" : "2px solid #0756A5"
                              : isDark ? "1.5px solid rgba(27, 59, 102, 0.9)" : "1.5px solid #cbd5e1",
                            background: isSel
                              ? isDark ? "rgba(56, 189, 248, 0.2)" : "rgba(7, 86, 165, 0.1)"
                              : isDark ? "rgba(10, 30, 56, 0.6)" : "#ffffff",
                            cursor: "pointer",
                            textAlign: "left",
                            transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                            transform: isSel ? "scale(1.02)" : "scale(1)",
                            boxShadow: isSel
                              ? isDark ? "0 4px 14px rgba(56, 189, 248, 0.25)" : "0 4px 14px rgba(7, 86, 165, 0.15)"
                              : "none",
                            position: "relative"
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                              <span style={{ fontSize: "1.1rem" }}>{l.flag}</span>
                              <span
                                style={{
                                  fontSize: "0.775rem",
                                  fontWeight: "800",
                                  color: isSel
                                    ? isDark ? "#38bdf8" : "#0756A5"
                                    : isDark ? "#ffffff" : "#102B50"
                                }}
                              >
                                {l.shortLabel}
                              </span>
                            </div>
                            {isSel && (
                              <div
                                style={{
                                  width: "1rem",
                                  height: "1rem",
                                  borderRadius: "9999px",
                                  background: isDark ? "#38bdf8" : "#0756A5",
                                  color: "#ffffff",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: "0.6rem"
                                }}
                              >
                                <Check size={10} strokeWidth={3} />
                              </div>
                            )}
                          </div>
                          <div
                            style={{
                              fontSize: "0.675rem",
                              color: isDark ? "#94a3b8" : "#64748b",
                              marginTop: "0.25rem",
                              lineHeight: 1.3
                            }}
                          >
                            {l.label}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Avatar Selector */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.775rem",
                      fontWeight: "800",
                      marginBottom: "0.45rem",
                      color: isDark ? "#e2e8f0" : "#102B50"
                    }}
                  >
                    {t.avatarLabel}
                  </label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                    {AVATAR_OPTIONS.map((a) => {
                      const isSel = avatar === a.id;
                      return (
                        <button
                          key={a.id}
                          type="button"
                          onClick={() => setAvatar(a.id)}
                          style={{
                            width: "2.6rem",
                            height: "2.6rem",
                            borderRadius: "0.75rem",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "1.25rem",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            border: isSel
                              ? isDark ? "2px solid #38bdf8" : "2px solid #0756A5"
                              : isDark ? "1px solid rgba(27, 59, 102, 0.9)" : "1px solid #cbd5e1",
                            background: isSel
                              ? isDark ? "rgba(56, 189, 248, 0.25)" : "rgba(7, 86, 165, 0.15)"
                              : isDark ? "rgba(10, 30, 56, 0.6)" : "#ffffff",
                            transform: isSel ? "scale(1.1)" : "scale(1)",
                            boxShadow: isSel
                              ? isDark ? "0 4px 14px rgba(56, 189, 248, 0.3)" : "0 4px 14px rgba(7, 86, 165, 0.15)"
                              : "none"
                          }}
                          title={a.label}
                        >
                          {a.emoji}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Primary Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="auth-btn-primary-v2"
                  style={{ marginTop: "0.35rem" }}
                >
                  {isLoading ? (
                    <RefreshCw size={17} className="animate-spin" />
                  ) : (
                    <>
                      <span>{t.submitBtn}</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Card Footer: Switch to Sign In */}
            <div
              style={{
                padding: "1.1rem 1.75rem",
                background: isDark ? "rgba(6, 14, 26, 0.7)" : "rgba(248, 250, 252, 0.9)",
                borderTop: isDark ? "1px solid rgba(56, 189, 248, 0.12)" : "1px solid #f1f5f9",
                textAlign: "center",
                fontSize: "0.825rem",
                color: isDark ? "#94a3b8" : "#64748b"
              }}
            >
              {t.alreadyAccount}{" "}
              <button
                type="button"
                onClick={() => onNavigate && onNavigate("signin")}
                style={{
                  fontWeight: "900",
                  color: isDark ? "#38bdf8" : "#0756A5",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  fontSize: "0.825rem",
                  marginLeft: "0.25rem",
                  textDecoration: "underline",
                  textUnderlineOffset: "3px"
                }}
              >
                {t.signInLink}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* 5. Footer */}
      <footer
        style={{
          position: "relative",
          zIndex: 10,
          padding: "1.15rem",
          textAlign: "center",
          fontSize: "0.775rem",
          color: isDark ? "#94a3b8" : "#64748b",
          borderTop: isDark ? "1px solid rgba(56, 189, 248, 0.12)" : "1px solid #e2e8f0"
        }}
      >
        {t.footerText}
      </footer>
    </div>
  );
}
