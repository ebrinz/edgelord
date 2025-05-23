import React from "react";
import RoutineBuilder from "./RoutineBuilder";

import type { Exercise } from "./ExerciseReference";

interface RoutineBuilderPanelProps {
  exercises: Exercise[];
  loading: boolean;
  error: string | null;
}

const RoutineBuilderPanel: React.FC<RoutineBuilderPanelProps> = ({ exercises, loading, error }) => {
  return (
    <div className="panel">
      <h2 className="text-primary">Routine Builder & Tester</h2>
      <RoutineBuilder exercises={exercises} loading={loading} error={error} />
    </div>
  );
};

export default RoutineBuilderPanel;
