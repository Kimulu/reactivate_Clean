// pages/challenges/index.tsx
import { Sidebar } from "@/components/Sidebar";
import { ChallengeCard } from "@/components/common/ChallengeCard";
import { challenges } from "@/data/challenges";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#0f0f23]">
      <Sidebar />

      {/* Main content */}
      <div className="ml-64 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 font-mono">
            Coding Challenges
          </h1>
          <p className="text-white/60 text-lg">
            Master React concepts through hands-on coding challenges
          </p>
        </div>

        {/* Challenges Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {challenges.map((challenge) => (
            <ChallengeCard key={challenge.id} {...challenge} />
          ))}
        </div>

        {/* Coming Soon Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-white mb-6 font-mono gradient-text">
            Coming Soon
          </h2>
        </div>
      </div>
    </div>
  );
}
