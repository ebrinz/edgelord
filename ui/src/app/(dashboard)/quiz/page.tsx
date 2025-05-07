"use client";
import React from "react";
import { useTheme } from "@/components/ThemeProvider";

const QuizPage: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const bg = isDark ? "#18181b" : "#fff";
  const border = isDark ? "1.5px solid #333" : "1.5px solid #e5e7eb";
  const color = isDark ? "#f3f3f3" : "#18181b";

  return (
    <section
      style={{
        width: "100%",
        margin: "2rem 0",
        padding: "2.5rem 1.5rem",
        borderRadius: 20,
        border,
        background: bg,
        color,
        minHeight: 320,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        boxSizing: "border-box",
        boxShadow: isDark
          ? "0 2px 16px rgba(0,0,0,0.28)"
          : "0 2px 16px rgba(0,0,0,0.08)",
        transition: "background 0.2s, color 0.2s, border 0.2s"
      }}
    >
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12 }}>Quiz Section (Coming Soon)</h1>
      <p style={{ fontSize: 18, color: isDark ? "#a1a1aa" : "#666", maxWidth: 520, textAlign: "center" }}>
        This is where your interactive quizzes will appear. We'll soon add logic, API endpoints, and database updates for a dynamic quiz experience. Stay tuned!
      </p>
    </section>
  );
};

export default QuizPage;
