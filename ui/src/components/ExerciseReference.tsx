import React, { useState } from "react";
import exerciseCatalog from "@/mockData/exercise_catalog.json";

interface Exercise {
  exercise_id: number;
  name: string;
  muscle_group: string;
  position: string;
  typical_springs?: string;
  typical_duration?: string;
  description?: string;
}

const ExerciseReference: React.FC = () => {
  const [expanded, setExpanded] = useState<number | null>(null);
  const [nameFilter, setNameFilter] = useState("");
  const [muscleFilter, setMuscleFilter] = useState("");
  const [positionFilter, setPositionFilter] = useState("");

  // Get unique muscle groups and positions
  const muscleGroups = Array.from(new Set(exerciseCatalog.map((ex: Exercise) => ex.muscle_group).filter(Boolean)));
  const positions = Array.from(new Set(exerciseCatalog.map((ex: Exercise) => ex.position).filter(Boolean)));

  // Filter and sort exercises
  const filteredExercises = [...exerciseCatalog]
    .filter((ex: Exercise) => {
      const nameMatch = ex.name.toLowerCase().includes(nameFilter.toLowerCase());
      const muscleMatch = !muscleFilter || ex.muscle_group === muscleFilter;
      const positionMatch = !positionFilter || ex.position === positionFilter;
      return nameMatch && muscleMatch && positionMatch;
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="w-full">
      <div className="my-4 p-4 border rounded-lg w-full">
        <div className="flex flex-wrap gap-3 mb-5">
          <input
            type="text"
            placeholder="Filter by name..."
            value={nameFilter}
            onChange={e => setNameFilter(e.target.value)}
            className="flex-2 min-w-[120px] bg-surface px-3 py-2 text-base border rounded text-primary border-primary focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
          />
          <select
            value={muscleFilter}
            onChange={e => setMuscleFilter(e.target.value)}
            className="flex-1 min-w-[120px] bg-surface px-2 py-2 text-base border rounded text-primary border-primary focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
          >
            <option value="">All Muscle Groups</option>
            {muscleGroups.map((mg) => (
              <option key={mg} value={mg}>{mg}</option>
            ))}
          </select>
          <select
            value={positionFilter}
            onChange={e => setPositionFilter(e.target.value)}
            className="flex-1 min-w-[120px] bg-surface px-2 py-2 text-base border rounded text-primary border-primary focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
          >
            <option value="">All Positions</option>
            {positions.map((pos) => (
              <option key={pos} value={pos}>{pos}</option>
            ))}
          </select>
        </div>
        {filteredExercises.length === 0 && (
          <div className="text-gray-500 italic mt-5">No exercises found.</div>
        )}
        {filteredExercises.map((ex: Exercise, idx: number) => (
          <div key={ex.exercise_id} className="mb-4 border-b border-primary pb-2">
            <div
              className="cursor-pointer font-bold text-lg flex items-center select-none"
              onClick={() => setExpanded(expanded === idx ? null : idx)}
            >
              {ex.name}
              <span className="ml-2 text-sm text-gray-500">
                {expanded === idx ? '▲' : '▼'}
              </span>
            </div>
            {expanded === idx && (
              <div className="mt-2 text-base">
                <div><b>Muscle Group:</b> {ex.muscle_group}</div>
                <div><b>Position:</b> {ex.position}</div>
                <div><b>Springs:</b> {ex.typical_springs}</div>
                <div><b>Time:</b> {ex.typical_duration}</div>
                {ex.description && <div className="mt-1.5"><b>Description:</b> {ex.description}</div>}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExerciseReference;
