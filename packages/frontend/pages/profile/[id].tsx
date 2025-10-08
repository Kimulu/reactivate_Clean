// pages/profile/[id].tsx

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
// 💡 MODIFIED: Import UserInfo from apiClient for consistency
import { apiClient, UserInfo } from "@/utils/apiClient";
import toast from "react-hot-toast";
import { Sidebar } from "@/components/Sidebar";
// 💡 NEW IMPORT: useSelector from Redux for totalPoints
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { Trophy } from "lucide-react";

// 💡 MODIFIED: Use UserInfo directly for the profile user data
// Or, if you specifically want a property named '_id' distinct from 'id'
// then you'd need to modify your backend to return both.
// For now, we'll align with the backend's 'id' field being the primary identifier.
interface ProfileUserDisplayInfo extends UserInfo {
  // If your backend still sends a literal '_id' field AND an 'id' field,
  // then you would include it here.
  // For current backend, UserInfo's 'id' IS the MongoDB '_id'.
}

export default function ProfilePage() {
  const router = useRouter();
  const { id } = router.query;
  // 💡 MODIFIED: Use the new interface and clearer state name
  const [userProfileData, setUserProfileData] =
    useState<ProfileUserDisplayInfo | null>(null);

  // Get total points from Redux store for consistency with Sidebar/Challenges page
  const reduxUser = useSelector((state: RootState) => state.user);

  useEffect(() => {
    if (!id || typeof id !== "string") return;

    async function fetchUser() {
      try {
        // Fetch the user data using the protected route
        const data: UserInfo = await apiClient.getUserById(id);
        // 💡 FIX: Set the state with the data directly from apiClient,
        // which matches the UserInfo interface.
        // The 'id' property in 'data' IS the user's MongoDB ID.
        setUserProfileData(data);
      } catch (err: any) {
        console.error("Error fetching user:", err);
        toast.error(
          err.message || "Failed to load profile. Please log in again."
        );
        router.push("/Login");
      }
    }

    fetchUser();
  }, [id, router]);

  // 💡 MODIFIED: Check for userProfileData
  if (!userProfileData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#0f0f23]">
        <Sidebar />
        <p className="ml-64 p-8 text-white">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#0f0f23]">
      <Sidebar />
      <div className="ml-64 p-8 text-white">
        <h1 className="text-4xl font-extrabold mb-6 border-b pb-2 border-white/10 font-mono text-[#06ffa5]">
          {userProfileData.username}'s Profile
        </h1>

        <div className="mt-8 bg-[#1a1a2e]/80 p-8 rounded-xl shadow-2xl border border-white/10">
          <div className="space-y-4">
            <p className="text-white text-lg">
              <strong className="text-[#06ffa5]">Username:</strong>{" "}
              {userProfileData.username}
            </p>
            <p className="text-white text-lg">
              <strong className="text-[#06ffa5]">Email:</strong>{" "}
              {userProfileData.email || "N/A"}
            </p>
            {/* 💡 MODIFIED: Display Total Points - use reduxUser if it's the current user,
                                       else use fetched userProfileData.totalPoints */}
            <p className="text-white text-lg flex items-center space-x-2">
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
