"use client";
import React from "react";
// import { useTheme } from "@/components/ThemeProvider";
import RoutineBuilderPanel from "@/components/RoutineBuilderPanel";
import QuizHistoryPanel from "@/components/QuizHistoryPanel";
import ExerciseReferencePanel from "@/components/ExerciseReferencePanel";

const QuizPage: React.FC = () => {
  const [exercises, setExercises] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchExercises = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/exercises');
        if (!res.ok) throw new Error('Failed to fetch exercises');
        const json = await res.json();
        setExercises(json.exercises || []);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch exercises');
      } finally {
        setLoading(false);
      }
    };
    fetchExercises();
  }, []);

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
          <RoutineBuilderPanel exercises={exercises} loading={loading} error={error} />
        </div>
        <div style={{ width: '100%', margin: '0 20px' }}>
          <QuizHistoryPanel />
        </div>
        <div style={{ width: '100%', margin: '0 20px' }}>
          <ExerciseReferencePanel exercises={exercises} loading={loading} error={error} />
        </div>
      </div>
    </>
  );
};

export default QuizPage;
