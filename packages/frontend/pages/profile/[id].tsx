// pages/profile/[id].tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
// 💡 FIX: Import the correctly named export
import { apiClient } from "@/utils/apiClient";
import toast from "react-hot-toast";

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
    if (!id || typeof id !== "string") return;

    async function fetchUser() {
      try {
        // 💡 FIX: Using the explicit function and passing the ID
        const data = await apiClient.getUserById(id); // The data received here is the secure user object from userRoutes.js
        setUser(data);
      } catch (err: any) {
        console.error("Error fetching user:", err);
        toast.error(err.message || "Failed to load profile."); // Optionally redirect to login if token failed
        // router.push('/login');
      }
    }

    fetchUser();
  }, [id, router]);

  if (!user) return <p className="p-6 text-white">Loading...</p>;

  return (
    <div className="p-6 ml-64 text-white">
           {" "}
      <h1 className="text-3xl font-extrabold mb-4 border-b pb-2 border-white/10">
        {user.username}'s Profile
      </h1>
           {" "}
      <div className="mt-4 bg-[#1a1a2e]/80 p-6 rounded-lg shadow-xl border border-white/10">
               {" "}
        <p className="text-white/80 mb-2">
                    <strong>Username:</strong>{" "}
          <span className="text-[#06ffa5]">{user.username}</span>       {" "}
        </p>
        <p className="text-white/80 mb-2">
                    <strong>Email:</strong> {user.email || "N/A"}       {" "}
        </p>
               {" "}
        <p className="text-white/80">
                    <strong>User ID:</strong>{" "}
          <span className="font-mono text-sm break-all">{user._id}</span>       {" "}
        </p>
             {" "}
      </div>
         {" "}
    </div>
  );
}
