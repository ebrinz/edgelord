import React from "react";
import { useTheme } from "@/components/ThemeProvider";

interface SummaryStatsCardProps {
  stats: {
    level: string;
    completedModules: number;
    totalModules: number;
    hoursTrained: number;
    nextModule?: string;
  };
}

const SummaryStatsCard: React.FC<SummaryStatsCardProps> = ({ stats }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const bg = isDark ? "#18181b" : "#fff";
  const border = isDark ? "1.5px solid #333" : "1.5px solid #e5e7eb";
  const color = isDark ? "#f3f3f3" : "#18181b";
  const subColor = isDark ? "#a1a1aa" : "#666";

  return (
    <div
      style={{
        width: "100%",
        padding: "2rem 1.5rem",
        borderRadius: 20,
        border,
        background: bg,
        color,
        boxSizing: "border-box",
        boxShadow: isDark
          ? "0 2px 16px rgba(0,0,0,0.28)"
          : "0 2px 16px rgba(0,0,0,0.08)",
        transition: "background 0.2s, color 0.2s, border 0.2s"
      }}
    >
      <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>Instructor Training Summary</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 24, justifyContent: "space-between", width: "100%" }}>

        <div>
          <div style={{ fontSize: 16, color: subColor }}>Current Level</div>
          <div style={{ fontSize: 20, fontWeight: 600 }}>{stats.level}</div>
        </div>
        <div>
          <div style={{ fontSize: 16, color: subColor }}>Modules Completed</div>
          <div style={{ fontSize: 20, fontWeight: 600 }}>{stats.completedModules} / {stats.totalModules}</div>
        </div>
        <div>
          <div style={{ fontSize: 16, color: subColor }}>Hours Trained</div>
          <div style={{ fontSize: 20, fontWeight: 600 }}>{stats.hoursTrained}</div>
        </div>
        {stats.nextModule && (
          <div>
            <div style={{ fontSize: 16, color: subColor }}>Next Module</div>
            <div style={{ fontSize: 20, fontWeight: 600 }}>{stats.nextModule}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SummaryStatsCard;
