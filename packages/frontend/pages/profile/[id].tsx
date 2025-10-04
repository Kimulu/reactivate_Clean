//profile/[id].tsx

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { apiClient } from "@/utils/apiClient";
import toast from "react-hot-toast";
import { Sidebar } from "@/components/Sidebar"; // 👈 IMPORT THE SIDEBAR

// Define the expected structure for type safety
interface UserProfile {
  _id: string; // The backend returns _id from the Mongoose model
  username: string;
  email: string | null;
}

export default function ProfilePage() {
  const router = useRouter();
  const { id } = router.query;
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    // If the page is not fully mounted or the ID is missing, stop
    if (!id || typeof id !== "string") return;

    async function fetchUser() {
      try {
        // Fetch the user data using the protected route
        const data = await apiClient.getUserById(id);
        setUser(data);
      } catch (err: any) {
        console.error("Error fetching user:", err);
        toast.error(
          err.message || "Failed to load profile. Please log in again."
        );
        // Redirect to login if the protected fetch fails (e.g., token expired)
        router.push("/login");
      }
    }

    fetchUser();
  }, [id, router]);

  if (!user) {
    // We render the layout wrapper and sidebar even in the loading state for consistency
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#0f0f23]">
        <Sidebar />
        <p className="ml-64 p-8 text-white">Loading profile...</p>
      </div>
    );
  }

  return (
    // 👈 Application Wrapper for consistent background
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#0f0f23]">
      <Sidebar /> {/* 👈 SIDEBAR INTEGRATED */}
      {/* Main content area, offset by the sidebar width */}
      <div className="ml-64 p-8 text-white">
        <h1 className="text-4xl font-extrabold mb-6 border-b pb-2 border-white/10 font-mono text-[#06ffa5]">
          {user.username}'s Profile
        </h1>

        <div className="mt-8 bg-[#1a1a2e]/80 p-8 rounded-xl shadow-2xl border border-white/10">
          <div className="space-y-4">
            <p className="text-white text-lg">
              <strong className="text-[#06ffa5]">Username:</strong>{" "}
              {user.username}
            </p>
            <p className="text-white text-lg">
              <strong className="text-[#06ffa5]">Email:</strong>{" "}
              {user.email || "N/A"}
            </p>
            <p className="text-white/70">
              <strong className="text-[#06ffa5]">User ID:</strong>{" "}
              <span className="font-mono text-sm break-all">{user._id}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
