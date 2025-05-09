"use client";
import React from "react";
import { useTheme } from "@/components/ThemeProvider";
import RoutineBuilderPanel from "@/components/RoutineBuilderPanel";
import QuizHistoryPanel from "@/components/QuizHistoryPanel";
import ExerciseReferencePanel from "@/components/ExerciseReferencePanel";

const QuizPage: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

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
