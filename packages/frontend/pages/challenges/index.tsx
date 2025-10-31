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
import { Loader2, LayoutGrid, LayoutList } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { setAllChallenges } from "@/store/challengeSlice";
import { Button } from "@/components/ui/Button";

export default function Dashboard() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completedChallengesInfo, setCompletedChallengesInfo] = useState<
    CompletedChallengeInfo[]
  >([]);

  const [difficultyFilter, setDifficultyFilter] = useState("All");
  const [layout, setLayout] = useState<"grid" | "list">("grid"); // 💡 New layout state

  const user = useSelector((state: RootState) => state.user);
  const userTotalPoints = user.totalPoints;
  const isLoggedIn = !!user.id;
  const dispatch = useDispatch();

  // 💡 Load layout preference from localStorage
  useEffect(() => {
    const savedLayout = localStorage.getItem("challengeLayout");
    if (savedLayout === "grid" || savedLayout === "list") {
      setLayout(savedLayout);
    }
  }, []);

  // 💡 Save layout preference
  useEffect(() => {
    localStorage.setItem("challengeLayout", layout);
  }, [layout]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const challengesData: Challenge[] = await apiClient.getChallenges();
        setChallenges(challengesData);
        dispatch(setAllChallenges(challengesData));

        if (isLoggedIn) {
          const completedInfo: CompletedChallengeInfo[] =
            await apiClient.getCompletedChallenges();
          setCompletedChallengesInfo(completedInfo);
        } else {
          setCompletedChallengesInfo([]);
        }
      } catch (err: any) {
        console.error("Failed to fetch dashboard data:", err);
        const msg =
          err.message || "Failed to load challenges or completion status.";
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isLoggedIn, userTotalPoints, dispatch]);

  // 💡 Filter challenges
  const filteredChallenges = challenges.filter((challenge) => {
    if (difficultyFilter === "All") return true;
    return (
      challenge.difficulty?.toLowerCase() === difficultyFilter.toLowerCase()
    );
  });

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#0f0f23]">
        <Sidebar />

        <div className="p-8 pt-24 md:ml-64 md:pt-8">
          {/* ===== HEADER SECTION ===== */}
          <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-saira text-white mb-2">
                Coding Challenges
              </h1>
              <p className="text-white/60 text-lg font-saira">
                Master React concepts through hands-on coding challenges
              </p>
            </div>

            {/* 🔹 Mini Navbar Controller */}
            <div className="hidden md:flex items-center space-x-4 bg-[#1a1a2e]/60 border border-white/10 rounded-xl p-2 backdrop-blur-sm">
              {/* Difficulty Filter */}
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="bg-transparent text-white border border-white/10 rounded-lg px-3 py-2 font-saira text-sm focus:outline-none focus:ring-1 focus:ring-[#06ffa5]"
              >
                <option value="All">All</option>
                <option value="Easy" className="text-black">
                  Easy
                </option>
                <option value="Medium" className="text-black">
                  Medium
                </option>
                <option value="Hard" className="text-black">
                  Hard
                </option>
              </select>

              {/* Layout Toggle Buttons */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setLayout("grid")}
                  className={`p-2 rounded-lg ${
                    layout === "grid"
                      ? "bg-[#4cc9f0]/20 border border-[#4cc9f0]/40"
                      : "text-white/50"
                  }`}
                >
                  <LayoutGrid size={20} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setLayout("list")}
                  className={`p-2 rounded-lg ${
                    layout === "list"
                      ? "bg-[#4cc9f0]/20 border border-[#4cc9f0]/40"
                      : "text-white/50"
                  }`}
                >
                  <LayoutList size={20} />
                </Button>
              </div>
            </div>
          </div>

          {/* ===== CHALLENGE LIST ===== */}
          {loading && (
            <div className="text-center text-white py-8 flex justify-center items-center">
              <Loader2 className="animate-spin text-[#06ffa5] w-6 h-6 mr-2" />
              Loading challenges...
            </div>
          )}

          {error && (
            <div className="text-center text-red-500 py-8">Error: {error}</div>
          )}

          {!loading && !error && filteredChallenges.length === 0 && (
            <div className="text-center text-gray-400 py-8">
              No{" "}
              {difficultyFilter !== "All"
                ? difficultyFilter.toLowerCase() + " "
                : ""}
              challenges found.
            </div>
          )}

          {!loading && !error && filteredChallenges.length > 0 && (
            <div
              className={`${
                layout === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "flex flex-col gap-4"
              }`}
            >
              {filteredChallenges.map((challenge) => (
                <ChallengeCard
                  key={challenge.id}
                  {...challenge}
                  layout={layout}
                  isCompleted={completedChallengesInfo.some(
                    (info) => info.challengeId === challenge.id
                  )}
                  points={challenge.points}
                />
              ))}
            </div>
          )}

          {/* ===== COMING SOON ===== */}
          <div className="mt-12">
            <h2 className="text-2xl font-saira text-white mb-6 gradient-text">
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
                      <h3 className="text-xl font-saira text-white/70">
                        {challenge.title}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-white/30 font-saira">
                          Difficulty:
                        </span>
                        <span className="text-xs font-saira text-white/50">
                          {challenge.difficulty}
                        </span>
                      </div>
                    </div>

                    <div className="w-full bg-white/5 text-white/40 font-semibold py-2.5 rounded-lg text-center border border-white/10 font-saira">
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
