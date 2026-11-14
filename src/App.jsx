import React, { useState, useEffect, useRef, useCallback } from "react";
import Navbar from "./components/Navbar";
import BottomNavigation from "./components/BottomNavigation";
import Footer from "./components/Footer";
import StageSelectorModal from "./components/StageSelectorModal";
import LanguageSelectorModal from "./components/LanguageSelectorModal";
import Home from "./pages/Home";
const Learn = React.lazy(() => import("./pages/Learn"));
const Lesson = React.lazy(() => import("./pages/Lesson"));
const Practice = React.lazy(() => import("./pages/Practice"));
const Projects = React.lazy(() => import("./pages/Projects"));
const About = React.lazy(() => import("./pages/About"));
const Admin = React.lazy(() => import("./pages/Admin"));
const SignIn = React.lazy(() => import("./pages/SignIn"));
const SignUp = React.lazy(() => import("./pages/SignUp"));
const PrivacyPolicy = React.lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = React.lazy(() => import("./pages/TermsOfService"));
const Contact = React.lazy(() => import("./pages/Contact"));
const Profile = React.lazy(() => import("./pages/Profile"));
const CertificateVerification = React.lazy(() => import("./pages/CertificateVerification"));
import { getStoredStage, saveStage } from "./data/learningStages";
import { getStoredLanguage, saveLanguage } from "./data/learningLanguages";
import { DictionaryProvider } from "./context/DictionaryContext";
import { NotepadProvider } from "./context/NotepadContext";
import { ThemeProvider } from "./context/ThemeContext";
import { FontSizeProvider } from "./context/FontSizeContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { DoubtProvider } from "./context/DoubtContext";
import AskDoubtModal from "./components/Doubt/AskDoubtModal";
import DoubtToast from "./components/Doubt/DoubtToast";
import AuthModal from "./components/Auth/AuthModal";
import GlobalWordMeaningModal from "./components/WordMeaning/GlobalWordMeaningModal";
import FloatingDictionaryButton from "./components/FloatingDictionaryButton";
import FloatingNotepad from "./components/Notepad/FloatingNotepad";
import FloatingNotepadButton from "./components/FloatingNotepadButton";
import BrandLogo from "./components/BrandLogo";
import { GuideTutorialProvider } from "./context/GuideTutorialContext";
import GuideTutorialModal from "./components/GuideTutorial/GuideTutorialModal";
import GuideWelcomeModal from "./components/GuideTutorial/GuideWelcomeModal";
import GuideExplorerModal from "./components/GuideTutorial/GuideExplorerModal";
import GuideCompletionModal from "./components/GuideTutorial/GuideCompletionModal";
import ContextualPageGuidance from "./components/GuideTutorial/ContextualPageGuidance";
import ErrorBoundary from "./components/ErrorBoundary";
import { RefreshCw, ShieldCheck, Eye } from "lucide-react";
import { GlobalAdManager } from "./components/Ads";

