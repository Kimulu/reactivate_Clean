"use client";

import { useState } from "react";
import { ChallengeCard } from "./ChallengeCard";
import { LayoutGrid, LayoutList } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface Challenge {
  _id: string;
  title: string;
  instructions: string;
  difficulty?: "easy" | "medium" | "hard";
  isCompleted?: boolean;
  points: number;
}

interface ChallengesListProps {
  challenges: Challenge[];
}

export default function ChallengesList({ challenges }: ChallengesListProps) {
  const [layout, setLayout] = useState<"grid" | "list">("grid");

  return (
    <div className="w-full">
      {/* 🔹 Mini Navbar Controller */}
      <div className="flex items-center justify-between mb-6 bg-[#0f0f23]/60 backdrop-blur-sm p-4 rounded-xl border border-white/10">
        <h2 className="text-lg font-saira text-white">All Challenges</h2>

        <div className="flex items-center space-x-3">
          <span className="text-white/60 text-sm">View:</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLayout("grid")}
            className={`p-2 rounded-lg ${
              layout === "grid"
                ? "bg-[#4cc9f0]/20 border border-[#4cc9f0]/40"
                : "text-white/50"
            }`}
          >
            <LayoutGrid size={20} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLayout("list")}
            className={`p-2 rounded-lg ${
              layout === "list"
                ? "bg-[#4cc9f0]/20 border border-[#4cc9f0]/40"
                : "text-white/50"
            }`}
          >
            <LayoutList size={20} />
          </Button>
        </div>
      </div>

      {/* 🔹 Render Challenges */}
      <div
        className={`grid gap-6 ${
          layout === "grid"
            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            : "grid-cols-1"
        }`}
      >
        {challenges.map((challenge) => (
          <ChallengeCard
            key={challenge._id}
            id={challenge._id}
            title={challenge.title}
            instructions={challenge.instructions}
            difficulty={challenge.difficulty}
            isCompleted={challenge.isCompleted}
            points={challenge.points}
            layout={layout} // Pass layout type
          />
        ))}
      </div>
    </div>
  );
}
