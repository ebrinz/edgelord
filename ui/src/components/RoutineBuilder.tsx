import React, { useState } from "react";


interface Exercise {
  id: number;
  name: string;
  exercise_id: number;
  // other fields can be added as needed
}

interface RoutineExercise {
  id: number;
  exercise: Exercise;
  springs?: string;
  duration: string;
  side?: "R" | "L" | "Both" | "";
  modifiers?: string;
  notes?: string;
}

interface RoutineBuilderProps {
  exercises: Exercise[];
  loading: boolean;
  error: string | null;
  onTestRoutine?: (data: { routine: RoutineExercise[]; exercises: Exercise[]; loading: boolean; error: string | null }) => void;
}

const RoutineBuilder: React.FC<RoutineBuilderProps> = ({ exercises, loading, error }) => {
  // State to store model output score and result string
  const [modelScore, setModelScore] = useState<number | null>(null);
  const [modelResultText, setModelResultText] = useState<string>("");
  const [routine, setRoutine] = useState<RoutineExercise[]>([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState<number | null>(null);
  const [form, setForm] = useState({
    springs: "",
    duration: "",
    side: "",
    modifiers: "",
    notes: ""
  });
  const [exerciseSearch, setExerciseSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [hoveredExerciseId, setHoveredExerciseId] = useState<number | null>(null);



  // Helper to encode side
  const encodeSide = (side: string) => {
    if (side === "L") return -1;
    if (side === "Both") return 0;
    if (side === "R") return 1;
    return 0;
  };

  // Handler for Test Routine
  const handleTestRoutine = async () => {
    const tensor = routine.map((ex: RoutineExercise, idx: number) => [
      idx + 1,
      Number(ex.exercise.exercise_id),
      Number(ex.duration) || 0,
      encodeSide(ex.side ?? "")
    ]);
    try {
      const response = await fetch('/api/run-onnx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tensor })
      });
      const { result } = await response.json();
      if (Array.isArray(result) && result.length > 0) {
        setModelScore(result[0]);
        setModelResultText(result.every((x: number) => x === 1) ? "PASS" : "FAIL");
      } else {
        setModelScore(null);
        setModelResultText("Could not determine result.");
      }
    } catch (err) {
      setModelScore(null);
      setModelResultText("Error running ONNX model: " + (err as Error).message);
    }
  };


  // Filtered exercise options for search
  const filteredExerciseOptions = exercises.filter((ex: Exercise) =>
    (ex.name || '').toLowerCase().includes(exerciseSearch.toLowerCase())
  );

  const selectedExercise = selectedExerciseId != null ? exercises.find((ex: Exercise) => ex.id === selectedExerciseId) : null;

  if (loading) {
    return <div className="p-4 text-center text-text-secondary">Loading exercises...</div>;
  }
  if (error) {
    return <div className="p-4 text-center text-red-500">Error: {error}</div>;
  }

  // Add selected exercise to routine
  const handleAddToRoutine = () => {
    if (!selectedExercise || !form.duration) return;
    setRoutine([
      ...routine,
      {
        id: selectedExercise.id,
        exercise: selectedExercise,
        springs: form.springs,
        duration: form.duration,
        side: form.side as RoutineExercise["side"],
        modifiers: form.modifiers,
        notes: form.notes
      }
    ]);
    setForm({ springs: "", duration: "", side: "", modifiers: "", notes: "" });
    setSelectedExerciseId(null);
    setExerciseSearch("");
    setModelScore(null);
    setModelResultText("");
  };

  // Remove from routine
  const handleRemove = (idx: number) => {
    setRoutine(routine.filter((_, i) => i !== idx));
    setModelScore(null);
    setModelResultText("");
  };

  return (
    <div className="w-full">
      {/* <h2 className="text-xl font-bold mb-4">Routine Builder</h2> */}

      {/* Routine Builder Controls */}
      <div className="my-4 p-4 border rounded-lg w-full">
        <h4 className="font-semibold mb-2">Add Exercise to Routine</h4>
        <div className="flex flex-wrap gap-4 items-center w-full">
          <label className="flex flex-col text-sm min-w-[180px] flex-1 w-full relative">
            Exercise
            <input
              type="text"
              className="mt-1 px-2 py-1 border rounded bg-surface text-primary border-primary focus:outline-none focus:ring-2 focus:ring-primary transition-colors w-full"
              placeholder="Type to search..."
              value={selectedExerciseId ? exercises.find(ex => ex.id === selectedExerciseId)?.name || exerciseSearch : exerciseSearch}
              onChange={e => {
                setExerciseSearch(e.target.value);
                setSelectedExerciseId(null);
              }}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
              autoComplete="off"
            />
            {showDropdown && exerciseSearch && filteredExerciseOptions.length > 0 && (
              <div className="absolute left-0 top-full mt-2 z-10 bg-surface border border-primary rounded w-full max-h-48 overflow-auto shadow-lg" style={{minWidth: '100%'}}>
                {filteredExerciseOptions.map((ex) => (
                  <div
                    key={ex.id}
                    className={
                      "px-3 py-2 cursor-pointer transition-colors " +
                      ((hoveredExerciseId === ex.id || selectedExerciseId === ex.id) ? "bg-primary text-surface" : "hover:bg-primary/10")
                    }
                    onMouseEnter={() => setHoveredExerciseId(ex.id)}
                    onMouseLeave={() => setHoveredExerciseId(null)}
                    onMouseDown={() => {
                      setSelectedExerciseId(ex.id);
                      setExerciseSearch(ex.name);
                      setShowDropdown(false);
                      setForm(f => ({
                        ...f,
                        springs: '', // placeholder until field exists
                        duration: '', // placeholder until field exists
                        side: '',
                        modifiers: '',
                        notes: ''
                      }));
                    }}
                  >
                    {ex.name}
                  </div>
                ))}
              </div>
            )}
          </label>
          <label className="flex flex-col text-sm min-w-[110px] flex-1 w-full">
  Duration (sec)
  <input
    type="number"
    className="mt-1 px-2 py-1 border rounded bg-surface text-black dark:text-white border-primary dark:border-primary focus:outline-none focus:ring-2 focus:ring-primary transition-colors w-full"
    value={form.duration}
    onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}
    placeholder="e.g. 60"
    min={0}
  />
</label>
<label className="flex flex-col text-sm min-w-[90px] flex-1 w-full">
  Side
  <select
    className="mt-1 px-2 py-1 border rounded bg-surface text-primary border-primary focus:outline-none focus:ring-2 focus:ring-primary transition-colors w-full"
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
              className="mt-1 px-2 py-1 border rounded bg-surface text-black dark:text-white border-primary dark:border-primary focus:outline-none focus:ring-2 focus:ring-primary transition-colors w-full"
              value={form.modifiers}
              onChange={e => setForm(f => ({ ...f, modifiers: e.target.value }))}
              placeholder="e.g. +pulse :30"
            />
          </label>
          <label className="flex flex-col text-sm min-w-[140px] flex-1 w-full">
            Notes
            <input
              className="mt-1 px-2 py-1 border rounded bg-surface text-black dark:text-white border-primary dark:border-primary focus:outline-none focus:ring-2 focus:ring-primary transition-colors w-full"
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="e.g. in well, facing front"
            />
          </label>
          <button
            className="w-full h-[40px] py-2 px-4 bg-surface border border-primary text-primary rounded hover:bg-primary hover:text-surface hover:shadow-[0_0_5px_rgba(0,178,204,0.5)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-lg flex items-center justify-center min-w-[60px]"
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
              {routine.map((ex: RoutineExercise, idx: number) => (
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
                  <span className="flex flex-wrap gap-2 items-center">
  <span className="font-medium">{ex.exercise.name}</span>
  {ex.duration && (
    <span className="text-xs text-primary font-mono bg-primary/10 px-2 py-0.5 rounded">⏱ {ex.duration}s</span>
  )}
  {ex.springs && (
    <span className="text-xs text-pink-600 font-mono bg-pink-100/60 dark:bg-pink-900/40 px-2 py-0.5 rounded">🌀 {ex.springs}</span>
  )}
  {ex.side && (
    <span className="text-xs text-gray-500">{ex.side}</span>
  )}
  {ex.modifiers && (
    <span className="text-xs text-gray-500">+{ex.modifiers}</span>
  )}
  {ex.notes && (
    <span className="text-xs text-gray-400">({ex.notes})</span>
  )}
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
            {/* Model Output Score Display - always visible, above Test Routine */}
            <div className="w-full h-[40px] mb-3 py-2 px-4 bg-transparent border border-primary text-primary rounded flex items-center justify-center text-lg min-w-[60px]" style={{fontWeight: 600}}>
              {/* {modelResultText ? <span style={{marginRight: 12}}>Result: {modelResultText}</span> : <span style={{marginRight: 12, color: '#888'}}>Result:</span>} */}
              {modelScore !== null ? <span>Score: {modelScore}</span> : <span style={{color: '#888'}}>Score: {modelResultText}</span>}
            </div>
            <button
              className="w-full h-[40px] py-2 px-4 bg-transparent border border-primary text-primary rounded hover:bg-primary hover:text-surface hover:shadow-[0_0_5px_rgba(0,178,204,0.5)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-lg flex items-center justify-center min-w-[60px]"
              type="button"
              style={{ lineHeight: 1 }}
              onClick={handleTestRoutine}
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
