// pages/dashboard/index.tsx

import { Sidebar } from "@/components/Sidebar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useRouter } from "next/router";
import {
  ArrowRight,
  CodeSquare,
  Star,
  Trophy,
  CheckCircle2,
  Zap,
  Loader2,
} from "lucide-react";
import { apiClient } from "@/utils/apiClient";
import toast from "react-hot-toast";

export default function DashboardPage() {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.user);

  const [challengesCompletedCount, setChallengesCompletedCount] = useState(0);
  const [userHighestScore, setUserHighestScore] = useState(0);
  const [lastChallengeAttemptedId, setLastChallengeAttemptedId] = useState<
    string | null
  >(null);
  const [lastChallengeAttemptedTitle, setLastChallengeAttemptedTitle] =
    useState<string | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(true);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  // --- Data fetching logic (no changes needed) ---
  useEffect(() => {
    const fetchDashboardMetrics = async () => {
      if (!user.id) {
        setIsDataLoading(false);
        return;
      }
      setIsDataLoading(true);
      try {
        const completedChallenges = await apiClient.getCompletedChallenges();
        setChallengesCompletedCount(completedChallenges.length);
        const highestScoreData = await apiClient.getHighestChallengeScore(
          user.id
        );
        setUserHighestScore(highestScoreData.highestScore);
        if (completedChallenges.length > 0) {
          const lastCompletedId = completedChallenges[0].challengeId;
          const lastCompletedChallenge = await apiClient.getChallengeById(
            lastCompletedId
          );
          setLastChallengeAttemptedId(lastCompletedId);
          setLastChallengeAttemptedTitle(lastCompletedChallenge.title);
        } else {
          setLastChallengeAttemptedTitle("No challenges attempted yet.");
        }
      } catch (err: any) {
        toast.error(err.message || "Failed to load dashboard metrics.");
      } finally {
        setIsDataLoading(false);
      }
    };
    fetchDashboardMetrics();
  }, [user.id, user.totalPoints]);

  const handleContinueSession = () => {
    if (lastChallengeAttemptedId) {
      router.push(`/challenges/${lastChallengeAttemptedId}`);
    } else {
      router.push("/challenges");
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#0f0f23]">
        <Sidebar />

        {/* ✅ CORRECTED MAIN CONTENT WRAPPER */}
        <div className="p-4 pt-24 text-white md:ml-64 md:p-8 md:pt-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            {/* ✅ RESPONSIVE HEADER TEXT */}
            <h1 className="font-saira text-3xl text-white sm:text-4xl">
              Dashboard
            </h1>
          </div>

          {isDataLoading ? (
            <div className="flex items-center justify-center py-16 text-center">
              <Loader2 className="mr-2 h-8 w-8 animate-spin text-[#06ffa5]" />
              Loading Dashboard Data...
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* "Continue Session" Card */}
              <div className="relative flex flex-col justify-between overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-[#1a1a2e]/80 to-[#0f0f23]/80 p-6 shadow-2xl lg:col-span-2">
                <div className="pointer-events-none absolute inset-0 flex items-center justify-end opacity-30">
                  <CodeSquare
                    size={120}
                    className="translate-x-1/4 translate-y-1/4 text-[#06ffa5] opacity-50"
                  />
                </div>

                <h2 className="relative z-10 mb-4 font-saira text-2xl sm:text-3xl">
                  {getGreeting()}, {user.username || "Guest"}
                </h2>

                {/* ✅ RESPONSIVE CONTINUE SECTION */}
                <div className="relative z-10 mt-auto flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="flex flex-col text-gray-300 sm:flex-row sm:items-center sm:space-x-2">
                    <span>Continue with:</span>
                    <span className="truncate font-saira text-[#4cc9f0]">
                      {lastChallengeAttemptedTitle || "Explore Challenges"}
                    </span>
                  </p>
                  <button
                    onClick={handleContinueSession}
                    className="flex items-center justify-center space-x-2 rounded-lg bg-[#06ffa5] px-6 py-3 font-saira text-[#0f0f23] transition-colors duration-200 hover:bg-[#04cc83]"
                  >
                    <span>Let's Go</span>
                    <ArrowRight size={20} />
                  </button>
                </div>
              </div>

              {/* Metrics Cards Grid (Already responsive) */}
              <div className="grid grid-cols-1 gap-6 lg:col-span-1">
                <div className="rounded-xl border border-white/10 bg-gradient-to-br from-[#1a1a2e]/80 to-[#0f0f23]/80 p-6 shadow-2xl">
                  <h3 className="mb-2 font-saira text-lg text-white/80">
                    Total Points Earned
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="font-saira text-4xl text-[#06ffa5]">
                      {user.totalPoints}
                    </span>
                    <Trophy size={32} className="text-yellow-400" />
                  </div>
                </div>
                <div className="rounded-xl border border-white/10 bg-gradient-to-br from-[#1a1a2e]/80 to-[#0f0f23]/80 p-6 shadow-2xl">
                  <h3 className="mb-2 font-saira text-lg text-white/80">
                    Challenges Completed
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="font-saira text-4xl text-[#4cc9f0]">
                      {challengesCompletedCount}
                    </span>
                    <CheckCircle2 size={32} className="text-[#4cc9f0]" />
                  </div>
                </div>
                <div className="rounded-xl border border-white/10 bg-gradient-to-br from-[#1a1a2e]/80 to-[#0f0f23]/80 p-6 shadow-2xl">
                  <h3 className="mb-2 font-saira text-lg text-white/80">
                    Highest Challenge Score
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="font-saira text-4xl text-[#f72585]">
                      {userHighestScore}
                    </span>
                    <Zap size={32} className="text-[#f72585]" />
                  </div>
                </div>
              </div>

              {/* "Upgrade to Pro" Card */}
              {/* ✅ RESPONSIVE UPGRADE CARD */}
              <div className="mt-6 flex flex-col items-center justify-between gap-4 rounded-xl bg-gradient-to-r from-[#06ffa5] to-[#4cc9f0] p-6 text-center shadow-2xl lg:col-span-3 sm:flex-row sm:p-8 sm:text-left">
                <div>
                  <h2 className="mb-2 font-saira text-2xl text-[#0f0f23] sm:text-3xl">
                    Upgrade to Pro
                  </h2>
                  <p className="text-lg text-[#0f0f23]/80">
                    Unlock advanced features and more challenges!
                  </p>
                </div>
                <button className="flex w-full items-center justify-center space-x-2 rounded-lg bg-[#0f0f23]/80 px-6 py-3 font-saira text-white transition-colors duration-200 hover:bg-[#0f0f23] hover:text-[#06ffa5] sm:w-auto sm:flex-shrink-0">
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
