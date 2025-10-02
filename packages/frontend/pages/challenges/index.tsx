// pages/challenges/index.tsx
import { Sidebar } from "@/components/Sidebar";
import { ChallengeCard } from "@/components/common/ChallengeCard";
import { challenges } from "@/data/challenges";
import { ProtectedRoute } from "@/components/ProtectedRoute"; // 👈 NEW IMPORT

export default function Dashboard() {
  return (
    <ProtectedRoute>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: "Context API Challenge", difficulty: "Hard" },
                { title: "Custom Hooks Challenge", difficulty: "Medium" },
                { title: "Performance Optimization", difficulty: "Hard" },
              ].map((challenge, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-[#1a1a2e]/40 to-[#0f0f23]/40 backdrop-blur-sm border border-white/5 rounded-xl p-6 opacity-60"
                >
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-white/70 font-mono">
                        {challenge.title}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-white/30">
                          Difficulty:
                        </span>
                        <span className="text-xs font-medium text-white/50">
                          {challenge.difficulty}
                        </span>
                      </div>
                    </div>

                    <div className="w-full bg-white/5 text-white/40 font-semibold py-2.5 rounded-lg text-center border border-white/10">
                      Coming Soon
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
