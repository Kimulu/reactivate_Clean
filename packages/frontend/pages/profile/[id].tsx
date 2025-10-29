// pages/profile/[id].tsx

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { apiClient, UserInfo } from "@/utils/apiClient";
import toast from "react-hot-toast";
import { Sidebar } from "@/components/Sidebar";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { Trophy, Loader2 } from "lucide-react"; // Added Loader2 for a better loading state

export default function ProfilePage() {
  const router = useRouter();
  const { id } = router.query;
  const [userProfileData, setUserProfileData] = useState<UserInfo | null>(null);
  const reduxUser = useSelector((state: RootState) => state.user);
  const [loading, setLoading] = useState(true); // Added a dedicated loading state

  useEffect(() => {
    if (!id || typeof id !== "string") {
      setLoading(false);
      return;
    }

    async function fetchUser() {
      setLoading(true);
      try {
        const data: UserInfo = await apiClient.getUserById(id);
        setUserProfileData(data);
      } catch (err: any) {
        toast.error(err.message || "Failed to load profile.");
        // Optional: Redirect if the profile doesn't exist or there's an auth error
        // router.push("/dashboard");
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [id, router]);

  // ✅ IMPROVED LOADING STATE
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#0f0f23]">
        <Sidebar />
        <div className="flex h-screen items-center justify-center p-4 pt-24 text-white md:ml-64 md:p-8 md:pt-8">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin text-[#06ffa5]" />
            <span>Loading Profile...</span>
          </div>
        </div>
      </div>
    );
  }

  // ✅ IMPROVED NOT FOUND / ERROR STATE
  if (!userProfileData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#0f0f23]">
        <Sidebar />
        <div className="p-4 pt-24 text-center text-white md:ml-64 md:p-8 md:pt-8">
          <p className="text-xl text-red-500">Profile not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#0f0f23] font-saira">
      <Sidebar />
      {/* ✅ CORRECTED MAIN CONTENT WRAPPER */}
      <div className="p-4 pt-24 text-white md:ml-64 md:p-8 md:pt-8">
        {/* ✅ RESPONSIVE HEADER */}
        <h1 className="mb-6 border-b border-white/10 pb-2 text-3xl font-bold text-[#06ffa5] sm:text-4xl">
          {userProfileData.username}'s Profile
        </h1>

        {/* ✅ RESPONSIVE PROFILE CARD */}
        <div className="mt-8 rounded-xl border border-white/10 bg-[#1a1a2e]/80 p-6 shadow-2xl sm:p-8">
          <div className="space-y-4">
            <p className="text-lg text-white">
              <strong className="text-[#06ffa5]">Username:</strong>{" "}
              {userProfileData.username}
            </p>
            <p className="text-lg text-white">
              <strong className="text-[#06ffa5]">Email:</strong>{" "}
              {userProfileData.email || "N/A"}
            </p>
            <p className="flex items-center space-x-2 text-lg text-white">
              <strong className="text-[#06ffa5]">Total Points:</strong>{" "}
              <Trophy size={20} className="text-yellow-400" />
              <span className="font-bold text-yellow-300">
                {/* Logic to show Redux points for the logged-in user remains the same */}
                {reduxUser.id === userProfileData.id
                  ? reduxUser.totalPoints
                  : userProfileData.totalPoints}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
