import React, { useState } from "react";


// 'id' and 'exercise_id' are now required for compatibility with RoutineBuilder and other consumers.
export type Exercise = {
  id: number;
  exercise_id: number;
  name: string;
  position?: string;
  muscle_group?: string;
  common_modifiers?: string;
  frequency?: number;
  routine_position_preference?: string;
  duration_seconds?: number;
  black?: number;
  white?: number;
}

interface ExerciseReferenceProps {
  exercises: Exercise[];
  loading: boolean;
  error: string | null;
}

const ExerciseReference: React.FC<ExerciseReferenceProps> = ({ exercises, loading, error }) => {
  const [expanded, setExpanded] = useState<number | null>(null);
  const [nameFilter, setNameFilter] = useState("");

  const filteredExercises = [...exercises]
    .filter((ex: Exercise) => {
      const nameMatch = (ex.name || '').toLowerCase().includes(nameFilter.toLowerCase());
      return nameMatch;
    })
    .sort((a, b) => (a.name || '').localeCompare(b.name || ''));

  if (loading) {
    return <div className="p-4 text-center text-text-secondary">Loading exercises...</div>;
  }
  if (error) {
    return <div className="p-4 text-center text-red-500">Error: {error}</div>;
  }

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
        </div>
        {filteredExercises.length === 0 && (
          <div className="text-gray-500 italic mt-5">No exercises found.</div>
        )}
        {filteredExercises.map((ex: Exercise, idx: number) => (
          <div key={ex.id} className="mb-4 border-b border-primary pb-2">
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
              <div className="mt-2 text-base space-y-1">
                <div><b>Name:</b> <span className="text-gray-400">{ex.name}</span></div>
                <div><b>Position:</b> <span className="text-gray-400">{ex.position || '—'}</span></div>
                <div><b>Muscle Group:</b> <span className="text-gray-400">{ex.muscle_group || '—'}</span></div>
                <div><b>Common Modifiers:</b> <span className="text-gray-400">{ex.common_modifiers || '—'}</span></div>
                <div><b>Frequency:</b> <span className="text-gray-400">{typeof ex.frequency === 'number' ? ex.frequency : '—'}</span></div>
                <div><b>Routine Position Preference:</b> <span className="text-gray-400">{ex.routine_position_preference || '—'}</span></div>
                <div><b>Duration (seconds):</b> <span className="text-gray-400">{typeof ex.duration_seconds === 'number' ? ex.duration_seconds : '—'}</span></div>
                <div><b>Black:</b> <span className="text-gray-400">{typeof ex.black === 'number' ? ex.black : '—'}</span></div>
                <div><b>White:</b> <span className="text-gray-400">{typeof ex.white === 'number' ? ex.white : '—'}</span></div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExerciseReference;
