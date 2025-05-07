"use client";

import Link from "next/link";
import ThemeToggleWrapper from "@/components/ThemeToggleWrapper";
import SignOutModal from "@/components/SignOutModal";
import { useState, useEffect } from "react";
import { useSession } from "@/components/useSession";

type HeaderProps = {
  // Add any props you might need in the future
  className?: string;
};

// Hydration-safe theme detection
function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

export default function Header({}: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);
  const mounted = useMounted();
  const session = useSession();

  // Listen for sign out modal event
  useEffect(() => {
    const handler = () => setIsSignOutModalOpen(true);
    window.addEventListener("open-signout-modal", handler);
    return () => window.removeEventListener("open-signout-modal", handler);
  }, []);

  if (!mounted) return null;

  return (
    <header className="fixed top-0 left-0 w-full bg-surface z-50 border-b border-[var(--color-border-light-strong)] dark:border-[var(--color-border-dark-strong)] transition-[background-color] duration-[var(--transition-normal)]">
      <div className="flex justify-between items-center px-4 py-2 h-[var(--layout-header-height-mobile)]">
        <div className="pl-6">
          <Link href="/overview">
            {/* Custom SVG Logo: Technolabe, even wider display window */}
            <img src="/bst.png" alt="Brand Logo" className="h-[var(--layout-header-height-mobile)] md:h-[var(--layout-header-height-desktop)] w-auto logo-polarize-light" />
          </Link>
        </div>
        <div className="flex items-center gap-4">
          {/* Hamburger - always visible if authenticated */}
          {session && (
            <button
              className="block p-2 rounded hover:bg-surface-hover focus:outline-none"
              aria-label="Open menu"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          )}
          {/* Theme toggle removed from header bar for consistency */}
        </div>
      </div>
      {/* Hamburger Popover: always available */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex justify-end"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            className="w-64 bg-surface opacity-85 h-full shadow-xl p-6 flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top row: Theme Toggle and X button */}
            <div className="flex items-center justify-between mb-4 border-b border-border pb-4">
              <ThemeToggleWrapper />
              <button
                className="ml-2 p-2 rounded hover:bg-surface-hover"
                aria-label="Close menu"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            {/* Nav Items */}
            <nav className="flex flex-col gap-2 flex-1">
              <Link
                href="/overview"
                className="flex items-center gap-2 p-2 rounded transition-colors menu-hover"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M8 16h8M8 12h8M8 8h8" />
                </svg>
                <span>Overview</span>
              </Link>
              <Link
                href="/profile"
                className="flex items-center gap-2 p-2 rounded transition-colors menu-hover"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M 3 9h 6" />
                  <path d="M 9 3v 6" />
                </svg>
                <span>Profile</span>
              </Link>
              <Link
                href="/quiz"
                className="flex items-center gap-2 p-2 rounded transition-colors menu-hover"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M 3 3h 18v 18h -18z" />
                  <path d="M 7 7h 10v 10h -10z" />
                </svg>
                <span>Quiz</span>
              </Link>
            </nav>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                const evt = new CustomEvent("open-signout-modal");
                window.dispatchEvent(evt);
              }}
              className="flex items-center gap-2 p-2 rounded hover:bg-accent hover:text-surface transition-colors text-accent mt-4"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M 16 8l -4 4l -4 -4" />
                <path d="M 4 16l 4 -4l 4 4" />
                <path d="M 4 12l 4 4l 4 -4" />
              </svg>
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
      {/* Sign Out Modal */}
      <SignOutModal isOpen={isSignOutModalOpen} onClose={() => setIsSignOutModalOpen(false)} />
    </header>
  );
}