// Route resolution helpers for URL hash & history synchronization
function getRouteFromLocation() {
  const hash = typeof window !== "undefined" ? window.location.hash || "" : "";
  if (!hash || hash === "#" || hash === "#/" || hash === "#/home") {
    return { page: "home", topicId: "what-is-python" };
  }
  if (hash.startsWith("#/lesson")) {
    const cleanHash = hash.replace(/^#\/?/, "");
    const parts = cleanHash.split("?")[0].split("/");
    const topicFromPath = parts[1];
    const params = new URLSearchParams(hash.includes("?") ? hash.split("?")[1] : "");
    const topicId = topicFromPath || params.get("topic") || "what-is-python";
    return { page: "lesson", topicId };
  }
  if (hash.startsWith("#/learn")) return { page: "learn", topicId: "what-is-python" };
  if (hash.startsWith("#/practice")) return { page: "practice", topicId: "what-is-python" };
  if (hash.startsWith("#/projects")) return { page: "projects", topicId: "what-is-python" };
  if (hash.startsWith("#/about")) return { page: "about", topicId: "what-is-python" };
  if (hash.startsWith("#/privacy")) return { page: "privacy", topicId: "what-is-python" };
  if (hash.startsWith("#/terms")) return { page: "terms", topicId: "what-is-python" };
  if (hash.startsWith("#/contact")) return { page: "contact", topicId: "what-is-python" };
  if (hash.startsWith("#/verify-certificate") || hash.startsWith("#/verify")) {
    const cleanHash = hash.replace(/^#\/?/, "");
    const parts = cleanHash.split("?")[0].split("/");
    const certId = parts[1] || "";
    return { page: "verify-certificate", topicId: "what-is-python", certificateId: certId };
  }
  if (hash.startsWith("#/profile")) return { page: "profile", topicId: "what-is-python" };
  if (hash.startsWith("#/admin")) return { page: "admin", topicId: "what-is-python" };
  if (hash.startsWith("#/signup") || hash.startsWith("#/register")) {
    return { page: "signup", topicId: "what-is-python" };
  }
  if (hash.startsWith("#/signin") || hash.startsWith("#/login") || hash.startsWith("#/auth")) {
    return { page: "signin", topicId: "what-is-python" };
  }
  return { page: "home", topicId: "what-is-python" };
}

function getHashForRoute(page, topicId) {
  if (page === "home") return "#/home";
  if (page === "lesson") return `#/lesson/${topicId || "what-is-python"}`;
  if (page === "learn") return "#/learn";
  if (page === "practice") return "#/practice";
  if (page === "projects") return "#/projects";
  if (page === "about") return "#/about";
  if (page === "privacy") return "#/privacy";
  if (page === "terms") return "#/terms";
  if (page === "contact") return "#/contact";
  if (page === "profile") return "#/profile";
  if (page === "verify-certificate" || page === "verify") return `#/verify-certificate${topicId && topicId !== "what-is-python" ? `/${topicId}` : ""}`;
  if (page === "admin") return "#/admin";
  if (page === "signup" || page === "register") return "#/signup";
  if (page === "signin" || page === "login" || page === "auth") return "#/signin";
  return "#/home";
}

function MainAppShell({
  selectedStage,
  handleSelectStage,
  selectedLanguage,
  handleSelectLanguage,
  stageModalOpen,
  setStageModalOpen,
  languageModalOpen,
  setLanguageModalOpen
}) {
  const { currentUser, updateProfile, isAuthenticated, isLoadingSession, openAuthModal } = useAuth();
  
  const handleStageChange = React.useCallback((stageId) => {
    handleSelectStage(stageId);
    if (currentUser && currentUser.stage !== stageId) {
      updateProfile({ stage: stageId }).catch(() => {});
    }
  }, [handleSelectStage, currentUser, updateProfile]);

  const handleLanguageChange = React.useCallback((langId) => {
    handleSelectLanguage(langId);
    if (currentUser && currentUser.language !== langId) {
      updateProfile({ language: langId }).catch(() => {});
    }
  }, [handleSelectLanguage, currentUser, updateProfile]);

  // Initialize route from current URL hash
  const initialRoute = React.useRef(getRouteFromLocation()).current;
  const [currentPage, setCurrentPage] = useState(initialRoute.page);
  const [selectedTopicId, setSelectedTopicId] = useState(initialRoute.topicId);
  const [selectedCertId, setSelectedCertId] = useState(initialRoute.certificateId || "");
  const [appPreviewMode, setAppPreviewMode] = useState(false);

  // In-session navigation stack to track previous pages
  const navHistoryRef = useRef([{ page: initialRoute.page, topicId: initialRoute.topicId }]);
  const [historyDepth, setHistoryDepth] = useState(1);

  // Admin App Preview mode toggles
  const handleOpenAppPreview = () => {
    setAppPreviewMode(true);
    navigateTo("home");
  };

  const handleExitAppPreview = () => {
    setAppPreviewMode(false);
    navigateTo("admin");
  };

  // Initialize or synchronize browser history entry on initial mount
  useEffect(() => {
    const targetHash = getHashForRoute(initialRoute.page, initialRoute.topicId);
    const stateObj = { page: initialRoute.page, topicId: initialRoute.topicId };
    if (!window.history.state || window.location.hash !== targetHash) {
      window.history.replaceState(stateObj, "", targetHash);
    }
  }, []);

  // If user becomes authenticated while on signin or signup, redirect them appropriately
  useEffect(() => {
    if (isAuthenticated && (currentPage === "signin" || currentPage === "signup")) {
      if (currentUser?.role === "admin" && !appPreviewMode) {
        navigateTo("admin", undefined, true);
      } else {
        navigateTo("home", undefined, true);
      }
    }
  }, [isAuthenticated, currentPage, currentUser?.role, appPreviewMode]);

  // Admin routing guard: Admins default to admin console unless explicitly previewing app
  useEffect(() => {
    if (!isLoadingSession && isAuthenticated && currentUser?.role === "admin" && !appPreviewMode) {
      if (currentPage !== "admin") {
        navigateTo("admin", undefined, true);
      }
    }
  }, [isLoadingSession, isAuthenticated, currentUser?.role, appPreviewMode, currentPage]);

  // If unauthenticated user tries to directly hash navigate to practice or projects
  useEffect(() => {
    if (!isLoadingSession && !isAuthenticated && (currentPage === "practice" || currentPage === "projects")) {
      openAuthModal(
        "login",
        `Sign in required to access ${currentPage === "practice" ? "Interactive Practice" : "Projects"}. Please sign in to continue!`
      );
      navigateTo("signin", undefined, true);
    }
  }, [isLoadingSession, isAuthenticated, currentPage]);

  // Listen to popstate, hashchange, and custom navigation events
  useEffect(() => {
    const handleRouteSync = (event) => {
      // If modal was open, close modal first and stay on current page
      if (stageModalOpen) {
        setStageModalOpen(false);
      }
      if (languageModalOpen) {
        setLanguageModalOpen(false);
      }

      // Read route from history state or URL hash
      let route = event?.state;
      if (!route || !route.page) {
        route = getRouteFromLocation();
      }

      let targetPage = route.page;
      if (targetPage === "login" || targetPage === "auth") targetPage = "signin";
      if (targetPage === "register") targetPage = "signup";
      if (targetPage === "admin") {
        setAppPreviewMode(false);
      }

      if (navHistoryRef.current.length > 1) {
        navHistoryRef.current.pop();
        setHistoryDepth(navHistoryRef.current.length);
      }

      setCurrentPage(targetPage);
      if (route.topicId) {
        setSelectedTopicId(route.topicId);
      }
      if (route.certificateId !== undefined) {
        setSelectedCertId(route.certificateId);
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleCustomNavigate = (e) => {
      if (e.detail?.page) {
        navigateTo(e.detail.page, e.detail.topicId, true);
      }
    };

    window.addEventListener("popstate", handleRouteSync);
    window.addEventListener("hashchange", handleRouteSync);
    window.addEventListener("py_navigate", handleCustomNavigate);

    return () => {
      window.removeEventListener("popstate", handleRouteSync);
      window.removeEventListener("hashchange", handleRouteSync);
      window.removeEventListener("py_navigate", handleCustomNavigate);
    };
  }, [stageModalOpen, languageModalOpen, setStageModalOpen, setLanguageModalOpen]);

  // Navigate to a page and record in browser history
  const navigateTo = (page, topicId = selectedTopicId, replace = false) => {
    let targetPage = page;
    if (page === "login" || page === "auth") targetPage = "signin";
    if (page === "register") targetPage = "signup";

    // Protect practice, projects, and profile if not authenticated
    if (!isAuthenticated && (targetPage === "practice" || targetPage === "projects" || targetPage === "profile")) {
      openAuthModal(
        "login",
        `Sign in required to access ${targetPage === "profile" ? "your Learner Profile" : targetPage === "practice" ? "Interactive Practice" : "Projects"}. Please sign in to continue!`
      );
      targetPage = "signin";
    }

    const hash = getHashForRoute(targetPage, topicId);
    const stateObj = { page: targetPage, topicId };

    if (replace) {
      window.history.replaceState(stateObj, "", hash);
      if (navHistoryRef.current.length > 0) {
        navHistoryRef.current[navHistoryRef.current.length - 1] = stateObj;
      } else {
        navHistoryRef.current = [stateObj];
      }
    } else {
      const lastEntry = navHistoryRef.current[navHistoryRef.current.length - 1];
      if (!lastEntry || lastEntry.page !== targetPage || (targetPage === "lesson" && lastEntry.topicId !== topicId)) {
        window.history.pushState(stateObj, "", hash);
        navHistoryRef.current.push(stateObj);
        setHistoryDepth(navHistoryRef.current.length);
      }
    }

    setCurrentPage(targetPage);
    if (topicId) setSelectedTopicId(topicId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectTopic = (topicId) => {
    navigateTo("lesson", topicId);
  };

  const handleNavigate = (page) => {
    navigateTo(page);
  };

  // Back handler for both on-screen buttons and mobile navigation
  const handleBack = () => {
    if (stageModalOpen) {
      setStageModalOpen(false);
      return;
    }
    if (languageModalOpen) {
      setLanguageModalOpen(false);
      return;
    }

    if (navHistoryRef.current.length > 1) {
      window.history.back();
    } else {
      // Fallback hierarchy if user arrived directly or refreshed
      if (currentPage === "lesson") {
        navigateTo("learn", undefined, true);
      } else if (currentPage !== "home") {
        navigateTo("home", undefined, true);
      }
    }
  };

  const handleBackToLearn = () => {
    if (navHistoryRef.current.length > 1) {
      window.history.back();
    } else {
      navigateTo("learn", undefined, true);
    }
  };

  const canGoBack = historyDepth > 1 || currentPage !== "home";

  // While checking PostgreSQL session on startup
  if (isLoadingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#102B50] text-white">
        <div className="flex flex-col items-center gap-3">
          <BrandLogo variant="mark" size="lg" />
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <RefreshCw size={14} className="animate-spin text-[#FFB800]" />
            <span>Connecting to Learning Engine...</span>
          </div>
        </div>
      </div>
    );
  }

  // DEDICATED SEPARATE PAGE: Sign In
  if (currentPage === "signin") {
    return (
      <SignIn
        onNavigate={navigateTo}
        onBack={handleBack}
      />
    );
  }

  // DEDICATED SEPARATE PAGE: Sign Up
  if (currentPage === "signup") {
    return (
      <SignUp
        onNavigate={navigateTo}
        onBack={handleBack}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F3F7FC] dark:bg-[#0A1E38] text-[#102B50] dark:text-white selection:bg-[#0756A5]/25 selection:text-[#102B50] dark:selection:text-white font-sans antialiased relative transition-colors duration-200 w-full overflow-x-hidden">
      {/* Admin App Preview Persistent Banner */}
      {currentUser?.role === "admin" && appPreviewMode && (
        <div className="bg-gradient-to-r from-indigo-950 via-slate-950 to-blue-950 text-white px-3 sm:px-6 py-2.5 border-b border-indigo-500/30 flex items-center justify-between text-xs font-semibold sticky top-0 z-50 shadow-md backdrop-blur-md">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="flex h-2.5 w-2.5 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-extrabold text-indigo-300 uppercase tracking-wider shrink-0">Admin App Preview</span>
              <span className="text-slate-300 hidden md:inline truncate">• You are viewing and interacting with the app as a learner</span>
            </div>
          </div>
          <button
            onClick={handleExitAppPreview}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition shadow-md shadow-indigo-600/30 cursor-pointer border border-indigo-400/40 active:scale-95 shrink-0"
            title="Exit App Preview & Return to Admin Console"
          >
            <ShieldCheck size={14} className="shrink-0" />
            <span className="hidden xs:inline">Exit Preview & Return to Admin</span>
            <span className="xs:hidden">Exit Preview</span>
          </button>
        </div>
      )}

      {/* Navbar with Stage, Language, Theme, Dictionary & Auth Controls - learner pages only */}
      {(currentPage !== "admin" || appPreviewMode) && (
        <Navbar
          currentPage={currentPage}
          setCurrentPage={handleNavigate}
          onSelectTopic={handleSelectTopic}
          selectedStage={selectedStage}
          onSelectStage={handleStageChange}
          onOpenStageModal={() => setStageModalOpen(true)}
          selectedLanguage={selectedLanguage}
          onSelectLanguage={handleLanguageChange}
          onOpenLanguageModal={() => setLanguageModalOpen(true)}
          onBack={handleBack}
          canGoBack={canGoBack}
          appPreviewMode={appPreviewMode}
          onToggleAppPreview={handleOpenAppPreview}
          onReturnToAdmin={handleExitAppPreview}
        />
      )}

      {/* Stage Selector Modal */}
      <StageSelectorModal
        isOpen={stageModalOpen}
        onClose={() => setStageModalOpen(false)}
        selectedStage={selectedStage}
        onSelectStage={handleStageChange}
      />

      {/* Language Selector Modal */}
      <LanguageSelectorModal
        isOpen={languageModalOpen}
        onClose={() => setLanguageModalOpen(false)}
        selectedLanguage={selectedLanguage}
        onSelectLanguage={handleLanguageChange}
      />

      {/* Global Authentication Modal */}
      <AuthModal onSelectTopic={handleSelectTopic} />

      {/* Main Content Area across all pages */}
      <ErrorBoundary>
        <main className={`flex-1 w-full min-w-0 flex flex-col ${currentPage === "admin" && !appPreviewMode ? "" : "pb-20 lg:pb-0"}`}>
        <React.Suspense
          fallback={
            <div className="flex-1 w-full min-h-[60vh] flex flex-col items-center justify-center p-8">
              <div className="relative w-14 h-14 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-blue-500/20 animate-ping" />
                <div className="w-10 h-10 rounded-full border-4 border-[#0756A5] border-t-transparent animate-spin" />
              </div>
              <p className="mt-4 text-xs font-semibold tracking-wider uppercase text-slate-500 dark:text-slate-400">
                Loading Interactive Content...
              </p>
            </div>
          }
        >
        {currentPage === "home" && (
          <Home
            onNavigate={handleNavigate}
            onSelectTopic={handleSelectTopic}
            selectedStage={selectedStage}
            onSelectStage={handleStageChange}
            selectedLanguage={selectedLanguage}
            onSelectLanguage={handleLanguageChange}
            onOpenStageModal={() => setStageModalOpen(true)}
            onOpenLanguageModal={() => setLanguageModalOpen(true)}
            onBack={handleBack}
            canGoBack={historyDepth > 1}
          />
        )}

        {currentPage === "learn" && (
          <Learn
            onSelectTopic={handleSelectTopic}
            selectedStage={selectedStage}
            onOpenStageModal={() => setStageModalOpen(true)}
            selectedLanguage={selectedLanguage}
            onSelectLanguage={handleLanguageChange}
            onOpenLanguageModal={() => setLanguageModalOpen(true)}
            onBack={handleBack}
          />
        )}

        {currentPage === "lesson" && (
          <Lesson
            topicId={selectedTopicId}
            onSelectTopic={handleSelectTopic}
            onBackToLearn={handleBackToLearn}
            onBack={handleBack}
            selectedStage={selectedStage}
            onSelectStage={handleStageChange}
            onOpenStageModal={() => setStageModalOpen(true)}
            selectedLanguage={selectedLanguage}
            onSelectLanguage={handleLanguageChange}
            onOpenLanguageModal={() => setLanguageModalOpen(true)}
          />
        )}

        {currentPage === "practice" && (
          <Practice
            selectedStage={selectedStage}
            onOpenStageModal={() => setStageModalOpen(true)}
            selectedLanguage={selectedLanguage}
            onOpenLanguageModal={() => setLanguageModalOpen(true)}
            onBack={handleBack}
          />
        )}

        {currentPage === "projects" && (
          <Projects
            selectedStage={selectedStage}
            onOpenStageModal={() => setStageModalOpen(true)}
            selectedLanguage={selectedLanguage}
            onOpenLanguageModal={() => setLanguageModalOpen(true)}
            onBack={handleBack}
          />
        )}

        {currentPage === "about" && (
          <About
            onNavigate={handleNavigate}
            onBack={handleBack}
          />
        )}

        {currentPage === "privacy" && (
          <PrivacyPolicy
            onNavigate={handleNavigate}
            onBack={handleBack}
          />
        )}

        {currentPage === "terms" && (
          <TermsOfService
            onNavigate={handleNavigate}
            onBack={handleBack}
          />
        )}

        {currentPage === "contact" && (
          <Contact
            onNavigate={handleNavigate}
            onBack={handleBack}
          />
        )}

        {currentPage === "profile" && (
          <Profile
            onNavigate={handleNavigate}
            onSelectTopic={handleSelectTopic}
            onBack={handleBack}
          />
        )}

        {currentPage === "verify-certificate" && (
          <CertificateVerification
            initialCertificateId={selectedCertId}
            onNavigate={handleNavigate}
            onBack={handleBack}
          />
        )}

        {currentPage === "admin" && (
          <Admin
            onNavigateHome={handleOpenAppPreview}
            onNavigateTopic={(topicId) => {
              setAppPreviewMode(true);
              handleSelectTopic(topicId);
            }}
            onOpenAppPreview={handleOpenAppPreview}
          />
        )}
        </React.Suspense>
        </main>
      </ErrorBoundary>

      {/* Global Word Meaning Dictionary Modal & Floating Search Trigger */}
      <GlobalAdManager page={currentPage} isModalOpen={stageModalOpen || languageModalOpen} />
      <GlobalWordMeaningModal />
      <AskDoubtModal />
      <DoubtToast />
      {(currentUser?.role !== "admin" || appPreviewMode) && <FloatingDictionaryButton />}

      {/* Global Floating Notepad Widget & Floating Trigger */}
      <FloatingNotepad />
      {(currentUser?.role !== "admin" || appPreviewMode) && <FloatingNotepadButton />}

      {/* Global Website Guide Tutorial Modal, Welcome Modal, Explorer Modal, Completion Modal & Contextual Guidance */}
      {(currentUser?.role !== "admin" || appPreviewMode) && (
        <>
          <GuideTutorialModal />
          <GuideWelcomeModal />
          <GuideExplorerModal />
          <GuideCompletionModal />
          <ContextualPageGuidance />
        </>
      )}

      {/* Footer - only shown for learners or in preview mode, keeping Admin Console clean */}
      {(currentUser?.role !== "admin" || appPreviewMode) && (
        <Footer onNavigate={handleNavigate} />
      )}

      {/* Mobile Bottom Navigation Bar (Small Screens < 1024px) */}
      {(currentUser?.role !== "admin" || appPreviewMode) && (
        <BottomNavigation
          currentPage={currentPage}
          onNavigate={handleNavigate}
        />
      )}
    </div>
  );
}

export default function App() {
  const [selectedStage, setSelectedStage] = useState(getStoredStage());
  const [selectedLanguage, setSelectedLanguage] = useState(getStoredLanguage());
  const [stageModalOpen, setStageModalOpen] = useState(false);
  const [languageModalOpen, setLanguageModalOpen] = useState(false);

  const handleSelectStage = React.useCallback((stageId) => {
    setSelectedStage(stageId);
    saveStage(stageId);
  }, []);

  const handleSelectLanguage = React.useCallback((langId) => {
    setSelectedLanguage(langId);
    saveLanguage(langId);
  }, []);

  return (
    <ThemeProvider>
      <FontSizeProvider>
        <AuthProvider onSyncStage={handleSelectStage} onSyncLanguage={handleSelectLanguage}>
          <DoubtProvider>
            <DictionaryProvider selectedLanguage={selectedLanguage} selectedStage={selectedStage}>
              <NotepadProvider>
                <GuideTutorialProvider>
                  <MainAppShell
                    selectedStage={selectedStage}
                    handleSelectStage={handleSelectStage}
                    selectedLanguage={selectedLanguage}
                    handleSelectLanguage={handleSelectLanguage}
                    stageModalOpen={stageModalOpen}
                    setStageModalOpen={setStageModalOpen}
                    languageModalOpen={languageModalOpen}
                    setLanguageModalOpen={setLanguageModalOpen}
                  />
                </GuideTutorialProvider>
              </NotepadProvider>
            </DictionaryProvider>
          </DoubtProvider>
        </AuthProvider>
      </FontSizeProvider>
    </ThemeProvider>
  );
}
