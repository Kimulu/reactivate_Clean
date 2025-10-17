// pages/leaderboard/index.tsx

import { Sidebar } from "@/components/Sidebar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useEffect, useState } from "react";
import { apiClient, LeaderboardEntry } from "@/utils/apiClient"; // 💡 NEW: Import LeaderboardEntry
import toast from "react-hot-toast";
import { Loader2, Trophy } from "lucide-react"; // 💡 NEW: Trophy icon

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        setError(null);
        const data: LeaderboardEntry[] = await apiClient.getLeaderboard();
        setLeaderboard(data);
      } catch (err: any) {
        console.error("Error fetching leaderboard:", err);
        setError(err.message || "Failed to load leaderboard.");
        toast.error(err.message || "Failed to load leaderboard.");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#0f0f23]">
        <Sidebar />

        <div className="ml-64 p-8 text-white">
          <h1 className="text-4xl font-extrabold mb-8 border-b pb-4 border-white/10 font-mono text-[#06ffa5] text-center">
            Leaderboard
          </h1>

          {loading && (
            <div className="text-center text-white py-8 flex justify-center items-center">
              <Loader2 className="animate-spin text-[#06ffa5] w-6 h-6 mr-2" />{" "}
              Loading Leaderboard...
            </div>
          )}

          {error && (
            <div className="text-center text-red-500 py-8">Error: {error}</div>
          )}

          {!loading && !error && leaderboard.length === 0 && (
            <div className="text-center text-gray-400 py-8">
              No users on the leaderboard yet.
            </div>
          )}

          {!loading && !error && leaderboard.length > 0 && (
            <div className="overflow-x-auto bg-[#1a1a2e]/80 rounded-xl shadow-2xl border border-white/10 p-4">
              <table className="min-w-full divide-y divide-white/10">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                      Username
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                      <div className="flex items-center space-x-1">
                        <Trophy size={16} className="text-yellow-400" />
                        <span>Points</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {leaderboard.map((entry, index) => (
                    <tr
                      key={entry.username}
                      className="hover:bg-white/5 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {entry.username}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-yellow-300">
                        {entry.totalPoints}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
