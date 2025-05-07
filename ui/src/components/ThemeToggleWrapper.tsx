"use client";

import dynamic from "next/dynamic";

// Use dynamic import with ssr: false to completely prevent server rendering
// This ensures no hydration mismatches with theme-related rendering
const ThemeToggle = dynamic(() => import("./ThemeToggle"), {
  ssr: false,
  loading: () => (
    <div className="w-10 h-10 rounded-full flex items-center justify-center">
      <span className="sr-only">Theme toggle</span>
    </div>
  ),
});

export default function ThemeToggleWrapper() {
  return <ThemeToggle />;
}
