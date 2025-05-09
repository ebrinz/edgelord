import React, { useEffect, useState } from "react";
import exerciseCatalog from "@/mockData/exercise_catalog.json";

interface Exercise {
  exercise_id: number;
  name: string;
  position: string;
  muscle_group: string;
  typical_springs: string;
  typical_duration: string;
}

const getUniqueValues = (arr: Exercise[], key: keyof Exercise): string[] => {
  return Array.from(new Set(arr.map((item) => String(item[key])).filter(Boolean)));
};

const ExerciseFilterForm: React.FC = () => {
  const [muscleGroups, setMuscleGroups] = useState<string[]>([]);
  const [positions, setPositions] = useState<string[]>([]);
  const [names, setNames] = useState<string[]>([]);

  const [selected, setSelected] = useState({
    muscle_group: "",
    position: "",
    name: "",
  });

  // Filtering logic
  const filteredByMuscle = selected.muscle_group
    ? exerciseCatalog.filter((ex: any) => ex.muscle_group === selected.muscle_group)
    : exerciseCatalog;
  const filteredByPosition = selected.position
    ? filteredByMuscle.filter((ex: any) => ex.position === selected.position)
    : filteredByMuscle;
  const filteredByName = selected.name
    ? filteredByPosition.filter((ex: any) => ex.name === selected.name)
    : filteredByPosition;

  useEffect(() => {
    setMuscleGroups(getUniqueValues(exerciseCatalog, "muscle_group"));
    setPositions(getUniqueValues(filteredByMuscle, "position"));
    setNames(getUniqueValues(filteredByPosition, "name"));
  }, [selected.muscle_group, selected.position]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSelected((prev) => {
      // Reset dependent fields if a parent is changed
      if (name === "muscle_group") {
        return { muscle_group: value, position: "", name: "" };
      } else if (name === "position") {
        return { ...prev, position: value, name: "" };
      } else {
        return { ...prev, [name]: value };
      }
    });
  };


  return (
    <>
      <form style={{ display: "flex", gap: 16, flexWrap: "wrap", margin: "2rem 0" }}>
        <label>
          Muscle Group
          <select name="muscle_group" value={selected.muscle_group} onChange={handleChange}>
            <option value="">All</option>
            {muscleGroups.map((val) => (
              <option key={val} value={val}>{val}</option>
            ))}
          </select>
        </label>
        <label>
          Position
          <select name="position" value={selected.position} onChange={handleChange}>
            <option value="">All</option>
            {positions.map((val) => (
              <option key={val} value={val}>{val}</option>
            ))}
          </select>
        </label>
        <label>
          Name
          <select name="name" value={selected.name} onChange={handleChange}>
            <option value="">All</option>
            {names.map((val) => (
              <option key={val} value={val}>{val}</option>
            ))}
          </select>
        </label>
      </form>
      <div style={{ marginTop: 24 }}>
        <h4>Filtered Exercises:</h4>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>Name</th>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>Muscle Group</th>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>Position</th>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>Springs</th>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>Time</th>
            </tr>
          </thead>
          <tbody>
            {filteredByName.map((ex: any) => (
              <tr key={ex.exercise_id}>
                <td>{ex.name}</td>
                <td>{ex.muscle_group}</td>
                <td>{ex.position}</td>
                <td>{ex.typical_springs}</td>
                <td>{ex.typical_duration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default ExerciseFilterForm;
