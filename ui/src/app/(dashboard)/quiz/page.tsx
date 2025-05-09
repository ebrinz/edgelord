"use client";
import React from "react";
import { useTheme } from "@/components/ThemeProvider";
import RoutineBuilderPanel from "@/components/RoutineBuilderPanel";
import QuizHistoryPanel from "@/components/QuizHistoryPanel";
import ExerciseReferencePanel from "@/components/ExerciseReferencePanel";

const QuizPage: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const bg = isDark ? "#18181b" : "#fff";
  const border = isDark ? "1.5px solid #333" : "1.5px solid #e5e7eb";
  const color = isDark ? "#f3f3f3" : "#18181b";

  return (
    <>
      <div
        style={{
          width: "100%",
          margin: "2rem 0",
          padding: 0,
          display: "flex",
          flexDirection: "column",
          gap: 32,
          alignItems: "center"
        }}
      >
        <div style={{ width: '100%', margin: '0 20px' }}>
          <RoutineBuilderPanel />
        </div>
        <div style={{ width: '100%', margin: '0 20px' }}>
          <QuizHistoryPanel />
        </div>
        <div style={{ width: '100%', margin: '0 20px' }}>
          <ExerciseReferencePanel />
        </div>
      </div>
    </>
  );
};

export default QuizPage;
