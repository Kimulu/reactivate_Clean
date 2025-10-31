import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { CheckCircle, Trophy } from "lucide-react";

interface ChallengeCardProps {
  id: string;
  title: string;
  instructions: string;
  difficulty?: "easy" | "medium" | "hard";
  isCompleted?: boolean;
  points: number;
  layout?: "grid" | "list"; // 🔹 New prop
}

export function ChallengeCard({
  id,
  title,
  instructions,
  difficulty,
  isCompleted = false,
  points,
  layout = "grid", // 🔹 Default layout
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
    <div
      className={`relative bg-gradient-to-br from-[#1a1a2e]/80 to-[#0f0f23]/80 backdrop-blur-sm border border-white/10 rounded-xl hover:border-[#4cc9f0]/50 transition-all duration-300 group hover:shadow-lg hover:shadow-[#4cc9f0]/20 ${
        layout === "list"
          ? "flex items-center space-x-6 p-4"
          : "p-6 flex flex-col"
      }`}
    >
      {isCompleted && (
        <div className="absolute top-3 right-3 text-[#06ffa5] z-10">
          <CheckCircle size={24} />
        </div>
      )}

      <div
        className={`${layout === "list" ? "flex-1 space-y-2" : "space-y-4"}`}
      >
        <h3 className="text-xl text-white font-saira group-hover:gradient-text transition-all duration-300">
          {title}
        </h3>

        {instructions && (
          <p className="text-white/70 text-sm leading-relaxed font-saira line-clamp-3">
            {instructions}
          </p>
        )}

        <div className="flex items-center space-x-4 text-white/50 text-xs">
          {difficulty && (
            <div className="flex items-center space-x-1">
              <span>Difficulty:</span>
              <span className={`font-saira ${getDifficultyColor(difficulty)}`}>
                {difficulty}
              </span>
            </div>
          )}
          {points > 0 && (
            <div className="flex items-center space-x-1">
              <Trophy size={14} className="text-yellow-400" />
              <span className="font-saira text-yellow-300">{points} pts</span>
            </div>
          )}
        </div>
      </div>

      <div className={`${layout === "list" ? "ml-auto" : "mt-4"}`}>
        <Link href={`/challenges/${id}`} passHref>
          <Button className="bg-gradient-to-r from-[#4cc9f0] to-[#06ffa5] hover:from-[#06ffa5] hover:to-[#4cc9f0] text-[#0f172a] font-saira py-2.5 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-[#4cc9f0]/30">
            {isCompleted ? "View Solution" : "Start"}
          </Button>
        </Link>
      </div>
    </div>
  );
}
