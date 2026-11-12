import React, { useState, useRef, useEffect } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Flame,
  Zap,
  RefreshCw,
  LogIn,
  Sun,
  Moon,
  Compass,
  Globe,
  ChevronDown,
  Check,
  ShieldCheck,
  Terminal,
  Code2
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import BrandLogo from "../components/BrandLogo";
import PageBackButton from "../components/PageBackButton";
import { LEARNING_LANGUAGES, getLanguageById, getStoredLanguage, saveLanguage } from "../data/learningLanguages";

// Multi-language UI Localization Dictionary for Dynamic Transitions
const SIGNIN_I18N = {
  english: {
    heroBadge: "Learn With Us • Learn. Practice. Grow.",
    heroTitle1: "Continue Your",
    heroTitle2: "Python Mastery Journey",
    heroDesc: "Sign in to access your saved bookmarks, sync your lesson progress, protect your daily learning streak, and keep your custom age stage & language preferences.",
    ideOutput: "Session Active • 23,760 Questions Ready",
    feat1Title: "Live Python Runner",
    feat1Desc: "Execute real Python code in your browser with instant visual outputs.",
    feat1Tag: "Pyodide",
    feat2Title: "Streak & Progress Sync",
    feat2Desc: "Never lose completed topics, quiz scores, or bookmarks across devices.",
    feat2Tag: "Cloud Sync",
    feat3Title: "Stage-Tailored Depth",
    feat3Desc: "Explanations automatically match your preferred learning level.",
    feat3Tag: "5 Stages",
    feat4Title: "Bilingual Dictionary",
    feat4Desc: "Technical Python terms translated into your mother tongue on demand.",
    feat4Tag: "4 Languages",
    backButton: "Back to Previous Page",
    cardTitle: "Sign In to Your Account",
    cardDesc: "Enter your email or username below to continue.",
    forgotTitle: "Reset Account Password",
    forgotDesc: "Enter your registered email and a new password.",
    sslBadge: "256-bit SSL",
    emailLabel: "Email or Username",
    emailPlaceholder: "alex@example.com or Alex Johnson",
    passwordLabel: "Password",
    passwordPlaceholder: "Enter your password",
    forgotPassword: "Forgot password?",
    rememberMe: "Keep me signed in on this device",
    signInBtn: "Sign In",
    quickAccounts: "1-Click Quick Test Accounts",
    instantFill: "Instant Fill",
    noAccount: "Don't have an account yet?",
    createAccount: "Create Account Free →",
    regEmailLabel: "Registered Account Email",
    regEmailPlaceholder: "Enter your registered email",
    newPasswordLabel: "New Password",
    newPasswordPlaceholder: "At least 6 characters",
    backToSignIn: "Back to Sign In",
    saveNewPassword: "Save New Password",
    footerText: "Learn With Us • Python Adaptive Interactive Guide • 5 Age Stages & 4 Multilingual Modes"
  },
  "english-telugu": {
    heroBadge: "Learn With Us • Learn. Practice. Grow.",
    heroTitle1: "Continue Your",
    heroTitle2: "Python Mastery Journey",
    heroDesc: "Mee saved bookmarks access cheskodaniki, lesson progress sync cheskodaniki, and daily learning streak protect cheskodaniki sign in avvandi.",
    ideOutput: "Session Active • 23,760 Questions Ready",
    feat1Title: "Live Python Runner",
    feat1Desc: "Browser lone real Python code execute chesi instant results chudandi.",
    feat1Tag: "Pyodide",
    feat2Title: "Streak & Progress Sync",
    feat2Desc: "Mee completed topics, quiz scores and bookmarks cloud lo safe ga sync avthayi.",
    feat2Tag: "Cloud Sync",
    feat3Title: "Stage-Tailored Depth",
    feat3Desc: "Mee learning level ki taggattu explanations automatically match avthayi.",
    feat3Tag: "5 Stages",
    feat4Title: "Bilingual Dictionary",
    feat4Desc: "Technical Python terms mee bhasha lo simple ga translate cheskondi.",
    feat4Tag: "4 Languages",
    backButton: "Venakki Vellandi",
    cardTitle: "Sign In to Your Account",
    cardDesc: "Mee email ledha username enter chesi continue avvandi.",
    forgotTitle: "Password Reset Cheyandi",
    forgotDesc: "Mee registered email and kotha password enter cheyandi.",
    sslBadge: "256-bit SSL",
    emailLabel: "Email ledha Username",
    emailPlaceholder: "alex@example.com ledha Alex Johnson",
    passwordLabel: "Password",
    passwordPlaceholder: "Mee password enter cheyandi",
    forgotPassword: "Password marchipoyara?",
    rememberMe: "Ee device lo nannu signed in ga unchandi",
    signInBtn: "Sign In Avvandi",
    quickAccounts: "1-Click Quick Test Accounts",
    instantFill: "Instant Fill",
    noAccount: "Inka account ledha?",
    createAccount: "Free Account Create Cheskondi →",
    regEmailLabel: "Registered Email Address",
    regEmailPlaceholder: "Mee registered email enter cheyandi",
    newPasswordLabel: "Kotha Password",
    newPasswordPlaceholder: "At least 6 characters",
    backToSignIn: "Sign In ki Thirigi Vellandi",
    saveNewPassword: "Kotha Password Save Cheyandi",
    footerText: "Learn With Us • Python Adaptive Interactive Guide • 5 Age Stages & 4 Multilingual Modes"
  },
  telugu: {
    heroBadge: "లెర్న్ విత్ అస్ • నేర్చుకోండి. సాధన చేయండి. ఎదగండి.",
    heroTitle1: "మీ పైథాన్ అభ్యాస",
    heroTitle2: "ప్రయాణాన్ని కొనసాగించండి",
    heroDesc: "మీ సేవ్ చేసిన బుక్‌మార్క్‌లను పొందడానికి, లెసన్ పురోగతిని సింక్ చేయడానికి, మీ డైలీ లెర్నింగ్ స్ట్రీక్‌ను కాపాడుకోవడానికి సైన్ ఇన్ చేయండి.",
    ideOutput: "సెషన్ యాక్టివ్ • 23,760 ప్రశ్నలు సిద్ధంగా ఉన్నాయి",
    feat1Title: "లైవ్ పైథాన్ రన్నర్",
    feat1Desc: "బ్రౌజర్‌లోనే నిజమైన పైథాన్ కోడ్‌ను రన్ చేసి తక్షణ ఫలితాలను పొందండి.",
    feat1Tag: "పైయోడైడ్",
    feat2Title: "స్ట్రీక్ & ప్రోగ్రెస్ సింక్",
    feat2Desc: "పూర్తయిన అంశాలు, క్విజ్ స్కోర్‌లు కోల్పోకుండా క్లౌడ్‌లో సురక్షితంగా సింక్ చేయండి.",
    feat2Tag: "క్లౌడ్ సింక్",
    feat3Title: "దశలవారీ అభ్యాసం",
    feat3Desc: "మీ అభ్యాస స్థాయికి తగినట్లుగా వివరణలు స్వయంచాలకంగా మారుతాయి.",
    feat3Tag: "5 దశలు",
    feat4Title: "ద్విభాషా నిఘంటువు",
    feat4Desc: "సాంకేతిక పైథాన్ పదాలను మీ మాతృభాషలో సులభంగా అర్థం చేసుకోండి.",
    feat4Tag: "4 భాషలు",
    backButton: "మునుపటి పేజీకి తిరిగి వెళ్లండి",
    cardTitle: "మీ ఖాతాలోకి సైన్ ఇన్ చేయండి",
    cardDesc: "కొనసాగడానికి క్రింద మీ ఈమెయిల్ లేదా యూజర్‌నేమ్ నమోదు చేయండి.",
    forgotTitle: "ఖాతా పాస్‌వర్డ్ రీసెట్ చేయండి",
    forgotDesc: "మీ నమోదిత ఈమెయిల్ మరియు కొత్త పాస్‌వర్డ్ నమోదు చేయండి.",
    sslBadge: "256-బిట్ SSL",
    emailLabel: "ఈమెయిల్ లేదా యూజర్‌నేమ్",
    emailPlaceholder: "alex@example.com లేదా Alex Johnson",
    passwordLabel: "పాస్‌వర్డ్",
    passwordPlaceholder: "మీ పాస్‌వర్డ్ నమోదు చేయండి",
    forgotPassword: "పాస్‌వర్డ్ మర్చిపోయారా?",
    rememberMe: "ఈ పరికరంలో నన్ను సైన్ ఇన్ చేసి ఉంచండి",
    signInBtn: "సైన్ ఇన్ చేయండి",
    quickAccounts: "1-క్లిక్ శీఘ్ర పరీక్ష ఖాతాలు",
    instantFill: "తక్షణ భర్తీ",
    noAccount: "ఇంకా ఖాతా లేదా?",
    createAccount: "ఉచిత ఖాతాను సృష్టించండి →",
    regEmailLabel: "నమోదిత ఖాతా ఈమెయిల్",
    regEmailPlaceholder: "మీ నమోదిత ఈమెయిల్ నమోదు చేయండి",
    newPasswordLabel: "కొత్త పాస్‌వర్డ్",
    newPasswordPlaceholder: "కనీసం 6 అక్షరాలు",
    backToSignIn: "సైన్ ఇన్ పేజీకి తిరిగి వెళ్లండి",
    saveNewPassword: "కొత్త పాస్‌వర్డ్‌ను సేవ్ చేయండి",
    footerText: "లెర్న్ విత్ అస్ • పైథాన్ అడాప్టివ్ ఇంటరాక్టివ్ గైడ్ • 5 అభ్యాస దశలు & 4 భాషలు"
  },
  hindi: {
    heroBadge: "लर्न विद अस • सीखें। अभ्यास करें। आगे बढ़ें।",
    heroTitle1: "अपनी पायथन",
    heroTitle2: "मास्टरी यात्रा जारी रखें",
    heroDesc: "अपने सहेजे गए बुकमार्क देखने, पाठ की प्रगति सिंक करने, दैनिक स्ट्रीक सुरक्षित रखने और अपनी प्राथमिकताओं को बनाए रखने के लिए साइन इन करें।",
    ideOutput: "सत्र सक्रिय • 23,760 प्रश्न तैयार हैं",
    feat1Title: "लाइव पायथन रनर",
    feat1Desc: "त्वरित दृश्य परिणामों के साथ अपने ब्राउज़र में वास्तविक पायथन कोड चलाएं।",
    feat1Tag: "पायोडाइड",
    feat2Title: "स्ट्रीक और प्रगति सिंक",
    feat2Desc: "पूरे किए गए विषय, क्विज़ स्कोर या बुकमार्क कभी न खोएं।",
    feat2Tag: "क्लाउड सिंक",
    feat3Title: "स्तर-आधारित गहराई",
    feat3Desc: "स्पष्टीकरण स्वचालित रूप से आपके पसंदीदा सीखने के स्तर से मेल खाते हैं।",
    feat3Tag: "5 स्तर",
    feat4Title: "द्विभाषी शब्दकोश",
    feat4Desc: "तकनीकी पायथन शब्दों का अपनी मातृभाषा में तुरंत अनुवाद प्राप्त करें।",
    feat4Tag: "4 भाषाएँ",
    backButton: "पिछले पृष्ठ पर वापस जाएं",
    cardTitle: "अपने खाते में साइन इन करें",
    cardDesc: "जारी रखने के लिए नीचे अपना ईमेल या उपयोगकर्ता नाम दर्ज करें।",
    forgotTitle: "खाता पासवर्ड रीसेट करें",
    forgotDesc: "अपना पंजीकृत ईमेल और नया पासवर्ड दर्ज करें।",
    sslBadge: "256-बिट SSL",
    emailLabel: "ईमेल या उपयोगकर्ता नाम",
    emailPlaceholder: "alex@example.com या Alex Johnson",
    passwordLabel: "पासवर्ड",
    passwordPlaceholder: "अपना पासवर्ड दर्ज करें",
    forgotPassword: "पासवर्ड भूल गए?",
    rememberMe: "इस डिवाइस पर मुझे साइन इन रखें",
    signInBtn: "साइन इन करें",
    quickAccounts: "1-क्लिक त्वरित परीक्षण खाते",
    instantFill: "तुरंत भरें",
    noAccount: "क्या आपके पास अभी तक खाता नहीं है?",
    createAccount: "मुफ़्त खाता बनाएं →",
    regEmailLabel: "पंजीकृत खाता ईमेल",
    regEmailPlaceholder: "अपना पंजीकृत ईमेल दर्ज करें",
    newPasswordLabel: "नया पासवर्ड",
    newPasswordPlaceholder: "कम से कम 6 अक्षर",
    backToSignIn: "साइन इन पर वापस जाएं",
    saveNewPassword: "नया पासवर्ड सहेजें",
    footerText: "लर्न विद अस • पायथन अडेप्टिव इंटरएक्टिव गाइड • 5 सीखने के स्तर और 4 भाषाएँ"
  }
};

