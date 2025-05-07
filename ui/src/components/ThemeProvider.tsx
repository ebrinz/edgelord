"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("system");

  // One-time initialization from localStorage
  useEffect(() => {
    // Only run this effect once on component mount
    if (typeof window === "undefined") return;

    const storedTheme = localStorage.getItem("theme") as Theme | null;
    if (storedTheme) {
      setTheme(storedTheme);
    }
  }, []); // Empty dependency array = only run once on mount

  // Handle theme changes and apply them
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Update theme class on html element
    const root = document.documentElement;
    let isDark = false;

    if (theme === "system") {
      isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    } else {
      isDark = theme === "dark";
    }

    root.classList.remove("dark-mode", "light-mode");
    root.classList.add(isDark ? "dark-mode" : "light-mode");

    // Save to localStorage
    if (theme === "system") {
      localStorage.removeItem("theme");
    } else {
      localStorage.setItem("theme", theme);
    }
  }, [theme]); // Only run when theme changes

  // Watch for system theme changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = () => {
      const root = document.documentElement;
      root.classList.remove("dark-mode", "light-mode");
      root.classList.add(mediaQuery.matches ? "dark-mode" : "light-mode");
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]); // Depend on theme to re-register when theme mode changes

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
