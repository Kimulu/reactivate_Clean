// pages/Signup.tsx

import React, { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { apiClient } from "../utils/apiClient"; // Adjust path if needed
import toast from "react-hot-toast"; // Import toast

const Signup = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState(""); // 💡 NEW: Email state
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 💡 FIX: Call signupUser with username, email, and password
      const responseData = await apiClient.signupUser(
        username,
        email,
        password
      );

      // Backend now sends token and user object directly, not wrapped in 'response.ok'
      // Your apiClient.ts already handles !res.ok and throws an error, so we expect success here.
      console.log("User signed up. Token:", responseData.token);
      localStorage.setItem("token", responseData.token);
      // You might also dispatch setUser here if you want the user to be logged in immediately
      // and their Redux state populated. This would be similar to your login flow.
      // For now, let's just redirect and let AuthLoader handle re-hydration on next page load.

      toast.success("Signed up successfully! 🎉");

      // Redirect after a short delay to allow the toast to show
      setTimeout(() => {
        router.push("/Login");
      }, 1000);
    } catch (error: any) {
      // Catch the error thrown by apiClient if res.ok is false
      console.error("An error occurred during signup:", error);
      // Access error.message from the thrown Error object
      toast.error(
        error.message || "An error occurred. Please try again later."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#0f0f23] p-4">
      <div className="w-full max-w-md p-8 rounded-xl shadow-2xl bg-[#1a1a2e] border border-[#06ffa5]/20">
        <h1 className="text-4xl font-extrabold text-white mb-6 text-center">
          Sign Up
        </h1>
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label
              className="block text-sm font-medium text-white/70 mb-1"
              htmlFor="username"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-[#0f0f23] border border-white/10 text-white focus:ring-[#06ffa5] focus:border-[#06ffa5] outline-none transition duration-150"
              placeholder="Enter your username"
              required
            />
          </div>
          {/* 💡 NEW: Email Input Field */}
          <div>
            <label
              className="block text-sm font-medium text-white/70 mb-1"
              htmlFor="email"
            >
              Email
            </label>
            <input
              id="email"
              type="email" // Use type="email" for better browser validation
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-[#0f0f23] border border-white/10 text-white focus:ring-[#06ffa5] focus:border-[#06ffa5] outline-none transition duration-150"
              placeholder="Enter your email"
              required
            />
          </div>
          <div>
            <label
              className="block text-sm font-medium text-white/70 mb-1"
              htmlFor="password"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-[#0f0f23] border border-white/10 text-white focus:ring-[#06ffa5] focus:border-[#06ffa5] outline-none transition duration-150"
              placeholder="Create a password"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-[#06ffa5] to-[#04cc83] text-[#0f0f23] font-bold py-3 rounded-lg hover:from-[#04cc83] hover:to-[#06ffa5] transition-all duration-300 shadow-lg shadow-[#06ffa5]/30"
            disabled={isLoading}
          >
            {isLoading ? "Signing Up..." : "Sign Up"}
          </button>
        </form>
        <div className="mt-6 text-center">
          <Link
            href="/Login"
            className="text-sm text-[#06ffa5] hover:underline"
          >
            Already have an account? Log In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