export default function SignIn({ onNavigate, onBack }) {
  const { login, resetPassword, authNotice } = useAuth();
  const { toggleTheme, isDark } = useTheme();

  // Mode: 'signin' | 'forgot'
  const [viewMode, setViewMode] = useState("signin");

  // Sign In fields
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // Language state & Navbar Dropdown menu
  const [language, setLanguage] = useState(() => getStoredLanguage() || "english");
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const langMenuRef = useRef(null);

  // Forgot password fields
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");

  // Feedback status
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
  const t = SIGNIN_I18N[language] || SIGNIN_I18N.english;

  const handleSignInSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setIsLoading(true);

    try {
      await login({
        emailOrUsername,
        password,
        rememberMe
      });
      setSuccessMsg("✓ Signed in successfully! Redirecting...");
      if (onNavigate) {
        onNavigate("home");
      }
    } catch (err) {
      setSuccessMsg("");
      setErrorMsg(err.message || "Failed to sign in. Please verify your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  // Instant Fill: directly populates demo credentials into form inputs with positive feedback
  const handleInstantFill = (e, target = null) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setErrorMsg("");

    // Toggle between Alex and Priya, or honor explicit target
    const usePriya = target === "priya" || (!target && emailOrUsername === "alex@example.com");
    const demoEmail = usePriya ? "priya@example.com" : "alex@example.com";
    const demoPass = "password123";
    const label = usePriya ? "Priya (Graduate)" : "Alex (College)";

    setEmailOrUsername(demoEmail);
    setPassword(demoPass);
    setSuccessMsg(`✓ Instant Fill: ${label} credentials loaded! Click "${t.signInBtn}" to proceed.`);
  };

  const handleQuickDemo = async (demoEmail, demoPass, accountLabel = "Alex") => {
    setErrorMsg("");
    setSuccessMsg("");
    // 1. Instantly populate the input fields in React state
    setEmailOrUsername(demoEmail);
    setPassword(demoPass);
    setIsLoading(true);

    try {
      await login({
        emailOrUsername: demoEmail,
        password: demoPass,
        rememberMe: true
      });
      setSuccessMsg(`✓ Signed in successfully as ${accountLabel}! Redirecting...`);
      if (onNavigate) {
        onNavigate("home");
      }
    } catch (err) {
      console.warn("Demo login error:", err);
      setSuccessMsg("");
      // Keep credentials visible in form and provide clear actionable feedback
      setErrorMsg(
        err.message ||
        `Demo login encountered a network issue. Credentials for ${accountLabel} have been filled into the form.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setIsLoading(true);

    try {
      await resetPassword(forgotEmail, forgotNewPassword);
      setSuccessMsg("Password reset successfully! You can now sign in with your new password.");
      setViewMode("signin");
      setPassword("");
    } catch (err) {
      setErrorMsg(err.message || "Password reset failed");
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
          <PageBackButton onBack={onBack} label={t.backButton || "Back to Previous Page"} fallbackDestination="Home" />
        </div>
      )}

      {/* 4. Main Responsive Grid Layout */}
      <main className="auth-main-layout">
        {/* Left Branding, Highlights & Interactive Showcase Column */}
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

          {/* Main Hero Heading with Dynamic Language Transition */}
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

          {/* Mini Interactive IDE & Learner Teaser Card */}
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
                  learner_sync.py
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
                <span style={{ color: "#64748b" }}># Resume your adaptive learning path</span>
              </div>
              <div>
                <span style={{ color: isDark ? "#f43f5e" : "#e11d48", fontWeight: "700" }}>student</span>
                {" = "}
                <span style={{ color: isDark ? "#38bdf8" : "#0284c7" }}>Learner</span>
                {"."}
                <span style={{ color: isDark ? "#a78bfa" : "#7c3aed" }}>connect</span>
                {"()"}
              </div>
              <div>
                <span style={{ color: isDark ? "#f43f5e" : "#e11d48", fontWeight: "700" }}>student</span>
                {"."}
                <span style={{ color: isDark ? "#a78bfa" : "#7c3aed" }}>sync_progress</span>
                {"(language="}
                <span style={{ color: isDark ? "#fbbf24" : "#d97706", fontWeight: "700" }}>"{language}"</span>
                {")"}
              </div>
              <div>
                <span style={{ color: isDark ? "#fbbf24" : "#d97706" }}>print</span>
                {"(f"}
                <span style={{ color: isDark ? "#34d399" : "#059669" }}>"🔥 Daily Streak: &#123;student.streak&#125; Days | +50 XP"</span>
                {")"}
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
                <span>[Output] {t.ideOutput}</span>
              </div>
              <span style={{ color: isDark ? "#94a3b8" : "#64748b", fontSize: "0.675rem" }}>0.04ms</span>
            </div>
          </div>

          {/* 4 Feature Highlights Grid */}
          <div className="auth-feature-grid">
            {/* Feature 1 */}
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
                  flexShrink: 0,
                  boxShadow: isDark ? "0 0 14px rgba(56, 189, 248, 0.25)" : "none"
                }}
              >
                <Zap size={18} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.25rem", marginBottom: "0.2rem" }}>
                  <h4 style={{ fontSize: "0.85rem", fontWeight: "800", color: isDark ? "#ffffff" : "#102B50", margin: 0 }}>
                    {t.feat1Title}
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
                    {t.feat1Tag}
                  </span>
                </div>
                <p style={{ fontSize: "0.75rem", color: isDark ? "#94a3b8" : "#64748b", lineHeight: 1.45, margin: 0 }}>
                  {t.feat1Desc}
                </p>
              </div>
            </div>

            {/* Feature 2 */}
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
                  flexShrink: 0,
                  boxShadow: isDark ? "0 0 14px rgba(255, 184, 0, 0.25)" : "none"
                }}
              >
                <Flame size={18} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.25rem", marginBottom: "0.2rem" }}>
                  <h4 style={{ fontSize: "0.85rem", fontWeight: "800", color: isDark ? "#ffffff" : "#102B50", margin: 0 }}>
                    {t.feat2Title}
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
                    {t.feat2Tag}
                  </span>
                </div>
                <p style={{ fontSize: "0.75rem", color: isDark ? "#94a3b8" : "#64748b", lineHeight: 1.45, margin: 0 }}>
                  {t.feat2Desc}
                </p>
              </div>
            </div>

            {/* Feature 3 */}
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
                  flexShrink: 0,
                  boxShadow: isDark ? "0 0 14px rgba(96, 165, 250, 0.25)" : "none"
                }}
              >
                <Compass size={18} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.25rem", marginBottom: "0.2rem" }}>
                  <h4 style={{ fontSize: "0.85rem", fontWeight: "800", color: isDark ? "#ffffff" : "#102B50", margin: 0 }}>
                    {t.feat3Title}
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
                    {t.feat3Tag}
                  </span>
                </div>
                <p style={{ fontSize: "0.75rem", color: isDark ? "#94a3b8" : "#64748b", lineHeight: 1.45, margin: 0 }}>
                  {t.feat3Desc}
                </p>
              </div>
            </div>

            {/* Feature 4 */}
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
                  flexShrink: 0,
                  boxShadow: isDark ? "0 0 14px rgba(52, 211, 153, 0.25)" : "none"
                }}
              >
                <Globe size={18} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.25rem", marginBottom: "0.2rem" }}>
                  <h4 style={{ fontSize: "0.85rem", fontWeight: "800", color: isDark ? "#ffffff" : "#102B50", margin: 0 }}>
                    {t.feat4Title}
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
                    {t.feat4Tag}
                  </span>
                </div>
                <p style={{ fontSize: "0.75rem", color: isDark ? "#94a3b8" : "#64748b", lineHeight: 1.45, margin: 0 }}>
                  {t.feat4Desc}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Authentication Card Column */}
        <div className="auth-card-section">
          <div className="auth-card-v2">
            {/* Top Glowing Gradient Shimmer Bar */}
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
                    <LogIn size={20} />
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
                      {viewMode === "signin" ? t.cardTitle : t.forgotTitle}
                    </h2>
                    <p style={{ fontSize: "0.78rem", color: isDark ? "#94a3b8" : "#64748b", margin: 0, marginTop: "0.15rem" }}>
                      {viewMode === "signin" ? t.cardDesc : t.forgotDesc}
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
              {/* Context Notice Message */}
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
                  <Lock size={15} style={{ flexShrink: 0 }} />
                  <span>{authNotice}</span>
                </div>
              )}

              {/* Feedback Alerts (Mutually Exclusive) */}
              {errorMsg ? (
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
              ) : successMsg ? (
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
              ) : null}

              {/* SIGN IN FORM */}
              {viewMode === "signin" ? (
                <form onSubmit={handleSignInSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
                  {/* Email or Username */}
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
                        type="text"
                        required
                        value={emailOrUsername}
                        onChange={(e) => setEmailOrUsername(e.target.value)}
                        placeholder={t.emailPlaceholder}
                        className="auth-form-input-v2"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "0.45rem"
                      }}
                    >
                      <label
                        style={{
                          fontSize: "0.775rem",
                          fontWeight: "800",
                          color: isDark ? "#e2e8f0" : "#102B50"
                        }}
                      >
                        {t.passwordLabel}
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setViewMode("forgot");
                          setErrorMsg("");
                          setSuccessMsg("");
                        }}
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: "800",
                          color: isDark ? "#38bdf8" : "#0756A5",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: 0,
                          transition: "color 0.2s ease"
                        }}
                      >
                        {t.forgotPassword}
                      </button>
                    </div>
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
                          justifyContent: "center",
                          borderRadius: "0.4rem"
                        }}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Keep Signed In Checkbox */}
                  <div style={{ display: "flex", alignItems: "center", fontSize: "0.78rem" }}>
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.6rem",
                        cursor: "pointer",
                        userSelect: "none",
                        color: isDark ? "#cbd5e1" : "#475569",
                        fontWeight: "600"
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        style={{
                          width: "1.1rem",
                          height: "1.1rem",
                          borderRadius: "0.35rem",
                          cursor: "pointer",
                          accentColor: "#0756A5"
                        }}
                      />
                      <span>{t.rememberMe}</span>
                    </label>
                  </div>

                  {/* Primary Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="auth-btn-primary-v2"
                  >
                    {isLoading ? (
                      <RefreshCw size={17} className="animate-spin" />
                    ) : (
                      <>
                        <LogIn size={18} />
                        <span>{t.signInBtn}</span>
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>

                  {/* Quick Test Accounts Dock */}
                  <div
                    style={{
                      paddingTop: "0.95rem",
                      borderTop: isDark ? "1px solid rgba(56, 189, 248, 0.15)" : "1px solid #f1f5f9"
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "0.65rem"
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.4rem",
                          fontSize: "0.75rem",
                          fontWeight: "800",
                          color: isDark ? "#94a3b8" : "#64748b"
                        }}
                      >
                        <Sparkles size={14} style={{ color: "#FFB800" }} />
                        <span>{t.quickAccounts}</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => handleInstantFill(e)}
                        className="auth-instant-fill-btn"
                        title="Click to instantly populate demo credentials into the form"
                        aria-label="Instant fill demo credentials"
                      >
                        <Zap size={11} style={{ color: "#FFB800" }} />
                        <span>{t.instantFill}</span>
                      </button>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem" }}>
                      {/* Demo 1: Alex */}
                      <button
                        type="button"
                        onClick={() => handleQuickDemo("alex@example.com", "password123", "Alex")}
                        className={`auth-demo-card-v2 ${emailOrUsername === "alex@example.com" ? "active-account" : ""}`}
                        title="Click to sign in with Alex (College)"
                      >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span style={{ fontSize: "0.78rem", fontWeight: "800", color: isDark ? "#ffffff" : "#102B50" }}>
                            🐍 Alex
                          </span>
                          <span
                            style={{
                              fontSize: "0.625rem",
                              fontWeight: "800",
                              padding: "0.1rem 0.4rem",
                              borderRadius: "9999px",
                              background: isDark ? "rgba(56, 189, 248, 0.15)" : "rgba(7, 86, 165, 0.1)",
                              color: isDark ? "#38bdf8" : "#0756A5"
                            }}
                          >
                            {emailOrUsername === "alex@example.com" ? "✓ Filled" : "College"}
                          </span>
                        </div>
                        <div
                          style={{
                            fontSize: "0.675rem",
                            color: isDark ? "#94a3b8" : "#64748b",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap"
                          }}
                        >
                          alex@example.com
                        </div>
                      </button>

                      {/* Demo 2: Priya */}
                      <button
                        type="button"
                        onClick={() => handleQuickDemo("priya@example.com", "password123", "Priya")}
                        className={`auth-demo-card-v2 ${emailOrUsername === "priya@example.com" ? "active-account" : ""}`}
                        title="Click to sign in with Priya (Graduate)"
                      >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span style={{ fontSize: "0.78rem", fontWeight: "800", color: isDark ? "#ffffff" : "#102B50" }}>
                            ✨ Priya
                          </span>
                          <span
                            style={{
                              fontSize: "0.625rem",
                              fontWeight: "800",
                              padding: "0.1rem 0.4rem",
                              borderRadius: "9999px",
                              background: isDark ? "rgba(255, 184, 0, 0.18)" : "rgba(255, 184, 0, 0.15)",
                              color: isDark ? "#FFB800" : "#b45309"
                            }}
                          >
                            {emailOrUsername === "priya@example.com" ? "✓ Filled" : "Graduate"}
                          </span>
                        </div>
                        <div
                          style={{
                            fontSize: "0.675rem",
                            color: isDark ? "#94a3b8" : "#64748b",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap"
                          }}
                        >
                          priya@example.com
                        </div>
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                /* FORGOT PASSWORD FORM */
                <form onSubmit={handleForgotSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
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
                      {t.regEmailLabel}
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
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder={t.regEmailPlaceholder}
                        className="auth-form-input-v2"
                      />
                    </div>
                  </div>

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
                      {t.newPasswordLabel}
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
                        value={forgotNewPassword}
                        onChange={(e) => setForgotNewPassword(e.target.value)}
                        placeholder={t.newPasswordPlaceholder}
                        className="auth-form-input-v2"
                      />
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "0.6rem", marginTop: "0.4rem" }}>
                    <button
                      type="button"
                      onClick={() => {
                        setViewMode("signin");
                        setErrorMsg("");
                        setSuccessMsg("");
                      }}
                      style={{
                        flex: 1,
                        padding: "0.75rem 1rem",
                        borderRadius: "0.875rem",
                        background: isDark ? "rgba(16, 43, 80, 0.6)" : "#f1f5f9",
                        color: isDark ? "#ffffff" : "#102B50",
                        border: isDark ? "1px solid rgba(56, 189, 248, 0.2)" : "1px solid #e2e8f0",
                        fontSize: "0.8rem",
                        fontWeight: "800",
                        cursor: "pointer"
                      }}
                    >
                      {t.backToSignIn}
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="auth-btn-primary-v2"
                      style={{ flex: 1.25, padding: "0.75rem 1rem", fontSize: "0.8rem" }}
                    >
                      {isLoading ? <RefreshCw size={15} className="animate-spin" /> : t.saveNewPassword}
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Card Footer: Switch to Sign Up */}
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
              {t.noAccount}{" "}
              <button
                type="button"
                onClick={() => onNavigate && onNavigate("signup")}
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
                {t.createAccount}
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
