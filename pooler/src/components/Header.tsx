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
          <Link href="/">
            {/* Custom SVG Logo: Technolabe, even wider display window */}
            <svg
              width="800"
              height="140"
              viewBox="0 0 800 140"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-32 w-[800px]"
            >
              <defs>
                <linearGradient id="techno-gradient" x1="0" y1="0" x2="800" y2="140" gradientUnits="userSpaceOnUse">
                  <stop stopColor="var(--color-primary)" />
                  <stop offset="1" stopColor="#c0c0c0" />
                </linearGradient>
                <filter id="glow" x="-10%" y="-10%" width="120%" height="120%">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <text
                x="50%"
                y="65%"
                textAnchor="middle"
                dominantBaseline="middle"
                fontFamily="'Orbitron', 'Share Tech Mono', 'monospace'"
                fontWeight="bold"
                fontSize="90"
                fill="url(#techno-gradient)"
                filter="url(#glow)"
                letterSpacing="0.22em"
                style={{ textShadow: '0 0 4px var(--color-primary)' }}
              >
                TECHNOLABE
              </text>
            </svg>
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
                <span>Config</span>
              </Link>
              <Link
                href="/repositories"
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
                <span>Repos</span>
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
