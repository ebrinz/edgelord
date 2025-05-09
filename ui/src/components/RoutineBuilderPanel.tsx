import React from "react";
import RoutineBuilder from "./RoutineBuilder";

const RoutineBuilderPanel: React.FC = () => {
  return (
    <div className="panel">
      <h2 className="text-primary">Routine Builder & Tester</h2>
      <RoutineBuilder />
    </div>
  );
};

export default RoutineBuilderPanel;
