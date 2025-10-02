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
      const data = await apiClient.loginUser(username, password);

      // LOG 1: Successful Login Response Data: { token: '...', user: { id: '...', username: '...' } }
      console.log("LOG 1: Successful Login Response Data:", data);

      // 1. Save Token and User Data to Local Storage
      localStorage.setItem("token", data.token);
      // We save ONLY the user object to the 'user' key for persistence via AuthLoader.
      localStorage.setItem("user", JSON.stringify(data.user));

      // 2. Dispatch ONLY the user object to the Redux store
      // 💡 FIX: This ensures the reducer gets { id, username } and correctly updates state.
      dispatch(setUser(data.user));

      console.log("LOG 2: State Saved. Redux Dispatched, localStorage set.");
      console.log(
        "LOG 2.1: localStorage user (should be {id, username}):",
        localStorage.getItem("user")
      );
      console.log(
        "LOG 2.2: Redux Dispatch payload (should be {id, username}):",
        data.user
      );

      toast.success("Login successful!");
      router.push("/challenges");
    } catch (err: any) {
      console.error("Login Error:", err);
      toast.error(err.message || "Login failed");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#0f0f23]">
      <div className="w-full max-w-md p-8 rounded-xl shadow-2xl bg-[#1a1a2e] border border-[#06ffa5]/20">
        <h1 className="text-4xl font-extrabold text-white mb-6 text-center">
          Login
        </h1>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-white/70 mb-2"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg bg-[#0f0f23] border border-white/10 text-white focus:ring-[#06ffa5] focus:border-[#06ffa5] outline-none transition duration-150"
              placeholder="Enter your username"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-white/70 mb-2"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg bg-[#0f0f23] border border-white/10 text-white focus:ring-[#06ffa5] focus:border-[#06ffa5] outline-none transition duration-150"
              placeholder="Enter your password"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-[#06ffa5] to-[#04cc83] text-[#0f0f23] font-bold py-3 rounded-lg hover:from-[#04cc83] hover:to-[#06ffa5] transition-all duration-300 shadow-lg shadow-[#06ffa5]/30"
          >
            Log In
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-white/50">
          Don't have an account?
          <a href="/signup" className="text-[#06ffa5] hover:underline ml-1">
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
}
