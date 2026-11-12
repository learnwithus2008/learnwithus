/**
 * appPagesRegistry.js
 * Centralized, authoritative registry of all actual pages, routes, tools,
 * and features in the Python Adaptive application.
 * 
 * Used by:
 * - Explore All Pages Modal
 * - Contextual Page Guidance Sheet
 * - Tour & Onboarding Engine
 */

export const PAGE_CATEGORIES = [
  { id: "all", label: "All Pages & Features", icon: "LayoutGrid" },
  { id: "getting-started", label: "Getting Started & Dashboard", icon: "Compass" },
  { id: "curriculum", label: "Learning & Curriculum", icon: "BookOpen" },
  { id: "interactive", label: "Practice & Projects", icon: "Code2" },
  { id: "tools", label: "Study Tools & Adaptive Engine", icon: "Wrench" },
  { id: "account", label: "Account & Profile", icon: "UserCheck" }
];

export const APP_PAGES_REGISTRY = [
  {
    id: "home",
    pageKey: "home",
    route: "#/home",
    title: "Home Dashboard",
    tagline: "Your adaptive learning headquarters & platform overview",
    category: "getting-started",
    categoryLabel: "Getting Started",
    icon: "Terminal",
    color: "from-blue-600 to-cyan-500",
    navLocation: "Top Navigation Bar → Brand Logo or 'Home' Tab",
    description:
      "The main command center showcasing the adaptive learning engine, featured beginner and advanced topics, active stage and language preferences, platform pillars, and FAQ.",
    features: [
      "Live Adaptive Age Stage & Language status cards",
      "One-click launch to featured curriculum topics",
      "Platform core pedagogical pillars overview",
      "Direct entry to guided tour & interactive explorer"
    ],
    authRequired: false,
    badge: "Public Access",
    contextualGuidance: {
      purpose: "Your central learning command center. Access all courses, manage your account, customize preferences, and explore study tools.",
      mainActions: [
        "Sign In & Sign Up: Register a free account to track your XP, save progress across devices, and unlock practice quizzes and projects",
        "Navigation Items: Switch between Home, Learn (19 sections, 120 lessons), Practice quizzes, Projects, and About (top dock or mobile bottom nav)",
        "Theme Toggle: One-click switch between dark and light modes anytime in the top header",
        "Study Notes: Open the floating Notepad (Alt+N) to record code takeaways and revision points",
        "Word Meaning: Press ⌘K or tap the dictionary button to look up programming terms in plain language"
      ],
      howToStart: "Sign in or sign up to save your learning journey, choose your preferred stage and language, then tap Learn or Start Free Lesson 1 to begin!",
      nextSteps: "Head over to the Curriculum page (Learn) to browse all 19 learning sections."
    }
  },
  {
    id: "learn",
    pageKey: "learn",
    route: "#/learn",
    title: "Curriculum & Lessons",
    tagline: "19-section Python curriculum with 120 interactive topics",
    category: "curriculum",
    categoryLabel: "Curriculum",
    icon: "BookOpen",
    color: "from-blue-600 to-indigo-600",
    navLocation: "Top Navigation Bar → 'Learn' Tab",
    description:
      "Browse the complete step-by-step Python syllabus from Variables and Control Flow to OOP, APIs, Databases, Machine Learning, and Modern AI. Includes instant keyword search and section filters.",
    features: [
      "19 organized curriculum sections & 120 topics",
      "First 2 lessons 100% free with zero sign-in required",
      "Instant topic search by keyword, concept, or code syntax",
      "Difficulty indicators (Beginner, Intermediate, Advanced)",
      "Adaptive stage & language switchers"
    ],
    authRequired: false,
    badge: "Free Previews Available",
    contextualGuidance: {
      purpose: "Explore the comprehensive 19-section Python learning path and pick any topic to study.",
      mainActions: [
        "Search for specific concepts like 'loops', 'lambda', or 'classes'",
        "Filter topics by section using the category pills",
        "Click on any topic card to open its interactive 6-step learning environment",
        "Look for the 'Free Preview' badges on introductory topics"
      ],
      howToStart: "Start with Topic #1 ('What is Python?') to understand fundamental programming philosophy.",
      nextSteps: "Click on any lesson card to dive into its 6-step interactive learning flow."
    }
  },
  {
    id: "lesson",
    pageKey: "lesson",
    topicId: "what-is-python",
    route: "#/lesson/what-is-python",
    title: "Interactive Lesson Environment",
    tagline: "6-step mastery flow with live in-browser Python runner",
    category: "curriculum",
    categoryLabel: "Interactive Learning",
    icon: "Sparkles",
    color: "from-cyan-500 to-blue-600",
    navLocation: "Click any Topic Card on Home or Learn page",
    description:
      "An immersive learning studio engineered around 6 progressive steps: Understand, Example, Code, Practice, Challenge, and Complete. Features live Python execution and multiple explanation formats.",
    features: [
      "6-Step mastery flow with progress tracking",
      "Live in-browser Python code execution runner",
      "Multi-explanation formats: Story, Real-life, Diagram, Analogy",
      "One-click topic bookmarking and study notes integration",
      "XP reward bonuses on step completion"
    ],
    authRequired: false, // first 2 are free
    badge: "Core Learning Studio",
    contextualGuidance: {
      purpose: "Master a single Python concept thoroughly through guided explanations, interactive analogies, and live coding.",
      mainActions: [
        "Follow the 6 steps at the top from 'Understand' to 'Complete'",
        "Toggle explanation formats (Story, Real-life, Diagram) to match how you learn best",
        "Edit and run Python code directly in the live runner without installing anything",
        "Click any underlined technical word to look up its definition in the global dictionary"
      ],
      howToStart: "Read the concept overview under Step 1, then proceed to Step 2 for intuitive analogies and Step 3 to run code.",
      nextSteps: "Complete all 6 steps to earn XP badges and bookmark the lesson for fast review."
    }
  },
  {
    id: "practice",
    pageKey: "practice",
    route: "#/practice",
    title: "Interactive Practice Arena",
    tagline: "Stage-adapted quizzes, output predictions & code puzzles",
    category: "interactive",
    categoryLabel: "Quizzes & Puzzles",
    icon: "Code2",
    color: "from-amber-500 to-orange-600",
    navLocation: "Top Navigation Bar → 'Practice' Tab",
    description:
      "Put your knowledge to the test with multiple-choice quizzes, bug-fixing puzzles, output prediction questions, and challenge problems tailored to your selected age stage.",
    features: [
      "Age-adapted question sets matching your learning stage",
      "Instant feedback with detailed answer explanations",
      "Interactive coding challenge questions with verification",
      "Streak tracking & XP bonus point rewards",
      "Stage filtering (Kid to Job Professional levels)"
    ],
    authRequired: true,
    badge: "Sign In Required",
    contextualGuidance: {
      purpose: "Reinforce what you've learned through active recall, quizzes, and code debugging challenges.",
      mainActions: [
        "Filter practice questions by age stage or view all questions",
        "Select your answer to get instant explanations",
        "Track your quiz accuracy and accumulate learning XP",
        "Sign in to persist your quiz streaks to your account"
      ],
      howToStart: "Choose your active stage filter, read the first quiz question carefully, and select your answer.",
      nextSteps: "After practicing, apply your skills by building complete applications in the Projects section."
    }
  },
  {
    id: "projects",
    pageKey: "projects",
    route: "#/projects",
    title: "Hands-on Projects Portfolio",
    tagline: "Real-world applications adapted to your skill level",
    category: "interactive",
    categoryLabel: "Portfolio Projects",
    icon: "FolderGit2",
    color: "from-emerald-500 to-teal-600",
    navLocation: "Top Navigation Bar → 'Projects' Tab",
    description:
      "Build real-world Python applications: from kid-friendly text adventures and quiz games to college algorithms, graduate REST APIs, and enterprise data pipelines.",
    features: [
      "Step-by-step project blueprints with full source code",
      "Difficulty and age-stage filtering",
      "Architecture breakdown and key takeaways",
      "Code copying and live runner exploration",
      "XP rewards upon project completion"
    ],
    authRequired: true,
    badge: "Sign In Required",
    contextualGuidance: {
      purpose: "Bridge the gap between syntax theory and real-world software development.",
      mainActions: [
        "Filter projects by age stage (e.g. Games for Young, APIs for Graduate)",
        "Review project requirements, tech stack, and architecture",
        "Follow step-by-step implementation instructions",
        "Run or copy the complete source code to test on your computer"
      ],
      howToStart: "Select a project matching your current stage and read the objective and architectural breakdown.",
      nextSteps: "Fork the project code into your local editor or live runner to customize it with new features."
    }
  },
  {
    id: "about",
    pageKey: "about",
    route: "#/about",
    title: "About Platform & Pedagogy",
    tagline: "The philosophy of age-adaptive programming education",
    category: "getting-started",
    categoryLabel: "Platform Overview",
    icon: "Info",
    color: "from-blue-600 to-cyan-600",
    navLocation: "Top Navigation Bar → 'About' Tab, or Footer",
    description:
      "Learn about the mission behind Python Adaptive: why one generic tutorial fails different age groups, how our 5-stage pedagogical perspective works, and our multi-language methodology.",
    features: [
      "Detailed explanation of the 5 age learning stages",
      "Multi-language conversational explanation framework",
      "Technical architecture and database schema overview",
      "Free education philosophy and accessibility commitments"
    ],
    authRequired: false,
    badge: "Platform Story",
    contextualGuidance: {
      purpose: "Understand the educational science, mission, and architecture of Python Adaptive.",
      mainActions: [
        "Read about the 5 pedagogical stages and their cognitive models",
        "Explore how multi-language conversational translations work",
        "Discover platform architectural details"
      ],
      howToStart: "Scroll through the 5 pedagogical stages summary cards to see how explanations adapt.",
      nextSteps: "Return to Home or Learn to test out the different stages and languages yourself!"
    }
  },
  {
    id: "contact",
    pageKey: "contact",
    route: "#/contact",
    title: "Contact & Student Support",
    tagline: "Get help with curriculum questions, doubts, and student feedback",
    category: "getting-started",
    categoryLabel: "Help & Support",
    icon: "Mail",
    color: "from-blue-600 to-indigo-600",
    navLocation: "Top Navigation Bar → 'Contact' Tab, Footer, or User Menu",
    description:
      "Reach out to the Learn With Us educational support and developer team. Send inquiries, report bugs, ask doubts, or submit curriculum feedback.",
    features: [
      "Direct email and WhatsApp doubt support channels",
      "Interactive inquiry contact form with category selector",
      "24-48 hour response guarantee",
      "Student privacy protection"
    ],
    authRequired: false,
    badge: "Student Support",
    contextualGuidance: {
      purpose: "Provide direct channels for student inquiries, concept doubts, curriculum feedback, and bug reports.",
      mainActions: [
        "Fill out and submit the interactive contact form",
        "Send doubts on WhatsApp directly from any lesson or section",
        "Email support directly for administrative or platform assistance"
      ],
      howToStart: "Select your inquiry category, type your question, and submit the form.",
      nextSteps: "Our team will review your inquiry and follow up promptly."
    }
  },
  {
    id: "signin",
    pageKey: "signin",
    route: "#/signin",
    title: "Sign In to Account",
    tagline: "Access protected lessons, sync XP & save bookmarks",
    category: "account",
    categoryLabel: "Authentication",
    icon: "LogIn",
    color: "from-blue-600 to-blue-700",
    navLocation: "Top Navigation Bar → 'Sign In' Button",
    description:
      "Sign in with your email and password or use instant demo accounts to unlock all 120 lessons, practice quizzes, real-world projects, streak tracking, and cloud progress sync.",
    features: [
      "Instant 1-click Demo Account login buttons",
      "Secure PostgreSQL session tokens with HTTP-only cookies",
      "Remember Me login persistence",
      "Seamless return to protected route after signing in"
    ],
    authRequired: false,
    badge: "Authentication",
    contextualGuidance: {
      purpose: "Authenticate into your personal learning profile to track XP, bookmarks, and completed lessons.",
      mainActions: [
        "Enter your registered email and password",
        "Click 'Sign In with Demo Account' for instant exploration",
        "Click 'Create Account' if you are new to the platform"
      ],
      howToStart: "Use the Demo Account button to test full member features immediately with one click.",
      nextSteps: "Once signed in, access Practice, Projects, and all advanced curriculum lessons."
    }
  },
  {
    id: "signup",
    pageKey: "signup",
    route: "#/signup",
    title: "Create Free Account",
    tagline: "Join Python Adaptive with avatar & learning preferences",
    category: "account",
    categoryLabel: "Registration",
    icon: "UserPlus",
    color: "from-indigo-600 to-blue-600",
    navLocation: "Top Navigation Bar → 'Sign Up' Button",
    description:
      "Register a free account with your preferred avatar, age stage, and native language. Includes an instant +50 XP welcome bonus and unlimited access to all platform features.",
    features: [
      "Customizable avatar emoji selector",
      "Pre-configure your default age stage and explanation language",
      "Instant +50 XP bonus on successful registration",
      "100% free with zero fees or credit cards needed"
    ],
    authRequired: false,
    badge: "Free +50 XP Bonus",
    contextualGuidance: {
      purpose: "Set up your free personal learning profile and configure your defaults.",
      mainActions: [
        "Pick your favorite avatar emoji",
        "Select your learning stage and native language",
        "Enter your name, email, and choose a secure password",
        "Receive +50 XP bonus instantly on registration"
      ],
      howToStart: "Fill out the simple form and pick an avatar that matches your style.",
      nextSteps: "You will be automatically logged in and redirected to start learning!"
    }
  },
  {
    id: "profile",
    pageKey: "profile",
    route: "#/profile",
    title: "Learner Profile & Stats",
    tagline: "Your learning streak, XP progress, bookmarks & certificates",
    category: "account",
    categoryLabel: "Account",
    icon: "User",
    color: "from-blue-600 to-cyan-500",
    navLocation: "Top Navigation Bar → User Avatar Menu or Mobile Bottom Bar → 'Profile'",
    description:
      "Your personal dashboard featuring earned XP, daily learning streak, completed lessons history with quiz scores, saved bookmarks, official certificate download, and account security settings.",
    features: [
      "Live gamified metrics: XP, Level bar, and daily streak records",
      "Completed lessons showcase with revision shortcuts and quiz scores",
      "Saved bookmarks list for quick access to marked curriculum topics",
      "Printable official Certificate of Achievement generator",
      "Personal details and learning stage & language preferences editor",
      "Account security management including password updates"
    ],
    authRequired: true,
    badge: "Personal Dashboard",
    contextualGuidance: {
      purpose: "Track your learning progress, manage saved bookmarks, and view your official Python certificate.",
      mainActions: [
        "View and edit your personal details, bio, and avatar icon",
        "Monitor your daily learning streak and earned XP points",
        "Review completed lessons and launch directly into revision",
        "Access bookmarked lessons or remove old bookmarks",
        "Generate and print your official certificate of achievement"
      ],
      howToStart: "Review your current learning stats and celebrate completed lesson milestones.",
      nextSteps: "Head back to Curriculum or Practice to earn more XP and expand your streak!"
    }
  },
  {
    id: "dictionary-tool",
    pageKey: "dictionary",
    route: "#/learn",
    isTool: true,
    title: "Technical Word Dictionary",
    tagline: "Instant multi-language definitions (⌘K / Ctrl+K)",
    category: "tools",
    categoryLabel: "Study Tools",
    icon: "BookMarked",
    color: "from-blue-500 to-cyan-500",
    navLocation: "Navbar 'Meaning' button, Floating book button, or keyboard shortcut ⌘K",
    description:
      "A searchable technical dictionary containing over 100+ programming terms. Every term provides phonetic pronunciation, simple beginner definitions, code usage examples, and translations in Telugu and Hindi.",
    features: [
      "Keyboard shortcut ⌘K / Ctrl+K for instant global search",
      "Multi-language explanations (English, Telugu, Hindi)",
      "Interactive word click lookup in any lesson text",
      "Floating dock button for fast access on any page"
    ],
    authRequired: false,
    badge: "Quick Tool (⌘K)",
    contextualGuidance: {
      purpose: "Demystify complex computer science jargon whenever you encounter an unfamiliar term.",
      mainActions: [
        "Press ⌘K or Ctrl+K anywhere to open the dictionary",
        "Type any word (e.g. 'recursion', 'immutable', 'polymorphism')",
        "Switch language tabs to see definitions in your native language"
      ],
      howToStart: "Click the 'Meaning' button in the top navigation bar or press ⌘K to open the drawer.",
      nextSteps: "Try clicking any underlined blue word inside a lesson to look it up on the spot."
    }
  },
  {
    id: "notepad-tool",
    pageKey: "notepad",
    route: "#/learn",
    isTool: true,
    title: "Floating Study Notepad",
    tagline: "In-browser scratchpad for code & key takeaways (Alt+N)",
    category: "tools",
    categoryLabel: "Study Tools",
    icon: "StickyNote",
    color: "from-cyan-500 to-teal-500",
    navLocation: "Navbar 'Notes' button, Floating note button, or keyboard shortcut Alt+N",
    description:
      "Your private study scratchpad that stays accessible across all pages. Auto-saves your code snippets, thoughts, and lesson summaries in your browser with zero latency.",
    features: [
      "Auto-save to browser local storage",
      "Markdown formatting and code snippet support",
      "Export notes as text file anytime",
      "Resizable and minimizable floating window",
      "Keyboard shortcut Alt+N for quick toggling"
    ],
    authRequired: false,
    badge: "Quick Tool (Alt+N)",
    contextualGuidance: {
      purpose: "Jot down code snippets, bug notes, and concepts without leaving your lesson.",
      mainActions: [
        "Press Alt+N or click 'Notes' in the navbar to open",
        "Write notes freely—changes are saved automatically",
        "Minimize the notepad to a floating dock while testing code"
      ],
      howToStart: "Open the notepad using Alt+N and write down your learning goals for today.",
      nextSteps: "Keep the notepad minimized in the corner so you can add code snippets while taking lessons."
    }
  },
  {
    id: "adaptive-stage-engine",
    pageKey: "stage",
    route: "#/home",
    isTool: true,
    title: "Adaptive Age Stage Engine",
    tagline: "5 pedagogical levels: Kid to Job Professional",
    category: "tools",
    categoryLabel: "Adaptive Engine",
    icon: "Layers",
    color: "from-blue-600 to-indigo-600",
    navLocation: "Top Navigation Bar → Stage Capsule / Stage Modal",
    description:
      "The core innovation of the platform. Dynamically re-explains every lesson, analogy, and code sample across 5 life stages: 🧒 Kid (0-6), 🎒 Young (7-15), 🎓 College (16-19), 💼 Graduate (20-24), and 🚀 Job Professional (25+).",
    features: [
      "5 distinct pedagogical personas with custom analogies",
      "Instant live updating across all lessons without page reload",
      "Persistent stage preference saved to your profile",
      "Visual stage selector cards with age-group descriptions"
    ],
    authRequired: false,
    badge: "Core AI Engine",
    contextualGuidance: {
      purpose: "Customize the teaching tone, real-life analogies, and code complexity to match your age or experience level.",
      mainActions: [
        "Click the Stage Capsule in the top navigation bar",
        "Select between Kid, Young, College, Graduate, or Job Pro",
        "Watch all lesson explanations and code samples update immediately"
      ],
      howToStart: "Click the Stage capsule in the header to view all 5 stage personas.",
      nextSteps: "Visit a lesson like 'Variables' to see how the analogy changes from toy boxes to memory registers!"
    }
  },
  {
    id: "multi-language-engine",
    pageKey: "language",
    route: "#/home",
    isTool: true,
    title: "Multi-Language Explanation Engine",
    tagline: "English, English+Telugu, Telugu, Hindi",
    category: "tools",
    categoryLabel: "Adaptive Engine",
    icon: "Globe",
    color: "from-cyan-500 to-blue-600",
    navLocation: "Top Navigation Bar → Language Capsule / Language Modal",
    description:
      "Learn programming concepts in the language you naturally think in. Python syntax stays 100% authentic code while all concepts are explained in English, conversational English+Telugu mix, pure Telugu, or Hindi.",
    features: [
      "4 language modes tailored for Indian and global learners",
      "Conversational friend-style Telugu mix for relaxed learning",
      "Authentic Python code keywords remain standard",
      "Instant switching via top navbar capsule"
    ],
    authRequired: false,
    badge: "Multi-Language",
    contextualGuidance: {
      purpose: "Break language barriers by explaining complex technical concepts in familiar native idioms.",
      mainActions: [
        "Click the Language capsule in the top navigation bar",
        "Choose between English, English+Telugu, Pure Telugu, or Hindi",
        "Read lessons in the style that feels most natural to you"
      ],
      howToStart: "Select 'Eng+Tel' if you enjoy conversational friend-style explanations.",
      nextSteps: "Open any lesson to experience how complex ideas become effortless in your chosen tongue."
    }
  },
  {
    id: "admin",
    pageKey: "admin",
    route: "#/admin",
    title: "Administrative Console & User Status",
    tagline: "Platform monitoring, learner status tracking & telemetry",
    category: "account",
    categoryLabel: "Administration",
    icon: "ShieldCheck",
    color: "from-indigo-600 to-blue-600",
    navLocation: "Top Navigation Bar → Admin Tab (Admin Accounts)",
    description:
      "Comprehensive administration console allowing platform managers to inspect learner accounts, monitor real-time completion progress, manage roles and status, and view platform metrics.",
    features: [
      "Real-time learner status monitoring & deep-dive progress inspection",
      "Account status control (Active ↔ Suspended)",
      "Role management (Student ↔ Administrator)",
      "Pedagogical stage & language analytics distribution",
      "Bonus XP grants & live activity feed"
    ],
    authRequired: true,
    badge: "Admin Only",
    contextualGuidance: {
      purpose: "Monitor and manage learner accounts, track topic completions, and review system telemetry.",
      mainActions: [
        "Filter and search learners by name, email, stage, role, or status",
        "Click Inspect on any user to view their complete chapter progress, quiz scores, and login sessions",
        "Activate or suspend user accounts or grant bonus XP awards",
        "View community aggregates and leaderboard in the Analytics tab"
      ],
      howToStart: "Search for a student name in the directory or switch to the Analytics tab.",
      nextSteps: "Check on user statuses or review the live activity feed."
    }
  }
];

export function getPageById(id) {
  return APP_PAGES_REGISTRY.find((p) => p.id === id || p.pageKey === id);
}

export function getPagesByCategory(category) {
  if (!category || category === "all") return APP_PAGES_REGISTRY;
  return APP_PAGES_REGISTRY.filter((p) => p.category === category);
}

export function searchPages(query) {
  if (!query || !query.trim()) return APP_PAGES_REGISTRY;
  const q = query.trim().toLowerCase();
  return APP_PAGES_REGISTRY.filter((p) => {
    return (
      p.title.toLowerCase().includes(q) ||
      p.tagline.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.categoryLabel.toLowerCase().includes(q) ||
      p.navLocation.toLowerCase().includes(q) ||
      p.features.some((f) => f.toLowerCase().includes(q))
    );
  });
}
