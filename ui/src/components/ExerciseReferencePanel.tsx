import React from "react";
import ExerciseReference from "./ExerciseReference";

import type { Exercise } from "./ExerciseReference";

interface ExerciseReferencePanelProps {
  exercises: Exercise[];
  loading: boolean;
  error: string | null;
}

const ExerciseReferencePanel: React.FC<ExerciseReferencePanelProps> = ({ exercises, loading, error }) => {
  return (
    <div className="panel">
      <h2 >Exercise Reference</h2>
      <ExerciseReference exercises={exercises} loading={loading} error={error} />
    </div>
  );
};

export default ExerciseReferencePanel;
