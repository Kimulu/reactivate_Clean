// pages/dashboard/index.tsx

import { Sidebar } from "@/components/Sidebar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useRouter } from "next/router";
// 💡 NEW IMPORTS: Icons for UI
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  CodeSquare,
  Star,
  Trophy,
  CheckCircle2,
  MessageCircleQuestion,
  Zap,
  Loader2,
} from "lucide-react"; // 💡 MODIFIED: Changed Moon to CodeSquare, added MessageCircleQuestion
import { apiClient } from "@/utils/apiClient"; // 💡 NEW: Import apiClient
import toast from "react-hot-toast"; // 💡 NEW: Import toast

export default function DashboardPage() {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.user); // Get user data from Redux

  // 💡 NEW STATES: For fetched dashboard metrics
  const [challengesCompletedCount, setChallengesCompletedCount] = useState(0);
  const [userHighestScore, setUserHighestScore] = useState(0);
  const [lastChallengeAttemptedId, setLastChallengeAttemptedId] = useState<
    string | null
  >(null);
  const [lastChallengeAttemptedTitle, setLastChallengeAttemptedTitle] =
    useState<string | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(true); // For loading state of these metrics

  // Dynamic greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  // 💡 NEW useEffect: Fetch dynamic data for dashboard metrics
  useEffect(() => {
    const fetchDashboardMetrics = async () => {
      if (!user.id) {
        // Only fetch if user is logged in
        setIsDataLoading(false);
        return;
      }
      setIsDataLoading(true);
      try {
        // Fetch challenges completed count
        const completedChallenges = await apiClient.getCompletedChallenges();
        setChallengesCompletedCount(completedChallenges.length);

        // Fetch highest challenge score
        const highestScoreData = await apiClient.getHighestChallengeScore(
          user.id
        );
        setUserHighestScore(highestScoreData.highestScore);

        // 💡 NEW: Fetch last attempted challenge (requires a new API endpoint or logic)
        // For now, let's just get the most recently completed challenge.
        if (completedChallenges.length > 0) {
          // This is a simplified way; ideally, you'd have a backend endpoint
          // for "last attempted" which might be different from "last completed"
          const lastCompletedId = completedChallenges[0].challengeId; // Assuming first in array is newest
          const lastCompletedChallenge = await apiClient.getChallengeById(
            lastCompletedId
          );
          setLastChallengeAttemptedId(lastCompletedId);
          setLastChallengeAttemptedTitle(lastCompletedChallenge.title);
        } else {
          setLastChallengeAttemptedId(null);
          setLastChallengeAttemptedTitle("No challenges attempted yet.");
        }
      } catch (err: any) {
        console.error("Error fetching dashboard metrics:", err);
        toast.error(err.message || "Failed to load dashboard metrics.");
      } finally {
        setIsDataLoading(false);
      }
    };

    fetchDashboardMetrics();
  }, [user.id, user.totalPoints]); // Re-fetch if user logs in/out or points change

  // 💡 Dummy handler for "Let's Go" button
  const handleContinueSession = () => {
    if (lastChallengeAttemptedId) {
      router.push(`/challenges/${lastChallengeAttemptedId}`);
    } else {
      router.push("/challenges"); // Go to general challenges page if no last challenge
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#0f0f23]">
        <Sidebar />

        <div className="ml-64 p-8 text-white">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-white font-mono">
              Dashboard
            </h1>
          </div>

          {isDataLoading ? (
            <div className="text-center py-16 flex justify-center items-center">
              <Loader2 className="animate-spin text-[#06ffa5] w-8 h-8 mr-2" />{" "}
              Loading Dashboard Data...
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Top Left Card (Carousel-like structure for "Continue Session") */}
              <div className="lg:col-span-2 bg-gradient-to-br from-[#1a1a2e]/80 to-[#0f0f23]/80 p-8 rounded-xl shadow-2xl border border-white/10 relative overflow-hidden flex flex-col justify-between">
                {/* 💡 MODIFIED: Replaced bull-icon with CodeSquare */}
                <div className="absolute inset-0 opacity-30 pointer-events-none flex items-center justify-end">
                  <CodeSquare
                    size={120}
                    className="text-[#06ffa5] opacity-50 translate-x-1/4 translate-y-1/4"
                  />{" "}
                  {/* Larger, semi-transparent code icon */}
                </div>

                <h2 className="text-3xl font-semibold mb-4 relative z-10">
                  {getGreeting()}, {user.username || "Guest"}
                </h2>

                <div className="flex items-center justify-between relative z-10 mt-auto">
                  <p className="text-gray-300 flex items-center space-x-2">
                    <span>Continue with:</span>
                    <span className="font-semibold text-[#4cc9f0]">
                      {lastChallengeAttemptedTitle || "No active session"}
                    </span>
                  </p>
                  <button
                    onClick={handleContinueSession}
                    className="px-6 py-3 bg-[#06ffa5] text-[#0f0f23] font-bold rounded-lg hover:bg-[#04cc83] transition-colors duration-200 flex items-center space-x-2"
                    disabled={!lastChallengeAttemptedId} // Disable if no last challenge
                  >
                    <span>Let's Go</span>
                    <ArrowRight size={20} />
                  </button>
                </div>
              </div>

              {/* Top Right Cards (Metrics) */}
              <div className="lg:col-span-1 grid grid-cols-1 gap-6">
                {/* Total Points Card */}
                <div className="bg-gradient-to-br from-[#1a1a2e]/80 to-[#0f0f23]/80 p-6 rounded-xl shadow-2xl border border-white/10">
                  <h3 className="text-lg font-semibold text-white/80 mb-2">
                    Total Points Earned
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-4xl font-extrabold text-[#06ffa5]">
                      {user.totalPoints}
                    </span>
                    <Trophy size={32} className="text-yellow-400" />
                  </div>
                </div>

                {/* Challenges Completed Card */}
                <div className="bg-gradient-to-br from-[#1a1a2e]/80 to-[#0f0f23]/80 p-6 rounded-xl shadow-2xl border border-white/10">
                  <h3 className="text-lg font-semibold text-white/80 mb-2">
                    Challenges Completed
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-4xl font-extrabold text-[#4cc9f0]">
                      {challengesCompletedCount}
                    </span>
                    <CheckCircle2 size={32} className="text-[#4cc9f0]" />
                  </div>
                </div>

                {/* Highest Challenge Score Card */}
                <div className="bg-gradient-to-br from-[#1a1a2e]/80 to-[#0f0f23]/80 p-6 rounded-xl shadow-2xl border border-white/10">
                  <h3 className="text-lg font-semibold text-white/80 mb-2">
                    Highest Score on a Challenge
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-4xl font-extrabold text-[#f72585]">
                      {userHighestScore}
                    </span>
                    <Zap size={32} className="text-[#f72585]" />{" "}
                    {/* Using Zap for highest score */}
                  </div>
                </div>
              </div>

              {/* Bottom Card (Upgrade to Pro) */}
              <div className="lg:col-span-3 bg-gradient-to-r from-[#06ffa5] to-[#4cc9f0] p-8 rounded-xl shadow-2xl mt-6 flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-bold text-[#0f0f23] mb-2">
                    Upgrade to Pro
                  </h2>
                  <p className="text-[#0f0f23]/80 text-lg">
                    Unlock advanced features and more challenges!
                  </p>
                </div>
                <button className="px-6 py-3 bg-[#0f0f23]/80 text-white font-bold rounded-lg hover:bg-[#0f0f23] hover:text-[#06ffa5] transition-colors duration-200 flex items-center space-x-2">
                  <span>View Plans</span>
                  <Star size={20} className="text-yellow-300" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
