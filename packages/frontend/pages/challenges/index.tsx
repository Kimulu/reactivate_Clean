// pages/challenges/index.tsx
import { Sidebar } from "@/components/Sidebar";
import { ChallengeCard } from "@/components/common/ChallengeCard";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useEffect, useState } from "react";
import {
  apiClient,
  Challenge,
  CompletedChallengeInfo,
} from "@/utils/apiClient";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { setAllChallenges } from "@/store/challengeSlice"; // 💡 NEW: Import setAllChallenges

export default function Dashboard() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completedChallengesInfo, setCompletedChallengesInfo] = useState<
    CompletedChallengeInfo[]
  >([]);

  // 💡 NEW: Access the full user object from Redux for authentication status
  const user = useSelector((state: RootState) => state.user);
  // We still use user.totalPoints from Redux as a dependency for re-fetching
  const userTotalPoints = user.totalPoints;
  const isLoggedIn = !!user.id; // 💡 NEW: A clear flag for login status
  const dispatch = useDispatch(); // 💡 NEW: Initialize Redux dispatch

  console.log("Dashboard - User Total Points from Redux:", userTotalPoints); // For debugging

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all challenges (public)
        const challengesData: Challenge[] = await apiClient.getChallenges();
        setChallenges(challengesData);
        dispatch(setAllChallenges(challengesData)); // 💡 NEW: Dispatch to Redux

        // 💡 CRITICAL FIX: Only fetch completed challenges if the user is logged in
        if (isLoggedIn) {
          const completedInfo: CompletedChallengeInfo[] =
            await apiClient.getCompletedChallenges();
          setCompletedChallengesInfo(completedInfo);
          console.log("Completed Challenge Info:", completedInfo);
        } else {
          // If not logged in, ensure completed challenges state is empty
          setCompletedChallengesInfo([]);
          console.log(
            "Not logged in, skipping fetch for completed challenges."
          );
        }
      } catch (err: any) {
        console.error("Failed to fetch dashboard data:", err);
        // Only show error if we were actually trying to fetch protected data while logged in
        if (isLoggedIn) {
          setError(
            err.message || "Failed to load challenges or completion status."
          );
          toast.error(
            err.message || "Failed to load challenges or completion status."
          );
        } else {
          // If not logged in, and error occurs for public challenges, still show
          setError(err.message || "Failed to load challenges.");
          toast.error(err.message || "Failed to load challenges.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    // 💡 MODIFIED: Depend on `isLoggedIn` to re-run when auth status changes
    // `userTotalPoints` is still a good dependency for re-fetching points-related data
  }, [isLoggedIn, userTotalPoints, dispatch]);

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

          {/* Loading, Error, and No Challenges states */}
          {loading && (
            <div className="text-center text-white py-8 flex justify-center items-center">
              <Loader2 className="animate-spin text-[#06ffa5] w-6 h-6 mr-2" />{" "}
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
          {!loading && !error && challenges.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {challenges.map((challenge) => (
                <ChallengeCard
                  key={challenge.id}
                  {...challenge}
                  isCompleted={completedChallengesInfo.some(
                    (info) => info.challengeId === challenge.id
                  )}
                  points={challenge.points}
                />
              ))}
            </div>
          )}

          {/* Coming Soon Section - (Remains unchanged) */}
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
