import React from "react";
import { Home, BookOpen, Code2, FolderGit2, Info, Mail, ShieldCheck, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";

/**
 * BottomNavigation component for mobile & tablet screens (< 1024px).
 * Replaces old mobile drawer/hamburger button with a modern, thumb-friendly bottom bar.
 */
export default function BottomNavigation({ currentPage, onNavigate }) {
  const { currentUser } = useAuth();

  const navTabs = [
    {
      id: "home",
      label: "Home",
      icon: Home,
      isActive: currentPage === "home"
    },
    {
      id: "learn",
      label: "Learn",
      icon: BookOpen,
      isActive: currentPage === "learn" || currentPage === "lesson"
    },
    {
      id: "practice",
      label: "Practice",
      icon: Code2,
      isActive: currentPage === "practice"
    },
    {
      id: "projects",
      label: "Projects",
      icon: FolderGit2,
      isActive: currentPage === "projects"
    },
    {
      id: "about",
      label: "About",
      icon: Info,
      isActive: currentPage === "about"
    },
    {
      id: "contact",
      label: "Contact",
      icon: Mail,
      isActive: currentPage === "contact"
    },
    ...(currentUser?.role === "admin"
      ? [
          {
            id: "admin",
            label: "Admin",
            icon: ShieldCheck,
            isActive: currentPage === "admin"
          }
        ]
      : [
          {
            id: "profile",
            label: "Profile",
            icon: User,
            isActive: currentPage === "profile"
          }
        ])
  ];

  return (
    <nav
      id="tour-bottom-nav"
      aria-label="Mobile Bottom Navigation"
      className="app-bottom-nav"
    >
      <div className="w-full h-full max-w-md mx-auto flex items-center justify-around px-0.5 sm:px-2">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.isActive;

          return (
            <button
              key={tab.id}
              id={`bottom-nav-${tab.id}`}
              type="button"
              onClick={() => {
                onNavigate(tab.id);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              aria-label={tab.label}
              aria-current={isActive ? "page" : undefined}
              className={`relative flex flex-col items-center justify-center flex-1 h-full py-1 group cursor-pointer border-none bg-transparent transition-all duration-200 active:scale-95 select-none min-w-0 ${
                isActive
                  ? "text-[#0756A5] dark:text-[#60A5FA]"
                  : "text-[#102B50] dark:text-slate-300 hover:text-[#0756A5] dark:hover:text-[#FFB800]"
              }`}
            >
              {/* Active top glowing accent indicator bar */}
              {isActive && (
                <span className="absolute top-0 w-9 h-1 rounded-b-full bg-[#0756A5] dark:bg-[#FFB800] shadow-[0_2px_8px_rgba(7,86,165,0.4)] animate-in" />
              )}

              {/* Icon Container with active highlight pill */}
              <div
                className={`p-1 sm:p-1.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-[#0756A5]/10 dark:bg-[#0756A5]/25 text-[#0756A5] dark:text-[#60A5FA] scale-110 shadow-xs"
                    : "text-[#0756A5] dark:text-slate-300 group-hover:bg-[#FFB800]/20 group-hover:text-[#102B50] dark:group-hover:text-[#FFB800]"
                }`}
              >
                <Icon size={18} strokeWidth={isActive ? 2.4 : 2.2} />
              </div>

              {/* Tab label */}
              <span
                className={`text-[9px] xs:text-[10px] sm:text-[11px] font-bold tracking-tight mt-0.5 leading-none truncate max-w-full text-center px-0.5 transition-colors duration-200 ${
                  isActive
                    ? "text-[#0756A5] dark:text-[#60A5FA]"
                    : "text-[#102B50] dark:text-slate-300 group-hover:text-[#0756A5] dark:group-hover:text-[#FFB800]"
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
