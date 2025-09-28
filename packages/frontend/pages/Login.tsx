// pages/Login.tsx

import Link from "next/link";
import React, { useState, FormEvent } from "react";
import { useRouter } from "next/router";
import { apiClient } from "../utils/apiClient";
import toast from "react-hot-toast"; // Import toast

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Call the login API endpoint
      const response = await apiClient.loginUser(username, password);

      // Save the token and redirect on success
      localStorage.setItem("token", response.token);
      toast.success("Logged in successfully! 🎉"); // Display a success toast

      // Redirect to the challenges page after a short delay to show the toast
      setTimeout(() => {
        router.push("/challenges");
      }, 650);
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message); // Display an error toast
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Log In
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
            {isLoading ? "Logging In..." : "Log In"}
          </button>
        </form>
        <div className="mt-6 text-center">
          <Link href="/Signup">
            <button className="text-sm text-blue-600 hover:text-blue-800 focus:outline-none">
              Don't have an account? Sign Up
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
