import { useEffect, useState } from "react";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Replace with your auth system’s current user ID
    const userId = "YOUR_USER_ID";
    fetch(`/api/user/${userId}`)
      .then((res) => res.json())
      .then((data) => setUser(data));
  }, []);

  if (!user) return <p className="text-white p-6">Loading profile...</p>;

  return (
    <div className="p-6 ml-64">
      <h1 className="text-2xl font-bold text-white">Profile</h1>
      <div className="mt-4 bg-[#1a1a2e]/80 p-6 rounded-lg border border-white/10">
        <p className="text-white/80">
          <strong>Username:</strong> {user.username}
        </p>
        <p className="text-white/80">
          <strong>ID:</strong> {user._id}
        </p>
      </div>
    </div>
  );
}
