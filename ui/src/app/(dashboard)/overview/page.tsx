"use client";
import SummaryStatsCard from "@/components/SummaryStatsCard";

export default function OverviewPage() {
  // Placeholder stats for a pilates instructor
  const stats = {
    level: "Intermediate",
    completedModules: 8,
    totalModules: 12,
    hoursTrained: 120,
    nextModule: "Advanced Booty Mechanics"
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full p-8">
      <SummaryStatsCard stats={stats} />
    </div>
  );
}
