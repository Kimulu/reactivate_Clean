// pages/Signup.tsx

import React, { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { apiClient } from "../utils/apiClient";
import toast from "react-hot-toast"; // Import toast

const Signup = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await apiClient.signupUser(username, password);

      if (response.ok) {
        const data = await response.json();
        console.log("User signed up. Token:", data.token);
        localStorage.setItem("token", data.token);

        // Add a success toast message
        toast.success("Signed up successfully! 🎉");

        // Redirect after a short delay to allow the toast to show
        setTimeout(() => {
          router.push("/challenges");
        }, 1000);
      } else {
        const errorData = await response.json();
        console.error("Signup failed:", errorData.error);
        toast.error(`Signup failed: ${errorData.error}`);
      }
    } catch (error) {
      console.error("An error occurred during signup:", error);
      toast.error("An error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Sign Up
        </h1>
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label
              className="block text-gray-700 font-semibold mb-1"
              htmlFor="username"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label
              className="block text-gray-700 font-semibold mb-1"
              htmlFor="password"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            disabled={isLoading}
          >
            {isLoading ? "Signing Up..." : "Sign Up"}
          </button>
        </form>
        <div className="mt-6 text-center">
          <Link href="/Login">
            <button className="text-sm text-blue-600 hover:text-blue-800 focus:outline-none">
              Already have an account? Log In
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
