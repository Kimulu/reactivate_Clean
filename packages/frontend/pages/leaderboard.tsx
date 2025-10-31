// pages/leaderboard/index.tsx

import { Sidebar } from "@/components/Sidebar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useEffect, useState } from "react";
import { apiClient, LeaderboardEntry } from "@/utils/apiClient";
import toast from "react-hot-toast";
import { Loader2, Trophy } from "lucide-react";

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
      } catch (err: unknown) {
        const message =
          typeof err === "object" &&
          err !== null &&
          "message" in err &&
          typeof (err as { message?: unknown }).message === "string"
            ? (err as { message: string }).message
            : "Failed to load leaderboard.";
        setError(message);
        toast.error(message);
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

        {/* ✅ CORRECTED MAIN CONTENT WRAPPER */}
        <div className="p-4 pt-24 text-white md:ml-64 md:p-8 md:pt-8">
          {/* ✅ RESPONSIVE HEADER */}
          <h1 className="mb-8 border-b border-white/10 pb-4 text-center font-saira text-3xl font-bold text-[#06ffa5] sm:text-4xl">
            Leaderboard
          </h1>

          {loading && (
            <div className="flex items-center justify-center py-8 text-center text-white">
              <Loader2 className="mr-2 h-6 w-6 animate-spin text-[#06ffa5]" />
              <span className="font-saira">Loading Leaderboard...</span>
            </div>
          )}

          {error && (
            <div className="py-8 text-center text-red-500">Error: {error}</div>
          )}

          {!loading && !error && leaderboard.length === 0 && (
            <div className="py-8 text-center font-saira text-gray-400">
              No users on the leaderboard yet.
            </div>
          )}

          {!loading && !error && leaderboard.length > 0 && (
            <div className="font-saira">
              {/* ▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼ DESKTOP TABLE VIEW ▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼ */}
              <div className="hidden overflow-x-auto rounded-xl border border-white/10 bg-[#1a1a2e]/80 p-4 shadow-2xl md:block">
                <table className="min-w-full divide-y divide-white/10">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/70">
                        Rank
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/70">
                        Username
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/70">
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
                        className="transition-colors duration-150 hover:bg-white/5"
                      >
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-white">
                          {index + 1}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-300">
                          {entry.username}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-yellow-300">
                          {entry.totalPoints}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲ END DESKTOP TABLE VIEW ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲ */}

              {/* ▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼ MOBILE CARD VIEW ▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼▼ */}
              <div className="space-y-3 md:hidden">
                {leaderboard.map((entry, index) => (
                  <div
                    key={entry.username}
                    className="flex items-center justify-between rounded-lg border border-white/10 bg-[#1a1a2e]/80 p-4 shadow-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <span className="text-xl font-bold text-white/80">
                        #{index + 1}
                      </span>
                      <span className="font-semibold text-gray-300">
                        {entry.username}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 rounded-full bg-yellow-500/10 px-3 py-1 text-sm font-bold text-yellow-300">
                      <Trophy size={14} />
                      <span>{entry.totalPoints}</span>
                    </div>
                  </div>
                ))}
              </div>
              {/* ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲ END MOBILE CARD VIEW ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲ */}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
