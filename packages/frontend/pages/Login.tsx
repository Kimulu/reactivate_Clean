// pages/Login.tsx
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/router";
import { setUser } from "@/store/userSlice";
import { apiClient } from "@/utils/apiClient";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await apiClient.loginUser(username, password); // `data` is { token, user: UserInfo }

      console.log("LOG 1: Successful Login Response Data:", data);

      if (
        data.token &&
        data.user &&
        data.user.id &&
        data.user.username &&
        data.user.email &&
        typeof data.user.totalPoints === "number"
      ) {
        // 💡 CRITICAL FIX: Dispatch the full user payload including totalPoints
        // This payload now matches the NEW `setUser` action signature in `userSlice.ts`.
        dispatch(
          setUser({
            id: data.user.id,
            username: data.user.username,
            email: data.user.email,
            totalPoints: data.user.totalPoints,
            token: data.token,
          })
        );

        // ✅ Add this
        localStorage.setItem(
          "user",
          JSON.stringify({
            id: data.user.id,
            username: data.user.username,
            email: data.user.email,
            totalPoints: data.user.totalPoints,
            token: data.token,
          })
        );

        console.log(
          "LOG 2: State Saved. Redux Dispatched, localStorage set by reducer."
        );
        console.log(
          "LOG 2.1: localStorage token (should be JWT string):",
          localStorage.getItem("token")
        );
        console.log(
          "LOG 2.2: Redux Dispatch payload (should be {id, username, email, totalPoints, token}):",
          {
            id: data.user.id,
            username: data.user.username,
            email: data.user.email,
            totalPoints: data.user.totalPoints,
            token: data.token,
          }
        );

        toast.success("Login successful!");
        router.push("/challenges");
      } else {
        console.error(
          "Login failed: Backend response missing token, user object, or user's id/username/email/totalPoints.",
          data
        );
        toast.error("Login failed: Invalid server response data.");
      }
    } catch (err: any) {
      console.error("Login Error:", err);
      toast.error(err.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#0f0f23]">
      <div className="bg-[#1a1a2e]/80 p-10 rounded-xl shadow-2xl border border-white/10 w-96">
        <h1 className="text-3xl font-bold text-white mb-6 text-center font-mono gradient-text">
          Login
        </h1>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label
              htmlFor="username"
              className="block text-white/70 text-sm font-semibold mb-2"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              className="w-full px-4 py-2 bg-[#0f0f23]/60 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-[#06ffa5] focus:border-transparent transition duration-200"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-white/70 text-sm font-semibold mb-2"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              className="w-full px-4 py-2 bg-[#0f0f23]/60 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-[#06ffa5] focus:border-transparent transition duration-200"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-[#06ffa5] to-[#25a96d] text-[#0f0f23] font-bold py-3 rounded-lg hover:from-[#25a96d] hover:to-[#06ffa5] transition-all duration-300 shadow-lg"
          >
            Login
          </button>
        </form>
        <p className="mt-6 text-center text-white/50 text-sm">
          Don't have an account?{" "}
          <a
            onClick={() => router.push("/Signup")}
            className="text-[#06ffa5] hover:underline cursor-pointer"
          >
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
}
