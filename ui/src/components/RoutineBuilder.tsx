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

interface RoutineExercise {
  exercise_id: number;
  name: string;
  springs?: string;
  duration: string;
  side?: "R" | "L" | "Both" | "";
  modifiers?: string;
  notes?: string;
}

const RoutineBuilder: React.FC = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [routine, setRoutine] = useState<RoutineExercise[]>([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState<number | null>(null);
  const [form, setForm] = useState({
    springs: "",
    duration: "",
    side: "",
    modifiers: "",
    notes: ""
  });

  // Get unique exercises, durations, springs
  const durations = Array.from(new Set(exerciseCatalog.map((ex: Exercise) => ex.typical_duration).filter(Boolean)));
  const springsList = Array.from(new Set(exerciseCatalog.map((ex: Exercise) => ex.typical_springs).filter(Boolean)));

  const selectedExercise = selectedExerciseId != null ? exercises.find((ex: Exercise) => ex.exercise_id === selectedExerciseId) : null;

  // Add selected exercise to routine
  const handleAddToRoutine = () => {
    if (!selectedExercise || !form.duration) return;
    setRoutine([
      ...routine,
      {
        exercise_id: selectedExercise.exercise_id,
        name: selectedExercise.name,
        springs: form.springs,
        duration: form.duration,
        side: form.side as RoutineExercise["side"],
        modifiers: form.modifiers,
        notes: form.notes
      }
    ]);
    setForm({ springs: "", duration: "", side: "", modifiers: "", notes: "" });
    setSelectedExerciseId(null);
  };

  // Remove from routine
  const handleRemove = (idx: number) => {
    setRoutine(routine.filter((_, i) => i !== idx));
  };

  return (
    <div className="w-full">
      {/* <h2 className="text-xl font-bold mb-4">Routine Builder</h2> */}

      {/* Routine Builder Controls */}
      <div className="my-4 p-4 border rounded-lg w-full">
        <h4 className="font-semibold mb-2">Add Exercise to Routine</h4>
        <div className="flex flex-wrap gap-4 items-center w-full">
          <label className="flex flex-col text-sm min-w-[180px] flex-1 w-full">
            Exercise
            <select
              className="mt-1 px-2 py-1 border rounded bg-white dark:bg-zinc-900 text-black dark:text-white border-gray-300 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-primary transition-colors w-full"
              value={selectedExerciseId ?? ''}
              onChange={e => {
                const val = e.target.value ? parseInt(e.target.value) : null;
                setSelectedExerciseId(val);
                const ex = exercises.find((ex: Exercise) => ex.exercise_id === val);
                setForm(f => ({
                  ...f,
                  springs: ex?.typical_springs || '',
                  duration: ex?.typical_duration || '',
                  side: '',
                  modifiers: '',
                  notes: ''
                }));
              }}
            >
              <option value="">Select Exercise</option>
              {exercises.map((ex: Exercise) => (
                <option key={ex.exercise_id} value={ex.exercise_id}>{ex.name}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col text-sm min-w-[120px] flex-1 w-full">
            Springs
            <select
              className="mt-1 px-2 py-1 border rounded bg-white dark:bg-zinc-900 text-black dark:text-white border-gray-300 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-primary transition-colors w-full"
              value={form.springs}
              onChange={e => setForm(f => ({ ...f, springs: e.target.value }))}
            >
              <option value="">-</option>
              {springsList.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col text-sm min-w-[100px] flex-1 w-full">
            Duration
            <select
              className="mt-1 px-2 py-1 border rounded bg-white dark:bg-zinc-900 text-black dark:text-white border-gray-300 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-primary transition-colors w-full"
              value={form.duration}
              onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}
            >
              <option value="">-</option>
              {durations.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col text-sm min-w-[90px] flex-1 w-full">
            Side
            <select
              className="mt-1 px-2 py-1 border rounded bg-white dark:bg-zinc-900 text-black dark:text-white border-gray-300 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-primary transition-colors w-full"
              value={form.side}
              onChange={e => setForm(f => ({ ...f, side: e.target.value }))}
            >
              <option value="">-</option>
              <option value="R">R</option>
              <option value="L">L</option>
              <option value="Both">Both</option>
            </select>
          </label>
          <label className="flex flex-col text-sm min-w-[120px] flex-1 w-full">
            Modifiers
            <input
              className="mt-1 px-2 py-1 border rounded bg-white dark:bg-zinc-900 text-black dark:text-white border-gray-300 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-primary transition-colors w-full"
              value={form.modifiers}
              onChange={e => setForm(f => ({ ...f, modifiers: e.target.value }))}
              placeholder="e.g. +pulse :30"
            />
          </label>
          <label className="flex flex-col text-sm min-w-[140px] flex-1 w-full">
            Notes
            <input
              className="mt-1 px-2 py-1 border rounded bg-white dark:bg-zinc-900 text-black dark:text-white border-gray-300 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-primary transition-colors w-full"
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="e.g. in well, facing front"
            />
          </label>
          <button
            className="w-full h-[40px] py-2 px-4 bg-transparent border border-primary text-primary rounded hover:bg-primary hover:text-surface hover:shadow-[0_0_5px_rgba(0,178,204,0.5)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-lg flex items-center justify-center min-w-[60px]"
            onClick={handleAddToRoutine}
            title="Add to Routine"
            type="button"
            style={{ lineHeight: 1 }}
          >
            +
          </button>
        </div>
      </div>
      {/* Routine List */}
      {routine.length > 0 && (
        <>
          <div className="mt-6 border rounded-lg">
            <h4 className="font-semibold mb-2 px-4 pt-4">Routine Sequence</h4>
            <ol className="list-decimal pb-2">
              {routine.map((ex, idx) => (
                <li
                  key={idx}
                  className={
                    `flex items-center justify-between gap-2 px-4 border-b border-gray-200 dark:border-zinc-800 last:border-b-0 ` +
                    (idx % 2 === 0
                      ? 'bg-gray-50 dark:bg-zinc-800/70'
                      : 'bg-gradient-to-r from-primary/10 to-transparent dark:from-primary/20 dark:to-transparent')
                  }
                  style={{paddingTop: 0, paddingBottom: 0, minHeight: '40px'}}
                >
                  <span>
                    <span className="font-medium">{ex.name}</span>
                    {ex.springs ? <span className="ml-2 text-xs text-gray-500">{ex.springs}</span> : null}
                    {ex.duration ? <span className="ml-2 text-xs text-gray-500">{ex.duration}</span> : null}
                    {ex.side ? <span className="ml-2 text-xs text-gray-500">{ex.side}</span> : null}
                    {ex.modifiers ? <span className="ml-2 text-xs text-gray-500">+{ex.modifiers}</span> : null}
                    {ex.notes ? <span className="ml-2 text-xs text-gray-400">({ex.notes})</span> : null}
                  </span>
                  <button
                    className="ml-2 px-4 h-[32px] py-1 bg-transparent border border-primary text-primary rounded hover:bg-primary hover:text-surface hover:shadow-[0_0_5px_rgba(0,178,204,0.5)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-xs flex items-center justify-center min-w-[60px]"
                    onClick={() => handleRemove(idx)}
                    title="Remove from Routine"
                    type="button"
                    style={{ lineHeight: 1 }}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ol>
          </div>
          <div className="pt-2">
            <button
              className="w-full h-[40px] py-2 px-4 bg-transparent border border-primary text-primary rounded hover:bg-primary hover:text-surface hover:shadow-[0_0_5px_rgba(0,178,204,0.5)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-lg flex items-center justify-center min-w-[60px]"
              type="button"
              style={{ lineHeight: 1 }}
            >
              Test Routine
            </button>
          </div>
        </>
      )}

    </div>
  );
};

export default RoutineBuilder;
