import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { CheckCircle } from "lucide-react"; // 💡 NEW IMPORT: CheckCircle icon
// 💡 NEW IMPORT: Trophy icon for points
import { Trophy } from "lucide-react";

interface ChallengeCardProps {
  id: string;
  title: string;
  instructions: string;
  difficulty?: "easy" | "medium" | "hard";
  isCompleted?: boolean; // 💡 NEW PROP: Optional boolean to indicate completion status
  points: number; // 💡 NEW PROP: Points for this challenge
}

export function ChallengeCard({
  id,
  title,
  instructions,
  difficulty,
  isCompleted = false,
  points, // 💡 NEW: Destructure points prop
}: ChallengeCardProps) {
  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case "easy":
        return "text-[#06ffa5]";
      case "medium":
        return "text-[#4cc9f0]";
      case "hard":
        return "text-[#f72585]";
      default:
        return "text-white/60";
    }
  };

  return (
    <div className="relative bg-gradient-to-br from-[#1a1a2e]/80 to-[#0f0f23]/80 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-[#4cc9f0]/50 transition-all duration-300 group hover:shadow-lg hover:shadow-[#4cc9f0]/20">
      {/* 💡 NEW: Completion Tick Icon - Positioned absolutely at the top right */}
      {isCompleted && (
        <div className="absolute top-3 right-3 text-[#06ffa5] z-10">
          {" "}
          {/* 💡 Added z-10 */}
          <CheckCircle size={24} />
        </div>
      )}

      <div className="space-y-4">
        {/* Title & Instructions */}
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-white font-mono group-hover:gradient-text transition-all duration-300">
            {title}
          </h3>
          {instructions && (
            <p className="text-white/70 text-sm leading-relaxed">
              {instructions}
            </p>
          )}
          {/* 💡 MODIFIED: Display Difficulty and Points */}
          <div className="flex items-center space-x-4 text-white/50 text-xs">
            {difficulty && (
              <div className="flex items-center space-x-1">
                <span>Difficulty:</span>
                <span
                  className={`font-medium ${getDifficultyColor(difficulty)}`}
                >
                  {difficulty}
                </span>
              </div>
            )}
            {points > 0 && ( // Only show points if > 0
              <div className="flex items-center space-x-1">
                <Trophy size={14} className="text-yellow-400" />{" "}
                {/* Trophy icon for points */}
                <span className="font-medium text-yellow-300">
                  {points} pts
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Start Button links to challenge page */}
        <Link href={`/challenges/${id}`} passHref>
          <Button className="w-full bg-gradient-to-r from-[#4cc9f0] to-[#06ffa5] hover:from-[#06ffa5] hover:to-[#4cc9f0] text-[#0f172a] font-semibold py-2.5 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-[#4cc9f0]/30">
            {isCompleted ? "View Solution" : "Start"}{" "}
            {/* 💡 MODIFIED: Button text changes if completed */}
          </Button>
        </Link>
      </div>
    </div>
  );
}
