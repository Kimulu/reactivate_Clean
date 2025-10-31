// pages/profile/[id].tsx

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { apiClient, UserInfo } from "@/utils/apiClient";
import toast from "react-hot-toast";
import { Sidebar } from "@/components/Sidebar";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { Trophy, Loader2 } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const { id } = router.query;
  const [userProfileData, setUserProfileData] = useState<UserInfo | null>(null);
  const reduxUser = useSelector((state: RootState) => state.user);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      // ✅ Proper runtime type check
      if (!id || Array.isArray(id)) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const data: UserInfo = await apiClient.getUserById(id); // ✅ Now always a string
        setUserProfileData(data);
      } catch (err: unknown) {
        const message =
          typeof err === "object" &&
          err !== null &&
          "message" in err &&
          typeof (err as { message?: unknown }).message === "string"
            ? (err as { message: string }).message
            : "Failed to load profile.";
        toast.error(message);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [id]);

  // ✅ Loading State
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

  // ✅ Not Found State
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
      <div className="p-4 pt-24 text-white md:ml-64 md:p-8 md:pt-8">
        <h1 className="mb-6 border-b border-white/10 pb-2 text-3xl font-bold text-[#06ffa5] sm:text-4xl">
          {userProfileData.username}&apos;s Profile
        </h1>

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
