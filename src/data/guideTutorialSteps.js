/**
 * guideTutorialSteps.js
 * Comprehensive interactive guide tutorial steps covering:
 * 1. Profile & Changing Your Name (Account settings)
 * 2. What Home Tab contains (Dashboard, stats, settings)
 * 3. What Learn Tab contains (19 sections, 120 lessons, keyword search)
 * 4. What Practice Tab contains (Quizzes, challenges, output predictions)
 * 5. What Projects Tab contains (Real-world applications, source code)
 * 6. What About Tab contains (Adaptive methodology & guides)
 * 7. Theme Toggle (Light & Dark Mode)
 * 8. Study Notes (Notepad / Alt+N)
 * 9. Word Meaning (Dictionary / ⌘K)
 * Plus Adaptive Stage, Multi-Language, and Curriculum access.
 */

export const GUIDE_STORAGE_KEY = "py_guide_tutorial_completed_v1";

export const GUIDE_STEPS = [
  {
    id: "welcome-hero",
    screen: "home",
    selector: "#tour-home-hero",
    fallbackSelector: ".home-page-container",
    placement: "bottom",
    title: "Welcome to Python Adaptive! 🐍",
    description:
      "Learn Python with lessons tailored to your age and native language. Let's take a quick 1-minute tour!",
    mobileDescription:
      "Learn Python tailored to your age and language. Here's a quick tour of what you can do!",
    targetLabel: "Interactive Hero"
  },
  {
    id: "nav-auth-profile",
    screen: "home",
    selector: "#tour-nav-auth",
    mobileSelector: "#tour-nav-mobile-auth",
    fallbackSelector: "#tour-home-hero",
    placement: "bottom",
    title: "Profile & Stats 👤",
    description:
      "Track your learning streak, earned XP, certificates, and customize your profile anytime.",
    mobileDescription:
      "Track your streak, earned XP, certificates, and view your profile anytime.",
    loggedOutTitle: "Sign In & Profile 🔐",
    loggedOutDescription:
      "Sign in or register here (or via the Profile tab) to save your learning streak, sync XP, and view your profile.",
    loggedOutMobileDescription:
      "Sign in or register here (or via the Profile tab) to track your streak, sync XP, and view your profile.",
    targetLabel: "Profile & Stats"
  },
  {
    id: "nav-item-home",
    screen: "home",
    selector: "#tour-nav-item-home",
    mobileSelector: "#bottom-nav-home",
    fallbackSelector: "#tour-nav-dock",
    placement: "top",
    title: "Home Dashboard 🏠",
    description:
      "Your learning hub. View your streak, active settings, and pick up right where you left off.",
    mobileDescription:
      "Your learning hub. Check your streak, settings, and jump right into lessons.",
    targetLabel: "Home Tab"
  },
  {
    id: "nav-item-learn",
    screen: "home",
    selector: "#tour-nav-item-learn",
    mobileSelector: "#bottom-nav-learn",
    fallbackSelector: "#tour-nav-dock",
    placement: "top",
    title: "Curriculum & Lessons 📖",
    description:
      "Explore 19 structured sections with 198 bite-sized lessons from basic syntax to modern AI.",
    mobileDescription:
      "Browse 19 structured sections with 198 interactive lessons from basics to AI.",
    targetLabel: "Learn Tab"
  },
  {
    id: "nav-item-practice",
    screen: "home",
    selector: "#tour-nav-item-practice",
    mobileSelector: "#bottom-nav-practice",
    fallbackSelector: "#tour-nav-dock",
    placement: "top",
    title: "Practice & Quizzes 💻",
    description:
      "Sharpen your coding skills with interactive challenges and instant quiz feedback.",
    mobileDescription:
      "Test your Python skills with fun quizzes, code puzzles, and instant feedback.",
    targetLabel: "Practice Tab"
  },
  {
    id: "nav-item-projects",
    screen: "home",
    selector: "#tour-nav-item-projects",
    mobileSelector: "#bottom-nav-projects",
    fallbackSelector: "#tour-nav-dock",
    placement: "top",
    title: "Hands-on Projects 🛠️",
    description:
      "Build real Python apps—like games, tools, and web scrapers—with step-by-step guides.",
    mobileDescription:
      "Build real apps like games and web scrapers with complete source code.",
    targetLabel: "Projects Tab"
  },
  {
    id: "nav-item-about",
    screen: "home",
    selector: "#tour-nav-item-about",
    mobileSelector: "#bottom-nav-about",
    fallbackSelector: "#tour-nav-dock",
    placement: "top",
    title: "Adaptive Learning ℹ️",
    description:
      "Learn how our adaptive engine personalizes explanations for 5 age groups and 4 languages.",
    mobileDescription:
      "Discover how lessons adapt to your age level and mother tongue.",
    targetLabel: "About Tab"
  },
  {
    id: "nav-theme-toggle",
    screen: "home",
    selector: "#tour-nav-theme",
    mobileSelector: "#tour-nav-mobile-theme",
    fallbackSelector: "#tour-home-hero",
    placement: "bottom",
    title: "Light & Dark Mode 🌗",
    description:
      "Switch between Dark and Light mode anytime for comfortable day or night reading.",
    mobileDescription:
      "Tap to switch between Dark and Light mode anytime for easy reading.",
    targetLabel: "Theme Toggle"
  },
  {
    id: "nav-study-notes",
    screen: "home",
    selector: "#tour-floating-notepad",
    fallbackSelector: ".floating-dock-notepad",
    placement: "left",
    title: "Study Notepad 📝",
    description:
      "Jot down takeaways and code snippets as you study. Your notes save automatically.",
    mobileDescription:
      "Write personal study notes and code tips as you learn. Saved automatically.",
    targetLabel: "Study Notes (Alt+N)"
  },
  {
    id: "nav-tools-dict",
    screen: "home",
    selector: "#tour-floating-tools",
    fallbackSelector: ".floating-dock-dictionary",
    placement: "left",
    title: "Word Dictionary 📖",
    description:
      "Tap any highlighted term (or press ⌘K) for simple definitions in English, Telugu, or Hindi.",
    mobileDescription:
      "Tap any technical term for a simple explanation in your native language.",
    targetLabel: "Word Meaning (⌘K)"
  },
  {
    id: "nav-stage-selector",
    screen: "home",
    selector: "#tour-nav-stage",
    mobileSelector: "#tour-home-stage-btn",
    fallbackSelector: "#tour-nav-mobile-stage",
    placement: "bottom",
    title: "Learning Stage 🎯",
    description:
      "Switch between 5 age levels (Kid to Pro). Real-world examples adapt instantly to your level.",
    mobileDescription:
      "Switch between 5 age levels (Kid to Pro) to match how concepts are explained.",
    targetLabel: "Age Stage Selector"
  },
  {
    id: "nav-lang-selector",
    screen: "home",
    selector: "#tour-nav-lang",
    mobileSelector: "#tour-home-lang-btn",
    fallbackSelector: "#tour-nav-mobile-lang",
    placement: "bottom",
    title: "Multi-Language 🗣️",
    description:
      "Get explanations in your mother tongue while standard Python code stays clean.",
    mobileDescription:
      "Read explanations in your native language while Python code stays standard.",
    targetLabel: "Language Switcher"
  },
  {
    id: "floating-study-tools",
    screen: "home",
    selector: "#tour-floating-tools",
    fallbackSelector: ".floating-dock-dictionary",
    placement: "left",
    title: "You're All Set! 🎉",
    description:
      "You're ready to start your Python journey! Start with Lesson 1 or jump into any topic you like.",
    mobileDescription:
      "You're ready! Start with Lesson 1 or pick any topic to begin coding.",
    targetLabel: "Finish Guide"
  }
];
