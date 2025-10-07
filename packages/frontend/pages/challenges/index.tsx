// pages/challenges/index.tsx
import { Sidebar } from "@/components/Sidebar";
import { ChallengeCard } from "@/components/common/ChallengeCard";
// 💡 REMOVED: import { challenges } from "@/data/challenges";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useEffect, useState } from "react"; // 💡 NEW: Import useEffect and useState
import { apiClient } from "@/utils/apiClient"; // 💡 NEW: Import apiClient
import toast from "react-hot-toast"; // 💡 NEW: Import toast for error messages

// 💡 NEW: Define Challenge type to match backend response structure
interface ChallengeFile {
  code: string;
  active?: boolean;
  hidden?: boolean;
}

interface Challenge {
  _id: string; // MongoDB's ID
  id: string; // Your custom challenge ID (e.g., "fragments")
  title: string;
  difficulty: string;
  instructions: string;
  files: { [key: string]: ChallengeFile };
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export default function Dashboard() {
  const [challenges, setChallenges] = useState<Challenge[]>([]); // 💡 NEW: State to store fetched challenges
  const [loading, setLoading] = useState(true); // 💡 NEW: Loading state
  const [error, setError] = useState<string | null>(null); // 💡 NEW: Error state

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        setLoading(true);
        setError(null);
        const data: Challenge[] = await apiClient.getChallenges(); // 💡 NEW: Fetch challenges from backend
        setChallenges(data);
      } catch (err: any) {
        console.error("Failed to fetch challenges:", err);
        setError(err.message || "Failed to load challenges.");
        toast.error(err.message || "Failed to load challenges.");
      } finally {
        setLoading(false);
      }
    };

    fetchChallenges();
  }, []); // Empty dependency array means this runs once on mount

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

          {/* 💡 NEW: Loading, Error, and No Challenges states */}
          {loading && (
            <div className="text-center text-white py-8">
              Loading challenges...
            </div>
          )}

          {error && (
            <div className="text-center text-red-500 py-8">Error: {error}</div>
          )}

          {!loading && !error && challenges.length === 0 && (
            <div className="text-center text-gray-400 py-8">
              No challenges found.
            </div>
          )}

          {/* Challenges Grid */}
          {!loading &&
            !error &&
            challenges.length > 0 && ( // 💡 NEW: Only render if not loading and no error
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {challenges.map((challenge) => (
                  // 💡 MODIFIED: ChallengeCard now receives challenge data from state
                  <ChallengeCard key={challenge.id} {...challenge} />
                ))}
              </div>
            )}

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
