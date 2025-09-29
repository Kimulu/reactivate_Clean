import Link from "next/link";
import { Button } from "@/components/ui/Button";

interface ChallengeCardProps {
  id: string;
  title: string;
  instructions: string;
  difficulty?: "Easy" | "Medium" | "Hard";
}

export function ChallengeCard({
  id,
  title,
  instructions,
  difficulty,
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
    <div className="bg-gradient-to-br from-[#1a1a2e]/80 to-[#0f0f23]/80 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-[#4cc9f0]/50 transition-all duration-300 group hover:shadow-lg hover:shadow-[#4cc9f0]/20">
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
          {difficulty && (
            <div className="flex items-center space-x-2">
              <span className="text-xs text-white/50">Difficulty:</span>
              <span
                className={`text-xs font-medium ${getDifficultyColor(
                  difficulty
                )}`}
              >
                {difficulty}
              </span>
            </div>
          )}
        </div>

        {/* Start Button links to challenge page */}
        <Link href={`/challenges/${id}`} passHref>
          <Button className="w-full bg-gradient-to-r from-[#4cc9f0] to-[#06ffa5] hover:from-[#06ffa5] hover:to-[#4cc9f0] text-[#0f0f23] font-semibold py-2.5 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-[#4cc9f0]/30">
            Start
          </Button>
        </Link>
      </div>
    </div>
  );
}
