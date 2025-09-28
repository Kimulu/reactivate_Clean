import React from "react";

// Define the type for the challenge prop
interface Challenge {
  id: number;
  title: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

interface ChallengeCardProps {
  challenge: Challenge;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({ challenge }) => {
  return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-md transition-transform transform hover:scale-105">
      <h3 className="text-xl font-semibold mb-2">{challenge.title}</h3>
      <p className="text-gray-400 mb-4">{challenge.description}</p>
      <div className="flex items-center justify-between">
        <span
          className={`text-sm font-medium ${
            challenge.difficulty === "Easy"
              ? "text-green-400"
              : challenge.difficulty === "Medium"
              ? "text-yellow-400"
              : "text-red-400"
          }`}
        >
          {challenge.difficulty}
        </span>
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full transition-colors">
          Start
        </button>
      </div>
    </div>
  );
};

export default ChallengeCard;
